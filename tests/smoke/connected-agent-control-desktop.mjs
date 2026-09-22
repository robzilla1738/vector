// Real desktop configuration, streaming, human takeover, cancellation, and restart continuity.
// Uses an isolated local OpenAI-compatible fixture and synthetic credential only.
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import { sidebarAction } from "./sidebar-action.mjs";

const root = resolve(import.meta.dirname, "../..");
const { _electron } = createRequire(join(root, "packages/chromium-driver/package.json"))("playwright-core");
const electron = createRequire(join(root, "apps/desktop/package.json"))("electron");
const temporary = mkdtempSync(join(tmpdir(), "aux-connected-agent-"));
const dataDir = join(temporary, "data");
const artifacts = join(root, "release/test-artifacts");
mkdirSync(artifacts, { recursive: true });

let providerRequests = 0;
let streamingRequests = 0;
const provider = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/v1/chat/completions") {
    response.writeHead(404).end();
    return;
  }
  providerRequests++;
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  assert.equal(request.headers.authorization, "Bearer synthetic-local-agent");
  assert.equal(body.model, "aux-fixture-model");
  if (!body.stream) {
    const structured = !!body.response_format;
    response.setHeader("content-type", "application/json");
    response.end(JSON.stringify({
      id: `chatcmpl_${providerRequests}`,
      object: "chat.completion",
      created: 1,
      model: body.model,
      choices: [{ index: 0, message: { role: "assistant", content: structured ? '{"ok":true}' : "white" }, finish_reason: "stop" }],
      usage: { prompt_tokens: 4, completion_tokens: 5, total_tokens: 9 },
    }));
    return;
  }
  response.writeHead(200, {
    "content-type": "text/event-stream",
    "cache-control": "no-cache",
    connection: "keep-alive",
  });
  const event = content => response.write(`data: ${JSON.stringify({
    id: `chatcmpl_${providerRequests}`,
    object: "chat.completion.chunk",
    created: 1,
    model: body.model,
    choices: [{ index: 0, delta: { content }, finish_reason: null }],
  })}\n\n`);
  const streamNumber = ++streamingRequests;
  const plan = streamNumber === 1
    ? '{"status":"continue","message":"Inspecting the page","steps":[{"id":"s1","op":"extract","fields":[{"name":"heading"}]}]}'
    : '{"status":"done","message":"The page heading is ready for local agent control.","result":{"heading":"Ready for local agent control"}}';
  event(plan.slice(0, Math.ceil(plan.length / 2)));
  const timer = setTimeout(() => {
    if (response.destroyed) return;
    event(plan.slice(Math.ceil(plan.length / 2)));
    response.write(`data: ${JSON.stringify({ id: `chatcmpl_${providerRequests}`, object: "chat.completion.chunk", created: 1, model: body.model, choices: [{ index: 0, delta: {}, finish_reason: "stop" }] })}\n\n`);
    response.end("data: [DONE]\n\n");
  }, streamNumber === 1 ? 15_000 : 20);
  timer.unref();
  response.on("close", () => clearTimeout(timer));
});
await new Promise(resolveListen => provider.listen(0, "127.0.0.1", resolveListen));
const endpoint = `http://127.0.0.1:${provider.address().port}/v1`;

const pageFixture = createServer((_request, response) => {
  response.setHeader("content-type", "text/html");
  response.end("<!doctype html><title>Aux connected agent</title><h1>Ready for local agent control</h1><button>Safe action</button>");
});
await new Promise(resolveListen => pageFixture.listen(0, "127.0.0.1", resolveListen));
const pageUrl = `http://127.0.0.1:${pageFixture.address().port}/task`;
const env = {
  PATH: process.env.PATH,
  HOME: temporary,
  TMPDIR: temporary,
  AUX_PROFILE_DIR: join(temporary, "profile"),
  AUX_DATA_DIR: dataDir,
  AUX_LOAD_DOTENV: "0",
};
let app;
const launch = () => _electron.launch({ executablePath: electron, args: [join(root, "apps/desktop"), "--use-mock-keychain"], env });
async function shell() {
  for (let attempt = 0; attempt < 150; attempt++) {
    const page = app.windows().find(candidate => candidate.url().includes("renderer/index.html"));
    if (page) {
      page.setDefaultTimeout(20_000);
      await page.locator(".app").waitFor();
      return page;
    }
    await new Promise(resolveWait => setTimeout(resolveWait, 100));
  }
  throw new Error("Aux shell did not start");
}

function filesBelow(directory) {
  if (!statSync(directory).isDirectory()) return [directory];
  return readdirSync(directory).flatMap(name => filesBelow(join(directory, name)));
}

try {
  app = await launch();
  let page = await shell();
  await sidebarAction(page, "Settings");
  let settings = page.getByRole("region", { name: "Settings", exact: true });
  await settings.getByRole("button", { name: "Models", exact: true }).click();
  await settings.getByLabel("Model provider", { exact: true }).selectOption("openai-compatible");
  await settings.getByLabel("OpenAI-compatible endpoint", { exact: true }).fill(`${endpoint}/`);
  await settings.getByRole("button", { name: "Save endpoint", exact: true }).click();
  await settings.getByLabel("Provider API key", { exact: true }).fill("synthetic-local-agent");
  await settings.getByRole("button", { name: "Save key", exact: true }).click();
  await settings.getByLabel("Planner model", { exact: true }).fill("aux-fixture-model");
  await settings.getByRole("button", { name: "Save model", exact: true }).click();
  await settings.getByRole("button", { name: "Test connection", exact: true }).click();
  await settings.getByRole("status").filter({ hasText: "Connection tested" }).waitFor();
  await page.screenshot({ path: join(artifacts, "aux-openai-compatible-settings.png") });
  const configured = await page.evaluate(() => window.aux.invoke("settings.get", {}));
  assert.equal(configured.modelEndpoint, endpoint);
  assert.equal(configured.modelApiKey, "••••••••");
  assert.equal(configured.modelConfigured, true);
  await settings.getByRole("button", { name: "Close settings", exact: true }).click();

  const browser = await page.evaluate(url => window.aux.invoke("pages.open", { url, activate: true }), pageUrl);
  await page.waitForFunction(id => window.aux.invoke("pages.list", {}).then(pages => pages.some(item => item.pageId === id && !item.loading)), browser.pageId);
  const run = await page.evaluate(pageId => window.aux.invoke("runs.start", { goal: "Inspect the local page while I can intervene", pageIds: [pageId], chatId: "connected-agent-chat" }), browser.pageId);
  await sidebarAction(page, "Chats");
  await page.locator("button.history-conversation").filter({ hasText: "Inspect the local page while I can intervene" }).click();
  const take = page.getByRole("button", { name: "Take control of browser tab", exact: true });
  await take.waitFor();
  await take.click();
  await page.waitForFunction(runId => window.aux.invoke("runs.get", { runId }).then(item => item.run.status === "paused"), run.runId);
  await sidebarAction(page, "Chats");
  await page.locator("button.history-conversation").filter({ hasText: "Inspect the local page while I can intervene" }).click();
  await page.getByText("You're in control", { exact: true }).waitFor();
  await page.screenshot({ path: join(artifacts, "aux-agent-human-control.png") });
  await page.getByRole("button", { name: "Return control", exact: true }).click();
  await take.waitFor();
  await page.waitForFunction(runId => window.aux.invoke("runs.get", { runId }).then(item => item.run.status === "planning" || item.run.status === "running"), run.runId);
  await page.getByRole("button", { name: "Stop run", exact: true }).click();
  await page.getByText("Cancelled", { exact: true }).waitFor();
  assert.equal((await page.evaluate(runId => window.aux.invoke("runs.get", { runId }), run.runId)).run.status, "cancelled");
  const provenance = page.locator(".run-provenance");
  await provenance.getByText(/openai-compatible · aux-fixture-model/).waitFor();
  await provenance.locator("summary").click();
  await provenance.getByText(`Destination ${new URL(endpoint).origin}`, { exact: true }).waitFor();
  await page.screenshot({ path: join(artifacts, "aux-agent-provider-provenance.png") });
  assert.ok(providerRequests >= 3, "probe and streaming run must reach the configured local endpoint");

  await app.close();
  app = undefined;
  app = await launch();
  page = await shell();
  const restored = await page.evaluate(() => window.aux.invoke("settings.get", {}));
  assert.equal(restored.modelProvider, "openai-compatible");
  assert.equal(restored.modelEndpoint, endpoint);
  assert.equal(restored.modelApiKey, "••••••••");
  assert.equal(restored.modelProbe?.ok, true);
  await sidebarAction(page, "Chats");
  await page.locator("button.history-conversation").filter({ hasText: "Inspect the local page while I can intervene" }).click();
  await page.locator(".run-provenance").getByText(/openai-compatible · aux-fixture-model/).waitFor();
  await page.locator(".run-provenance summary").click();
  await page.locator(".run-provenance").getByText(`Destination ${new URL(endpoint).origin}`, { exact: true }).waitFor();
  await page.getByLabel("Reply to conversation", { exact: true }).fill("What heading did you find?");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page.waitForFunction(async () => {
    const runs = await window.aux.invoke("runs.list", { chatId: "connected-agent-chat", limit: 10 });
    return runs.length === 2 && runs[0].status === "completed";
  });
  assert.equal(await page.locator(".conversation-turn").count(), 2, "A provider-backed follow-up must remain in the same conversation");
  await page.locator(".conversation-turn").last().getByText("Ready for local agent control", { exact: true }).waitFor();
  for (const file of filesBelow(dataDir)) {
    if (!statSync(file).isFile()) continue;
    assert.equal(readFileSync(file).includes(Buffer.from("synthetic-local-agent")), false, `plaintext credential leaked into ${file}`);
  }
  await sidebarAction(page, "Settings");
  settings = page.getByRole("region", { name: "Settings", exact: true });
  await settings.getByRole("button", { name: "Models", exact: true }).click();
  await settings.getByRole("status").filter({ hasText: "Connection tested" }).waitFor();
  console.log("OpenAI-compatible setup, encrypted credential continuity, local streaming, takeover, return, cancellation, restart follow-up continuity, and durable provider provenance verified.");
} finally {
  await app?.close().catch(() => {});
  provider.closeAllConnections();
  pageFixture.closeAllConnections();
  await Promise.all([
    new Promise(resolveClose => provider.close(resolveClose)),
    new Promise(resolveClose => pageFixture.close(resolveClose)),
  ]);
  rmSync(temporary, { recursive: true, force: true });
}
