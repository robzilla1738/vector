#!/usr/bin/env node
/**
 * Vector browser-layer benchmark (`pnpm bench`).
 *
 * Starts the fixture servers if they are not already serving, launches the
 * standalone runtime (headless Chromium — set VECTOR_BROWSER_PATH when no
 * system Chrome is installed; a Playwright `chromium_headless_shell` download
 * is picked up automatically), and times N repeats of the hot path against
 * the records fixture:
 *
 *   open                 pages.open (about:blank → navigate → attach)
 *   observe.full         pages.observe, full JSON — ms and bytes
 *   observe.compact      pages.observe format=compact — ms and bytes
 *   mcp.*.bytes          what the MCP tool puts on stdio for one observe
 *                        (pretty-printed full JSON before / compact text now)
 *   click.ref            click via an observation ref (resolve + dispatch)
 *   fill.ref             fill via an observation ref
 *   navigate / +observe  pages.navigate then observe
 *   act+observe          pages.execute with returnObservation (one round trip)
 *
 * `--backend chrome|vector-engine|both` (default both) runs the same
 * iterations on the Chromium backend (engineMode off) and on the Vector
 * Engine (engineMode always, architecture §11) in separate runtimes and
 * prints them side by side. A backend that cannot start is reported, not
 * faked.
 *
 * Prints a table and writes tests/benchmarks/reports/<timestamp>.json.
 *
 *   node tests/benchmarks/run.mjs [--repeats 10] [--warmup 1] [--label name]
 *        [--backend chrome|vector-engine|both]
 *        [--runtime path/to/apps/runtime/dist/index.js] [--out dir]
 *
 * `--runtime` lets the same harness measure another checkout (e.g. a base
 * commit's worktree) for before/after comparisons.
 */
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir, totalmem } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execSync } from "node:child_process";
import { startFixturesIfNeeded, waitForFixtures } from "../../scripts/fixtures.mjs";
import { findChromium } from "../../scripts/chromium.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const RECORDS = "http://127.0.0.1:4810";

// ---- args ----
const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : fallback;
};
const repeats = Number(opt("repeats", 10));
const warmup = Number(opt("warmup", 1));
const runtimeEntry = resolve(opt("runtime", join(root, "apps/runtime/dist/index.js")));
const outDir = resolve(opt("out", join(root, "tests/benchmarks/reports")));
const label = opt("label", "");
const backendArg = opt("backend", "both");
const requireIdentity = argv.includes("--require-identity") || process.env.VECTOR_REQUIRE_IDENTITY === "1";
const BACKENDS = backendArg === "both" ? ["chrome", "vector-engine"] : [backendArg];
for (const b of BACKENDS) {
  if (!["chrome", "vector-engine"].includes(b)) {
    console.error(`--backend must be chrome, vector-engine or both (got ${backendArg})`);
    process.exit(2);
  }
}

const sha = (dir) => {
  try {
    return execSync("git rev-parse --short HEAD", { cwd: dir, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "unknown";
  }
};

async function measureHeldOutAdvantage(results) {
  const chrome = results.chrome;
  const engine = results["vector-engine"];
  if (!chrome || chrome.skipped || !engine || engine.skipped) {
    return { measured: false, reason: "need both chrome and vector-engine" };
  }
  const metric = chrome.metrics["act+observe.ms"] && engine.metrics["act+observe.ms"] ? "act+observe.ms" : "observe.full.ms";
  const p95 = (r) => r.metrics[metric]?.p95 ?? 0;
  const tokens = (r) => {
    const m = r.metrics["model.tokensPerSuccess"]?.p50;
    if (typeof m === "number" && Number.isFinite(m)) return m;
    if (typeof r.tokensPerSuccess === "number" && Number.isFinite(r.tokensPerSuccess)) return r.tokensPerSuccess;
    return null;
  };
  const baseline = {
    success: chrome.failures?.length ? 0 : 1,
    p95Ms: p95(chrome),
    tokensPerSuccess: tokens(chrome),
  };
  const candidate = {
    success: engine.failures?.length ? 0 : 1,
    p95Ms: p95(engine),
    tokensPerSuccess: tokens(engine),
  };
  try {
    const mod = await import(pathToFileURL(join(root, "apps/runtime/dist/index.js")).href);
    const gate = mod.evaluateHeldOutAdvantage(baseline, candidate);
    return { measured: true, metric, baseline, candidate, ...gate };
  } catch (e) {
    return { measured: false, reason: String(e?.message ?? e), metric, baseline, candidate };
  }
}
const runtimeRoot = resolve(dirname(runtimeEntry), "../../..");

// the standalone driver reads the real process env for the browser path
const chromiumPath = findChromium();
if (chromiumPath && !process.env.VECTOR_BROWSER_PATH) process.env.VECTOR_BROWSER_PATH = chromiumPath;

// ---- metrics ----
const stats = (xs) => {
  const s = xs.slice().sort((a, b) => a - b);
  const q = (p) => s[Math.min(s.length - 1, Math.floor(s.length * p))];
  return {
    n: s.length,
    mean: +(s.reduce((a, b) => a + b, 0) / s.length).toFixed(1),
    p50: q(0.5),
    p95: q(0.95),
    min: s[0],
    max: s[s.length - 1],
  };
};
const now = () => performance.now();
const J = (v) => JSON.stringify(v).length;

/** One benchmark run: a fresh runtime routed to `backend`, N iterations. */
async function runBackend(backend) {
  const samples = new Map();
  const failures = [];
  const unsupported = new Set();
  const rec = (name, value) => {
    if (typeof value !== "number" || !Number.isFinite(value)) return;
    if (!samples.has(name)) samples.set(name, []);
    samples.get(name).push(name.endsWith(".ms") ? +value.toFixed(1) : value);
  };
  // pages.open results carry the router's reason; the engine hit rate is the
  // share of opens that landed on the engine
  const routes = new Map();

  const { startRuntime } = await import(pathToFileURL(runtimeEntry).href);
  const engine = backend === "vector-engine";
  const rt = await startRuntime({
    ...process.env,
    VECTOR_DATA_DIR: mkdtempSync(join(tmpdir(), `vector-bench-${backend}-`)),
    VECTOR_ELECTRON_CDP: "",
    VECTOR_API_TOKEN: "bench",
    // older runtimes ignore these and stay on Chromium — reported as a routing failure below
    VECTOR_ENGINE_MODE: engine ? "always" : "off",
    VECTOR_ENGINE: engine ? "1" : "0",
  });
  const rpc = (m, p = {}) => rt.invoke(m, p);
  const info = { backend, runtimeSha: sha(runtimeRoot) };
  try {
    const describe = await rpc("runtime.describe").catch(() => ({}));
    info.engine = describe.engine ?? null;
    const sessions = await rpc("sessions.list").catch(() => []);
    info.sessions = Array.isArray(sessions) ? sessions.map((s) => ({ backend: s.backend, status: s.status, detail: s.detail })) : [];
    const wanted = engine ? "vector-engine" : "vector";
    const session = info.sessions.find((s) => s.backend === wanted);
    if (engine && !(describe.engine?.available && describe.engine?.connected)) {
      const skipped = `vector-engine unavailable: ${describe.engine?.error ?? "runtime has no engine support"}`;
      if (requireIdentity) failures.push(skipped);
      return { ...info, skipped, metrics: {}, failures, unsupported: [] };
    }
    if (engine && describe.engine?.routingMode && describe.engine.routingMode !== "native-only") {
      failures.push(`routingMode ${describe.engine.routingMode} != native-only`);
    }
    if (!engine && session && session.status !== "connected") {
      const skipped = `Chromium backend not connected: ${session.detail ?? session.status}`;
      if (requireIdentity) failures.push(skipped);
      return { ...info, skipped, metrics: {}, failures, unsupported: [] };
    }

    async function iteration(measure) {
      const R = measure ? rec : () => {};
      let t = now();
      const page = await rpc("pages.open", { url: `${RECORDS}/records`, background: true });
      R("open.ms", now() - t);
      routes.set(page.routeReason ?? "(none)", (routes.get(page.routeReason ?? "(none)") ?? 0) + 1);
      if (page.backend !== wanted) failures.push(`routed to ${page.backend} (${page.routeReason ?? "no reason"}) instead of ${wanted}`);
      const pageId = page.pageId;
      try {
        // observe — full
        t = now();
        const full = await rpc("pages.observe", { pageId });
        R("observe.full.ms", now() - t);
        R("observe.full.bytes", J(full));
        R("mcp.full.bytes", JSON.stringify(full, null, 2).length);

        // observe — compact (older runtimes strip the param and return the full form)
        t = now();
        const compact = await rpc("pages.observe", { pageId, format: "compact" });
        if (compact && compact.observation && typeof compact.observation.text === "string") {
          R("observe.compact.ms", now() - t);
          R("observe.compact.bytes", J(compact));
          R("mcp.compact.bytes", compact.observation.text.length);
        } else unsupported.add("observe.compact");

        // click via ref — "Apply filter" submits the filter form (navigates to ?status=)
        const applyRef = full.content.elements.find((e) => /apply filter/i.test(e.name ?? ""))?.ref;
        if (applyRef) {
          t = now();
          const r = await rpc("pages.execute", { program: { pageId, steps: [{ id: "c", op: "click", target: applyRef }] } });
          R("click.ref.rpc.ms", now() - t);
          if (r.steps[0]?.status === "ok") R("click.ref.step.ms", r.steps[0].durationMs);
          else failures.push(`click: ${r.steps[0]?.error?.message}`);
          const w = await rpc("pages.execute", {
            program: { pageId, steps: [{ id: "w", op: "waitFor", condition: { kind: "urlMatches", pattern: "status=" } }] },
          });
          if (w.steps[0]?.status !== "ok") failures.push(`click did not navigate: ${w.steps[0]?.error?.message}`);
        } else failures.push("click: no Apply filter ref");

        // navigate + observe
        t = now();
        await rpc("pages.navigate", { pageId, url: `${RECORDS}/new` });
        const navMs = now() - t;
        t = now();
        const obs2 = await rpc("pages.observe", { pageId });
        R("navigate.ms", navMs);
        R("navigate+observe.ms", navMs + (now() - t));

        // fill via ref
        const titleRef = obs2.content.elements.find((e) => e.tag === "input" && /title/i.test(e.name ?? ""))?.ref;
        if (titleRef) {
          t = now();
          const f = await rpc("pages.execute", {
            program: { pageId, steps: [{ id: "f", op: "fill", target: titleRef, value: "Benchmark title" }] },
          });
          R("fill.ref.rpc.ms", now() - t);
          if (f.steps[0]?.status === "ok") R("fill.ref.step.ms", f.steps[0].durationMs);
          else failures.push(`fill: ${f.steps[0]?.error?.message}`);

          // act + observe in one round trip
          t = now();
          const ao = await rpc("pages.execute", {
            program: { pageId, steps: [{ id: "f2", op: "fill", target: titleRef, value: "Benchmark title 2" }] },
            returnObservation: { format: "compact" },
          });
          if (ao && ao.observation) R("act+observe.ms", now() - t);
          else unsupported.add("act+observe");
        } else failures.push("fill: no title input ref");
      } catch (e) {
        failures.push(String(e?.message ?? e));
      } finally {
        await rpc("pages.close", { pageId }).catch(() => {});
      }
    }

    for (let i = 0; i < warmup; i++) await iteration(false);
    for (let i = 0; i < repeats; i++) await iteration(true);
  } finally {
    await rt.close().catch(() => {});
  }

  const order = [
    "open.ms",
    "observe.full.ms",
    "observe.compact.ms",
    "observe.full.bytes",
    "observe.compact.bytes",
    "mcp.full.bytes",
    "mcp.compact.bytes",
    "click.ref.step.ms",
    "click.ref.rpc.ms",
    "fill.ref.step.ms",
    "fill.ref.rpc.ms",
    "navigate.ms",
    "navigate+observe.ms",
    "act+observe.ms",
  ];
  const metrics = {};
  for (const name of order) if (samples.has(name)) metrics[name] = { ...stats(samples.get(name)), samples: samples.get(name) };
  for (const [name, xs] of samples) if (!metrics[name]) metrics[name] = { ...stats(xs), samples: xs };
  return { ...info, metrics, failures, unsupported: [...unsupported], routes: Object.fromEntries(routes) };
}

// ---- boot ----
const procs = await startFixturesIfNeeded();
await waitForFixtures();
const results = {};
try {
  for (const b of BACKENDS) {
    console.log(`\n[bench] ${b} …`);
    results[b] = await runBackend(b);
    if (results[b].skipped) console.log(`[bench] ${b}: skipped — ${results[b].skipped}`);
  }
} finally {
  procs.forEach((p) => p.kill());
}

// ---- report ----
const first = results[BACKENDS[0]];
const heldOut = await measureHeldOutAdvantage(results);
const report = {
  at: new Date().toISOString(),
  label: label || undefined,
  runtime: { entry: runtimeEntry, sha: sha(runtimeRoot) },
  harnessSha: sha(root),
  repeats,
  warmup,
  fixture: `${RECORDS}/records`,
  node: process.version,
  os: `${process.platform} ${process.arch}`,
  hardware: { arch: process.arch, memoryMb: Math.round(totalmem() / 1048576) },
  securityMode: process.env.VECTOR_ENGINE_PROFILE ?? "developer",
  requireIdentity,
  chromium: process.env.VECTOR_BROWSER_PATH ?? "(system Chrome via playwright channels)",
  backends: results,
  heldOut,
  // single-backend compatibility with earlier reports
  metrics: first?.metrics ?? {},
  unsupported: first?.unsupported ?? [],
  failures: first?.failures ?? [],
};
mkdirSync(outDir, { recursive: true });
const reportPath = join(outDir, `${report.at.replace(/[:.]/g, "-")}${label ? `-${label}` : ""}.json`);
writeFileSync(reportPath, JSON.stringify(report, null, 2));

const line = (r, width) => r.map((c, i) => (i === 0 ? c.padEnd(width[i]) : c.padStart(width[i]))).join("  ");
const table = (cols, rows) => {
  const width = cols.map((c, i) => Math.max(c.length, ...rows.map((r) => r[i].length)));
  console.log(line(cols, width));
  console.log(width.map((w) => "-".repeat(w)).join("  "));
  for (const r of rows) console.log(line(r, width));
};
const fmt = (v) => (v === undefined ? "—" : String(v));

console.log(`\nvector bench — ${label || "runtime"} @ ${report.runtime.sha} — ${repeats} repeats (${warmup} warmup) on ${report.fixture}`);
const ran = BACKENDS.filter((b) => !results[b].skipped);
if (ran.length === 2) {
  const [a, b] = ran;
  const names = [...new Set([...Object.keys(results[a].metrics), ...Object.keys(results[b].metrics)])];
  const rows = names.map((n) => {
    const ma = results[a].metrics[n];
    const mb = results[b].metrics[n];
    const ratio = ma && mb && mb.p50 ? `${(ma.p50 / mb.p50).toFixed(1)}x` : "—";
    return [n, fmt(ma?.p50), fmt(mb?.p50), fmt(ma?.mean), fmt(mb?.mean), fmt(ma?.p95), fmt(mb?.p95), ratio].map(String);
  });
  table(["metric", `${a} p50`, `${b} p50`, `${a} mean`, `${b} mean`, `${a} p95`, `${b} p95`, `${a}/${b}`], rows);
} else {
  for (const bk of ran) {
    console.log(`\n[${bk}]`);
    const rows = Object.entries(results[bk].metrics).map(([name, m]) => [name, m.n, m.mean, m.p50, m.p95, m.min, m.max].map(String));
    table(["metric", "n", "mean", "p50", "p95", "min", "max"], rows);
  }
}
for (const bk of BACKENDS) {
  const r = results[bk];
  if (r.skipped) console.log(`\n${bk}: not run — ${r.skipped}`);
  if (r.routes && Object.keys(r.routes).length) console.log(`\n${bk} routes: ${Object.entries(r.routes).map(([k, v]) => `${k}=${v}`).join(", ")}`);
  if (r.unsupported?.length) console.log(`${bk} unsupported: ${r.unsupported.join(", ")}`);
  if (r.failures?.length) console.log(`${bk} failures (${r.failures.length}): ${[...new Set(r.failures)].slice(0, 5).join(" | ")}`);
}
console.log(`\nreport: ${reportPath}`);
if (heldOut?.measured) {
  writeFileSync(join(outDir, "held-out-latest.json"), JSON.stringify(heldOut, null, 2));
  console.log(
    `held-out ${heldOut.metric}: chromium p95 ${heldOut.baseline.p95Ms} ms, engine p95 ${heldOut.candidate.p95Ms} ms, p95Ratio ${heldOut.p95Ratio?.toFixed?.(2) ?? heldOut.p95Ratio}, meetsStretch ${heldOut.meetsStretch}`,
  );
} else if (heldOut?.reason) {
  console.log(`held-out: not measured — ${heldOut.reason}`);
}
const identityFail = BACKENDS.some((bk) => {
  const r = results[bk];
  return (r.failures?.length ?? 0) > 0 || (requireIdentity && r.skipped);
});
process.exit(identityFail ? 1 : 0);
