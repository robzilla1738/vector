"""Prove original physical absence without remapping or replaying any writer."""
import difflib,hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent;PARENT=HERE.parent
BASE=PARENT/'native-leveldb-absence-a25'/'source'
sha=lambda data:hashlib.sha256(data).hexdigest()
changes={
 'components/services/storage/dom_storage/async_dom_storage_database.h':[(
  '    std::optional<int64_t> allocated_map_id;\n    bool allocation_observed = false;',
  '''    std::optional<int64_t> allocated_map_id;
    // Read-only absence cancellation observes the fresh identity separately;
    // it never rebinds or treats it as the recorded original map ID.
    std::optional<int64_t> fresh_map_id;
    bool allocation_observed = false;'''),(
  '    bool recovery_original_restored = false;\n    bool file_data_synced = false;',
  '''    bool recovery_original_restored = false;
    bool source_absence_cancellation = false;
    bool file_data_synced = false;''')],
 'components/services/storage/dom_storage/async_dom_storage_database.cc':[(
  '}  // namespace\n\nstruct AsyncDomStorageDatabase::AuxUiMigrationLease::State {',
  (HERE/'observe.inc').read_text()+'}  // namespace\n\nstruct AsyncDomStorageDatabase::AuxUiMigrationLease::State {'),(
  '        state->recovery_requalified = result.has_value();',
  '        state->recovery_requalified = result.has_value() && !result->source_absence_cancellation;'),(
  '''        std::move(callback).Run(AuxRequalifyRecordedCapture(*fresh, *recovery, recorded, local, sqlite, database));''',
  '''        auto result = AuxRequalifyRecordedCapture(*fresh, *recovery, recorded, local, sqlite, database);
        if (!result.has_value()) {
          // Proven unchanged original absence can cancel an interrupted
          // intent without knowing or recreating its never-written target.
          // This produces no recovery capsule or restored-identity claim.
          auto source = AuxObserveOriginalAbsence(*fresh, recorded, local, database);
          if (source.has_value()) result = std::move(source);
        }
        std::move(callback).Run(std::move(result));''')],
}
rows=[];patch=[]
for path,edits in changes.items():
 data=(BASE/path).read_bytes();text=data.decode();anchors=[]
 for before,after in edits:
  assert text.count(before)==1,(path,before[:90],text.count(before))
  text=text.replace(before,after);anchors.append({'find':before,'replace':after,'count':1})
 out=HERE/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(text)
 rows.append({'path':path,'inputRoot':str(BASE),'inputSha256':sha(data),'outputSha256':sha(text.encode()),'output':str(out),'anchors':anchors})
 patch.extend(difflib.unified_diff(data.decode().splitlines(True),text.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
facts=[];ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
for path,needles in {
 'components/services/storage/dom_storage/session_storage_metadata.cc':[
  '  next_map_id_ = 0;', '    if (map_id >= next_map_id_) {',
  '                                         next_map_id_));', '  ++next_map_id_;'],
 'components/services/storage/dom_storage/session_storage_namespace_impl.cc':[
  'void SessionStorageNamespaceImpl::PopulateFromMetadata(',
  '      data_map = SessionStorageDataMap::CreateEmpty(',
  '          register_new_map_callback_.Run(namespace_id_, storage_key),'],
}.items():
 data=(ROOT/path).read_bytes();value=data.decode();checks=[{'find':s,'count':value.count(s)} for s in needles]
 assert all(a['count'] for a in checks),(path,checks)
 facts.append({'path':path,'sha256':sha(data),'anchors':checks})
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.native-source-absence-cancellation.source.v1','files':rows,'nativeRoot':str(ROOT),'physicalFacts':facts,'nativeCheckoutChanged':False,'nativeCompiled':False,'productExecuted':False,'runtimeAcceptance':False},indent=2)+'\n')
(HERE/'native.patch').write_text(''.join(patch))
print(json.dumps({'files':len(rows),'countedAnchors':sum(len(r['anchors']) for r in rows)}))
