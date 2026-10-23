#!/usr/bin/env python3
"""Compile changed actual Chromium/daemon boundaries only; never link or run."""
import argparse,hashlib,json,pathlib,shlex,subprocess
H=pathlib.Path(__file__).resolve().parent
N=pathlib.Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src');B=N/'out/AuxFast'
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
p=argparse.ArgumentParser();p.add_argument('--output',required=True);a=p.parse_args();O=pathlib.Path(a.output).resolve()
if O.exists():raise SystemExit('Fresh output required')
O.mkdir(mode=0o700)
target=B/'obj/chrome/browser/aux/platform.ninja';variables={}
for line in target.read_text().splitlines():
 if ' = ' in line and not line.startswith(' '):
  k,v=line.split(' = ',1);variables[k]=v.replace('$:',':')
flags=[]
for key in ['defines','include_dirs','cflags','cflags_cc','module_deps']:flags+=shlex.split(variables[key])
flags+=['-fmodule-name='+variables['cc_module_name']+'_Private']
assert flags.count('-fno-exceptions')==1 and '-fexceptions' not in flags
compiler=N/'third_party/llvm-build/Release+Asserts/bin/clang++'
old=json.loads((H.parents[1]/'aux-native-worker-close-main-build/inputs.json').read_text())
base=old['compile'][1]['command'][:];base=base[:base.index('-c')]
for flag in ['-MF']:
 i=base.index(flag);del base[i:i+2]
base.remove('-MMD')
sdk='/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk'
base[1:1]=['-isysroot',sdk,'-I',str(H/'source')]
base+=['-I',str(H.parents[1]/'aux-native-prepared-daemon-authority/source')]
frozen=dict(old['frozenFiles'])
for path in [target,compiler,H/'compile.py',H/'native-inputs.json',H/'native.patch',*(H/'source').iterdir(),pathlib.Path(sdk)/'SDKSettings.json']:
 frozen[str(path.resolve())]=sha(path)
for f in flags:
 if f.startswith('-fmodule-file='):
  q=(B/f.split('=',2)[-1]).resolve();frozen[str(q)]=sha(q)
def verify():
 for path,digest in frozen.items():
  if sha(path)!=digest:raise ValueError('Frozen input changed: '+path)
verify();commands=[]
for name in ['AuxBrowserPrivateRoots','AuxChromiumBrowserRootProducer','AuxNativePeerTransport','AuxOwnedNativePeerChild']:
 commands.append({'name':'chromium-'+name,'cwd':str(B),'command':[str(compiler),'-I',str(H/'source'),'-I',str(N/'chrome/browser/aux')]+flags+['-c',str(H/'source'/(name+'.cc')),'-o',str(O/('chromium-'+name+'.o'))]})
for name in ['AuxBrowserPrivateRoots','AuxNativePeerTransport','AuxNativeParentConnectionBridge']:
 commands.append({'name':'daemon-'+name,'cwd':str(H),'command':base+['-c',str(H/'source'/(name+'.cc')),'-o',str(O/('daemon-'+name+'.o'))]})
report={'format':'aux.browser-private-roots.compile.v1','passed':False,'commands':commands,'results':[], 'sourceAndConfigHashes':frozen,'linked':False,'executed':False,'signed':False,'sharedTreeChanged':False,'nativePathUnsafeDiagnosticAcceptance':False,'fullWriterIsolationProven':False,'rootLifecycleExecuted':False}
try:
 for item in commands:
  run=subprocess.run(item['command'],cwd=item['cwd'],capture_output=True,text=True)
  (O/(item['name']+'.log')).write_text(run.stdout+run.stderr)
  report['results'].append({'name':item['name'],'exitCode':run.returncode})
  if run.returncode:raise RuntimeError('Changed unit refused: '+item['name'])
 verify();report['passed']=True
except Exception as e:report['error']=str(e)
finally:
 try:verify();report['inputsUnchanged']=True
 except Exception as e:report['inputsUnchanged']=False;report['passed']=False;report['pinError']=str(e)
 report['objectHashes']={item['name']:sha(O/(item['name']+'.o')) for item in commands if (O/(item['name']+'.o')).exists()}
 (O/'receipt.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'passed':report['passed'],'results':report['results'],'receipt':str(O/'receipt.json')}))
if not report['passed']:raise SystemExit(1)
