#!/usr/bin/env python3
import hashlib,json,subprocess
from pathlib import Path
H=Path(__file__).resolve().parent
R=Path('/Users/rcourson/Documents/Vibe/web')
O=Path('/private/tmp/aux-awaited-writes-native-20261023-r3')
if O.exists():raise SystemExit('Fresh output required')
O.mkdir(mode=0o700)
cmd=json.loads((R/'docs/integration/proposed/profile-isolation-continuation/broker-writes/evidence/results.json').read_text())['commands'][0]['command']
cmd[cmd.index('-c')+1]=str(H/'source/AuxDevelopmentWorkerHost.cc')
cmd[cmd.index('-o')+1]=str(O/'worker-host.o')
cmd[cmd.index('-MF')+1]=str(O/'worker-host.d')
cmd[1:1]=['-I'+str(H.parents[4]/'docs/integration/proposed/profile-isolation-next/spawn-custody/source'),'-I'+str(R/'out/aux-node-static-26.5.0/node-v26.5.0/deps/googletest/include'),'-I'+str(H/'source'),'-I'+str(R/'out/aux-node-static-26.5.0/node-v26.5.0/src'),'-I'+str(R/'docs/integration/proposed/profile-isolation-continuation/broker-writes/source')]
with (O/'compile.log').open('w') as log:r=subprocess.run(cmd,cwd=R,stdout=log,stderr=subprocess.STDOUT)
report={'format':'aux.awaited-writes.native.v1','command':cmd,'exitCode':r.returncode,'executed':False,'allWritersClosed':False,'files':{str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in (H/'source').iterdir() if p.is_file()}}
if r.returncode==0:report['objectSha256']=hashlib.sha256((O/'worker-host.o').read_bytes()).hexdigest()
(O/'results.json').write_text(json.dumps(report,indent=2)+'\n')
raise SystemExit(r.returncode)
