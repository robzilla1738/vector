#!/usr/bin/env python3
"""Compile only the three future signature-observation producers privately."""
from pathlib import Path
import argparse,hashlib,json,shlex,subprocess,time
HERE=Path(__file__).resolve().parent;ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src');BUILD=ROOT/'out/AuxFast'
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
parser=argparse.ArgumentParser();parser.add_argument('--output',required=True);args=parser.parse_args();out=Path(args.output);assert not out.exists()
plan_path=HERE/'signature-observation-plan.json';plan=json.loads(plan_path.read_text());pins={str(plan_path):sha(plan_path),str(Path(__file__).resolve()):sha(__file__)}
roots=[]
for item in plan['files']:
 output=item['output'];assert sha(output['path'])==output['sha256'];pins[output['path']]=output['sha256']
 original=ROOT/item['path'];assert sha(original)==item['currentSource']['sha256'],('Current source differs',str(original));pins[str(original)]=sha(original)
 roots.append({'type':'file','name':str(original),'external-contents':output['path']})
for name in ['AuxNativePeerTransport.h','AuxSelectedStateHome.h','AuxOwnedNativePeerChild.h','installation_auth.h']:
 original=ROOT/'chrome/browser/aux'/name;expected=HERE.parent/'extension-sign-observation/source'/name
 assert sha(original)==sha(expected),('Current signature header differs',name);pins[str(original)]=sha(original);pins[str(expected)]=sha(expected)
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
assert len(commands)==3
recipe={'format':'aux.future-signature-refresh-producers.v1','cwd':str(BUILD),'commands':commands,'inputHashes':pins,'sourcePlanSha256':sha(plan_path),'overlaySha256':sha(overlay)};(out/'recipe.json').write_text(json.dumps(recipe,indent=2)+'\n')
receipt={'format':'aux.future-signature-refresh-check.v1','recipeSha256':sha(out/'recipe.json'),'sourcePlanSha256':sha(plan_path),'passed':False,'results':[],'sharedSourceChanged':False,'linked':False,'executed':False}
try:
 for i,item in enumerate(commands):
  verify();start=time.monotonic()
  with (out/f'command-{i}.log').open('wb') as log:done=subprocess.run(item['argv'],cwd=BUILD,stdout=log,stderr=subprocess.STDOUT)
  receipt['results'].append({'source':item['source'],'exitCode':done.returncode,'seconds':time.monotonic()-start});assert done.returncode==0,(item['source'],i)
 verify();receipt.update(passed=True,outputs={str(p):sha(p) for p in out.glob('*.o')},inputPinsCheckedBeforeAndAfter=True)
finally:(out/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({'passed':True,'receipt':str(out/'receipt.json')}))
