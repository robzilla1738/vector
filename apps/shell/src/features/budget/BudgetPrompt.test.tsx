// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Suspension } from "@aux/contracts";
import { makeRun } from "../../mock/fixtures";
import { BudgetPrompt } from "./BudgetPrompt";
const rpc = vi.hoisted(() => vi.fn());
vi.mock("../../store", () => ({ call: rpc, useStore: { setState: vi.fn() } }));
vi.mock("../../bridge", () => ({ bridge: { windowId: "owner", windowKind: "main", privateMode: false } }));
let host: HTMLDivElement, root: Root;
const run = makeRun({ runId: "budget-run", status: "needs_input" });
function suspension(reason: "model_calls" | "spend" = "model_calls"): Suspension {
  return {
    suspensionId: "budget-row",
    runId: run.runId,
    turnId: run.runId,
    threadId: "thread",
    kind: "budget",
    state: "pending",
    createdAt: 1,
    request: {
      kind: "budget",
      instruction: "Review the budget",
      guidance: "Choose a new limit to continue",
      budget: { reason, limit: 8, used: 8, scope: "run" },
    },
  };
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  rpc.mockReset();
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});
async function mount(row: Suspension, current = row) {
  rpc.mockImplementation(async (method: string) => {
    if (method === "runs.get") return { run, suspension: current };
    if (method === "runs.continueBudget") return { ...run, status: "running" };
    throw new Error(`Unexpected ${method}`);
  });
  await act(async () => root.render(<BudgetPrompt run={run} suspension={row} />));
}
async function go() {
  const button = [...host.querySelectorAll("button")].find((item) => item.textContent === "Continue")!;
  await act(async () => button.click());
}
it("continues only the exact durable budget row with an explicit higher total", async () => {
  await mount(suspension());
  await go();
  expect(rpc).toHaveBeenCalledWith("runs.continueBudget", {
    runId: run.runId,
    suspensionId: "budget-row",
    limits: { maxModelCalls: 16 },
  });
  expect(rpc.mock.calls.some(([method]) => method === "runs.answer" || method === "runs.resume")).toBe(false);
});
it("refuses a replaced durable request and preserves the parked run", async () => {
  const row = suspension();
  await mount(row, { ...row, suspensionId: "replacement" });
  await go();
  expect(host.textContent).toContain("This budget request changed");
  expect(rpc.mock.calls.some(([method]) => method === "runs.continueBudget")).toBe(false);
});
it("rechecks spend without inventing a limits patch", async () => {
  await mount(suspension("spend"));
  await go();
  expect(rpc).toHaveBeenCalledWith("runs.continueBudget", { runId: run.runId, suspensionId: "budget-row" });
});
it("retires a pending preflight when its view unmounts", async () => {
  let resolve!: (value: unknown) => void;
  const row = suspension();
  rpc.mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  await act(async () => root.render(<BudgetPrompt run={run} suspension={row} />));
  await go();
  act(() => root.render(null));
  await act(async () => resolve({ run, suspension: row }));
  expect(rpc.mock.calls.some(([method]) => method === "runs.continueBudget")).toBe(false);
});

it("raises only the exact funded owner and never removes a funded token limit", async () => {
  const row = suspension();
  row.request.budget = { reason: "tokens", limit: 1400, used: 100, requiredTokens: 1324,
    funding: { kind: "goal", ownerId: "goal", runId: run.runId, budgetDigest: "a".repeat(64) } };
  await mount(row);
  expect(host.querySelector('input[type="checkbox"]')).toBeNull();
  await go();
  expect(rpc).toHaveBeenCalledWith("runs.continueBudget", { runId: run.runId, suspensionId: "budget-row", limits: { funding: { maxTokens: 2800 } } });
});
it("rejects a replaced funding revision even when the suspension identity is unchanged", async () => {
  const row = suspension();
  row.request.budget = { reason: "spend", limit: 1, used: 0.8,
    funding: { kind: "subagent_group", ownerId: "group", runId: run.runId, budgetDigest: "a".repeat(64) } };
  const replaced = { ...row, request: { ...row.request, budget: { ...row.request.budget, funding: { ...row.request.budget.funding!, budgetDigest: "b".repeat(64) } } } };
  await mount(row, replaced);
  await go();
  expect(rpc.mock.calls.some(([method]) => method === "runs.continueBudget")).toBe(false);
});
