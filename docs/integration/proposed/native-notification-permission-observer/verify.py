#!/usr/bin/env python3
"""Pinned original evidence and pure temporary parent-output replay."""
import hashlib,json,subprocess,tempfile
from pathlib import Path
sha=lambda b:hashlib.sha256(b).hexdigest()
def main():
 h=Path(__file__).resolve().parent;e=json.loads((h/'source-evidence.json').read_text());m=json.loads((h/'manifest.json').read_text())
 b=Path(e['originalBinary']['path']).read_bytes();assert sha(b)==e['originalBinary']['sha256']
 for r in e['ranges']:
  assert sha(b[int(r['start'],16):int(r['endExclusive'],16)])==r['bytesSha256']
  assert sha((h/r['file']).read_bytes())==r['assemblySha256']
 for s in e['strings']:assert b[int(s['address'],16):].split(b'\0',1)[0].decode()==s['text']
 for f in e['readOnlyFiles']:assert sha(Path(f['path']).read_bytes())==f['sha256']
 parent=h.parent/'native-notification-inbox-pipeline'/'source'
 with tempfile.TemporaryDirectory(prefix='aux-notification-observer-replay-') as d:
  tmp=Path(d)
  for f in m['files']:
   raw=(parent/f['path']).read_bytes();assert sha(raw)==f['baselineSha256']
   t=tmp/f['path'];t.parent.mkdir(parents=True,exist_ok=True);t.write_bytes(raw)
  subprocess.run(['git','apply','--check',str(h/'native.patch')],cwd=tmp,check=True)
  subprocess.run(['git','apply',str(h/'native.patch')],cwd=tmp,check=True)
  for f in m['files']:
   raw=(tmp/f['path']).read_bytes();assert sha(raw)==f['outputSha256']
   assert raw==(h/'source'/f['path']).read_bytes()
 print('PASS: original observer/snapshot/callback pins and three-file temporary parent replay; no OS operation')
if __name__=='__main__':main()
