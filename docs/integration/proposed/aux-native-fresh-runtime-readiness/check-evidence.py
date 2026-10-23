#!/usr/bin/env python3
import pathlib,json,hashlib
p=pathlib.Path(__file__).resolve().parent;repo=p.parents[3]
def sha(q):return hashlib.sha256(q.read_bytes()).hexdigest()
r=json.loads((p/'evidence/actual42-receipt.json').read_text());pins=json.loads((p/'source-pins.json').read_text())
assert r['exitCode']==0 and not r['linked'] and not r['loaded'] and r['protectedOperations']==0 and not r['generation']
assert r['inputsBefore']==r['inputsAfter']==pins['swiftInputs'] and len(r['inputsBefore'])==42
assert sha(p/'evidence/actual42-compiler.txt')==r['compilerLogSha256']
assert sha(p/'typecheck.py')==r['recipeSha256'] and sha(p/'source-pins.json')==r['sourcePinsSha256']
r=json.loads((p/'evidence/actual-captured-checks.json').read_text());assert [(x['session'],x['assertions'])for x in r['checks']]==[(82351,28),(50721,6)]
for c in r['checks']:
 assert c['exitCode']==0
 for path,h in c['postExecutionSourceHashes'].items():assert sha(repo/path)==h,path
assert r['actualSecurityCalls']==0 and not r['keyGeneration'] and not r['ipc']
print('PASS: exact actual42 compiler receipt/log and changed captured28+6 check records match frozen sources; no runtime activation claim')
