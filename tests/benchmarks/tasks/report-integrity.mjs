import { createHash } from "node:crypto";

/** The task definitions, order, expected answers, and oracles are one corpus. */
export function corpusFingerprint(suite) {
  return createHash("sha256").update(JSON.stringify(suite)).digest("hex");
}

/** A complete report must contain exactly one scored row for every task/trial. */
export function coverage(rows, taskIds, trials) {
  const expected = new Set();
  for (let trial = 1; trial <= trials; trial++) for (const id of taskIds) expected.add(`${trial}\0${id}`);
  const seen = new Set();
  for (const row of rows) {
    const key = `${row.trial}\0${row.id}`;
    if (!expected.has(key) || seen.has(key) || (row.score !== 0 && row.score !== 1)) return false;
    seen.add(key);
  }
  return seen.size === expected.size;
}

/** Use emitted attempts, not the requested run config, to name the served model. */
export function modelAttribution(events) {
  const calls = events.filter((event) => event.type === "model.call");
  const modelIds = [...new Set(calls.map((event) => event.payload?.modelId))];
  const runtimeModel =
    calls.length && modelIds.length === 1 && typeof modelIds[0] === "string" && modelIds[0].length
      ? modelIds[0]
      : null;
  return { runtimeModel, modelCallEvents: calls.length, modelIds };
}

/** Read every event page; a missing token count cannot establish a cache ratio. */
export async function readRunMetrics(rpc, runId) {
  let cursor = 0,
    streamId,
    inputTokens = 0,
    outputTokens = 0,
    cachedInputTokens = 0,
    inputComplete = true,
    outputComplete = true,
    cacheComplete = true,
    suspensions = 0,
    takeovers = 0,
    ledgerDuplicates = 0;
  const calls = [],
    modelCallMetrics = [];
  const tokenCount = (value) => Number.isSafeInteger(value) && value >= 0;
  for (;;) {
    const page = await rpc("runs.events", { runId, sinceSeq: cursor, limit: 2000, streamId });
    if (
      page.resync ||
      typeof page.streamId !== "string" ||
      !page.streamId ||
      !Array.isArray(page.events) ||
      !Number.isSafeInteger(page.lastSeq) ||
      page.lastSeq < cursor ||
      (streamId !== undefined && streamId !== page.streamId)
    )
      throw new Error("Run event history is incomplete");
    streamId = page.streamId;
    for (const event of page.events) {
      if (!Number.isSafeInteger(event.seq) || event.seq <= cursor || event.seq > page.lastSeq)
        throw new Error("Run event history is incomplete");
      const payload = event.payload ?? {};
      if (event.type === "model.call") {
        calls.push({ type: event.type, payload: { modelId: payload.modelId } });
        const cached = payload.providerMetadata?.usage?.cachedInputTokens;
        modelCallMetrics.push({
          seq: event.seq,
          modelId: typeof payload.modelId === "string" ? payload.modelId : null,
          role: typeof payload.role === "string" ? payload.role : null,
          durationMs: nonnegative(payload.durationMs) ? payload.durationMs : null,
          inputTokens: tokenCount(payload.inputTokens) ? payload.inputTokens : null,
          outputTokens: tokenCount(payload.outputTokens) ? payload.outputTokens : null,
          cachedInputTokens:
            tokenCount(cached) && tokenCount(payload.inputTokens) && cached <= payload.inputTokens
              ? cached
              : null,
          costUsd: nonnegative(payload.costUsd) ? payload.costUsd : null,
          costEstimated: typeof payload.costEstimated === "boolean" ? payload.costEstimated : null,
          failed: typeof payload.error === "string",
        });
        if (tokenCount(payload.inputTokens)) inputTokens += payload.inputTokens;
        else inputComplete = false;
        if (tokenCount(payload.outputTokens)) outputTokens += payload.outputTokens;
        else outputComplete = false;
        if (tokenCount(cached) && tokenCount(payload.inputTokens) && cached <= payload.inputTokens)
          cachedInputTokens += cached;
        else cacheComplete = false;
      }
      if (event.type === "run.status" && payload.status === "needs_input") suspensions++;
      if (event.type === "page.takeover") takeovers++;
      if (
        event.type === "step.finished" &&
        /No new action was executed/.test(JSON.stringify(payload.error ?? ""))
      )
        ledgerDuplicates++;
    }
    if (page.lastSeq === cursor) break;
    cursor = page.lastSeq;
  }
  const observed = modelCallMetrics
    .filter((call) => call.costEstimated === false)
    .map((call) => call.costUsd);
  const estimated = modelCallMetrics
    .filter((call) => call.costEstimated === true)
    .map((call) => call.costUsd);
  const costComplete = calls.length > 0 && observed.length === calls.length && observed.every(nonnegative);
  return {
    modelCallMetrics,
    costUsd: costComplete ? sumComplete(observed) : null,
    costComplete,
    knownObservedCostUsd: sumKnown(observed),
    knownEstimatedCostUsd: sumKnown(estimated),
    modelDurationMs: sumComplete(modelCallMetrics.map((call) => call.durationMs)),
    durationComplete: calls.length > 0 && modelCallMetrics.every((call) => nonnegative(call.durationMs)),
    outputTokens: calls.length && outputComplete ? outputTokens : null,
    tokens: calls.length && inputComplete && outputComplete ? inputTokens + outputTokens : null,
    inputTokens: calls.length && inputComplete ? inputTokens : null,
    cachedInputTokens: calls.length && cacheComplete ? cachedInputTokens : null,
    cachedInputRatio:
      calls.length && inputComplete && cacheComplete && inputTokens > 0
        ? cachedInputTokens / inputTokens
        : null,
    suspensions,
    interventions: suspensions + takeovers,
    ledgerDuplicates,
    ...modelAttribution(calls),
  };
}

const nonnegative = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0;
const sumComplete = (values) =>
  values.length && values.every(nonnegative) ? values.reduce((sum, value) => sum + value, 0) : null;
const sumKnown = (values) => {
  const known = values.filter(nonnegative);
  return known.length ? known.reduce((sum, value) => sum + value, 0) : null;
};

/** Partial known costs stay subtotals; missing native receipts never become zero. */
export function summarizeObservedMetrics(rows) {
  const total = (field) => sumComplete(rows.map((row) => row[field]));
  const inputTokens = total("inputTokens"),
    cachedInputTokens = total("cachedInputTokens");
  const receiptComplete =
    rows.length > 0 &&
    rows.every(
      (row) =>
        Array.isArray(row.durableIntents?.ids) &&
        Number.isSafeInteger(row.durableIntents.unresolved) &&
        row.durableIntents.unresolved >= 0,
    );
  return {
    tokens: total("tokens"),
    inputTokens,
    outputTokens: total("outputTokens"),
    cachedInputTokens,
    cachedInputRatio: inputTokens > 0 && cachedInputTokens !== null ? cachedInputTokens / inputTokens : null,
    modelDurationMs: rows.every((row) => row.durationComplete === true) ? total("modelDurationMs") : null,
    durationComplete:
      rows.length > 0 &&
      rows.every((row) => row.durationComplete === true && nonnegative(row.modelDurationMs)),
    costUsd: rows.every((row) => row.costComplete === true) ? total("costUsd") : null,
    costComplete:
      rows.length > 0 && rows.every((row) => row.costComplete === true && nonnegative(row.costUsd)),
    knownObservedCostUsd: sumKnown(rows.map((row) => row.knownObservedCostUsd)),
    knownEstimatedCostUsd: sumKnown(rows.map((row) => row.knownEstimatedCostUsd)),
    durableIntents: receiptComplete
      ? rows.reduce((sum, row) => sum + row.durableIntents.ids.length, 0)
      : null,
    unresolvedDurableIntents: receiptComplete
      ? rows.reduce((sum, row) => sum + row.durableIntents.unresolved, 0)
      : null,
    ledgerDuplicates: total("ledgerDuplicates"),
  };
}

/** A gate candidate still needs a separately reviewed comparable baseline. */
export function candidateReadiness({
  suiteName,
  selectedIds,
  allIds,
  trials,
  adapterName,
  rows,
  engine,
  budget,
  model,
}) {
  const fullCorpus = selectedIds.length === allIds.length && selectedIds.every((id, i) => id === allIds[i]);
  const completeCoverage = coverage(rows, selectedIds, trials);
  const receiptCoverage = rows.every(
    (row) =>
      row.durableIntents &&
      Number.isSafeInteger(row.durableIntents.unresolved) &&
      Array.isArray(row.durableIntents.ids) &&
      Number.isSafeInteger(row.modelCalls),
  );
  const modelCoverage =
    typeof model === "string" &&
    model.length > 0 &&
    rows.every(
      (row) => row.runtimeModel === model && row.modelCalls > 0 && row.modelCallEvents === row.modelCalls,
    );
  const expectedEngine = adapterName === "aux" ? "agent" : adapterName === "aux-loop" ? "agent-loop" : null;
  const engineMatches =
    expectedEngine !== null &&
    (engine === expectedEngine ||
      (expectedEngine === "agent" && typeof engine === "string" && engine.startsWith("agent:")));
  const requiredCount = suiteName === "local" ? 50 : suiteName === "heldout" ? 10 : Infinity;
  const reasons = [];
  if (!fullCorpus || allIds.length !== requiredCount) reasons.push("partial or nonstandard corpus");
  if (trials < 3) reasons.push("fewer than three trials");
  if (!completeCoverage) reasons.push("missing, duplicate, or unscored task/trial rows");
  if (!receiptCoverage) reasons.push("model-call or durable receipt attribution is missing");
  if (!modelCoverage) reasons.push("served model or model-call event attribution is missing or mismatched");
  if (!engineMatches) reasons.push("engine identity is missing or mismatched");
  if (typeof budget !== "number" || !Number.isSafeInteger(budget) || budget <= 0)
    reasons.push("effective model-call budget is unknown");
  return {
    ready: reasons.length === 0,
    reasons,
    fullCorpus,
    completeCoverage,
    receiptCoverage,
    modelCoverage,
    engineMatches,
  };
}

/** This only checks whether a single report can support an A/B comparison. */
export function abReadiness(report) {
  const planner = report.adapters.aux;
  const loop = report.adapters["aux-loop"];
  const reasons = [];
  if (report.complete !== true || report.valid !== true) reasons.push("report is incomplete or invalid");
  if (report.suite !== "local") reasons.push("A/B decision requires local fixtures");
  if (!planner?.readiness?.ready) reasons.push("complete qualified planner rows are missing");
  if (!loop?.readiness?.ready) reasons.push("complete qualified loop rows are missing");
  const budgets = [planner, loop].map((adapter) => new Set(adapter?.rows?.map((row) => row.modelCallBudget)));
  if (budgets.some((set) => set.size !== 1) || [...budgets[0]][0] !== [...budgets[1]][0])
    reasons.push("effective model-call budgets differ");
  const models = [planner, loop].map((adapter) => new Set(adapter?.rows?.map((row) => row.runtimeModel)));
  if (models.some((set) => set.size !== 1 || !set.has(report.model)))
    reasons.push("runtime model attribution differs");
  return { ready: reasons.length === 0, reasons };
}

/** Only non-sensitive receipt identity and final status leave the runtime database. */
export function summarizeIntents(intents) {
  const statuses = { confirmed: 0, not_applied: 0, pending: 0, uncertain: 0 };
  for (const intent of intents) {
    if (!(intent.status in statuses)) throw new Error(`Unknown durable intent status: ${intent.status}`);
    statuses[intent.status]++;
  }
  return {
    statuses,
    unresolved: statuses.pending + statuses.uncertain,
    ids: intents.map(({ id, status }) => ({ id, status })),
  };
}

/** Wrapper expiry has no run receipt, so it cannot become a scored task row. */
export function benchmarkInfrastructureFailure(error) {
  if (!error) return null;
  const message = String(error);
  if (/^task timeout after \d+ ms$/.test(message))
    return "Benchmark wrapper timed out before run attribution";
  if (/unauthenticated request to ai gateway|invalid ai.gateway.api.key/i.test(message))
    return "AI Gateway authentication failed";
  if (/benchmark receipt attribution failed/i.test(message)) return "Durable receipt attribution failed";
  return null;
}
