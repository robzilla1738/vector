#!/usr/bin/env python3
"""Static source pins + disposable patch replay only; no import/native execution."""
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
HERE = Path(__file__).resolve().parent
sha = lambda b: hashlib.sha256(b).hexdigest()
e = json.loads((HERE/'source-evidence.json').read_text())
original = Path(e['original']['path']).read_bytes()
assert sha(original) == e['original']['sha256']
for row in e['ranges']:
    assert sha(original[int(row['start'],16):int(row['endExclusive'],16)]) == row['sha256']
    assert sha((HERE/row['assembly']).read_bytes()) == row['assemblySha256']
for row in e['literals']:
    start = int(row['offset'],16)
    value = original[start:start+row['lengthBytes']]
    assert value.decode(row['encoding']) == row['text']
    assert sha(value) == row['sha256']
m = json.loads((HERE/'manifest.json').read_text())
assert sha((HERE/'native.patch').read_bytes()) == m['patchSha256']
with tempfile.TemporaryDirectory(prefix='aux-safari-owner-source-') as name:
    root = Path(name)
    subprocess.run(['git','init','-q',str(root)],check=True)
    for row in m['files']:
        if row['baselineSha256'] is None:
            continue
        data = (HERE/'baseline'/row['path']).read_bytes()
        assert sha(data) == row['baselineSha256']
        for anchor in row['anchors']:
            assert data.decode().count(anchor['find']) == anchor['count']
        path = root/row['path']; path.parent.mkdir(parents=True,exist_ok=True)
        path.write_bytes(data)
    subprocess.run(['git','-C',str(root),'apply','--check',str(HERE/'native.patch')],check=True)
    subprocess.run(['git','-C',str(root),'apply',str(HERE/'native.patch')],check=True)
    for row in m['files']:
        output = (HERE/'source'/row['path']).read_bytes()
        assert sha(output) == row['outputSha256']
        assert (root/row['path']).read_bytes() == output
print('PASS original Safari owner/warning bytes and six-file exact replay; no native execution')
