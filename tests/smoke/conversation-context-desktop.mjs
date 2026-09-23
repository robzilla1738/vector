// Durable, inspectable conversation context in the real desktop shell. No provider credential or request.
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
const temporary = mkdtempSync(join(tmpdir(), "aux-conversation-context-"));
const dataDir = join(temporary, "data");
const artifacts = join(root, "release/test-artifacts");
mkdirSync(artifacts, { recursive: true });
const fixture = createServer((_request, response) => {
  response.setHeader("content-type", "text/html");
  response.end("<!doctype html><title>Context workspace</title><h1>Conversation context fixture</h1>");
});
await new Promise(resolve => fixture.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${fixture.address().port}/context`;
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
  await app.close(); app = undefined;

  const repo = await openRepo();
  const now = Date.now();
  repo.saveRun({ runId: "context-old", goal: "Collect the first option", status: "completed", pageIds: [browser.pageId], config: { chatId: "context-chat" }, result: { answer: "First option details" }, createdAt: now - 2000, startedAt: now - 2000, endedAt: now - 1900 });
  repo.saveRun({ runId: "context-new", goal: "Compare the options", status: "completed", pageIds: [browser.pageId], config: { chatId: "context-chat" }, result: { answer: "Comparison result" }, createdAt: now - 1000, startedAt: now - 1000, endedAt: now - 900 });
  repo.db.close();

  app = await launch(); page = await shell();
  await sidebarAction(page, "Chats");
  await page.getByRole("button", { name: /Compare the options/ }).click();
  await page.getByRole("button", { name: "Context · 2", exact: true }).click();
  const older = page.getByRole("checkbox", { name: /Collect the first option/ });
  assert.equal(await older.isChecked(), true);
  await older.click();
  await page.getByRole("button", { name: "Context · 1", exact: true }).waitFor();
  await page.screenshot({ path: join(artifacts, "aux-conversation-context.png") });
  const master = page.getByRole("checkbox", { name: /Use previous turns/ });
  await master.click();
  await page.getByRole("button", { name: "Context · 0", exact: true }).waitFor();
  await master.click();
  await page.getByRole("button", { name: "Context · 1", exact: true }).waitFor();
  await app.close(); app = undefined;

  app = await launch(); page = await shell();
  await sidebarAction(page, "Chats");
  await page.getByRole("button", { name: /Compare the options/ }).click();
  await page.getByRole("button", { name: "Context · 1", exact: true }).click();
  assert.equal(await page.getByRole("checkbox", { name: /Collect the first option/ }).isChecked(), false, "turn exclusion should survive restart");
  const state = await page.evaluate(() => window.aux.invoke("runs.context.get", { chatId: "context-chat" }));
  assert.deepEqual(state.entries.filter(entry => entry.included).map(entry => entry.runId), ["context-new"]);
  const run = await page.evaluate(({ pageId }) => window.aux.invoke("runs.start", { goal: "Continue with selected memory", pageIds: [pageId], chatId: "context-chat" }), { pageId: browser.pageId });
  assert.deepEqual(run.config.contextRunIds, ["context-new"]);
  assert.match(run.config.context, /Comparison result/);
  assert.doesNotMatch(run.config.context, /First option details/);
  console.log("Conversation context is inspectable, selectively excluded, restart-durable, and stamped onto the next run.");
} finally {
  await app?.close().catch(() => {});
  fixture.closeAllConnections();
  await new Promise(resolve => fixture.close(resolve));
  rmSync(temporary, { recursive: true, force: true });
}
