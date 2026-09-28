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

/** A gate candidate still needs a separately reviewed comparable baseline. */
export function candidateReadiness({ suiteName, selectedIds, allIds, trials, adapterName, rows, engine, budget }) {
  const fullCorpus = selectedIds.length === allIds.length && selectedIds.every((id, i) => id === allIds[i]);
  const completeCoverage = coverage(rows, selectedIds, trials);
  const receiptCoverage = rows.every((row) => row.durableIntents &&
    Number.isSafeInteger(row.durableIntents.unresolved) &&
    Array.isArray(row.durableIntents.ids) &&
    Number.isSafeInteger(row.modelCalls));
  const expectedEngine = adapterName === "aux" ? "agent" : adapterName === "aux-loop" ? "agent-loop" : null;
  const engineMatches = expectedEngine !== null && (engine === expectedEngine ||
    (expectedEngine === "agent" && typeof engine === "string" && engine.startsWith("agent:")));
  const requiredCount = suiteName === "local" ? 50 : suiteName === "heldout" ? 10 : Infinity;
  const reasons = [];
  if (!fullCorpus || allIds.length !== requiredCount) reasons.push("partial or nonstandard corpus");
  if (trials < 3) reasons.push("fewer than three trials");
  if (!completeCoverage) reasons.push("missing, duplicate, or unscored task/trial rows");
  if (!receiptCoverage) reasons.push("model-call or durable receipt attribution is missing");
  if (!engineMatches) reasons.push("engine identity is missing or mismatched");
  if (typeof budget !== "number" || !Number.isSafeInteger(budget) || budget <= 0) reasons.push("effective model-call budget is unknown");
  return { ready: reasons.length === 0, reasons, fullCorpus, completeCoverage, receiptCoverage, engineMatches };
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
  if (models.some((set) => set.size !== 1 || !set.has(report.model))) reasons.push("runtime model attribution differs");
  return { ready: reasons.length === 0, reasons };
}

/** Only non-sensitive receipt identity and final status leave the runtime database. */
export function summarizeIntents(intents) {
  const statuses = { confirmed: 0, not_applied: 0, pending: 0, uncertain: 0 };
  for (const intent of intents) {
    if (!(intent.status in statuses)) throw new Error(`Unknown durable intent status: ${intent.status}`);
    statuses[intent.status]++;
  }
  return { statuses, unresolved: statuses.pending + statuses.uncertain,
    ids: intents.map(({ id, status }) => ({ id, status })) };
}
