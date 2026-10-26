#!/usr/bin/env python3
"""Compile only the accepted startup repair's two future producers privately."""
from pathlib import Path
import argparse,hashlib,json,shlex,subprocess,time
HERE=Path(__file__).resolve().parent;ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src');BUILD=ROOT/'out/AuxFast'
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
parser=argparse.ArgumentParser();parser.add_argument('--output',required=True);args=parser.parse_args();out=Path(args.output);assert not out.exists()
plan_path=HERE/'startup-observation-plan.json';plan=json.loads(plan_path.read_text());pins={str(plan_path):sha(plan_path),str(Path(__file__).resolve()):sha(__file__)}
roots=[]
for item in plan['files']:
 assert sha(item['output'])==item['outputSha256'];pins[item['output']]=item['outputSha256']
 # The current accepted local projection must be exactly the correction source.
 original=ROOT/item['path'];assert sha(original)==item['correctionSourceSha256'],('Local source selection differs',str(original));pins[str(original)]=sha(original)
 roots.append({'type':'file','name':str(original),'external-contents':item['output']})
ninja=BUILD/'obj/chrome/browser/aux/platform.ninja';pins[str(ninja)]=sha(ninja);values={}
for line in ninja.read_text().splitlines():
 if line and not line.startswith(' ') and ' = ' in line:
  key,value=line.split(' = ',1);values[key]=value.replace('$:',':')
flags=[]
for key in ['defines','include_dirs','cflags','cflags_cc','module_deps']:flags+=shlex.split(values.get(key,''))
assert not any('$' in f for f in flags)
def verify():
 for p,h in pins.items():assert sha(p)==h,('Frozen source changed',p)
verify();out.mkdir(mode=0o700);overlay=out/'vfs.json';overlay.write_text(json.dumps({'version':0,'case-sensitive':'true','use-external-names':False,'roots':roots},indent=2)+'\n')
commands=[]
for item in plan['files']:
 if not item['path'].endswith('.cc'):continue
 stem=Path(item['path']).stem
 commands.append({'source':item['path'],'argv':[str(ROOT/'third_party/llvm-build/Release+Asserts/bin/clang++'),*flags,'-DAUX_FIXED_LINKED_PTY_POLICY=1','-fmodule-name='+values['cc_module_name']+'_Private','-ivfsoverlay',str(overlay),'-MMD','-MF',str(out/(stem+'.d')),'-c',str(ROOT/item['path']),'-o',str(out/(stem+'.o'))]})
assert len(commands)==2
recipe={'format':'aux.future-startup-refresh-producers.v1','cwd':str(BUILD),'commands':commands,'inputHashes':pins,'sourcePlanSha256':sha(plan_path),'overlaySha256':sha(overlay)};(out/'recipe.json').write_text(json.dumps(recipe,indent=2)+'\n')
receipt={'format':'aux.future-startup-refresh-check.v1','recipeSha256':sha(out/'recipe.json'),'sourcePlanSha256':sha(plan_path),'passed':False,'results':[],'sharedSourceChanged':False,'linked':False,'executed':False}
try:
 for i,item in enumerate(commands):
  verify();start=time.monotonic()
  with (out/f'command-{i}.log').open('wb') as log:done=subprocess.run(item['argv'],cwd=BUILD,stdout=log,stderr=subprocess.STDOUT)
  receipt['results'].append({'source':item['source'],'exitCode':done.returncode,'seconds':time.monotonic()-start});assert done.returncode==0,(item['source'],i)
 verify();receipt.update(passed=True,outputs={str(p):sha(p) for p in out.glob('*.o')},inputPinsCheckedBeforeAndAfter=True)
finally:(out/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({'passed':True,'receipt':str(out/'receipt.json')}))
