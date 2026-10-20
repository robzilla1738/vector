#!/usr/bin/env python3
"""Verify only static bytes and patch replay. Never execute import code."""
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

HERE = Path(__file__).resolve().parent
sha = lambda b: hashlib.sha256(b).hexdigest()
evidence = json.loads((HERE/'source-evidence.json').read_text())
original = Path(evidence['original']['path']).read_bytes()
assert sha(original) == evidence['original']['sha256']
for row in evidence['ranges']:
    assert sha(original[int(row['start'],16):int(row['endExclusive'],16)]) == row['sha256']
    assert sha((HERE/row['assembly']).read_bytes()) == row['assemblySha256']
for row in evidence['literals']:
    start = int(row['offset'],16)
    value = original[start:original.index(b'\0',start)]
    assert value.decode() == row['text'] and sha(value) == row['sha256']
for row in evidence['sourceKinds']:
    value = bytes.fromhex(row['bytesHex']); start = int(row['offset'],16)
    assert original[start:start+len(value)] == value
    assert value.decode('utf-16-le') == row['text'] and sha(value) == row['sha256']
for row in evidence['retained']:
    assert sha((HERE/row['path']).read_bytes()) == row['sha256']
for row in evidence['nativeApiPins']:
    assert sha((Path(evidence['nativeRoot'])/row['path']).read_bytes()) == row['sha256'], row['path']
manifest = json.loads((HERE/'manifest.json').read_text())
assert sha((HERE/'native.patch').read_bytes()) == manifest['patchSha256']
with tempfile.TemporaryDirectory(prefix='aux-clone-worker-source-') as name:
    root=Path(name)
    subprocess.run(['git','init','-q',str(root)],check=True)
    for row in manifest['files']:
        baseline=HERE/'baseline'/row['path']
        if row['baselineSha256'] is not None:
            assert sha(baseline.read_bytes()) == row['baselineSha256']
            for anchor in row.get('anchors', []):
                assert baseline.read_text().count(anchor['find']) == anchor['count']
            destination=root/row['path']; destination.parent.mkdir(parents=True,exist_ok=True)
            destination.write_bytes(baseline.read_bytes())
    subprocess.run(['git','-C',str(root),'apply','--check',str(HERE/'native.patch')],check=True)
    subprocess.run(['git','-C',str(root),'apply',str(HERE/'native.patch')],check=True)
    for row in manifest['files']:
        output=(HERE/'source'/row['path']).read_bytes()
        assert sha(output) == row['outputSha256']
        assert (root/row['path']).read_bytes() == output
print('PASS full worker/Arc/helper source pins and four-file exact patch replay; no import execution')
