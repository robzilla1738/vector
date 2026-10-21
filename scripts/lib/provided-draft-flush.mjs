/** Keep supplied draft storage/format; commit edits before native profile teardown. */
export function transformProvidedDraftFlush({ component, path, text }) {
  if (component !== 'agent') return { text, anchors: [] };
  const replaceOne = (find, replacement) => {
    if (text.split(find).length - 1 !== 1)
      throw new Error(`Supplied draft identity anchor changed: ${path}`);
    return { text: text.replace(find, replacement),
      anchors: [{ kind: 'integration', find, replace: replacement, count: 1 }] };
  };
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
  const replacement = 'write:(o,s=!1)=>{t=o,r(t),r.flush()}';
  if (text.split(find).length - 1 !== 1)
    throw new Error('Supplied draft persistence anchor changed');
  const durableFind = 'r?.setItem(s,JSON.stringify(n)),r?.removeItem(i),o?.removeItem(s),o?.removeItem(i)';
  // Existing conversation IDs survive restart. Transient sidepanel target IDs
  // and the shared "new" fallback must never become global durable draft keys.
  const durableReplacement = 'r?.setItem(s,JSON.stringify(n)),r?.removeItem(i),(typeof e==="string"&&e.length>0||typeof t==="string"&&/^sidepanel-page:(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|p_[a-z0-9_]{6,126})$/.test(t))?o?.setItem(s,JSON.stringify(n)):o?.removeItem(s),o?.removeItem(i)';
  if (text.split(durableFind).length - 1 !== 1)
    throw new Error('Supplied durable conversation draft anchor changed');
  return { text: text.replace(find, replacement).replace(durableFind, durableReplacement),
    anchors: [
      { kind: 'integration', find, replace: replacement, count: 1 },
      { kind: 'integration', find: durableFind, replace: durableReplacement, count: 1 },
    ] };

}
