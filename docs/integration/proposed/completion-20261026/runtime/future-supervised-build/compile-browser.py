#!/usr/bin/env python3
"""Compile copied future browser producers with a VFS; never project or link."""
from pathlib import Path
import argparse,hashlib,json,shlex,subprocess,time
HERE=Path(__file__).resolve().parent
ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src');BUILD=ROOT/'out/AuxFast'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
parser=argparse.ArgumentParser();parser.add_argument('--output',required=True);args=parser.parse_args();out=Path(args.output)
assert not out.exists();plan=json.loads((HERE/'browser-source-plan.json').read_text())
pins={str(HERE/'browser-source-plan.json'):sha(HERE/'browser-source-plan.json')}
for row in plan['records']:pins[row['input']]=row['inputSha256'];pins[row['output']]=row['outputSha256']
def verify():
 for p,h in pins.items():assert sha(p)==h,('Changed frozen browser input',p)
verify();out.mkdir(mode=0o700)
overlay=out/'vfs.json';overlay.write_text(json.dumps({'version':0,'case-sensitive':'true','use-external-names':False,'roots':[{'type':'file','name':row['input'],'external-contents':row['output']} for row in plan['records'] if not row['path'].endswith('.gn')]},indent=2)+'\n')
units={
'base/process/mac/aux_browser_descendant_bridge.cc':'base/aux_browser_descendant_engine.ninja',
'chrome/app/chrome_exe_main_mac.cc':'chrome/chrome_app_executable.ninja',
'chrome/browser/chrome_browser_main.cc':'chrome/browser/core.ninja',
'chrome/browser/ui/aux_browser_shutdown_drain.cc':'chrome/browser/ui/ui.ninja',
'chrome/browser/aux/daemon_supervisor.cc':'chrome/browser/aux/platform.ninja',
'chrome/browser/aux/AuxOwnedNativePeerChild.cc':'chrome/browser/aux/platform.ninja',
'chrome/browser/aux/AuxSelectedStateHome.cc':'chrome/browser/aux/platform.ninja'}
commands=[]
for source,target in units.items():
 ninja=BUILD/'obj'/target;pins[str(ninja)]=sha(ninja);variables={}
 for line in ninja.read_text().splitlines():
  if line and not line.startswith(' ') and ' = ' in line:
   key,value=line.split(' = ',1);variables[key]=value.replace('$:',':')
 flags=[]
 for key in ['defines','include_dirs','cflags','cflags_cc','module_deps']:
  flags.extend(shlex.split(variables.get(key,'')))
 assert not any('$' in flag for flag in flags),(target,'Unexpanded compiler flag')
 command=[str(ROOT/'third_party/llvm-build/Release+Asserts/bin/clang++'),*flags,'-DAUX_FIXED_LINKED_PTY_POLICY=1','-fmodule-name='+variables['cc_module_name']+'_Private','-ivfsoverlay',str(overlay),'-MMD','-MF',str(out/(Path(source).stem+'.d')),'-c',str(ROOT/source),'-o',str(out/(Path(source).stem+'.o'))]
 commands.append({'source':source,'argv':command,'cwd':str(BUILD)})
recipe={'format':'aux.future-browser-producer-recipe.v1','commands':commands,'inputHashes':pins,'overlaySha256':sha(overlay),'sharedSourceChanged':False,'linked':False,'activated':False};(out/'recipe.json').write_text(json.dumps(recipe,indent=2)+'\n')
receipt={'format':'aux.future-browser-producer-check.v1','recipeSha256':sha(out/'recipe.json'),'results':[],'passed':False,'sharedSourceChanged':False,'linked':False,'executed':False}
try:
 for i,item in enumerate(commands):
  verify();start=time.monotonic()
  with (out/f'command-{i}.log').open('wb') as log:done=subprocess.run(item['argv'],cwd=BUILD,stdout=log,stderr=subprocess.STDOUT)
  receipt['results'].append({'source':item['source'],'exitCode':done.returncode,'seconds':time.monotonic()-start});print(item['source'],done.returncode,flush=True)
  if done.returncode:raise RuntimeError('Future browser producer compile failed: '+item['source'])
 verify();receipt.update(passed=True,outputs={str(p):sha(p) for p in out.glob('*.o')},pinsCheckedBeforeAndAfter=True)
finally:(out/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({'passed':True,'receipt':str(out/'receipt.json')}))
