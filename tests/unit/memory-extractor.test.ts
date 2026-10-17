import { afterEach, expect, it, vi } from "vitest";
import { openDb, Repo, BudgetsService, MockModelClient } from "@aux/runtime";
import { PrivateBudgetOwner } from "../../apps/runtime/dist/services/private-budget.js";
import { extractMemoryNotes } from "../../apps/runtime/dist/services/memory-extractor.js";
import { budgetLineage } from "../fixtures/budget-lineage.js";

const cleanup: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  for (const close of cleanup.splice(0).reverse()) await close();
});
const quote = "The synthetic workshop meets every Tuesday afternoon.";
function fixture() {
  const db = openDb(":memory:"),
    repo = new Repo(db);
  const limits = { dayUsd: 1 };
  const budgets = new BudgetsService(db, () => limits, budgetLineage(repo));
  const owner = new PrivateBudgetOwner(repo, budgets),
    budget = owner.client();
  const model = new MockModelClient().always(() => ({
    object: { quotes: [quote] },
    inputTokens: 120,
    outputTokens: 9,
  }));
  const controller = new AbortController();
  cleanup.push(
    () => db.close(),
    () => owner.close(),
    () => budget.close(),
  );
  const deps = {
    repo,
    budget,
    model,
    modelId: "fixture-memory-model",
    models: [
      { id: "fixture-memory-model", source: "configured" as const, inputUsdPerMTok: 1, outputUsdPerMTok: 2 },
    ],
  };
  const input = { report: quote, signal: controller.signal, checkCurrent: vi.fn() };
  return { deps, input, db, budgets, limits, controller };
}
it("records actual extraction usage and settles the same financial reservation", async () => {
  const f = fixture();
  const result = await extractMemoryNotes(f.deps, f.input);
  expect(result).toMatchObject({
    status: "completed",
    quotes: [quote],
    inputTokens: 120,
    outputTokens: 9,
    modelId: "fixture-memory-model",
    costEstimated: true,
  });
  expect(result.costUsd).toBeCloseTo(0.000138);
  expect(f.budgets.spentDayUsd()).toBeCloseTo(0.000138);
  expect(f.db.prepare("SELECT role FROM model_calls").all()).toEqual([{ role: "memory" }]);
  expect(f.db.prepare("SELECT * FROM private_spend").all()).toEqual([]);
  expect(f.deps.model.calls[0]!.prompt).toContain(quote);
  expect(f.input.checkCurrent).toHaveBeenCalled();
});
it("rejects invented quotes after accounting for the actual model request", async () => {
  const f = fixture();
  f.deps.model.always(() => ({ quotes: ["This quote never appeared in the actual report."] }));
  expect(await extractMemoryNotes(f.deps, f.input)).toMatchObject({
    status: "failed",
    quotes: [],
    errorCode: "invalid_output",
  });
  expect(f.db.prepare("SELECT role FROM model_calls").all()).toHaveLength(1);
});
it("does not make a model call when the financial reservation is refused", async () => {
  const f = fixture();
  f.limits.dayUsd = 0.000001;
  expect(await extractMemoryNotes(f.deps, f.input)).toMatchObject({
    status: "failed",
    errorCode: "budget_exceeded",
  });
  expect(f.deps.model.calls).toEqual([]);
  expect(f.db.prepare("SELECT * FROM model_calls").all()).toEqual([]);
});
it("cancels financial admission if the original source retires before dispatch", async () => {
  const f = fixture();
  f.input.checkCurrent
    .mockImplementationOnce(() => {})
    .mockImplementation(() => {
      throw new Error("Original source retired");
    });
  await expect(extractMemoryNotes(f.deps, f.input)).rejects.toThrow("Original source retired");
  expect(f.deps.model.calls).toEqual([]);
  expect(f.db.prepare("SELECT state,cost_usd FROM private_spend").all()).toEqual([
    { state: "settled", cost_usd: 0 },
  ]);
  expect(f.budgets.spentDayUsd()).toBe(0);
});
it("keeps uncertain failed model spend and returns a safe failure code", async () => {
  const f = fixture();
  f.deps.model.always(() => {
    throw new Error("Synthetic provider failure with secret-shaped text");
  });
  const result = await extractMemoryNotes(f.deps, f.input);
  expect(result).toMatchObject({ status: "failed", quotes: [], errorCode: "inference_failed" });
  expect(JSON.stringify(result)).not.toContain("secret-shaped");
  expect(f.db.prepare("SELECT error FROM model_calls").all()).toEqual([
    { error: "memory_extraction_failed" },
  ]);
});
