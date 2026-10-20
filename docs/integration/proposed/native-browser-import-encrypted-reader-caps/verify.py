#!/usr/bin/env python3
import hashlib,json,subprocess,tempfile
from pathlib import Path
sha=lambda b:hashlib.sha256(b).hexdigest()
h=Path(__file__).resolve().parent;m=json.loads((h/'manifest.json').read_text());e=json.loads((h/'source-evidence.json').read_text())
b=Path(e['originalBinary']['path']).read_bytes();assert sha(b)==e['originalBinary']['sha256']
for r in e['ranges']:
 assert sha(b[int(r['start'],16):int(r['endExclusive'],16)])==r['bytesSha256']
 assert sha((h/r['file']).read_bytes())==r['sha256']
for a,sql in e['sql'].items():
 start=int(a,16);assert b[start:b.index(b'\0',start)].decode()==sql
with tempfile.TemporaryDirectory(prefix='aux-cookie-source-') as d:
 t=Path(d)
 for f in m['files']:
  raw=(h/'baseline'/f['path']).read_bytes();assert sha(raw)==f['baselineSha256']
  p=t/f['path'];p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(raw)
 subprocess.run(['git','apply',str(h/'native.patch')],cwd=t,check=True)
 for f in m['files']:assert sha((t/f['path']).read_bytes())==f['outputSha256']
print('PASS: original unbounded encrypted reader/SQL/decoder pins and two-file replay; no runtime operation')
