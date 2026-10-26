#!/usr/bin/env python3
"""Compose pinned source overlays; does not compile or project native sources."""
from pathlib import Path
import hashlib,json,copy
HERE=Path(__file__).resolve().parent
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
BASE=ROOT/'docs/integration/proposed/completion-20261026/runtime/selected-builtin-owner'
READER=ROOT/'docs/integration/proposed/completion-20261026/runtime/selected-file-reader'
DESKTOP=ROOT/'docs/integration/proposed/completion-20261026/desktop/browser-files'
TARGET=ROOT/'docs/integration/proposed/completion-20261026/runtime/final-daemon'
PUBLICATION=ROOT/'docs/integration/proposed/completion-20261026/integration/successor-assembly/source/AuxRuntimePublication.inc'
sha=lambda b:hashlib.sha256(b).hexdigest()
read=lambda p:p.read_text()

def output(name,value):
    (HERE/name).write_text(json.dumps(value,indent=2)+'\n')

def replay(text,anchors):
    for anchor in anchors:
        assert text.count(anchor['before'])==anchor['count']==1,anchor['before'][:100]
        text=text.replace(anchor['before'],anchor['after'])
    return text

sources={name:read(BASE/'source'/name) for name in ['AuxDevelopmentWorkerHost.cc','AuxDevelopmentWorkerHost.combined.cc','AuxSelectedBuiltinOwner.inc']}
ledger=[]
def compose(plan,sourcekey,pathkey):
    for entry in plan:
        if entry.get('new'):continue
        original_key=entry[pathkey]
        pristine=sources[original_key]
        assert sha(pristine.encode())==entry['inputSha256'],original_key
        expected=replay(pristine,entry['anchors'])
        assert sha(expected.encode())==entry['outputSha256'],original_key
        key='AuxDevelopmentWorkerHost.combined.cc' if original_key=='AuxDevelopmentWorkerHost.cc' else original_key
        before=joined[key]
        after=replay(before,entry['anchors'])
        joined[key]=after
        ledger.append({'owner':sourcekey,'originalInputFile':original_key,'originalInputSha256':entry['inputSha256'],
                       'originalOutputSha256':entry['outputSha256'],'joinedFile':key,
                       'joinedInputSha256':sha(before.encode()),'joinedOutputSha256':sha(after.encode()),'anchors':entry['anchors']})

joined={'AuxDevelopmentWorkerHost.combined.cc':sources['AuxDevelopmentWorkerHost.combined.cc'],'AuxSelectedBuiltinOwner.inc':sources['AuxSelectedBuiltinOwner.inc']}
compose(json.loads(read(READER/'native.anchors.json'))['changes'],'selected-file-reader-2a583b294','file')
desktop_plan=json.loads(read(DESKTOP/'worker-source-plan.json'))['files']
for entry in desktop_plan:
    if entry.get('new'):assert sha((DESKTOP/'source'/entry['path']).read_bytes())==entry['outputSha256'],entry['path']
compose(desktop_plan,'desktop-browser-files','path')
for name,value in joined.items():(HERE/'source'/name).write_text(value)
for source in [READER/'source/AuxSelectedFileReader.inc',DESKTOP/'source/AuxSelectedBrowserFiles.inc',PUBLICATION]:
    (HERE/'source'/source.name).write_bytes(source.read_bytes())
assert sha(PUBLICATION.read_bytes())=='892dbbef0aa14bf97db8fa60e990c7bc7a585acf847092ac0c1166307fb45062'
old=Path('/private/tmp/aux-standard-native-source-20261023-a4/AuxRuntimePublication.inc')
assert sha(old.read_bytes())=='4e0dfe94fec7763adbb454bf7d4dd01c50e3095ab242108d784b0f7bbf5f8fa9'
ledger.append({'owner':'integration-runtime-relocation','input':str(old),'inputSha256':sha(old.read_bytes()),
               'output':str(TARGET/'source/AuxRuntimePublication.inc'),'outputSha256':sha(PUBLICATION.read_bytes()),
               'candidate':'/Users/rcourson/Documents/Vibe/web/out/provided-candidate-completion-20261026-a1/Aux.app',
               'sourceBehavior':'exact kBundledTextRoot declaration relocation; other bytes preserved','trackedInput':str(PUBLICATION),'relocationCommit':'540835687'})
output('composition.json',{'format':'aux.final-daemon-source-composition.v1','predecessor':'288c34fa7','successors':['c961b0096','2a583b294'],
                         'steps':ledger,'inputPlans':{str(READER/'native.anchors.json'):sha((READER/'native.anchors.json').read_bytes()),str(DESKTOP/'worker-source-plan.json'):sha((DESKTOP/'worker-source-plan.json').read_bytes())}})
recipe=copy.deepcopy(json.loads(read(BASE/'daemon-recipe.json')))
recipe['format']='aux.final-selected-browser-files-unsigned-daemon-recipe.v1'
recipe['predecessorSelectedRecipe']=str(ROOT/'docs/integration/proposed/completion-20261026/runtime/selected-builtin-owner/daemon-recipe.json')
recipe['predecessorSelectedRecipeSha256']=sha((BASE/'daemon-recipe.json').read_bytes())
oldout=recipe['output'];newout='/private/tmp/aux-completion-final-daemon-20261026-a1';recipe['output']=newout
oldworker=str(ROOT/'docs/integration/proposed/completion-20261026/runtime/selected-builtin-owner/source/AuxDevelopmentWorkerHost.combined.cc')
newworker=str(TARGET/'source/AuxDevelopmentWorkerHost.combined.cc')
recipe['commands']=[[x.replace(oldout,newout).replace(oldworker,newworker) for x in command] for command in recipe['commands']]
recipe['commands'][0].insert(1,'-I'+str(TARGET/'source'))
recipe['sourceInputHashes'].pop(oldworker)
recipe['sourceInputHashes'][newworker]=sha((HERE/'source/AuxDevelopmentWorkerHost.combined.cc').read_bytes())
for path in list(recipe['headerAndIncludePins']):
    if Path(path).name in ['AuxSelectedBuiltinOwner.inc','AuxRuntimePublication.inc']:del recipe['headerAndIncludePins'][path]
for file in (HERE/'source').iterdir():
    if file.suffix in ['.inc','.h']:recipe['headerAndIncludePins'][str(TARGET/'source'/file.name)]=sha(file.read_bytes())
fresh=ROOT/'docs/integration/proposed/completion-20261026/integrator/fresh-successor-scope/source/daemon/AuxFreshBootstrapPolicy.swift'
assert str(fresh) in recipe['commands'][-1]
recipe['sourceInputHashes'][str(fresh)]=sha(fresh.read_bytes())
recipe['freshSuccessorScopeCommit']='4e27bd457'
recipe['requiredComponents']+=['selected-file-reader-2a583b294','desktop-browser-files-frozen-copy','native-text-root-relocation-20261026-a1']
recipe['sourceClosures']={str(TARGET/'source'/file.relative_to(HERE/'source')):sha(file.read_bytes()) for file in (HERE/'source').rglob('*') if file.is_file()}
recipe['closureInputHashes']={str(TARGET/'composition.json'):sha((HERE/'composition.json').read_bytes()),str(TARGET/'run-build.py'):sha((HERE/'run-build.py').read_bytes()),str(PUBLICATION):sha(PUBLICATION.read_bytes()),str(PUBLICATION.parents[1]/'runtime-relocation.json'):sha((PUBLICATION.parents[1]/'runtime-relocation.json').read_bytes()),
 str(ROOT/'docs/integration/proposed/completion-20261026/integrator/fresh-successor-scope/source-plan.json'):sha((fresh.parents[2]/'source-plan.json').read_bytes())}
recipe['sourceInputHashes'].update({k:v for k,v in recipe['sourceClosures'].items() if k.endswith(('.cc','.inc','.h'))})
for command in recipe['commands']:
    for index,value in enumerate(command):
        if value=='-ivfsoverlay':
            vfs=Path(command[index+1]);recipe['closureInputHashes'][str(vfs)]=sha(vfs.read_bytes())
            for entry in json.loads(vfs.read_text())['roots']:
                contents=Path(entry['external-contents']);recipe['headerAndIncludePins'][str(contents)]=sha(contents.read_bytes())
for path in [BASE/'daemon-recipe.json',Path(recipe['predecessorRootRecipe']),DESKTOP/'worker-source-plan.json',READER/'native.anchors.json']:
    recipe['closureInputHashes'][str(path)]=sha(path.read_bytes())
recipe['mainNodeTargetFlagsInheritedFrom']=recipe['mainNodeTargetFlagsInheritedFrom'].replace('/Users/rcourson/Documents/Vibe/aux-completion-20261026/runtime/',str(ROOT)+'/')
assert all('/aux-completion-20261026/' not in x for command in recipe['commands'] for x in command)
assert len([x for x in recipe['commands'][-1] if x.endswith('.swift')])==54
output('daemon-recipe.json',recipe)
output('source-pins.json',recipe['sourceClosures'])
print('composed',len(ledger),'steps; commands',len(recipe['commands']),'Swift',recipe['swiftSourceCount'])
fixture=json.loads(read(BASE/'fixture-recipe.json'))
fixtureout='/private/tmp/aux-completion-final-daemon-fixture-20261026-a1'
fixture['output']=fixtureout
fixture['commands'][0][-2]=str(TARGET/'source/emit-producer.mjs')
fixture['commands'][0][-1]=fixtureout+'/producer.json'
fixture['commands'][1]=[str(TARGET/'source/fixture/main.swift') if x.endswith('/fixture/main.swift') else x.replace('/Users/rcourson/Documents/Vibe/aux-completion-20261026/runtime/',str(ROOT)+'/') for x in fixture['commands'][1]]
fixture['commands'][1][-1]=fixtureout+'/owner-fixture'
fixture['commands'][2][-2]=fixtureout+'/owner-fixture'
fixture['commands'][2][-1]=fixtureout+'/producer.json'
fixture['commands'][2].append(fixtureout)
fixture['requiresBuildReceipt']=newout+'/build-receipt.json'
fixture['inputPins']={}
for command in fixture['commands']:
    for value in command:
        path=Path(value)
        if path.suffix in ('.mjs','.swift'):
            local=HERE/path.relative_to(TARGET) if path.is_relative_to(TARGET) else path
            fixture['inputPins'][value]=sha(local.read_bytes())
fixture['inputPins'][str(TARGET/'run-fixture.py')]=sha((HERE/'run-fixture.py').read_bytes())
fixture['inputPins']['/Users/rcourson/Documents/Vibe/web/out/provided-candidate-local-completion-20261025-a38/Aux.app/Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs']='48af998738fb6d2fc30cb8d5b2e9de03cb04ab7d8563ebdaa5fe8100944fc514'
fixture['syntheticRootsPreserved']=True
output('fixture-recipe.json',fixture)
