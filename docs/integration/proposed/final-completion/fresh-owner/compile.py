#!/usr/bin/env python3
"""Actual cold-bootstrap graph typecheck with exactly three successor operands.
Run only through scripts/native-build.py. No link/load/protected execution.
"""
import hashlib,json,pathlib,subprocess,tempfile,time
here=pathlib.Path(__file__).resolve().parent
repo=here.parents[4]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
integration=json.loads((here/'integration.json').read_text())
old=json.loads((repo/'docs/integration/proposed/aux-native-fresh-cold-bootstrap/source-pins.json').read_text())['swiftInputs']
for name,digest in old.items():assert sha(repo/name)==digest,name
inputs=dict(old)
for name,item in integration['replacements'].items():
 assert old[name]==item['beforeSha256'] and sha(repo/name)==item['beforeSha256'],name
 assert sha(repo/item['successor'])==item['afterSha256'],name
 del inputs[name];inputs[item['successor']]=item['afterSha256']
with tempfile.TemporaryDirectory(prefix='aux-fresh-owner-typecheck-') as tmp:
 command=['xcrun','swiftc','-typecheck','-target','arm64-apple-macos13.0','-module-name','AuxPreparedFreshRuntimeProvider','-module-cache-path',tmp+'/cache','-D','AUX_NATIVE_FRESH_RUNTIME_CONSUMER','-D','AUX_MINIMAL_RUNTIME_DISPATCH','-D','AUX_SCOPED_SECURE_STORE_DISPATCH','-D','AUX_ATOMIC_CSK_DISPATCH','-D','AUX_MACOS_UTILITY_DISPATCH']+[str(repo/x) for x in inputs]
 started=time.time();result=subprocess.run(command,capture_output=True,text=True)
 after={n:sha(repo/n) for n in inputs};assert after==inputs
 for name,digest in old.items():assert sha(repo/name)==digest,name
 out=here/'evidence';out.mkdir(exist_ok=True)
 (out/'compiler.log').write_text(result.stdout+result.stderr)
 (out/'compile.json').write_text(json.dumps({'format':'aux.fresh-owner.actual-graph-typecheck.v1','recipeSha256':sha(here/'compile.py'),'integrationSha256':sha(here/'integration.json'),'inputsBefore':inputs,'inputsAfter':after,'sourceInputsUnchanged':True,'predecessorsUnchanged':True,'command':command,'exitCode':result.returncode,'seconds':time.time()-started,'compilerLogSha256':sha(out/'compiler.log'),'linked':False,'loaded':False,'executed':False,'protectedOperations':0,'custodyAccepted':False},indent=2)+'\n')
 print(result.stdout+result.stderr,end='')
 if result.returncode:raise SystemExit(result.returncode)
 print(f'PASS: {len(inputs)} actual Swift graph inputs; three process-owner successors; no native execution')
