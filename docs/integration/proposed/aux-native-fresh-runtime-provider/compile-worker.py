#!/usr/bin/env python3
"""Compile only changed production WorkerHost TU; never link/load/execute."""
import pathlib,sys,json,hashlib,subprocess,tempfile,time
if len(sys.argv)!=2:raise SystemExit('Usage: compile-worker.py /fixed/frozen/node/include/node')
p=pathlib.Path(__file__).resolve().parent;repo=p.parents[3];headers=pathlib.Path(sys.argv[1]).resolve(strict=True)
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
pins=json.loads((p/'source-pins.json').read_text())['nativeSources']
for name,digest in pins.items():assert sha(repo/name)==digest,name
# Inventory all actual frozen header bytes, not a claim of signed runtime origin.
headerPins={str(x.relative_to(headers)):sha(x) for x in sorted(headers.rglob('*')) if x.is_file()}
assert 'node.h' in headerPins and 'node_api.h' in headerPins
with tempfile.TemporaryDirectory(prefix='aux-fresh-provider-worker-') as temporary:
 command=['xcrun','clang++','-std=c++20','-arch','arm64','-mmacosx-version-min=13.0','-DNAPI_VERSION=8','-fPIC','-I',str(headers),'-I',str(repo/'docs/integration/proposed/aux-owned-napi-adapter/source'),'-c',str(p/'source/AuxDevelopmentWorkerHost.cc'),'-o',temporary+'/worker.o']
 started=time.time();result=subprocess.run(command,capture_output=True,text=True)
 for name,digest in pins.items():assert sha(repo/name)==digest,name
 for name,digest in headerPins.items():assert sha(headers/name)==digest,name
 output=repo/'out/aux-native-fresh-runtime-provider-worker';output.mkdir(parents=True,exist_ok=True)
 (output/'compiler.log').write_text(result.stdout+result.stderr)
 receipt={'format':'aux.prepared-fresh-provider.actual-worker-compile.v1','inputsBefore':pins,'inputsAfter':{name:sha(repo/name) for name in pins},'headerRoot':str(headers),'headers':headerPins,'exitCode':result.returncode,'command':command,'seconds':time.time()-started,'objectSha256':sha(pathlib.Path(temporary)/'worker.o') if result.returncode==0 else None,'linked':False,'loaded':False,'protectedOperations':0}
 (output/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
 print(result.stdout+result.stderr,end='')
 if result.returncode:raise SystemExit(result.returncode)
 print('PASS: changed actual provider-backed WorkerHost TU compiled; no link/load/native execution')
