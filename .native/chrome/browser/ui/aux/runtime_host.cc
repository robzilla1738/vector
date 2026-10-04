// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/aux/runtime_host.h"
#include "chrome/browser/ui/aux/native_startup_admission_waiter.h"
#include "chrome/browser/ui/aux/native_recorder_controller.h"
#include "chrome/browser/ui/aux/native_person_observer_controller.h"
#include "chrome/browser/ui/aux/power_activity_mac.h"

#include "base/task/thread_pool.h"

#include <fcntl.h>
#include <poll.h>
#include <sys/socket.h>
#include <libproc.h>
#include <sys/stat.h>
#include <sys/un.h>
#include <unistd.h>

#include <algorithm>
#include <array>
#include <cerrno>
#include <cctype>
#include <cmath>
#include <cstdlib>
#include <memory>
#include <limits>
#include <optional>
#include <utility>
#include <vector>

#include "base/base_paths.h"
#include "base/command_line.h"
#include "base/containers/span.h"
#include "base/files/file_util.h"
#include "base/functional/bind.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/path_service.h"
#include "base/process/launch.h"
#include "base/rand_util.h"
#include "base/strings/utf_string_conversions.h"
#include "base/strings/string_number_conversions.h"
#include "base/synchronization/waitable_event.h"
#include "base/time/time.h"
#include "base/uuid.h"
#include "base/task/bind_post_task.h"
#include "base/timer/timer.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/device_reauth/chrome_device_authenticator_factory.h"
#include "chrome/browser/ui/aux/cdp_broker.h"
#include "chrome/browser/ui/aux/content_blocking_controller.h"
#include "chrome/browser/ui/aux/egress_controller.h"
#include "chrome/browser/ui/aux/native_cdp_measurement_producer.h"
#include "chrome/browser/ui/aux/cosmetic_controller.h"
#include "chrome/browser/ui/aux/credential_fill.h"
#include "chrome/browser/ui/aux/method_registry.h"
#include "chrome/browser/ui/aux/cookie_import.h"
#include "chrome/browser/ui/aux/organization_store.h"
#include "chrome/browser/ui/aux/page_identity.h"
#include "chrome/browser/ui/aux/profile_library.h"
#include "chrome/browser/ui/aux/profile_search_engine.h"
#include "chrome/browser/ui/aux/readable_capture.h"
#include "chrome/browser/ui/aux/secret_store_mac.h"
#include "chrome/browser/ui/aux/tab_catalog.h"
#include "chrome/browser/ui/aux/permission_broker.h"
#include "chrome/browser/ui/aux/webmcp.h"
#include "chrome/browser/ui/aux/native_find.h"
#include "chrome/browser/ui/aux/zap_controller.h"
#include "chrome/browser/ui/browser_commands.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/profile_browser_collection.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "components/sessions/core/session_id.h"
#include "components/find_in_page/find_result_observer.h"
#include "components/device_reauth/device_authenticator.h"
#include "components/find_in_page/find_tab_helper.h"
#include "components/version_info/version_info.h"
#include "components/zoom/zoom_controller.h"
#include "content/public/browser/devtools_agent_host.h"
#include "content/public/browser/navigation_controller.h"
#include "content/public/browser/web_contents.h"
#include "content/public/common/stop_find_action.h"
#include "ui/base/base_window.h"
#include "url/gurl.h"

namespace {

constexpr size_t kMaxFrameBytes = 16 * 1024 * 1024;
constexpr int kConnectTimeoutMs = 15000;
constexpr int kRequestTimeoutMs = 30000;
constexpr int kBackupRequestTimeoutMs = 10 * 60 * 1000;
const char kAuxRuntimeHostKey = 0;

struct NativeReplyState {
  base::WaitableEvent ready;
  base::DictValue reply;
  std::shared_ptr<std::atomic_bool> cancelled =
      std::make_shared<std::atomic_bool>(false);
};

base::DictValue NativeFault(std::string code, std::string message) {
  base::DictValue error;
  error.Set("code", std::move(code));
  error.Set("message", std::move(message));
  base::DictValue reply;
  reply.Set("error", std::move(error));
  return reply;
}

base::DictValue NativeResult(base::Value value) {
  base::DictValue reply;
  reply.Set("result", std::move(value));
  return reply;
}

bool IsOwnerOnlyDirectory(const base::FilePath& path) {
  struct stat metadata;
  return lstat(path.value().c_str(), &metadata) == 0 &&
         S_ISDIR(metadata.st_mode) && metadata.st_uid == geteuid() &&
         (metadata.st_mode & 0777) == 0700;
}

}  // namespace

AuxRuntimeHost* AuxRuntimeHost::ForProfile(Profile* profile) {
  if (!profile || profile->IsOffTheRecord()) {
    return nullptr;
  }
  auto* host =
      static_cast<AuxRuntimeHost*>(profile->GetUserData(&kAuxRuntimeHostKey));
  if (!host) {
    auto created = std::unique_ptr<AuxRuntimeHost>(new AuxRuntimeHost(profile));
    host = created.get();
    profile->SetUserData(&kAuxRuntimeHostKey, std::move(created));
    // Queue the policy snapshot before any user API can create pages.
    aux::ZapController::ForProfile(profile)->EnsureReady(
        base::BindOnce([](bool) {}));
  }
  return host;
}

#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
base::WeakPtr<AuxRuntimeHost> AuxRuntimeHost::ExistingForStartup(Profile* profile) {
  if (!aux::NativeStartupObservationEnabled() || !profile || profile->IsOffTheRecord() ||
      !profile->GetWeakPtr()) return {};
  auto* host = static_cast<AuxRuntimeHost*>(profile->GetUserData(&kAuxRuntimeHostKey));
  if (!host || host->profile_ != profile || host->test_dispatch_ || host->shutting_down_) return {};
  return host->weak_factory_.GetWeakPtr();
}
void AuxRuntimeHost::StartupHelloPublished(base::TimeTicks acknowledged, uint64_t generation,
    aux::NativeRuntimePeerIdentity peer) {
  if (ExistingForStartup(profile_).get() != this) return;
  aux::NativeStartupRuntimeHelloStore::Published(profile_,
      {acknowledged, generation, peer, weak_factory_.GetWeakPtr()});
}
void AuxRuntimeHost::ConfirmStartupHello(uint64_t generation, aux::NativeRuntimePeerIdentity peer, base::TimeTicks deadline,
    base::OnceCallback<void(std::optional<base::TimeTicks>)> reply) {
  if (deadline.is_null() || base::TimeTicks::Now() > deadline || ExistingForStartup(profile_).get() != this) { std::move(reply).Run(std::nullopt); return; }
  worker_.AsyncCall(&Worker::ConfirmStartupHello).WithArgs(generation, peer, deadline).Then(std::move(reply));
}
std::optional<base::TimeTicks> AuxRuntimeHost::Worker::ConfirmStartupHello(uint64_t generation, aux::NativeRuntimePeerIdentity peer, base::TimeTicks deadline) {
  if (deadline.is_null() || base::TimeTicks::Now() > deadline || generation != 1 || connection_generation_ != generation || connection_fd_ < 0 ||
      !process_.IsValid() || static_cast<int>(process_.Pid()) != peer.pid ||
      aux::ReadNativeRuntimePeerIdentity(connection_fd_, peer.pid) != peer) return std::nullopt;
  const auto confirmed = base::TimeTicks::Now();
  return confirmed <= deadline ? std::optional<base::TimeTicks>(confirmed) : std::nullopt;
}
void AuxRuntimeHost::StartupHelloRetired(uint64_t generation) {
  aux::NativeStartupRuntimeHelloStore::Retired(profile_, weak_factory_.GetWeakPtr(), generation);
}
#endif

AuxRuntimeHost* AuxRuntimeHost::InstallTestDispatch(Profile* profile, TestDispatch dispatch) {
  CHECK(!profile->GetUserData(&kAuxRuntimeHostKey));
  auto created = std::unique_ptr<AuxRuntimeHost>(new AuxRuntimeHost(profile));
  auto* host = created.get();
  host->test_dispatch_ = std::move(dispatch);
  profile->SetUserData(&kAuxRuntimeHostKey, std::move(created));
  return host;
}
void AuxRuntimeHost::RemoveTestDispatch(Profile* profile) {
  profile->RemoveUserData(&kAuxRuntimeHostKey);
}

AuxRuntimeHost::AuxRuntimeHost(Profile* profile) : profile_(profile) {
  native_find_ = std::make_unique<aux::NativeFind>(profile);
  worker_thread_ = std::make_unique<base::Thread>("AuxProfileRuntime");
  CHECK(worker_thread_->Start());
  cdp_broker_ = std::make_unique<aux::CdpBroker>(
      profile, base::BindRepeating(&AuxRuntimeHost::OnCdpMessage,
                                   weak_factory_.GetWeakPtr()),
      base::BindRepeating(&AuxRuntimeHost::OnCdpNavigationState,
                         weak_factory_.GetWeakPtr()));
  worker_.emplace(worker_thread_->task_runner(),
                  profile->GetPath(),
                  profile->GetPath().BaseName().AsUTF8Unsafe(),
                  base::SequencedTaskRunner::GetCurrentDefault(),
                  weak_factory_.GetWeakPtr());
  cdp_authority_subscription_ = aux::EgressController::ForProfile(profile_)->ObserveAuthority(
      base::BindRepeating(&AuxRuntimeHost::OnCdpAuthorityChanged, weak_factory_.GetWeakPtr()));
  profile_library_ = std::make_unique<aux::ProfileLibrary>(
      profile,
      base::BindRepeating(
          [](base::WeakPtr<AuxRuntimeHost> host, std::string method,
             std::string params, base::OnceCallback<void(bool)> done) {
            if (!host) {
              std::move(done).Run(false);
              return;
            }
            host->CallInternal(std::move(method), std::move(params),
                               base::BindOnce(
                                   [](base::OnceCallback<void(bool)> done,
                                      AuxRuntimeHost::Response response) {
                                     std::move(done).Run(response.ok);
                                   },
                                   std::move(done)));
          },
          weak_factory_.GetWeakPtr()),
      base::BindRepeating(
          [](base::WeakPtr<AuxRuntimeHost> host) {
            if (host) {
              host->worker_.AsyncCall(&Worker::SendBookmarkChanged);
            }
          },
          weak_factory_.GetWeakPtr()));
  if (auto* catalog = aux::TabCatalog::GetForProfile(profile_)) {
    tab_catalog_subscription_ = catalog->ObserveChanges(base::BindRepeating(
        [](base::WeakPtr<AuxRuntimeHost> host, const std::string& patch_json) {
          if (host) {
            host->worker_.AsyncCall(&Worker::SendTabsChanged);
            host->worker_.AsyncCall(&Worker::SendCatalogPatch)
                .WithArgs(patch_json);
          }
        },
        weak_factory_.GetWeakPtr()));
  }
}

AuxRuntimeHost::~AuxRuntimeHost() {
  shutting_down_ = true;
  NativeConnectionRetired(admitted_native_generation_);
  FailOwnerMutations();
  if (recovery_authenticator_ && recovery_auth_pending_)
    recovery_authenticator_->Cancel();
  weak_factory_.InvalidateWeakPtrs();
  native_find_.reset();
  worker_.Reset();
  // Destroy the sequence-bound worker before quitting its thread, but join
  // off the UI sequence. Profile teardown must not block browser UI or violate
  // its synchronization restrictions. Shutdown waits for this cleanup task.
  worker_thread_->DetachFromSequence();
  base::ThreadPool::PostTask(
      FROM_HERE, {base::MayBlock(), base::WithBaseSyncPrimitives(), base::TaskShutdownBehavior::BLOCK_SHUTDOWN},
      base::BindOnce([](std::unique_ptr<base::Thread> thread) { thread->Stop(); },
                     std::move(worker_thread_)));
}

base::WeakPtr<AuxRuntimeHost> AuxRuntimeHost::ExistingForMeasuredStop(Profile* profile) {
  auto* host = profile ? static_cast<AuxRuntimeHost*>(profile->GetUserData(&kAuxRuntimeHostKey)) : nullptr;
  return host && profile && !profile->IsOffTheRecord() && host->profile_ == profile &&
      !host->test_dispatch_ && !host->shutting_down_ && host->admitted_native_generation_
      ? host->GetWeakPtr() : base::WeakPtr<AuxRuntimeHost>();
}
void AuxRuntimeHost::CallApi(std::string method,
                             std::string params_json,
                             ResponseCallback callback) {
  CallApiWithMeasuredStop(std::move(method), std::move(params_json),
                         std::move(callback), nullptr);
}
void AuxRuntimeHost::CallApiWithMeasuredStop(std::string method,
                             std::string params_json,
                             ResponseCallback callback,
                             std::unique_ptr<aux::NativeStopInputReceipt> original_input) {
  if (shutting_down_) {
    Response response;
    response.error_code = "unavailable";
    response.error_message = "Runtime is shutting down";
    std::move(callback).Run(std::move(response));
    return;
  }
  std::string person_resume;
  if (method == "pages.resume") {
    const auto params = base::JSONReader::ReadDict(params_json, base::JSON_PARSE_RFC);
    const auto* page_id = params ? params->FindString("pageId") : nullptr;
    auto* egress = aux::EgressController::ForProfile(profile_);
    if (!params || params->size() != 1 || !page_id || page_id->empty()) {
      std::move(callback).Run({false, "", "invalid_argument", "Original page identity is required"});
      return;
    }
    auto* catalog = aux::TabCatalog::GetForProfile(profile_);
    // Attached Chrome pages are runtime-owned rows outside this native catalog.
    // Their original backend checks remain in ControlAuthority; absent tickets
    // never admit Aux control there. A native row cannot take this path.
    const bool native_page = catalog && catalog->FindPage(*page_id);
    auto ticket = native_page && admitted_native_generation_
        ? egress->PreparePersonResume(*page_id, admitted_native_generation_)
        : std::nullopt;
    if (native_page && !ticket) {
      Response response;
      response.error_code = "ref_stale";
      response.error_message = "The original person-held page is unavailable. Refresh before returning control.";
      std::move(callback).Run(std::move(response));
      return;
    }
    if (ticket) person_resume = std::move(*ticket);
  }
  if (method == "pages.takeover") {
    const auto params = base::JSONReader::ReadDict(params_json, base::JSON_PARSE_RFC);
    const auto* page_id = params ? params->FindString("pageId") : nullptr;
    auto* catalog = aux::TabCatalog::GetForProfile(profile_);
    auto* page = params && params->size() == 1 && page_id && catalog ? catalog->FindPage(*page_id) : nullptr;
    if (!params || params->size() != 1 || !page_id || page_id->empty()) {
      std::move(callback).Run({false, "", "invalid_argument", "Original takeover page is required"});
      return;
    }
    auto* egress = aux::EgressController::ForProfile(profile_);
    if (page && egress->IsIsolatedPage(page)) {
      auto* frame = page->GetPrimaryMainFrame();
      // This is explicit local owner intent, not a platform-input receipt. An
      // invalid original clock deliberately prevents hardware-latency claims.
      if (!admitted_native_generation_ || !frame || !egress->RetireForNativePersonInput(page,
          frame->GetWeakDocumentPtr(), {}, base::TimeTicks::Now(), false)) {
        std::move(callback).Run({false, "", "ref_stale", "Original native takeover scope changed"});
        return;
      }
    }
  }
  const bool run_release = method == "runs.resume";
  if (method == "runs.pause" || method == "runs.cancel" || run_release) {
    const auto params = base::JSONReader::ReadDict(params_json, base::JSON_PARSE_RFC);
    const auto* run_id = params ? params->FindString("runId") : nullptr;
    auto* egress = aux::EgressController::ForProfile(profile_);
    if (!params || params->size() != 1 || !run_id || run_id->empty() || run_id->size() > 160 ||
        !admitted_native_generation_) {
      std::move(callback).Run({false, "", "ref_stale", "Original local run control is unavailable"});
      return;
    }
    if (!run_release) {
      // Synchronous native retirement precedes all worker forwarding. The
      // authenticated registered ancestry resolves descendants, including
      // completed groups; no runtime receipt or supplied child list is used.
      const bool retired = method == "runs.cancel" && original_input
          ? egress->RetireRegisteredRunForMeasuredStop(*run_id,
                admitted_native_generation_, *original_input)
          : egress->RetireRegisteredRun(*run_id, admitted_native_generation_);
      if (!retired) {
        std::move(callback).Run({false, "", "resource_exhausted", "Run retirement could not be retained"});
        return;
      }
    } else if (egress->HasStoppedRunIntent(*run_id, admitted_native_generation_)) {
      auto ticket = egress->PrepareRunResume(*run_id, admitted_native_generation_);
      if (!ticket) {
        std::move(callback).Run({false, "", "ref_stale", "Original local run resume is unavailable"});
        return;
      }
      person_resume = std::move(*ticket);
    }
  }
  std::string mutation_token;
  if (method == "safety.originPolicies.set" || method == "safety.grants.revoke") {
    auto* egress = aux::EgressController::ForProfile(profile_);
    auto token = egress->owner_mutations().Begin();
    if (!token) {
      Response response;
      response.error_code = "resource_exhausted";
      response.error_message = "Owner safety mutations are unavailable";
      std::move(callback).Run(std::move(response));
      return;
    }
    mutation_token = std::move(*token);
    owner_mutation_egress_ = egress->GetWeakPtr();
    owner_mutation_tokens_.insert(mutation_token);
  }
  auto completion = base::BindPostTaskToCurrentDefault(base::BindOnce(
      [](base::WeakPtr<AuxRuntimeHost> owner, std::string token, std::string person_resume, bool run_release, ResponseCallback callback,
         Response response) {
        if (owner) owner->FinishOwnerMutation(token, response.ok);
        if (owner && !person_resume.empty() &&
            !(run_release ? aux::EgressController::ForProfile(owner->profile_)->FinishRunResume(person_resume, response.ok)
                : aux::EgressController::ForProfile(owner->profile_)->FinishPersonResume(person_resume, response.ok)) && response.ok) {
          response.ok = false;
          response.result_json.clear();
          response.error_code = "ref_stale";
          response.error_message = "The original Return control receipt expired or changed. Refresh the page.";
        }
        if (owner && response.ok)
          owner->profile_library_->OnRuntimeAvailable();
        std::move(callback).Run(std::move(response));
      }, weak_factory_.GetWeakPtr(), std::move(mutation_token), person_resume, run_release, std::move(callback)));
  if (test_dispatch_) {
    test_dispatch_.Run(false, std::move(method), std::move(params_json), std::move(completion));
    return;
  }
  worker_.AsyncCall(&Worker::CallApi)
      .WithArgs(std::move(method), std::move(params_json), std::move(person_resume), std::move(completion));
  SchedulePump();
}

void AuxRuntimeHost::FinishOwnerMutation(const std::string& token, bool success) {
  if (!owner_mutation_tokens_.erase(token)) return;
  if (owner_mutation_egress_)
    owner_mutation_egress_->owner_mutations().End(token, success);
}
void AuxRuntimeHost::FailOwnerMutations() {
  // Move first: observer callbacks can reenter the host during cancellation.
  auto tokens = std::move(owner_mutation_tokens_);
  owner_mutation_tokens_.clear();
  for (const auto& token : tokens)
    if (owner_mutation_egress_)
      owner_mutation_egress_->owner_mutations().End(token, false);
}

void AuxRuntimeHost::ReadPerformanceProcessIdentity(
    base::OnceCallback<void(std::optional<PerformanceProcessIdentity>)> callback) {
  // Private friend-owned observation only. No public API or synthetic test PID.
  if (test_dispatch_) { std::move(callback).Run(std::nullopt); return; }
  worker_.AsyncCall(&Worker::ReadPerformanceProcessIdentity).Then(std::move(callback));
}
std::optional<AuxRuntimeHost::PerformanceProcessIdentity>
AuxRuntimeHost::Worker::ReadPerformanceProcessIdentity() {
  // Sequenced actual authenticated connection and launched Node helper.
  if (connection_fd_ < 0 || !connection_generation_ || !process_.IsValid())
    return std::nullopt;
  return PerformanceProcessIdentity{static_cast<int>(process_.Pid()), connection_generation_,
      live_refresh_sequence_, live_folder_id_, live_folder_units_};
}
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
void AuxRuntimeHost::ReadPerformanceProcessMemory(
    base::OnceCallback<void(std::optional<PerformanceProcessMemory>)> callback) {
  if (test_dispatch_) { std::move(callback).Run(std::nullopt); return; }
  worker_.AsyncCall(&Worker::ReadPerformanceProcessMemory).Then(std::move(callback));
}
std::optional<AuxRuntimeHost::PerformanceProcessMemory>
AuxRuntimeHost::Worker::ReadPerformanceProcessMemory() {
  // PID comes only from this Worker's actual authenticated launched process.
  const auto identity = ReadPerformanceProcessIdentity();
  if (!identity) return std::nullopt;
  const auto peer = aux::ReadNativeRuntimePeerIdentity(connection_fd_, identity->pid);
  if (!peer) return std::nullopt;
  const auto before = aux::ReadNativeProcessFootprint(identity->pid);
  if (!before || ReadPerformanceProcessIdentity() != identity) return std::nullopt;
  const auto after = aux::ReadNativeProcessFootprint(identity->pid);
  if (!after || ReadPerformanceProcessIdentity() != identity ||
      aux::ReadNativeRuntimePeerIdentity(connection_fd_, identity->pid) != peer ||
      before->process_uuid != after->process_uuid ||
      before->process_start_absolute != after->process_start_absolute ||
      before->sample_end > after->sample_start) return std::nullopt;
  return PerformanceProcessMemory{*identity, *before, *after, *peer};
}
void AuxRuntimeHost::ReadPerformanceProcessWorkload(PerformanceWorkloadCallback callback) {
  if (test_dispatch_) { std::move(callback).Run(std::nullopt); return; }
  worker_.AsyncCall(&Worker::ReadPerformanceProcessWorkload)
      .WithArgs(base::BindPostTaskToCurrentDefault(std::move(callback)));
  SchedulePump();
}
void AuxRuntimeHost::ReadPerformanceSubagentPreparation(PerformanceWorkloadCallback callback) {
  if (test_dispatch_) { std::move(callback).Run(std::nullopt); return; }
  worker_.AsyncCall(&Worker::ReadPerformanceObservation)
      .WithArgs(PerformanceObservation::kPreparation,
          base::BindPostTaskToCurrentDefault(std::move(callback)));
  SchedulePump();
}
void AuxRuntimeHost::Worker::ReadPerformanceProcessWorkload(PerformanceWorkloadCallback callback) {
  ReadPerformanceObservation(PerformanceObservation::kWorkload, std::move(callback));
}
void AuxRuntimeHost::Worker::ReadPerformanceObservation(
    PerformanceObservation kind, PerformanceWorkloadCallback callback) {
  const auto identity = ReadPerformanceProcessIdentity();
  const auto peer = identity ? aux::ReadNativeRuntimePeerIdentity(connection_fd_, identity->pid) : std::nullopt;
  if (!identity || !peer) { std::move(callback).Run(std::nullopt); return; }
  const auto issued = base::TimeTicks::Now();
  // The fixed fresh request uses the existing authenticated connection's
  // pending-request identity. A buffered prior response cannot satisfy it.
  CallInternal(kind == PerformanceObservation::kPreparation ?
      "performance.subagentPreparation" : "performance.subagentWorkload", "{}", base::BindOnce(
      [](Worker* worker, PerformanceObservation kind, PerformanceProcessIdentity identity,
          aux::NativeRuntimePeerIdentity peer, base::TimeTicks issued,
          PerformanceWorkloadCallback callback, Response response) {
        const auto received = base::TimeTicks::Now();
        if (!response.ok || response.result_json.size() > 8192 ||
            received < issued || received - issued > base::Seconds(5) ||
            worker->ReadPerformanceProcessIdentity() != identity ||
            aux::ReadNativeRuntimePeerIdentity(worker->connection_fd_, identity.pid) != peer) {
          std::move(callback).Run(std::nullopt); return;
        }
        auto value = base::JSONReader::Read(response.result_json, base::JSON_PARSE_RFC);
        auto* record = value ? value->GetIfDict() : nullptr;
        const auto* producer = record ? record->FindString("producer") : nullptr;
        const auto* status = record ? record->FindString("status") : nullptr;
        const auto observed = record ? record->FindDouble("observedAt") : std::nullopt;
        const bool preparation = kind == PerformanceObservation::kPreparation;
        if (!record || !producer || *producer != (preparation ?
                "aux-runtime-subagent-preparation" : "aux-runtime-subagent-workload") ||
            record->FindInt("version") != 1 || !status ||
            (preparation ? *status != "ready" : (*status != "executing" && *status != "idle")) || !observed ||
            !std::isfinite(*observed) || *observed <= 0 ||
            *observed > 9007199254740991.0 || std::floor(*observed) != *observed) {
          std::move(callback).Run(std::nullopt); return;
        }
        std::move(callback).Run(PerformanceProcessWorkload{
            std::move(identity), peer, std::move(*record), issued, received});
      }, base::Unretained(this), kind, *identity, *peer, issued, std::move(callback)));
}
#endif
void AuxRuntimeHost::CallInternal(std::string method,
                                  std::string params_json,
                                  ResponseCallback callback) {
  auto completion = base::BindPostTaskToCurrentDefault(std::move(callback));
  if (test_dispatch_) {
    test_dispatch_.Run(true, std::move(method), std::move(params_json), std::move(completion));
    return;
  }
  worker_.AsyncCall(&Worker::CallInternal)
      .WithArgs(std::move(method), std::move(params_json), std::move(completion));
  SchedulePump();
}

base::CallbackListSubscription AuxRuntimeHost::ObserveEvents(
    base::RepeatingCallback<void(const std::string&, const std::string&)>
        callback) {
  callback.Run("onRuntimeStatus",
               runtime_connected_ ? "{\"connected\":true}"
                                  : "{\"connected\":false}");
  return observers_.Add(std::move(callback));
}

void AuxRuntimeHost::NotifyNavigationError(const std::string& page_id,
                                           const base::DictValue* error) {
  base::DictValue payload;
  payload.Set("pageId", page_id);
  payload.Set("error", error ? base::Value(error->Clone()) : base::Value());
  if (auto json = base::WriteJson(payload)) {
    worker_.AsyncCall(&Worker::SendNavigationError).WithArgs(std::move(*json));
    SchedulePump();
  }
}

void AuxRuntimeHost::OnRuntimeNote(std::string type, std::string payload_json) {
  if (type == "event") {
    observers_.Notify("onEvent", payload_json);
  }
}

void AuxRuntimeHost::OnCdpMessage(uint64_t connection_generation,
                                  const std::string& page_id,
                                  const std::string& message) {
  worker_.AsyncCall(&Worker::SendCdpMessage)
      .WithArgs(connection_generation, page_id, message);
}

void AuxRuntimeHost::OnCdpAuthorityChanged() {
  if (shutting_down_ || !admitted_native_generation_ ||
      admitted_native_generation_ <= retired_native_generation_) return;
  worker_.AsyncCall(&Worker::SendCdpAuthorityChanged).WithArgs(admitted_native_generation_);
  SchedulePump();
}
void AuxRuntimeHost::OnCdpNavigationState(uint64_t connection_generation,
    const std::string& page_id, const std::string& attachment_id,
    int command_id, const std::string& lease_id, bool ready) {
  if (shutting_down_ || admitted_native_generation_ != connection_generation)
    return;
  worker_.AsyncCall(&Worker::SendCdpNavigationState).WithArgs(
      connection_generation, page_id, attachment_id, command_id, lease_id, ready);
}


void AuxRuntimeHost::SchedulePump() {
  if (pump_scheduled_) {
    return;
  }
  pump_scheduled_ = true;
  base::SequencedTaskRunner::GetCurrentDefault()->PostDelayedTask(
      FROM_HERE,
      base::BindOnce(&AuxRuntimeHost::PumpOnce, weak_factory_.GetWeakPtr()),
      base::Milliseconds(100));
}

void AuxRuntimeHost::PumpOnce() {
  pump_scheduled_ = false;
  worker_.AsyncCall(&Worker::Pump)
      .Then(base::BindOnce(&AuxRuntimeHost::OnPumpDone,
                           weak_factory_.GetWeakPtr()));
}

void AuxRuntimeHost::NativeConnectionPublished(uint64_t generation) {
  if (shutting_down_ || !generation || generation <= retired_native_generation_ ||
      generation <= admitted_native_generation_)
    return;
  if (admitted_native_generation_) {
    const auto weak = weak_factory_.GetWeakPtr();
    NativeConnectionRetired(admitted_native_generation_);
    if (!weak || shutting_down_ || admitted_native_generation_ ||
        generation <= retired_native_generation_)
      return;
  }
  auto* original_egress = aux::EgressController::ForProfile(profile_);
  if (!original_egress->AdmitRuntimeConnection(generation, native_owner_incarnation_))
    return;
  native_connection_egress_ = original_egress->GetWeakPtr();
  admitted_native_generation_ = generation;
  native_person_connection_id_ = base::Uuid::GenerateRandomV4().AsLowercaseString();
}
void AuxRuntimeHost::NativeConnectionRetired(uint64_t generation) {
  if (!generation)
    return;
  retired_native_generation_ = std::max(retired_native_generation_, generation);
  if (admitted_native_generation_ != generation)
    return;
  admitted_native_generation_ = 0;
  const auto retirement_weak = weak_factory_.GetWeakPtr();
  // Profile teardown has already removed its user-data map. Retire only the
  // original admitting controller, if it still exists; never recreate it.
  auto original_egress = native_connection_egress_;
  native_connection_egress_.reset();
  if (original_egress)
    original_egress->Disconnect();
  if (!retirement_weak) return;
  native_person_connection_id_.clear();
  ++native_recorder_session_generation_;
  auto recorder = native_recorder_;
  native_recorder_.reset();
  native_recorder_page_id_.clear();
  auto reads = std::move(native_person_reads_);
  native_person_reads_.clear();
  const auto weak = weak_factory_.GetWeakPtr();
  for (const auto& [id, reader] : reads) {
    if (reader)
      reader->Disconnect(generation);
    if (!weak)
      return;
  }
  if (recorder)
    recorder->Disconnect(generation);
}
void AuxRuntimeHost::HandleNativePersonReadCall(
    const std::string& method, const base::DictValue& params, uint64_t connection_generation,
    base::OnceCallback<void(base::DictValue)> callback) {
  if (shutting_down_ || !connection_generation ||
      admitted_native_generation_ != connection_generation ||
      connection_generation <= retired_native_generation_ || native_person_connection_id_.empty()) {
    std::move(callback).Run(NativeFault("target_detached", "Page connection retired"));
    return;
  }
  const auto* page_id = params.FindString("pageId");
  const auto* request = params.FindDict("request");
  const bool describe = method == "native.personReadContext";
  if (params.size() != (describe ? 1u : 2u) || !page_id || !aux::PageIdentity::IsValid(*page_id) ||
      (!describe && (method != "native.personRead" || !request))) {
    std::move(callback).Run(NativeFault("invalid_params", "Invalid fixed page read"));
    return;
  }
  if (!describe && native_person_reads_.size() >= 8) {
    std::move(callback).Run(NativeFault("conflict", "Too many pending page reads"));
    return;
  }
  auto* catalog = aux::TabCatalog::GetForProfile(profile_);
  auto* page = catalog ? catalog->FindPage(*page_id) : nullptr;
  auto* authority = aux::EgressController::ForProfile(profile_);
  auto receipt = page && authority ? authority->CapturePersonRead(page) : std::nullopt;
  if (!receipt || receipt->page_id() != *page_id) {
    std::move(callback).Run(NativeFault("permission_denied", "This page could not be read"));
    return;
  }
  auto context = aux::NativePersonObserverController::Describe(*receipt, native_person_connection_id_);
  auto* identity = context.FindDict("result");
  const auto* session_id = identity ? identity->FindString("sessionId") : nullptr;
  if (!session_id || !authority->MayReadPerson(*receipt)) {
    std::move(callback).Run(NativeFault("target_detached", "Page read context retired"));
    return;
  }
  if (describe) {
    std::move(callback).Run(std::move(context));
    return;
  }
  aux::NativePersonObserverController::CreateForWebContents(page);
  auto reader = aux::NativePersonObserverController::FromWebContents(page)->GetWeakPtr();
  // Private operation identity survives controller callback invalidation;
  // a late original reply must never remove a replacement slot.
  const auto operation_id = base::Uuid::GenerateRandomV4().AsLowercaseString();
  native_person_reads_.emplace(operation_id, reader);
  reader->Read(connection_generation, request->Clone(), base::BindOnce(
      [](base::WeakPtr<AuxRuntimeHost> owner,
         base::WeakPtr<aux::EgressController> authority,
         aux::NativePersonReadReceipt receipt, std::string operation_id, std::string session_id,
         uint64_t generation, base::OnceCallback<void(base::DictValue)> callback,
         base::DictValue reply) {
        if (!owner) {
          std::move(callback).Run(NativeFault("target_detached", "Page host closed"));
          return;
        }
        const bool slot = owner->native_person_reads_.erase(operation_id) == 1;
        if (!slot || owner->shutting_down_ ||
            owner->admitted_native_generation_ != generation ||
            generation <= owner->retired_native_generation_ ||
            !authority || !authority->MayReadPerson(receipt)) {
          std::move(callback).Run(NativeFault("target_detached", "Page read retired"));
          return;
        }
        if (auto* result = reply.FindDict("result"))
          result->Set("sessionId", session_id);
        std::move(callback).Run(std::move(reply));
      }, weak_factory_.GetWeakPtr(), authority->GetWeakPtr(), std::move(*receipt),
      operation_id, *session_id, connection_generation, std::move(callback)));
}
void AuxRuntimeHost::FailNativeCreatorCreation(base::DictValue failure,
    base::DictValue proof, uint64_t generation,
    std::shared_ptr<std::atomic_bool> cancelled,
    base::OnceCallback<void(base::DictValue)> done) {
  if (proof.empty() || !generation || generation != admitted_native_generation_ ||
      generation <= retired_native_generation_ || shutting_down_) {
    auto* error = failure.FindDict("error");
    if (error) {
      const auto* primary = error->FindString("message");
      error->Set("message", (primary ? *primary : "Original task creation failed") +
          std::string("; original temporary-page cleanup remains unresolved."));
    }
    std::move(done).Run(std::move(failure));
    return;
  }
  aux::EgressController::ForProfile(profile_)->CloseCreatorPage(
      base::DictValue().Set("proof", std::move(proof)), generation, std::move(cancelled),
      base::BindOnce([](base::DictValue original_failure,
          base::OnceCallback<void(base::DictValue)> done, base::DictValue cleanup) {
        const auto* result = cleanup.FindDict("result");
        if (!result || !result->FindBool("closed").value_or(false)) {
          auto* error = original_failure.FindDict("error");
          if (error) {
            const auto* primary = error->FindString("message");
            const auto* cleanup_error = cleanup.FindDict("error");
            const auto* cleanup_message = cleanup_error ? cleanup_error->FindString("message") : nullptr;
            error->Set("message", (primary ? *primary : "Original task creation failed") +
                std::string("; original temporary-page cleanup remains unresolved: ") +
                (cleanup_message ? *cleanup_message : "native closure was not acknowledged"));
            error->Set("cleanupFailure", std::move(cleanup));
          }
        }
        std::move(done).Run(std::move(original_failure));
      }, std::move(failure), std::move(done)));
}
void AuxRuntimeHost::HandleNativeCreatorCreateCall(const base::DictValue& params,
    uint64_t generation, std::shared_ptr<std::atomic_bool> cancelled,
    base::OnceCallback<void(base::DictValue)> done) {
  if (cancelled->load() || shutting_down_ || !generation || generation != admitted_native_generation_ ||
      generation <= retired_native_generation_) {
    std::move(done).Run(NativeFault("ref_stale", "Original creation connection was retired")); return;
  }
  auto reply = HandleNativeTabsCall("native.createAgentPage", params, generation);
  if (auto* cleanup = reply.FindDict("_creatorCleanup")) {
    auto proof = cleanup->Clone();
    reply.Remove("_creatorCleanup");
    FailNativeCreatorCreation(std::move(reply), std::move(proof), generation,
        std::move(cancelled), std::move(done));
    return;
  }
  const auto* result = reply.FindDict("result");
  const auto* page_id = result ? result->FindString("pageId") : nullptr;
  const auto* creation_id = result ? result->FindString("creationId") : nullptr;
  if (!page_id || !creation_id) { std::move(done).Run(std::move(reply)); return; }
  aux::EgressController::ForProfile(profile_)->WaitCreatorReady(*page_id, *creation_id, generation,
      base::BindOnce([](base::WeakPtr<AuxRuntimeHost> owner, uint64_t generation,
          std::shared_ptr<std::atomic_bool> cancelled, base::DictValue original_reply,
          base::OnceCallback<void(base::DictValue)> done, bool ready) {
        if (!ready || !owner || cancelled->load() || owner->shutting_down_ ||
            owner->admitted_native_generation_ != generation || generation <= owner->retired_native_generation_) {
          auto failure = NativeFault("ref_stale", "Original blank creation did not commit under its authority");
          if (owner) {
            const auto* result = original_reply.FindDict("result");
            const auto* page_id = result ? result->FindString("pageId") : nullptr;
            const auto* creation_id = result ? result->FindString("creationId") : nullptr;
            base::DictValue proof;
            if (page_id && creation_id) {
              auto cleanup = aux::EgressController::ForProfile(owner->profile_)->CreatorCleanupProof(
                  base::DictValue().Set("pageId", *page_id).Set("creationId", *creation_id), generation);
              if (const auto* value = cleanup.FindDict("result")) proof = value->Clone();
            }
            owner->FailNativeCreatorCreation(std::move(failure), std::move(proof), generation,
                std::move(cancelled), std::move(done));
          } else std::move(done).Run(std::move(failure));
          return;
        }
        std::move(done).Run(std::move(original_reply));
      }, weak_factory_.GetWeakPtr(), generation, std::move(cancelled), std::move(reply), std::move(done)));
}
void AuxRuntimeHost::HandleNativeCreatorCloseCall(const base::DictValue& params,
    uint64_t generation, std::shared_ptr<std::atomic_bool> cancelled,
    base::OnceCallback<void(base::DictValue)> done) {
  if (cancelled->load() || shutting_down_ || !generation || generation != admitted_native_generation_ ||
      generation <= retired_native_generation_) {
    std::move(done).Run(NativeFault("ref_stale", "Original cleanup connection was retired")); return;
  }
  aux::EgressController::ForProfile(profile_)->CloseCreatorPage(params, generation, std::move(cancelled), std::move(done));
}
void AuxRuntimeHost::HandleNativeRecorderCall(
    const std::string& method, const base::DictValue& params,
    uint64_t connection_generation,
    base::OnceCallback<void(base::DictValue)> callback) {
  const auto* page_id = params.FindString("pageId");
  const auto* recorder_id = params.FindString("recorderId");
  const bool start = method == "native.recorderStart";
  if (shutting_down_ || !connection_generation ||
      admitted_native_generation_ != connection_generation ||
      connection_generation <= retired_native_generation_) {
    std::move(callback).Run(NativeFault("target_detached", "Recording connection retired"));
    return;
  }
  if (!page_id || !aux::PageIdentity::IsValid(*page_id) ||
      params.size() != (start ? 1u : 2u) ||
      (!start && (!recorder_id || !base::Uuid::ParseLowercase(*recorder_id).is_valid())) ||
      (!start && method != "native.recorderDrain" && method != "native.recorderStop")) {
    std::move(callback).Run(NativeFault("invalid_params", "Invalid fixed recording request"));
    return;
  }
  auto* catalog = aux::TabCatalog::GetForProfile(profile_);
  auto* page = catalog ? catalog->FindPage(*page_id) : nullptr;
  if (!page) {
    std::move(callback).Run(NativeFault("target_detached", "Recording tab closed"));
    return;
  }
  if (start) {
    if (native_recorder_) {
      std::move(callback).Run(NativeFault("conflict", "This Profile already records a tab"));
      return;
    }
    aux::NativeRecorderController::CreateForWebContents(page);
    native_recorder_ = aux::NativeRecorderController::FromWebContents(page)->GetWeakPtr();
    native_recorder_page_id_ = *page_id;
    ++native_recorder_session_generation_;
  }
  if (!native_recorder_ || native_recorder_page_id_ != *page_id ||
      aux::NativeRecorderController::FromWebContents(page) != native_recorder_.get()) {
    std::move(callback).Run(NativeFault("target_detached", "Recording receipt changed"));
    return;
  }
  auto recorder = native_recorder_;
  if (start) {
    recorder->retired_callback_ = base::BindOnce(
        [](base::WeakPtr<AuxRuntimeHost> owner,
           base::WeakPtr<aux::NativeRecorderController> recorder,
           uint64_t connection, uint64_t recording_generation) {
          if (!owner || owner->admitted_native_generation_ != connection ||
              owner->native_recorder_session_generation_ != recording_generation ||
              owner->native_recorder_.get() != recorder.get()) return;
          // No external callback here. A new recording increments the generation
          // before installing, so its slot cannot be cleared by this receipt.
          owner->native_recorder_.reset();
          owner->native_recorder_page_id_.clear();
        }, weak_factory_.GetWeakPtr(), recorder, connection_generation,
        native_recorder_session_generation_);
  }
  auto done = base::BindOnce(
      [](base::WeakPtr<AuxRuntimeHost> owner,
         base::WeakPtr<aux::NativeRecorderController> recorder,
         std::string page_id, uint64_t generation, uint64_t recording_generation, bool start, bool stop,
         base::OnceCallback<void(base::DictValue)> callback,
         base::DictValue reply) {
        if (!owner || owner->shutting_down_ ||
            owner->admitted_native_generation_ != generation ||
            owner->native_recorder_session_generation_ != recording_generation) {
          std::move(callback).Run(NativeFault("target_detached", "Recording connection changed"));
          return;
        }
        const bool current = recorder && owner->native_recorder_.get() == recorder.get() &&
                             owner->native_recorder_page_id_ == page_id;
        const bool retired = !owner->native_recorder_ && owner->native_recorder_page_id_.empty();
        if (!current && !(retired && (reply.Find("error") || stop))) {
          std::move(callback).Run(NativeFault("target_detached", "Recording receipt changed"));
          return;
        }
        if (!recorder || !recorder->BoundToConnection(generation) ||
            (start && reply.Find("error")) || (stop && reply.Find("result"))) {
          owner->native_recorder_.reset();
          owner->native_recorder_page_id_.clear();
          ++owner->native_recorder_session_generation_;
        }
        std::move(callback).Run(std::move(reply));
      },
      weak_factory_.GetWeakPtr(), recorder, *page_id, connection_generation,
      native_recorder_session_generation_, start, method == "native.recorderStop", std::move(callback));
  if (start)
    recorder->Start(connection_generation, std::move(done));
  else if (method == "native.recorderDrain")
    recorder->Drain(connection_generation, *recorder_id, std::move(done));
  else
    recorder->Stop(connection_generation, *recorder_id, std::move(done));
}

void AuxRuntimeHost::HandleNativeCdpAttachment(
    const base::DictValue& params, uint64_t connection_generation,
    std::shared_ptr<std::atomic_bool> cancelled,
    base::OnceCallback<void(base::DictValue)> callback) {
  const auto* page_id = params.FindString("pageId");
  const auto* lease_id = params.FindString("leaseId");
  const auto acknowledged_expiry = params.FindDouble("acknowledgedExpiresAt");
  if (!acknowledged_expiry || !std::isfinite(*acknowledged_expiry) ||
      *acknowledged_expiry <= 0 || *acknowledged_expiry > 9007199254740991.0 ||
      std::floor(*acknowledged_expiry) != *acknowledged_expiry || shutting_down_ || cancelled->load() || !connection_generation ||
      admitted_native_generation_ != connection_generation || params.size() != 3 ||
      !page_id || page_id->empty() || !lease_id || lease_id->empty()) {
    std::move(callback).Run(NativeFault("ref_stale", "Original attachment caller is unavailable"));
    return;
  }
  cdp_broker_->WaitForAttachment(*page_id, *lease_id, *acknowledged_expiry, connection_generation,
      base::BindRepeating([](base::WeakPtr<AuxRuntimeHost> host, uint64_t generation,
                            std::shared_ptr<std::atomic_bool> cancelled) {
        return host && !host->shutting_down_ && !cancelled->load() &&
            host->admitted_native_generation_ == generation;
      }, weak_factory_.GetWeakPtr(), connection_generation, std::move(cancelled)),
      std::move(callback));
}


void AuxRuntimeHost::HandleNativeCdpNavigationReceipt(
    const base::DictValue& params, uint64_t connection_generation,
    std::shared_ptr<std::atomic_bool> cancelled,
    base::OnceCallback<void(base::DictValue)> callback) {
  const auto* page_id = params.FindString("pageId");
  const auto* attachment_id = params.FindString("attachmentId");
  const auto command_id = params.FindInt("commandId");
  if (shutting_down_ || cancelled->load() || !connection_generation ||
      admitted_native_generation_ != connection_generation ||
      params.size() != 3 || !page_id || !attachment_id || !command_id || *command_id < 1) {
    std::move(callback).Run(NativeFault("ref_stale", "Original navigation receipt caller is unavailable"));
    return;
  }
  // Ready-only TAKE never blocks the Worker that processes egress/consent.
  auto result = cdp_broker_->TakeReadyNavigationReceipt(*page_id, *attachment_id,
      *command_id, connection_generation);
  std::move(callback).Run(std::move(result));
}


void AuxRuntimeHost::OnPumpDone(bool connected) {
  if (runtime_connected_ != connected) {
    runtime_connected_ = connected;
    observers_.Notify("onRuntimeStatus",
                      connected ? "{\"connected\":true}"
                                : "{\"connected\":false}");
  }
  if (connected) {
    SchedulePump();
  } else {
    FailOwnerMutations();
    aux::EgressController::ForProfile(profile_)->Disconnect();
    cdp_broker_->DetachAll();
    profile_library_->OnRuntimeDisconnected();
  }
}

base::DictValue AuxRuntimeHost::HandleNativeCall(
    const std::string& method,
    const base::DictValue& params,
    uint64_t connection_generation) {
  auto* egress = aux::EgressController::ForProfile(profile_);
  if (method == "native.permissionRetire") {
    const auto* tab = params.FindString("tabId");
    const auto* batch = params.FindString("batchId");
    const auto* reservation = params.FindString("reservationId");
    if (!tab || tab->empty() || !batch || batch->empty() || !reservation || reservation->size() != 36)
      return NativeFault("invalid_params", "Exact permission retirement identity is required");
    auto* catalog = aux::TabCatalog::GetForProfile(profile_);
    auto* page = catalog ? catalog->FindPage(*tab) : nullptr;
    if (page) {
      auto* broker = aux::PermissionBroker::FromWebContents(page);
      if (broker) broker->RetireReservation(*batch, *reservation);
    }
    return base::DictValue().Set("result", base::DictValue().Set("accepted", true));
  }
  if (method == "native.egressRunTerminal") {
    const auto* run_id = params.FindString("runId");
    if (!run_id || params.size() != 1)
      return NativeFault("invalid_argument", "An exact original terminal run is required");
    return egress->RetireTerminalRun(*run_id, connection_generation);
  }
  if (method == "native.egressCheckRunResume") {
    const auto* run_id = params.FindString("runId");
    if (!run_id || params.size() != 1)
      return NativeFault("invalid_argument", "An exact original run is required");
    return egress->CheckRunResume(*run_id, connection_generation);
  }
  if (method == "native.egressResumeRun") {
    const auto* run_id = params.FindString("runId");
    const auto* ticket_id = params.FindString("ticketId");
    if (!run_id || !ticket_id || params.size() != 2)
      return NativeFault("invalid_argument", "Original run and local invocation are required");
    return egress->ConsumeRunResume(*run_id, *ticket_id, connection_generation);
  }
  if (method == "native.egressResumePerson") {
    const auto* page_id = params.FindString("pageId");
    const auto* ticket_id = params.FindString("ticketId");
    if (params.size() != 2 || !page_id || page_id->empty() || !ticket_id || ticket_id->empty())
      return NativeFault("invalid_params", "An exact original held page and person invocation are required");
    return egress->ConsumePersonResume(*page_id, *ticket_id, connection_generation);
  }
  if (method == "native.egressContext") return egress->Context(params);
  if (method == "native.egressInstall") return egress->Install(params);
  if (method == "native.egressRevoke") return egress->Revoke(params);
  const auto group = aux::AuxMethodRegistry::Get().RuntimeGroup(method);
  if ((group == aux::AuxRuntimeMethodGroup::kCdp ||
       group == aux::AuxRuntimeMethodGroup::kTabs ||
       group == aux::AuxRuntimeMethodGroup::kPageControls) &&
      !aux::TabCatalog::GetForProfile(profile_)) {
    return NativeFault("backend_unavailable", "Tab catalog is unavailable");
  }
  switch (group) {
    case aux::AuxRuntimeMethodGroup::kPower:
      return HandleNativePowerCall(method, params);
    case aux::AuxRuntimeMethodGroup::kLibrary:
      return HandleNativeLibraryCall(method, params, connection_generation);
    case aux::AuxRuntimeMethodGroup::kBlocking:
      return HandleNativeBlockingCall(method, params, connection_generation);
    case aux::AuxRuntimeMethodGroup::kCdp:
      return HandleNativeCdpCall(method, params, connection_generation);
    case aux::AuxRuntimeMethodGroup::kTabs:
      return HandleNativeTabsCall(method, params, connection_generation);
    case aux::AuxRuntimeMethodGroup::kPageControls:
      return HandleNativePageControlsCall(method, params,
                                          connection_generation);
    case aux::AuxRuntimeMethodGroup::kAsync:
    case aux::AuxRuntimeMethodGroup::kWorker:
    case aux::AuxRuntimeMethodGroup::kNone:
      return NativeFault("backend_unavailable",
                         "Native method is unavailable in this build");
  }
  return NativeFault("backend_unavailable",
                     "Native method is unavailable in this build");
}

void AuxRuntimeHost::HandleRecoveryOwnerAuth(
    const base::DictValue& params,
    std::shared_ptr<std::atomic_bool> cancelled,
    base::OnceCallback<void(base::DictValue)> callback) {
  const std::string* purpose = params.FindString("purpose");
  if (params.FindInt("version") != 1 || !purpose ||
      (*purpose != "export" && *purpose != "restore") ||
      profile_->IsOffTheRecord() || !runtime_connected_) {
    std::move(callback).Run(NativeFault(
        "permission_denied", "Protected recovery requires an active regular Profile"));
    return;
  }
  if (recovery_auth_pending_) {
    std::move(callback).Run(NativeFault(
        "conflict", "Another recovery authentication is in progress"));
    return;
  }
  recovery_authenticator_ = ChromeDeviceAuthenticatorFactory::GetForProfile(
      profile_, device_reauth::DeviceAuthParams(
                    base::Seconds(0),
                    device_reauth::DeviceAuthSource::kPasswordManager));
  if (!recovery_authenticator_ ||
      !recovery_authenticator_->CanAuthenticateWithBiometricOrScreenLock()) {
    std::move(callback).Run(NativeFault(
        "permission_denied", "Device authentication is unavailable"));
    return;
  }
  recovery_auth_pending_ = true;
  const std::u16string message = *purpose == "export"
      ? u"Approve creating an Aux recovery package"
      : u"Approve restoring an Aux recovery package";
  recovery_authenticator_->AuthenticateWithMessage(
      message,
      base::BindOnce(
          [](base::WeakPtr<AuxRuntimeHost> host,
             std::shared_ptr<std::atomic_bool> cancelled,
             base::OnceCallback<void(base::DictValue)> callback,
             bool approved) {
            if (host) host->recovery_auth_pending_ = false;
            if (!host || cancelled->load() || !approved ||
                !host->runtime_connected_) {
              std::move(callback).Run(NativeFault(
                  "permission_denied", "Recovery device authentication was not approved"));
              return;
            }
            base::DictValue result;
            result.Set("approved", true);
            std::move(callback).Run(NativeResult(base::Value(std::move(result))));
          }, weak_factory_.GetWeakPtr(), std::move(cancelled),
          std::move(callback)));
}

AuxRuntimeHost::Worker::Worker(
    base::FilePath profile_path,
    std::string profile_id,
    scoped_refptr<base::SequencedTaskRunner> ui_runner,
    base::WeakPtr<AuxRuntimeHost> owner)
    : profile_path_(std::move(profile_path)),
      profile_id_(std::move(profile_id)),
      ui_runner_(std::move(ui_runner)),
      owner_(std::move(owner)) {}

AuxRuntimeHost::Worker::~Worker() {
  Disconnect();
}

bool AuxRuntimeHost::Worker::Connect(std::string* error) {
  if (connection_fd_ >= 0) {
    return true;
  }
  const base::FilePath directory = profile_path_.Append("Aux Runtime");
  if (mkdir(directory.value().c_str(), 0700) != 0 && errno != EEXIST) {
    *error = "Cannot create the private runtime socket directory";
    return false;
  }
  if (!IsOwnerOnlyDirectory(directory)) {
    *error =
        "Runtime socket directory must be owned by this user and mode 0700";
    return false;
  }

  std::array<uint8_t, 32> random_bytes;
  base::RandBytes(random_bytes);
  token_ = base::HexEncode(random_bytes);
  socket_path_ = directory.Append("host-" + token_.substr(0, 12) + ".sock");
  if (socket_path_.value().size() >= sizeof(sockaddr_un{}.sun_path)) {
    *error = "Profile path is too long for a private runtime socket";
    return false;
  }

  listener_fd_ = socket(AF_UNIX, SOCK_STREAM, 0);
  if (listener_fd_ < 0) {
    *error = "Cannot create the runtime socket";
    return false;
  }
  if (fcntl(listener_fd_, F_SETFD, FD_CLOEXEC) != 0) {
    *error = "Cannot secure the runtime listener descriptor";
    Disconnect();
    return false;
  }
  sockaddr_un address = {};
  address.sun_family = AF_UNIX;
  const std::string& path = socket_path_.value();
  base::span(address.sun_path).first(path.size()).copy_from(base::span(path));
  base::span(address.sun_path)[path.size()] = '\0';
  if (bind(listener_fd_, reinterpret_cast<sockaddr*>(&address),
           sizeof(address)) != 0 ||
      chmod(socket_path_.value().c_str(), 0600) != 0 ||
      listen(listener_fd_, 1) != 0) {
    *error = "Cannot bind the private runtime socket";
    Disconnect();
    return false;
  }

  base::FilePath executable;
  if (!base::PathService::Get(base::FILE_EXE, &executable)) {
    *error = "Cannot find the Aux application bundle";
    Disconnect();
    return false;
  }
  const base::FilePath contents = executable.DirName().DirName();
  const base::FilePath node = contents.Append("Helpers").Append("Aux Runtime");
  const base::FilePath entry = contents.Append("Resources")
                                   .Append("aux-runtime")
                                   .Append("dist")
                                   .Append("main.js");
  if (!base::PathExists(node) || !base::PathExists(entry)) {
    *error = "The signed Aux Runtime helper is missing from the app bundle";
    Disconnect();
    return false;
  }
  base::CommandLine command(node);
  command.AppendArgPath(entry);
  base::LaunchOptions options;
  options.environment["AUX_HOST_SOCKET"] = socket_path_.value();
  options.environment["AUX_HOST_TOKEN"] = token_;
  const std::string expected_generation =
      std::to_string(connection_generation_ + 1);
  options.environment["AUX_HOST_GENERATION"] = expected_generation;
  options.environment["AUX_BROWSER_PROFILE_ID"] = profile_id_;
  options.environment["AUX_DATA_DIR"] =
      profile_path_.Append("Aux Runtime Data").value();
  process_ = base::LaunchProcess(command, options);
  if (!process_.IsValid()) {
    *error = "Cannot start the Aux Runtime helper";
    Disconnect();
    return false;
  }

  pollfd pending = {listener_fd_, POLLIN, 0};
  if (poll(&pending, 1, kConnectTimeoutMs) != 1 ||
      !(pending.revents & POLLIN)) {
    *error = "Aux Runtime did not connect in time";
    Disconnect();
    return false;
  }
  connection_fd_ = accept(listener_fd_, nullptr, nullptr);
  int no_sigpipe = 1;
  uid_t peer_uid;
  gid_t peer_gid;
  pid_t peer_pid = -1;
  socklen_t peer_pid_size = sizeof(peer_pid);
  if (connection_fd_ < 0 || fcntl(connection_fd_, F_SETFD, FD_CLOEXEC) != 0 ||
      setsockopt(connection_fd_, SOL_SOCKET, SO_NOSIGPIPE, &no_sigpipe,
                 sizeof(no_sigpipe)) != 0 ||
      getpeereid(connection_fd_, &peer_uid, &peer_gid) != 0 ||
      peer_uid != geteuid() ||
      getsockopt(connection_fd_, SOL_LOCAL, LOCAL_PEERPID,
                 &peer_pid, &peer_pid_size) != 0 ||
      peer_pid_size != sizeof(peer_pid) ||
      peer_pid != process_.Pid()) {
    *error = "Aux Runtime socket peer is not the launched helper";
    Disconnect();
    return false;
  }
  std::array<char, PROC_PIDPATHINFO_MAXSIZE> peer_path = {};
  std::array<char, PROC_PIDPATHINFO_MAXSIZE> expected_path = {};
  if (proc_pidpath(peer_pid, peer_path.data(), peer_path.size()) <= 0 ||
      !realpath(node.value().c_str(), expected_path.data()) ||
      std::string(peer_path.data()) != expected_path.data()) {
    *error = "Aux Runtime socket peer executable changed";
    Disconnect();
    return false;
  }
  std::string hello_frame;
  if (!ReadFrame(&hello_frame, kConnectTimeoutMs)) {
    *error = "Aux Runtime did not authenticate";
    Disconnect();
    return false;
  }
  const auto hello = base::JSONReader::Read(hello_frame, base::JSON_PARSE_RFC);
  const base::DictValue* data = hello ? hello->GetIfDict() : nullptr;
  const std::string* kind = data ? data->FindString("kind") : nullptr;
  const std::string* protocol = data ? data->FindString("protocol") : nullptr;
  const std::string* nonce = data ? data->FindString("nonce") : nullptr;
  const std::string* presented_token =
      data ? data->FindString("token") : nullptr;
  const std::string* generation =
      data ? data->FindString("generation") : nullptr;
  if (!kind || *kind != "hello" || !protocol || *protocol != "aux-host-v1" ||
      !nonce || nonce->size() != 64 ||
      !std::all_of(nonce->begin(), nonce->end(), [](unsigned char ch) {
        return std::isxdigit(ch);
      }) || !generation || *generation != expected_generation ||
      !presented_token ||
      *presented_token != token_) {
    *error = "Aux Runtime authentication failed";
    Disconnect();
    return false;
  }
  base::DictValue ack;
  ack.Set("kind", "hello-ack");
  ack.Set("protocol", "aux-host-v1");
  ack.Set("nonce", *nonce);
  ack.Set("generation", expected_generation);
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
  const bool startup_observed = aux::NativeStartupObservationEnabled();
#endif
  const auto ack_json = base::WriteJson(ack);
  if (!ack_json || !SendFrame(*ack_json)) {
    *error = "Cannot acknowledge the Aux Runtime connection";
    Disconnect();
    return false;
  }
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
  // Original authenticated ACK endpoint; UI delivery latency is not measured.
  const auto acknowledged = startup_observed ? base::TimeTicks::Now() : base::TimeTicks();
#endif
  close(listener_fd_);
  listener_fd_ = -1;
  ++connection_generation_;
  // Same sequenced UI endpoint: admission precedes every posted native request.
  ui_runner_->PostTask(FROM_HERE, base::BindOnce(
      &AuxRuntimeHost::NativeConnectionPublished, owner_, connection_generation_));
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
  if (startup_observed && aux::NativeStartupObservationEnabled()) {
    const auto peer = aux::ReadNativeRuntimePeerIdentity(connection_fd_, static_cast<int>(process_.Pid()));
    if (peer) ui_runner_->PostTask(FROM_HERE, base::BindOnce(
        &AuxRuntimeHost::StartupHelloPublished, owner_, acknowledged, connection_generation_, *peer));
  }
#endif
  return true;
}

void AuxRuntimeHost::Worker::Disconnect() {
  if (connection_fd_ >= 0 && connection_generation_)
    ui_runner_->PostTask(FROM_HERE, base::BindOnce(
        &AuxRuntimeHost::NativeConnectionRetired, owner_, connection_generation_));
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
  if (connection_fd_ >= 0 && connection_generation_ && aux::NativeStartupObservationEnabled())
    ui_runner_->PostTask(FROM_HERE, base::BindOnce(
        &AuxRuntimeHost::StartupHelloRetired, owner_, connection_generation_));
#endif
  if (connection_fd_ >= 0) {
    close(connection_fd_);
    connection_fd_ = -1;
  }
  if (listener_fd_ >= 0) {
    close(listener_fd_);
    listener_fd_ = -1;
  }
  if (process_.IsValid()) {
    process_.Terminate(0, false);
    process_.Close();
  }
  if (!socket_path_.empty()) {
    unlink(socket_path_.value().c_str());
    socket_path_.clear();
  }
  token_.clear();
  read_buffer_.clear();
  auto pending = std::move(pending_requests_);
  pending_requests_.clear();
  for (auto& [id, request] : pending) {
    std::move(request.callback).Run(
        {false, "", "operation_uncertain",
         "The runtime connection ended before this request was acknowledged"});
  }
}

bool AuxRuntimeHost::Worker::SendFrame(const std::string& frame) {
  if (frame.size() >= kMaxFrameBytes || connection_fd_ < 0) {
    return false;
  }
  const std::string line = frame + "\n";
  size_t offset = 0;
  while (offset < line.size()) {
    const auto remaining = base::span(line).subspan(offset);
    const ssize_t written =
        write(connection_fd_, remaining.data(), remaining.size());
    if (written <= 0) {
      if (written < 0 && errno == EINTR) {
        continue;
      }
      return false;
    }
    offset += written;
  }
  return true;
}

bool AuxRuntimeHost::Worker::ReadFrame(std::string* frame, int timeout_ms) {
  while (true) {
    const size_t newline = read_buffer_.find('\n');
    if (newline != std::string::npos) {
      *frame = read_buffer_.substr(0, newline);
      read_buffer_.erase(0, newline + 1);
      return true;
    }
    if (read_buffer_.size() >= kMaxFrameBytes) {
      return false;
    }
    pollfd pending = {connection_fd_, POLLIN, 0};
    if (poll(&pending, 1, timeout_ms) != 1 || !(pending.revents & POLLIN)) {
      return false;
    }
    std::array<char, 4096> chunk;
    const ssize_t count = read(connection_fd_, chunk.data(), chunk.size());
    if (count <= 0) {
      if (count < 0 && errno == EINTR) {
        continue;
      }
      return false;
    }
    read_buffer_.append(chunk.data(), count);
  }
}

base::DictValue AuxRuntimeHost::Worker::DispatchNative(
    const std::string& method,
    base::DictValue params) {
  auto state = std::make_shared<NativeReplyState>();
  ui_runner_->PostTask(
      FROM_HERE, base::BindOnce(
                     [](base::WeakPtr<AuxRuntimeHost> owner, std::string method,
                        base::DictValue params,
                        uint64_t connection_generation,
                        std::shared_ptr<NativeReplyState> state) {
                       if (owner && method == "native.cdpAttach") {
                         owner->HandleNativeCdpAttachment(params, connection_generation, state->cancelled,
                             base::BindOnce([](std::shared_ptr<NativeReplyState> state, base::DictValue reply) {
                               state->reply = std::move(reply); state->ready.Signal();
                             }, state));
                         return;
                       }
                       if (owner && method == "native.cdpTakeNavigationReceipt") {
                         owner->HandleNativeCdpNavigationReceipt(params, connection_generation, state->cancelled,
                             base::BindOnce([](std::shared_ptr<NativeReplyState> state, base::DictValue reply) {
                               state->reply = std::move(reply); state->ready.Signal();
                             }, state));
                         return;
                       }
                       if (owner && method == "native.createAgentPage") {
                         owner->HandleNativeCreatorCreateCall(params, connection_generation, state->cancelled,
                             base::BindOnce([](std::shared_ptr<NativeReplyState> state, base::DictValue reply) {
                               state->reply = std::move(reply); state->ready.Signal();
                             }, state));
                         return;
                       }
                       if (owner && method == "native.closeCreatedPage") {
                         owner->HandleNativeCreatorCloseCall(params, connection_generation, state->cancelled,
                             base::BindOnce([](std::shared_ptr<NativeReplyState> state, base::DictValue reply) {
                               state->reply = std::move(reply); state->ready.Signal();
                             }, state));
                         return;
                       }
                       if (owner && (method == "native.personRead" || method == "native.personReadContext")) {
                         owner->HandleNativePersonReadCall(method, params, connection_generation,
                             base::BindOnce([](std::shared_ptr<NativeReplyState> state,
                                               base::DictValue reply) {
                               state->reply = std::move(reply);
                               state->ready.Signal();
                             }, state));
                         return;
                       }
                       if (owner && (method == "native.recorderStart" ||
                                     method == "native.recorderDrain" ||
                                     method == "native.recorderStop")) {
                         owner->HandleNativeRecorderCall(method, params, connection_generation,
                             base::BindOnce([](std::shared_ptr<NativeReplyState> state,
                                               base::DictValue reply) {
                               state->reply = std::move(reply);
                               state->ready.Signal();
                             }, state));
                         return;
                       }
                       if (owner && method == "native.setCookies") {
                         aux::ImportCookies(owner->profile_, params, base::BindOnce(
                             [](std::shared_ptr<NativeReplyState> state,
                                base::DictValue reply) {
                               state->reply = std::move(reply);
                               state->ready.Signal();
                             }, state));
                         return;
                       }
                       if (owner && (method == "native.downloadRenameReceipts" ||
                                     method == "native.downloadNamingCandidate" ||
                                     method == "native.downloadPreviewText" ||
                                     method == "native.renameDownload" ||
                                     method == "native.undoDownloadRename")) {
                         owner->HandleDownloadNamingRequest(method, params,
                             base::BindOnce([](std::shared_ptr<NativeReplyState> state,
                                              base::DictValue reply) {
                               state->reply = std::move(reply); state->ready.Signal();
                             }, state));
                         return;
                       }
                       if (owner && method == "native.captureReadablePage") {
                         owner->HandleReadableCapture(params, base::BindOnce(
                             [](std::shared_ptr<NativeReplyState> state,
                                base::DictValue reply) {
                               state->reply = std::move(reply);
                               state->ready.Signal();
                             }, state));
                         return;
                       }
                       if (owner && method == "native.fillSavedPassword") {
                         owner->HandleCredentialFill(params, state->cancelled,
                             base::BindOnce(
                             [](std::shared_ptr<NativeReplyState> state,
                                base::DictValue reply) {
                               state->reply = std::move(reply);
                               state->ready.Signal();
                             }, state));
                         return;
                       }
                       if (owner && method == "native.recoveryOwnerAuth") {
                         owner->HandleRecoveryOwnerAuth(params, state->cancelled,
                             base::BindOnce(
                                 [](std::shared_ptr<NativeReplyState> state,
                                    base::DictValue reply) {
                                   state->reply = std::move(reply);
                                   state->ready.Signal();
                                 }, state));
                         return;
                       }
                       if (owner && method == "native.zapInstallStylesheet") {
                         owner->HandleZapInstall(params, base::BindOnce(
                             [](std::shared_ptr<NativeReplyState> state,
                                base::DictValue reply) {
                               state->reply = std::move(reply);
                               state->ready.Signal();
                             }, state));
                         return;
                       }
                       if (owner && method == "native.cosmeticCommit") {
                         owner->HandleCosmeticCommit(
                             params, base::BindOnce(
                                         [](std::shared_ptr<NativeReplyState> state,
                                            base::DictValue reply) {
                                           state->reply = std::move(reply);
                                           state->ready.Signal();
                                         },
                                         state));
                         return;
                       }
                       if (owner && method == "native.findInPage") {
                         owner->native_find_->Find(params, base::BindOnce(
                             [](std::shared_ptr<NativeReplyState> state,
                                base::DictValue reply) {
                               state->reply = std::move(reply);
                               state->ready.Signal();
                             }, state));
                         return;
                       }
                       if (owner && method == "native.contentBlockCommit") {
                         auto* blocker =
                             aux::ContentBlockingController::ForProfile(
                                 owner->profile_);
                         if (!blocker) {
                           state->reply = NativeFault(
                               "backend_unavailable",
                               "Content blocking is unavailable");
                           state->ready.Signal();
                           return;
                         }
                         blocker->Commit(
                             params,
                             base::BindOnce(
                                 [](std::shared_ptr<NativeReplyState> state,
                                    std::optional<base::DictValue> result,
                                    std::string error) {
                                   state->reply = result
                                       ? NativeResult(base::Value(
                                             std::move(*result)))
                                       : NativeFault(
                                             error ==
                                                     "Content blocking page changed"
                                                 ? "conflict"
                                                 : "invalid_argument",
                                             std::move(error));
                                   state->ready.Signal();
                                 },
                                 state));
                         return;
                       }
                       if (owner && (method == "native.webmcpList" ||
                                     method == "native.webmcpCall")) {
                         auto done = base::BindOnce(
                             [](std::shared_ptr<NativeReplyState> state,
                                base::DictValue reply) {
                               state->reply = std::move(reply);
                               state->ready.Signal();
                             },
                             state);
                         if (method == "native.webmcpList") {
                           aux::ListWebmcpTools(owner->profile_, params,
                                                std::move(done));
                         } else {
                           aux::CallWebmcpTool(owner->profile_, params,
                                               std::move(done));
                         }
                         return;
                       }
                       if (owner && (method == "native.historyClear" ||
                                     method == "native.historyImport" ||
                                     method == "native.historyRemove")) {
                         owner->HandleHistoryMutation(
                             method, params, base::BindOnce(
                                 [](std::shared_ptr<NativeReplyState> state,
                                    base::DictValue reply) {
                                   state->reply = std::move(reply);
                                   state->ready.Signal();
                                 }, state));
                         return;
                       }
                       state->reply =
                           owner ? owner->HandleNativeCall(
                                       method, params, connection_generation)
                                 : NativeFault(
                                       "backend_unavailable",
                                       "The owning browser Profile closed");
                       state->ready.Signal();
                     },
                     owner_, method, std::move(params), connection_generation_,
                     state));
  if (!state->ready.TimedWait(base::Seconds(
          method == "native.recoveryOwnerAuth" ? 120 :
          method == "native.fillSavedPassword" ? 60 : 30))) {
    state->cancelled->store(true);
    return NativeFault("backend_unavailable",
                       "The browser did not answer the native request");
  }
  return std::move(state->reply);
}

bool AuxRuntimeHost::Worker::HandleNativeRequest(
    const base::DictValue& data) {
  const std::optional<int> nested_id = data.FindInt("id");
  const std::string* native_method = data.FindString("method");
  const base::DictValue* native_params = data.FindDict("params");
  base::DictValue reply;
  reply.Set("kind", "res");
  reply.Set("id", nested_id.value_or(0));
  std::string native_error;
  std::string validation_error;
  if (native_method && native_params &&
      !aux::AuxMethodRegistry::Get().Validate(
          *native_method, base::Value(native_params->Clone()),
          &validation_error)) {
    base::DictValue fault;
    fault.Set("code", "invalid_argument");
    fault.Set("message", validation_error);
    reply.Set("error", std::move(fault));
  } else if (native_method && native_params &&
      *native_method == "native.storeSecret") {
    const std::string* name = native_params->FindString("name");
    const std::string* value = native_params->FindString("value");
    if (name && value &&
        aux::StoreSecret(profile_path_, *name, *value, &native_error)) {
      base::DictValue result;
      result.Set("ok", true);
      reply.Set("result", std::move(result));
    }
  } else if (native_method && native_params &&
             *native_method == "native.readSecret") {
    const std::string* name = native_params->FindString("name");
    std::optional<std::string> value;
    if (name && aux::ReadSecret(profile_path_, *name, &value, &native_error)) {
      base::DictValue result;
      if (value) {
        result.Set("value", *value);
      }
      reply.Set("result", std::move(result));
    }
  } else if (native_method && native_params &&
             *native_method == "native.profileStorageRoot") {
    std::string value;
    if (native_params->FindInt("version") == 1 &&
        aux::ProfileStorageRoot(profile_path_, profile_id_, &value,
                                &native_error)) {
      base::DictValue result;
      result.Set("value", value);
      reply.Set("result", std::move(result));
    }
  } else if (native_method && native_params &&
             *native_method == "native.profileStorageFactor") {
    std::string value;
    if (native_params->FindInt("version") == 1 &&
        native_params->FindString("purpose") &&
        *native_params->FindString("purpose") == "sqlite" &&
        aux::ProfileStorageFactor(profile_path_, profile_id_, &value,
                                  &native_error)) {
      base::DictValue result;
      result.Set("value", value);
      reply.Set("result", std::move(result));
    }
  } else if (native_method && native_params) {
    base::DictValue dispatched =
        DispatchNative(*native_method, native_params->Clone());
    if (base::Value* result = dispatched.Find("result")) {
      reply.Set("result", result->Clone());
    } else if (base::Value* fault = dispatched.Find("error")) {
      reply.Set("error", fault->Clone());
    }
  } else {
    native_error = "Invalid native request";
  }
  if (!reply.Find("result") && !reply.Find("error")) {
    base::DictValue fault;
    fault.Set("code", native_error.empty() ? "invalid_argument"
                                           : "backend_unavailable");
    fault.Set("message",
              native_error.empty() ? "Invalid native request" : native_error);
    reply.Set("error", std::move(fault));
  }
  const auto reply_json = base::WriteJson(reply);
  return reply_json && SendFrame(*reply_json);
}

void AuxRuntimeHost::Worker::SendCdpMessage(uint64_t connection_generation,
                                            std::string page_id,
                                            std::string message) {
  if (connection_fd_ < 0 || connection_generation != connection_generation_) {
    return;
  }
  base::DictValue payload;
  payload.Set("pageId", std::move(page_id));
  payload.Set("message", std::move(message));
  base::DictValue note;
  note.Set("kind", "note");
  note.Set("type", "native.cdpMessage");
  note.Set("payload", std::move(payload));
  const auto json = base::WriteJson(note);
  if (!json || json->size() >= kMaxFrameBytes || !SendFrame(*json)) {
    Disconnect();
  }
}

void AuxRuntimeHost::Worker::SendCdpAuthorityChanged(uint64_t generation) {
  if (connection_fd_ < 0 || !generation || generation != connection_generation_) return;
  // A fixed invalidation hint is never authority. The runtime obtains a fresh
  // native catalog and checks every original attachment before publication.
  base::DictValue note;
  note.Set("kind", "note");
  note.Set("type", "native.cdpAuthorityChanged");
  note.Set("payload", base::DictValue());
  const auto encoded = base::WriteJson(note);
  if (!encoded || encoded->size() >= kMaxFrameBytes || !SendFrame(*encoded)) Disconnect();
}
void AuxRuntimeHost::Worker::SendCdpNavigationState(
    uint64_t connection_generation, std::string page_id,
    std::string attachment_id, int command_id, std::string lease_id,
    bool ready) {
  if (connection_fd_ < 0 || connection_generation != connection_generation_)
    return;
  auto note = base::DictValue().Set("kind", "note")
      .Set("type", "native.cdpNavigationState")
      .Set("payload", base::DictValue().Set("pageId", std::move(page_id))
          .Set("attachmentId", std::move(attachment_id))
          .Set("commandId", command_id).Set("leaseId", std::move(lease_id))
          .Set("state", ready ? "ready" : "refused"));
  const auto json = base::WriteJson(note);
  if (!json || json->size() >= kMaxFrameBytes || !SendFrame(*json))
    Disconnect();
}


void AuxRuntimeHost::Worker::SendBookmarkChanged() {
  if (connection_fd_ < 0) {
    return;
  }
  base::DictValue note;
  note.Set("kind", "note");
  note.Set("type", "native.bookmarksChanged");
  note.Set("payload", base::DictValue());
  const auto json = base::WriteJson(note);
  if (!json || !SendFrame(*json)) {
    Disconnect();
  }
}

void AuxRuntimeHost::Worker::SendTabsChanged() {
  if (connection_fd_ < 0)
    return;
  base::DictValue note;
  note.Set("kind", "note");
  note.Set("type", "native.tabsChanged");
  note.Set("payload", base::DictValue());
  const auto json = base::WriteJson(note);
  if (!json || !SendFrame(*json))
    Disconnect();
}

void AuxRuntimeHost::Worker::SendCatalogPatch(std::string payload_json) {
  if (connection_fd_ < 0)
    return;
  auto payload = base::JSONReader::Read(payload_json, base::JSON_PARSE_RFC);
  if (!payload || !payload->is_dict())
    return;
  base::DictValue note;
  note.Set("kind", "note");
  note.Set("type", "tabs.catalog");
  note.Set("payload", std::move(*payload));
  const auto json = base::WriteJson(note);
  if (!json || !SendFrame(*json))
    Disconnect();
}

void AuxRuntimeHost::Worker::SendNavigationError(std::string payload_json) {
  if (connection_fd_ < 0)
    return;
  auto payload = base::JSONReader::Read(payload_json, base::JSON_PARSE_RFC);
  if (!payload || !payload->is_dict())
    return;
  base::DictValue note;
  note.Set("kind", "note");
  note.Set("type", "view.navigationError");
  note.Set("payload", std::move(*payload));
  const auto json = base::WriteJson(note);
  if (!json || !SendFrame(*json))
    Disconnect();
}

void AuxRuntimeHost::Worker::ForwardNote(const base::DictValue& data) {
  const std::string* type = data.FindString("type");
  const base::Value* payload = data.Find("payload");
  if (!type || *type != "event" || !payload) {
    return;
  }
  const auto payload_json = base::WriteJson(*payload);
  if (!payload_json) {
    return;
  }
  ui_runner_->PostTask(
      FROM_HERE, base::BindOnce(
                     [](base::WeakPtr<AuxRuntimeHost> owner, std::string type,
                        std::string payload_json) {
                       if (owner) {
                         owner->OnRuntimeNote(std::move(type),
                                              std::move(payload_json));
                       }
                     },
                     owner_, *type, *payload_json));
}

bool AuxRuntimeHost::Worker::Pump() {
  const auto now = base::TimeTicks::Now();
  for (auto it = pending_requests_.begin(); it != pending_requests_.end();) {
    if (it->second.deadline > now) { ++it; continue; }
    auto callback = std::move(it->second.callback);
    it = pending_requests_.erase(it);
    std::move(callback).Run({false, "", "operation_uncertain",
                            "The runtime request was not acknowledged before its deadline"});
  }
  if (connection_fd_ < 0) {
    return false;
  }
  for (int handled = 0; handled < 32; ++handled) {
    if (read_buffer_.find('\n') == std::string::npos) {
      pollfd pending = {connection_fd_, POLLIN, 0};
      if (poll(&pending, 1, 0) != 1) {
        return true;
      }
      if (!(pending.revents & POLLIN)) {
        if (pending.revents & (POLLERR | POLLHUP | POLLNVAL)) {
          Disconnect();
          return false;
        }
        return true;
      }
      std::array<char, 4096> chunk;
      const ssize_t count = read(connection_fd_, chunk.data(), chunk.size());
      if (count < 0 && errno == EINTR) {
        continue;
      }
      if (count <= 0) {
        Disconnect();
        return false;
      }
      read_buffer_.append(chunk.data(), count);
      if (read_buffer_.size() >= kMaxFrameBytes) {
        Disconnect();
        return false;
      }
      continue;
    }
    const size_t newline = read_buffer_.find('\n');
    std::string line = read_buffer_.substr(0, newline);
    read_buffer_.erase(0, newline + 1);
    const auto frame = base::JSONReader::Read(line, base::JSON_PARSE_RFC);
    const base::DictValue* data = frame ? frame->GetIfDict() : nullptr;
    if (!data) {
      Disconnect();
      return false;
    }
    const std::string* kind = data->FindString("kind");
    if (kind && *kind == "req" && !HandleNativeRequest(*data)) {
      Disconnect();
      return false;
    }
    if (kind && *kind == "note") {
      ForwardNote(*data);
    } else if (kind && *kind == "res") {
      HandleResponse(*data);
    }
  }
  return true;
}

void AuxRuntimeHost::Worker::CallApi(
    std::string method, std::string params_json, std::string person_resume, ResponseCallback callback) {
  CallRequest(std::move(method), std::move(params_json), true, std::move(person_resume), std::move(callback));
}

void AuxRuntimeHost::Worker::CallInternal(
    std::string method, std::string params_json, ResponseCallback callback) {
  CallRequest(std::move(method), std::move(params_json), false, {}, std::move(callback));
}

void AuxRuntimeHost::Worker::CallRequest(
    std::string method, std::string params_json, bool desktop_api,
    std::string person_resume, ResponseCallback callback) {
  const bool egress_request = !desktop_api && method == "egress.request";
  const bool live_refresh = desktop_api && method == "liveFolders.refresh";
  const bool backup_request = desktop_api &&
      (method == "installation.createBackup" ||
       method == "installation.stageRestore");
  if (pending_requests_.size() >= 256) {
    std::move(callback).Run({false, "", "backend_unavailable", "Too many pending runtime requests"});
    return;
  }
  std::string error;
  if (!Connect(&error)) {
    std::move(callback).Run({false, "", "backend_unavailable", std::move(error)});
    return;
  }
  const auto params = base::JSONReader::Read(params_json, base::JSON_PARSE_RFC);
  if (!params || (!desktop_api && !params->is_dict())) {
    std::move(callback).Run({false, "", "invalid_argument", "Invalid Aux API arguments"});
    return;
  }
  while (next_request_id_ > static_cast<uint32_t>(std::numeric_limits<int>::max()) ||
         pending_requests_.contains(next_request_id_)) {
    if (next_request_id_ >= static_cast<uint32_t>(std::numeric_limits<int>::max()))
      next_request_id_ = 1;
    else
      ++next_request_id_;
  }
  const auto* live_id = live_refresh && params->is_dict() ? params->GetDict().FindString("folderId") : nullptr;
  const std::string live_folder = live_id && !live_id->empty() && live_id->size() <= 200 ? *live_id : "";
  const uint32_t id = next_request_id_++;
  base::DictValue invocation;
  if (desktop_api) {
    const bool person_release = method == "pages.resume";
    const bool run_release = method == "runs.resume";
    invocation.Set("method", std::move(method));
    invocation.Set("params", params->Clone());
    invocation.Set("desktopUser", true);
    if ((person_release || run_release) && !person_resume.empty())
      invocation.Set(run_release ? "nativeRunResume" : "nativePersonResume", std::move(person_resume));
  }
  base::DictValue request;
  request.Set("kind", "req");
  request.Set("id", static_cast<int>(id));
  request.Set("method", desktop_api ? "api.invoke" : method);
  request.Set("params", desktop_api ? std::move(invocation) : params->GetDict().Clone());
  const auto request_json = base::WriteJson(request);
  if (!request_json || !SendFrame(*request_json)) {
    Disconnect();
    std::move(callback).Run({false, "", "operation_uncertain",
                            "The runtime connection ended while sending this request"});
    return;
  }
  // Return to the worker loop. CDP events and other responses must continue
  // flowing while an API call waits for runtime initialization or browser work.
  pending_requests_.emplace(id, PendingRequest{
      base::TimeTicks::Now() + base::Milliseconds(
          egress_request ? 125000 : backup_request ? kBackupRequestTimeoutMs : kRequestTimeoutMs),
      std::move(callback), live_folder});
}

void AuxRuntimeHost::Worker::HandleResponse(const base::DictValue& data) {
  const auto id = data.FindInt("id");
  if (!id || *id < 1) return;
  auto it = pending_requests_.find(static_cast<uint32_t>(*id));
  if (it == pending_requests_.end()) return;
  auto callback = std::move(it->second.callback);
  const std::string live_folder = it->second.live_folder_id;
  pending_requests_.erase(it);
  if (const auto* fault = data.FindDict("error")) {
    const auto* code = fault->FindString("code");
    const auto* message = fault->FindString("message");
    std::move(callback).Run({false, "", code ? *code : "internal",
                            message ? *message : "Aux Runtime request failed"});
    return;
  }
  const auto* result = data.Find("result");
  const auto json = result ? base::WriteJson(*result) : base::WriteJson(base::Value());
  if (!json) {
    std::move(callback).Run({false, "", "protocol_error", "Invalid runtime result"});
    return;
  }
  const auto* refreshed = result ? result->GetIfDict() : nullptr;
  const auto* folder_id = refreshed ? refreshed->FindString("folderId") : nullptr;
  const auto* rows = refreshed ? refreshed->FindList("items") : nullptr;
  const auto* refresh_error = refreshed ? refreshed->FindString("error") : nullptr;
  // The actual successful authenticated worker response, not renderer metadata.
  // Failed/empty source work and saturated history cannot fabricate a trial.
  if (!live_folder.empty() && folder_id && *folder_id == live_folder && rows &&
      !rows->empty() && rows->size() <= 25 && (!refresh_error || refresh_error->empty()) &&
      refreshed->FindDouble("refreshedAt").value_or(0) > 0 &&
      live_refresh_sequence_ < 9007199254740991ULL) {
    ++live_refresh_sequence_;
    live_folder_id_ = live_folder;
    live_folder_units_ = static_cast<unsigned>(rows->size());
  }
  std::move(callback).Run({true, *json, "", ""});
}
