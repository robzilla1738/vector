#!/usr/bin/env python3
"""Root-only approved addon pin rebuild, under scripts/native-build.py."""
from pathlib import Path
import argparse, hashlib, json, os, shutil, subprocess, time
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
WORK=Path('/private/tmp/aux-two-addon-local-signing-20261026-a1')
HERE=Path(__file__).resolve().parent
sha=lambda path:hashlib.sha256(Path(path).read_bytes()).hexdigest()
review=HERE/'review.json'
assert sha(review)=='5138937e149f3ff805f70ed92e552b7cc444e2d8e697d0d5c82582f20695b037'
assert json.loads((HERE/'owner-approval.json').read_text())['reviewSha256']==sha(review)
assert json.loads((WORK/'signing-receipt.json').read_text())['passed']
plan_path=WORK/'successor/source-and-build-plan.json'
plan=json.loads(plan_path.read_text())
parser=argparse.ArgumentParser();parser.add_argument('--sdk-repair',action='store_true');args=parser.parse_args()
out=Path(plan['buildDirectoryMustBeCreatedByRoot'])
assert out==WORK/'successor/build'
commands=json.loads(json.dumps(plan['commands']))
if args.sdk_repair:
 original_out=out;out=WORK/'successor/build-a2'
 for command in commands:
  command[:]=[part.replace(str(original_out)+'/',str(out)+'/') for part in command]
 for command in commands[:2]:command[1:1]=['-isysroot','/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk']
assert not out.exists()
pins=dict(plan['inheritedLinkInputPins'])
for row in plan['overlays'].values():pins[row['path']]=row['sha256']
pins[plan['descriptor']['path']]=plan['descriptor']['sha256']
for row in plan['signedInputs']:pins[row['path']]=row['sha256']
for name,expected in pins.items():
 if sha(name)!=expected:raise RuntimeError('Build input changed: '+name)
out.mkdir(mode=0o700)
receipt={'format':'aux.two-addon.actual-matching-build.v1','approvedReviewSha256':sha(review),
 'sourcePlanSha256':sha(plan_path),'inputPins':pins,'commands':[],'passed':False,
 'candidateChanged':False,'workerOrComputerUseRecompiled':False,'productSigned':False,'productExecuted':False,
 'sdkRepair':args.sdk_repair,'failedOriginalBuildPreserved':args.sdk_repair}
def run(command,cwd,log):
 started=time.monotonic()
 with log.open('wb') as stream:done=subprocess.run(command,cwd=cwd,stdout=stream,stderr=subprocess.STDOUT)
 receipt['commands'].append({'argv':command,'cwd':str(cwd),'log':str(log),'exitCode':done.returncode,'seconds':time.monotonic()-started})
 if done.returncode:raise RuntimeError('Matching build failed: '+str(log))
try:
 for i,command in enumerate(commands):run(command,ROOT,out/f'native-{i}.log')
 projection=plan['browserProjection'];target=Path(projection['preimage']['originalPath'])
 assert not target.is_symlink() and sha(target)==projection['preimage']['sha256']
 shutil.copy2(target,out/'browser-policy-before.swift')
 temp=target.with_name(target.name+'.approved-addon-pins')
 assert not temp.exists();shutil.copyfile(projection['path'],temp);temp.chmod(target.stat().st_mode&0o7777)
 assert sha(temp)==projection['sha256'];os.replace(temp,target)
 receipt['browserProjection']={'path':str(target),'beforeSha256':projection['preimage']['sha256'],'afterSha256':sha(target)}
 src=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
 command=[str(src/'third_party/ninja/ninja'),'-C',str(src/'out/AuxFast'),'-k4','-j4','chrome']
 run(command,src,out/'browser.log')
 assert sha(target)==projection['sha256']
 framework=src/'out/AuxFast/Aux.app/Contents/Frameworks/Aux Framework.framework/Versions/155.0.8059.85/Aux Framework'
 frozen=out/'Aux Framework'
 subprocess.run(['/bin/cp','-c',str(framework),str(frozen)],check=True)
 assert sha(framework)==sha(frozen)
 receipt['outputs']={str(path):sha(path) for path in [out/'pdf-lifetime.o',out/'utility-lifetime.o',out/'Aux Daemon',frozen]}
 for name,expected in pins.items():
  if sha(name)!=expected:raise RuntimeError('Input changed during build: '+name)
 receipt['passed']=True
except Exception as error:
 receipt['error']=str(error)
 raise
finally:(out/'build-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({'passed':True,'receipt':str(out/'build-receipt.json'),'outputs':receipt['outputs']}))
