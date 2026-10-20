#!/usr/bin/env python3
import hashlib,json,subprocess,tempfile
from pathlib import Path
sha=lambda b:hashlib.sha256(b).hexdigest()
h=Path(__file__).resolve().parent;m=json.loads((h/'manifest.json').read_text());e=json.loads((h/'source-evidence.json').read_text())
b=Path(e['originalBinary']['path']).read_bytes();assert sha(b)==e['originalBinary']['sha256']
for r in e['ranges']:
 assert sha(b[int(r['start'],16):int(r['endExclusive'],16)])==r['bytesSha256']
 assert sha((h/r['file']).read_bytes())==r['sha256']
a=int(e['sql']['address'],16);assert b[a:b.index(b'\0',a)].decode()==e['sql']['text']
for f in e['files']:assert sha(Path(f['path']).read_bytes())==f['sha256']
with tempfile.TemporaryDirectory(prefix='aux-password-metadata-') as d:
 t=Path(d)
 for f in m['files']:
  raw=(h/'baseline'/f['path']).read_bytes();assert sha(raw)==f['baselineSha256']
  p=t/f['path'];p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(raw)
 subprocess.run(['git','apply',str(h/'native.patch')],cwd=t,check=True)
 for f in m['files']:assert sha((t/f['path']).read_bytes())==f['outputSha256']
print('PASS: original27-column projection/native field pins and two-file parent replay; no runtime operation')
