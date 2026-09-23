import { expect, it } from "vitest";
import { EventBus, PageService, Repo, openDb } from "@aux/runtime";
import type { BrowserDriver, DriverPage } from "@aux/chromium-driver";
import type { PageTarget } from "@aux/contracts";

it("keeps failed session tabs through later browsing and retries the same durable identity",async()=>{
  const db=openDb(":memory:"),repo=new Repo(db);
  const original:PageTarget={pageId:"saved-tab",windowId:"main",backend:"aux",targetId:"old-target",url:"https://saved.test/",title:"Saved work",documentEpoch:4,lastRevision:0,viewStatus:"visible",controller:"none",controllerEpoch:2,ownedByRuntime:false,createdAt:1,lastActiveAt:2};
  repo.upsertPage(original);repo.saveTabs([{...original,ordinal:0,active:true}]);
  let failing=true;
  let nativeFocusCalls=0;
  const page=(targetId:string,pageId:string):DriverPage=>{
    let url="about:blank";
    return {identity:{targetId,pageId,backend:"aux"},isAttached:()=>true,url:()=>url,title:async()=>"Page",navigate:async(value:string)=>{url=value;},setEvents:()=>{},dispose:async()=>{}} as unknown as DriverPage;
  };
  const driver={isConnected:()=>true,attach:async(targetId:string,pageId:string)=>page(targetId,pageId),recoverPage:async(targetId:string,pageId:string)=>{if(failing)throw new Error("Browser temporarily unavailable");return page(targetId,pageId);}} as unknown as BrowserDriver;
  const native={available:()=>true,listPages:async()=>({pages:[]}),tabCommand:async(env:{command:{kind:string;pageId?:string}})=>({commandId:"",status:"applied" as const,catalogVersion:0,pageId:env.command.pageId}),createPage:async()=>({ok:true}),closePage:async()=>({ok:true}),focusPage:async()=>{nativeFocusCalls++;return {ok:true};}} as unknown as ConstructorParameters<typeof PageService>[0]["native"];
  const pages=new PageService({repo,native,drivers:()=>({aux:driver,chrome:null}),events:new EventBus(repo)});
  try {
    await pages.restoreTabs();
    expect(pages.recoveryTabs()).toEqual([expect.objectContaining({pageId:original.pageId,error:"Browser temporarily unavailable"})]);
    const fresh=await pages.open({url:"https://fresh.test/",background:false,ownedByRuntime:false});
    expect(repo.loadTabs().map(tab=>tab.page_id)).toEqual(expect.arrayContaining([original.pageId,fresh.pageId]));
    failing=false;
    expect(await pages.retryRestore(original.pageId)).toEqual({ok:true,pageId:original.pageId});
    await Promise.resolve();
    expect(pages.recoveryTabs()).toEqual([]);
    expect(repo.getPage(original.pageId)?.documentEpoch).toBe(5);
    expect(repo.loadTabs().filter(tab=>tab.page_id===original.pageId)).toHaveLength(1);
    expect(repo.loadTabs().some(tab=>tab.page_id===fresh.pageId)).toBe(true);
    const focusCallsBeforeNotification=nativeFocusCalls;
    pages.onNativeWindowFocused(fresh.pageId,"main");
    expect(pages.activePageIdFor("main")).toBe(fresh.pageId);
    expect(nativeFocusCalls).toBe(focusCallsBeforeNotification);
    pages.onNativeWindowFocused(original.pageId,"different-window");
    expect(pages.activePageId).toBe(fresh.pageId);
    expect(nativeFocusCalls).toBe(focusCallsBeforeNotification);
  } finally {pages.shuttingDown();await Promise.resolve();db.close();}
});
