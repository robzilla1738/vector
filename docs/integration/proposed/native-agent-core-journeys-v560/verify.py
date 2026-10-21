#!/usr/bin/env python3
import hashlib
import json
from pathlib import Path
root = Path(__file__).resolve().parent
for row in json.loads((root / 'evidence.json').read_text())['inputs']:
    data = Path(row['path']).read_bytes()
    assert hashlib.sha256(data).hexdigest() == row['sha256'], row['path']
    for span in row.get('spans', []):
        raw = data[span['offset']:span['offset'] + span['bytes']]
        assert hashlib.sha256(raw).hexdigest() == span['sha256']
        assert raw.decode() == span['text']
        assert span['needle'] in span['text']
print('PASS: pinned current static journey boundaries and original RPC spans; no runtime acceptance')
