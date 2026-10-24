from pathlib import Path
import json,hashlib,difflib
HERE=Path(__file__).resolve().parent;NATIVE=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src');BASE=HERE.parent;sha=lambda b:hashlib.sha256(b).hexdigest();files=[]
def project(path,source,changes):
 original=source.read_text();text=original;anchors=[]
 for find,replace,count in changes:
  assert text.count(find)==count,(path,find[:80],text.count(find),count);text=text.replace(find,replace);anchors.append({'find':find,'replace':replace,'count':count})
 out=HERE/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(text);files.append({'path':path,'input':str(source),'inputSha256':sha(original.encode()),'outputSha256':sha(text.encode()),'output':str(out),'anchors':anchors})
h='extensions/browser/api/storage/storage_frontend.h';cc='extensions/browser/api/storage/storage_frontend.cc';front=BASE/'native-extension-live-restore-a10/source'
project(h,front/h,[
 ('#include <map>','#include <map>\n#include <set>',1),
 ('#include "base/values.h"','#include "base/values.h"\n#include "base/unguessable_token.h"',1),
 ('''    AuxUiMigrationLease(std::shared_ptr<State> state,
        std::unique_ptr<value_store::ValueStore::AuxUiPreferenceCapture> capture);''','''    AuxUiMigrationLease(std::shared_ptr<State> state,
        std::shared_ptr<value_store::ValueStore::AuxUiPreferenceCapture> capture);''',1),
 ('''  using AuxUiMigrationLeaseResult = base::expected<''','''  struct AuxUiMigrationLeaseObservation {
    std::unique_ptr<AuxUiMigrationLease> lease;
    bool preparation_pending = false, aborted_before_target = false;
    bool target_attempted = false;
  };
  using AuxUiMigrationLeaseObservationResult = base::expected<
      AuxUiMigrationLeaseObservation, value_store::ValueStore::Status>;
  using AuxUiMigrationLeaseResult = base::expected<''',1),
 ('''  bool ValidateAuxUiMigrationLease(const AuxUiMigrationLease& lease) const;''','''  // Native nonce is correlation only. No caller Root/Profile/target selector.
  void BeginAuxUiMigrationLease(scoped_refptr<const Extension> extension,
      const base::UnguessableToken& request,
      base::OnceCallback<void(AuxUiMigrationLeaseResult)> callback);
  AuxUiMigrationLeaseObservationResult ObserveAuxUiMigrationLease(
      const base::UnguessableToken& request);
  bool ValidateAuxUiMigrationLease(const AuxUiMigrationLease& lease) const;''',1),
 ('''  std::shared_ptr<AuxUiMigrationLease::State> aux_ui_migration_gate_;''','''  std::shared_ptr<AuxUiMigrationLease::State> aux_ui_migration_gate_;
  std::optional<base::UnguessableToken> aux_ui_aborted_request_;
  scoped_refptr<const Extension> aux_ui_aborted_extension_;
  std::set<base::UnguessableToken> aux_ui_retired_requests_;''',1)
])
project(cc,front/cc,[
 ('''  scoped_refptr<const Extension> extension;
  std::array<std::optional<std::string>, 6> source, target;''','''  scoped_refptr<const Extension> extension;
  base::UnguessableToken request;
  std::shared_ptr<ValueStore::AuxUiPreferenceCapture> capture;
  std::array<std::optional<std::string>, 6> source, target;''',1),
 ('''    std::unique_ptr<ValueStore::AuxUiPreferenceCapture> capture)
    : state_''','''    std::shared_ptr<ValueStore::AuxUiPreferenceCapture> capture)
    : state_''',1),
 ('''void StorageFrontend::BeginAuxUiMigrationLease(
    scoped_refptr<const Extension> extension,
    base::OnceCallback<void(AuxUiMigrationLeaseResult)> callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  if (!extension || aux_ui_migration_gate_ || !CanUseAuxUiMigrationBackend(*extension))''','''void StorageFrontend::BeginAuxUiMigrationLease(
    scoped_refptr<const Extension> extension,
    base::OnceCallback<void(AuxUiMigrationLeaseResult)> callback) {
  BeginAuxUiMigrationLease(std::move(extension), base::UnguessableToken::Create(), std::move(callback));
}
void StorageFrontend::BeginAuxUiMigrationLease(
    scoped_refptr<const Extension> extension, const base::UnguessableToken& request,
    base::OnceCallback<void(AuxUiMigrationLeaseResult)> callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  if (request.is_empty() || aux_ui_retired_requests_.contains(request) ||
      aux_ui_retired_requests_.size() >= 64 || !extension || aux_ui_migration_gate_ ||
      !CanUseAuxUiMigrationBackend(*extension))''',1),
 ('''  state->owner = weak_factory_.GetWeakPtr(); state->extension = extension;''','''  state->owner = weak_factory_.GetWeakPtr(); state->extension = extension;
  state->request = request;''',1),
 ('''        std::move(callback).Run(base::WrapUnique(new AuxUiMigrationLease(
            state, std::move(captured.value()))));''','''        // The original frontend State owns custody BEFORE the consumer reply.
        // A lost/destroyed callback must not strand the actual backend token.
        state->capture = std::move(captured.value());
        std::move(callback).Run(base::WrapUnique(new AuxUiMigrationLease(state, state->capture)));''',1),
 ('''bool StorageFrontend::ValidateAuxUiMigrationLease(const AuxUiMigrationLease& lease) const {''','''StorageFrontend::AuxUiMigrationLeaseObservationResult
StorageFrontend::ObserveAuxUiMigrationLease(const base::UnguessableToken& request) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  if (request.is_empty()) return base::unexpected(ValueStore::Status(ValueStore::OTHER_ERROR,
      "An original native frontend request is required"));
  const auto state = aux_ui_migration_gate_;
  if (state && state->request == request && state->owner.get() == this &&
      CanUseAuxUiMigrationBackend(*state->extension)) {
    AuxUiMigrationLeaseObservation result;
    result.preparation_pending = state->pending;
    result.target_attempted = state->target_attempted;
    if (!state->pending && state->capture)
      result.lease = base::WrapUnique(new AuxUiMigrationLease(state, state->capture));
    return result;
  }
  if (aux_ui_aborted_request_ == request && aux_ui_aborted_extension_ &&
      CanUseAuxUiMigrationBackend(*aux_ui_aborted_extension_)) {
    AuxUiMigrationLeaseObservation result; result.aborted_before_target = true; return result;
  }
  return base::unexpected(ValueStore::Status(ValueStore::OTHER_ERROR,
      "Original frontend request remains unknown; absence is not an abort"));
}
bool StorageFrontend::ValidateAuxUiMigrationLease(const AuxUiMigrationLease& lease) const {''',1),
 ('''  aux_ui_migration_gate_.reset();
  auto pending = std::move(state->deferred);''','''  aux_ui_migration_gate_.reset();
  aux_ui_retired_requests_.insert(state->request);
  if (!state->target_attempted) {
    // Past gate retirement only, never current writer-drain/readiness. Original
    // ordinary callbacks below keep their real completion/ordering semantics.
    aux_ui_aborted_request_ = state->request;
    aux_ui_aborted_extension_ = state->extension;
  }
  auto pending = std::move(state->deferred);''',1)
])
path='chrome/browser/aux/ui_storage_migration_controller.cc';prior=BASE/'native-document-token-bridge-a11b/source'/path
project(path,prior,[
 ('''  std::unique_ptr<ExtensionLease> extension_lease_;''','''  std::unique_ptr<ExtensionLease> extension_lease_;
  base::UnguessableToken frontend_request_id_;''',1),
 ('''  frontend_begin_pending_ = true;
  frontend->BeginAuxUiMigrationLease(extension_, mojo::WrapCallbackWithDropHandler(''','''  frontend_request_id_ = base::UnguessableToken::Create();
  frontend_begin_pending_ = true;
  frontend->BeginAuxUiMigrationLease(extension_, frontend_request_id_, mojo::WrapCallbackWithDropHandler(''',1),
 ('''  if (frontend_begin_pending_ || frontend_io_pending_ || frontend_begin_unknown_) {
    cleanup_unknown_ = true; ReplyResult(); return;
  }
  if (extension_lease_)''','''  if (frontend_begin_pending_ || frontend_io_pending_) {
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
  if (extension_lease_)''',1)
])
plan={'format':'aux.native-frontend-observation.source.v1','files':files,'countedAnchors':sum(len(f['anchors']) for f in files),'priorFrontend':'native-extension-live-restore-a10','priorController':'native-document-token-bridge-a11b','nativeTreeUnchanged':True,'nativeCompiled':False,'nativeExecuted':False,'productExecuted':False,'backendWriterClosure':False,'targetApisCalled':False,'runtimeAccepted':False}
(HERE/'source-plan.json').write_text(json.dumps(plan,indent=2)+'\n');(HERE/'native.patch').write_text(''.join(''.join(difflib.unified_diff(Path(f['input']).read_text().splitlines(True),Path(f['output']).read_text().splitlines(True),fromfile='a/'+f['path'],tofile='b/'+f['path'])) for f in files));print(json.dumps({'files':len(files),'countedAnchors':plan['countedAnchors']}))
