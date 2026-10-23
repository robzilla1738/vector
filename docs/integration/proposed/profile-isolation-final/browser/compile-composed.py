#!/usr/bin/env python3
"""Compile the previously unchecked integrated browser-main TU with cold paths enabled."""
import argparse,hashlib,json,pathlib,shlex,subprocess
H=pathlib.Path(__file__).resolve().parent
N=pathlib.Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src');B=N/'out/AuxFast'
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
p=argparse.ArgumentParser();p.add_argument('--composition',required=True);p.add_argument('--output',required=True);a=p.parse_args()
C=pathlib.Path(a.composition).resolve();S=C/'source';O=pathlib.Path(a.output).resolve()
receipt=json.loads((C/'receipt.json').read_text())
if not receipt['passed']:raise SystemExit('unverified composition')
if O.exists():raise SystemExit('fresh output required')
O.mkdir(mode=0o700)
for name,digest in receipt['output'].items():
 if sha(S/name)!=digest:raise SystemExit('composition changed: '+name)
target=B/'obj/chrome/browser/core.ninja';values={}
for line in target.read_text().splitlines():
 if ' = ' in line and not line.startswith(' '):
  k,v=line.split(' = ',1);values[k]=v.replace('$:',':')
flags=[]
for key in ['defines','include_dirs','cflags','cflags_cc','module_deps']:flags+=shlex.split(values[key])
flags+=['-fmodule-name='+values['cc_module_name']+'_Private']
compiler=N/'third_party/llvm-build/Release+Asserts/bin/clang++'
frozen={str(p):sha(p) for p in [target,compiler,C/'receipt.json',H/'compile-composed.py',*(p for p in S.rglob('*') if p.is_file())]}
for f in flags:
 if f.startswith('-fmodule-file='):
  q=(B/f.split('=',2)[-1]).resolve();frozen[str(q)]=sha(q)
command=[str(compiler),'-I',str(S),'-I',str(S/'chrome/browser/aux'),'-I',str(N/'chrome/browser/aux'),'-DAUX_SEALED_NATIVE_COLD_ENTRY=1']+flags+['-c',str(S/'chrome/browser/chrome_browser_main.cc'),'-o',str(O/'browser-main.o')]
run=subprocess.run(command,cwd=B,capture_output=True,text=True);(O/'compile.log').write_text(run.stdout+run.stderr)
unchanged=all(sha(p)==v for p,v in frozen.items())
report={'format':'aux.browser.composed-main.compile.v1','passed':run.returncode==0 and unchanged,'command':command,'exitCode':run.returncode,'inputHashes':frozen,'inputsUnchanged':unchanged,'coldDefineOnlyInIsolatedObject':True,'nativeOwnerAdmissionProven':False,'linked':False,'executed':False,'signed':False,'sharedTreeApplied':False,'uiChanged':False}
if (O/'browser-main.o').exists():report['objectSha256']=sha(O/'browser-main.o')
(O/'receipt.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'passed':report['passed'],'exitCode':run.returncode,'receipt':str(O/'receipt.json')}))
if not report['passed']:raise SystemExit(1)
