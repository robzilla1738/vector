from pathlib import Path
import hashlib,json
p=Path(__file__).resolve().parent;sha=lambda b:hashlib.sha256(b).hexdigest()
m=json.loads((p/'manifest.json').read_text());edits=json.loads((p/'replacements.json').read_text())
assert len(edits)==m['countedAdaptations']==2
assert sha((p/'replacements.json').read_bytes())==m['replacementsSha256']
assert sha((p/'change.patch').read_bytes())==m['patchSha256']
for row,e in zip(m['files'],edits):
 assert row['path']==e['path'];b=(p/'baseline'/row['path']).read_bytes();a=(p/'source'/row['path']).read_bytes()
 assert sha(b)==row['beforeSha256'] and sha(a)==row['afterSha256']
 text=b.decode();assert text.count(e['old'])==1
 assert text.replace(e['old'],e['new'],1).encode()==a
print(json.dumps({'literalReplayPassed':True,'countedAdaptations':2,'compiled':False,'runtimeAccepted':False},indent=2))
