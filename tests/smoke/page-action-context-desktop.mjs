// A page selection carries its original document identity into chat and cannot silently follow navigation.
import { createServer } from "node:http";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { launchApp, shellWindow } from "./launch.mjs";

const temporary = mkdtempSync(join(tmpdir(), "aux-page-action-"));
const fixture = createServer((request, response) => {
  response.setHeader("content-type", "text/html");
  response.end(`<!doctype html><title>${request.url === "/later" ? "Later" : "Original"}</title><h1>Page</h1>`);
});
await new Promise(resolve => fixture.listen(0, "127.0.0.1", resolve));
const url = path => `http://127.0.0.1:${fixture.address().port}${path}`;
const env = { PATH: process.env.PATH, HOME: temporary, TMPDIR: temporary,
  AUX_PROFILE_DIR: join(temporary, "profile"), AUX_DATA_DIR: join(temporary, "data"), AUX_LOAD_DOTENV: "0" };
let app;

try {
  app = await launchApp({ args: ["--use-mock-keychain"], env });
  const shell = await shellWindow(app, 15_000);
  shell.setDefaultTimeout(15_000);
  await shell.locator(".app").waitFor();
  const opened = await shell.evaluate(value => window.aux.invoke("pages.open", { url: value, activate: true }), url("/original"));
  await shell.waitForFunction(async pageId => (await window.aux.invoke("pages.list", {})).some(item => item.pageId === pageId && !item.loading), opened.pageId);
  const original = await shell.evaluate(async pageId => (await window.aux.invoke("pages.list", {})).find(item => item.pageId === pageId), opened.pageId);
  const capturedAt = Date.now() - 1000;
  await app.evaluate(({ webContents }, action) => {
    const view = webContents.getAllWebContents().find(item => item.getURL().includes("renderer/index.html"));
    if (!view) throw new Error("Aux shell unavailable");
    view.send("page.quickAction", action);
  }, { pageId: opened.pageId, url: original.url, topUrl: original.url, title: "Original",
    capturedAt, action: "ask", selection: "An exact selected sentence.", truncated: false });

  await shell.getByRole("textbox", { name: "Reply to conversation" }).waitFor();
  assert.match(await shell.getByRole("textbox", { name: "Reply to conversation" }).inputValue(), /An exact selected sentence/);
  await shell.getByText("Captured source · Original").waitFor();
  const selected = await shell.evaluate(() => {
    const key = Object.keys(localStorage).find(item => item.startsWith("aux.conversation-browser-sources.v1:chat:"));
    return key ? JSON.parse(localStorage.getItem(key)).sources[0] : null;
  });
  assert.deepEqual(selected, { pageId: opened.pageId, url: original.url,
    documentEpoch: original.documentEpoch, ...(original.sessionId ? { sessionId: original.sessionId } : {}), selectedAt: capturedAt });

  await shell.evaluate(({ pageId, url }) => window.aux.invoke("pages.navigate", { pageId, url }), { pageId: opened.pageId, url: url("/later") });
  await shell.getByText("Changed", { exact: true }).waitFor();
  assert.equal(await shell.getByRole("button", { name: "Send message" }).isDisabled(), true);
  await shell.getByRole("button", { name: /Use current Later/ }).click();
  await shell.getByText("Changed", { exact: true }).waitFor({ state: "detached" });
  assert.equal(await shell.getByRole("button", { name: "Send message" }).isDisabled(), false);
  console.log("Page selection keeps its source identity and blocks stale live context until refreshed.");
} finally {
  await app?.close().catch(() => {});
  fixture.closeAllConnections();
  await new Promise(resolve => fixture.close(resolve));
  rmSync(temporary, { recursive: true, force: true });
}
