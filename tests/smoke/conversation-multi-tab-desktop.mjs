// Two explicitly selected browser tabs survive restart and reject changed page identity.
import { createServer } from "node:http";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { launchApp, shellWindow } from "./launch.mjs";
import { sidebarAction } from "./sidebar-action.mjs";

const temporary = mkdtempSync(join(tmpdir(), "aux-multi-tab-"));
const fixture = createServer((request, response) => {
  response.setHeader("content-type", "text/html");
  response.end(`<!doctype html><title>${request.url?.slice(1)}</title><h1>${request.url?.slice(1)}</h1>`);
});
await new Promise(resolve => fixture.listen(0, "127.0.0.1", resolve));
const url = path => `http://127.0.0.1:${fixture.address().port}/${path}`;
const provider = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/v1/chat/completions") { response.writeHead(404).end(); return; }
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  const content = body.response_format ? '{"ok":true}' : '{"status":"done","message":"Compared both selected tabs.","result":{"ok":true}}';
  response.setHeader("content-type", "application/json");
  response.end(JSON.stringify({ id: "chatcmpl_local", object: "chat.completion", created: 1, model: "aux-multi-tab-fixture",
    choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }],
    usage: { prompt_tokens: 4, completion_tokens: 5, total_tokens: 9 } }));
});
await new Promise(resolve => provider.listen(0, "127.0.0.1", resolve));
const endpoint = `http://127.0.0.1:${provider.address().port}/v1`;
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
  await settings.getByRole("textbox", { name: "Provider API key", exact: true }).fill("synthetic-multi-tab");
  await settings.getByRole("button", { name: "Save key", exact: true }).click();
  await settings.getByRole("combobox", { name: "Planner model", exact: true }).fill("aux-multi-tab-fixture");
  await settings.getByRole("button", { name: "Save model", exact: true }).click();
  await settings.getByRole("button", { name: "Test connection", exact: true }).click();
  await settings.getByRole("status").filter({ hasText: "Connection tested" }).waitFor();
  await settings.getByRole("button", { name: "Close settings", exact: true }).click();
  const first = await page.evaluate(value => window.aux.invoke("pages.open", { url: value, activate: true }), url("first"));
  const second = await page.evaluate(value => window.aux.invoke("pages.open", { url: value, activate: true }), url("second"));
  await page.waitForFunction(async ids => (await window.aux.invoke("pages.list", {})).filter(item => ids.includes(item.pageId) && !item.loading).length === 2, [first.pageId, second.pageId]);
  await page.getByRole("tab", { name: /first/i }).click();
  await page.getByRole("tab", { name: /second/i }).click({ button: "right" });
  await page.getByRole("menuitem", { name: "Open beside current tab" }).click();
  await sidebarAction(page, "Chats");
  await page.getByRole("button", { name: "New chat", exact: true }).click();
  await page.getByRole("combobox", { name: "Browser context" }).selectOption(first.pageId);
  await page.getByRole("button", { name: "Add split tab", exact: true }).click();
  assert.equal(await page.locator('.conversation-browser-sources[aria-label="Selected browser tabs"]').getByText("second", { exact: true }).count(), 1);
  await app.close(); app = undefined;

  app = await launch(); page = await shell();
  await sidebarAction(page, "Chats");
  await page.getByRole("button", { name: "New chat", exact: true }).click();
  assert.equal(await page.getByRole("combobox", { name: "Browser context" }).inputValue(), first.pageId);
  await page.locator('.conversation-browser-sources[aria-label="Selected browser tabs"]').getByText("second", { exact: true }).waitFor();
  const before = await page.evaluate(async ids => (await window.aux.invoke("pages.list", {})).filter(item => ids.includes(item.pageId)), [first.pageId, second.pageId]);
  const refs = before.map(item => ({ pageId: item.pageId, url: item.url, documentEpoch: item.documentEpoch, sessionId: item.sessionId }));
  assert.equal(refs.some(item => item.pageId === second.pageId), true);
  await page.evaluate(({ pageId, url }) => window.aux.invoke("pages.navigate", { pageId, url }), { pageId: second.pageId, url: url("changed") });
  await page.locator('.conversation-browser-sources[aria-label="Selected browser tabs"]').getByText("Changed", { exact: true }).waitFor();
  await assert.rejects(page.evaluate(({ pageIds, contextPageRefs }) => window.aux.invoke("runs.start", { goal: "Compare two pages", pageIds, contextPageRefs }), { pageIds: [first.pageId, second.pageId], contextPageRefs: refs }), /changed/i);
  await page.getByRole("button", { name: /Use current changed/ }).click();
  await page.locator('.conversation-browser-sources[aria-label="Selected browser tabs"]').getByText("Changed", { exact: true }).waitFor({ state: "detached" });
  await page.getByLabel("Reply to conversation", { exact: true }).fill("Compare these two pages");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  const runHandle = await page.waitForFunction(async () =>
    (await window.aux.invoke("runs.list", { limit: 10, includeArchived: true })).find(item => item.goal === "Compare these two pages"));
  const run = await runHandle.jsonValue();
  assert.ok(run, "composer should create a run");
  assert.deepEqual(run.pageIds, [first.pageId, second.pageId]);
  assert.deepEqual(run.config.contextPageRefs.map(item => item.pageId), [first.pageId, second.pageId]);
  assert.equal(run.config.contextPageRefs[1].url, url("changed"));
  console.log("Multi-tab selection survives restart, blocks stale identity, and reaches the runtime through the conversation composer.");
} catch (error) {
  const page = app ? await shellWindow(app).catch(() => null) : null;
  if (page) { await page.getByText("Details", { exact: true }).click().catch(() => {}); console.error((await page.locator("body").innerText().catch(() => "Shell unavailable")).slice(0, 3000)); }
  throw error;
} finally {
  await app?.close().catch(() => {});
  fixture.closeAllConnections();
  provider.closeAllConnections();
  await Promise.all([new Promise(resolve => fixture.close(resolve)), new Promise(resolve => provider.close(resolve))]);
  rmSync(temporary, { recursive: true, force: true });
}
