from pathlib import Path
import hashlib,json
p=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
m=json.loads((p/'manifest.json').read_text()); edits=json.loads((p/'replacements.json').read_text())
assert sha((p/'replacements.json').read_bytes())==m['replacementsSha256']
assert sha((p/'change.patch').read_bytes())==m['patchSha256']
assert len(edits)==m['countedAdaptations']==3
for row,e in zip(m['files'],edits):
 assert row['path']==e['path']
 before=(p/'baseline'/row['path']).read_bytes();after=(p/'source'/row['path']).read_bytes()
 assert sha(before)==row['beforeSha256'] and sha(after)==row['afterSha256']
 text=before.decode();assert text.count(e['old'])==e['count']==1
 assert text.replace(e['old'],e['new'],1).encode()==after
print(json.dumps({'literalReplayPassed':True,'countedAdaptations':3,'nativeCompiled':False,'runtimeAccepted':False},indent=2))
