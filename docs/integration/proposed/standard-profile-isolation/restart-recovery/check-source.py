from pathlib import Path
import hashlib,json
p=Path(__file__).resolve().parent
sha=lambda data:hashlib.sha256(data).hexdigest()
inputs=json.loads((p/'inputs.json').read_text());overlay=json.loads((p/'overlay.json').read_text())
results=[]
for row in overlay['sources']:
 name=row['name'];before=(p/'baseline'/name).read_bytes();after=(p/'source'/name).read_bytes()
 assert sha(before)==row['inputSha256'];assert sha(after)==row['outputSha256']
 original=next(x for x in inputs['sources'] if x['name']==name)
 assert sha(Path(original['selectedPath']).read_bytes())==original['sha256']==sha(before)
 text=before.decode();edits=[x for x in overlay['changes'] if x['path']==name]
 for change in edits:
  assert change['count']==1 and text.count(change['find'])==1
  text=text.replace(change['find'],change['replace'])
 assert text.encode()==after
 results.append({'name':name,'anchors':len(edits),'sha256':sha(after)})
report={'scope':'exact selected-input pins and count-one source replay only; no Swift execution or compile','sources':results,'runtimeValidated':False,'activationBlockedUntil':['actual native peer final all-writer report through real shutdown lifetime','actual WorkerHost owner settlement query/caller','shared dispatcher and native link integration','disposable clean-reopen, interrupted-admitted and partial-write checks']}
(p/'check-result.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
