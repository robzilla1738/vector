// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/aux/ui_storage_migration_worker.h"

#include <cmath>
#include <map>
#include <memory>
#include <optional>
#include <string>
#include <string_view>
#include <utility>
#include <vector>
#include "base/functional/bind.h"
#include "base/json/json_reader.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/scoped_refptr.h"
#include "base/memory/weak_ptr.h"
#include "base/scoped_observation.h"
#include "base/supports_user_data.h"
#include "base/uuid.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_observer.h"
#include "content/public/browser/browser_thread.h"
#include "content/public/browser/render_process_host.h"
#include "content/public/browser/render_process_host_observer.h"
#include "content/public/browser/service_worker_context.h"
#include "content/public/browser/service_worker_context_observer.h"
#include "content/public/browser/service_worker_external_request_result.h"
#include "content/public/browser/service_worker_external_request_timeout_type.h"
#include "content/public/browser/service_worker_running_info.h"
#include "content/public/browser/storage_partition.h"
#include "extensions/browser/event_router.h"
#include "extensions/browser/extension_function.h"
#include "extensions/browser/extension_registry.h"
#include "extensions/browser/extension_registry_observer.h"
#include "extensions/browser/extension_util.h"
#include "extensions/browser/process_manager.h"
#include "extensions/browser/process_manager_observer.h"
#include "extensions/browser/service_worker/worker_id.h"
#include "extensions/common/extension.h"
#include "extensions/common/manifest_handlers/background_info.h"
#include "extensions/common/mojom/context_type.mojom.h"
#include "third_party/blink/public/common/storage_key/storage_key.h"

namespace aux {
namespace {
constexpr char kOwner[] = "aux.ui-storage-migration-worker.v1";
constexpr char kEvent[] = "auxBrowserPreferences.onUiMigrationWorkerControl";
constexpr char kFormat[] = "aux.ui-background-writer-lease.v1";
constexpr size_t kReportLimit = 65536;
constexpr size_t kPendingLimit = 8;
using Reply = base::OnceCallback<void(base::DictValue)>;
using ExternalResult = content::ServiceWorkerExternalRequestResult;

enum class Operation { kPrepare, kRead, kValidate, kRelease };
const char* Name(Operation operation) {
  switch (operation) {
    case Operation::kPrepare: return "prepare";
    case Operation::kRead: return "read";
    case Operation::kValidate: return "validate";
    case Operation::kRelease: return "release";
  }
}
bool CanonicalUuid(const std::string& value) {
  const auto parsed = base::Uuid::ParseLowercase(value);
  return parsed.is_valid() && parsed.AsLowercaseString() == value;
}
bool Text(const base::DictValue& value, std::string_view key,
          std::string_view expected) {
  const auto* actual = value.FindString(key);
  return actual && *actual == expected;
}
std::optional<double> Revision(const base::DictValue& value) {
  auto number = value.FindDouble("revision");
  if (!number || !std::isfinite(*number) || *number < 0 ||
      *number > 9007199254740991.0 || std::floor(*number) != *number)
    return std::nullopt;
  return number;
}
// WorkerId equality intentionally omits start_token. Never use it as the full
// running-instance identity; this helper also requires the actual token.
bool SameInstance(const extensions::WorkerId& left,
                  const extensions::WorkerId& right) {
  return left == right && left.start_token && right.start_token &&
         left.start_token == right.start_token;
}
bool RunningMatches(content::ServiceWorkerContext& context,
                    const extensions::WorkerId& worker,
                    const extensions::Extension& extension) {
  const auto& infos = context.GetRunningServiceWorkerInfos();
  size_t matching_origin = 0;
  for (const auto& [version, info] : infos)
    if (info.key.origin() == extension.origin() || info.scope == extension.url())
      ++matching_origin;
  const auto found = infos.find(worker.version_id);
  return matching_origin == 1 && worker.start_token && found != infos.end() &&
      found->second.render_process_id == worker.render_process_id &&
      found->second.token == *worker.start_token &&
      found->second.script_url == extension.GetResourceURL("background.js") &&
      found->second.scope == extension.url() &&
      found->second.key == blink::StorageKey::CreateFirstParty(extension.origin()) &&
      found->second.version_status == content::ServiceWorkerRunningInfo::ServiceWorkerVersionStatus::kActivated;
}
base::DictValue Refused(std::string error, bool retained = false) {
  base::DictValue result;
  result.Set("success", false);
  result.Set("qualified", false);
  result.Set("activationAuthorized", false);
  result.Set("retained", retained);
  result.Set("error", std::move(error));
  return result;
}

class WorkerOwner final : public base::SupportsUserData::Data,
                          public ProfileObserver,
                          public extensions::ProcessManagerObserver,
                          public extensions::ExtensionRegistryObserver,
                          public content::ServiceWorkerContextObserver,
                          public content::RenderProcessHostObserver {
 public:
  explicit WorkerOwner(Profile* profile) : profile_(profile) {
    profile_observation_.Observe(profile);
  }
  ~WorkerOwner() override {
    weak_factory_.InvalidateWeakPtrs();
    manager_observation_.Reset(); registry_observation_.Reset();
    process_observation_.Reset(); profile_observation_.Reset();
    context_observation_.Reset();
    // Destruction never synthesizes successful completion of pending control.
    // Balance only this native request while its actual context still exists.
    if (external_held_ && context_) {
      context_->FinishedExternalRequest(worker_.version_id, keepalive_id_);
    }
  }
  static WorkerOwner* Get(Profile* profile, bool create) {
    if (!profile) return nullptr;
    auto* owner = static_cast<WorkerOwner*>(profile->GetUserData(kOwner));
    if (!owner && create) {
      auto created = std::make_unique<WorkerOwner>(profile);
      owner = created.get();
      profile->SetUserData(kOwner, std::move(created));
    }
    return owner;
  }
  void Begin(Reply reply);
  void Invoke(Operation operation, Reply reply);
  bool Accept(ExtensionFunction& sender, const std::string& request,
              const std::string& operation, const std::string& json);
  bool Pending() const {
    return attempted_ || external_held_ || !requests_.empty();
  }
  bool Valid() const {
    return source_held_ && !releasing_ && requests_.empty() && Current();
  }

 private:
  struct Request {
    Operation operation;
    Reply reply;
    bool dispatched = false;
  };
  bool CaptureOwner();
  bool Current() const;
  bool SenderCurrent(ExtensionFunction& sender) const;
  bool Adopt(const base::DictValue& report);
  bool SourceHeld(const base::DictValue& report) const;
  bool Released(const base::DictValue& report) const;
  bool RefusedBeforeLease(const base::DictValue& report) const;
  void Settle(bool released, const std::string& json, Reply reply);
  void Dispatch(Operation operation, std::string request, Reply reply);
  void DidDispatch(std::string request, const extensions::EventTarget& target);
  void CannotDispatch(std::string request);
  void Fault(std::string error, Reply reply = Reply(), const std::string& json = {});
  bool FinishExternal();
  base::DictValue Result(bool success, const std::string& json = {}) const;
  void OnProfileWillBeDestroyed(Profile* profile) override;
  void OnStartedTrackingServiceWorkerInstance(
      const extensions::WorkerId& worker) override;
  void OnStoppedTrackingServiceWorkerInstance(
      content::BrowserContext& context,
      const extensions::WorkerId& worker) override;
  void OnProcessManagerShutdown(extensions::ProcessManager* manager) override;
  void OnExtensionLoaded(content::BrowserContext* context,
                         const extensions::Extension* extension) override;
  void OnExtensionUnloaded(content::BrowserContext* context,
                           const extensions::Extension* extension,
                           extensions::UnloadedExtensionReason reason) override;
  void OnShutdown(extensions::ExtensionRegistry* registry) override;
  void OnVersionStartingRunning(int64_t version) override;
  void OnVersionStartedRunning(int64_t version,
      const content::ServiceWorkerRunningInfo& info) override;
  void OnVersionStoppingRunning(int64_t version) override;
  void OnVersionStoppedRunning(int64_t version) override;
  void OnVersionRedundant(int64_t version, const GURL& scope) override;
  void OnDestruct(content::ServiceWorkerContext* context) override;
  void RenderProcessExited(content::RenderProcessHost* host,
                           const content::ChildProcessTerminationInfo& info) override;
  void RenderProcessHostDestroyed(content::RenderProcessHost* host) override;

  raw_ptr<Profile> profile_ = nullptr;
  scoped_refptr<const extensions::Extension> extension_;
  raw_ptr<content::StoragePartition> partition_ = nullptr;
  raw_ptr<content::ServiceWorkerContext> context_ = nullptr;
  extensions::WorkerId worker_;
  base::Uuid context_id_;
  base::Uuid keepalive_id_;
  std::string prepare_request_;
  std::string source_lease_;
  std::optional<double> source_revision_;
  bool external_held_ = false;
  bool attempted_ = false;
  bool source_held_ = false;
  bool releasing_ = false;
  bool identity_lost_ = false;
  std::string failure_;
  std::map<std::string, Request> requests_;
  std::optional<base::DictValue> settled_result_;
  base::ScopedObservation<Profile, ProfileObserver> profile_observation_{this};
  base::ScopedObservation<extensions::ProcessManager,
                          extensions::ProcessManagerObserver> manager_observation_{this};
  base::ScopedObservation<extensions::ExtensionRegistry,
                          extensions::ExtensionRegistryObserver> registry_observation_{this};
  base::ScopedObservation<content::ServiceWorkerContext,
                          content::ServiceWorkerContextObserver> context_observation_{this};
  base::ScopedObservation<content::RenderProcessHost,
                          content::RenderProcessHostObserver> process_observation_{this};
  base::WeakPtrFactory<WorkerOwner> weak_factory_{this};
};

bool WorkerOwner::CaptureOwner() {
  if (!profile_ || !profile_->IsRegularProfile() || profile_->IsOffTheRecord())
    return false;
  auto* registry = extensions::ExtensionRegistry::Get(profile_);
  auto* manager = extensions::ProcessManager::Get(profile_);
  auto* router = extensions::EventRouter::Get(profile_);
  auto* extension = registry ? registry->enabled_extensions().GetByID(kAgentExtensionId) : nullptr;
  if (!manager || !router || !extension || extension->manifest_version() != 3 ||
      !extensions::BackgroundInfo::IsServiceWorkerBased(extension) ||
      extensions::BackgroundInfo::GetBackgroundServiceWorkerScriptURL(extension) !=
          extension->GetResourceURL("background.js"))
    return false;
  const auto workers = manager->GetServiceWorkersForExtension(kAgentExtensionId);
  if (workers.size() != 1 || !workers.front().start_token ||
      workers.front().version_id < 0 || workers.front().thread_id == extensions::kMainThreadId) return false;
  auto* partition = extensions::util::GetStoragePartitionForExtensionId(
      kAgentExtensionId, profile_, /*can_create=*/false);
  auto* process = content::RenderProcessHost::FromID(workers.front().render_process_id);
  if (!partition || !process || process->GetBrowserContext() != profile_ ||
      process->GetStoragePartition() != partition || !process->IsInitializedAndNotDead() || process->ShutdownRequested() || process->FastShutdownStarted())
    return false;
  auto* context = partition->GetServiceWorkerContext();
  if (!context) return false;
  if (!RunningMatches(*context, workers.front(), *extension)) return false;
  context_id_ = manager->GetContextIdForWorker(workers.front());
  if (!context_id_.is_valid()) return false;
  worker_ = workers.front(); extension_ = extension; partition_ = partition; context_ = context;
  manager_observation_.Observe(manager); registry_observation_.Observe(registry);
  context_observation_.Observe(context); process_observation_.Observe(process);
  // The standard extensions keepalive wrapper discards this result. Own and
  // check the real content request instead of inferring hold from bookkeeping.
  keepalive_id_ = base::Uuid::GenerateRandomV4();
  external_held_ = context_->StartingExternalRequest(
      worker_.version_id, content::ServiceWorkerExternalRequestTimeoutType::kDoesNotTimeout,
      keepalive_id_) == ExternalResult::kOk;
  return external_held_ && Current();
}
bool WorkerOwner::Current() const {
  if (identity_lost_ || !external_held_ || !profile_ || !extension_ || !context_ ||
      !partition_ || !manager_observation_.IsObserving() ||
      !registry_observation_.IsObserving() || !process_observation_.IsObserving())
    return false;
  auto* registry = registry_observation_.GetSource();
  auto* manager = manager_observation_.GetSource();
  auto* process = content::RenderProcessHost::FromID(worker_.render_process_id);
  if (!process || process != process_observation_.GetSource() || !profile_->IsRegularProfile() || profile_->IsOffTheRecord() ||
      registry->enabled_extensions().GetByID(kAgentExtensionId) != extension_.get() ||
      extensions::util::GetStoragePartitionForExtensionId(kAgentExtensionId, profile_, false) != partition_ ||
      partition_->GetServiceWorkerContext() != context_ ||
      process->GetBrowserContext() != profile_ || process->GetStoragePartition() != partition_ ||
      process->GetID() != worker_.render_process_id || !process->IsInitializedAndNotDead() || process->ShutdownRequested() || process->FastShutdownStarted())
    return false;
  const auto workers = manager->GetServiceWorkersForExtension(kAgentExtensionId);
  if (workers.size() != 1 || !SameInstance(workers.front(), worker_) ||
      manager->GetContextIdForWorker(workers.front()) != context_id_)
    return false;
  return RunningMatches(*context_, worker_, *extension_);
}
void WorkerOwner::Begin(Reply reply) {
  if (Pending() || identity_lost_) {
    std::move(reply).Run(Refused("An existing worker operation remains retained", Pending()));
    return;
  }
  settled_result_.reset();
  if (!CaptureOwner()) {
    // No event was issued. A failed physical hold is never source readiness.
    if (!FinishExternal()) {
      Fault("The failed physical hold remains unresolved", std::move(reply));
      return;
    }
    manager_observation_.Reset(); registry_observation_.Reset();
    context_observation_.Reset(); process_observation_.Reset();
    context_ = nullptr; partition_ = nullptr; extension_.reset();
    std::move(reply).Run(Refused("The actual canonical worker could not be retained"));
    return;
  }
  prepare_request_ = base::Uuid::GenerateRandomV4().AsLowercaseString();
  attempted_ = true; source_held_ = false; releasing_ = false; failure_.clear();
  Dispatch(Operation::kPrepare, prepare_request_, std::move(reply));
}
void WorkerOwner::Invoke(Operation operation, Reply reply) {
  if (operation == Operation::kRead && !attempted_ && settled_result_) {
    // A consumer may lose its callback AFTER an exact release or reviewed
    // pre-lease refusal and successful balancing of our physical request.
    // Retain that finite result; never infer it from absence or a successor.
    auto observed = settled_result_->Clone();
    observed.Set("nativeRetainedControlObservation", true);
    std::move(reply).Run(std::move(observed)); return;
  }
  if (!attempted_ || !Current()) {
    std::move(reply).Run(Refused("No current retained canonical worker", Pending())); return;
  }
  if (requests_.size() >= kPendingLimit) {
    std::move(reply).Run(Refused("Unresolved worker control requests remain", true)); return;
  }
  for (const auto& [id, request] : requests_) {
    if (request.operation == operation) {
      std::move(reply).Run(Refused("This exact worker operation is already unresolved", true)); return;
    }
  }
  if ((operation == Operation::kValidate || operation == Operation::kRelease) &&
      source_lease_.empty()) {
    std::move(reply).Run(Refused("Read the retained source lease before this operation", true)); return;
  }
  if (operation == Operation::kValidate && (!source_revision_ || releasing_)) {
    std::move(reply).Run(Refused("The source revision is unavailable or releasing", true)); return;
  }
  if (operation == Operation::kRelease) { releasing_ = true; source_held_ = false; }
  Dispatch(operation, base::Uuid::GenerateRandomV4().AsLowercaseString(), std::move(reply));
}
void WorkerOwner::Dispatch(Operation operation, std::string request, Reply reply) {
  source_held_ = false;
  base::DictValue control;
  control.Set("requestId", request);
  control.Set("operation", Name(operation));
  if (operation == Operation::kValidate || operation == Operation::kRelease)
    control.Set("leaseId", source_lease_);
  if (operation == Operation::kValidate) control.Set("revision", *source_revision_);
  requests_.emplace(request, Request{operation, std::move(reply)});
  auto event = std::make_unique<extensions::Event>(
      extensions::events::AUXBROWSERPREFERENCES_ONUIMIGRATIONWORKERCONTROL,
      kEvent, base::ListValue().Append(std::move(control)), profile_,
      extensions::mojom::ContextType::kPrivilegedExtension);
  event->restrict_to_dispatch_target = extensions::Event::DispatchTarget{
      worker_.render_process_id, worker_.thread_id, worker_.version_id};
  event->did_dispatch_callback = base::BindRepeating(
      &WorkerOwner::DidDispatch, weak_factory_.GetWeakPtr(), request);
  event->cannot_dispatch_callback = base::BindRepeating(
      &WorkerOwner::CannotDispatch, weak_factory_.GetWeakPtr(), request);
  extensions::EventRouter::Get(profile_)->DispatchEventToExtension(kAgentExtensionId, std::move(event));
}
void WorkerOwner::DidDispatch(std::string request,
                              const extensions::EventTarget& target) {
  const auto found = requests_.find(request);
  if (found == requests_.end()) return;
  if (!Current() || target.extension_id != kAgentExtensionId ||
      target.render_process_id != worker_.render_process_id.GetUnsafeValue() ||
      target.worker_thread_id != worker_.thread_id ||
      target.service_worker_version_id != worker_.version_id) {
    Fault("The event target no longer matches the retained actual worker"); return;
  }
  found->second.dispatched = true;
}
void WorkerOwner::CannotDispatch(std::string request) {
  const auto found = requests_.find(request);
  if (found == requests_.end()) return;
  auto reply = std::move(found->second.reply); requests_.erase(found);
  source_held_ = false;
  // Do not translate missing delivery or an abandoned callback to 'not started'.
  // Keep the same actual worker/lifetime and original request for read recovery.
  auto result = Refused("Worker event delivery is unconfirmed", true);
  result.Set("requestId", request);
  result.Set("deliveryUnconfirmed", true);
  std::move(reply).Run(std::move(result));
}
bool WorkerOwner::SenderCurrent(ExtensionFunction& sender) const {
  if (!Current() || !sender.is_from_service_worker() || sender.render_frame_host() ||
      sender.browser_context() != profile_ || sender.extension() != extension_.get() ||
      sender.source_context_type() != extensions::mojom::ContextType::kPrivilegedExtension ||
      sender.source_process_id() != worker_.render_process_id.GetUnsafeValue() ||
      !sender.worker_id()) return false;
  // ExtensionFunction's genuine dispatcher metadata omits start_token; Current
  // separately rejoins the captured token and ProcessManager context UUID.
  return *sender.worker_id() == worker_;
}
bool WorkerOwner::Adopt(const base::DictValue& report) {
  if (!Text(report, "format", kFormat) || !Text(report, "requestId", prepare_request_) ||
      report.FindBool("retained") != true) return false;
  const auto* lease = report.FindString("leaseId");
  if (!lease || !CanonicalUuid(*lease) || (!source_lease_.empty() && source_lease_ != *lease)) return false;
  const auto revision = Revision(report);
  if (!Text(report, "phase", "preparing") && !Text(report, "phase", "held")) return false;
  if (source_revision_ && (!revision || *source_revision_ != *revision)) return false;
  source_lease_ = *lease;
  if (revision) source_revision_ = revision;
  return true;
}
bool WorkerOwner::SourceHeld(const base::DictValue& report) const {
  const auto* pending = report.FindDict("pendingKinds");
  const auto* unknown = report.FindList("unknownKinds");
  const auto deferred = report.FindInt("deferredCount");
  return Current() && !releasing_ && source_revision_ &&
      Text(report, "format", kFormat) && Text(report, "requestId", prepare_request_) &&
      Text(report, "leaseId", source_lease_) && Text(report, "phase", "held") &&
      Revision(report) == source_revision_ && report.FindBool("retained") == true &&
      report.FindBool("ok") == true && report.FindBool("closed") == true &&
      report.FindBool("released") == false && report.FindInt("pendingCount") == 0 &&
      deferred && *deferred >= 0 && *deferred <= 4096 && pending && pending->empty() &&
      unknown && unknown->empty();
}
bool WorkerOwner::Released(const base::DictValue& report) const {
  return Text(report, "format", kFormat) && Text(report, "requestId", prepare_request_) &&
      Text(report, "leaseId", source_lease_) && report.FindBool("released") == true &&
      report.FindBool("closed") == false && Revision(report) == source_revision_ &&
      // Exact release response or read-only observation of its lost response.
      (report.FindBool("ok") == true ||
       (Text(report, "phase", "open") && report.FindBool("retained") == false));
}
bool WorkerOwner::RefusedBeforeLease(const base::DictValue& report) const {
  // Only the exact canonical producer's finite BEFORE-lease branches record
  // this correlated state. It permits retiring OUR lifetime ref, never writer
  // closure, native backend drain or target admission. Counts may be active.
  return source_lease_.empty() && !releasing_ &&
      Text(report, "format", kFormat) && Text(report, "requestId", prepare_request_) &&
      Text(report, "attemptState", "not-started") && Text(report, "phase", "open") &&
      report.FindBool("ok") == false && report.FindBool("retained") == false &&
      report.FindBool("closed") == false && report.FindBool("released") == false &&
      report.FindBool("noLeaseCreated") == true && report.FindInt("deferredCount") == 0 &&
      !report.Find("leaseId") && !report.Find("revision");
}
bool WorkerOwner::FinishExternal() {
  if (!external_held_) return true;
  if (!context_ || context_->FinishedExternalRequest(worker_.version_id, keepalive_id_) != ExternalResult::kOk)
    return false;
  external_held_ = false; return true;
}
base::DictValue WorkerOwner::Result(bool success, const std::string& json) const {
  base::DictValue result;
  result.Set("success", success);
  result.Set("qualified", false);
  result.Set("activationAuthorized", false);
  result.Set("retained", Pending());
  result.Set("nativeOwnerCurrent", Current());
  result.Set("sourceHeld", source_held_);
  result.Set("prepareRequestId", prepare_request_);
  if (!json.empty()) result.Set("reportJson", json);
  if (!failure_.empty()) result.Set("error", failure_);
  return result;
}
void WorkerOwner::Settle(bool released, const std::string& json, Reply reply) {
  if (!FinishExternal()) {
    Fault("The actual external worker request could not be balanced", std::move(reply), json);
    return;
  }
  attempted_ = false; releasing_ = false; source_held_ = false;
  failure_ = released ? "" : "The authenticated source refused before creating a producer lease";
  auto remaining = std::move(requests_); requests_.clear();
  auto result = Result(released, json);
  result.Set("released", released);
  result.Set("ownExternalRequestRetired", true);
  if (!released) result.Set("noProducerLeaseCreated", true);
  settled_result_ = result.Clone();
  manager_observation_.Reset(); registry_observation_.Reset();
  context_observation_.Reset(); process_observation_.Reset();
  context_ = nullptr; partition_ = nullptr; extension_.reset();
  source_lease_.clear(); source_revision_.reset(); prepare_request_.clear();
  std::vector<std::pair<Reply, base::DictValue>> callbacks;
  for (auto& [id, pending] : remaining) {
    auto unresolved = Refused("Original control reply unresolved when the exact attempt was settled");
    unresolved.Set("requestId", id);
    unresolved.Set("transportSuperseded", true);
    callbacks.emplace_back(std::move(pending.reply), std::move(unresolved));
  }
  callbacks.emplace_back(std::move(reply), std::move(result));
  // No owner access after a callback can destroy its Profile or start a lease.
  for (auto& [callback, value] : callbacks) std::move(callback).Run(std::move(value));
}
bool WorkerOwner::Accept(ExtensionFunction& sender,
                         const std::string& request, const std::string& operation,
                         const std::string& json) {
  const auto found = requests_.find(request);
  if (found == requests_.end() || operation != Name(found->second.operation) ||
      !CanonicalUuid(request) || !SenderCurrent(sender)) return false;
  auto reply = std::move(found->second.reply); const auto kind = found->second.operation;
  const bool dispatched = found->second.dispatched; requests_.erase(found);
  auto report = json.size() <= kReportLimit ? base::JSONReader::ReadDict(json, base::JSON_PARSE_RFC, 16) : std::nullopt;
  source_held_ = false;
  if (!dispatched || !report || !Text(*report, "format", kFormat) ||
      !Text(*report, "requestId", prepare_request_) || !Current()) {
    failure_ = "The exact worker reply is unconfirmed or malformed";
    std::move(reply).Run(Result(false)); return true;
  }
  if ((kind == Operation::kPrepare || kind == Operation::kRead) && RefusedBeforeLease(*report)) {
    Settle(/*released=*/false, json, std::move(reply)); return true;
  }
  // Only this already-held worker can resolve an uncertain release by Read.
  if (releasing_ && (kind == Operation::kRelease || kind == Operation::kRead) && Released(*report)) {
    Settle(/*released=*/true, json, std::move(reply)); return true;
  }
  const bool adopted = Adopt(*report);
  source_held_ = adopted && SourceHeld(*report);
  failure_ = source_held_ ? "" : "The source worker remains pending, unknown or releasing";
  std::vector<std::pair<Reply, base::DictValue>> recovered;
  if (kind == Operation::kRead && source_held_) {
    // Actual exact-owner held observation resolves uncertainty about the
    // source state, not the outcome of the original transport callback.
    // Retire only side-effect-free controls/that original prepare as unknown.
    for (auto iterator = requests_.begin(); iterator != requests_.end();) {
      if (iterator->second.operation == Operation::kRelease) { ++iterator; continue; }
      auto superseded = Refused("Original control reply unresolved; exact-owner read observed the source lease", true);
      superseded.Set("requestId", iterator->first);
      superseded.Set("transportSuperseded", true);
      recovered.emplace_back(std::move(iterator->second.reply), std::move(superseded));
      iterator = requests_.erase(iterator);
    }
  }
  recovered.emplace_back(std::move(reply), Result(source_held_, json));
  // No access to this owner once a callback can reenter or destroy its Profile.
  for (auto& [callback, value] : recovered) std::move(callback).Run(std::move(value));
  return true;
}
void WorkerOwner::Fault(std::string error, Reply current, const std::string& json) {
  if (!identity_lost_ || failure_.empty()) failure_ = std::move(error);
  identity_lost_ = true; source_held_ = false;
  auto pending = std::move(requests_); requests_.clear();
  std::vector<std::pair<Reply, base::DictValue>> callbacks;
  for (auto& [id, request] : pending)
    callbacks.emplace_back(std::move(request.reply), Result(false));
  if (current) callbacks.emplace_back(std::move(current), Result(false, json));
  // Preserve unresolved attempt/lifetime until actual owner destruction; never
  // redirect source cleanup to a new worker, nor activate a target on failure.
  // Repeated faults still drain any pending controls, never silently destroy
  // callbacks because an earlier physical failure already marked identity lost.
  for (auto& [reply, value] : callbacks) std::move(reply).Run(std::move(value));
}
void WorkerOwner::OnProfileWillBeDestroyed(Profile* profile) {
  if (profile != profile_) return;
  FinishExternal();
  manager_observation_.Reset(); registry_observation_.Reset();
  context_observation_.Reset(); process_observation_.Reset();
  profile_observation_.Reset(); profile_ = nullptr; context_ = nullptr; partition_ = nullptr;
  Fault("The actual Profile is being destroyed");
}
void WorkerOwner::OnStartedTrackingServiceWorkerInstance(const extensions::WorkerId& worker) {
  if (attempted_ && worker.extension_id == kAgentExtensionId && !SameInstance(worker, worker_))
    Fault("Another canonical worker started during the retained operation");
}
void WorkerOwner::OnStoppedTrackingServiceWorkerInstance(content::BrowserContext& context,
                                                         const extensions::WorkerId& worker) {
  if (attempted_ && &context == profile_ && worker == worker_)
    Fault("The retained actual worker stopped");
}
void WorkerOwner::OnProcessManagerShutdown(extensions::ProcessManager* manager) {
  manager_observation_.Reset(); Fault("The actual worker ProcessManager is shutting down");
}
void WorkerOwner::OnExtensionLoaded(content::BrowserContext* context,
                                    const extensions::Extension* extension) {
  if (attempted_ && context == profile_ && extension->id() == kAgentExtensionId && extension != extension_.get())
    Fault("The canonical enabled Extension object was replaced");
}
void WorkerOwner::OnExtensionUnloaded(content::BrowserContext* context,
                                      const extensions::Extension* extension,
                                      extensions::UnloadedExtensionReason reason) {
  if (attempted_ && context == profile_ && extension == extension_.get())
    Fault("The retained canonical Extension was unloaded");
}
void WorkerOwner::OnShutdown(extensions::ExtensionRegistry* registry) {
  registry_observation_.Reset(); Fault("The actual ExtensionRegistry is shutting down");
}
void WorkerOwner::OnVersionStartingRunning(int64_t version) {
  if (attempted_ && version == worker_.version_id)
    Fault("The retained worker version started another running transition");
}
void WorkerOwner::OnVersionStartedRunning(int64_t version,
                                         const content::ServiceWorkerRunningInfo& info) {
  if (attempted_ && extension_ &&
      (info.key.origin() == extension_->origin() || info.scope == extension_->url()) &&
      (version != worker_.version_id || !worker_.start_token || info.token != *worker_.start_token))
    Fault("Another actual canonical-origin worker started running");
}
void WorkerOwner::OnVersionStoppingRunning(int64_t version) {
  if (attempted_ && version == worker_.version_id) Fault("The retained worker is stopping");
}
void WorkerOwner::OnVersionStoppedRunning(int64_t version) {
  if (attempted_ && version == worker_.version_id) Fault("The retained worker stopped running");
}
void WorkerOwner::OnVersionRedundant(int64_t version, const GURL& scope) {
  if (attempted_ && version == worker_.version_id) Fault("The retained worker became redundant");
}
void WorkerOwner::OnDestruct(content::ServiceWorkerContext* context) {
  if (context != context_) return;
  context_observation_.Reset(); context_ = nullptr;
  Fault("The actual ServiceWorkerContext was destroyed");
}
void WorkerOwner::RenderProcessExited(content::RenderProcessHost* host,
                                      const content::ChildProcessTerminationInfo& info) {
  Fault("The retained worker render process exited");
}
void WorkerOwner::RenderProcessHostDestroyed(content::RenderProcessHost* host) {
  process_observation_.Reset(); Fault("The retained worker render process host was destroyed");
}
}  // namespace

void BeginUiStorageMigrationWorker(Profile* profile, Reply reply) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!profile || !profile->IsRegularProfile() || profile->IsOffTheRecord()) {
    std::move(reply).Run(Refused("A regular actual Profile is required")); return;
  }
  WorkerOwner::Get(profile, true)->Begin(std::move(reply));
}
void ReadUiStorageMigrationWorker(Profile* profile, Reply reply) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto* owner = WorkerOwner::Get(profile, false);
  if (!owner) { std::move(reply).Run(Refused("No retained worker owner")); return; }
  owner->Invoke(Operation::kRead, std::move(reply));
}
void ValidateUiStorageMigrationWorker(Profile* profile, Reply reply) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto* owner = WorkerOwner::Get(profile, false);
  if (!owner) { std::move(reply).Run(Refused("No retained worker owner")); return; }
  owner->Invoke(Operation::kValidate, std::move(reply));
}
void ReleaseUiStorageMigrationWorker(Profile* profile, Reply reply) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto* owner = WorkerOwner::Get(profile, false);
  if (!owner) { std::move(reply).Run(Refused("No retained worker owner")); return; }
  owner->Invoke(Operation::kRelease, std::move(reply));
}
bool IsUiStorageMigrationWorkerPending(Profile* profile) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto* owner = WorkerOwner::Get(profile, false); return owner && owner->Pending();
}
bool HasValidUiStorageMigrationWorkerLease(Profile* profile) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto* owner = WorkerOwner::Get(profile, false); return owner && owner->Valid();
}
bool AcceptUiStorageMigrationWorkerReply(ExtensionFunction& sender,
                                         const std::string& request,
                                         const std::string& operation,
                                         const std::string& json) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  // Never create an owner in response to an unsolicited renderer API call.
  if (!sender.is_from_service_worker() || sender.render_frame_host() ||
      !sender.browser_context()) return false;
  auto* profile = Profile::FromBrowserContext(sender.browser_context());
  auto* owner = WorkerOwner::Get(profile, false);
  return owner && owner->Accept(sender, request, operation, json);
}
}  // namespace aux
