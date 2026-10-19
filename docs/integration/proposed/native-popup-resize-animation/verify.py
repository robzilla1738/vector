"""Check static original animation pins and replay the two-file proposal."""
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
for index in range(struct.unpack_from('>I', universal, 4)[0]):
    cpu, _, offset, length, _ = struct.unpack_from('>IIIII', universal, 8 + index * 20)
    if cpu == 0x100000c:
        arm = universal[offset:offset + length]
        break
else:
    raise AssertionError('Missing arm64 input')
assert hashlib.sha256(arm).hexdigest() == evidence['framework']['arm64Sha256']
sections = []
pos = 32
for _ in range(struct.unpack_from('<I', arm, 16)[0]):
    command, size = struct.unpack_from('<II', arm, pos)
    if command == 0x19:
        for index in range(struct.unpack_from('<I', arm, pos + 64)[0]):
            sections.append(struct.unpack_from('<QQI', arm, pos + 72 + index * 80 + 32))
    pos += size

def read(address, size):
    start, _, offset = next(s for s in sections if s[0] <= address < s[0] + s[1])
    return arm[offset + address - start:offset + address - start + size]

for row in evidence['functions']:
    assert hashlib.sha256(read(int(row['rva'], 16), row['bytes'])).hexdigest() == row['sha256'], row['name']
assert struct.unpack('<Q', read(0xe504700 + 9 * 8, 8))[0] & 0xfffffffff == 0x459a0f0
assert 0x21cffac + struct.unpack('<i', read(0xd2263c0 + 8 * 4, 4))[0] == 0x21d0428
for row in evidence['tween']['constants']:
    assert struct.unpack('<d', read(int(row['address'], 16), 8))[0] == row['value']
assert evidence['tween']['controlPoints'] == [0.05, 0, 0.133333, 0.06, 0.166666, 0.4, 0.208333, 0.82, 0.25, 1]
with tempfile.TemporaryDirectory(prefix='aux-popup-animation-') as directory:
    target = Path(directory)
    subprocess.run(['git', 'init', '-q', directory], check=True)
    for row in manifest['files']:
        path = row['path']
        assert sha(root / 'baseline' / path) == row['baselineSha256'], path
        assert sha(root / 'source' / path) == row['outputSha256'], path
        out = target / path
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes((root / 'baseline' / path).read_bytes())
    subprocess.run(['git', 'apply', '--check', str(root / 'native.patch')], cwd=target, check=True)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=target, check=True)
    for row in manifest['files']:
        assert sha(target / row['path']) == row['outputSha256'], row['path']

path = 'chrome/browser/extensions/api/aux_mini_popup/aux_mini_popup_api.cc'
before = (root / 'baseline' / path).read_text()
after = (root / 'source' / path).read_text()
assert 'gfx::LinearAnimation(base::Milliseconds(180), 60, nullptr)' in after
assert 'gfx::Tween::EASE_IN_OUT_EMPHASIZED' in after
assert 'gfx::Animation::PrefersReducedMotion()' in after
# Preserve the actual existing geometry and fit policy, changing only application.
for start, end, old, new in [
    ('  void Resize(gfx::Size size)', '  bool IsMainContents', 'widget_->SetBoundsConstrained(bounds);', 'SetPopupBounds(widget_.get(), bounds, bounds_animation_);'),
    ('  std::optional<std::string> ResizeOptions(', '  void SetState(', 'options_->SetBoundsConstrained(bounds);', 'SetPopupBounds(options_.get(), bounds, options_bounds_animation_);')]:
    assert before[before.index(start):before.index(end)].replace(old, new) == after[after.index(start):after.index(end)]
helper = after[after.index('void SetPopupBounds('):after.index('class PopupManager :')]
assert helper.index('animation.reset();') < helper.index('GetWindowBoundsInScreen() == target') < helper.index('PrefersReducedMotion()') < helper.index('animation->Start()')
assert 'if (!widget->IsVisible()) {\n    widget->SetBoundsConstrained(target);' in helper
for method, end in [('  void Hide()', '  void DestroyWindows()'), ('  void DestroyWindows()', '  void Resize(')]:
    body = after[after.index(method):after.index(end)]
    assert body.index('bounds_animation_.reset();') < body.index('if (options_)')
    assert body.index('options_bounds_animation_.reset();') < body.index('if (options_)')
assert after.count('SetPopupBounds(options_.get(), bounds, options_bounds_animation_);') == 1
assert 'options_bounds_animation_.reset();\n      options_->Close();' in after
assert '//ui/gfx/animation' in (root / 'source/chrome/browser/extensions/api/aux_mini_popup/BUILD.gn').read_text()
assert len(manifest['files']) == 2
print('Verified original functions/vtable/curve pins, two-file exact replay, unchanged geometry and animation cancellation order. No native execution or visual acceptance.')
