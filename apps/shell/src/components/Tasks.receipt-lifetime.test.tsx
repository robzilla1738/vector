// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { TaskSchema, TaskReceiptSchema } from "@aux/contracts";
const state = vi.hoisted(() => ({
  call: vi.fn(),
  pick: vi.fn(),
  readDocument: vi.fn(),
  releaseDocuments: vi.fn(),
  realReceipt: false,
  privateMode: false,
  windowId: "one",
  props: null as null | {
    submit: (method: string, ...params: unknown[]) => Promise<boolean>;
    onChanged: () => Promise<void>;
  },
}));
vi.mock("../store", async (original) => ({
  ...(await original<typeof import("../store")>()),
  call: state.call,
}));
vi.mock("../bridge", async (original) => {
  const actual = await original<typeof import("../bridge")>();
  return {
    ...actual,
    bridge: {
      ...actual.bridge,
      pickEvidenceDocuments: state.pick,
      readEvidenceDocument: state.readDocument,
      releaseEvidenceDocuments: state.releaseDocuments,
      get privateMode() {
        return state.privateMode;
      },
      get windowId() {
        return state.windowId;
      },
    },
  };
});
vi.mock("./TaskReceiptView", async (original) => {
  const actual = await original<typeof import("./TaskReceiptView")>();
  return {
    TaskReceiptView: (props: React.ComponentProps<typeof actual.TaskReceiptView>) => {
      state.props = props as typeof state.props;
      return state.realReceipt ? <actual.TaskReceiptView {...props} /> : <div>Receipt probe</div>;
    },
  };
});
vi.mock("./TaskResources", () => ({ TaskResources: () => null }));
vi.mock("./CalendarTaskGrants", () => ({ CalendarTaskGrants: () => null }));
vi.mock("./Routines", () => ({ Routines: () => null }));
vi.mock("./Goals", () => ({ Goals: () => null }));
vi.mock("./Hooks", () => ({ Hooks: () => null }));
import { Tasks } from "./Tasks";
import { makeDocumentRead } from "../mock/fixtures";
import { useStore } from "../store";
Object.defineProperty(HTMLElement.prototype, "scrollTo", { configurable: true, value: vi.fn() });
const initial = useStore.getState();
const task = TaskSchema.parse({
  taskId: "original",
  workspaceId: "workspace",
  revision: 1,
  title: "Original task",
  objective: "Original goal",
  criteria: [{ criterionId: "criterion", description: "Original criterion", verification: "manual" }],
  state: "open",
  createdAt: 1,
  updatedAt: 1,
});
const details = { task, revisions: [task], runs: [], children: [] };
const receipt = TaskReceiptSchema.parse({
  taskId: "original",
  taskRevision: 1,
  objective: "Original goal",
  generatedAt: 1,
  status: "needs_review",
  criteria: [],
  unresolvedActions: [],
  runs: [],
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
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const storage = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
  localStorage.setItem("aux.task-selection.v1", JSON.stringify({ tasks: { workspace: "original" } }));
  state.privateMode = false;
  state.windowId = "one";
  state.props = null;
  state.realReceipt = false;
  state.pick.mockReset().mockResolvedValue({ selectionId: "selection", count: 1 });
  state.readDocument.mockReset().mockResolvedValue(makeDocumentRead());
  state.releaseDocuments.mockReset().mockResolvedValue(undefined);
  state.call
    .mockReset()
    .mockImplementation(async (method: string) =>
      method === "tasks.list"
        ? [task]
        : method === "tasks.get"
          ? details
          : method === "tasks.receipt"
            ? receipt
            : { accepted: true },
    );
  useStore.setState({
    ...initial,
    layout: {
      ...initial.layout,
      activeSpaceId: "space",
      spaces: [{ id: "space", name: "Original", workspaceId: "workspace" } as never],
    },
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function render() {
  await act(async () => root.render(<Tasks />));
  expect(state.props).not.toBeNull();
}
function submit() {
  return state.props!.submit("tasks.recordEvidence", {
    taskId: "original",
    expectedRevision: 1,
    criterionId: "criterion",
    summary: "Original note",
  });
}
it("refreshes actual current task after original mutation ACK", async () => {
  await render();
  const before = state.call.mock.calls.length;
  let result!: boolean;
  await act(async () => {
    result = await submit();
  });
  expect(result).toBe(true);
  expect(state.call.mock.calls.slice(before).map((row) => row[0])).toEqual([
    "tasks.recordEvidence",
    "tasks.get",
    "tasks.receipt",
    "tasks.list",
  ]);
  expect(host.querySelector("fieldset")!.disabled).toBe(false);
});
it("keeps document batch identity across saves and refreshes when its receipt sequence ends", async () => {
  await render();
  const before = state.call.mock.calls.length;
  for (const index of [0, 1]) {
    await act(async () => {
      expect(
        await state.props!.submit("tasks.importDocumentEvidence", {
          taskId: "original",
          expectedRevision: 1,
          criterionId: "criterion",
          selectionId: "11111111-1111-4111-8111-111111111111",
          index,
          snapshotId: "22222222-2222-4222-8222-222222222222",
          sourceSha256: "a".repeat(64),
        }),
      ).toBe(true);
    });
  }
  expect(state.call.mock.calls.slice(before).map((row) => row[0])).toEqual([
    "tasks.importDocumentEvidence",
    "tasks.importDocumentEvidence",
  ]);
  await act(async () => state.props!.onChanged());
  expect(state.call.mock.calls.slice(before + 2).map((row) => row[0])).toEqual([
    "tasks.get",
    "tasks.receipt",
    "tasks.list",
  ]);
});
it("retains acknowledged write despite follow-up read failure", async () => {
  await render();
  state.call.mockImplementation(async (method: string) => {
    if (method === "tasks.get") throw new Error("readback failure");
    return { accepted: true };
  });
  let result!: boolean;
  await act(async () => {
    result = await submit();
  });
  expect(result).toBe(true);
  expect(host.textContent).toContain("The receipt action completed, but the receipt could not be refreshed.");
  expect(host.querySelector("fieldset")!.disabled).toBe(false);
});
it("retires held mutation through Private ABA without starting old readback or local error", async () => {
  await render();
  const pending = held<unknown>();
  state.call.mockReturnValueOnce(pending.promise);
  let completion!: Promise<boolean>;
  await act(async () => {
    completion = submit();
  });
  state.privateMode = true;
  await render();
  state.privateMode = false;
  await render();
  const before = state.call.mock.calls.length;
  await act(async () => pending.resolve({ accepted: true }));
  expect(await completion).toBe(true);
  expect(state.call.mock.calls).toHaveLength(before);
  expect(host.querySelector("fieldset")!.disabled).toBe(false);
  expect(host.querySelector('[role="alert"]')).toBeNull();
});
it("preserves retired original producer rejection without publishing it into a new owner", async () => {
  await render();
  const pending = held<unknown>(),
    reason = new Error("Original rejection");
  state.call.mockReturnValueOnce(pending.promise);
  let completion!: Promise<boolean>;
  await act(async () => {
    completion = submit();
  });
  const rejected = completion.catch((error) => error);
  state.windowId = "two";
  await render();
  state.windowId = "one";
  await render();
  await act(async () => pending.reject(reason));
  expect(await rejected).toBe(reason);
  expect(host.textContent).not.toContain(reason.message);
  expect(host.querySelector("fieldset")!.disabled).toBe(false);
});
it("does not publish fulfilled original readback after window retirement", async () => {
  await render();
  const pending = held<typeof details>();
  state.call.mockImplementation(async (method: string) =>
    method === "tasks.get"
      ? pending.promise
      : method === "tasks.receipt"
        ? receipt
        : method === "tasks.list"
          ? [task]
          : { accepted: true },
  );
  let completion!: Promise<boolean>;
  await act(async () => {
    completion = submit();
  });
  state.windowId = "two";
  await render();
  await act(async () => pending.resolve({ ...details, task: { ...task, title: "Retired readback" } }));
  expect(await completion).toBe(true);
  expect(host.textContent).not.toContain("Retired readback");
});

it("keeps the actual task import Cancel enabled while saving and refreshes an accepted late result", async () => {
  state.realReceipt = true;
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  const pending = held<unknown>();
  const actualReceipt = TaskReceiptSchema.parse({
    ...receipt,
    criteria: [{ criterion: task.criteria[0], status: "unverified", evidence: [] }],
  });
  state.call.mockImplementation(async (method: string) => {
    if (method === "tasks.importDocumentEvidence") return pending.promise;
    if (method === "tasks.receipt") return actualReceipt;
    if (method === "tasks.get") return details;
    if (method === "tasks.list") return [task];
    throw new Error(`Unexpected ${method}`);
  });
  await render();
  const button = (id: string) => host.querySelector<HTMLButtonElement>(`[data-command-id="${id}"]`)!;
  await act(async () => button("import-task-receipt-document").click());
  await act(async () => button("save-task-receipt-document").click());
  expect(button("cancel-task-receipt-document").matches(":disabled")).toBe(false);
  await expect(submit()).rejects.toThrow("current receipt action");
  await act(async () => button("cancel-task-receipt-document").click());
  expect(state.releaseDocuments).toHaveBeenCalledExactlyOnceWith("selection");
  const before = state.call.mock.calls.length;
  await act(async () => pending.resolve({ accepted: true }));
  expect(state.call.mock.calls.slice(before).map(([method]) => method)).toEqual([
    "tasks.get",
    "tasks.receipt",
    "tasks.list",
  ]);
  expect(host.querySelector('[aria-label="Document preview"]')).toBeNull();
});
