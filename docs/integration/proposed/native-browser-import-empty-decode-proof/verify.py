#!/usr/bin/env python3
import hashlib,json
from pathlib import Path
h=Path(__file__).resolve().parent;e=json.loads((h/'source-evidence.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest();b=Path(e['originalBinary']['path']).read_bytes();assert sha(b)==e['originalBinary']['sha256']
for r in e['ranges']:
 assert sha(b[int(r['start'],16):int(r['endExclusive'],16)])==r['bytesSha256'];assert sha((h/r['file']).read_bytes())==r['sha256']
print('PASS: original input/output and empty-success counter raw pins; no native change')
