"""Export factual original metadata without redefining any existing digest."""
import difflib, hashlib, json
from pathlib import Path
HERE=Path(__file__).resolve().parent
BASE=HERE.parent/'native-recovery-restoration-a19'/'source'
sha=lambda data:hashlib.sha256(data).hexdigest()
changes={
 'components/services/storage/dom_storage/async_dom_storage_database.cc':[(
  '      state->target_attempted || state->tainted ||\n      (!state->recovery_descriptor_sha256.empty() && state->recovery_descriptor_sha256 != descriptor)) {',
  '      state->target_attempted || state->tainted || state->recovery_write_attempted ||\n      (!state->recovery_descriptor_sha256.empty() && state->recovery_descriptor_sha256 != descriptor)) {')],
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
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.native-recovery-phase-fence.source.v1','files':rows,'nativeCheckoutChanged':False,'nativeCompiled':False,'productExecuted':False,'runtimeAcceptance':False},indent=2)+'\n')
(HERE/'native.patch').write_text(''.join(patch))
print(json.dumps({'files':len(rows),'countedAnchors':1}))
