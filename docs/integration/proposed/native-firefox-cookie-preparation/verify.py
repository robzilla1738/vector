#!/usr/bin/env python3
"""Static source pins and disposable new-file patch replay; no native code runs."""
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

HERE = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
evidence = json.loads((HERE / 'source-evidence.json').read_text())
original = Path(evidence['original']['path']).read_bytes()
assert sha(original) == evidence['original']['sha256']
for row in evidence['ranges']:
    assert sha(original[int(row['start'], 16):int(row['endExclusive'], 16)]) == row['sha256']
    assert sha((HERE / row['assembly']).read_bytes()) == row['assemblySha256']
for row in evidence['literals']:
    offset = int(row['offset'], 16)
    data = original[offset:original.index(b'\0', offset)]
    assert data.decode() == row['text'] and sha(data) == row['sha256']
decompile = evidence['originalDecompile']
assert sha((HERE / decompile['copy']).read_bytes()) == decompile['sha256']
for row in evidence['nativeApiPins']:
    assert sha((Path(evidence['nativeRoot']) / row['path']).read_bytes()) == row['sha256'], row['path']
manifest = json.loads((HERE / 'manifest.json').read_text())
assert sha((HERE / 'native.patch').read_bytes()) == manifest['patchSha256']
with tempfile.TemporaryDirectory(prefix='aux-firefox-cookie-source-') as name:
    root = Path(name)
    subprocess.run(['git', 'init', '-q', str(root)], check=True)
    subprocess.run(['git', '-C', str(root), 'apply', '--check', str(HERE / 'native.patch')], check=True)
    subprocess.run(['git', '-C', str(root), 'apply', str(HERE / 'native.patch')], check=True)
    for row in manifest['files']:
        assert row['baselineSha256'] is None
        expected = (HERE / 'source' / row['path']).read_bytes()
        assert sha(expected) == row['outputSha256']
        assert (root / row['path']).read_bytes() == expected
print('PASS: original source/API pins and two-file disposable patch replay; no native execution')
