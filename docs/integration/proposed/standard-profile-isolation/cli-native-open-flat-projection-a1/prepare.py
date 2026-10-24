#!/usr/bin/env python3
"""Flatten reviewed CLI source against current native bytes; never projects it."""
from pathlib import Path
import difflib,hashlib,json,os,subprocess,tempfile
HERE=Path(__file__).resolve().parent;BASE=HERE.parent
ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
WEB=Path('/Users/rcourson/Documents/Vibe/web')
COMPOSITION=WEB/'docs/integration/proposed/browser-feature-expansion/storage-restore-integration-a10/source-composition.json'
OPEN=BASE/'cli-native-open-command-a1';HANDOFF=BASE/'cli-native-open-build-handoff-a1';EMBED=BASE/'cli-native-embedding-a1'
sha=lambda b:hashlib.sha256(b).hexdigest();file_sha=lambda p:sha(p.read_bytes())
composition=json.loads(COMPOSITION.read_text());assert composition['passed']
selected=composition['selectedFiles'];assert len(selected)==383
for name,row in selected.items():assert file_sha(ROOT/name)==row['sha256'],name
pins={str(COMPOSITION):file_sha(COMPOSITION)};changes={};additions={}
def pin(p):pins[str(p)]=file_sha(p)
def edit(name,find,replace):return {'name':name,'find':find,'replace':replace,'count':1}
def edits(path,anchors,append=''):
 record=changes.setdefault(path,{'anchors':[],'appendBlocks':[]})
 record['anchors'].extend(anchors)
 if append:record['appendBlocks'].append({'name':'Reviewed fixed native implementation/target block','bytes':append,'count':1})
def new(path,source):
 assert path not in additions
 assert not os.path.lexists(ROOT/path),path
 additions[path]=source;pin(source)
# Use the exact actual SDK-tested native/common source bytes, not historical
# generated entries or broad provider/Node bootstrap proposals.
for name in ['AuxCliWire.h','AuxCliWire.cc','AuxCliSealedImages.h','AuxCliSealedImages.cc']:
 new('chrome/browser/aux/cli/'+name,EMBED/'source/common'/name)
for name in ['AuxCliIngress.h','AuxCliOpenArguments.h','AuxCliOpenArguments.cc','AuxCliManualProfileApproval.h','AuxCliOpenCommand.h','AuxCliOpenCommand.mm']:
 new('chrome/browser/aux/cli/'+name,OPEN/'source'/name)
for name in ['AuxCliIngress.cc','AuxCliManualProfileApproval.mm','AuxNativeCliFrontend.mm']:
 new('chrome/browser/aux/cli/'+name,HANDOFF/'source'/name)
for name in ['AuxNativeEndpointDelivery.h','AuxNativeEndpointDelivery.cc']:
 new('chrome/browser/aux/cli/'+name,WEB/'docs/integration/proposed/aux-native-daemon-main/source'/name)
new('chrome/browser/aux/cli/packaged-identity-admission.h',WEB/'vendor/provided/native/packaged-identity-admission.h')
new('base/process/mac/aux_browser_descendant_cli_membership.h',HANDOFF/'source/aux_browser_descendant_cli_membership.h')
assert not os.path.lexists(ROOT/'chrome/browser/aux/cli')
edits('base/process/mac/aux_browser_descendant_engine.h',[
 edit('Primary engine imports only the narrow factual client declaration','#include <memory>','#include <memory>\n#include "base/process/mac/aux_browser_descendant_cli_membership.h"'),
 edit('Primary-only actual implementation declaration','enum class Result { pending, settled, unknown, refused };','enum class Result { pending, settled, unknown, refused };\n// Primary executable implementation; Framework clients use the narrow main-image query.\nCliClientMembership InspectActualCliClientInPrimaryImage(audit_token_t) noexcept;')])
engine=HANDOFF/'source/aux_browser_descendant_engine.cc';pin(engine);engine_text=engine.read_text();start=engine_text.index('CliClientMembership InspectActualCliClientInPrimaryImage(');end=engine_text.index('Result InspectStream() noexcept {',start);body=engine_text[start:end]
edits('base/process/mac/aux_browser_descendant_engine.cc',[edit('Actual retained identity query, never absence-as-manual','Result InspectStream() noexcept {',body+'Result InspectStream() noexcept {')])
bridge=HANDOFF/'source/aux_browser_descendant_bridge.cc';pin(bridge);bridge_text=bridge.read_text();append=bridge_text[bridge_text.index('\n// Separate finite factual query.'):]
edits('base/process/mac/aux_browser_descendant_bridge.cc',[],append)
for plan in [HANDOFF/'gn-plan.json',OPEN/'native-hooks.json',OPEN/'registration-handoff.json']:
 pin(plan)
 for row in json.loads(plan.read_text())['files']:
  edits(row['path'],row['anchors'],row.get('append',''))
# Pins describe the approved real object/link evidence; neither receipt grants
# runtime authority or permits executing the linked native CLI.
actual=WEB/'docs/integration/proposed/standard-profile-isolation/cli-native-open-build-handoff-a1/actual-sdk-compile-a1.json';pin(actual)
receipt=json.loads(actual.read_text());assert receipt['passed'];assert len(receipt['results'])==6
sdk=HANDOFF/'sdk-compile-plan.json';pin(sdk);sdk_plan=json.loads(sdk.read_text())
assert receipt['planSha256']==file_sha(sdk)
for row in sdk_plan['inputs']:assert file_sha(Path(row['path']))==row['sha256'];pins[row['path']]=row['sha256']
rows=[]
for path,record in sorted(changes.items()):
 native=ROOT/path;original=native.read_bytes();text=original.decode()
 for anchor in record['anchors']:
  assert text.count(anchor['find'])==anchor['count']==1,(path,anchor['name'])
  text=text.replace(anchor['find'],anchor['replace'])
 for block in record['appendBlocks']:
  assert block['bytes']not in text,path
  text+=block['bytes']
 before=HERE/'before'/path;before.parent.mkdir(parents=True,exist_ok=True);before.write_bytes(original)
 source=HERE/'source'/path;source.parent.mkdir(parents=True,exist_ok=True);source.write_text(text)
 assert native.read_bytes()==original
 rows.append({'path':path,'kind':'existing-counted-overlay','inputSha256':sha(original),'outputSha256':file_sha(source),'source':str(source),'beforeImage':str(before),'anchors':record['anchors'],'appendBlocks':record['appendBlocks']})
for path,original in sorted(additions.items()):
 assert not os.path.lexists(ROOT/path)
 source=HERE/'source'/path;source.parent.mkdir(parents=True,exist_ok=True);source.write_bytes(original.read_bytes())
 rows.append({'path':path,'kind':'new-absent-native-file','inputSha256':None,'outputSha256':file_sha(source),'source':str(source),'sourceInput':str(original),'sourceInputSha256':file_sha(original),'absenceProof':{'nativePath':str(ROOT/path),'lexists':False,'checkedDuringPreparation':True},'anchors':[],'appendBlocks':[]})
assert len(changes)==14 and len(additions)==17 and len(rows)==31
excluded=['base/process/launch.h','base/process/launch_mac.cc','chrome/browser/aux/AuxOwnedNativePeerChild.h','chrome/browser/aux/AuxOwnedNativePeerChild.cc']
assert not set(excluded)&{r['path']for r in rows}
patch=''
for row in rows:
 original=Path(row['beforeImage']).read_text().splitlines(True)if row['inputSha256']else[]
 patch+=''.join(difflib.unified_diff(original,Path(row['source']).read_text().splitlines(True),fromfile='a/'+row['path']if original else'/dev/null',tofile='b/'+row['path']))
(HERE/'native.patch').write_text(patch)
# Prove that the complete flattened patch applies and reverses in a disposable
# source-only mirror, without writing a byte in the actual native checkout.
with tempfile.TemporaryDirectory(prefix='aux-cli-flat-replay-')as temporary:
 stage=Path(temporary)
 for row in rows:
  if row['inputSha256']:
   p=stage/row['path'];p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(Path(row['beforeImage']).read_bytes())
 subprocess.run(['git','apply','--check',str(HERE/'native.patch')],cwd=stage,check=True,capture_output=True)
 subprocess.run(['git','apply',str(HERE/'native.patch')],cwd=stage,check=True,capture_output=True)
 for row in rows:assert file_sha(stage/row['path'])==row['outputSha256']
 subprocess.run(['git','apply','--reverse','--check',str(HERE/'native.patch')],cwd=stage,check=True,capture_output=True)
 subprocess.run(['git','apply','--reverse',str(HERE/'native.patch')],cwd=stage,check=True,capture_output=True)
 for row in rows:
  p=stage/row['path']
  if row['inputSha256']:assert file_sha(p)==row['inputSha256']
  else:assert not os.path.lexists(p)
# Current selected inputs and every CLI beforeimage remain actual byte-identical.
for path,row in selected.items():assert file_sha(ROOT/path)==row['sha256'],path
for row in rows:
 if row['inputSha256']:assert file_sha(ROOT/row['path'])==row['inputSha256']
 else:assert not os.path.lexists(ROOT/row['path'])
coverage=[]
for item in sdk_plan['inputs']:
 source=Path(item['path'])
 if source.name=='SDKSettings.json':continue
 matches=[row for row in rows if Path(row['path']).name==source.name]
 assert len(matches)==1 and matches[0]['outputSha256']==item['sha256'],source.name
 coverage.append({'sdkInput':item['path'],'sha256':item['sha256'],'flatPath':matches[0]['path'],'flatSource':matches[0]['source']})
(HERE/'sdk-source-coverage.json').write_text(json.dumps({'format':'aux.cli-native-open.flat.sdk-coverage.v1','actualSdkReceipt':str(actual),'actualSdkReceiptSha256':file_sha(actual),'testedSourceHeaderCount':len(coverage),'files':coverage,'sdkCompilePassed':True,'standaloneUnsignedLinkPassed':receipt['link']['passed'],'browserUiAndPrimaryCompilePassed':False,'productExecuted':False,'runtimeAcceptance':False},indent=2)+'\n')
manifest={'format':'aux.cli-native-open.flat-projection.v1','actualNativeRoot':str(ROOT),'priorActualComposition':str(COMPOSITION),'priorActualCompositionSha256':file_sha(COMPOSITION),'priorSelectedFileCount':len(selected),'priorChangedFileCount':composition['changedFileCount'],'files':rows,'existingFileCount':len(changes),'newFileCount':len(additions),'excludedUnusedBroadLaunchFiles':excluded,'standaloneSdkCompileReceipt':str(actual),'standaloneSdkCompileReceiptSha256':file_sha(actual),'actualNativeMutation':False,'compilerRunByThisLane':False,'registered':False,'productExecuted':False,'runtimeAcceptance':False}
(HERE/'projection.json').write_text(json.dumps(manifest,indent=2)+'\n')
(HERE/'dependency-pins.json').write_text(json.dumps({'format':'aux.cli-native-open.flat.dependencies.v1','files':[{'path':k,'sha256':v}for k,v in sorted(pins.items())]},indent=2)+'\n')
check={'format':'aux.cli-native-open.flat.static-check.v1','passed':True,'existingFileCount':len(changes),'newFileCount':len(additions),'singleMatchAnchors':sum(len(r['anchors'])for r in rows),'appendBlocks':sum(len(r['appendBlocks'])for r in rows),'preservedCurrentSelectedFiles':len(selected),'patchAppliedAndReversedInDisposableMirror':True,'newFilesAbsenceVerified':len(additions),'actualNativeMutation':False,'gnRun':False,'compilerRunByThisLane':False,'nativeApiExecuted':False,'localAuthenticationInvoked':False,'productExecuted':False,'signed':False,'runtimeAcceptance':False}
(HERE/'static-check.json').write_text(json.dumps(check,indent=2)+'\n');print(json.dumps(check))
