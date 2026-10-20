#!/usr/bin/env python3
import hashlib,json
from pathlib import Path
sha=lambda b:hashlib.sha256(b).hexdigest()
h=Path(__file__).resolve().parent;e=json.loads((h/'source-evidence.json').read_text());b=Path(e['originalBinary']['path']).read_bytes();assert sha(b)==e['originalBinary']['sha256']
for r in e['ranges']:
 assert sha(b[int(r['start'],16):int(r['endExclusive'],16)])==r['bytesSha256']
 assert sha((h/r['file']).read_bytes())==r['sha256']
for a,text in e['literals'].items():
 p=int(a,16);assert b[p:b.index(b'\0',p)].decode()==text
for f in e['files']:assert sha(Path(f['path']).read_bytes())==f['sha256']
print('PASS original constructor/options/open/locking pins; no runtime operation')
