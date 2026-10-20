#!/usr/bin/env python3
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).resolve().parent
sha = lambda value: hashlib.sha256(value).hexdigest()
evidence = json.loads((root / 'source-evidence.json').read_text())
arm = Path(evidence['artifact']['path']).read_bytes()
assert sha(arm) == evidence['artifact']['sha256']
for function in evidence['functions']:
    start, stop = int(function['start'], 16), int(function['stopExclusive'], 16)
    assert sha(arm[start:stop]) == function['bytesSha256']
    assert sha((root / (function['name'] + '.asm')).read_bytes()) == function['asmSha256']
manifest = json.loads((root / 'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-chats-model-') as temporary:
    subprocess.run(['git', 'init', '-q', temporary], check=True)
    subprocess.run(['git', '-C', temporary, 'apply', '--check', str(root / 'native.patch')], check=True)
    subprocess.run(['git', '-C', temporary, 'apply', str(root / 'native.patch')], check=True)
    for entry in manifest['files']:
        assert entry['baselineSha256'] is None
        actual = (Path(temporary) / entry['path']).read_bytes()
        assert sha(actual) == entry['outputSha256']
        assert actual == (root / 'port' / entry['path']).read_bytes()
print('PASS: original section clip constructor/layout/cache invalidation and two-new-file replay; uncompiled/unmounted')
