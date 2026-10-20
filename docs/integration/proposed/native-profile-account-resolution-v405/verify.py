#!/usr/bin/env python3
"""Pinned static resolver contracts; no profile/OS/authority operation."""
import hashlib,json
from pathlib import Path
h=Path(__file__).resolve().parent;e=json.loads((h/'source-evidence.json').read_text())
for f in e['files']:assert hashlib.sha256(Path(f['path']).read_bytes()).hexdigest()==f['sha256'],f['path']
for a in e['anchors']:assert Path(a['path']).read_text().count(a['text'])==a['count'],a['path']
print('PASS: v405 observation/source pins and exact legacy context/resolver anchors; no target execution')
