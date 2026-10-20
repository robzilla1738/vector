#!/usr/bin/env python3
import argparse,hashlib,json,subprocess,tempfile
from pathlib import Path
sha=lambda b:hashlib.sha256(b).hexdigest()
p=argparse.ArgumentParser();p.add_argument('--native-root',type=Path,required=True);a=p.parse_args();h=Path(__file__).resolve().parent;e=json.loads((h/'source-evidence.json').read_text());m=json.loads((h/'manifest.json').read_text())
b=Path(e['originalBinary']['path']).read_bytes();assert sha(b)==e['originalBinary']['sha256']
for r in e['ranges']:
 assert sha(b[int(r['start'],16):int(r['endExclusive'],16)])==r['bytesSha256'];assert sha((h/r['file']).read_bytes())==r['sha256']
for f in e['files']:assert sha(Path(f['path']).read_bytes())==f['sha256']
with tempfile.TemporaryDirectory(prefix='aux-import-full-staging-') as d:
 t=Path(d)
 for f in m['files']:
  source=(h.parent/'native-browser-import-full-owner-key-gate'/'source'/f['path']) if f['path'].endswith('/migrator.cc') else a.native_root/f['path'];raw=source.read_bytes();assert sha(raw)==f['baselineSha256'];o=t/f['path'];o.parent.mkdir(parents=True,exist_ok=True);o.write_bytes(raw)
 subprocess.run(['git','apply',str(h/'native.patch')],cwd=t,check=True)
 for f in m['files']:assert sha((t/f['path']).read_bytes())==f['outputSha256']
print('PASS: original full-owner staging pins and four-file temporary replay; no source-profile operation')
