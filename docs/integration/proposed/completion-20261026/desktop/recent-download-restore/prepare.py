"""Counted native DownloadItem eligibility correction; no projection/build."""
from pathlib import Path
import difflib,hashlib,json
HERE=Path(__file__).resolve().parent
ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
NAME='chrome/browser/ui/aux_recent_files_service.cc'
old='''      item->GetInsecureDownloadStatus() == Item::SAFE &&'''
new='''      // History imports have UNKNOWN status; the DownloadItem owns the
      // warning/block decision, including explicit user validation.
      !item->IsInsecure() &&'''
baseline=HERE/'baseline'/NAME;source=HERE/'source'/NAME
if not baseline.exists():
 baseline.parent.mkdir(parents=True,exist_ok=True);baseline.write_bytes((ROOT/NAME).read_bytes())
before=baseline.read_text();assert before.count(old)==1
after=before.replace(old,new);source.parent.mkdir(parents=True,exist_ok=True);source.write_text(after)
(HERE/'native.patch').write_text(''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='a/'+NAME,tofile='b/'+NAME)))
evidence=[]
for path in ['components/download/internal/common/download_item_impl.cc','components/download/public/common/download_item_impl.h','components/download/public/common/download_item.h']:
 evidence.append({'path':path,'sha256':hashlib.sha256((ROOT/path).read_bytes()).hexdigest()})
(HERE/'source-plan.json').write_text(json.dumps({'projected':False,'compiled':False,'ownerStateRead':False,'files':[{'path':NAME,'beforeSha256':hashlib.sha256(before.encode()).hexdigest(),'afterSha256':hashlib.sha256(after.encode()).hexdigest(),'anchors':1}],'nativeContractEvidence':evidence},indent=2)+'\n')
print('One exact anchor in existing RecentFiles owner; no projection.')
