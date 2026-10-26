from pathlib import Path
import hashlib,json,subprocess
HERE=Path(__file__).resolve().parent;r=json.loads((HERE/'typecheck-recipe.json').read_text());sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
def verify():
 for p,h in r['inputHashes'].items():
  if sha(p)!=h:raise RuntimeError('Typecheck input changed: '+p)
verify();out=Path(r['output'])
if out.exists():raise SystemExit('Fresh typecheck output required')
out.mkdir(mode=0o700)
with (out/'swift.log').open('wb') as log:done=subprocess.run(r['commands'][0],stdout=log,stderr=subprocess.STDOUT)
verify();(out/'receipt.json').write_text(json.dumps({'format':r['format'],'exitCode':done.returncode,'passed':done.returncode==0,'inputHashes':r['inputHashes'],'recipeSha256':sha(HERE/'typecheck-recipe.json'),'activated':False,'candidateChanged':False,'EntitlementRequired':True},indent=2)+'\n')
raise SystemExit(done.returncode)
