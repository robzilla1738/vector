"""Pin/replay popup retirement state without native shortcut or window actions."""
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

path = manifest['files'][0]['path']
before = (root / 'baseline' / path).read_text()
after = (root / 'source' / path).read_text()
assert 'Milliseconds(100)' not in after and 'dismiss_' not in after
assert 'PostDelayedTask' not in after
inactive = after[after.index('  void FinishDeactivation()'):after.index('  void CloseOptions()')]
assert 'picker_pending_' in inactive and inactive.count('IsActive()') == 2
assert inactive.index('SetCanActivate(false)') < inactive.index('ClearAuxPopupActivation();') < inactive.index('CloseOptions();')
assert 'Hide();' not in inactive
activation = after[after.index('  void OnWidgetActivationChanged('):after.index('  void OnProfileWillBeDestroyed(')]
assert 'kWaitingForMainActivation' in activation and 'kWaitingForOptionsHidden' in activation
assert 'widget != options_.get() || visible' in activation
assert activation.count('weak_factory_.GetWeakPtr()') == 1
finish = after[after.index('  void FinishOptionsFocusTransfer()'):after.index('  bool OwnsPopupContents(')]
assert finish.index('if (!widget_->IsActive())') < finish.index('webview_->RequestFocus();') < finish.index('OptionsFocusState::kWaitingForOptionsHidden') < finish.index('options_->Hide();')
destroy = after[after.index('  void DestroyWindows()'):after.index('  void Resize(')]
assert destroy.index('weak_factory_.InvalidateWeakPtrs();') < destroy.index('options_.reset();')
assert destroy.index('weak_factory_.InvalidateWeakPtrs();') < destroy.index('widget_.reset();')
close = after[after.index('  void CloseOptions()'):after.index('  void PostCloseOptions()')]
assert close.index('WasHidden();') < close.index('RemoveObserver(this)') < close.index('options_.reset();')
# Preserve the asynchronous genuine gate and caller-bound picker implementation.
for start, end in [('  void ShowFor(', '  void Show(bool locked)'), ('  std::optional<std::string> BeginDirectoryPicker(', '\n private:')]:
    assert before[before.index(start):before.index(end, before.index(start))] == after[after.index(start):after.index(end, after.index(start))]
assert len(manifest['files']) == 1
print('Verified original focus-state byte pins, exact one-file native replay, zero-delay weak retirement, no invented blur Hide, and preserved security/picker gates. No native runtime acceptance.')
