"""Pin original saved-pin matching/open actions and replay new native paths."""
from pathlib import Path
import hashlib,json,struct,subprocess,tempfile
root=Path(__file__).resolve().parent
manifest=json.loads((root/'manifest.json').read_text())
evidence=json.loads((root/'source-evidence.json').read_text())
sha=lambda data:hashlib.sha256(data).hexdigest()
arm=Path(evidence['arm64']['path']).read_bytes()
assert sha(arm)==evidence['arm64']['sha256']
for row in evidence['functions']:
 start=int(row['rva'],16)
 assert sha(arm[start:start+row['bytes']])==row['sha256']
word=lambda address:struct.unpack_from('<I',arm,address)[0]
assert word(0x460a3c0)==0x528000c2 # actual gesture6
assert word(0x4557cd0)==0x39406028 # load saved GURL validity
assert word(0x4557cd4)==0x360003e8 # invalid returns without replacing old data
native=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
for row in evidence['platformSources']:
 assert sha((native/row['path']).read_bytes())==row['sha256']
gesture=(native/'chrome/browser/ui/tabs/tab_strip_user_gesture_details.h').read_text()
body=gesture.split('enum class GestureType {',1)[1].split('}',1)[0]
assert [v.strip() for v in body.split(',')].index('kNone')==6
code=(root/'source/chrome/browser/ui/views/tabs/vertical/aux_pinned_tab_entry_actions.cc').read_text()
for expression in ['model.IsTabPinned(index)', 'candidate != url', 'index == model.active_index()', 'GestureType::kNone', 'PAGE_TRANSITION_AUTO_BOOKMARK', 'NEW_FOREGROUND_TAB', 'ADD_PINNED', 'params.navigated_or_inserted_contents']:
 assert expression in code
assert 'GetVisibleURL()' in code and 'GetUserData(&kPinnedTabEntryUrlKey)' in code
with tempfile.TemporaryDirectory(prefix='aux-pinned-registration-') as directory:
 replay=Path(directory)
 subprocess.run(['git','init','-q',directory],check=True)
 for row in manifest['files']:
  path=row['path'];b=(root/'source'/path).read_bytes()
  assert row['baselineSha256'] is None and sha(b)==row['outputSha256']
  assert not (native/path).exists()
 subprocess.run(['git','apply','--check',str(root/'native.patch')],cwd=replay,check=True)
 subprocess.run(['git','apply',str(root/'native.patch')],cwd=replay,check=True)
 for row in manifest['files']:assert sha((replay/row['path']).read_bytes())==row['outputSha256']
print('Original saved-pin native matching/open/identity and155 API pins pass; absent-file replay passes. Not compiled/mounted/runtime-accepted.')
