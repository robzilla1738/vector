"""Pin/replay the native Show adaptation; test the coverage decision's geometry oracle."""
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
# Actual profile fetch/gates and profile-switch implementation are untouched.
start, end = '  void BindProfile(', '  void Show(bool locked)'
assert before[before.index(start):before.index(end)] == after[after.index(start):after.index(end)]
assert '(locked ? "/main.html#/" : "/minipopup.html#/")' in after
show = after[after.index(end):after.index('  void RequestHide()')]
assert 'Resize(size_)' not in show
assert show.count('LoadInitialURL(url);') == 1
assert 'if (loaded_entry_url_ != url ||' in show
assert 'GetBrowserContext() != profile_.get()' in show
assert '!IsPopupMostlyVisible(widget_->GetWindowBoundsInScreen())' in show
assert 'loaded_entry_url_ = GURL();' in after[after.index('  void DestroyWindows()'):]
# Focus capture/show/request-focus remain in the same order with the same calls.
focus = '    CaptureAuxPopupActivation();\n    widget_->Show();\n    webview_->RequestFocus();'
assert focus in show
helper = after[after.index('bool IsPopupMostlyVisible('):after.index('class PopupBoundsAnimation')]
for token in ['GetAllDisplays()', 'display.work_area()', 'SkRegion::kUnion_Op', 'SkRegion::Iterator', 'static_cast<int64_t>(bounds.width()) * bounds.height() / 2']:
    assert token in helper, token
assert 'return visible_area >' in helper
# Independent cell-union oracle: mirrored/overlapping displays must not count
# one pixel twice. These fixtures test the recovered decision, not native Skia.
def mostly_visible(window, displays):
    x, y, w, h = window
    rectangles = []
    for a, b, c, d in displays:
        left, top = max(x, a), max(y, b)
        right, bottom = min(x + w, a + c), min(y + h, b + d)
        if right > left and bottom > top:
            rectangles.append((left, top, right, bottom))
    xs = sorted({v for r in rectangles for v in (r[0], r[2])})
    ys = sorted({v for r in rectangles for v in (r[1], r[3])})
    covered = sum((b-a)*(d-c) for a,b in zip(xs,xs[1:]) for c,d in zip(ys,ys[1:])
                  if any(l <= a and b <= r and t <= c and d <= z for l,t,r,z in rectangles))
    return covered > w * h // 2
assert not mostly_visible((0,0,100,100), [(0,0,50,100)])  # exact half recovers
assert mostly_visible((0,0,100,100), [(0,0,51,100)])
assert not mostly_visible((0,0,100,100), [(0,0,40,100)] * 2)  # mirror, not80%
assert mostly_visible((0,0,100,100), [(0,0,30,100), (70,0,30,100)])
assert not mostly_visible((0,0,100,100), [(200,200,100,100)])
assert not mostly_visible((0,0,0,0), [])
print('Verified original Show pins, exact one-file replay, gates/focus preservation and union/half-threshold geometry fixtures. No native execution or visual acceptance.')
