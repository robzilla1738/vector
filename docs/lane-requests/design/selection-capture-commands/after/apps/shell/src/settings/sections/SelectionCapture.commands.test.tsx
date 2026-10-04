// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { COMMANDS, defaultSelectionCaptureSettings } from "@aux/contracts";
import { bridge } from "../../bridge";
import { useStore } from "../../store";
import { invokeScopedControl } from "../../scoped-control-commands";
import { reportCommandCompletionFailure } from "../../command-completion";
import { SelectionCaptureSettings } from "./SelectionCapture";
const ids = ["save-selection-capture-settings", "reload-selection-capture-settings", "toggle-selection-action", "move-selection-action-up", "move-selection-action-down", "preview-selection-action", "remove-selection-action", "add-selection-action", "close-selection-action-preview", "record-selection-capture-shortcut", "disable-selection-capture-shortcut", "toggle-inline-assist"];
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
let settings: { selectionCapture: ReturnType<typeof defaultSelectionCaptureSettings> }, active: boolean;
const save = vi.fn();
const originalBridge = { windowId: bridge.windowId, windowKind: bridge.windowKind, privateMode: bridge.privateMode };
let originalConnected: boolean;
const held = <T,>() => { let resolve!: (value: T) => void, reject!: (reason: unknown) => void; const promise = new Promise<T>((a,b) => { resolve=a; reject=b; }); return {promise,resolve,reject}; };
const named = (label: string) => host.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!;
const button = (label: string) => [...host.querySelectorAll<HTMLButtonElement>("button")].find(node => node.textContent?.trim() === label)!;
const template = () => host.querySelector<HTMLTextAreaElement>('[aria-label="Action 1 template"]')!;
async function render() { await act(async () => root.render(<SelectionCaptureSettings active={active} settings={settings} onSave={save}/>)); }
async function write(text: string) { await act(async () => { Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,"value")!.set!.call(template(),text); template().dispatchEvent(new Event("input",{bubbles:true})); }); }
async function invoke(id: string, element: HTMLElement) { let result: unknown; await act(async () => { element.focus(); result=invokeScopedControl(id); }); return result; }
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);
  vi.spyOn(HTMLElement.prototype,"getClientRects").mockReturnValue([{width:160,height:36}] as unknown as DOMRectList);
  bridge.windowId="original"; bridge.windowKind="normal"; bridge.privateMode=false;
  originalConnected=useStore.getState().connected;
  useStore.setState({connected:true});
  settings={selectionCapture:defaultSelectionCaptureSettings()}; active=true; save.mockReset().mockResolvedValue(true);
  host=document.createElement("div"); document.body.append(host); root=createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); Object.assign(bridge,originalBridge); useStore.setState({connected:originalConnected}); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
it("registers exactly twelve focused normal Settings commands without adding shortcuts", () => {
  for(const id of ids) { const rows=COMMANDS.filter(row=>row.id===id); expect(rows).toHaveLength(1); expect(rows[0]).toMatchObject({handler:"shell",section:"Application",dispatch:"scoped",focusShell:true,palette:false,windows:["normal"],bindings:[],intercept:true}); }
});
it("uses the exact focused original row for moves/preview/removal and retains local-only content", async () => {
  const native=vi.spyOn(bridge,"invoke");
  await render();
  await invoke("move-selection-action-up",named("Move Explain up"));
  expect(host.querySelector<HTMLInputElement>('[aria-label="Action 1 name"]')!.value).toBe("Explain");
  await invoke("preview-selection-action",button("Preview Explain"));
  expect(host.querySelector('[aria-label="Selection action preview"]')!.textContent).toContain("Local preview · example content");
  await invoke("close-selection-action-preview",button("Close preview"));
  await invoke("remove-selection-action",named("Remove Explain"));
  expect(host.querySelectorAll("textarea")).toHaveLength(3);
  expect(document.activeElement).toBe(button("Add selection action"));
  expect(save).not.toHaveBeenCalled(); expect(native).not.toHaveBeenCalled();
});
it("requires current-window admission before an original save dispatch", async () => {
  await render(); await write("Draft to preserve {text}");
  button("Save Selection & Capture").focus(); bridge.windowId="replacement";
  expect(()=>invokeScopedControl("save-selection-capture-settings")).toThrow("current");
  expect(save).not.toHaveBeenCalled();
});
it("reserves same-tick saves and returns the original false ACK with retained draft", async () => {
  await render(); await write("Same tick {text}");
  const old=held<boolean>(); save.mockReturnValueOnce(old.promise);
  button("Save Selection & Capture").focus(); let completion!: Promise<unknown>;
  await act(async()=>{ completion=invokeScopedControl("save-selection-capture-settings") as Promise<unknown>; expect(()=>invokeScopedControl("save-selection-capture-settings")).toThrow("current"); });
  expect(save).toHaveBeenCalledTimes(1);
  await act(async()=>old.resolve(false)); expect(await completion).toBe(false);
  expect(template().value).toBe("Same tick {text}"); expect(host.textContent).toContain("Your edits are still here");
});
it("does not let retired success overwrite a fresh window draft or clear its pending save", async () => {
  await render(); await write("Original draft {text}");
  const old=held<boolean>(), fresh=held<boolean>(); save.mockReturnValueOnce(old.promise).mockReturnValueOnce(fresh.promise);
  button("Save Selection & Capture").focus(); let oldCompletion!: Promise<unknown>, freshCompletion!: Promise<unknown>;
  await act(async()=>{ oldCompletion=invokeScopedControl("save-selection-capture-settings") as Promise<unknown>; });
  bridge.windowId="replacement"; await render(); await write("Fresh draft {text}");
  button("Save Selection & Capture").focus(); await act(async()=>{ freshCompletion=invokeScopedControl("save-selection-capture-settings") as Promise<unknown>; });
  await act(async()=>old.resolve(true)); expect(await oldCompletion).toBe(true);
  expect(template().value).toBe("Fresh draft {text}"); expect(button("Saving…").disabled).toBe(true); expect(host.textContent).not.toContain("Saved for this Profile");
  await act(async()=>fresh.resolve(false)); expect(await freshCompletion).toBe(false);
  expect(template().value).toBe("Fresh draft {text}"); expect(host.textContent).toContain("Your edits are still here");
});
it("returns a retired original rejection without publishing it after committed Private ABA", async () => {
  await render(); await write("Original draft {text}");
  const old=held<boolean>(); save.mockReturnValueOnce(old.promise); button("Save Selection & Capture").focus(); let completion!: Promise<unknown>;
  await act(async()=>{completion=invokeScopedControl("save-selection-capture-settings") as Promise<unknown>;});
  const reason=new Error("Original protected transport <diagnostic>"); const observed=completion.catch(error=>error);
  bridge.privateMode=true; await render(); bridge.privateMode=false; await render();
  await write("Current draft {text}"); await act(async()=>old.reject(reason)); expect(await observed).toBe(reason);
  const errors=vi.fn(); reportCommandCompletionFailure(completion,reason,errors); expect(errors).not.toHaveBeenCalled();
  expect(host.textContent).not.toContain(reason.message); expect(template().value).toBe("Current draft {text}");
});
it("retains actual external-revision conflict and suppresses stale acknowledged delivery", async () => {
  await render(); await write("My unsaved source {text}");
  const old=held<boolean>(); save.mockReturnValueOnce(old.promise); button("Save Selection & Capture").focus(); let completion!: Promise<unknown>;
  await act(async()=>{completion=invokeScopedControl("save-selection-capture-settings") as Promise<unknown>;});
  settings={selectionCapture:{...settings.selectionCapture,revision:1,inlineAssist:false}}; await render();
  await act(async()=>old.resolve(true)); expect(await completion).toBe(true);
  expect(template().value).toBe("My unsaved source {text}"); expect(host.textContent).toContain("changed in another window"); expect(host.textContent).not.toContain("Saved for this Profile");
  await invoke("reload-selection-capture-settings",button("Reload saved settings"));
  expect(template().value).not.toContain("My unsaved");
});
it("retires recording across connected incarnation and retains genuine Escape/modified-key input semantics", async () => {
  await render(); const record=named("Record region-capture shortcut"); await invoke("record-selection-capture-shortcut",record);
  await act(async () => useStore.setState({connected:false})); await render(); await act(async () => useStore.setState({connected:true})); await render();
  await act(async()=>record.dispatchEvent(new KeyboardEvent("keydown",{key:"9",metaKey:true,altKey:true,bubbles:true})));
  expect(host.textContent).toContain("Off. No capture shortcut requested.");
  await invoke("record-selection-capture-shortcut",record);
  await act(async()=>record.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true})));
  expect(record.textContent).toBe("Record shortcut");
  await invoke("record-selection-capture-shortcut",record);
  await act(async()=>record.dispatchEvent(new KeyboardEvent("keydown",{key:"9",metaKey:true,altKey:true,bubbles:true})));
  await invoke("save-selection-capture-settings",button("Save Selection & Capture"));
  expect(save.mock.calls[0]![0].selectionCapture.regionCapture).toEqual({key:"9",command:true,ctrl:false,alt:true,shift:false});
});

it("reproduces the original late-ACK busy leak using actual Save clicks after window retirement", async () => {
  await render(); await write("Original pending action {text}");
  const old=held<boolean>(); save.mockReturnValueOnce(old.promise);
  await act(async()=>button("Save Selection & Capture").click());
  expect(template().disabled).toBe(true);
  bridge.windowId="replacement"; await render();
  try { expect(template().disabled).toBe(false); }
  finally { await act(async()=>old.resolve(true)); }
  expect(host.textContent).not.toContain("Saved for this Profile");
});
it("dispatches original checkbox, add and shortcut-disable controls without native capture", async () => {
  await render(); const native=vi.spyOn(bridge,"invoke");
  const enabled=host.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
  await invoke("toggle-selection-action",enabled); expect(enabled.checked).toBe(false);
  const inline=[...host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')].at(-1)!;
  const previous=inline.checked; await invoke("toggle-inline-assist",inline); expect(inline.checked).toBe(!previous);
  const count=host.querySelectorAll("textarea").length;
  await invoke("add-selection-action",button("Add selection action")); expect(host.querySelectorAll("textarea")).toHaveLength(count+1);
  const record=named("Record selection double-tap shortcut");
  await invoke("record-selection-capture-shortcut",record);
  await act(async()=>record.dispatchEvent(new KeyboardEvent("keydown",{key:"9",metaKey:true,altKey:true,bubbles:true})));
  const off=button("Turn off"); expect(off).toBeDefined(); await invoke("disable-selection-capture-shortcut",off);
  await invoke("save-selection-capture-settings",button("Save Selection & Capture"));
  expect(save.mock.calls[0]![0].selectionCapture.selectionDoubleTap).toBe(null);
  expect(save.mock.calls[0]![0].selectionCapture.inlineAssist).toBe(!previous);
  expect(native).not.toHaveBeenCalled();
});
it("preserves a synchronous original save rejection and recovers through the same registered Save",async()=>{
  await render(); await write("Recover my draft {text}"); const reason=new Error("Original synchronous save failure");
  save.mockImplementationOnce(()=>{throw reason;}); button("Save Selection & Capture").focus(); let completion!:Promise<unknown>;
  await act(async()=>{ completion=invokeScopedControl("save-selection-capture-settings") as Promise<unknown>; await expect(completion).rejects.toBe(reason); });
  expect(template().value).toBe("Recover my draft {text}"); expect(host.textContent).toContain(reason.message);
  expect(button("Save Selection & Capture").disabled).toBe(false);
  expect(await invoke("save-selection-capture-settings",button("Save Selection & Capture"))).toBe(true);
  expect(host.textContent).toContain("Saved for this Profile");
});

it("validates and saves the exact latest same-tick original draft",async()=>{
  await render(); await write("Earlier edited draft {text}"); const target=template(); let completion!:Promise<unknown>;
  await act(async()=>{
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,"value")!.set!.call(target,"Latest original draft {text}");
    target.dispatchEvent(new Event("input",{bubbles:true}));
    button("Save Selection & Capture").focus(); completion=invokeScopedControl("save-selection-capture-settings") as Promise<unknown>; await completion;
  });
  expect(save.mock.calls[0]![0].selectionCapture.actions[0].template).toBe("Latest original draft {text}");
});
