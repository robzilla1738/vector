// Local document context through the real conversation UI. Synthetic file/profile, no provider or credential.
import { createServer } from "node:http";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import { sidebarAction } from "./sidebar-action.mjs";
import { launchApp, shellWindow } from "./launch.mjs";

const root = resolve(import.meta.dirname, "../..");
const { openDb, Repo } = await import(join(root, "apps/runtime/dist/index.js"));
const { resolveDatabasePath } = await import(join(root, "packages/contracts/dist/installation.js"));
const temporary = mkdtempSync(join(tmpdir(), "aux-conversation-document-"));
const dataDir = join(temporary, "data");
const screenshots = join(root, "release/test-artifacts");
mkdirSync(screenshots, { recursive: true });
const documentPath = join(temporary, "comparison-brief.md");
const documentText = "# Comparison brief\n\nOption A costs less. Option B has offline support. Prefer B for travel.";
writeFileSync(documentPath, documentText);
const fixture = createServer((_request, response) => {
  response.setHeader("content-type", "text/html");
  response.end("<!doctype html><title>Document workspace</title><h1>Document context fixture</h1>");
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
const choose = async path => app.evaluate(({ dialog }, selected) => { dialog.showOpenDialog = async () => ({ canceled: !selected, filePaths: selected ? [selected] : [] }); }, path);

try {
  app = await launch();
  let page = await shell();
  const browser = await page.evaluate(url => window.aux.invoke("pages.open", { url, activate: true }), url);
  await page.waitForFunction(id => window.aux.invoke("pages.list", {}).then(pages => pages.some(item => item.pageId === id && !item.loading)), browser.pageId);
  await app.close(); app = undefined;

  const repo = await openRepo();
  repo.saveRun({ runId: "document-base", goal: "Compare the travel options", status: "completed", pageIds: [browser.pageId], config: { chatId: "document-chat" }, result: { answer: "I need the local brief to finish." }, createdAt: Date.now(), endedAt: Date.now() });
  repo.db.close();

  app = await launch(); page = await shell();
  await sidebarAction(page, "Chats");
  await page.locator(".history-conversation").filter({ hasText: "Compare the travel options" }).click();
  await page.getByRole("button", { name: "Context · 1", exact: true }).click();
  await choose(documentPath);
  await page.getByRole("button", { name: "Attach document", exact: true }).click();
  await page.getByText("comparison-brief.md", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Context · 2", exact: true }).waitFor();
  assert.equal(await page.getByText(/Option A costs less/).count(), 1);
  await page.screenshot({ path: join(screenshots, "aux-conversation-document-context.png") });
  writeFileSync(documentPath, "The source changed after selection and must not replace the saved snapshot.");
  await app.close(); app = undefined;

  app = await launch(); page = await shell();
  await sidebarAction(page, "Chats");
  await page.locator(".history-conversation").filter({ hasText: "Compare the travel options" }).click();
  await page.getByRole("button", { name: "Context · 2", exact: true }).click();
  await page.getByText(/Option A costs less/).waitFor();
  await page.getByRole("textbox", { name: "Reply to conversation" }).fill("Use the attached brief to make the choice.");
  // Start through the same runtime boundary without configuring a provider. The UI keeps
  // the draft because no model is configured; this call proves context assembly without a request.
  await page.evaluate(pageId => window.aux.invoke("runs.start", { goal: "Use the attached brief to make the choice.", chatId: "document-chat", pageIds: [pageId] }), browser.pageId);
  await page.waitForFunction(() => window.aux.invoke("runs.list", { chatId: "document-chat", limit: 10 }).then(runs => runs.length === 2));
  const runs = await page.evaluate(() => window.aux.invoke("runs.list", { chatId: "document-chat", limit: 10 }));
  const next = runs[0];
  assert.equal(next.config.contextAttachmentIds.length, 1);
  assert.match(next.config.context, /Option A costs less/);
  assert.doesNotMatch(next.config.context, /source changed after selection/);
  assert.doesNotMatch(JSON.stringify(next), new RegExp(temporary.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  const exposed = await page.evaluate(() => window.aux.invoke("conversations.attachments.get", { chatId: "document-chat" }));
  assert.equal("content" in exposed.attachments[0], false, "attachment API should expose only a bounded excerpt");
  const contextButton = page.getByRole("button", { name: /^Context ·/ });
  if ((await contextButton.getAttribute("aria-expanded")) !== "true") await contextButton.click();
  await page.getByRole("button", { name: "Remove comparison-brief.md", exact: true }).click();
  await page.getByText("comparison-brief.md", { exact: true }).waitFor({ state: "detached" });
  assert.equal((await page.evaluate(() => window.aux.invoke("conversations.attachments.get", { chatId: "document-chat" }))).attachments.length, 0);
  console.log("Local document context survives restart, remains inspectable/removable, and stamps a bounded snapshot onto the next turn.");
} finally {
  await app?.close().catch(() => {});
  fixture.closeAllConnections();
  await new Promise(resolve => fixture.close(resolve));
  rmSync(temporary, { recursive: true, force: true });
}
