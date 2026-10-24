"""Eleven compile-only counted corrections over exact A8 output."""
import difflib,hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
BASE=HERE.parent/'native-renderer-cache-lease-a8'/'source'
sha=lambda b:hashlib.sha256(b).hexdigest()
path='third_party/blink/renderer/modules/storage/cached_storage_area.cc'
original=(BASE/path).read_bytes();text=original.decode();anchors=[]
edits=[('  return BindOnce([](scoped_refptr<CachedStorageArea> owner, base::OnceClosure callback) {','  return blink::BindOnce([](scoped_refptr<CachedStorageArea> owner, base::OnceClosure callback) {'),('    result.push_back({entry.value, frame->GetLocalFrameToken(), frame->GetDocumentToken()});','    result.push_back(AuxUiCacheSource{entry.value, frame->GetLocalFrameToken(), frame->GetDocumentToken()});')]
for method in ['RemoveItem','Clear','ResetConnection','KeyChanged','KeyChangeFailed','KeyDeleted','AllDeleted','ShouldSendOldValueOnMutations','EvictCachedData']:
 old='aux_ui_cache_lease_->deferred.push_back(BindOnce(&CachedStorageArea::'+method+','
 edits.append((old,old.replace('push_back(BindOnce','push_back(blink::BindOnce')))
for before,after in edits:
 assert text.count(before)==1,(before,text.count(before))
 text=text.replace(before,after);anchors.append({'find':before,'replace':after,'count':1})
target=HERE/'source'/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(text)
files=[{'path':path,'inputSha256':sha(original),'outputSha256':sha(text.encode()),'output':str(target),'anchors':anchors}]
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.native-renderer-cache-compile-fix.source.v1','nativeRoot':str(BASE),'files':files,'nativeCheckoutChanged':False,'nativeCompiled':False,'productExecuted':False,'activationAuthorized':False},indent=2)+'\n')
(HERE/'native.patch').write_text(''.join(difflib.unified_diff(original.decode().splitlines(True),text.splitlines(True),fromfile='a/'+path,tofile='b/'+path)))
print(json.dumps({'files':1,'countedAnchors':len(anchors),'inputSha256':sha(original),'outputSha256':sha(text.encode())}))
