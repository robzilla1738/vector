#!/usr/bin/env node
/**
 * Held-out, local-only relevance and resource probe for protected content recall.
 * Run after `pnpm build`: node tests/benchmarks/content-memory-retrieval.mjs
 * Add --check-baseline to gate lexical recall, negative queries, and Forget.
 * No real browsing data or model provider is used.
 */
import { performance } from "node:perf_hooks";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ContentMemoryStore } from "../../apps/runtime/dist/services/content-memory.js";
import { EventBus, openDb, Repo, TaskService } from "../../apps/runtime/dist/index.js";

const root = dirname(fileURLToPath(import.meta.url));
const fixture = JSON.parse(readFileSync(join(root, "fixtures/content-memory-retrieval.json"), "utf8"));
const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index < 0 ? fallback : args[index + 1];
};
const corpusSize = Number(option("corpus", "500"));
if (!Number.isSafeInteger(corpusSize) || corpusSize < fixture.documents.length || corpusSize > 500)
  throw new Error(`--corpus must be between ${fixture.documents.length} and 500`);
const out = option("out", undefined);
const percentile = (samples, fraction) => {
  const sorted = [...samples].sort((a, b) => a - b);
  return Math.round(sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)] * 100) / 100;
};
const ratio = (numerator, denominator) =>
  denominator ? Math.round((numerator / denominator) * 1000) / 1000 : 0;
const db = openDb(":memory:");
const repo = new Repo(db);
const workspaceId = new TaskService(repo, new EventBus(repo)).createWorkspace("Held-out recall").workspaceId;
const secretStore = new Map();
const native = {
  readSecret: async (name) => ({ value: secretStore.get(name) }),
  storeSecret: async (name, value) => {
    secretStore.set(name, value);
  },
};
const profileId = "retrieval-benchmark-profile";
let memory = new ContentMemoryStore(repo, native, profileId);
const origin = "https://retrieval-benchmark.invalid";
memory.setPolicy(workspaceId, { enabled: true, retentionDays: 30, allowedOrigins: [origin] });
const docIds = new Set(fixture.documents.map((doc) => doc.id));
if (
  docIds.size !== fixture.documents.length ||
  fixture.questions.some((q) => q.relevant.some((id) => !docIds.has(id)))
)
  throw new Error("Retrieval fixture has duplicate documents or an unknown relevance label.");
const urlFor = (id) => `${origin}/${encodeURIComponent(id)}`;
const idFor = (result) => decodeURIComponent(new URL(result.url).pathname.slice(1));
const documents = [...fixture.documents];
for (let index = documents.length; index < corpusSize; index++)
  documents.push({
    id: `distractor-${index}`,
    title: `Administrative archive ${index}`,
    text:
      `Archive entry ${index} records stationery inventory, meeting room furniture, and desk assignments. ` +
      `The record belongs to an unrelated administrative collection and has reference number ${index}.`,
  });
const allIds = new Set(documents.map((doc) => doc.id));

let report;
try {
  const ingestStarted = performance.now();
  for (const doc of documents)
    await memory.saveEligible({
      workspaceId,
      pageId: `fixture-${doc.id}`,
      documentEpoch: 1,
      url: urlFor(doc.id),
      title: doc.title,
      text: doc.text,
    });
  const ingestMs = performance.now() - ingestStarted;
  const pageCount = db.prepare("PRAGMA page_count").get().page_count;
  const pageSize = db.prepare("PRAGMA page_size").get().page_size;
  const encryptedBytes = db
    .prepare("SELECT coalesce(sum(length(ciphertext)),0) AS bytes FROM content_memory")
    .get().bytes;
  // A new instance has no decrypted index. The first query measures index build.
  memory.close();
  memory = new ContentMemoryStore(repo, native, profileId);
  const coldCpuBefore = process.cpuUsage();
  const coldAt = performance.now();
  await memory.search(workspaceId, fixture.questions[0].query, 5);
  const coldMs = performance.now() - coldAt;
  const coldCpu = process.cpuUsage(coldCpuBefore);
  const samples = [];
  const results = [];
  const cpuBefore = process.cpuUsage();
  for (const question of fixture.questions) {
    const started = performance.now();
    const matches = await memory.search(workspaceId, question.query, 5);
    samples.push(performance.now() - started);
    const ranked = matches.map(idFor);
    if (matches.some((match) => new URL(match.url).origin !== origin) || ranked.some((id) => !allIds.has(id)))
      throw new Error("Search returned a source outside the benchmark corpus.");
    const rank = ranked.findIndex((id) => question.relevant.includes(id)) + 1;
    results.push({
      language: question.language,
      kind: question.kind,
      query: question.query,
      relevant: question.relevant,
      ranked,
      rank,
    });
  }
  const cpu = process.cpuUsage(cpuBefore);
  const positive = results.filter((result) => result.relevant.length);
  const lexical = positive.filter((result) => result.kind === "lexical");
  const negative = results.filter((result) => result.kind === "negative");
  const scores = (subset) => ({
    count: subset.length,
    recallAt1: ratio(subset.filter((result) => result.rank === 1).length, subset.length),
    recallAt3: ratio(subset.filter((result) => result.rank > 0 && result.rank <= 3).length, subset.length),
    recallAt5: ratio(subset.filter((result) => result.rank > 0 && result.rank <= 5).length, subset.length),
    mrrAt5: ratio(
      subset.reduce((sum, result) => sum + (result.rank ? 1 / result.rank : 0), 0),
      subset.length,
    ),
  });
  const byLanguage = Object.fromEntries(
    [...new Set(positive.map((result) => result.language))].map((language) => [
      language,
      scores(positive.filter((result) => result.language === language)),
    ]),
  );
  const source = fixture.documents.find((doc) => doc.id === "bike-returns");
  const saved = (await memory.search(workspaceId, source.title, 5)).find(
    (result) => idFor(result) === source.id,
  );
  if (!saved) throw new Error("Forget benchmark source was not retrievable before deletion.");
  const forgotten = memory.forget(workspaceId, saved.memoryId);
  memory.close();
  memory = new ContentMemoryStore(repo, native, profileId);
  const afterRestart = await memory.search(workspaceId, source.title, 5);
  const forgetSurvivedRestart =
    forgotten === 1 &&
    !afterRestart.some((result) => idFor(result) === source.id) &&
    (await memory.get(workspaceId, saved.memoryId)) === undefined;
  report = {
    fixture: "curated, synthetic, held-out questions; no real-site corpus",
    corpusSize,
    queryCount: results.length,
    quality: {
      all: scores(positive),
      lexical: scores(lexical),
      byLanguage,
      negativeEmptyRate: ratio(negative.filter((result) => !result.ranked.length).length, negative.length),
    },
    resources: {
      ingestMs: Math.round(ingestMs),
      coldIndexMs: Math.round(coldMs * 100) / 100,
      warmP50Ms: percentile(samples, 0.5),
      warmP95Ms: percentile(samples, 0.95),
      coldCpuMs: Math.round((coldCpu.user + coldCpu.system) / 1000),
      queryCpuMs: Math.round((cpu.user + cpu.system) / 1000),
      encryptedBytes,
      sqlitePageBytes: pageCount * pageSize,
      rssMb: Math.round(process.memoryUsage().rss / 1048576),
      energyJoules: null,
      energyNote: "No portable per-process energy counter is available in this local harness.",
    },
    forgetSurvivedRestart,
    results,
  };
} finally {
  memory.close();
  db.close();
}
if (out) {
  const path = resolve(out);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(report, null, 2));
if (
  args.includes("--check-baseline") &&
  (report.quality.lexical.recallAt3 < 0.9 ||
    report.quality.negativeEmptyRate !== 1 ||
    !report.forgetSurvivedRestart)
)
  process.exitCode = 1;
