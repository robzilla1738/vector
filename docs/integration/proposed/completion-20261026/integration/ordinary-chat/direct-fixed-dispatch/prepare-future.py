#!/usr/bin/env python3
"""Compose current fixed dispatch into final future resources, never an app."""
from pathlib import Path
import hashlib,json,subprocess,sys
HERE=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
plan=json.loads((HERE/'future-proposal.json').read_text())
prior=plan['predecessorReceipt'];assert sha(Path(prior['path']).read_bytes())==prior['sha256']
output=Path(sys.argv[1]).resolve();assert not output.exists()
prepared=[]
for row in plan['resources']:
    p=Path(row['path']);assert p.is_file() and not p.is_symlink()
    data=p.read_bytes();assert sha(data)==row['beforeSha256'];text=data.decode()
    for rule in plan['rules']:
        assert text.count(rule['find'])==rule['count'];text=text.replace(rule['find'],rule['replace'])
    reverse=text
    for rule in reversed(plan['rules']):
        assert reverse.count(rule['replace'])==rule['count'];reverse=reverse.replace(rule['replace'],rule['find'])
    assert reverse.encode()==data and sha(text.encode())==row['afterSha256']
    prepared.append((row,text.encode()))
output.mkdir(mode=0o700)
receipt={'format':'aux.future-direct-fixed-dispatch-composition.v1','planSha256':sha((HERE/'future-proposal.json').read_bytes()),'predecessorReceipt':prior,'resources':[],'ruleCounts':[r['count'] for r in plan['rules']],'reverseReplayExact':True,'nativeInterfaceUnchanged':True,'appModified':False,'signed':False,'modelCalls':0}
for row,data in prepared:
    p=output/row['name']
    with p.open('xb') as f:f.write(data)
    done=subprocess.run(['node','--check',str(p)],capture_output=True,text=True);assert done.returncode==0,done.stderr
    receipt['resources'].append({**row,'output':str(p),'syntaxCheckPassed':True})
(output/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(output)
