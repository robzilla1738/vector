#!/usr/bin/env python3
import hashlib,json,subprocess,tempfile
from pathlib import Path
root=Path(__file__).resolve().parent
manifest=json.loads((root/'manifest.json').read_text())
with tempfile.TemporaryDirectory() as tmp:
 tree=Path(tmp)
 for item in manifest['files']:
  path=item['path']; baseline=item['baselineSha256']
  if baseline:
   data=(root/'baseline'/path).read_bytes()
   assert hashlib.sha256(data).hexdigest()==baseline
   current=data.decode()
   for anchor in item['anchors']:
    assert current.count(anchor['find'])==anchor['count']==1
    current=current.replace(anchor['find'],anchor['replace'])
   assert current.encode()==(root/'source'/path).read_bytes()
   target=tree/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
 subprocess.run(['git','apply','--unsafe-paths',str(root/'native.patch')],cwd=tree,check=True)
 for item in manifest['files']:
  data=(tree/item['path']).read_bytes()
  assert hashlib.sha256(data).hexdigest()==item['outputSha256']
  assert data==(root/'source'/item['path']).read_bytes()
print('PASS: all counted anchors, input/output hashes and exact patch replay')
