#!/usr/bin/env python3
import hashlib,json,subprocess
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
PRIOR=HERE.parent/'aux-content-service-worker-admission'
NATIVE=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
output=ROOT/'out/aux-service-worker-address-fixture'
assert not output.exists()
subprocess.run(['python3',str(HERE/'verify.py')],check=True)
results=json.loads((ROOT/'out/aux-service-worker-identity-storage-check/results.json').read_text())
assert len(results)==2 and all(r['exitCode']==0 for r in results)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
for r in results:
 source=(HERE if r['source']=='aux_service_worker_admission_state.cc'else PRIOR)/'source/content/browser/service_worker'/r['source']
 assert sha(source)==r['sourceSha256']
output.mkdir()
command=[str(NATIVE/'third_party/llvm-build/Release+Asserts/bin/clang++'),'-std=c++20','-Wall','-Wextra','-Werror','-pthread','-I',str(PRIOR/'source'),'-I',str(NATIVE),str(HERE/'source/content/browser/service_worker/aux_service_worker_admission_state.cc'),str(HERE/'tests/admission_state.cc'),'-o',str(output/'admission')]
subprocess.run(command,check=True)
subprocess.run([str(output/'admission')],check=True)
receipt={'format':'aux.worker-address.actual-fixture.v1','exitCode':0,'command':command,'productionSourceSha256':sha(HERE/'source/content/browser/service_worker/aux_service_worker_admission_state.cc'),'fixtureSha256':sha(HERE/'tests/admission_state.cc'),'artifactSha256':sha(output/'admission'),'nativeTUReceiptSha256':sha(ROOT/'out/aux-service-worker-identity-storage-check/results.json'),'protectedOperations':0,'browserExecuted':False}
(output/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print('PASS: actual worker state fixture; unchanged passed production TUs not repeated')
