"""Temporary payload-free palette lifetime/API observations; no behavior change."""
from pathlib import Path
import difflib,hashlib,json,runpy
HERE=Path(__file__).resolve().parent
ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
CHANGES={'chrome/browser/ui/aux_keyboard_shortcuts.mm': [('    if (std::ranges::find(reserved, *parsed) != reserved.end())\n      return "Command " + base::NumberToString(binding.command) + " conflicts with a macOS shortcut";', '    // An inherited/current chord may already collide with the user\'s OS\n    // settings. Do not let that unrelated unchanged row veto this edit.\n    // Every newly assigned chord, including imports and resets, is checked.\n    if (parsed != ParseKeyboardShortcut(Effective(profile, binding)) &&\n        std::ranges::find(reserved, *parsed) != reserved.end())\n      return "Command " + base::NumberToString(binding.command) + " conflicts with a macOS shortcut";')]}
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
 (HERE/'source-plan.json').write_text(json.dumps({'scope':'do not reject unrelated shortcut edits for unchanged existing OS collision','projected':False,'compiled':False,'files':rows,'anchors':sum(x['anchors'] for x in rows)},indent=2)+'\n')
 print('Counted repair replay: '+str(sum(x['anchors'] for x in rows))+' anchors in '+str(len(rows))+' files; no projection.')
if __name__=='__main__':main()
