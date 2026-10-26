"""Temporary payload-free palette lifetime/API observations; no behavior change."""
from pathlib import Path
import difflib,hashlib,json,runpy
HERE=Path(__file__).resolve().parent
ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
CHANGES={'chrome/browser/ui/views/frame/aux_tab_search_bubble.cc': [('views::CreateEmptyBorder()', 'views::CreateEmptyBorder(gfx::Insets())'), ('void Layout(PassKey key) override {\n    views::View::Layout(key);', 'void Layout(PassKey) override {\n    LayoutSuperclass<views::View>(this);'), ('const auto* target = binding->target();', 'auto* target = binding->target();')], 'chrome/browser/extensions/api/aux_browser_preferences/aux_browser_preferences_api.cc': [('    if (args().size() > 1 || (args().size() == 1 && !args()[0].is_dict()))\n      return RespondNow(Error("Invalid command input acknowledgment"));\n    const auto* ack = args().empty() ? nullptr : &args()[0].GetDict();', '    // Generated bindings may normalize an omitted optional argument to null.\n    const bool has_ack = !args().empty() && !args()[0].is_none();\n    if (args().size() > 1 || (has_ack && !args()[0].is_dict()))\n      return RespondNow(Error("Invalid command input acknowledgment"));\n    const auto* ack = has_ack ? &args()[0].GetDict() : nullptr;')]}
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
 (HERE/'source-plan.json').write_text(json.dumps({'scope':'cold input native compile corrections and omitted optional acknowledgment','projected':False,'compiled':False,'files':rows,'anchors':sum(x['anchors'] for x in rows)},indent=2)+'\n')
 print('Counted repair replay: '+str(sum(x['anchors'] for x in rows))+' anchors in '+str(len(rows))+' files; no projection.')
if __name__=='__main__':main()
