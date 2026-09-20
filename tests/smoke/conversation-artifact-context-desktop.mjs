// Generated artifact context through the real conversation UI. Synthetic profile/content, no provider or credential.
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import { sidebarAction } from "./sidebar-action.mjs";

const root = resolve(import.meta.dirname, "../..");
const { _electron } = createRequire(join(root, "packages/engine-client/package.json"))("playwright-core");
const electron = createRequire(join(root, "apps/desktop/package.json"))("electron");
const { openDb, Repo } = await import(join(root, "apps/runtime/dist/index.js"));
const { resolveDatabasePath } = await import(join(root, "packages/contracts/dist/installation.js"));
const temporary = mkdtempSync(join(tmpdir(), "aux-conversation-artifact-"));
const dataDir = join(temporary, "data");
const screenshots = join(root, "release/test-artifacts");
mkdirSync(screenshots, { recursive: true });
const fixture = createServer((_request, response) => {
  response.setHeader("content-type", "text/html");
  response.end("<!doctype html><title>Artifact workspace</title><h1>Generated artifact fixture</h1>");
});
await new Promise(resolve => fixture.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${fixture.address().port}/context`;
const env = { PATH: process.env.PATH, HOME: temporary, TMPDIR: temporary, AUX_PROFILE_DIR: join(temporary, "profile"), AUX_DATA_DIR: dataDir, AUX_LOAD_DOTENV: "0", AUX_ENGINE: "0", AUX_ENGINE_MODE: "off" };
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
  const browser = await page.evaluate(url => window.vector.invoke("pages.open", { url, activate: true }), url);
  await page.waitForFunction(id => window.vector.invoke("pages.list", {}).then(pages => pages.some(item => item.pageId === id && !item.loading)), browser.pageId);
  await app.close(); app = undefined;

  const repo = await openRepo();
  const now = Date.now();
  repo.saveRun({ runId: "artifact-base", goal: "Build a travel comparison", status: "completed", pageIds: [browser.pageId], config: { chatId: "artifact-chat", context: "HIDDEN_PROMPT_CONTEXT" }, result: { answer: "I created a comparison artifact." }, createdAt: now, endedAt: now + 1 });
  const artifactDir = join(dataDir, "artifacts", "artifact-base");
  const artifactPath = join(artifactDir, "artifact-report-travel-comparison.md");
  const artifactText = "# Travel comparison\n\nOption B supports offline work and is the recommended choice.";
  mkdirSync(artifactDir, { recursive: true });
  writeFileSync(artifactPath, artifactText);
  repo.saveArtifact({ artifactId: "artifact-report", runId: "artifact-base", pageId: browser.pageId, path: artifactPath, mediaType: "text/markdown", size: Buffer.byteLength(artifactText), status: "complete", createdAt: now + 2 });
  repo.db.close();

  app = await launch(); page = await shell();
  await sidebarAction(page, "Chats");
  await page.locator(".history-conversation").filter({ hasText: "Build a travel comparison" }).click();
  await page.getByRole("button", { name: "Context · 1", exact: true }).click();
  await page.getByText("travel-comparison.md", { exact: true }).waitFor();
  assert.equal(await page.getByText(/Option B supports offline work/).count(), 1);
  const artifactCheckbox = page.locator(".conversation-document").filter({ hasText: "travel-comparison.md" }).getByRole("checkbox");
  await artifactCheckbox.click();
  await page.waitForFunction(() => window.vector.invoke("conversations.artifacts.get", { chatId: "artifact-chat" }).then(result => result.artifacts[0]?.included === true));
  assert.equal(await artifactCheckbox.isChecked(), true);
  await page.getByRole("button", { name: "Context · 2", exact: true }).waitFor();
  await page.screenshot({ path: join(screenshots, "aux-conversation-artifact-context.png") });
  await app.close(); app = undefined;

  app = await launch(); page = await shell();
  await sidebarAction(page, "Chats");
  await page.locator(".history-conversation").filter({ hasText: "Build a travel comparison" }).click();
  await page.getByRole("button", { name: "Context · 2", exact: true }).click();
  const row = page.locator(".conversation-document").filter({ hasText: "travel-comparison.md" });
  assert.equal(await row.getByRole("checkbox").isChecked(), true);
  const exposed = await page.evaluate(() => window.vector.invoke("conversations.artifacts.get", { chatId: "artifact-chat" }));
  assert.equal("path" in exposed.artifacts[0], false, "conversation artifact API must not expose its filesystem path");
  const exportedPath = join(temporary, "conversation.md");
  await app.evaluate(({ dialog }, filePath) => { dialog.showSaveDialog = async () => ({ canceled: false, filePath }); }, exportedPath);
  await page.getByRole("button", { name: "Export conversation as Markdown", exact: true }).click();
  await page.waitForFunction(() => document.body.textContent?.includes("Conversation exported"));
  const exported = readFileSync(exportedPath, "utf8");
  assert.match(exported, /# Aux conversation/);
  assert.match(exported, /travel-comparison\.md/);
  assert.match(exported, /artifact-report/);
  assert.doesNotMatch(exported, /HIDDEN_PROMPT_CONTEXT/);
  assert.doesNotMatch(exported, new RegExp(temporary.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  await page.evaluate(pageId => window.vector.invoke("runs.start", { goal: "Use the generated comparison.", chatId: "artifact-chat", pageIds: [pageId] }), browser.pageId);
  await page.waitForFunction(() => window.vector.invoke("runs.list", { chatId: "artifact-chat", limit: 10 }).then(runs => runs.length === 2));
  const runs = await page.evaluate(() => window.vector.invoke("runs.list", { chatId: "artifact-chat", limit: 10 }));
  assert.deepEqual(runs[0].config.contextArtifactIds, ["artifact-report"]);
  assert.match(runs[0].config.context, /Option B supports offline work/);
  assert.doesNotMatch(JSON.stringify(runs[0]), new RegExp(temporary.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  console.log("Generated artifact selection survives restart and stamps bounded, path-free provenance onto the next turn.");
} finally {
  await app?.close().catch(() => {});
  fixture.closeAllConnections();
  await new Promise(resolve => fixture.close(resolve));
  rmSync(temporary, { recursive: true, force: true });
}
