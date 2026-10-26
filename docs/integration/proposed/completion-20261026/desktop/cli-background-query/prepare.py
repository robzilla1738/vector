"""Counted query-only source correction; does not project or build."""
from pathlib import Path
import difflib,hashlib,json
HERE=Path(__file__).resolve().parent
NAME='chrome/browser/aux/cli/AuxCliOpenCommand.mm'
NATIVE=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
CHANGES=[('''    auto window=SelectActualWindow({});''','''    // A terminal query does not activate Aux. Retain a visible normal window
    // in activation order; GetActiveBrowser() is null while Terminal is active.
    base::WeakPtr<BrowserWindowInterface> window;
    if(auto* collection=GlobalBrowserCollection::GetInstance()){
      collection->ForEach([&](BrowserWindowInterface* candidate){
        if(!UsableWindow(candidate))return true;
        window=candidate->GetWeakPtr();return false;
      },BrowserCollection::Order::kActivation);
    }'''),('''    if(!parsed||!current()){
      result=base::DictValue().Set("ok",false).Set("error",parsed?"routing-authority-unavailable":"invalid-query");code=parsed?78:64;''','''    const bool admitted=parsed&&current();
    if(!admitted){
      result=base::DictValue().Set("ok",false).Set("error",parsed?"routing-authority-unavailable":"invalid-query");code=parsed?78:64;'''),('''    if(parsed&&!current()){result=base::DictValue().Set("ok",false).Set("error","query-owner-changed");code=78;}''','''    if(admitted&&!current()){result=base::DictValue().Set("ok",false).Set("error","query-owner-changed");code=78;}''')]
def main():
 baseline=HERE/'baseline'/NAME;source=HERE/'source'/NAME
 if not baseline.exists():
  baseline.parent.mkdir(parents=True,exist_ok=True);baseline.write_bytes((NATIVE/NAME).read_bytes())
 before=baseline.read_text();after=before
 for old,new in CHANGES:
  if after.count(old)!=1:raise ValueError('Expected one anchor: '+old[:70])
  after=after.replace(old,new)
 source.parent.mkdir(parents=True,exist_ok=True);source.write_text(after)
 (HERE/'native.patch').write_text(''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='a/'+NAME,tofile='b/'+NAME)))
 (HERE/'source-plan.json').write_text(json.dumps({'projected':False,'compiled':False,'files':[{'path':NAME,'beforeSha256':hashlib.sha256(before.encode()).hexdigest(),'afterSha256':hashlib.sha256(after.encode()).hexdigest(),'anchors':len(CHANGES)}]},indent=2)+'\n')
 print('One source file, three exact anchors; not projected.')
if __name__=='__main__':main()
