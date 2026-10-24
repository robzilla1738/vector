"""Use Chromium checked native pointer fields over exact A9a header."""
import difflib,hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
BASE=HERE.parent/'native-dom-existing-controls-a9a'/'source'
sha=lambda data:hashlib.sha256(data).hexdigest()
path='content/public/browser/dom_storage_context.h'
original=(BASE/path).read_bytes();text=original.decode();anchors=[]
for before,after in [
 ('#include "base/functional/callback.h"','#include "base/functional/callback.h"\n#include "base/memory/raw_ptr.h"'),
 ('    storage::mojom::LocalStorageControl* local;','    raw_ptr<storage::mojom::LocalStorageControl> local;'),
 ('    storage::mojom::SessionStorageControl* session;','    raw_ptr<storage::mojom::SessionStorageControl> session;'),
]:
 assert text.count(before)==1
 text=text.replace(before,after);anchors.append({'find':before,'replace':after,'count':1})
target=HERE/'source'/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(text)
files=[{'path':path,'inputSha256':sha(original),'outputSha256':sha(text.encode()),'output':str(target),'anchors':anchors}]
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.native-dom-existing-controls-compile-fix.source.v1','nativeRoot':str(BASE),'files':files,'nativeCheckoutChanged':False,'nativeCompiled':False,'productExecuted':False,'activationAuthorized':False},indent=2)+'\n')
(HERE/'native.patch').write_text(''.join(difflib.unified_diff(original.decode().splitlines(True),text.splitlines(True),fromfile='a/'+path,tofile='b/'+path)))
print(json.dumps({'files':1,'countedAnchors':3,'inputSha256':sha(original),'outputSha256':sha(text.encode())}))
