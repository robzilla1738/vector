"""Fix sidebar axis contract and retire concluded split diagnostics; no projection."""
from pathlib import Path
import difflib,hashlib,json,runpy
HERE=Path(__file__).resolve().parent
ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
CHANGES={'chrome/browser/ui/views/frame/aux_sidebar_contents_view.cc':[
('''  scroll.SetDrawOverflowIndicator(false);
  scroll.SetOverflowGradientMask(views::ScrollView::GradientDirection::kVertical);''','''  scroll.SetDrawOverflowIndicator(false);
  // This is a vertical content viewport even while the sidebar collapses.
  // Preferred-width rows can exceed the narrow viewport; horizontal scrolling
  // would also violate ScrollView's single-axis overflow-gradient contract.
  scroll.SetHorizontalScrollBarMode(views::ScrollView::ScrollBarMode::kDisabled);
  scroll.SetOverflowGradientMask(views::ScrollView::GradientDirection::kVertical);''')]}
DIAGNOSTICS=runpy.run_path(str(HERE.parent/'split-drag-observation/prepare.py'))['CHANGES']
for name,anchors in DIAGNOSTICS.items():CHANGES[name]=[(after,before) for before,after in anchors]
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
 (HERE/'source-plan.json').write_text(json.dumps({'scope':'vertical sidebar axis configuration and concluded diagnostic removal','projected':False,'compiled':False,'files':rows,'anchors':sum(x['anchors'] for x in rows)},indent=2)+'\n')
 print('Counted repair replay: '+str(sum(x['anchors'] for x in rows))+' anchors in '+str(len(rows))+' files; no projection.')
if __name__=='__main__':main()
