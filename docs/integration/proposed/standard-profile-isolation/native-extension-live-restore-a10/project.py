"""Native retained live source/target transaction; shared checkout read-only."""
from pathlib import Path
import json,hashlib,difflib
HERE=Path(__file__).resolve().parent;NATIVE=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src');sha=lambda x:hashlib.sha256(x).hexdigest()
files=[]
def project(path,transform):
 original=(NATIVE/path).read_text();s=original;anchors=[]
 def edit(find,replace,count=1):
  nonlocal s
  assert s.count(find)==count,(path,find[:80],s.count(find),count);s=s.replace(find,replace);anchors.append({'find':find,'replace':replace,'count':count})
 transform(edit)
 out=HERE/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(s)
 files.append({'path':path,'inputSha256':sha(original.encode()),'outputSha256':sha(s.encode()),'output':str(out),'anchors':anchors})
methods='''  virtual AuxUiPreferenceReadbackResult CommitRetainedAuxUiPreferenceMigration(
      std::shared_ptr<AuxUiPreferenceCapture> capture);
  virtual AuxUiPreferenceReadbackResult ReadRetainedAuxUiPreferenceMigration(
      std::shared_ptr<AuxUiPreferenceCapture> capture);
  virtual AuxUiPreferenceReadbackResult RestoreRetainedAuxUiPreferenceMigration(
      std::shared_ptr<AuxUiPreferenceCapture> capture);
'''
def value_h(e):
 e('''    std::array<std::optional<std::string>, 6> CopyRecordsForNativeJournal() const;''','''    std::array<std::optional<std::string>, 6> CopyRecordsForNativeJournal() const;
    std::array<std::optional<std::string>, 6> CopyTargetRecordsForNativeJournal() const;''')
 e('''    std::array<std::optional<std::string>, 6> records;
  };''','''    std::array<std::optional<std::string>, 6> records;
    bool retained_target_attempted = false, retained_restore_attempted = false;
    bool retained_observation_known = false;
  };''')
 e('''  virtual Status CommitAuxUiPreferenceMigration(
      std::unique_ptr<AuxUiPreferenceCapture> capture);''','''  virtual Status CommitAuxUiPreferenceMigration(
      std::unique_ptr<AuxUiPreferenceCapture> capture);

  using AuxUiPreferenceRecords = std::array<std::optional<std::string>, 6>;
  struct AuxUiPreferenceReadback {
    AuxUiPreferenceRecords records;
    bool matches_source = false, matches_target = false, file_data_synced = false;
    bool target_attempted = false, restore_attempted = false;
  };
  using AuxUiPreferenceReadbackResult = base::expected<AuxUiPreferenceReadback, Status>;
  // Distinct native live-owner path. Construction stays private; source records
  // are immutable, own transaction operations retain custody, and ordinary
  // backend operations still invalidate the original owner weak reference.
'''+methods)
project('components/value_store/value_store.h',value_h)
def value_cc(e):
 e('''ValueStore::AuxUiPreferenceCaptureResult
ValueStore::CaptureAuxUiPreferencesForMigration()''','''std::array<std::optional<std::string>, 6>
ValueStore::AuxUiPreferenceCapture::CopyTargetRecordsForNativeJournal() const {
  auto target = records;
  for (size_t index = 0; index < target.size(); index += 2) if (records[index]) {
    target[index + 1] = records[index]; target[index].reset();
  }
  return target;
}

ValueStore::AuxUiPreferenceCaptureResult
ValueStore::CaptureAuxUiPreferencesForMigration()''')
 tail=''
 for name in ['Commit','Read','Restore']:
  tail+='''ValueStore::AuxUiPreferenceReadbackResult
ValueStore::'''+name+'''RetainedAuxUiPreferenceMigration(std::shared_ptr<AuxUiPreferenceCapture> capture) {
  return base::unexpected(Status(OTHER_ERROR, "Retained Aux migration backend unsupported"));
}
'''
 e('}  // namespace value_store',tail+'\n}  // namespace value_store')
project('components/value_store/value_store.cc',value_cc)
def level_h(e):
 e('''  // Write directly to the backing levelDB. Only used for testing to cause''',methods.replace('virtual ','').replace('capture);','capture) override;')+'''
  // Write directly to the backing levelDB. Only used for testing to cause''')
 e('''  // Adds a setting to a WriteBatch, and logs the change in |changes|.''','''  AuxUiPreferenceReadbackResult ApplyRetainedAuxUiPreferenceMigration(
      std::shared_ptr<AuxUiPreferenceCapture> capture, bool restore, bool read_only);

  // Adds a setting to a WriteBatch, and logs the change in |changes|.''')
project('components/value_store/leveldb_value_store.h',level_h)
project('components/value_store/leveldb_value_store.cc',lambda e:e('bool LeveldbValueStore::WriteToDbForTest(', (HERE/'backend-definitions.inc').read_text()+'\nbool LeveldbValueStore::WriteToDbForTest('))
for stem,cls in [('weak_unlimited_settings_storage','WeakUnlimitedSettingsStorage'),('settings_storage_quota_enforcer','SettingsStorageQuotaEnforcer')]:
 project('extensions/browser/api/storage/'+stem+'.h',lambda e:e('''  Status CommitAuxUiPreferenceMigration(
      std::unique_ptr<AuxUiPreferenceCapture> capture) override;''','''  Status CommitAuxUiPreferenceMigration(
      std::unique_ptr<AuxUiPreferenceCapture> capture) override;
'''+methods.replace('virtual ','').replace('capture);','capture) override;')))
 def wrap(e,cls=cls):
  text=''
  for name in ['Commit','Read','Restore']:
   text+='ValueStore::AuxUiPreferenceReadbackResult\n'+cls+'::'+name+'RetainedAuxUiPreferenceMigration(\n    std::shared_ptr<AuxUiPreferenceCapture> capture) {\n'
   if cls=='SettingsStorageQuotaEnforcer' and name!='Read':text+='  usage_calculated_ = false; used_total_ = 0; used_per_setting_.clear();\n'
   text+='  return delegate_->'+name+'RetainedAuxUiPreferenceMigration(std::move(capture));\n}\n'
  e('}  // namespace extensions',text+'\n}  // namespace extensions')
 project('extensions/browser/api/storage/'+stem+'.cc',wrap)
def frontend_h(e):
 e('''    std::array<std::optional<std::string>, 6> CopySourceRecords() const;''','''    std::array<std::optional<std::string>, 6> CopySourceRecords() const;
    std::array<std::optional<std::string>, 6> CopyTargetRecords() const;''')
 e('''    std::unique_ptr<value_store::ValueStore::AuxUiPreferenceCapture> capture_;''','''    std::shared_ptr<value_store::ValueStore::AuxUiPreferenceCapture> capture_;''')
 e('''    bool ordinary_work_queued = false;''','''    bool ordinary_work_queued = false;
    bool readback_file_data_synced = false, source_file_data_synced = false;
    bool restore_attempted = false;''')
 e('''  void ReadbackAuxUiMigrationLease(AuxUiMigrationLease& lease,''','''  void RestoreAuxUiMigrationLease(AuxUiMigrationLease& lease,
      base::OnceCallback<void(value_store::ValueStore::Status)> callback);
  void ReadbackAuxUiMigrationLease(AuxUiMigrationLease& lease,''')
 e('''  void ReleaseAuxUiMigrationGate(std::shared_ptr<AuxUiMigrationLease::State> state);''','''  void ReleaseAuxUiMigrationGate(std::shared_ptr<AuxUiMigrationLease::State> state);
  enum class AuxUiRetainedOperation { kCommit, kRead, kRestore };
  using AuxUiRetainedCallback = base::OnceCallback<void(value_store::ValueStore::AuxUiPreferenceReadbackResult)>;
  void RunRetainedAuxUiPreferencesUngated(scoped_refptr<const Extension> extension,
      std::shared_ptr<value_store::ValueStore::AuxUiPreferenceCapture> capture,
      AuxUiRetainedOperation operation, AuxUiRetainedCallback callback);''')
project('extensions/browser/api/storage/storage_frontend.h',frontend_h)
def frontend_cc(e):
 e('''  bool target_file_data_synced = false, target_readback_matches = false;''','''  bool target_file_data_synced = false, target_readback_matches = false;
  bool restore_attempted = false, source_file_data_synced = false, source_readback_matches = false;''')
 e('''StorageFrontend::AuxUiMigrationReadback::AuxUiMigrationReadback() = default;''','''std::array<std::optional<std::string>, 6>
StorageFrontend::AuxUiMigrationLease::CopyTargetRecords() const {
  return state_ ? state_->target : std::array<std::optional<std::string>, 6>();
}
StorageFrontend::AuxUiMigrationReadback::AuxUiMigrationReadback() = default;''')
 e('''        state->target = state->source;
        // This is the exact pair order of the actual backend's six-key token.
        // Preserve original JSON bytes and explicit false; never parse/rewrite.
        for (size_t i = 0; i < state->target.size(); i += 2) if (state->source[i]) {
          state->target[i + 1] = state->source[i]; state->target[i].reset();
        }''','''        state->target = captured.value()->CopyTargetRecordsForNativeJournal();''')
 e('''  state->target_file_data_synced = false; state->target_readback_matches = false;
  CommitAuxUiPreferencesUngated(state->extension, std::move(lease.capture_), base::BindOnce(''','''  state->target_file_data_synced = false; state->target_readback_matches = false;
  state->source_file_data_synced = false; state->source_readback_matches = false;
  RunRetainedAuxUiPreferencesUngated(state->extension, lease.capture_, AuxUiRetainedOperation::kCommit, base::BindOnce(''')
 e('''         base::OnceCallback<void(ValueStore::Status)> callback, ValueStore::Status status) {
        state->pending = false;
        state->target_file_data_synced = status.ok();''','''         base::OnceCallback<void(ValueStore::Status)> callback,
         ValueStore::AuxUiPreferenceReadbackResult result) {
        state->pending = false;
        state->target_file_data_synced = result.has_value() && result->file_data_synced && result->matches_target;
        state->target_readback_matches = state->target_file_data_synced && result->records == state->target;
        ValueStore::Status status = state->target_readback_matches ? ValueStore::Status() :
            ValueStore::Status(ValueStore::OTHER_ERROR, "Actual retained Aux target/readback remains unknown");''')
 e('''  state->pending = true;
  CaptureAuxUiPreferencesUngated(state->extension, base::BindOnce(''','''  state->pending = true;
  state->source_file_data_synced = false; state->source_readback_matches = false;
  state->target_file_data_synced = false; state->target_readback_matches = false;
  RunRetainedAuxUiPreferencesUngated(state->extension, lease.capture_, AuxUiRetainedOperation::kRead, base::BindOnce(''')
 e('''         ValueStore::AuxUiPreferenceCaptureResult captured) {
        state->pending = false;
        if (!owner || owner->aux_ui_migration_gate_ != state ||
            !owner->CanUseAuxUiMigrationBackend(*state->extension) || !captured.has_value()) {
          state->target_readback_matches = false;''','''         ValueStore::AuxUiPreferenceReadbackResult captured) {
        state->pending = false;
        if (!owner || owner->aux_ui_migration_gate_ != state ||
            !owner->CanUseAuxUiMigrationBackend(*state->extension) || !captured.has_value()) {
          state->target_readback_matches = false;''')
 e('''        result.records = captured.value()->CopyRecordsForNativeJournal();''','''        result.records = captured->records;''')
 e('''        result.commit_file_data_synced = state->target_file_data_synced;
        result.ordinary_work_queued = state->tainted || !state->deferred.empty();
        state->target_readback_matches = result.matches_target;''','''        result.readback_file_data_synced = captured->file_data_synced;
        result.source_file_data_synced = captured->file_data_synced && result.matches_source;
        result.restore_attempted = state->restore_attempted || captured->restore_attempted;
        state->source_file_data_synced = result.source_file_data_synced;
        state->source_readback_matches = result.matches_source && captured->file_data_synced;
        state->target_file_data_synced = result.matches_target && captured->file_data_synced && state->target_attempted;
        state->target_readback_matches = result.matches_target && captured->file_data_synced;
        result.commit_file_data_synced = state->target_file_data_synced;
        result.ordinary_work_queued = state->tainted || !state->deferred.empty();''')
 e('''      (state->target_attempted && (!CanUseAuxUiMigrationBackend(*state->extension) ||
       !state->target_file_data_synced ||
       !state->target_readback_matches || state->tainted || !state->deferred.empty()))) return false;''','''      (state->target_attempted && (!CanUseAuxUiMigrationBackend(*state->extension) ||
       !((state->source_file_data_synced && state->source_readback_matches) ||
         (state->target_file_data_synced && state->target_readback_matches &&
          !state->restore_attempted && !state->tainted && state->deferred.empty()))))) return false;''')
 e('''void StorageFrontend::ReleaseAuxUiMigrationGate(''', (HERE/'frontend-definitions.inc').read_text()+'''\nvoid StorageFrontend::ReleaseAuxUiMigrationGate(''')
project('extensions/browser/api/storage/storage_frontend.cc',frontend_cc)
plan={'format':'aux.native-extension-live-restore.source.v1','nativeRoot':str(NATIVE),'files':files,'countedAnchors':sum(len(f['anchors']) for f in files),'nativeTreeUnchanged':True,'nativeCompiled':False,'nativeExecuted':False,'productExecuted':False,'restartRecoveryImplemented':False,'runtimeAccepted':False}
(HERE/'source-plan.json').write_text(json.dumps(plan,indent=2)+'\n');(HERE/'native.patch').write_text(''.join(''.join(difflib.unified_diff((NATIVE/f['path']).read_text().splitlines(True),Path(f['output']).read_text().splitlines(True),fromfile='a/'+f['path'],tofile='b/'+f['path'])) for f in files));print(json.dumps({'files':len(files),'countedAnchors':plan['countedAnchors'],'nativeTreeUnchanged':True}))
