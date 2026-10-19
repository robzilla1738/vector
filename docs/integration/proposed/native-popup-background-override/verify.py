"""Verify pinned original color slots and exact native patch replay, without execution."""
import hashlib
import json
from pathlib import Path
import struct
import subprocess
import tempfile

root = Path(__file__).resolve().parent
manifest = json.loads((root / 'manifest.json').read_text())
evidence = json.loads((root / 'source-evidence.json').read_text())

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

for row in evidence['inputs']:
    assert digest(Path(row['path'])) == row['sha256'], row['path']
original = Path(evidence['framework']['path']).read_bytes()
assert original[:4] == bytes.fromhex('cafebabe')
for index in range(struct.unpack_from('>I', original, 4)[0]):
    cpu, _, offset, size, _ = struct.unpack_from('>IIIII', original, 8 + 20 * index)
    if cpu == 0x100000c:
        arm = original[offset:offset + size]
        break
else:
    raise AssertionError('Missing pinned arm64 input')
assert hashlib.sha256(arm).hexdigest() == evidence['framework']['arm64Sha256']
for row in evidence['vtableNeighbors']:
    start = int(row['offset'], 16)
    for relative, target in row['neighbors']:
        raw = struct.unpack_from('<Q', arm, start + relative * 8)[0]
        assert raw & 0xfffffffff == int(target, 16)

with tempfile.TemporaryDirectory(prefix='aux-popup-override-') as name:
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
    patch = str(root / 'native-popup-background-override.patch')
    subprocess.run(['git', 'apply', '--check', patch], cwd=replay, check=True)
    subprocess.run(['git', 'apply', patch], cwd=replay, check=True)
    for row in manifest['files']:
        assert digest(replay / row['path']) == row['outputSha256'], row['path']

base = (root / 'source/content/browser/renderer_host/render_widget_host_view_base.cc').read_text()
getter = base[base.index('std::optional<SkColor> RenderWidgetHostViewBase::GetBackgroundColor()'):]
getter = getter[:getter.index('\n}')]
assert getter.index('background_color_override_') < getter.index('content_background_color_') < getter.index('default_background_color_')
copy = base[base.index('void RenderWidgetHostViewBase::CopyBackgroundColorIfPresentFrom('):]
copy = copy[:copy.index('\n}')]
for field in ['content_background_color_', 'background_color_override_', 'default_background_color_']:
    assert f'!other_base.{field}' in copy
    assert f'{field} == other_base.{field}' in copy
    assert f'{field} = other_base.{field}' in copy
popup = (root / 'source/chrome/browser/extensions/api/aux_mini_popup/aux_mini_popup_api.cc').read_text()
assert 'view->SetBackgroundColor(SK_ColorTRANSPARENT);\n    view->SetBackgroundColorOverride(SK_ColorTRANSPARENT);' in popup
assert not any('web_contents_set_background_color' in row['path'] for row in manifest['files'])
assert not any('render_widget_host_view_mac' in row['path'] for row in manifest['files'])
print('Verified actual arm64/vtable/input pins, four-file exact replay, three-color precedence/copy and unchanged generic observer/Mac sources. No native execution.')
