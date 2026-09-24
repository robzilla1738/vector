// Three live tabs plus a local brief produce a cited, editable report and a same-chat revision.
import { createServer } from "node:http";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { launchApp, shellWindow } from "./launch.mjs";
import { sidebarAction } from "./sidebar-action.mjs";

const temporary = mkdtempSync(join(tmpdir(), "aux-report-journey-"));
const documentPath = join(temporary, "brief.md");
writeFileSync(documentPath, "# Brief\nBrief recommends Beta.");
const pages = createServer((request, response) => {
  const name = request.url?.slice(1) ?? "";
  response.setHeader("content-type", "text/html");
  response.end(`<!doctype html><title>${name}</title><h1>${name} detail</h1>`);
});
await new Promise(resolve => pages.listen(0, "127.0.0.1", resolve));
const url = name => `http://127.0.0.1:${pages.address().port}/${name}`;
let selectedIds = [];
let plannerCalls = 0;
const provider = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/v1/chat/completions") { response.writeHead(404).end(); return; }
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  let content;
  if (body.response_format) content = '{"ok":true}';
  else if (body.max_tokens === 512) content = "blue";
  else {
    plannerCalls++;
    content = JSON.stringify(plannerCalls === 1
      ? {status:"continue",pageId:selectedIds[1],message:"Read Beta",steps:[]}
      : plannerCalls === 2
        ? {status:"continue",pageId:selectedIds[2],message:"Read Gamma",steps:[]}
        : plannerCalls === 3
          ? {status:"done",message:"Prepared cited report",result:{report:`# Report\n- Alpha detail. [Source](${url("Alpha")})\n- Beta detail. [Source](${url("Beta")})\n- Gamma detail. [Source](${url("Gamma")})\n- Brief recommends Beta.`}}
          : {status:"done",message:"Revised report",result:{report:"# Report\n- Edited note."}});
  }
  response.setHeader("content-type", "application/json");
  response.end(JSON.stringify({id:"chatcmpl_report",object:"chat.completion",created:1,model:"aux-report-fixture",
    choices:[{index:0,message:{role:"assistant",content},finish_reason:"stop"}],
    usage:{prompt_tokens:4,completion_tokens:5,total_tokens:9}}));
});
await new Promise(resolve => provider.listen(0, "127.0.0.1", resolve));
const endpoint = `http://127.0.0.1:${provider.address().port}/v1`;
const env = {PATH:process.env.PATH,HOME:temporary,TMPDIR:temporary,AUX_PROFILE_DIR:join(temporary,"profile"),AUX_DATA_DIR:join(temporary,"data"),AUX_LOAD_DOTENV:"0"};
const launch = () => launchApp({args:["--use-mock-keychain"],env});
const choose = async (app, path) => app.evaluate(({dialog}, selected) => {dialog.showOpenDialog=async()=>({canceled:!selected,filePaths:selected?[selected]:[]});}, path);
let app;
async function shell() {
  const page=await shellWindow(app,15000);
  page.setDefaultTimeout(20000);
  await page.locator(".app").waitFor();
  return page;
}
const completed = async (page, goal) => {
  const deadline=Date.now()+30000;
  while(Date.now()<deadline){
    const run=await page.evaluate(goal=>window.aux.invoke("runs.list",{limit:20,includeArchived:true}).then(runs=>runs.find(item=>item.goal===goal)),goal);
    if(run?.status==="completed")return run;
    if(run&&["failed","interrupted","partially_completed","cancelled"].includes(run.status))throw new Error(`Report run ${run.status}: ${run.error??run.statusMessage}`);
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  throw new Error(`Report run did not complete: ${goal}`);
};

try {
  app=await launch();
  let page=await shell();
  await sidebarAction(page,"Settings");
  const settings=page.getByRole("region",{name:"Settings",exact:true});
  await settings.getByRole("button",{name:"Connections",exact:true}).click();
  await settings.getByRole("tab",{name:"Models",exact:true}).click();
  await settings.getByRole("combobox",{name:"Model provider",exact:true}).selectOption("openai-compatible");
  await settings.getByRole("textbox",{name:"OpenAI-compatible endpoint",exact:true}).fill(`${endpoint}/`);
  await settings.getByRole("button",{name:"Save endpoint",exact:true}).click();
  await settings.getByRole("textbox",{name:"Provider API key",exact:true}).fill("synthetic-report");
  await settings.getByRole("button",{name:"Save key",exact:true}).click();
  await settings.getByRole("combobox",{name:"Planner model",exact:true}).fill("aux-report-fixture");
  await settings.getByRole("button",{name:"Save model",exact:true}).click();
  await settings.getByRole("button",{name:"Test connection",exact:true}).click();
  await settings.getByRole("status").filter({hasText:"Connection tested"}).waitFor();
  await settings.getByRole("button",{name:"Close settings",exact:true}).click();
  for (const name of ["Alpha","Beta","Gamma"]) {
    const opened=await page.evaluate(url=>window.aux.invoke("pages.open",{url,activate:true}),url(name));
    selectedIds.push(opened.pageId);
  }
  await page.waitForFunction(async ids=>(await window.aux.invoke("pages.list",{})).filter(item=>ids.includes(item.pageId)&&!item.loading).length===3,selectedIds);
  await sidebarAction(page,"Chats");
  await page.getByRole("button",{name:"New chat",exact:true}).click();
  await page.getByRole("combobox",{name:"Browser context"}).selectOption(selectedIds[0]);
  await page.locator(".conversation-browser-add summary").click();
  const tabChoices=page.getByRole("group",{name:"Additional browser tabs"});
  await tabChoices.getByLabel(/Beta/).check();
  await tabChoices.getByLabel(/Gamma/).check();
  await page.getByRole("button",{name:"Add context",exact:true}).click();
  await choose(app,documentPath);
  await page.getByRole("button",{name:"Document",exact:true}).click();
  await page.locator('.composer-documents[aria-label="Attached documents"]').getByRole("button",{name:"brief.md",exact:true}).waitFor();
  const firstGoal="Compare Alpha, Beta, Gamma, and the brief in a cited report";
  await page.getByRole("textbox",{name:"Reply to conversation"}).fill(firstGoal);
  await page.getByRole("button",{name:"Send message",exact:true}).click();
  await completed(page,firstGoal);
  const firstRun=await page.evaluate(goal=>window.aux.invoke("runs.list",{limit:20}).then(runs=>runs.find(run=>run.goal===goal)),firstGoal);
  assert.deepEqual(firstRun.pageIds,selectedIds);
  assert.equal(firstRun.config.contextAttachmentIds.length,1);
  assert.match(firstRun.result.report,/Brief recommends Beta/);
  const reports=page.locator('.composer-documents[aria-label="Generated reports and results"]');
  await reports.getByRole("button",{name:"report.md",exact:true}).click();
  const preview=page.getByRole("region",{name:"Saved result preview"});
  await preview.getByRole("button",{name:"Edit copy"}).click();
  await preview.getByRole("textbox",{name:"Edit result copy"}).fill("# Report\nEdited note.");
  await preview.getByRole("button",{name:"Attach edited copy"}).click();
  await page.locator('.composer-documents[aria-label="Attached documents"]').getByRole("button",{name:"edited-report.md",exact:true}).waitFor();
  await preview.getByRole("button",{name:"Close result preview"}).click();
  const secondGoal="Revise the report using my edited copy";
  await page.getByRole("textbox",{name:"Reply to conversation"}).fill(secondGoal);
  await page.getByRole("button",{name:"Send message",exact:true}).click();
  await completed(page,secondGoal);
  const secondRun=await page.evaluate(goal=>window.aux.invoke("runs.list",{limit:20}).then(runs=>runs.find(run=>run.goal===goal)),secondGoal);
  assert.match(secondRun.config.contextDocumentEvidence,/Edited note/);
  assert.match(secondRun.result.report,/Edited note/);
  await app.close();app=undefined;
  app=await launch();page=await shell();
  await sidebarAction(page,"Chats");
  await page.locator(".history-conversation").filter({hasText:firstGoal}).click();
  await page.locator('.composer-documents[aria-label="Generated reports and results"]').getByRole("button",{name:"report.md",exact:true}).first().click();
  await page.getByRole("region",{name:"Saved result preview"}).getByText("Edited note.").waitFor();
  console.log("Three tabs and a document produced a cited editable report; the edited copy was revised in the same chat and reopened after restart.");
} finally {
  await app?.close().catch(()=>{});
  pages.closeAllConnections();provider.closeAllConnections();
  await Promise.all([new Promise(resolve=>pages.close(resolve)),new Promise(resolve=>provider.close(resolve))]);
  rmSync(temporary,{recursive:true,force:true});
}
