// Built Aux command-bar latency with a disposable, exact-size Chromium History
// fixture. This development instrument uses only the test GN debugging gate.
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { setTimeout as delay } from "node:timers/promises";
import { summarizeSamples } from "./statistics.mjs";

const root = resolve(import.meta.dirname, "../..");
const value = flag => { const i = process.argv.indexOf(flag); return i < 0 ? undefined : process.argv[i + 1]; };
if (process.argv.includes("--plan")) {
  console.log("node tests/benchmarks/native-command-bar.mjs --app /absolute/AuxDev/Aux.app [--mode new-tab|edit|command] [--trials 20] [--output /absolute/new/directory]");
  process.exit(0);
}
const mode = value("--mode") ?? "edit";
assert.ok(["new-tab", "edit", "command"].includes(mode), "Use a supported command surface mode");
const fieldSelector = ' .command-surface input[role=combobox][aria-label="Address, search, and agent prompt"]'.trim();
const app = value("--app");
assert.ok(app?.startsWith("/") && app.endsWith("/Aux.app"), "Pass an absolute Aux.app path");
const binary = join(app, "Contents/MacOS/Aux");
const gn = readFileSync(join(app, "../args.gn"), "utf8");
assert.match(gn, /^aux_allow_remote_debugging_for_tests\s*=\s*true\s*$/m, "Use a test-enabled Aux build");
assert.match(gn, /^enable_aux_shell\s*=\s*true\s*$/m);
const trials = Number(value("--trials") ?? 20);
assert.ok(Number.isSafeInteger(trials) && trials >= 20 && trials <= 100, "Use 20–100 measured trials");
const output = resolve(value("--output") ?? join(root, "release/test-artifacts", `native-command-bar-${new Date().toISOString().replaceAll(/[:.]/g, "-")}`));
assert.ok(!existsSync(output), "Use a new output directory");
mkdirSync(output, { recursive: true });
const disposable = mkdtempSync("/tmp/aux-command-bar-bench-");
const profile = join(disposable, "profile");
mkdirSync(profile);
writeFileSync(join(profile, "Local State"), JSON.stringify({ devtools: { remote_debugging: { allowed: true } } }), { mode: 0o600 });
const server = createServer((_req, res) => { res.writeHead(200, { "content-type": "text/html" }); res.end("<!doctype html><title>Aux history seed</title>Aux history seed"); });
const origin = await new Promise(resolveListen => server.listen(0, "127.0.0.1", () => resolveListen(`http://127.0.0.1:${server.address().port}`)));
const report = { schema: 1, status: "running", app, mode, historyEntries: 50_000, trials,
  sourceSha: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
  build: "AuxDev component, test remote debugging enabled",
  power: execFileSync("pmset", ["-g", "batt"], { encoding: "utf8" }).trim(),
  method: "input event timestamp to second requestAnimationFrame after the matching native history row enters the shell DOM; conservative presented-frame proxy",
  limitations: ["Development component build; trend only", "CDP text insertion, not a physical key event", "Second animation frame is a paint proxy, not GPU presentation telemetry"],
  samplesMs: [], startedAt: new Date().toISOString() };
assert.match(report.power, /AC Power/, "Command surface performance requires AC power");
async function until(label, fn, timeout = 30_000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) { const result = await fn(); if (result) return result; await delay(50); }
  throw new Error(`Timed out waiting for ${label}`);
}
async function launch() {
  rmSync(join(profile, "DevToolsActivePort"), { force: true });
  const child = spawn(binary, [`--user-data-dir=${profile}`, "--remote-debugging-port=0", "--no-first-run", "--no-default-browser-check", "--use-mock-keychain", "--password-store=basic"],
    { env: { ...process.env, AUX_LOAD_DOTENV: "0" }, stdio: ["ignore", "ignore", "pipe"] });
  let stderr = "";
  child.stderr.on("data", chunk => { stderr = (stderr + chunk).slice(-3000); });
  try {
    const port = await until("DevToolsActivePort", () => {
      if (child.exitCode !== null) throw new Error(`Aux exited: ${stderr}`);
      const file = join(profile, "DevToolsActivePort");
      return existsSync(file) ? Number(readFileSync(file, "utf8").split("\n")[0]) : 0;
    });
    const endpoint = await until("CDP browser endpoint", async () => {
      try { return await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); }
      catch { return null; }
    });
    const socket = new WebSocket(endpoint.webSocketDebuggerUrl);
    await new Promise((resolveOpen, rejectOpen) => { socket.addEventListener("open", resolveOpen, { once: true }); socket.addEventListener("error", rejectOpen, { once: true }); });
    let nextId = 1;
    const pending = new Map();
    socket.addEventListener("message", event => {
      const message = JSON.parse(event.data);
      if (!message.id) return;
      const request = pending.get(message.id);
      if (!request) return;
      pending.delete(message.id);
      if (message.error) request.reject(new Error(`${request.method}: ${message.error.message}`));
      else request.resolve(message.result);
    });
    const send = (method, params = {}, sessionId) => new Promise((resolveSend, rejectSend) => {
      const id = nextId++;
      pending.set(id, { method, resolve: resolveSend, reject: rejectSend });
      socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
    const target = await until("Aux browser_ui target", async () =>
      (await send("Target.getTargets")).targetInfos.find(info => info.type === "browser_ui" && info.url.startsWith("chrome://aux/")));
    const { sessionId } = await send("Target.attachToTarget", { targetId: target.targetId, flatten: true });
    await send("Runtime.enable", {}, sessionId);
    const evaluate = async (expression, awaitPromise = false) => {
      const result = await send("Runtime.evaluate", { expression, awaitPromise, returnByValue: true }, sessionId);
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
      return result.result.value;
    };
    return { child, socket, send: (method, params = {}) => send(method, params, sessionId), evaluate, stderr: () => stderr };
  } catch (error) { child.kill("SIGKILL"); throw error; }
}
async function close(run) {
  run.socket.close();
  if (run.child.exitCode === null) {
    run.child.kill("SIGTERM");
    await Promise.race([new Promise(resolveExit => run.child.once("exit", resolveExit)), delay(5000)]);
    if (run.child.exitCode === null) run.child.kill("SIGKILL");
  }
}
let run;
try {
  run = await launch();
  await until("Aux shell bridge", () => run.evaluate("typeof window.aux?.tabCommand === 'function'"));
  const seed = await run.evaluate(`window.aux.tabCommand({kind:'open',url:${JSON.stringify(`${origin}/seed`)},activate:true})`, true);
  assert.equal(seed.status, "applied");
  await delay(1000);
  await close(run);
  run = null;

  const historyPath = join(profile, "Default", "History");
  assert.ok(existsSync(historyPath), "Native History DB was not created");
  const db = new DatabaseSync(historyPath);
  try {
    const before = Number(db.prepare("SELECT COUNT(*) AS n FROM urls").get().n);
    const insertUrl = db.prepare("INSERT INTO urls(url,title,visit_count,typed_count,last_visit_time,hidden) VALUES(?,?,1,1,?,0)");
    const insertVisit = db.prepare("INSERT INTO visits(url,visit_time,from_visit,transition,visit_duration,opener_visit) VALUES(?,?,0,1,0,0)");
    const now = BigInt(Date.now() + 11644473600000) * 1000n;
    db.exec("BEGIN");
    for (let i = 0; i < 50_000 - before; i++) {
      const token = `auxperf${String(i).padStart(5, "0")}`;
      const time = now - BigInt(i) * 1000n;
      const row = insertUrl.run(`${origin}/${token}`, `Aux ${token} history`, time);
      insertVisit.run(row.lastInsertRowid, time);
    }
    db.exec("COMMIT");
    assert.equal(Number(db.prepare("SELECT COUNT(*) AS n FROM urls").get().n), 50_000);
    assert.equal(db.prepare("PRAGMA integrity_check").get().integrity_check, "ok");
  } finally { db.close(); }

  run = await launch();
  await until("Aux shell after seeded restart", () => run.evaluate("!!document.querySelector('input[role=combobox][aria-label=\"Address, search, and agent prompt\"]')"));
  const reopened = await run.evaluate(`window.aux.tabCommand({kind:'open',url:${JSON.stringify(`${origin}/seed`)},activate:true})`, true);
  assert.equal(reopened.status, "applied");
  await until("restored native seed tab", () => run.evaluate(`window.aux.tabsSnapshot().then(snapshot => snapshot.tabs.some(tab => tab.url === ${JSON.stringify(`${origin}/seed`)} && !tab.loading))`, true));
  await until("seeded Chromium autocomplete index", () => run.evaluate(`window.aux.autocomplete('auxperf00000').then(items=>items.some(item=>item.type==='history'&&item.url===${JSON.stringify(`${origin}/auxperf00000`)}))`, true));
  await delay(1000);
  for (let i = 0; i < trials + 3; i++) {
    const token = mode === "command" ? "settings" : `auxperf${String(i).padStart(5, "0")}`;
    await run.evaluate(`window.aux.dispatchCommand(${JSON.stringify(mode === "new-tab" ? "new-tab" : mode === "edit" ? "open-address" : "palette")})`, true);
    await until("unified command surface", () => run.evaluate(`!!document.querySelector(${JSON.stringify(fieldSelector)})`));
    await run.evaluate(`document.querySelector(${JSON.stringify(fieldSelector)}).focus()`);
    if (i === 0) await delay(100);
    await run.evaluate(`document.querySelector(${JSON.stringify(fieldSelector)}).select()`);
    await run.evaluate(`window.__auxBenchPromise = new Promise((resolve, reject) => {
      const expected=${JSON.stringify(token)};
      const historyAddress=${JSON.stringify(mode === "command" ? "Settings" : `${new URL(origin).host}/${token}`)};
      const field=document.querySelector(${JSON.stringify(fieldSelector)});
      let inputAt=0;
      const observer=new MutationObserver(() => {
        if (!inputAt || ![...document.querySelectorAll('[role=option]')].some(row => row.textContent?.includes(historyAddress))) return;
        observer.disconnect(); requestAnimationFrame(() => requestAnimationFrame(() => { clearTimeout(timeout); resolve(performance.now()-inputAt); }));
      });
      const timeout=setTimeout(() => { observer.disconnect(); reject(new Error('No matching native history result for '+expected)); },10000);
      const onInput=e => { if(field.value===expected){inputAt=e.timeStamp;field.removeEventListener('input',onInput);} };
      field.addEventListener('input',onInput); observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    })`);
    await run.send("Input.insertText", { text: token });
    if (i === 0) { await delay(300); report.firstInput = await run.evaluate(`({value:document.querySelector(${JSON.stringify(fieldSelector)})?.value,options:[...document.querySelectorAll('[role=option]')].map(x=>x.textContent)})`); }
    const ms = await run.evaluate("window.__auxBenchPromise", true);
    if (i >= 3) report.samplesMs.push(ms);
    await run.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
    await run.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
    await until("surface dismissed", () => run.evaluate(`!document.querySelector(${JSON.stringify(fieldSelector)})`));
  }
  report.summary = summarizeSamples(report.samplesMs);
  report.meets30msP95 = report.summary.p95 <= 30;
  report.status = report.meets30msP95 ? "measured" : "failed-budget";
  if (!report.meets30msP95) process.exitCode = 1;
  console.log(JSON.stringify({ summary: report.summary, meets30msP95: report.meets30msP95, output }, null, 2));
} catch (error) {
  report.status = "failed";
  report.error = error instanceof Error ? error.message : String(error);
  if (run) report.diagnostic = await run.evaluate(`(async()=>{let native,capabilities;try{native=await window.aux.autocomplete('auxperf00000')}catch(e){native=String(e)}try{capabilities=await window.aux.capabilities()}catch(e){capabilities=String(e)}return {input:document.querySelector(${JSON.stringify(fieldSelector)})?.value,options:[...document.querySelectorAll('[role=option]')].slice(0,8).map(x=>x.textContent),native,capabilities}})()`, true).catch(() => null);
  console.error(report.error);
  if (report.diagnostic) console.error(JSON.stringify(report.diagnostic));
  process.exitCode = 1;
} finally {
  if (run) await close(run);
  server.close();
  report.finishedAt = new Date().toISOString();
  writeFileSync(join(output, "manifest.json"), JSON.stringify(report, null, 2) + "\n");
  rmSync(disposable, { recursive: true, force: true });
}
