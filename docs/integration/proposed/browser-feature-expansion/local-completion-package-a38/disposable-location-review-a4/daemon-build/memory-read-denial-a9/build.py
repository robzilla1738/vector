"""Compile the existing fixed memory host denial diagnostic and link unsigned."""
from pathlib import Path
import hashlib,json,subprocess,time,sys,shutil
HERE=Path(__file__).resolve().parent
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
PRIOR=HERE.parent/'memory-control-parent-a8'
HELPER_PRIOR=ROOT/'docs/integration/proposed/browser-feature-expansion/local-daemon-memory-integration-a36/build-plan.json'
OUT=Path('/private/tmp/aux-browser-only-daemon-build-20261025-a69')
OLD_BINARY_SHA='45b7701c5f93169d20451b43fdb04ef846fe3d8833dc81c97e8bc8c45e2e7efb'
def sha(path):
 h=hashlib.sha256()
 with Path(path).open('rb') as stream:
  while chunk:=stream.read(1024*1024):h.update(chunk)
 return h.hexdigest()
def deps(path):return {x.strip(' \\') for x in Path(path).read_text().splitlines()[1:] if x.strip(' \\')}
if __name__=='__main__':
 if sys.argv[1:]!=['--under-native-build-lock']:
  raise SystemExit(subprocess.call(['/usr/bin/python3',str(ROOT/'scripts/native-build.py'),'/usr/bin/python3',str(Path(__file__).resolve()),'--under-native-build-lock'],cwd=ROOT))
 prior=json.loads((PRIOR/'build-plan.json').read_text());actual=json.loads((PRIOR/'actual-build.json').read_text());fix=json.loads((HERE/'source-plan.json').read_text());helper=json.loads(HELPER_PRIOR.read_text())
 assert actual['passed'] and actual['planSha256']==sha(PRIOR/'build-plan.json') and sha(actual['binary'])==actual['binarySha256']==OLD_BINARY_SHA
 for group in [prior['inputFiles'],prior['predecessorDependencyPins'],prior['unchangedSwiftSources'],prior['unchangedNativeObjects']]:
  for path,digest in group.items():assert sha(path)==digest,path
 row=fix['files'][0];source=HERE/row['source'];assert sha(row['path'])==row['inputSha256'] and sha(source)==row['outputSha256']
 text=Path(row['path']).read_text()
 for anchor in row['anchors']:assert text.count(anchor['find'])==anchor['count'];text=text.replace(anchor['find'],anchor['replace'],1)
 assert text==source.read_text()
 grammar=json.loads((HERE/'actual-profile-compile.json').read_text());assert grammar['compiled'] and not grammar['sandboxApplied']
 original=list(helper['commands'][0]);compile_command=list(original)
 compile_command[compile_command.index(row['path'])]=str(source);compile_command[compile_command.index('-o')+1]=str(OUT/'memory-helper.o');compile_command[compile_command.index('-MF')+1]=str(OUT/'memory-helper.d')
 assert '-DAUX_BROWSER_ONLY_NATIVE_STARTUP=1' in compile_command
 old_deps=deps('/private/tmp/aux-browser-only-daemon-build-20261025-a62/memory-helper.d');dependency_pins={x:sha(x) for x in sorted(old_deps)}
 link=list(prior['commands'][1]);before=list(link);old_object=next(arg for arg in link if arg.endswith('/memory-helper.o'));link[link.index(old_object)]=str(OUT/'memory-helper.o');output_index=link.index('-o')+1;link[output_index]=str(OUT/'Aux Daemon')
 assert len([(a,b) for a,b in zip(before,link) if a!=b])==2
 assert '-no_adhoc_codesign' in link and sum(x.endswith('.swift') for x in link)==50
 unchanged_objects={arg:sha(arg) for arg in link if arg.endswith('.o') and Path(arg).exists()};assert len(unchanged_objects)==14
 unchanged_swift={arg:sha(arg) for arg in link if arg.endswith('.swift')};assert len(unchanged_swift)==50
 assert not OUT.exists(),f'Preserve prior output: {OUT}'
 OUT.mkdir(mode=0o700)
 pins={arg:sha(arg) for cmd in [compile_command,link] for arg in cmd if Path(arg).is_file()}
 plan={'format':'aux.memory-read-denial-build.v1','sourcePlanSha256':sha(HERE/'source-plan.json'),'priorPlanSha256':sha(PRIOR/'build-plan.json'),'priorBinarySha256':OLD_BINARY_SHA,'commands':[compile_command,link],'originalHelperCompileCommand':original,'inputFiles':pins,'predecessorDependencyPins':dependency_pins,'unchangedSwiftSources':unchanged_swift,'unchangedNativeObjects':unchanged_objects,'profileCompileReceiptSha256':sha(HERE/'actual-profile-compile.json'),'changedNativeObjectCount':1,'productSigned':False,'productExecuted':False}
 (HERE/'build-plan.json').write_text(json.dumps(plan,indent=2)+'\n');start=time.monotonic();results=[]
 for label,command in [('memory-helper',compile_command),('link',link)]:
  with (OUT/(label+'.stdout')).open('wb') as stdout,(OUT/(label+'.stderr')).open('wb') as stderr:result=subprocess.run(command,cwd=ROOT,stdout=stdout,stderr=stderr)
  results.append({'label':label,'exitCode':result.returncode})
  if result.returncode:break
  if label=='memory-helper':
   observed=deps(OUT/'memory-helper.d');expected={str(source) if path==row['path'] else path for path in old_deps};assert observed==expected,{'added':sorted(observed-expected),'removed':sorted(expected-observed)}
   shutil.copyfile(OUT/'memory-helper.d',HERE/'actual-memory-helper.d')
   (HERE/'actual-dependencies.json').write_text(json.dumps({'dependencyFileSha256':sha(OUT/'memory-helper.d'),'actualDependencyCount':len(observed),'onlyChangedDependency':str(source),'allOtherDependencyPathsUnchanged':True},indent=2)+'\n')
 receipt={'format':'aux.memory-read-denial-build-result.v1','passed':len(results)==2 and all(row['exitCode']==0 for row in results),'results':results,'seconds':time.monotonic()-start,'planSha256':sha(HERE/'build-plan.json'),'sourcePlanSha256':sha(HERE/'source-plan.json'),'unchangedSwiftSourceCount':50,'unchangedNativeObjectCount':14,'a67MainAndActualNodeLayoutUnchanged':True,'a66OrdinaryIncludesAndA68WorkerUnchanged':True,'a47LoaderUnchanged':True,'deniedRightsAndFiltersUnchanged':True,'productExecuted':False,'productSigned':False,'originalRootAccessed':False}
 for group in [pins,dependency_pins,unchanged_swift,unchanged_objects]:
  for path,digest in group.items():assert sha(path)==digest,path
 assert sha(actual['binary'])==OLD_BINARY_SHA
 if receipt['passed']:
  binary=OUT/'Aux Daemon';file=subprocess.run(['/usr/bin/file',str(binary)],check=True,capture_output=True,text=True);loads=subprocess.run(['/usr/bin/otool','-l',str(binary)],check=True,capture_output=True,text=True);signed=subprocess.run(['/usr/bin/codesign','-d',str(binary)],capture_output=True,text=True)
  assert 'Mach-O 64-bit executable arm64' in file.stdout and 'LC_CODE_SIGNATURE' not in loads.stdout and signed.returncode!=0 and 'not signed at all' in signed.stderr
  receipt.update(binary=str(binary),binarySha256=sha(binary),binarySize=binary.stat().st_size,memoryHostObjectSha256=sha(OUT/'memory-helper.o'),actualDependencyFileSha256=sha(OUT/'memory-helper.d'),codeSignatureLoadCommandPresent=False,codesignDisplayExitCode=signed.returncode,inputPinsUnchanged=True,priorBinaryUnchanged=True)
 (HERE/'actual-build.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2),flush=True)
 raise SystemExit(0 if receipt['passed'] else 1)
