#!/usr/bin/env python3
"""Inventory only a genuinely completed inactive package; never launch Aux."""
from pathlib import Path
import hashlib,json,subprocess
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
OUT=HERE/'final-package-v11-lowercase-a1'
APP=ROOT/'out/provided-candidate-standard-profile-finish-20261024/Aux.app'
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
assert not OUT.exists()
OUT.mkdir()
result={'format':'aux.standard-profile-lowercase-audit.actual.v1','passed':False,'appExecuted':False,'productSigned':False,'runtimeAuthorityGranted':False,'acceptedAppReplaced':False,'testable':False,'identityClassificationComplete':False}
try:
 receipt=APP.parent/'receipt.json';package=json.loads(receipt.read_text())
 assert package['passed'] is True
 for key in ['testable','runtimeAuthorityGranted','appExecuted','productSigned','acceptedAppReplaced']:assert package[key] is False,key
 run=HERE.parent/'package-v11/actual-run-a2.json';execution=json.loads(run.read_text());assert execution['passed'] is True
 assert execution['finalReceiptSha256']==sha(receipt)
 bridge=HERE/'browser-native-bridge-a8-a3.json';assert json.loads(bridge.read_text())['passed'] is True
 tool=ROOT/'scripts/audit-aux-package-identity.mjs';report=OUT/'delivered-identity.json'
 command=['node',str(tool),str(APP),str(report)];before=sha(tool)
 with (OUT/'identity.log').open('xb') as stream:r=subprocess.run(command,cwd=ROOT,stdout=stream,stderr=subprocess.STDOUT)
 assert r.returncode==0 and sha(tool)==before
 identity=json.loads(report.read_text());assert identity['complete'] is False and identity['runtimeAcceptance'] is False
 result.update(passed=True,packageReceipt=str(receipt),packageReceiptSha256=sha(receipt),packageExecution=str(run),packageExecutionSha256=sha(run),bridgeEvidenceSha256=sha(bridge),identityReportSha256=sha(report),filesWithIdentityTokens=len(identity['files']),identityToolSha256=before,command=command,exitCode=r.returncode)
except Exception as error:result['error']=str(error)
finally:
 with (OUT/'receipt.json').open('x') as f:json.dump(result,f,indent=2);f.write('\n')
print(json.dumps({key:result.get(key) for key in ['passed','error','filesWithIdentityTokens']}))
raise SystemExit(0 if result['passed'] else 1)
