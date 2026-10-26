"""Reproduce one approved Swift-only location substitution, unsigned and locked."""
from pathlib import Path
import hashlib,json,subprocess,time
HERE=Path(__file__).resolve().parent
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
PRIOR=ROOT/'docs/integration/proposed/browser-feature-expansion/local-daemon-memory-integration-a37'
REVIEW=ROOT/'docs/integration/proposed/browser-feature-expansion/local-completion-package-a38/disposable-location-review-a4'
OUT=Path('/private/tmp/aux-browser-only-daemon-build-20261025-a64')
APPROVED_POLICY_SHA='5e210c1fbec2224f3de0aada0d5215962a8de139ed596fa664d9ec3a8db2589f'
PRIOR_BINARY_SHA='4891d37f1dc60adc58c34392bf983e2dddb72ab87ec04f750b852f614827d6a4'
def sha(path):
 digest=hashlib.sha256()
 with Path(path).open('rb') as stream:
  while chunk:=stream.read(1024*1024):digest.update(chunk)
 return digest.hexdigest()
# Re-enter only via the workspace's real cross-lane native-build lock. No extra
# signing step and no unapproved compiler-default signature is permitted.
if __name__=='__main__':
 import sys
 if sys.argv[1:]!=['--under-native-build-lock']:
  raise SystemExit(subprocess.call(['/usr/bin/python3',str(ROOT/'scripts/native-build.py'),'/usr/bin/python3',str(Path(__file__).resolve()),'--under-native-build-lock'],cwd=ROOT))
 prior=json.loads((PRIOR/'build-plan.json').read_text());actual=json.loads((PRIOR/'actual-build.json').read_text())
 review=json.loads((REVIEW/'review.json').read_text())
 assert actual['passed'] and actual['planSha256']==sha(PRIOR/'build-plan.json')
 assert actual['binarySha256']==PRIOR_BINARY_SHA==sha(actual['binary'])
 assert review['proposedNamespace']=='Aux Browser A38 Disposable' and review['originalRootUnchanged']
 row=next(row for row in review['sourceChanges'] if row['proposed'].endswith('/daemon/AuxFreshBootstrapPolicy.swift'))
 assert row['proposedSha256']==APPROVED_POLICY_SHA==sha(row['proposed'])
 for path,digest in prior['inputFiles'].items():assert sha(path)==digest,path
 command=list(prior['commands'][1]);old=list(command)
 assert command.count(row['input'])==1 and sha(row['input'])==row['inputSha256']
 command[command.index(row['input'])]=row['proposed']
 output_index=command.index('-o')+1;old_output=command[output_index];command[output_index]=str(OUT/'Aux Daemon')
 assert [(a,b) for a,b in zip(old,command) if a!=b]==[(row['input'],row['proposed']),(old_output,str(OUT/'Aux Daemon'))]
 assert sum(arg.endswith('.swift') for arg in command)==50 and '-no_adhoc_codesign' in command
 assert command[command.index('-no_adhoc_codesign')-1]=='-Xlinker'
 assert not OUT.exists(),f'Preserve prior output; directory already exists: {OUT}'
 # Pin every actual explicit source/object/archive/compiler file selected by the
 # link, including the previous worker compilation output absent from old pins.
 inputs={arg:sha(arg) for index,arg in enumerate(command) if index!=output_index and Path(arg).is_file()}
 plan={'format':'aux.disposable-location.daemon-build.v1','previousPlan':str(PRIOR/'build-plan.json'),'previousPlanSha256':sha(PRIOR/'build-plan.json'),'previousReceiptSha256':sha(PRIOR/'actual-build.json'),'previousBinarySha256':PRIOR_BINARY_SHA,'approvedReview':str(REVIEW/'review.json'),'approvedReviewSha256':sha(REVIEW/'review.json'),'commands':[command],'changedSwiftSources':[{'input':row['input'],'inputSha256':row['inputSha256'],'output':row['proposed'],'outputSha256':APPROVED_POLICY_SHA}],'swiftSourceCount':50,'unchangedSwiftSourceCount':49,'unchangedNativeObjectCount':sum(arg.endswith('.o') for arg in command),'inputFiles':inputs,'priorInputFiles':prior['inputFiles'],'output':str(OUT/'Aux Daemon'),'unsignedLinkerFlagPreserved':True,'productExecuted':False,'productSigned':False,'nativeLockWrapper':str(ROOT/'scripts/native-build.py')}
 (HERE/'build-plan.json').write_text(json.dumps(plan,indent=2)+'\n')
 OUT.mkdir(mode=0o700)
 start=time.monotonic()
 with (OUT/'link.stdout').open('wb') as stdout,(OUT/'link.stderr').open('wb') as stderr:
  result=subprocess.run(command,cwd=ROOT,stdout=stdout,stderr=stderr)
 receipt={'format':'aux.disposable-location.daemon-build-result.v1','passed':result.returncode==0,'exitCode':result.returncode,'seconds':time.monotonic()-start,'planSha256':sha(HERE/'build-plan.json'),'stdout':str(OUT/'link.stdout'),'stderr':str(OUT/'link.stderr'),'swiftSourceCount':50,'unchangedSwiftSourceCount':49,'nativeObjectsRecompiled':False,'unsignedLinkerFlagPreserved':True,'productExecuted':False,'productSigned':False,'originalRootAccessed':False}
 for path,digest in inputs.items():assert sha(path)==digest,path
 for path,digest in prior['inputFiles'].items():assert sha(path)==digest,path
 assert sha(actual['binary'])==PRIOR_BINARY_SHA
 if receipt['passed']:
  binary=OUT/'Aux Daemon'
  macho=subprocess.run(['/usr/bin/file',str(binary)],check=True,capture_output=True,text=True)
  loads=subprocess.run(['/usr/bin/otool','-l',str(binary)],check=True,capture_output=True,text=True)
  signature=subprocess.run(['/usr/bin/codesign','-d',str(binary)],capture_output=True,text=True)
  assert 'Mach-O 64-bit executable arm64' in macho.stdout and 'LC_CODE_SIGNATURE' not in loads.stdout
  assert signature.returncode!=0 and 'not signed at all' in signature.stderr
  receipt.update(binary=str(binary),binarySha256=sha(binary),binarySize=binary.stat().st_size,machO=macho.stdout.strip(),codeSignatureLoadCommandPresent=False,codesignDisplayExitCode=signature.returncode,codesignDisplayStderr=signature.stderr.strip(),inputPinsUnchanged=True,priorBinaryUnchanged=True)
 (HERE/'actual-build.json').write_text(json.dumps(receipt,indent=2)+'\n')
 print(json.dumps(receipt,indent=2),flush=True)
 raise SystemExit(0 if receipt['passed'] else 1)
