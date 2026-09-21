// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { RunPanel } from "./components/RunPanel";
import { bridge } from "./bridge";
import { makeRun, makeSteps } from "./mock/fixtures";
import { useStore } from "./store";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
it("keeps Stop available during pause and ignores the superseded pause error",async()=>{
  const original=useStore.getState();
  const run=makeRun({runId:"controls",status:"running",pageIds:[]});
  useStore.setState({runs:[run],steps:{controls:[]},prompt:null});
  const host=document.createElement("div"),root=createRoot(host);
  let failPause!:(reason:Error)=>void;
  const invoke=vi.spyOn(bridge,"invoke").mockImplementation(async method=>{
    if(method==="runs.pause")return new Promise((_resolve,reject)=>{failPause=reject;});
    if(method==="runs.cancel")throw new Error("Connection unavailable");
    return {};
  });
  try {
    await act(async()=>root.render(<RunPanel runId="controls" conversation/>));
    const pause=host.querySelector<HTMLButtonElement>('[aria-label="Pause run"]')!;
    await act(async()=>{pause.click();pause.click();});
    expect(invoke.mock.calls.filter(([method])=>method==="runs.pause")).toHaveLength(1);
    const stop=host.querySelector<HTMLButtonElement>('[aria-label="Stop run"]')!;
    expect(stop.disabled).toBe(false);
    await act(async()=>stop.click());
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("Stop wasn’t confirmed");
    await act(async()=>failPause(new Error("Late pause error")));
    expect(host.querySelector('[role="alert"]')?.textContent).not.toContain("Late pause error");
  } finally { await act(async()=>root.unmount());vi.restoreAllMocks();useStore.setState(original,true); }
});

it("loads saved page evidence only when opened and offers retry on failure",async()=>{
  const original=useStore.getState();
  const run=makeRun({runId:"evidence",status:"completed",pageIds:[]});
  const steps=makeSteps("evidence",1);
  steps[0]!.inputs={obsArtifactId:"saved-page"};
  useStore.setState({runs:[run],steps:{evidence:steps},observations:{},prompt:null});
  const host=document.createElement("div"),root=createRoot(host);
  const invoke=vi.spyOn(bridge,"invoke").mockRejectedValue(new Error("Snapshot unavailable"));
  try {
    await act(async()=>root.render(<RunPanel runId="evidence" conversation/>));
    expect(invoke).not.toHaveBeenCalled();
    const button=(text:string)=>Array.from(host.querySelectorAll<HTMLButtonElement>("button")).find(item=>item.textContent?.includes(text))!;
    await act(async()=>button("Work history").click());
    expect(invoke).not.toHaveBeenCalled();
    await act(async()=>button("Page").click());
    expect(invoke).toHaveBeenCalledWith("artifacts.read",{artifactId:"saved-page"});
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("Snapshot unavailable");
    await act(async()=>button("Retry").click());
    expect(invoke).toHaveBeenCalledTimes(2);
  } finally {await act(async()=>root.unmount());vi.restoreAllMocks();useStore.setState(original,true);}
});
