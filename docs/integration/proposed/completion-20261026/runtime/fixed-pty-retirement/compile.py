#!/usr/bin/env python3
"""Root-only object checks; invoke under scripts/native-build.py. Never link/run."""
from pathlib import Path
import hashlib,json,subprocess,time
HERE=Path(__file__).resolve().parent
recipe_path=HERE/'compile-recipe.json';recipe=json.loads(recipe_path.read_text())
def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def verify():
 for path,expected in recipe['inputHashes'].items():
  if sha(path)!=expected:raise RuntimeError('Frozen compile input changed: '+path)
verify();out=Path(recipe['output'])
if out.exists():raise SystemExit('Fresh compile output required')
out.mkdir(mode=0o700)
r={'format':'aux.fixed-pty-retirement-object-check.v1','recipeSha256':sha(recipe_path),'commands':[],'linked':False,'activated':False,'candidateChanged':False,'reviewChanged':False,'EntitlementRequired':True}
try:
 for i,command in enumerate(recipe['commands']):
  start=time.monotonic()
  with (out/f'command-{i}.log').open('wb') as log:result=subprocess.run(command,stdout=log,stderr=subprocess.STDOUT,cwd='/Users/rcourson/Documents/Vibe/web')
  r['commands'].append({'argv':command,'exitCode':result.returncode,'seconds':time.monotonic()-start})
  if result.returncode:raise RuntimeError('Object compile failed: '+str(i))
 verify();r['outputs']={str(f):sha(f) for f in out.iterdir() if f.suffix in ['.o','.d']};r['passed']=True
except Exception as error:r['passed']=False;r['error']=str(error);raise
finally:(out/'receipt.json').write_text(json.dumps(r,indent=2)+'\n')
