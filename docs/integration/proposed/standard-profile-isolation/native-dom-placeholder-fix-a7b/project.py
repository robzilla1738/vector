"""Exact compiler correction over reviewed A7 outputs; native remains untouched."""
import difflib,hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
BASE=HERE.parent/'native-dom-transaction-lease-a7'/'source'
sha=lambda data:hashlib.sha256(data).hexdigest()
files=[];patch=[]
for name,before,after in [
 ('local_storage_impl.cc','LIVE_LocalStorageImplS','!areas_.empty()'),
 ('session_storage_impl.cc','LIVE_SessionStorageImplS','!data_maps_.empty() || !namespaces_.empty()'),
]:
 path='components/services/storage/dom_storage/'+name
 original=(BASE/path).read_bytes();text=original.decode()
 assert text.count(before)==1
 text=text.replace(before,after)
 target=HERE/'source'/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(text)
 files.append({'path':path,'inputSha256':sha(original),'outputSha256':sha(text.encode()),'output':str(target),'anchors':[{'find':before,'replace':after,'count':1}]})
 patch.extend(difflib.unified_diff(original.decode().splitlines(True),text.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.native-dom-placeholder-fix.source.v1','nativeRoot':str(BASE),'files':files,'nativeCheckoutChanged':False,'nativeCompiled':False,'productExecuted':False,'activationAuthorized':False},indent=2)+'\n')
(HERE/'native.patch').write_text(''.join(patch))
print(json.dumps({'files':len(files),'countedAnchors':2}))
