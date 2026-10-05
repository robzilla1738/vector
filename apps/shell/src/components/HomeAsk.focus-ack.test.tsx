// @vitest-environment jsdom
import { act, type ReactNode, type RefObject } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const fixture = vi.hoisted(() => ({
  draft: "", railOpen: false, focusRequest: 0, focusShell: vi.fn(), runCommand: vi.fn(), errToast:vi.fn(),
  listeners: new Set<(event: {type:string; payload:{chatId:string}})=>void>(),
}));
vi.mock("../store",()=>({errToast:fixture.errToast,useStore:Object.assign(
  (select:(state:unknown)=>unknown)=>select({railOpen:fixture.railOpen,focusRequest:fixture.focusRequest,connected:false}),
  {getState:()=>({agentDraft:fixture.draft,connected:false})}
)}));
vi.mock("../commands",async()=>{const {invokeScopedControl}=await import("../scoped-control-commands");return {runCommand:fixture.runCommand,executeCommand:(id:string,context:Parameters<typeof invokeScopedControl>[1])=>{try{return Promise.resolve(invokeScopedControl(id,context));}catch(error){return Promise.reject(error);}}};});
vi.mock("../bridge",()=>({bridge:{windowId:"main",windowKind:"normal",privateMode:false,focusShell:fixture.focusShell,onEvent:(fn: typeof fixture.listeners extends Set<infer T> ? T : never)=>{fixture.listeners.add(fn);return ()=>fixture.listeners.delete(fn);}}}));
vi.mock("./Conversation",()=>({Conversation:({chatId,onChatCreated,entryControls,composerRef}:{chatId:string|null;onChatCreated:(id:string)=>void;entryControls?:ReactNode;composerRef:RefObject<HTMLTextAreaElement|null>})=><section data-chat-id={chatId??"new"}><textarea ref={composerRef}/>{entryControls}<button onClick={()=>onChatCreated("durable-chat")}>Create chat</button></section>}));
import HomeAsk from "./HomeAsk";
import {Popover} from "../ui/popover";
let container:HTMLDivElement;
let root:Root;
beforeEach(()=>{vi.spyOn(HTMLElement.prototype,"getClientRects").mockReturnValue([{width:100}] as unknown as DOMRectList);vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);const storage=new Map<string,string>();vi.stubGlobal("localStorage",{getItem:(key:string)=>storage.get(key)??null,setItem:(key:string,value:string)=>storage.set(key,value),removeItem:(key:string)=>storage.delete(key)});fixture.draft="";fixture.railOpen=false;fixture.focusRequest=0;fixture.listeners.clear();fixture.focusShell.mockReset().mockResolvedValue(undefined);fixture.runCommand.mockReset();fixture.errToast.mockReset();vi.stubGlobal("requestAnimationFrame",()=>1);container=document.createElement("div");document.body.append(container);root=createRoot(container);});
afterEach(()=>{act(()=>root.unmount());container.remove();vi.restoreAllMocks();vi.unstubAllGlobals();});
async function render(onSearch?:()=>void){await act(async()=>root.render(<HomeAsk onSearch={onSearch}/>));}


function heldFocus() {
  const pending: { resolve():void; reject(reason:unknown):void }[]=[];
  fixture.focusShell.mockImplementation(()=>new Promise<void>((resolve,reject)=>pending.push({resolve,reject})));
  return pending;
}
it("keeps a newer actual mounted modal input focused when the original shell ACK is late",async()=>{
  const pending=heldFocus();
  await act(async()=>root.render(<><HomeAsk/><Popover label="Newer overlay" trigger="Open newer overlay">{()=> <input aria-label="Newer modal input"/>}</Popover></>));
  const trigger=container.querySelector<HTMLButtonElement>('[aria-label="Newer overlay"]')!;
  await act(async()=>{trigger.focus();trigger.click();});
  const modal=document.querySelector<HTMLDialogElement>('dialog[aria-label="Newer overlay"]')!;
  const input=modal.querySelector<HTMLInputElement>("input")!;
  expect(modal.open).toBe(true);expect(document.activeElement).toBe(input);
  await act(async()=>pending[0]!.resolve());
  expect(document.activeElement).toBe(input);expect(fixture.errToast).not.toHaveBeenCalled();
});
it("keeps a newer outside focus owner when the initial shell ACK is late",async()=>{
  const pending=heldFocus();await act(async()=>root.render(<><HomeAsk/><button aria-label="Newer outside">Outside</button></>));
  const outside=container.querySelector<HTMLButtonElement>('[aria-label="Newer outside"]')!;outside.focus();
  await act(async()=>pending[0]!.resolve());expect(document.activeElement).toBe(outside);
});
it("does not publish a retired shell focus rejection after actual parent unmount",async()=>{
  const pending=heldFocus();await render();const reason=new Error("Original shell focus failed");
  await act(async()=>root.render(<button aria-label="Fresh owner">Fresh</button>));
  const fresh=container.querySelector<HTMLButtonElement>('button')!;fresh.focus();
  await act(async()=>pending[0]!.reject(reason));
  expect(fixture.errToast).not.toHaveBeenCalled();expect(document.activeElement).toBe(fresh);
});
it("retains initial composer focus and exact current rejection presentation",async()=>{
  const pending=heldFocus();await render();await act(async()=>pending[0]!.resolve());
  expect(document.activeElement).toBe(container.querySelector("textarea"));
  fixture.focusRequest++;await render();const reason=new Error("Current shell focus failed");
  await act(async()=>pending[1]!.reject(reason));expect(fixture.errToast).toHaveBeenCalledExactlyOnceWith(reason);
});
