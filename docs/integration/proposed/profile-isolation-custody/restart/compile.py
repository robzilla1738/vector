import pathlib,json,hashlib,shutil,subprocess,argparse
H=pathlib.Path(__file__).resolve().parent
sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
p=argparse.ArgumentParser();p.add_argument('--output',required=True);a=p.parse_args();O=pathlib.Path(a.output).resolve()
if O.exists():raise SystemExit('fresh output required')
A=pathlib.Path('/private/tmp/aux-browser-authorized-compile-20261023');F=pathlib.Path('/private/tmp/aux-browser-final-transport-20261023')
O.mkdir(mode=0o700);shutil.copytree(F/'source',O/'source')
for name in ['AuxSelectedStateHome.cc','AuxOwnedNativePeerChild.cc']:
 dst=O/'source'/(name if name.startswith('chrome/') else 'chrome/browser/aux/'+name);shutil.copyfile(H/'source'/name,dst)
shutil.copyfile(H.parents[1]/'profile-isolation-recovery/browser/source/AuxSelectedStateHome.h',O/'source/chrome/browser/aux/AuxSelectedStateHome.h')
frozen={str(p):sha(p) for p in [H/'compile.py',*(p for p in (O/'source').rglob('*') if p.is_file())]}
r=json.loads((A/'receipt.json').read_text());commands=[]
for item in r['commands']:
 if item['name'] in ['chromium-AuxSelectedStateHome','chromium-AuxOwnedNativePeerChild']:
  commands.append({**item,'command':[x.replace(str(A),str(O)) for x in item['command']],'cwd':item['cwd'].replace(str(A),str(O))})
results=[]
for item in commands:
 run=subprocess.run(item['command'],cwd=item['cwd'],capture_output=True,text=True);(O/(item['name']+'.log')).write_text(run.stdout+run.stderr);results.append({'name':item['name'],'exitCode':run.returncode})
 if run.returncode:break
ok=len(results)==len(commands) and all(x['exitCode']==0 for x in results);unchanged=all(sha(p)==v for p,v in frozen.items())
r={'passed':ok and unchanged,'inputsUnchanged':unchanged,'inputs':frozen,'commands':commands,'results':results,'objects':{p.name:sha(p) for p in O.glob('*.o')},'fullWriterDrainProven':False,'appExecuted':False,'signed':False,'sharedTreeChanged':False}
(O/'receipt.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps({'passed':r['passed'],'results':results}))
if not r['passed']:raise SystemExit(1)
