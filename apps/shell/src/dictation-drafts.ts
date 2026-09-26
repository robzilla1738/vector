import { create } from "zustand";

// Transcripts are window-local, transient drafts. They are not conversation
// messages or memory until the user explicitly inserts and sends them.
export const useDictationDrafts = create<{drafts: Record<string,string>}>(()=>({drafts:{}}));
export function setDictationDraft(key:string,text:string) {
  useDictationDrafts.setState(state=>{
    const drafts={...state.drafts};
    if(text)drafts[key]=text.slice(0,20000);
    else delete drafts[key];
    return {drafts};
  });
}
