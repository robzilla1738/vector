import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createServer } from "node:https";
import { createServer as createHttpServer } from "node:http";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { closeAux, launchApp, shellWindow } from "./launch.mjs";
import { poll } from "./poll.mjs";

const dir = mkdtempSync(join(tmpdir(), "aux-content-memory-"));
const key = join(dir, "key.pem"), cert = join(dir, "cert.pem");
execFileSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", key, "-out", cert,
  "-days", "1", "-subj", "/CN=localhost", "-addext", "subjectAltName=DNS:localhost"], { stdio: "ignore" });
const article = "A protected article contains enough readable, ordinary editorial prose for Reader extraction. ".repeat(12);
const server = createServer({ key: readFileSync(key), cert: readFileSync(cert) }, (request, response) => {
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  if (request.url === "/no-store") response.setHeader("Cache-Control", "private, no-store");
  response.end(`<!doctype html><html><head><title>Recall fixture</title></head><body>${request.url === "/sensitive" ? '<input type="password" aria-label="Password">' : ""}<main><article><h1>Recall fixture</h1><p>${article}</p></article></main></body></html>`);
});
await new Promise(resolve => server.listen(0, "localhost", resolve));
const origin = `https://localhost:${server.address().port}`;
const providerPrompts = [];
const provider = createHttpServer(async (request, response) => {
  if (request.url !== "/v1/chat/completions") { response.writeHead(404).end(); return; }
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  providerPrompts.push(JSON.stringify(body.messages));
  const claim = "A protected article contains enough readable, ordinary editorial prose for Reader extraction.";
  const answer = JSON.stringify({ status: "done", message: "Found the saved article.", result: {
    answer: claim, report: `# Report\n${claim}\n[Source](${origin}/article)`,
  } });
  if (!body.stream) {
    response.setHeader("content-type", "application/json");
    response.end(JSON.stringify({ choices: [{ index: 0, message: { role: "assistant", content: answer }, finish_reason: "stop" }], usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 } }));
    return;
  }
  response.writeHead(200, { "content-type": "text/event-stream" });
  response.write(`data: ${JSON.stringify({ choices: [{ index: 0, delta: { content: answer }, finish_reason: null }] })}\n\n`);
  response.end("data: [DONE]\n\n");
});
await new Promise(resolve => provider.listen(0, "127.0.0.1", resolve));
const endpoint = `http://127.0.0.1:${provider.address().port}/v1`;
let app;
const launch = () => launchApp({ args: ["--use-mock-keychain", "--ignore-certificate-errors"], env: {
  PATH: process.env.PATH, HOME: dir, TMPDIR: dir, AUX_PROFILE_DIR: join(dir, "profile"),
  AUX_DATA_DIR: join(dir, "data"), AUX_LOAD_DOTENV: "0",
} });
try {
  app = await launch();
  const shell = await shellWindow(app);
  await shell.locator(".aux-home").waitFor();
  await shell.locator(".horizontal-profile").click();
  await shell.getByRole("menuitem", { name: "New space", exact: true }).click();
  const editor = shell.getByRole("dialog", { name: "New space", exact: true });
  await editor.getByPlaceholder("Name").fill("Recall fixture Space");
  await editor.getByRole("button", { name: "Create", exact: true }).click();
  await shell.getByRole("button", { name: "Switch space, current: Recall fixture Space" }).waitFor();
  const space = await shell.evaluate(async () => (await window.aux.invoke("spaces.list", {})).find(item => item.name === "Recall fixture Space"));
  const workspaceId = space?.workspaceId;
  assert.ok(workspaceId);
  const open = async (path, bind = true) => {
    const url = `${origin}${path}`;
    const page = await shell.evaluate(value => window.aux.invoke("pages.open", { url: value, activate: true }), url);
    await poll(shell, async pageId => {
      const current = (await window.aux.invoke("pages.list", {})).find(item => item.pageId === pageId);
      return current?.url.startsWith("https://localhost:") && !current.loading;
    }, page.pageId);
    if (bind) await shell.evaluate(({pageId,spaceId}) => window.aux.bindTabSpace(pageId,spaceId), {pageId:page.pageId,spaceId:space.id});
    return await shell.evaluate(pageId => window.aux.invoke("pages.list", {}).then(pages => pages.find(item => item.pageId === pageId)), page.pageId);
  };
  const page = await open("/article", false);
  assert.equal(page.url, `${origin}/article`);
  await assert.rejects(shell.evaluate(({ workspaceId, page }) => window.aux.invoke("workspaces.contentMemory.capture", {
    workspaceId, pageId: page.pageId, expectedDocumentEpoch: page.documentEpoch, expectedUrl: page.url,
  }), { workspaceId, page }), /Space changed/i);
  await shell.locator(".horizontal-tab-select[data-active=true]").click({ button: "right" });
  await shell.getByRole("menuitem", { name: "Remember article in Recall fixture Space…" }).click();
  await shell.getByRole("menuitem", { name: "Remember this article" }).click();
  await poll(shell, async ({ workspaceId, origin }) => {
    const policy = await window.aux.invoke("workspaces.contentMemory.policy", { workspaceId });
    return policy.enabled && policy.allowedOrigins.includes(origin);
  }, { workspaceId, origin });
  const policy = await shell.evaluate(workspaceId => window.aux.invoke("workspaces.contentMemory.policy", { workspaceId }), workspaceId);
  assert.deepEqual(policy.allowedOrigins, [origin]);
  const capture = current => shell.evaluate(({ workspaceId, current }) => window.aux.invoke("workspaces.contentMemory.capture", {
    workspaceId, pageId: current.pageId, expectedDocumentEpoch: current.documentEpoch, expectedUrl: current.url,
  }), { workspaceId, current });
  await poll(shell, async workspaceId => (await window.aux.invoke("workspaces.contentMemory.search", { workspaceId, query: "editorial" })).length === 1, workspaceId);
  const hits = await shell.evaluate(workspaceId => window.aux.invoke("workspaces.contentMemory.search", { workspaceId, query: "editorial" }), workspaceId);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].url, `${origin}/article`);
  const savedText = await shell.evaluate(({ workspaceId, memoryId }) => window.aux.invoke("workspaces.contentMemory.get", { workspaceId, memoryId }), { workspaceId, memoryId: hits[0].memoryId });
  assert.equal(savedText.url, hits[0].url);
  assert.match(savedText.text, /ordinary editorial prose/);
  await shell.evaluate(endpoint => window.aux.invoke("settings.set", { modelProvider: "openai-compatible", compatibleEndpoint: endpoint,
    modelCredential: { provider: "openai-compatible", key: "synthetic-recall-key" }, plannerModel: "recall-fixture" }), endpoint);
  const blank = await shell.evaluate(() => window.aux.invoke("pages.open", { url: "about:blank", activate: false }));
  const run = await shell.evaluate(({ workspaceId, memoryId, pageId }) => window.aux.invoke("runs.start", {
    goal: "What did the saved article say?", pageIds: [pageId], defaultWorkspaceId: workspaceId, chatId: "saved-article-fixture",
    contextMemoryIds: [memoryId],
  }), { workspaceId, memoryId: hits[0].memoryId, pageId: blank.pageId });
  const promptDeadline = Date.now() + 20_000;
  while (!providerPrompts.some(prompt => prompt.includes("ordinary editorial prose")) && Date.now() < promptDeadline)
    await new Promise(resolve => setTimeout(resolve, 50));
  assert.ok(providerPrompts.some(prompt => prompt.includes("https://localhost:") && prompt.includes("ordinary editorial prose")));
  await poll(shell, async runId => (await window.aux.invoke("runs.get", { runId })).run.status === "completed", run.runId, 20_000);
  const stored = await shell.evaluate(runId => window.aux.invoke("runs.get", { runId }), run.runId);
  assert.deepEqual(stored.run.config.contextMemoryIds, [hits[0].memoryId]);
  assert.match(stored.run.result.answer, /ordinary editorial prose/);
  assert.ok(!JSON.stringify(stored.run.config).includes("ordinary editorial prose"));
  const reports = await shell.evaluate(runId => window.aux.invoke("artifacts.list", { runId }), run.runId);
  assert.ok(reports.some(item => item.path.endsWith("report.md")));
  const sources = await shell.evaluate(() => window.aux.invoke("conversations.sources.get", { chatId: "saved-article-fixture" }));
  assert.ok(sources.sources.some(source => source.kind === "memory" && source.memoryId === hits[0].memoryId));
  const other = (await shell.evaluate(() => window.aux.invoke("spaces.create", { name: "Other Space", color: "green" }))).find(item => item.name === "Other Space");
  await shell.evaluate(({ workspaceId, origin }) => window.aux.invoke("workspaces.contentMemory.setPolicy", {
    workspaceId, policy: { enabled: true, retentionDays: 30, allowedOrigins: [origin] },
  }), { workspaceId: other.workspaceId, origin });
  await assert.rejects(shell.evaluate(({ workspaceId, page }) => window.aux.invoke("workspaces.contentMemory.capture", {
    workspaceId, pageId: page.pageId, expectedDocumentEpoch: page.documentEpoch, expectedUrl: page.url,
  }), { workspaceId: other.workspaceId, page }), /Space changed|visible tab/i);
  const legacy = await open("/legacy", false);
  await shell.evaluate(workspaceId => window.aux.invoke("workspaces.browsingMemory.set", { workspaceId, policy: { enabled: true, retentionDays: 7 } }), workspaceId);
  const record = workspaceId => shell.evaluate(({ workspaceId, legacy }) => window.aux.invoke("workspaces.browsingMemory.record", {
    workspaceId, pageId: legacy.pageId, expectedDocumentEpoch: legacy.documentEpoch,
  }), { workspaceId, legacy });
  assert.equal((await record(workspaceId)).recorded, false);
  const migration = await shell.evaluate(({pageId,spaceId}) => window.aux.migrateTabSpaces([{pageId,spaceId}]), {pageId:legacy.pageId,spaceId:space.id});
  assert.equal(migration.migrated, 1);
  assert.equal((await record(other.workspaceId)).recorded, false);
  assert.equal((await record(workspaceId)).recorded, true);
  const bound = await shell.evaluate(pageId => window.aux.tabsSnapshot().then(snapshot => snapshot.tabs.find(tab => tab.pageId === pageId)), legacy.pageId);
  assert.equal(bound.workspaceId, workspaceId);
  assert.equal((await shell.evaluate(({pageId,spaceId}) => window.aux.migrateTabSpaces([{pageId,spaceId}]), {pageId:legacy.pageId,spaceId:other.id})).migrated, 0);
  const noStore = await open("/no-store");
  await assert.rejects(capture(noStore), /not eligible|no-store/i);
  const sensitive = await open("/sensitive");
  await assert.rejects(capture(sensitive), /private fields|sensitive/i);
  await shell.evaluate(({ workspaceId, memoryId }) => window.aux.invoke("workspaces.contentMemory.forget", { workspaceId, memoryId }), { workspaceId, memoryId: hits[0].memoryId });
  await assert.rejects(shell.evaluate(({ workspaceId, memoryId, pageId }) => window.aux.invoke("runs.start", {
    goal: "Retry forgotten article", pageIds: [pageId], defaultWorkspaceId: workspaceId, chatId: "forgotten-article-fixture",
    contextMemoryIds: [memoryId],
  }), { workspaceId, memoryId: hits[0].memoryId, pageId: blank.pageId }), /unavailable/i);
  const after = await shell.evaluate(workspaceId => window.aux.invoke("workspaces.contentMemory.search", { workspaceId, query: "editorial" }), workspaceId);
  assert.equal(after.length, 0);
  assert.equal(await shell.evaluate(({ workspaceId, memoryId }) => window.aux.invoke("workspaces.contentMemory.get", { workspaceId, memoryId }), { workspaceId, memoryId: hits[0].memoryId }), null);
  const revokedSources = await shell.evaluate(() => window.aux.invoke("conversations.sources.get", { chatId: "saved-article-fixture" }));
  assert.ok(!revokedSources.sources.some(source => source.kind === "memory"));
  const redactedRun = await shell.evaluate(runId => window.aux.invoke("runs.get", { runId }), run.runId);
  assert.equal(redactedRun.run.status, "cancelled");
  assert.equal(redactedRun.run.result, undefined);
  assert.equal(redactedRun.run.config.contextMemoryRevoked, true);
  assert.equal((await shell.evaluate(runId => window.aux.invoke("artifacts.list", { runId }), run.runId)).length, 0);
  const oldTab = await open("/legacy-startup", false);
  assert.equal((await shell.evaluate(pageId => window.aux.tabsSnapshot().then(snapshot => snapshot.tabs.find(tab => tab.pageId === pageId)?.workspaceId), oldTab.pageId)), undefined);
  await closeAux(app); app = undefined;
  app = await launch();
  const reopened = await shellWindow(app);
  await reopened.locator(".app").waitFor();
  await poll(reopened, async ({pageId,workspaceId}) => (await window.aux.tabsSnapshot()).tabs.find(tab => tab.pageId === pageId)?.workspaceId === workspaceId,
    {pageId:oldTab.pageId,workspaceId}, 30_000);
  console.log("Native article capture, Space binding, saved-text retrieval, grounded model answer/report, Forget redaction, and restart migration passed.");
} finally {
  if (app) await closeAux(app);
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  provider.closeAllConnections();
  await new Promise(resolve => provider.close(resolve));
  rmSync(dir, { recursive: true, force: true });
}
