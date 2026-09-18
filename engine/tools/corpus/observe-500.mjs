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
    reason: "VECTOR_CORPUS_LIVE!=1 (no network fetch in this run)",
    observe: { p50Ms: null, p95Ms: null },
    capabilityUnsupportedRate: null,
    artifact: { corpus: "engine/conformance/public-corpus-500.json", harness: "engine/tools/corpus/observe-500.mjs" },
  };
  writeFileSync(out, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ok: true, skippedLive: true, urls: corpus.count, out }));
  process.exit(0);
}

console.error("live corpus fetch not implemented in this offline agent environment");
process.exit(2);
