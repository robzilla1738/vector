"""Temporary payload-free palette lifetime/API observations; no behavior change."""
from pathlib import Path
import difflib,hashlib,json,runpy
HERE=Path(__file__).resolve().parent
ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
CHANGES={'chrome/browser/ui/views/frame/aux_tab_search_bubble.cc': [('    NotifyInvocation(true);\n  }\n  void InvalidateInvocation()', "    auto* contents = webview_->GetWebContents();\n    auto* frame = contents ? contents->GetPrimaryMainFrame() : nullptr;\n    // Retain a healthy mounted document, including an unfinished initial load.\n    // WasShown does not reload a crashed WebView's renderer by itself.\n    if (contents && !contents->IsLoading() &&\n        !contents->GetController().GetPendingEntry() &&\n        (contents->IsCrashed() ||\n         (!contents->GetLastCommittedURL().is_empty() &&\n          (!frame || !frame->IsRenderFrameLive() || frame->IsErrorDocument() ||\n           contents->GetLastCommittedURL() != SearchURL())))) {\n      webview_->LoadInitialURL(SearchURL());\n      return;  // The replacement renderer mounts against the new binding.\n    }\n    NotifyInvocation(true);\n  }\n  void InvalidateInvocation()")]}
def main():
 rows=[];patch=[]
 for name,anchors in CHANGES.items():
  baseline=HERE/'baseline'/name;source=HERE/'source'/name
  if not baseline.exists():
   baseline.parent.mkdir(parents=True,exist_ok=True);baseline.write_bytes((ROOT/name).read_bytes())
  before=baseline.read_text();after=before
  for old,new in anchors:
   if after.count(old)!=1:raise ValueError('Expected one anchor: '+name+': '+old[:70])
   after=after.replace(old,new)
  source.parent.mkdir(parents=True,exist_ok=True);source.write_text(after)
  rows.append({'path':name,'beforeSha256':hashlib.sha256(before.encode()).hexdigest(),'afterSha256':hashlib.sha256(after.encode()).hexdigest(),'anchors':len(anchors)})
  patch.extend(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='a/'+name,tofile='b/'+name))
 (HERE/'native.patch').write_text(''.join(patch))
 (HERE/'source-plan.json').write_text(json.dumps({'scope':'conditional palette document recovery after crash or invalid navigation','projected':False,'compiled':False,'files':rows,'anchors':sum(x['anchors'] for x in rows)},indent=2)+'\n')
 print('Counted repair replay: '+str(sum(x['anchors'] for x in rows))+' anchors in '+str(len(rows))+' files; no projection.')
if __name__=='__main__':main()
