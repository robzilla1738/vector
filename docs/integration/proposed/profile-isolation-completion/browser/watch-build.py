#!/usr/bin/env python3
import pathlib,json,time,subprocess,sys
H=pathlib.Path(__file__).resolve().parent;W=H.parents[4]
O=pathlib.Path('/private/tmp/aux-chromium-recovery-snapshot-20261023');status=O/'completion-watch.json'
r={'format':'aux.chromium.completion-watch.v1','phase':'waiting-for-root-preparation','started':time.time(),'passed':False}
status.write_text(json.dumps(r,indent=2)+'\n')
while True:
 p=O/'build-preparation.json'
 if p.exists():
  prep=json.loads(p.read_text())
  if not prep['passed']:
   r.update(phase='root-preparation-refused',error=prep.get('error'));status.write_text(json.dumps(r,indent=2)+'\n');raise SystemExit(1)
  break
 time.sleep(10)
r['phase']='queued-native-lock';status.write_text(json.dumps(r,indent=2)+'\n')
command=[sys.executable,str(W/'scripts/native-build.py'),sys.executable,str(H/'unsigned-build.py'),'--snapshot',str(O),'--build']
r['command']=command;status.write_text(json.dumps(r,indent=2)+'\n')
with (O/'completion-watch.log').open('w') as log:run=subprocess.run(command,cwd=W,stdout=log,stderr=subprocess.STDOUT)
r.update(phase='completed' if run.returncode==0 else 'build-refused',exitCode=run.returncode,elapsedSeconds=time.time()-r['started']);r['passed']=run.returncode==0
status.write_text(json.dumps(r,indent=2)+'\n');raise SystemExit(run.returncode)
