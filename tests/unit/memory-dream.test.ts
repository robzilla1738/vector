import type { ModelClient } from "../../apps/runtime/dist/agent/model-client.js";
import { afterEach, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { openDb, Repo, BudgetsService, MockModelClient } from "@aux/runtime";
import { PrivateBudgetOwner } from "../../apps/runtime/dist/services/private-budget.js";
import { dreamMemory } from "../../apps/runtime/dist/services/memory-dream.js";
import { budgetLineage } from "../fixtures/budget-lineage.js";
const cleanup: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  for (const close of cleanup.splice(0).reverse()) await close();
});
function fixture() {
  const db = openDb(":memory:"),
    repo = new Repo(db),
    limits = { dayUsd: 1 };
  const budgets = new BudgetsService(db, () => limits, budgetLineage(repo));
  const owner = new PrivateBudgetOwner(repo, budgets),
    budget = owner.client();
  const claimId = randomUUID(),
    controller = new AbortController();
  const model = new MockModelClient().always(() => ({
    object: { changes: [{ path: "MEMORY.md", content: "Workshop Tuesday", claimIds: [claimId] }] },
    inputTokens: 100,
    outputTokens: 20,
    cachedInputTokens: 0,
  }));
  cleanup.push(
    () => db.close(),
    () => owner.close(),
    () => budget.close(),
  );
  const generateStructured: ModelClient["generateStructured"] = async (options) => ({
    ...(await model.generateStructured(options)),
    cachedInputTokens: 0,
  });
  const deps = {
    repo,
    budget,
    model: { generateStructured },
    modelId: "fixture-dream-model",
    models: [
      { id: "fixture-dream-model", source: "configured" as const, inputUsdPerMTok: 1, outputUsdPerMTok: 2 },
    ],
  };
  const input = {
    documents: [{ path: "MEMORY.md", content: "Owner text" }],
    claims: [{ claimId, text: "Workshop Tuesday" }],
    signal: controller.signal,
    checkCurrent: vi.fn(),
  };
  return { db, repo, limits, budgets, deps, input, controller, model };
}
it("accounts Dream as its own actual model operation, including explicit zero cached tokens", async () => {
  const f = fixture();
  const result = await dreamMemory(f.deps, f.input);
  expect(result).toMatchObject({
    status: "completed",
    cachedInputTokens: 0,
    inputTokens: 100,
    outputTokens: 20,
    modelId: "fixture-dream-model",
  });
  expect(result.costUsd).toBeCloseTo(0.00014);
  expect(f.budgets.spentDayUsd()).toBeCloseTo(0.00014);
  const calls = f.db.prepare("SELECT role,provider_metadata AS metadata FROM model_calls").all() as {
    role: string;
    metadata: string;
  }[];
  expect(calls).toHaveLength(1);
  expect(calls[0]!.role).toBe("memory");
  expect(JSON.parse(calls[0]!.metadata)).toMatchObject({
    aux: { kind: "memory_dream" },
    usage: { cachedInputTokens: 0 },
  });
  expect(f.db.prepare("SELECT * FROM private_spend").all()).toEqual([]);
});
it("rejects unadmitted paths and unknown source references after settling the original invoice", async () => {
  const f = fixture();
  f.model.always(() => ({
    object: { changes: [{ path: "other.md", content: "Invented", claimIds: [randomUUID()] }] },
    inputTokens: 40,
    outputTokens: 10,
  }));
  expect(await dreamMemory(f.deps, f.input)).toMatchObject({
    status: "failed",
    errorCode: "invalid_output",
    changes: [],
    inputTokens: 40,
  });
  expect(f.db.prepare("SELECT role FROM model_calls").all()).toHaveLength(1);
  expect(f.db.prepare("SELECT * FROM private_spend").all()).toEqual([]);
});
it("does not dispatch when Memory model spending admission is refused", async () => {
  const f = fixture();
  f.limits.dayUsd = 0.000001;
  expect(await dreamMemory(f.deps, f.input)).toMatchObject({
    status: "failed",
    errorCode: "budget_exceeded",
    changes: [],
  });
  expect(f.model.calls).toHaveLength(0);
});
it("retains measured original usage after cancellation and never returns generated changes", async () => {
  const f = fixture();
  f.model.always(() => {
    f.controller.abort();
    return { object: { changes: [] }, inputTokens: 12, outputTokens: 0, cachedInputTokens: 0 };
  });
  expect(await dreamMemory(f.deps, f.input)).toMatchObject({
    status: "failed",
    errorCode: "interrupted",
    changes: [],
    inputTokens: 12,
    cachedInputTokens: 0,
  });
  expect(f.db.prepare("SELECT role FROM model_calls").all()).toHaveLength(1);
  expect(f.db.prepare("SELECT * FROM private_spend").all()).toEqual([]);
});

it("rejects an explicitly nontext model without dispatching or reserving model spend", async () => {
  const f = fixture();
  const deps = { ...f.deps, models: [{ ...f.deps.models[0]!, textGeneration: false }] };
  expect(await dreamMemory(deps, f.input)).toMatchObject({
    status: "failed",
    errorCode: "model_unavailable",
  });
  expect(f.model.calls).toHaveLength(0);
  expect(f.db.prepare("SELECT * FROM private_spend").all()).toEqual([]);
});
it("refuses an over-capacity request before provider dispatch and reports context admission separately from spend", async () => {
  const f = fixture();
  const deps = { ...f.deps, models: [{ ...f.deps.models[0]!, contextTokens: 1024, maxOutputTokens: 64 }] };
  const input = {
    ...f.input,
    documents: [{ path: "MEMORY.md", content: "Synthetic context ".repeat(1000) }],
  };
  expect(await dreamMemory(deps, input)).toMatchObject({ status: "failed", errorCode: "context_exceeded" });
  expect(f.model.calls).toHaveLength(0);
});
