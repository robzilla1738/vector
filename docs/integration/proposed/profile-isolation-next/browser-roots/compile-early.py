#!/usr/bin/env python3
"""One genuine metrics TU with cold-only provenance branch enabled, no link/run."""
import argparse,hashlib,json,pathlib,shlex,subprocess
H=pathlib.Path(__file__).resolve().parent;N=pathlib.Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src');B=N/'out/AuxFast'
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
p=argparse.ArgumentParser();p.add_argument('--output',required=True);a=p.parse_args();O=pathlib.Path(a.output).resolve()
if O.exists():raise SystemExit('Fresh output required')
O.mkdir(mode=0o700);overlay=O/'include/chrome/browser/aux';overlay.mkdir(parents=True)
(overlay/'AuxBrowserPrivateRoots.h').write_bytes((H/'source/AuxBrowserPrivateRoots.h').read_bytes())
target=B/'obj/chrome/browser/metrics/impl.ninja';values={}
for line in target.read_text().splitlines():
 if ' = ' in line and not line.startswith(' '):
  k,v=line.split(' = ',1);values[k]=v.replace('$:',':')
flags=[]
for key in ['defines','include_dirs','cflags','cflags_cc','module_deps']:flags+=shlex.split(values[key])
flags+=['-fmodule-name='+values['cc_module_name']+'_Private']
compiler=N/'third_party/llvm-build/Release+Asserts/bin/clang++'
inputs=[compiler,target,H/'compile-early.py',H/'prepare-early.py',H/'early-inputs.json',H/'early-local-state.patch',H/'early-source/chrome_feature_list_creator.cc',H/'source/AuxBrowserPrivateRoots.h',overlay/'AuxBrowserPrivateRoots.h',N/'chrome/browser/metrics/BUILD.gn',N/'chrome/browser/metrics/chrome_feature_list_creator.cc',N/'chrome/browser/chrome_browser_main.cc']
for f in flags:
 if f.startswith('-fmodule-file='):inputs.append((B/f.split('=',2)[-1]).resolve())
frozen={str(p.resolve()):sha(p) for p in inputs}
command=[str(compiler),'-I',str(O/'include'),'-DAUX_SEALED_NATIVE_COLD_ENTRY=1']+flags+['-c',str(H/'early-source/chrome_feature_list_creator.cc'),'-o',str(O/'feature-list.o')]
run=subprocess.run(command,cwd=B,capture_output=True,text=True);(O/'compile.log').write_text(run.stdout+run.stderr)
unchanged=all(sha(p)==v for p,v in frozen.items())
report={'format':'aux.browser-roots.early-provenance.compile.v1','passed':run.returncode==0 and unchanged,'command':command,'exitCode':run.returncode,'sourceAndConfigHashes':frozen,'inputsUnchanged':unchanged,'coldDefineOnlyInIsolatedObject':True,'nativeOwnerAdmissionProven':False,'linked':False,'executed':False,'signed':False,'sharedTreeApplied':False,'nativePathUnsafeDiagnosticAcceptance':False}
if (O/'feature-list.o').exists():report['objectSha256']=sha(O/'feature-list.o')
(O/'receipt.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'passed':report['passed'],'exitCode':run.returncode,'receipt':str(O/'receipt.json')}))
if not report['passed']:raise SystemExit(1)
