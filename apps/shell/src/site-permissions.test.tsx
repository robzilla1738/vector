// @vitest-environment jsdom
import {act} from "react";
import {createRoot} from "react-dom/client";
import {expect,it,vi} from "vitest";
import {bridge} from "./bridge";
import {SitePermissions} from "./components/SitePermissions";
import {useStore} from "./store";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
it("keeps a confirmed reset successful when refreshing permissions fails",async()=>{
  vi.spyOn(bridge,"sitePermissions").mockResolvedValueOnce({"https://example.com":{notifications:"allow"}}).mockRejectedValue(new Error("Refresh unavailable"));
  const clear=vi.spyOn(bridge,"clearSitePermission").mockResolvedValue(true);
  const host=document.createElement("div"),root=createRoot(host);
  try{
    await act(async()=>root.render(<SitePermissions/>));
    const reset=Array.from(host.querySelectorAll("button")).find(button=>button.textContent==="Reset site")!;
    await act(async()=>{reset.click();reset.click();});
    expect(clear).toHaveBeenCalledTimes(1);
    expect(host.querySelectorAll(".site-permission-group")).toHaveLength(0);
    expect(host.querySelector('output')?.textContent).toContain("Decision reset");
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("Couldn’t refresh permissions");
    expect(host.textContent).not.toContain("No saved website permissions");
  }finally{await act(async()=>root.unmount());vi.restoreAllMocks();}
});
it("shows a failed website data clear without claiming the data was removed",async()=>{
  const initial=useStore.getState();
  useStore.setState({pages:[{pageId:"site",url:"https://example.com/path",backend:"aux"}] as never});
  vi.spyOn(bridge,"sitePermissions").mockResolvedValue({});
  vi.spyOn(bridge,"clearSiteData").mockResolvedValue(false);
  const host=document.createElement("div"),root=createRoot(host);
  try{
    await act(async()=>root.render(<SitePermissions/>));
    const clear=Array.from(host.querySelectorAll("button")).find(button=>button.textContent==="Clear website data…")!;
    await act(async()=>clear.click());
    expect(bridge.clearSiteData).toHaveBeenCalledWith("site");
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("Website data could not be cleared");
    expect(host.textContent).not.toContain("Cookies and stored website data cleared");
  }finally{await act(async()=>root.unmount());vi.restoreAllMocks();useStore.setState(initial,true);}
});
