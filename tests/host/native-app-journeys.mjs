// Browser and liquid-glass journeys against an official Aux.app, without a
// public DevTools port. The runtime bearer is read only from this run's fresh
// Profile and is never included in artifacts.
import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, isAbsolute, join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const root = resolve(import.meta.dirname, "../..");
const journeys = [
  "Authenticated native runtime and no public debugging port",
  "Two real local pages, observation, action and human takeover",
  "Vertical expanded, collapsed and floating liquid-glass sidebar",
  "Horizontal tabs and effective Profile layout preference",
];
const option = name => {
  const index = process.argv.indexOf(name);
  return index < 0 ? undefined : process.argv[index + 1];
};
if (process.argv.includes("--list")) {
  console.log(JSON.stringify({ journeys, command: "node tests/host/native-app-journeys.mjs --app /absolute/path/to/Aux.app [--output /absolute/new/directory] [--rpc-only]" }, null, 2));
  process.exit(0);
}
if (process.platform !== "darwin") throw new Error("Native Aux.app journeys require macOS.");
const appArg = option("--app");
if (!appArg || !isAbsolute(appArg)) throw new Error("Pass --app /absolute/path/to/Aux.app.");
const requireDependency = createRequire(join(root, "package.json"));
const app = realpathSync(appArg);
assert.equal(basename(app), "Aux.app", "Use the official Aux.app bundle");
const binary = join(app, "Contents/MacOS/Aux");
const helper = join(app, "Contents/Helpers/Aux Runtime");
assert.ok(existsSync(binary) && existsSync(helper), "Aux browser and runtime helper must both be packaged");
const bundleId = execFileSync("/usr/libexec/PlistBuddy", ["-c", "Print :CFBundleIdentifier", join(app, "Contents/Info.plist")], { encoding: "utf8" }).trim();
assert.equal(bundleId, "dev.aux.browser", "The native journey must target the official Aux identity");
const rpcOnly = process.argv.includes("--rpc-only");
const output = resolve(option("--output") ?? join(root, "release/test-artifacts", `native-journeys-${new Date().toISOString().replaceAll(/[:.]/g, "-")}`));
assert.ok(!existsSync(output), "Use a new output directory; existing evidence is never overwritten");
mkdirSync(output, { recursive: true });

// A short /tmp path keeps Chromium's private AF_UNIX socket under sun_path.
const disposable = mkdtempSync("/tmp/aux-native-journey-");
const profile = join(disposable, "profile");
const runtimeFile = join(profile, "Default/Aux Runtime Data/runtime.json");
const script = join(root, "tests/host/native-window.swift");
const windowTool = join(disposable, "native-window");
const report = { schema: 1, scope: "Official Aux.app, disposable Profile, loopback fixture; no public debugging port", app,
  sourceSha: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
  startedAt: new Date().toISOString(), rpcOnly, steps: [], captures: [], passed: false };
let child;
let fixture;
let origin;
let clicks = 0;
let rpcToken;
let rpcPort;

function record(name, detail) {
  report.steps.push({ name, passed: true, detail });
  console.log(`PASS ${name}`);
}
async function until(label, check, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child && child.exitCode !== null) throw new Error(`Aux exited while waiting for ${label}: ${child.exitCode}`);
    const result = await check();
    if (result) return result;
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${label}`);
}
async function rpc(method, params = {}) {
  const response = await fetch(`http://127.0.0.1:${rpcPort}/rpc`, {
    method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${rpcToken}` },
    body: JSON.stringify({ id: 1, method, params }), signal: AbortSignal.timeout(10_000),
  });
  const body = await response.json();
  if (body.error) throw new Error(`${method}: ${body.error.code}: ${body.error.message}`);
  return body.result;
}
function native(action, ...args) {
  return execFileSync(windowTool, [action, String(child.pid), ...args.map(String)], { encoding: "utf8", timeout: 15_000 }).trim();
}
function capture(windowId, name) {
  const path = join(output, `${name}.png`);
  execFileSync("/usr/sbin/screencapture", ["-x", "-l", String(windowId), path], { timeout: 15_000 });
  assert.ok(statSync(path).size > 1024, `${name} native window capture is empty`);
  report.captures.push({ name, file: basename(path), bytes: statSync(path).size });
  return path;
}
function changedFraction(aPath, bPath, fraction = 0.45) {
  const { PNG } = requireDependency("pngjs");
  const a = PNG.sync.read(readFileSync(aPath));
  const b = PNG.sync.read(readFileSync(bPath));
  assert.equal(a.width, b.width, "Native captures must have the same window width");
  assert.equal(a.height, b.height, "Native captures must have the same window height");
  let changed = 0;
  let total = 0;
  for (let y = Math.floor(a.height * 0.15); y < a.height * 0.85; y += 4) {
    for (let x = 0; x < a.width * fraction; x += 4) {
      const offset = (y * a.width + x) * 4;
      if (Math.abs(a.data[offset] - b.data[offset]) +
          Math.abs(a.data[offset + 1] - b.data[offset + 1]) +
          Math.abs(a.data[offset + 2] - b.data[offset + 2]) > 72) changed++;
      total++;
    }
  }
  return changed / total;
}

try {
  fixture = createServer((request, response) => {
    if (request.url === "/click") { clicks++; response.writeHead(204).end(); return; }
    const color = request.url?.startsWith("/blue") ? "#164b72" : "#7c344b";
    const name = color === "#164b72" ? "Blue" : "Red";
    response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    response.end(`<!doctype html><title>Aux native ${name}</title><style>html,body{margin:0;height:100%;background:${color};color:white;font:24px system-ui}main{padding:64px}</style><main><h1>Aux native ${name} fixture</h1><button id="act" onclick="fetch('/click');this.textContent='Clicked'">Act</button></main>`);
  });
  await new Promise(resolveListen => fixture.listen(0, "127.0.0.1", resolveListen));
  origin = `http://127.0.0.1:${fixture.address().port}`;
  if (!rpcOnly) execFileSync("xcrun", ["swiftc", script, "-o", windowTool], { timeout: 120_000 });
  child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
    "--use-mock-keychain", "--password-store=basic"], {
    cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0" }, stdio: ["ignore", "ignore", "pipe"],
  });
  let startupError = "";
  child.stderr.on("data", chunk => { startupError = (startupError + String(chunk)).slice(-4000); });
  const connection = await until("the Profile runtime", async () => {
    if (!existsSync(runtimeFile)) return null;
    assert.equal(statSync(runtimeFile).mode & 0o077, 0, "Runtime bearer must be owner-only");
    let value;
    try { value = JSON.parse(readFileSync(runtimeFile, "utf8")); } catch { return null; }
    if (!Number.isInteger(value.port) || !value.token) return null;
    rpcPort = value.port;
    rpcToken = value.token;
    const workspace = await rpc("workspace.get").catch(() => null);
    return workspace?.sessions?.some(session => session.sessionId === "aux" && session.status === "connected") ? workspace : null;
  }, 30_000).catch(error => { throw new Error(`${error.message}\n${startupError}`); });
  assert.ok(connection);
  assert.equal(existsSync(join(profile, "DevToolsActivePort")), false, "A raw debugging port must remain disabled");
  record("Profile runtime is authenticated and raw debugging is disabled", { sessions: connection.sessions?.length });

  const red = await rpc("pages.open", { url: `${origin}/red`, activate: true });
  const blue = await rpc("pages.open", { url: `${origin}/blue`, activate: true });
  assert.ok(red.pageId && blue.pageId && red.pageId !== blue.pageId);
  await until("both native pages", async () => {
    const pages = await rpc("pages.list");
    return pages.some(page => page.pageId === red.pageId && page.url === `${origin}/red` && !page.loading) &&
      pages.some(page => page.pageId === blue.pageId && page.url === `${origin}/blue` && !page.loading);
  });
  assert.match(JSON.stringify(await rpc("pages.observe", { pageId: blue.pageId })), /Aux native Blue fixture/);
  record("two native pages retain distinct IDs and readable content", { red: red.pageId, blue: blue.pageId });

  await rpc("settings.set", { effectGrants: ["effect:read", "effect:write"] });
  const action = await rpc("pages.execute", { program: { pageId: blue.pageId,
    steps: [{ id: "native-click", op: "click", target: "css:#act" }] } });
  assert.equal(action.status, "completed", JSON.stringify(action));
  await until("fixture click", () => clicks === 1);
  assert.equal((await rpc("pages.takeover", { pageId: blue.pageId })).controller, "human");
  await assert.rejects(rpc("pages.execute", { program: { pageId: blue.pageId,
    steps: [{ id: "blocked-click", op: "click", target: "css:#act" }] } }), /person controls|human control/i);
  assert.equal(clicks, 1, "Takeover must block another page action");
  assert.equal((await rpc("pages.resume", { pageId: blue.pageId })).controller, "none");
  record("native input, takeover, revocation and resume", { clicks });

  if (!rpcOnly) {
    const window = await until("a visible Aux browser window", () => {
      try { return JSON.parse(native("window")); } catch { return null; }
    });
    native("activate");
    const awayX = window.x + window.width * 0.8;
    const centerY = window.y + window.height * 0.55;
    native("move", awayX, centerY);
    await rpc("settings.set", { tabLayout: "vertical", sidebarAppearance: "translucent", sidebarMaterial: "liquid-glass" });
    assert.equal((await rpc("settings.get")).tabLayout, "vertical");
    // A fresh Profile starts with the sidebar hidden. The first chord pins it.
    native("toggle-sidebar");
    await delay(700);
    const expanded = capture(window.id, "vertical-expanded");
    native("toggle-sidebar");
    await delay(450);
    const collapsed = capture(window.id, "vertical-collapsed");
    const collapseChange = changedFraction(expanded, collapsed);
    assert.ok(collapseChange > 0.02, `Sidebar toggle did not visibly change the native window (${collapseChange.toFixed(3)})`);
    native("move", window.x + 2, centerY);
    await delay(450);
    const peek = capture(window.id, "vertical-floating-peek");
    const peekChange = changedFraction(collapsed, peek);
    assert.ok(peekChange > 0.02, `Edge hover did not reveal the glass sidebar (${peekChange.toFixed(3)})`);
    native("move", awayX, centerY);
    await delay(350);
    await rpc("settings.set", { tabLayout: "horizontal" });
    assert.equal((await rpc("settings.get")).tabLayout, "horizontal");
    await delay(500);
    const horizontal = capture(window.id, "horizontal-tabs");
    const layoutChange = changedFraction(expanded, horizontal, 0.7);
    assert.ok(layoutChange > 0.02, `Layout change was not visible (${layoutChange.toFixed(3)})`);
    record("native Aside glass reveal and both layouts", { windowId: window.id, collapseChange, peekChange, layoutChange });
  }

  await rpc("pages.close", { pageId: blue.pageId });
  await until("closed native page to disappear", async () => !(await rpc("pages.list")).some(page => page.pageId === blue.pageId));
  assert.ok((await rpc("pages.list")).some(page => page.pageId === red.pageId));
  record("closing a tab reconciles runtime and native catalog", { remaining: red.pageId });
  report.passed = true;
} catch (error) {
  report.steps.push({ name: "terminal failure", passed: false, detail: String(error) });
  process.exitCode = 1;
} finally {
  report.completedAt = new Date().toISOString();
  writeFileSync(join(output, "manifest.json"), `${JSON.stringify(report, null, 2)}\n`);
  if (child && child.exitCode === null) {
    child.kill("SIGTERM");
    await Promise.race([new Promise(resolveExit => child.once("exit", resolveExit)), delay(5000)]);
    if (child.exitCode === null) child.kill("SIGKILL");
  }
  fixture?.closeAllConnections();
  if (fixture) await new Promise(resolveClose => fixture.close(resolveClose));
  rpcToken = undefined;
  rmSync(disposable, { recursive: true, force: true });
  console.log(`Native journey ${report.passed ? "passed" : "failed"}; evidence: ${output}`);
}
