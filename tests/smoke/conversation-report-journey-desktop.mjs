// Three live tabs plus a local brief produce a cited, editable report and a same-chat revision.
import { createServer } from "node:http";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { launchApp, shellWindow } from "./launch.mjs";
import { sidebarAction } from "./sidebar-action.mjs";
import { poll } from "./poll.mjs";

const temporary = mkdtempSync(join(tmpdir(), "aux-report-journey-"));
const documentPath = join(temporary, "brief.md");
writeFileSync(documentPath, "# Brief\nBrief recommends Beta.");
const pages = createServer((request, response) => {
  const name = request.url?.slice(1) ?? "";
  if (name === "preview-leak") { previewLeakRequests++; response.writeHead(204).end(); return; }
  response.setHeader("content-type", "text/html");
  response.end(`<!doctype html><title>${name}</title><h1>${name} detail</h1>`);
});
await new Promise(resolve => pages.listen(0, "127.0.0.1", resolve));
const url = name => `http://127.0.0.1:${pages.address().port}/${name}`;
let selectedIds = [];
let plannerCalls = 0;
let previewLeakRequests = 0;
const generatedHtml = `<!doctype html><h1>Interactive prototype</h1><button id="try">Try it</button><button id="navigate">Navigate</button><p id="status">Ready</p><script>
  document.body.dataset.aux = String(!!window.aux);
  document.body.dataset.bridge = (() => { try { return String(!!parent.aux); } catch { return 'blocked'; } })();
  document.body.dataset.storage = (() => { try { localStorage.setItem('probe','x'); return 'available'; } catch { return 'blocked'; } })();
  document.querySelector('#try').onclick = () => { document.querySelector('#status').textContent = 'Clicked'; };
  document.querySelector('#navigate').onclick = () => { location.href = ${JSON.stringify(url("preview-leak"))}; };
  fetch(${JSON.stringify(url("preview-leak"))}).catch(() => {});
</script>`;
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
          : {status:"done",message:"Revised report and interactive prototype",result:{report:"# Report\n- Edited note.",html:generatedHtml}});
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
  await page.locator(`[data-turn-id="${firstRun.runId}"] .answer-markdown`).getByText("Alpha detail.",{exact:false}).waitFor();
  const originalReport=await page.evaluate(chatId=>window.aux.invoke("conversations.artifacts.get",{chatId}).then(value=>value.artifacts.find(item=>item.runId)),firstRun.config.chatId);
  assert.ok(originalReport?.artifactId);
  const reports=page.locator('.composer-documents[aria-label="Generated reports and results"]');
  await reports.getByRole("button",{name:"report.md · v1",exact:true}).click();
  const preview=page.getByRole("region",{name:"Saved result preview"});
  await preview.getByRole("button",{name:"Edit copy"}).click();
  await preview.getByRole("textbox",{name:"Edit result copy"}).fill("# Report\nEdited note.");
  await preview.getByRole("button",{name:"Attach as document"}).click();
  await page.locator('.composer-documents[aria-label="Attached documents"]').getByRole("button",{name:"edited-report.md",exact:true}).waitFor();
  const editedCopy=await page.evaluate(chatId=>window.aux.invoke("conversations.attachments.get",{chatId}).then(value=>value.attachments.find(item=>item.filename==="edited-report.md")),firstRun.config.chatId);
  assert.equal(editedCopy.sourceArtifactId,originalReport.artifactId);
  await preview.getByRole("button",{name:"Save version"}).click();
  await page.locator('.composer-documents[aria-label="Generated reports and results"]').getByRole("button",{name:"report.md · v2",exact:true}).waitFor();
  const savedEdit=await page.evaluate(chatId=>window.aux.invoke("conversations.artifacts.get",{chatId}).then(value=>value.artifacts.find(item=>item.revision===2)),firstRun.config.chatId);
  assert.equal(savedEdit.sourceArtifactIds[0],originalReport.artifactId);
  assert.equal(savedEdit.included,true);
  assert.equal((await page.evaluate(artifactId=>window.aux.invoke("results.read",{artifactId}),savedEdit.artifactId)).content,"# Report\nEdited note.");
  await preview.getByRole("button",{name:"Close result preview"}).click();
  const secondGoal="Revise the report using my edited copy";
  await page.getByRole("textbox",{name:"Reply to conversation"}).fill(secondGoal);
  await page.getByRole("button",{name:"Send message",exact:true}).click();
  await completed(page,secondGoal);
  const secondRun=await page.evaluate(goal=>window.aux.invoke("runs.list",{limit:20}).then(runs=>runs.find(run=>run.goal===goal)),secondGoal);
  assert.match(secondRun.config.contextDocumentEvidence,/Edited note/);
  assert.match(secondRun.result.report,/Edited note/);
  assert.deepEqual(secondRun.config.contextSourceArtifactIds,[originalReport.artifactId]);
  assert.ok(secondRun.config.contextArtifactIds.includes(savedEdit.artifactId));
  const htmlResult=await page.evaluate(chatId=>window.aux.invoke("conversations.artifacts.get",{chatId}).then(value=>value.artifacts.find(item=>item.mediaType==="text/html")),firstRun.config.chatId);
  assert.equal(htmlResult.filename,"preview.html");
  await page.locator('.composer-documents[aria-label="Generated reports and results"]').getByRole("button",{name:"preview.html · v1",exact:true}).click();
  const htmlPreview=page.getByRole("region",{name:"Saved result preview"});
  const frame=page.frameLocator('iframe[title="Isolated HTML result"]');
  await frame.locator("body[data-bridge]").waitFor();
  await frame.locator("#try").click();
  assert.equal(await frame.locator("#status").textContent(),"Clicked");
  assert.equal(await frame.locator("body").getAttribute("data-aux"),"false");
  assert.equal(await frame.locator("body").getAttribute("data-bridge"),"blocked");
  assert.equal(await frame.locator("body").getAttribute("data-storage"),"blocked");
  await frame.locator("#navigate").click();
  await new Promise(resolve=>setTimeout(resolve,200));
  assert.equal(page.frames().some(item=>item.url().startsWith(url("preview-leak"))),false,"HTML preview cannot navigate into a site");
  assert.equal(previewLeakRequests,0,"HTML preview cannot fetch a page or send Profile data");
  await htmlPreview.getByRole("button",{name:"Edit copy"}).click();
  await htmlPreview.getByRole("textbox",{name:"Edit result copy"}).fill("<h1>Edited prototype</h1><script>document.body.dataset.active='yes'</script>");
  await htmlPreview.getByRole("button",{name:"Save version"}).click();
  await page.locator('.composer-documents[aria-label="Generated reports and results"]').getByRole("button",{name:"preview.html · v2",exact:true}).waitFor();
  await page.getByRole("region",{name:"Saved result preview"}).getByRole("button",{name:"Close result preview"}).click();
  await app.close();app=undefined;
  app=await launch();page=await shell();
  await poll(page,async ids=>(await window.aux.invoke("pages.list",{})).filter(item=>ids.includes(item.pageId)&&!item.loading).length===3,selectedIds,30000);
  await page.keyboard.press("Meta+l");
  await page.locator(".cmdbar.compact input").fill("Gamma");
  await page.locator(".cmdbar.compact .cb-opt.results").first().waitFor();
  await page.locator(".cmdbar.compact .cb-opt.results").first().click();
  await page.getByRole("region",{name:"Saved result preview"}).waitFor();
  await page.getByRole("region",{name:"Saved result preview"}).getByRole("button",{name:"Close result preview"}).click();
  await page.locator('.composer-documents[aria-label="Generated reports and results"]').getByRole("button",{name:"preview.html · v2",exact:true}).click();
  await page.frameLocator('iframe[title="Isolated HTML result"]').locator("h1").getByText("Edited prototype").waitFor();
  await page.getByRole("region",{name:"Saved result preview"}).getByRole("button",{name:"Close result preview"}).click();
  await page.locator('.composer-documents[aria-label="Generated reports and results"]').getByRole("button",{name:"report.md · v3",exact:true}).click();
  await page.getByRole("region",{name:"Saved result preview"}).getByText("Edited note.").waitFor();
  await page.getByRole("region",{name:"Saved result preview"}).getByRole("button",{name:"Close result preview"}).click();
  await page.locator('.composer-documents[aria-label="Generated reports and results"]').getByRole("button",{name:"report.md · v2",exact:true}).click();
  await page.getByRole("region",{name:"Saved result preview"}).getByText("Edited note.").waitFor();
  await page.getByRole("region",{name:"Saved result preview"}).getByRole("button",{name:"Close result preview"}).click();
  await page.locator('.composer-documents[aria-label="Generated reports and results"]').getByRole("button",{name:"report.md · v1",exact:true}).click();
  await page.getByRole("region",{name:"Saved result preview"}).getByText("Brief recommends Beta.").waitFor();
  const beforeSource=await page.evaluate(()=>window.aux.invoke("pages.list",{}).then(items=>items.length));
  await page.getByRole("region",{name:"Saved result preview"}).getByRole("link",{name:"Source"}).first().click();
  const afterSource=await page.evaluate(()=>window.aux.invoke("pages.list",{}).then(items=>items.length));
  assert.equal(afterSource,beforeSource,"a citation should return to its observed tab instead of opening a duplicate");
  console.log("Three tabs and a document produced a cited editable report; the edited copy was revised in the same chat and reopened after restart.");
} finally {
  await app?.close().catch(()=>{});
  pages.closeAllConnections();provider.closeAllConnections();
  await Promise.all([new Promise(resolve=>pages.close(resolve)),new Promise(resolve=>provider.close(resolve))]);
  rmSync(temporary,{recursive:true,force:true});
}
