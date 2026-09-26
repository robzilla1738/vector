// @vitest-environment jsdom
import {act} from "react";
import {createRoot} from "react-dom/client";
import {expect,it,vi} from "vitest";
import {SessionRecovery} from "./components/SessionRecovery";
import {bridge} from "./bridge";
import {useStore} from "./store";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;

it("continues past a failed tab and retains it for individual recovery",async()=>{
  const initial=useStore.getState();
  let tabs=["first","failed","last"].map(pageId=>({pageId,title:pageId,url:`https://${pageId}.example`,windowId:"main",retrying:false}));
  useStore.setState({connected:true,restoringTabs:false});
  const invoke=vi.spyOn(bridge,"invoke").mockImplementation(async(method,params)=>{
    if(method==="browser.recovery.list")return tabs;
    if(method==="browser.recovery.retry"){
      const {pageId}=params as {pageId:string};
      if(pageId==="failed")throw new Error("Browser unavailable");
      tabs=tabs.filter(tab=>tab.pageId!==pageId);
      return {ok:true,pageId};
    }
    throw new Error(method);
  });
  const host=document.createElement("div"),root=createRoot(host);
  try{
    await act(async()=>root.render(<SessionRecovery/>));
    await act(async()=>Array.from(host.querySelectorAll("button")).find(button=>button.textContent==="Retry all")!.click());
    expect(invoke.mock.calls.filter(([method])=>method==="browser.recovery.retry").map(([,params])=>(params as {pageId:string}).pageId)).toEqual(["first","failed","last"]);
    expect(host.querySelectorAll(".session-recovery-row")).toHaveLength(1);
    expect(host.querySelector('[role="alert"]')?.textContent).toBe("Browser unavailable");
    expect(host.querySelector('output')?.textContent).toBe("2 tabs restored. 1 couldn’t reopen.");
  }finally{await act(async()=>root.unmount());vi.restoreAllMocks();useStore.setState(initial,true);}
});

it("stops after the in-flight tab without dispatching the rest",async()=>{
  const initial=useStore.getState();
  const tabs=["first","second"].map(pageId=>({pageId,title:pageId,url:`https://${pageId}.example`,windowId:"main",retrying:false}));
  useStore.setState({connected:true,restoringTabs:false});
  let finish!:(value:{ok:boolean})=>void;
  const invoke=vi.spyOn(bridge,"invoke").mockImplementation(async(method)=>{
    if(method==="browser.recovery.list")return tabs;
    if(method==="browser.recovery.retry")return new Promise(resolve=>{finish=resolve;});
    throw new Error(method);
  });
  const host=document.createElement("div"),root=createRoot(host);
  try{
    await act(async()=>root.render(<SessionRecovery/>));
    await act(async()=>Array.from(host.querySelectorAll("button")).find(button=>button.textContent==="Retry all")!.click());
    await act(async()=>Array.from(host.querySelectorAll("button")).find(button=>button.textContent==="Stop")!.click());
    await act(async()=>finish({ok:true}));
    expect(invoke.mock.calls.filter(([method])=>method==="browser.recovery.retry")).toHaveLength(1);
    expect(host.querySelector('output')?.textContent).toBe("1 tab restored. 1 not attempted.");
  }finally{await act(async()=>root.unmount());vi.restoreAllMocks();useStore.setState(initial,true);}
});
