// Revisioned workspace memory through the real conversation UI and saved-task runtime path.
import { createServer } from "node:http";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import { sidebarAction } from "./sidebar-action.mjs";
import { launchApp, shellWindow } from "./launch.mjs";

const root = resolve(import.meta.dirname, "../..");
const { openDb, Repo } = await import(join(root, "apps/runtime/dist/index.js"));
const { resolveDatabasePath } = await import(join(root, "packages/contracts/dist/installation.js"));
const temporary = mkdtempSync(join(tmpdir(), "aux-workspace-memory-"));
const dataDir = join(temporary, "data");
const screenshots = join(root, "release/test-artifacts");
mkdirSync(screenshots, { recursive: true });
const fixture = createServer((_request, response) => {
  response.setHeader("content-type", "text/html");
  response.end("<!doctype html><title>Workspace research</title><h1>Workspace memory fixture</h1>");
});
await new Promise(resolve => fixture.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${fixture.address().port}/memory`;
const env = { PATH: process.env.PATH, HOME: temporary, TMPDIR: temporary, AUX_PROFILE_DIR: join(temporary, "profile"), AUX_DATA_DIR: dataDir, AUX_LOAD_DOTENV: "0" };
let app;
const launch = () => launchApp({args:["--use-mock-keychain"],env});
async function shell() {
  const page = await shellWindow(app, 15_000);
  page.setDefaultTimeout(20_000);
  await page.locator(".app").waitFor();
  return page;
}
async function openRepo() {
  for (let attempt = 0; attempt < 100; attempt++) {
    try { return new Repo(openDb(resolveDatabasePath(dataDir))); }
    catch (error) {
      if (!String(error).includes("database is locked")) throw error;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  throw new Error("runtime database did not unlock");
}

try {
  app = await launch();
  let page = await shell();
  const browser = await page.evaluate(url => window.aux.invoke("pages.open", { url, activate: true }), url);
  await page.waitForFunction(id => window.aux.invoke("pages.list", {}).then(pages => pages.some(item => item.pageId === id && !item.loading)), browser.pageId);
  const workspace = await page.evaluate(() => window.aux.invoke("workspaces.create", { name: "Travel research" }));
  await app.close(); app = undefined;

  const repo = await openRepo();
  repo.saveRun({ runId: "memory-base", goal: "Compare travel tools", status: "completed", pageIds: [browser.pageId], config: { chatId: "memory-chat" }, result: { answer: "Ready for workspace preferences." }, createdAt: Date.now(), endedAt: Date.now() + 1 });
  repo.db.close();

  app = await launch(); page = await shell();
  await sidebarAction(page, "Chats");
  await page.locator(".history-conversation").filter({ hasText: "Compare travel tools" }).click();
  await page.getByRole("button", { name: "Context · 1", exact: true }).click();
  await page.getByRole("combobox", { name: "Conversation workspace" }).selectOption(workspace.workspaceId);
  const memory = page.getByRole("textbox", { name: "Workspace memory" });
  await memory.fill("Prefer offline-capable tools. Keep recommendations concise and cite limitations.");
  await page.getByRole("button", { name: "Save memory", exact: true }).click();
  await page.getByText("Revision 1", { exact: false }).waitFor();
  await page.getByRole("button", { name: "Context · 2", exact: true }).waitFor();
  await page.screenshot({ path: join(screenshots, "aux-conversation-workspace-memory.png") });
  await app.close(); app = undefined;

  app = await launch(); page = await shell();
  await sidebarAction(page, "Chats");
  await page.locator(".history-conversation").filter({ hasText: "Compare travel tools" }).click();
  await page.getByRole("button", { name: "Context · 2", exact: true }).click();
  assert.equal(await page.getByRole("combobox", { name: "Conversation workspace" }).inputValue(), workspace.workspaceId);
  assert.match(await page.getByRole("textbox", { name: "Workspace memory" }).inputValue(), /offline-capable/);
  await page.evaluate(pageId => window.aux.invoke("runs.start", { goal: "Apply workspace memory.", chatId: "memory-chat", pageIds: [pageId] }), browser.pageId);
  await page.waitForFunction(() => window.aux.invoke("runs.list", { chatId: "memory-chat", limit: 10 }).then(runs => runs.length === 2));
  const conversationRuns = await page.evaluate(() => window.aux.invoke("runs.list", { chatId: "memory-chat", limit: 10 }));
  assert.equal(conversationRuns[0].config.contextWorkspaceId, workspace.workspaceId);
  assert.equal(conversationRuns[0].config.contextWorkspaceRevision, 1);
  assert.match(conversationRuns[0].config.context, /cite limitations/);

  const task = await page.evaluate(workspaceId => window.aux.invoke("tasks.create", { workspaceId, title: "Workspace task", objective: "Recommend a travel tool", criteria: [{ criterionId: "recommendation", description: "Recommendation reflects workspace preferences", verification: "manual" }], resources: [] }), workspace.workspaceId);
  const taskRun = await page.evaluate(({ taskId, pageId }) => window.aux.invoke("tasks.start", { taskId, expectedRevision: 1, pageIds: [pageId] }), { taskId: task.taskId, pageId: browser.pageId });
  assert.equal(taskRun.config.contextWorkspaceId, workspace.workspaceId);
  assert.equal(taskRun.config.contextWorkspaceRevision, 1);
  assert.match(taskRun.config.context, /offline-capable/);
  console.log("Workspace memory survives restart and stamps the exact revision onto conversations and saved-task runs.");
} finally {
  await app?.close().catch(() => {});
  fixture.closeAllConnections();
  await new Promise(resolve => fixture.close(resolve));
  rmSync(temporary, { recursive: true, force: true });
}
