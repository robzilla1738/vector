// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { executeCommand } from "../commands";
import { Conversation } from "./Conversation";

let root: ReturnType<typeof createRoot>, host: HTMLDivElement;
const initial = useStore.getState();
const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  Object.defineProperty(HTMLDialogElement.prototype,"showModal",{configurable:true,value:function(this:HTMLDialogElement){this.open=true;}});
  Object.defineProperty(HTMLDialogElement.prototype,"close",{configurable:true,value:function(this:HTMLDialogElement){this.open=false;}});
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  useStore.setState({
    agentDraft: "Keep this page-free question",
    railOpen: false,
    runs: [],
    pendingTurns: [],
    pages: [],
    connected: true,
    conversationId: null,
    toasts: [],
  });
  vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.list" || method === "runs.messages.list") return [];
    if (method === "conversations.get") return { title: "Other chat", archived: false };
    if (method === "conversations.artifacts.get") return { artifacts: [] };
    if (method === "conversations.images.get") return { images: [] };
    if (method === "conversations.attachments.get") return { attachments: [] };
    if (method === "conversations.sources.get") return { sources: [] };
    if (method === "runs.context.get") return { entries: [], historyEnabled: true };
    return { workspace: null, memory: null };
  });
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (originalScroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScroll);
  else delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
});

const image = (chatId:string, included=true) => ({imageId:`image-${chatId}`,artifactId:`artifact-${chatId}`,chatId,filename:`${chatId}.png`,width:16,height:16,createdAt:1,included,byteLength:15,mediaType:"image/png"});
async function mount(chatId:string) { await act(async()=>root.render(<Conversation chatId={chatId}/>)); }
function choice() { return host.querySelector<HTMLInputElement>('.attachment-chip input')!; }
let records:Record<string,ReturnType<typeof image>[]>;
function setupImages() {
 records={A:[image("A")],B:[image("B")]};
 const invoke=vi.mocked(bridge.invoke), fallback=invoke.getMockImplementation()!;
 invoke.mockImplementation((method,params)=>{
  if(method==="conversations.images.get")return Promise.resolve({images:records[(params as {chatId:string}).chatId]});
  if(method==="conversations.images.read")return Promise.resolve({image:image((params as {chatId:string}).chatId),dataUrl:"data:image/png;base64,AA=="});
  return fallback(method,params);
 });return invoke;
}
it("routes mounted tray preview, choice, removal and preview close through their original focused commands",async()=>{
 const invoke=setupImages(), fallback=invoke.getMockImplementation()!;
 invoke.mockImplementation((method,params)=>{
  if(method==="conversations.images.toggle"){records.A=[image("A",false)];return Promise.resolve({chatId:"A",images:records.A});}
  if(method==="conversations.images.remove"){records.A=[];return Promise.resolve({chatId:"A",images:[]});}
  return fallback(method,params);
 });
 await mount("A");
 const preview=host.querySelector<HTMLButtonElement>('.attachment-open')!;
 expect(preview.dataset.commandId).toBe("preview-conversation-image");
 preview.focus();await act(async()=>{await executeCommand("preview-conversation-image");});
 const close=document.querySelector<HTMLButtonElement>('[aria-label="Close image preview"]')!;
 expect(close.dataset.commandId).toBe("cancel-conversation-image");
 close.focus();await act(async()=>{await executeCommand("cancel-conversation-image");});
 expect(document.querySelector('[aria-label="Image snapshot"]')).toBeNull();
 choice().focus();await act(async()=>{await executeCommand("toggle-conversation-image");});
 expect(invoke).toHaveBeenCalledWith("conversations.images.toggle",{chatId:"A",imageId:"image-A",included:false});
 expect(choice().checked).toBe(false);
 const remove=host.querySelector<HTMLButtonElement>('[aria-label="Remove A.png"]')!;
 remove.focus();await act(async()=>{await executeCommand("remove-conversation-image");});
 expect(host.querySelector('.attachment-chip')).toBeNull();
 expect(useStore.getState().pages).toEqual([]);expect(useStore.getState().runs).toEqual([]);
});
it.each(["resolve","reject"])("retains fresh B busy state after a retired A %s, preserves completion and draft",async mode=>{
 const invoke=setupImages(),fallback=invoke.getMockImplementation()!;
 const held:Array<{done:(value:unknown)=>void;fail:(reason:unknown)=>void}>=[];
 invoke.mockImplementation((method,params)=>method==="conversations.images.toggle"?new Promise((done,fail)=>held.push({done,fail})):fallback(method,params));
 await mount("A");choice().focus();let old!:Promise<unknown>;
 await act(async()=>{old=executeCommand("toggle-conversation-image");});
 const error=new Error("original A failure");void old.catch(()=>{});
 await mount("B");choice().focus();let fresh!:Promise<unknown>;
 await act(async()=>{fresh=executeCommand("toggle-conversation-image");});
 const ack={chatId:"A",images:[]};
 await act(async()=>{if(mode==="resolve")held[0]!.done(ack);else held[0]!.fail(error);await old.catch(()=>{});});
 expect(await old.then(value=>({value}),reason=>({reason}))).toEqual(mode==="resolve"?{value:ack}:{reason:error});
 expect(choice().disabled).toBe(true);expect(host.textContent).toContain("B.png");
 expect(useStore.getState().toasts).toEqual([]);
 await act(async()=>{records.B=[image("B",false)];held[1]!.done({chatId:"B",images:records.B});await fresh;});
 expect(choice().disabled).toBe(false);expect(choice().checked).toBe(false);
});
it("native checkbox activation preserves the actual input state and refuses same-tick duplicate mutation",async()=>{
 const invoke=setupImages(),fallback=invoke.getMockImplementation()!;let done!:(value:unknown)=>void;
 invoke.mockImplementation((method,params)=>method==="conversations.images.toggle"?new Promise(resolve=>{done=resolve;}):fallback(method,params));
 await mount("A");await act(async()=>{choice().click();choice().click();});
 expect(invoke.mock.calls.filter(([method])=>method==="conversations.images.toggle")).toHaveLength(1);
 expect(invoke).toHaveBeenCalledWith("conversations.images.toggle",{chatId:"A",imageId:"image-A",included:false});
 await act(async()=>{records.A=[image("A",false)];done({chatId:"A",images:records.A});});
 expect(choice().checked).toBe(false);expect(choice().disabled).toBe(false);
});
it("irreversibly retires A through a chat roundtrip and preserves current original image and prompt",async()=>{
 const invoke=setupImages(),fallback=invoke.getMockImplementation()!;let done!:(value:unknown)=>void;
 invoke.mockImplementation((method,params)=>method==="conversations.images.toggle"?new Promise(resolve=>{done=resolve;}):fallback(method,params));
 await mount("A");choice().focus();let completion!:Promise<unknown>;
 await act(async()=>{completion=executeCommand("toggle-conversation-image");});
 await mount("B");await mount("A");
 const ack={chatId:"A",images:[]};await act(async()=>{done(ack);await completion;});
 expect(host.textContent).toContain("A.png");expect(choice().checked).toBe(true);expect(choice().disabled).toBe(false);
 await expect(completion).resolves.toBe(ack);
});
it("fences original preview reads across native window incarnation and does not restart unchanged busy rerenders",async()=>{
 const invoke=setupImages(),fallback=invoke.getMockImplementation()!;
 const pending:Array<(value:unknown)=>void>=[];
 invoke.mockImplementation((method,params)=>method==="conversations.images.read"?new Promise(done=>pending.push(done)):fallback(method,params));
 await mount("A");host.querySelector<HTMLButtonElement>('.attachment-open')!.focus();
 await act(async()=>{await executeCommand("preview-conversation-image");});
 expect(pending).toHaveLength(1);await mount("A");expect(pending).toHaveLength(1);
 const original=bridge.windowId;
 try {
  bridge.windowId="replacement";await mount("A");
  expect(pending).toHaveLength(2);
  bridge.windowId=original;await mount("A");expect(pending).toHaveLength(3);
  await act(async()=>pending[0]!({image:image("A"),dataUrl:"data:image/png;base64,old"}));
  expect(document.querySelector('.image-viewer')).toBeNull();
  await act(async()=>pending[2]!({image:image("A"),dataUrl:"data:image/png;base64,current"}));
  expect(document.querySelector<HTMLImageElement>('.image-viewer img')?.src).toContain("current");
 } finally {bridge.windowId=original;}
});
