#!/usr/bin/env python3
"""Source pins and temporary replay only; no target/notification/key operations."""
import argparse,hashlib,json,struct,subprocess,tempfile
from pathlib import Path
sha=lambda b:hashlib.sha256(b).hexdigest()
def main():
 p=argparse.ArgumentParser();p.add_argument('--native-root',type=Path,required=True);a=p.parse_args()
 here=Path(__file__).resolve().parent
 e=json.loads((here/'source-evidence.json').read_text());m=json.loads((here/'manifest.json').read_text())
 b=Path(e['originalBinary']['path']).read_bytes();assert sha(b)==e['originalBinary']['sha256']
 for r in e['ranges']:
  assert sha(b[int(r['start'],16):int(r['endExclusive'],16)])==r['bytesSha256']
  assert sha((here/r['file']).read_bytes())==r['assemblySha256']
 for s in e['strings']:
  assert b[int(s['address'],16):].split(b'\0',1)[0].decode()==s['text']
 for f in e['readOnlyFiles']:assert sha(Path(f['path']).read_bytes())==f['sha256'],f['path']
 q=lambda n:struct.unpack_from('<Q',b,n)[0]&0xfffffffff
 w=lambda n:struct.unpack_from('<I',b,n)[0]
 assert q(0xe1aaee0)==0x40f9eb8 and q(0xe1aaee8)==0x77daf18
 assert w(0x40f9fc0)==0x52800004 and w(0x40fa024)==0x52800003
 assert w(0x77db040)==0x52800024 and w(0x77db0a4)==0x52800023
 assert b[0xcee9ac9:0xcee9ace]==bytes.fromhex('8100010001')
 assert w(0x452b00c)==0xf144003f # UTF8 size <=1MiB source comparison
 with tempfile.TemporaryDirectory(prefix='aux-notification-inbox-replay-') as d:
  tmp=Path(d)
  for f in m['files']:
   src=a.native_root/f['path'];target=tmp/f['path']
   if f['baselineSha256'] is None:assert not src.exists(),src
   else:
    raw=src.read_bytes();assert sha(raw)==f['baselineSha256'],src
    target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(raw)
  subprocess.run(['git','apply','--check',str(here/'native.patch')],cwd=tmp,check=True)
  subprocess.run(['git','apply',str(here/'native.patch')],cwd=tmp,check=True)
  for f in m['files']:
   raw=(tmp/f['path']).read_bytes();assert sha(raw)==f['outputSha256']
   assert raw==(here/'source'/f['path']).read_bytes()
 print('PASS: original source/bytes, both display identities, JSON cap and ten-file temporary replay; no target/OS/key operation')
if __name__=='__main__':main()
