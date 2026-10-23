#!/usr/bin/env python3
"""Compile/link only. Never loads output or invokes an ES API/client factory."""
import hashlib,json,pathlib,subprocess,sys
P=pathlib.Path(__file__).resolve().parent;R=P.parents[3]
S=R/'docs/integration/proposed/aux-native-es-descendant-observer'
O=pathlib.Path('/Users/rcourson/Documents/Vibe/web/out/aux-native-es-observer-compile-only')
assert not O.exists();O.mkdir()
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
SDK=pathlib.Path('/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk')
CC=pathlib.Path('/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang++')
M=json.loads((S/'inputs.json').read_text())
for f,h in M['files'].items():assert sha(S/f)==h,f
for d in M['sdk']:assert sha(pathlib.Path(d['path']))==d['sha256'],d['path']
inputs=[S/'source/AuxEsDescendantObserver.cc',S/'source/AuxEsDescendantObserver.h',CC,pathlib.Path(__file__),SDK/'SDKSettings.json',SDK/'usr/lib/libEndpointSecurity.tbd',SDK/'usr/lib/libbsm.tbd']+[pathlib.Path(x['path']) for x in M['sdk']]
command=[str(CC),'-std=c++20','-fblocks','-fexceptions','-frtti','-Wall','-Wextra','-Werror','-target','arm64-apple-macos13.0','-isysroot',str(SDK),'-dynamiclib',str(S/'source/AuxEsDescendantObserver.cc'),'-lEndpointSecurity','-lbsm','-Wl,-no_adhoc_codesign','-o',str(O/'observer.dylib')]
receipt={'status':'started','scope':'syntax/link only; no dlopen, factory or native calls','command':command,'inputHashes':{str(p):sha(p) for p in inputs},'clientFactoryInvoked':False,'entitlementsModified':False,'signing':False,'nativeCheckoutMutation':False}
def save():(O/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
save();r=subprocess.run(command,capture_output=True,text=True);(O/'compile-link.log').write_text(r.stdout+r.stderr);receipt['compileLinkExitCode']=r.returncode
if r.returncode:receipt['status']='compile-link-failed';save();sys.exit(r.returncode)
artifact=O/'observer.dylib';receipt['artifactSha256']=sha(artifact);receipt['artifactBytes']=artifact.stat().st_size
for name,cmd in [('undefined-imports',['/usr/bin/nm','-u',str(artifact)]),('macho-headers',['/usr/bin/otool','-hv',str(artifact)]),('load-commands',['/usr/bin/otool','-l',str(artifact)])]:
 result=subprocess.run(cmd,capture_output=True,text=True);(O/(name+'.txt')).write_text(result.stdout+result.stderr);assert result.returncode==0,name
receipt['inputsUnchangedAfterLink']=all(sha(pathlib.Path(f))==h for f,h in receipt['inputHashes'].items());assert receipt['inputsUnchangedAfterLink']
receipt['status']='passed-compile-link-only';save();print(json.dumps({k:receipt[k] for k in ['status','compileLinkExitCode','artifactSha256','artifactBytes','clientFactoryInvoked']}))
