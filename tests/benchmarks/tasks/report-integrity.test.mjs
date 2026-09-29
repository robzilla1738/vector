import assert from "node:assert/strict";
import { test } from "node:test";
import { abReadiness, benchmarkInfrastructureFailure, candidateReadiness, corpusFingerprint, coverage, modelAttribution, summarizeIntents } from "./report-integrity.mjs";

const model = "meta/muse-spark-1.3-contributor";
const ids = Array.from({ length: 50 }, (_, i) => `L${i + 1}`);
const rows = ids.flatMap((id) => [1, 2, 3].map((trial) => ({ id, trial, score: 1,
  modelCalls: 1, modelCallEvents: 1, runtimeModel: model,
  durableIntents: { unresolved: 0, ids: [] } })));
const ready = (changes = {}) => candidateReadiness({ suiteName: "local", selectedIds: ids, allIds: ids,
  trials: 3, adapterName: "aux-loop", rows, engine: "agent-loop", budget: 16, model, ...changes });

test("corpus fingerprint changes with answer and oracle definitions", () => {
  const corpus = { tasks: [{ id: "L01", expected: { value: "a" }, oracle: null }] };
  assert.notEqual(corpusFingerprint(corpus), corpusFingerprint({ tasks: [{ ...corpus.tasks[0], expected: { value: "b" } }] }));
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
  assert.deepEqual(modelAttribution([{ type: "run.status", payload: {} }, call(model), call(model)]),
    { runtimeModel: model, modelCallEvents: 2, modelIds: [model] });
  assert.equal(modelAttribution([call(model), call("openai/other")]).runtimeModel, null);
  assert.equal(modelAttribution([call(model), call(undefined)]).runtimeModel, null);
  assert.equal(modelAttribution([]).runtimeModel, null);
});

test("wrapper timeout aborts before scoring; an attributed run deadline stays a task result", () => {
  assert.equal(benchmarkInfrastructureFailure("task timeout after 180000 ms"),
    "Benchmark wrapper timed out before run attribution");
  assert.equal(benchmarkInfrastructureFailure("run deadline exceeded (175000ms)"), null);
  assert.equal(benchmarkInfrastructureFailure("benchmark receipt attribution failed: database closed"),
    "Durable receipt attribution failed");
});

test("durable receipt summary exposes statuses without evidence or values", () => {
  const summary = summarizeIntents([{ id: "intent-1", status: "confirmed", evidence: "secret" },
    { id: "intent-2", status: "uncertain", evidence: "private" }]);
  assert.equal(summary.unresolved, 1);
  assert.deepEqual(summary.ids, [{ id: "intent-1", status: "confirmed" }, { id: "intent-2", status: "uncertain" }]);
  assert.equal(JSON.stringify(summary).includes("secret"), false);
});

test("A/B eligibility rejects unequal effective budgets and missing planner", () => {
  const adapter = (engine, budget) => ({ readiness: { ready: true }, rows: [{ engine, modelCallBudget: budget,
    runtimeModel: "meta/muse-spark-1.3-contributor" }] });
  const report = { suite: "local", model: "meta/muse-spark-1.3-contributor", complete: true, valid: true, adapters: {
    aux: adapter("agent", 16), "aux-loop": adapter("agent-loop", 16) } };
  assert.equal(abReadiness(report).ready, true);
  assert.equal(abReadiness({ ...report, adapters: { ...report.adapters,
    "aux-loop": adapter("agent-loop", 60) } }).ready, false);
  assert.equal(abReadiness({ ...report, adapters: { "aux-loop": report.adapters["aux-loop"] } }).ready, false);
  assert.equal(abReadiness({ ...report, complete: false }).ready, false);
});

test("synthetic 50×3 A/B report is ready only with matching observed model and budgets", () => {
  const adapter = (name, engine, budget, adapterRows = rows) => ({
    rows: adapterRows.map((row) => ({ ...row, engine, modelCallBudget: budget })),
    readiness: candidateReadiness({ suiteName: "local", selectedIds: ids, allIds: ids,
      trials: 3, adapterName: name, rows: adapterRows, engine, budget, model }),
  });
  const report = { suite: "local", model, complete: true, valid: true, adapters: {
    aux: adapter("aux", "agent", 16), "aux-loop": adapter("aux-loop", "agent-loop", 16),
  } };
  assert.equal(abReadiness(report).ready, true);
  const mixed = [{ ...rows[0], runtimeModel: "openai/other" }, ...rows.slice(1)];
  assert.equal(abReadiness({ ...report, adapters: { ...report.adapters,
    "aux-loop": adapter("aux-loop", "agent-loop", 16, mixed) } }).ready, false);
  assert.equal(abReadiness({ ...report, adapters: { ...report.adapters,
    "aux-loop": adapter("aux-loop", "agent-loop", 8) } }).ready, false);
});
