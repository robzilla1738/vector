// @vitest-environment jsdom
import {act} from "react";
import {createRoot} from "react-dom/client";
import {expect,it,vi} from "vitest";
vi.mock("./bridge",async importOriginal=>({...await importOriginal<typeof import("./bridge")>(),inNativeHost:true}));
import {bridge} from "./bridge";
import {DefaultBrowserSetting} from "./components/DefaultBrowserSetting";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;

it("reports the measured default-browser state, not the request",async()=>{
  vi.spyOn(bridge,"defaultBrowser").mockResolvedValue({isDefault:false});
  const set=vi.spyOn(bridge,"setDefaultBrowser").mockResolvedValue({isDefault:false});
  const host=document.createElement("div"),root=createRoot(host);
  try{
    await act(async()=>root.render(<DefaultBrowserSetting/>));
    const button=[...host.querySelectorAll("button")].find(b=>b.textContent?.includes("default"))!;
    expect(button).toBeTruthy();
    await act(async()=>{button.click();});
    expect(set).toHaveBeenCalledTimes(1);
    expect(host.textContent).toContain("did not confirm");
    expect(host.textContent).not.toContain("is your default browser");
  }finally{await act(async()=>root.unmount());vi.restoreAllMocks();}
});

it("shows the registered state without offering the action",async()=>{
  vi.spyOn(bridge,"defaultBrowser").mockResolvedValue({isDefault:true});
  const set=vi.spyOn(bridge,"setDefaultBrowser");
  const host=document.createElement("div"),root=createRoot(host);
  try{
    await act(async()=>root.render(<DefaultBrowserSetting/>));
    expect(host.textContent).toContain("is your default browser");
    expect(host.querySelectorAll("button")).toHaveLength(0);
    expect(set).not.toHaveBeenCalled();
  }finally{await act(async()=>root.unmount());vi.restoreAllMocks();}
});
