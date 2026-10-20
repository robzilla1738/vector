#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,subprocess,tempfile
r=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
j=json.loads((r/'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-chats-controller-') as d:
 subprocess.run(['git','-C',d,'apply','--check',str(r/'native.patch')],check=True)
 subprocess.run(['git','-C',d,'apply',str(r/'native.patch')],check=True)
 for f in j['files']:
  assert f['baselineSha256'] is None
  data=(Path(d)/f['path']).read_bytes()
  assert sha(data)==f['outputSha256'] and data==(r/'port'/f['path']).read_bytes()
e=json.loads((r/'source-evidence.json').read_text())
b=Path(e['artifact']['path']).read_bytes();assert sha(b)==e['artifact']['sha256']
for f in e['functions']:
 assert sha(b[int(f['start'],16):int(f['stopExclusive'],16)])==f['bytesSha256']
 assert sha((r/(f['name']+'.asm')).read_bytes())==f['asmSha256']
repo=r.parents[3]
for p in e['reuseDependencies']:
 assert sha((repo/p['path']).read_bytes())==p['sha256']
print('PASS two-file disposable replay + original source/dependency pins; uncompiled/unmounted')
