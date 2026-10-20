"""Replay only the observed unused-function correction; preserve menu behavior and glyphs."""
from pathlib import Path
import hashlib
import json
import subprocess
import tempfile

root = Path(__file__).resolve().parent
manifest = json.loads((root / 'manifest.json').read_text())
sha = lambda data: hashlib.sha256(data).hexdigest()
with tempfile.TemporaryDirectory(prefix='aux-primary-menu-api155-') as directory:
    for row in manifest['files']:
        old = (root / 'baseline' / row['path']).read_text()
        assert sha(old.encode()) == row['baselineSha256']
        expected = old
        for anchor in row['anchors']:
            assert expected.count(anchor['before']) == anchor['count'] == 1
            expected = expected.replace(anchor['before'], anchor['after'])
        assert expected == (root / 'source' / row['path']).read_text()
        path = Path(directory) / row['path']
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(old)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=directory,
                   check=True, capture_output=True)
    for row in manifest['files']:
        assert sha((Path(directory) / row['path']).read_bytes()) == row['outputSha256']
print('PASS: two exact compiler cleanup anchors and1-file disposable replay; not compiled')
