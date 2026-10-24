// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/aux/ui_storage_migration_controller.h"
#include <algorithm>
#include <array>
#include <atomic>
#include <cmath>
#include <map>
#include <memory>
#include <set>
#include <string>
#include <string_view>
#include <optional>
#include <utility>
#include <vector>
#include "base/base64.h"
#include "base/functional/bind.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/memory/scoped_refptr.h"
#include "base/memory/safe_ref.h"
#include "base/memory/weak_ptr.h"
#include "base/scoped_observation.h"
#include "base/strings/string_number_conversions.h"
#include "base/supports_user_data.h"
#include "base/task/single_thread_task_runner.h"
#include "base/uuid.h"
#include "chrome/browser/aux/AuxSelectedStateHome.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/aux/ui_storage_migration_worker.h"
#include "chrome/browser/aux/profile_identity.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_observer.h"
#include "chrome/browser/ui/aux_feature_lifecycle.h"
#include "components/value_store/value_store.h"
#include "content/public/browser/browser_thread.h"
#include "content/public/browser/aux_ui_migration_document.h"
#include "content/public/browser/dom_storage_context.h"
#include "content/public/browser/navigation_controller.h"
#include "content/public/browser/navigation_handle.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/render_process_host.h"
#include "content/public/browser/storage_partition.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/weak_document_ptr.h"
#include "crypto/hash.h"
#include "extensions/browser/api/storage/storage_frontend.h"
#include "extensions/browser/extension_api_frame_id_map.h"
#include "extensions/browser/extension_registry.h"
#include "extensions/browser/extension_web_contents_observer.h"
#include "extensions/browser/process_manager.h"
#include "extensions/browser/script_executor.h"
#include "extensions/common/extension.h"
#include "extensions/common/mojom/code_injection.mojom.h"
#include "extensions/common/mojom/host_id.mojom.h"
#include "extensions/common/mojom/match_origin_as_fallback.mojom.h"
#include "extensions/common/mojom/run_location.mojom.h"
#include "mojo/public/cpp/bindings/callback_helpers.h"
#include "third_party/blink/public/mojom/script/script_evaluation_params.mojom.h"

namespace aux {
namespace {
constexpr char kController[] = "aux.ui-storage-migration-controller.v1";
constexpr char kCodec[] = "assets/draft-storage-ixLojjZ5.js";
constexpr size_t kCaptureLimit = 64 * 1024 * 1024;
using Reply = base::OnceCallback<void(base::DictValue)>;
using ScriptResults = std::vector<extensions::ScriptExecutor::FrameResult>;
using Frontend = extensions::StorageFrontend;
using ExtensionLease = Frontend::AuxUiMigrationLease;

base::DictValue Refused(std::string reason) {
  base::DictValue result;
  result.Set("success", false);
  result.Set("activationAuthorized", false);
  result.Set("qualified", false);
  result.Set("error", std::move(reason));
  return result;
}
bool Text(const base::DictValue& value, std::string_view key, std::string_view expected) {
  const auto* actual = value.FindString(key); return actual && *actual == expected;
}
bool UiDraftKey(std::string_view key, bool local) {
  if (key.empty() || key.size() > 8192 || std::ranges::any_of(key,
      [](unsigned char c) { return c < 32 || c == 127; })) return false;
  for (const auto prefix : {"aux.chat-draft.v3:", "aux.chat-draft-text.v1:"})
    if (key.starts_with(prefix) && key.size() > std::string_view(prefix).size()) return true;
  constexpr std::string_view settings = "aux.sidepanel-new-session-settings.v2:";
  return !local && (key == "aux.chat-pending-new-session-message.v2" ||
      (key.starts_with(settings) && key.size() > settings.size()));
}
// These are source DATA. Actual Profile/document/cache/lease ownership is joined
// independently; no reported identity or writer Boolean grants native authority.
struct WireMutation {
  bool local = false, remove = false;
  std::u16string key, value;
};
struct WireStores {
  std::map<std::u16string, std::u16string> session, local;
  std::vector<WireMutation> mutations;
};
bool ReadWireUnits(const base::Value* value, std::u16string& output, size_t& total) {
  const auto* units = value ? value->GetIfList() : nullptr;
  if (!units || units->size() > 4194304 || total > 4194304 - units->size()) return false;
  output.clear(); output.reserve(units->size()); total += units->size();
  for (const auto& unit : *units) {
    const auto number = unit.GetIfInt();
    if (!number || *number < 0 || *number > 65535) return false;
    output.push_back(static_cast<char16_t>(*number));
  }
  return true;
}
bool WireKey(const std::u16string& units, bool local) {
  // Draft identities already have finite ASCII native schemas. Unknown Unicode
  // identities refuse; values remain exact UTF16, including lone surrogates.
  if (units.size() > 8192) return false;
  std::string key; key.reserve(units.size());
  for (const auto unit : units) {
    if (unit > 127) return false;
    key.push_back(static_cast<char>(unit));
  }
  return UiDraftKey(key, local);
}
bool ReadWireEntries(const base::Value* value, bool local,
                     std::map<std::u16string, std::u16string>& output,
                     size_t& count, size_t& total) {
  const auto* entries = value ? value->GetIfList() : nullptr;
  if (!entries || entries->size() > 4096 || count > 4096 - entries->size()) return false;
  count += entries->size();
  for (const auto& raw : *entries) {
    const auto* entry = raw.GetIfDict(); std::u16string key, data;
    if (!entry || entry->size() != 2 || !ReadWireUnits(entry->Find("key"), key, total) ||
        !WireKey(key, local) || !ReadWireUnits(entry->Find("value"), data, total) ||
        !output.emplace(std::move(key), std::move(data)).second) return false;
  }
  return true;
}
std::optional<WireStores> ReadWireStores(const base::DictValue& value,
                                       std::string_view actual_origin) {
  if (value.size() != 5 || !Text(value, "format", "aux.ui-draft-store-units.v1") ||
      !Text(value, "origin", actual_origin)) return std::nullopt;
  WireStores stores; size_t count = 0, total = 0;
  if (!ReadWireEntries(value.Find("sessionEntries"), false, stores.session, count, total) ||
      !ReadWireEntries(value.Find("localEntries"), true, stores.local, count, total)) return std::nullopt;
  const auto* changes = value.FindList("mutations");
  if (!changes || changes->size() > 4096 || count > 4096 - changes->size()) return std::nullopt;
  std::set<std::pair<bool, std::u16string>> changed;
  for (const auto& raw : *changes) {
    const auto* change = raw.GetIfDict();
    if (!change || (!Text(*change, "storage", "local-storage") && !Text(*change, "storage", "session-storage")) ||
        (!Text(*change, "operation", "set") && !Text(*change, "operation", "remove"))) return std::nullopt;
    WireMutation mutation;
    mutation.local = Text(*change, "storage", "local-storage");
    mutation.remove = Text(*change, "operation", "remove");
    if (change->size() != (mutation.remove ? 3u : 4u) ||
        !ReadWireUnits(change->Find("key"), mutation.key, total) || !WireKey(mutation.key, mutation.local) ||
        (!mutation.remove && !ReadWireUnits(change->Find("value"), mutation.value, total)) ||
        !changed.emplace(mutation.local, mutation.key).second) return std::nullopt;
    stores.mutations.push_back(std::move(mutation));
  }
  return stores;
}
bool CanonicalUuid(const std::string& value) {
  return base::Uuid::ParseLowercase(value).is_valid() &&
      base::Uuid::ParseLowercase(value).AsLowercaseString() == value;
}
void Integer(std::vector<uint8_t>& bytes, uint64_t value, size_t count) {
  for (size_t i = 0; i < count; ++i) bytes.push_back((value >> (8 * i)) & 255);
}
uint64_t IntegerAt(const std::vector<uint8_t>& bytes, size_t at, size_t count) {
  uint64_t result = 0;
  for (size_t i = 0; i < count; ++i) result |= uint64_t(bytes[at + i]) << (8 * i);
  return result;
}
std::vector<uint8_t> UuidBytes(const std::string& id) {
  std::vector<uint8_t> result;
  std::string hex = id;
  std::erase(hex, '-');
  if (!CanonicalUuid(id) || !base::HexStringToBytes(hex, &result) || result.size() != 16) return {};
  return result;
}
std::array<uint8_t, 32> Digest(const std::string& bytes) {
  return crypto::hash::Sha256(base::as_byte_span(bytes));
}
// The native UI owner retains its exact next frame. Re-entry observes
// that same authority sequence/nonce, never starts a new physical upload.
struct Transfer {
  Transfer();
  ~Transfer();
  std::string capture, upload, journal, receipt, error;
  std::array<uint8_t, 32> digest{};
  uint64_t generation = 0;
  size_t offset = 0, read_offset = 0;
  int phase = 0;
  bool complete = false;
  std::atomic_bool running{false}, cancelled{false};
  std::vector<uint8_t> next;
};
Transfer::Transfer() = default;
Transfer::~Transfer() = default;

void TransferCapture(std::shared_ptr<Transfer> transfer) {
  auto& t = *transfer;
  t.error.clear();
  do {
    if (t.complete || t.cancelled.load()) break;
    if (t.next.empty()) {
      const auto upload = UuidBytes(t.upload);
      if (t.phase == 0) {
        t.next = {1}; t.next.insert(t.next.end(), upload.begin(), upload.end());
        Integer(t.next, t.capture.size(), 4); t.next.insert(t.next.end(), t.digest.begin(), t.digest.end());
      } else if (t.phase == 1 && t.offset < t.capture.size()) {
        const size_t amount = std::min<size_t>(8192 - 21, t.capture.size() - t.offset);
        t.next = {2}; t.next.insert(t.next.end(), upload.begin(), upload.end()); Integer(t.next, t.offset, 4);
        t.next.insert(t.next.end(), t.capture.begin() + t.offset, t.capture.begin() + t.offset + amount);
      } else if (t.phase <= 2) {
        t.phase = 2; t.next = {3}; t.next.insert(t.next.end(), upload.begin(), upload.end());
      } else if (t.phase == 3) {
        const auto journal = UuidBytes(t.journal);
        t.next = {5}; t.next.insert(t.next.end(), journal.begin(), journal.end());
      } else {
        const auto journal = UuidBytes(t.journal);
        const size_t amount = std::min<size_t>(8191, t.capture.size() - t.read_offset);
        t.next = {6}; t.next.insert(t.next.end(), journal.begin(), journal.end());
        Integer(t.next, t.read_offset, 4); Integer(t.next, amount, 4);
      }
    }
    // On repeated exact frames RequestAuthority observes the retained nonce;
    // it does not replay the underlying physical persistence operation.
    auto result = peer::ExchangeNativeSelectedUiCaptureFrame(t.next);
    if (result.status != peer::DaemonAuthorityStatus::ready) {
      t.error = "Native capture transport outcome remains unacknowledged"; break;
    }
    const auto& bytes = result.payload;
    if (t.phase == 0) {
      if (bytes.size() != 5 || bytes[0] != 1 || IntegerAt(bytes, 1, 4) > t.capture.size()) {
        t.error = "Invalid native capture begin reply"; break;
      }
      t.offset = IntegerAt(bytes, 1, 4); t.phase = 1;
    } else if (t.phase == 1) {
      const size_t expected = t.offset + t.next.size() - 21;
      if (bytes.size() != 5 || bytes[0] != 2 || IntegerAt(bytes, 1, 4) != expected) {
        t.error = "Invalid native capture append reply"; break;
      }
      t.offset = expected;
    } else if (t.phase == 2) {
      if (bytes.empty() || bytes[0] != 3) { t.error = "Invalid native capture persist reply"; break; }
      t.receipt.assign(bytes.begin() + 1, bytes.end());
      auto receipt = base::JSONReader::ReadDict(t.receipt, base::JSON_PARSE_RFC);
      const auto* journal = receipt ? receipt->FindString("transactionId") : nullptr;
      const auto* digest = receipt ? receipt->FindString("captureSha256") : nullptr;
      if (!journal || !CanonicalUuid(*journal) || !digest ||
          !Text(*receipt, "format", "aux.ui-storage.capture-receipt.v1") ||
          *digest != base::HexEncodeLower(t.digest) ||
          !Text(*receipt, "phase", "captured-unqualified") ||
          receipt->FindBool("activationAuthorized") != false) {
        t.error = "Native capture receipt mismatch"; break;
      }
      t.journal = *journal; t.phase = 3;
    } else if (t.phase == 3) {
      if (bytes.size() < 57 || bytes[0] != 5 || IntegerAt(bytes, 1, 4) != t.capture.size() ||
          IntegerAt(bytes, 5, 8) != t.generation || IntegerAt(bytes, 13, 8) != t.generation ||
          !std::equal(t.digest.begin(), t.digest.end(), bytes.begin() + 21) ||
          IntegerAt(bytes, 53, 4) != bytes.size() - 57 ||
          std::string(bytes.begin() + 57, bytes.end()) != t.receipt) {
        t.error = "Native capture readback binding mismatch"; break;
      }
      t.phase = 4;
    } else {
      const size_t amount = IntegerAt(t.next, 21, 4);
      if (bytes.size() != amount + 1 || bytes[0] != 6 ||
          !std::equal(bytes.begin() + 1, bytes.end(), t.capture.begin() + t.read_offset)) {
        t.error = "Native capture exact readback mismatch"; break;
      }
      t.read_offset += amount;
      t.complete = t.read_offset == t.capture.size();
    }
    t.next.clear();
  } while (false);
  if (t.cancelled.load() && !t.complete) t.error = "Native source changed during capture transfer";
  t.running.store(false, std::memory_order_release);
}

struct Frame {
  Frame();
  ~Frame();
  content::WeakDocumentPtr document;
  content::GlobalRenderFrameHostId routing;
  extensions::ExtensionApiFrameIdMap::DocumentId document_id;
  std::optional<blink::LocalFrameToken> native_frame_token;
  std::optional<blink::DocumentToken> native_document_token;
  base::WeakPtr<content::WebContents> contents;
  std::unique_ptr<extensions::ScriptExecutor> executor;
  std::string request_id, lease_id, capture_json, result_json, namespace_id;
  double revision = 0;
  std::optional<WireStores> source_stores;
  int frame_id = -1;
  bool prepared = false, cleanup_unknown = false;
};
Frame::Frame() = default;
Frame::~Frame() = default;
class Controller final : public base::SupportsUserData::Data, public ProfileObserver {
 public:
  explicit Controller(Profile*);
  ~Controller() override;
  void Begin(content::RenderFrameHost*, Reply);
  bool pending() const;
  base::CallbackListSubscription Observe(base::RepeatingClosure);
 private:
  bool Current() const;
  bool Inventory(bool retain);
  bool DocumentCurrent(const Frame&) const;
  void PrepareNext();
  void Invoke(size_t, std::string_view, base::ListValue,
              base::OnceCallback<void(std::optional<base::DictValue>, std::string)>);
  void Prepared(size_t, std::optional<base::DictValue>, std::string);
  void ObservePrepared(size_t, std::optional<base::DictValue>, std::string);
  bool AcceptLease(Frame&, const base::DictValue&);
  void BeginWorker();
  void WorkerPrepared(base::DictValue);
  bool WorkerCorrelation(const base::DictValue&, bool allow_bind);
  void WorkerControlLost(bool cleanup);
  void BeginFrontend();
  void FrontendPrepared(Frontend::AuxUiMigrationLeaseResult);
  void FrontendLost(bool begin);
  bool FrontendCurrent() const;
  void ReadWorkerForValidation();
  void WorkerReadForValidation(base::DictValue);
  void ValidateWorker();
  void WorkerValidated(base::DictValue);
  void ValidateFrontend();
  void FrontendReadback(Frontend::AuxUiMigrationReadbackResult);
  void ValidationComplete();
  void StartCleanup();
  void CleanupWorker();
  void ObservedWorkerCleanup(base::DictValue);
  void ReleasedWorker(base::DictValue);
  void DrainNext();
  void Drained(bool);
  void ValidateNext();
  void Validated(size_t, std::optional<base::DictValue>, std::string);
  void Persist();
  void RunTransfer();
  void TransferStep();
  void ObserveCleanupNext();
  void ObservedCleanup(size_t, std::optional<base::DictValue>, std::string);
  void Persisted();
  void ReleaseNext();
  void Released(size_t, std::optional<base::DictValue>, std::string);
  void Finish(std::string);
  void ReplyResult();
  void OnProfileWillBeDestroyed(Profile*) override;
  base::WeakPtr<Profile> profile_;
  scoped_refptr<const extensions::Extension> extension_;
  content::WeakDocumentPtr source_;
  std::string profile_id_, binding_, restoration_, error_;
  std::vector<std::unique_ptr<Frame>> frames_;
  std::vector<content::StoragePartition*> partitions_;
  std::unique_ptr<ExtensionLease> extension_lease_;
  base::UnguessableToken frontend_request_id_;
  extensions::WorkerId worker_inventory_;
  base::Uuid worker_context_id_;
  std::string worker_request_id_, worker_report_json_;
  bool worker_inventory_retained_ = false, worker_attempted_ = false;
  bool frontend_begin_pending_ = false, frontend_io_pending_ = false;
  bool frontend_begin_unknown_ = false, frontend_io_unknown_ = false;
  std::shared_ptr<Transfer> transfer_;
  Reply reply_;
  base::RepeatingClosureList settled_;
  size_t cursor_ = 0;
  bool busy_ = false, cleanup_unknown_ = false, post_persist_validation_ = false, transfer_validation_ = false, observing_cleanup_ = false;
  base::ScopedObservation<Profile, ProfileObserver> profile_observation_{this};
  base::WeakPtrFactory<Controller> weak_{this};
};
Controller::Controller(Profile* profile) : profile_(profile->GetWeakPtr()) {
  profile_observation_.Observe(profile);
}
Controller::~Controller() { if (transfer_) transfer_->cancelled.store(true); }
base::CallbackListSubscription Controller::Observe(base::RepeatingClosure callback) {
  return settled_.Add(std::move(callback));
}
bool Controller::pending() const {
  return busy_ || cleanup_unknown_ || extension_lease_ || worker_attempted_ ||
      frontend_begin_pending_ || frontend_io_pending_ || frontend_begin_unknown_ || frontend_io_unknown_ ||
      (transfer_ && (transfer_->running.load(std::memory_order_acquire) || !transfer_->complete));
}
bool Controller::Current() const {
  auto* source = source_.AsRenderFrameHostIfValid();
  auto* registry = profile_ ? extensions::ExtensionRegistry::Get(profile_.get()) : nullptr;
  return profile_ && source && source->GetBrowserContext() == profile_.get() &&
      IsAuxLocalProfileAdmitted(profile_.get()) && !IsProfileCookieRestorePending(profile_.get()) &&
      GetProfileId(profile_.get()) == profile_id_ && GetProfileCookieBindingEpoch(profile_.get()) == binding_ &&
      GetProfileCookieRestoreEpoch(profile_.get()) == restoration_ && registry && extension_ &&
      registry->enabled_extensions().GetByID(kAgentExtensionId) == extension_.get();
}
bool Controller::DocumentCurrent(const Frame& frame) const {
  auto* actual = frame.document.AsRenderFrameHostIfValid();
  return profile_ && actual && frame.contents && !frame.contents->IsBeingDestroyed() &&
      actual->GetBrowserContext() == profile_.get() && actual->IsRenderFrameLive() && actual->IsActive() &&
      actual->GetGlobalId() == frame.routing &&
      extensions::ExtensionApiFrameIdMap::GetDocumentId(actual) == frame.document_id &&
      frame.native_frame_token && actual->GetFrameToken() == *frame.native_frame_token &&
      frame.native_document_token && content::GetDocumentTokenForAuxUiMigration(*actual) == frame.native_document_token &&
      actual->GetLastCommittedOrigin() == extension_->origin();
}
bool Controller::Inventory(bool retain) {
  if (!Current()) return false;
  auto* manager = extensions::ProcessManager::Get(profile_.get());
  if (!manager) return false;
  // Initial inventory pins the actual worker as UNclosed inventory only. The
  // distinct helper later proves its own physical lifetime and source pause.
  const auto workers = manager->GetServiceWorkersForExtension(kAgentExtensionId);
  if (workers.size() != 1 || !workers.front().start_token) return false;
  const auto context = manager->GetContextIdForWorker(workers.front());
  if (!context.is_valid()) return false;
  if (retain) {
    worker_inventory_ = workers.front(); worker_context_id_ = context;
    worker_inventory_retained_ = true;
  } else if (!worker_inventory_retained_ || workers.front() != worker_inventory_ ||
      workers.front().start_token != worker_inventory_.start_token || context != worker_context_id_) return false;
  const auto registered = manager->GetRenderFrameHostsForExtension(kAgentExtensionId);
  if (registered.empty() || registered.size() > 128) return false;
  std::set<content::RenderFrameHost*> actual;
  for (auto process = content::RenderProcessHost::AllHostsIterator(); !process.IsAtEnd(); process.Advance()) {
    if (process.GetCurrentValue()->GetBrowserContext() != profile_.get()) continue;
    process.GetCurrentValue()->ForEachRenderFrameHost([&](content::RenderFrameHost* frame) {
      if (frame->GetLastCommittedOrigin() == extension_->origin()) actual.insert(frame);
    });
  }
  if (actual != registered) return false;
  if (!retain) {
    if (frames_.size() != actual.size()) return false;
    for (const auto& frame : frames_) if (!DocumentCurrent(*frame) ||
        !actual.contains(frame->document.AsRenderFrameHostIfValid())) return false;
    return true;
  }
  for (auto* frame : actual) {
    auto* contents = content::WebContents::FromRenderFrameHost(frame);
    auto* observer = contents ? extensions::ExtensionWebContentsObserver::GetForWebContents(contents) : nullptr;
    if (!contents || !observer || !frame->IsRenderFrameLive() || !frame->IsActive() ||
        frame->IsErrorDocument() || !frame->GetPendingCommitCrossDocumentNavigations().empty() ||
        !observer->GetLocalFrame(frame)) return false;
    const auto config = frame->GetStoragePartition()->GetConfig();
    const auto& namespaces = contents->GetController().GetSessionStorageNamespaceMap();
    const auto ns = namespaces.find(config);
    if (ns == namespaces.end() || !ns->second || ns->second->id().empty()) return false;
    const auto native_document = content::GetDocumentTokenForAuxUiMigration(*frame);
    if (!native_document) return false;
    auto retained = std::make_unique<Frame>();
    retained->native_frame_token = frame->GetFrameToken();
    retained->native_document_token = native_document;
    retained->document = frame->GetWeakDocumentPtr(); retained->routing = frame->GetGlobalId();
    retained->document_id = extensions::ExtensionApiFrameIdMap::GetDocumentId(frame);
    retained->frame_id = extensions::ExtensionApiFrameIdMap::GetFrameId(frame);
    retained->contents = contents->GetWeakPtr(); retained->namespace_id = ns->second->id();
    retained->request_id = base::Uuid::GenerateRandomV4().AsLowercaseString();
    retained->executor = std::make_unique<extensions::ScriptExecutor>(contents);
    frames_.push_back(std::move(retained));
    if (!std::ranges::contains(partitions_, frame->GetStoragePartition())) partitions_.push_back(frame->GetStoragePartition());
  }
  return true;
}
void Controller::Begin(content::RenderFrameHost* sender, Reply reply) {
  if (busy_ || (transfer_ && transfer_->running.load(std::memory_order_acquire))) {
    std::move(reply).Run(Refused("The actual native capture task remains running")); return;
  }
  // Unfinished native transfer keeps ALL original holds. Never resume producers
  // or replace its upload UUID across an unknown physical capture result.
  if (transfer_ && !transfer_->complete) {
    if (!Current() || !Inventory(false) || !FrontendCurrent()) {
      std::move(reply).Run(Refused("Original source holds remain unavailable for transfer recovery")); return;
    }
    busy_ = true; reply_ = std::move(reply);
    transfer_validation_ = true; cursor_ = 0; ReadWorkerForValidation(); return;
  }
  if (cleanup_unknown_ || extension_lease_ || worker_attempted_ ||
      frontend_begin_unknown_ || frontend_io_unknown_) {
    busy_ = true; observing_cleanup_ = true; reply_ = std::move(reply);
    StartCleanup(); return;
  }
  if (profile_ && (IsAuxLocalFeatureWritePending(profile_.get()) ||
      IsUiStorageMigrationWorkerPending(profile_.get()))) {
    std::move(reply).Run(Refused("An existing native profile writer/worker operation must settle before capture")); return;
  }
  frames_.clear(); partitions_.clear(); transfer_.reset(); error_.clear();
  worker_inventory_retained_ = false; worker_request_id_.clear(); worker_report_json_.clear();
  auto* registry = profile_ ? extensions::ExtensionRegistry::Get(profile_.get()) : nullptr;
  extension_ = registry ? registry->enabled_extensions().GetByID(kAgentExtensionId) : nullptr;
  if (!profile_ || !sender || sender->GetBrowserContext() != profile_.get() || !extension_ ||
      !profile_->IsRegularProfile() || profile_->IsOffTheRecord() ||
      sender->GetLastCommittedOrigin() != extension_->origin()) {
    std::move(reply).Run(Refused("Actual regular Aux document required")); return;
  }
  source_ = sender->GetWeakDocumentPtr(); profile_id_ = GetProfileId(profile_.get());
  binding_ = GetProfileCookieBindingEpoch(profile_.get()); restoration_ = GetProfileCookieRestoreEpoch(profile_.get());
  if (profile_id_.empty() || binding_.empty() || restoration_.empty() || !Inventory(true)) {
    frames_.clear(); std::move(reply).Run(Refused("Actual admitted profile/document/backend inventory unavailable")); return;
  }
  busy_ = true; observing_cleanup_ = false; cleanup_unknown_ = false;
  post_persist_validation_ = false; transfer_validation_ = false;
  reply_ = std::move(reply); cursor_ = 0; PrepareNext();
}
void Controller::Invoke(size_t index, std::string_view method, base::ListValue arguments,
    base::OnceCallback<void(std::optional<base::DictValue>, std::string)> callback) {
  if (index >= frames_.size() || !DocumentCurrent(*frames_[index])) {
    std::move(callback).Run(std::nullopt, "Original native document was lost"); return;
  }
  auto& frame = *frames_[index];
  auto encoded = base::WriteJson(arguments);
  if (!encoded || (method != "auxPrepareDraftMigrationCapture" && method != "auxReadDraftMigrationCapture" &&
      method != "auxValidateDraftMigrationCapture" && method != "auxReleaseDraftMigrationCapture")) {
    std::move(callback).Run(std::nullopt, "Finite capture command refused"); return;
  }
  const std::string script = "(async()=>{const m=await import('" + extension_->GetResourceURL(kCodec).spec() +
      "');return JSON.stringify(await m." + std::string(method) + "(..." + *encoded + "));})()";
  auto js = extensions::mojom::JSInjection::New();
  js->sources.push_back(extensions::mojom::JSSource::New(script, GURL()));
  js->world = extensions::mojom::ExecutionWorld::kMain;
  js->wants_result = blink::mojom::WantResultOption::kWantResult;
  js->user_gesture = blink::mojom::UserActivationOption::kDoNotActivate;
  js->wait_for_promise = blink::mojom::PromiseResultOption::kAwait;
  auto finished = base::BindOnce([](base::WeakPtr<Controller> self, size_t index,
      base::OnceCallback<void(std::optional<base::DictValue>, std::string)> callback, ScriptResults results) {
    if (!self || index >= self->frames_.size() || !self->DocumentCurrent(*self->frames_[index]) ||
        results.size() != 1 || !results[0].frame_responded || !results[0].error.empty() ||
        results[0].document_id != self->frames_[index]->document_id || !results[0].value.is_string() ||
        results[0].value.GetString().size() > kCaptureLimit) {
      std::move(callback).Run(std::nullopt, "Capture script result is unavailable or stale"); return;
    }
    self->frames_[index]->result_json = results[0].value.GetString();
    auto value = base::JSONReader::ReadDict(self->frames_[index]->result_json, base::JSON_PARSE_RFC);
    std::move(callback).Run(std::move(value), {});
  }, weak_.GetWeakPtr(), index, std::move(callback));
  extensions::mojom::HostID host(extensions::mojom::HostID::HostType::kExtensions, kAgentExtensionId);
  frame.executor->ExecuteScript(host, extensions::mojom::CodeInjection::NewJs(std::move(js)),
      extensions::ScriptExecutor::SPECIFIED_FRAMES, {frame.frame_id},
      extensions::mojom::MatchOriginAsFallbackBehavior::kNever, extensions::mojom::RunLocation::kBrowserDriven,
      extensions::ScriptExecutor::DEFAULT_PROCESS, GURL(),
      mojo::WrapCallbackWithDefaultInvokeIfNotRun(std::move(finished), ScriptResults()));
}
void Controller::PrepareNext() {
  if (!Inventory(false)) { Finish("Native frame/worker/profile inventory changed"); return; }
  if (cursor_ == frames_.size()) { BeginWorker(); return; }
  const size_t index = cursor_++;
  Invoke(index, "auxPrepareDraftMigrationCapture", base::ListValue().Append(frames_[index]->request_id).Append("utf16-v1"),
      base::BindOnce(&Controller::Prepared, weak_.GetWeakPtr(), index));
}
bool Controller::AcceptLease(Frame& frame, const base::DictValue& value) {
  const auto* request = value.FindString("requestId"), *lease = value.FindString("leaseId");
  auto revision = value.FindDouble("revision");
  auto owners = value.FindInt("ownerCount");
  const auto* raw_capture = value.FindString("captureJson");
  const auto* units = value.FindDict("storeUnits");
  auto stores = units ? ReadWireStores(*units, extension_->origin().Serialize()) : std::nullopt;
  if (!Text(value, "format", "aux.ui-draft-capture-lease.v1") ||
      value.FindBool("ok") != true || !request || *request != frame.request_id || !lease || !CanonicalUuid(*lease) ||
      !revision || *revision < 0 || *revision > 9007199254740991.0 || std::floor(*revision) != *revision ||
      !owners || *owners <= 0 || *owners > 256 || value.FindBool("sealed") != false ||
      !Text(value, "wireFormat", "utf16-v1") || !raw_capture || raw_capture->empty() ||
      raw_capture->size() > 32 * 1024 * 1024 || !stores) return false;
  if (frame.result_json.empty() || frame.result_json.size() > kCaptureLimit) return false;
  // captureJson is retained opaque. Never reparse its raw strings as a lossy
  // substitute for the exact numeric units used in native semantic pairing.
  frame.lease_id = *lease; frame.revision = *revision; frame.capture_json = frame.result_json;
  frame.source_stores = std::move(stores); frame.prepared = true;
  return true;
}
void Controller::Prepared(size_t index, std::optional<base::DictValue> value, std::string) {
  if (!value || !AcceptLease(*frames_[index], *value)) {
    // Preparation can have frozen a real producer before its result was lost.
    // Observe that retained lease without rerunning its writer flush.
    Invoke(index, "auxReadDraftMigrationCapture", base::ListValue().Append("utf16-v1"),
        base::BindOnce(&Controller::ObservePrepared, weak_.GetWeakPtr(), index)); return;
  }
  PrepareNext();
}
void Controller::ObservePrepared(size_t index, std::optional<base::DictValue> value, std::string error) {
  auto& frame = *frames_[index];
  if (value && Text(*value, "requestId", frame.request_id) && AcceptLease(frame, *value)) {
    PrepareNext(); return;
  }
  if (value && Text(*value, "requestId", frame.request_id)) {
    const auto* lease = value->FindString("leaseId");
    if (lease && CanonicalUuid(*lease)) { frame.lease_id = *lease; frame.prepared = true; }
  }
  const bool restored = value && Text(*value, "format", "aux.ui-draft-capture-lease.v1") &&
      Text(*value, "requestId", frame.request_id) && value->FindBool("retained") == false &&
      value->FindBool("restored") == true &&
      ((value->FindBool("released") == true && Text(*value, "leaseId", frame.lease_id)) ||
       (value->FindBool("noLeaseCreated") == true && Text(*value, "attemptState", "not-started")));
  if (restored) frame.prepared = false;
  frame.cleanup_unknown = !restored;
  Finish(error.empty() ? "Renderer closure remains refused or uncertain" : std::move(error));
}
void Controller::BeginWorker() {
  if (!Inventory(false)) { Finish("Actual native inventory changed before worker pause"); return; }
  worker_attempted_ = true;
  BeginUiStorageMigrationWorker(profile_.get(), mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::WorkerPrepared, weak_.GetWeakPtr()),
      base::BindOnce(&Controller::WorkerControlLost, weak_.GetWeakPtr(), false)));
}
bool Controller::WorkerCorrelation(const base::DictValue& value, bool allow_bind) {
  const auto* request = value.FindString("prepareRequestId");
  if (!request && allow_bind) request = value.FindString("requestId");
  if (!request || !CanonicalUuid(*request)) return false;
  if (worker_request_id_.empty() && allow_bind) worker_request_id_ = *request;
  return *request == worker_request_id_;
}
void Controller::WorkerPrepared(base::DictValue value) {
  if (value.FindBool("transportSuperseded") == true) return;
  const bool correlated = WorkerCorrelation(value, true);
  if (!profile_ || !IsUiStorageMigrationWorkerPending(profile_.get())) {
    worker_attempted_ = false;
    Finish("The actual worker could not establish its source hold"); return;
  }
  if (!correlated || !Inventory(false) || !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("The actual worker source hold remains refused or uncertain"); return;
  }
  if (const auto* report = value.FindString("reportJson")) worker_report_json_ = *report;
  BeginFrontend();
}
void Controller::WorkerControlLost(bool cleanup) {
  cleanup_unknown_ = true;
  if (cleanup) { error_ = "An actual worker cleanup control remains unconfirmed"; ReplyResult(); }
  else Finish("An actual native worker control callback remains unconfirmed");
}
void Controller::BeginFrontend() {
  if (!Inventory(false) || !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("Original worker/frame owners changed before frontend closure"); return;
  }
  auto* frontend = Frontend::Get(profile_.get());
  if (!frontend) { Finish("Actual extension frontend unavailable"); return; }
  // Every actual frame has flushed BEFORE this native admission gate closes.
  frontend_request_id_ = base::UnguessableToken::Create();
  frontend_begin_pending_ = true;
  frontend->BeginAuxUiMigrationLease(extension_, frontend_request_id_, mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::FrontendPrepared, weak_.GetWeakPtr()),
      base::BindOnce(&Controller::FrontendLost, weak_.GetWeakPtr(), true)));
}
void Controller::FrontendPrepared(Frontend::AuxUiMigrationLeaseResult result) {
  frontend_begin_pending_ = false;
  if (!result.has_value()) { Finish("The actual frontend source gate refused"); return; }
  extension_lease_ = std::move(result.value());
  if (!Inventory(false) || !HasValidUiStorageMigrationWorkerLease(profile_.get()) || !FrontendCurrent()) {
    Finish("The original actual frontend/worker owner changed"); return;
  }
  cursor_ = 0; DrainNext();
}
void Controller::FrontendLost(bool begin) {
  if (begin) { frontend_begin_pending_ = false; frontend_begin_unknown_ = true; }
  else { frontend_io_pending_ = false; frontend_io_unknown_ = true; }
  cleanup_unknown_ = true;
  Finish("An actual frontend callback was lost; gate state remains unknown");
}
bool Controller::FrontendCurrent() const {
  auto* frontend = profile_ ? Frontend::Get(profile_.get()) : nullptr;
  return frontend && extension_lease_ && !frontend_begin_pending_ && !frontend_io_pending_ &&
      !frontend_begin_unknown_ && frontend->ValidateAuxUiMigrationLease(*extension_lease_);
}

void Controller::DrainNext() {
  if (!Inventory(false) || !FrontendCurrent() || !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("Original source holds changed before physical DOM drain"); return;
  }
  if (cursor_ == partitions_.size()) { cursor_ = 0; ValidateNext(); return; }
  auto* context = partitions_[cursor_++]->GetDOMStorageContext();
  if (!context) { Finish("Actual DOM backend unavailable"); return; }
  context->DrainLoadedAreasForAuxUiMigration(base::BindOnce(&Controller::Drained, weak_.GetWeakPtr()));
}
void Controller::Drained(bool synced) {
  if (!synced) { Finish("Actual loaded-area DOM drain/file-data sync refused"); return; }
  DrainNext();
}
void Controller::ValidateNext() {
  if (!Inventory(false) || !FrontendCurrent() || !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("Original source holds changed after physical DOM drain"); return;
  }
  if (cursor_ == frames_.size()) { ValidateWorker(); return; }
  const size_t index = cursor_++;
  Invoke(index, "auxValidateDraftMigrationCapture", base::ListValue().Append(frames_[index]->lease_id).Append(frames_[index]->revision),
      base::BindOnce(&Controller::Validated, weak_.GetWeakPtr(), index));
}
void Controller::Validated(size_t index, std::optional<base::DictValue> value, std::string error) {
  if (!value || !Text(*value, "format", "aux.ui-draft-capture-lease.v1") ||
      value->FindBool("ok") != true || value->FindBool("closed") != true || value->FindBool("sealed") != false ||
      !Text(*value, "requestId", frames_[index]->request_id) ||
      !Text(*value, "leaseId", frames_[index]->lease_id) ||
      value->FindDouble("revision") != frames_[index]->revision) {
    Finish(error.empty() ? "Renderer lease changed during native capture" : std::move(error)); return;
  }
  ValidateNext();
}
void Controller::ReadWorkerForValidation() {
  ReadUiStorageMigrationWorker(profile_.get(), mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::WorkerReadForValidation, weak_.GetWeakPtr()),
      base::BindOnce(&Controller::WorkerControlLost, weak_.GetWeakPtr(), false)));
}
void Controller::WorkerReadForValidation(base::DictValue value) {
  if (value.FindBool("transportSuperseded") == true) return;
  if (!WorkerCorrelation(value, false) || !Inventory(false) || !FrontendCurrent() ||
      !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("The retained actual worker/source hold could not be observed for recovery"); return;
  }
  if (const auto* report = value.FindString("reportJson")) worker_report_json_ = *report;
  cursor_ = 0; ValidateNext();
}
void Controller::ValidateWorker() {
  ValidateUiStorageMigrationWorker(profile_.get(), mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::WorkerValidated, weak_.GetWeakPtr()),
      base::BindOnce(&Controller::WorkerControlLost, weak_.GetWeakPtr(), false)));
}
void Controller::WorkerValidated(base::DictValue value) {
  if (value.FindBool("transportSuperseded") == true) return;
  if (!WorkerCorrelation(value, false) || !Inventory(false) || !FrontendCurrent() ||
      !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("Original actual worker lease changed during validation"); return;
  }
  if (const auto* report = value.FindString("reportJson")) worker_report_json_ = *report;
  ValidateFrontend();
}
void Controller::ValidateFrontend() {
  if (!FrontendCurrent()) { Finish("Original actual frontend lease is unavailable"); return; }
  auto* frontend = Frontend::Get(profile_.get());
  frontend_io_pending_ = true;
  frontend->ReadbackAuxUiMigrationLease(*extension_lease_, mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::FrontendReadback, weak_.GetWeakPtr()),
      base::BindOnce(&Controller::FrontendLost, weak_.GetWeakPtr(), false)));
}
void Controller::FrontendReadback(Frontend::AuxUiMigrationReadbackResult result) {
  frontend_io_pending_ = false; frontend_io_unknown_ = false;
  // A confirmed read on the SAME opaque native lease resolves a lost readback
  // observation; no past callback destruction or timer is called completion.
  if (!result.has_value() || !Inventory(false) || !FrontendCurrent() ||
      !HasValidUiStorageMigrationWorkerLease(profile_.get()) ||
      !result->matches_source || result->ordinary_work_queued ||
      result->records != extension_lease_->CopySourceRecords()) {
    Finish("Actual frontend source readback or writer gate changed"); return;
  }
  ValidationComplete();
}
void Controller::ValidationComplete() {
  if (post_persist_validation_)
    Finish("Capture retained and read back; genuine DOM writer gates, target import and recovery remain required");
  else if (transfer_validation_) { transfer_validation_ = false; RunTransfer(); }
  else Persist();
}
void Controller::Persist() {
  if (!Inventory(false) || !FrontendCurrent() || frontend_io_unknown_ || !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("Native capture source holds were lost"); return;
  }
  base::ListValue pages, extension_records;
  for (const auto& frame : frames_) {
    base::DictValue page;
    page.Set("nativeDocumentId", frame->document_id.ToString());
    page.Set("nativeLocalFrameToken", frame->native_frame_token->ToString());
    page.Set("nativeBlinkDocumentToken", frame->native_document_token->ToString());
    page.Set("sessionNamespace", frame->namespace_id);
    page.Set("requestId", frame->request_id);
    page.Set("captureJson", frame->capture_json);
    pages.Append(std::move(page));
  }
  for (const auto& raw : extension_lease_->CopySourceRecords())
    extension_records.Append(raw ? base::Value(base::Base64Encode(*raw)) : base::Value());
  base::DictValue capture;
  capture.Set("format", "aux.ui-storage.capture-input.v1");
  capture.Set("nativeProfileId", profile_id_);
  capture.Set("bindingEpoch", binding_);
  capture.Set("restoreEpoch", restoration_);
  capture.Set("pages", std::move(pages));
  capture.Set("extensionRawRecords", std::move(extension_records));
  capture.Set("workerPrepareRequestId", worker_request_id_);
  capture.Set("workerReportJson", worker_report_json_);
  capture.Set("phase", "captured-unqualified");
  capture.Set("qualified", false);
  capture.Set("activationAuthorized", false);
  capture.Set("backendWriterClosure", false);
  capture.Set("targetImportAvailable", false);
  auto encoded = base::WriteJson(capture);
  if (!encoded || encoded->empty() || encoded->size() > kCaptureLimit) { Finish("Complete native capture exceeds its bound"); return; }
  transfer_ = std::make_shared<Transfer>(); transfer_->capture = std::move(*encoded);
  transfer_->digest = Digest(transfer_->capture); transfer_->upload = base::Uuid::GenerateRandomV4().AsLowercaseString();
  transfer_->generation = peer::InspectNativeBrowserShutdown().admitted_generation;
  RunTransfer();
}
void Controller::RunTransfer() {
  if (!Inventory(false) || !FrontendCurrent() || frontend_io_unknown_ || !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("Native source holds changed before the next capture frame"); return;
  }
  transfer_->running.store(true);
  // One bounded native IPC on the real owner sequence per task. Yield before
  // the next frame so document/profile/lease events can be processed. No
  // arbitrary worker receives native authority or a long UI-blocking loop.
  const bool posted = base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
      FROM_HERE, base::BindOnce(&Controller::TransferStep, weak_.GetWeakPtr()));
  if (!posted) {
    transfer_->running.store(false);
    if (transfer_->phase == 0 && transfer_->next.empty()) transfer_.reset();
    Finish("Native capture owner task did not start; older outcomes remain retained");
  }
}
void Controller::TransferStep() {
  if (!Inventory(false) || !FrontendCurrent() || frontend_io_unknown_ || !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    transfer_->running.store(false); Finish("Native source holds changed before capture IPC"); return;
  }
  TransferCapture(transfer_);  // Exactly one finite frame, never a chunk loop.
  if (transfer_->complete || !transfer_->error.empty()) { Persisted(); return; }
  // Validate the actual retained producer leases between every bounded frame.
  transfer_validation_ = true; cursor_ = 0; ValidateNext();
}
void Controller::Persisted() {
  if (!transfer_ || !transfer_->complete || !Inventory(false)) {
    Finish(transfer_ && !transfer_->error.empty() ? transfer_->error : "Native capture persistence/readback remains uncertain"); return;
  }
  post_persist_validation_ = true; cursor_ = 0; ValidateNext();
}
void Controller::ObserveCleanupNext() {
  while (cursor_ < frames_.size()) {
    const size_t index = cursor_++;
    auto& frame = *frames_[index];
    if (!frame.document.AsRenderFrameHostIfValid()) {
      // This proves only destruction of the in-memory document lease, not
      // completion of any backend/transport write.
      frame.prepared = false; frame.cleanup_unknown = false; continue;
    }
    if (!frame.prepared && !frame.cleanup_unknown) continue;
    Invoke(index, "auxReadDraftMigrationCapture", base::ListValue().Append("utf16-v1"),
        base::BindOnce(&Controller::ObservedCleanup, weak_.GetWeakPtr(), index)); return;
  }
  observing_cleanup_ = false; error_ = "Retained source cleanup was observed; no migration activated"; CleanupWorker();
}
void Controller::ObservedCleanup(size_t index, std::optional<base::DictValue> value, std::string) {
  auto& frame = *frames_[index];
  if (value && Text(*value, "format", "aux.ui-draft-capture-lease.v1") &&
      Text(*value, "requestId", frame.request_id) && value->FindBool("retained") == false &&
      value->FindBool("restored") == true &&
      ((value->FindBool("released") == true && Text(*value, "leaseId", frame.lease_id)) ||
       (frame.lease_id.empty() && value->FindBool("noLeaseCreated") == true && Text(*value, "attemptState", "not-started")))) {
    frame.prepared = false; frame.cleanup_unknown = false; ObserveCleanupNext(); return;
  }
  const auto* lease = value ? value->FindString("leaseId") : nullptr;
  if (!value || !Text(*value, "requestId", frame.request_id) || !lease || !CanonicalUuid(*lease)) {
    frame.cleanup_unknown = true; cleanup_unknown_ = true; ObserveCleanupNext(); return;
  }
  frame.lease_id = *lease; frame.prepared = true;
  Invoke(index, "auxReleaseDraftMigrationCapture", base::ListValue().Append(frame.lease_id),
      base::BindOnce(&Controller::Released, weak_.GetWeakPtr(), index));
}
void Controller::Finish(std::string error) {
  error_ = std::move(error);
  if (transfer_ && !transfer_->complete) {
    // Never release the original producer leases and start a different upload
    // across unfinished/unknown native capture work. Explicit observation of
    // the same pending frame and original bindings is required for recovery.
    ReplyResult(); return;
  }
  StartCleanup();
}
void Controller::StartCleanup() {
  // Reopen the ORIGINAL frontend gate before any productive renderer/worker
  // restore. Unknown physical begin/readback keeps the token and all producers.
  if (frontend_begin_pending_ || frontend_io_pending_) {
    cleanup_unknown_ = true; ReplyResult(); return;
  }
  if (frontend_begin_unknown_) {
    auto* frontend = profile_ ? Frontend::Get(profile_.get()) : nullptr;
    if (!frontend || frontend_request_id_.is_empty()) { cleanup_unknown_ = true; ReplyResult(); return; }
    auto observed = frontend->ObserveAuxUiMigrationLease(frontend_request_id_);
    if (!observed.has_value() || observed->preparation_pending || observed->target_attempted ||
        (!observed->lease && !observed->aborted_before_target)) {
      cleanup_unknown_ = true; ReplyResult(); return;
    }
    if (observed->lease) extension_lease_ = std::move(observed->lease);
    // Exact actual original State/abort observation, no reset or re-Capture.
    frontend_begin_unknown_ = false;
  }
  if (extension_lease_) {
    auto* frontend = profile_ ? Frontend::Get(profile_.get()) : nullptr;
    if (!frontend) { cleanup_unknown_ = true; ReplyResult(); return; }
    auto alive = weak_.GetWeakPtr();
    const bool released = frontend->ReleaseAuxUiMigrationLease(*extension_lease_);
    if (!alive) return;
    if (!released) { cleanup_unknown_ = true; ReplyResult(); return; }
    extension_lease_.reset(); frontend_io_unknown_ = false;
  }
  if (frontend_io_unknown_) { cleanup_unknown_ = true; ReplyResult(); return; }
  cleanup_unknown_ = false; cursor_ = 0;
  if (observing_cleanup_) ObserveCleanupNext(); else ReleaseNext();
}
void Controller::ReleaseNext() {
  while (cursor_ < frames_.size() && !frames_[cursor_]->prepared) {
    cleanup_unknown_ |= frames_[cursor_]->cleanup_unknown; ++cursor_;
  }
  if (cursor_ == frames_.size()) { CleanupWorker(); return; }
  const size_t index = cursor_++;
  Invoke(index, "auxReleaseDraftMigrationCapture", base::ListValue().Append(frames_[index]->lease_id),
      base::BindOnce(&Controller::Released, weak_.GetWeakPtr(), index));
}
void Controller::Released(size_t index, std::optional<base::DictValue> value, std::string) {
  const bool released = value && Text(*value, "format", "aux.ui-draft-capture-lease.v1") &&
      value->FindBool("ok") == true && value->FindBool("released") == true && value->FindBool("restored") == true &&
      Text(*value, "leaseId", frames_[index]->lease_id) &&
      Text(*value, "requestId", frames_[index]->request_id);
  frames_[index]->prepared = !released; frames_[index]->cleanup_unknown = !released;
  cleanup_unknown_ |= !released;
  if (observing_cleanup_) ObserveCleanupNext(); else ReleaseNext();
}
void Controller::CleanupWorker() {
  if (!worker_attempted_) { ReplyResult(); return; }
  if (extension_lease_ || frontend_begin_pending_ || frontend_io_pending_ ||
      frontend_begin_unknown_ || frontend_io_unknown_ || !profile_) {
    cleanup_unknown_ = true; ReplyResult(); return;
  }
  ReadUiStorageMigrationWorker(profile_.get(), mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::ObservedWorkerCleanup, weak_.GetWeakPtr()),
      base::BindOnce(&Controller::WorkerControlLost, weak_.GetWeakPtr(), true)));
}
void Controller::ObservedWorkerCleanup(base::DictValue value) {
  if (value.FindBool("transportSuperseded") == true) return;
  // This is the native helper's retained attempt result, never a worker-selected
  // Profile or a bare renderer readiness Boolean. Missing correlation stays held.
  const auto* actual_request = value.FindString("prepareRequestId");
  if (worker_request_id_.empty() && actual_request && CanonicalUuid(*actual_request))
    worker_request_id_ = *actual_request;
  if (!WorkerCorrelation(value, false) || !profile_) { cleanup_unknown_ = true; ReplyResult(); return; }
  if (value.FindBool("ownExternalRequestRetired") == true &&
      !IsUiStorageMigrationWorkerPending(profile_.get()) &&
      (value.FindBool("released") == true || value.FindBool("noProducerLeaseCreated") == true)) {
    worker_attempted_ = false; ReplyResult(); return;
  }
  ReleaseUiStorageMigrationWorker(profile_.get(), mojo::WrapCallbackWithDropHandler(
      base::BindOnce(&Controller::ReleasedWorker, weak_.GetWeakPtr()),
      base::BindOnce(&Controller::WorkerControlLost, weak_.GetWeakPtr(), true)));
}
void Controller::ReleasedWorker(base::DictValue value) {
  if (value.FindBool("transportSuperseded") == true) return;
  if (!profile_ || !WorkerCorrelation(value, false) || value.FindBool("released") != true ||
      value.FindBool("ownExternalRequestRetired") != true || IsUiStorageMigrationWorkerPending(profile_.get())) {
    cleanup_unknown_ = true; ReplyResult(); return;
  }
  worker_attempted_ = false; ReplyResult();
}
void Controller::ReplyResult() {
  busy_ = false;
  // Opaque frontend/worker tokens survive any unconfirmed cleanup. Only their
  // actual native release paths above may retire them.
  auto result = Refused(error_);
  result.Set("phase", transfer_ && transfer_->complete ? "captured-unqualified" : "refused-or-unknown");
  result.Set("rendererCleanupUnknown", cleanup_unknown_);
  result.Set("workerCleanupPending", worker_attempted_);
  result.Set("frontendCleanupPending", !!extension_lease_ || frontend_begin_unknown_ || frontend_io_unknown_);
  result.Set("backendWriterClosure", false);
  result.Set("targetImportAvailable", false);
  if (transfer_ && transfer_->complete) {
    result.Set("journalId", transfer_->journal);
    result.Set("captureSha256", base::HexEncodeLower(transfer_->digest));
  }
  auto alive = weak_.GetWeakPtr();
  if (reply_) std::move(reply_).Run(std::move(result));
  if (alive && !alive->pending()) alive->settled_.Notify();
}
void Controller::OnProfileWillBeDestroyed(Profile*) {
  if (transfer_) transfer_->cancelled.store(true);
  profile_observation_.Reset(); profile_ = nullptr;
  if (reply_) std::move(reply_).Run(Refused("Original native Profile was destroyed; migration did not activate"));
}
Controller* Find(Profile* profile) {
  return profile ? static_cast<Controller*>(profile->GetUserData(&kController)) : nullptr;
}
}  // namespace
void PrepareUiStorageMigration(Profile* profile, content::RenderFrameHost* sender, Reply reply) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!profile || !sender || sender->GetBrowserContext() != profile ||
      !profile->IsRegularProfile() || profile->IsOffTheRecord()) {
    std::move(reply).Run(Refused("Actual regular native profile sender required")); return;
  }
  auto* registry = extensions::ExtensionRegistry::Get(profile);
  auto* extension = registry ? registry->enabled_extensions().GetByID(kAgentExtensionId) : nullptr;
  if (!extension || sender->GetLastCommittedOrigin() != extension->origin()) {
    std::move(reply).Run(Refused("Actual enabled canonical Aux Agent document required")); return;
  }
  if (!Find(profile)) profile->SetUserData(&kController, std::make_unique<Controller>(profile));
  Find(profile)->Begin(sender, std::move(reply));
}
bool IsUiStorageMigrationPending(Profile* profile) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto* owner = Find(profile); return owner && owner->pending();
}
base::CallbackListSubscription ObserveUiStorageMigrationSettled(
    Profile* profile, base::RepeatingClosure callback) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!profile || !profile->IsRegularProfile() || profile->IsOffTheRecord()) return {};
  if (!Find(profile)) profile->SetUserData(&kController, std::make_unique<Controller>(profile));
  return Find(profile)->Observe(std::move(callback));
}
}  // namespace aux
