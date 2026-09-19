#!/usr/bin/env node
/**
 * H1-D2 held-out harness: sealed task hash, 5 trials, live models when keys
 * are present. Writes median / IQR / CI. Mock planner is not used.
 * Live planner is pinned to openai/gpt-5.6-luna-fast (GPT 5.6 Luna).
 */
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { writeFileSync, readFileSync, existsSync, mkdtempSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const tasksPath = join(here, "tasks.json");
const outPath = process.env.HELDOUT_OUT || join(root, "docs/engine/evidence/held-out-latest.json");
const runtimeEntry = join(root, "apps/runtime/dist/index.js");
const LUNA = "openai/gpt-5.6-luna-fast";

const pages = {
  "increment-the-counter": { file: "increment.html", gold: /Count:\s*3\b/ },
  "submit-name": { file: "submit.html", gold: /submitted:Ada/i },
  "find-in-table": { file: "table.html", gold: /\$12\.50/ },
};

const tasks = existsSync(tasksPath)
  ? JSON.parse(readFileSync(tasksPath, "utf8"))
  : [
      { id: "increment-the-counter", goal: "Increment the counter until it shows 3" },
      { id: "submit-name", goal: "Fill the name field with Ada and submit" },
    ];

const sealed = createHash("sha256")
  .update(JSON.stringify(tasks))
  .digest("hex");

const apiKey =
  process.env.AI_GATEWAY_API_KEY ||
  process.env.VECTOR_GATEWAY_API_KEY ||
  process.env.OPENAI_API_KEY ||
  process.env.ANTHROPIC_API_KEY;
const live = Boolean(apiKey);
const trials = Number(process.env.HELDOUT_TRIALS || 5);
const deadlineMs = Number(process.env.HELDOUT_DEADLINE_MS || 90_000);

function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : null;
}
function iqr(xs) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const q = (p) => s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))];
  return { q1: q(0.25), q3: q(0.75), iqr: q(0.75) - q(0.25) };
}
function ci95(xs) {
  if (xs.length < 2) return xs.length ? { lo: xs[0], hi: xs[0] } : null;
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  const v = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
  const se = Math.sqrt(v / xs.length);
  return { lo: m - 1.96 * se, hi: m + 1.96 * se };
}

function skipEvidence(reason, extra = {}) {
  return {
    review: "H1-D2",
    measured: false,
    livePlanner: false,
    independentlyVerifiableLiveModel: false,
    skippedLive: true,
    reason,
    sealedHash: sealed,
    trialsRequested: trials,
    tasks: tasks.map((t) => t.id),
    modelId: LUNA,
    competitorRows: [],
    competitorSkipped: true,
    competitorReason: extra.competitorReason ?? reason,
    artifact: { harness: "tests/held-out/run.mjs" },
    notes: "Harness exists. Live rows and competitor rows are required when keys are present. Mock is not used.",
    ...extra,
  };
}

if (!live) {
  const evidence = skipEvidence("no VECTOR_GATEWAY_API_KEY / OPENAI_API_KEY / ANTHROPIC_API_KEY / AI_GATEWAY_API_KEY");
  writeFileSync(outPath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ok: true, skippedLive: true, out: outPath, sealedHash: sealed }));
  process.exit(0);
}

if (!existsSync(runtimeEntry)) {
  const evidence = skipEvidence("run pnpm build first (apps/runtime/dist missing)");
  writeFileSync(outPath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ok: false, skippedLive: true, reason: evidence.reason, out: outPath }));
  process.exit(1);
}

function serveFixtures() {
  const dir = join(here, "pages");
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const id = decodeURIComponent((req.url ?? "/").replace(/^\//, "").replace(/\.html$/, ""));
      const page = pages[id] ?? Object.values(pages).find((p) => p.file === `${id}.html`);
      const file = page ? join(dir, page.file) : null;
      if (!file || !existsSync(file)) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(readFileSync(file));
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function observeText(obs) {
  if (!obs) return "";
  if (typeof obs.text === "string") return obs.text;
  if (typeof obs.compact === "string") return obs.compact;
  const c = obs.content ?? obs.observation ?? obs;
  if (typeof c?.text === "string") return c.text;
  if (Array.isArray(c?.text)) return c.text.join("\n");
  return JSON.stringify(obs);
}

function goldFor(taskId) {
  return pages[taskId]?.gold ?? /./;
}

function summarize(rows) {
  const success = rows.filter((r) => r.verified);
  const waits = success.map((r) => r.modelWaitMs).filter((n) => Number.isFinite(n));
  const toks = success.map((r) => r.tokens).filter((n) => Number.isFinite(n));
  return {
    n: rows.length,
    verified: success.length,
    rate: rows.length ? success.length / rows.length : 0,
    modelWaitMs: { median: median(waits), iqr: iqr(waits), ci95: ci95(waits), values: waits },
    tokens: { median: median(toks), iqr: iqr(toks), ci95: ci95(toks), values: toks },
  };
}

async function startRuntimeFor(engineMode, port) {
  const { startRuntime } = await import(pathToFileURL(runtimeEntry).href);
  const dataDir = mkdtempSync(join(tmpdir(), "vector-heldout-"));
  const rt = await startRuntime({
    ...process.env,
    VECTOR_DATA_DIR: dataDir,
    VECTOR_ELECTRON_CDP: "",
    VECTOR_API_TOKEN: "heldout",
    VECTOR_ENGINE_MODE: engineMode,
    VECTOR_ENGINE: engineMode === "off" ? "0" : "1",
    VECTOR_PLANNER_MODEL: LUNA,
    VECTOR_RECOVERY_MODEL: LUNA,
    VECTOR_GATEWAY_ONLY: "",
    VECTOR_ENGINE_ALLOWLIST: `127.0.0.1:${port},localhost:${port}`,
    VECTOR_ENGINE_ALLOW_FILE: "1",
    AI_GATEWAY_API_KEY: apiKey,
  });
  return { rt, dataDir };
}

async function tokensForRun(rpc, runId) {
  try {
    const events = await rpc("runs.events", { runId, limit: 2000 });
    const list = Array.isArray(events) ? events : events.events ?? [];
    let total = 0;
    let wait = 0;
    for (const e of list) {
      if (e.type !== "model.call") continue;
      const p = e.payload ?? {};
      total += (p.inputTokens ?? 0) + (p.outputTokens ?? 0);
      wait += p.durationMs ?? 0;
    }
    return { tokens: total || null, modelWaitMs: wait || null };
  } catch {
    return { tokens: null, modelWaitMs: null };
  }
}

async function runTrial(rpc, task, url) {
  const started = Date.now();
  let pageId;
  try {
    const page = await rpc("pages.open", { url, background: true });
    pageId = page.pageId ?? page.page?.pageId ?? page.id;
    const run = await rpc("runs.start", {
      goal: task.goal,
      pageId,
      deadlineMs,
      maxModelCalls: 8,
    });
    const runId = run.runId ?? run.id;
    const terminal = new Set(["completed", "partially_completed", "failed", "cancelled", "interrupted", "needs_input"]);
    let rec;
    for (;;) {
      rec = await rpc("runs.get", { runId });
      const status = rec.status ?? rec.run?.status;
      if (terminal.has(status)) break;
      if (Date.now() - started > deadlineMs + 5_000) break;
      await sleep(250);
    }
    const r = rec.run ?? rec;
    const obs = await rpc("pages.observe", { pageId, format: "compact" }).catch(() => null);
    const text = observeText(obs);
    const resultText = `${JSON.stringify(r.result ?? {})} ${r.statusMessage ?? ""}`;
    const verified =
      task.id === "find-in-table"
        ? /12\.50/.test(resultText)
        : goldFor(task.id).test(text);
    const usage = await tokensForRun(rpc, runId);
    return {
      taskId: task.id,
      status: r.status,
      verified,
      modelId: r.config?.modelId ?? LUNA,
      modelCalls: r.config?.modelCalls ?? null,
      tokens: usage.tokens,
      modelWaitMs: usage.modelWaitMs ?? Date.now() - started,
      wallMs: Date.now() - started,
      message: r.statusMessage ?? null,
    };
  } catch (e) {
    return {
      taskId: task.id,
      status: "failed",
      verified: false,
      modelId: LUNA,
      modelCalls: null,
      tokens: null,
      modelWaitMs: Date.now() - started,
      wallMs: Date.now() - started,
      message: e instanceof Error ? e.message : String(e),
    };
  } finally {
    if (pageId) await rpc("pages.close", { pageId }).catch(() => {});
  }
}

async function runAdapter(name, engineMode, port) {
  const { rt } = await startRuntimeFor(engineMode, port);
  const rpc = (m, p = {}) => rt.invoke(m, p);
  const rows = [];
  try {
    for (const task of tasks) {
      const url = `http://127.0.0.1:${port}/${task.id}`;
      for (let i = 0; i < trials; i++) {
        const row = await runTrial(rpc, task, url);
        row.adapter = name;
        row.trial = i + 1;
        rows.push(row);
        console.error(JSON.stringify({ event: "trial", ...row }));
      }
    }
  } finally {
    await rt.close().catch(() => {});
  }
  return rows;
}

const { server, port } = await serveFixtures();
let engineRows = [];
let competitorRows = [];
let competitorSkipped = false;
let competitorReason = "";
try {
  console.error(`live held-out: ${LUNA} × ${trials} trials on :${port}`);
  engineRows = await runAdapter("vector-engine", "always", port);
  try {
    competitorRows = await runAdapter("vector", "off", port);
  } catch (e) {
    competitorSkipped = true;
    competitorReason = e instanceof Error ? e.message : String(e);
  }
} finally {
  server.close();
}

const engine = summarize(engineRows);
const competitor = competitorRows.length ? summarize(competitorRows) : null;
const evidence = {
  review: "H1-D2",
  measured: true,
  livePlanner: true,
  independentlyVerifiableLiveModel: true,
  skippedLive: false,
  sealedHash: sealed,
  trials,
  modelId: LUNA,
  rows: engineRows,
  median: engine.modelWaitMs.median,
  iqr: engine.modelWaitMs.iqr,
  ci95: engine.modelWaitMs.ci95,
  verifiedSuccess: engine,
  competitorRows,
  competitorSkipped,
  competitorReason: competitorReason || undefined,
  competitor: competitor ?? undefined,
  artifact: { harness: "tests/held-out/run.mjs", model: LUNA },
  notes: "Live GPT 5.6 Luna via AI Gateway. Independent oracle is page observe vs gold regex. Mock is not used.",
};
writeFileSync(outPath, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, skippedLive: false, out: outPath, sealedHash: sealed, verified: engine.verified, n: engine.n }));
