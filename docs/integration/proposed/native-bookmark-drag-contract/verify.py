"""Static supplied source pins and exact disposable patch replay; no native execution."""
from pathlib import Path
import contextlib
import hashlib
import io
import json
import runpy
import subprocess
import sys
import tempfile

root = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
evidence = json.loads((root / 'source-evidence.json').read_text())
manifest = json.loads((root / 'manifest.json').read_text())
assert sha(Path(evidence['arm64']['path']).read_bytes()) == evidence['arm64']['sha256']
sys.argv = ['decode', evidence['arm64']['path']]
with contextlib.redirect_stdout(io.StringIO()):
    decoder = runpy.run_path(str(root.parent / 'native-popup-material/decode-selectors.py'))
for item in evidence['functions']:
    assert sha(decoder['read'](int(item['rva'], 16), item['bytes'])) == item['sha256']
    assert sha((root / 'evidence' / (item['name'] + '.asm')).read_bytes()) == item['assemblySha256']
for item in evidence['literals']:
    assert decoder['cstr'](int(item['rva'], 16)) == item['value']
for item in evidence['inputs']:
    assert sha(Path(item['path']).read_bytes()) == item['sha256']
anchors = json.loads((root / 'anchors.json').read_text())
assert len(anchors) == 2
for item in anchors:
    baseline = (root / 'baseline' / item['path']).read_text()
    assert baseline.count(item['before']) == item['count'] == 1
for path in {item['path'] for item in anchors}:
    expected = (root / 'baseline' / path).read_text()
    for item in anchors:
        if item['path'] == path:
            assert expected.count(item['before']) == 1
            expected = expected.replace(item['before'], item['after'], 1)
    assert expected == (root / 'source' / path).read_text()
with tempfile.TemporaryDirectory(prefix='aux-bookmark-drag-contract-replay-') as temp:
    for item in manifest['files']:
        if item['baselineSha256'] is not None:
            baseline = root / 'baseline' / item['path']
            assert sha(baseline.read_bytes()) == item['baselineSha256']
            target = Path(temp) / item['path']
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(baseline.read_bytes())
    subprocess.run(['git', 'apply', '--check', str(root / 'native.patch')], cwd=temp, check=True)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=temp, check=True)
    for item in manifest['files']:
        assert sha((Path(temp) / item['path']).read_bytes()) == item['outputSha256']
        assert sha((root / 'source' / item['path']).read_bytes()) == item['outputSha256']
drag = (root / 'evidence/begin-during-drag.asm').read_text()
release = (root / 'evidence/begin-during-release.asm').read_text()
assert 'add\tx2, sp, #0x30' in drag and 'add\tx3, sp, #0x20' in drag and 'add\tx4, sp, #0x58' in drag
assert 'add\tx2, sp, #0x20' in release and 'add\tx3, sp, #0x10' in release and 'add\tx4, sp, #0x48' in release
assert 'mov\tx24, x0' in drag and 'mov\tx23, x0' in release
print('PASS: genuine typed begin/copy/coordinate source pins, two anchors and three-file disposable replay; no compile/runtime claim')
