// Safe provider-failure recovery in the real desktop shell. Uses a synthetic profile and no credential/network provider call.
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
const temporary = mkdtempSync(join(tmpdir(), "aux-conversation-failure-"));
const dataDir = join(temporary, "data");
const artifacts = join(root, "release/test-artifacts");
mkdirSync(artifacts, { recursive: true });
const fixture = createServer((_request, response) => {
  response.setHeader("content-type", "text/html");
  response.end("<!doctype html><title>Provider recovery</title><h1>Safe browser context</h1>");
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
  const now = Date.now();
  repo.saveRun({
    runId: "safe-rate-limit", goal: "Continue after provider capacity returns", status: "failed", pageIds: [browser.pageId],
    config: { chatId: "safe-rate-limit-chat" }, error: "The provider is rate limiting requests. Wait a moment, then retry this turn.",
    failure: { category: "rate_limit", message: "The provider is rate limiting requests. Wait a moment, then retry this turn.", retryable: true, action: "retry" },
    createdAt: now - 10, startedAt: now - 10, endedAt: now,
  });
  repo.saveRun({
    runId: "safe-auth-failure", goal: "Reconnect the model for this task", status: "failed", pageIds: [browser.pageId],
    config: { chatId: "safe-auth-chat" }, error: "The model connection needs attention. Check the provider and credentials in Settings.",
    failure: { category: "authentication", message: "The model connection needs attention. Check the provider and credentials in Settings.", retryable: false, action: "model_settings" },
    createdAt: now, startedAt: now, endedAt: now,
  });
  repo.db.close();

  app = await launch(); page = await shell();
  await sidebarAction(page, "Chats");
  await page.getByRole("button", { name: /Continue after provider capacity returns/ }).click();
  await page.getByText("This turn stopped", { exact: true }).waitFor();
  assert.equal(await page.getByRole("button", { name: "Retry turn", exact: true }).isVisible(), true);
  assert.equal(await page.getByText(/private provider response/i).count(), 0, "provider bodies must not appear in the conversation");
  await page.screenshot({ path: join(artifacts, "aux-conversation-provider-recovery.png") });

  await sidebarAction(page, "Chats");
  await page.getByRole("button", { name: /Reconnect the model for this task/ }).click();
  await page.getByText("Connection needs attention", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Model settings", exact: true }).click();
  await page.getByRole("region", { name: "Settings" }).waitFor();
  assert.equal(await page.getByRole("tab", { name: "Models" }).getAttribute("aria-selected"), "true");
  await page.screenshot({ path: join(artifacts, "aux-conversation-provider-settings.png") });
  console.log("Provider failures render safe recovery actions and route configuration failures to model settings.");
} finally {
  await app?.close().catch(() => {});
  fixture.closeAllConnections();
  await new Promise(resolve => fixture.close(resolve));
  rmSync(temporary, { recursive: true, force: true });
}
