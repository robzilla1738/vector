// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const { downloadFolder, chooseDownloadFolder, state } = vi.hoisted(() => ({
  state: { privateMode: false, windowId: "window-a", available: true },
  downloadFolder: vi.fn(async () => ({ path: "/tmp/Downloads", custom: false })),
  chooseDownloadFolder: vi.fn(async (reset = false) => ({
    path: reset ? "/tmp/Downloads" : "/tmp/Aux exports",
    custom: !reset,
  })),
}));
vi.mock("../../bridge", async importOriginal => ({
  ...await importOriginal<typeof import("../../bridge")>(),
  bridge: { ...((await importOriginal<typeof import("../../bridge")>()).bridge), get privateMode() { return state.privateMode; }, get windowId() { return state.windowId; }, windowKind: "normal", downloadFolder, chooseDownloadFolder },
  get inMock() { return state.available; },
  inNativeHost: false,
}));

import { DownloadFolderSetting } from "./DownloadFolder";

it("shows the Profile folder and offers a reversible native folder choice", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => root.render(<DownloadFolderSetting active />));
    expect(downloadFolder).toHaveBeenCalledOnce();
    expect(container.textContent).toContain("/tmp/Downloads");
    await act(async () => container.querySelector<HTMLButtonElement>("button")!.click());
    expect(chooseDownloadFolder).toHaveBeenCalledWith(false);
    expect(container.textContent).toContain("/tmp/Aux exports");
    await act(async () => [...container.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent === "Use default")!.click());
    expect(chooseDownloadFolder).toHaveBeenCalledWith(true);
    expect(container.textContent).toContain("/tmp/Downloads");
  } finally {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  }
});

import { executeCommand } from "../../commands";
import { COMMANDS } from "@aux/contracts";
beforeEach(() => {
  state.privateMode = false; state.windowId = "window-a"; state.available = true;
  downloadFolder.mockReset().mockResolvedValue({ path: "/tmp/Downloads", custom: false });
  chooseDownloadFolder.mockReset().mockImplementation(async (reset = false) => ({ path: reset ? "/tmp/Downloads" : "/tmp/Aux exports", custom: !reset }));
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{ width: 10, height: 10 } as DOMRect] as unknown as DOMRectList);
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
async function mounted(test: (container: HTMLDivElement, render: (active?: boolean) => Promise<void>) => Promise<void>) {
  const container = document.createElement("div"); document.body.append(container); const root = createRoot(container);
  const render = async (active = true) => { await act(async () => root.render(<DownloadFolderSetting active={active} />)); };
  try { await render(); await test(container, render); } finally { await act(async () => root.unmount()); container.remove(); }
}
function deferred<T>() { let resolve!: (value: T) => void; let reject!: (reason: unknown) => void; const promise = new Promise<T>((a,b) => {resolve=a;reject=b}); return {promise,resolve,reject}; }
function button(container: HTMLElement, text = "Change folder…") { return [...container.querySelectorAll("button")].find(node => node.textContent === text)!; }
it("registers remappable normal-window scoped actions without palette owners", () => {
  for (const id of ["choose-download-folder", "reset-download-folder", "retry-download-folder"]) expect(COMMANDS.find(row => row.id === id)).toMatchObject({ palette: false, windows: ["normal"], bindings: [], intercept: true });
});
it("returns the identical chooser ACK through the focused registered command", async () => {
  const ack = {path:"/tmp/ack",custom:true}; chooseDownloadFolder.mockResolvedValueOnce(ack);
  await mounted(async container => { button(container).focus(); let completion!: Promise<unknown>; await act(async () => { completion=executeCommand("choose-download-folder"); expect(await completion).toBe(ack); }); expect(container.textContent).toContain(ack.path); });
});
it("retains the original rejected chooser and retries through a fresh read", async () => {
  const reason = new Error("folder unavailable"); chooseDownloadFolder.mockRejectedValueOnce(reason);
  await mounted(async container => { button(container).focus(); await act(async () => { await expect(executeCommand("choose-download-folder")).rejects.toBe(reason); }); expect(container.textContent).toContain(reason.message); await act(async () => button(container,"Retry").click()); expect(downloadFolder).toHaveBeenCalledTimes(2); expect(container.querySelector('[role="alert"]')).toBeNull(); });
});
for (const retirement of ["Private", "window", "inactive"] as const) it(`retires an old chooser irreversibly across ${retirement} A→B→A`, async () => {
  const held=deferred<{path:string;custom:boolean}>(); chooseDownloadFolder.mockReturnValueOnce(held.promise);
  await mounted(async (container,render) => {
    await act(async () => button(container).click());
    if(retirement==="Private") state.privateMode=true; if(retirement==="window") state.windowId="window-b";
    await render(retirement!=="inactive");
    state.privateMode=false; state.windowId="window-a"; await render();
    await act(async () => held.resolve({path:"/tmp/retired",custom:true}));
    expect(container.textContent).not.toContain("/tmp/retired"); expect(container.textContent).toContain("/tmp/Downloads");
  });
});
it("an old chooser finally cannot clear a fresh chooser busy state", async () => {
  const old=deferred<{path:string;custom:boolean}>(), fresh=deferred<{path:string;custom:boolean}>(); chooseDownloadFolder.mockReturnValueOnce(old.promise).mockReturnValueOnce(fresh.promise);
  await mounted(async (container,render) => { await act(async () => button(container).click()); await render(false); await render(); await act(async () => button(container).click()); await act(async () => old.resolve({path:"/tmp/old",custom:true})); expect(button(container).disabled).toBe(true); await act(async () => fresh.resolve({path:"/tmp/fresh",custom:true})); expect(button(container).disabled).toBe(false); expect(container.textContent).toContain("/tmp/fresh"); });
});
it("refuses unfocused and retired controls without a native chooser", async () => {
  await mounted(async (container,render) => { await expect(executeCommand("choose-download-folder")).rejects.toThrow(); button(container).focus(); await render(false); await expect(executeCommand("choose-download-folder")).rejects.toThrow(); expect(chooseDownloadFolder).not.toHaveBeenCalled(); });
});

it("retains a retired original rejection without publishing its error", async () => {
  const held=deferred<{path:string;custom:boolean}>(); const reason=new Error("retired chooser"); chooseDownloadFolder.mockReturnValueOnce(held.promise);
  await mounted(async (container,render) => {
    button(container).focus(); let completion!:Promise<unknown>; let rejection!:Promise<unknown>;
    await act(async () => { completion=executeCommand("choose-download-folder"); rejection=completion.catch(error => error); });
    state.privateMode=true; await render(); state.privateMode=false; await render();
    await act(async () => held.reject(reason)); expect(await rejection).toBe(reason); expect(container.textContent).not.toContain(reason.message);
  });
});
it("keeps the last real folder and allows a new choice after a rejected chooser", async () => {
  chooseDownloadFolder.mockRejectedValueOnce(new Error("try again"));
  await mounted(async container => { await act(async () => button(container).click()); expect(container.textContent).toContain("/tmp/Downloads"); await act(async () => button(container).click()); expect(chooseDownloadFolder).toHaveBeenCalledTimes(2); expect(container.textContent).toContain("/tmp/Aux exports"); });
});
it("refuses a hidden focused control", async () => {
  await mounted(async container => { button(container).focus(); container.hidden=true; await expect(executeCommand("choose-download-folder")).rejects.toThrow(); expect(chooseDownloadFolder).not.toHaveBeenCalled(); });
});
it("retries an actual failed folder read through the focused registered owner", async () => {
  downloadFolder.mockRejectedValueOnce(new Error("read unavailable"));
  await mounted(async container => {
    expect(container.textContent).toContain("read unavailable");
    const ack={path:"/tmp/reloaded",custom:false}; downloadFolder.mockResolvedValueOnce(ack);
    button(container,"Retry").focus(); await act(async () => expect(await executeCommand("retry-download-folder")).toBe(ack));
    expect(container.textContent).toContain(ack.path); expect(container.querySelector('[role="alert"]')).toBeNull();
  });
});

it("clears a synchronous read failure and keeps Retry usable", async () => {
  const reason=new Error("synchronous read transport"); downloadFolder.mockImplementationOnce(() => { throw reason; });
  await mounted(async container => { expect(container.textContent).toContain(reason.message); expect(button(container,"Retry").disabled).toBe(false); await act(async () => button(container,"Retry").click()); expect(container.textContent).toContain("/tmp/Downloads"); expect(container.querySelector('[role="alert"]')).toBeNull(); });
});
it("retains a synchronous chooser rejection and releases its pending owner", async () => {
  const reason=new Error("synchronous chooser transport"); chooseDownloadFolder.mockImplementationOnce(() => { throw reason; });
  await mounted(async container => { button(container).focus(); await act(async () => expect(executeCommand("choose-download-folder")).rejects.toBe(reason)); expect(button(container).disabled).toBe(false); expect(container.textContent).toContain(reason.message); await act(async () => button(container).click()); expect(chooseDownloadFolder).toHaveBeenCalledTimes(2); expect(container.textContent).toContain("/tmp/Aux exports"); });
});

it("rechecks actual native capability before a focused chooser without a rerender", async () => {
  await mounted(async container => {
    button(container).focus(); state.available=false;
    await expect(executeCommand("choose-download-folder")).rejects.toThrow();
    expect(chooseDownloadFolder).not.toHaveBeenCalled();
  });
});
it("retains actual chooser ACK but refuses delivery after live capability loss", async () => {
  const held=deferred<{path:string;custom:boolean}>(),ack={path:"/tmp/undelivered",custom:true};
  chooseDownloadFolder.mockReturnValueOnce(held.promise);
  await mounted(async container=>{
    button(container).focus(); let completion!:Promise<unknown>;
    await act(async()=>{completion=executeCommand("choose-download-folder");});
    state.available=false;
    await act(async()=>held.resolve(ack));
    expect(await completion).toBe(ack);
    expect(container.textContent).not.toContain(ack.path);
    expect(container.textContent).toContain("/tmp/Downloads");
  });
});
