#!/usr/bin/env python3
"""Verify original static pins and replay only new source files in a tempdir."""
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
p = Path(__file__).resolve().parent
manifest = json.loads((p / 'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-bookmark-hint-replay-') as directory:
    checkout = Path(directory)
    subprocess.run(['patch', '-s', '-p1', '-i', str(p / 'native.patch')],
                   cwd=checkout, check=True)
    for item in manifest['files']:
        assert item['baselineSha256'] is None
        actual = (checkout / item['path']).read_bytes()
        assert hashlib.sha256(actual).hexdigest() == item['outputSha256']
        assert actual == (p / 'source' / item['path']).read_bytes()
source = json.loads((p / 'source-evidence.json').read_text())
with Path(source['arm64']['path']).open('rb') as binary:
    for item in source['functions']:
        binary.seek(item['fileOffset'])
        assert hashlib.sha256(binary.read(item['bytes'])).hexdigest() == item['sha256']
print('PASS: two new source outputs replayed; 20 bounded original source/data pins; no native/runtime claim')
