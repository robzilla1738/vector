#!/usr/bin/env python3
"""Prepare exact unsigned daemon commands; execution remains with integrator."""
from pathlib import Path
import hashlib
import json
import subprocess
import sys
HERE=Path(__file__).resolve().parent
REPO=HERE.parents[5]
BASE=REPO/'docs/integration/proposed/browser-feature-expansion/local-completion-package-a38/disposable-location-review-a4/daemon-build'
OUT=Path('/private/tmp/aux-native-host-daemon-build-20261026-a1')
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
base=json.loads((BASE/'awaited-storage-authority-a13/build-plan.json').read_text())
main_plan=json.loads((BASE/'peer-loss-layout-a7/build-plan.json').read_text())
peer_receipt=REPO/'docs/integration/proposed/browser-feature-expansion/fresh-startup-milestone-a42/actual-daemon-peer-identity-reuse-build-a12b.json'
peer=json.loads(peer_receipt.read_text())
main=next(c for c in main_plan['commands'] if any(x.endswith('AuxNativeDaemonMain.cc') for x in c))
peer_command=next(r['command'] for r in peer['results'] if any(x.endswith('AuxNativePeerTransport.cc') for x in r['command']))
bridge_receipt=REPO/'docs/integration/proposed/browser-feature-expansion/fresh-startup-milestone-a42/actual-daemon-ordinary-storage-build-a15.json'
bridge_command=list(next(r['command'] for r in json.loads(bridge_receipt.read_text())['results'] if any(x.endswith('AuxNativeParentConnectionBridge.cc') for x in r['command'])))
main=list(main);peer_command=list(peer_command)
for command,name in [(main,'AuxNativeDaemonMain.cc'),(peer_command,'AuxNativePeerTransport.cc'),(bridge_command,'AuxNativeParentConnectionBridge.cc')]:
    source=next(x for x in command if x.endswith(name))
    target=HERE/'source/daemon'/name if name!='AuxNativePeerTransport.cc' else HERE/'source/chrome/browser/aux'/name
    command[command.index(source)]=str(target)
    command[command.index('-o')+1]=str(OUT/('main.o' if name=='AuxNativeDaemonMain.cc' else 'peer-transport.o' if name=='AuxNativePeerTransport.cc' else 'parent-bridge.o'))
    if '-MF' in command:command[command.index('-MF')+1]=str(OUT/('main.d' if name=='AuxNativeDaemonMain.cc' else 'peer-transport.d' if name=='AuxNativePeerTransport.cc' else 'parent-bridge.d'))
    command[1:1]=['-I'+str(HERE/'source/chrome/browser/aux')]
link=list(next(c for c in base['commands'] if any(x.endswith('.swift') for x in c)))
replacements=[]
for index,item in enumerate(link):
    if item.endswith('.swift'):
        replacement=HERE/'source/daemon'/Path(item).name
        if replacement.exists():
            replacements.append({'before':item,'beforeSha256':sha(item),'after':str(replacement),'afterSha256':sha(replacement)})
            link[index]=str(replacement)
    elif item=='/private/tmp/aux-browser-only-daemon-build-20261025-a67/main.o':link[index]=str(OUT/'main.o')
    elif item=='/private/tmp/aux-browser-only-daemon-build-20261025-a52b/peer-transport.o':link[index]=str(OUT/'peer-transport.o')
    elif item=='/private/tmp/aux-browser-only-daemon-build-20261025-a55/parent-bridge.o':link[index]=str(OUT/'parent-bridge.o')
link.insert(1,str(HERE/'source/daemon/AuxNativeHostJournal.swift'))
link[link.index('-o')+1]=str(OUT/'Aux Daemon')
retained={x:sha(x) for x in link if x.endswith(('.o','.a')) and Path(x).is_file()}
source_inputs={str(p):sha(p) for p in (HERE/'source').rglob('*') if p.is_file()}
recipe={'format':'aux.native-host-unsigned-daemon-recipe.v1','output':str(OUT),'commands':[main,peer_command,bridge_command,link],
    'mainNodeTargetFlagsInheritedFrom':str(BASE/'peer-loss-layout-a7/build-plan.json'),
    'mainPlanSha256':sha(BASE/'peer-loss-layout-a7/build-plan.json'),
    'bridgeRecipe':str(bridge_receipt),'bridgeRecipeSha256':sha(bridge_receipt),
    'peerRecipe':str(peer_receipt),'peerRecipeSha256':sha(peer_receipt),
    'sourceReplacements':replacements,'swiftSourceCount':sum(x.endswith('.swift') for x in link),
    'retainedObjectAndLibraryHashes':retained,'sourceInputHashes':source_inputs,
    'workerHostRecompiled':False,'productSigned':False,'productExecuted':False}
(HERE/'daemon-recipe.json').write_text(json.dumps(recipe,indent=2)+'\n')
if sys.argv[1:] in [['--syntax-only'],['--syntax-main']]:
    results=[]
    if sys.argv[1:]==['--syntax-main'] and (HERE/'daemon-native-syntax.json').exists():
        results=[x for x in json.loads((HERE/'daemon-native-syntax.json').read_text())['results'] if x['name']!='main']
    for name,command in [('main',main),('peer',peer_command),('bridge',bridge_command)]:
        if sys.argv[1:]==['--syntax-main'] and name!='main':continue
        checked=[];index=0
        while index<len(command):
            if command[index] in ['-o','-MF']:index+=2;continue
            if command[index] in ['-MMD','-c']:index+=1;continue
            checked.append(command[index]);index+=1
        checked.append('-fsyntax-only')
        result=subprocess.run(checked,cwd=REPO,capture_output=True,text=True)
        (HERE/(name+'-daemon-syntax.txt')).write_text(result.stdout+result.stderr)
        results.append({'name':name,'exitCode':result.returncode,'command':checked})
        print(name,result.returncode,flush=True)
    (HERE/'daemon-native-syntax.json').write_text(json.dumps({'results':results,'objectBuild':False},indent=2)+'\n')
    raise SystemExit(any(x['exitCode']!=0 for x in results))
print(json.dumps({'swiftSources':recipe['swiftSourceCount'],'replacedSwiftSources':len(replacements),'retainedObjectAndLibraries':len(retained)}))
