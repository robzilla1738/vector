// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { TaskSchema, TaskReceiptSchema } from "@aux/contracts";
const state = vi.hoisted(() => ({
  call: vi.fn(),
  privateMode: false,
  windowId: "one",
  props: null as null | {
    update: (resources: import("@aux/contracts").Task["resources"]) => Promise<boolean>;
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
      get privateMode() {
        return state.privateMode;
      },
      get windowId() {
        return state.windowId;
      },
    },
  };
});
vi.mock("./TaskReceiptView", () => ({ TaskReceiptView: () => null }));
vi.mock("./TaskResources", () => ({
  TaskResources: (props: typeof state.props) => {
    state.props = props;
    return <div>Resource parent probe</div>;
  },
}));
vi.mock("./CalendarTaskGrants", () => ({ CalendarTaskGrants: () => null }));
vi.mock("./Routines", () => ({ Routines: () => null }));
vi.mock("./Goals", () => ({ Goals: () => null }));
vi.mock("./Hooks", () => ({ Hooks: () => null }));
import { Tasks } from "./Tasks";
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
  vi.unstubAllGlobals();
});
async function render() {
  await act(async () => root.render(<Tasks />));
  expect(state.props).not.toBeNull();
}
const resources = [
  {
    resourceId: "source",
    kind: "file" as const,
    locator: "/original/ref.txt",
    label: "Original reference",
    access: "reference" as const,
  },
];
const update = () => state.props!.update(resources);
it("keeps exact original revision/resources and refresh after acknowledged mutation", async () => {
  await render();
  const before = state.call.mock.calls.length;
  let result!: boolean;
  await act(async () => {
    result = await update();
  });
  expect(result).toBe(true);
  expect(state.call.mock.calls.slice(before)).toEqual([
    ["tasks.update", { taskId: "original", expectedRevision: 1, resources }],
    ["tasks.get", { taskId: "original" }],
    ["tasks.receipt", { taskId: "original" }],
    ["tasks.list", { workspaceId: "workspace", includeArchived: true }],
  ]);
  expect(host.querySelector("fieldset")!.disabled).toBe(false);
});
it("retired resource callback refuses before mutation after Private ABA", async () => {
  await render();
  const original = state.props!.update;
  state.privateMode = true;
  await render();
  state.privateMode = false;
  await render();
  const before = state.call.mock.calls.length;
  let result!: boolean;
  await act(async () => {
    result = await original(resources);
  });
  expect(result).toBe(false);
  expect(state.call.mock.calls).toHaveLength(before);
});
it.each(["resolve", "reject"])(
  "held resource mutation %s cannot refresh or publish after Private ABA",
  async (outcome) => {
    await render();
    const pending = held<unknown>();
    state.call.mockReturnValueOnce(pending.promise);
    let completion!: Promise<boolean>;
    await act(async () => {
      completion = update();
    });
    state.privateMode = true;
    await render();
    state.privateMode = false;
    await render();
    const before = state.call.mock.calls.length;
    await act(async () => {
      if (outcome === "resolve") pending.resolve(task);
      else pending.reject(new Error("Retired resource write"));
    });
    expect(await completion).toBe(outcome === "resolve");
    expect(state.call.mock.calls).toHaveLength(before);
    expect(host.querySelector('[role="alert"]')).toBeNull();
    expect(host.querySelector("fieldset")!.disabled).toBe(false);
  },
);
it("held original readback does not replace current task after window ABA", async () => {
  await render();
  const pending = held<unknown>();
  state.call.mockImplementation(async (method) =>
    method === "tasks.get"
      ? pending.promise
      : method === "tasks.receipt"
        ? receipt
        : method === "tasks.list"
          ? [task]
          : task,
  );
  let completion!: Promise<boolean>;
  await act(async () => {
    completion = update();
  });
  state.windowId = "two";
  await render();
  state.windowId = "one";
  await render();
  await act(async () => pending.resolve({ ...details, task: { ...task, title: "Retired readback" } }));
  expect(await completion).toBe(true);
  expect(host.textContent).not.toContain("Retired readback");
});
it("original pending resource write refuses a duplicate", async () => {
  await render();
  const pending = held<unknown>();
  state.call.mockReturnValueOnce(pending.promise);
  let first!: Promise<boolean>;
  await act(async () => {
    first = update();
  });
  const before = state.call.mock.calls.length;
  let second!: boolean;
  await act(async () => {
    second = await update();
  });
  expect(second).toBe(false);
  expect(state.call.mock.calls).toHaveLength(before);
  await act(async () => pending.resolve(task));
  expect(await first).toBe(true);
});
