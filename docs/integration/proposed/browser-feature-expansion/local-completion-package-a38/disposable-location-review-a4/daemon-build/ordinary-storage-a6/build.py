"""Restore two exact existing ordinary includes; rebuild one object, unsigned."""
from pathlib import Path
import hashlib,json,subprocess,time,sys,shutil
HERE=Path(__file__).resolve().parent
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
PRIOR=HERE.parent/'diagnostics-a5'
WORKER_PRIOR=ROOT/'docs/integration/proposed/browser-feature-expansion/local-daemon-memory-integration-a37'
OUT=Path('/private/tmp/aux-browser-only-daemon-build-20261025-a66')
OLD_OUT=Path('/private/tmp/aux-browser-only-daemon-build-20261025-a63')
OLD_BINARY_SHA='d8152a51466e26341299bdefe724ca5e9f3cb534f48f7728ff8df98d2a75ca80'
def sha(path):
 h=hashlib.sha256()
 with Path(path).open('rb') as f:
  while chunk:=f.read(1024*1024):h.update(chunk)
 return h.hexdigest()
def dep_paths(path):
 lines=Path(path).read_text().splitlines()
 return {line.strip(' \\') for line in lines[1:] if line.strip(' \\')}
if __name__=='__main__':
 if sys.argv[1:]!=['--under-native-build-lock']:
  raise SystemExit(subprocess.call(['/usr/bin/python3',str(ROOT/'scripts/native-build.py'),'/usr/bin/python3',str(Path(__file__).resolve()),'--under-native-build-lock'],cwd=ROOT))
 prior=json.loads((PRIOR/'build-plan.json').read_text());actual=json.loads((PRIOR/'actual-build.json').read_text());fix=json.loads((HERE/'source-plan.json').read_text())
 assert actual['passed'] and actual['planSha256']==sha(PRIOR/'build-plan.json') and sha(actual['binary'])==OLD_BINARY_SHA
 for group in ['inputFiles','priorInputFiles','retainedHistoricalInputPins']:
  for path,digest in prior[group].items():assert sha(path)==digest,path
 for path,digest in fix['unchangedFlatInputs'].items():assert sha(path)==digest,path
 for row in fix['files']:
  assert sha(row['priorSelectedPath'])==row['inputSha256'] and sha(HERE/'preimages'/row['name'])==row['inputSha256']
  assert sha(row['existingOrdinaryPath'])==row['outputSha256']==sha(HERE/'source'/row['name'])
  text=Path(row['priorSelectedPath']).read_text()
  for anchor in row['anchors']:
   assert text.count(anchor['find'])==anchor['count'];text=text.replace(anchor['find'],anchor['replace'],1)
  assert text==(HERE/'source'/row['name']).read_text()
 old_deps=dep_paths(OLD_OUT/'worker-host.d');assert old_deps and all(Path(path).is_file() for path in old_deps)
 predecessor_deps={path:sha(path) for path in sorted(old_deps)}
 assert not OUT.exists(),f'Preserve prior output: {OUT}'
 OUT.mkdir(mode=0o700);flat=OUT/'source';flat.mkdir(mode=0o700)
 for path,digest in fix['unchangedFlatInputs'].items():
  dest=flat/Path(path).name;shutil.copyfile(path,dest);assert sha(dest)==digest
 for row in fix['files']:
  dest=flat/row['name'];shutil.copyfile(HERE/'source'/row['name'],dest);assert sha(dest)==row['outputSha256']
 old_flat=fix['currentFlatSourceDirectory']
 original_worker=json.loads((WORKER_PRIOR/'build-plan.json').read_text())['commands'][0]
 worker=[arg.replace(old_flat,str(flat)) for arg in original_worker]
 worker[worker.index('-o')+1]=str(OUT/'worker-host.o');worker[worker.index('-MF')+1]=str(OUT/'worker-host.d')
 assert '-DAUX_BROWSER_ONLY_NATIVE_STARTUP=1' in worker
 assert worker[worker.index('-c')-1]==str(flat/'AuxDevelopmentWorkerHost.cc')
 link=list(prior['commands'][0]);old_link=list(link)
 old_worker=next(arg for arg in link if arg.endswith('/worker-host.o'));link[link.index(old_worker)]=str(OUT/'worker-host.o')
 output_index=link.index('-o')+1;old_output=link[output_index];link[output_index]=str(OUT/'Aux Daemon')
 assert [(a,b) for a,b in zip(old_link,link) if a!=b]==[(old_worker,str(OUT/'worker-host.o')),(old_output,str(OUT/'Aux Daemon'))]
 assert sum(arg.endswith('.swift') for arg in link)==50 and '-no_adhoc_codesign' in link
 assert link[link.index('-no_adhoc_codesign')-1]=='-Xlinker'
 inputs={arg:sha(arg) for index,arg in enumerate(link) if index!=output_index and Path(arg).is_file()}
 inputs.update({arg:sha(arg) for arg in worker if Path(arg).is_file()})
 inputs.update({str(path):sha(path) for path in sorted(flat.iterdir())})
 plan={'format':'aux.restore-ordinary-storage.actual-build.v1','sourcePlanSha256':sha(HERE/'source-plan.json'),'previousWorkerPlanSha256':sha(WORKER_PRIOR/'build-plan.json'),'previousLinkPlanSha256':sha(PRIOR/'build-plan.json'),'previousBinarySha256':OLD_BINARY_SHA,'commands':[worker,link],'inputFiles':inputs,'predecessorDependencyPins':predecessor_deps,'previousDependencyFileSha256':sha(OLD_OUT/'worker-host.d'),'unchangedFlatSourceCount':len(fix['unchangedFlatInputs']),'restoredExistingIncludeCount':2,'unchangedSwiftSourceCount':50,'unchangedNativeObjectCount':14,'workerObjectRecompiledOnly':True,'productExecuted':False,'productSigned':False,'unsignedLinkerFlagPreserved':True}
 (HERE/'build-plan.json').write_text(json.dumps(plan,indent=2)+'\n');start=time.monotonic();results=[];evidence=[]
 for label,command in [('worker',worker),('link',link)]:
  with (OUT/(label+'.stdout')).open('wb') as stdout,(OUT/(label+'.stderr')).open('wb') as stderr:
   result=subprocess.run(command,cwd=ROOT,stdout=stdout,stderr=stderr)
  results.append({'label':label,'exitCode':result.returncode})
  if result.returncode:break
  if label=='worker':
   actual_deps=dep_paths(OUT/'worker-host.d')
   expected_deps={path.replace(old_flat,str(flat)) for path in old_deps}
   for row in fix['files']:
    expected_deps.remove(row['priorSelectedPath']);expected_deps.add(str(flat/row['name']))
    chosen=sorted(path for path in actual_deps if Path(path).name==row['name'])
    assert chosen==[str(flat/row['name'])],(row['name'],chosen)
    assert row['priorSelectedPath'] not in actual_deps
    evidence.append({'name':row['name'],'selectedPath':chosen[0],'sha256':sha(chosen[0]),'expectedSha256':row['outputSha256'],'priorPathNotSelected':True})
   assert actual_deps==expected_deps,{'added':sorted(actual_deps-expected_deps),'removed':sorted(expected_deps-actual_deps)}
   shutil.copyfile(OUT/'worker-host.d',HERE/'actual-worker-host.d')
   (HERE/'actual-selected-includes.json').write_text(json.dumps({'format':'aux.actual-ordinary-include-selection.v1','dependencyFileSha256':sha(OUT/'worker-host.d'),'selectedIncludes':evidence,'allOtherDependencyPathsUnchanged':True,'actualDependencyCount':len(actual_deps)},indent=2)+'\n')
 receipt={'format':'aux.restore-ordinary-storage.actual-result.v1','passed':len(results)==2 and all(row['exitCode']==0 for row in results),'results':results,'seconds':time.monotonic()-start,'planSha256':sha(HERE/'build-plan.json'),'sourcePlanSha256':sha(HERE/'source-plan.json'),'swiftSourceCount':50,'unchangedSwiftSourceCount':50,'unchangedNativeObjectCount':14,'workerObjectRecompiledOnly':True,'actualSelectedIncludes':evidence,'productExecuted':False,'productSigned':False,'originalRootAccessed':False,'unsignedLinkerFlagPreserved':True}
 for path,digest in inputs.items():assert sha(path)==digest,path
 for path,digest in predecessor_deps.items():assert sha(path)==digest,path
 for group in ['inputFiles','priorInputFiles','retainedHistoricalInputPins']:
  for path,digest in prior[group].items():assert sha(path)==digest,path
 assert sha(actual['binary'])==OLD_BINARY_SHA
 if receipt['passed']:
  binary=OUT/'Aux Daemon';macho=subprocess.run(['/usr/bin/file',str(binary)],check=True,capture_output=True,text=True)
  loads=subprocess.run(['/usr/bin/otool','-l',str(binary)],check=True,capture_output=True,text=True)
  signed=subprocess.run(['/usr/bin/codesign','-d',str(binary)],capture_output=True,text=True)
  symbols=subprocess.run(['/usr/bin/nm','-u',str(OUT/'worker-host.o')],check=True,capture_output=True,text=True)
  assert '_AuxNativeContextValidateOrdinaryStorageAuthority' in symbols.stdout
  assert 'Mach-O 64-bit executable arm64' in macho.stdout and 'LC_CODE_SIGNATURE' not in loads.stdout
  assert signed.returncode!=0 and 'not signed at all' in signed.stderr
  receipt.update(binary=str(binary),binarySha256=sha(binary),binarySize=binary.stat().st_size,workerObjectSha256=sha(OUT/'worker-host.o'),actualDependencyFileSha256=sha(OUT/'worker-host.d'),codeSignatureLoadCommandPresent=False,codesignDisplayExitCode=signed.returncode,codesignDisplayStderr=signed.stderr.strip(),ordinaryValidatorReferencePresent=True,inputPinsUnchanged=True,priorBinaryUnchanged=True)
 (HERE/'actual-build.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2),flush=True)
 raise SystemExit(0 if receipt['passed'] else 1)
