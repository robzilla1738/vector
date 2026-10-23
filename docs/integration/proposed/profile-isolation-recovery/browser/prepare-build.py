#!/usr/bin/env python3
"""Apply reviewed integration only to complete clone; regenerate GN and dry-run Ninja."""
import argparse,pathlib,json,hashlib,subprocess,time
H=pathlib.Path(__file__).resolve().parent;N=pathlib.Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
p=argparse.ArgumentParser();p.add_argument('--snapshot',required=True);a=p.parse_args();O=pathlib.Path(a.snapshot).resolve();S=O/'src';B=S/'out/AuxFast'
r=json.loads((O/'receipt.json').read_text())
if not r['passed']:raise SystemExit('incomplete clone')
D=pathlib.Path('/private/tmp/aux-browser-shutdown-compile-20261023');checked=json.loads((D/'receipt.json').read_text())
if not checked['passed']:raise SystemExit('unchecked shutdown overlay')
changes={};before={}
for path in (D/'source').rglob('*'):
 if not path.is_file():continue
 name=path.relative_to(D/'source');src=N/name;dst=S/name
 original=sha(src) if src.exists() else None
 if (sha(dst) if dst.exists() else None)!=original:raise SystemExit('clone/current source mismatch: '+str(name))
 if checked['inputs'].get(str(path))!=sha(path):raise SystemExit('checked overlay changed: '+str(name))
 before[str(name)]=original
 if original!=sha(path):changes[str(name)]=sha(path)
for name in changes:
 dst=S/name;dst.parent.mkdir(parents=True,exist_ok=True);dst.write_bytes((D/'source'/name).read_bytes())
report={'format':'aux.chromium.isolated-build-preparation.v1','passed':False,'root':str(S),'changes':changes,'sharedBaseline':before,'coldFeatureEnabled':False,'signed':False,'appExecuted':False,'fullBuildPassed':False,'runs':[]}
# Existing defaults intentionally leave protected startup off. GN recomputes
# dependency closure for changed virtual interfaces; no manual object relink.
try:
 for name,command in [('gn',[str(S/'buildtools/mac/gn'),'gen',str(B)]),('dryrun',[str(S/'third_party/ninja/ninja'),'-C',str(B),'-n','chrome'])]:
  start=time.monotonic();run=subprocess.run(command,cwd=S,capture_output=True,text=True);(O/(name+'.log')).write_text(run.stdout+run.stderr)
  report['runs'].append({'name':name,'command':command,'exitCode':run.returncode,'elapsedSeconds':time.monotonic()-start})
  if run.returncode:raise RuntimeError(name+' failed')
 report['passed']=True
except Exception as e:report['error']=str(e)
finally:
 report['sharedInputsUnchanged']=all((sha(N/n) if (N/n).exists() else None)==v for n,v in before.items());report['passed'] &= report['sharedInputsUnchanged'];(O/'build-preparation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'passed':report['passed'],'error':report.get('error'),'receipt':str(O/'build-preparation.json')}))
if not report['passed']:raise SystemExit(1)
