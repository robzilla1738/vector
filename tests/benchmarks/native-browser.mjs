// Phase-end Aux/stock comparison. All clocks are native presentation clocks;
// CDP transports histograms and prepares disposable state, never input timing.
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { arch, release as osRelease, tmpdir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { createInterface } from "node:readline";
import { DatabaseSync } from "node:sqlite";
import { setTimeout as delay } from "node:timers/promises";
import { histogram, oneObservation, onePresentation, tabPresentationNames } from "./native-histograms.mjs";
import { memoryFootprints, shellRoleWitness } from "./native-memory.mjs";
import { assertNativePerfHelperCurrent, prepareNativePerfHelper } from "./native-perf-helper.mjs";
import { formatPerformanceTargets, performanceTargets, tabPresentationSummary } from "./native-targets.mjs";
import { acquireDevLock } from "../../scripts/dev.mjs";

const root = resolve(import.meta.dirname, "../..");
const option = (name) => {
  const at = process.argv.indexOf(name);
  return at < 0 ? undefined : process.argv[at + 1];
};
const names = {
  coldLaunch: "AuxPerf.WindowShown",
  firstFrame: "AuxPerf.FirstFrame",
  coldInteractive: "AuxPerf.ColdLaunchToUsableContent",
  navigationInput: "AuxPerf.NavigationInputToPresented",
  tabSwitch: tabPresentationNames.latency,
  commandBar: "AuxPerf.CommandBarInputToPresented",
};
const warmWindowNames = {
  firstFrameUs: "AuxPerf.WarmWindowFirstFrameUs",
  controlsReadyUs: "AuxPerf.WarmWindowControlsReadyUs",
};
if (process.argv.includes("--plan")) {
  console.log(
    JSON.stringify(
      {
        command:
          "pnpm perf --aux-app /absolute/Aux.app --stock-app /absolute/Chromium.app --aux-source /absolute/patched/src --stock-source /absolute/stock/src [--output /absolute/new/report]",
        inputHelper:
          "Optional --input-helper /absolute/existing/native-perf requires --input-helper-sha256 and --input-helper-source-sha256; approved bytes are reused without compilation.",
        runs: 5,
        metrics: {
          ...names,
          warmFirstFrame: names.firstFrame,
          warmWindow: warmWindowNames,
          tabSwitch: tabPresentationNames,
          commandBarP95: names.commandBar,
          shellPhysicalFootprintBytes: "original native-witnessed shell renderer",
          runtimePhysicalFootprintBytes: "exact packaged Aux Runtime executable",
        },
        interactionsPerProcess: 20,
        controls:
          "Same pinned Chromium VERSION and resolved fast flags; AC power; prepared disposable Profiles; 50,000 synthetic history entries; 10 idle fixture tabs; paired native presentation histograms; actual same-process new window; Aux-only process-role witness; no OS cache flush.",
        status: "Measures only after native instrumentation is compiled in both apps.",
      },
      null,
      2,
    ),
  );
  process.exit(0);
}
assert.equal(process.platform, "darwin", "Native macOS apps are required");
for (const name of ["--aux-app", "--stock-app", "--aux-source", "--stock-source"])
  assert.ok(isAbsolute(option(name) ?? ""), `${name} requires an absolute path`);
const command = (program, args, timeout = 15000) =>
  execFileSync(program, args, { encoding: "utf8", timeout }).trim();
const output = resolve(
  option("--output") ?? join(root, "release/test-artifacts", `native-perf-${Date.now()}`),
);
assert.ok(!existsSync(output), "Use a new report directory");
assert.ok(!/[\r\n]/.test(output), "Report paths cannot contain line breaks");
mkdirSync(output, { recursive: true });
const { chromium } = createRequire(join(root, "packages/chromium-driver/package.json"))("playwright-core");
const critical = [
  "is_debug",
  "is_official_build",
  "is_component_build",
  "use_thin_lto",
  "chrome_pgo_phase",
  "symbol_level",
  "dcheck_always_on",
  "target_cpu",
  "proprietary_codecs",
  "ffmpeg_branding",
  "enable_widevine",
];
function build(kind) {
  const app = option(`--${kind}-app`),
    source = option(`--${kind}-source`);
  const executable = command("/usr/libexec/PlistBuddy", [
    "-c",
    "Print :CFBundleExecutable",
    join(app, "Contents/Info.plist"),
  ]);
  const gn = [join(source, "buildtools/mac/gn"), join(source, "buildtools/mac-arm64/gn")].find(existsSync);
  assert.ok(gn, "The checkout's GN executable is required to resolve imported flags");
  const resolvedArgs = command(gn, ["args", dirname(app), "--list", "--short", `--root=${source}`]);
  const args = Object.fromEntries(
    resolvedArgs.split("\n").flatMap((line) => {
      const match = line.match(/^([a-z][a-z0-9_]*)\s*=\s*(.+)$/);
      return match ? [[match[1], match[2].trim()]] : [];
    }),
  );
  const version = readFileSync(join(source, "chrome/VERSION"), "utf8");
  const bundleVersion = command("/usr/libexec/PlistBuddy", [
    "-c",
    "Print :CFBundleShortVersionString",
    join(app, "Contents/Info.plist"),
  ]);
  const versionParts = Object.fromEntries(
    version
      .trim()
      .split("\n")
      .map((line) => line.split("=")),
  );
  assert.equal(
    bundleVersion,
    ["MAJOR", "MINOR", "BUILD", "PATCH"].map((key) => versionParts[key]).join("."),
    "Actual app bundle must match the pinned source VERSION",
  );
  return {
    kind,
    app,
    source,
    bundleVersion,
    binary: join(app, "Contents/MacOS", executable),
    version,
    revision: command("git", ["-C", source, "rev-parse", "HEAD"]),
    args,
    resolvedArgs,
  };
}
const releases = [];
try {
  // The shared development owner serializes both builders and this comparison.
  const stockSource = realpathSync(option("--stock-source"));
  assert.ok(!existsSync(join(stockSource, "out", ".aux-dev-lock")), "Stock has another development owner");
  releases.push(acquireDevLock(realpathSync(option("--aux-source"))));
  const builds = { aux: build("aux"), stock: build("stock") };
  assert.equal(builds.aux.version, builds.stock.version, "Chromium VERSION must match");
  for (const key of critical) {
    assert.ok(builds.aux.args[key] !== undefined, `Missing resolved flag ${key}`);
    assert.equal(builds.aux.args[key], builds.stock.args[key], `Resolved ${key} must match`);
  }
  assert.equal(builds.aux.args.enable_aux_shell, "true");
  assert.notEqual(builds.stock.args.enable_aux_shell, "true");
  for (const kind of ["aux", "stock"]) {
    const args = builds[kind].args;
    for (const [key, value] of Object.entries({
      is_debug: "false",
      is_official_build: "true",
      is_component_build: "false",
      use_thin_lto: "true",
      chrome_pgo_phase: "2",
      dcheck_always_on: "false",
      target_cpu: '"arm64"',
    }))
      assert.equal(args[key], value, `${kind}: use flags.fast.gn`);
    assert.notEqual(args.aux_test_hooks, "true", "No test-hook build is permitted");
  }
  const power = command("pmset", ["-g", "batt"]);
  assert.match(power, /Now drawing from 'AC Power'/, "Use AC power");
  const helperFlags = ["--input-helper", "--input-helper-sha256", "--input-helper-source-sha256"];
  const inputHelper = prepareNativePerfHelper(
    {
      source: join(import.meta.dirname, "native-perf.swift"),
      output: join(output, "native-perf"),
      approved: helperFlags.some((flag) => process.argv.includes(flag))
        ? {
            path: option("--input-helper"),
            sha256: option("--input-helper-sha256"),
            sourceSha256: option("--input-helper-source-sha256"),
          }
        : undefined,
    },
    (source, binary) => command("xcrun", ["swiftc", "-O", source, "-o", binary], 120000),
  );
  const report = {
    schema: 7,
    status: "incomplete",
    at: new Date().toISOString(),
    machine: { arch: arch(), osRelease: osRelease(), model: command("sysctl", ["-n", "hw.model"]), power },
    builds,
    inputHelper,
    method: {
      runs: 5,
      historyEntries: 50000,
      idleTabs: 10,
      interactionSamplesPerProcess: 20,
      warmLaunch: "immediate relaunch of the same measured disposable Profile with ten tabs",
      warmWindow: {
        clock: "native OpenEmptyWindow immediately before CreateBrowserWindow; excludes CmdN ingress",
        firstFrame: "first successful presentation of the exact additional native window",
        controlsReady:
          "mounted live address control and registered shortcuts followed by native presentation; stock native controls exist at first presentation",
        proof:
          "same original PID/birth; exact additional window; subsequent original-window address/query presentation and fixture navigation; close only the added window",
        target:
          "median max(firstFrameUs, controlsReadyUs) from five windows; subsequent input proof is outside timing",
      },
      tabSwitch: {
        histograms: tabPresentationNames,
        units:
          "integer microseconds, latency and frame interval emitted by the same accepted original-input presentation callback",
        summaryUnits:
          "absolute p50/p95/max are milliseconds; paired frame-adjusted p95 and interval range remain microseconds",
        interval:
          "positive native VSync-backed interval; zero means unavailable, never a guessed refresh rate",
        target: "p95(latencyUs - frameIntervalUs) <= 8000 across all 100 paired observations",
      },
      profile:
        "fresh process; each final disposable Profile prepared in place, retaining its original protected runtime credential owner",
      osCaches: "not flushed",
      buildProvenance:
        "declared source/output paths and actual bundle VERSION; not a reproducible-build attestation",
      instrumentation:
        "Shared native timing and presentation triggers require the warm-window and paired microsecond histogram names above in both apps. Aux adds an original-shell process witness. Instrumentation binaries are not byte-identical.",
      presentation: "native-confirmed conservative presentation bound",
      footprint:
        "sum of original process-tree kernel physical footprints; shared pages can be counted more than once",
      memoryRoles: {
        shell: "original chrome://aux primary-frame process PID and kernel birth; full process footprint",
        runtime: "one descendant with kernel executable path matching the passed app bundle's Aux Runtime",
        stock: "Aux-only role metrics are not applicable; total footprint uses the same kernel collector",
        sample:
          "kernel identity/path/ancestry checked around each footprint read; process rows are sequential",
        shellTargetMiB: 120,
        runtimeTargetMiB: 90,
      },
      coldInteractive:
        "original kernel process birth to real input-served fixture presentation, including launch/dyld/probe overhead",
      coldClock: "native original kernel process-birth Mach ticks",
    },
    raw: { aux: [], stock: [] },
    medians: {},
    percentiles: {},
    errors: [],
  };
  const save = () => writeFileSync(join(output, "report.json"), JSON.stringify(report, null, 2));
  const temporary = mkdtempSync(join(tmpdir(), "aux-native-perf-"));
  const nonce = randomUUID();
  const fixture = createServer((request, response) => {
    if (!request.url?.startsWith(`/aux-native-perf/${nonce}`)) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { "Content-Type": "text/html", "Cache-Control": "no-store" });
    response.end(
      `<!doctype html><title>Aux native performance fixture</title><body style="background:#efe6cf;color:#182017;font:24px system-ui"><h1>Original input reached this fixture</h1><p>Disposable synthetic browser workload ${nonce}</p></body>`,
    );
  });
  await new Promise((resolve) => fixture.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${fixture.address().port}/aux-native-perf/${nonce}`;
  async function until(label, check, milliseconds = 20000) {
    const end = Date.now() + milliseconds;
    while (Date.now() < end) {
      const result = await check();
      if (result !== null && result !== undefined && result !== false) return result;
      await delay(25);
    }
    throw new Error(`No actual ${label} within ${milliseconds} ms`);
  }
  function helper(pid, app) {
    assertNativePerfHelperCurrent(inputHelper);
    const child = spawn(inputHelper.path, [String(pid), app], { stdio: ["pipe", "pipe", "inherit"] });
    const pending = new Map();
    let next = 0;
    let exitError;
    createInterface({ input: child.stdout }).on("line", (line) => {
      const result = JSON.parse(line);
      const item = pending.get(result.id);
      if (!item) return;
      pending.delete(result.id);
      clearTimeout(item.timer);
      if (Object.hasOwn(result, "result")) item.resolve(result.result);
      else item.reject(new Error(result.error));
    });
    child.once("exit", () => {
      exitError = new Error("Original PID input helper exited");
      for (const item of pending.values()) {
        clearTimeout(item.timer);
        item.reject(exitError);
      }
      pending.clear();
    });
    return {
      close: () => child.stdin.end(),
      call: (command, args = {}) =>
        new Promise((resolve, reject) => {
          if (exitError) {
            reject(exitError);
            return;
          }
          const id = ++next;
          const timer = setTimeout(() => {
            pending.delete(id);
            reject(new Error("Native helper did not acknowledge"));
          }, 5000);
          pending.set(id, { resolve, reject, timer });
          child.stdin.write(`${JSON.stringify({ id, command, ...args })}\n`);
        }),
    };
  }
  function localState(profile) {
    const path = join(profile, "Local State");
    const state = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
    state.devtools ??= {};
    state.devtools.remote_debugging ??= {};
    Object.assign(state.devtools.remote_debugging, { allowed: true, "user-enabled": true });
    state.performance = { native_benchmark: true, native_benchmark_fixture_url: url };
    writeFileSync(path, JSON.stringify(state), { mode: 0o600 });
  }
  function ownedPort(pid, kind, profile) {
    let sockets;
    try {
      sockets = command("/usr/sbin/lsof", [
        "-nP",
        "-a",
        "-p",
        String(pid),
        "-iTCP",
        "-sTCP:LISTEN",
        "-F",
        "n",
      ]);
    } catch {
      return null;
    }
    const ports = sockets.split("\n").flatMap((line) => {
      const match = line.match(/^n127\.0\.0\.1:(\d+)$/);
      return match ? [Number(match[1])] : [];
    });
    if (kind === "aux") return ports.includes(9222) ? 9222 : null;
    const path = join(profile, "DevToolsActivePort");
    if (!existsSync(path)) return null;
    const port = Number(readFileSync(path, "utf8").split("\n")[0]);
    return ports.includes(port) ? port : null;
  }
  async function launch(build, profile) {
    localState(profile);
    const child = spawn(
      build.binary,
      [
        `--user-data-dir=${profile}`,
        "--remote-debugging-port=0",
        "--no-first-run",
        "--no-default-browser-check",
        "--use-mock-keychain",
        "--password-store=basic",
        "about:blank",
      ],
      { env: { ...process.env, AUX_LOAD_DOTENV: "0" }, stdio: ["ignore", "ignore", "pipe"] },
    );
    let stderr = "",
      bootBuffer = "";
    const bootPhases = [];
    const shellRole = shellRoleWitness(child.pid);
    let observeShellRole = true;
    child.stderr.on("data", (data) => {
      stderr = (stderr + data).slice(-8000);
      bootBuffer += data;
      let end;
      while ((end = bootBuffer.indexOf("\n")) >= 0) {
        const line = bootBuffer.slice(0, end);
        bootBuffer = bootBuffer.slice(end + 1);
        if (observeShellRole) shellRole.observe(line);
        const match = line.match(/^\[runtime\] boot (\{.*\})$/);
        if (!match || bootPhases.length >= 32) continue;
        try {
          const phase = JSON.parse(match[1]);
          if (typeof phase.phase === "string" && Number.isFinite(phase.elapsedMs)) bootPhases.push(phase);
        } catch {
          /* An incomplete diagnostic line is not a timing observation. */
        }
      }
      bootBuffer = bootBuffer.slice(-8000);
    });
    const exited = new Promise((resolve) => child.once("exit", (code, signal) => resolve({ code, signal })));
    const live = () => {
      if (child.exitCode !== null || child.signalCode !== null)
        throw new Error(`Original ${build.kind} exited: ${stderr}`);
    };
    const run = {
      kind: build.kind,
      child,
      exited,
      profile,
      input: null,
      browser: null,
      bootPhases,
      shellRole,
      stopShellRoleObservation: () => {
        observeShellRole = false;
      },
    };
    try {
      const port = await until("original browser-owned loopback listener", () => {
        live();
        return ownedPort(child.pid, build.kind, profile);
      });
      run.browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
      run.session = await run.browser.newBrowserCDPSession();
      // AppKit registration follows process creation; retain kernel birth time
      // only after this exact browser has published its owned listener.
      run.input = helper(child.pid, build.app);
      const identity = await run.input.call("identity");
      assert.equal(
        identity.accessibility,
        true,
        "PID-scoped input requires existing Accessibility permission",
      );
      await run.input.call("activate");
      await until(
        "original browser foreground ownership",
        async () => (await run.input.call("identity")).focused,
      );
      return run;
    } catch (error) {
      run.input?.close();
      child.kill("SIGTERM");
      await Promise.race([
        exited,
        delay(10000).then(() => {
          throw new Error("Failed launch cleanup lacked actual browser exit acknowledgement");
        }),
      ]);
      throw error;
    }
  }
  async function close(run) {
    let transportError;
    try {
      await run.session.send("Browser.close");
    } catch (error) {
      transportError = error;
    }
    const acknowledgement = await Promise.race([
      run.exited,
      delay(15000).then(() => {
        throw new Error(
          `Original browser did not acknowledge exit; Profile retained${transportError ? `: ${transportError}` : ""}`,
        );
      }),
    ]);
    run.input.close();
    assert.equal(acknowledgement.code, 0, "Native shutdown failed; retain the disposable Profile");
    assert.equal(
      acknowledgement.signal,
      null,
      "Native shutdown was interrupted; retain the disposable Profile",
    );
  }

  const hist = async (run, name) =>
    histogram(await run.session.send("Browser.getHistograms", { query: name, delta: false }), name);
  async function observation(run, name, before = { count: 0, sum: 0 }) {
    return until(name, async () => {
      const after = await hist(run, name);
      return after.count > before.count ? oneObservation(before, after, name) : null;
    });
  }
  async function presentationHistograms(run) {
    const response = await run.session.send("Browser.getHistograms", {
      query: "AuxPerf.TabSwitch",
      delta: false,
    });
    return Object.fromEntries(
      Object.entries(tabPresentationNames).map(([key, name]) => [key, histogram(response, name)]),
    );
  }
  async function presentationObservation(run, before) {
    return until("paired native tab presentation", async () => {
      const after = await presentationHistograms(run);
      for (const key of Object.keys(tabPresentationNames))
        assert.ok(
          after[key].count <= before[key].count + 1,
          "Overlapping native tab presentation observations",
        );
      if (
        after.latency.count <= before.latency.count ||
        after.frameInterval.count <= before.frameInterval.count
      )
        return null;
      return onePresentation(before, after);
    });
  }
  function ordinaryPages(run) {
    const pages = run.browser.contexts().flatMap((context) => context.pages());
    assert.ok(
      pages.every((page) => ["about:blank", "chrome://newtab/", url].includes(page.url())),
      "An unexpected nonfixture target entered the disposable workload",
    );
    return pages;
  }
  async function loadedFixturePages(run) {
    const pages = ordinaryPages(run).filter((page) => page.url() === url);
    for (const page of pages) {
      await page.waitForLoadState("load");
      assert.equal(page.url(), url, "The original fixture target changed during load");
    }
    return pages;
  }
  async function addressReady(run, windowId) {
    await until(
      "original browser address focus",
      async () =>
        (
          await run.input.call("address-ready", {
            ...(run.kind === "aux" ? { expectedLabel: "address, search, and agent prompt" } : {}),
            ...(windowId === undefined ? {} : { windowId }),
          })
        ).ready,
    );
  }
  async function nativeWindowId(page) {
    const session = await page.context().newCDPSession(page);
    try {
      return (await session.send("Browser.getWindowForTarget")).windowId;
    } finally {
      await session.detach();
    }
  }
  async function warmWindow(run, originalIdentity) {
    const before = await run.input.call("windows");
    assert.equal(before.windowIds.length, 1, "Warm-window measurement requires exactly the original window");
    const originalWindowId = before.windowIds[0];
    assert.equal(before.focusedWindowId, originalWindowId);
    const pages = ordinaryPages(run);
    assert.equal(pages.length, 10, "Warm-window probe must follow the ten-tab memory measurement");
    const originalNativeWindowId = await nativeWindowId(pages[0]);
    const beforeFrame = await hist(run, warmWindowNames.firstFrameUs);
    const beforeReady = await hist(run, warmWindowNames.controlsReadyUs);
    await run.input.call("key", { chord: "new-window", windowId: originalWindowId });
    const opened = await until("one additional focused native window", async () => {
      const snapshot = await run.input.call("windows");
      assert.ok(snapshot.windowIds.includes(originalWindowId), "Original window retired during CmdN");
      assert.ok(snapshot.windowIds.length <= 2, "More than one new native window appeared");
      const added = snapshot.windowIds.find((id) => id !== originalWindowId);
      return added !== undefined && snapshot.focusedWindowId === added ? snapshot : null;
    });
    const windowId = opened.focusedWindowId;
    const page = await until("one additional ordinary page", () => {
      const added = ordinaryPages(run).filter((item) => !pages.includes(item));
      assert.ok(added.length <= 1, "More than one new ordinary page appeared");
      return added[0] ?? null;
    });
    const newNativeWindowId = await nativeWindowId(page);
    assert.notEqual(
      newNativeWindowId,
      originalNativeWindowId,
      "CmdN must create another actual browser window",
    );
    const firstFrameUs = await observation(run, warmWindowNames.firstFrameUs, beforeFrame);
    const controlsReadyUs = await observation(run, warmWindowNames.controlsReadyUs, beforeReady);
    const beforeQuery = await hist(run, names.commandBar);
    await run.input.call("key", { chord: "address", windowId });
    await addressReady(run, windowId);
    await run.input.call("text", { text: "f", windowId });
    const queryPresentationMs = await observation(run, names.commandBar, beforeQuery);
    await run.input.call("key", { chord: "address", windowId });
    await addressReady(run, windowId);
    await run.input.call("text", { text: url, windowId });
    await run.input.call("key", { chord: "return", windowId });
    await page.waitForURL(url, { waitUntil: "load", timeout: 20000 });
    assert.equal(await nativeWindowId(page), newNativeWindowId, "Input left the original added window");
    await run.input.call("key", { chord: "close-window", windowId });
    const after = await until("only the original native window remains", async () => {
      const snapshot = await run.input.call("windows");
      assert.ok(snapshot.windowIds.includes(originalWindowId), "CmdShiftW retired the original window");
      return snapshot.windowIds.length === 1 ? snapshot : null;
    });
    await until("only the original ten fixture tabs remain", () => {
      const remaining = ordinaryPages(run);
      return remaining.length === pages.length && pages.every((item) => remaining.includes(item));
    });
    const identity = await run.input.call("identity");
    for (const field of ["pid", "imageUUID", "startMachTicks"])
      assert.equal(
        identity[field],
        originalIdentity[field],
        "Warm window changed the original process generation",
      );
    return {
      firstFrameUs,
      controlsReadyUs,
      queryPresentationMs,
      identity,
      before,
      opened,
      after,
      originalNativeWindowId,
      newNativeWindowId,
    };
  }
  async function open(run) {
    const before = (await loadedFixturePages(run)).length;
    const beforePresentation = await hist(run, names.navigationInput);
    await run.input.call("key", { chord: "new-tab" });
    await run.input.call("key", { chord: "address" });
    await addressReady(run);
    await run.input.call("text", { text: url });
    await run.input.call("key", { chord: "return" });
    // CDP's load event precedes native embed presentation/focus handoff. Finish
    // this input-served navigation before preparing the next tab; no guessed sleep.
    const navigationInputMs = await observation(run, names.navigationInput, beforePresentation);
    await until(
      "new native fixture tab load",
      async () => (await loadedFixturePages(run)).length === before + 1,
    );
    return { fixtureTabs: before + 1, navigationInputMs };
  }
  function seedHistory(profile) {
    const history = join(profile, "Default/History");
    assert.ok(existsSync(history), "Prepared browser must have created its actual History schema");
    const db = new DatabaseSync(history);
    try {
      db.exec("BEGIN");
      const insert = db.prepare(
        "INSERT INTO urls(url,title,visit_count,typed_count,last_visit_time,hidden) VALUES(?,?,1,1,?,0)",
      );
      const visit = db.prepare(
        "INSERT INTO visits(url,visit_time,from_visit,transition,incremented_omnibox_typed_score,opener_visit,originator_cache_guid,originator_visit_id,originator_from_visit,originator_opener_visit) VALUES(?,?,0,1,1,0,'',0,0,0)",
      );
      const chromeTime = BigInt(Date.now()) * 1000n + 11644473600000000n;
      for (let i = 0; i < 50000; i++) {
        const time = chromeTime - BigInt(i);
        const inserted = insert.run(`${url}?history=${i}`, `Native fixture history ${i}`, time);
        visit.run(inserted.lastInsertRowid, time);
      }
      assert.equal(
        Number(
          db.prepare("SELECT count(*) AS count FROM urls WHERE url LIKE ?").get(`${url}?history=%`).count,
        ),
        50000,
      );
      db.exec("COMMIT; PRAGMA wal_checkpoint(TRUNCATE)");
    } finally {
      db.close();
    }
  }
  function bytes(path) {
    return readdirSync(path, { withFileTypes: true }).reduce((sum, item) => {
      const child = join(path, item.name);
      return sum + (item.isDirectory() ? bytes(child) : item.isFile() ? statSync(child).size : 0);
    }, 0);
  }
  try {
    for (let pair = 0; pair < 5; pair++) {
      for (const kind of pair % 2 ? ["stock", "aux"] : ["aux", "stock"]) {
        // The runtime's protected database belongs to this exact Profile.
        // Prepare it at its final path instead of copying encrypted storage
        // into a different native credential owner before measurement.
        const profile = join(temporary, `${kind}-${pair}`);
        mkdirSync(profile);
        const run = await launch(builds[kind], profile);
        try {
          if (kind === "aux") {
            console.log(
              JSON.stringify({
                event: "AUX_PERF_SETUP_REQUIRED",
                pid: run.child.pid,
                profile,
                fixtureURL: url,
                instruction:
                  "In this disposable Aux window, choose Finish later to finish setup, then use the native address bar to navigate to fixtureURL. Measurement waits for that ordinary page; the privileged shell stays hidden from CDP.",
              }),
            );
            await until(
              "manual disposable Aux setup and fixture navigation",
              async () => (await loadedFixturePages(run)).length > 0,
              600000,
            );
            console.log(JSON.stringify({ event: "AUX_PERF_SETUP_READY", pid: run.child.pid }));
          } else {
            const page = ordinaryPages(run)[0];
            assert.ok(page, "Prepared stock browser needs an ordinary initial target");
            await page.goto(url, { waitUntil: "load" });
          }
          for (const page of ordinaryPages(run)) await page.goto("about:blank", { waitUntil: "load" });
        } finally {
          await close(run);
        }
        seedHistory(profile);
      }
    }
    for (let pair = 0; pair < 5; pair++) {
      // Alternate order so a single host does not always inherit the warmer caches.
      for (const kind of pair % 2 ? ["stock", "aux"] : ["aux", "stock"]) {
        const profile = join(temporary, `${kind}-${pair}`);
        const powerBefore = command("pmset", ["-g", "batt"]);
        assert.match(powerBefore, /Now drawing from 'AC Power'/, "Every sample requires mains power");
        const run = await launch(builds[kind], profile);
        try {
          const sample = {
            pair,
            powerBefore,
            pid: run.child.pid,
            identity: await run.input.call("identity"),
            coldLaunch: await observation(run, names.coldLaunch),
            firstFrame: await observation(run, names.firstFrame),
          };
          await run.input.call("key", { chord: "address" });
          await addressReady(run);
          await run.input.call("text", { text: url });
          await run.input.call("key", { chord: "return" });
          sample.coldInteractive = await observation(run, names.coldInteractive);
          sample.navigationInput = await observation(run, names.navigationInput);
          await until(
            "first native fixture tab load",
            async () => (await loadedFixturePages(run)).length > 0,
          );
          sample.workloadPreparation = [];
          for (let i = 1; i < 10; i++) sample.workloadPreparation.push(await open(run));
          for (const page of ordinaryPages(run)) if (page.url() !== url) await page.close();
          const pages = await loadedFixturePages(run);
          assert.equal(pages.length, 10, "The native workload must have exactly ten fixture tabs");
          const windows = new Set();
          for (const page of pages) windows.add(await nativeWindowId(page));
          assert.equal(windows.size, 1, "All fixture tabs must belong to the original native window");
          sample.interactions = { tabSwitch: [], commandBar: [] };
          for (let interaction = 0; interaction < 20; interaction++) {
            const beforeSwitch = await presentationHistograms(run);
            await run.input.call("key", { chord: "next-tab" });
            sample.interactions.tabSwitch.push(await presentationObservation(run, beforeSwitch));
            await run.input.call("key", { chord: "address" });
            await addressReady(run);
            const beforeQuery = await hist(run, names.commandBar);
            // One native character is one input observation; multi-character typing
            // may cross presentation frames and cannot be a single latency sample.
            await run.input.call("text", { text: interaction % 2 ? "f" : "n" });
            sample.interactions.commandBar.push(await observation(run, names.commandBar, beforeQuery));
            await run.input.call("key", { chord: "escape" });
          }
          sample.tabSwitch = sample.interactions.tabSwitch[0].latencyUs / 1000;
          sample.commandBar = sample.interactions.commandBar[0];
          await delay(2000); // Fixed idle workload settling, not a readiness metric.
          const processRows = command("ps", ["-axo", "pid=,ppid="])
            .split("\n")
            .map((line) => line.trim().split(/\s+/).map(Number));
          const descendants = new Set([run.child.pid]);
          let changed = true;
          while (changed) {
            changed = false;
            for (const [pid, parent] of processRows)
              if (descendants.has(parent) && !descendants.has(pid)) {
                descendants.add(pid);
                changed = true;
              }
          }
          const shellWitness = kind === "aux" ? run.shellRole.current() : undefined;
          sample.memory = await run.input.call("memory", {
            pids: [...descendants],
            ...(shellWitness ? { shellWitness } : {}),
          });
          if (shellWitness) {
            assert.deepEqual(
              run.shellRole.current(),
              shellWitness,
              "Original shell owner changed while measuring",
            );
            sample.shellRoleWitness = shellWitness;
          }
          sample.memorySummary = memoryFootprints(
            sample.memory,
            shellWitness,
            kind === "aux" ? realpathSync(join(builds.aux.app, "Contents/Helpers/Aux Runtime")) : undefined,
          );
          run.stopShellRoleObservation();
          sample.runtimeBoot = run.bootPhases.map((phase) => ({ ...phase }));
          report.raw[kind].push(sample);
          save();
          sample.warmWindow = await warmWindow(run, sample.identity);
          sample.powerAfter = command("pmset", ["-g", "batt"]);
          assert.match(
            sample.powerAfter,
            /Now drawing from 'AC Power'/,
            "Every completed sample requires mains power",
          );
          save();
        } finally {
          await close(run);
        }
        const warm = await launch(builds[kind], profile);
        try {
          const sample = report.raw[kind].at(-1);
          sample.warmLaunch = await observation(warm, names.coldLaunch);
          sample.warmFirstFrame = await observation(warm, names.firstFrame);
          save();
        } finally {
          await close(warm);
          rmSync(profile, { recursive: true });
        }
      }
    }
    const median = (values) => [...values].sort((a, b) => a - b)[2];
    for (const kind of ["aux", "stock"]) {
      assert.equal(report.raw[kind].length, 5);
      report.medians[kind] = Object.fromEntries(
        Object.keys(names).map((name) => [name, median(report.raw[kind].map((sample) => sample[name]))]),
      );
      for (const metric of ["warmLaunch", "warmFirstFrame"])
        report.medians[kind][metric] = median(report.raw[kind].map((sample) => sample[metric]));
      for (const metric of ["firstFrameUs", "controlsReadyUs"])
        report.medians[kind][`warmWindow${metric[0].toUpperCase()}${metric.slice(1)}`] = median(
          report.raw[kind].map((sample) => sample.warmWindow[metric]),
        );
      report.percentiles[kind] = Object.fromEntries(
        ["tabSwitch", "commandBar"].map((metric) => {
          if (metric === "tabSwitch") return [metric, tabPresentationSummary(report.raw[kind])];
          const values = report.raw[kind]
            .flatMap((sample) => sample.interactions[metric])
            .sort((a, b) => a - b);
          assert.equal(values.length, 100);
          return [metric, { samples: values.length, p50: values[49], p95: values[94], max: values.at(-1) }];
        }),
      );
      report.medians[kind].appBytes = bytes(builds[kind].app);
      const node = join(builds[kind].app, "Contents/Helpers/Aux Runtime");
      if (kind === "aux") assert.ok(existsSync(node), "The actual packaged Aux Runtime helper is required");
      report.medians[kind].nodeBytes = existsSync(node) ? statSync(node).size : null;
      for (const metric of [
        "physicalFootprintBytes",
        "shellPhysicalFootprintBytes",
        "runtimePhysicalFootprintBytes",
      ]) {
        report.medians[kind][metric] =
          kind === "stock" && metric !== "physicalFootprintBytes"
            ? null
            : median(report.raw[kind].map((sample) => sample.memorySummary[metric]));
      }
    }
    report.targets = performanceTargets(report);
    const targetSummary = formatPerformanceTargets(report.targets);
    report.status = "complete";
    save();
    const pair = (name) => ["aux", "stock"].map((kind) => report.medians[kind][name].toFixed(1)).join(" / ");
    const p95 = (name) =>
      ["aux", "stock"].map((kind) => report.percentiles[kind][name].p95.toFixed(1)).join(" / ");
    const mb = (name) =>
      ["aux", "stock"]
        .map((kind) =>
          report.medians[kind][name] === null ? "—" : (report.medians[kind][name] / 1000000).toFixed(1),
        )
        .join(" / ");
    const rawTarget = join(output, "report.json");
    const rawLink = /\s/.test(rawTarget) ? `<${rawTarget}>` : rawTarget;
    const roleMiB = (role) => report.targets[role].observed?.toFixed(1) ?? "—";
    const row = `| ${report.at.slice(0, 10)} / ${builds.aux.revision.slice(0, 9)} / AC | ${pair("coldLaunch")} | ${pair("firstFrame")} | ${pair("coldInteractive")} | ${pair("navigationInput")} | ${pair("tabSwitch")} | ${pair("commandBar")} | ${pair("warmFirstFrame")} | ${p95("tabSwitch")} | ${p95("commandBar")} | ${mb("physicalFootprintBytes")} | ${roleMiB("shellMemory")} | ${roleMiB("runtimeMemory")} | ${mb("appBytes")} / Node ${mb("nodeBytes")} | 5 | [raw report](${rawLink}) |`;
    writeFileSync(join(output, "benchmark-row.md"), `${row}\n`);
    writeFileSync(join(output, "target-summary.md"), targetSummary);
    const benchmarksPath = join(root, "docs/BENCHMARKS.md");
    let benchmarks = readFileSync(benchmarksPath, "utf8");
    assert.ok(existsSync(rawTarget), "The completed raw report must exist before publication");
    assert.ok(!benchmarks.includes(rawTarget), "This exact completed report already has a row");
    const tableStart = benchmarks.indexOf("<!-- native-perf-table:start -->");
    const tableEnd = benchmarks.indexOf("<!-- native-perf-table:end -->", tableStart);
    assert.ok(tableStart >= 0 && tableEnd > tableStart, "The current benchmark table marker is required");
    benchmarks = benchmarks.slice(0, tableEnd).trimEnd() + `\n${row}\n\n` + benchmarks.slice(tableEnd);
    const updateBlock = (name, content) => {
      const begin = `<!-- native-perf-${name}:start -->`,
        end = `<!-- native-perf-${name}:end -->`;
      const first = benchmarks.indexOf(begin),
        last = benchmarks.indexOf(end, first);
      assert.ok(first >= 0 && last > first, `The benchmark ${name} marker is required`);
      benchmarks = benchmarks.slice(0, first + begin.length) + `\n\n${content}\n\n` + benchmarks.slice(last);
    };
    updateBlock(
      "summary",
      "Completed native comparisons appear below. Each row reports actual measurements; it does not imply that every performance target passed.",
    );
    updateBlock(
      "status",
      "Every published row retains five paired raw samples and its actual build, power and method metadata. Source changes, unit checks and missing signals cannot establish a performance pass.",
    );
    writeFileSync(benchmarksPath, benchmarks);

    console.log(`${row}\n${targetSummary}\nRaw report: ${join(output, "report.json")}`);
  } catch (error) {
    report.errors.push(String(error.stack ?? error));
    save();
    throw error;
  } finally {
    await new Promise((resolve) => fixture.close(resolve));
    if (report.status === "complete") rmSync(temporary, { recursive: true });
  }
} finally {
  const failures = [];
  for (const release of releases.reverse()) {
    try {
      release();
    } catch (error) {
      failures.push(error);
    }
  }
  if (failures.length)
    throw new AggregateError(failures, "Original performance source locks could not be released");
}
