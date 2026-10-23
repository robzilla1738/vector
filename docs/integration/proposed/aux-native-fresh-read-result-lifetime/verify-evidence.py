#!/usr/bin/env python3
import hashlib,json,pathlib
p=pathlib.Path(__file__).resolve().parent;repo=p.parents[3]
sha=lambda f:hashlib.sha256(f.read_bytes()).hexdigest()
pins=json.loads((p/'evidence/actual-completion/manifest.json').read_text())
for rel,h in pins.items():assert sha(repo/rel)==h,rel
e=p/'evidence/actual-completion'
for name,count in [('typecheck42',42),('worker6',6)]:
 r=json.loads((e/(name+'.json')).read_text());assert r['exitCode']==0
 assert r['inputsBefore']==r['inputsAfter'] and len(r['inputsBefore'])==count
 assert not r['linked'] and not r['loaded'] and r['protectedOperations']==0
 for rel,h in r['inputsBefore'].items():assert sha(repo/rel)==h,rel
r=json.loads((e/'typecheck42.json').read_text());assert sha(e/'typecheck42-compiler.log')==r['compilerLogSha256']
for f in [e/'lifetime-fixture42.json',repo/'docs/integration/proposed/aux-native-prepared-daemon-authority/evidence/actual-fixture303.json']:
 r=json.loads(f.read_text());assert r['terminalExitCode']==0 and r['protectedOperations']==0
 for rel,h in r['sourceHashes'].items():assert sha(repo/rel)==h,rel
print('PASS: actual42Swift/6native inputs unchanged, two terminal captured fixtures and exact compiler logs authenticated; no rerun')
