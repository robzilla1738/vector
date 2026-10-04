// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { DEFAULT_NIGHT_SHIFT } from "@aux/contracts";
vi.mock("../../use-feature", () => ({ featureStage: (feature: string) => feature === "overnightReview" ? "on" : "off", useFeature: () => false }));
import { bridge } from "../../bridge";
import { useStore } from "../../store";
import { NightSettings } from "./NightSettings";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(() => vi.restoreAllMocks());

function view() {
  const initial = useStore.getState();
  const saved = { ...DEFAULT_NIGHT_SHIFT, enabled: false, nightlyUsd: 0.5, perTaskUsd: 0.2 };
  useStore.setState({ settings: { ...initial.settings, nightShift: saved } });
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  const save = () => host.querySelector<HTMLButtonElement>("button")!;
  return { saved, host, root, save, close: async () => { await act(async () => root.unmount()); host.remove(); useStore.setState(initial, true); } };
}

it("awaits the actual registered settings command and keeps policy unchanged until its native acknowledgement", async () => {
  const f = view();
  let acknowledge!: (value: unknown) => void;
  const held = new Promise(resolve => { acknowledge = resolve; });
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async method => {
    if (method !== "settings.set") throw new Error(`Unexpected call ${method}`);
    return held;
  });
  try {
    await act(async () => f.root.render(<NightSettings />));
    await act(async () => f.host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
    await act(async () => f.save().click());
    expect(invoke).toHaveBeenCalledExactlyOnceWith("settings.set", { nightShift: { ...f.saved, enabled: true } });
    expect(f.save().disabled).toBe(true);
    expect(f.save().textContent).toBe("Saving…");
    expect([...f.host.querySelectorAll<HTMLInputElement>("input")].every(input => input.disabled)).toBe(true);
    expect(useStore.getState().settings.nightShift).toEqual(f.saved);
    await act(async () => f.save().click());
    expect(invoke).toHaveBeenCalledTimes(1);
    await act(async () => acknowledge({}));
    expect(useStore.getState().settings.nightShift).toEqual({ ...f.saved, enabled: true });
    expect(f.save().disabled).toBe(false);
    expect(f.host.querySelector('[role="alert"]')).toBeNull();
  } finally { acknowledge({}); await f.close(); }
});

it("retains the edited policy after a rejected native save and retries through the same real command", async () => {
  const f = view();
  let reject!: (reason: Error) => void;
  const held = new Promise((_resolve, fail) => { reject = fail; });
  const invoke = vi.spyOn(bridge, "invoke").mockImplementationOnce(async () => held).mockResolvedValue({});
  try {
    await act(async () => f.root.render(<NightSettings />));
    await act(async () => f.host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
    await act(async () => f.save().click());
    await act(async () => reject(new Error("Native authority retirement was not acknowledged.")));
    expect(f.host.querySelector('[role="alert"]')?.textContent).toBe("Night shift settings could not be saved. Native authority retirement was not acknowledged.");
    expect(f.save().disabled).toBe(false);
    expect(f.host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked).toBe(true);
    expect(useStore.getState().settings.nightShift).toEqual(f.saved);
    await act(async () => f.save().click());
    expect(invoke).toHaveBeenNthCalledWith(2, "settings.set", { nightShift: { ...f.saved, enabled: true } });
    expect(useStore.getState().settings.nightShift).toEqual({ ...f.saved, enabled: true });
    expect(f.host.querySelector('[role="alert"]')).toBeNull();
  } finally { reject(new Error("Fixture cleanup")); await f.close(); }
});

import { beforeEach } from "vitest";
import { dispatchShortcut, executeCommand } from "../../commands";
import { COMMANDS } from "@aux/contracts";
beforeEach(() => { vi.spyOn(HTMLElement.prototype,"getClientRects").mockReturnValue([{width:10,height:10} as DOMRect] as unknown as DOMRectList); });
function held<T>() { let resolve!:(value:T)=>void; let reject!:(reason:unknown)=>void; const promise=new Promise<T>((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}; }
it("registers focused draft Save and both policy toggles without palette entries", () => {
  for(const id of ["save-night-shift-draft","toggle-night-shift-enabled","toggle-night-shift-ac"]) expect(COMMANDS.find(row=>row.id===id)).toMatchObject({feature:"overnightReview",palette:false,windows:["normal"],bindings:[],intercept:true});
});
it("uses actual focused registered toggles and returns the original native Save acknowledgement", async () => {
  const f=view(); const ack={}; vi.spyOn(bridge,"invoke").mockResolvedValue(ack);
  try {
    await act(async()=>f.root.render(<NightSettings/>));
    f.host.querySelector<HTMLInputElement>('[data-command-id="toggle-night-shift-enabled"]')!.focus();
    await act(async()=>{await executeCommand("toggle-night-shift-enabled");});
    f.host.querySelector<HTMLInputElement>('[data-command-id="toggle-night-shift-ac"]')!.focus();
    await act(async()=>{expect(dispatchShortcut({commandId:"toggle-night-shift-ac",key:"a",meta:true,ctrl:false,shift:true,alt:false})).toBe(true);});
    f.save().focus(); await act(async()=>expect(await executeCommand("save-night-shift-draft")).toBe(ack));
    expect(useStore.getState().settings.nightShift).toEqual({...f.saved,enabled:true,requireAC:!f.saved.requireAC});
  } finally {await f.close();}
});
it("keeps the identical rejected Save completion and edited draft for retry", async () => {
  const f=view();const reason=new Error("native refused");vi.spyOn(bridge,"invoke").mockRejectedValueOnce(reason).mockResolvedValue({});
  try {await act(async()=>f.root.render(<NightSettings/>));await act(async()=>f.host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());f.save().focus();await act(async()=>expect(executeCommand("save-night-shift-draft")).rejects.toBe(reason));expect(f.host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked).toBe(true);expect(f.save().disabled).toBe(false);await act(async()=>f.save().click());expect(useStore.getState().settings.nightShift).toMatchObject({enabled:true});}finally{await f.close();}
});
it("refuses hidden or unfocused original controls before writing policy", async () => {
  const f=view();const invoke=vi.spyOn(bridge,"invoke").mockResolvedValue({});try{await act(async()=>f.root.render(<NightSettings/>));await expect(executeCommand("save-night-shift-draft")).rejects.toThrow();f.save().focus();f.host.hidden=true;await expect(executeCommand("save-night-shift-draft")).rejects.toThrow();expect(invoke).not.toHaveBeenCalled();}finally{await f.close();}
});
for(const retirement of ["Private","window"] as const) it(`refuses late Save error delivery across ${retirement} A→B→A`, async () => {
  const f=view();const pending=held<unknown>();const oldPrivate=bridge.privateMode,oldWindow=bridge.windowId;vi.spyOn(bridge,"invoke").mockReturnValueOnce(pending.promise);
  try {
    await act(async()=>f.root.render(<NightSettings/>));await act(async()=>f.save().click());
    if(retirement==="Private")bridge.privateMode=true;else bridge.windowId="other-window";
    await act(async()=>f.root.render(<NightSettings/>));bridge.privateMode=oldPrivate;bridge.windowId=oldWindow;await act(async()=>f.root.render(<NightSettings/>));
    await act(async()=>pending.reject(new Error("retired native save")));
    expect(f.host.querySelector('[role="alert"]')).toBeNull();expect(f.save().disabled).toBe(false);expect(useStore.getState().settings.nightShift).toEqual(f.saved);
  }finally{bridge.privateMode=oldPrivate;bridge.windowId=oldWindow;pending.reject(new Error("cleanup"));await f.close();}
});
it("an old Save finally cannot release the pending state of a fresh owner", async () => {
  const f=view();const old=held<unknown>(),fresh=held<unknown>();const originalWindow=bridge.windowId;vi.spyOn(bridge,"invoke").mockReturnValueOnce(old.promise).mockReturnValueOnce(fresh.promise);
  try{await act(async()=>f.root.render(<NightSettings/>));await act(async()=>f.save().click());bridge.windowId="other-window";await act(async()=>f.root.render(<NightSettings/>));bridge.windowId=originalWindow;await act(async()=>f.root.render(<NightSettings/>));await act(async()=>f.save().click());await act(async()=>old.reject(new Error("old save")));expect(f.save().disabled).toBe(true);expect(f.host.querySelector('[role="alert"]')).toBeNull();await act(async()=>fresh.resolve({}));expect(f.save().disabled).toBe(false);}finally{bridge.windowId=originalWindow;old.reject(new Error("cleanup"));fresh.resolve({});await f.close();}
});
it("retains a retired rejection after the original saved policy changes", async () => {
  const f=view();const pending=held<unknown>();const reason=new Error("retired native failure");vi.spyOn(bridge,"invoke").mockReturnValueOnce(pending.promise);
  try{await act(async()=>f.root.render(<NightSettings/>));f.save().focus();let completion!:Promise<unknown>,failure!:Promise<unknown>;await act(async()=>{completion=executeCommand("save-night-shift-draft");failure=completion.catch(error=>error);});await act(async()=>useStore.setState(state=>({settings:{...state.settings,nightShift:{...f.saved,nightlyUsd:0.9}}})));await act(async()=>pending.reject(reason));expect(await failure).toBe(reason);expect(f.host.querySelector('[role="alert"]')).toBeNull();expect(useStore.getState().settings.nightShift).toMatchObject({nightlyUsd:0.9});}finally{pending.reject(reason);await f.close();}
});
