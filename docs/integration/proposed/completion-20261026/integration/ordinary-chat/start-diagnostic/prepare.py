#!/usr/bin/env python3
"""Prepare two exact-pinned resource derivatives; never mutate the application."""
import hashlib, json, sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
sha = lambda value: hashlib.sha256(value).hexdigest()
plan = json.loads((HERE / 'proposal.json').read_text())
helper = (HERE / 'diagnostic.js').read_bytes()
assert sha(helper) == plan['diagnosticSha256'], 'Diagnostic changed'
output = Path(sys.argv[1]).resolve()
assert not output.exists(), 'Output must be new'
prepared = []
for row in plan['resources']:
    source = Path(row['path'])
    assert source.is_file() and not source.is_symlink()
    data = source.read_bytes()
    assert sha(data) == row['beforeSha256'], 'Signed resource changed'
    text = data.decode()
    assert text.count(plan['find']) == 1, 'Anchor count changed'
    result = (text.replace(plan['find'], plan['replace']) + '\n' + helper.decode()).encode()
    assert sha(result) == row['afterSha256'], 'Derivative changed'
    prepared.append((row, result))
output.mkdir(mode=0o700, parents=False)
for row, result in prepared:
    with (output / row['name']).open('xb') as stream: stream.write(result)
(output / 'receipt.json').write_text(json.dumps({'format':'aux.agent-start.diagnostic-preparation.v1','resources':plan['resources'],'appModified':False,'signed':False,'executed':False}, indent=2)+'\n')
print(output)
