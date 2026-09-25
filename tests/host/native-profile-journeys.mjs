// Profile isolation and session restore against the official Aux.app. All
// pages and cookies belong to disposable Profiles on a loopback fixture.
import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { appendFileSync, existsSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync } from "node:fs";
import { basename, isAbsolute, join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

if (process.argv.includes("--list")) {
  console.log("Two disposable Profiles: independent cookies and runtime authority; stable page ID and account after native session restore.");
  process.exit(0);
}
if (process.platform !== "darwin") throw new Error("Native Profile journeys require macOS.");
const timeoutIndex = process.argv.indexOf("--startup-timeout-ms");
const startupTimeoutMs = timeoutIndex < 0 ? 30_000 : Number(process.argv[timeoutIndex + 1]);
assert.ok(Number.isInteger(startupTimeoutMs) && startupTimeoutMs >= 1000 && startupTimeoutMs <= 120_000, "Startup timeout must be 1000–120000 ms");
const appIndex = process.argv.indexOf("--app");
const appArg = process.argv[appIndex + 1];
if (appIndex < 0 || !isAbsolute(appArg ?? "")) throw new Error("Pass --app /absolute/path/to/Aux.app.");
const app = realpathSync(appArg);
assert.equal(basename(app), "Aux.app");
const binary = join(app, "Contents/MacOS/Aux");
assert.ok(existsSync(binary) && existsSync(join(app, "Contents/Helpers/Aux Runtime")));
assert.equal(execFileSync("/usr/libexec/PlistBuddy", ["-c", "Print :CFBundleIdentifier", join(app, "Contents/Info.plist")], { encoding: "utf8" }).trim(), "dev.aux.browser");
const disposable = mkdtempSync("/tmp/aux-native-profiles-");
let fixture;
let origin;
const sessions = [];
let passed = false;
const logs = mkdtempSync("/tmp/aux-profile-logs-");

async function until(label, check, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const result = await check();
    if (result) return result;
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${label}`);
}
function session(name) {
  const profile = join(disposable, name);
  const runtimeFile = join(profile, "Default/Aux Runtime Data/runtime.json");
  const state = { name, profile, child: null, token: null, port: null };
  sessions.push(state);
  state.rpc = async (method, params = {}) => {
    const response = await fetch(`http://127.0.0.1:${state.port}/rpc`, {
      method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${state.token}` },
      body: JSON.stringify({ id: 1, method, params }), signal: AbortSignal.timeout(10_000),
    });
    const body = await response.json();
    if (body.error) throw Object.assign(new Error(`${method}: ${body.error.code}: ${body.error.message}`), { code: body.error.code });
    return body.result;
  };
  state.start = async (restore = false) => {
    let lastStatus;
    const startupLog = join(logs, name + (restore ? "-restore" : "") + ".log");
    const priorToken = state.token;
    state.child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
      "--use-mock-keychain", "--password-store=basic", ...(restore ? ["--restore-last-session"] : [])], {
      cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0" }, stdio: ["ignore", "ignore", "pipe"],
    });
    state.child.stderr.on("data", chunk => appendFileSync(startupLog, chunk, { mode: 0o600 }));
    await until(`${name} runtime`, async () => {
      if (state.child.exitCode !== null || state.child.signalCode !== null) throw new Error(`${name} Aux exited before runtime connection`);
      if (!existsSync(runtimeFile)) return false;
      assert.equal(statSync(runtimeFile).mode & 0o077, 0, "Runtime credentials must be owner-only");
      let value;
      try { value = JSON.parse(readFileSync(runtimeFile, "utf8")); } catch { return false; }
      if (!Number.isInteger(value.port) || !value.token || value.token === priorToken) return false;
      state.port = value.port;
      state.token = value.token;
      const workspace = await state.rpc("workspace.get").catch(() => null);
      lastStatus = workspace?.sessions?.map(({ sessionId, status, detail }) => ({ sessionId, status, detail }));
      return workspace?.sessions?.some(item => item.sessionId === "aux" && item.status === "connected");
    }, startupTimeoutMs).catch(error => { throw new Error(`${error.message}; sessions: ${JSON.stringify(lastStatus ?? [])}; browser log: ${startupLog}`); });
    assert.equal(existsSync(join(profile, "DevToolsActivePort")), false);
  };
  state.stop = async () => {
    const child = state.child;
    if (!child || child.exitCode !== null || child.signalCode !== null) return;
    child.kill("SIGTERM");
    await Promise.race([new Promise(resolveExit => child.once("exit", resolveExit)), delay(5000)]);
    if (child.exitCode === null && child.signalCode === null) {
      child.kill("SIGKILL");
      await Promise.race([new Promise(resolveExit => child.once("exit", resolveExit)), delay(5000)]);
    }
    assert.ok(child.exitCode !== null || child.signalCode !== null, `${name} Aux process did not exit`);
  };
  return state;
}

try {
  fixture = createServer((request, response) => {
    const match = /^\/login\/(alice|bob)$/.exec(request.url ?? "");
    if (match) {
      response.writeHead(302, { location: "/whoami", "set-cookie": `session=${match[1]}; HttpOnly; SameSite=Lax; Max-Age=3600; Path=/` }).end();
      return;
    }
    const account = /(?:^|;\s*)session=(alice|bob)(?:;|$)/.exec(request.headers.cookie ?? "")?.[1] ?? "none";
    response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    response.end(`<!doctype html><title>Aux Profile fixture</title><main><h1>Account ${account}</h1></main>`);
  });
  await new Promise(resolveListen => fixture.listen(0, "127.0.0.1", resolveListen));
  origin = `http://127.0.0.1:${fixture.address().port}`;
  const personal = session("personal");
  const work = session("work");
  await personal.start();
  await work.start();
  const alice = await personal.rpc("pages.open", { url: `${origin}/login/alice`, activate: true });
  const bob = await work.rpc("pages.open", { url: `${origin}/login/bob`, activate: true });
  assert.ok(alice.pageId && bob.pageId && alice.pageId !== bob.pageId);
  for (const [owner, tab, account] of [[personal, alice, "alice"], [work, bob, "bob"]]) {
    await until(`${account} Profile page`, async () => (await owner.rpc("pages.list")).some(page => page.pageId === tab.pageId && !page.loading && page.url === `${origin}/whoami`));
    assert.match(JSON.stringify(await owner.rpc("pages.observe", { pageId: tab.pageId })), new RegExp(`Account ${account}`));
  }
  await assert.rejects(personal.rpc("pages.observe", { pageId: bob.pageId }), { code: "target_detached" });
  await assert.rejects(work.rpc("pages.observe", { pageId: alice.pageId }), { code: "target_detached" });
  console.log("PASS two regular Profiles isolate HttpOnly account cookies and page authority");

  // SIGTERM exercises abrupt-process recovery, not the native Quit menu.
  // Wait for Chromium's scheduled session checkpoint rather than racing its
  // write-behind timer or adding an arbitrary sleep before terminating.
  const sessionDirectory = join(work.profile, "Default/Sessions");
  await until("Work navigation and identity persisted to the session journal", async () => {
    if (!existsSync(sessionDirectory)) return false;
    return readdirSync(sessionDirectory).filter(name => name.startsWith("Session_")).some(name => {
      const bytes = readFileSync(join(sessionDirectory, name));
      return bytes.includes(Buffer.from(bob.pageId)) && bytes.includes(Buffer.from(`${origin}/whoami`));
    });
  });
  await work.stop();
  await work.start(true);
  let restoredPages;
  await until("Work tab restored with stable native identity", async () => {
    restoredPages = (await work.rpc("pages.list")).map(({ pageId, url, loading }) => ({ pageId, url, loading }));
    return restoredPages.some(page => page.pageId === bob.pageId && !page.loading && page.url === `${origin}/whoami`);
  }).catch(error => { throw new Error(`${error.message}; expected ${bob.pageId}; fixture pages: ${JSON.stringify(restoredPages ?? [])}`); });
  assert.equal((await work.rpc("workspace.get")).activePageId, bob.pageId);
  assert.match(JSON.stringify(await work.rpc("pages.observe", { pageId: bob.pageId })), /Account bob/);
  assert.match(JSON.stringify(await personal.rpc("pages.observe", { pageId: alice.pageId })), /Account alice/);
  await assert.rejects(personal.rpc("pages.observe", { pageId: bob.pageId }), { code: "target_detached" });
  console.log("PASS persisted-session recovery restores Work tab identity, active selection and its cookie without crossing Profiles");
  passed = true;
} finally {
  for (const item of sessions.reverse()) await item.stop();
  fixture?.closeAllConnections();
  if (fixture) await new Promise(resolveClose => fixture.close(resolveClose));
  if (passed) rmSync(disposable, { recursive: true, force: true });
  else console.error("Disposable failure profile retained for diagnosis:", disposable);
}
