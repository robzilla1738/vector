from pathlib import Path
import argparse,json,hashlib,shutil,subprocess,re,shlex
h=Path(__file__).resolve().parent
p=argparse.ArgumentParser();p.add_argument('--output',required=True);args=p.parse_args();o=Path(args.output).resolve();o.mkdir(exist_ok=False)
src=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src');cwd=src/'out/AuxFast';overlay=o/'source'
shutil.copytree(h.parent/'children/source',overlay);shutil.copytree(h/'source',overlay,dirs_exist_ok=True)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
frozen={str(p):sha(p) for p in overlay.rglob('*') if p.is_file()}
commands=[]
for ninja,names in [('obj/base/base.ninja',['base/process/kill_posix.cc','base/process/kill_mac.cc']),('obj/content/browser/browser.ninja',['content/browser/child_process_launcher_helper.cc','content/browser/child_process_launcher_helper_mac.cc']),('obj/chrome/browser/extensions/api/messaging/messaging.ninja',['chrome/browser/extensions/api/messaging/'+n+'.cc' for n in ['launch_context','launch_context_posix','native_process_launcher','native_message_process_host']])]:
 text=(cwd/ninja).read_text();v=dict(l.split(' = ',1) for l in text.splitlines() if ' = ' in l and not l.startswith(' '))
 def expand(s):
  for i in range(8):
   t=re.sub(r'\$\{([^}]+)\}|\$([A-Za-z_][A-Za-z_0-9]*)',lambda m:v.get(m[1] or m[2],''),s)
   if t==s:return s
   s=t
  return s
 flags=shlex.split(expand(' '.join(v.get(k,'') for k in ['defines','include_dirs','cflags','cflags_cc','module_deps'])))
 for name in names:
  stem=Path(name).stem
  command=[str(src/'third_party/llvm-build/Release+Asserts/bin/clang++'),'-I'+str(overlay),*flags,'-fmodule-name='+expand(v['cc_module_name'])+'_Private','-c',str(overlay/name),'-o',str(o/(stem+'.o'))]
  commands.append({'name':stem,'command':command,'cwd':str(cwd),'ninja':str(cwd/ninja),'ninjaSHA256':sha(cwd/ninja)})
results=[]
for item in commands:
 run=subprocess.run(item['command'],cwd=item['cwd'],capture_output=True,text=True);(o/(item['name']+'.log')).write_text(run.stdout+run.stderr);results.append({'name':item['name'],'exitCode':run.returncode});print(json.dumps(results[-1]),flush=True)
 if run.returncode:break
r={'passed':len(results)==len(commands) and all(x['exitCode']==0 for x in results),'commands':commands,'results':results,'inputs':frozen,'inputsUnchanged':all(sha(Path(p))==v for p,v in frozen.items()),'appExecuted':False,'signed':False}
r['passed'] &= r['inputsUnchanged'];(o/'receipt.json').write_text(json.dumps(r,indent=2)+'\n')
if not r['passed']:raise SystemExit(1)
