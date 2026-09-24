// User-visible unpacked extension management in an isolated regular profile.
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createServer } from "node:http";
import assert from "node:assert/strict";
import { sidebarAction } from "./sidebar-action.mjs";
import { poll } from "./poll.mjs";
import { closeAux, launchApp, shellWindow } from "./launch.mjs";

const root = resolve(import.meta.dirname, "../..");
const temporary = mkdtempSync(join(tmpdir(), "aux-extensions-"));
const source = join(temporary, "synthetic-extension");
mkdirSync(source);
writeFileSync(join(source, "manifest.json"), JSON.stringify({
  manifest_version: 3,
  name: "Aux synthetic page helper",
  version: "1.0.0",
  permissions: ["storage"],
  host_permissions: ["http://127.0.0.1/*"],
  content_scripts: [{ matches: ["http://127.0.0.1/*"], js: ["content.js"], run_at: "document_end" }],
}));
writeFileSync(join(source, "content.js"), "document.body.insertAdjacentHTML('beforeend','<p id=aux-extension-proof>Extension active</p>');");
const fixture = createServer((_req, res) => { res.setHeader("Content-Type", "text/html"); res.end("<!doctype html><title>Extension fixture</title><h1>Regular page</h1>"); });
await new Promise(resolve => fixture.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${fixture.address().port}`;
const env = { PATH: process.env.PATH, HOME: temporary, TMPDIR: temporary, AUX_PROFILE_DIR: join(temporary, "profile"), AUX_DATA_DIR: join(temporary, "data"), AUX_LOAD_DOTENV: "0" };
let app;
let privateApp;
const launch = () => launchApp({args:["--use-mock-keychain"],env});
async function shell(target = app) {
  const found = await shellWindow(target, 15_000);
  await found.locator(".app").waitFor();
  return found;
}
async function installDialogs(target) {
  await target.evaluate(({ dialog }, path) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [path] });
    dialog.showMessageBox = async () => ({ response: 1, checkboxChecked: false });
  }, source);
}
async function open(shellPage, suffix, shouldInject) {
  const url = `${base}/${suffix}`;
  const tab = await shellPage.evaluate(url => window.aux.invoke("pages.open", { url, activate: true }), url);
  await poll(shellPage, async id => (await window.aux.invoke("pages.list", {})).some(page => page.pageId === id && !page.loading), tab.pageId);
  const native = app.windows().find(page => page.url() === url);
  assert.ok(native, `missing page ${suffix}`);
  if (shouldInject) await native.locator("#aux-extension-proof").waitFor({ state: "attached" });
  else assert.equal(await native.locator("#aux-extension-proof").count(), 0, `${suffix} must not receive the disabled extension`);
}
async function openExtensions(shellPage) {
  await sidebarAction(shellPage, "Settings");
  const settings = shellPage.getByRole("region", { name: "Settings", exact: true });
  await settings.getByRole("button", { name: "Extensions", exact: true }).click();
  return settings;
}

try {
  app = await launch();
  let page = await shell();
  await installDialogs(app);
  let settings = await openExtensions(page);
  await settings.getByRole("button", { name: "Install unpacked extension…", exact: true }).click();
  let row = settings.getByRole("article", { name: "Aux synthetic page helper", exact: true });
  await row.getByText("Enabled").waitFor();
  await open(page, "installed", true);

  await app.close();
  app = await launch(); page = await shell();
  await open(page, "restart", true);
  settings = await openExtensions(page);
  row = settings.getByRole("article", { name: "Aux synthetic page helper", exact: true });
  await row.getByRole("button", { name: "Disable", exact: true }).click();
  await row.getByText("Disabled").waitFor();
  await open(page, "disabled", false);

  await app.close();
  app = await launch(); page = await shell();
  await open(page, "disabled-after-restart", false);
  settings = await openExtensions(page);
  row = settings.getByRole("article", { name: "Aux synthetic page helper", exact: true });
  await row.getByText("Disabled").waitFor();
  await row.getByRole("button", { name: "Enable", exact: true }).click();
  await row.getByText("Enabled").waitFor();
  await open(page, "enabled-again", true);
  await page.screenshot({ path: join(root, "release/test-artifacts/aux-extensions.png") });

  // Private browsing uses a separate nonpersistent session and never loads the managed copy.
  privateApp = await launchApp({args:["--aux-private"],env});
  const privateShell = await shell(privateApp);
  const [blank] = await privateShell.evaluate(() => window.aux.invoke("pages.list", {}));
  await privateShell.evaluate(({ pageId, url }) => window.aux.invoke("pages.navigate", { pageId, url }), { pageId: blank.pageId, url: `${base}/private` });
  await poll(privateShell, async url => (await window.aux.invoke("pages.list", {})).some(page => page.url === url && !page.loading), `${base}/private`);
  const privatePage = privateApp.windows().find(candidate => candidate.url() === `${base}/private`);
  assert.ok(privatePage);
  assert.equal(await privatePage.locator("#aux-extension-proof").count(), 0, "private pages must not load regular-profile extensions");
  await privateApp.close(); privateApp = undefined;

  await installDialogs(app);
  settings = await openExtensions(page);
  row = settings.getByRole("article", { name: "Aux synthetic page helper", exact: true });
  await row.getByRole("button", { name: "Remove", exact: true }).click();
  await settings.getByText("No extensions installed. Add one when you need it.", { exact: true }).waitFor();
  await open(page, "removed", false);
  await app.close();
  app = await launch(); page = await shell();
  await open(page, "removed-after-restart", false);
  settings = await openExtensions(page);
  await settings.getByText("No extensions installed. Add one when you need it.", { exact: true }).waitFor();

  console.log("Aux installs a chosen unpacked extension, persists enable/disable across restart, excludes private browsing, and removes the managed copy cleanly.");
} finally {
  if (privateApp) await closeAux(privateApp).catch(() => {});
  if (app) await closeAux(app).catch(() => {});
  fixture.closeAllConnections();
  await new Promise(resolve => fixture.close(resolve));
  rmSync(temporary, { recursive: true, force: true });
}
