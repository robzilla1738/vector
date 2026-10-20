#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,subprocess,tempfile
p=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
m=json.loads((p/'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-empty-pinned-proposal-') as d:
 for f in m['files']:
  old=(p/'baseline'/f['path']).read_bytes();assert sha(old)==f['baselineSha256']
  q=Path(d)/f['path'];q.parent.mkdir(parents=True,exist_ok=True);q.write_bytes(old)
 subprocess.run(['git','-C',d,'apply','--check',str(p/'native.patch')],check=True)
 subprocess.run(['git','-C',d,'apply',str(p/'native.patch')],check=True)
 for f in m['files']:
  actual=(Path(d)/f['path']).read_bytes()
  assert sha(actual)==f['outputSha256'] and actual==(p/'source'/f['path']).read_bytes()
e=json.loads((p/'source-evidence.json').read_text());b=Path(e['artifact']['path']).read_bytes()
assert sha(b)==e['artifact']['sha256']
for f in e['functions']:
 assert sha(b[int(f['start'],16):int(f['stopExclusive'],16)])==f['bytesSha256']
 assert sha((p/(f['name']+'.asm')).read_bytes())==f['asmSha256']
# Actual group engaged byte, pinned-data byte, stop-state, and metric selector.
for address,encoding in [(0x465aa24,'08404239'),(0x465a754,'cbf90737'),(0x465a72c,'3f190071'),(0x464d454,'40078052')]:
 assert b[address:address+4].hex()==encoding
print('PASS three-file isolated replay and three original range pins; no native compile/runtime')
