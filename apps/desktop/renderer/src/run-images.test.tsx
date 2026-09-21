// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { RunImages } from "./components/RunImages";
import { bridge } from "./bridge";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
it("defers image reads until expansion and keeps usable images when another read fails",async()=>{
  const invoke=vi.spyOn(bridge,"invoke").mockImplementation(async(method,params)=>{
    if(method==="artifacts.list")return ["good","missing"].map((artifactId,index)=>({artifactId,mediaType:"image/png",status:"complete",size:100,createdAt:index,path:"unused"}));
    if(method==="artifacts.read") {
      if((params as {artifactId:string}).artifactId==="missing")throw new Error("Image unavailable");
      return {dataBase64:"c3ludGhldGlj"};
    }
    throw new Error(method);
  });
  const host=document.createElement("div"),root=createRoot(host);
  try {
    await act(async()=>root.render(<RunImages runId="run"/>));
    expect(invoke.mock.calls.filter(([method])=>method==="artifacts.read")).toHaveLength(0);
    const gallery=host.querySelector("details")!;
    await act(async()=>{gallery.open=true;gallery.dispatchEvent(new Event("toggle"));});
    expect(invoke.mock.calls.filter(([method])=>method==="artifacts.read")).toHaveLength(2);
    expect(host.querySelectorAll("img")).toHaveLength(1);
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("Image unavailable");
    expect(host.querySelector("button")?.textContent).toBe("Retry image");
  } finally {await act(async()=>root.unmount());vi.restoreAllMocks();}
});
