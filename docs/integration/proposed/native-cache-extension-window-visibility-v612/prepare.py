import difflib,hashlib,json,subprocess
from pathlib import Path
root=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
here=Path(__file__).resolve().parent
composition=Path('/Users/rcourson/Documents/Vibe/web/out/native-reuse-composition-v612/manifest.json')
sha=lambda b:hashlib.sha256(b).hexdigest()
pins={f['path']:f['outputSha256'] for f in json.loads(composition.read_text())['files']}
path='chrome/browser/extensions/browser_extension_window_controller.cc'
edits=[dict(path=path,find='#include "chrome/browser/tab_list/tab_list_interface.h"',replace='#include "chrome/browser/tab_list/tab_list_interface.h"\n#include "chrome/browser/ui/browser_init_state.h"',count=1),dict(path=path,find='''    bool allow_dev_tools_windows) const {
  // TODO(joelhockey):''',replace='''    bool allow_dev_tools_windows) const {
  // A profile-switch cache is an internal tab owner, not an extension window.
  // Keep ordinary hidden/minimized windows and non-cache omitted windows visible.
  if (const auto* state = BrowserInitState::From(&browser_.get());
      state && state->is_aux_profile_switch_cache()) {
    return false;
  }
  // TODO(joelhockey):''',count=1)]
before=(root/path).read_bytes()
# This upstream file is not yet an Aux-composed leaf; attest its exact tracked base.
tracked=subprocess.check_output(['git','show','HEAD:'+path],cwd=root)
assert before==tracked, 'uncomposed upstream source drift'
if path in pins: assert sha(before)==pins[path], 'native612 drift'
upstream_commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
after=before.decode()
for e in edits:
 assert after.count(e['find'])==1,e['find'];after=after.replace(e['find'],e['replace'])
out=here/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(after)
(here/'native.patch').write_text(''.join(difflib.unified_diff(before.decode().splitlines(True),after.splitlines(True),fromfile='a/'+path,tofile='b/'+path)))
(here/'files.json').write_text(json.dumps(dict(baseComposition='v612',upstreamCommit=upstream_commit,uncomposedSourceVerified=True,compositionSha256=sha(composition.read_bytes()),files=[dict(path=path,baselineSha256=sha(before),outputSha256=sha(after.encode()))],edits=edits),indent=2)+'\n')
subprocess.run(['git','apply','--check',str(here/'native.patch')],cwd=root,check=True)
print('2 count-one edits, native612 hash pin and apply-check passed')
