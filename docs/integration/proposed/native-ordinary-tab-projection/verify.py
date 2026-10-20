#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,subprocess,tempfile
r=Path(__file__).resolve().parent;sha=lambda b:hashlib.sha256(b).hexdigest();j=json.loads((r/'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-task-expansion-') as d:
 for f in j['files']:
  if f['baselineSha256'] is not None:
   p=Path(d)/f['path'];p.parent.mkdir(parents=True,exist_ok=True);v=(r/'baseline'/f['path']).read_bytes();assert sha(v)==f['baselineSha256'];p.write_bytes(v)
 subprocess.run(['git','-C',d,'apply','--check',str(r/'native.patch')],check=True)
 subprocess.run(['git','-C',d,'apply',str(r/'native.patch')],check=True)
 for f in j['files']:
  v=(Path(d)/f['path']).read_bytes();assert sha(v)==f['outputSha256'] and v==(r/'port'/f['path']).read_bytes()
print('PASS actual350 five-file recursive projection replay; uncompiled/unmounted')
e=json.loads((r/'source-evidence.json').read_text());b=Path(e['artifact']['path']).read_bytes();assert sha(b)==e['artifact']['sha256']
for f in e['functions']:
 assert sha(b[int(f['start'],16):int(f['stopExclusive'],16)])==f['bytesSha256']
 assert sha((r/(f['name']+'.asm')).read_bytes())==f['asmSha256']
print("PASS original recursive visibility/bookmark/saved-pin/agent-marker source pins")
