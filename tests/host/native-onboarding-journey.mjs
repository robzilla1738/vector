// S13 first-run acceptance: real Aux.app, disposable Profile and browser source,
// local unpaid model, visible setup UI, native AX, and read-only durable state.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { basename, isAbsolute, join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { setTimeout as delay } from "node:timers/promises";
import { ANSWER, MODEL_ID, onboardingModelFixture } from "./onboarding-model-fixture.mjs";

const root = resolve(import.meta.dirname, "../..");
const stages = [
  "Create a disposable Chrome source and inspect, select, and import its Bookmark and History through setup.",
  "Finish later, restart, replay setup, and inspect the persisted receipt without importing again.",
  "Review model disclosure, configure the local unpaid model, and inspect permissions and optional default choice.",
  "Reject a changed source, then explicitly review a fresh local page and double-click one postcard.",
  "Verify one durable run and completed local answer; restart/replay and open the same first chat.",
];
if (process.argv.includes("--list")) {
  console.log(JSON.stringify({ stages, usage: "node tests/host/native-onboarding-journey.mjs --app /absolute/Aux.app [--output /absolute/new/directory]", offline: "--self-check", nativeBuild: "Uses an existing Aux.app; only the AX helper is compiled." }, null, 2));
  process.exit(0);
}
const BOOKMARK = "https://aux-onboarding-fixture.example/bookmark";
const HISTORY = "https://aux-onboarding-fixture.example/history";

function seedChrome(disposable) {
  const sourceHome = join(disposable, "source-home");
  const dir = join(sourceHome, "Library/Application Support/Google/Chrome/Default");
  mkdirSync(dir, { recursive: true });
  const bookmarks = join(dir, "Bookmarks");
  writeFileSync(bookmarks, JSON.stringify({ roots: { bookmark_bar: { type: "folder", children: [
    { type: "url", name: "Onboarding fixture", url: BOOKMARK },
  ] }, other: { type: "folder", children: [] }, synced: { type: "folder", children: [] } } }));
  const history = join(dir, "History");
  const db = new DatabaseSync(history);
  try {
    db.exec("CREATE TABLE urls(id INTEGER PRIMARY KEY,url TEXT,title TEXT); CREATE TABLE visits(id INTEGER PRIMARY KEY,url INTEGER,visit_time INTEGER);");
    db.prepare("INSERT INTO urls(id,url,title) VALUES(1,?,?)").run(HISTORY, "Onboarding fixture visit");
    db.prepare("INSERT INTO visits(id,url,visit_time) VALUES(1,1,?)").run((Date.now() - 3_600_000 + 11_644_473_600_000) * 1000);
  } finally { db.close(); }
  const hashes = Object.fromEntries([bookmarks, history].map(path => [path.slice(sourceHome.length + 1), createHash("sha256").update(readFileSync(path)).digest("hex")]));
  return { sourceHome, bookmarks, history, hashes };
}

if (process.argv.includes("--self-check")) {
  const fixture = seedChrome(mkdtempSync("/tmp/aux-onboarding-check-"));
  const db = new DatabaseSync(fixture.history, { readOnly: true });
  try { assert.equal(db.prepare("SELECT url FROM urls").get().url, HISTORY); }
  finally { db.close(); }
  assert.equal(JSON.parse(readFileSync(fixture.bookmarks)).roots.bookmark_bar.children[0].url, BOOKMARK);
  const model = await onboardingModelFixture();
  try {
    assert.equal((await (await fetch(`${model.endpoint}/models`)).json()).data[0].id, MODEL_ID);
    assert.match(await (await fetch(model.pageUrl)).text(), /AUX_ONBOARDING_DISPOSABLE_SOURCE/);
    const request = fetch(`${model.endpoint}/chat/completions`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ model: MODEL_ID, messages: [{ role: "user", content: "test" }] }) });
    for (let i = 0; i < 40 && model.calls.length !== 1; i++) await delay(10);
    assert.equal(model.calls.length, 1);
    model.release();
    assert.match(JSON.stringify(await (await request).json()), /Finished the local first task/);
    console.log("PASS synthetic Chrome source and held local model protocol");
  } finally { await model.close(); }
  process.exit(0);
}

if (process.platform !== "darwin") throw new Error("Native onboarding acceptance requires macOS.");
const option = name => { const index = process.argv.indexOf(name); return index < 0 ? undefined : process.argv[index + 1]; };
const appArg = option("--app");
if (!appArg || !isAbsolute(appArg)) throw new Error("Pass --app /absolute/path/to/Aux.app.");
const app = realpathSync(appArg);
assert.equal(basename(app), "Aux.app");
const binary = join(app, "Contents/MacOS/Aux");
assert.ok(existsSync(binary), "Use a built Aux.app");
assert.equal(execFileSync("/usr/libexec/PlistBuddy", ["-c", "Print :CFBundleIdentifier", join(app, "Contents/Info.plist")], { encoding: "utf8" }).trim(), "dev.aux.browser");
const output = resolve(option("--output") ?? join(root, "release/test-artifacts", `native-onboarding-${new Date().toISOString().replaceAll(/[:.]/g, "-")}`));
assert.ok(!existsSync(output), "Evidence output must be a new directory");
mkdirSync(output, { recursive: true });
const disposable = mkdtempSync("/tmp/aux-onboarding-native-");
const profile = join(disposable, "profile");
const source = seedChrome(disposable);
const databasePath = join(profile, "Default/Aux Runtime Data/aux-state.sqlite");
const windowTool = join(disposable, "native-window");
const report = { schema: 1, scope: "S13 real native first run with synthetic browser source and unpaid local model", app,
  sourceSha: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
  appBinarySha256: createHash("sha256").update(readFileSync(binary)).digest("hex"), sourceHashes: source.hashes,
  noRuntimeBearer: true, noDebugPort: true, startedAt: new Date().toISOString(), steps: [], captures: [], passed: false };
const input = createInterface({ input: process.stdin, output: process.stdout });
let child;
let model;
function native(action, ...args) {
  return execFileSync(windowTool, [action, String(child.pid), ...args.map(String)], { encoding: "utf8", timeout: 15_000 }).trim();
}
function inspect() {
  if (!existsSync(databasePath)) return null;
  const nativeBookmarks = join(profile, "Default/Bookmarks");
  const bookmarkRows = [];
  if (existsSync(nativeBookmarks)) {
    const visit = value => {
      if (!value || typeof value !== "object") return;
      if (value.url === BOOKMARK) bookmarkRows.push({ url: value.url });
      for (const child of Object.values(value)) visit(child);
    };
    visit(JSON.parse(readFileSync(nativeBookmarks, "utf8")));
  }
  const db = new DatabaseSync(databasePath, { readOnly: true });
  try {
    return {
      bookmarks: bookmarkRows,
      history: db.prepare("SELECT url FROM history WHERE url=?").all(HISTORY),
      runs: db.prepare("SELECT run_id AS runId,status FROM runs ORDER BY created_at,rowid").all(),
      modelCalls: db.prepare("SELECT run_id AS runId,model_id AS modelId,error FROM model_calls ORDER BY created_at,rowid").all(),
    };
  } finally { db.close(); }
}
async function until(label, check, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode !== null) throw new Error(`Aux exited while waiting for ${label}`);
    const found = await check();
    if (found) return found;
    await delay(200);
  }
  throw new Error(`Timed out waiting for ${label}`);
}
async function operator(instruction) {
  console.log(`\nOPERATOR: ${instruction}`);
  await input.question("Press Return after completing that visible UI action. ");
}
function record(name, detail = {}) { report.steps.push({ name, passed: true, detail }); console.log(`PASS ${name}`); }
function capture(name) {
  const window = JSON.parse(native("window"));
  const path = join(output, `${name}.png`);
  execFileSync("/usr/sbin/screencapture", ["-x", "-l", String(window.id), path], { timeout: 15_000 });
  assert.ok(statSync(path).size > 1024, `${name} capture is empty`);
  report.captures.push({ name, file: basename(path), bytes: statSync(path).size });
}
function assertSourceUnchanged() {
  for (const [relative, hash] of Object.entries(source.hashes))
    assert.equal(createHash("sha256").update(readFileSync(join(source.sourceHome, relative))).digest("hex"), hash, `Browser source changed: ${relative}`);
}
async function launch() {
  const env = { ...process.env, AUX_LOAD_DOTENV: "0", AUX_IMPORT_SOURCE_HOME: source.sourceHome };
  for (const key of ["AI_GATEWAY_API_KEY", "OPENAI_API_KEY", "ANTHROPIC_API_KEY", "GEMINI_API_KEY", "GOOGLE_API_KEY"]) delete env[key];
  child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check", "--use-mock-keychain", "--password-store=basic"],
    { cwd: disposable, env, stdio: ["ignore", "ignore", "pipe"] });
  child.stderr.on("data", () => { /* Do not record private browser output. */ });
  await until("native Aux shell", () => { try { return native("shell-url").startsWith("chrome://aux/"); } catch { return false; } });
  assert.equal(existsSync(join(profile, "DevToolsActivePort")), false);
}
async function gracefulRestart() {
  await operator("Quit only this disposable Aux window from the Aux menu. Wait until it closes.");
  if (child.exitCode === null) await new Promise((resolveExit, rejectExit) => {
    const timer = setTimeout(() => rejectExit(new Error("Timed out waiting for graceful Aux quit")), 180_000);
    child.once("exit", () => { clearTimeout(timer); resolveExit(); });
  });
  child.stderr.destroy();
  await launch();
}

try {
  model = await onboardingModelFixture();
  execFileSync("xcrun", ["swiftc", join(root, "tests/host/native-window.swift"), "-o", windowTool], { timeout: 120_000 });
  await launch();
  await until("first-run setup", () => native("has-text", "A browser for what comes next") === "true");
  assert.equal(model.calls.length, 0, "Opening setup must not call a model");
  record("new disposable Profile opens setup without paid or automatic model work");
  capture("first-run-welcome");

  await operator("In setup, visit Import. Choose See what can be imported, review only synthetic Chrome Default, select its Bookmarks and History, and click Import selected once. Leave its completed receipt visible.");
  await until("native import receipt", () => native("has-text", "Import finished") === "true", 180_000);
  const imported = await until("one imported Bookmark and History visit", () => {
    const state = inspect();
    return state?.bookmarks.length === 1 && state.history.length === 1 ? state : null;
  });
  assert.equal(imported.runs.length, 0, "Import alone must not start a chat");
  assert.equal(model.calls.length, 0, "Import alone must not call a model");
  assertSourceUnchanged();
  record("reviewed import writes one Bookmark and History visit; source stays unchanged");
  capture("reviewed-import-receipt");

  await operator("Choose Finish later, then quit the disposable Aux window. The harness will relaunch it; do not import again.");
  if (child.exitCode === null) await new Promise((resolveExit, rejectExit) => {
    const timer = setTimeout(() => rejectExit(new Error("Timed out waiting for first graceful quit")), 180_000);
    child.once("exit", () => { clearTimeout(timer); resolveExit(); });
  });
  child.stderr.destroy();
  await launch();
  assert.equal(inspect()?.bookmarks.length, 1);
  assert.equal(inspect()?.history.length, 1);
  await operator("Open Settings → General → Replay setup, visit Import and inspect the saved completed receipt. Do not press Import selected. Leave Import visible.");
  assert.equal(native("has-text", "Import finished"), "true", "Replay must expose the saved import receipt");
  assert.equal(inspect()?.bookmarks.length, 1);
  assert.equal(inspect()?.history.length, 1);
  record("finish later, restart and replay retain import receipt without repeating writes");
  capture("replayed-import-receipt");

  await operator(`Continue to Model, review model data use, select OpenAI-compatible, save endpoint ${model.endpoint} and model ${MODEL_ID}. Do not choose Test. Visit Appearance, Default and Permissions; leave Aux's default-browser state and service grants untouched. Continue to the postcard.`);
  assert.equal(model.calls.length, 0, "Model setup without Test must not send a request");
  assert.equal(native("has-text", "Start with one useful question"), "true");
  assert.equal(native("has-text", "Import finished"), "true", "Postcard review must include the persisted receipt");
  record("disclosure, local model and permissions lead to a reviewed postcard without an automatic request");
  capture("postcard-review");

  await operator(`Enter ${model.pageUrl} in Page to explore, open it in background, choose it under Reviewed source, and check the explicit page-context box. Then change or reload that selected page before starting. Confirm Start this chat is disabled or asks for fresh review. Leave setup visible.`);
  assert.equal(inspect()?.runs.length, 0, "Changed source must not start a run");
  assert.equal(model.calls.length, 0, "Changed source must not make a model request");
  assert.equal(native("button-enabled", "Start this chat"), "false", "Stale source must block the postcard");
  record("changed page cannot start the first task without fresh review");
  capture("stale-source-refusal");

  await operator(`Open ${model.pageUrl}?fresh=1 in background from the postcard, choose that fresh page under Reviewed source, inspect it, check the context box, then double-click only “What matters on this page?” → Start this chat. Do not create a second chat. The local model reply is held.`);
  await until("first local model request", () => model.calls.length > 0, 120_000);
  const first = await until("one durable first-task run", () => {
    const state = inspect();
    return state?.runs.length === 1 ? state.runs[0] : null;
  });
  assert.match(first.runId, /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i);
  assert.equal(inspect().runs.length, 1, "Double-click must not create a second run");
  record("double-click delivers one durable first chat", { runId: first.runId, modelRequestsAtHold: model.calls.length });
  model.release();
  await until("completed first chat", () => inspect()?.runs[0]?.status === "completed", 120_000);
  await until("visible first answer", () => native("has-text", ANSWER) === "true");
  const calls = await until("attributed local model calls", () => {
    const rows = inspect()?.modelCalls;
    return rows?.length ? rows : null;
  });
  assert.ok(calls.length > 0 && calls.every(call => call.runId === first.runId && call.modelId === MODEL_ID && !call.error), "Every model call must belong to the one local first run");
  record("actual first chat completes with the local answer and attributed model calls", { runId: first.runId, modelCalls: calls.length });
  capture("first-useful-chat");

  await gracefulRestart();
  await operator("Open Settings → General → Replay setup, go to the postcard, and leave Open your first chat visible. Do not start a new chat.");
  assert.equal(native("has-button", "Open your first chat"), "true", "Replay must retain the first task identity");
  assert.equal(inspect()?.runs.length, 1);
  assert.equal(inspect()?.runs[0]?.runId, first.runId);
  await operator("Choose Open your first chat. Confirm the same completed local answer is visible.");
  await until("reopened first answer", () => native("has-text", ANSWER) === "true");
  assertSourceUnchanged();
  record("restart and replay preserve the same first-run identity and import destinations", { runId: first.runId });
  report.passed = true;
} catch (error) {
  report.steps.push({ name: "terminal failure", passed: false, detail: String(error) });
  process.exitCode = 1;
} finally {
  report.endedAt = new Date().toISOString();
  writeFileSync(join(output, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ output, passed: report.passed, steps: report.steps.map(step => ({ name: step.name, passed: step.passed })) }, null, 2));
  input.close();
  child?.kill("SIGTERM");
  await model?.close();
}
