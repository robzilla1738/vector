"""Unsigned diagnostics-only successor of the exact successful A64 daemon."""
from pathlib import Path
import hashlib,json,subprocess,time,sys
HERE=Path(__file__).resolve().parent
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
PRIOR=HERE.parent
OUT=Path('/private/tmp/aux-browser-only-daemon-build-20261025-a65')
PRIOR_BINARY_SHA='b56560c77c734261792d5f3cf9877cfa49dceb6968a14453b6f4dfc2e7f95b5a'
def sha(path):
 digest=hashlib.sha256()
 with Path(path).open('rb') as stream:
  while chunk:=stream.read(1024*1024):digest.update(chunk)
 return digest.hexdigest()
if __name__=='__main__':
 if sys.argv[1:]!=['--under-native-build-lock']:
  raise SystemExit(subprocess.call(['/usr/bin/python3',str(ROOT/'scripts/native-build.py'),'/usr/bin/python3',str(Path(__file__).resolve()),'--under-native-build-lock'],cwd=ROOT))
 prior=json.loads((PRIOR/'build-plan.json').read_text());actual=json.loads((PRIOR/'actual-build.json').read_text());fix=json.loads((HERE/'source-plan.json').read_text())
 assert actual['passed'] and actual['planSha256']==sha(PRIOR/'build-plan.json')
 assert actual['binarySha256']==PRIOR_BINARY_SHA==sha(actual['binary'])
 row=fix['files'][0];assert sha(row['path'])==row['inputSha256']
 output=HERE/'source/AuxSignedFreshBootstrapPolicyLoader.swift'
 assert sha(output)==row['outputSha256']
 text=Path(row['path']).read_text()
 for anchor in row['anchors']:
  assert text.count(anchor['find'])==anchor['count'];text=text.replace(anchor['find'],anchor['replace'],1)
 assert text==output.read_text()
 for group in ['inputFiles','priorInputFiles']:
  for path,digest in prior[group].items():assert sha(path)==digest,path
 command=list(prior['commands'][0]);old=list(command)
 assert command.count(row['path'])==1;command[command.index(row['path'])]=str(output)
 output_index=command.index('-o')+1;old_output=command[output_index];command[output_index]=str(OUT/'Aux Daemon')
 assert [(a,b) for a,b in zip(old,command) if a!=b]==[(row['path'],str(output)),(old_output,str(OUT/'Aux Daemon'))]
 assert '-no_adhoc_codesign' in command and command[command.index('-no_adhoc_codesign')-1]=='-Xlinker'
 assert sum(arg.endswith('.swift') for arg in command)==50
 # The exact previously approved disposable-location policy remains selected.
 policy=next(path for path in command if path.endswith('/daemon/AuxFreshBootstrapPolicy.swift'))
 assert sha(policy)=='5e210c1fbec2224f3de0aada0d5215962a8de139ed596fa664d9ec3a8db2589f'
 assert not OUT.exists(),f'Preserve prior output: {OUT}'
 inputs={arg:sha(arg) for index,arg in enumerate(command) if index!=output_index and Path(arg).is_file()}
 plan={'format':'aux.disposable-location.daemon-diagnostics-build.v1','previousPlanSha256':sha(PRIOR/'build-plan.json'),'previousReceiptSha256':sha(PRIOR/'actual-build.json'),'previousBinarySha256':PRIOR_BINARY_SHA,'sourcePlanSha256':sha(HERE/'source-plan.json'),'commands':[command],'inputFiles':inputs,'priorInputFiles':prior['inputFiles'],'retainedHistoricalInputPins':prior['priorInputFiles'],'changedSwiftSources':[row],'swiftSourceCount':50,'unchangedSwiftSourceCount':49,'unchangedNativeObjectCount':sum(arg.endswith('.o') for arg in command),'approvedLocationPolicyPath':policy,'approvedLocationPolicySha256':sha(policy),'unsignedLinkerFlagPreserved':True,'nativeObjectsRecompiled':False,'productExecuted':False,'productSigned':False}
 (HERE/'build-plan.json').write_text(json.dumps(plan,indent=2)+'\n');OUT.mkdir(mode=0o700)
 start=time.monotonic()
 with (OUT/'link.stdout').open('wb') as stdout,(OUT/'link.stderr').open('wb') as stderr:
  result=subprocess.run(command,cwd=ROOT,stdout=stdout,stderr=stderr)
 receipt={'format':'aux.disposable-location.daemon-diagnostics-build-result.v1','passed':result.returncode==0,'exitCode':result.returncode,'seconds':time.monotonic()-start,'planSha256':sha(HERE/'build-plan.json'),'sourcePlanSha256':sha(HERE/'source-plan.json'),'stdout':str(OUT/'link.stdout'),'stderr':str(OUT/'link.stderr'),'swiftSourceCount':50,'unchangedSwiftSourceCount':49,'nativeObjectsRecompiled':False,'unsignedLinkerFlagPreserved':True,'productExecuted':False,'productSigned':False,'originalRootAccessed':False}
 for path,digest in inputs.items():assert sha(path)==digest,path
 for group in ['inputFiles','priorInputFiles']:
  for path,digest in prior[group].items():assert sha(path)==digest,path
 assert sha(actual['binary'])==PRIOR_BINARY_SHA
 if receipt['passed']:
  binary=OUT/'Aux Daemon';macho=subprocess.run(['/usr/bin/file',str(binary)],check=True,capture_output=True,text=True)
  loads=subprocess.run(['/usr/bin/otool','-l',str(binary)],check=True,capture_output=True,text=True)
  signed=subprocess.run(['/usr/bin/codesign','-d',str(binary)],capture_output=True,text=True)
  assert 'Mach-O 64-bit executable arm64' in macho.stdout and 'LC_CODE_SIGNATURE' not in loads.stdout
  assert signed.returncode!=0 and 'not signed at all' in signed.stderr
  receipt.update(binary=str(binary),binarySha256=sha(binary),binarySize=binary.stat().st_size,machO=macho.stdout.strip(),codeSignatureLoadCommandPresent=False,codesignDisplayExitCode=signed.returncode,codesignDisplayStderr=signed.stderr.strip(),inputPinsUnchanged=True,priorBinaryUnchanged=True)
 (HERE/'actual-build.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2),flush=True)
 raise SystemExit(0 if receipt['passed'] else 1)
