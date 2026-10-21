#!/usr/bin/env python3
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).resolve().parent
manifest = json.loads((root / 'manifest.json').read_text())
for row in manifest['files']:
    before = (root / 'baseline' / row['path']).read_bytes()
    after = (root / 'source' / row['path']).read_bytes()
    assert hashlib.sha256(before).hexdigest() == row['baselineSha256']
    assert hashlib.sha256(after).hexdigest() == row['outputSha256']
    text = before.decode()
    for anchor in row['anchors']:
        assert text.count(anchor['find']) == anchor['count'] == 1
        text = text.replace(anchor['find'], anchor['replace'])
    assert text.encode() == after
with tempfile.TemporaryDirectory(prefix='aux-settings-links-') as directory:
    temporary = Path(directory)
    for row in manifest['files']:
        path = temporary / row['path']
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes((root / 'baseline' / row['path']).read_bytes())
    subprocess.run(['git', 'apply', '--check', str(root / 'native.patch')], cwd=temporary, check=True)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=temporary, check=True)
    for row in manifest['files']:
        assert (temporary / row['path']).read_bytes() == (root / 'source' / row['path']).read_bytes()
print('PASS: exact one-file counted replay and disposable patch application')
