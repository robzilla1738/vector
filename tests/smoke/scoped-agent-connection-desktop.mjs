// A real desktop -> scoped token -> MCP stdio -> runtime boundary flow in an isolated profile.
import { createRequire } from "node:module";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createServer } from "node:http";
import {execFileSync} from 'node:child_process';
import assert from "node:assert/strict";
import { sidebarAction } from "./sidebar-action.mjs";
import { poll } from "./poll.mjs";

const root = resolve(import.meta.dirname, "../..");
const desktopRequire = createRequire(join(root, "apps/desktop/package.json"));
const mcpRequire = createRequire(join(root, "packages/mcp/package.json"));
const { _electron } = createRequire(join(root, "packages/chromium-driver/package.json"))("playwright-core");
const { Client } = mcpRequire("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = mcpRequire("@modelcontextprotocol/sdk/client/stdio.js");
const electron = desktopRequire("electron");
const temporary = mkdtempSync(join(tmpdir(), "aux-scoped-agent-"));
const repository=join(temporary,'repository');mkdirSync(repository);const git=(...args)=>execFileSync('/usr/bin/git',['-C',repository,...args],{encoding:'utf8',env:{PATH:'/usr/bin:/bin',GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:'/dev/null'}}).trim();
git('init','-q');git('config','user.name','Fixture');git('config','user.email','fixture@example.test');writeFileSync(join(repository,'app.ts'),'export const value = 1;\n');writeFileSync(join(repository,'package.json'),JSON.stringify({name:'agent-fixture',scripts:{check:'node --check app.ts'}}));writeFileSync(join(repository,'server.cjs'),"const http=require('node:http');http.createServer((_req,res)=>{res.setHeader('Content-Type','text/html');res.end('<title>Agent preview</title><h1>Agent preview is working</h1>');}).listen(Number(process.argv[2]),'127.0.0.1',()=>console.log('AGENT_PREVIEW_READY'));\n");git('add','.');git('commit','-qm','Fixture baseline');
const artifacts = join(root, "release/test-artifacts");
mkdirSync(artifacts, { recursive: true });
const fixture = createServer((req, res) => {
  const label = req.url === "/authorized" ? "Authorized task page" : "Private unrelated page";
  res.setHeader("Content-Type", "text/html");
  res.end(`<!doctype html><title>${label}</title><h1>${label}</h1><p>Isolated synthetic content.</p>`);
});
await new Promise(resolve => fixture.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${fixture.address().port}`;
const previewPort=await new Promise(resolve=>{const reservation=createServer();reservation.listen(0,'127.0.0.1',()=>{const port=reservation.address().port;reservation.close(()=>resolve(port));});});

let app;
let client;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const launch = () => _electron.launch({
  executablePath: electron,
  args: [join(root, "apps/desktop"), "--use-mock-keychain"],
  env: {
    PATH: process.env.PATH,
    HOME: temporary,
    TMPDIR: temporary,
    AUX_PROFILE_DIR: join(temporary, "profile"),
    AUX_DATA_DIR: join(temporary, "data"),
    AUX_LOAD_DOTENV: "0",
  },
});
async function shell() {
  for (let attempt = 0; attempt < 150; attempt++) {
    const found = app.windows().find(page => page.url().includes("renderer/index.html"));
    if (found && await found.evaluate(() => Boolean(window.aux?.windowId)).catch(() => false)) return found;
    await delay(100);
  }
  throw new Error("Aux shell did not start");
}
const parseToolText = result => {
  const value = result.content.find(item => item.type === "text").text;
  try { return JSON.parse(value); } catch { return value; }
};
async function connect(config) {
  const next = new Client({ name: "aux-scoped-smoke", version: "1.0.0" });
  await next.connect(new StdioClientTransport({
    command: config.command,
    args: config.args,
    env: { PATH: process.env.PATH, HOME: temporary, TMPDIR: temporary, ...config.env },
    stderr: "pipe",
  }));
  return next;
}
const call = async (name, args = {}) => client.callTool({ name, arguments: args });
const ok = async (name, args = {}) => {
  const result = await call(name, args);
  assert.ok(!result.isError, `${name}: ${JSON.stringify(result)}`);
  return parseToolText(result);
};
const denied = async (name, args = {}) => {
  const result = await call(name, args);
  assert.equal(result.isError, true, `${name} unexpectedly succeeded`);
  assert.match(JSON.stringify(result), /permission_denied|unauthorized|recreate it in Aux Settings/i);
};
const failed=async(name,args,pattern)=>{const result=await call(name,args);assert.equal(result.isError,true,`${name} unexpectedly succeeded`);assert.match(JSON.stringify(result),pattern);};

try {
  app = await launch();
  let page = await shell();
  await page.locator(".app").waitFor();
  await app.evaluate(({ BaseWindow }) => BaseWindow.getAllWindows()[0].setSize(1280, 900));
  await app.evaluate(({dialog},path)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[path]});},repository);

  const setup = await page.evaluate(async baseUrl => {
    const selection=await window.aux.selectRepository();
    if(!selection)throw new Error('Repository selection failed');
    const project=await window.aux.createProject(selection.selectionId);
    const authorizedPage = await window.aux.invoke("pages.open", { url: `${baseUrl}/authorized`, activate: true });
    const unrelatedPage = await window.aux.invoke("pages.open", { url: `${baseUrl}/unrelated`, activate: true });
    const authorizedWorkspace = await window.aux.invoke("workspaces.create", { name: "Authorized workspace" });
    const unrelatedWorkspace = await window.aux.invoke("workspaces.create", { name: "Unrelated workspace" });
    const authorizedTask = await window.aux.invoke("tasks.create", {
      workspaceId: authorizedWorkspace.workspaceId,
      title: "Authorized research",
      objective: "Inspect only the authorized fixture.",
      criteria: [{ criterionId: "summary", description: "Record the authorized page title", verification: "browser" }],
      resources: [{ resourceId: "authorized-page", kind: "page", locator: authorizedPage.pageId, label: "Authorized fixture" },{resourceId:'project',kind:'repository',projectId:project.projectId,locator:project.path,label:`${project.name} · ${project.branch}`}],
    });
    const unrelatedTask = await window.aux.invoke("tasks.create", {
      workspaceId: unrelatedWorkspace.workspaceId,
      title: "Unrelated private work",
      objective: "Remain outside the external connection.",
      criteria: [{ criterionId: "private", description: "Keep unrelated context private", verification: "manual" }],
      resources: [{ resourceId: "unrelated-page", kind: "page", locator: unrelatedPage.pageId, label: "Unrelated fixture" }],
    });
    const config = await window.aux.agentConfig({
      name: "Codex · Authorized research",
      client: "codex",
      scope: { kind: "task", workspaceId: authorizedWorkspace.workspaceId, taskId: authorizedTask.taskId },
    });
    const workspaceConfig = await window.aux.agentConfig({
      name: "Claude · Authorized workspace",
      client: "claude",
      scope: { kind: "workspace", workspaceId: authorizedWorkspace.workspaceId },
    });
    return { authorizedPage, unrelatedPage, authorizedWorkspace, unrelatedWorkspace, authorizedTask, unrelatedTask, project, config, workspaceConfig };
  }, base);

  // Prove the scoped bearer survives a complete Aux restart before it is used.
  await app.close();
  app = await launch();
  page = await shell();
  await page.locator(".app").waitFor();
  await poll(page, () => !document.querySelector(".degraded"), true, 60000);
  await page.evaluate(pageId => window.aux.invoke("browser.recovery.retry", { pageId }).catch(() => null), setup.authorizedPage.pageId);
  await poll(page, pageId => window.aux.invoke("pages.list", {}).then(items => items.some(item => item.pageId === pageId)), setup.authorizedPage.pageId, 60000);
  client = await connect(setup.config);
  const catalog = (await client.listTools()).tools.map(tool => tool.name);
  assert.ok(catalog.includes("aux_workspaces_list") && catalog.includes("aux_task_record_evidence")&&catalog.includes('aux_development_read_file')&&catalog.includes('aux_development_run_command')&&catalog.includes('aux_development_open_preview')&&catalog.includes('aux_development_commit')&&catalog.includes('aux_cloud_environments')&&catalog.includes('aux_cloud_task_result'));
  assert.ok(!catalog.some(name => name.startsWith("vector_")));
  assert.ok(catalog.includes('aux_page_observe')&&catalog.includes('aux_task_start')&&catalog.includes('aux_run_control'));
  assert.ok(catalog.includes('aux_task_create'));
  assert.ok(!catalog.includes('aux_page_open')&&!catalog.includes('aux_run_start')&&!catalog.includes('aux_workspace_create')&&!catalog.includes('aux_events')&&!catalog.includes('aux_chrome_attach'));
  const workspaceClient=await connect(setup.workspaceConfig);const workspaceCatalog=(await workspaceClient.listTools()).tools.map(tool=>tool.name);assert.ok(workspaceCatalog.includes('aux_task_create'));assert.ok(!workspaceCatalog.includes('aux_workspace_create')&&!workspaceCatalog.includes('aux_page_open')&&!workspaceCatalog.includes('aux_run_start'));await workspaceClient.close();

  assert.deepEqual((await ok("aux_workspaces_list")).map(item => item.workspaceId), [setup.authorizedWorkspace.workspaceId]);
  assert.deepEqual((await ok("aux_tasks_list", { includeArchived: true, limit: 100 })).map(item => item.taskId), [setup.authorizedTask.taskId]);
  assert.deepEqual((await ok("aux_pages_list")).map(item => item.pageId), [setup.authorizedPage.pageId]);
  assert.match(JSON.stringify(await ok("aux_page_observe", { pageId: setup.authorizedPage.pageId })), /Authorized task page/);
  await denied("aux_page_observe", { pageId: setup.unrelatedPage.pageId });
  await denied("aux_task_get", { taskId: setup.unrelatedTask.taskId });
  const evidence = await ok("aux_task_record_evidence", {
    taskId: setup.authorizedTask.taskId,
    expectedRevision: setup.authorizedTask.revision,
    criterionId: "summary",
    summary: "The external client reports the title Authorized task page.",
  });
  assert.equal(evidence.actor, "external_client");
  const receipt = await ok("aux_task_receipt", { taskId: setup.authorizedTask.taskId });
  assert.equal(receipt.status, "needs_review");
  const development={taskId:setup.authorizedTask.taskId,expectedRevision:setup.authorizedTask.revision,projectId:setup.project.projectId};
  assert.deepEqual((await ok('aux_development_projects',{taskId:development.taskId,expectedRevision:development.expectedRevision})).map(project=>project.projectId),[setup.project.projectId]);
  const inspected=await ok('aux_development_inspect',development);assert.equal(inspected.environment.javascript.manager,'npm');assert.ok(inspected.environment.javascript.suggestions.some(item=>item.command==="npm run 'check'"));assert.ok(inspected.environment.tools.some(item=>item.command==='node'&&item.available));
  const opened=await ok('aux_development_read_file',{...development,name:'app.ts'});assert.equal(opened.content,'export const value = 1;\n');
  await denied('aux_development_read_file',{...development,projectId:'33333333-3333-4333-8333-333333333333',name:'app.ts'});
  await app.evaluate(({dialog})=>{dialog.showMessageBox=async(_window,options)=>{globalThis.__auxDevelopmentApprovals=(globalThis.__auxDevelopmentApprovals??[]).concat({title:options.title,message:options.message,detail:options.detail});return {response:1,checkboxChecked:false};};});
  const saved=await ok('aux_development_write_file',{...development,name:'app.ts',expectedHash:opened.sha256,content:'export const value = 2;\n'});assert.equal(saved.content,'export const value = 2;\n');assert.equal(readFileSync(join(setup.project.path,'app.ts'),'utf8'),saved.content);
  const created=await ok('aux_development_create_file',{...development,name:'src/agent.ts',content:'export const agent = true;\n'});assert.equal(created.name,'src/agent.ts');assert.equal(readFileSync(join(setup.project.path,'src/agent.ts'),'utf8'),created.content);assert.equal(existsSync(join(repository,'src/agent.ts')),false);
  const firstService=await ok('aux_development_run_command',{...development,command:`'${process.execPath.replaceAll("'","'\\''")}' server.cjs ${previewPort}`,mode:'service'}),secondService=await ok('aux_development_run_command',{...development,command:'/bin/sleep 29',mode:'service'});assert.equal(firstService.task.taskId,development.taskId);assert.equal(secondService.task.taskId,development.taskId);
  const started=await ok('aux_development_run_command',{...development,command:'printf AGENT_COMMAND_OK',mode:'command'});assert.equal(started.task.taskId,development.taskId);
  let commands=[];for(let attempt=0;attempt<100;attempt++){commands=await ok('aux_development_commands',development);if(commands.some(command=>command.state==='succeeded'&&command.output==='AGENT_COMMAND_OK')&&commands.some(command=>command.commandId===firstService.commandId&&command.output.includes('AGENT_PREVIEW_READY'))&&commands.filter(command=>command.mode==='service'&&command.state==='running').length===2)break;await delay(50);}assert.ok(commands.some(command=>command.state==='succeeded'&&command.output==='AGENT_COMMAND_OK'));assert.equal(commands.filter(command=>command.mode==='service'&&command.state==='running').length,2);
  const openedPreview=await ok('aux_development_open_preview',{...development,url:`http://127.0.0.1:${previewPort}/`});assert.equal(openedPreview.check.state,'responding');assert.ok(openedPreview.page?.pageId);
  assert.match(JSON.stringify(await ok('aux_page_observe',{pageId:openedPreview.page.pageId})),/Agent preview is working/);
  assert.deepEqual(new Set((await ok('aux_pages_list')).map(item=>item.pageId)),new Set([setup.authorizedPage.pageId,openedPreview.page.pageId]));
  const previewCapture=await call('aux_page_capture',{pageId:openedPreview.page.pageId});const previewImage=previewCapture.content.find(item=>item.type==='image');assert.ok(previewImage?.data);writeFileSync(join(artifacts,'aux-scoped-agent-preview-page.png'),Buffer.from(previewImage.data,'base64'));
  await page.screenshot({path:join(artifacts,'aux-scoped-agent-preview.png')});
  await ok('aux_development_stop_command',{...development,commandId:firstService.commandId});for(let attempt=0;attempt<100;attempt++){commands=await ok('aux_development_commands',development);if(commands.find(command=>command.commandId===firstService.commandId)?.state==='canceled')break;await delay(50);}assert.equal(commands.find(command=>command.commandId===secondService.commandId)?.state,'running');
  await ok('aux_development_stop_command',{...development,commandId:secondService.commandId});
  const review=await ok('aux_development_review',development);assert.match(review.content,/AGENT_COMMAND_OK/);assert.match(review.content,/src\/agent.ts/);assert.equal(readFileSync(review.path,'utf8'),review.content);assert.equal(existsSync(join(setup.project.path,'review-summary.md')),false);
  const sourceHead=git('rev-parse','HEAD');const committed=await ok('aux_development_commit',{...development,expectedPatchHash:review.patch.sha256,expectedTree:review.snapshotTree,message:'Agent-reviewed checkpoint',authorName:'Aux Agent',authorEmail:'aux-agent@example.test'});assert.ok(committed.commit);assert.equal(execFileSync('/usr/bin/git',['-C',setup.project.path,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),committed.commit);assert.equal(git('rev-parse','HEAD'),sourceHead);assert.equal(execFileSync('/usr/bin/git',['-C',setup.project.path,'status','--porcelain'],{encoding:'utf8'}).trim(),'');assert.equal(execFileSync('/usr/bin/git',['-C',setup.project.path,'show','-s','--format=%an <%ae>'],{encoding:'utf8'}).trim(),'Aux Agent <aux-agent@example.test>');
  const approvals=await app.evaluate(()=>globalThis.__auxDevelopmentApprovals);assert.equal(approvals.length,7);assert.ok(approvals.some(item=>item.detail.includes('export const value = 2')));assert.ok(approvals.some(item=>item.detail.includes('printf AGENT_COMMAND_OK')));assert.ok(approvals.some(item=>item.title==='Open agent local preview'&&item.message.includes(`127.0.0.1:${previewPort}`)));assert.ok(approvals.some(item=>item.title==='Create local commit'&&item.detail.includes('does not push, publish, or open a pull request')));
  await page.evaluate(({taskId})=>window.aux.invoke('tasks.update',{taskId,expectedRevision:1,objective:'Revision changed after the agent request.'}),{taskId:development.taskId});
  await failed('aux_development_read_file',{...development,name:'app.ts'},/conflict|revision changed/i);

  await sidebarAction(page, "Settings");
  const settings = page.getByRole("region", { name: "Settings", exact: true });
  await settings.getByRole("button", { name: "Connections", exact: true }).click();
  await settings.getByRole("tab", { name: "Agents", exact: true }).click();
  await settings.getByText("Codex · Authorized research", { exact: true }).waitFor();
  const connectionRow = settings.locator(".external-agent-row").filter({ hasText: "Codex · Authorized research" });
  await connectionRow.getByText(/used /).waitFor();
  await page.screenshot({ path: join(artifacts, "aux-scoped-agent-connection.png") });

  await connectionRow.getByRole("button", { name: "Revoke", exact: true }).click();
  await connectionRow.getByText(/revoked/).waitFor();
  await denied("aux_pages_list");
  await page.screenshot({ path: join(artifacts, "aux-scoped-agent-revoked.png") });

  console.log("A task-scoped external agent survives restart, sees only attached browser/project context, completes approved conflict-safe local changes and a command-backed review handoff, rejects stale revision/unrelated access, and stops immediately when revoked.");
} catch (error) {
  console.error(await (await shell().catch(() => null))?.locator("body").innerText().catch(() => ""));
  throw error;
} finally {
  await client?.close().catch(() => {});
  await app?.close().catch(() => {});
  fixture.closeAllConnections();
  await new Promise(resolve => fixture.close(resolve));
  rmSync(temporary, { recursive: true, force: true });
}
