"""Compile only the broker one-way revocation include and link unsigned."""
from pathlib import Path
import hashlib,json,subprocess,time,sys,shutil
HERE=Path(__file__).resolve().parent
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
PRIOR=HERE.parent/'memory-read-denial-a9'
WORKER_PRIOR=HERE.parent/'memory-control-parent-a8'
OUT=Path('/private/tmp/aux-browser-only-daemon-build-20261025-a70')
OLD_FLAT=Path('/private/tmp/aux-browser-only-daemon-build-20261025-a68/source')
OLD_BINARY_SHA='3a08d890a4849e051641516768b5c90d217d20e36ba20c3bae4a37c39922fd95'
def sha(path):
 h=hashlib.sha256()
 with Path(path).open('rb') as stream:
  while chunk:=stream.read(1024*1024):h.update(chunk)
 return h.hexdigest()
def deps(path):return {x.strip(' \\') for x in Path(path).read_text().splitlines()[1:] if x.strip(' \\')}
if __name__=='__main__':
 if sys.argv[1:]!=['--under-native-build-lock']:
  raise SystemExit(subprocess.call(['/usr/bin/python3',str(ROOT/'scripts/native-build.py'),'/usr/bin/python3',str(Path(__file__).resolve()),'--under-native-build-lock'],cwd=ROOT))
 prior=json.loads((PRIOR/'build-plan.json').read_text());actual=json.loads((PRIOR/'actual-build.json').read_text());worker_prior=json.loads((WORKER_PRIOR/'build-plan.json').read_text());fix=json.loads((HERE/'source-plan.json').read_text())
 assert actual['passed'] and actual['planSha256']==sha(PRIOR/'build-plan.json') and sha(actual['binary'])==actual['binarySha256']==OLD_BINARY_SHA
 assert actual['a67MainAndActualNodeLayoutUnchanged'] and actual['a47LoaderUnchanged']
 for group in [prior['inputFiles'],prior['predecessorDependencyPins'],worker_prior['inputFiles']]:
  for path,digest in group.items():assert sha(path)==digest,path
 row=fix['files'][0];source=HERE/row['source'];assert sha(row['path'])==row['inputSha256'] and sha(source)==row['outputSha256']
 text=Path(row['path']).read_text()
 for anchor in row['anchors']:assert text.count(anchor['find'])==anchor['count'];text=text.replace(anchor['find'],anchor['replace'],1)
 assert text==source.read_text()
 flat_pins={str(f):sha(f) for f in sorted(OLD_FLAT.iterdir()) if f.is_file()}
 old_deps=deps(OLD_FLAT.parent/'worker-host.d');dependency_pins={x:sha(x) for x in sorted(old_deps)}
 assert not OUT.exists(),f'Preserve prior output: {OUT}'
 OUT.mkdir(mode=0o700);flat=OUT/'source';flat.mkdir(mode=0o700)
 for path,digest in flat_pins.items():
  dst=flat/Path(path).name;shutil.copyfile(path,dst);assert sha(dst)==digest
 shutil.copyfile(source,flat/'AuxBrokerWritesNapi.inc')
 worker=[arg.replace(str(OLD_FLAT),str(flat)) for arg in worker_prior['commands'][0]]
 worker[worker.index('-o')+1]=str(OUT/'worker-host.o');worker[worker.index('-MF')+1]=str(OUT/'worker-host.d');assert '-DAUX_BROWSER_ONLY_NATIVE_STARTUP=1' in worker
 link=list(prior['commands'][1]);before=list(link);old_worker=next(arg for arg in link if arg.endswith('/worker-host.o'));link[link.index(old_worker)]=str(OUT/'worker-host.o');output_index=link.index('-o')+1;link[output_index]=str(OUT/'Aux Daemon')
 assert len([(a,b) for a,b in zip(before,link) if a!=b])==2 and '-no_adhoc_codesign' in link
 unchanged_objects={arg:sha(arg) for arg in link if arg.endswith('.o') and Path(arg).exists()};assert len(unchanged_objects)==14
 unchanged_swift={arg:sha(arg) for arg in link if arg.endswith('.swift')};assert len(unchanged_swift)==50
 pins={arg:sha(arg) for cmd in [worker,link] for arg in cmd if Path(arg).is_file()};pins.update({str(f):sha(f) for f in flat.iterdir()})
 plan={'format':'aux.broker-one-way-revocation-build.v1','sourcePlanSha256':sha(HERE/'source-plan.json'),'priorPlanSha256':sha(PRIOR/'build-plan.json'),'priorBinarySha256':OLD_BINARY_SHA,'workerPriorPlanSha256':sha(WORKER_PRIOR/'build-plan.json'),'commands':[worker,link],'inputFiles':pins,'predecessorDependencyPins':dependency_pins,'flatSourcePreimages':flat_pins,'unchangedSwiftSources':unchanged_swift,'unchangedNativeObjects':unchanged_objects,'productSigned':False,'productExecuted':False}
 (HERE/'build-plan.json').write_text(json.dumps(plan,indent=2)+'\n');start=time.monotonic();results=[];selected=[]
 for label,command in [('worker',worker),('link',link)]:
  with (OUT/(label+'.stdout')).open('wb') as stdout,(OUT/(label+'.stderr')).open('wb') as stderr:result=subprocess.run(command,cwd=ROOT,stdout=stdout,stderr=stderr)
  results.append({'label':label,'exitCode':result.returncode})
  if result.returncode:break
  if label=='worker':
   observed=deps(OUT/'worker-host.d');expected={path.replace(str(OLD_FLAT),str(flat)) for path in old_deps};assert observed==expected,{'added':sorted(observed-expected),'removed':sorted(expected-observed)}
   for name in ['AuxBrokerWritesNapi.inc','AuxStorageRootsNapi.inc','AuxMemoryMainOwner.inc']:
    chosen=sorted(path for path in observed if Path(path).name==name);assert chosen==[str(flat/name)];selected.append({'name':name,'path':chosen[0],'sha256':sha(chosen[0])})
   shutil.copyfile(OUT/'worker-host.d',HERE/'actual-worker-host.d')
   (HERE/'actual-selected-includes.json').write_text(json.dumps({'actualDependencyCount':len(observed),'allOtherDependencyPathsUnchanged':True,'selectedIncludes':selected},indent=2)+'\n')
 receipt={'format':'aux.broker-one-way-revocation-build-result.v1','passed':len(results)==2 and all(row['exitCode']==0 for row in results),'results':results,'seconds':time.monotonic()-start,'planSha256':sha(HERE/'build-plan.json'),'sourcePlanSha256':sha(HERE/'source-plan.json'),'unchangedSwiftSourceCount':50,'unchangedNativeObjectCount':14,'a67MainAndActualNodeLayoutUnchanged':True,'a47LoaderAndMemoryOwnerUnchanged':True,'a69DenyOnlyDiagnosticUnchanged':True,'liveWriterAdmissionUnchanged':True,'oneWayCloseAndUntrackedOnly':True,'actualSelectedIncludes':selected,'productExecuted':False,'productSigned':False,'originalRootAccessed':False}
 for group in [pins,dependency_pins,flat_pins,unchanged_swift,unchanged_objects]:
  for path,digest in group.items():assert sha(path)==digest,path
 assert sha(actual['binary'])==OLD_BINARY_SHA
 if receipt['passed']:
  binary=OUT/'Aux Daemon';file=subprocess.run(['/usr/bin/file',str(binary)],check=True,capture_output=True,text=True);loads=subprocess.run(['/usr/bin/otool','-l',str(binary)],check=True,capture_output=True,text=True);signed=subprocess.run(['/usr/bin/codesign','-d',str(binary)],capture_output=True,text=True)
  assert 'Mach-O 64-bit executable arm64' in file.stdout and 'LC_CODE_SIGNATURE' not in loads.stdout and signed.returncode!=0 and 'not signed at all' in signed.stderr
  receipt.update(binary=str(binary),binarySha256=sha(binary),binarySize=binary.stat().st_size,workerObjectSha256=sha(OUT/'worker-host.o'),actualDependencyFileSha256=sha(OUT/'worker-host.d'),codeSignatureLoadCommandPresent=False,codesignDisplayExitCode=signed.returncode,inputPinsUnchanged=True,priorBinaryUnchanged=True)
 (HERE/'actual-build.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2),flush=True)
 raise SystemExit(0 if receipt['passed'] else 1)
