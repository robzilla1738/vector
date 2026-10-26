#!/usr/bin/env python3
"""Exact source replay/recipe preparation only. Never project/build/run/sign."""
from pathlib import Path
import json,hashlib,difflib,shlex
HERE=Path(__file__).resolve().parent
REPO=HERE.parents[5]
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
DEPLOY=ROOT/HERE.relative_to(REPO)
FIXED=HERE.parent/'fixed-builtins'
CU=Path('/Users/rcourson/Documents/Vibe/aux-completion-20261026/integration/docs/integration/proposed/completion-20261026/integration/computer-use')
CUROOT=ROOT/'docs/integration/proposed/completion-20261026/integration/computer-use'
INTEGRATOR=ROOT/'docs/integration/proposed/completion-20261026/integrator'
OUT=Path('/private/tmp/aux-completion-selected-daemon-20261026-a1')
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def dump(name,value):(HERE/name).write_text(json.dumps(value,indent=2)+'\n')
preimages={name:HERE.parent/'native-host/source/daemon'/name for name in ['AuxAccountsCskCoordinator.swift','AuxSecureStore.swift','AuxOwnedCommandDispatcher.swift']}
for name in ['AuxNativeTaskLayout.swift','AuxDevelopmentWorkerHost.cc','AuxFixedBuiltins.inc']:preimages[name]=FIXED/'source'/name
preimages['AuxMemoryMainOwner.inc']=Path('/private/tmp/aux-browser-only-daemon-build-20261025-a72/source/AuxMemoryMainOwner.inc')
rows=[];patch=''
for name,path in preimages.items():
    old=path.read_text();new=(HERE/'source'/name).read_text()
    baseline=HERE/'baseline'/name;baseline.parent.mkdir(exist_ok=True);baseline.write_text(old)
    changes=[]
    for context in [3,6,12,24,48,100000]:
        changes=[]
        for group in difflib.SequenceMatcher(a=old.splitlines(keepends=True),b=new.splitlines(keepends=True),autojunk=False).get_grouped_opcodes(context):
            before=''.join(old.splitlines(keepends=True)[group[0][1]:group[-1][2]])
            after=''.join(new.splitlines(keepends=True)[group[0][3]:group[-1][4]])
            changes.append(dict(before=before,after=after,count=1))
        if all(old.count(c['before'])==1 for c in changes):break
    replay=old
    for c in changes:assert replay.count(c['before'])==1;replay=replay.replace(c['before'],c['after'])
    assert replay==new,name
    rows.append(dict(name=name,input=str(path),inputSha256=sha(path),output=str(DEPLOY/'source'/name),outputSha256=sha(HERE/'source'/name),anchors=changes))
    patch+=''.join(difflib.unified_diff(old.splitlines(keepends=True),new.splitlines(keepends=True),fromfile='a/'+name,tofile='b/'+name))
dump('changes.json',rows);(HERE/'selected-owner.patch').write_text(patch)
# Explicitly rebase the separately pinned four CU anchors on the selected
# successor. Validate both original CU preimage and every unique new context.
cuplan=json.loads((CU/'native-host-overlay.json').read_text())
assert sha(cuplan['source'])==cuplan['sourceSha256']
combined=(HERE/'source/AuxDevelopmentWorkerHost.cc').read_text()
combined_input=hashlib.sha256(combined.encode()).hexdigest()
for rule in cuplan['rules']:
    assert combined.count(rule['find'])==rule['count']==1
    combined=combined.replace(rule['find'],rule['replace'])
(HERE/'source/AuxDevelopmentWorkerHost.combined.cc').write_text(combined)
dump('combined-host.json',dict(format='aux.selected-builtin-cu-host-composition.v1',selectedInputSha256=combined_input,
    cuRuleInputSha256=sha(CU/'native-host-overlay.json'),cuOriginalSourceSha256=cuplan['sourceSha256'],
    ruleCount=len(cuplan['rules']),outputSha256=sha(HERE/'source/AuxDevelopmentWorkerHost.combined.cc')))
# Use the successful SDK-corrected root link cohort, retaining completed objects.
base=json.loads((INTEGRATOR/'daemon-sdk-repair-recipe.json').read_text())
link=list(next(c for c in base['commands'] if any('swiftc' in x for x in c)))
oldout=base['output'];link=[x.replace(oldout,str(OUT)) if x==oldout+'/Aux Daemon' else x for x in link]
# Retain the unchanged successful PDF/utility consumer objects from a2.
for i,x in enumerate(link):
    replacement=HERE/'source'/Path(x).name
    if x.endswith('.swift') and replacement.exists():link[i]=str(DEPLOY/'source'/replacement.name)
    if x.endswith('AuxFreshBootstrapPolicy.swift'):
        link[i]=str(INTEGRATOR/'fresh-successor-scope/source/daemon/AuxFreshBootstrapPolicy.swift')
for name in ['AuxSelectedAccountOwner.swift','AuxSelectedUtilityInvocation.swift']:link.insert(1,str(DEPLOY/'source'/name))
link.insert(1,str(CUROOT/'source/AuxComputerUseHelperJournal.swift'))
fixed=json.loads((FIXED/'daemon-recipe.json').read_text())
worker=list(next(c for c in fixed['commands'] if any(x.endswith('AuxDevelopmentWorkerHost.cc') for x in c)))
for i,x in enumerate(worker):
    if x.endswith('AuxDevelopmentWorkerHost.cc'):worker[i]=str(DEPLOY/'source/AuxDevelopmentWorkerHost.combined.cc')
    elif x.endswith('worker-host.o'):worker[i]=str(OUT/'worker-host.o')
    elif x.endswith('worker-host.d'):worker[i]=str(OUT/'worker-host.d')
worker[1:1]=['-I'+str(DEPLOY/'source'),'-I'+str(CUROOT/'source')]
# The actual memory-helper predecessor is the closest fixed-role ObjC++ recipe.
p=REPO/'docs/integration/proposed/browser-feature-expansion/local-completion-package-a38/disposable-location-review-a4/daemon-build/memory-ancestor-metadata-a11/build-plan.json'
cu=list(next(c for c in json.loads(p.read_text())['commands'] if any(x.endswith('AuxAccountMemoryHelper.mm') for x in c)))
for i,x in enumerate(cu):
    if x.endswith('AuxAccountMemoryHelper.mm'):cu[i]=str(CUROOT/'source/AuxAccountComputerUseHelper.mm')
    elif x.endswith('memory-helper.o'):cu[i]=str(OUT/'computer-use.o')
    elif x.endswith('memory-helper.d'):cu[i]=str(OUT/'computer-use.d')
cu[1:1]=['-I'+str(DEPLOY/'source'),'-I'+str(CUROOT/'source')]
for i,x in enumerate(link):
    if x.endswith('/worker-host.o'):link[i]=str(OUT/'worker-host.o')
link.insert(1,str(OUT/'computer-use.o'))
commands=[worker,cu,link]
# Modified sources/new helpers plus all original Worker and CU native headers.
headers={}
for dep in ['/private/tmp/aux-browser-only-daemon-build-20261025-a72/worker-host.d','/private/tmp/aux-browser-only-daemon-build-20261025-a71/memory-helper.d']:
    for word in shlex.split(Path(dep).read_text().replace('\\\n',' ')):
        value=Path(word)
        if value.is_file() and value.suffix in ['.h','.inc']:headers[str(value)]=sha(value)
for folder,deployed in [(HERE/'source',DEPLOY/'source'),(CU/'source',CUROOT/'source')]:
    for value in folder.iterdir():
        if value.suffix in ['.h','.inc']:headers[str(deployed/value.name)]=sha(value)
inputs={}
for command in commands:
    for x in command:
        if x.endswith(('.cc','.mm','.swift')):
            # New root files do not exist until integrator cherry-picks; hash the
            # exact tracked lane byte corresponding to their final root path.
            local=HERE/'source'/Path(x).name
            if x.startswith(str(DEPLOY)) and local.exists():inputs[x]=sha(local)
            elif x.startswith(str(CUROOT)):inputs[x]=sha(CU/'source'/Path(x).name)
            else:inputs[x]=sha(x)
retained={}
for x in link:
    if x.endswith(('.o','.a')) and not x.startswith(str(OUT)):
        retained[x]=sha(x)
recipe=dict(format='aux.selected-owner-cu-unsigned-daemon-recipe.v1',output=str(OUT),commands=commands,
    predecessorRootRecipe=str(INTEGRATOR/'daemon-sdk-repair-recipe.json'),predecessorRootRecipeSha256=sha(INTEGRATOR/'daemon-sdk-repair-recipe.json'),
    mainNodeTargetFlagsInheritedFrom=base['mainNodeTargetFlagsInheritedFrom'],sourceInputHashes=inputs,headerAndIncludePins=headers,
    retainedObjectAndLibraryHashes=retained,sourceReplacements=rows,swiftSourceCount=sum(x.endswith('.swift') for x in link),
    requiredComponents=['selected-owner-successor-to81efed483','CU-ec9b2091e','desktop-3ee52363d','root-fresh-successor-scope'],
    productSigned=False,productExecuted=False,policyMigrationImplemented=False)
assert recipe['swiftSourceCount']==54
assert all(str(REPO) not in x for c in commands for x in c)
dump('daemon-recipe.json',recipe)
# Diagnostic-only check commands retain actual lane paths for root to inspect;
# no command is run here. All modified source bytes are explicit.
def lane(command):
    return [x.replace(str(DEPLOY),str(HERE)).replace(str(CUROOT),str(CU)) for x in command]
checks=[]
for name,command in [('combined-worker',worker),('computer-use',cu)]:
    check=lane(command)
    for flag in ['-o','-MF']:
        if flag in check:i=check.index(flag);del check[i:i+2]
    check=[x for x in check if x not in ['-c','-MMD']]+['-fsyntax-only']
    checks.append(dict(name=name,command=check))
dump('cpp-check-commands.json',checks)
dump('source-pins.json',{str(DEPLOY/'source'/p.name):sha(p) for p in (HERE/'source').iterdir()})
print('sources',len(rows),'counted predecessors; commands',len(commands),'Swift',recipe['swiftSourceCount'],'headers',len(headers))
