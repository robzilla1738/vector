"""Export factual original metadata without redefining any existing digest."""
import difflib, hashlib, json
from pathlib import Path
HERE=Path(__file__).resolve().parent
BASE=HERE.parent/'native-recovery-metadata-a17a'/'source'
sha=lambda data:hashlib.sha256(data).hexdigest()
changes={
 'components/services/storage/dom_storage/async_dom_storage_database.h':[(
  '    bool matches_target = false;',
  '    bool matches_target = false;\n    bool known_source_target_mixture = false;')],
 'components/services/storage/dom_storage/async_dom_storage_database.cc':[(
  '  result.file_data_synced = capture.file_data_synced;',
  '  result.file_data_synced = capture.file_data_synced;\n  result.known_source_target_mixture = capture.file_data_synced && !result.matches_source && !result.matches_target;')],
}
rows=[];patch=[]
for path,edits in changes.items():
 root=HERE.parent/'native-cohort-compile-fix-a17c'/'source' if path.endswith('.cc') else BASE
 data=(root/path).read_bytes();text=data.decode();anchors=[]
 for before,after in edits:
  assert text.count(before)==1
  text=text.replace(before,after);anchors.append({'find':before,'replace':after,'count':1})
 out=HERE/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(text)
 rows.append({'path':path,'inputRoot':str(root),'inputSha256':sha(data),'outputSha256':sha(text.encode()),'output':str(out),'anchors':anchors})
 patch.extend(difflib.unified_diff(data.decode().splitlines(True),text.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.native-known-mixture.source.v1','files':rows,'nativeCheckoutChanged':False,'nativeCompiled':False,'productExecuted':False,'runtimeAcceptance':False},indent=2)+'\n')
(HERE/'native.patch').write_text(''.join(patch))
print(json.dumps({'files':len(rows),'countedAnchors':2}))
