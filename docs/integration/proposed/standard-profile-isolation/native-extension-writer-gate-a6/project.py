"""Actual StorageFrontend-owned closure/opaque capture; no native mutation."""
import difflib
import hashlib
import json
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha=lambda b:hashlib.sha256(b).hexdigest()
files=[];patch=[]
def project(name,edits):
 original=(ROOT/name).read_bytes();text=original.decode();anchors=[]
 for before,after in edits:
  assert text.count(before)==1,(name,before[:110],text.count(before))
  text=text.replace(before,after);anchors.append({'find':before,'replace':after,'count':1})
 target=HERE/'source'/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(text)
 files.append({'path':name,'inputSha256':sha(original),'outputSha256':sha(text.encode()),'output':str(target),'anchors':anchors})
 patch.extend(difflib.unified_diff(original.decode().splitlines(True),text.splitlines(True),fromfile='a/'+name,tofile='b/'+name))
project('extensions/browser/api/storage/storage_frontend.h',[
 ('#include <map>','#include <array>\n#include <map>\n#include <optional>\n#include <vector>'),
 ('  // Deletes the settings for the given `extension_id` and synchronously invokes',
  (HERE/'lease-declarations.inc').read_text().rstrip()+'\n\n'+'  // Deletes the settings for the given `extension_id` and synchronously invokes'),
 ('  bool CanUseAuxUiMigrationBackend(const Extension& extension) const;',
  '''  bool CanUseAuxUiMigrationBackend(const Extension& extension) const;
  void RunWithStorageUngated(scoped_refptr<const Extension> extension,
      settings_namespace::Namespace settings_namespace, ValueStoreCache::StorageCallback callback);
  void CaptureAuxUiPreferencesUngated(scoped_refptr<const Extension> extension,
      AuxUiPreferenceCaptureCallback callback);
  void CommitAuxUiPreferencesUngated(scoped_refptr<const Extension> extension,
      std::unique_ptr<value_store::ValueStore::AuxUiPreferenceCapture> capture,
      base::OnceCallback<void(value_store::ValueStore::Status)> callback);
  void ReleaseAuxUiMigrationGate(std::shared_ptr<AuxUiMigrationLease::State> state);'''),
 ('  base::WeakPtrFactory<StorageFrontend> weak_factory_{this};',
  '  std::shared_ptr<AuxUiMigrationLease::State> aux_ui_migration_gate_;\n\n  base::WeakPtrFactory<StorageFrontend> weak_factory_{this};'),
])
project('extensions/browser/api/storage/storage_frontend.cc',[
 ('bool StorageFrontend::CanUseAuxUiMigrationBackend(',
  (HERE/'lease-definitions.inc').read_text().rstrip()+'\n\n'+'bool StorageFrontend::CanUseAuxUiMigrationBackend('),
 ('void StorageFrontend::CaptureAuxUiPreferencesForMigration(\n',
  '''void StorageFrontend::CaptureAuxUiPreferencesForMigration(
    scoped_refptr<const Extension> extension, AuxUiPreferenceCaptureCallback callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  if (aux_ui_migration_gate_) {
    std::move(callback).Run(base::unexpected(ValueStore::Status(
        ValueStore::OTHER_ERROR, "Actual Aux writer lease already owns this backend"))); return;
  }
  CaptureAuxUiPreferencesUngated(std::move(extension), std::move(callback));
}
void StorageFrontend::CaptureAuxUiPreferencesUngated(
'''),
 ('void StorageFrontend::CommitAuxUiPreferenceMigration(\n',
  '''void StorageFrontend::CommitAuxUiPreferenceMigration(
    scoped_refptr<const Extension> extension,
    std::unique_ptr<ValueStore::AuxUiPreferenceCapture> capture,
    base::OnceCallback<void(ValueStore::Status)> callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  if (aux_ui_migration_gate_) {
    std::move(callback).Run(ValueStore::Status(ValueStore::OTHER_ERROR,
        "Actual Aux writer lease already owns this backend")); return;
  }
  CommitAuxUiPreferencesUngated(std::move(extension), std::move(capture), std::move(callback));
}
void StorageFrontend::CommitAuxUiPreferencesUngated(
'''),
 ('  RunWithStorage(extension, settings_namespace::LOCAL, base::BindOnce(\n      [](AuxUiPreferenceCaptureCallback callback, ValueStore* storage)',
  '  RunWithStorageUngated(extension, settings_namespace::LOCAL, base::BindOnce(\n      [](AuxUiPreferenceCaptureCallback callback, ValueStore* storage)'),
 ('  RunWithStorage(extension, settings_namespace::LOCAL, base::BindOnce(\n      [](std::unique_ptr<ValueStore::AuxUiPreferenceCapture> capture,',
  '  RunWithStorageUngated(extension, settings_namespace::LOCAL, base::BindOnce(\n      [](std::unique_ptr<ValueStore::AuxUiPreferenceCapture> capture,'),
 ('void StorageFrontend::RunWithStorage(\n',
  '''void StorageFrontend::RunWithStorage(
    scoped_refptr<const Extension> extension,
    settings_namespace::Namespace settings_namespace,
    ValueStoreCache::StorageCallback callback) {
  DCHECK_CURRENTLY_ON(BrowserThread::UI);
  CHECK(extension.get());
  if (aux_ui_migration_gate_ && extension->id() == "gokkffaiccpmoeodpmeamcjajcagjmkm" &&
      settings_namespace == extensions::settings_namespace::LOCAL) {
    aux_ui_migration_gate_->tainted = true;
    // Preserve the original operation and its real callback. The source pause
    // must close producers before this gate; attempted new work invalidates
    // qualification and cannot silently execute against a captured old store.
    aux_ui_migration_gate_->deferred.push_back(base::BindOnce(
        &StorageFrontend::RunWithStorage, weak_factory_.GetWeakPtr(),
        std::move(extension), settings_namespace, std::move(callback)));
    return;
  }
  RunWithStorageUngated(std::move(extension), settings_namespace, std::move(callback));
}
void StorageFrontend::RunWithStorageUngated(
'''),
 ('  auto subtask_done_callback =\n      base::BarrierClosure(caches_.size(), std::move(done_callback));',
  '''  if (aux_ui_migration_gate_ && extension_id == "gokkffaiccpmoeodpmeamcjajcagjmkm") {
    aux_ui_migration_gate_->tainted = true;
    aux_ui_migration_gate_->deferred.push_back(base::BindOnce(
        &StorageFrontend::DeleteStorageSoon, weak_factory_.GetWeakPtr(), extension_id,
        std::move(done_callback)));
    return;
  }
  auto subtask_done_callback =
      base::BarrierClosure(caches_.size(), std::move(done_callback));'''),
])
facts=[]
for name,expected in {
 'extensions/browser/api/storage/backend_task_runner.cc':['  return GetExtensionFileTaskRunner();'],
 'extensions/browser/api/storage/local_value_store_cache.cc':['void LocalValueStoreCache::RunWithValueStoreForExtension(', '    std::move(callback).Run(storage);'],
 'components/value_store/leveldb_value_store.cc':['    if (current != capture->records[i]) {','      batch.Put(kAuxUiPreferenceKeys[i + 1], *capture->records[i]);','  options.sync = true;'],
}.items():
 data=(ROOT/name).read_bytes();text=data.decode();anchors=[]
 for anchor in expected:
  assert text.count(anchor)==1,(name,anchor,text.count(anchor))
  anchors.append({'find':anchor,'count':1})
 facts.append({'path':name,'sha256':sha(data),'anchors':anchors})
result={'format':'aux.native-extension-writer-gate.source.v1','nativeRoot':str(ROOT),'files':files,
 'consumedNativeQueueAndBackend':facts,
 'nativeCheckoutChanged':False,'nativeCompiled':False,'productExecuted':False,
 'fullProfileWriterClosure':False,'directoryDurabilityProven':False,'crossStoreRecoveryImplemented':False,
 'activationAuthorized':False}
(HERE/'source-plan.json').write_text(json.dumps(result,indent=2)+'\n');(HERE/'native.patch').write_text(''.join(patch))
print(json.dumps({'files':len(files),'countedAnchors':sum(len(r['anchors']) for r in files),'activationAuthorized':False}))
