// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { COMMANDS, type ConversationSource, type ConversationAttachment, type ConversationArtifact } from "@aux/contracts";
import { bridge, type BrowserProfile } from "../bridge";
import { useStore } from "../store";
import { executeCommand, dispatchShortcut } from "../commands";
import { makePage, makeRun } from "../mock/fixtures";
import { Conversation } from "./Conversation";

const initial = useStore.getState(), windowId = bridge.windowId;
const scroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
let host: HTMLDivElement, root: ReturnType<typeof createRoot>, sources: ConversationSource[], documents: ConversationAttachment[], artifacts: ConversationArtifact[];
const url = "http://127.0.0.1:3210/original-source";
const profiles: BrowserProfile[] = [{ id: "own-profile", name: "Personal", current: true }, { id: "work-profile", name: "Work", current: false }];
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{ width: 100 }] as unknown as DOMRectList);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(1100);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callback(0); return 1; }); vi.stubGlobal("cancelAnimationFrame", () => {});
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  documents = [{attachmentId:"doc-a",filename:"Original document.txt",excerpt:"Original text",byteLength:12,createdAt:1,included:true}];
  artifacts = [{artifactId:"result-a",runId:"run-a",filename:"Original result.md",mediaType:"text/markdown",excerpt:"Original result",byteLength:15,createdAt:1,turnGoal:"Original goal",included:true,revision:1}];
  sources = [{ kind: "browser", sourceId: "original-source", runId: "run-a", pageId: "page-1", url, title: "Original recorded source", documentEpoch: 7, revision: 3, observedAt: 1 }];
  const runs = ["a", "b"].map(chat => makeRun({ runId: `run-${chat}`, config: { chatId: chat }, pageIds: [], status: "completed", result: { answer: `[Read recorded source](${url})` } }));
  useStore.setState({ ...initial, runs, steps: {}, pages: [makePage(0, { url, documentEpoch: 7, windowId })], activePageId: "page-1", connected: true, toasts: [], pendingTurns: [], prompt: null, conversationDrafts: { "chat:a": "Keep A draft", "chat:b": "Keep B draft" }, conversationContexts: {} }, true);
  vi.spyOn(bridge, "onEvent").mockImplementation(() => () => {}); vi.spyOn(bridge, "overlay").mockResolvedValue(false); vi.spyOn(bridge, "focusShell").mockResolvedValue(undefined);
  vi.spyOn(bridge, "browserProfiles").mockResolvedValue(profiles); vi.spyOn(bridge, "openBrowserProfileUrl").mockResolvedValue(true);
  vi.spyOn(bridge, "invoke").mockImplementation(async (method, params) => {
    const chat = (params as { chatId?: string }).chatId;
    if (method === "runs.list") return runs.filter(run => run.config?.chatId === chat);
    if (method === "runs.get") return { run: useStore.getState().runs.find(run => run.runId === (params as { runId: string }).runId)!, steps: [], suspension: null };
    if (method === "conversations.get") return { title: "Original chat", archived: false };
    if (method === "runs.messages.list") return [];
    if (method === "conversations.artifacts.get") return { artifacts: chat === "a" ? artifacts : [] };
    if (method === "conversations.images.get") return { images: [] };
    if (method === "conversations.attachments.get") return { attachments: chat === "a" ? documents : [] };
    if (method === "conversations.attachments.read") return { attachment:documents[0], content:"Original text", contextCharacters:12 };
    if (method === "results.read") return { ...artifacts[0],chatId:"a",content:"Original result" };
    if (method === "conversations.sources.get") return { sources: chat === "a" ? sources : [] };
    if (method === "runs.context.get") return { entries: [], historyEnabled: true };
    return { workspace: null, memory: null };
  });
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount()); host.remove(); useStore.setState(initial, true); bridge.windowId = windowId; vi.restoreAllMocks(); vi.unstubAllGlobals();
  if (scroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", scroll); else delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
});
async function render(chat = "a") { await act(async () => root.render(<Conversation chatId={chat}/>)); }

const control = (id:string) => host.querySelector<HTMLElement>(`[data-command-id="${id}"]`)!;
async function dispatch(command:string) { let completion!:Promise<unknown>; await act(async () => { control(command).focus(); completion = executeCommand(command); void completion.catch(() => {}); }); return {completion}; }
function hold(method:string) {
  const original = vi.mocked(bridge.invoke).getMockImplementation()!;
  const pending:{resolve(value:unknown):void;reject(reason:unknown):void;params:unknown}[] = [];
  vi.mocked(bridge.invoke).mockImplementation((name,params) => name===method ? new Promise((resolve,reject) => pending.push({resolve,reject,params})) : original(name,params));
  return pending;
}
const toggle = "toggle-conversation-document", remove = "remove-conversation-document", result = "toggle-conversation-result";
it("document/result original mounted previews retain draft, transcript and original read IDs",async () => {
  await render(); const input=host.querySelector("textarea"), drafts=useStore.getState().conversationDrafts;
  await dispatch("preview-conversation-document"); expect(bridge.invoke).toHaveBeenCalledWith("conversations.attachments.read",{chatId:"a",attachmentId:"doc-a"});
  await dispatch("preview-conversation-result"); expect(useStore.getState().resultPreview).toBe("result-a"); expect(bridge.invoke).toHaveBeenCalledWith("results.read",{artifactId:"result-a"});
  expect(host.querySelector("textarea")).toBe(input); expect(useStore.getState().conversationDrafts).toBe(drafts);
});
it.each([toggle,remove,result])("%s retains exact native args and admitted ACK",async command => {
  await render(); const method=command===result ? "conversations.artifacts.toggle" : command===remove ? "conversations.attachments.remove" : "conversations.attachments.toggle";
  const pending=hold(method), original=await dispatch(command);
  expect(pending).toHaveLength(1); expect(pending[0]!.params).toEqual(command===result ? {chatId:"a",artifactId:"result-a",included:false} : command===remove ? {chatId:"a",attachmentId:"doc-a"} : {chatId:"a",attachmentId:"doc-a",included:false});
  const ack=command===result ? {artifacts:[{...artifacts[0]!,included:false}]} : {attachments:command===remove ? [] : [{...documents[0]!,included:false}]};
  await act(async () => {if ("attachments" in ack) documents=ack.attachments!; else artifacts=ack.artifacts; pending[0]!.resolve(ack);}); await expect(original.completion).resolves.toBe(ack);
  expect({present:!!control(toggle),checked:(control(command) as HTMLInputElement|null)?.checked}).toEqual(command===remove ? {present:false,checked:undefined} : {present:true,checked:false});
  expect(useStore.getState().conversationDrafts["chat:a"]).toBe("Keep A draft");
});
it("native checkbox original click preserves actual selected included payload",async () => {
  await render(); const pending=hold("conversations.attachments.toggle"); await act(async () => control(toggle).click()); expect(pending[0]!.params).toEqual({chatId:"a",attachmentId:"doc-a",included:false});
  await act(async () => {documents=[{...documents[0]!,included:false}];pending[0]!.resolve({attachments:documents});}); expect((control(toggle) as HTMLInputElement).checked).toBe(false);
});
it("same tick duplicate and shared document/result busy refuse second native mutation",async () => {
  await render(); const pending=hold("conversations.attachments.toggle"), original=await dispatch(toggle); await expect(executeCommand(toggle)).rejects.toThrow(); await expect(executeCommand(result)).rejects.toThrow(); expect(pending).toHaveLength(1);
  expect(control(remove).hasAttribute("disabled")).toBe(true); expect(control(result).hasAttribute("disabled")).toBe(true); await act(async () => pending[0]!.resolve({attachments:documents})); await original.completion;
});
it("held A→B→A document reply cannot publish old records or clear newer busy",async () => {
  await render(); const pending=hold("conversations.attachments.toggle"), old=await dispatch(toggle); await render("b"); await render("a"); const fresh=await dispatch(toggle); expect(pending).toHaveLength(2);
  const oldAck={attachments:[{...documents[0]!,filename:"Retired record",included:false}]}; await act(async () => pending[0]!.resolve(oldAck)); await expect(old.completion).resolves.toBe(oldAck);
  expect(host.textContent).not.toContain("Retired record"); expect(control(toggle).hasAttribute("disabled")).toBe(true); expect(host.querySelector(".attachment-progress")).not.toBeNull();
  await act(async () => pending[1]!.resolve({attachments:[{...documents[0]!,included:false}]})); await fresh.completion; expect(control(toggle).hasAttribute("disabled")).toBe(false);
});
it("held original result click across A→B→A cannot publish retired result or release newer busy",async () => {
  await render(); const pending=hold("conversations.artifacts.toggle"); await act(async () => control(result).click()); await render("b"); await render("a"); await act(async () => control(result).click()); expect(pending).toHaveLength(2);
  await act(async () => pending[0]!.resolve({artifacts:[{...artifacts[0]!,filename:"Retired result",included:false}]}));
  expect(host.textContent).not.toContain("Retired result"); expect(control(result).hasAttribute("disabled")).toBe(true); expect(host.querySelector(".attachment-progress")).not.toBeNull();
  await act(async () => pending[1]!.resolve({artifacts:[{...artifacts[0]!,included:false}]})); expect(control(result).hasAttribute("disabled")).toBe(false);
});
it("held result error after A→B→A retains exact rejection without stale toast or clearing fresh busy",async () => {
  await render(); const pending=hold("conversations.artifacts.toggle"), old=await dispatch(result); await render("b"); await render("a"); const fresh=await dispatch(result), reason=new Error("Original retained result rejection");
  await act(async () => pending[0]!.reject(reason)); await expect(old.completion).rejects.toBe(reason); expect(useStore.getState().toasts).toEqual([]); expect(control(result).hasAttribute("disabled")).toBe(true);
  await act(async () => pending[1]!.resolve({artifacts:[{...artifacts[0]!,included:false}]})); await fresh.completion; expect(control(result).hasAttribute("disabled")).toBe(false);
});
it("observed foreign window retirement refuses restored old control and held ACK publication",async () => {
  await render(); const pending=hold("conversations.attachments.toggle"), old=await dispatch(toggle); bridge.windowId="foreign";
  await act(async () => control("preview-conversation-document").click()); bridge.windowId=windowId;
  await expect(executeCommand("preview-conversation-document")).rejects.toThrow(); const ack={attachments:[{...documents[0]!,filename:"Retired foreign record"}]}; await act(async () => pending[0]!.resolve(ack)); await expect(old.completion).resolves.toBe(ack); expect(host.textContent).not.toContain("Retired foreign record"); expect(useStore.getState().toasts).toEqual([]);
});
it("original admitted remove failure after A→B→A cannot publish stale error",async () => {
  await render(); const pending=hold("conversations.attachments.remove"); await act(async () => control(remove).click()); await render("b"); await render("a"); await act(async () => pending[0]!.reject(new Error("Retired original remove failure"))); expect(useStore.getState().toasts).toEqual([]); expect(control(remove).hasAttribute("disabled")).toBe(false);
});
it("current native rejection retains identity and actual click reports once",async () => {
  await render(); const pending=hold("conversations.attachments.remove"), reason=new Error("Original remove rejected"); await act(async () => control(remove).click()); await act(async () => pending[0]!.reject(reason)); expect(useStore.getState().toasts).toHaveLength(1); expect(useStore.getState().toasts[0]!.text).toContain(reason.message); expect(control(remove).hasAttribute("disabled")).toBe(false);
  const original=await dispatch(remove); await act(async () => pending[1]!.reject(reason)); await expect(original.completion).rejects.toBe(reason);
});
it("focused remapped preview and result choice preserve disconnected existing controls",async () => {
  await render(); act(() => useStore.setState({connected:false,settings:{...useStore.getState().settings,shortcutOverrides:{"preview-conversation-document":[{key:"j",command:true,alt:true}],"toggle-conversation-result":[{key:"k",command:true,alt:true}]}}}));
  await act(async () => {control("preview-conversation-document").focus();expect(dispatchShortcut({key:"j",meta:true,alt:true,shift:false})).toBe(true);}); expect(bridge.invoke).toHaveBeenCalledWith("conversations.attachments.read",{chatId:"a",attachmentId:"doc-a"});
  expect(control(result).hasAttribute("disabled")).toBe(true);
  await act(async () => useStore.setState({connected:true}));
  const pending=hold("conversations.artifacts.toggle"); await act(async () => {control(result).focus();expect(dispatchShortcut({key:"k",meta:true,alt:true,shift:false})).toBe(true);}); expect(pending[0]!.params).toEqual({chatId:"a",artifactId:"result-a",included:false}); await act(async () => pending[0]!.resolve({artifacts:artifacts}));
});
it("hidden preview and detached original element cannot gain mutation authority",async () => {
  await render(); vi.spyOn(control("preview-conversation-document"),"getClientRects").mockReturnValue([] as unknown as DOMRectList); control("preview-conversation-document").focus(); await expect(executeCommand("preview-conversation-document")).rejects.toThrow(); expect(useStore.getState().resultPreview).toBeNull();
  const original=control(remove); original.remove(); original.focus(); await expect(executeCommand(remove)).rejects.toThrow(); expect(bridge.invoke).not.toHaveBeenCalledWith("conversations.attachments.remove",expect.anything());
});
it("five metadata rows remain normal scoped and remappable",() => {for(const id of ["preview-conversation-document",toggle,remove,"preview-conversation-result",result]) expect(COMMANDS.find(row=>row.id===id)).toMatchObject({palette:false,windows:["normal"]});});
