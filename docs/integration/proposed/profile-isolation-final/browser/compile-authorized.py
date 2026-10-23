#!/usr/bin/env python3
"""Compose actual fresh startup lease boundary then compile six native integration units."""
import argparse,hashlib,json,pathlib,shlex,subprocess,shutil
H=pathlib.Path(__file__).resolve().parent;P=H.parents[1]
N=pathlib.Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src');B=N/'out/AuxFast'
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
p=argparse.ArgumentParser();p.add_argument('--composition',required=True);p.add_argument('--startup',required=True);p.add_argument('--output',required=True);a=p.parse_args()
C=pathlib.Path(a.composition).resolve();A=pathlib.Path(a.startup).resolve();O=pathlib.Path(a.output).resolve();S=O/'source';D=S/'chrome/browser/aux'
old=json.loads((C/'receipt.json').read_text())
if not old['passed']:raise SystemExit('unverified composition')
if O.exists():raise SystemExit('fresh output required')
for name,digest in old['output'].items():
 if sha(C/'source'/name)!=digest:raise SystemExit('composition changed')
O.mkdir(mode=0o700);shutil.copytree(C/'source',S)
frozen={str(C/'receipt.json'):sha(C/'receipt.json'),str(H/'compile-authorized.py'):sha(H/'compile-authorized.py')}
# Preserve quoted include resolution: an unchanged native header must also see
# the new neighboring selected-home/peer types, not stale shared headers.
for header in (N/'chrome/browser/aux').glob('*.h'):
 if not (D/header.name).exists():
  frozen[str(header)]=sha(header);shutil.copyfile(header,D/header.name)
changed=['AuxSelectedStateHome.cc','AuxSelectedStateHome.h','AuxNativePeerTransport.cc','AuxNativePeerTransport.h','AuxNativePeerWire.h','AuxOwnedNativePeerChild.cc','AuxOwnedNativePeerChild.h','AuxPreparedDaemonAuthority.h']
for name in changed:
 src=A/'source'/name;frozen[str(src)]=sha(src);shutil.copyfile(src,D/name)
patch=A/'pre-read.patch';frozen[str(patch)]=sha(patch)
run=subprocess.run(['git','apply','--unsafe-paths','--directory='+str(S),str(patch)],capture_output=True,text=True)
if run.returncode:raise SystemExit(run.stderr)
for path in S.rglob('*'):
 if path.is_file():frozen[str(path)]=sha(path)
commands=[]
def chromium(name,target,source):
 target=B/'obj'/target;v={}
 for line in target.read_text().splitlines():
  if ' = ' in line and not line.startswith(' '):
   k,x=line.split(' = ',1);v[k]=x.replace('$:',':')
 flags=[]
 for key in ['defines','include_dirs','cflags','cflags_cc','module_deps']:flags+=shlex.split(v[key])
 flags+=['-fmodule-name='+v['cc_module_name']+'_Private']
 compiler=N/'third_party/llvm-build/Release+Asserts/bin/clang++'
 for path in [target,compiler]:frozen[str(path)]=sha(path)
 for f in flags:
  if f.startswith('-fmodule-file='):
   q=(B/f.split('=',2)[-1]).resolve();frozen[str(q)]=sha(q)
 commands.append({'name':name,'cwd':str(B),'command':[str(compiler),'-I',str(S),'-I',str(D),'-DAUX_SEALED_NATIVE_COLD_ENTRY=1']+flags+['-c',str(S/source),'-o',str(O/(name+'.o'))]})
for name in ['AuxNativePeerTransport','AuxSelectedStateHome','AuxOwnedNativePeerChild']:
 chromium('chromium-'+name,'chrome/browser/aux/platform.ninja','chrome/browser/aux/'+name+'.cc')
chromium('feature-list','chrome/browser/metrics/impl.ninja','chrome/browser/metrics/chrome_feature_list_creator.cc')
# Main already compiled against prior paired headers, but selected/owned types
# now changed; recheck the caller against this precise final header graph.
chromium('browser-main','chrome/browser/core.ninja','chrome/browser/chrome_browser_main.cc')
prior=json.loads((P/'profile-isolation-next/browser-roots/evidence/native-compile.json').read_text())
base=next(x['command'] for x in prior['commands'] if x['name']=='daemon-AuxNativePeerTransport');base=base[:base.index('-c')]
base[1:1]=['-I',str(D)]
frozen[base[0]]=sha(base[0])
commands.append({'name':'daemon-transport','cwd':str(S),'command':base+['-c',str(D/'AuxNativePeerTransport.cc'),'-o',str(O/'daemon-transport.o')]})
report={'format':'aux.browser.fresh-startup-integration.compile.v1','passed':False,'commands':commands,'results':[],'inputHashes':frozen,'linked':False,'executed':False,'signed':False,'sharedTreeApplied':False,'uiChanged':False,'startupRuntimeVerified':False}
try:
 for item in commands:
  run=subprocess.run(item['command'],cwd=item['cwd'],capture_output=True,text=True)
  (O/(item['name']+'.log')).write_text(run.stdout+run.stderr)
  report['results'].append({'name':item['name'],'exitCode':run.returncode})
  if run.returncode:raise RuntimeError('compile failed: '+item['name'])
 report['passed']=True
except Exception as e:report['error']=str(e)
finally:
 report['inputsUnchanged']=all(sha(p)==v for p,v in frozen.items());report['passed'] &= report['inputsUnchanged']
 report['objects']={p.name:sha(p) for p in O.glob('*.o')}
 (O/'receipt.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'passed':report['passed'],'error':report.get('error'),'results':report['results'],'receipt':str(O/'receipt.json')}))
if not report['passed']:raise SystemExit(1)
