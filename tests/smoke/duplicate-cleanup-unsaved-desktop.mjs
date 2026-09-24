// Duplicate cleanup checks live native form state before selecting tabs.
import { createServer } from "node:http";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { launchApp, shellWindow } from "./launch.mjs";
import { sidebarAction } from "./sidebar-action.mjs";

const dir=mkdtempSync(join(tmpdir(),"aux-duplicate-unsaved-"));
const server=createServer((request,response)=>{
  response.setHeader("content-type","text/html");
  response.end(`<title>${request.url?.slice(1)}</title><label>Draft<textarea id="draft"></textarea></label>`);
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const env={PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,"profile"),AUX_DATA_DIR:join(dir,"data"),AUX_LOAD_DOTENV:"0"};
let app;
try {
  app=await launchApp({args:["--use-mock-keychain"],env});
  const shell=await shellWindow(app,15000);
  shell.setDefaultTimeout(15000);
  await shell.locator(".app").waitFor();
  const tabs=await shell.evaluate(async ({base})=>[
    await window.aux.invoke("pages.open",{url:`${base}/duplicate`,activate:true}),
    await window.aux.invoke("pages.open",{url:`${base}/duplicate`,activate:true}),
    await window.aux.invoke("pages.open",{url:`${base}/other`,activate:true}),
  ],{base});
  const duplicateUrl=`${base}/duplicate`;
  let nativePages=[];
  for(let attempt=0;attempt<100;attempt++){
    nativePages=app.windows().filter(page=>page.url()===duplicateUrl);
    if(nativePages.length===2)break;
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  assert.equal(nativePages.length,2);
  await nativePages[0].locator("#draft").fill("Unsaved note");
  const state=await shell.evaluate(async ({tabs,duplicateUrl})=>window.aux.tabsUnsavedWork(tabs.slice(0,2).map(tab=>({pageId:tab.pageId,url:duplicateUrl}))),{tabs,duplicateUrl});
  assert.deepEqual(Object.values(state).sort(),["clean","dirty"]);
  const dirtyId=Object.entries(state).find(([,value])=>value==="dirty")[0];
  await sidebarAction(shell,"Tab overview");
  await shell.getByRole("button",{name:"Select duplicates · 1"}).click();
  await shell.getByText("No safe duplicates to select.",{exact:false}).waitFor();
  assert.equal(await shell.getByRole("region",{name:"Selected tab actions"}).count(),0);
  assert.ok(dirtyId);
  await nativePages[0].locator("#draft").fill("");
  await shell.getByRole("button",{name:"Select duplicates · 1"}).click();
  await shell.getByRole("region",{name:"Selected tab actions"}).getByText("1 selected").waitFor();
  await nativePages[0].locator("#draft").fill("New unsaved note");
  await shell.getByRole("region",{name:"Selected tab actions"}).getByRole("button",{name:"Close tabs"}).click();
  await shell.getByText("A selected duplicate has unsaved work or changed.",{exact:false}).waitFor();
  assert.equal((await shell.evaluate(()=>window.aux.invoke("pages.list",{}))).some(tab=>tab.pageId===dirtyId),true);
  console.log("Duplicate cleanup kept the unsaved tab at proposal time and when work changed before closing.");
} finally {
  if(app)await app.close().catch(()=>{});
  await new Promise(resolve=>server.close(resolve));
  rmSync(dir,{recursive:true,force:true});
}
