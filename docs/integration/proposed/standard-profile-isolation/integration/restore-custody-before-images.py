#!/usr/bin/env python3
"""Materialize omitted before-images only by exact invertible counted patch replay."""
from pathlib import Path
import hashlib,json
HERE=Path(__file__).resolve().parent
LANE=HERE.parent/'browser-native-host-custody-a1'
sha=lambda b:hashlib.sha256(b).hexdigest()
manifest=json.loads((LANE/'manifest.json').read_text())
edits=json.loads((LANE/'replacements.json').read_text())
prepared=[]
for row in manifest['files']:
 source=LANE/'source'/row['path'];target=LANE/'baseline'/row['path']
 assert not target.exists() and not target.is_symlink(),str(target)
 assert sha(source.read_bytes())==row['afterSha256']
 text=source.read_text()
 selected=[x for x in edits if x['path']==row['path']]
 assert selected
 for edit in reversed(selected):
  assert edit['count']==1 and text.count(edit['new'])==1,(row['path'],edit['new'][:80])
  text=text.replace(edit['new'],edit['old'])
 assert sha(text.encode())==row['beforeSha256'],row['path']
 prepared.append((target,text,row))
for target,text,row in prepared:
 target.parent.mkdir(parents=True,exist_ok=True)
 with target.open('x') as f:f.write(text)
 assert sha(target.read_bytes())==row['beforeSha256']
result={'format':'aux.counted-before-images.restored.v1','passed':True,'manifestSha256':sha((LANE/'manifest.json').read_bytes()),'anchorsSha256':sha((LANE/'replacements.json').read_bytes()),'rows':[{'path':str(p),'sha256':r['beforeSha256']} for p,t,r in prepared],'actualNativeTreeChanged':False,'buildReceiptChanged':False,'productExecuted':False}
with (HERE/'restored-custody-before-images.json').open('x') as f:json.dump(result,f,indent=2);f.write('\n')
print(json.dumps({'passed':True,'files':len(prepared)}))
