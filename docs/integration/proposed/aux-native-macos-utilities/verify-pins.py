#!/usr/bin/env python3
"""Read only static supplied implementation and proposal sources, never owner state."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parents[4]
pins = json.loads(Path(__file__).with_name('source-pins.json').read_text())
for entry in [pins['originalAddon'], *pins['evidence'], *pins['source']]:
    path = Path(entry['path'])
    if not path.is_absolute():
        path = root / path
    actual = hashlib.sha256(path.read_bytes()).hexdigest()
    if actual != entry['sha256']:
        raise SystemExit(f'Static source pin mismatch: {path}')
print('Pinned supplied addon, bounded disassembly and implementation verified')
