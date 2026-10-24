#!/usr/bin/env python3
"""Replay counted shared proposals in scratch storage only."""
from pathlib import Path
import hashlib,json,subprocess,tempfile
root=Path(__file__).resolve().parent
manifest=json.loads((root/'shared-edits.json').read_text())
sha=lambda data:hashlib.sha256(data).hexdigest()
assert sha((root/'shared-native.patch').read_bytes())==manifest['patchSha256']
with tempfile.TemporaryDirectory(prefix='aux-preview-shared-') as tmp:
 tree=Path(tmp)
 expected={}
 for record in manifest['files']:
  rel=record['path'];original=(root/'shared-baseline'/rel).read_bytes()
  assert sha(original)==record['baselineSha256']
  text=original.decode()
  for edit in record['edits']:
   assert text.count(edit['find'])==edit['count']==1
   text=text.replace(edit['find'],edit['replace'])
   assert edit['find']!=edit['replace']
  assert sha(text.encode())==record['sourceSha256']
  expected[rel]=text
  target=tree/rel;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(original)
 subprocess.run(['git','apply','--check',str(root/'shared-native.patch')],cwd=tree,check=True)
 subprocess.run(['git','apply',str(root/'shared-native.patch')],cwd=tree,check=True)
 for rel,text in expected.items():assert (tree/rel).read_text()==text
print(json.dumps({'sharedSourceReplay':'passed','files':len(manifest['files']),'countedEdits':sum(len(r['edits']) for r in manifest['files']),'nativeTreeMutated':False,'appRun':False}))
