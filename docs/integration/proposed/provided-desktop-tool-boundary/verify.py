#!/usr/bin/env python3
"""Verify static source/excerpt pins; never import or execute supplied code."""
from pathlib import Path
import hashlib
import json
here = Path(__file__).resolve().parent
manifest = json.loads((here / 'source-evidence.json').read_text())
count = 0
for source in manifest['sources']:
    data = Path(source['path']).read_bytes()
    assert len(data) == source['size']
    assert hashlib.sha256(data).hexdigest() == source['sha256']
    for item in source['excerpts']:
        excerpt = (here / item['path']).read_bytes()
        assert len(excerpt) == item['size']
        assert hashlib.sha256(excerpt).hexdigest() == item['sha256']
        assert data[item['byteOffset']:item['byteOffset'] + item['size']] == excerpt
        count += 1
print(f'PASS: {len(manifest["sources"])} static sources, {count} byte-exact excerpts; no runtime operations')
