from pathlib import Path
import hashlib
import json
import subprocess
import tempfile

root = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
manifest = json.loads((root / 'manifest.json').read_text())
anchors = json.loads((root / 'anchors.json').read_text())
evidence = json.loads((root / 'source-evidence.json').read_text())
for item in evidence['ranges']:
    assert sha((root / 'evidence' / item['listing']).read_bytes()) == item['listingSha256']
for item in evidence['data']:
    assert sha((root / 'evidence' / item['file']).read_bytes()) == item['sha256']
for item in evidence['api155']:
    assert sha((root / 'evidence' / item['snapshot']).read_bytes()) == item['sha256']
for item in manifest['files']:
    before = (root / 'baseline' / item['path']).read_text()
    assert sha(before.encode()) == item['baselineSha256']
    after = before
    for anchor in (a for a in anchors if a['path'] == item['path']):
        assert after.count(anchor['before']) == anchor['count'], anchor['name']
        after = after.replace(anchor['before'], anchor['after'])
    assert sha(after.encode()) == item['outputSha256']
    assert after == (root / 'source' / item['path']).read_text()
with tempfile.TemporaryDirectory(prefix='aux-immersive-sidebar-replay-') as temp:
    for item in manifest['files']:
        target = Path(temp) / item['path']
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes((root / 'baseline' / item['path']).read_bytes())
    patch = str((root / 'native.patch').resolve())
    subprocess.run(['git', 'apply', '--check', patch], cwd=temp, check=True)
    subprocess.run(['git', 'apply', patch], cwd=temp, check=True)
    for item in manifest['files']:
        assert sha((Path(temp) / item['path']).read_bytes()) == item['outputSha256']
assert len(manifest['files']) == 1 and len(anchors) == 2
assert manifest['sharedSourceModified'] is False
print('PASS: two counted anchors, six supplied code ranges, three data pins, four actual155 excerpts and one-file disposable replay; no compile/runtime claim.')
