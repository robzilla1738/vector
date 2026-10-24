from pathlib import Path
import json,hashlib
here=Path('docs/integration/proposed/standard-profile-isolation/ui-editor-writer-closure-a1')
snapshot=Path('/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/agent')
prior=Path('/private/tmp/aux-feature-completion-ui-stage-20261024-a2/agent')
sha=lambda b:hashlib.sha256(b).hexdigest()
runtime=Path('vendor/provided/aux-ui-draft-closure-runtime.js.txt')
files=[]
def entry(name,rules):
 original=(snapshot/name).read_bytes();previous=(prior/name).read_bytes();text=previous.decode()
 edits=[]
 for find,replace in rules:
  assert text.count(find)==1,(name,find[:100],text.count(find))
  text=text.replace(find,replace)
  edits.append({'find':find,'replace':replace,'count':1})
 files.append({'path':name,'sourceSha256':sha(original),'predecessorSha256':sha(previous),'rules':edits})
entry('assets/draft-storage-ixLojjZ5.js',[
 ('function U(e,n){if(!(typeof window>"u"))try{const t=g(e);if(!t?.message||t.sessionId!==e||t.claimId!==n)return;d()}catch{d()}}', 'function U(e,n){if(!(typeof window>"u"))try{const t=g(e);if(!t?.message||t.sessionId!==e||t.claimId!==n)return;auxRememberDraftClaimAcknowledgement(t);d()}catch{d()}}'),
 ('auxWriteScope=auxDurable;if(auxDurable?!o:!r)', 'auxWriteScope=auxDurable;if(auxDraftMigrationBlocked())throw new Error("Aux draft capture is holding this document");if(auxDurable?!o:!r)'),
 ('draftProjectId:n.draftProjectId});t.setItem(auxKey,auxRaw);','draftProjectId:n.draftProjectId});if(auxDraftMigrationBlocked())throw new Error("Aux draft capture is holding this document");t.setItem(auxKey,auxRaw);'),
 ('function H(e){if(typeof window>"u")return null;','function H(e){if(typeof window>"u"||auxDraftMigrationBlocked())return null;'),
 ('function S(e){a=e;try{window.sessionStorage.setItem(m,JSON.stringify(e));','function S(e){a=e;try{if(auxDraftMigrationBlocked())throw new Error("Aux draft capture is holding this document");window.sessionStorage.setItem(m,JSON.stringify(e));'),
 ('function d(){a=null;try{window.sessionStorage.removeItem(m);','function d(){a=null;try{if(auxDraftMigrationBlocked())throw new Error("Aux draft capture is holding this document");window.sessionStorage.removeItem(m);'),
 ('export{k as a,W as c,F as i,J as l,U as n,$ as o,b as r,X as s,H as t,j as u,auxCaptureDraftMigration};', '__AUX_CLOSURE_RUNTIME__\nexport{k as a,W as c,F as i,J as l,U as n,$ as o,b as r,X as s,H as t,j as u,auxCaptureDraftMigration,auxPrepareDraftMigrationCapture,auxValidateDraftMigrationCapture,auxSealDraftMigrationCapture,auxObserveDraftMigrationTarget,auxReadDraftMigrationCapture,auxReleaseDraftMigrationCapture,auxRegisterDraftMigrationOwner,auxBeginDraftMigrationWork,auxDraftMigrationBlocked,auxDraftMigrationChanged,auxGetNewtabDraftSettingsOwner};'),
])
entry('assets/create-editor-B-Br5Wz9.js',[
 ('import{i as $}from"./platform-CX_yPATJ.js";', 'import{auxRegisterDraftMigrationOwner,auxDraftMigrationChanged}from"./draft-storage-ixLojjZ5.js";import{i as $}from"./platform-CX_yPATJ.js";'),
 ('function ye(t,e,n={}){let s=!1,r=0,o=0;', 'function ye(t,e,n={}){let auxRetireDraftEditor=null;let s=!1,r=0,o=0;'),
 ('onUpdate:()=>{if(e.composition.isComposing', 'onUpdate:()=>{auxDraftMigrationChanged();if(e.composition.isComposing'),
 ('onDestroy:()=>{a(),s=!1,e.callbacks.onControllerChange?.(null)}', 'onDestroy:()=>{auxRetireDraftEditor?.(),auxRetireDraftEditor=null,a(),s=!1,e.callbacks.onControllerChange?.(null)}'),
 ('return e.callbacks.onControllerChange?.(d),{editor:i,controller:d}', '''auxRetireDraftEditor=auxRegisterDraftMigrationOwner("rich-editor",{controller:()=>d,element:()=>i.isDestroyed?null:i.view.dom,inspect:()=>{if(i.isDestroyed||e.composition.isComposing||i.view.composing)throw Error("An editor is composing or unavailable");return{snapshot:d.getSnapshot(),editable:i.isEditable}},flush:()=>{if(i.isDestroyed)throw Error("An editor closed during capture");return e.callbacks.onChange?.(d.getSnapshot())},freeze:()=>{if(i.isDestroyed)throw Error("An editor closed during capture");const editable=i.isEditable;i.setEditable(!1,!1);return()=>{if(!i.isDestroyed)i.setEditable(editable&&!e.root.disabled,!1)}}});return e.callbacks.onControllerChange?.(d),{editor:i,controller:d}'''),
])
entry('assets/file-attachments-D5m1O8aA.js',[
 ('import{n}from"./dist-LyKrHgST.js";', 'import{auxBeginDraftMigrationWork}from"./draft-storage-ixLojjZ5.js";import{n}from"./dist-LyKrHgST.js";'),
 ('async function _(e){','async function auxReadAttachmentOriginal(e){'),
 ('export{f as a,h as i,w as n,_ as r,u as t};', 'async function _(e){const done=auxBeginDraftMigrationWork("file-read");try{return await auxReadAttachmentOriginal(e)}finally{done()}}export{f as a,h as i,w as n,_ as r,u as t};'),
])
entry('assets/permission-approval-D-GTf91U.js',[
 ('import{A as Et,C as N,E as Tt,w as Dt}', 'import{auxRegisterDraftMigrationOwner,auxBeginDraftMigrationWork}from"./draft-storage-ixLojjZ5.js";import{A as Et,C as N,E as Tt,w as Dt}'),
 ('xe=(0,a.useEffectEvent)(async(c={})=>{if(K)return;', 'xe=(0,a.useEffectEvent)(async(c={})=>{const auxFinishSubmit=auxBeginDraftMigrationWork("composer-submit");try{if(K)return;'),
 ('he(H),r(H),le(d)}}),ge=async c=>', 'he(H),r(H),le(d)}}catch(error){auxFinishSubmit(!0);throw error}finally{auxFinishSubmit()}}),ge=async c=>'),
 ('$e=()=>M.current?.getSnapshot().plainText??z.current.plainText;return(0,n.jsx)(lt,', '''$e=()=>M.current?.getSnapshot().plainText??z.current.plainText;const auxDraftMigrationInspect=(0,a.useEffectEvent)(()=>{if(ee.current||ze.length||auxFileUnload.current||oe.current||G.current!==null||ae.current||ce.current.length||q.current||U.current||w||t==="streaming"||Z.current!==Y)throw Error("Composer attachment, response or message work is still active");if(typeof je!=="function")throw Error("Composer draft persistence is unavailable");return{scope:Y,snapshot:M.current?.getSnapshot()??z.current,attachments:te}}),auxDraftMigrationFlush=(0,a.useEffectEvent)(()=>{auxDraftMigrationInspect();return pe(M.current?.getSnapshot()??z.current,te,!0)});(0,a.useLayoutEffect)(()=>auxRegisterDraftMigrationOwner("composer",{controller:()=>M.current,inspect:()=>auxDraftMigrationInspect(),flush:()=>auxDraftMigrationFlush(),freeze:()=>()=>{}}),[]);return(0,n.jsx)(lt,'''),
])
entry('assets/newtab-editor-u_GbForB.js',[
 ('import{i as x,l as P,r as D}from"./draft-storage-ixLojjZ5.js";', 'import{i as x,l as P,r as D,o as auxReadNewtabDraftSettings,u as auxWriteNewtabDraftSettings,auxRegisterDraftMigrationOwner,auxDraftMigrationBlocked}from"./draft-storage-ixLojjZ5.js";'),
 ('window.__auxNewTabEditor=n,s.callbacks.onChange=', '''window.__auxNewTabEditor=n;const auxRetireNewtab=auxRegisterDraftMigrationOwner("newtab",{controller:()=>m,standalone:()=>!n.draftPersistenceManaged,sessionSettings:{scope:auxScope,read:()=>auxReadNewtabDraftSettings(auxScope),write:value=>auxWriteNewtabDraftSettings(auxScope,value)},inspect:()=>{if(n.pendingFiles.length||n.pendingAsk||u||a==="search"&&!r.isEmpty)throw Error("New Tab has unfinished files, submission or search text");return{mode:a,draft:i.getDraft(),managed:n.draftPersistenceManaged}},flush:()=>{if(a==="ask"&&!n.draftPersistenceManaged){const snapshot=m.getSnapshot();i.write({version:2,plainText:snapshot.plainText,doc:snapshot.doc,attachments:i.getDraft()?.attachments},!0)}return i.flush()},freeze:()=>()=>{}});window.addEventListener("pagehide",auxRetireNewtab,{once:!0});s.callbacks.onChange='''),
 ('s.submit.onSubmit=()=>{if(i.flush(),a==="search")', 's.submit.onSubmit=()=>{if(auxDraftMigrationBlocked())return;if(i.flush(),a==="search")'),
])
entry('assets/minipopup-LkDLFvnq.js',[
 ('import{i as auxReadMiniDraft,l as auxWriteMiniDraft}from"./draft-storage-ixLojjZ5.js";', 'import{i as auxReadMiniDraft,l as auxWriteMiniDraft,auxRegisterDraftMigrationOwner,auxDraftMigrationChanged}from"./draft-storage-ixLojjZ5.js";'),
 ('set(record){owner.record=record;','set(record){auxDraftMigrationChanged();owner.record=record;'),
 ('auxMiniDraftOwners.set(accountId,owner);return owner', '''auxMiniDraftOwners.set(accountId,owner);auxRegisterDraftMigrationOwner("mini",{inspect:()=>{if((privateContext||owner.mode==="incognito")&&(owner.record?.plainText?.length||owner.record?.attachments?.length))throw Error("A private Mini draft must remain in its current view");return{scope,mode:owner.mode,record:owner.record}},flush:()=>owner.set(owner.record),freeze:()=>()=>{}});return owner'''),
])
entry('assets/session-composer-Dc0LRfZA.js',[
 ('defaultDraftStateKey:o,onDraftStateChange:i,getCreateSessionInput:c})=>{const{accountId:l}=ge()', 'defaultDraftStateKey:o,onDraftStateChange:i,getCreateSessionInput:c})=>{const auxNewtabSettings=auxGetNewtabDraftSettingsOwner();if(auxNewtabSettings){s??=auxNewtabSettings.read();o??=auxNewtabSettings.scope;i??=auxNewtabSettings.write}const{accountId:l}=ge()'),
 ('import{c as Qr,i as Fl,l as Ll}from"./draft-storage-ixLojjZ5.js";', 'import{c as Qr,i as Fl,l as Ll,auxRegisterDraftMigrationOwner,auxBeginDraftMigrationWork,auxGetNewtabDraftSettingsOwner}from"./draft-storage-ixLojjZ5.js";'),
 ('},[_,ye]),L=(0,g.useCallback)(D=>{ye({draftProjectId:D})},[ye]);return{createSessionMutation:y,', '''},[_,ye]),L=(0,g.useCallback)(D=>{ye({draftProjectId:D})},[ye]);const auxSessionDraftState=(0,g.useEffectEvent)(()=>{if(N.current||F)throw Error("Session creation or attachment upload is still active");if(E==="incognito")throw Error("A private session draft must remain in its current view");if(typeof i!=="function"&&JSON.stringify(O)!==JSON.stringify(Hn(s,o,x)))throw Error("Unsaved session options have no supported serializer");return{scope:o??null,mode:E,settings:{draftModelOverride:he,draftPermissionMode:O.draftPermissionMode,draftRuntimeConfig:_,draftMode:se,draftProjectId:U}}}),auxSessionDraftFlush=(0,g.useEffectEvent)(()=>{const state=auxSessionDraftState();return i?.(state.settings)});(0,g.useLayoutEffect)(()=>auxRegisterDraftMigrationOwner("session-owner",{inspect:()=>auxSessionDraftState(),flush:()=>auxSessionDraftFlush(),freeze:()=>()=>{}}),[]);return{createSessionMutation:y,'''),
 ('handleCreateAndSend:(0,g.useCallback)(async D=>{if(!(fe||N.current)){N.current=!0;', 'handleCreateAndSend:(0,g.useCallback)(async D=>{const auxFinishCreate=auxBeginDraftMigrationWork("session-create");let auxCreateAttempted=!1,auxCreateSettled=!1;try{if(!(fe||N.current)){auxCreateAttempted=!0;N.current=!0;'),
 ('h.invalidateQueries(u.sessions.listPreviewItems.infiniteQueryFilter({accountId:l}))}catch($)', 'h.invalidateQueries(u.sessions.listPreviewItems.infiniteQueryFilter({accountId:l})),auxCreateSettled=!0}catch($)'),
 ('finally{N.current=!1}}},[y,k,M,X,fe,E,ae,U,_,c,e,t,h,l,n,u])', 'finally{N.current=!1}}}finally{auxFinishCreate(auxCreateAttempted&&!auxCreateSettled)}},[y,k,M,X,fe,E,ae,U,_,c,e,t,h,l,n,u])'),
 ('m=p=>{!o||i||c(p)};return(0,a.jsx)(Vo,{session:{submitDisabled:u||!h,notice:d}', '''m=p=>{!o||i||c(p)};const auxExistingSessionState=(0,g.useEffectEvent)(()=>{if(n.incognito||t?.value==="incognito")throw Error("A private session must remain in its current view");return{sessionId:n.id,mode:t?.value??"default"}});(0,g.useLayoutEffect)(()=>auxRegisterDraftMigrationOwner("session-owner",{inspect:()=>auxExistingSessionState(),flush:()=>{},freeze:()=>()=>{}}),[]);return(0,a.jsx)(Vo,{session:{submitDisabled:u||!h,notice:d}'''),
])
entry('assets/provider-Cw0zhujt.js',[
 ('import{a as ga,n as Ze,s as Vt,t as ya}from"./draft-storage-ixLojjZ5.js";', 'import{a as ga,n as Ze,s as Vt,t as ya,auxRegisterDraftMigrationOwner,auxBeginDraftMigrationWork,auxDraftMigrationBlocked}from"./draft-storage-ixLojjZ5.js";'),
 ('#m=new Si;#f=null;constructor(e){', '#m=new Si;#f=null;#auxRetireDraftClient=null;constructor(e){'),
 ('onClose:t=>this.#Y(t)}),this.#U()}#U(){', '''onClose:t=>this.#Y(t)}),this.#U(),this.#auxRetireDraftClient=auxRegisterDraftMigrationOwner("chat-client",{inspect:()=>{if(this.#r||this.#x||this.#v||this.#N||this.#d.pendingPromise||this.#S!==null||this.#b!==null||this.#p!==null||this.#C||this.#t)throw Error("Chat command, stream or publication is still active");return{sessionId:this.#c,status:this.#o().status}},flush:()=>{},freeze:()=>()=>{}})}#U(){'''),
 ('dispose(){this.#u.reset(),this.#m.reset(),', 'dispose(){this.#auxRetireDraftClient?.(),this.#auxRetireDraftClient=null,this.#u.reset(),this.#m.reset(),'),
 ('sendMessage=async e=>{if(this.#r)', 'sendMessage=async e=>{if(auxDraftMigrationBlocked())throw Error("Aux draft capture is holding this document");if(this.#r)'),
 ('reconnectToStream=async({isRetry:e=!1,suppressErrorHandling:t=!1}={})=>{if(!(', 'reconnectToStream=async({isRetry:e=!1,suppressErrorHandling:t=!1}={})=>{if(auxDraftMigrationBlocked())throw Error("Aux draft capture is holding this document");if(!('),
 ('async#w(e,t=crypto.randomUUID()){if(await this.#i.connect()', 'async#w(e,t=crypto.randomUUID()){const auxFinishCommand=auxBeginDraftMigrationWork("chat-command");let auxCommandAttempted=!1,auxCommandAcknowledged=!1;try{if(await this.#i.connect()'),
 ('this.#i.send(JSON.stringify(a))}catch(a){this.#d.reject(a instanceof Error?a:new Error(String(a)))}await s.promise}#q(e){', 'auxCommandAttempted=!0,this.#i.send(JSON.stringify(a))}catch(a){this.#d.reject(a instanceof Error?a:new Error(String(a)))}await s.promise,auxCommandAcknowledged=!0}finally{auxFinishCommand(auxCommandAttempted&&!auxCommandAcknowledged)}}#q(e){'),
])

(here/'inputs.json').write_text(json.dumps({'format':'aux.ui-editor-writer-closure.inputs.v1','baselineCommit':'130acfb8c','predecessorStage':str(prior),'runtimeSha256':sha(runtime.read_bytes()),'files':files},indent=2)+'\n')
print(json.dumps({'files':len(files),'anchors':sum(len(f['rules']) for f in files)}))
