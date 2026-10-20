#!/usr/bin/env python3
"""Check immutable source pins and replay new native files; never run the worker."""
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
    assert sha(original[int(row['start'],16):int(row['endExclusive'],16)]) == row['sha256']
    assert sha((HERE / row['assembly']).read_bytes()) == row['assemblySha256']
for row in evidence['literals']:
    offset = int(row['offset'],16)
    value = original[offset:original.index(b'\0',offset)]
    assert value.decode() == row['text'] and sha(value) == row['sha256']
    if 'table' in row:
        table = int(row['table'],16)
        assert original[table:table+8].hex() == row['tableBytesHex']
kind = evidence['sourceKindMapping']
raw = bytes.fromhex(kind['labelBytesHex'])
assert original[int(kind['labelOffset'],16):int(kind['labelOffset'],16)+len(raw)] == raw
assert raw.decode(kind['labelEncoding']) == kind['label'] and sha(raw) == kind['sha256']
for row in evidence['retainedSourceAndRea']:
    assert sha((HERE / row['path']).read_bytes()) == row['sha256']
for row in evidence['nativeApiPins']:
    assert sha((Path(evidence['nativeRoot'])/row['path']).read_bytes()) == row['sha256'], row['path']
manifest = json.loads((HERE / 'manifest.json').read_text())
assert sha((HERE/'native.patch').read_bytes()) == manifest['patchSha256']
with tempfile.TemporaryDirectory(prefix='aux-clone-source-replay-') as name:
    root = Path(name)
    subprocess.run(['git','init','-q',str(root)],check=True)
    subprocess.run(['git','-C',str(root),'apply','--check',str(HERE/'native.patch')],check=True)
    subprocess.run(['git','-C',str(root),'apply',str(HERE/'native.patch')],check=True)
    for row in manifest['files']:
        assert row['baselineSha256'] is None
        content = (HERE/'source'/row['path']).read_bytes()
        assert sha(content) == row['outputSha256']
        assert (root/row['path']).read_bytes() == content
print('PASS original clone/preference source pins + two-new-file patch replay; worker not executed')
