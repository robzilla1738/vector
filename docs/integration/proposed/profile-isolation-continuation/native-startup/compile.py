#!/usr/bin/env python3
"""Compile the four changed actual target TUs, never link/load or run them."""
import argparse,hashlib,json,pathlib,shlex,subprocess
H=pathlib.Path(__file__).resolve().parent
N=pathlib.Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src');B=N/'out/AuxFast'
P=H.parents[1]/'profile-isolation-next/browser-roots'
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
p=argparse.ArgumentParser();p.add_argument('--output',required=True);a=p.parse_args();O=pathlib.Path(a.output).resolve()
if O.exists():raise SystemExit('fresh output required')
O.mkdir(mode=0o700);overlay=O/'include/chrome/browser/aux';overlay.mkdir(parents=True)
(overlay/'AuxBrowserPrivateRoots.h').write_bytes((P/'source/AuxBrowserPrivateRoots.h').read_bytes())
compiler=N/'third_party/llvm-build/Release+Asserts/bin/clang++'
specs=[('validator','chrome/browser/aux/platform.ninja','chrome/browser/aux/AuxBrowserNetworkPaths.cc'),('chrome-client','chrome/browser/core.ninja','chrome/browser/chrome_content_browser_client.cc'),('content-client','content/public/browser/browser_sources.ninja','content/public/browser/content_browser_client.cc'),('storage-partition','content/browser/browser.ninja','content/browser/storage_partition_impl.cc')]
frozen={str(p.resolve()):sha(p) for p in [compiler,H/'compile.py',H/'native.patch',H/'patch-inputs.json',P/'source/AuxBrowserPrivateRoots.h',*filter(lambda p:p.is_file(),(H/'source').rglob('*'))]}
commands=[]
for name,target,source in specs:
 target=B/'obj'/target;values={}
 for line in target.read_text().splitlines():
  if ' = ' in line and not line.startswith(' '):
   k,v=line.split(' = ',1);values[k]=v.replace('$:',':')
 flags=[]
 for key in ['defines','include_dirs','cflags','cflags_cc','module_deps']:flags+=shlex.split(values[key])
 flags+=['-fmodule-name='+values['cc_module_name']+'_Private']
 frozen[str(target)]=sha(target)
 for f in flags:
  if f.startswith('-fmodule-file='):
   q=(B/f.split('=',2)[-1]).resolve();frozen[str(q)]=sha(q)
 command=[str(compiler),'-I',str(H/'source'),'-I',str(O/'include'),'-I',str(P/'source'),'-DAUX_SEALED_NATIVE_COLD_ENTRY=1']+flags+['-c',str(H/'source'/source),'-o',str(O/(name+'.o'))]
 commands.append({'name':name,'command':command,'cwd':str(B)})
report={'format':'aux.native-startup.network-path-gate.compile.v1','passed':False,'commands':commands,'results':[],'sourceAndConfigHashes':frozen,'linked':False,'executed':False,'signed':False,'sharedTreeChanged':False,'nativeOwnerAdmissionProven':False,'pathRaceClosureProven':False,'fullWriterIsolationProven':False}
try:
 for item in commands:
  run=subprocess.run(item['command'],cwd=item['cwd'],capture_output=True,text=True)
  (O/(item['name']+'.log')).write_text(run.stdout+run.stderr)
  report['results'].append({'name':item['name'],'exitCode':run.returncode})
  if run.returncode:raise RuntimeError('TU refused: '+item['name'])
 report['passed']=True
except Exception as e:report['error']=str(e)
finally:
 report['inputsUnchanged']=all(sha(p)==v for p,v in frozen.items())
 report['passed']=report['passed'] and report['inputsUnchanged']
 report['objectHashes']={p.name:sha(p) for p in O.glob('*.o')}
 (O/'receipt.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'passed':report['passed'],'results':report['results'],'receipt':str(O/'receipt.json')}))
if not report['passed']:raise SystemExit(1)
