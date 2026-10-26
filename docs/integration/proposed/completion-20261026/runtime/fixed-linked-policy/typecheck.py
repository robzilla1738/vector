from pathlib import Path
import hashlib,json,subprocess,time
HERE=Path(__file__).resolve().parent;r=json.loads((HERE/'typecheck-recipe.json').read_text());sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
def verify():
 for p,h in r['inputHashes'].items():
  if sha(p)!=h:raise RuntimeError('Typecheck input changed: '+p)
verify();out=Path(r['output'])
if out.exists():raise SystemExit('Fresh paired typecheck output required')
out.mkdir(mode=0o700)
receipt={'format':r['format'],'commands':[],'EntitlementRequired':True,'activated':False,'candidateChanged':False,'recipeSha256':sha(HERE/'typecheck-recipe.json')}
try:
 for i,c in enumerate(r['commands']):
  start=time.monotonic()
  with (out/f'command-{i}.log').open('wb') as log:done=subprocess.run(c,stdout=log,stderr=subprocess.STDOUT)
  receipt['commands'].append({'argv':c,'exitCode':done.returncode,'seconds':time.monotonic()-start})
  if done.returncode:raise RuntimeError('Paired policy typecheck failed: '+str(i))
 verify();receipt['passed']=True
except Exception as e:receipt['passed']=False;receipt['error']=str(e);raise
finally:(out/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
