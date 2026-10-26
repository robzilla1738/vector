#!/usr/bin/env python3
"""Compose approved no-spawn metadata patch onto pinned future leaves only."""
from pathlib import Path
import hashlib,json,subprocess,sys
HERE=Path(__file__).resolve().parent
sha=lambda data:hashlib.sha256(data).hexdigest()
plan=json.loads((HERE/'plan.json').read_text());output=Path(sys.argv[1]).resolve();assert not output.exists()
for pin in plan['evidence']:assert sha(Path(pin['path']).read_bytes())==pin['sha256']
prepared=[]
for row in plan['resources']:
 data=Path(row['path']).read_bytes();assert sha(data)==row['beforeSha256'];text=data.decode()
 for rule in row['rules']:
  assert text.count(rule['find'])==rule['count'];text=text.replace(rule['find'],rule['replace'])
 reverse=text
 for rule in reversed(row['rules']):
  assert reverse.count(rule['replace'])==rule['count'];reverse=reverse.replace(rule['replace'],rule['find'])
 assert reverse.encode()==data and sha(text.encode())==row['afterSha256']
 prepared.append((row,text.encode()))
output.mkdir(mode=0o700);results=[]
for row,data in prepared:
 path=output/row['name'];path.write_bytes(data)
 subprocess.run(['node','--check',str(path)],check=True,capture_output=True)
 results.append({**row,'output':str(path),'syntaxPassed':True,'reverseReplayExact':True})
receipt={'format':'aux.future-analytics-resource-refresh.v1','planSha256':sha((HERE/'plan.json').read_bytes()),'resources':results,'passed':True,'nativeBuild':False,'appModified':False,'signed':False,'modelCalls':0,'runtimeAccepted':False}
(output/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print(output/'receipt.json')
