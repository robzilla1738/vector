#!/usr/bin/env python3
"""Compose exact Chromium proposals in a fresh scratch directory, never shared source."""
import argparse, hashlib, json, pathlib, subprocess
H=pathlib.Path(__file__).resolve().parent
P=H.parents[1]
N=pathlib.Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
R=P/'profile-isolation-next/browser-roots'
C=P/'profile-isolation-continuation/native-startup'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
a=argparse.ArgumentParser();a.add_argument('--output',required=True);args=a.parse_args()
O=pathlib.Path(args.output).resolve()
if O.exists(): raise SystemExit('fresh output required')
O.mkdir(mode=0o700);S=O/'source';S.mkdir()
patches=[R/'native.patch',R/'early-local-state.patch',C/'native.patch']
paths=set()
for patch in patches:
 for line in patch.read_text().splitlines():
  if line.startswith('+++ b/'): paths.add(line[6:])
base={}
for name in sorted(paths):
 p=N/name;base[name]=sha(p) if p.exists() else None
 if p.exists():
  q=S/name;q.parent.mkdir(parents=True,exist_ok=True);q.write_bytes(p.read_bytes())
receipt={'format':'aux.browser.scratch-composition.v1','passed':False,'baseline':base,'patches':[],'sharedSourceChanged':False,'appBuilt':False,'appExecuted':False,'signed':False,'uiFilesChanged':False}
try:
 for index,patch in enumerate(patches):
  # Pins describe sequential snapshots; checking them before replay prevents
  # context fuzz from silently accepting an unrelated owner-source change.
  if index==0: pins=json.loads((R/'native-inputs.json').read_text())['baselineFiles']
  elif index==1: pins=json.loads((R/'early-inputs.json').read_text())['baselineFiles']
  else: pins={k:v['before'] for k,v in json.loads((C/'patch-inputs.json').read_text()).items()}
  for name,digest in pins.items():
   if sha(S/name)!=digest: raise RuntimeError('baseline mismatch: '+name)
  run=subprocess.run(['git','apply','--unsafe-paths','--directory='+str(S),str(patch)],capture_output=True,text=True)
  receipt['patches'].append({'path':str(patch),'sha256':sha(patch),'exitCode':run.returncode,'diagnostic':run.stderr})
  if run.returncode:raise RuntimeError('patch replay failed')
 # These two new native files are pinned explicit additions, not part of old diff.
 receipt['explicitAdditions']={}
 for name in ['chrome/browser/aux/AuxBrowserNetworkPaths.cc','chrome/browser/aux/AuxBrowserNetworkPaths.h']:
  p=C/'source'/name;q=S/name
  if q.exists() or (N/name).exists():raise RuntimeError('unexpected existing addition: '+name)
  q.parent.mkdir(parents=True,exist_ok=True);q.write_bytes(p.read_bytes());receipt['explicitAdditions'][name]=sha(p)
 for name,pins in json.loads((C/'patch-inputs.json').read_text()).items():
  if sha(S/name)!=pins['after']:raise RuntimeError('cache output mismatch: '+name)
 receipt['output']={str(p.relative_to(S)):sha(p) for p in sorted(S.rglob('*')) if p.is_file()}
 receipt['passed']=True
except Exception as e:receipt['error']=str(e)
finally:
 receipt['baselineUnchanged']=all((sha(N/n) if (N/n).exists() else None)==v for n,v in base.items())
 receipt['passed']=receipt['passed'] and receipt['baselineUnchanged']
 (O/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({'passed':receipt['passed'],'error':receipt.get('error'),'receipt':str(O/'receipt.json')}))
if not receipt['passed']:raise SystemExit(1)
