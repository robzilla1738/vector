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
for c in e['constants']:
 a=int(c['address'],16);assert sha(b[a:a+c['bytes']])==c['bytesSha256']
import struct
assert struct.unpack_from('<4i',b,0xdf47a50)==(4,8,8,8)
assert struct.unpack_from('<4i',b,0xdf40060)==(5,0,5,0)
assert struct.unpack_from('<I',b,0xe9101e0)[0]==229
# Positive original color expression: MOVZ/MOVK then dark-select of literals.
assert b[0x35e7984:0x35e798c].hex()=='495f9f52495fa372'
assert b[0x35e7990:0x35e7998].hex()=='484181524841a372'
assert int.from_bytes(b[0x37e19ac:0x37e19b0],'little')==0xd2c00021
print('PASS three-file presentation replay and eight original ranges/constants; uncompiled/unmounted')
