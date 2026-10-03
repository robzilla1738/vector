// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { RunPanel } from "./components/RunPanel";
import { bridge } from "./bridge";
import { makeRun, makeSteps } from "./mock/fixtures";
import { useStore } from "./store";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
// jsdom has no layout; model the mounted visible controls explicitly.
beforeEach(() => { vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{ width: 100, height: 30 }] as unknown as DOMRectList); });
afterEach(() => vi.restoreAllMocks());
it.each(["completed", "partially_completed"] as const)("keeps %s chat output concise without hiding partial results", async status => {
  const original=useStore.getState();
  const run=makeRun({runId:"concise",status,pageIds:[],statusMessage:"Done — 3 modes compared",result:{answer:"## Checkout modes\nThe comparison."}});
  useStore.setState({runs:[run],steps:{concise:[]},prompt:null});
  const host=document.createElement("div"),root=createRoot(host);
  document.body.append(host);
  try {
    await act(async()=>root.render(<RunPanel runId="concise" conversation/>));
    expect(host.querySelectorAll(".answer h2")).toHaveLength(1);
    expect(host.querySelector(".answer")?.textContent?.includes(run.statusMessage!)).toBe(status!=="completed");
    expect(host.querySelector(".run-state")!==null).toBe(status!=="completed");
    expect(host.querySelector('[aria-label="Copy answer"]')).not.toBeNull();
  } finally { await act(async()=>root.unmount());host.remove();useStore.setState(original,true); }
});

it("keeps Stop available during pause and ignores the superseded pause error",async()=>{
  const original=useStore.getState();
  const run=makeRun({runId:"controls",status:"running",pageIds:[]});
  useStore.setState({runs:[run],steps:{controls:[]},prompt:null});
  const host=document.createElement("div"),root=createRoot(host);
  document.body.append(host);
  let failPause!:(reason:Error)=>void;
  const invoke=vi.spyOn(bridge,"invoke").mockImplementation(async method=>{
    if(method==="runs.pause")return new Promise((_resolve,reject)=>{failPause=reject;});
    if(method==="runs.cancel")throw new Error("Connection unavailable");
    return {};
  });
  try {
    await act(async()=>root.render(<RunPanel runId="controls" conversation/>));
    expect(Array.from(host.querySelectorAll<HTMLButtonElement>("button")).some(button=>button.textContent?.includes("Work history"))).toBe(false);
    const pause=host.querySelector<HTMLButtonElement>('[aria-label="Pause run"]')!;
    await act(async()=>{pause.click();pause.click();});
    expect(invoke.mock.calls.filter(([method])=>method==="runs.pause")).toHaveLength(1);
    const stop=host.querySelector<HTMLButtonElement>('[aria-label="Stop run"]')!;
    expect(stop.disabled).toBe(false);
    await act(async()=>stop.click());
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("Stop wasn’t confirmed");
    await act(async()=>failPause(new Error("Late pause error")));
    expect(host.querySelector('[role="alert"]')?.textContent).not.toContain("Late pause error");
  } finally { await act(async()=>root.unmount());host.remove();vi.restoreAllMocks();useStore.setState(original,true); }
});

it("loads saved page evidence only when opened and offers retry on failure",async()=>{
  const original=useStore.getState();
  const run=makeRun({runId:"evidence",status:"completed",pageIds:[]});
  const steps=makeSteps("evidence",1);
  steps[0]!.inputs={obsArtifactId:"saved-page"};
  useStore.setState({runs:[run],steps:{evidence:steps},observations:{},prompt:null});
  const host=document.createElement("div"),root=createRoot(host);
  document.body.append(host);
  const invoke=vi.spyOn(bridge,"invoke").mockRejectedValue(new Error("Snapshot unavailable"));
  try {
    await act(async()=>root.render(<RunPanel runId="evidence" conversation/>));
    expect(invoke.mock.calls.filter(([method])=>method==="artifacts.read")).toHaveLength(0);
    const button=(text:string)=>Array.from(host.querySelectorAll<HTMLButtonElement>("button")).find(item=>item.textContent?.includes(text))!;
    await act(async()=>button("Work history").click());
    expect(invoke.mock.calls.filter(([method])=>method==="artifacts.read")).toHaveLength(0);
    await act(async()=>button("Page").click());
    expect(invoke).toHaveBeenCalledWith("artifacts.read",{artifactId:"saved-page"});
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("Snapshot unavailable");
    await act(async()=>button("Retry").click());
    expect(invoke.mock.calls.filter(([method])=>method==="artifacts.read")).toHaveLength(2);
  } finally {await act(async()=>root.unmount());host.remove();vi.restoreAllMocks();useStore.setState(original,true);}
});
