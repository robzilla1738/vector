#!/usr/bin/env python3
"""Compile changed production queue TU in private overlay, never link/launch."""
from pathlib import Path
import json,shlex,subprocess,argparse,hashlib,time
P=Path(__file__).resolve().parent
parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,required=True);a=parser.parse_args()
pins=json.loads((P/'compile-inputs.json').read_text());native=Path(pins['nativeSourceRoot']);build=native/'out/AuxFast';out=a.output.resolve()
assert not out.exists() and native not in out.parents
for f in pins['inputs']:assert hashlib.sha256((native/f['path']).read_bytes()).hexdigest()==f['sha256'],f['path']
variables={}
for line in (native/pins['gn']).read_text().splitlines():
 if ' = ' in line and not line.startswith(' '):
  key,value=line.split(' = ',1);variables[key]=value.replace('$:',':')
out.mkdir(parents=True)
cmd=[str(native/'third_party/llvm-build/Release+Asserts/bin/clang++'),'-I'+str(P/'source')]
for key in ['defines','include_dirs','cflags','cflags_cc','module_deps']:cmd+=shlex.split(variables[key])
cmd+=['-fmodule-name='+variables['cc_module_name']+'_Private','-c',str(P/'source/extensions/browser/service_worker/service_worker_task_queue.cc'),'-o',str(out/'service_worker_task_queue.o')]
t=time.monotonic();r=subprocess.run(cmd,cwd=build,capture_output=True,text=True);(out/'compile.log').write_text(r.stdout+r.stderr);(out/'result.json').write_text(json.dumps({'exitCode':r.returncode,'seconds':time.monotonic()-t,'command':cmd},indent=2)+'\n');print(r.stdout+r.stderr);raise SystemExit(r.returncode)
