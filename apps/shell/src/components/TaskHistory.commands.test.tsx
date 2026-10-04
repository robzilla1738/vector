// @vitest-environment jsdom
import { act, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { TaskSchema, TaskReceiptSchema, COMMANDS } from "@aux/contracts";
const hostState = vi.hoisted(() => ({ windowId: "one", privateMode: false, kind: "normal", read: vi.fn() }));
vi.mock("../bridge", async (original) => ({
  ...(await original<typeof import("../bridge")>()),
  bridge: {
    ...(await original<typeof import("../bridge")>()).bridge,
    get windowId() {
      return hostState.windowId;
    },
    get privateMode() {
      return hostState.privateMode;
    },
    get windowKind() {
      return hostState.kind;
    },
  },
}));
vi.mock("../store", async (original) => ({
  ...(await original<typeof import("../store")>()),
  call: hostState.read,
}));
import { TaskHistory } from "./TaskHistory";
import { executeCommand, dispatchShortcut } from "../commands";
import { useStore } from "../store";
const task = (revision: number, taskId = "task") =>
  TaskSchema.parse({
    taskId,
    revision,
    workspaceId: "workspace",
    title: `Saved ${taskId} ${revision}`,
    objective: "Original objective",
    criteria: [{ criterionId: "one", description: "Original", verification: "manual" }],
    resources: [],
    state: "open",
    createdAt: 1,
    updatedAt: 1,
  });
const details = (taskId = "task") => ({
  task: task(2, taskId),
  revisions: [task(1, taskId), task(2, taskId)],
  runs: [],
  children: [],
});
const receipt = (revision: number, taskId = "task") =>
  TaskReceiptSchema.parse({
    taskId,
    taskRevision: revision,
    objective: "Original objective",
    generatedAt: 1,
    status: "needs_review",
    criteria: [],
    unresolvedActions: [],
    runs: [{ runId: "saved-run", taskRevision: revision, status: "completed", currentRevision: true }],
    modelCalls: 0,
    knownCostUsd: 0,
    costComplete: true,
  });
function held<T>() {
  let resolve!: (value: T) => void, reject!: (reason: unknown) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
let host: HTMLDivElement,
  root: ReturnType<typeof createRoot>,
  close: ReturnType<typeof vi.fn>,
  open: ReturnType<typeof vi.fn>;
const initial = useStore.getState();
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  hostState.windowId = "one";
  hostState.privateMode = false;
  hostState.kind = "normal";
  hostState.read.mockReset();
  hostState.read.mockImplementation(async (method, params) =>
    method === "tasks.get" ? details(params.taskId) : receipt(params.revision, params.taskId),
  );
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  HTMLElement.prototype.scrollIntoView = vi.fn();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  close = vi.fn();
  open = vi.fn();
  useStore.setState({ ...initial, openRail: open, setOverlay: vi.fn() }, true);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const render = async (id = "task") => {
  await act(async () => root.render(<TaskHistory taskId={id} onClose={close} />));
};
const button = (id: string) => host.querySelector<HTMLElement>(`[data-command-id="${id}"]`)!;
it("registers all original visible actions and preserves saved default revision/current draft", async () => {
  await render();
  expect(host.textContent).toContain("Saved task history");
  expect((button("select-task-history-revision") as HTMLSelectElement).value).toBe("1");
  for (const id of [
    "close-task-history",
    "retry-task-history",
    "select-task-history-revision",
    "open-task-history-run",
    "toggle-task-history-runs",
  ])
    expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
      palette: false,
      bindings: [],
      handler: "shell",
    });
  await act(async () => button("toggle-task-history-runs").click());
  expect(host.querySelector("details")!.open).toBe(true);
  await act(async () => button("open-task-history-run").click());
  expect(open).toHaveBeenCalledWith({ kind: "run", runId: "saved-run" });
  await act(async () => button("close-task-history").click());
  expect(close).toHaveBeenCalledOnce();
});
it("actual focused remapping dispatches Back once", async () => {
  await render();
  useStore.setState({
    settings: {
      ...useStore.getState().settings,
      shortcutOverrides: { "close-task-history": [{ key: "j", meta: true }] },
    },
  });
  button("close-task-history").focus();
  await act(async () => {
    expect(
      dispatchShortcut({ commandId: "close-task-history", key: "j", meta: true, alt: false, shift: false }),
    ).toBe(true);
  });
  expect(close).toHaveBeenCalledOnce();
});
it("returns exact receipt ACK for selected revision", async () => {
  await render();
  const result = receipt(2);
  hostState.read.mockResolvedValueOnce(result);
  const select = button("select-task-history-revision") as HTMLSelectElement;
  select.value = "2";
  select.focus();
  let completion: Promise<unknown>;
  await act(async () => {
    completion = executeCommand("select-task-history-revision");
    expect(await completion).toBe(result);
  });
  expect(host.textContent).toContain("Saved task 2");
});
it("older receipt rejection cannot replace newer selected revision", async () => {
  await render();
  const a = held<ReturnType<typeof receipt>>();
  hostState.read.mockReturnValueOnce(a.promise);
  const select = button("select-task-history-revision") as HTMLSelectElement;
  select.value = "2";
  select.focus();
  let pending!: Promise<unknown>;
  await act(async () => {
    pending = executeCommand("select-task-history-revision");
  });
  select.value = "1";
  await act(async () => {
    await executeCommand("select-task-history-revision");
  });
  const reason = new Error("old private receipt");
  await act(async () => {
    a.reject(reason);
    expect(await pending.catch((e) => e)).toBe(reason);
  });
  expect(host.textContent).toContain("Saved task 1");
  expect(host.textContent).not.toContain(reason.message);
});
it.each(["window", "Private"])("held original receipt retires irreversibly across %s ABA", async (mode) => {
  await render();
  const a = held<ReturnType<typeof receipt>>();
  hostState.read.mockReturnValueOnce(a.promise);
  const select = button("select-task-history-revision") as HTMLSelectElement;
  select.value = "2";
  select.focus();
  let pending!: Promise<unknown>;
  await act(async () => {
    pending = executeCommand("select-task-history-revision");
  });
  if (mode === "window") hostState.windowId = "two";
  else hostState.privateMode = true;
  await render();
  hostState.windowId = "one";
  hostState.privateMode = false;
  await render();
  await act(async () => {
    a.resolve(receipt(2));
    expect(await pending).toBe(await a.promise);
  });
  expect((button("select-task-history-revision") as HTMLSelectElement).value).toBe("1");
});
it("task replacement refuses old fulfilled receipt and keeps new task history", async () => {
  const a = held<ReturnType<typeof details>>();
  hostState.read.mockReturnValueOnce(a.promise);
  await render();
  await render("other");
  await act(async () => a.resolve(details()));
  expect(host.textContent).toContain("Saved other 1");
  expect(host.textContent).not.toContain("Saved task 1");
});
it("retry retains original get ACK and genuine failure identity", async () => {
  const reason = new Error("read failed");
  hostState.read.mockRejectedValueOnce(reason);
  await render();
  button("retry-task-history").focus();
  const result = details();
  hostState.read.mockResolvedValueOnce(result);
  await act(async () => {
    expect(await executeCommand("retry-task-history")).toBe(result);
  });
  expect(host.textContent).not.toContain(reason.message);
});
it("active mismatched receipt rejects without displaying unrelated task", async () => {
  await render();
  hostState.read.mockResolvedValueOnce(receipt(2, "foreign"));
  const select = button("select-task-history-revision") as HTMLSelectElement;
  select.value = "2";
  select.focus();
  await act(async () => {
    await expect(executeCommand("select-task-history-revision")).rejects.toThrow(
      "Saved task receipt changed",
    );
  });
  expect(host.textContent).not.toContain("Saved foreign");
});
it("hidden or foreign original control cannot close history", async () => {
  await render();
  button("close-task-history").focus();
  host.hidden = true;
  await expect(executeCommand("close-task-history")).rejects.toThrow();
  expect(close).not.toHaveBeenCalled();
});
it("StrictMode retires queued original requests while current replay remains usable", async () => {
  await act(async () =>
    root.render(
      <StrictMode>
        <TaskHistory taskId="task" onClose={close} />
      </StrictMode>,
    ),
  );
  expect(host.textContent).toContain("Saved task 1");
  expect(hostState.read.mock.calls.filter(([method]) => method === "tasks.get")).toHaveLength(1);
  await act(async () => button("close-task-history").click());
  expect(close).toHaveBeenCalledOnce();
});
it("real initial read rejection after committed Private ABA cannot publish into new history", async () => {
  const a = held<ReturnType<typeof receipt>>();
  hostState.read.mockImplementationOnce(async () => details()).mockReturnValueOnce(a.promise);
  await render();
  hostState.privateMode = true;
  await render();
  hostState.privateMode = false;
  await render();
  await act(async () => a.reject(new Error("retired initial history")));
  expect(host.textContent).not.toContain("retired initial history");
  expect(host.textContent).toContain("Saved task 1");
});
