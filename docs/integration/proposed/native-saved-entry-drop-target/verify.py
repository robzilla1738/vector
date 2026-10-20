#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,subprocess,tempfile
p=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
m=json.loads((p/'manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='aux-empty-pinned-proposal-') as d:
 for f in m['files']:
  old=(p/'baseline'/f['path']).read_bytes();assert not old if f['baselineSha256'] is None else sha(old)==f['baselineSha256']
  if f['baselineSha256'] is None: continue
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
assert sha(b[0xe508f60:0xe508fb0])==e['targetVtable']['sha256']
print('PASS four-file isolated replay and original standalone delegate source pins; uncompiled/unmounted')
