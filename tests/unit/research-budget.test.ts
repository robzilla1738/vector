import { expect, it } from "vitest";
import { ResearchBudget } from "../../apps/runtime/src/scheduler/research-budget.js";

const limits = { maxModelCalls: 1, maxTokens: 20_000, deadlineMs: 10_000 };

it("admits concurrent research calls against one shared call limit", () => {
  const budget = new ResearchBudget(limits, new AbortController().signal);
  try {
    const first = budget.reserveModel("mock/planner", "prompt", "system", 8192);
    expect(first).toHaveProperty("finish");
    expect(budget.reserveModel("mock/planner", "another", "system", 8192)).toMatchObject({
      reason: "shared research model-call budget exhausted",
    });
    if ("finish" in first) first.finish([{ durationMs: 1, inputTokens: 4, outputTokens: 5 }]);
    expect(budget.snapshot()).toMatchObject({ modelCalls: 1, tokens: 9 });
  } finally {
    budget.close();
  }
});

it("reserves the prompt and entire output allowance before provider dispatch", () => {
  const budget = new ResearchBudget({ ...limits, maxTokens: 8192 }, new AbortController().signal);
  try {
    expect(budget.reserveModel("mock/planner", "a prompt", "system", 8192)).toMatchObject({
      reason: "shared research token budget exhausted",
    });
    expect(budget.snapshot().modelCalls).toBe(0);
  } finally {
    budget.close();
  }
});

it("rejects a USD cap when the selected model has no price", () => {
  const budget = new ResearchBudget({ ...limits, maxCostUsd: 1 }, new AbortController().signal);
  try {
    expect(budget.reserveModel("custom/unknown", "prompt", "system", 8192)).toMatchObject({
      reason: /no catalog price/,
    });
    expect(budget.snapshot().modelCalls).toBe(0);
  } finally {
    budget.close();
  }
});

it("admits and accounts a priced catalog model under one shared USD cap", () => {
  const model = { id: "custom/priced", source: "catalog" as const, inputUsdPerMTok: 1, outputUsdPerMTok: 2 };
  const budget = new ResearchBudget(
    { ...limits, maxModelCalls: 3, maxCostUsd: 0.02 },
    new AbortController().signal,
    [model],
  );
  try {
    const first = budget.reserveModel(model.id, "prompt", "system", 8192);
    expect(first).toHaveProperty("finish");
    expect(budget.reserveModel(model.id, "prompt", "system", 8192)).toMatchObject({
      reason: "shared research USD budget exhausted",
    });
    if ("finish" in first) first.finish([{ durationMs: 1, inputTokens: 10, outputTokens: 10 }]);
    expect(budget.snapshot().estimatedCostUsd).toBeCloseTo(0.00003);
    expect(budget.reserveModel(model.id, "prompt", "system", 8192)).toHaveProperty("finish");
  } finally {
    budget.close();
  }
});

it("aborts all children at the shared deadline", async () => {
  const budget = new ResearchBudget({ ...limits, deadlineMs: 10 }, new AbortController().signal);
  try {
    await new Promise((resolve) => budget.signal.addEventListener("abort", resolve, { once: true }));
    expect(budget.reason()).toBe("shared research deadline exhausted");
  } finally {
    budget.close();
  }
});
