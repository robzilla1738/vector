/** Scoped 0121 acceptance. This never qualifies relay isolation or universal confinement. */
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { createReadStream, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, isAbsolute, join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { createEgressFixture } from "./native-egress-fixture.mjs";

const root = resolve(import.meta.dirname, "../..");
const option = name => { const i = process.argv.indexOf(name); return i < 0 ? undefined : process.argv[i + 1]; };
if (process.argv.includes("--describe")) {
  console.log(JSON.stringify({ scope: "0121 HTTP, final headers, redirects, native credentials, opaque transport and revocation only",
    command: "node tests/host/native-egress-journey.mjs --app /absolute/Aux.app --native-patch /absolute/0121.patch --output /absolute/new/evidence [--group requests|credentials]",
    groups: { requests: "Local scripted model drives a real run; operator reviews public-recipient requests in Aux. No paid model calls.",
      credentials: "Operator saves one generated disposable password, then approves the native saved-password fill. Checks intended-origin submission, cross-origin denial and second-run refusal." },
    excluded: ["storage/broadcast/postMessage relays", "signed packaging", "owner-navigation tombstone recovery"],
    passRule: "Attempt evidence plus native admitted/denied receipt plus receiver count; silence alone never passes." }, null, 2));
  process.exit(0);
}
assert.equal(process.platform, "darwin", "Native Aux journeys require macOS");
const group = option("--group") ?? "requests";
assert.ok(["requests", "credentials"].includes(group));
const appArg = option("--app"), patchArg = option("--native-patch"), outputArg = option("--output");
assert.ok([appArg, patchArg, outputArg].every(value => value && isAbsolute(value)), "Pass absolute --app, --native-patch and new --output paths");
const app = realpathSync(appArg), output = resolve(outputArg), patch = realpathSync(patchArg);
assert.equal(basename(app), "Aux.app");
assert.ok(!existsSync(output), "Existing evidence is never overwritten");
mkdirSync(output, { recursive: true });
const disposable = mkdtempSync("/tmp/aux-egress-native-");
const profile = join(disposable, "profile"), binary = join(app, "Contents/MacOS/Aux");
const helper = join(app, "Contents/Helpers/Aux Runtime");
const nativeHeader = resolve(app, "../../../chrome/browser/ui/aux/generated/aux_host_methods.h");
const nativeSourceCommit = readFileSync(nativeHeader, "utf8").match(/kSourceCommit = "([a-f0-9]{40}(\+dirty)?)"/)?.[1];
assert.ok(nativeSourceCommit, "A built native source identity is required");
const report = { schema: 1, scope: "Scoped 0121; relay isolation remains unqualified", group, app,
  harnessSourceSha: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
  nativeSourceCommit, nativePatchSha256: createHash("sha256").update(readFileSync(patch)).digest("hex"),
  startedAt: new Date().toISOString(), steps: [], nativeReceipts: [], captures: [], modelCalls: 0, passed: false };
let child, fixture, modelServer, bearer, port, runId, controlledPageId;
let stderrLine = "";
const commandQueue = [], modelWaiters = new Set();
const pendingModel = [];
const digestFile = async path => { const hash = createHash("sha256"); for await (const bytes of createReadStream(path)) hash.update(bytes); return hash.digest("hex"); };
const record = (name, detail = {}) => { report.steps.push({ name, passed: true, detail }); console.log(`PASS ${name}`); };
async function until(label, check, timeout = 30_000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (child && (child.exitCode !== null || child.signalCode !== null)) throw new Error(`Aux exited while waiting for ${label}`);
    const value = await check(); if (value) return value;
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${label}`);
}
async function rpc(method, params = {}) {
  const response = await fetch(`http://127.0.0.1:${port}/rpc`, { method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${bearer}` },
    body: JSON.stringify({ id: randomUUID(), method, params }), signal: AbortSignal.timeout(60_000) });
  const result = await response.json();
  if (result.error) throw new Error(`${method}: ${result.error.code}: ${result.error.message}`);
  return result.result;
}
function modelReply(response, payload, code) {
  const names = payload.tools.map(tool => tool.function?.name);
  const firstTurn = !names.includes("repl") && names.includes("goal_program");
  const name = firstTurn ? "goal_program" : "repl";
  const input = firstTurn
    ? { code: `${code}\nif (false) submitResult('fixture continues after the first turn');`, answerLabel: "", deadlineMs: 120_000 }
    : { code, deadlineMs: 120_000, yieldTimeMs: 120_000 };
  const call = { id: `call_${randomUUID()}`, type: "function", function: { name, arguments: JSON.stringify(input) } };
  const common = { id: `completion_${randomUUID()}`, created: 1, model: "aux-egress-fixture" };
  if (payload.stream) {
    response.writeHead(200, { "content-type": "text/event-stream" });
    response.write(`data: ${JSON.stringify({ ...common, object: "chat.completion.chunk", choices: [{ index: 0, delta: { role: "assistant", tool_calls: [{ index: 0, ...call }] }, finish_reason: null }] })}\n\n`);
    response.end(`data: ${JSON.stringify({ ...common, object: "chat.completion.chunk", choices: [{ index: 0, delta: {}, finish_reason: "tool_calls" }], usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 } })}\n\ndata: [DONE]\n\n`);
  } else {
    response.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ ...common, object: "chat.completion",
      choices: [{ index: 0, message: { role: "assistant", content: null, tool_calls: [call] }, finish_reason: "tool_calls" }],
      usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 } }));
  }
}
function flushModel() {
  while (commandQueue.length && pendingModel.length) {
    const pending = pendingModel.shift();
    if (pending.response.destroyed) continue;
    const command = commandQueue.shift(); modelReply(pending.response, pending.payload, command.code); command.sent = true;
  }
}
async function command(code) {
  const next = { code, sent: false }; commandQueue.push(next); flushModel();
  await until("scripted model command", async () => {
    if (next.sent) return true;
    if (runId) {
      const state = await rpc("runs.get", { runId });
      if (["failed", "cancelled", "completed"].includes(state.run.status))
        throw new Error(`Run ended before model dispatch: ${state.run.status}: ${state.run.error ?? state.run.statusMessage ?? "unknown"}`);
    }
    return false;
  }, 120_000);
}
const receiptSince = (start, outcome, reason, phase) => report.nativeReceipts.slice(start).find(item => item.outcome === outcome && (!reason || reason.test(item.reason)) && (!phase || item.phase === phase));
async function startSelectedDocumentRun() {
  if (runId) {
    await rpc("runs.cancel", { runId });
    await rpc("pages.close", { pageId: controlledPageId }).catch(() => {});
  }
  const seed = await rpc("pages.open", { url: fixture.url, activate: false });
  await until("seed tab loaded", async () => (await rpc("pages.list")).some(page => page.pageId === seed.pageId && page.url === fixture.url && !page.loading));
  const run = await rpc("runs.start", { goal: "Exercise one disposable native egress case under the local scripted model.",
    pageId: seed.pageId, maxSteps: 4, maxModelCalls: 4, deadlineMs: 120_000,
    context: `SPACE MEMORY SUMMARY\nPrivate synthetic test token: ${fixture.secret}` });
  runId = run.runId; controlledPageId = seed.pageId;
  report.runIds ??= []; report.runIds.push(runId);
}
async function click(name) {
  if (group === "requests") await startSelectedDocumentRun();
  const start = report.nativeReceipts.length;
  await command(`page.clickByName(${JSON.stringify(name)}, 'button');`);
  return start;
}
async function blocked(name, reason, phase) {
  const start = await click(name);
  const receipt = await until(`${name} native denial`, () => receiptSince(start, "denied", reason, phase));
  await delay(1000); fixture.assertNoCapture(name);
  record(name, { receipt, receiverCount: 0 });
}
async function cookieBoundary() {
  const start = await click("secret-cookie");
  const receipt = await until("cookie request reaches native final-header boundary", () =>
    report.nativeReceipts.slice(start).find(item => item.kind === "subresource" && item.phase === "send"));
  await delay(1000);
  const captures = fixture.snapshot().filter(item => item.case === "secret-cookie");
  assert.ok(captures.every(item => item.protectedCookiePresent === false),
    "Protected ambient cookie reached the receiver");
  if (receipt.outcome === "denied") assert.equal(captures.length, 0);
  else { assert.equal(receipt.reason, "same_origin"); fixture.assertCaptured("secret-cookie"); }
  record("secret-cookie", { receipt, receiverCount: captures.length, protectedCookiePresent: false });
}
async function approved(name, destination = "recipient") {
  const start = await click(name);
  await until(`${name} waiting for recipient review`, async () => (await rpc("runs.get", { runId })).run.status === "needs_input");
  fixture.assertNoCapture(name);
  console.log(`In Aux, review and Allow once for this disposable request from ${fixture.origins.source} to ${fixture.origins[destination]}.`);
  await until(`${name} reaches its exact receiver after approval`, () => fixture.count(name) === 1, 180_000);
  const receipt = await until(`${name} final-header send admission`, () => receiptSince(start, "admitted", /authorized_recipient/, "send"));
  fixture.assertCaptured(name, destination);
  record(name, { receipt, receiverCount: 1 });
}
try {
  report.binarySha256 = await digestFile(binary); report.runtimeHelperSha256 = await digestFile(helper);
  let tls;
  if (group === "credentials") {
    const key = join(disposable, "fixture-key.pem"), cert = join(disposable, "fixture-cert.pem");
    execFileSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", key, "-out", cert,
      "-days", "1", "-subj", "/CN=127.0.0.1", "-addext", "subjectAltName=IP:127.0.0.1"], { stdio: "ignore" });
    tls = { key: readFileSync(key), cert: readFileSync(cert) };
    report.disposableTls = "Self-signed loopback only; launched process ignores certificate errors for this fixture";
  }
  fixture = await createEgressFixture({ tls });
  modelServer = createServer(async (request, response) => {
    if (request.url !== "/v1/chat/completions" || request.method !== "POST") { response.writeHead(404).end(); return; }
    let text = "";
    for await (const bytes of request) { text += bytes; if (text.length > 2_000_000) { response.writeHead(413).end(); return; } }
    try {
      const payload = JSON.parse(text);
      assert.ok(payload.tools?.some(tool => ["repl", "goal_program"].includes(tool.function?.name)),
        "Real agent-loop page program request required");
      report.modelCalls++; pendingModel.push({ response, payload }); modelWaiters.add(response);
      response.on("close", () => modelWaiters.delete(response)); flushModel();
    } catch { response.writeHead(400).end("Expected local scripted tool request"); }
  });
  await new Promise(resolveListen => modelServer.listen(0, "127.0.0.1", resolveListen));
  child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
    "--use-mock-keychain", "--password-store=basic", "--enable-logging=stderr", "--v=0", "--no-proxy-server",
    ...(tls ? ["--ignore-certificate-errors"] : [])], {
    cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0", AUX_RUN_ENGINE: "agent-loop", AUX_EGRESS_DIAGNOSTIC: "1" }, stdio: ["ignore", "ignore", "pipe"],
  });
  child.stderr.on("data", bytes => {
    stderrLine += bytes;
    const lines = stderrLine.split("\n"); stderrLine = lines.pop().slice(-8192);
    for (const line of lines) {
      if (line.includes("AUX_EGRESS_SCHEMA")) report.schemaDiagnostic = line.slice(0, 500);
      if (line.includes("AUX_ISOLATION_DIAG")) (report.isolationDiagnostics ??= []).push(line.slice(0, 500));
      const match = /AUX_EGRESS id=(\S+) kind=(\S+) phase=(\S+) outcome=(\S+) reason=(\S+)/.exec(line);
      if (match && report.nativeReceipts.length < 256) report.nativeReceipts.push({ id: match[1], kind: match[2], phase: match[3], outcome: match[4], reason: match[5], at: Date.now() });
    }
  });
  const runtimeFile = join(profile, "Default/Aux Runtime Data/runtime.json");
  await until("authenticated native runtime", async () => {
    if (!existsSync(runtimeFile)) return false;
    assert.equal(statSync(runtimeFile).mode & 0o077, 0);
    let connection; try { connection = JSON.parse(readFileSync(runtimeFile, "utf8")); } catch { return false; }
    port = connection.port; bearer = connection.token;
    return Number.isInteger(port) && bearer && (await rpc("workspace.get").catch(() => null))?.sessions?.some(session => session.sessionId === "aux" && session.status === "connected");
  }, 60_000);
  assert.ok(!existsSync(join(profile, "DevToolsActivePort")), "No public CDP endpoint is allowed");
  await rpc("settings.set", { modelProvider: "openai-compatible", compatibleEndpoint: `http://127.0.0.1:${modelServer.address().port}/v1`,
    plannerModel: "aux-egress-fixture", effectGrants: ["effect:read", "effect:write", "effect:egress"],
    originPolicies: Object.values(fixture.origins).map(origin => ({ origin: `${origin}/`, access: "allow", confirmation: "none" })),
    safetyCeilings: { write: "always" } });
  if (group === "credentials") {
    await rpc("pages.open", { url: `${fixture.origins.source}/login`, activate: true });
    console.log(`In this disposable Profile only, sign in with ${fixture.credential.username} / ${fixture.credential.password}, then save it in the native password offer. No real account is used.`);
    await until("disposable password submitted", () => fixture.credentialSeeded(), 180_000);
    console.log("Save the native password offer before allowing the later saved-password fill. The next tab is a fresh document.");
    await delay(3000);
  }
  if (group === "credentials") await startSelectedDocumentRun();
  // The scoped 0121 patch still controls a selected ordinary tab. Each
  // independent request case gets a fresh run/document because a browser
  // click's write ledger can correctly remain uncertain after dispatch.
  if (group === "requests" && option("--case") === "worker-control") {
    const page = await rpc("pages.open", { url: fixture.url, activate: true });
    await until("ordinary worker control loaded", async () => (await rpc("pages.list")).some(item => item.pageId === page.pageId && !item.loading));
    console.log("Click worker-secret in the visible disposable Aux page for the ordinary owner control.");
    await until("ordinary worker reaches receiver", () => fixture.count("worker-secret") === 1, 120_000);
    report.workerDiagnostic = { scriptLoads: fixture.scriptLoads(), states: fixture.workerStates(), captures: fixture.snapshot() };
    record("ordinary worker control", report.workerDiagnostic);
  } else if (group === "requests" && option("--case") === "secret-cookie") {
    await cookieBoundary();
  } else if (group === "requests" && option("--case") === "worker-secret") {
    const start = await click("worker-secret");
    await until("worker script request", () => fixture.scriptLoads().length);
    await delay(3000);
    report.workerDiagnostic = { scriptLoads: fixture.scriptLoads(), states: fixture.workerStates(), receipts: report.nativeReceipts.slice(start), captures: fixture.snapshot(), run: (await rpc("runs.get", { runId })).run.status };
    assert.ok(report.workerDiagnostic.receipts.some(item => item.outcome === "denied" && /protected_overlap|ambiguous/.test(item.reason)),
      "Worker loaded, but no native denial proved its outbound request was intercepted");
    fixture.assertNoCapture("worker-secret");
    record("worker-secret", report.workerDiagnostic);
  } else if (group === "requests") {
    const sameStart = await click("same-origin");
    await until("same-origin capture", () => {
      const denied = receiptSince(sameStart, "denied");
      if (denied) throw new Error(`Native refused same-origin control: ${denied.reason}`);
      return fixture.count("same-origin") === 1;
    });
    fixture.assertCaptured("same-origin");
    record("same-origin", { receipt: await until("same-origin final send", () => receiptSince(sameStart, "admitted", /same_origin/, "send")), receiverCount: 1 });
    for (const name of ["secret-url", "secret-body", "secret-same-origin", "secret-header", "subresource-secret", "redirect-secret"])
      await blocked(name, /protected_overlap/);
    await cookieBoundary();
    for (const name of ["worker-secret", "service-worker-secret"]) await blocked(name, /protected_overlap|ambiguous/);
    await blocked("opaque-upload", /incomplete_projection|uninspectable_transport/);
    for (const name of ["websocket-protected", "webtransport-protected", "webrtc-protected"])
      await blocked(name, /uninspectable_transport|ambiguous_provenance/);
    await approved("public-recipient");
    await approved("page-content");
    await approved("redirect-public");
    // Review substitution independently: a prior destination's approval cannot carry.
    const substitutionStart = await click("recipient-substitution");
    await until("substitution needs a fresh review", async () => {
      const current = await rpc("runs.get", { runId });
      return current.run.status === "needs_input" && current.run.statusMessage?.includes(fixture.origins.substitution);
    });
    fixture.assertNoCapture("recipient-substitution");
    console.log("Decline the disposable recipient-substitution request in Aux.");
    const substitutionReceipt = await until("substitution native refusal", () => receiptSince(substitutionStart, "denied", /approval_declined/), 180_000);
    fixture.assertNoCapture("recipient-substitution"); record("recipient-substitution", { receipt: substitutionReceipt, receiverCount: 0 });
    const cancelStart = await click("cancelled-request");
    await until("pending request before cancellation", async () => (await rpc("runs.get", { runId })).run.status === "needs_input");
    await rpc("runs.cancel", { runId });
    const cancelReceipt = await until("native cancellation receipt", () => receiptSince(cancelStart, "denied", /authority_revoked/));
    await delay(1500); fixture.assertNoCapture("cancelled-request"); fixture.assertNoCapture("late-after-cancel");
    const tombstoneReceipt = await until("late request hits denied document tombstone", () => receiptSince(cancelStart, "denied", /ambiguous_or_stale_document/));
    record("cancel drains waiting native decision and blocks a later request", { receipt: cancelReceipt, tombstoneReceipt, receiverCount: 0 });
    const ordinary = await rpc("pages.open", { url: fixture.url, activate: false });
    const opened = await rpc("pages.execute", { program: { pageId: ordinary.pageId,
      steps: [{ id: "existing-opaque-control", op: "click", target: "css:#websocket-existing" }] } });
    assert.equal(opened.status, "completed");
    await until("owner WebSocket positive control", () => fixture.count("websocket-existing") === 1);
    fixture.assertCaptured("websocket-existing");
    const opaqueRun = await rpc("runs.start", { goal: "Refuse a document with a preexisting opaque transport.", pageId: ordinary.pageId, maxSteps: 1 });
    const opaqueRefusal = await until("native preexisting transport refusal", async () => { const next = await rpc("runs.get", { runId: opaqueRun.runId }); return next.run.status === "failed" ? next : null; });
    assert.match(opaqueRefusal.run.error ?? "", /existing uninspectable transport/); assert.equal(opaqueRefusal.modelCalls, 0);
    record("owner WebSocket works; agent admission refuses the preexisting connection", { receiverCount: 1, modelCalls: 0 });
  } else {
    await rpc("pages.activate", { pageId: controlledPageId });
    console.log("Review and approve the native saved-password fill for the generated disposable account. Return control if the native page says you are in control.");
    await command("page.fillCredential('#password', '#username');");
    const credentialStart = await click("credential-submit");
    await until("intended-origin filled credential submission", () => fixture.snapshot().some(capture => capture.case === "credential-submit" && capture.validCredential), 180_000);
    fixture.assertCaptured("credential-submit");
    record("native saved password stays native and submits to intended origin", { receipt: await until("credential send admission", () => receiptSince(credentialStart, "admitted", /same_origin/, "send")), receiverCount: 1 });
    await blocked("credential-exfil", /protected_credential/);
    await rpc("runs.cancel", { runId });
    const second = await rpc("runs.start", { goal: "Same-document saved credential must refuse the next run before model dispatch.", pageId: controlledPageId, maxSteps: 1 });
    const refused = await until("second-run native credential refusal", async () => { const next = await rpc("runs.get", { runId: second.runId }); return next.run.status === "failed" ? next : null; });
    assert.match(refused.run.error ?? "", /credentials from an earlier run/);
    assert.equal(refused.modelCalls, 0); fixture.assertNoCapture("credential-exfil");
    record("same saved-credential document refuses a later run", { runId: second.runId, modelCalls: 0 });
  }
  report.passed = true;
} catch (error) {
  // Keep fixture specimens, request bytes and model prompts out of durable artifacts.
  let message = String(error);
  for (const value of [bearer, fixture?.secret, fixture?.credential.password].filter(Boolean)) message = message.replaceAll(value, "[redacted]");
  report.steps.push({ name: "terminal failure", passed: false, detail: message }); process.exitCode = 1;
  if (runId && bearer) {
    const state = await rpc("runs.get", { runId }).catch(() => null);
    report.runDiagnostic = state ? { status: state.run?.status, error: state.run?.error,
      statusMessage: state.run?.statusMessage,
      steps: JSON.stringify(state.steps ?? []).slice(0, 6000)
        .replaceAll(fixture?.secret ?? "\u0000", "[redacted]")
        .replaceAll(fixture?.credential.password ?? "\u0000", "[redacted]"),
      transcript: JSON.stringify(state.transcript ?? []).slice(0, 6000)
        .replaceAll(fixture?.secret ?? "\u0000", "[redacted]")
        .replaceAll(fixture?.credential.password ?? "\u0000", "[redacted]") } : null;
  }
} finally {
  if (runId && bearer) await rpc("runs.cancel", { runId }).catch(() => {});
  report.captures = fixture?.snapshot() ?? []; report.completedAt = new Date().toISOString();
  writeFileSync(join(output, "manifest.json"), `${JSON.stringify(report, null, 2)}\n`);
  if (child && child.exitCode === null) { child.kill("SIGTERM"); await Promise.race([new Promise(done => child.once("exit", done)), delay(5000)]); if (child.exitCode === null) child.kill("SIGKILL"); }
  child?.stderr.destroy(); for (const response of modelWaiters) response.destroy();
  if (modelServer) { modelServer.closeAllConnections(); await new Promise(done => modelServer.close(done)); }
  await fixture?.close(); bearer = undefined; rmSync(disposable, { recursive: true, force: true });
  console.log(`Scoped native EGRESS ${group} ${report.passed ? "passed" : "failed"}; evidence: ${output}`);
}
