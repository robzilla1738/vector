#!/usr/bin/env python3
import hashlib,json,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
plan=json.loads((HERE/'future-proposal.json').read_text())
output=Path(sys.argv[1]).resolve();assert not output.exists()
prepared=[]
for row in plan['resources']:
    p=Path(row['path']);assert p.is_file() and not p.is_symlink()
    data=p.read_bytes();assert sha(data)==row['beforeSha256'];text=data.decode()
    for rule in plan['rules']:
        assert text.count(rule['find'])==rule['count'];text=text.replace(rule['find'],rule['replace'])
    data=text.encode();assert sha(data)==row['afterSha256'];prepared.append((row['name'],data))
output.mkdir(mode=0o700)
for name,data in prepared:
    with (output/name).open('xb') as f:f.write(data)
(output/'receipt.json').write_text(json.dumps({'format':'aux.unstarted-run-error-preparation.v1','proposalSha256':sha((HERE/'future-proposal.json').read_bytes()),'resources':plan['resources'],'ruleCounts':[r['count'] for r in plan['rules']],'appModified':False,'signed':False,'modelCalls':0},indent=2)+'\n')
print(output)
