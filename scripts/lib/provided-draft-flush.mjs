/** Keep supplied draft storage/format; commit edits before native profile teardown. */
export function transformProvidedDraftFlush({ component, path, text }) {
  if (component !== 'agent') return { text, anchors: [] };
  const replaceOne = (find, replacement) => {
    if (text.split(find).length - 1 !== 1)
      throw new Error(`Supplied draft identity anchor changed: ${path}`);
    return { text: text.replace(find, replacement),
      anchors: [{ kind: 'integration', find, replace: replacement, count: 1 }] };
  };
  if (path === 'assets/ask-omnibox-panel-DkxXbN8c.js') {
    return replaceOne('onDraftRecordChange:(d,j)=>{(o.mode==="ask"||j)&&o.draftWriter.write(d,j)}',
      'onDraftRecordChange:(d,j)=>(o.mode==="ask"||j)?o.draftWriter.write(d,j):void 0');
  }
  if (path === 'assets/newtab-editor-u_GbForB.js') {
    return replaceOne('const s=v(),i=D(x(void 0,y),e=>P(void 0,e,y));',
      'let auxScope=y;try{if(!chrome.extension?.inIncognitoContext){const auxTab=await chrome.tabs.getCurrent();if(Number.isInteger(auxTab?.id)&&auxTab.id>0){const auxContext=await chrome.auxAccount.getProfileContext(auxTab.id),auxId=auxContext?.draftPageId;if(typeof auxId==="string"&&/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|p_[a-z0-9_]{6,126})$/.test(auxId))auxScope="newtab-page:"+auxId}}}catch{}let auxInitial=x(void 0,auxScope);if(auxScope!==y)try{if(!auxInitial&&(window.sessionStorage.getItem("aside.chat-draft.v2:"+y)!==null||window.sessionStorage.getItem("aside.chat-draft.v1:"+y)!==null)){auxInitial=x(void 0,y);if(P(void 0,auxInitial,auxScope)===!0)P(void 0,null,y)}else if(auxInitial)P(void 0,null,y)}catch{}const s=v(),i=D(auxInitial,e=>P(void 0,e,auxScope));');
  }
  if (path === 'assets/minipopup-LkDLFvnq.js') {
    // A singleton per actual UI account, inside the real Profile origin store.
    // Captured owners keep late callbacks from writing a successor account.
    const edits = [
  [
    "import{u as f}from\"./browser-binding-CzDmxQNA.js\";",
    "import{u as f}from\"./browser-binding-CzDmxQNA.js\";import{i as auxReadMiniDraft,l as auxWriteMiniDraft}from\"./draft-storage-ixLojjZ5.js\";"
  ],
  [
    "k=null,is=({onHeightChange:s,onSessionChange:n})=>{",
    "auxMiniDraftOwners=new Map,auxGetMiniDraft=accountId=>{let owner=auxMiniDraftOwners.get(accountId);if(owner)return owner;const scope=\"mini-popup-account:\"+accountId+\":new\",privateContext=typeof chrome!==\"undefined\"&&chrome.extension?.inIncognitoContext===!0,unload=e=>{e.preventDefault(),e.returnValue=\"\"};owner={record:privateContext?null:auxReadMiniDraft(void 0,scope),mode:\"default\",set(record){owner.record=record;const saved=privateContext||owner.mode===\"incognito\"||auxWriteMiniDraft(void 0,record,scope)===!0;if(!saved||(privateContext||owner.mode===\"incognito\")&&(record?.plainText?.length||record?.attachments?.length))window.addEventListener(\"beforeunload\",unload);else window.removeEventListener(\"beforeunload\",unload);return saved},setMode(mode){if(mode!==\"default\"&&mode!==\"incognito\")return!1;if(mode===\"incognito\"&&!privateContext&&auxWriteMiniDraft(void 0,null,scope)!==!0){Z.error(\"Could not remove the saved draft. Keep this window open and try again before entering incognito.\");return!1}owner.mode=mode;owner.set(owner.record)||Z.error(\"Could not save this draft. Keep this window open and try again.\");return!0}};auxMiniDraftOwners.set(accountId,owner);return owner},is=auxProps=>{const{accountId}=K();return Number.isSafeInteger(accountId)&&accountId>=0?(0,e.jsx)(auxMiniComposer,{...auxProps,auxAccountId:accountId},accountId):null},auxMiniComposer=({onHeightChange:s,onSessionChange:n,auxAccountId})=>{const auxDraft=auxGetMiniDraft(auxAccountId);"
  ],
  [
    "a=>{k=null,n(a)}",
    "a=>{auxDraft.set(null)||Z.error(\"Could not clear the saved draft. Keep this window open and try again.\"),n(a)}"
  ],
  [
    "Pe({onSessionChange:o,source:\"mini-popup\"})",
    "Pe({onSessionChange:o,source:\"mini-popup\",defaultDraftState:{draftMode:auxDraft.mode}})"
  ],
  [
    "a=>{k=a}",
    "a=>auxDraft.set(a)"
  ],
  [
    "defaultDraftRecord:k,onDraftRecordChange:l",
    "defaultDraftRecord:auxDraft.record,onDraftRecordChange:l"
  ],
  [
    "Y,{draft:t,fill:!0,",
    "Y,{draft:{...t,handleDraftModeChange:a=>{auxDraft.setMode(a)&&t.handleDraftModeChange(a)}},fill:!0,"
  ]
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
  const durableReplacement = 'var auxUnsavedDrafts=new Map,auxDraftUnload=e=>{e.preventDefault(),e.returnValue=""};function J(e,n,t){const s=c(e,l,t);try{const r=f(),o=N(),auxDurable=(typeof e==="string"&&e.length>0||typeof t==="string"&&/^mini-popup-account:(?:0|[1-9][0-9]{0,15}):new$/.test(t)||typeof t==="string"&&/^(?:sidepanel-page|newtab-page):(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|p_[a-z0-9_]{6,126})$/.test(t));if(auxDurable?!o:!r)throw new Error("Draft storage unavailable");const i=c(e,I,t);if(!n||n.plainText.length===0&&!n.attachments?.length){r?.removeItem(s),r?.removeItem(i),o?.removeItem(s),o?.removeItem(i)}else{const a=JSON.stringify(n);r?.setItem(s,a),r?.removeItem(i),auxDurable?o.setItem(s,a):o?.removeItem(s),o?.removeItem(i)}auxUnsavedDrafts.delete(s);if(auxUnsavedDrafts.size===0&&typeof window!=="undefined")window.removeEventListener("beforeunload",auxDraftUnload);return true}catch{auxUnsavedDrafts.set(s,n);if(typeof window!=="undefined")window.addEventListener("beforeunload",auxDraftUnload);return false}}';
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
