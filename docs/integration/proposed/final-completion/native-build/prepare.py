#!/usr/bin/env python3
"""Freeze one unsigned daemon successor; no predecessor artifact is changed."""
import hashlib,json
from pathlib import Path
H=Path(__file__).resolve().parent;W=H.parents[4]
OUT=Path('/private/tmp/aux-final-native-main-20261023')
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def load(p):return json.loads(Path(p).read_text())
basePath=W/'docs/integration/proposed/aux-native-worker-close-main-build/inputs.json';base=load(basePath)
old=Path(base['output']);reportPath=old/'results.json';report=load(reportPath)
assert report['passed'] and report['inputsUnchanged'] and report['allFourClassDeclarationsPaired']
assert sha(old/'Aux Daemon')==report['executableSha256']=='450e4ad830fb169f6342a77e9ef551e519df3a59547823e437448f57e89f8dc2'
frozen=dict(base['frozenFiles']);frozen[str(basePath)]=sha(basePath);frozen[str(reportPath)]=sha(reportPath);frozen[str(old/'Aux Daemon')]=sha(old/'Aux Daemon')
objects={}
for i in range(11):
 name=str(i)+'.o';expected=report['changedObjectHashes'].get(name,base['reusedObjects'].get(name));assert expected and sha(old/name)==expected
 objects[name]={'source':str(old/name),'sha256':expected};frozen[str(old/name)]=expected
execRoot=W/'docs/integration/proposed/final-completion/native/exec-parent';execPins=load(execRoot/'inputs.json');execReview=load(execRoot/'integration.json')
execOut=Path(execPins['output']);execResult=load(execOut/'results.json')
assert execResult['passed'] and execResult['inputsUnchanged'] and execResult['newSwiftImportPresent'] and execResult['swiftTypecheckedSourceCount']==46
assert sha(execOut/'host.o')==execResult['hostObjectSha256']
frozen.update(execResult['actualDependencies'])
for p in [execRoot/'inputs.json',execRoot/'integration.json',execRoot/'compile.py',execOut/'results.json',execOut/'host.o']:
 frozen[str(p)]=sha(p)
for p,h in execPins['frozenFiles'].items():assert sha(p)==h
header=execRoot/execReview['sameWorkerClassHeader']['path'].split('exec-parent/')[1]
assert sha(header)==execReview['sameWorkerClassHeader']['sha256']==base['classHeaderSha256']
frozen[str(header)]=sha(header)
objects['2.o']={'source':str(execOut/'host.o'),'sha256':execResult['hostObjectSha256']}
link=[value.replace(str(old),str(OUT)) for value in base['link']]
swiftCheck=execPins['commands'][1]['command'];assert swiftCheck.count('-sdk')==1
sdk=swiftCheck[swiftCheck.index('-sdk')+1];assert Path(sdk).is_dir();link[1:1]=['-sdk',sdk]
for name in ['SDKSettings.json','SDKSettings.plist']:
 candidate=Path(sdk)/name
 if candidate.is_file():frozen[str(candidate)]=sha(candidate)
replacements=[]
freshReview=W/'docs/integration/proposed/final-completion/fresh-owner/integration.json';fresh=load(freshReview)
for original,record in fresh['replacements'].items():
 matches=[v for v in link if v.endswith('/'+original)];assert len(matches)==1,(original,matches)
 before=matches[0];after=str(W/record['successor']);assert sha(before)==record['beforeSha256'] and sha(after)==record['afterSha256']
 link[link.index(before)]=after;frozen[after]=record['afterSha256'];replacements.append({'before':before,'after':after,'beforeSha256':record['beforeSha256'],'afterSha256':record['afterSha256']})
for record in execReview['replacements']:
 original=record['original'];after=str(W/record['successor']);assert sha(original)==record['originalSha256'] and sha(after)==record['successorSha256']
 frozen[after]=record['successorSha256']
 if record['role']=='policyLoader':
  assert link.count(original)==1;link[link.index(original)]=after;replacements.append({'before':original,'after':after,'beforeSha256':record['originalSha256'],'afterSha256':record['successorSha256']})
assert len(replacements)==4 and sum(v.endswith('.swift') for v in link)==46
assert link.count('-no_adhoc_codesign')==1
archives=[v for v in link if v.endswith('.a')];assert len(archives)==43 and len(set(archives))==37
assert len([v for v in frozen if v.endswith('.a') and '/aux-node-static-26.5.0/' in v])==42
for v in link:
 if v.endswith(('.swift','.a')) or (v.startswith('/') and '/Xcode.app/' in v and Path(v).is_file()):frozen[v]=sha(v)
for p in [freshReview,W/'docs/integration/proposed/final-completion/fresh-owner/evidence/compile.json',W/'docs/integration/proposed/final-completion/native/peer/integration.json',W/'docs/integration/proposed/final-completion/native/peer/evidence/compile.json']:
 frozen[str(p)]=sha(p)
peer=load(W/'docs/integration/proposed/final-completion/native/peer/integration.json')
for item in peer['files']:
 local=W/'docs/integration/proposed/final-completion/native/peer/source'/Path(item['path']).name
 assert sha(local)==item['outputSha256'];frozen[str(local)]=sha(local)
for path,digest in frozen.items():assert sha(path)==digest,path
pins={'format':'aux.final-completion.native-main.inputs.v1','baseline':'f839f910cb7f6a09dc8e97e48ae72cb8c6d4b55d','output':str(OUT),'priorOutput':str(old),'frozenFiles':frozen,'objectInputs':objects,'link':link,'sourceReplacements':replacements,'swiftSourceCount':46,'nodeArchivesChecked':42,'linkedUniqueArchives':37,'archiveOperands':43,'module':base['module'],'moduleSha256':base['moduleSha256'],'tools':base['tools'],'expectedFlatImports':base['expectedFlatImports'],'ptyImports':base['ptyImports'],'swiftInternalDefinitions':base['swiftInternalDefinitions']+['_AuxCopyAuthenticatedExecPrivateParent'],'fixedReaderPreserved':base['fixedReaderPreserved'],'policyFormat':base['policyFormat'],'execProducerReceipt':str(execOut/'results.json'),'peerReference':{'compileReceipt':'docs/integration/proposed/final-completion/native/peer/evidence/compile.json','integration':'docs/integration/proposed/final-completion/native/peer/integration.json','daemonOperand':False,'browserLinkPerformedHere':False},'automaticAdHocSigningDisabled':True}
(H/'inputs.json').write_text(json.dumps(pins,indent=2)+'\n')
print('Frozen46-source daemon link: three retained-home owners plus readonly producer loader, ten prior objects plus exact new host object; PEER is a separate browser operand')
