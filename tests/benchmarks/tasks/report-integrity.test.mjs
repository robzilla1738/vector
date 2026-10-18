import assert from "node:assert/strict";
import { test } from "node:test";
import {
  abReadiness,
  benchmarkInfrastructureFailure,
  candidateReadiness,
  corpusFingerprint,
  coverage,
  modelAttribution,
  summarizeIntents,
  readRunMetrics,
  summarizeObservedMetrics,
} from "./report-integrity.mjs";

const model = "meta/muse-spark-1.3-contributor";
const ids = Array.from({ length: 50 }, (_, i) => `L${i + 1}`);
const rows = ids.flatMap((id) =>
  [1, 2, 3].map((trial) => ({
    id,
    trial,
    score: 1,
    modelCalls: 1,
    modelCallEvents: 1,
    runtimeModel: model,
    durableIntents: { unresolved: 0, ids: [] },
  })),
);
const ready = (changes = {}) =>
  candidateReadiness({
    suiteName: "local",
    selectedIds: ids,
    allIds: ids,
    trials: 3,
    adapterName: "aux-loop",
    rows,
    engine: "agent-loop",
    budget: 16,
    model,
    ...changes,
  });

test("corpus fingerprint changes with answer and oracle definitions", () => {
  const corpus = { tasks: [{ id: "L01", expected: { value: "a" }, oracle: null }] };
  assert.notEqual(
    corpusFingerprint(corpus),
    corpusFingerprint({ tasks: [{ ...corpus.tasks[0], expected: { value: "b" } }] }),
  );
});

test("gate candidate requires full scored coverage, known engine, and known budget", () => {
  assert.equal(ready().ready, true);
  assert.equal(ready({ selectedIds: ids.slice(0, 1), rows: rows.slice(0, 3) }).ready, false);
  assert.equal(ready({ rows: [...rows, rows[0]] }).ready, false);
  assert.equal(ready({ rows: rows.slice(1) }).ready, false);
  assert.equal(ready({ rows: [{ ...rows[0], score: null }, ...rows.slice(1)] }).ready, false);
  assert.equal(ready({ trials: 2 }).ready, false);
  assert.equal(ready({ engine: "agent" }).ready, false);
  assert.equal(ready({ budget: null }).ready, false);
  assert.equal(ready({ rows: [{ ...rows[0], durableIntents: null }, ...rows.slice(1)] }).ready, false);
  assert.equal(ready({ rows: [{ ...rows[0], runtimeModel: null }, ...rows.slice(1)] }).ready, false);
  assert.equal(ready({ rows: [{ ...rows[0], modelCallEvents: 0 }, ...rows.slice(1)] }).ready, false);
  assert.equal(coverage(rows, ids, 3), true);
});

test("observed model-call events resolve the default model and reject mixed routes", () => {
  const call = (modelId) => ({ type: "model.call", payload: { modelId } });
  assert.deepEqual(modelAttribution([{ type: "run.status", payload: {} }, call(model), call(model)]), {
    runtimeModel: model,
    modelCallEvents: 2,
    modelIds: [model],
  });
  assert.equal(modelAttribution([call(model), call("openai/other")]).runtimeModel, null);
  assert.equal(modelAttribution([call(model), call(undefined)]).runtimeModel, null);
  assert.equal(modelAttribution([]).runtimeModel, null);
});

test("wrapper timeout aborts before scoring; an attributed run deadline stays a task result", () => {
  assert.equal(
    benchmarkInfrastructureFailure("task timeout after 180000 ms"),
    "Benchmark wrapper timed out before run attribution",
  );
  assert.equal(benchmarkInfrastructureFailure("run deadline exceeded (175000ms)"), null);
  assert.equal(
    benchmarkInfrastructureFailure("benchmark receipt attribution failed: database closed"),
    "Durable receipt attribution failed",
  );
});

test("durable receipt summary exposes statuses without evidence or values", () => {
  const summary = summarizeIntents([
    { id: "intent-1", status: "confirmed", evidence: "secret" },
    { id: "intent-2", status: "uncertain", evidence: "private" },
  ]);
  assert.equal(summary.unresolved, 1);
  assert.deepEqual(summary.ids, [
    { id: "intent-1", status: "confirmed" },
    { id: "intent-2", status: "uncertain" },
  ]);
  assert.equal(JSON.stringify(summary).includes("secret"), false);
});

test("A/B eligibility rejects unequal effective budgets and missing planner", () => {
  const adapter = (engine, budget) => ({
    readiness: { ready: true },
    rows: [{ engine, modelCallBudget: budget, runtimeModel: "meta/muse-spark-1.3-contributor" }],
  });
  const report = {
    suite: "local",
    model: "meta/muse-spark-1.3-contributor",
    complete: true,
    valid: true,
    adapters: {
      aux: adapter("agent", 16),
      "aux-loop": adapter("agent-loop", 16),
    },
  };
  assert.equal(abReadiness(report).ready, true);
  assert.equal(
    abReadiness({ ...report, adapters: { ...report.adapters, "aux-loop": adapter("agent-loop", 60) } }).ready,
    false,
  );
  assert.equal(
    abReadiness({ ...report, adapters: { "aux-loop": report.adapters["aux-loop"] } }).ready,
    false,
  );
  assert.equal(abReadiness({ ...report, complete: false }).ready, false);
});

test("synthetic 50×3 A/B report is ready only with matching observed model and budgets", () => {
  const adapter = (name, engine, budget, adapterRows = rows) => ({
    rows: adapterRows.map((row) => ({ ...row, engine, modelCallBudget: budget })),
    readiness: candidateReadiness({
      suiteName: "local",
      selectedIds: ids,
      allIds: ids,
      trials: 3,
      adapterName: name,
      rows: adapterRows,
      engine,
      budget,
      model,
    }),
  });
  const report = {
    suite: "local",
    model,
    complete: true,
    valid: true,
    adapters: {
      aux: adapter("aux", "agent", 16),
      "aux-loop": adapter("aux-loop", "agent-loop", 16),
    },
  };
  assert.equal(abReadiness(report).ready, true);
  const mixed = [{ ...rows[0], runtimeModel: "openai/other" }, ...rows.slice(1)];
  assert.equal(
    abReadiness({
      ...report,
      adapters: { ...report.adapters, "aux-loop": adapter("aux-loop", "agent-loop", 16, mixed) },
    }).ready,
    false,
  );
  assert.equal(
    abReadiness({
      ...report,
      adapters: { ...report.adapters, "aux-loop": adapter("aux-loop", "agent-loop", 8) },
    }).ready,
    false,
  );
});

function eventPages(events, pageSize = 1) {
  const requests = [];
  const rpc = async (method, params) => {
    assert.equal(method, "runs.events");
    assert.equal(params.runId, "original-run");
    assert.equal(params.streamId, params.sinceSeq ? "original-stream" : undefined);
    requests.push(params.sinceSeq);
    const page = events.filter((event) => event.seq > params.sinceSeq).slice(0, pageSize);
    return {
      streamId: "original-stream",
      events: page,
      lastSeq: page.at(-1)?.seq ?? params.sinceSeq,
    };
  };
  return { rpc, requests };
}
const modelEvent = (seq, payload = {}) => ({
  seq,
  type: "model.call",
  payload: { modelId: model, role: "agent", ...payload },
});

test("paged original model events retain actual cost, zero, duration and exact cache without raw metadata", async () => {
  const source = eventPages([
    modelEvent(1, {
      durationMs: 120,
      inputTokens: 10,
      outputTokens: 2,
      costUsd: 0.03,
      costEstimated: false,
      providerMetadata: {
        usage: { cachedInputTokens: 0 },
        secret: "never export",
      },
    }),
    modelEvent(3, {
      durationMs: 0,
      inputTokens: 20,
      outputTokens: 0,
      costUsd: 0,
      costEstimated: false,
      providerMetadata: { usage: { cachedInputTokens: 15 } },
    }),
  ]);
  const actual = await readRunMetrics(source.rpc, "original-run");
  assert.deepEqual(source.requests, [0, 1, 3]);
  assert.equal(actual.modelCallEvents, 2);
  assert.equal(actual.runtimeModel, model);
  assert.equal(actual.costUsd, 0.03);
  assert.equal(actual.costComplete, true);
  assert.equal(actual.knownObservedCostUsd, 0.03);
  assert.equal(actual.knownEstimatedCostUsd, null);
  assert.equal(actual.modelDurationMs, 120);
  assert.equal(actual.durationComplete, true);
  assert.equal(actual.tokens, 32);
  assert.equal(actual.outputTokens, 2);
  assert.equal(actual.cachedInputTokens, 15);
  assert.equal(actual.cachedInputRatio, 0.5);
  assert.deepEqual(actual.modelCallMetrics[1], {
    seq: 3,
    modelId: model,
    role: "agent",
    durationMs: 0,
    inputTokens: 20,
    outputTokens: 0,
    cachedInputTokens: 15,
    costUsd: 0,
    costEstimated: false,
    failed: false,
  });
  assert.equal(JSON.stringify(actual).includes("never export"), false);
});

test("missing and invalid provider usage stays unknown while known zero remains a subtotal", async () => {
  const source = eventPages([
    modelEvent(1, {
      durationMs: 0,
      inputTokens: 0,
      outputTokens: 0,
      costUsd: 0,
      costEstimated: false,
      providerMetadata: { usage: { cachedInputTokens: 0 } },
    }),
    modelEvent(2, {
      durationMs: -1,
      inputTokens: 5,
      costUsd: "0.05",
      costEstimated: false,
      providerMetadata: { usage: { cachedInputTokens: 6 } },
      error: "private provider message",
    }),
  ]);
  const actual = await readRunMetrics(source.rpc, "original-run");
  assert.equal(actual.costUsd, null);
  assert.equal(actual.costComplete, false);
  assert.equal(actual.knownObservedCostUsd, 0);
  assert.equal(actual.knownEstimatedCostUsd, null);
  assert.equal(actual.modelDurationMs, null);
  assert.equal(actual.durationComplete, false);
  assert.equal(actual.tokens, null);
  assert.equal(actual.inputTokens, 5);
  assert.equal(actual.outputTokens, null);
  assert.equal(actual.cachedInputTokens, null);
  assert.equal(actual.cachedInputRatio, null);
  assert.equal(actual.modelCallMetrics[1].costUsd, null);
  assert.equal(actual.modelCallMetrics[1].durationMs, null);
  assert.equal(actual.modelCallMetrics[1].failed, true);
  assert.equal(JSON.stringify(actual).includes("private provider message"), false);
});

test("estimated and unclassified costs never become observed invoices", async () => {
  const source = eventPages([
    modelEvent(1, {
      durationMs: 10,
      inputTokens: 1,
      outputTokens: 0,
      costUsd: 0,
      costEstimated: true,
    }),
    modelEvent(2, {
      durationMs: 20,
      inputTokens: 1,
      outputTokens: 0,
      costUsd: 0.2,
      costEstimated: true,
    }),
    modelEvent(3, {
      durationMs: 30,
      inputTokens: 1,
      outputTokens: 0,
      costUsd: 0.1,
    }),
  ]);
  const actual = await readRunMetrics(source.rpc, "original-run");
  assert.equal(actual.costUsd, null);
  assert.equal(actual.costComplete, false);
  assert.equal(actual.knownObservedCostUsd, null);
  assert.equal(actual.knownEstimatedCostUsd, 0.2);
  assert.equal(actual.modelDurationMs, 60);
  assert.equal(actual.durationComplete, true);
  assert.equal(actual.modelCallMetrics[0].costUsd, 0);
  assert.equal(actual.modelCallMetrics[2].costUsd, 0.1);
  assert.equal(actual.modelCallMetrics[2].costEstimated, null);
});

test("absent model events establish no observed invoice or latency", async () => {
  const actual = await readRunMetrics(eventPages([]).rpc, "original-run");
  assert.equal(actual.costUsd, null);
  assert.equal(actual.knownObservedCostUsd, null);
  assert.equal(actual.knownEstimatedCostUsd, null);
  assert.equal(actual.modelDurationMs, null);
  assert.equal(actual.durationComplete, false);
  assert.equal(actual.cachedInputTokens, null);
  assert.equal(actual.tokens, null);
  assert.equal(actual.modelCallEvents, 0);
  assert.deepEqual(actual.modelCallMetrics, []);
});

test("native missing receipts and partial usage cannot aggregate into known zero", () => {
  const known = {
    tokens: 12,
    inputTokens: 10,
    outputTokens: 2,
    cachedInputTokens: 0,
    modelDurationMs: 0,
    durationComplete: true,
    costUsd: 0,
    costComplete: true,
    knownObservedCostUsd: 0,
    knownEstimatedCostUsd: null,
    durableIntents: { ids: [], unresolved: 0 },
    ledgerDuplicates: 0,
  };
  const complete = summarizeObservedMetrics([known, known]);
  assert.equal(complete.costUsd, 0);
  assert.equal(complete.costComplete, true);
  assert.equal(complete.modelDurationMs, 0);
  assert.equal(complete.cachedInputTokens, 0);
  assert.equal(complete.durableIntents, 0);
  assert.equal(complete.unresolvedDurableIntents, 0);
  assert.equal(complete.ledgerDuplicates, 0);
  const partial = summarizeObservedMetrics([
    known,
    {
      ...known,
      tokens: null,
      cachedInputTokens: null,
      modelDurationMs: null,
      durationComplete: false,
      costUsd: null,
      costComplete: false,
      knownObservedCostUsd: null,
      durableIntents: null,
      ledgerDuplicates: null,
    },
  ]);
  assert.equal(partial.costUsd, null);
  assert.equal(partial.costComplete, false);
  assert.equal(partial.knownObservedCostUsd, 0);
  assert.equal(partial.modelDurationMs, null);
  assert.equal(partial.durationComplete, false);
  assert.equal(partial.tokens, null);
  assert.equal(partial.cachedInputTokens, null);
  assert.equal(partial.cachedInputRatio, null);
  assert.equal(partial.durableIntents, null);
  assert.equal(partial.unresolvedDurableIntents, null);
  assert.equal(partial.ledgerDuplicates, null);
  const empty = summarizeObservedMetrics([]);
  assert.equal(empty.durableIntents, null);
  assert.equal(empty.costUsd, null);
});

test("lost original event stream refuses cost and duration attribution", async () => {
  const source = eventPages([modelEvent(1, { durationMs: 1, costUsd: 0, costEstimated: false })]);
  await assert.rejects(
    readRunMetrics(async (method, params) => {
      const page = await source.rpc(method, params);
      return params.sinceSeq ? { ...page, streamId: "replacement-stream" } : page;
    }, "original-run"),
    /incomplete/,
  );
});

test("an explicit zero invoice and zero-duration call remain complete without inventing a cache ratio", async () => {
  const source = eventPages([
    modelEvent(1, {
      durationMs: 0,
      inputTokens: 0,
      outputTokens: 0,
      costUsd: 0,
      costEstimated: false,
      providerMetadata: { usage: { cachedInputTokens: 0 } },
    }),
  ]);
  const actual = await readRunMetrics(source.rpc, "original-run");
  assert.equal(actual.costUsd, 0);
  assert.equal(actual.costComplete, true);
  assert.equal(actual.modelDurationMs, 0);
  assert.equal(actual.durationComplete, true);
  assert.equal(actual.tokens, 0);
  assert.equal(actual.cachedInputTokens, 0);
  assert.equal(actual.cachedInputRatio, null);
});
