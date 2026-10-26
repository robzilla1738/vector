#!/usr/bin/env python3
"""Update only reviewed resourceDependency; retain concurrent native cohort fields."""
from pathlib import Path
import hashlib,json,sys
HERE=Path(__file__).resolve().parent
plan=json.loads((HERE/'future-cohort-update.json').read_text())
target=Path(sys.argv[1]).resolve()/plan['target']
record=json.loads(target.read_text())
assert record['resourceDependency']==plan['before'], 'Resource dependency changed; reconcile before updating'
receipt=plan['after'];assert hashlib.sha256(Path(receipt['receipt']).read_bytes()).hexdigest()==receipt['receiptSha256']
for row in receipt['resources']:assert hashlib.sha256(Path(row['path']).read_bytes()).hexdigest()==row['sha256']
record['resourceDependency']=plan['after']
target.write_text(json.dumps(record,indent=2)+'\n')
