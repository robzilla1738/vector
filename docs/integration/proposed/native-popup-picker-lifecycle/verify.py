"""Pin/replay supplied popup picker lifecycle without executing native dialogs."""
import hashlib
import json
from pathlib import Path
import struct
import subprocess
import tempfile

root = Path(__file__).resolve().parent
manifest = json.loads((root / 'manifest.json').read_text())
evidence = json.loads((root / 'source-evidence.json').read_text())

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

for row in evidence['inputs']:
    assert sha(Path(row['path'])) == row['sha256'], row['path']
framework = Path(evidence['framework']['path'])
assert sha(framework) == evidence['framework']['sha256']
universal = framework.read_bytes()
for i in range(struct.unpack_from('>I', universal, 4)[0]):
    cpu, _, offset, size, _ = struct.unpack_from('>IIIII', universal, 8 + i * 20)
    if cpu == 0x100000c:
        arm = universal[offset:offset + size]
        break
else:
    raise AssertionError('Missing arm64 input')
assert hashlib.sha256(arm).hexdigest() == evidence['framework']['arm64Sha256']
sections = []
pos = 32
for _ in range(struct.unpack_from('<I', arm, 16)[0]):
    cmd, size = struct.unpack_from('<II', arm, pos)
    if cmd == 0x19:
        for i in range(struct.unpack_from('<I', arm, pos + 64)[0]):
            sections.append(struct.unpack_from('<QQI', arm, pos + 72 + i * 80 + 32))
    pos += size
for row in evidence['functions']:
    address = int(row['rva'], 16)
    start, _, offset = next(s for s in sections if s[0] <= address < s[0] + s[1])
    data = arm[offset + address - start:offset + address - start + row['bytes']]
    assert hashlib.sha256(data).hexdigest() == row['sha256']
with tempfile.TemporaryDirectory(prefix='aux-popup-reopen-') as directory:
    replay = Path(directory)
    subprocess.run(['git', 'init', '-q', directory], check=True)
    for row in manifest['files']:
        path = row['path']
        assert sha(root / 'baseline' / path) == row['baselineSha256']
        assert sha(root / 'source' / path) == row['outputSha256']
        out = replay / path
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes((root / 'baseline' / path).read_bytes())
    subprocess.run(['git', 'apply', '--check', str(root / 'native.patch')], cwd=replay, check=True)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=replay, check=True)
    for row in manifest['files']:
        assert sha(replay / row['path']) == row['outputSha256']

path = 'chrome/browser/extensions/api/aux_mini_popup/aux_mini_popup_api.cc'
before = (root / 'baseline' / path).read_text()
after = (root / 'source' / path).read_text()
start, end = '  void BindProfile(', '  void RequestHide()'
assert before[before.index(start):before.index(end)] == after[after.index(start):after.index(end)]
assert 'SetPickerPending' not in after
begin = after[after.index('  std::optional<std::string> BeginDirectoryPicker('):after.index('  void FinishDirectoryPicker(')]
for token in ['!widget_', 'widget_->IsClosed()', '!widget_->IsVisible()', '!OwnsPopupContents(source)', 'if (picker_pending_)', 'Folder picker request already in progress']:
    assert token in begin, token
assert begin.index('!OwnsPopupContents(source)') < begin.index('if (picker_pending_)') < begin.index('picker_pending_ = true;')
finish = after[after.index('  void FinishDirectoryPicker('):after.index(' private:', after.index('  void FinishDirectoryPicker('))]
assert finish.count('picker_pending_ = false;') == 1
assert 'if (OwnsPopupContents(source))' in finish
ownership = after[after.index('  bool OwnsPopupContents('):after.index('  friend class base::NoDestructor<PopupManager>;')]
assert 'return source &&' in ownership
assert 'source == webview_->web_contents()' in ownership
assert 'source == options_webview_->web_contents()' in ownership
assert 'IsVisible' not in finish + ownership  # completion works while hidden
assert 'picker_pending_ = false;' in after[after.index('  void DestroyWindows()'):after.index('  void Resize(')]
run = after[after.index('  if (method == "pickDirectory")'):after.index('void AuxMiniPopupFunction::FileSelected')]
assert '!user_gesture()' in run
assert run.index('BeginDirectoryPicker(owner)') < run.index('SelectFileDialog::Create(') < run.index('picker_hold_ = this;') < run.index('dialog_->SelectFile(')
assert 'std::u16string()' in run
assert 'did_respond() ? AlreadyResponded() : RespondLater()' in run
assert 'CompleteDirectory(std::nullopt);' in after
completion = after[after.index('void AuxMiniPopupFunction::CompleteDirectory('):]
assert completion.index('auto retained = std::move(picker_hold_);') < completion.index('dialog_.reset();') < completion.index('FinishDirectoryPicker(GetSenderWebContents())') < completion.index('Respond(')
assert 'Respond(path ? WithArguments(std::move(*path)) : NoArguments());' in completion
header = (root / 'source/chrome/browser/extensions/api/aux_mini_popup/aux_mini_popup_api.h').read_text()
assert 'CompleteDirectory(std::optional<std::string> path)' in header
schema_path = 'chrome/common/extensions/api/aux_mini_popup.json'
old_schema = json.loads((root / 'baseline' / schema_path).read_text())
new_schema = json.loads((root / 'source' / schema_path).read_text())
expected = json.loads(json.dumps(old_schema))
next(f for f in expected[0]['functions'] if f['name'] == 'pickDirectory')['returns_async']['parameters'][0]['optional'] = True
assert expected == new_schema
assert len(manifest['files']) == 3
print('Verified original picker/input pins, exact three-file replay, source-scoped begin/completion, optional cancel and synchronous-response boundaries. No native dialogs, execution or acceptance.')
