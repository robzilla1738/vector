from pathlib import Path
import hashlib,json
p=Path(__file__).resolve().parent;sha=lambda b:hashlib.sha256(b).hexdigest()
m=json.loads((p/'manifest.json').read_text());edits=json.loads((p/'replacements.json').read_text())
assert sha((p/'replacements.json').read_bytes())==m['replacementsSha256']
assert sha((p/'change.patch').read_bytes())==m['patchSha256']
assert len(edits)==m['countedAdaptations']==3
for row in m['files']:
 b=(p/'baseline'/row['path']).read_bytes();a=(p/'source'/row['path']).read_bytes()
 assert sha(b)==row['beforeSha256'] and sha(a)==row['afterSha256']
 text=b.decode()
 for e in edits:
  if e['path']==row['path']:
   assert text.count(e['old'])==1;text=text.replace(e['old'],e['new'],1)
 assert text.encode()==a
before=json.loads((p/'baseline/content/browser/devtools/protocol_config.json').read_text())
after=json.loads((p/'source/content/browser/devtools/protocol_config.json').read_text())
# Removing the one exact async entry restores the entire original JSON tree.
def remove(node):
 if isinstance(node,dict):
  for k,v in node.items():
   if k=='async' and isinstance(v,list) and 'disposeAuxBrowserContextAndObserve' in v:
    v.remove('disposeAuxBrowserContextAndObserve');return True
   if remove(v):return True
 elif isinstance(node,list):
  return any(remove(v) for v in node)
 return False
assert remove(after) and after==before
row=m['unchangedChromeProtocolConfig'];assert sha(Path(row['path']).read_bytes())==row['sha256']
print(json.dumps({'literalReplayPassed':True,'asyncEntryOnly':True,'countedAdaptations':3,'compiled':False,'runtimeAccepted':False},indent=2))
