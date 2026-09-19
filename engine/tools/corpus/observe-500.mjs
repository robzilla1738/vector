#!/usr/bin/env node
/**
 * H1-D3: walk public-corpus-500.json and record live fetch + unsupported rate.
 * Merges into an existing evidence file so Rust observe numbers are kept.
 * Offline: writes a skipped-live stub (URLs are real; fetches need network).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const corpus = JSON.parse(
  readFileSync(join(here, "../../conformance/public-corpus-500.json"), "utf8"),
);
const out =
  process.env.CORPUS_OUT ||
  join(here, "../../../docs/engine/evidence/corpus-500-latest.json");
const live = process.env.VECTOR_CORPUS_LIVE === "1";
const htmlDir = process.env.VECTOR_LIVE_HTML || "/tmp/vector-live-html";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const CONCURRENCY = Number(process.env.VECTOR_CORPUS_CONCURRENCY || 16);
const TIMEOUT_MS = Number(process.env.VECTOR_CORPUS_TIMEOUT_MS || 8000);
const RETRIES = Number(process.env.VECTOR_CORPUS_RETRIES || 1);

function readExisting() {
  if (!existsSync(out)) return {};
  try {
    return JSON.parse(readFileSync(out, "utf8"));
  } catch {
    return {};
  }
}

function writeMerged(patch) {
  const existing = readExisting();
  const evidence = {
    ...existing,
    backend: "vector-engine",
    purpose: "H1-D3 routing/quality number — not a license to delete Chromium",
    urls: corpus.count,
    artifact: {
      corpus: "engine/conformance/public-corpus-500.json",
      harness: "engine/tools/corpus/observe-500.mjs",
      test: "shell::tests::writes_corpus_observe_and_layout_triage",
      ...(existing.artifact || {}),
    },
    ...patch,
  };
  writeFileSync(out, `${JSON.stringify(evidence, null, 2)}\n`);
  return evidence;
}

if (!live) {
  writeMerged({
    live: existingLive(readExisting()),
    skippedLive: !existingLive(readExisting()),
    reason: existingLive(readExisting())
      ? undefined
      : "VECTOR_CORPUS_LIVE!=1 — live fetch skipped. Engine observe p50/p95 are written by ve-api::observes_live_fetched_html_when_present",
  });
  console.log(
    JSON.stringify({
      ok: true,
      skippedLive: !existingLive(readExisting()),
      urls: corpus.count,
      out,
      measuredBy: "cargo test -p ve-api observes_live_fetched_html_when_present",
    }),
  );
  process.exit(0);
}

function existingLive(doc) {
  return Boolean(doc.liveFetch);
}

async function fetchOnce(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent": UA,
      accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return { text, finalUrl: res.url, status: res.status };
}

async function fetchWithRetry(url) {
  let last;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      const t0 = performance.now();
      const got = await fetchOnce(url);
      return { ok: true, ms: performance.now() - t0, ...got };
    } catch (e) {
      last = String(e.message ?? e);
    }
  }
  return { ok: false, error: last };
}

async function mapPool(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

const t0 = performance.now();
mkdirSync(htmlDir, { recursive: true });
const results = await mapPool(corpus.urls, CONCURRENCY, async (url, idx) => {
  const r = await fetchWithRetry(url);
  if (r.ok && r.text) {
    const name = String(idx).padStart(3, "0");
    writeFileSync(join(htmlDir, `${name}.html`), r.text);
  }
  return { url, ...r };
});
const elapsedSec = (performance.now() - t0) / 1000;
const ok = results.filter((r) => r.ok);
const failed = results.filter((r) => !r.ok);
const times = ok.map((r) => r.ms).sort((a, b) => a - b);
const pct = (p) => {
  if (!times.length) return 0;
  return times[Math.round((times.length - 1) * p)];
};

const evidence = writeMerged({
  live: true,
  skippedLive: false,
  capabilityUnsupportedRate: failed.length / corpus.count,
  liveFetch: {
    n: corpus.count,
    ok: ok.length,
    failed: failed.length,
    elapsedSec,
    p50Ms: pct(0.5),
    p95Ms: pct(0.95),
    retries: RETRIES,
    concurrency: CONCURRENCY,
    htmlDir,
    failedUrls: failed.slice(0, 32).map((f) => ({ url: f.url, error: f.error })),
  },
});

console.log(
  JSON.stringify({
    ok: true,
    live: true,
    fetched: ok.length,
    failed: failed.length,
    rate: evidence.capabilityUnsupportedRate,
    elapsedSec,
    out,
    htmlDir,
  }),
);
