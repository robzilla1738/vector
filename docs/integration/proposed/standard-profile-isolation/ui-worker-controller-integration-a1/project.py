"""Exact current native controller overlay; shared/native inputs stay read-only."""
from pathlib import Path
import hashlib,json,difflib
BASE=Path(__file__).resolve().parent
NATIVE=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
sha=lambda x:hashlib.sha256(x).hexdigest()
relative='chrome/browser/aux/ui_storage_migration_controller.cc'
original=(NATIVE/relative).read_text();assert sha(original.encode())=='bd13c8b0ad260d399bf0f5f399f82884329cbbf1c85aabbcecf2cb925dee0ac7'
s=original;anchors=[]
def edit(find,replace):
 global s
 assert s.count(find)==1,(find[:100],s.count(find));s=s.replace(find,replace);anchors.append({'find':find,'replace':replace,'count':1})
def method(name,next_name,replacement):
 a=s.index(name);b=s.index(next_name,a);edit(s[a:b],replacement+'\n')
edit('#include "chrome/browser/aux/component_bootstrap.h"','#include "chrome/browser/aux/component_bootstrap.h"\n#include "chrome/browser/aux/ui_storage_migration_worker.h"')
edit('  return base::DictValue().Set("success", false).Set("activationAuthorized", false)\n      .Set("qualified", false).Set("error", std::move(reason));', '  base::DictValue result;\n  result.Set("success", false).Set("activationAuthorized", false)\n      .Set("qualified", false).Set("error", std::move(reason));\n  return result;')
edit('using Capture = value_store::ValueStore::AuxUiPreferenceCapture;','using Frontend = extensions::StorageFrontend;\nusing ExtensionLease = Frontend::AuxUiMigrationLease;')
edit('  void CapturedExtension(value_store::ValueStore::AuxUiPreferenceCaptureResult);','''  void BeginWorker();
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
  void ReleasedWorker(base::DictValue);''')
edit('  std::unique_ptr<Capture> extension_capture_;','''  std::unique_ptr<ExtensionLease> extension_lease_;
  extensions::WorkerId worker_inventory_;
  base::Uuid worker_context_id_;
  std::string worker_request_id_, worker_report_json_;
  bool worker_inventory_retained_ = false, worker_attempted_ = false;
  bool frontend_begin_pending_ = false, frontend_io_pending_ = false;
  bool frontend_begin_unknown_ = false, frontend_io_unknown_ = false;''')
edit('''  return busy_ || cleanup_unknown_ || (transfer_ &&
      (transfer_->running.load(std::memory_order_acquire) || !transfer_->complete));''','''  return busy_ || cleanup_unknown_ || extension_lease_ || worker_attempted_ ||
      frontend_begin_pending_ || frontend_io_pending_ || frontend_begin_unknown_ || frontend_io_unknown_ ||
      (transfer_ && (transfer_->running.load(std::memory_order_acquire) || !transfer_->complete));''')
edit('''  if (!manager || !manager->GetServiceWorkersForExtension(kAgentExtensionId).empty()) return false;
  const auto registered''','''  if (!manager) return false;
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
  const auto registered''')
method('void Controller::Begin(content::RenderFrameHost* sender, Reply reply) {','void Controller::Invoke(','''void Controller::Begin(content::RenderFrameHost* sender, Reply reply) {
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
}''')
edit('''  if (cursor_ == frames_.size()) {
    auto* frontend = extensions::StorageFrontend::Get(profile_.get());
    if (!frontend) { Finish("Actual extension backend unavailable"); return; }
    frontend->CaptureAuxUiPreferencesForMigration(extension_, base::BindOnce(
        &Controller::CapturedExtension, weak_.GetWeakPtr())); return;
  }''','''  if (cursor_ == frames_.size()) { BeginWorker(); return; }''')
edit('''      !owners || *owners < 0 || *owners > 256 || !capture ||''','''      !owners || *owners <= 0 || *owners > 256 || value.FindBool("sealed") != false || !capture ||''')
method('void Controller::ObservePrepared(', 'void Controller::DrainNext()', '''void Controller::ObservePrepared(size_t index, std::optional<base::DictValue> value, std::string error) {
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
  frontend_begin_pending_ = true;
  frontend->BeginAuxUiMigrationLease(extension_, mojo::WrapCallbackWithDropHandler(
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
''')
edit('''  if (!Inventory(false)) { Finish("Native inventory changed before physical DOM drain"); return; }''','''  if (!Inventory(false) || !FrontendCurrent() || !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("Original source holds changed before physical DOM drain"); return;
  }''')
method('void Controller::ValidateNext()', 'void Controller::Validated(', '''void Controller::ValidateNext() {
  if (!Inventory(false) || !FrontendCurrent() || !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("Original source holds changed after physical DOM drain"); return;
  }
  if (cursor_ == frames_.size()) { ValidateWorker(); return; }
  const size_t index = cursor_++;
  Invoke(index, "auxValidateDraftMigrationCapture", base::ListValue().Append(frames_[index]->lease_id).Append(frames_[index]->revision),
      base::BindOnce(&Controller::Validated, weak_.GetWeakPtr(), index));
}''')
edit('''      value->FindBool("ok") != true || value->FindBool("closed") != true ||
      !Text(*value, "requestId", frames_[index]->request_id)''','''      value->FindBool("ok") != true || value->FindBool("closed") != true || value->FindBool("sealed") != false ||
      !Text(*value, "requestId", frames_[index]->request_id)''')
i=s.index('void Controller::Persist()');edit(s[i:i], '') if False else None
edit('void Controller::Persist() {','''void Controller::ReadWorkerForValidation() {
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
void Controller::Persist() {''')
edit('''  if (!Inventory(false) || !extension_capture_) { Finish("Native capture source was lost"); return; }''','''  if (!Inventory(false) || !FrontendCurrent() || frontend_io_unknown_ || !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("Native capture source holds were lost"); return;
  }''')
edit('extension_capture_->CopyRecordsForNativeJournal()', 'extension_lease_->CopySourceRecords()')
edit('''      .Set("pages", std::move(pages)).Set("extensionRawRecords", std::move(extension_records))''','''      .Set("pages", std::move(pages)).Set("extensionRawRecords", std::move(extension_records))
      .Set("workerPrepareRequestId", worker_request_id_).Set("workerReportJson", worker_report_json_)''')
edit('''  if (!Inventory(false)) { Finish("Native source changed before the next capture frame"); return; }''','''  if (!Inventory(false) || !FrontendCurrent() || frontend_io_unknown_ || !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    Finish("Native source holds changed before the next capture frame"); return;
  }''')
edit('''  if (!Inventory(false)) {
    transfer_->running.store(false); Finish("Native source changed before capture IPC"); return;
  }''','''  if (!Inventory(false) || !FrontendCurrent() || frontend_io_unknown_ || !HasValidUiStorageMigrationWorkerLease(profile_.get())) {
    transfer_->running.store(false); Finish("Native source holds changed before capture IPC"); return;
  }''')
edit('''  observing_cleanup_ = false; error_ = "Retained renderer lease cleanup was observed; no migration activated"; ReplyResult();''','''  observing_cleanup_ = false; error_ = "Retained source cleanup was observed; no migration activated"; CleanupWorker();''')
edit('''  if (value && Text(*value, "format", "aux.ui-draft-capture-lease.v1") && value->FindBool("retained") == false) {''','''  if (value && Text(*value, "format", "aux.ui-draft-capture-lease.v1") &&
      Text(*value, "requestId", frame.request_id) && value->FindBool("retained") == false &&
      value->FindBool("restored") == true &&
      ((value->FindBool("released") == true && Text(*value, "leaseId", frame.lease_id)) ||
       (frame.lease_id.empty() && value->FindBool("noLeaseCreated") == true && Text(*value, "attemptState", "not-started")))) {''')
edit('''  cursor_ = 0; ReleaseNext();
}
void Controller::ReleaseNext()''','''  StartCleanup();
}
void Controller::StartCleanup() {
  // Reopen the ORIGINAL frontend gate before any productive renderer/worker
  // restore. Unknown physical begin/readback keeps the token and all producers.
  if (frontend_begin_pending_ || frontend_io_pending_ || frontend_begin_unknown_) {
    cleanup_unknown_ = true; ReplyResult(); return;
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
void Controller::ReleaseNext()''')
edit('''  if (cursor_ == frames_.size()) { ReplyResult(); return; }''','''  if (cursor_ == frames_.size()) { CleanupWorker(); return; }''')
edit('''      value->FindBool("ok") == true && value->FindBool("released") == true &&
      Text(*value, "leaseId", frames_[index]->lease_id)''','''      value->FindBool("ok") == true && value->FindBool("released") == true && value->FindBool("restored") == true &&
      Text(*value, "leaseId", frames_[index]->lease_id)''')
edit('void Controller::ReplyResult() {','''void Controller::CleanupWorker() {
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
void Controller::ReplyResult() {''')
edit('''  if (!transfer_ || transfer_->complete) extension_capture_.reset();''','''  // Opaque frontend/worker tokens survive any unconfirmed cleanup. Only their
  // actual native release paths above may retire them.''')
edit('''      .Set("rendererCleanupUnknown", cleanup_unknown_).Set("targetImportAvailable", false);''','''      .Set("rendererCleanupUnknown", cleanup_unknown_).Set("workerCleanupPending", worker_attempted_)
      .Set("frontendCleanupPending", !!extension_lease_ || frontend_begin_unknown_ || frontend_io_unknown_)
      .Set("backendWriterClosure", false).Set("targetImportAvailable", false);''')
edit('  for (const auto& frame : frames_) pages.Append(base::DictValue()\n      .Set("nativeDocumentId", frame->document_id.ToString()).Set("sessionNamespace", frame->namespace_id)\n      .Set("requestId", frame->request_id).Set("captureJson", frame->capture_json));', '  for (const auto& frame : frames_) {\n    base::DictValue page;\n    page.Set("nativeDocumentId", frame->document_id.ToString()).Set("sessionNamespace", frame->namespace_id)\n        .Set("requestId", frame->request_id).Set("captureJson", frame->capture_json);\n    pages.Append(std::move(page));\n  }')
edit('  base::DictValue capture = base::DictValue().Set("format", "aux.ui-storage.capture-input.v1")', '  base::DictValue capture;\n  capture.Set("format", "aux.ui-storage.capture-input.v1")')
edit('  auto result = Refused(error_).Set("phase", transfer_ && transfer_->complete ? "captured-unqualified" : "refused-or-unknown")', '  auto result = Refused(error_);\n  result.Set("phase", transfer_ && transfer_->complete ? "captured-unqualified" : "refused-or-unknown")')
files=[]
for path,old,new,edits in [(relative,original,s,anchors)]:
 out=BASE/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(new)
 replay=old
 for anchor in edits: assert replay.count(anchor['find'])==anchor['count'];replay=replay.replace(anchor['find'],anchor['replace'])
 assert replay==new
 files.append({'path':path,'inputSha256':sha(old.encode()),'outputSha256':sha(new.encode()),'output':str(out),'anchors':edits})
header='chrome/browser/aux/ui_storage_migration_controller.h';old=(NATIVE/header).read_text();assert sha(old.encode())=='dfcd4b44cc8a852b6d4f5c184e4a8853d89e5bc298c364af5796e5034a0bbf4d'
find='// Captured/unqualified data and physical uncertainty never authorize activation.'
replace=find+'\n// Preliminary capture joins exact native worker and LOCAL frontend holds; real\n// DOM writer closure and cross-store target/recovery proofs remain separate.'
assert old.count(find)==1;new=old.replace(find,replace);out=BASE/'source'/header;out.write_text(new);files.append({'path':header,'inputSha256':sha(old.encode()),'outputSha256':sha(new.encode()),'output':str(out),'anchors':[{'find':find,'replace':replace,'count':1}]})
deps=[]
for dep in ['extensions/browser/api/storage/storage_frontend.h','extensions/browser/api/storage/storage_frontend.cc']:
 p=ROOT/'docs/integration/proposed/standard-profile-isolation/native-extension-writer-gate-a6/source'/dep
 deps.append({'path':dep,'proposal':'native-extension-writer-gate-a6','commit':'9642937cf','input':str(p),'requiredOutputSha256':sha(p.read_bytes()),'projectionOwnedByRoot':True})
for dep in ['ui_storage_migration_worker.h','ui_storage_migration_worker.cc']:
 p=BASE.parent/'ui-worker-native-control-a1/source/chrome/browser/aux'/dep
 deps.append({'path':'chrome/browser/aux/'+dep,'proposal':'ui-worker-native-control-a1','input':str(p),'requiredOutputSha256':sha(p.read_bytes()),'projectionOwnedByRoot':True})
plan={'format':'aux.ui-worker-controller-integration.source.v1','nativeRoot':str(NATIVE),'files':files,'dependencies':deps,'countedAnchors':sum(len(f['anchors']) for f in files),'nativeTreeUnchanged':True,'nativeCompiled':False,'nativeExecuted':False,'productExecuted':False,'backendWriterClosure':False,'targetApisCalled':False,'runtimeAccepted':False}
(BASE/'source-plan.json').write_text(json.dumps(plan,indent=2)+'\n')
patch=''.join(''.join(difflib.unified_diff((NATIVE/f['path']).read_text().splitlines(True),Path(f['output']).read_text().splitlines(True),fromfile='a/'+f['path'],tofile='b/'+f['path'])) for f in files)
(BASE/'native.patch').write_text(patch)
print(json.dumps({'files':len(files),'countedAnchors':plan['countedAnchors'],'nativeTreeUnchanged':True}))
