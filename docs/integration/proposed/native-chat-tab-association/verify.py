#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,subprocess,tempfile
r=Path(__file__).resolve().parent;sha=lambda b:hashlib.sha256(b).hexdigest()
e=json.loads((r/'source-evidence.json').read_text());b=Path(e['artifact']['path']).read_bytes();assert sha(b)==e['artifact']['sha256']
for f in e['functions']:
 assert sha(b[int(f['start'],16):int(f['stopExclusive'],16)])==f['bytesSha256']
 assert sha((r/(f['name']+'.asm')).read_bytes())==f['asmSha256']
j=json.loads((r/'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-chat-owner-') as d:
 subprocess.run(['git','init','-q',d],check=True)
 subprocess.run(['git','-C',d,'apply','--check',str(r/'native.patch')],check=True)
 subprocess.run(['git','-C',d,'apply',str(r/'native.patch')],check=True)
 for f in j['files']:
  assert f['baselineSha256'] is None
  v=(Path(d)/f['path']).read_bytes();assert sha(v)==f['outputSha256'] and v==(r/'port'/f['path']).read_bytes()
print('PASS pinned original source ranges and exact new-file patch replay; uncompiled/unmounted')
