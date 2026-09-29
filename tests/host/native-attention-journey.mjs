// S10 attention acceptance against a real Aux.app and disposable Profile.
// The operator uses the visible UI; the harness never reads the runtime bearer,
// calls raw RPC, writes the state database, or exposes a DevTools port.
import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync, mkdtempSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { basename, isAbsolute, join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { createInterface } from "node:readline/promises";
import { attentionModelFixture, MODEL_ID, RUN_A, RUN_B, RUN_C, RUN_D, PRIVATE_QUESTION } from "./attention-model-fixture.mjs";

const root = resolve(import.meta.dirname, "../..");
const systemOnly = process.argv.includes("--system-only");
const stages = [
  "Configure the local model in Settings and open two disposable fixture pages.",
  "Start run A, leave a queue/steer draft, then start run B in a second chat.",
  "Return to A before B parks; check a generic notice and preserved draft.",
  "Dismiss the notice with Escape; inspect Home and Tasks attention cards.",
  "Complete A while it is foreground; review B's typed question.",
  "Answer B, switch away, disable in-app notices, then finish B.",
  "Optional --system-attention: Focus Mode suppresses a third run; background macOS alert opens a fourth run.",
];
if (process.argv.includes("--list")) {
  console.log(JSON.stringify({ stages, usage: "node tests/host/native-attention-journey.mjs --app /absolute/path/to/Aux.app [--system-attention | --system-only] [--output /absolute/new/directory]", nativeBuild: "Use a previously built Aux.app; this script only compiles the existing AX helper." }, null, 2));
  process.exit(0);
}
if (process.platform !== "darwin") throw new Error("Native attention acceptance requires macOS.");
const option = name => { const index = process.argv.indexOf(name); return index < 0 ? undefined : process.argv[index + 1]; };
const appArg = option("--app");
if (!appArg || !isAbsolute(appArg)) throw new Error("Pass --app /absolute/path/to/Aux.app.");
const app = realpathSync(appArg);
assert.equal(basename(app), "Aux.app");
const binary = join(app, "Contents/MacOS/Aux");
assert.ok(existsSync(binary), "Use a built Aux.app");
const bundleId = execFileSync("/usr/libexec/PlistBuddy", ["-c", "Print :CFBundleIdentifier", join(app, "Contents/Info.plist")], { encoding: "utf8" }).trim();
assert.equal(bundleId, "dev.aux.browser");
const output = resolve(process.argv.includes("--output") ? option("--output") : join(root, "release/test-artifacts", `native-attention-${new Date().toISOString().replaceAll(/[:.]/g, "-")}`));
assert.ok(!existsSync(output), "Evidence output must be a new directory");
mkdirSync(output, { recursive: true });
const disposable = mkdtempSync("/tmp/aux-attention-native-");
const profile = join(disposable, "profile");
const databasePath = join(profile, "Default/Aux Runtime Data/aux-state.sqlite");
const windowTool = join(disposable, "native-window");
const report = { schema: 1, scope: "Real Aux.app, disposable Profile, local model and pages; native AX and read-only durable state", app,
  sourceSha: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(), startedAt: new Date().toISOString(),
  noRuntimeBearer: true, noDebugPort: true, steps: [], captures: [], passed: false };
const input = createInterface({ input: process.stdin, output: process.stdout });
let child;
let model;

function native(action, ...args) {
  return execFileSync(windowTool, [action, String(child.pid), ...args.map(String)], { encoding: "utf8", timeout: 15_000 }).trim();
}
function record(name, detail = {}) {
  report.steps.push({ name, passed: true, detail });
  console.log(`PASS ${name}`);
}
function inspect(marker) {
  if (!existsSync(databasePath)) return null;
  const db = new DatabaseSync(databasePath, { readOnly: true });
  try {
    // Protected startup seals `runs.goal`; identify the ordered fixture runs
    // after the local model endpoint confirms each marker.
    // Never decrypt or bypass the Profile key from the host acceptance runner.
    const ordinal = systemOnly && marker === RUN_D ? 0
      : marker === RUN_A ? 0 : marker === RUN_B ? 1 : marker === RUN_C ? 2 : marker === RUN_D ? 3 : -1;
    assert.notEqual(ordinal, -1, "Unknown attention fixture marker");
    const run = db.prepare("SELECT run_id AS runId,status FROM runs ORDER BY created_at,rowid LIMIT 1 OFFSET ?").get(ordinal);
    if (!run) return null;
    const suspension = db.prepare("SELECT suspension_id AS suspensionId,kind,state FROM safety_suspensions WHERE run_id=? AND state='pending' ORDER BY created_at DESC LIMIT 1").get(run.runId);
    return { ...run, suspension };
  } finally { db.close(); }
}
async function until(label, check, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode !== null) throw new Error(`Aux exited waiting for ${label}`);
    const found = await check();
    if (found) return found;
    await delay(150);
  }
  throw new Error(`Timed out waiting for ${label}`);
}
async function operator(instruction) {
  console.log(`\nOPERATOR: ${instruction}`);
  await input.question("Press Return after completing that visible UI action. ");
}
function capture(name) {
  const window = JSON.parse(native("window"));
  const path = join(output, `${name}.png`);
  execFileSync("/usr/sbin/screencapture", ["-x", "-l", String(window.id), path], { timeout: 15_000 });
  assert.ok(statSync(path).size > 1024, `${name} capture is empty`);
  report.captures.push({ name, file: basename(path), bytes: statSync(path).size });
}

try {
  model = await attentionModelFixture();
  execFileSync("xcrun", ["swiftc", join(root, "tests/host/native-window.swift"), "-o", windowTool], { timeout: 120_000 });
  const pageUrl = `http://127.0.0.1:${new URL(model.endpoint).port}/fixture`;
  // The model endpoint also serves a plain local page; every run has a real scoped target.
  child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check", "--use-mock-keychain", "--password-store=basic"],
    { cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0" }, stdio: ["ignore", "ignore", "pipe"] });
  child.stderr.on("data", () => { /* Drain without recording private browser output. */ });
  await until("native Aux shell", () => {
    try { return native("shell-url").startsWith("chrome://aux/"); } catch { return false; }
  });
  assert.equal(existsSync(join(profile, "DevToolsActivePort")), false, "A native acceptance run must not expose a raw debugging port");
  record("production native shell without public debugging", { pid: child.pid });

  if (systemOnly) {
    await operator(`In Settings → Models, select OpenAI-compatible, save endpoint ${model.endpoint}, and set Planner model to ${MODEL_ID}. In Settings → General, turn System task notifications on and leave Focus Mode off. Open ${pageUrl}?page=d in a local tab. This uses no paid provider.`);
    await operator(`Start a new chat from the local page with goal "${RUN_D}: summarize this local fixture". Switch to another app before its model reply.`);
    await until("system notification run D request", () => model.seen(RUN_D));
    const d = await until("D durable run", () => inspect(RUN_D));
    model.release(RUN_D);
    await until("D completes in background", () => inspect(RUN_D)?.status === "completed");
    const answer = (await input.question("Confirm the macOS Aux alert used only generic copy, click it, and type YES after checking the visible D chat: ")).trim();
    assert.equal(answer, "YES", "A native OS notification and click journey must be witnessed");
    assert.equal(native("has-text", RUN_D), "true", "The alert must open the reviewed D chat");
    record("generic macOS alert click returns to the reviewed run", { runId: d.runId, osAlert: "operator-inspected" });
    capture("system-alert-opened-run");
  } else {
  await operator(`In Settings → Models, select OpenAI-compatible, save endpoint ${model.endpoint}, and set Planner model to ${MODEL_ID}. Open ${pageUrl}?page=a and ${pageUrl}?page=b as two local tabs. This uses no paid provider.`);
  await operator(`From page A, start a new chat with goal "${RUN_A}: summarize this local fixture". The model response is held. In that same conversation, type "Queue draft stays in A" in the composer without sending it.`);
  await until("A model request", () => model.seen(RUN_A));
  const a = await until("A durable run", () => inspect(RUN_A));
  assert.ok(["queued", "planning", "running", "paused"].includes(a.status), `A must remain live: ${a.status}`);
  record("first run is live with held local model response", { runId: a.runId, status: a.status });

  await operator(`From page B, start a separate new chat with goal "${RUN_B}: ask which local option to use". Once its model request starts, return to run A's conversation, leaving the A draft intact. Complete this stage promptly; the local model call has a 90-second deadline.`);
  await until("B model request", () => model.seen(RUN_B));
  const b = await until("B durable run", () => inspect(RUN_B));
  assert.notEqual(a.runId, b.runId);
  assert.ok(["queued", "planning", "running", "paused"].includes(inspect(RUN_A)?.status));
  const draft = native("control-value", "Reply to conversation");
  assert.equal(draft, "Queue draft stays in A", "B must not replace or clear A's queued/steered draft");
  record("two concurrent runs keep A's composer draft", { a: a.runId, b: b.runId });

  model.release(RUN_B);
  const pending = await until("durable B question", () => {
    const run = inspect(RUN_B);
    return run?.status === "needs_input" && run.suspension?.kind === "ask-user-question" ? run : null;
  });
  await until("generic B notice", () => native("has-button", "Dismiss task notice") === "true");
  assert.equal(native("has-text", "Aux needs your answer"), "true");
  assert.equal(native("has-text", PRIVATE_QUESTION), "false", "The notice must not quote a private question");
  capture("other-run-question-notice");
  record("B's durable question produces only a generic notice while A is foreground", { runId: b.runId, suspensionKind: pending.suspension.kind });

  model.release(RUN_A);
  await until("A completes", () => inspect(RUN_A)?.status === "completed");
  assert.equal(native("has-text", "Aux needs your answer"), "true", "A's foreground completion must not replace B's notice");
  assert.equal(native("has-text", "Aux finished a task"), "false");
  record("completion is quiet for the exact foreground run");

  await operator("Focus the notice's Dismiss button with the keyboard, press Escape, and leave run A visible.");
  assert.equal(native("has-button", "Dismiss task notice"), "false", "Escape must dismiss the notice");
  assert.equal(native("control-value", "Reply to conversation"), "Queue draft stays in A");
  record("keyboard Escape dismisses notice without disturbing A draft");

  await operator("Open Home and confirm the Needs your input card appears for run B. Leave the card visible.");
  assert.equal(native("has-text", "Needs your input"), "true");
  assert.equal(native("has-button", "Review task"), "true");
  capture("home-question-card");
  await operator("Focus the Home card's Dismiss button with the keyboard and press Escape.");
  assert.equal(native("has-button", "Review task"), "false", "Escape should dismiss the Home card for this mount");
  capture("home-after-card-dismissal");
  record("Home shows durable attention and allows keyboard dismissal");

  await operator("Open Tasks. Confirm the Needs your input card reappears, then choose Review task using the keyboard.");
  assert.equal(native("has-text", "Needs your input"), "true");
  assert.equal(native("has-button", "Review task"), "true");
  await operator("Press Enter on Review task; the B conversation should show the pending question. Do not answer yet.");
  assert.equal(native("has-text", PRIVATE_QUESTION), "true", "Review must open the typed pending question in B");
  capture("reviewed-question");
  record("Tasks review opens the exact durable B question");

  await operator("Answer B's question in its conversation composer. Its next local model reply is held; then open Home or Tasks and turn Task notices off. Leave A, Home, or Tasks foreground.");
  await until("B's second model request", () => model.seen(`${RUN_B}:2`));
  assert.equal(native("has-name", "Task notices off"), "true", "The local notice preference must be visibly off");
  model.release(`${RUN_B}:2`);
  await until("B completes", () => inspect(RUN_B)?.status === "completed");
  assert.equal(native("has-button", "Dismiss task notice"), "false", "The off preference must suppress B's completion notice");
  record("off preference suppresses another run's completion notice");
  capture("preference-off-completion");
  if (process.argv.includes("--system-attention")) {
    await operator(`In Home or Tasks, turn Task notices on. In Settings → General → Task attention, turn System task notifications and Focus Mode on. Start a third chat from a local fixture page with goal "${RUN_C}: summarize this local fixture", then switch to another chat before its model reply.`);
    await until("Focus Mode run C request", () => model.seen(RUN_C));
    model.release(RUN_C);
    await until("C completes under Focus Mode", () => inspect(RUN_C)?.status === "completed");
    assert.equal(native("has-button", "Dismiss task notice"), "false", "Focus Mode must suppress in-app delivery");
    await operator("Confirm no Aux system alert appeared while Focus Mode was on. Return to Settings and turn Focus Mode off, leaving System task notifications on.");
    record("Focus Mode suppresses both attention delivery paths", { runId: inspect(RUN_C).runId, osAlert: "operator-inspected" });

    await operator(`Start a fourth chat from a local fixture page with goal "${RUN_D}: summarize this local fixture". Switch to another app before its model reply; allow Aux notifications in macOS when prompted.`);
    await until("system notification run D request", () => model.seen(RUN_D));
    model.release(RUN_D);
    await until("D completes in background", () => inspect(RUN_D)?.status === "completed");
    const answer = (await input.question("Confirm the macOS Aux alert used only generic copy, then click it to open D. Type YES after checking the visible D chat: ")).trim();
    assert.equal(answer, "YES", "A native OS notification and click journey must be witnessed");
    assert.equal(native("shell-url").startsWith("chrome://aux/"), true);
    record("generic macOS alert click returns to the reviewed run", { runId: inspect(RUN_D).runId, osAlert: "operator-inspected" });
    capture("system-alert-opened-run");
  }
  }
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
