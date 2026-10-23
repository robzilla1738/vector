#!/usr/bin/env python3
import pathlib,hashlib,json,subprocess,tempfile,time
repo=pathlib.Path(__file__).resolve().parents[4];p=pathlib.Path(__file__).resolve().parent
pins=json.loads((p/'source-pins.json').read_text())['swiftInputs']
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
for name,digest in pins.items():assert sha(repo/name)==digest,name
with tempfile.TemporaryDirectory(prefix='aux-fresh-provider-types-') as tmp:
 command=['xcrun','swiftc','-typecheck','-target','arm64-apple-macos13.0','-module-name','AuxPreparedFreshRuntimeProvider','-module-cache-path',tmp+'/cache','-D','AUX_NATIVE_FRESH_RUNTIME_CONSUMER','-D','AUX_MINIMAL_RUNTIME_DISPATCH','-D','AUX_SCOPED_SECURE_STORE_DISPATCH','-D','AUX_ATOMIC_CSK_DISPATCH','-D','AUX_MACOS_UTILITY_DISPATCH']+[str(repo/x) for x in pins]
 started=time.time();result=subprocess.run(command,capture_output=True,text=True)
 for name,digest in pins.items():assert sha(repo/name)==digest,name
 output=repo/'out/aux-native-fresh-runtime-provider-quarantine-typecheck';output.mkdir(parents=True,exist_ok=True)
 (output/'compiler.log').write_text(result.stdout+result.stderr)
 (output/'receipt.json').write_text(json.dumps({'format':'aux.native-fresh-provider-quarantine.actual-typecheck.v1','inputsBefore':pins,'inputsAfter':{name:sha(repo/name) for name in pins},'inputsUnchangedThroughCompile':True,'recipeSha256':sha(p/'typecheck.py'),'sourcePinsSha256':sha(p/'source-pins.json'),'exitCode':result.returncode,'seconds':time.time()-started,'command':command,'compilerLogSha256':sha(output/'compiler.log'),'linked':False,'loaded':False,'protectedOperations':0,'generation':False},indent=2)+'\n')
 print(result.stdout+result.stderr,end='')
 if result.returncode:raise SystemExit(result.returncode)
 print('PASS:'+str(len(pins))+' actual prepared fresh provider Swift inputs typechecked; no protected/generation execution')
