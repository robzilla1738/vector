"""Preserve Chromium raw-ref and checked-span compiler enforcement."""
import difflib,hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
PARENT=HERE.parent
sha=lambda data:hashlib.sha256(data).hexdigest()
changes={
'components/services/storage/dom_storage/aux_ui_cache_cohort.h':('native-cache-cohort-integration-a9',[
('#include "base/memory/weak_ptr.h"','#include "base/memory/weak_ptr.h"\n#include "base/memory/raw_ref.h"'),
('  blink::mojom::StorageArea& implementation_;','  raw_ref<blink::mojom::StorageArea> implementation_;'),
('  mojo::RemoteSet<blink::mojom::StorageAreaObserver>& observers_;','  raw_ref<mojo::RemoteSet<blink::mojom::StorageAreaObserver>> observers_;'),
('  mojo::ReceiverSet<blink::mojom::StorageArea>& receivers_;','  raw_ref<mojo::ReceiverSet<blink::mojom::StorageArea>> receivers_;')]),
'components/services/storage/dom_storage/aux_ui_cache_cohort.cc':('native-cache-release-receipt-a13',[
('observers_.','observers_->'),('receivers_.TakeReceivers()','receivers_->TakeReceivers()'),
('receivers_.Add(&implementation_,','receivers_->Add(&implementation_.get(),')]),
'components/services/storage/dom_storage/async_dom_storage_database.cc':('native-recovery-metadata-a17a',[
('      const auto& rule = kAuxUiKeyRules[i];','      const auto& rule = base::span(kAuxUiKeyRules)[i];')]),
}
rows=[];patch=[]
for path,(base,edits) in changes.items():
 root=PARENT/base/'source';data=(root/path).read_bytes();text=data.decode();anchors=[]
 for before,after in edits:
  count=text.count(before);assert count>0,(path,before)
  text=text.replace(before,after);anchors.append({'find':before,'replace':after,'count':count})
 out=HERE/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(text)
 rows.append({'path':path,'inputRoot':str(root),'inputSha256':sha(data),'outputSha256':sha(text.encode()),'output':str(out),'anchors':anchors})
 patch.extend(difflib.unified_diff(data.decode().splitlines(True),text.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.native-cohort-compile-fix.source.v1','files':rows,'nativeCheckoutChanged':False,'nativeCompiled':False,'productExecuted':False,'runtimeAcceptance':False},indent=2)+'\n')
(HERE/'native.patch').write_text(''.join(patch))
print(json.dumps({'files':len(rows),'anchors':sum(len(r['anchors']) for r in rows),'sites':sum(a['count'] for r in rows for a in r['anchors'])}))
