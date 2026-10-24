"""Pin exact actual worker sites; never read owner state or modify a stage."""
from pathlib import Path
import json,hashlib
HERE=Path(__file__).resolve().parent
ROOT=Path('/Users/rcourson/Documents/Vibe/web')
PRIOR=Path('/private/tmp/aux-feature-completion-ui-stage-20261024-a2/agent/background.js')
ORIGINAL=ROOT/'out/provided-source-snapshot-1.26.1016.1852/agent/background.js'
# Worktree root is derived from this owned proposal, never the owner's data home.
RUNTIME=Path(__file__).resolve().parents[5]/'vendor/provided/aux-ui-background-writer-runtime.js.txt'
sha=lambda x:hashlib.sha256(x).hexdigest()
text=PRIOR.read_text();rules=[]
def change(find,replace,count=1):
 global text
 assert text.count(find)==count,(find[:100],text.count(find),count)
 text=text.replace(find,replace)
 rules.append({'find':find,'replace':replace,'count':count})
# Finite native Promise/callback sites; no API object monkey-patching.
change('chrome.storage.local.set(', 'auxWorkerStorageLocalSet(',4)
change('chrome.storage.local.remove(', 'auxWorkerStorageLocalRemove(',2)
change('chrome.alarms.create(', 'auxWorkerAlarmCreate(',4)
change('chrome.contextMenus.removeAll()', 'auxWorkerPhysical("chrome-context-menu-remove",()=>chrome.contextMenus.removeAll())')
change('chrome.history.deleteUrl({ url: i.url })', 'auxWorkerPhysical("chrome-history-delete",()=>chrome.history.deleteUrl({url:i.url}))')
change('t()?.local?.remove(e.key)', 'auxWorkerPhysical("chrome-local-remove",()=>t()?.local?.remove(e.key))')
change('t()?.session?.remove(e.key)', 'auxWorkerPhysical("chrome-session-remove",()=>t()?.session?.remove(e.key))',2)
change('t()?.session?.set({ [e.key]: i })', 'auxWorkerPhysical("chrome-session-set",()=>t()?.session?.set({[e.key]:i}))')
change('Ps(async () => t.signDaemonAuthChallenge(e),', 'Ps(async () => auxWorkerPhysical("native-auth-sign",()=>t.signDaemonAuthChallenge(e)),')
change('''  const n = chrome.runtime.sendMessage(La, {
    ...t,
    command: e
  }), o =''','''  const n = auxWorkerPhysical("password-extension-message",()=>chrome.runtime.sendMessage(La, {
    ...t,
    command: e
  })), o =''')
change('chrome.sidePanel.open({ tabId: i.id })', 'auxWorkerPhysical("remix-sidepanel-open",()=>chrome.sidePanel.open({tabId:i.id}))')
change('fetchDaemon: v,','fetchDaemon: (request,options)=>auxWorkerPhysical("daemon-fetch",()=>v(request,options),false),')
change('resolve: g,','resolve: ()=>auxWorkerPhysical("daemon-auth-resolve",g,false),')
change('''    connectWebsocketToDaemon: async (b) => {
      const S =''','''    connectWebsocketToDaemon: (b) => auxWorkerPhysical("daemon-websocket",async()=>{
      const S =''')
change('''      return new WebSocket(As(b), `aux.daemon.auth.${A}`);
    }
''','''      return new WebSocket(As(b), `aux.daemon.auth.${A}`);
    },false)
''')
# Logical entry points defer new jobs; their existing original bodies stay exact.
for signature,alias,kind,mode in [
 ('function ji(e) {','auxWorkerOriginalHistoryCleanup','history-cleanup','produce'),
 ('function dw() {','auxWorkerOriginalMetadataSync','metadata-sync','produce'),
 ('async function bb() {','auxWorkerOriginalRemixInit','remix-init','produce'),
 ('async function Sb(e) {','auxWorkerOriginalRemixSync','remix-sync','produce'),
 ('async function vb(e,t,r){','auxWorkerOriginalRemixPrompt','remix-prompt','produce'),
 ('async function Er(e, t, r = {}) {','auxWorkerOriginalContextSignal','context-signal','produce'),
 ('async function Pb() {','auxWorkerOriginalActiveTabSync','active-tab-sync','physical'),
 ('async function We(e, t) {','auxWorkerOriginalTabCapture','tab-capture','physical'),
 ('async function fc(e, t = Bn(), r) {','auxWorkerOriginalTranslate','translate','physical'),
 ('async function ic(e, t) {','auxWorkerOriginalOpenNotification','notification-open','physical'),
 ('function Hg({ id: e, ...t }) {','auxWorkerOriginalContextMenu','chrome-context-menu','physical')]:
 name=signature.split('function ',1)[1].split('(',1)[0]
 renamed=signature.replace('function '+name+'(', 'function '+alias+'(')
 call='auxWorkerProduce' if mode=='produce' else 'auxWorkerPhysical'
 change(signature,f'function {name}(...args){{return {call}("{kind}",()=>{alias}(...args))}}\n'+renamed)
# These queue callbacks include the actual native scripting publication replies.
change('''function Sc(e) {
  const t = Hi.then(e);''','''function Sc(e) {
  return auxWorkerPhysical("content-script-queue",()=>auxWorkerOriginalContentScripts(e));
}
function auxWorkerOriginalContentScripts(e) {
  const t = Hi.then(e);''')
change('''function fb(e) {
  const t = Qi.then(e);''','''function fb(e) {
  return auxWorkerPhysical("user-script-queue",()=>auxWorkerOriginalUserScripts(e));
}
function auxWorkerOriginalUserScripts(e) {
  const t = Qi.then(e);''')
# Context-menu tail must remain tracked through its genuine callbacks, not the
# old void enqueue return; native errors remain unknown even if original logs.
change('''function Vt(e = !1) {
  li = li.catch(() => {''','''function Vt(e = !1) {
  return auxWorkerProduce("context-menu-rebuild",()=>{
  li = li.catch(() => {''')
change('''    console.error("[ContextMenus] Failed to register context menus.", t);
  });
}
async function Vg''','''    auxWorkerNoteUnknown("context-menu-rebuild");
    console.error("[ContextMenus] Failed to register context menus.", t);
  });return li;
  });
}
async function Vg''')
# Actual native callback style, including lastError read inside the callback.
change('''async function py(e, t) {
  return new Promise((r, n) => {''','''async function py(e, t) {
  return auxWorkerPhysical("chrome-privacy-setting",()=>new Promise((r, n) => {''')
change('''      r();
    });
  });
}
async function my()''','''      r();
    });
  }));
}
async function my()''')
# Bridge connection work stays retained even when the original connect field
# is cleared. Child callbacks may finish while prepare drains admitted work.
change('''  async ensureConnected(e = {}) {
    const t =''','''  ensureConnected(e={}) {return auxWorkerPhysical("bridge-connect",()=>this.auxWorkerEnsureConnected(e),false)}
  async auxWorkerEnsureConnected(e = {}) {
    const t =''')
# Only parsed run commands defer. Ping and genuine cancellation stay usable;
# deferred cancellation never dispatches the physical command.
change('''      this.runningCommands.get(a.data.id)?.abort(/* @__PURE__ */ new Error(`Extension command cancelled: ${a.data.id}`));''','''      const auxCancelError=new Error(`Extension command cancelled: ${a.data.id}`);
      if(!auxWorkerCancelDeferred("bridge-command",a.data.id,t,auxCancelError))this.runningCommands.get(a.data.id)?.abort(auxCancelError);''')
change('''    const l = await this.#i();
    if (!n()) return;
    if (u.data.route.accountId''','''    return auxWorkerProduce("bridge-command",async()=>{
    const l = await this.#i();
    if (!n()) return;
    if (u.data.route.accountId''')
change('''    } catch (d) {
      o({
        id: u.data.id,''','''    } catch (d) {
      auxWorkerNoteUnknown("bridge-command");
      o({
        id: u.data.id,''')
change('''      this.runningCommands.get(u.data.id) === f && this.runningCommands.delete(u.data.id);
    }
  }
  #n(e)''','''      this.runningCommands.get(u.data.id) === f && this.runningCommands.delete(u.data.id);
    }
    },{key:u.data.id,owner:t,onCancelled:error=>o({id:u.data.id,result:null,error:String(error?.message??error)})});
  }
  #n(e)''')
change('''function Jv() {
  _n += 1, ar = null;''','''function Jv() {
  auxWorkerContextChanged();
  _n += 1, ar = null;''')
# Observe a real async main result if the actual owner ever returns one.
change('''  e && typeof e.then == "function" && console.warn("[broquer] background main() should register listeners synchronously.");''','''  e && typeof e.then == "function" && (auxWorkerPhysical("background-main",()=>e),console.warn("[broquer] background main() should register listeners synchronously."));''')
# Fixed native listener installs BEFORE any startup producer can run; completion
# is registered only after this exact entire background module initialized.
change('''//# chunkId=ddda0258-b2d8-5731-95f2-6689ea8d2cfd''','''auxWorkerInstallInspector(()=>{
  if(typeof ServiceWorkerGlobalScope==="undefined"||typeof window!=="undefined")throw Error("Canonical MV3 worker context required");
  if([..._r].some(stream=>stream.targetId||stream.visible))throw Error("Tab capture subscribers are still active");
});
//# chunkId=ddda0258-b2d8-5731-95f2-6689ea8d2cfd''')
rules.append({'find':PRIOR.read_text().splitlines(True)[0],'replace':'__AUX_WORKER_RUNTIME__\n'+PRIOR.read_text().splitlines(True)[0],'count':1})
(HERE/'inputs.json').write_text(json.dumps({'format':'aux.ui-background-writer-closure.inputs.v1','baselineCommit':'e9ff86849','path':'background.js',
 'originalSha256':sha(ORIGINAL.read_bytes()),'predecessor':str(PRIOR),'predecessorSha256':sha(PRIOR.read_bytes()),
 'runtimeSha256':sha(RUNTIME.read_bytes()),'rules':rules},indent=2)+'\n')
print(json.dumps({'rules':len(rules),'literalMatches':sum(r['count'] for r in rules),'nativeOrProductExecuted':False}))
