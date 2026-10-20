#!/usr/bin/env python3
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
evidence = json.loads((ROOT / 'source-evidence.json').read_text())
sources = {}
for entry in evidence['sources']:
    path = Path(entry['path'])
    data = path.read_bytes()
    assert sha(data) == entry['sha256'], str(path)
    sources[str(path).split('/chromium/src/')[1]] = data.decode()
for anchor in evidence['anchors']:
    assert anchor['find'] in sources[anchor['path']], anchor
manifest = json.loads((ROOT / 'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-ntp-probe-') as temporary:
    stage = Path(temporary)
    for entry in manifest['files']:
        data = (ROOT / 'baseline' / entry['path']).read_bytes()
        assert sha(data) == entry['baselineSha256']
        target = stage / entry['path']
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    subprocess.run(['git', 'init', '-q', str(stage)], check=True)
    subprocess.run(['git', '-C', str(stage), 'apply', '--check', str(ROOT / 'native.patch')], check=True)
    subprocess.run(['git', '-C', str(stage), 'apply', str(ROOT / 'native.patch')], check=True)
    for entry in manifest['files']:
        data = (stage / entry['path']).read_bytes()
        assert sha(data) == entry['outputSha256']
        assert data == (ROOT / 'port' / entry['path']).read_bytes()
        baseline = (ROOT / 'baseline' / entry['path']).read_text()
        assert baseline.count('"fjdhphbdlfjogobdofoaagnlnkoibdge"') == 1
        assert data.decode() == baseline.replace('"fjdhphbdlfjogobdofoaagnlnkoibdge"', '"gokkffaiccpmoeodpmeamcjajcagjmkm"')
print('PASS: actual readiness/override/probe source anchors and exact one-identity patch replay; no runtime race claim')
