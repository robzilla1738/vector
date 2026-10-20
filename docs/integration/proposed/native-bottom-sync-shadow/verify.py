"""Static source pins and disposable patch replay; never creates a sync service."""
from pathlib import Path
import contextlib
import hashlib
import io
import json
import runpy
import struct
import subprocess
import sys
import tempfile

root = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
manifest = json.loads((root / 'manifest.json').read_text())
evidence = json.loads((root / 'source-evidence.json').read_text())
assert sha(Path(evidence['arm64']['path']).read_bytes()) == evidence['arm64']['sha256']
sys.argv = ['decode', evidence['arm64']['path']]
with contextlib.redirect_stdout(io.StringIO()):
    decoder = runpy.run_path(str(root.parent / 'native-popup-material/decode-selectors.py'))
read = decoder['read']
for row in evidence['functions']:
    assert sha(read(int(row['rva'], 16), row['bytes'])) == row['sha256']
    assert sha((root / 'evidence' / (row['name'] + '.asm')).read_bytes()) == row['assemblySha256']
for row in evidence['inputs']:
    assert sha(Path(row['path']).read_bytes()) == row['sha256']
assert struct.unpack('<I', read(0xa6ddbdc, 4))[0] == 0xaa1403e1
assert struct.unpack('<I', read(0x4245298, 4))[0] == 0x5280018a
assert struct.unpack('<I', read(0x42452a0, 4))[0] == 0x1a8ab121
with tempfile.TemporaryDirectory(prefix='aux-bottom-shadow-replay-') as directory:
    for row in manifest['files']:
        p = row['path']
        old, new = (root / 'baseline' / p).read_bytes(), (root / 'source' / p).read_bytes()
        assert sha(old) == row['baselineSha256']
        assert sha(new) == row['outputSha256']
        target = Path(directory) / p
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(old)
    subprocess.run(['git', 'apply', '--check', str(root / 'native.patch')], cwd=directory, check=True)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=directory, check=True)
    for row in manifest['files']:
        assert sha((Path(directory) / row['path']).read_bytes()) == row['outputSha256']
code = (root / 'source' / manifest['files'][1]['path']).read_text()
assert 'std::make_unique<views::ViewShadow>(sync_card_, 12)' in code
assert 'sync_shadow_->SetRoundedCornerRadius(0)' in code
assert 'LayoutSuperclass<views::FlexLayoutView>(this)' in code
assert 'std::min(sync_card_->width(), sync_card_->height()) / 2, 0, 12' in code
assert 'SetRoundedCornerRadius(gfx::RoundedCornersF(12))' in code
assert 'sync_row_->SetVisible(false)' in code and 'sync_card_->SetVisible(false)' in code
for row in manifest['files']:
    expected = (root / 'baseline' / row['path']).read_text()
    for anchor in row['anchors']:
        assert expected.count(anchor['before']) == anchor['count'] == 1
        expected = expected.replace(anchor['before'], anchor['after'])
    assert expected == (root / 'source' / row['path']).read_text()
print('PASS: original shadow/layout/API pins, eight checked anchors and 2-file replay; not compiled')
