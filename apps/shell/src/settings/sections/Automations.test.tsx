// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AutomationsSettings } from "./Automations";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("../../store", () => ({
  call: rpc,
  errToast: vi.fn(),
  useStore: (select: (state: unknown) => unknown) => select({ settings: { routineSuggestionScan: "off" },
    layout: { spaces: [{ id: "space-view", workspaceId: "workspace-1" }], activeSpaceId: "space-view" } }),
}));
vi.mock("../../bridge", () => ({ bridge: { onEvent: () => () => {} } }));
vi.mock("../../task-navigation", () => ({ openSavedSkill: vi.fn() }));

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  rpc.mockReset();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals(); });

it("shows tested replay readiness and the durable occurrence's bounded result", async () => {
  const routine = { routineId: "routine-1", workspaceId: "workspace-1", title: "Reviewed search",
    revision: 4, trigger: { kind: "schedule", timezone: "UTC", hour: 9, minute: 0, days: [1] },
    paused: false, replay: { state: "tested" }, spendCapUsd: 1, missedRunPolicy: "record_only" };
  const run = { routineRunId: "occurrence-1", routineId: routine.routineId, runId: "run-1",
    status: "completed", createdAt: Date.now(), revision: 4 };
  rpc.mockImplementation(async (method: string) => {
    if (method === "workspaces.list") return [{ workspaceId: "workspace-1", name: "Research" }];
    if (method === "routines.list") return [routine];
    if (method === "routines.inbox") return [{ title: routine.title, workspaceId: routine.workspaceId,
      triggerKind: "schedule", run }];
    if (method === "routines.outcome") return { run, linkedRunFound: true,
      criteria: [{ criterion: { criterionId: "found", description: "Result visible", verification: "manual" },
        status: "accepted", evidence: [{ record: {}, stale: false }] }] };
    throw new Error(`Unexpected ${method}`);
  });
  await act(async () => root.render(<AutomationsSettings active />));
  expect(container.textContent).toContain("Tested browser replay on its reviewed site");
  const view = [...container.querySelectorAll("button")].find(button => button.textContent === "View result");
  expect(view).toBeDefined();
  await act(async () => view!.click());
  expect(rpc).toHaveBeenCalledWith("routines.outcome", { routineRunId: "occurrence-1" });
  expect(container.textContent).toContain("Linked run: run-1");
  expect(container.textContent).toContain("Result visible: accepted · 1 evidence record");
});
