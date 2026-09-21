// @vitest-environment jsdom
import {afterEach,expect,it,vi} from "vitest";
import {readResultDraft,writeResultDraft,clearResultDrafts} from "./result-drafts";
afterEach(()=>vi.unstubAllGlobals());
it("keeps recoverable copies and removes a deleted chat's drafts from every window",()=>{
  const entries=new Map<string,string>();
  vi.stubGlobal("localStorage",{getItem:(key:string)=>entries.get(key)??null,setItem:(key:string,value:string)=>entries.set(key,value),removeItem:(key:string)=>entries.delete(key),key:(index:number)=>[...entries.keys()][index]??null,get length(){return entries.size;}});
  const draft={chatId:"edited-chat",content:"My edit",source:"Original"};
  writeResultDraft("result-one",draft);
  localStorage.setItem("aux.result-draft.v1:another-window:result-two",JSON.stringify(draft));
  localStorage.setItem("aux.result-draft.v1:another-window:keep",JSON.stringify({...draft,chatId:"other-chat"}));
  expect(readResultDraft("result-one")).toEqual(draft);
  expect(clearResultDrafts("edited-chat")).toBe(true);
  expect(readResultDraft("result-one")).toBeNull();
  expect(localStorage.getItem("aux.result-draft.v1:another-window:result-two")).toBeNull();
  expect(localStorage.getItem("aux.result-draft.v1:another-window:keep")).not.toBeNull();
  localStorage.removeItem("aux.result-draft.v1:another-window:keep");
});
