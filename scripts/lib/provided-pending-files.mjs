/** Preserve original file reads until attachment draft handoff completes. */
const edits = [
  {
    "find": "ce=(0,a.useRef)([]);(0,a.useEffect)(()=>()=>{ie.current+=1",
    "replace": "ce=(0,a.useRef)([]),auxFileUnload=(0,a.useRef)(null);const auxSetFileBusy=c=>{if(c&&!auxFileUnload.current){const d=x=>{x.preventDefault(),x.returnValue=\"\"};auxFileUnload.current=d,window.addEventListener(\"beforeunload\",d)}else!c&&auxFileUnload.current&&(window.removeEventListener(\"beforeunload\",auxFileUnload.current),auxFileUnload.current=null)};(0,a.useEffect)(()=>()=>{auxSetFileBusy(!1),ie.current+=1",
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
export function transformProvidedPendingFiles({ component, path, text }) {
  if (component !== "agent" || path !== "assets/permission-approval-D-GTf91U.js")
    return { text, anchors: [] };
  for (const edit of edits) {
    if (text.split(edit.find).length - 1 !== edit.count)
      throw new Error("Supplied pending file ownership anchor changed");
    text = text.replace(edit.find, edit.replace);
  }
  return { text, anchors: edits.map(edit => ({ kind: "integration", ...edit })) };
}
