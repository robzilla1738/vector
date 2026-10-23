#!/usr/bin/env python3
"""APFS clone-only source/AuxFast snapshot; no fallback byte copy or shared writes."""
import argparse,json,pathlib,subprocess,time,hashlib
N=pathlib.Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
p=argparse.ArgumentParser();p.add_argument('--output',required=True);a=p.parse_args();O=pathlib.Path(a.output).resolve();S=O/'src'
if O.exists():raise SystemExit('fresh output required')
O.mkdir(mode=0o700);S.mkdir()
exclude={'out','.DS_Store','.agents','.claude','.gemini'}
r={'format':'aux.chromium.clone-snapshot.v1','passed':False,'sourceRoot':str(N),'snapshotRoot':str(S),'excludedTopLevel':sorted(exclude),'buildOutput':'out/AuxFast','copied':[],'started':time.time(),'fullBuildPassed':False,'signed':False,'sharedTreeChanged':False}
try:
 for src in sorted(N.iterdir()):
  if src.name in exclude:continue
  run=subprocess.run(['/bin/cp','-cR',str(src),str(S/src.name)],capture_output=True,text=True)
  r['copied'].append({'name':src.name,'exitCode':run.returncode})
  if run.returncode:raise RuntimeError(src.name+': '+run.stderr[:1000])
  (O/'progress.json').write_text(json.dumps(r,indent=2)+'\n')
 (S/'out').mkdir()
 run=subprocess.run(['/bin/cp','-cR',str(N/'out/AuxFast'),str(S/'out/AuxFast')],capture_output=True,text=True)
 r['copied'].append({'name':'out/AuxFast','exitCode':run.returncode})
 if run.returncode:raise RuntimeError('AuxFast: '+run.stderr[:1000])
 r['passed']=True
except Exception as e:r['error']=str(e)
finally:
 r['elapsedSeconds']=time.time()-r['started'];(O/'receipt.json').write_text(json.dumps(r,indent=2)+'\n')
print(json.dumps({'passed':r['passed'],'elapsedSeconds':r['elapsedSeconds'],'receipt':str(O/'receipt.json')}))
if not r['passed']:raise SystemExit(1)
