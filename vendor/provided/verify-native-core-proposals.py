#!/usr/bin/env python3
"""Replay staged core integration proposals in a disposable source copy only."""
import hashlib,json,subprocess,sys,tempfile
from pathlib import Path
native=Path(sys.argv[1]).resolve()
proposal=Path(__file__).resolve().parents[2]/'docs/integration/proposed'
names=['preference-results','dock-results','import-results','import-consent','omnibox-results']
sha=lambda raw:hashlib.sha256(raw).hexdigest()
with tempfile.TemporaryDirectory(prefix='aux-core-proposals-') as temp:
 copy=Path(temp)
 for name in names:
  stem=f'native-provided-{name}'
  manifest=json.loads((proposal/f'{stem}.json').read_text())
  for item in manifest['files']:
   path=Path(item['path'])
   if path.is_absolute() or '..' in path.parts:raise ValueError('Unsafe proposal path')
   target=copy/path
   if not target.exists():
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_bytes((native/path).read_bytes())
   raw=target.read_bytes()
   if sha(raw)!=item['sourceSha256']:raise ValueError(f'Source drift: {path}')
   text=raw.decode()
   for anchor in item['anchors']:
    if text.count(anchor['find'])!=anchor['count']:raise ValueError(f'Anchor drift: {path}')
    text=text.replace(anchor['find'],anchor['replace'])
   if sha(text.encode())!=item['outputSha256']:raise ValueError(f'Anchor output mismatch: {path}')
  subprocess.run(['git','apply',str(proposal/f'{stem}.patch')],cwd=copy,check=True)
  for item in manifest['files']:
   if sha((copy/item['path']).read_bytes())!=item['outputSha256']:raise ValueError(f'Patch output mismatch: {item["path"]}')
 print(json.dumps({'verifiedProposals':names,'files':len(list(copy.rglob('*.*'))),'nativeSourceModified':False,'compiled':False}))
