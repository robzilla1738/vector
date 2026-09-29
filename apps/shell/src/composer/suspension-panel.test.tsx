// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import type { Suspension, SuspensionKind } from "@aux/contracts";
import { bridge } from "../bridge";
import { RunPanel } from "../components/RunPanel";
import { makeRun } from "../mock/fixtures";
import { useStore } from "../store";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const original = useStore.getState();
afterEach(() => { vi.restoreAllMocks(); useStore.setState(original, true); });

const run = makeRun({ runId: "parked", status: "needs_input", statusMessage: "Which account?", pageIds: [] });
function pending(kind: SuspensionKind, id = "s1"): Suspension {
  return { suspensionId: id, runId: run.runId, threadId: "thread", turnId: run.runId,
    kind, request: { kind, instruction: kind === "ask-user-question" ? "Which account?" : `Review ${kind}`,
      guidance: "Aux is waiting." }, state: "pending", createdAt: 1 };
}

async function mount(kind: SuspensionKind, onGet?: () => Suspension) {
  const first = pending(kind);
  let gets = 0;
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.get") return { run, steps: [], modelCalls: 0, transcript: { runId: run.runId, items: [] },
      suspension: ++gets === 1 ? first : onGet?.() ?? first } as never;
    if (method === "runs.answer") return { ...run, status: "running" } as never;
    return {} as never;
  });
  useStore.setState({ runs: [run], pages: [], steps: { [run.runId]: [] }, prompt: null, runAnswerDrafts: {} });
  const host = document.createElement("div");
  const root = createRoot(host);
  await act(async () => root.render(<RunPanel runId={run.runId} conversation={false} />));
  return { host, invoke, unmount: async () => act(async () => root.unmount()) };
}

it("binds a question answer to the displayed suspension and prevents a duplicate send", async () => {
  const view = await mount("ask-user-question");
  try {
    expect(view.host.querySelector('[data-suspension-kind="ask-user-question"]')?.textContent).toContain("Which account?");
    await act(async () => useStore.getState().setRunAnswerDraft(run.runId, "Which account?", "Work account"));
    const send = [...view.host.querySelectorAll<HTMLButtonElement>("button")].find((button) => button.textContent === "Send")!;
    await act(async () => { send.click(); send.click(); });
    expect(view.invoke.mock.calls.filter(([method]) => method === "runs.answer")).toEqual([
      ["runs.answer", { runId: run.runId, answer: "Work account", expectedSuspensionId: "s1" }],
    ]);
  } finally { await view.unmount(); }
});

it("keeps the draft when a new suspension replaced the one shown", async () => {
  const view = await mount("ask-user-question", () => pending("ask-user-question", "s2"));
  try {
    await act(async () => useStore.getState().setRunAnswerDraft(run.runId, "Which account?", "Personal account"));
    await act(async () => [...view.host.querySelectorAll<HTMLButtonElement>("button")].find((button) => button.textContent === "Send")!.click());
    expect(view.invoke.mock.calls.some(([method]) => method === "runs.answer")).toBe(false);
    expect(view.host.querySelector('[role="alert"]')?.textContent).toContain("request changed");
    expect(useStore.getState().runAnswerDrafts[run.runId]?.text).toBe("Personal account");
  } finally { await view.unmount(); }
});

it.each(["approval", "action-confirmation"] as const)("shows %s without a second decision surface", async (kind) => {
  const view = await mount(kind);
  try {
    expect(view.host.querySelector(`[data-suspension-kind="${kind}"]`)?.textContent).toContain("Review the approval prompt");
    expect(view.host.querySelector('[aria-label="Your answer"]')).toBeNull();
    expect(view.invoke.mock.calls.some(([method]) => method === "runs.answer" || method === "safety.approvals.decide")).toBe(false);
  } finally { await view.unmount(); }
});

it("shows a handoff completion control bound to the pending record", async () => {
  const view = await mount("handoff");
  try {
    expect(view.host.textContent).toContain("return control");
    await act(async () => [...view.host.querySelectorAll<HTMLButtonElement>("button")]
      .find((button) => button.textContent === "I’m done, continue")!.click());
    expect(view.invoke.mock.calls.some(([method, params]) => method === "runs.answer"
      && (params as { expectedSuspensionId?: string }).expectedSuspensionId === "s1")).toBe(true);
  } finally { await view.unmount(); }
});

it("keeps Stop reachable during a suspension and sends it once", async () => {
  const view = await mount("ask-user-question");
  try {
    const stop = view.host.querySelector<HTMLButtonElement>('[aria-label="Stop run"]')!;
    await act(async () => { stop.click(); stop.click(); });
    expect(view.invoke.mock.calls.filter(([method]) => method === "runs.cancel")).toHaveLength(1);
  } finally { await view.unmount(); }
});
