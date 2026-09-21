// @vitest-environment jsdom
import {act} from "react";
import {createRoot} from "react-dom/client";
import {expect,it,vi} from "vitest";
vi.mock("./bridge",async importOriginal=>({...await importOriginal<typeof import("./bridge")>(),inElectron:true}));
import {bridge} from "./bridge";
import {BrowserProfiles} from "./components/BrowserProfiles";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
it("retains a created profile when its window fails, allowing Open without creating it twice",async()=>{
  const list=vi.spyOn(bridge,"browserProfiles").mockResolvedValue([{id:"default",name:"Personal",current:true,archived:false}]);
  const create=vi.spyOn(bridge,"createBrowserProfile").mockResolvedValue({id:"work",name:"Work",current:false,archived:false});
  const open=vi.spyOn(bridge,"openBrowserProfile").mockRejectedValueOnce(new Error("Launch failed")).mockResolvedValue(true);
  const host=document.createElement("div"),root=createRoot(host);document.body.append(host);
  const button=(label:string)=>Array.from(host.querySelectorAll("button")).find(item=>item.textContent===label)!;
  try{
    await act(async()=>root.render(<BrowserProfiles/>));
    await act(async()=>button("New profile").click());
    const input=host.querySelector("input")!;
    await act(async()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")!.set!.call(input,"Work");input.dispatchEvent(new Event("input",{bubbles:true}));});
    await act(async()=>host.querySelector("form")!.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true})));
    expect(host.querySelector("form")).toBeNull();
    expect(host.textContent).toContain("“Work” was created. Use Open");
    expect(list).toHaveBeenCalledTimes(1);
    await act(async()=>button("Open").click());
    expect(create).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledTimes(2);
    expect(host.textContent).toContain("Opening Work in a separate window");
  }finally{await act(async()=>root.unmount());host.remove();vi.restoreAllMocks();}
});
