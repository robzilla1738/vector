"""Recompile the paired finite-memory host include and link unsigned."""
from pathlib import Path
import hashlib,json,subprocess,time,sys,shutil
HERE=Path(__file__).resolve().parent
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
PRIOR=HERE.parent/'peer-loss-layout-a7'
ORDINARY=HERE.parent/'ordinary-storage-a6'
OUT=Path('/private/tmp/aux-browser-only-daemon-build-20261025-a68')
OLD_FLAT=Path('/private/tmp/aux-browser-only-daemon-build-20261025-a66/source')
OLD_BINARY_SHA='cb1797731449c4a87255b432ce715bf6fedf041dfed3dcb96420ecf5b1c86d29'
def sha(path):
 h=hashlib.sha256()
 with Path(path).open('rb') as stream:
  while chunk:=stream.read(1024*1024):h.update(chunk)
 return h.hexdigest()
def deps(path):return {x.strip(' \\') for x in Path(path).read_text().splitlines()[1:] if x.strip(' \\')}
if __name__=='__main__':
 if sys.argv[1:]!=['--under-native-build-lock']:
  raise SystemExit(subprocess.call(['/usr/bin/python3',str(ROOT/'scripts/native-build.py'),'/usr/bin/python3',str(Path(__file__).resolve()),'--under-native-build-lock'],cwd=ROOT))
 prior=json.loads((PRIOR/'build-plan.json').read_text());actual=json.loads((PRIOR/'actual-build.json').read_text());ordinary=json.loads((ORDINARY/'build-plan.json').read_text());fix=json.loads((HERE/'source-plan.json').read_text())
 assert actual['passed'] and actual['planSha256']==sha(PRIOR/'build-plan.json') and sha(actual['binary'])==actual['binarySha256']==OLD_BINARY_SHA
 assert actual['layout']['allTenRelevantMembersMatch'] and actual['ordinaryIncludesAndWorkerObjectUnchanged']
 for group in [prior['inputFiles'],ordinary['inputFiles'],ordinary['predecessorDependencyPins']]:
  for path,digest in group.items():assert sha(path)==digest,path
 for row in fix['files']:
  assert sha(row['input'])==row['inputSha256'] and sha(HERE/row['source'])==row['outputSha256']
  text=Path(row['input']).read_text()
  for anchor in row['anchors']:
   assert text.count(anchor['find'])==anchor['count'];text=text.replace(anchor['find'],anchor['replace'],1)
  assert text==(HERE/row['source']).read_text()
 inc=next(row for row in fix['files'] if row['name']=='AuxMemoryMainOwner.inc');loader=next(row for row in fix['files'] if row['name']=='AuxSignedFreshBootstrapPolicyLoader.swift')
 flat_pins={str(f):sha(f) for f in sorted(OLD_FLAT.iterdir()) if f.is_file()}
 old_deps=deps(OLD_FLAT.parent/'worker-host.d');dependency_pins={x:sha(x) for x in sorted(old_deps)}
 assert not OUT.exists(),f'Preserve prior output: {OUT}'
 OUT.mkdir(mode=0o700);flat=OUT/'source';flat.mkdir(mode=0o700)
 for path,digest in flat_pins.items():
  dst=flat/Path(path).name;shutil.copyfile(path,dst);assert sha(dst)==digest
 shutil.copyfile(HERE/inc['source'],flat/inc['name'])
 worker=[arg.replace(str(OLD_FLAT),str(flat)) for arg in ordinary['commands'][0]]
 worker[worker.index('-o')+1]=str(OUT/'worker-host.o');worker[worker.index('-MF')+1]=str(OUT/'worker-host.d')
 assert '-DAUX_BROWSER_ONLY_NATIVE_STARTUP=1' in worker
 link=list(prior['commands'][1]);before=list(link)
 old_worker=next(arg for arg in link if arg.endswith('/worker-host.o'));link[link.index(old_worker)]=str(OUT/'worker-host.o')
 old_loader=next(arg for arg in link if Path(arg).name==loader['name']);assert sha(old_loader)==loader['inputSha256']
 link[link.index(old_loader)]=str(HERE/loader['source'])
 output_index=link.index('-o')+1;old_output=link[output_index];link[output_index]=str(OUT/'Aux Daemon')
 assert len([(a,b) for a,b in zip(before,link) if a!=b])==3
 assert '-no_adhoc_codesign' in link and sum(x.endswith('.swift') for x in link)==50
 main=next(arg for arg in link if arg.endswith('/main.o'));assert sha(main)==actual['layout']['compiledMainObjectSha256']
 unchanged_objects={arg:sha(arg) for arg in link if arg.endswith('.o') and Path(arg).exists()};assert len(unchanged_objects)==14
 unchanged_swift={arg:sha(arg) for arg in link if arg.endswith('.swift') and arg!=str(HERE/loader['source'])};assert len(unchanged_swift)==49
 ordinary_evidence=[]
 for row in json.loads((ORDINARY/'actual-selected-includes.json').read_text())['selectedIncludes']:
  chosen=flat/row['name'];assert sha(chosen)==row['expectedSha256'];ordinary_evidence.append({'name':row['name'],'path':str(chosen),'sha256':sha(chosen)})
 pins={arg:sha(arg) for cmd in [worker,link] for arg in cmd if Path(arg).is_file()};pins.update({str(f):sha(f) for f in flat.iterdir()})
 plan={'format':'aux.finite-memory-control-parent-build.v1','sourcePlanSha256':sha(HERE/'source-plan.json'),'priorPlanSha256':sha(PRIOR/'build-plan.json'),'priorBinarySha256':OLD_BINARY_SHA,'commands':[worker,link],'inputFiles':pins,'predecessorDependencyPins':dependency_pins,'flatSourcePreimages':flat_pins,'unchangedSwiftSources':unchanged_swift,'unchangedNativeObjects':unchanged_objects,'actualNodeLayoutReceiptSha256':sha(PRIOR/'actual-layout-match.json'),'ordinaryIncludes':ordinary_evidence,'productSigned':False,'productExecuted':False}
 (HERE/'build-plan.json').write_text(json.dumps(plan,indent=2)+'\n');start=time.monotonic();results=[];selected=[]
 for label,command in [('worker',worker),('link',link)]:
  with (OUT/(label+'.stdout')).open('wb') as stdout,(OUT/(label+'.stderr')).open('wb') as stderr:result=subprocess.run(command,cwd=ROOT,stdout=stdout,stderr=stderr)
  results.append({'label':label,'exitCode':result.returncode})
  if result.returncode:break
  if label=='worker':
   observed=deps(OUT/'worker-host.d');expected={path.replace(str(OLD_FLAT),str(flat)) for path in old_deps};assert observed==expected,{'added':sorted(observed-expected),'removed':sorted(expected-observed)}
   for name in [inc['name'],'AuxStorageRootsNapi.inc','AuxBrokerWritesNapi.inc']:
    chosen=sorted(path for path in observed if Path(path).name==name);assert chosen==[str(flat/name)],(name,chosen);selected.append({'name':name,'path':chosen[0],'sha256':sha(chosen[0])})
   shutil.copyfile(OUT/'worker-host.d',HERE/'actual-worker-host.d')
   undefined=subprocess.run(['/usr/bin/nm','-u',str(OUT/'worker-host.o')],check=True,capture_output=True,text=True).stdout
   assert '_AuxCopyAuthenticatedMemoryControlParent' in undefined and '_AuxNativeContextValidateOrdinaryStorageAuthority' in undefined
   (HERE/'actual-selected-includes.json').write_text(json.dumps({'actualDependencyCount':len(observed),'allOtherDependencyPathsUnchanged':True,'selectedIncludes':selected,'memoryMetadataSymbolReferenced':True,'ordinaryStorageValidatorReferenced':True},indent=2)+'\n')
 receipt={'format':'aux.finite-memory-control-parent-build-result.v1','passed':len(results)==2 and all(row['exitCode']==0 for row in results),'results':results,'seconds':time.monotonic()-start,'planSha256':sha(HERE/'build-plan.json'),'sourcePlanSha256':sha(HERE/'source-plan.json'),'unchangedSwiftSourceCount':49,'unchangedNativeObjectCount':14,'a67MainAndActualNodeLayoutUnchanged':True,'a66OrdinaryIncludesUnchanged':True,'actualSelectedIncludes':selected,'productExecuted':False,'productSigned':False,'originalRootAccessed':False}
 for group in [pins,dependency_pins,flat_pins,unchanged_swift,unchanged_objects]:
  for path,digest in group.items():assert sha(path)==digest,path
 assert sha(actual['binary'])==OLD_BINARY_SHA
 if receipt['passed']:
  binary=OUT/'Aux Daemon';file=subprocess.run(['/usr/bin/file',str(binary)],check=True,capture_output=True,text=True);loads=subprocess.run(['/usr/bin/otool','-l',str(binary)],check=True,capture_output=True,text=True);signed=subprocess.run(['/usr/bin/codesign','-d',str(binary)],capture_output=True,text=True)
  assert 'Mach-O 64-bit executable arm64' in file.stdout and 'LC_CODE_SIGNATURE' not in loads.stdout and signed.returncode!=0 and 'not signed at all' in signed.stderr
  receipt.update(binary=str(binary),binarySha256=sha(binary),binarySize=binary.stat().st_size,workerObjectSha256=sha(OUT/'worker-host.o'),actualDependencyFileSha256=sha(OUT/'worker-host.d'),codeSignatureLoadCommandPresent=False,codesignDisplayExitCode=signed.returncode,inputPinsUnchanged=True,priorBinaryUnchanged=True)
 (HERE/'actual-build.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2),flush=True)
 raise SystemExit(0 if receipt['passed'] else 1)
