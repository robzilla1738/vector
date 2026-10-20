#!/usr/bin/env python3
"""Replay the isolated two-file proposal without touching native source."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile

proposal = Path(__file__).resolve().parent
manifest = json.loads((proposal / 'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-pin-drop-replay-') as directory:
    checkout = Path(directory)
    for item in manifest['files']:
        relative = item['path']
        baseline = proposal / 'baseline' / relative
        output = proposal / 'port' / relative
        assert hashlib.sha256(baseline.read_bytes()).hexdigest() == item['baselineSha256']
        assert hashlib.sha256(output.read_bytes()).hexdigest() == item['outputSha256']
        target = checkout / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(baseline, target)
    subprocess.run(['patch', '-s', '-p1', '-i', str(proposal / 'native.patch')],
                   cwd=checkout, check=True)
    for item in manifest['files']:
        actual = (checkout / item['path']).read_bytes()
        assert hashlib.sha256(actual).hexdigest() == item['outputSha256']

source = json.loads((proposal / 'source-evidence.json').read_text())
with Path(source['arm64']['path']).open('rb') as binary:
    for item in source['functions']:
        binary.seek(item['fileOffset'])
        assert hashlib.sha256(binary.read(item['bytes'])).hexdigest() == item['sha256']
print('PASS: two-file replay and ten bounded original-source pins; no native build/runtime claim')
