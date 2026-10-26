#!/usr/bin/env python3
"""Compile the actual four inactive producer objects under native-build.py."""
from pathlib import Path
import argparse,hashlib,json,subprocess,time
HERE=Path(__file__).resolve().parent
BASE=HERE.parent/'exec-session-runtime/compile-recipe.json'
def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
p=argparse.ArgumentParser();p.add_argument('--output',required=True);args=p.parse_args()
out=Path(args.output).resolve();assert not out.exists(),'Fresh output required'
base=json.loads(BASE.read_text());pins=base['inputHashes'].copy()
for path,expected in pins.items():assert sha(path)==expected,'Base source changed: '+path
sources=[p for p in (HERE/'source').iterdir() if p.is_file()]
pins.update({str(p):sha(p) for p in sources});pins[str(BASE)]=sha(BASE)
commands=[]
for i,original in enumerate(base['commands']):
 command=[value.replace(base['output'],str(out)) for value in original]
 if i==3:
  old=next(value for value in command if value.endswith('/AuxDevelopmentWorkerHost.cc'))
  command[command.index(old)]=str(HERE/'source/AuxDevelopmentWorkerHost.cc')
  command.insert(1,'-I'+str(HERE/'source'))
 commands.append(command)
out.mkdir(mode=0o700)
recipe={'format':'aux.selected-fs-four-producer-compile.v1','commands':commands,'commandWorkingDirectories':base['commandWorkingDirectories'],'inputHashes':pins,'output':str(out),'sourceOnly':True}
(out/'recipe.json').write_text(json.dumps(recipe,indent=2)+'\n')
r={'format':'aux.selected-fs-four-producer-check.v1','recipeSha256':sha(out/'recipe.json'),'commands':[],'passed':False,'linked':False,'executed':False,'signed':False,'candidateChanged':False}
try:
 for i in [3,0,1,2]:
  start=time.monotonic()
  with (out/f'command-{i}.log').open('wb') as log:result=subprocess.run(commands[i],cwd=base['commandWorkingDirectories'][i],stdout=log,stderr=subprocess.STDOUT)
  r['commands'].append({'index':i,'exitCode':result.returncode,'seconds':time.monotonic()-start})
  if result.returncode:raise RuntimeError(f'Compile failed; see {out}/command-{i}.log')
 for path,expected in pins.items():assert sha(path)==expected,'Source changed during compile: '+path
 r['outputs']={p.name:sha(p) for p in out.iterdir() if p.suffix in ['.o','.d']};r['passed']=True
finally:(out/'receipt.json').write_text(json.dumps(r,indent=2)+'\n')
print(json.dumps(r))
