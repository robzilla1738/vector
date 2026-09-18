#!/usr/bin/env node
/**
 * H1-D3: walk public-corpus-500.json and record observe p50/p95 + unsupported rate.
 * Offline: writes a skipped-live evidence file (URLs are real; fetches need network).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const corpus = JSON.parse(
  readFileSync(join(here, "../../conformance/public-corpus-500.json"), "utf8"),
);
const out = process.env.CORPUS_OUT || join(here, "../../../docs/engine/evidence/corpus-500-latest.json");
const live = process.env.VECTOR_CORPUS_LIVE === "1";

if (!live) {
  const evidence = {
    backend: "vector-engine",
    purpose: "H1-D3 routing/quality number — not a license to delete Chromium",
    urls: corpus.count,
    live: false,
    skippedLive: true,
    reason: "VECTOR_CORPUS_LIVE!=1 — live fetch skipped. Engine observe p50/p95 are written by ve-api::writes_corpus_observe_and_layout_triage",
    observe: { p50Ms: null, p95Ms: null },
    capabilityUnsupportedRate: null,
    artifact: {
      corpus: "engine/conformance/public-corpus-500.json",
      harness: "engine/tools/corpus/observe-500.mjs",
      test: "shell::tests::writes_corpus_observe_and_layout_triage",
    },
  };
  writeFileSync(out, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ok: true, skippedLive: true, urls: corpus.count, out, measuredBy: "cargo test -p ve-api writes_corpus_observe_and_layout_triage" }));
  process.exit(0);
}

const samples = [];
let unsupported = 0;
for (const url of corpus.urls) {
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 4000);
    const res = await fetch(url, { signal: ac.signal, redirect: "follow" });
    clearTimeout(t);
    if (!res.ok) unsupported += 1;
    else samples.push(1);
  } catch {
    unsupported += 1;
  }
}
samples.sort((a, b) => a - b);
const evidence = {
  backend: "vector-engine",
  purpose: "H1-D3 routing/quality number — not a license to delete Chromium",
  urls: corpus.count,
  live: true,
  skippedLive: false,
  observe: { p50Ms: null, p95Ms: null, note: "fetch-only live probe; engine observe numbers come from the Rust test" },
  capabilityUnsupportedRate: unsupported / corpus.count,
  artifact: { corpus: "engine/conformance/public-corpus-500.json", harness: "engine/tools/corpus/observe-500.mjs" },
};
writeFileSync(out, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, live: true, unsupported, urls: corpus.count, out }));
