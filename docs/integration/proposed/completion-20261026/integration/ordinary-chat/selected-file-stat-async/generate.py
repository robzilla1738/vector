#!/usr/bin/env python3
"""Pin source/derivative hashes for the async selected-file stat rule."""
import hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
rules=json.loads((HERE/'rules.json').read_text())
for variant,out in [('current','proposal.json'),('future','future-proposal.json')]:
    base=Path(f'/private/tmp/aux-repl-event-loop-guard-20261026-a1-{variant}')
    resources=[]
    for name in ['index.mjs','aux-native-entry.mjs']:
        data=(base/name).read_bytes();text=data.decode()
        for r in rules:
            assert text.count(r['find'])==r['count'],(variant,name,r['find'][:60]);text=text.replace(r['find'],r['replace'])
        resources.append({'path':str(base/name),'name':name,'beforeSha256':sha(data),'afterSha256':sha(text.encode())})
    (HERE/out).write_text(json.dumps({'format':'aux.selected-file-stat-async-proposal.v1','variant':variant,'resources':resources,'rules':rules},indent=2)+'\n')
    print(out)
