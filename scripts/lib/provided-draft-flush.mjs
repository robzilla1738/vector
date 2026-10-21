/** Keep supplied draft storage/format; commit edits before native profile teardown. */
export function transformProvidedDraftFlush({ component, path, text }) {
  if (component !== 'agent') return { text, anchors: [] };
  const replaceOne = (find, replacement) => {
    if (text.split(find).length - 1 !== 1)
      throw new Error(`Supplied draft identity anchor changed: ${path}`);
    return { text: text.replace(find, replacement),
      anchors: [{ kind: 'integration', find, replace: replacement, count: 1 }] };
  };
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
  if (path === 'assets/browser-binding-CzDmxQNA.js') {
    const first = replaceOne('if(!I(r))return l=null,',
      'const auxDraftContext=await chrome.auxAccount?.getProfileContext?.(e.id).catch(()=>null),auxDraftPageId=auxDraftContext?.draftPageId;if(!I(r))return l=null,');
    const find = 'targetId:o?.id,isPageSelectionSupported:';
    const replacement = 'targetId:o?.id,draftPageId:auxDraftPageId,isPageSelectionSupported:';
    if (first.text.split(find).length - 1 !== 2)
      throw new Error('Supplied tab context return anchors changed');
    return {text:first.text.split(find).join(replacement), anchors:[...first.anchors,
      {kind:'integration',find,replace:replacement,count:2}]};
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
  const durableReplacement = 'var auxUnsavedDrafts=new Map,auxDraftUnload=e=>{e.preventDefault(),e.returnValue=""};function J(e,n,t){const s=c(e,l,t);try{const r=f(),o=N();if(!r&&!o)throw new Error("Draft storage unavailable");const i=c(e,I,t);if(!n||n.plainText.length===0&&!n.attachments?.length){r?.removeItem(s),r?.removeItem(i),o?.removeItem(s),o?.removeItem(i)}else{const a=JSON.stringify(n);r?.setItem(s,a),r?.removeItem(i),(typeof e==="string"&&e.length>0||typeof t==="string"&&/^sidepanel-page:(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|p_[a-z0-9_]{6,126})$/.test(t))?o?.setItem(s,a):o?.removeItem(s),o?.removeItem(i)}auxUnsavedDrafts.delete(s);if(auxUnsavedDrafts.size===0&&typeof window!=="undefined")window.removeEventListener("beforeunload",auxDraftUnload);return true}catch{auxUnsavedDrafts.set(s,n);if(typeof window!=="undefined")window.addEventListener("beforeunload",auxDraftUnload);return false}}';
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
