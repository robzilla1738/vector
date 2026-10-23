from pathlib import Path
import argparse,json,hashlib,shutil,subprocess
h=Path(__file__).resolve().parent
p=argparse.ArgumentParser();p.add_argument('--output',required=True);a=p.parse_args();o=Path(a.output).resolve();o.mkdir(exist_ok=False)
A=Path('/private/tmp/aux-root-custody-compile');B=Path('/private/tmp/aux-children-messaging-compile-v2')
shutil.copytree(A/'source',o/'source')
for folder in [h.parent/'children/source',h.parent/'messaging/source',h/'source']:shutil.copytree(folder,o/'source',dirs_exist_ok=True)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();frozen={str(p):sha(p) for p in (o/'source').rglob('*') if p.is_file()}
commands=[]
for root,name in [(A,'chromium-AuxSelectedStateHome'),(B,'launch_context_posix')]:
 for item in json.loads((root/'receipt.json').read_text())['commands']:
  if item['name']==name:commands.append({**item,'command':[s.replace(str(root),str(o)) for s in item['command']]})
results=[]
for item in commands:
 r=subprocess.run(item['command'],cwd=item['cwd'],capture_output=True,text=True);(o/(item['name']+'.log')).write_text(r.stdout+r.stderr);results.append({'name':item['name'],'exitCode':r.returncode});print(json.dumps(results[-1]),flush=True)
 if r.returncode:break
r={'passed':len(results)==len(commands) and all(x['exitCode']==0 for x in results),'results':results,'commands':commands,'inputs':frozen,'inputsUnchanged':all(sha(Path(p))==v for p,v in frozen.items()),'appExecuted':False,'signed':False,'allExternalWritersConfined':False}
r['passed'] &= r['inputsUnchanged'];(o/'receipt.json').write_text(json.dumps(r,indent=2)+'\n')
if not r['passed']:raise SystemExit(1)
