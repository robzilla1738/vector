// Durable conversation rename/archive/restore/delete in the real desktop shell. No provider request or credential.
import { createServer } from "node:http";
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import { sidebarAction } from "./sidebar-action.mjs";
import { launchApp, shellWindow } from "./launch.mjs";

const root = resolve(import.meta.dirname, "../..");
const { openDb, Repo } = await import(join(root, "apps/runtime/dist/index.js"));
const { resolveDatabasePath } = await import(join(root, "packages/contracts/dist/installation.js"));
const temporary = mkdtempSync(join(tmpdir(), "aux-conversation-lifecycle-"));
const dataDir = join(temporary, "data");
const artifactOutput = join(root, "release/test-artifacts");
mkdirSync(artifactOutput, { recursive: true });
const fixture = createServer((_request, response) => {
  response.setHeader("content-type", "text/html");
  response.end("<!doctype html><title>Persistent browser tab</title><h1>This tab survives conversation deletion</h1>");
});
await new Promise(resolve => fixture.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${fixture.address().port}/kept`;
const env = { PATH: process.env.PATH, HOME: temporary, TMPDIR: temporary, AUX_PROFILE_DIR: join(temporary, "profile"), AUX_DATA_DIR: dataDir, AUX_LOAD_DOTENV: "0" };
let app;
const launch = () => launchApp({args:["--use-mock-keychain"],env});
async function shell() {
  const page = await shellWindow(app, 15_000);
  page.setDefaultTimeout(20_000);
  await page.locator(".app").waitFor();
  return page;
}
async function history(page) { await sidebarAction(page, "Chats"); await page.getByRole("heading", { name: "Chats" }).waitFor(); }
async function actions(page, title) { await page.getByRole("button", { name: `Conversation actions for ${title}` }).click(); }
async function openRepo(dbPath) {
  for (let attempt = 0; attempt < 100; attempt++) {
    try { return new Repo(openDb(dbPath)); }
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

  const dbPath = resolveDatabasePath(dataDir);
  const repo = await openRepo(dbPath);
  const now = Date.now();
  repo.saveRun({ runId: "lifecycle-one", goal: "Research a weekend trip", status: "completed", pageIds: [browser.pageId], config: { chatId: "lifecycle-chat" }, result: { answer: "Three options collected" }, createdAt: now - 2000, endedAt: now - 1900 });
  repo.saveRun({ runId: "lifecycle-two", goal: "Compare the best options", status: "completed", pageIds: [browser.pageId], config: { chatId: "lifecycle-chat" }, result: { answer: "The second option is the best fit" }, createdAt: now - 1000, endedAt: now - 900 });
  repo.saveStep({ stepId: "lifecycle-step", runId: "lifecycle-two", pageId: browser.pageId, op: "reload", startedAt: now - 950 });
  repo.setSetting("conversationContext:lifecycle-chat", { historyEnabled: true, excludedRunIds: ["lifecycle-one"] });
  const file = join(dataDir, "artifacts", "lifecycle-chat", "evidence.txt");
  mkdirSync(join(dataDir, "artifacts", "lifecycle-chat"), { recursive: true });
  writeFileSync(file, "conversation evidence");
  repo.saveArtifact({ artifactId: "lifecycle-artifact", runId: "lifecycle-two", pageId: browser.pageId, path: file, mediaType: "text/plain", size: 21, status: "complete", createdAt: now });
  repo.db.close();

  app = await launch(); page = await shell(); await history(page);
  await actions(page, "Research a weekend trip");
  await page.getByRole("menuitem", { name: /Rename/ }).click();
  const title = page.getByRole("textbox", { name: "Conversation title" });
  await title.fill("Autumn weekend planning");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.getByText("Autumn weekend planning", { exact: true }).waitFor();
  await actions(page, "Autumn weekend planning");
  await page.getByRole("menuitem", { name: /Archive/ }).click();
  await page.getByRole("button", { name: "Archived", exact: true }).click();
  await page.getByText("Autumn weekend planning", { exact: true }).waitFor();
  await page.screenshot({ path: join(artifactOutput, "aux-conversation-lifecycle-archived.png") });
  await app.close(); app = undefined;

  app = await launch(); page = await shell(); await history(page);
  await page.getByRole("button", { name: "Archived", exact: true }).click();
  await page.getByText("Autumn weekend planning", { exact: true }).waitFor();
  await actions(page, "Autumn weekend planning");
  await page.getByRole("menuitem", { name: /Restore/ }).click();
  await page.getByRole("button", { name: "Active", exact: true }).click();
  await page.getByText("Autumn weekend planning", { exact: true }).waitFor();
  await actions(page, "Autumn weekend planning");
  await page.getByRole("menuitem", { name: /Delete/ }).click();
  await page.getByText("Delete permanently?", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByText("Autumn weekend planning", { exact: true }).waitFor({ state: "detached" });
  assert.equal((await page.evaluate(() => window.aux.invoke("pages.list", {}))).some(item => item.url.includes("/kept")), true, "browser tab should survive conversation deletion");
  await app.close(); app = undefined;

  const verify = await openRepo(dbPath);
  assert.equal(verify.listRuns(10, { chatId: "lifecycle-chat" }).length, 0);
  assert.equal(verify.getArtifact("lifecycle-artifact"), undefined);
  assert.equal(verify.listSteps("lifecycle-two").length, 0);
  assert.equal(verify.getSetting("conversationContext:lifecycle-chat"), undefined);
  assert.equal(verify.listPages({ includeDetached: true }).some(item => item.url.includes("/kept")), true);
  verify.db.close();
  assert.equal(existsSync(file), false, "conversation artifact file should be removed");
  console.log("Conversation rename, archive, restart restore, guarded delete, and browser-data isolation work end to end.");
} finally {
  await app?.close().catch(() => {});
  fixture.closeAllConnections();
  await new Promise(resolve => fixture.close(resolve));
  rmSync(temporary, { recursive: true, force: true });
}
