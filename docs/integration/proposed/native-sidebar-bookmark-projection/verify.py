#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,subprocess,tempfile
p=Path(__file__).resolve().parent;sha=lambda b:hashlib.sha256(b).hexdigest();m=json.loads((p/'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-sidebar-projection-') as d:
 for f in m['files']:
  if f['baselineSha256'] is not None:
   old=(p/'baseline'/f['path']).read_bytes();assert sha(old)==f['baselineSha256'];q=Path(d)/f['path'];q.parent.mkdir(parents=True,exist_ok=True);q.write_bytes(old)
 subprocess.run(['git','-C',d,'apply','--check',str(p/'native.patch')],check=True)
 subprocess.run(['git','-C',d,'apply',str(p/'native.patch')],check=True)
 for f in m['files']:
  new=(Path(d)/f['path']).read_bytes();assert sha(new)==f['outputSha256'] and new==(p/'source'/f['path']).read_bytes()
e=json.loads((p/'source-evidence.json').read_text());b=Path(e['artifact']['path']).read_bytes();assert sha(b)==e['artifact']['sha256']
for f in e['functions']:
 assert sha(b[int(f['start'],16):int(f['stopExclusive'],16)])==f['bytesSha256'];assert sha((p/(f['name']+'.asm')).read_bytes())==f['asmSha256']
# Check the original unaligned uint32 zero and actual three byte states rather
# than relying on a decompiler's local variable names.
assert int.from_bytes(b[0x37e014c:0x37e0150],'little')==0xb801711f
assert int.from_bytes(b[0x4643c0c:0x4643c10],'little')==0x392e4a68
print('PASS six-file projection replay, fifteen original source ranges and b92 producer bytes; uncompiled/unmounted')
