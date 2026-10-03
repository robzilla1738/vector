// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { COMMANDS, effectiveShortcuts, matchShortcut, type WorkspaceMemory } from "@aux/contracts";
import { SpaceMemoryEditor } from "./SpaceMemoryEditor";
import { useMemoryDrafts } from "../memory-drafts";
import { executeCommand } from "../commands";
const mocks = vi.hoisted(() => ({ call: vi.fn(), privateMode: false }));
vi.mock("../bridge", async original => { const actual = await original<typeof import("../bridge")>(); return { ...actual, bridge: { ...actual.bridge, windowKind: "normal", get privateMode() { return mocks.privateMode; }, onEvent: () => () => {} } }; });
vi.mock("../store", async original => ({ ...await original<typeof import("../store")>(), call: mocks.call }));
vi.mock("./BrowsingMemory", () => ({ BrowsingMemory: () => null }));
vi.mock("./ContentMemory", () => ({ ContentMemory: () => null }));
vi.mock("./MemoryItems", () => ({ MemoryItems: () => null }));
vi.mock("./MemoryRecoveryNotice", () => ({ MemoryRecoveryNotice: () => <output>Fresh backup needed</output> }));
const ids = ["save-space-memory", "clear-space-memory-draft", "discard-space-memory-draft", "use-saved-space-memory", "overwrite-space-memory", "toggle-space-memory-enabled", "toggle-space-memory-overview"] as const;
const original: WorkspaceMemory = { workspaceId: "original", content: "saved", revision: 3, enabled: true, items: [], excludedOrigins: [] };
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const onSaved = vi.fn();
function deferred<T>() { let resolve!: (value:T)=>void, reject!: (reason:unknown)=>void; const promise = new Promise<T>((yes,no) => { resolve=yes; reject=no; }); return {promise,resolve,reject}; }
async function render(memory=original, disabled=false) { await act(async () => root.render(<SpaceMemoryEditor memory={memory} disabled={disabled} onSaved={onSaved} />)); }
function button(label:string) { const found = [...host.querySelectorAll("button")].find(node => node.textContent === label); if (!found) throw new Error(label); return found; }
async function click(label:string) { await act(async () => button(label).click()); }
beforeEach(() => {
 vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
 vi.spyOn(HTMLElement.prototype,"getClientRects").mockImplementation(() => [{width:100}] as unknown as DOMRectList);
 mocks.privateMode=false; mocks.call.mockReset(); onSaved.mockReset(); useMemoryDrafts.setState({drafts:{},storageError:false});
 host=document.createElement("div"); document.body.append(host); root=createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.restoreAllMocks(); });
it.each(ids)("registers %s once with real remapping and no palette owner escape", id => {
 expect(COMMANDS.filter(row=>row.id===id)).toHaveLength(1);
 expect(COMMANDS.find(row=>row.id===id)).toMatchObject({palette:false,windows:["normal"],handler:"shell",bindings:[],intercept:true});
 expect(matchShortcut(effectiveShortcuts({[id]:[{key:"m",command:true,alt:true}]}),{key:"m",meta:true,alt:true,shift:false})?.id).toBe(id);
});
it("real buttons clear/discard only the original draft and disclose overview without RPC", async () => {
 await render(); await click("Clear notes"); expect(useMemoryDrafts.getState().drafts.original).toEqual({content:"",revision:3});
 await click("Discard draft"); expect(useMemoryDrafts.getState().drafts.original).toBeUndefined();
 const details=host.querySelector("details")!; expect(details.open).toBe(true); await act(async()=>host.querySelector("summary")!.click()); expect(details.open).toBe(false); expect(mocks.call).not.toHaveBeenCalled();
});
it("focused registered Save keeps newer draft and awaits original ACK", async () => {
 useMemoryDrafts.getState().write("original",{content:"submitted",revision:3}); await render();
 const hold=deferred<WorkspaceMemory>(); mocks.call.mockReturnValue(hold.promise); button("Save notes").focus();
 let completion!: Promise<unknown>; await act(async()=> { completion=executeCommand("save-space-memory",{payload:{scopeId:"original"}}); });
 expect(mocks.call).toHaveBeenCalledWith("workspaces.memory.set",{workspaceId:"original",expectedRevision:3,content:"submitted"}); expect(button("Saving…").disabled).toBe(true);
 await act(async()=>useMemoryDrafts.getState().write("original",{content:"newer",revision:3}));
 await act(async()=> { hold.resolve({...original,content:"submitted",revision:4}); await completion; });
 expect(useMemoryDrafts.getState().drafts.original).toEqual({content:"newer",revision:4}); expect(onSaved).toHaveBeenCalledOnce();
});
it("retired editor cannot publish late save or remove original draft", async () => {
 useMemoryDrafts.getState().write("original",{content:"draft",revision:3}); await render(); const hold=deferred<WorkspaceMemory>(); mocks.call.mockReturnValue(hold.promise); await click("Save notes"); expect(mocks.call).toHaveBeenCalledOnce();
 await render({...original,workspaceId:"replacement",revision:8}); await act(async()=>hold.resolve({...original,content:"draft",revision:4}));
 expect(onSaved).not.toHaveBeenCalled(); expect(useMemoryDrafts.getState().drafts.original).toEqual({content:"draft",revision:3});
});
it("save rejection preserves draft; explicit conflict overwrite uses observed saved revision", async () => {
 useMemoryDrafts.getState().write("original",{content:"draft",revision:3}); await render();
 mocks.call.mockRejectedValueOnce(new Error("revision conflict")).mockResolvedValueOnce({...original,content:"other",revision:5}); await click("Save notes");
 expect(host.querySelector('[role="alert"]')?.textContent).toBe("revision conflict"); expect(useMemoryDrafts.getState().drafts.original?.content).toBe("draft");
 mocks.call.mockResolvedValueOnce({...original,content:"draft",revision:6}); await click("Save my notes instead"); expect(mocks.call).toHaveBeenLastCalledWith("workspaces.memory.set",{workspaceId:"original",expectedRevision:5,content:"draft"}); expect(useMemoryDrafts.getState().drafts.original).toBeUndefined();
});
it("Use saved notes is explicit and enabled toggle preserves saved content plus draft", async () => {
 useMemoryDrafts.getState().write("original",{content:"draft",revision:3}); await render(); mocks.call.mockRejectedValueOnce(new Error("conflict")).mockResolvedValueOnce({...original,content:"other",revision:5}); await click("Save notes"); await click("Use saved notes");
 expect(onSaved).toHaveBeenLastCalledWith({...original,content:"other",revision:5}); expect(useMemoryDrafts.getState().drafts.original).toBeUndefined();
 await act(async()=>useMemoryDrafts.getState().write("original",{content:"new draft",revision:3})); mocks.call.mockResolvedValueOnce({...original,enabled:false,revision:4}); await act(async()=>host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
 expect(mocks.call).toHaveBeenLastCalledWith("workspaces.memory.set",{workspaceId:"original",expectedRevision:3,content:"saved",enabled:false}); expect(useMemoryDrafts.getState().drafts.original).toEqual({content:"new draft",revision:4});
});
it("foreign, hidden, disabled, private and unfocused controls refuse without writes", async () => {
 useMemoryDrafts.getState().write("original",{content:"draft",revision:3}); await render();
 await expect(executeCommand("save-space-memory")).rejects.toThrow("focused"); button("Save notes").focus();
 await expect(executeCommand("save-space-memory",{payload:{scopeId:"foreign"}})).rejects.toThrow("focused"); host.hidden=true;
 await expect(executeCommand("save-space-memory")).rejects.toThrow("focused"); host.hidden=false; await render(original,true);
 await expect(executeCommand("save-space-memory")).rejects.toThrow("focused"); await render(); button("Save notes").focus(); mocks.privateMode=true;
 await expect(executeCommand("save-space-memory")).rejects.toThrow("Space notes changed"); expect(mocks.call).not.toHaveBeenCalled();
});

it("original save ACK remains truthful after unmount without publishing or clearing draft", async () => {
 useMemoryDrafts.getState().write("original",{content:"draft",revision:3}); await render(); const hold=deferred<WorkspaceMemory>(); mocks.call.mockReturnValue(hold.promise); button("Save notes").focus();
 let completion!: Promise<unknown>; await act(async()=> { completion=executeCommand("save-space-memory"); }); expect(mocks.call).toHaveBeenCalledOnce();
 await act(async()=>root.render(null)); const saved={...original,content:"draft",revision:4}; await act(async()=> { hold.resolve(saved); expect(await completion).toBe(saved); });
 expect(onSaved).not.toHaveBeenCalled(); expect(useMemoryDrafts.getState().drafts.original).toEqual({content:"draft",revision:3});
});
it("same workspace revision replacement and same-text newer draft cannot be removed by old ACK", async () => {
 useMemoryDrafts.getState().write("original",{content:"draft",revision:3}); await render(); const hold=deferred<WorkspaceMemory>(); mocks.call.mockReturnValue(hold.promise); await click("Save notes"); expect(mocks.call).toHaveBeenCalledOnce();
 await act(async()=>useMemoryDrafts.getState().write("original",{content:"draft",revision:9})); await render({...original,revision:8}); await act(async()=>hold.resolve({...original,content:"draft",revision:4}));
 expect(onSaved).not.toHaveBeenCalled(); expect(useMemoryDrafts.getState().drafts.original).toEqual({content:"draft",revision:9});
});
it("a draft replacement before committed controls refresh refuses the stale command", async () => {
 useMemoryDrafts.getState().write("original",{content:"draft",revision:3}); await render(); button("Save notes").focus();
 await act(async()=> { useMemoryDrafts.getState().write("original",{content:"newer",revision:3}); await expect(executeCommand("save-space-memory")).rejects.toThrow("draft changed"); });
 expect(mocks.call).not.toHaveBeenCalled(); expect(useMemoryDrafts.getState().drafts.original?.content).toBe("newer");
});

it("same text from a newer draft revision is preserved after the original acknowledged write", async () => {
 useMemoryDrafts.getState().write("original",{content:"draft",revision:3}); await render(); const hold=deferred<WorkspaceMemory>(); mocks.call.mockReturnValue(hold.promise); await click("Save notes");
 await act(async()=>useMemoryDrafts.getState().write("original",{content:"draft",revision:9})); await act(async()=>hold.resolve({...original,content:"draft",revision:4}));
 expect(onSaved).toHaveBeenCalledWith({...original,content:"draft",revision:4}); expect(useMemoryDrafts.getState().drafts.original).toEqual({content:"draft",revision:9});
});
it("conflict/error presentation cannot be borrowed by a replacement workspace or revision", async () => {
 useMemoryDrafts.getState().write("original",{content:"draft",revision:3}); await render(); mocks.call.mockRejectedValueOnce(new Error("old conflict")).mockResolvedValueOnce({...original,revision:5,content:"other"}); await click("Save notes"); expect(button("Use saved notes")).toBeTruthy();
 await render({...original,revision:7}); expect(host.querySelector('[role="alert"]')).toBeNull(); expect(host.textContent).not.toContain("These notes changed elsewhere"); expect(onSaved).not.toHaveBeenCalled();
});

it.each(["workspace", "revision"])("returning to the original %s cannot revive a retired save ACK", async replacement => {
 useMemoryDrafts.getState().write("original",{content:"draft",revision:3}); await render();
 const hold=deferred<WorkspaceMemory>(); mocks.call.mockReturnValue(hold.promise); button("Save notes").focus();
 let completion!: Promise<unknown>; await act(async()=> { completion=executeCommand("save-space-memory"); });
 await render(replacement === "workspace" ? {...original,workspaceId:"other"} : {...original,revision:8});
 await render(); const saved={...original,content:"draft",revision:4};
 await act(async()=> { hold.resolve(saved); expect(await completion).toBe(saved); });
 expect(onSaved).not.toHaveBeenCalled(); expect(useMemoryDrafts.getState().drafts.original).toEqual({content:"draft",revision:3});
});
it.each(["workspace", "revision"])("returning to the original %s cannot revive a retired save failure", async replacement => {
 useMemoryDrafts.getState().write("original",{content:"draft",revision:3}); await render();
 const hold=deferred<WorkspaceMemory>(); mocks.call.mockReturnValue(hold.promise); button("Save notes").focus();
 let completion!: Promise<unknown>; await act(async()=> { completion=executeCommand("save-space-memory"); });
 await render(replacement === "workspace" ? {...original,workspaceId:"other"} : {...original,revision:8});
 await render();
 await act(async()=> { hold.reject(new Error("Original retired failure")); await expect(completion).rejects.toThrow("Original retired failure"); });
 expect(host.querySelector('[role="alert"]')).toBeNull(); expect(mocks.call).toHaveBeenCalledOnce();
 expect(useMemoryDrafts.getState().drafts.original).toEqual({content:"draft",revision:3});
});
