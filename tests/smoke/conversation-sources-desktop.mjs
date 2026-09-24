// Durable, inspectable browser-source provenance in the real desktop shell.
// Uses isolated local pages and profile; no provider or credential access.
import { createServer } from "node:http";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import { sidebarAction } from "./sidebar-action.mjs";
import { launchApp, shellWindow } from "./launch.mjs";

const root = resolve(import.meta.dirname, "../..");
const { openDb, Repo } = await import(join(root, "apps/runtime/dist/index.js"));
const { resolveDatabasePath } = await import(join(root, "packages/contracts/dist/installation.js"));
const temporary = mkdtempSync(join(tmpdir(), "aux-conversation-sources-"));
const dataDir = join(temporary, "data");
const artifactsDir = join(root, "release/test-artifacts");
mkdirSync(artifactsDir, { recursive: true });
const fixture = createServer((request, response) => {
  const alpha = request.url?.includes("alpha");
  response.setHeader("content-type", "text/html");
  response.end(`<!doctype html><title>Research ${alpha ? "Alpha" : "Beta"}</title><h1>${alpha ? "Alpha private body" : "Beta private body"}</h1>`);
});
await new Promise(resolveListen => fixture.listen(0, "127.0.0.1", resolveListen));
const base = `http://127.0.0.1:${fixture.address().port}`;
const env = { PATH: process.env.PATH, HOME: temporary, TMPDIR: temporary, AUX_PROFILE_DIR: join(temporary, "profile"), AUX_DATA_DIR: dataDir, AUX_LOAD_DOTENV: "0" };
let app;
let secondaryApp;
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
      await new Promise(resolveWait => setTimeout(resolveWait, 50));
    }
  }
  throw new Error("runtime database did not unlock");
}
async function waitActiveUrl(page, url) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const workspace = await page.evaluate(() => window.aux.invoke("workspace.get", {}));
    if (workspace.pages.find(item => item.pageId === workspace.activePageId)?.url === url) return workspace;
    await new Promise(resolveWait => setTimeout(resolveWait, 50));
  }
  throw new Error(`Aux did not activate ${url}`);
}
function observation({ id, pageId, profileId = "default", url, title, observedAt, revision, documentEpoch }) {
  return { observationId: id, pageId, profileId, documentEpoch, revision, observedAt, scope: "full", content: {
    url, title, viewport: { width: 1000, height: 700, scale: 1 }, scroll: { x: 0, y: 0, maxY: 0 }, frames: [], text: `${title} PRIVATE_PAGE_BODY`, headings: [title], elements: [], formFields: [], tables: [], links: [], dialogs: [], truncated: false,
    stats: { elementsTotal: 0, elementsShown: 0, textChars: title.length, approxTokens: 4 },
  } };
}

try {
  app = await launch();
  let page = await shell();
  const alpha = await page.evaluate(url => window.aux.invoke("pages.open", { url, activate: true }), `${base}/alpha`);
  const beta = await page.evaluate(url => window.aux.invoke("pages.open", { url, activate: true }), `${base}/beta`);
  const otherProfile = await page.evaluate(() => window.aux.createBrowserProfile("Work"));
  await page.waitForFunction(ids => window.aux.invoke("pages.list", {}).then(pages => ids.every(id => pages.some(item => item.pageId === id && !item.loading))), [alpha.pageId, beta.pageId]);
  const liveObservation = await page.evaluate(pageId => window.aux.invoke("pages.observe", { pageId }), alpha.pageId);
  assert.equal(liveObservation.profileId, "default", "native observations should carry their owning browser Profile");
  const epochs = Object.fromEntries((await page.evaluate(() => window.aux.invoke("pages.list", {}))).map(item => [item.pageId, item.documentEpoch]));
  await app.close(); app = undefined;

  const repo = await openRepo();
  assert.equal(repo.db.prepare("SELECT name FROM sqlite_schema WHERE type='table' AND name='observations'").get(), undefined,
    "ordinary page observations must not be stored in the profile database");
  const now = Date.now();
  repo.saveRun({ runId: "source-run", goal: "Compare the two research sources", status: "completed", pageIds: [alpha.pageId, beta.pageId], config: { chatId: "source-chat" }, result: { answer: "Alpha and Beta were compared from observed pages." }, createdAt: now, endedAt: now + 5 });
  const dir = join(dataDir, "artifacts", "source-run");
  mkdirSync(dir, { recursive: true });
  const records = [
    ["source-alpha-old", observation({ id: "obs-alpha-old", pageId: alpha.pageId, url: `${base}/alpha`, title: "Research Alpha old", observedAt: now + 1, revision: 1, documentEpoch: epochs[alpha.pageId] })],
    ["source-alpha-latest", observation({ id: "obs-alpha-latest", pageId: alpha.pageId, url: `${base}/alpha`, title: "Research Alpha", observedAt: now + 3, revision: 2, documentEpoch: epochs[alpha.pageId] })],
    ["source-beta", observation({ id: "obs-beta", pageId: beta.pageId, url: `${base}/beta`, title: "Research Beta", observedAt: now + 2, revision: 1, documentEpoch: epochs[beta.pageId] })],
    ["source-local", observation({ id: "obs-local", pageId: beta.pageId, url: "file:///Users/example/private.txt", title: "Private local path", observedAt: now + 4, revision: 2, documentEpoch: epochs[beta.pageId] })],
    ["source-other-profile", observation({ id: "obs-other-profile", pageId: "other-profile-page", profileId: otherProfile.id, url: `${base}/other-profile`, title: "Research in Work", observedAt: now + 5, revision: 1, documentEpoch: 1 })],
  ];
  for (const [artifactId, record] of records) {
    const path = join(dir, `${artifactId}.json`);
    const content = JSON.stringify(record);
    writeFileSync(path, content);
    repo.saveArtifact({ artifactId, runId: "source-run", pageId: record.pageId, path, mediaType: "application/json", size: Buffer.byteLength(content), status: "complete", createdAt: record.observedAt });
  }
  repo.db.close();

  app = await launch(); page = await shell();
  secondaryApp = await launchApp({ args: ["--use-mock-keychain"], env: {
    PATH: process.env.PATH, HOME: temporary, TMPDIR: temporary, AUX_DATA_DIR: join(dataDir, "browser-profiles", otherProfile.id, "runtime"),
    AUX_PROFILE_DIR: join(dataDir, "browser-profiles", otherProfile.id, "browser"), AUX_PROFILE_CATALOG_DIR: join(dataDir, "browser-profiles"),
    AUX_BROWSER_PROFILE_ID: otherProfile.id, AUX_LOAD_DOTENV: "0",
  } });
  const otherPage = await shellWindow(secondaryApp, 15_000);
  await sidebarAction(page, "Chats");
  await page.locator("button.history-conversation").filter({ hasText: "Compare the two research sources" }).click();
  const sourcesSummary = page.locator(".conversation-sources summary");
  await sourcesSummary.waitFor();
  await sourcesSummary.click();
  const sourceList = page.locator(".conversation-sources");
  await sourceList.getByRole("button", { name: /Research Alpha/ }).waitFor();
  await sourceList.getByRole("button", { name: /Research Beta/ }).waitFor();
  await sourceList.getByRole("button", { name: /Research in Work/ }).waitFor();
  assert.equal(await page.locator(".conversation-sources button").count(), 3, "same-turn URL revisions should collapse to the latest source");
  const sources = await page.evaluate(() => window.aux.invoke("conversations.sources.get", { chatId: "source-chat" }));
  assert.deepEqual(sources.sources.map(source => source.sourceId), ["source-beta", "source-alpha-latest", "source-other-profile"]);
  assert.deepEqual(sources.sources.map(source => source.profileId), ["default", "default", otherProfile.id], "source provenance should retain each captured Profile");
  assert.equal(JSON.stringify(sources).includes(temporary), false, "source API must not expose artifact paths");
  assert.equal(JSON.stringify(sources).includes("PRIVATE_PAGE_BODY"), false, "source API must not expose captured page text");
  await page.screenshot({ path: join(artifactsDir, "aux-conversation-sources.png") });

  await sourceList.getByRole("button", { name: /Research Alpha/ }).click();
  assert.notEqual((await waitActiveUrl(page, `${base}/alpha`)).activePageId, alpha.pageId, "restored page has a new document epoch and cannot stand in for the captured source");
  await page.evaluate(pageId => window.aux.invoke("pages.close", { pageId }), beta.pageId);
  const unrelatedBeta = await page.evaluate(url => window.aux.invoke("pages.open", { url, activate: true }), `${base}/beta`);
  await sidebarAction(page, "Chats");
  await page.locator("button.history-conversation").filter({ hasText: "Compare the two research sources" }).click();
  await page.locator(".conversation-sources summary").click();
  await page.locator(".conversation-sources").getByRole("button", { name: /Research Beta/ }).click();
  const reopened = await waitActiveUrl(page, `${base}/beta`);
  assert.notEqual(reopened.activePageId, beta.pageId, "closed source should receive a new page identity");
  assert.notEqual(reopened.activePageId, unrelatedBeta.pageId, "same-URL tab is not the observed source identity");
  assert.equal(reopened.pages.find(item => item.pageId === reopened.activePageId)?.url, `${base}/beta`);

  await sidebarAction(page, "Chats");
  await page.locator("button.history-conversation").filter({ hasText: "Compare the two research sources" }).click();
  await page.locator(".conversation-sources summary").click();
  await page.locator(".conversation-sources").getByRole("button", { name: /Research in Work/ }).click();
  await waitActiveUrl(otherPage, `${base}/other-profile`);
  const personalPages = await page.evaluate(() => window.aux.invoke("pages.list", {}));
  assert.ok(!personalPages.some(item => item.url === `${base}/other-profile`), "a Work source must not open in Personal");

  await sidebarAction(page, "Chats");
  await page.locator("button.history-conversation").filter({ hasText: "Compare the two research sources" }).click();
  const exportedPath = join(temporary, "source-report.md");
  await app.evaluate(({ dialog }, filePath) => { dialog.showSaveDialog = async () => ({ canceled: false, filePath }); }, exportedPath);
  await page.getByRole("button", { name: "Export conversation as Markdown", exact: true }).click();
  await page.waitForFunction(() => document.body.textContent?.includes("Conversation exported"));
  const exported = readFileSync(exportedPath, "utf8");
  assert.match(exported, /Sources observed by Aux/);
  assert.match(exported, /source-alpha-latest revision 2/);
  assert.match(exported, /browser Profile default/);
  assert.match(exported, new RegExp(`browser Profile ${otherProfile.id}`));
  assert.doesNotMatch(exported, /source-alpha-old/);
  assert.doesNotMatch(exported, /PRIVATE_PAGE_BODY/);
  assert.doesNotMatch(exported, new RegExp(temporary.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  console.log("Conversation sources survive restart, retain Profile identity, open in the correct running Profile, and export path-free provenance.");
} finally {
  await secondaryApp?.close().catch(() => {});
  await app?.close().catch(() => {});
  fixture.closeAllConnections();
  await new Promise(resolveClose => fixture.close(resolveClose));
  rmSync(temporary, { recursive: true, force: true });
}
