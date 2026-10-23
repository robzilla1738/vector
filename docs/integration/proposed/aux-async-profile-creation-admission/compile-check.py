#!/usr/bin/env python3
"""Compile actual successor TUs with existing GN flags and a read-only VFS header overlay."""
import argparse,hashlib,json,shlex,subprocess,time
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
NATIVE=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
BUILD=NATIVE/'out/AuxFast'
subprocess.run(['python3',str(HERE/'verify.py')],check=True)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
p=argparse.ArgumentParser();p.add_argument('--output',type=Path,required=True);a=p.parse_args();out=a.output.resolve();assert not out.exists() and NATIVE not in out.parents;out.mkdir(parents=True)
header=HERE/'source/aux_async_profile_creation_admission.h'
overlay={'version':0,'roots':[{'type':'file','name':str(NATIVE/'chrome/browser/profiles'/header.name),'external-contents':str(header)}]}
(out/'overlay.json').write_text(json.dumps(overlay))
results=[]
for source,gn in [('profile_manager.cc','profile_manager_impl.ninja'),('profile_impl.cc','misc.ninja'),('aux_async_profile_creation_admission.cc','profile_manager_impl.ninja')]:
 path=BUILD/'obj/chrome/browser/profiles'/gn;v={}
 for line in path.read_text().splitlines():
  if ' = ' in line and not line.startswith(' '):
   k,value=line.split(' = ',1);v[k]=value.replace('$:',':')
 command=[str(NATIVE/'third_party/llvm-build/Release+Asserts/bin/clang++')]
 for k in ['defines','include_dirs','cflags','cflags_cc','module_deps']:command+=shlex.split(v[k])
 command+=['-ivfsoverlay',str(out/'overlay.json'),'-fmodule-name='+v['cc_module_name']+'_Private','-c',str(HERE/'source'/source),'-o',str(out/(source+'.o'))]
 started=time.monotonic();r=subprocess.run(command,cwd=BUILD,capture_output=True,text=True);(out/(source+'.log')).write_text(r.stdout+r.stderr)
 results.append({'source':source,'sourceSha256':sha(HERE/'source'/source),'gn':str(path.relative_to(NATIVE)),'gnSha256':sha(path),'exitCode':r.returncode,'seconds':time.monotonic()-started,'command':command})
 (out/'results.json').write_text(json.dumps(results,indent=2)+'\n')
 if r.returncode:print((r.stdout+r.stderr)[-6000:]);raise SystemExit(r.returncode)
print('PASS: three real changed Chromium TUs compiled with actual GN flags; no link/app/native checkout mutation')
