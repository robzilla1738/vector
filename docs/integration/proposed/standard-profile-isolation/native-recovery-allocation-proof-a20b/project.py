"""Export factual original metadata without redefining any existing digest."""
import difflib, hashlib, json
from pathlib import Path
HERE=Path(__file__).resolve().parent
BASE=HERE.parent/'native-recovery-phase-fence-a20'/'source'
sha=lambda data:hashlib.sha256(data).hexdigest()
changes={
 'components/services/storage/dom_storage/async_dom_storage_database.cc':[(
  '  AuxDomCapture proposed;\n  proposed.unrelated_metadata_sha256 = fresh.unrelated_metadata_sha256;',
  '  bool unresolved_allocation = false;\n  for (const auto& row : recorded.maps)\n    unresolved_allocation |= row.allocation_requested && !row.allocation_observed;\n  if (unresolved_allocation ? !recorded.target_topology_sha256.empty() : recorded.target_topology_sha256.size() != 64)\n    return base::unexpected(DbStatus::IOError("Recorded action and physical topology observations disagree"));\n  AuxDomCapture proposed;\n  proposed.unrelated_metadata_sha256 = fresh.unrelated_metadata_sha256;'),(
  '      if (!local || !sqlite || !recorded.target_attempted || map.source_persisted ||\n          map.locator.map_id() || !map.source.empty() || map.last_accessed || map.last_modified || map.total_size ||',
  '      if (!local || !sqlite || !recorded.target_attempted || map.source_persisted ||\n          map.locator.map_id() || !map.source.empty() || map.target.empty() || map.last_accessed || map.last_modified || map.total_size ||\n          (row.allocation_observed ? row.target_map_sha256.size() != 64 : !row.target_map_sha256.empty()) ||')],
}
rows=[];patch=[]
for path,edits in changes.items():
 data=(BASE/path).read_bytes();text=data.decode();anchors=[]
 for before,after in edits:
  assert text.count(before)==1
  text=text.replace(before,after);anchors.append({'find':before,'replace':after,'count':1})
 out=HERE/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(text)
 rows.append({'path':path,'inputRoot':str(BASE),'inputSha256':sha(data),'outputSha256':sha(text.encode()),'output':str(out),'anchors':anchors})
 patch.extend(difflib.unified_diff(data.decode().splitlines(True),text.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.native-recovery-allocation-proof.source.v1','files':rows,'nativeCheckoutChanged':False,'nativeCompiled':False,'productExecuted':False,'runtimeAcceptance':False},indent=2)+'\n')
(HERE/'native.patch').write_text(''.join(patch))
print(json.dumps({'files':len(rows),'countedAnchors':2}))
