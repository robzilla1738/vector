#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,subprocess,tempfile
p=Path(__file__).resolve().parent;sha=lambda x:hashlib.sha256(x).hexdigest();m=json.loads((p/'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-unpinned-owner-') as d:
 for f in m['files']:
  old=(p/'baseline'/f['path']).read_bytes();assert sha(old)==f['baselineSha256'];q=Path(d)/f['path'];q.parent.mkdir(parents=True,exist_ok=True);q.write_bytes(old)
 subprocess.run(['git','-C',d,'apply','--check',str(p/'native.patch')],check=True)
 subprocess.run(['git','-C',d,'apply',str(p/'native.patch')],check=True)
 for f in m['files']:
  new=(Path(d)/f['path']).read_bytes();assert sha(new)==f['outputSha256'];assert new==(p/'source'/f['path']).read_bytes()
e=json.loads((p/'source-evidence.json').read_text());b=Path(e['artifact']['path']).read_bytes();assert sha(b)==e['artifact']['sha256']
for f in e['functions']:
 assert sha(b[int(f['start'],16):int(f['stopExclusive'],16)])==f['bytesSha256'];assert sha((p/(f['name']+'.asm')).read_bytes())==f['asmSha256']
for x in e['literals']:
 a=int(x['address'],16);v=b[a:b.index(0,a)];assert v.decode()==x['text'] and sha(v)==x['bytesSha256']
print('PASS three-file patch replay and eight original source ranges; uncompiled/unmounted')
