// Section 8 native Chromium UMA bench. Public CDP is enabled only in the
// disposable Aux benchmark flavor; the release GN flag remains false.
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { arch, release as osRelease } from "node:os";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { histogram, metric, oneObservation } from "./native-histograms.mjs";

const root = resolve(import.meta.dirname, "../..");
const firstPaintName = "Startup.BrowserWindow.FirstPaint";
const switchName = "Browser.Tabs.TotalSwitchDuration3";
const value = name => {
  const index = process.argv.indexOf(name);
  return index < 0 ? undefined : process.argv[index + 1];
};
if (process.argv.includes("--plan")) {
  console.log(JSON.stringify({
    command: "node tests/benchmarks/native-browser.mjs --aux-app /absolute/AuxBench/Aux.app --stock-app /absolute/StockBench/Chromium.app --aux-source /absolute/patched/src --stock-source /absolute/tagged/src [--trials 20] [--output /absolute/new/directory]",
    metrics: [firstPaintName, switchName],
    controls: "Same-tag Chromium source and matching critical GN args; Aux benchmark flavor requires aux_allow_remote_debugging_for_tests=true. A disposable Local State opt-in is written for this run only. Release defaults and signer are untouched.",
    limitations: "UMA startup measures Chromium FirstPaint, not Aux interaction readiness. Tab switch histogram is input-to-presented-frame; variants and stock/Aux target composition are retained in raw metadata. An OS hard-cold cache is not enforced.",
  }, null, 2));
  process.exit(0);
}
if (process.platform !== "darwin") throw new Error("Native macOS Aux and stock Chromium apps are required.");
const required = ["--aux-app", "--stock-app", "--aux-source", "--stock-source"];
for (const name of required) if (!value(name) || !isAbsolute(value(name))) throw new Error(`${name} requires an absolute path`);
const trials = Number(value("--trials") ?? 20);
if (!Number.isSafeInteger(trials) || trials < 20 || trials > 200) throw new Error("Use 20–200 trials per host and metric");
const output = resolve(value("--output") ?? join(root, "release/test-artifacts", `native-bench-${new Date().toISOString().replaceAll(/[:.]/g, "-")}`));
assert.ok(!existsSync(output), "Use a new output directory; existing benchmark data is never overwritten");
const { chromium } = createRequire(join(root, "packages/chromium-driver/package.json"))("playwright-core");

const command = (program, args, cwd, timeout = 15_000) =>
  execFileSync(program, args, { cwd, encoding: "utf8", timeout }).trim();
const git = (cwd, ...args) => command("git", args, cwd);
const plist = (app, key) => command("/usr/libexec/PlistBuddy", ["-c", `Print :${key}`, join(app, "Contents/Info.plist")]);
const sha256 = async path => {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
};
function gnArgs(text) {
  return Object.fromEntries(text.split("\n").flatMap(line => {
    const match = line.match(/^\s*([a-z][a-z0-9_]*)\s*=\s*([^#]+?)\s*(?:#.*)?$/);
    return match ? [[match[1], match[2].trim()]] : [];
  }));
}
async function buildMetadata(kind, appArg, sourceArg) {
  const app = resolve(appArg);
  const source = resolve(sourceArg);
  const executable = plist(app, "CFBundleExecutable");
  const binary = join(app, "Contents/MacOS", executable);
  const argsPath = join(dirname(app), "args.gn");
  assert.ok(existsSync(binary) && existsSync(argsPath), `${kind}: app binary and adjacent args.gn are required`);
  const argsText = readFileSync(argsPath, "utf8");
  const args = gnArgs(argsText);
  const revision = git(source, "rev-parse", "HEAD");
  assert.equal(git(source, "status", "--porcelain"), "", `${kind}: source checkout must be clean`);
  const version = readFileSync(join(source, "chrome/VERSION"), "utf8");
  return { kind, app, binary, source, revision, version, args, argsPath,
    argsSha256: createHash("sha256").update(argsText).digest("hex"),
    binarySha256: await sha256(binary), bundleId: plist(app, "CFBundleIdentifier"),
    bundleVersion: plist(app, "CFBundleShortVersionString"),
    executable, versionOutput: command(binary, ["--version"]) };
}

const aux = await buildMetadata("aux", value("--aux-app"), value("--aux-source"));
const stock = await buildMetadata("stock", value("--stock-app"), value("--stock-source"));
assert.equal(basename(aux.app), "Aux.app");
assert.equal(aux.bundleId, "dev.aux.browser");
assert.equal(aux.args.enable_aux_shell, "true", "Aux must have the real shell");
assert.equal(aux.args.aux_allow_remote_debugging_for_tests, "true", "Use only a benchmark Aux build with explicit test debugging");
assert.notEqual(stock.args.enable_aux_shell, "true", "Stock control cannot contain the Aux shell");
assert.notEqual(stock.args.aux_allow_remote_debugging_for_tests, "true", "Stock control should use standard Chromium debugging");
assert.equal(aux.version, stock.version, "Both apps must use the same Chromium VERSION");
const tag = git(stock.source, "describe", "--tags", "--exact-match", stock.revision);
assert.ok(tag, "Stock source must be at an exact Chromium tag");
assert.equal(git(aux.source, "merge-base", aux.revision, stock.revision), stock.revision,
  "Aux must descend from the exact stock control tag");
for (const key of ["target_cpu", "is_debug", "is_component_build", "is_official_build"]) {
  assert.equal(aux.args[key] ?? "<default>", stock.args[key] ?? "<default>", `${key} must match between builds`);
}
assert.equal(aux.args.is_debug, "false", "Use optimized non-debug builds");
assert.equal(aux.args.is_component_build, "false", "Use comparable static builds");
const power = command("pmset", ["-g", "batt"]);
assert.match(power, /Now drawing from 'AC Power'/, "Section 8 native qualification requires AC power");
mkdirSync(output, { recursive: true });
const helper = join(output, "native-window");
command("xcrun", ["swiftc", join(root, "tests/host/native-window.swift"), "-o", helper], undefined, 120_000);
const report = { schema: 1, status: "running", startedAt: new Date().toISOString(),
  method: { startup: firstPaintName, tabSwitch: switchName, units: "ms", trials,
    launchFlags: ["--remote-debugging-port=0", "--no-first-run", "--no-default-browser-check",
      "--use-mock-keychain", "--password-store=basic"],
    startupProfile: "fresh for every launch; OS file cache not flushed",
    tabSwitchInput: "Control-Tab via PID-scoped CoreGraphics, four warm-up switches, one UMA count delta per sample",
    tabSwitchOrder: ["aux", "stock"],
    debugging: "Aux test GN flag plus disposable Local State opt-in; never a release build",
    limitations: ["FirstPaint is not interactive-shell-ready time", "OS file cache and thermal state are not controlled",
      "Display refresh is recorded as unverified", "Source-to-binary provenance is declared by build paths and hashes, not a reproducible build attestation"] },
  machine: { platform: process.platform, arch: arch(), osRelease: osRelease(), model: command("sysctl", ["-n", "hw.model"]),
    power, refreshRate: "not verified by this harness" },
  sameTag: tag, builds: { aux, stock },
  raw: { aux: { startup: [], tabSwitch: [] }, stock: { startup: [], tabSwitch: [] } },
  summaries: {}, errors: [] };
let fixture;
let origin;

function seedBenchmarkPref(profile) {
  // Chromium's dotted Local State key devtools.remote_debugging.allowed.
  // The production Aux build still rejects remote debugging at compile time.
  writeFileSync(join(profile, "Local State"), JSON.stringify({ devtools: { remote_debugging: { allowed: true } } }), { mode: 0o600 });
}
async function until(label, check, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const result = await check();
    if (result) return result;
    await delay(50);
  }
  throw new Error(`Timed out waiting for ${label}`);
}
async function hist(session, name) {
  return histogram(await session.send("Browser.getHistograms", { query: name, delta: false }), name);
}
async function launch(build) {
  const profile = mkdtempSync("/tmp/aux-uma-bench-");
  if (build.kind === "aux") seedBenchmarkPref(profile);
  const child = spawn(build.binary, [`--user-data-dir=${profile}`, "--remote-debugging-port=0",
    "--no-first-run", "--no-default-browser-check", "--use-mock-keychain", "--password-store=basic"],
  { cwd: profile, env: { ...process.env, AUX_LOAD_DOTENV: "0" }, stdio: ["ignore", "ignore", "pipe"] });
  let stderr = "";
  child.stderr.on("data", chunk => { stderr = (stderr + String(chunk)).slice(-2000); });
  try {
    const port = await until(`${build.kind} DevToolsActivePort`, () => {
      if (child.exitCode !== null) throw new Error(`${build.kind} exited during launch: ${stderr}`);
      const file = join(profile, "DevToolsActivePort");
      if (!existsSync(file)) return null;
      const value = Number(readFileSync(file, "utf8").split("\n")[0]);
      return Number.isSafeInteger(value) && value > 0 ? value : null;
    });
    const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`, { timeout: 15_000 });
    const session = await browser.newBrowserCDPSession();
    return { profile, child, browser, session, stderr: () => stderr };
  } catch (error) {
    child.kill("SIGKILL");
    rmSync(profile, { recursive: true, force: true });
    throw error;
  }
}
async function close(run) {
  await run.browser.close().catch(() => {});
  if (run.child.exitCode === null) {
    run.child.kill("SIGTERM");
    await Promise.race([new Promise(resolveExit => run.child.once("exit", resolveExit)), delay(5000)]);
    if (run.child.exitCode === null) {
      run.child.kill("SIGKILL");
      await Promise.race([new Promise(resolveExit => run.child.once("exit", resolveExit)), delay(5000)]);
    }
  }
  rmSync(run.profile, { recursive: true, force: true });
}
async function startupTrial(build) {
  const run = await launch(build);
  try {
    const first = await until(`${build.kind} ${firstPaintName}`, async () => {
      const current = await hist(run.session, firstPaintName);
      return current.count >= 1 ? current : null;
    });
    return { durationMs: oneObservation({ count: 0, sum: 0 }, first, firstPaintName), histogram: first };
  } finally { await close(run); }
}
async function prepareTabs(run, build) {
  const urls = [`${origin}/red`, `${origin}/blue`];
  if (build.kind === "aux") {
    const shell = await until("Aux shell CDP target", () => run.browser.contexts()
      .flatMap(context => context.pages()).find(page => page.url().startsWith("chrome://aux/")));
    await shell.waitForFunction(() => typeof window.aux?.tabCommand === "function");
    for (const url of urls) {
      const ack = await shell.evaluate(target => window.aux.tabCommand({ kind: "open", url: target, activate: true }), url);
      assert.equal(ack.status, "applied", `Aux failed to open ${url}`);
    }
    await shell.waitForFunction(expected => expected.every(url => window.aux.tabsSnapshot().tabs.some(tab => tab.url === url && !tab.loading)), urls);
  } else {
    const context = run.browser.contexts()[0];
    assert.ok(context, "Stock Chromium has no browser context");
    const pages = [];
    for (const url of urls) {
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "load" });
      pages.push(page);
    }
    const ids = await Promise.all(pages.map(async page => {
      const session = await context.newCDPSession(page);
      const result = await session.send("Browser.getWindowForTarget");
      await session.detach();
      return result.windowId;
    }));
    assert.equal(ids[0], ids[1], "Stock fixture pages must be tabs of one window");
  }
}
async function tabSwitchTrials(build) {
  const run = await launch(build);
  try {
    await prepareTabs(run, build);
    command(helper, ["activate", String(run.child.pid)]);
    const switchOnce = async () => {
      const before = await hist(run.session, switchName);
      command(helper, ["next-tab", String(run.child.pid)]);
      const after = await until(`${build.kind} presented tab-switch UMA`, async () => {
        const current = await hist(run.session, switchName);
        return current.count > before.count ? current : null;
      }, 10_000);
      return { durationMs: oneObservation(before, after, switchName), before, after };
    };
    for (let warmup = 0; warmup < 4; warmup++) await switchOnce();
    for (let trial = 0; trial < trials; trial++) {
      const sample = await switchOnce();
      report.raw[build.kind].tabSwitch.push({ trial: trial + 1, ...sample });
      console.log(`${build.kind} tab switch ${trial + 1}/${trials}: ${sample.durationMs} ms`);
    }
  } finally { await close(run); }
}

try {
  fixture = createServer((request, response) => {
    const color = request.url?.includes("blue") ? "#164b72" : "#7c344b";
    response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    response.end(`<!doctype html><title>Native benchmark ${color}</title><style>html,body{margin:0;height:100%;background:${color}}</style>`);
  });
  await new Promise(resolveListen => fixture.listen(0, "127.0.0.1", resolveListen));
  origin = `http://127.0.0.1:${fixture.address().port}`;
  for (let trial = 0; trial < trials; trial++) {
    const order = trial % 2 ? [stock, aux] : [aux, stock];
    for (const build of order) {
      const sample = await startupTrial(build);
      report.raw[build.kind].startup.push({ trial: trial + 1, ...sample });
      console.log(`${build.kind} startup ${trial + 1}/${trials}: ${sample.durationMs} ms`);
    }
  }
  await tabSwitchTrials(aux);
  await tabSwitchTrials(stock);
  for (const kind of ["aux", "stock"]) report.summaries[kind] = {
    startup: metric(report.raw[kind].startup.map(sample => sample.durationMs)),
    tabSwitch: metric(report.raw[kind].tabSwitch.map(sample => sample.durationMs)),
  };
  report.status = "complete";
} catch (error) {
  report.status = "failed";
  report.errors.push(String(error));
  process.exitCode = 1;
} finally {
  report.completedAt = new Date().toISOString();
  writeFileSync(join(output, "manifest.json"), `${JSON.stringify(report, null, 2)}\n`);
  fixture?.closeAllConnections();
  if (fixture) await new Promise(resolveClose => fixture.close(resolveClose));
  console.log(`Native UMA benchmark ${report.status}; raw report: ${join(output, "manifest.json")}`);
}
