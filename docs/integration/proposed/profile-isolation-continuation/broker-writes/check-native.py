#!/usr/bin/env python3
"""One actual host object and paired whole-module Swift typecheck; no execution."""
import hashlib,json,subprocess,shlex
from pathlib import Path
H=Path(__file__).resolve().parent
R=Path('/Users/rcourson/Documents/Vibe/web')
O=Path('/private/tmp/aux-broker-writes-native-20261023-final3')
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
if O.exists():raise SystemExit('Fresh output required')
O.mkdir(mode=0o700)
host=json.loads((R/'docs/integration/proposed/final-completion/native/exec-parent/inputs.json').read_text())['commands'][0]
cmd=list(host['command'])
cmd[cmd.index('-c')+1]=str(H/'source/AuxDevelopmentWorkerHost.cc')
cmd[cmd.index('-o')+1]=str(O/'worker-host.o')
cmd[cmd.index('-MF')+1]=str(O/'worker-host.d')
cmd[1:1]=['-I'+str(H/'source'),'-I'+str(H.parents[4]/'docs/integration/proposed/profile-isolation-next/spawn-custody/source'),'-I'+str(R/'docs/integration/proposed/profile-isolation-next/browser-roots/source'),'-I'+str(R/'docs/integration/proposed/profile-isolation-next/containment/source')]
swift=json.loads((R/'docs/integration/proposed/profile-isolation-next/startup/evidence/final-v5/results.json').read_text())['command']
swift=[str(H/'source/AuxOwnedCommandDispatcher.swift') if v.endswith('/AuxOwnedCommandDispatcher.swift') else str(R/'docs/integration/proposed/profile-isolation-continuation/build/source/AuxFreshBootstrapPolicy.swift') if v.endswith('/AuxFreshBootstrapPolicy.swift') else v for v in swift]
swift[swift.index('-module-cache-path')+1]=str(O/'swift-cache')
commands=[{'name':'worker-host','cwd':str(R),'command':cmd},{'name':'swift-whole-module','cwd':str(R),'command':swift}]
pre=list(cmd)
for flag in ['-o','-MF']:
 i=pre.index(flag);del pre[i:i+2]
pre=[v for v in pre if v not in ['-c','-MMD']]+['-MM']
r=subprocess.run(pre,cwd=str(R),capture_output=True,text=True)
if r.returncode:raise SystemExit(r.stderr)
paths=[str((Path(str(R))/v).resolve()) for v in shlex.split(r.stdout.replace('\\\n',' ').split(':',1)[1])]
paths += [v for v in swift if v.endswith('.swift')]+[str(p) for p in (H/'source').iterdir() if p.is_file()]+[str(H/'check-native.py')]
frozen={p:sha(p) for p in paths}
report={'format':'aux.broker-writes.native-check.v1','passed':False,'commands':commands,'results':[],'frozenFiles':frozen,'linked':False,'executed':False,'ownerDataRead':False,'allBrokerWritersClosed':False}
try:
 for item in commands:
  with (O/(item['name']+'.log')).open('w') as log:r=subprocess.run(item['command'],cwd=item['cwd'],stdout=log,stderr=subprocess.STDOUT)
  report['results'].append({'name':item['name'],'exitCode':r.returncode})
  if r.returncode:raise RuntimeError('Failed '+item['name'])
  for p,d in frozen.items():
   if sha(p)!=d:raise RuntimeError('Frozen input changed '+p)
 report['inputsUnchanged']=True;report['passed']=True
 report['objectSha256']=sha(O/'worker-host.o')
finally:
 (O/'results.json').write_text(json.dumps(report,indent=2)+'\n')
print('PASS actual host object + paired whole-module Swift typecheck')
