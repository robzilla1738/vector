// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { RoutinesSettings } from "./Routines";

vi.mock("../../ui/dialog", () => ({
  Dialog: ({ children, label }: { children: ReactNode; label: string }) => (
    <div role="dialog" aria-label={label}>
      {children}
    </div>
  ),
}));

const rpc = vi.hoisted(() => vi.fn());
const viewState = vi.hoisted(() => ({
  settings: { routineSuggestionScan: "off" },
  layout: {
    spaces: [
      { id: "space-view", workspaceId: "workspace-1" },
      { id: "other", workspaceId: "workspace-2" },
    ],
    activeSpaceId: "space-view",
  },
}));
vi.mock("../../store", () => ({
  call: rpc,
  errToast: vi.fn(),
  useStore: (select: (state: typeof viewState) => unknown) => select(viewState),
}));
vi.mock("../../bridge", () => ({ bridge: { onEvent: () => () => {} } }));
vi.mock("../../task-navigation", () => ({ openSavedSkill: vi.fn() }));

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  rpc.mockReset();
  viewState.layout.activeSpaceId = "space-view";
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

it("shows tested replay readiness and the durable occurrence's bounded result", async () => {
  const routine = {
    routineId: "routine-1",
    workspaceId: "workspace-1",
    title: "Reviewed search",
    revision: 4,
    trigger: { kind: "schedule", timezone: "UTC", hour: 9, minute: 0, days: [1] },
    paused: false,
    replay: { state: "tested" },
    spendCapUsd: 1,
    missedRunPolicy: "record_only",
  };
  const run = {
    routineRunId: "occurrence-1",
    routineId: routine.routineId,
    runId: "run-1",
    status: "completed",
    createdAt: Date.now(),
    revision: 4,
  };
  rpc.mockImplementation(async (method: string) => {
    if (method === "workspaces.list") return [{ workspaceId: "workspace-1", name: "Research" }];
    if (method === "routines.list") return [routine];
    if (method === "routines.inbox")
      return [{ title: routine.title, workspaceId: routine.workspaceId, triggerKind: "schedule", run }];
    if (method === "routines.outcome")
      return {
        run,
        linkedRunFound: true,
        criteria: [
          {
            criterion: { criterionId: "found", description: "Result visible", verification: "manual" },
            status: "accepted",
            evidence: [{ record: {}, stale: false }],
          },
        ],
      };
    throw new Error(`Unexpected ${method}`);
  });
  await act(async () => root.render(<RoutinesSettings active />));
  expect(container.textContent).toContain("Tested browser replay on its reviewed site");
  const view = [...container.querySelectorAll("button")].find(
    (button) => button.textContent === "View result",
  );
  expect(view).toBeDefined();
  await act(async () => view!.click());
  expect(rpc).toHaveBeenCalledWith("routines.outcome", { routineRunId: "occurrence-1" });
  expect(container.textContent).toContain("Linked run: run-1");
  expect(container.textContent).toContain("Result visible: accepted · 1 evidence record");
});

function change(field: string, value: string) {
  const input = document.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    `[aria-label="${field}"]`,
  )!;
  const prototype =
    input instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : input instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;
  act(() => {
    Object.getOwnPropertyDescriptor(prototype, "value")!.set!.call(input, value);
    input.dispatchEvent(
      new Event(input instanceof HTMLSelectElement ? "change" : "input", { bubbles: true }),
    );
  });
}
async function createPromptForm() {
  await act(async () => root.render(<RoutinesSettings active />));
  await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="Create routine"]')!.click());
  change("New routine name", "Weekly reading summary");
  change("Routine prompt", "Summarize the reading list I provide.");
}
async function submitSchedule() {
  await act(async () =>
    document
      .querySelector("form.routine-schedule")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
}
it("creates a paused prompt routine with a real source task and reuses the task after a failed routine save", async () => {
  let routineAttempt = 0;
  const task = {
    taskId: "task-prompt",
    workspaceId: "workspace-1",
    revision: 1,
    title: "Weekly reading summary",
    objective: "Summarize the reading list I provide.",
    resources: [],
    criteria: [
      {
        criterionId: "routine-output",
        description: "The result satisfies the routine’s prompt.",
        verification: "manual",
      },
    ],
  };
  rpc.mockImplementation(async (method: string, params: unknown) => {
    if (method === "workspaces.list") return [{ workspaceId: "workspace-1", name: "Research" }];
    if (["routines.list", "routines.inbox", "tasks.list"].includes(method)) return [];
    if (method === "tasks.create") return task;
    if (method === "routines.create") {
      if (++routineAttempt === 1) throw new Error("Synthetic save failure");
      return { ...(params as object), routineId: "routine-prompt", revision: 1 };
    }
    throw new Error(`Unexpected ${method}`);
  });
  await createPromptForm();
  expect(rpc).not.toHaveBeenCalledWith("tasks.create", expect.anything());
  await submitSchedule();
  expect(container.textContent).toContain("The task was saved, but the routine was not created.");
  await submitSchedule();
  expect(rpc.mock.calls.filter(([method]) => method === "tasks.create")).toHaveLength(1);
  expect(rpc).toHaveBeenCalledWith(
    "tasks.create",
    expect.objectContaining({
      title: task.title,
      objective: task.objective,
      workspaceId: "workspace-1",
      criteria: task.criteria,
      resources: [],
    }),
  );
  expect(rpc).toHaveBeenLastCalledWith(
    "routines.create",
    expect.objectContaining({
      sourceTaskId: task.taskId,
      sourceTaskRevision: 1,
      successCriteria: task.criteria,
      paused: true,
      trigger: expect.objectContaining({ kind: "schedule", hour: 9, days: [0, 1, 2, 3, 4, 5, 6] }),
    }),
  );
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(
    rpc.mock.calls.some(([method]) => ["runs.start", "routines.run", "routines.pause"].includes(method)),
  ).toBe(false);
});
it("lists on-demand definitions as well as scheduled routines", async () => {
  rpc.mockImplementation(async (method: string) => {
    if (method === "workspaces.list") return [{ workspaceId: "workspace-1", name: "Research" }];
    if (method === "routines.list")
      return [
        { routineId: "manual", title: "On-demand review", trigger: { kind: "manual" }, calendarGrantIds: [] },
      ];
    if (method === "routines.inbox") return [];
    throw new Error(`Unexpected ${method}`);
  });
  await act(async () => root.render(<RoutinesSettings active />));
  expect(container.textContent).toContain("On-demand review");
});

it("follows the Home Space on reopening and hides the previous Space while its replacement loads", async () => {
  let finish!: (items: unknown[]) => void;
  rpc.mockImplementation(async (method: string, params: { workspaceId?: string }) => {
    if (method === "workspaces.list")
      return [
        { workspaceId: "workspace-1", name: "First" },
        { workspaceId: "workspace-2", name: "Second" },
      ];
    if (method === "routines.list") {
      if (params.workspaceId === "workspace-2")
        return new Promise((resolve) => {
          finish = resolve;
        });
      return [{ routineId: "first", title: "First Space routine", trigger: { kind: "manual" } }];
    }
    if (method === "routines.inbox") return [];
    throw new Error(`Unexpected ${method}`);
  });
  await act(async () => root.render(<RoutinesSettings active />));
  expect(container.textContent).toContain("First Space routine");
  await act(async () => root.render(<RoutinesSettings active={false} />));
  viewState.layout.activeSpaceId = "other";
  await act(async () => root.render(<RoutinesSettings active />));
  expect(container.textContent).not.toContain("First Space routine");
  expect(container.querySelector<HTMLSelectElement>('[aria-label="Routine Space"]')!.value).toBe(
    "workspace-2",
  );
  await act(async () =>
    finish([{ routineId: "second", title: "Second Space routine", trigger: { kind: "manual" } }]),
  );
  expect(container.textContent).toContain("Second Space routine");
});
