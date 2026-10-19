"""Static replay and original-instruction arithmetic checks; never invokes native APIs."""
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).resolve().parent
manifest = json.loads((root / 'manifest.json').read_text())
evidence = json.loads((root / 'source-evidence.json').read_text())

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

for row in evidence['inputs']:
    assert digest(Path(row['path'])) == row['sha256'], row['path']
with tempfile.TemporaryDirectory(prefix='aux-popup-position-') as name:
    replay = Path(name)
    subprocess.run(['git', 'init', '-q', name], check=True)
    for row in manifest['files']:
        relative = row['path']
        before = root / 'baseline' / relative
        after = root / 'source' / relative
        assert digest(before) == row['baselineSha256'], relative
        assert digest(after) == row['outputSha256'], relative
        destination = replay / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(before.read_bytes())
    patch = str(root / 'native-mini-popup-position-focus.patch')
    subprocess.run(['git', 'apply', '--check', patch], cwd=replay, check=True)
    subprocess.run(['git', 'apply', patch], cwd=replay, check=True)
    for row in manifest['files']:
        assert digest(replay / row['path']) == row['outputSha256'], row['path']

# These are the multiply-high/sign corrections actually recorded at04598240,
# compared with the named truncating integer divisions used by the155 port.
x_multiplier, y_multiplier = evidence['placementConstant']['signedInt32']
for value in [-2147483647, -1921, -441, -1, 0, 1, 439, 440, 1921, 2147483647]:
    half = ((value * x_multiplier) >> 32) + value
    half -= half >> 31
    third = (value * y_multiplier) >> 32
    third -= third >> 31
    assert half == (abs(value) // 2) * (-1 if value < 0 else 1)
    assert third == (abs(value) // 3) * (-1 if value < 0 else 1)

source = (root / 'source' / manifest['files'][0]['path']).read_text()
assert 'GetDisplayNearestPoint(screen->GetCursorScreenPoint())' in source
assert 'area.y() + area.height() / 3' in source
assert '(current.height() - size.height()) / 2' in source
hide = source[source.index('  void Hide() {'):source.index('  void DestroyWindows()')]
assert 'RestoreAuxPopupActivation' not in hide
request = source[source.index('  void RequestHide()'):source.index('  void Hide()')]
assert request.index('RestoreAuxPopupActivation();') < request.index('Hide();')
mac = (root / 'source' / manifest['files'][1]['path']).read_text()
assert '__weak NSWindow* g_previous_key_window' in mac
assert 'NSApp.isActive ? NSApp.keyWindow : nil' in mac
assert 'previous.isVisible && previous.canBecomeKeyWindow' in mac
assert '[previous makeKeyAndOrderFront:nil]' in mac
assert 'activateIgnoringOtherApps' not in mac
print('Verified source pins, exact two-file replay, original division expressions and explicit-close focus boundary. No native execution.')
