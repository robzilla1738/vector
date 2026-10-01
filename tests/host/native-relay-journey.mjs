/** Focused fixed-partition journey. Requires native receipts; labels alone never pass. */
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { spawn, execFileSync } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { createRelayFixture, relayKinds } from "./native-relay-fixture.mjs";

const option = name => { const index = process.argv.indexOf(name); return index < 0 ? undefined : process.argv[index + 1]; };
const command = "node tests/host/native-relay-journey.mjs --app /absolute/Aux.app --native-patch /absolute/isolation.patch --output /absolute/new/evidence [--group all|relays|autofill|lifecycle|source-race]";
if (process.argv.includes("--describe")) {
  console.log(JSON.stringify({ command, scope: "Fresh native per-run fixed partition, URL-only source authority, relay denial and cleanup",
    operator: "Create two disposable task-scoped Codex connections in Aux and save the one-time tokens to the printed temporary paths. Approve only printed public recipient controls. Autofill group also saves one generated disposable password.",
    noModelCalls: true, nativeReceiptRequired: "AUX_ISOLATION event=<enum> profile=<id> run=<id> page=<id> isolation=<opaque> process=<int> document=<opaque> partition=memory-fixed|default reason=<enum>",
    exclusions: ["cookie transfer", "universal covert-channel confinement", "signed packaging"],
    passRule: "Real positive relay control, completed negative attempt, native fixed-partition identity and zero receiver capture. Missing receipts or an unobserved source race fail." }, null, 2));
  process.exit(0);
}
assert.equal(process.platform, "darwin", "Native Aux journey requires macOS");
const group = option("--group") ?? "all";
assert.ok(["all", "relays", "autofill", "lifecycle", "source-race"].includes(group));
const selected = name => group === "all" || group === name;
const appArg = option("--app"), patchArg = option("--native-patch"), outputArg = option("--output");
assert.ok([appArg, patchArg, outputArg].every(value => value && isAbsolute(value)), "Absolute app/patch/new output paths required");
const app = realpathSync(appArg), patch = realpathSync(patchArg), output = resolve(outputArg);
assert.ok(!existsSync(output), "Never overwrite evidence"); mkdirSync(output, { recursive: true });
const root = resolve(import.meta.dirname, "../.."), disposable = mkdtempSync("/tmp/aux-relay-native-");
const profile = join(disposable, "profile"), binary = join(app, "Contents/MacOS/Aux");
const windowTool = join(disposable, "native-window");
const helper = join(app, "Contents/Helpers/Aux Runtime"), runtimeFile = join(profile, "Default/Aux Runtime Data/runtime.json");
const nativeHeader = readFileSync(resolve(app, "../../../chrome/browser/ui/aux/generated/aux_host_methods.h"), "utf8");
const nativeSourceCommit = nativeHeader.match(/kSourceCommit = "([a-f0-9]{40})"/)?.[1];
const nativeManifestHash = nativeHeader.match(/kManifestHash = "([a-f0-9]{64})"/)?.[1];
assert.ok(nativeSourceCommit, "Native generated source identity is required");
assert.ok(nativeManifestHash, "Native generated manifest hash required");
const report = { schema: 1, group, scope: "Relay isolation scoped journey; full EGRESS qualification requires the other request-path gates",
  harnessSourceSha: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(), nativeSourceCommit, nativeManifestHash,
  nativeHeaderSha256: createHash("sha256").update(nativeHeader).digest("hex"),
  nativePatchSha256: createHash("sha256").update(readFileSync(patch)).digest("hex"),
  startedAt: new Date().toISOString(), steps: [], receipts: [], requestReceipts: [], captures: [], modelCalls: 0, passed: false };
let child, fixture, bearer, port, boot = 0;
const sessions = [];
const hashFile = async path => { const hash = createHash("sha256"); for await (const bytes of createReadStream(path)) hash.update(bytes); return hash.digest("hex"); };
async function hashRuntimeBundle() {
  const bundle = join(app, "Contents/Resources/aux-runtime"), hash = createHash("sha256");
  let files = 0;
  async function visit(relative = "") {
    for (const entry of readdirSync(join(bundle, relative), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(relative, entry.name);
      assert.ok(!entry.isSymbolicLink(), "Runtime artifact identity requires a staged bundle, not source symlinks");
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) { assert.ok(++files <= 50_000, "Runtime bundle file bound"); hash.update(`${path}\0${await hashFile(join(bundle, path))}\n`); }
    }
  }
  await visit(); return { sha256: hash.digest("hex"), files };
}
const record = (name, detail = {}) => { report.steps.push({ name, detail, passed: true }); console.log(`PASS ${name}`); };
async function until(label, check, timeout = 30_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    assert.ok(!report.receiptOverflow, "Native receipt bound exceeded; evidence is incomplete");
    if (child && (child.exitCode !== null || child.signalCode !== null)) throw new Error(`Aux exited during ${label}`);
    const value = await check(); if (value) return value;
    await delay(100);
  }
  throw new Error(`Timed out: ${label}`);
}
async function rpc(method, params = {}, token = bearer) {
  const response = await fetch(`http://127.0.0.1:${port}/rpc`, { method: "POST", headers: {
    "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({ id: randomUUID(), method, params }), signal: AbortSignal.timeout(240_000) });
  const value = await response.json();
  if (value.error) {
    const detail = value.error.detail ? ` ${JSON.stringify(value.error.detail)}` : "";
    throw new Error(`${method}: ${value.error.code}: ${value.error.message}${detail}`);
  }
  return value.result;
}
async function stop() {
  if (!child) return;
  const previous = child; child = undefined;
  if (previous.exitCode === null && previous.signalCode === null) {
    previous.kill("SIGTERM"); await Promise.race([new Promise(resolveExit => previous.once("exit", resolveExit)), delay(5000)]);
    if (previous.exitCode === null && previous.signalCode === null) { previous.kill("SIGKILL"); await new Promise(resolveExit => previous.once("exit", resolveExit)); }
  }
  previous.stderr.destroy(); bearer = undefined;
}
async function launch() {
  boot++; let buffered = "";
  child = spawn(binary, [`--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check", "--use-mock-keychain",
    "--password-store=basic", "--enable-logging=stderr", "--v=0", "--no-proxy-server", "--ignore-certificate-errors"],
  { cwd: disposable, env: { ...process.env, AUX_LOAD_DOTENV: "0" }, stdio: ["ignore", "ignore", "pipe"] });
  child.stderr.on("data", bytes => {
    buffered += bytes; const lines = buffered.split("\n"); buffered = lines.pop().slice(-8192);
    for (const line of lines) {
      const request = /AUX_EGRESS id=(\S+) kind=(\S+) phase=(\S+) outcome=(\S+) reason=(\S+)/.exec(line);
      if (request) {
        if (report.requestReceipts.length >= 512) report.receiptOverflow = true;
        else report.requestReceipts.push({ id: request[1], kind: request[2], phase: request[3], outcome: request[4], reason: request[5], boot, at: Date.now() });
      }
      const match = /AUX_ISOLATION event=(\w+) profile=([\w:-]+) run=([\w:-]+) page=([\w:-]+) isolation=([\w:-]+) process=(-?\d+) document=([\w:-]+) partition=(memory-fixed|default) reason=([\w:-]+)/.exec(line);
      if (match) {
        if (report.receipts.length >= 512) report.receiptOverflow = true;
        else report.receipts.push({ event: match[1], profile: match[2], run: match[3], page: match[4], isolation: match[5], process: Number(match[6]), document: match[7], partition: match[8], reason: match[9], boot, at: Date.now() });
      }
    }
  });
  await until("authenticated native runtime", async () => {
    if (!existsSync(runtimeFile)) return false;
    assert.equal(statSync(runtimeFile).mode & 0o077, 0);
    let value; try { value = JSON.parse(readFileSync(runtimeFile, "utf8")); } catch { return false; }
    port = value.port; bearer = value.token;
    return Number.isInteger(port) && bearer && (await rpc("workspace.get").catch(() => null))?.sessions?.some(session => session.sessionId === "aux" && session.status === "connected");
  }, 60_000);
  assert.ok(!existsSync(join(profile, "DevToolsActivePort")), "No public CDP endpoint");
}
const receipt = (page, event = "context", since = 0) => report.receipts.slice(since).find(item => item.boot === boot && item.event === event && item.page === page.pageId && item.run === page.agentIsolation?.runId && item.isolation === page.agentIsolation?.isolationId && item.partition === "memory-fixed");
async function observation(pageId) { return JSON.stringify(await rpc("pages.observe", { pageId })); }
async function refreshTaskRevision(session) {
  if (!session) return;
  const details = await rpc("tasks.get", { taskId: session.task.taskId }, session.token);
  const revision = details?.task?.revision ?? details?.revision;
  if (Number.isInteger(revision)) session.task.revision = revision;
}
async function execute(pageId, steps, session) {
  let last;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await refreshTaskRevision(session).catch(error => console.log(`task revision refresh ${error instanceof Error ? error.message : error}`));
    try {
      const value = await rpc("pages.execute", { program: { pageId, steps }, ...(session ? { taskId: session.task.taskId, expectedRevision: session.task.revision } : {}) }, session?.token ?? bearer);
      assert.equal(value.status, "completed", `Program did not complete: ${JSON.stringify(value.steps?.map(step => ({ op: step.op, status: step.status, error: step.error?.code })))}`);
      return value;
    } catch (error) {
      last = error;
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("conflict") || attempt === 2) throw error;
      let controller = "unknown";
      try { controller = (await rpc("pages.list")).find(item => item.pageId === pageId)?.controller ?? "missing"; }
      catch { /* The page list is diagnostic only. */ }
      console.log(`pages.execute conflict attempt ${attempt + 1} controller ${controller} revision ${session?.task?.revision ?? "none"}`);
      if (controller === "human") await rpc("pages.resume", { pageId }).catch(reason => console.log(`resume ${reason instanceof Error ? reason.message : reason}`));
      await delay(700);
    }
  }
  throw last;
}
async function action(pageId, name, id, session) {
  await execute(pageId, [{ id: "case", op: "fill", target: "css:#case", value: id },
    { id: "act", op: "click", target: `css:#${name}` },
    { id: "finish", op: "waitFor", condition: { kind: "textVisible", text: `Finished ${id}`, timeoutMs: 180_000 } }], session);
}
function native(action, ...args) {
  return execFileSync(windowTool, [action, String(child.pid), ...args.map(String)], { encoding: "utf8", timeout: 20_000 }).trim();
}
function relayButtons() {
  try { return JSON.parse(native("buttons")); } catch { return []; }
}
function clickLabel(label) {
  try {
    const hit = JSON.parse(native("click-button", label));
    console.log(`click ${label} ${hit.x},${hit.y}`);
    return true;
  } catch { /* A named control may still be a small non-button. */ }
  let frame = null;
  try { frame = JSON.parse(native("frame-name", label)); } catch { frame = null; }
  if (!frame || frame.height > 80 || frame.width > 640) {
    console.log(`click ${label} refused ${frame ? `${frame.width}x${frame.height}` : "miss"}`);
    return false;
  }
  native("click-at", String(frame.x), String(frame.y));
  console.log(`click ${label} ${frame.x},${frame.y} ${frame.width}x${frame.height}`);
  return true;
}
async function dismissRelayWelcome() {
  const finish = () => { try { return native("has-name", "Finish later") === "true"; } catch { return false; } };
  const welcome = () => { try { return native("has-name", "A browser for what comes next") === "true"; } catch { return false; } };
  const deadline = Date.now() + 2_500;
  while (Date.now() < deadline && !welcome() && !finish()) await delay(200);
  if (!finish()) return;
  native("activate");
  clickLabel("Finish later");
  await until("setup dismissed", () => !finish() && !welcome(), 8_000);
}
async function openAgentsSettings() {
  await dismissRelayWelcome();
  native("activate");
  const agentsUrl = "chrome://aux/settings/developers-external-agents";
  const shell = () => { try { return native("shell-url"); } catch { return ""; } };
  if (shell() !== agentsUrl) {
    const revealed = Date.now() + 12_000;
    while (Date.now() < revealed && !shell().startsWith("chrome://aux/settings/")) {
      const labels = relayButtons();
      if (labels.includes("Show sidebar") || labels.some(label => String(label).startsWith("Switch space"))) break;
      await delay(250);
    }
    if (!shell().startsWith("chrome://aux/settings/") && relayButtons().includes("Show sidebar")) {
      clickLabel("Show sidebar");
      const sidebar = Date.now() + 8_000;
      while (Date.now() < sidebar && !relayButtons().some(label => String(label).startsWith("Switch space"))) await delay(200);
    }
    if (!shell().startsWith("chrome://aux/settings/")) {
      const space = relayButtons().find(label => String(label).startsWith("Switch space"));
      if (space) {
        clickLabel(space);
        await delay(300);
        clickLabel("Settings");
      }
    }
    const opened = Date.now() + 10_000;
    while (Date.now() < opened && !shell().startsWith("chrome://aux/settings/")) await delay(200);
    if (!shell().includes("developers-external-agents")) {
      if (!clickLabel("Developers & External Agents")) throw new Error(`Agents settings was not clickable from ${shell()}; buttons ${relayButtons().slice(0, 16).join(" | ")}`);
    }
  }
  await until("create connection control", () => {
    try { return native("has-name", "Create scoped connection") === "true"; } catch { return false; }
  }, 15_000);
}
async function chooseOption(label, option) {
  let current = "";
  try { current = native("control-value", label); } catch { current = ""; }
  if (current === option) return;
  if (!clickLabel(label)) throw new Error(`Cannot open ${label}`);
  await delay(350);
  if (!clickLabel(option)) throw new Error(`Cannot choose ${option} from ${label}`);
  await delay(300);
}
function readOnceToken() {
  let text = "";
  try { text = native("control-value", "Agent configuration"); } catch { text = ""; }
  return text.match(/auxc_[A-Za-z0-9_-]{40,80}/)?.[0] ?? "";
}
async function captureScopedConnection(label, taskTitle, workspaceName, path) {
  await openAgentsSettings();
  // The agents page loads its task list on mount. Leave and return so a task
  // created after that mount is actually in the menu.
  if (native("has-name", "General") === "true") clickLabel("General");
  await delay(400);
  if (!clickLabel("Developers & External Agents")) throw new Error("Could not reopen Developers & External Agents");
  await until("agents list refreshed", () => native("has-name", "Create scoped connection") === "true", 15_000);
  await chooseOption("Connection workspace", workspaceName);
  await chooseOption("Connection scope", "One task");
  await chooseOption("Connection task", taskTitle);
  if (native("button-enabled", "Create scoped connection") !== "true") throw new Error(`Create scoped connection stayed disabled for ${taskTitle}`);
  if (!clickLabel("Create scoped connection")) throw new Error("Create scoped connection was not clickable");
  const token = await until(`one-time connection token ${label}`, () => readOnceToken() || null, 20_000);
  writeFileSync(path, `${token}\n`, { mode: 0o600 });
  console.log(`saved one-time connection token ${label}`);
}
async function newSession(label, ownerPageId, workspaceId, workspaceName) {
  const task = await rpc("tasks.create", { workspaceId, title: `Isolation ${label}`, objective: "Exercise disposable isolation fixture only",
    criteria: [{ criterionId: "isolation", description: "Native isolation journey", verification: "manual" }],
    resources: [{ resourceId: "source", kind: "page", locator: ownerPageId, label: "Disposable owner source" }] });
  const path = join(disposable, `connection-${label}.txt`);
  await captureScopedConnection(label, `Isolation ${label}`, workspaceName, path);
  const token = readFileSync(path, "utf8").trim(); rmSync(path, { force: true });
  assert.match(token, /^auxc_[A-Za-z0-9_-]{40,80}$/);
  const session = { task, token, turnId: randomUUID() }; sessions.push(session); return session;
}
async function controlled(session, path = "actor") {
  await refreshTaskRevision(session).catch(error => console.log(`turn revision refresh ${error instanceof Error ? error.message : error}`));
  const page = await rpc("agent.turn.open", { taskId: session.task.taskId, expectedRevision: session.task.revision,
    turnId: session.turnId, url: fixture.url(path), skipIfActive: false }, session.token);
  assert.ok(page.agentIsolation?.isolationId && page.agentIsolation.inMemory && page.agentIsolation.cookies === "empty", "Native controlled identity required");
  assert.equal(page.agentIsolation.taskId, session.task.taskId); assert.equal(page.agentIsolation.taskRevision, session.task.revision);
  const created = await until("native fixed-partition creation receipt", () => receipt(page, "created"));
  assert.ok(created.process > 0 && created.document !== "none", "Browser-owned process/document proof required");
  await until("real relay endpoints ready", async () => (await observation(page.pageId)).includes("Relay endpoints ready"));
  return page;
}
try {
  report.binarySha256 = await hashFile(binary); report.runtimeHelperSha256 = await hashFile(helper);
  report.runtimeBundle = await hashRuntimeBundle();
  const key = join(disposable, "key.pem"), cert = join(disposable, "cert.pem");
  execFileSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", key, "-out", cert,
    "-days", "1", "-subj", "/CN=127.0.0.1", "-addext", "subjectAltName=IP:127.0.0.1"], { stdio: "ignore" });
  fixture = await createRelayFixture({ tls: { key: readFileSync(key), cert: readFileSync(cert) } });
  report.disposableTls = "Self-signed loopback fixture only; certificate checks disabled only in this disposable launched process";
  execFileSync("xcrun", ["swiftc", join(root, "tests/host/native-window.swift"), "-o", windowTool], { timeout: 120_000 });
  await launch();
  await rpc("settings.set", { effectGrants: ["effect:read", "effect:write", "effect:egress"],
    originPolicies: Object.values(fixture.origins).map(origin => ({ origin: `${origin}/`, access: "allow", confirmation: "none" })), safetyCeilings: { write: "always" } });
  const owner = await rpc("pages.open", { url: fixture.url("actor"), activate: true });
  await until("owner endpoints ready", async () => (await observation(owner.pageId)).includes("Relay endpoints ready"));
  await action(owner.pageId, "open-receiver", "open-owner-receiver");
  const receiver = await until("related owner receiver window", async () => (await rpc("pages.list")).find(page => page.pageId !== owner.pageId && page.url === fixture.url("receiver")));
  await until("owner receiver endpoints ready", async () => (await observation(receiver.pageId)).includes("Relay endpoints ready"));
  await action(owner.pageId, "seed-owner", "seed-owner");
  const workspaceName = "Disposable native isolation journey";
  const workspace = await rpc("workspaces.create", { name: workspaceName });
  const first = await newSession("A", owner.pageId, workspace.workspaceId, workspaceName);
  const second = await newSession("B", owner.pageId, workspace.workspaceId, workspaceName);
  if (selected("autofill")) {
    await rpc("pages.activate", { pageId: owner.pageId });
    console.log(`In the disposable owner tab only, sign in using ${fixture.credential.username} / ${fixture.credential.password}, then save it in Chromium's native password offer.`);
    await until("generated disposable login submitted", () => fixture.seeded(), 240_000);
    console.log("Save the native offer, then click autofill-probe on a newly reopened ordinary fixture tab when prompted.");
    const passwordControl = await rpc("pages.open", { url: fixture.url("actor"), activate: true });
    await action(passwordControl.pageId, "autofill-probe", "owner-autofill");
    await until("ordinary saved-password automatic fill positive control", () => fixture.count("owner-autofill") === 1, 180_000);
    fixture.assertCount("owner-autofill", 1, "recipient"); record("ordinary Profile saved-password autofill positive control", { receiverCount: 1 });
  }
  const pageA = await controlled(first), pageB = await controlled(second);
  assert.notEqual(pageA.agentIsolation.isolationId, pageB.agentIsolation.isolationId);
  assert.equal(receipt(pageA, "created").profile, receipt(pageB, "created").profile, "Isolation must be demonstrated within one native Profile");
  assert.notEqual(receipt(pageA, "created").process, receipt(pageB, "created").process, "Different partitions need distinct renderer processes");
  for (const [session, page] of [[first, pageA], [second, pageB]]) {
    await action(page.pageId, "inspect-storage", `empty-${session === first ? "a" : "b"}`, session);
    assert.ok((await observation(page.pageId)).includes("Storage owner=false run=false cookie=false opener=false session=false"));
  }
  record("native isolated runs start without owner cookies/storage/opener", { pages: [pageA.pageId, pageB.pageId], isolations: [pageA.agentIsolation.isolationId, pageB.agentIsolation.isolationId] });
  await assert.rejects(execute(owner.pageId, [{ id: "forbidden-owner", op: "click", target: "css:button#seed-run" }], first), /protected temporary tab/);
  record("scoped direct action refuses ordinary owner source");
  if (selected("relays")) {
    for (const kind of relayKinds) {
      const positive = `owner-${kind}`, negative = `isolated-${kind}`;
      await action(owner.pageId, kind, positive);
      await until(`${kind} owner positive capture`, () => fixture.count(positive) === 1); fixture.assertCount(positive, 1, "recipient");
      const start = report.receipts.length;
      await action(pageA.pageId, kind, negative, first);
      const context = await until(`${kind} native fixed context`, () => receipt(pageA, "context", start));
      await delay(1200); fixture.assertCount(negative, 0);
      record(`${kind} cannot relay to same-Profile owner receiver`, { positiveCount: 1, protectedCount: 0, context });
    }
    const sameStart = report.requestReceipts.length;
    await action(pageA.pageId, "same-origin", "isolated-same-origin", first); fixture.assertCount("isolated-same-origin", 1, "source");
    const sameReceipt = await until("actual same-origin final-header admission", () => report.requestReceipts.slice(sameStart).find(item => item.outcome === "admitted" && item.phase === "send" && item.reason === "same_origin"));
    const recipientStart = report.requestReceipts.length;
    const pending = action(pageA.pageId, "recipient", "isolated-recipient", first);
    pending.catch(() => {});
    await until("real waiting recipient approval", async () => (await rpc("runs.get", { runId: pageA.agentIsolation.runId })).run.status === "needs_input");
    fixture.assertCount("isolated-recipient", 0);
    await until("Allow this action", () => native("has-name", "Allow this action") === "true" && native("button-enabled", "Allow") === "true", 30_000);
    if (!clickLabel("Allow")) throw new Error("Allow was not clickable");
    await pending; fixture.assertCount("isolated-recipient", 1, "recipient");
    const recipientReceipt = await until("recipient final-header admission", () => report.requestReceipts.slice(recipientStart).find(item => item.outcome === "admitted" && item.phase === "send" && item.reason === "authorized_recipient"));
    record("safe same-origin and owner-reviewed exact recipient controls", { sameOriginCount: 1, recipientCount: 1, sameReceipt, recipientReceipt });
  }
  if (selected("autofill")) {
    const start = report.receipts.length;
    await action(pageA.pageId, "autofill-probe", "isolated-autofill", first);
    assert.ok((await observation(pageA.pageId)).includes("Automatic password present=false")); fixture.assertCount("isolated-autofill", 0);
    const refusal = await until("native saved-password autofill refusal", () => report.receipts.slice(start).find(item => item.page === pageA.pageId && item.reason === "automatic_password_fill_disabled")
      ?? report.receipts.find(item => item.page === pageA.pageId && item.reason === "automatic_password_fill_disabled"));
    record("saved owner password never automatically enters isolated page", { receiverCount: 0, refusal });
  }
  if (selected("source-race")) {
    const racing = await rpc("pages.open", { url: fixture.url("race"), activate: false });
    const saved = await rpc("programs.save", { name: "Disposable source identity race", steps: [{ id: "proof", op: "extract", fields: [{ name: "title", selector: "h1" }] }] });
    let refusal;
    for (let attempt = 0; attempt < 16 && !refusal; attempt++) {
      const { runId } = await rpc("programs.run", { programId: saved.programId, pageId: racing.pageId });
      const result = await until("bounded source race attempt ends", async () => { const value = await rpc("runs.get", { runId }); return ["failed", "completed"].includes(value.run.status) ? value : null; });
      const native = report.receipts.find(item => item.run === runId && item.event === "refused" && item.reason === "source_document_changed");
      if (native && result.run.status === "failed" && /changed|stale|source.*document/i.test(result.run.error ?? "")) {
        assert.ok(!report.receipts.some(item => item.run === runId && item.event === "created"), "Refused source must not create a controlled page");
        refusal = { runId, attempt: attempt + 1, native };
      }
      for (const pageId of result.run.pageIds) if (pageId !== racing.pageId) await rpc("pages.close", { pageId }).catch(() => {});
    }
    assert.ok(refusal, "No source identity race was observed; this is inconclusive, never a passing race gate");
    await rpc("pages.close", { pageId: racing.pageId }); record("source URL/token race refuses a controlled copy", refusal);
  }
  if (selected("lifecycle")) {
    await action(pageA.pageId, "seed-run", "seed-run", first);
    const beforeReload = report.receipts.filter(item => item.page === pageA.pageId && item.event === "context").at(-1);
    assert.ok(beforeReload, "Native pre-reload document identity required");
    const reloadStart = report.receipts.length;
    await execute(pageA.pageId, [{ id: "reload", op: "reload" }], first);
    await action(pageA.pageId, "inspect-storage", "after-reload", first);
    const afterReload = report.receipts.slice(reloadStart).filter(item => item.page === pageA.pageId && item.event === "context").at(-1);
    assert.ok(afterReload); assert.equal(afterReload.isolation, beforeReload.isolation); assert.notEqual(afterReload.document, beforeReload.document);
    assert.ok((await observation(pageA.pageId)).includes("Storage owner=false run=true cookie=false opener=false session=false"));
    await action(pageB.pageId, "inspect-storage", "other-run", second);
    assert.ok((await observation(pageB.pageId)).includes("Storage owner=false run=false cookie=false opener=false session=false"));
    await rpc("runs.cancel", { runId: pageA.agentIsolation.runId });
    await rpc("pages.close", { pageId: pageA.pageId });
    const released = await until("exact first native partition released", () => receipt(pageA, "released"));
    await action(pageB.pageId, "same-origin", "other-run-after-cleanup", second); fixture.assertCount("other-run-after-cleanup", 1, "source");
    await action(owner.pageId, "inspect-storage", "owner-after-cleanup");
    assert.ok((await observation(owner.pageId)).includes("Storage owner=true"));
    const old = [pageA.pageId, pageB.pageId]; await stop(); await launch();
    const restored = await rpc("pages.list");
    assert.ok(restored.every(page => !old.includes(page.pageId) || ["detached", "crashed"].includes(page.viewStatus)), "Old protected documents must not restore as default-partition tabs");
    const ownerAfterRestart = await rpc("pages.open", { url: fixture.url("actor"), activate: false });
    await action(ownerAfterRestart.pageId, "inspect-storage", "owner-after-restart");
    assert.ok((await observation(ownerAfterRestart.pageId)).includes("Storage owner=true run=false cookie=true"), "Owner durable storage and cookies must survive controlled cleanup/restart");
    const fresh = await controlled(first);
    assert.notEqual(fresh.agentIsolation.isolationId, pageA.agentIsolation.isolationId);
    await action(fresh.pageId, "inspect-storage", "fresh-after-restart", first);
    assert.ok((await observation(fresh.pageId)).includes("Storage owner=false run=false cookie=false opener=false session=false"));
    record("reload retains exact partition; cleanup spares owner/other run; restart gets empty fresh authority", { beforeReload, afterReload, released, oldPages: old, freshPage: fresh.pageId, freshIsolation: fresh.agentIsolation.isolationId });
  }
  assert.ok(!report.receiptOverflow, "Receipt truncation cannot qualify isolation");
  report.passed = true;
} catch (error) { report.error = error instanceof Error ? error.message : String(error); process.exitCode = 1; }
finally {
  for (const session of sessions) if (bearer) await rpc("agent.turn.end", { taskId: session.task.taskId, expectedRevision: session.task.revision, turnId: session.turnId }, session.token).catch(() => {});
  await stop(); report.captures = fixture?.snapshot() ?? []; report.completedAt = new Date().toISOString();
  writeFileSync(join(output, "manifest.json"), `${JSON.stringify(report, null, 2)}\n`);
  await fixture?.close(); for (const session of sessions) session.token = undefined;
  rmSync(disposable, { recursive: true, force: true });
  console.log(`Native relay ${group}: ${report.passed ? "passed" : "failed"}; evidence ${output}`);
}
