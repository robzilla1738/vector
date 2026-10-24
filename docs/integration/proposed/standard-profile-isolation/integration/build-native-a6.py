#!/usr/bin/env python3
"""Run only pinned compile/link commands under scripts/native-build.py."""
from pathlib import Path
import hashlib,json,re,shlex,subprocess,sys,time
here=Path(__file__).resolve().parent
planpath=here/'native-build-a6.json';plan=json.loads(planpath.read_text());out=Path(plan['output'])
assert not out.exists();out.mkdir(mode=0o700)
def sha(p):
 with open(p,'rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
frozen=dict(plan['linkManifestTemplate']['frozenFiles']);frozen.update(plan['frozenNewSources']);frozen[str(planpath)]=sha(planpath)
def verify():
 for p,h in frozen.items():
  if sha(p)!=h:raise RuntimeError('Native input changed: '+p)
result={'format':'aux.standard-daemon.compile.v1','passed':False,'commands':[],'productSigned':False,'productExecuted':False,'runtimeAuthorityGranted':False,'planSha256':sha(planpath)}
def run(name,command):
 t=time.monotonic();log=out/(name+'.log')
 with log.open('w') as stream:r=subprocess.run(command,stdout=stream,stderr=subprocess.STDOUT)
 result['commands'].append({'name':name,'command':command,'exitCode':r.returncode,'seconds':time.monotonic()-t})
 if r.returncode:raise RuntimeError(name+' failed; see '+str(log))
try:
 verify()
 # Obtain real compiler dependency closures before producing objects. Then pin
 # all project headers, so a late header change cannot inherit old source proof.
 for row in plan['commands']:
  c=row['command'];scan=[];i=0
  while i<len(c):
   if c[i] in ['-o','-MF']:i+=2;continue
   if c[i] in ['-c','-MMD']:i+=1;continue
   scan.append(c[i]);i+=1
  dep=out/(row['name']+'.scan.d');scan+=['-MM','-MF',str(dep),'-MT',row['name']+'.o'];run(row['name']+'-dependencies',scan)
  text=re.sub(r'\\\n',' ',dep.read_text());items=shlex.split(text.split(':',1)[1])
  for name in items:
   p=str(Path(name).resolve());h=sha(p)
   if p in frozen and frozen[p]!=h:raise RuntimeError('Discovered dependency changed: '+p)
   frozen[p]=h
 verify()
 for row in plan['commands']:run(row['name'],row['command'])
 verify()
 manifest=plan['linkManifestTemplate'];manifest['frozenFiles']=dict(frozen)
 for path in out.glob('*.o'):manifest['frozenFiles'][str(path)]=sha(path)
 manifest['standardIsolationSourceComposition']=plan['sourceComposition'];manifest['activated']=False
 mp=out/'daemon-inputs.json';mp.write_text(json.dumps(manifest,indent=2)+'\n')
 checker=here.parents[2]/'profile-isolation-continuation/build/link-daemon.py'
 # here = standard-profile-isolation/integration; sibling proposal checker.
 checker=here.parent.parent/'profile-isolation-continuation/build/link-daemon.py'
 run('link',[sys.executable,str(checker),str(mp)])
 verify();result.update(passed=True,dependencyCount=len(frozen),linkManifestSha256=sha(mp),linkReceipt=str(Path(manifest['output'])/'results.json'))
except Exception as e:result['error']=str(e)
finally:(out/'results.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:result.get(k) for k in ['passed','error','dependencyCount','linkReceipt']}));raise SystemExit(0 if result['passed'] else 1)
