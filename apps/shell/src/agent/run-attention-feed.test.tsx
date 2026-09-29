// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import type { Suspension, SuspensionKind } from "@aux/contracts";
import { bridge } from "../bridge";
import { makeRun } from "../mock/fixtures";
import { RunAttentionFeed, selectAttentionRuns } from "./RunAttentionFeed";
import { shallow } from "zustand/shallow";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const run = makeRun({ runId: "pending-1", status: "needs_input", pageIds: [],
  goal: "Private account", statusMessage: "Which secret account?" });
function pending(kind: SuspensionKind, id = "s1"): Suspension {
  return { suspensionId: id, runId: run.runId, threadId: "thread", turnId: run.runId,
    kind, request: { kind, instruction: "Which secret account?", guidance: "Private guidance" },
    state: "pending", createdAt: 1 };
}

it("surfaces a durable typed request without page or question text, and opens only the fresh ID", async () => {
  let current = pending("ask-user-question");
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.get") return { run, suspension: current, steps: [], modelCalls: 0 } as never;
    return {} as never;
  });
  const open = vi.fn();
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () => root.render(<RunAttentionFeed runs={[run]} onOpenRun={open} />));
    expect(host.textContent).toContain("Aux needs your answer");
    expect(host.textContent).not.toMatch(/secret|Private/);
    current = pending("ask-user-question", "s2");
    await act(async () => host.querySelector<HTMLButtonElement>(".run-attention-card .primary")!.click());
    expect(open).not.toHaveBeenCalled();
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("request changed");
    await act(async () => host.querySelector<HTMLButtonElement>(".run-attention-card .primary")!.click());
    expect(open).toHaveBeenCalledExactlyOnceWith(run.runId);
    expect(invoke.mock.calls.filter(([method]) => method === "runs.get").length).toBeGreaterThanOrEqual(3);
  } finally { await act(async () => root.unmount()); invoke.mockRestore(); }
});

it("renders approval and handoff cards without their private instructions and allows keyboard dismissal", async () => {
  const second = makeRun({ ...run, runId: "pending-2", createdAt: run.createdAt - 1 });
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method, params) => {
    if (method === "runs.get") {
      const id = (params as { runId: string }).runId;
      const selected = id === run.runId ? run : second;
      const kind = id === run.runId ? "approval" : "handoff";
      return { run: selected, suspension: { ...pending(kind), runId: id, turnId: id, suspensionId: id },
        steps: [], modelCalls: 0 } as never;
    }
    return {} as never;
  });
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () => root.render(<RunAttentionFeed runs={[run, second]} onOpenRun={() => {}} />));
    expect(host.textContent).toContain("Approval needed");
    expect(host.textContent).toContain("Your turn in the browser");
    expect(host.textContent).not.toMatch(/secret|Private/);
    const dismiss = host.querySelector<HTMLButtonElement>(".run-attention-card button")!;
    await act(async () => dismiss.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(host.querySelectorAll(".run-attention-card")).toHaveLength(1);
  } finally { await act(async () => root.unmount()); invoke.mockRestore(); }
});


it("projects at most 32 pending run rows and ignores unrelated run replacements", () => {
  const pendingRuns = Array.from({ length: 34 }, (_, index) => makeRun({ ...run, runId: `pending-${index}`, status: "needs_input" }));
  const completed = makeRun({ ...run, runId: "complete", status: "completed" });
  const first = selectAttentionRuns([completed, ...pendingRuns]);
  const changedUnrelated = selectAttentionRuns([{ ...completed, goal: "Unrelated update" }, ...pendingRuns]);
  expect(first).toHaveLength(32);
  expect(first.every(item => item.status === "needs_input")).toBe(true);
  expect(shallow(first, changedUnrelated)).toBe(true);
  const changedPending = selectAttentionRuns([completed, { ...pendingRuns[0]!, statusMessage: "A new durable request" }, ...pendingRuns.slice(1)]);
  expect(shallow(first, changedPending)).toBe(false);
});
