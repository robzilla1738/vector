#!/usr/bin/env python3
"""One current native peer object and constexpr wait decoder; compile only."""
import argparse,hashlib,json,pathlib,shlex,subprocess
H=pathlib.Path(__file__).resolve().parent
N=pathlib.Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src');B=N/'out/AuxFast'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
p=argparse.ArgumentParser();p.add_argument('--output',required=True);a=p.parse_args();O=pathlib.Path(a.output).resolve();O.mkdir(mode=0o700)
target=B/'obj/chrome/browser/aux/platform.ninja';variables={}
for line in target.read_text().splitlines():
 if ' = ' in line and not line.startswith(' '):
  key,value=line.split(' = ',1);variables[key]=value.replace('$:',':')
flags=[]
for key in ['defines','include_dirs','cflags','cflags_cc','module_deps']:flags+=shlex.split(variables[key])
flags+=['-fmodule-name='+variables['cc_module_name']+'_Private']
assert flags.count('-fno-exceptions')==1 and '-fexceptions' not in flags
compiler=N/'third_party/llvm-build/Release+Asserts/bin/clang++'
inputs=[target,compiler,N/'chrome/browser/aux/AuxOwnedNativePeerChild.cc',N/'chrome/browser/aux/AuxOwnedNativePeerChild.h',N/'chrome/browser/aux/AuxNativePeerTransport.h',H/'source/AuxOwnedNativePeerChild.cc',H/'source/AuxOwnedNativePeerChild.h',H/'source/AuxOwnedChildWait.h',H/'check-wait.cc',H/'compile.py']
for f in flags:
 if f.startswith('-fmodule-file='):inputs.append((B/f.split('=',2)[-1]).resolve())
assert sha(inputs[2])=='e6793f89c00cd0d9a309e43bd01dca074f195eca5f6003c9270cbcb0e344da67'
frozen={str(p):sha(p) for p in inputs}
commands=[];results=[]
for name,source in [('peer',H/'source/AuxOwnedNativePeerChild.cc'),('wait',H/'check-wait.cc')]:
 command=[str(compiler),'-I',str(H/'source'),'-I',str(N/'chrome/browser/aux')]+flags+['-c',str(source),'-o',str(O/(name+'.o'))];commands.append(command)
 run=subprocess.run(command,cwd=B,capture_output=True,text=True);(O/(name+'.log')).write_text(run.stdout+run.stderr)
 results.append({'name':name,'exitCode':run.returncode})
 if run.returncode:break
unchanged=all(sha(pathlib.Path(p))==digest for p,digest in frozen.items())
result={'format':'aux.final-native-peer.compile.v1','passed':len(results)==2 and all(x['exitCode']==0 for x in results) and unchanged,'commands':commands,'results':results,'sourceAndConfigHashes':frozen,'inputsUnchanged':unchanged,'nativeCompilerExceptionMode':'-fno-exceptions','objectHashes':{name:sha(O/(name+'.o')) for name in ['peer','wait'] if (O/(name+'.o')).exists()},'linked':False,'executed':False,'signed':False,'sharedTreeChanged':False,'nativePathUnsafeDiagnosticAcceptance':False}
(O/'receipt.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'passed':result['passed'],'results':results,'receipt':str(O/'receipt.json')}))
if not result['passed']:raise SystemExit(1)
