import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createServer } from "node:https";
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
let app;
try {
  app = await launchApp({ args: ["--use-mock-keychain", "--ignore-certificate-errors"], env: {
    PATH: process.env.PATH, HOME: dir, TMPDIR: dir, AUX_PROFILE_DIR: join(dir, "profile"),
    AUX_DATA_DIR: join(dir, "data"), AUX_LOAD_DOTENV: "0",
  } });
  const shell = await shellWindow(app);
  await shell.locator(".aux-home").waitFor();
  await shell.locator(".horizontal-profile").click();
  await shell.getByRole("menuitem", { name: "New space", exact: true }).click();
  const editor = shell.getByRole("dialog", { name: "New space", exact: true });
  await editor.getByPlaceholder("Name").fill("Recall fixture Space");
  await editor.getByRole("button", { name: "Create", exact: true }).click();
  await shell.getByRole("button", { name: "Switch space, current: Recall fixture Space" }).waitFor();
  const workspaceId = await shell.evaluate(async () => (await window.aux.invoke("workspaces.list", {})).find(item => item.name === "Recall fixture Space")?.workspaceId);
  assert.ok(workspaceId);
  const open = async path => {
    const url = `${origin}${path}`;
    const page = await shell.evaluate(value => window.aux.invoke("pages.open", { url: value, activate: true }), url);
    await poll(shell, async pageId => {
      const current = (await window.aux.invoke("pages.list", {})).find(item => item.pageId === pageId);
      return current?.url.startsWith("https://localhost:") && !current.loading;
    }, page.pageId);
    return await shell.evaluate(pageId => window.aux.invoke("pages.list", {}).then(pages => pages.find(item => item.pageId === pageId)), page.pageId);
  };
  const page = await open("/article");
  assert.equal(page.url, `${origin}/article`);
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
  const noStore = await open("/no-store");
  await assert.rejects(capture(noStore), /not eligible|no-store/i);
  const sensitive = await open("/sensitive");
  await assert.rejects(capture(sensitive), /private fields|sensitive/i);
  await shell.evaluate(({ workspaceId, memoryId }) => window.aux.invoke("workspaces.contentMemory.forget", { workspaceId, memoryId }), { workspaceId, memoryId: hits[0].memoryId });
  const after = await shell.evaluate(workspaceId => window.aux.invoke("workspaces.contentMemory.search", { workspaceId, query: "editorial" }), workspaceId);
  assert.equal(after.length, 0);
  console.log("Native HTTPS article capture, no-store and sensitive-page denial, local search, and forget passed.");
} finally {
  if (app) await closeAux(app);
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  rmSync(dir, { recursive: true, force: true });
}
