// Interrupted-turn recovery in the real desktop shell. Uses only a synthetic page/profile and no model credential.
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import { sidebarAction } from "./sidebar-action.mjs";

const root = resolve(import.meta.dirname, "../..");
const { _electron } = createRequire(join(root, "packages/chromium-driver/package.json"))("playwright-core");
const electron = createRequire(join(root, "apps/desktop/package.json"))("electron");
const { openDb, Repo } = await import(join(root, "apps/runtime/dist/index.js"));
const { resolveDatabasePath } = await import(join(root, "packages/contracts/dist/installation.js"));
const temporary = mkdtempSync(join(tmpdir(), "aux-conversation-retry-"));
const dataDir = join(temporary, "data");
const artifacts = join(root, "release/test-artifacts");
mkdirSync(artifacts, { recursive: true });
const fixture = createServer((_request, response) => {
  response.setHeader("content-type", "text/html");
  response.end("<!doctype html><title>Retry context</title><h1>Safe retry context</h1>");
});
await new Promise(resolve => fixture.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${fixture.address().port}/context`;
const env = { PATH: process.env.PATH, HOME: temporary, TMPDIR: temporary, AUX_PROFILE_DIR: join(temporary, "profile"), AUX_DATA_DIR: dataDir, AUX_LOAD_DOTENV: "0" };
let app;
const launch = () => _electron.launch({ executablePath: electron, args: [join(root, "apps/desktop"), "--use-mock-keychain"], env });
async function shell() {
  for (let attempt = 0; attempt < 150; attempt++) {
    const page = app.windows().find(candidate => candidate.url().includes("renderer/index.html"));
    if (page) { page.setDefaultTimeout(20_000); await page.locator(".app").waitFor(); return page; }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Aux shell did not start");
}

try {
  app = await launch();
  let page = await shell();
  const browser = await page.evaluate(url => window.aux.invoke("pages.open", { url, activate: true }), url);
  await page.waitForFunction(id => window.aux.invoke("pages.list", {}).then(pages => pages.some(item => item.pageId === id && !item.loading)), browser.pageId);
  await app.close(); app = undefined;

  let repo;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { repo = new Repo(openDb(resolveDatabasePath(dataDir))); break; }
    catch (error) {
      if (!String(error).includes("database is locked")) throw error;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  assert.ok(repo, "runtime database should unlock after Aux exits");
  repo.saveRun({
    runId: "interrupted-conversation-turn", goal: "Recover this turn after restart", status: "running",
    pageIds: [browser.pageId], config: { chatId: "retry-conversation" }, createdAt: Date.now(), startedAt: Date.now(),
  });
  repo.db.close();

  app = await launch(); page = await shell();
  await sidebarAction(page, "Chats");
  await page.getByRole("button", { name: /Recover this turn after restart/ }).click();
  const retry = page.getByRole("button", { name: "Retry this turn", exact: true });
  await retry.waitFor();
  assert.equal(await retry.isEnabled(), true, "restored browser context should make the interrupted turn retryable");
  await page.screenshot({ path: join(artifacts, "aux-conversation-interrupted.png") });
  await retry.click();
  await page.waitForFunction(() => document.querySelectorAll(".conversation-turn").length === 2);
  const turns = await page.evaluate(() => window.aux.invoke("runs.list", { chatId: "retry-conversation", limit: 10 }));
  assert.equal(turns.length, 2);
  assert.equal(turns[0].config.retryOfRunId, "interrupted-conversation-turn");
  assert.equal(turns[0].pageIds[0], browser.pageId);
  await page.screenshot({ path: join(artifacts, "aux-conversation-retried.png") });
  console.log("Interrupted conversation turn remains visible after restart and retries once in the same thread and browser scope.");
} finally {
  await app?.close().catch(() => {});
  fixture.closeAllConnections();
  await new Promise(resolve => fixture.close(resolve));
  rmSync(temporary, { recursive: true, force: true });
}
