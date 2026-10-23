#!/usr/bin/env python3
"""Read-only compile evidence verification; never loads native artifact."""
import hashlib,json
from pathlib import Path
p=Path(__file__).resolve().parent;r=p.parents[3];m=json.loads((p/'inputs.json').read_text())
for f,h in m['files'].items():assert hashlib.sha256((r/f).read_bytes()).hexdigest()==h,f
receipt=json.loads((p/'evidence/receipt.json').read_text())
assert receipt['status']=='passed-compile-link-only' and receipt['compileLinkExitCode']==0
assert receipt['inputsUnchangedAfterLink'] and not receipt['clientFactoryInvoked']
assert not receipt['signing'] and not receipt['entitlementsModified']
assert '-Wl,-no_adhoc_codesign' in receipt['command']
assert 'LC_CODE_SIGNATURE' not in (p/'evidence/load-commands.txt').read_text()
assert '_es_new_descendants_client' in (p/'evidence/undefined-imports.txt').read_text()
print('exact compile/link evidence verified; no factory/runtime/closure acceptance')
