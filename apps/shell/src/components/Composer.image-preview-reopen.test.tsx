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

it("reopens the same original image through the registered tray command after Escape without changing the draft", async () => {
 const invoke=setupImages();useStore.getState().setConversationDraft("A","Keep original question");
 await mount("A");const draft=host.querySelector<HTMLTextAreaElement>("textarea")!;
 const preview=host.querySelector<HTMLButtonElement>(".attachment-open")!;
 preview.focus();await act(async()=>{await executeCommand("preview-conversation-image");});
 const first=document.querySelector<HTMLDialogElement>("dialog.supporting-dialog")!;expect(first.open).toBe(true);
 await act(async()=>first.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true,cancelable:true})));
 expect(document.querySelector("dialog.supporting-dialog")).toBeNull();expect(host.querySelector(".supporting-chip")).not.toBeNull();
 preview.focus();await act(async()=>{await executeCommand("preview-conversation-image");});
 const second=document.querySelector<HTMLDialogElement>("dialog.supporting-dialog")!;expect(second.open).toBe(true);expect(second).not.toBe(first);
 expect(host.querySelector("textarea")).toBe(draft);expect(draft.value).toBe("Keep original question");
 expect(invoke.mock.calls.filter(([method])=>method==="conversations.images.read").map(([,params])=>params)).toEqual([{chatId:"A",imageId:"image-A"},{chatId:"A",imageId:"image-A"}]);
 expect(invoke.mock.calls.some(([method])=>method==="runs.start" || method==="conversations.images.toggle" || method==="conversations.images.remove")).toBe(false);
 expect(useStore.getState().pages).toEqual([]);expect(useStore.getState().runs).toEqual([]);
});
it("retires the original pending read on an explicit reopen and rejects a detached original Preview", async () => {
 const invoke=setupImages(),fallback=invoke.getMockImplementation()!;
 const replies:Array<(value:unknown)=>void>=[];
 invoke.mockImplementation((method,params)=>method==="conversations.images.read"?new Promise(resolve=>replies.push(resolve)):fallback(method,params));
 await mount("A");const preview=host.querySelector<HTMLButtonElement>(".attachment-open")!;
 preview.focus();await act(async()=>{await executeCommand("preview-conversation-image");});
 const first=document.querySelector<HTMLDialogElement>("dialog.supporting-dialog")!;
 await act(async()=>first.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true,cancelable:true})));
 preview.focus();await act(async()=>{await executeCommand("preview-conversation-image");});expect(replies).toHaveLength(2);
 await act(async()=>replies[0]!({image:image("A"),dataUrl:"data:image/png;base64,old"}));expect(document.querySelector(".image-viewer")).toBeNull();
 await act(async()=>replies[1]!({image:image("A"),dataUrl:"data:image/png;base64,fresh"}));expect(document.querySelector<HTMLImageElement>(".image-viewer img")?.src).toContain("fresh");
 await mount("B");const beforeDetached=replies.length;preview.focus();await expect(executeCommand("preview-conversation-image")).rejects.toThrow();expect(replies).toHaveLength(beforeDetached);
});
