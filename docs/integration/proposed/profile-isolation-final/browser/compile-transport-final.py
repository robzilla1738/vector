#!/usr/bin/env python3
"""Recompile only transport after its actual authority-registration ordering fix."""
import argparse,hashlib,json,pathlib,shutil,subprocess
H=pathlib.Path(__file__).resolve().parent
sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
p=argparse.ArgumentParser();p.add_argument('--authorized',required=True);p.add_argument('--startup',required=True);p.add_argument('--output',required=True);a=p.parse_args()
A=pathlib.Path(a.authorized).resolve();T=pathlib.Path(a.startup).resolve();O=pathlib.Path(a.output).resolve()
r=json.loads((A/'receipt.json').read_text())
if not r['passed']:raise SystemExit('unchecked previous graph')
if O.exists():raise SystemExit('fresh output required')
for name,digest in r['inputHashes'].items():
 if pathlib.Path(name).is_relative_to(A/'source') and sha(name)!=digest:raise SystemExit('old overlay changed')
for name,digest in r['inputHashes'].items():
 if pathlib.Path(name).is_relative_to(T) and pathlib.Path(name).name!='AuxNativePeerTransport.cc' and sha(name)!=digest:raise SystemExit('unreviewed additional startup change')
O.mkdir(mode=0o700);shutil.copytree(A/'source',O/'source')
changed=T/'source/AuxNativePeerTransport.cc';dst=O/'source/chrome/browser/aux/AuxNativePeerTransport.cc';before=sha(dst);shutil.copyfile(changed,dst)
frozen={str(p):sha(p) for p in [A/'receipt.json',H/'compile-transport-final.py',changed,*(p for p in (O/'source').rglob('*') if p.is_file())]}
commands=[]
for item in r['commands']:
 if item['name'] not in ['chromium-AuxNativePeerTransport','daemon-transport']:continue
 command=[x.replace(str(A),str(O)) for x in item['command']];commands.append({**item,'command':command,'cwd':item['cwd'].replace(str(A),str(O))})
report={'format':'aux.browser.authority-ordering.transport-compile.v1','passed':False,'inputHashes':frozen,'priorTransportSha256':before,'finalTransportSha256':sha(dst),'commands':commands,'results':[],'linked':False,'executed':False,'signed':False,'onlyTransportChanged':True}
try:
 for item in commands:
  run=subprocess.run(item['command'],cwd=item['cwd'],capture_output=True,text=True);(O/(item['name']+'.log')).write_text(run.stdout+run.stderr)
  report['results'].append({'name':item['name'],'exitCode':run.returncode})
  if run.returncode:raise RuntimeError('compile failed: '+item['name'])
 report['passed']=True
except Exception as e:report['error']=str(e)
finally:
 report['inputsUnchanged']=all(sha(p)==v for p,v in frozen.items());report['passed'] &= report['inputsUnchanged'];report['objects']={p.name:sha(p) for p in O.glob('*.o')};(O/'receipt.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'passed':report['passed'],'results':report['results'],'receipt':str(O/'receipt.json')}))
if not report['passed']:raise SystemExit(1)
