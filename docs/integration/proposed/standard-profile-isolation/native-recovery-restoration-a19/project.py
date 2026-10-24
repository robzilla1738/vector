"""Consume separate journal-original cache custody from real recovery backend."""
import difflib,hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent;PARENT=HERE.parent
sha=lambda data:hashlib.sha256(data).hexdigest()
changes={
 'components/services/storage/dom_storage/async_dom_storage_database.h':('native-cache-recovery-original-a18',[(
  '    bool published = false;\n  };',
  '    bool published = false;\n    bool recovery_prepared = false;\n    bool recovery_restored = false;\n  };'),(
  '    bool known_source_target_mixture = false;',
  '    bool known_source_target_mixture = false;\n    bool recovery_cache_prepared = false;\n    bool recovery_original_restored = false;'),(
  '  void CommitAuxUiMigrationLease(AuxUiMigrationLease& lease,',
  '''  void PrepareAuxUiMigrationRecoveryCaches(AuxUiMigrationLease& lease, AuxUiReadCallback callback);
  void ReadAuxUiMigrationRecovery(AuxUiMigrationLease& lease, AuxUiReadCallback callback);
  // Actual verified controller must first persist explicit recovery intent
  // and join fresh editor/worker/backend ownership. No payload grants that.
  void RestoreAuxUiMigrationRecovery(AuxUiMigrationLease& lease, AuxUiReadCallback callback);
  void CommitAuxUiMigrationLease(AuxUiMigrationLease& lease,'''),(
  '''  void RunAuxUiBackend(std::shared_ptr<AuxUiMigrationLease::State> state, int operation,
      std::vector<AuxUiTargetMap> targets, AuxUiReadCallback callback);''',
  '''  void RunAuxUiBackend(std::shared_ptr<AuxUiMigrationLease::State> state, int operation,
      std::vector<AuxUiTargetMap> targets, AuxUiReadCallback callback, bool recovery = false);'''),(
  '  void CheckedAuxUiRecovery(std::shared_ptr<AuxUiMigrationLease::State> state,',
  '''  void RunAuxUiRecoveryAction(AuxUiMigrationLease& lease, int operation, AuxUiReadCallback callback);
  void CheckedAuxUiRecoveryAction(std::shared_ptr<AuxUiMigrationLease::State> state,
      int operation, AuxUiReadCallback callback, DbStatus status);
  void BackendAuxUiRecoveryAction(std::shared_ptr<AuxUiMigrationLease::State> state,
      int operation, AuxUiReadCallback callback, StatusOr<AuxUiSnapshot> result);
  void CompletedAuxUiRecoveryAction(std::shared_ptr<AuxUiMigrationLease::State> state,
      int operation, AuxUiSnapshot snapshot, AuxUiReadCallback callback, DbStatus status);
  void CheckedAuxUiRecovery(std::shared_ptr<AuxUiMigrationLease::State> state,''')]),
 'components/services/storage/dom_storage/async_dom_storage_database.cc':('native-recovery-requalification-a17b',[(
  '  std::string recovery_descriptor_sha256;',
  '''  std::string recovery_descriptor_sha256;
  bool recovery_requalified = false;
  bool recovery_cache_prepared = false;
  bool recovery_write_attempted = false;
  bool recovery_original_restored = false;'''),(
  '  if (round->operation == AuxUiCacheOperation::kStage && !map) {',
  '''  if ((round->operation == AuxUiCacheOperation::kStage ||
       round->operation == AuxUiCacheOperation::kRecoveryStage ||
       round->operation == AuxUiCacheOperation::kRecoveryRestore) && !map) {'''),(
  '''              round->operation == AuxUiCacheOperation::kRestore)) {''',
  '''              round->operation == AuxUiCacheOperation::kRestore ||
              round->operation == AuxUiCacheOperation::kRecoveryRestore)) {'''),(
  '''    std::vector<AuxUiTargetMap> targets, AuxUiReadCallback callback) {
  const bool local = storage_type_ == StorageType::kLocalStorage;''',
  '''    std::vector<AuxUiTargetMap> targets, AuxUiReadCallback callback, bool recovery) {
  if (recovery && (operation != 1 && operation != 4)) {
    std::move(callback).Run(base::unexpected(DbStatus::IOError("Recovery cannot replay a target write"))); return;
  }
  const bool local = storage_type_ == StorageType::kLocalStorage;'''),(
  '''      }, state->backend, aux_migration_write_status_, local, is_sqlite_, operation, std::move(targets), std::move(guarded)));''',
  '''      }, recovery ? state->recovery_backend : state->backend, aux_migration_write_status_, local, is_sqlite_, operation, std::move(targets), std::move(guarded)));'''),(
  '''        if (!owner || !owner->CurrentAuxUiMigrationWriters(state) || state->tainted)
          result = base::unexpected(DbStatus::IOError("Actual fresh recovery owner changed"));
        std::move(callback).Run(std::move(result));''',
  '''        if (!owner || !owner->CurrentAuxUiMigrationWriters(state) || state->tainted)
          result = base::unexpected(DbStatus::IOError("Actual fresh recovery owner changed"));
        state->recovery_requalified = result.has_value();
        std::move(callback).Run(std::move(result));'''),(
  'void AsyncDomStorageDatabase::RunAuxUiMigrationOperation(AuxUiMigrationLease& lease,',
  (HERE/'owner.inc').read_text()+'void AsyncDomStorageDatabase::RunAuxUiMigrationOperation(AuxUiMigrationLease& lease,'),(
  '''  if (!CurrentAuxUiMigrationWriters(state) || state->pending || !before_reopen ||''',
  '''  if (!CurrentAuxUiMigrationWriters(state) || state->pending || !before_reopen ||
      (state->recovery_write_attempted && !state->recovery_original_restored) ||''')]),
 'components/services/storage/dom_storage/storage_area_impl.cc':('native-cache-recovery-original-a18',[(
  '      view.namespace_id = participant->namespace_id(); view.published = report->published;',
  '''      view.namespace_id = participant->namespace_id(); view.published = report->published;
      view.recovery_prepared = report->recovery_prepared;
      view.recovery_restored = report->recovery_restored;''')]),
}
rows=[];patch=[]
for path,(base,edits) in changes.items():
 root=PARENT/base/'source';data=(root/path).read_bytes();text=data.decode();anchors=[]
 for before,after in edits:
  assert text.count(before)==1,(path,before[:90],text.count(before))
  text=text.replace(before,after);anchors.append({'find':before,'replace':after,'count':1})
 out=HERE/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(text)
 rows.append({'path':path,'inputRoot':str(root),'inputSha256':sha(data),'outputSha256':sha(text.encode()),'output':str(out),'anchors':anchors})
 patch.extend(difflib.unified_diff(data.decode().splitlines(True),text.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.native-recovery-restoration.source.v1','files':rows,'nativeCheckoutChanged':False,'nativeCompiled':False,'productExecuted':False,'runtimeAcceptance':False},indent=2)+'\n')
(HERE/'native.patch').write_text(''.join(patch))
print(json.dumps({'files':len(rows),'countedAnchors':sum(len(r['anchors']) for r in rows)}))
