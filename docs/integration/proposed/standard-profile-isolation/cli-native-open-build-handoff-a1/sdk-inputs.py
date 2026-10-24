#!/usr/bin/env python3
"""Emit frozen ordinary compiler argv only; never executes a compiler/linker."""
from pathlib import Path
import hashlib,json
HERE=Path(__file__).resolve().parent;BASE=HERE.parent;WEB=HERE.parents[4]
compiler=Path('/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang++')
sdk=Path('/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk')
output=Path('/private/tmp/aux-native-cli-open-sdk-compile-20261024-a1')
common=BASE/'cli-native-embedding-a1/source/common';opened=BASE/'cli-native-open-command-a1/source'
endpoint=WEB/'docs/integration/proposed/aux-native-daemon-main/source'
identity=WEB/'vendor/provided/native'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
include_dirs=[opened,common,endpoint,identity]
flags=['-target','arm64-apple-macos13.5','-isysroot',str(sdk),'-std=c++20','-stdlib=libc++','-fPIC','-fvisibility=hidden','-Wall','-Wextra','-Werror=return-type']
for directory in include_dirs:flags+=['-I',str(directory)]
sources=[('Wire',common/'AuxCliWire.cc','c++'),('SealedImages',common/'AuxCliSealedImages.cc','c++'),('Ingress',HERE/'source/AuxCliIngress.cc','c++'),('OpenArguments',opened/'AuxCliOpenArguments.cc','c++'),('Frontend',HERE/'source/AuxNativeCliFrontend.mm','objective-c++'),('EndpointDelivery',endpoint/'AuxNativeEndpointDelivery.cc','c++')]
commands=[];inputs={}
for name,source,language in sources:
 actual=[str(compiler),*flags,'-x',language]
 if language=='objective-c++':actual+=['-fobjc-arc','-fno-objc-arc-exceptions','-fblocks']
 obj=output/(name+'.o');actual+=['-c',str(source),'-o',str(obj)]
 commands.append({'name':name,'language':language,'source':str(source),'sourceSha256':sha(source),'output':str(obj),'argv':actual})
 inputs[str(source)]=sha(source)
for source in [common/'AuxCliWire.h',common/'AuxCliSealedImages.h',opened/'AuxCliIngress.h',opened/'AuxCliOpenArguments.h',endpoint/'AuxNativeEndpointDelivery.h',identity/'packaged-identity-admission.h',sdk/'SDKSettings.json']:
 inputs[str(source)]=sha(source)
link=[str(compiler),'-target','arm64-apple-macos13.5','-isysroot',str(sdk),'-stdlib=libc++',*[c['output']for c in commands],'-framework','CoreFoundation','-framework','Security','-framework','Foundation','-lbsm','-lobjc','-Wl,-no_adhoc_codesign','-o',str(output/'aux-cli')]
plan={'format':'aux.cli-native-open.sdk-compile-plan.v1','compiler':str(compiler),'compilerSha256':sha(compiler),'sdk':str(sdk),'target':'arm64-apple-macos13.5','outputDirectory':str(output),'requiresOutputDirectoryCreationByIntegrator':True,'commands':commands,'optionalUnsignedNativeOnlyLinkArgv':link,'inputs':[{'path':k,'sha256':v}for k,v in sorted(inputs.items())],'requiresSharedNativeBuildLock':True,'nodeInputs':False,'swiftInputs':False,'fakeHeadersOrStubs':False,'compilerRun':False,'linkerRun':False,'signed':False,'productExecuted':False,'runtimeAcceptance':False}
(HERE/'sdk-compile-plan.json').write_text(json.dumps(plan,indent=2)+'\n')
print(json.dumps({'compileCommands':len(commands),'inputs':len(inputs),'compilerRun':False,'linkerRun':False}))
