// Quick Ask keeps the same draft and saved attachment when becoming a full chat.
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { launchApp, shellWindow } from "./launch.mjs";

const dir=mkdtempSync(join(tmpdir(),"aux-quick-expand-"));
const documentPath=join(dir,"brief.md");
writeFileSync(documentPath,"# Brief\nA saved attachment for Quick Ask.");
const env={PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,"profile"),AUX_DATA_DIR:join(dir,"data"),AUX_LOAD_DOTENV:"0"};
let app;
async function openQuickAsk() {
  const main=await shellWindow(app,15000);
  await main.locator(".app").waitFor();
  await main.evaluate(()=>window.aux.quickAsk("open"));
  for(let attempt=0;attempt<100;attempt++){
    for(const page of app.windows()){
      if(await page.locator(".quick-ask").count().catch(()=>0)){page.setDefaultTimeout(15000);return page;}
    }
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  throw new Error("Quick Ask window did not open");
}
try {
  app=await launchApp({args:["--use-mock-keychain"],env});
  let quick=await openQuickAsk();
  const draft="Compare the brief with what I browse next.";
  await quick.getByRole("textbox",{name:"Reply to conversation"}).fill(draft);
  await quick.getByRole("button",{name:"Add context",exact:true}).click();
  await app.evaluate(({dialog},path)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[path]});},documentPath);
  await quick.getByRole("button",{name:"Document",exact:true}).click();
  await quick.locator('.composer-documents[aria-label="Attached documents"]').getByRole("button",{name:"brief.md",exact:true}).waitFor();
  const before=await quick.evaluate(()=>({chatId:localStorage.getItem("aux.quick-ask.chat"),draft:document.querySelector('.quick-ask textarea')?.value}));
  assert.ok(before.chatId);
  assert.equal(before.draft,draft);
  await quick.evaluate(()=>window.aux.quickAsk("dismiss"));
  quick=await openQuickAsk();
  assert.equal(await quick.getByRole("textbox",{name:"Reply to conversation"}).inputValue(),draft);
  await quick.locator('.composer-documents[aria-label="Attached documents"]').getByRole("button",{name:"brief.md",exact:true}).waitFor();
  assert.equal(await quick.evaluate(()=>localStorage.getItem("aux.quick-ask.chat")),before.chatId);
  await quick.getByRole("button",{name:/^Expand/}).click();
  await quick.locator(".quick-ask").waitFor({state:"detached"});
  await quick.getByRole("textbox",{name:"Reply to conversation"}).waitFor();
  assert.equal(await quick.getByRole("textbox",{name:"Reply to conversation"}).inputValue(),draft);
  await quick.locator('.composer-documents[aria-label="Attached documents"]').getByRole("button",{name:"brief.md",exact:true}).waitFor();
  assert.equal((await quick.evaluate(id=>window.aux.invoke("conversations.attachments.get",{chatId:id}),before.chatId)).attachments.length,1);
  console.log("Quick Ask kept its chat identity, unsent draft, and saved document context through dismiss, reopen, and expansion.");
} finally {
  if(app){
    const closed=await Promise.race([app.close().then(()=>true).catch(()=>false),new Promise(resolve=>setTimeout(()=>resolve(false),3000))]);
    if(!closed)app.process().kill("SIGKILL");
  }
  rmSync(dir,{recursive:true,force:true});
}
