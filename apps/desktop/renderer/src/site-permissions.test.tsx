// @vitest-environment jsdom
import {act} from "react";
import {createRoot} from "react-dom/client";
import {expect,it,vi} from "vitest";
import {bridge} from "./bridge";
import {SitePermissions} from "./components/SitePermissions";
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
    expect(host.querySelector('[role="status"]')?.textContent).toContain("Decision reset");
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("Couldn’t refresh permissions");
    expect(host.textContent).not.toContain("No saved website permissions");
  }finally{await act(async()=>root.unmount());vi.restoreAllMocks();}
});
