"""Counted successors of exactly eight root-owned A23 supplied modules."""
import difflib,hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
sha=lambda data:hashlib.sha256(data).hexdigest()
baseline=json.loads((HERE/'baseline.json').read_text())
changes={};rows=[];patch=[]
def edits(path,values):changes.setdefault(path,[]).extend(values)
codec='assets/draft-storage-ixLojjZ5.js'
runtime=(HERE/'runtime-input.js.txt').read_text()
runtime_edits=[(
 'return !(a===null&&auxPendingMessageDirty&&auxDraftMigrationAckedClaim&&',
 'return !(auxPendingMessageDirty&&auxDraftMigrationAckedClaim&&'),(
 '    const ownerStates=owners.map(({kind},index)=>({kind,signatureJson:lease.signatures[index]}));',
 '    const ownerStates=owners.map((entry,index)=>({kind:entry.kind,scope:auxDraftMigrationOwnerScope(entry,owners),signatureJson:lease.signatures[index]}));'),(
 '    ownerStates.sort((a,b)=>a.kind<b.kind?-1:a.kind>b.kind?1:a.signatureJson<b.signatureJson?-1:a.signatureJson>b.signatureJson?1:0);',
 '    ownerStates.sort((a,b)=>auxDraftRecoveryCompare(a.kind,b.kind)||auxDraftRecoveryCompare(String(a.scope),String(b.scope))||auxDraftRecoveryCompare(a.signatureJson,b.signatureJson));'),(
 'function auxReleaseDraftMigrationCapture(leaseId){',
 '''function auxReleaseDraftMigrationCapture(leaseId){
  if(auxDraftMigrationLease?.id===leaseId&&auxDraftMigrationLease.adoption&&!auxDraftMigrationLease.adoption.complete)
    return{format:auxDraftMigrationFormat,ok:false,released:false,retained:true,requestId:auxDraftMigrationLease.requestId,
      leaseId,revision:auxDraftMigrationLease.revision,error:"Actual owner adoption remains pending"};'''),(
 '// Freeze productive user input only for the finite native-owned capture lease.',
 (HERE/'adoption-runtime.js.txt').read_text()+'\n'+(HERE/'handoff-runtime.js.txt').read_text()+'\n// Freeze productive user input only for the finite native-owned capture lease.')]
for before,after in runtime_edits:
 assert runtime.count(before)==1,(before[:100],runtime.count(before))
 runtime=runtime.replace(before,after)
(HERE/'runtime-output.js.txt').write_text(runtime)
edits(codec,[
 ('return{getDraft:()=>t,write:', 'return{getDraft:()=>t,adoptMemory:o=>{if(!auxDraftMigrationRecoveryApplying())throw Error("A native recovery hold is required");t=o},write:'),
 ('function g(e){if(a&&(!e||a.sessionId===e))return a;const n=window.sessionStorage.getItem(m);return n?JSON.parse(n):null}',
  'function g(e){const cached=a&&(!e||a.sessionId===e)?a:null;let stored;try{const raw=window.sessionStorage.getItem(m);stored=raw?JSON.parse(raw):null}catch(error){if(cached)return cached;throw error}if(auxPendingMessageDirty&&auxDraftMigrationAckedClaim&&stored?.sessionId===auxDraftMigrationAckedClaim.sessionId&&stored?.claimId===auxDraftMigrationAckedClaim.claimId)stored=null;return stored?.claimId?stored:cached??stored}'),
 ('function H(e){if(typeof window>"u"||auxDraftMigrationBlocked())return null;',
  'function H(e){if(typeof window>"u"||auxDraftMigrationBlocked()||a?.claimId&&!T(a))return null;'),
 *((before,after) for before,after in runtime_edits),
 ('auxGetNewtabDraftSettingsOwner};',
  'auxGetNewtabDraftSettingsOwner,auxDraftMigrationRecoveryApplying,auxDraftRecoveryDraftForScope,auxDraftRecoverySettingsForScope,auxAdoptDraftMigrationRecovery,auxReadDraftMigrationRecoveryAdoption,auxHandoffDraftMigrationRecovery,auxReadDraftMigrationRecoveryHandoff};')])

editor='assets/create-editor-B-Br5Wz9.js'
edits(editor,[
 ('auxDraftMigrationChanged}', 'auxDraftMigrationChanged,auxDraftMigrationRecoveryApplying}'),
 ('let auxRetireDraftEditor=null;', 'let auxRetireDraftEditor=null,auxRecoveryEditRevision=0;'),
 ('onUpdate:()=>{auxDraftMigrationChanged();', 'onUpdate:()=>{auxRecoveryEditRevision++;auxDraftMigrationChanged();'),
 ('d={clear:()=>{i.commands.setContent(', 'd={clear:()=>{auxRecoveryEditRevision++;i.commands.setContent('),
 ('l?.focus==="immediate"?(i.commands.setTextSelection', 'l?.focus==="none"&&auxDraftMigrationRecoveryApplying()?void 0:l?.focus==="immediate"?(i.commands.setTextSelection'),
 ('flush:()=>{if(i.isDestroyed)throw Error("An editor closed during capture");',
  '''prepareAdoption:(value,context)=>{if(i.isDestroyed||i.isEditable||e.composition.isComposing||i.view.composing||value?.editable!==!1||!value?.snapshot)throw Error("Actual rich editor cannot adopt");const current=d.getSnapshot();if(JSON.stringify(value.snapshot.attachments??[])!==JSON.stringify(current.attachments??[]))throw Error("A file/mention capability cannot be invented");if(!context.matched){const base=context.richBase;if(auxRecoveryEditRevision!==0||!base||JSON.stringify(base)!==JSON.stringify(current))throw Error("Fresh editor contains a newer or unknown draft")}const normalized=y(i.schema.nodeFromJSON(value.snapshot.doc).toJSON());if(JSON.stringify(normalized)!==JSON.stringify(value.snapshot))throw Error("Actual editor schema differs from recorded snapshot");return()=>d.setSnapshot(value.snapshot,{emitUpdate:!1,focus:"none"})},flush:()=>{if(i.isDestroyed)throw Error("An editor closed during capture");''')])

composer='assets/permission-approval-D-GTf91U.js'
edits(composer,[
 ('const auxDraftMigrationInspect=(0,a.useEffectEvent)', '(0,a.useEffect)(()=>{const pending=auxRecoveryComposerPending.current;if(auxDraftMigrationRecoveryApplying()&&pending&&te===pending.attachments&&wt===pending.snapshot.attachments&&Ue===pending.snapshot.plainText)auxRecoveryComposerPending.current=null},[te,wt,Ue]);const auxDraftMigrationInspect=(0,a.useEffectEvent)'),
 ('auxBeginDraftMigrationWork}', 'auxBeginDraftMigrationWork,auxDraftMigrationRecoveryApplying,auxDraftRecoveryDraftForScope}'),
 ('auxDraftSaveFailed=(0,a.useRef)(!1);', 'auxDraftSaveFailed=(0,a.useRef)(!1),auxRecoveryComposerPending=(0,a.useRef)(null);'),
 ('const pe=(c,d=te,x=!1)=>{if(U.current||Z.current!==Y)return;',
  'const pe=(c,d=te,x=!1)=>{if(auxDraftMigrationRecoveryApplying()||U.current||Z.current!==Y)return;'),
 ('"composer",{controller:()=>M.current,inspect:',
  '"composer",{controller:()=>M.current,adoptionSettled:()=>!auxRecoveryComposerPending.current,recoveryScope:()=>j?.recoveryScope??Y,recoveryBase:capture=>({scope:Y,snapshot:Je(auxDraftRecoveryDraftForScope(capture,j?.recoveryScope??Y)),attachments:ue(auxDraftRecoveryDraftForScope(capture,j?.recoveryScope??Y)?.attachments??[],{tabAttachment:B,selectionAttachment:g,suppressedTabTargetIds:L.current,suppressedSelectionRequestKey:Q.current})}),inspect:'),
 ('flush:()=>auxDraftMigrationFlush(),freeze:()=>()=>{}}),[]);',
  '''prepareAdoption:(value,context)=>{const current=auxDraftMigrationInspect();if(value?.scope!==Y||!M.current||JSON.stringify(value.attachments)!==JSON.stringify(te))throw Error("Actual composer scope/attachment ownership differs");if(!context.matched&&!context.baseMatched)throw Error("Fresh composer contains newer state");const snapshot=value.snapshot,attachments=value.attachments;if(!snapshot||typeof snapshot.plainText!=="string"||!Array.isArray(attachments))throw Error("Recorded composer schema is unavailable");const kept=attachments.filter(ne=>ne.type==="file"||ne.type==="directory"||Ee(ne)),record=snapshot.plainText.length||snapshot.attachments.length||kept.length?{version:2,plainText:snapshot.plainText,doc:snapshot.doc,attachments:kept}:null;return()=>{auxRecoveryComposerPending.current={snapshot,attachments};M.current.setSnapshot(snapshot,{emitUpdate:!1,focus:"none"});z.current=snapshot;X.current=record;F({type:"resetScope",initialRichInputSnapshot:snapshot,richInputAttachments:snapshot.attachments,text:snapshot.plainText,attachments})}},flush:()=>auxDraftMigrationFlush(),freeze:()=>()=>{}}),[]);''')])

session='assets/session-composer-Dc0LRfZA.js'
edits(session,[
 ('auxGetNewtabDraftSettingsOwner}', 'auxGetNewtabDraftSettingsOwner,auxDraftMigrationRecoveryApplying,auxDraftRecoverySettingsForScope}'),
 ('[w,I]=(0,g.useState)(()=>Hn(s,o,x)),R=', '[w,I]=(0,g.useState)(()=>Hn(s,o,x)),auxRecoveryOptionsRevision=(0,g.useRef)(0),auxRecoveryOptionsPending=(0,g.useRef)(null),R='),
 ('ye=(0,g.useCallback)(D=>{I($=>', 'ye=(0,g.useCallback)(D=>{auxRecoveryOptionsRevision.current++;I($=>'),
 ('(0,g.useEffect)(()=>{const D=o??null;', '(0,g.useEffect)(()=>{if(auxDraftMigrationRecoveryApplying()){auxRecoveryOptionsPending.current===O&&(auxRecoveryOptionsPending.current=null);R.current=!0;j.current=o??null;return}const D=o??null;'),
 ('"session-owner",{inspect:()=>auxSessionDraftState(),flush:',
  '''"session-owner",{recoveryScope:()=>o??null,adoptionSettled:()=>!auxRecoveryOptionsPending.current,prepareAdoption:(value,context)=>{const current=auxSessionDraftState();if(value?.scope!==current.scope||value?.mode!==current.mode||!value?.settings||value.settings.draftMode==="incognito")throw Error("Actual session option scope/privacy differs");if(!context.matched){const sameBase=capture=>JSON.stringify(O)===JSON.stringify(Hn(auxDraftRecoverySettingsForScope(capture,o),o,x));if(auxRecoveryOptionsRevision.current!==0||!sameBase(context.sourceCapture)&&!sameBase(context.targetCapture))throw Error("Fresh model options contain newer state")}const settings=JSON.parse(JSON.stringify(value.settings)),model=settings.draftModelOverride;if(model&&!Gt(v,model.provider,model.modelId))throw Error("Recorded model is not in the actual available catalog");if(JSON.stringify(value.settings)===JSON.stringify(current.settings))return()=>{};if(typeof i!=="function")throw Error("Options have no actual persistence owner");return()=>{const next={...O,...settings,stateKey:o};auxRecoveryOptionsPending.current=next;I(next)}},inspect:()=>auxSessionDraftState(),flush:'''),
 ('"session-owner",{inspect:()=>auxExistingSessionState(),flush:',
  '''"session-owner",{recoveryScope:()=>n.id,prepareAdoption:value=>{if(JSON.stringify(value)!==JSON.stringify(auxExistingSessionState()))throw Error("Existing session state is backend-owned");return()=>{}},inspect:()=>auxExistingSessionState(),flush:''')])

newtab='assets/newtab-editor-u_GbForB.js'
edits(newtab,[
 ('auxDraftMigrationBlocked}', 'auxDraftMigrationBlocked,auxDraftMigrationRecoveryApplying,auxDraftRecoveryDraftForScope}'),
 ('let auxRestorePending=', 'let auxRecoveryModeRevision=0,auxRecoveryModeReady=!1;let auxRestorePending='),
 ('setMode:e=>{if(auxRestorePending', 'setMode:e=>{auxRecoveryModeReady&&!auxDraftMigrationRecoveryApplying()&&a!==e&&auxRecoveryModeRevision++;if(auxRestorePending'),
 ('}i.flush(),l(!1),a=e,', '}auxDraftMigrationRecoveryApplying()||i.flush(),l(!1),a=e,'),
 ('"newtab",{controller:()=>m,standalone:',
  '"newtab",{controller:()=>m,recoveryScope:()=>auxScope,recoveryBase:capture=>({mode:a,draft:auxDraftRecoveryDraftForScope(capture,auxScope),managed:n.draftPersistenceManaged,snapshot:M(a==="ask"?auxDraftRecoveryDraftForScope(capture,auxScope):null)}),standalone:'),
 ('flush:()=>{if(a==="ask"&&!n.draftPersistenceManaged)',
  '''prepareAdoption:(value,context)=>{if(!auxScope.startsWith("newtab-page:")||value?.managed!==n.draftPersistenceManaged||!C(value?.mode)||JSON.stringify(value.draft?.attachments??[])!==JSON.stringify(i.getDraft()?.attachments??[]))throw Error("Actual New Tab owner/capability differs");if(!context.matched){const stored=capture=>JSON.stringify(i.getDraft())===JSON.stringify(auxDraftRecoveryDraftForScope(capture,auxScope));if(auxRecoveryModeRevision!==0||!stored(context.sourceCapture)&&!stored(context.targetCapture))throw Error("Fresh New Tab contains newer state")}return()=>{i.adoptMemory(value.draft);auxRestorePending=!1;n.setMode(value.mode)}},flush:()=>{if(a==="ask"&&!n.draftPersistenceManaged)'''),
 ('n.setMode(a),r.commands.setTextSelection', 'n.setMode(a),auxRecoveryModeReady=!0,r.commands.setTextSelection')])

mini='assets/minipopup-LkDLFvnq.js'
edits(mini,[
 ('auxDraftMigrationChanged}', 'auxDraftMigrationChanged,auxDraftRecoveryDraftForScope}'),
 ('owner={record:privateContext?', 'let auxRecoveryMiniRevision=0;owner={scope,record:privateContext?'),
 ('set(record){auxDraftMigrationChanged();owner.record=record;',
  'set(record){try{JSON.stringify(record)!==JSON.stringify(owner.record)&&auxRecoveryMiniRevision++}catch{auxRecoveryMiniRevision++}auxDraftMigrationChanged();owner.record=record;'),
 ('"mini",{inspect:', '"mini",{recoveryScope:()=>scope,inspect:'),
 ('flush:()=>owner.set(owner.record),freeze:',
  '''prepareAdoption:(value,context)=>{if(privateContext||value?.scope!==scope||value?.mode!==owner.mode||JSON.stringify(value.record?.attachments??[])!==JSON.stringify(owner.record?.attachments??[]))throw Error("Actual Mini owner/privacy/capability differs");if(!context.matched){const stored=capture=>JSON.stringify(owner.record)===JSON.stringify(auxDraftRecoveryDraftForScope(capture,scope));if(auxRecoveryMiniRevision!==0||!stored(context.sourceCapture)&&!stored(context.targetCapture))throw Error("Fresh Mini contains newer state")}return()=>{owner.record=value.record;if(context.goal==="target"&&JSON.stringify(auxDraftRecoveryDraftForScope(context.capture,scope))===JSON.stringify(owner.record))window.removeEventListener("beforeunload",unload)}},flush:()=>owner.set(owner.record),freeze:'''),
 ('defaultDraftState:{draftMode:auxDraft.mode}})', 'defaultDraftState:{draftMode:auxDraft.mode},defaultDraftStateKey:auxDraft.scope})'),
 ('()=>({defaultDraftRecord:auxDraft.record,onDraftRecordChange:l})', '()=>({recoveryScope:auxDraft.scope,defaultDraftRecord:auxDraft.record,onDraftRecordChange:l})')])

provider='assets/provider-Cw0zhujt.js'
edits(provider,[
 ('"chat-client",{inspect:', '"chat-client",{recoveryScope:()=>this.#c,prepareAdoption:value=>{if(JSON.stringify(value)!==JSON.stringify({sessionId:this.#c,status:this.#o().status}))throw Error("Chat task/stream state remains backend-owned");return()=>{}},inspect:')])

# Rich editor base snapshots are obtained from its actual registered manager,
# not an arbitrary supplied selector or a guessed lone editor.
before='''      const context={scope,matched,sourceCapture,targetCapture,capture,goal:plan.desired};
      const apply=ticket.owner.prepareAdoption(desired.state,context);'''
after='''      const bases=[sourceCapture,targetCapture].map(value=>ticket.owner.recoveryBase?.(value));
      const baseMatched=bases.some(value=>value&&JSON.stringify(value)===current);
      let richBase=null;
      if(ticket.kind==="rich-editor"){
        const controller=ticket.owner.controller?.(),managers=entries.filter(value=>value.kind==="composer"&&value.owner.controller?.()===controller||value.kind==="newtab"&&value.owner.standalone?.()&&value.owner.controller?.()===controller);
        if(managers.length!==1)throw Error("Actual editor manager correspondence differs");
        for(const value of [sourceCapture,targetCapture]){
          const candidate=managers[0].owner.recoveryBase?.(value)?.snapshot;
          if(candidate&&JSON.stringify(candidate)===JSON.stringify(JSON.parse(current).snapshot))richBase=candidate;
        }
      }
      const context={scope,matched,baseMatched,richBase,sourceCapture,targetCapture,capture,goal:plan.desired};
      const apply=ticket.owner.prepareAdoption(desired.state,context);'''
assert runtime.count(before)==1
runtime=runtime.replace(before,after)
# Apply the same concrete runtime delta inside the full supplied codec output.
edits(codec,[(before,after)])
(HERE/'runtime-output.js.txt').write_text(runtime)
# React registry callbacks must read the current committed hook owner, never
# close over the first render's actor scope, attachments, model or catalog.
react_wrappers={
 composer:('a','auxRecoveryComposer',[
  ('recoveryScope:()=>j?.recoveryScope??Y', 'Scope', '()=>j?.recoveryScope??Y'),
  ('recoveryBase:capture=>({scope:Y,snapshot:Je(auxDraftRecoveryDraftForScope(capture,j?.recoveryScope??Y)),attachments:ue(auxDraftRecoveryDraftForScope(capture,j?.recoveryScope??Y)?.attachments??[],{tabAttachment:B,selectionAttachment:g,suppressedTabTargetIds:L.current,suppressedSelectionRequestKey:Q.current})})', 'Base', 'capture=>({scope:Y,snapshot:Je(auxDraftRecoveryDraftForScope(capture,j?.recoveryScope??Y)),attachments:ue(auxDraftRecoveryDraftForScope(capture,j?.recoveryScope??Y)?.attachments??[],{tabAttachment:B,selectionAttachment:g,suppressedTabTargetIds:L.current,suppressedSelectionRequestKey:Q.current})})')]),
 session:('g','auxRecoverySession', [('recoveryScope:()=>o??null','Scope','()=>o??null')]),
}
for path,(react,name,functions) in react_wrappers.items():
 preview=(HERE/'inputs'/path).read_text()
 for before,after in changes[path]:
  assert preview.count(before)==1,(path,before[:80],preview.count(before))
  preview=preview.replace(before,after)
 start='prepareAdoption:(value,context)=>{const current=auxDraftMigrationInspect();' if path==composer else 'prepareAdoption:(value,context)=>{const current=auxSessionDraftState();'
 end='},flush:()=>auxDraftMigrationFlush()' if path==composer else '},inspect:()=>auxSessionDraftState()'
 first=preview.index(start);last=preview.index(end,first)
 adopter=preview[first:last+1]
 functions.append((adopter,'Adopt',adopter[len('prepareAdoption:'):]))
 declarations=[]
 for before,suffix,fn in functions:
  identifier=name+suffix
  params='value,context' if suffix=='Adopt' else 'capture' if suffix=='Base' else ''
  replacement='prepareAdoption:(value,context)=>'+identifier+'(value,context)' if suffix=='Adopt' else ('recoveryBase:capture=>'+identifier+'(capture)' if suffix=='Base' else 'recoveryScope:()=>'+identifier+'()')
  edits(path,[(before,replacement)])
  declarations.append('const '+identifier+'=(0,'+react+'.useEffectEvent)('+fn+');')
 anchor='(0,a.useLayoutEffect)(()=>auxRegisterDraftMigrationOwner("composer",' if path==composer else '(0,g.useLayoutEffect)(()=>auxRegisterDraftMigrationOwner("session-owner",{recoveryScope:()=>auxRecoverySessionScope(),'
 edits(path,[(anchor,''.join(declarations)+anchor)])
# Existing-session metadata is also a live committed owner, never a stale n.
edits(session,[('"session-owner",{recoveryScope:()=>n.id,prepareAdoption:value=>{if(JSON.stringify(value)!==JSON.stringify(auxExistingSessionState()))throw Error("Existing session state is backend-owned");return()=>{}},inspect:',
 '"session-owner",{recoveryScope:()=>auxExistingRecoveryScope(),prepareAdoption:value=>auxExistingRecoveryAdopt(value),inspect:'),
 ('(0,g.useLayoutEffect)(()=>auxRegisterDraftMigrationOwner("session-owner",{recoveryScope:()=>auxExistingRecoveryScope(),',
 'const auxExistingRecoveryScope=(0,g.useEffectEvent)(()=>n.id),auxExistingRecoveryAdopt=(0,g.useEffectEvent)(value=>{if(JSON.stringify(value)!==JSON.stringify(auxExistingSessionState()))throw Error("Existing session state is backend-owned");return()=>{}});(0,g.useLayoutEffect)(()=>auxRegisterDraftMigrationOwner("session-owner",{recoveryScope:()=>auxExistingRecoveryScope(),')])
for item in baseline['files']:
 path=item['path'];original=(HERE/'inputs'/path).read_bytes();assert sha(original)==item['inputSha256']
 text=original.decode();anchors=[]
 for before,after in changes.get(path,[]):
  assert text.count(before)==1,(path,before[:110],text.count(before))
  text=text.replace(before,after);anchors.append({'find':before,'replace':after,'count':1})
 out=HERE/'source'/path;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(text)
 rows.append({'path':path,'input':str(HERE/'inputs'/path),'inputSha256':sha(original),'outputSha256':sha(text.encode()),'output':str(out),'anchors':anchors,'unchangedPinned':not anchors})
 diff=difflib.unified_diff(original.decode().splitlines(True),text.splitlines(True),fromfile='a/'+path,tofile='b/'+path)
 for line in diff:patch.append(line if line.endswith('\n') else line+'\n\\ No newline at end of file\n')
(HERE/'source-plan.json').write_text(json.dumps({'format':'aux.ui-recovery-owner-adoption.source.v1','baselineCommit':baseline['commit'],'files':rows,'runtimeInputSha256':baseline['runtimeSha256'],'runtimeOutputSha256':sha(runtime.encode()),'activeAdaptersChanged':False,'productExecuted':False,'runtimeAcceptance':False},indent=2)+'\n')
(HERE/'modules.patch').write_text(''.join(patch))
(HERE/'adapter-delta-request.json').write_text(json.dumps({'format':'aux.ui-recovery-owner-adoption.adapter-request.v1','baselineCommit':baseline['commit'],'sourcePlan':'source-plan.json','runtimeReplacement':'runtime-output.js.txt','activeAdapterOwner':'root','exportsAdded':['auxAdoptDraftMigrationRecovery','auxReadDraftMigrationRecoveryAdoption','auxHandoffDraftMigrationRecovery','auxReadDraftMigrationRecoveryHandoff','auxDraftMigrationRecoveryApplying','auxDraftRecoveryDraftForScope','auxDraftRecoverySettingsForScope'],'note':'Recompose only exact counted module deltas over pinned A23; preserve original source/predecessor and class/CSS rules. No active adapter edited by this lane.'},indent=2)+'\n')
print(json.dumps({'modules':len(rows),'changedModules':sum(bool(row['anchors']) for row in rows),'countedAnchors':sum(len(row['anchors']) for row in rows)}))
