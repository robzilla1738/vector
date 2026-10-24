#!/usr/bin/env python3
"""Prepare exact successor compile commands from the real predecessor receipts."""
from pathlib import Path
import hashlib,json
here=Path(__file__).resolve().parent;repo=here.parents[4]
source=Path('/private/tmp/aux-standard-native-source-20261023-a4')
browser=Path('/private/tmp/aux-standard-browser-source-20261023-a2')
objects=Path('/private/tmp/aux-standard-daemon-objects-20261023-a2')
link=Path('/private/tmp/aux-standard-daemon-link-20261023-a2')
def read(path):return json.loads(Path(path).read_text())
def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
assert not objects.exists() and not link.exists()
old=read('/private/tmp/aux-runtime-cache-async-object-20261023-a3/daemon-inputs.json')
main=read('/private/tmp/aux-native-worker-close-main-20261023/results.json')
commands=[];replacements={}
def add(name,cmd,src,oldobject,visibility=False):
 c=list(cmd);originalsource=c[c.index('-c')+1] if '-c' in c else None
 if originalsource is None:
  originalsource=next(x for x in c if x.endswith('.cc'))
 for i,x in enumerate(c):
  if x==originalsource:c[i]=str(src)
  elif x==oldobject:c[i]=str(objects/(name+'.o'))
  elif i and c[i-1]=='-MF':c[i]=str(objects/(name+'.d'))
 c=[x for x in c if x!='-fsyntax-only']
 if '-c' not in c:c.extend(['-c','-o',str(objects/(name+'.o'))])
 if '-MMD' not in c:c.extend(['-MMD','-MF',str(objects/(name+'.d'))])
 c[1:1]=['-fblocks','-I'+str(source),'-I'+str(browser/'chrome/browser/aux'),'-I'+str(repo/'docs/integration/proposed/profile-isolation-local-finish/runtime-cache-async-relink-a3/source')]
 if '-isysroot' not in c:c[1:1]=['-isysroot','/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk']
 if visibility:c.insert(1,'-fvisibility=hidden')
 commands.append({'name':name,'command':c,'source':str(src)})
 if oldobject:replacements[oldobject]=str(objects/(name+'.o'))
for num,name in [('0.o','main'),('4.o','node-runner')]:
 row=next(x for x in main['commands'] if x['object']==num)
 add(name,row['command'],source/('AuxNativeDaemonMain.cc' if name=='main' else 'AuxNativeNodeRunner.cc'),'/private/tmp/aux-native-worker-close-main-20261023/'+num)
c=read(here/'host-syntax-a1-command.json');c=[x.replace('/private/tmp/aux-standard-native-source-20261023-a1',str(source)) for x in c]
add('worker-host',c,source/'AuxDevelopmentWorkerHost.cc','/private/tmp/aux-runtime-cache-async-object-20261023-a3/worker-host.o')
observer=read(repo/'docs/integration/proposed/standard-profile-isolation/descendant-custody/compile-command.json')
c=observer['argv'];add('observer',c,source/'AuxTaskDescendantObserver.cc',c[c.index('-o')+1],True)
# The observer is an added object, not a replacement of an old linked operand.
replacements.pop(observer['argv'][observer['argv'].index('-o')+1])
r=read('/private/tmp/aux-browser-authorized-bridge-20261023/receipt.json')
add('parent-bridge',r['command'],browser/'daemon/AuxNativeParentConnectionBridge.cc','/private/tmp/aux-browser-authorized-bridge-20261023/daemon-parent-bridge.o')
r=read('/private/tmp/aux-browser-final-transport-20261023/receipt.json')
row=next(x for x in r['commands'] if x['name']=='daemon-transport')
add('peer-transport',row['command'],browser/'chrome/browser/aux/AuxNativePeerTransport.cc','/private/tmp/aux-browser-final-transport-20261023/daemon-transport.o')
# Retain all existing module/import/private-definition validators and linker flags.
linkcmd=[]
for x in old['commands'][0]:
 if x in replacements:x=replacements[x]
 elif x.endswith('.swift') and (source/Path(x).name).exists():x=str(source/Path(x).name)
 elif x=='/private/tmp/aux-runtime-cache-async-link-20261023-a3/Aux Daemon':x=str(link/'Aux Daemon')
 elif x=='/private/tmp/aux-runtime-cache-async-link-20261023-a3/swift-cache':x=str(link/'swift-cache')
 linkcmd.append(x)
linkcmd.extend([str(objects/'observer.o'),'-lEndpointSecurity'])
manifest=dict(old);manifest['commands']=[linkcmd];manifest['output']=str(link)
manifest['privateDefinitions']=list(old['privateDefinitions'])+['_AuxDevelopmentOwnerCleanSettlementStatus','_AuxObserveDevelopmentMainLoopReturned','_AuxCompleteDevelopmentOwnerBrowserCleanShutdown']
plan={'format':'aux.standard-daemon.compile-plan.v1','output':str(objects),'linkManifestTemplate':manifest,'commands':commands,'replacements':replacements,'sourceComposition':{'path':str(source/'composition.json'),'sha256':sha(source/'composition.json')},'frozenNewSources':{str(p):sha(p) for root in [source,browser] for p in root.rglob('*') if p.is_file()},'moduleUnchanged':True,'productExecuted':False,'productSigned':False,'runtimeAuthorityGranted':False}
(here/'native-build-a2.json').write_text(json.dumps(plan,indent=2)+'\n');print(json.dumps({'compileUnits':len(commands),'sourceCompositionSha256':plan['sourceComposition']['sha256'],'preparedOnly':True}))
