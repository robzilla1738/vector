#!/usr/bin/env python3
"""Count/hash-only handoff generation. Never projects, builds, runs or signs."""
from pathlib import Path
import difflib,hashlib,json,shlex
HERE=Path(__file__).resolve().parent
REPO=HERE.parents[5]
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
NATIVE=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
DEPLOY=ROOT/HERE.relative_to(REPO)
OUT=Path('/private/tmp/aux-completion-daemon-fixed-builtins-20261026-a1')
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def canonical_path(p):return str(p).replace(str(REPO),str(ROOT))
items=json.loads((HERE/'changes.json').read_text())
anchors=[]
for item in items:
    name=item['name'];before=(HERE/'baseline'/name).read_text();after=(HERE/'source'/name).read_text()
    assert sha(HERE/'baseline'/name)==item['inputSha256'],name
    item['outputSha256']=sha(HERE/'source'/name)
    item['rootOutput']=str(DEPLOY/'source'/name)
    if name=='AuxFreshBootstrapPolicy.swift':item['pairedBrowserTarget']=str(NATIVE/'chrome/browser/aux/native_peer_policy'/name)
    for context in [3,6,12,24,48,96,100000]:
        groups=list(difflib.SequenceMatcher(a=before.splitlines(keepends=True),b=after.splitlines(keepends=True),autojunk=False).get_grouped_opcodes(context))
        changes=[]
        for group in groups:
            old=''.join(before.splitlines(keepends=True)[group[0][1]:group[-1][2]])
            new=''.join(after.splitlines(keepends=True)[group[0][3]:group[-1][4]])
            changes.append(dict(before=old,after=new,count=1))
        if all(before.count(change['before'])==1 for change in changes):break
    replay=before
    for change in changes:
        assert replay.count(change['before'])==1,(name,'ambiguous replay')
        replay=replay.replace(change['before'],change['after'])
    assert replay==after,name
    anchors.append(dict(name=name,input=item['input'],inputSha256=item['inputSha256'],outputSha256=item['outputSha256'],anchors=changes))
(HERE/'changes.json').write_text(json.dumps(items,indent=2)+'\n')
(HERE/'source.anchors.json').write_text(json.dumps(anchors,indent=2)+'\n')
(HERE/'fixed-builtins.patch').write_text(''.join(''.join(difflib.unified_diff((HERE/'baseline'/i['name']).read_text().splitlines(keepends=True),(HERE/'source'/i['name']).read_text().splitlines(keepends=True),fromfile='a/'+i['name'],tofile='b/'+i['name'])) for i in items))
# Start from the complete committed host recipe; preserve A67 Node target flags.
base=json.loads((HERE.parent/'native-host/daemon-recipe.json').read_text())
commands=json.loads(json.dumps(base['commands']).replace(str(REPO),str(ROOT)))
old_out=base['output']
commands=[[x.replace(old_out,str(OUT)) for x in command] for command in commands]
link=next(c for c in commands if any('swiftc' in x for x in c))
for index,item in enumerate(link):
    replacement=HERE/'source'/Path(item).name
    if item.endswith('.swift') and replacement.exists():link[index]=str(DEPLOY/'source'/replacement.name)
worker_base=json.loads((REPO/'docs/integration/proposed/browser-feature-expansion/local-completion-package-a38/disposable-location-review-a4/daemon-build/awaited-storage-authority-a13/build-plan.json').read_text())
worker=list(next(c for c in worker_base['commands'] if any(x.endswith('AuxDevelopmentWorkerHost.cc') for x in c)))
for index,item in enumerate(worker):
    if item.endswith('AuxDevelopmentWorkerHost.cc'):worker[index]=str(DEPLOY/'source/AuxDevelopmentWorkerHost.cc')
    elif item.endswith('worker-host.o'):worker[index]=str(OUT/'worker-host.o')
    elif item.endswith('worker-host.d'):worker[index]=str(OUT/'worker-host.d')
worker[1:1]=['-I'+str(DEPLOY/'source'),'-ivfsoverlay',str(DEPLOY/'root-compile-vfs.json')]
commands.insert(3,worker)
consumer_objects={}
for kind,number in [('Pdf',6),('Utility',7)]:
    obj=OUT/(kind.lower()+'-lifetime.o');consumer_objects[number]=str(obj)
    commands.insert(-1,[worker[0],'-std=c++20','-arch','arm64','-mmacosx-version-min=13.5','-fPIC','-c',str(DEPLOY/'source'/('AuxLoaded'+kind+'Lifetime.cc')),'-o',str(obj)])
for index,item in enumerate(link):
    if item=='/private/tmp/aux-browser-only-daemon-build-20261025-a72/worker-host.o':link[index]=str(OUT/'worker-host.o')
    for number,replacement in consumer_objects.items():
        if item==f'/private/tmp/aux-native-worker-close-main-20261023/{number}.o':link[index]=replacement
# All new output .h/.inc bytes and predecessor worker dependency headers pinned.
headers={}
words=shlex.split(Path('/private/tmp/aux-browser-only-daemon-build-20261025-a72/worker-host.d').read_text().replace('\\\n',' '))
for word in words:
    p=Path(word)
    if p.is_file() and p.suffix in ['.h','.inc']:headers[str(p)]=sha(p)
for p in (HERE/'source').iterdir():
    if p.suffix in ['.h','.inc']:headers[str(DEPLOY/'source'/p.name)]=sha(p)
maproots=[]
for kind in ['Pdf','Utility']:
    old=ROOT/('docs/integration/proposed/aux-native-'+kind.lower()+'-host-consumer/source')/('AuxLoaded'+kind+'Lifetime.h')
    maproots.append({'type':'file','name':str(old),'external-contents':str(DEPLOY/'source'/old.name)})
(HERE/'root-compile-vfs.json').write_text(json.dumps({'version':0,'roots':maproots},indent=2)+'\n')
recipe=dict(format='aux.fixed-builtins-unsigned-daemon-recipe.v1',output=str(OUT),commands=commands,
    predecessorHostRecipeSha256=sha(HERE.parent/'native-host/daemon-recipe.json'),
    requiredCommits=['176d4028c','1e3a59d8d'],mainNodeTargetFlagsInheritedFrom=base['mainNodeTargetFlagsInheritedFrom'],
    sourceReplacements=items,newSources=[dict(path=str(DEPLOY/'source/AuxFixedBuiltins.inc'),sha256=sha(HERE/'source/AuxFixedBuiltins.inc'))],
    headerAndIncludePins=headers,retainedObjectAndLibraryHashes=base['retainedObjectAndLibraryHashes'],
    sourceInputHashes=base['sourceInputHashes'],swiftSourceCount=sum(x.endswith('.swift') for x in link),
    workerHostRecompiled=True,pdfConsumerObjectRecompiled=True,utilityConsumerObjectRecompiled=True,
    productSigned=False,productExecuted=False,policyResourceActivated=False)
# Retained predecessor source hashes remain truthful; replaced outputs have own
# current pins. The retired three object bytes are inputs, not rebuilt outputs.
recipe['retiredObjects']={x:recipe['retainedObjectAndLibraryHashes'].pop(x) for x in list(recipe['retainedObjectAndLibraryHashes']) if x in ['/private/tmp/aux-browser-only-daemon-build-20261025-a72/worker-host.o','/private/tmp/aux-native-worker-close-main-20261023/6.o','/private/tmp/aux-native-worker-close-main-20261023/7.o']}
(HERE/'daemon-recipe.json').write_text(json.dumps(recipe,indent=2)+'\n')
# Ensure every recipe path is integrator-owned or an explicitly pinned existing
# dependency, never a worker checkout. Legacy sourceInputHashes preserve history.
assert all(str(REPO) not in arg for command in commands for arg in command)
print('counted replay:',len(items),'existing sources; root-only commands:',len(commands),'header/include pins:',len(headers))
