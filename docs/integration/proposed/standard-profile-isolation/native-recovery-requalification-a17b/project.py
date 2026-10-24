"""Pin real fresh-owner recovery observation without rebasing its originals."""
import difflib,hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
BASE=HERE.parent/'native-known-mixture-observation-a17d'/'source'
sha=lambda data:hashlib.sha256(data).hexdigest()
changes={
 'components/services/storage/dom_storage/async_dom_storage_database.h':[(
  '  void CommitAuxUiMigrationLease(AuxUiMigrationLease& lease,',
  '''  // Only the native verified-journal controller supplies this descriptor.
  // Reacquires no authority and never replaces this fresh lease's originals.
  void RequalifyAuxUiMigrationLease(AuxUiMigrationLease& lease,
      AuxUiSnapshot recorded, AuxUiReadCallback callback);
  void CommitAuxUiMigrationLease(AuxUiMigrationLease& lease,'''),(
  '  void CheckedAuxUiOperation(std::shared_ptr<AuxUiMigrationLease::State> state, int operation,',
  '''  void CheckedAuxUiRecovery(std::shared_ptr<AuxUiMigrationLease::State> state,
      AuxUiSnapshot recorded, AuxUiReadCallback callback, DbStatus status);
  void CheckedAuxUiOperation(std::shared_ptr<AuxUiMigrationLease::State> state, int operation,''')],
 'components/services/storage/dom_storage/async_dom_storage_database.cc':[(
  '}  // namespace\n\nstruct AsyncDomStorageDatabase::AuxUiMigrationLease::State {',
  (HERE/'reconstruct.inc').read_text()+'}  // namespace\n\nstruct AsyncDomStorageDatabase::AuxUiMigrationLease::State {'),(
  '  std::shared_ptr<AuxDomCapture> backend = std::make_shared<AuxDomCapture>();',
  '''  std::shared_ptr<AuxDomCapture> backend = std::make_shared<AuxDomCapture>();
  // Distinct from the fresh current source. An observation cannot turn this
  // into the old transaction's original cache/target authority.
  std::shared_ptr<AuxDomCapture> recovery_backend;
  std::string recovery_descriptor_sha256;'''),(
  'void AsyncDomStorageDatabase::RunAuxUiMigrationOperation(AuxUiMigrationLease& lease,',
  (HERE/'owner.inc').read_text()+'void AsyncDomStorageDatabase::RunAuxUiMigrationOperation(AuxUiMigrationLease& lease,'),(
  '''  if (!CurrentAuxUiMigrationWriters(state) || state->pending ||
      ((operation == 2 || operation == 3 || operation == 5) &&''',
  '''  if (!CurrentAuxUiMigrationWriters(state) || state->pending ||
      (operation >= 2 && operation <= 5 && !state->recovery_descriptor_sha256.empty()) ||
      ((operation == 2 || operation == 3 || operation == 5) &&''')],
}
rows=[];patch=[]
for path,edits in changes.items():
 data=(BASE/path).read_bytes();text=data.decode();anchors=[]
 for before,after in edits:
  assert text.count(before)==1,(path,before[:80],text.count(before))
  text=text.replace(before,after);anchors.append({'find':before,'replace':after,'count':1})
 out=HERE/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(text)
 rows.append({'path':path,'inputRoot':str(BASE),'inputSha256':sha(data),'outputSha256':sha(text.encode()),'output':str(out),'anchors':anchors})
 patch.extend(difflib.unified_diff(data.decode().splitlines(True),text.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.native-recovery-requalification.source.v1','files':rows,'nativeCheckoutChanged':False,'nativeCompiled':False,'productExecuted':False,'runtimeAcceptance':False,'recoveryWritesImplemented':False},indent=2)+'\n')
(HERE/'native.patch').write_text(''.join(patch))
print(json.dumps({'files':len(rows),'countedAnchors':sum(len(r['anchors']) for r in rows)}))
