// @vitest-environment jsdom
import {afterEach,expect,it,vi} from "vitest";
import {readResultDraft,writeResultDraft,clearResultDrafts,revokeResultDrafts,reconcileResultDrafts} from "./result-drafts";
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
it("revokes protected result drafts across windows while preserving unrelated edits",()=>{
  const entries=new Map<string,string>();
  vi.stubGlobal("localStorage",{getItem:(key:string)=>entries.get(key)??null,setItem:(key:string,value:string)=>entries.set(key,value),removeItem:(key:string)=>entries.delete(key),key:(index:number)=>[...entries.keys()][index]??null,get length(){return entries.size;}});
  const draft={chatId:"revoked-chat",content:"Private derived edit",source:"Private source"};
  writeResultDraft("revoked-result",draft);
  localStorage.setItem("aux.result-draft.v1:other-window:revoked-result",JSON.stringify(draft));
  writeResultDraft("valid-result",{chatId:"valid-chat",content:"Unrelated edit",source:"Unrelated source"});
  expect(revokeResultDrafts(["revoked-result"])).toBe(true);
  expect(readResultDraft("revoked-result")).toBeNull();
  expect([...entries.values()].join(" ")).not.toContain("Private derived edit");
  expect(readResultDraft("valid-result")?.chatId).toBe("valid-chat");
  clearResultDrafts("valid-chat");
});
it("reconciles drafts missed during shutdown and retains them on transport failure",async()=>{
  const entries=new Map<string,string>();
  vi.stubGlobal("localStorage",{getItem:(key:string)=>entries.get(key)??null,setItem:(key:string,value:string)=>entries.set(key,value),removeItem:(key:string)=>entries.delete(key),key:(index:number)=>[...entries.keys()][index]??null,get length(){return entries.size;}});
  const draft={chatId:"reconcile-chat",content:"My edit",source:"Original"};
  writeResultDraft("missing-result",draft);
  writeResultDraft("living-result",draft);
  await expect(reconcileResultDrafts(async()=>{throw new Error("Runtime disconnected");})).rejects.toThrow("Runtime disconnected");
  expect(readResultDraft("missing-result")).toEqual(draft);
  expect(await reconcileResultDrafts(async()=>["living-result"])).toEqual({checked:2,removed:1});
  expect(readResultDraft("missing-result")).toBeNull();
  expect(readResultDraft("living-result")).toEqual(draft);
  clearResultDrafts("reconcile-chat");
});
