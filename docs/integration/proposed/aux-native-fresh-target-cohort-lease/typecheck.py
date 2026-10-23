#!/usr/bin/env python3
"""One actual deferred source graph, hashing exact inputs at execution time."""
import datetime,hashlib,json,subprocess,tempfile,time
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
subprocess.run(['python3',str(HERE/'verify.py')],check=True)
pins=json.loads((HERE/'source-pins.json').read_text())
inputs=[{'path':item['path'],'sha256':sha(ROOT/item['path'])}for item in pins['productionInputs']]
assert inputs==pins['productionInputs']
output=ROOT/'out/aux-native-fresh-target-cohort-lease-typecheck';output.mkdir(parents=True,exist_ok=True)
with tempfile.TemporaryDirectory(prefix='aux-cohort-lease-typecheck-')as temporary:
 command=['xcrun','swiftc','-typecheck','-target','arm64-apple-macos13.0','-module-name','AuxNativeFreshCohortLease','-module-cache-path',str(Path(temporary)/'cache')]+[str(ROOT/item['path'])for item in inputs]
 started=time.monotonic();result=subprocess.run(command,cwd=ROOT,text=True,capture_output=True)
 (output/'compiler.log').write_text(result.stdout+result.stderr)
 after=[{'path':item['path'],'sha256':sha(ROOT/item['path'])}for item in inputs]
 receipt={'format':'aux.native-fresh-target-cohort-lease.actual-typecheck.v1','startedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourcePinsSha256':sha(HERE/'source-pins.json'),'recipeSha256':sha(HERE/'typecheck.py'),'inputs':inputs,'inputsUnchangedThroughCompile':after==inputs,'command':command,'exitCode':result.returncode,'seconds':time.monotonic()-started,'compilerLogSha256':sha(output/'compiler.log'),'linked':False,'loaded':False,'protectedOperations':0,'authorityGeneration':False}
 (output/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
 if result.returncode:print(result.stdout+result.stderr);raise SystemExit(result.returncode)
 assert after==inputs
 print('PASS:23 exact final native-v2 shared-cohort Swift inputs typechecked; no protected/generation execution')
