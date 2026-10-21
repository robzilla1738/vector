/** Preserve original file reads until attachment draft handoff completes. */
const edits = [
  {
    find: 'X.current=E,je?.(E,x)',
    replace: 'X.current=E;const auxSaved=je?.(E,x);if(auxSaved===!1){auxDraftSaveFailed.current||se.error("Could not save this draft. Keep this window open and remove a large attachment, then try again."),auxDraftSaveFailed.current=!0}else auxDraftSaveFailed.current=!1;return auxSaved',
    count: 1
  },
  {
    "find": "ce=(0,a.useRef)([]);(0,a.useEffect)(()=>()=>{ie.current+=1",
    "replace": "ce=(0,a.useRef)([]),auxFileUnload=(0,a.useRef)(null),auxDraftSaveFailed=(0,a.useRef)(!1);const auxSetFileBusy=c=>{if(c&&!auxFileUnload.current){const d=x=>{x.preventDefault(),x.returnValue=\"\"};auxFileUnload.current=d,window.addEventListener(\"beforeunload\",d)}else!c&&auxFileUnload.current&&(window.removeEventListener(\"beforeunload\",auxFileUnload.current),auxFileUnload.current=null)};(0,a.useEffect)(()=>()=>{auxSetFileBusy(!1),ie.current+=1",
    "count": 1
  },
  {
    "find": "vt=(0,a.useEffectEvent)(()=>pe(z.current));(0,a.useEffect)(()=>{vt()},[te])",
    "replace": "vt=(0,a.useEffectEvent)(()=>{if(auxFileUnload.current&&ee.current===0&&ze.length===0&&Z.current===Y&&!U.current&&je){pe(z.current,te,!0),auxSetFileBusy(!1)}else pe(z.current)});(0,a.useEffect)(()=>{vt()},[te,ze])",
    "count": 1
  },
  {
    "find": "ce.current=[],ae.current=!1,ie.current+=1",
    "replace": "ce.current=[],ae.current=!1,auxSetFileBusy(!1),ie.current+=1",
    "count": 1
  },
  {
    "find": "ge=async c=>{if(u||c.length===0)return;ee.current+=1;",
    "replace": "ge=async c=>{if(u||c.length===0)return;auxSetFileBusy(!0),ee.current+=1;",
    "count": 1
  }
];
// The supplied history registers a no-op beforeunload listener even when no
// blockers exist. Native admission observes listener presence, not its return
// value. Keep the original callback while subscribing only for live blockers.
const routerEdits = [
  {
    find: 'const o=()=>i,r=m=>i=m,a=m=>me(',
    replace: 'const o=()=>i,r=m=>{const auxHadBlockers=i.length>0;i=m;if(i.length){auxHadBlockers||(y=!1,e.addEventListener(Gt,C,{capture:!0}))}else e.removeEventListener(Gt,C,{capture:!0});return i},a=m=>me(',
    count: 1
  },
  {
    find: '},e.addEventListener(Gt,C,{capture:!0}),e.addEventListener(Kt,L),',
    replace: '},e.addEventListener(Kt,L),',
    count: 1
  }
];
export function transformProvidedPendingFiles({ component, path, text }) {
  if (component !== "agent") return { text, anchors: [] };
  const selected = path === "assets/permission-approval-D-GTf91U.js" ? edits
    : path === "assets/Matches-B99cyGDb.js" ? routerEdits : [];
  for (const edit of selected) {
    if (text.split(edit.find).length - 1 !== edit.count)
      throw new Error("Supplied pending file ownership anchor changed");
    text = text.replace(edit.find, edit.replace);
  }
  return { text, anchors: selected.map(edit => ({ kind: "integration", ...edit })) };
}
