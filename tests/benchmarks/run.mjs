#!/usr/bin/env node
/**
 * Vector browser-layer benchmark (`pnpm bench`).
 *
 * Starts the fixture servers if they are not already serving, launches the
 * standalone runtime (headless Chromium — set VECTOR_BROWSER_PATH when no
 * system Chrome is installed), and times N repeats of the hot path against
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
 * Prints a table and writes tests/benchmarks/reports/<timestamp>.json.
 *
 *   node tests/benchmarks/run.mjs [--repeats 10] [--warmup 1] [--label name]
 *        [--runtime path/to/apps/runtime/dist/index.js] [--out dir]
 *
 * `--runtime` lets the same harness measure another checkout (e.g. a base
 * commit's worktree) for before/after comparisons.
 */
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execSync } from "node:child_process";
import { startFixturesIfNeeded, waitForFixtures } from "../../scripts/fixtures.mjs";

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

const sha = (dir) => {
  try {
    return execSync("git rev-parse --short HEAD", { cwd: dir, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "unknown";
  }
};
const runtimeRoot = resolve(dirname(runtimeEntry), "../../..");

// ---- metrics ----
const samples = new Map();
const rec = (name, value) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return;
  if (!samples.has(name)) samples.set(name, []);
  samples.get(name).push(name.endsWith(".ms") ? +value.toFixed(1) : value);
};
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
const failures = [];
const unsupported = new Set();

// ---- boot ----
const procs = await startFixturesIfNeeded();
await waitForFixtures();
const { startRuntime } = await import(pathToFileURL(runtimeEntry).href);
const rt = await startRuntime({
  ...process.env,
  VECTOR_DATA_DIR: mkdtempSync(join(tmpdir(), "vector-bench-")),
  VECTOR_ELECTRON_CDP: "",
  VECTOR_API_TOKEN: "bench",
});
const rpc = (m, p = {}) => rt.invoke(m, p);

async function iteration(measure) {
  const R = measure ? rec : () => {};
  let t = now();
  const page = await rpc("pages.open", { url: `${RECORDS}/records`, background: true });
  R("open.ms", now() - t);
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
      await rpc("pages.execute", {
        program: { pageId, steps: [{ id: "w", op: "waitFor", condition: { kind: "urlMatches", pattern: "status=" } }] },
      });
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

try {
  for (let i = 0; i < warmup; i++) await iteration(false);
  for (let i = 0; i < repeats; i++) await iteration(true);
} finally {
  await rt.close().catch(() => {});
  procs.forEach((p) => p.kill());
}

// ---- report ----
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

const report = {
  at: new Date().toISOString(),
  label: label || undefined,
  runtime: { entry: runtimeEntry, sha: sha(runtimeRoot) },
  harnessSha: sha(root),
  repeats,
  warmup,
  fixture: `${RECORDS}/records`,
  node: process.version,
  unsupported: [...unsupported],
  failures,
  metrics,
};
mkdirSync(outDir, { recursive: true });
const reportPath = join(outDir, `${report.at.replace(/[:.]/g, "-")}${label ? `-${label}` : ""}.json`);
writeFileSync(reportPath, JSON.stringify(report, null, 2));

const cols = ["metric", "n", "mean", "p50", "p95", "min", "max"];
const rows = Object.entries(metrics).map(([name, m]) => [name, m.n, m.mean, m.p50, m.p95, m.min, m.max].map(String));
const width = cols.map((c, i) => Math.max(c.length, ...rows.map((r) => r[i].length)));
const line = (r) => r.map((c, i) => (i === 0 ? c.padEnd(width[i]) : c.padStart(width[i]))).join("  ");
console.log(`\nvector bench — ${label || "runtime"} @ ${report.runtime.sha} — ${repeats} repeats (${warmup} warmup) on ${report.fixture}`);
console.log(line(cols));
console.log(width.map((w) => "-".repeat(w)).join("  "));
for (const r of rows) console.log(line(r));
if (unsupported.size) console.log(`\nunsupported by this runtime: ${[...unsupported].join(", ")}`);
if (failures.length) console.log(`\nfailures (${failures.length}): ${[...new Set(failures)].slice(0, 5).join(" | ")}`);
console.log(`\nreport: ${reportPath}`);
process.exit(0);
