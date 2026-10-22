/** Keep supplied draft storage/format; commit edits before native profile teardown. */
export function transformProvidedDraftFlush({ component, path, text }) {
  if (component !== 'agent') return { text, anchors: [] };
  const replaceOne = (find, replacement) => {
    if (text.split(find).length - 1 !== 1)
      throw new Error(`Supplied draft identity anchor changed: ${path}`);
    return { text: text.replace(find, replacement),
      anchors: [{ kind: 'integration', find, replace: replacement, count: 1 }] };
  };
  if (path === 'assets/minipopup-LkDLFvnq.js') {
    // A real singleton scope, isolated by the extension's actual Profile store.
    // Private mode never writes its draft; enter it only after removing copies.
    const edits = [
      ['import{u as f}from"./browser-binding-CzDmxQNA.js";',
       'import{u as f}from"./browser-binding-CzDmxQNA.js";import{i as auxReadMiniDraft,l as auxWriteMiniDraft}from"./draft-storage-ixLojjZ5.js";'],
      ['k=null,is=({onHeightChange:s,onSessionChange:n})=>',
       'k=auxReadMiniDraft(void 0,"mini-popup:new"),auxMiniPopupDraftMode="default",auxMiniPopupDraftUnload=e=>{e.preventDefault(),e.returnValue=""},auxSetMiniPopupDraft=a=>{k=a;const saved=auxMiniPopupDraftMode==="incognito"||auxWriteMiniDraft(void 0,a,"mini-popup:new")===!0;if(!saved||auxMiniPopupDraftMode==="incognito"&&(a?.plainText?.length||a?.attachments?.length))window.addEventListener("beforeunload",auxMiniPopupDraftUnload);else window.removeEventListener("beforeunload",auxMiniPopupDraftUnload);return saved},auxSetMiniPopupMode=a=>{if(a!=="default"&&a!=="incognito")return!1;if(a==="incognito"&&auxWriteMiniDraft(void 0,null,"mini-popup:new")!==!0){Z.error("Could not remove the saved draft. Keep this window open and try again before entering incognito.");return!1}auxMiniPopupDraftMode=a;auxSetMiniPopupDraft(k)||Z.error("Could not save this draft. Keep this window open and try again.");return!0},is=({onHeightChange:s,onSessionChange:n})=>'],
      ['a=>{k=null,n(a)}', 'a=>{auxSetMiniPopupDraft(null)||Z.error("Could not clear the saved draft. Keep this window open and try again."),n(a)}'],
      ['Pe({onSessionChange:o,source:"mini-popup"})',
       'Pe({onSessionChange:o,source:"mini-popup",defaultDraftState:{draftMode:auxMiniPopupDraftMode}})'],
      ['a=>{k=a}', 'a=>auxSetMiniPopupDraft(a)'],
      ['Y,{draft:t,fill:!0,',
       'Y,{draft:{...t,handleDraftModeChange:a=>{auxSetMiniPopupMode(a)&&t.handleDraftModeChange(a)}},fill:!0,'],
    ];
    const anchors = [];
    for (const [find, replacement] of edits) {
      if (text.split(find).length - 1 !== 1)
        throw new Error('Supplied Mini Popup draft ownership anchor changed');
      text = text.replace(find, replacement);
      anchors.push({ kind: 'integration', find, replace: replacement, count: 1 });
    }
    return { text, anchors };
  }
  if (path === 'assets/sidepanel-CI-CbXmY.js') {
    // The original hook returned only a page attachment (null on New Tab).
    // Draft identity belongs to the active tab context, not attachable content.
    const first = replaceOne('import{n as X}from"./use-tab-context-Bi3TKsrh.js";',
      'import{t as X}from"./use-tab-context-Bi3TKsrh.js";');
    const edits = [
      ['onDraftRecordChange:o=>{k(s,o??null)}','onDraftRecordChange:o=>k(s,o??null)'],
      ['onDraftRecordChange:t=>{k(void 0,t??null,s)}','onDraftRecordChange:t=>k(void 0,t??null,s)'],
    ];
    for (const [find, replacement] of edits) {
      if (first.text.split(find).length - 1 !== 1) throw new Error('Supplied draft callback changed');
      first.text = first.text.replace(find, replacement);
      first.anchors.push({kind:'integration',find,replace:replacement,count:1});
    }
    return first;
  }
  if (path === 'assets/use-tab-context-Bi3TKsrh.js') {
    const edits = [
      ['(0,e.useEffect)(()=>(m().then(n=>{u(n)}),b(n=>{u(n)})),[])',
       '(0,e.useEffect)(()=>{let auxLive=!0,auxObserved=!1;const auxOff=b(n=>{auxObserved=!0,auxLive&&u(n)});m().then(n=>{auxLive&&!auxObserved&&u(n)});return()=>{auxLive=!1,auxOff()}},[])'],
      ['m().then(T);const S=b(T);',
       'let auxObserved=!1;const S=b(r=>{auxObserved=!0,T(r)});m().then(r=>{auxObserved||T(r)});'],
    ];
    const anchors = [];
    for (const [find,replacement] of edits) {
      if (text.split(find).length - 1 !== 1) throw new Error('Supplied tab context lifecycle changed');
      text = text.replace(find,replacement);
      anchors.push({kind:'integration',find,replace:replacement,count:1});
    }
    return {text,anchors};
  }
  if (path === 'assets/browser-binding-CzDmxQNA.js') {
    const first = replaceOne('if(!I(r))return l=null,',
      'const auxDraftContext=await chrome.auxAccount?.getProfileContext?.(e.id).catch(()=>null),auxDraftPageId=auxDraftContext?.draftPageId;if(!I(r))return l=null,');
    const find = 'targetId:o?.id,isPageSelectionSupported:';
    const replacement = 'targetId:o?.id,draftPageId:auxDraftPageId,isPageSelectionSupported:';
    if (first.text.split(find).length - 1 !== 2)
      throw new Error('Supplied tab context return anchors changed');
    first.text = first.text.split(find).join(replacement);
    first.anchors.push({kind:'integration',find,replace:replacement,count:2});
    const lifecycleEdits = [
      ['l=null;function B()', 'l=null,auxSnapshotGeneration=0;function B()'],
      ['async function m(){const t=', 'async function m(){const auxSnapshot=++auxSnapshotGeneration;const t='],
      ['if(!I(r))return l=null,', 'if(!I(r))return auxSnapshot===auxSnapshotGeneration&&(l=null),'],
      ['return n&&(l=n),{tabId:e.id,', 'return auxSnapshot===auxSnapshotGeneration&&n&&(l=n),{tabId:e.id,'],
      ['const r=async()=>{t(await m())},i=(o,n,a)=>',
       'let auxGeneration=0,auxLive=!0;const r=async()=>{const auxRequest=++auxGeneration,auxContext=await m();auxLive&&auxRequest===auxGeneration&&t(auxContext)},i=(o,n,a)=>'],
      ['return e.onActivated.addListener(r),e.onUpdated.addListener(i),e.onRemoved.addListener(r),()=>{e.onActivated.removeListener(r)',
       'return e.onActivated.addListener(r),e.onUpdated.addListener(i),e.onRemoved.addListener(r),()=>{auxLive=!1,auxGeneration++,e.onActivated.removeListener(r)'],
    ];
    for (const [find,replacement] of lifecycleEdits) {
      if (first.text.split(find).length - 1 !== 1) throw new Error('Supplied tab subscription lifecycle changed');
      first.text = first.text.replace(find,replacement);
      first.anchors.push({kind:'integration',find,replace:replacement,count:1});
    }
    return first;
  }
  if (path === 'assets/-components-4o0FSqQ9.js') {
    return replaceOne('function Ve(e){const n=e?.targetId;return n?`${P}:${n}`:`${P}:unknown`}',
      'function Ve(e){const n=e?.targetId,t=e?.draftPageId;if(t){const r=`sidepanel-page:${t}`;if(n)try{for(const o of ["aside.chat-draft.v2","aside.chat-draft.v1","aside.sidepanel-new-session-settings.v1"]){const s=`${o}:${P}:${n}`,i=`${o}:${r}`,a=window.sessionStorage.getItem(s);a!==null&&(window.sessionStorage.getItem(i)===null&&window.sessionStorage.setItem(i,a),window.sessionStorage.removeItem(s))}}catch{}return r}return n?`${P}:${n}`:`${P}:unknown`}');
  }
  if (path !== 'assets/draft-storage-ixLojjZ5.js')
    return { text, anchors: [] };
  const find = 'write:(o,s=!1)=>{t=o,r(t),(s||!t)&&r.flush()}';
  const replacement = 'write:(o,s=!1)=>{t=o,r(t);return r.flush()}';
  if (text.split(find).length - 1 !== 1)
    throw new Error('Supplied draft persistence anchor changed');
  const durableFind = 'function J(e,n,t){const r=f(),o=N();if(!(!r&&!o))try{const s=c(e,l,t),i=c(e,I,t);if(!n||n.plainText.length===0&&!n.attachments?.length){r?.removeItem(s),r?.removeItem(i),o?.removeItem(s),o?.removeItem(i);return}r?.setItem(s,JSON.stringify(n)),r?.removeItem(i),o?.removeItem(s),o?.removeItem(i)}catch{}}';
  const durableReplacement = 'var auxUnsavedDrafts=new Map,auxDraftUnload=e=>{e.preventDefault(),e.returnValue=""};function J(e,n,t){const s=c(e,l,t);try{const r=f(),o=N(),auxDurable=(typeof e==="string"&&e.length>0||t==="mini-popup:new"||typeof t==="string"&&/^sidepanel-page:(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|p_[a-z0-9_]{6,126})$/.test(t));if(auxDurable?!o:!r)throw new Error("Draft storage unavailable");const i=c(e,I,t);if(!n||n.plainText.length===0&&!n.attachments?.length){r?.removeItem(s),r?.removeItem(i),o?.removeItem(s),o?.removeItem(i)}else{const a=JSON.stringify(n);r?.setItem(s,a),r?.removeItem(i),auxDurable?o.setItem(s,a):o?.removeItem(s),o?.removeItem(i)}auxUnsavedDrafts.delete(s);if(auxUnsavedDrafts.size===0&&typeof window!=="undefined")window.removeEventListener("beforeunload",auxDraftUnload);return true}catch{auxUnsavedDrafts.set(s,n);if(typeof window!=="undefined")window.addEventListener("beforeunload",auxDraftUnload);return false}}';
  const readFind = 'function F(e,n){const t=f(),r=N();';
  const readReplacement = 'function F(e,n){const auxKey=c(e,l,n);if(auxUnsavedDrafts.has(auxKey))return auxUnsavedDrafts.get(auxKey);const t=f(),r=N();';
  const edits = [[find,replacement],[durableFind,durableReplacement],[readFind,readReplacement]];
  const anchors = [];
  for (const [find, replacement] of edits) {
    if (text.split(find).length - 1 !== 1) throw new Error('Supplied draft recovery anchor changed');
    text = text.replace(find,replacement);
    anchors.push({kind:'integration',find,replace:replacement,count:1});
  }
  return {text,anchors};
}
