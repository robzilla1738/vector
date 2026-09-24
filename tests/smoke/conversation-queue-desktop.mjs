// A live conversation accepts a correction, then queues a follow-up that survives restart.
import { createServer } from "node:http";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import { sidebarAction } from "./sidebar-action.mjs";
import { launchApp, shellWindow } from "./launch.mjs";

const temporary = mkdtempSync(join(tmpdir(), "aux-queued-chat-"));
const artifacts = resolve(import.meta.dirname, "../../release/test-artifacts");
mkdirSync(artifacts, { recursive: true });
let streams = 0;
const provider = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/v1/chat/completions") { response.writeHead(404).end(); return; }
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (!body.stream) {
    response.setHeader("content-type", "application/json");
    response.end(JSON.stringify({ id: "chatcmpl_probe", object: "chat.completion", created: 1, model: body.model,
      choices: [{ index: 0, message: { role: "assistant", content: body.response_format ? '{"ok":true}' : "ready" }, finish_reason: "stop" }],
      usage: { prompt_tokens: 2, completion_tokens: 2, total_tokens: 4 } }));
    return;
  }
  streams++;
  response.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache" });
  const send = content => response.write(`data: ${JSON.stringify({ id: "chatcmpl_stream", object: "chat.completion.chunk", created: 1, model: body.model,
    choices: [{ index: 0, delta: { content }, finish_reason: null }] })}\n\n`);
  const finish = () => {
    if (response.destroyed) return;
    send('{"status":"done","message":"Queued work finished.","result":{"ok":true}}');
    response.write("data: [DONE]\n\n");
    response.end();
  };
  if (streams <= 2) {
    const timer = setTimeout(finish, 30_000);
    timer.unref();
    response.on("close", () => clearTimeout(timer));
  } else finish();
});
await new Promise(resolve => provider.listen(0, "127.0.0.1", resolve));
const endpoint = `http://127.0.0.1:${provider.address().port}/v1`;
const fixture = createServer((_request, response) => {
  response.setHeader("content-type", "text/html");
  response.end("<!doctype html><title>Queue fixture</title><h1>Queue fixture</h1>");
});
await new Promise(resolve => fixture.listen(0, "127.0.0.1", resolve));
const pageUrl = `http://127.0.0.1:${fixture.address().port}/task`;
const env = { PATH: process.env.PATH, HOME: temporary, TMPDIR: temporary, AUX_PROFILE_DIR: join(temporary, "profile"), AUX_DATA_DIR: join(temporary, "data"), AUX_LOAD_DOTENV: "0" };
let app;
const launch = () => launchApp({ args: ["--use-mock-keychain"], env });
const shell = async () => {
  const page = await shellWindow(app, 15_000);
  page.setDefaultTimeout(20_000);
  await page.locator(".app").waitFor();
  return page;
};

try {
  app = await launch();
  let page = await shell();
  await sidebarAction(page, "Settings");
  const settings = page.getByRole("region", { name: "Settings", exact: true });
  await settings.getByRole("button", { name: "Connections", exact: true }).click();
  await settings.getByRole("tab", { name: "Models", exact: true }).click();
  await settings.getByRole("combobox", { name: "Model provider", exact: true }).selectOption("openai-compatible");
  await settings.getByRole("textbox", { name: "OpenAI-compatible endpoint", exact: true }).fill(`${endpoint}/`);
  await settings.getByRole("button", { name: "Save endpoint", exact: true }).click();
  await settings.getByRole("textbox", { name: "Provider API key", exact: true }).fill("synthetic-queue");
  await settings.getByRole("button", { name: "Save key", exact: true }).click();
  await settings.getByRole("combobox", { name: "Planner model", exact: true }).fill("aux-queue-fixture");
  await settings.getByRole("button", { name: "Save model", exact: true }).click();
  await settings.getByRole("button", { name: "Test connection", exact: true }).click();
  await settings.getByRole("status").filter({ hasText: "Connection tested" }).waitFor();
  await settings.getByRole("button", { name: "Close settings", exact: true }).click();

  const browser = await page.evaluate(url => window.aux.invoke("pages.open", { url, activate: true }), pageUrl);
  await page.waitForFunction(id => window.aux.invoke("pages.list", {}).then(pages => pages.some(item => item.pageId === id && !item.loading)), browser.pageId);
  const first = await page.evaluate(pageId => window.aux.invoke("runs.start", { goal: "Review the queue fixture", pageIds: [pageId], chatId: "queue-chat" }), browser.pageId);
  await sidebarAction(page, "Chats");
  await page.locator("button.history-conversation").filter({ hasText: "Review the queue fixture" }).click();
  await page.getByLabel("Reply to conversation", { exact: true }).fill("Use the latest figures");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page.getByText("Changed task", { exact: true }).waitFor();
  const steer = (await page.evaluate(() => window.aux.invoke("runs.messages.list", { chatId: "queue-chat" }))).find(message => message.mode === "steer");
  assert.equal(steer?.status, "delivered");
  assert.equal(steer.targetRunId, first.runId);
  const steeredRun = await page.evaluate(runId => window.aux.invoke("runs.get", { runId }), first.runId);
  assert.equal(steeredRun.run.config.messageRevision, 1);
  await page.getByRole("button", { name: "Queue next", exact: true }).click();
  await page.getByLabel("Reply to conversation", { exact: true }).fill("Summarize what you found next");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page.getByText("Queued next", { exact: true }).waitFor();
  await page.screenshot({ path: join(artifacts, "aux-queued-conversation.png") });
  const accepted = await page.evaluate(() => window.aux.invoke("runs.messages.list", { chatId: "queue-chat" }));
  const queued = accepted.find(message => message.mode === "queue");
  assert.equal(accepted.length, 2);
  assert.equal(queued?.targetRunId, first.runId);
  assert.equal(queued?.status, "accepted");
  await app.close(); app = undefined;

  app = await launch(); page = await shell();
  let messages = [];
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    messages = await page.evaluate(() => window.aux.invoke("runs.messages.list", { chatId: "queue-chat" })).catch(() => []);
    if (messages.some(message => message.mode === "queue" && ["delivered", "needs_attention"].includes(message.status))) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  const turns = await page.evaluate(() => window.aux.invoke("runs.list", { chatId: "queue-chat", limit: 10, includeArchived: true }));
  const deliveredQueue = messages.find(message => message.mode === "queue");
  assert.equal(messages.length, 2);
  assert.equal(messages.find(message => message.mode === "steer")?.status, "delivered");
  assert.equal(turns.filter(run => run.runId === deliveredQueue.deliveryRunId).length, 1);
  assert.equal(turns.find(run => run.runId === deliveredQueue.deliveryRunId)?.goal, "Summarize what you found next");
  console.log("Conversation correction is acknowledged, and the queued follow-up is delivered once after restart.");
} catch (error) {
  const page = app ? await shellWindow(app).catch(() => null) : null;
  if (page) console.error((await page.locator("body").innerText().catch(() => "Shell unavailable")).slice(0, 3000));
  throw error;
} finally {
  await app?.close().catch(() => {});
  fixture.closeAllConnections(); provider.closeAllConnections();
  await Promise.all([new Promise(resolve => fixture.close(resolve)), new Promise(resolve => provider.close(resolve))]);
  rmSync(temporary, { recursive: true, force: true });
}
