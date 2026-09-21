// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { VectorEvent } from "@vector/contracts";
import { expect, it, vi } from "vitest";
import { ConversationHistory } from "./components/ConversationHistory";
import { bridge } from "./bridge";
import { makeRun } from "./mock/fixtures";
import { useStore } from "./store";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
it("refreshes the loaded history range instead of dropping older pages",async()=>{
  vi.useFakeTimers();
  const initial=useStore.getState();
  const rows=Array.from({length:90},(_,index)=>({chatId:`chat-${index}`,title:`Chat ${index}`,archived:false,createdAt:1000-index,updatedAt:1000-index,turnCount:1,latestRun:makeRun({runId:`run-${index}`,config:{chatId:`chat-${index}`}})}));
  let receive!:(event:VectorEvent)=>void;
  vi.spyOn(bridge,"onEvent").mockImplementation(callback=>{receive=callback;return()=>{};});
  const invoke=vi.spyOn(bridge,"invoke").mockImplementation(async(method,input)=>{
    if(method!=="conversations.list")return [];
    const params=input as {limit:number;before?:{chatId:string}};
    const start=params.before ? rows.findIndex(row=>row.chatId===params.before!.chatId)+1 : 0;
    return rows.slice(start,start+params.limit);
  });
  const host=document.createElement("div"),root=createRoot(host);
  try {
    await act(async()=>root.render(<ConversationHistory/>));
    await act(async()=>vi.advanceTimersByTimeAsync(180));
    expect(host.querySelectorAll(".history-conversation")).toHaveLength(40);
    const more=Array.from(host.querySelectorAll<HTMLButtonElement>("button")).find(button=>button.textContent==="Load more conversations")!;
    await act(async()=>more.click());
    expect(host.querySelectorAll(".history-conversation")).toHaveLength(80);
    await act(async()=>{receive({seq:1,ts:Date.now(),type:"conversation.changed",payload:{chatId:"chat-0"}});await vi.advanceTimersByTimeAsync(100);});
    expect(invoke).toHaveBeenLastCalledWith("conversations.list",expect.objectContaining({limit:80}));
    expect(host.querySelectorAll(".history-conversation")).toHaveLength(80);
  } finally {await act(async()=>root.unmount());vi.restoreAllMocks();vi.useRealTimers();useStore.setState(initial,true);}
});
