// Capture the actual Aux window compositor, including Chromium's embedded page.
// Run against an isolated //chrome candidate with Screen Recording permission.
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const matrix = ["horizontal", "vertical"].flatMap(layout =>
  ["dark", "light"].flatMap(theme => ["home", "page"].map(surface => ({ layout, theme, surface }))));
if (process.argv.includes("--list")) {
  console.log(JSON.stringify(matrix, null, 2));
  process.exit(0);
}
if (!process.argv.includes("--capture")) throw new Error("Use --list or --capture.");
if (process.platform !== "darwin") throw new Error("Native window capture requires macOS.");

const profile = process.env.AUX_CANDIDATE_PROFILE;
const windowId = process.env.AUX_NATIVE_WINDOW_ID;
if (!profile || !windowId || !/^\d+$/.test(windowId)) {
  throw new Error("Set AUX_CANDIDATE_PROFILE and the decimal AUX_NATIVE_WINDOW_ID of its Aux window.");
}
const trustedProfile = realpathSync(profile);
const artifactRoot = resolve(root, "release/test-artifacts");
mkdirSync(artifactRoot, { recursive: true });
if (![artifactRoot, tmpdir()].some(base => trustedProfile.startsWith(realpathSync(base) + sep))) {
  throw new Error("Use a disposable candidate profile under release/test-artifacts or the system temp directory.");
}
const portFile = join(trustedProfile, "DevToolsActivePort");
if (!existsSync(portFile)) throw new Error(`Candidate DevTools port is unavailable: ${portFile}`);
const port = Number(readFileSync(portFile, "utf8").split("\n")[0]);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Candidate DevTools port is invalid.");

const out = resolve(process.env.AUX_NATIVE_CAPTURE_DIR ?? join(artifactRoot, "native-b7"));
mkdirSync(out, { recursive: true });
const { chromium } = createRequire(join(root, "packages/chromium-driver/package.json"))("playwright-core");
const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
const server = createServer((_request, response) => {
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
  response.end('<!doctype html><title>Aux B7 capture fixture</title><style>body{margin:0;background:linear-gradient(135deg,#365170,#c0b6a8);color:white;font:24px system-ui}main{padding:80px}</style><main>Aux B7 native page fixture</main>');
});
await new Promise(resolveListen => server.listen(0, "127.0.0.1", resolveListen));
const fixtureUrl = `http://127.0.0.1:${server.address().port}/`;
const shellPrefix = process.env.AUX_CANDIDATE_SHELL_URL ?? "chrome://aux/";
let homeId;
let pageId;
let shell;
let originalSettings;
let originalActive;
const report = { scope: "Isolated Aux candidate native window", qualified: false, windowId, profile: trustedProfile, captures: [] };
try {
  for (let attempt = 0; attempt < 40; attempt++) {
    shell = browser.contexts().flatMap(context => context.pages()).find(page => page.url().startsWith(shellPrefix));
    if (shell) break;
    await new Promise(resolveWait => setTimeout(resolveWait, 250));
  }
  if (!shell) throw new Error(`Aux shell was not found at ${shellPrefix}`);
  const host = await shell.evaluate(() => window.auxHostProof?.host);
  if (host !== "chromium-fork") throw new Error("The connected shell is not the Chromium fork.");
  originalSettings = await shell.evaluate(() => window.aux.invoke("settings.get", {}));
  originalActive = await shell.evaluate(() => window.aux.tabsSnapshot().windows.find(item => item.windowId === window.aux.windowId)?.activePageId);
  const opened = await shell.evaluate(async url => ({
    home: await window.aux.tabCommand({ kind: "open", url: "about:blank", activate: true }),
    page: await window.aux.tabCommand({ kind: "open", url, activate: true }),
  }), fixtureUrl);
  homeId = opened.home.pageId;
  pageId = opened.page.pageId;
  if (!homeId || !pageId) throw new Error("The fixture tabs did not open in the Aux window.");

  for (const entry of matrix) {
    await shell.evaluate(({ layout, theme }) => window.aux.invoke("settings.set", { tabLayout: layout, theme }), entry);
    await shell.waitForFunction(({ layout, theme }) => {
      const app = document.querySelector(".app");
      return app?.classList.contains(`tabs-${layout}`) && document.documentElement.dataset.theme === theme;
    }, entry);
    const target = entry.surface === "home" ? homeId : pageId;
    const selected = await shell.evaluate(id => window.aux.tabCommand({ kind: "activate", pageId: id }), target);
    if (selected.status !== "applied") throw new Error(`Could not activate ${entry.surface}: ${selected.status}`);
    await shell.waitForFunction(surface => surface === "home"
      ? !!document.querySelector(".aux-home")
      : !!document.querySelector(".main-col.has-page"), entry.surface);
    await shell.evaluate(async () => {
      await document.fonts.ready;
      await new Promise(resolveFrame => requestAnimationFrame(() => requestAnimationFrame(resolveFrame)));
    });
    const filename = `${entry.layout}-${entry.theme}-${entry.surface}.png`;
    const path = join(out, filename);
    execFileSync("/usr/sbin/screencapture", ["-x", "-l", windowId, path], { timeout: 15000 });
    if (statSync(path).size < 1024) throw new Error(`Native window capture is empty: ${filename}`);
    const metrics = await shell.evaluate(() => {
      const rect = selector => document.querySelector(selector)?.getBoundingClientRect().toJSON() ?? null;
      return {
        sidebar: rect(".sidebar, .chat-sidebar"), toolbar: rect(".toolbar"), stage: rect(".stage-card"),
        reducedTransparency: matchMedia("(prefers-reduced-transparency: reduce)").matches,
        reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
      };
    });
    const expectedTransparency = process.env.AUX_CAPTURE_REDUCED_TRANSPARENCY;
    const expectedMotion = process.env.AUX_CAPTURE_REDUCED_MOTION;
    if (expectedTransparency && metrics.reducedTransparency !== (expectedTransparency === "1")) throw new Error("Reduce Transparency does not match the requested OS state.");
    if (expectedMotion && metrics.reducedMotion !== (expectedMotion === "1")) throw new Error("Reduce Motion does not match the requested OS state.");
    report.captures.push({ ...entry, filename, bytes: statSync(path).size, metrics });
  }
} finally {
  if (shell) {
    if (originalActive) await shell.evaluate(id => window.aux.tabCommand({ kind: "activate", pageId: id }), originalActive).catch(() => {});
    for (const id of [pageId, homeId]) if (id) await shell.evaluate(pageId => window.aux.tabCommand({ kind: "close", pageId }), id).catch(() => {});
    if (originalSettings) await shell.evaluate(settings => window.aux.invoke("settings.set", { tabLayout: settings.tabLayout, theme: settings.theme }), originalSettings).catch(() => {});
  }
  writeFileSync(join(out, "manifest.json"), `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();
  server.closeAllConnections();
  await new Promise(resolveClose => server.close(resolveClose));
}
console.log(`Captured ${report.captures.length} native window states in ${out}. Review every image before marking it qualified.`);
