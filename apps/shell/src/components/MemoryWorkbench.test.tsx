// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryWorkbench } from "./MemoryWorkbench";
import { invokeScopedControl } from "../scoped-control-commands";
const fixture = vi.hoisted(() => ({
  call: vi.fn(),
  privateMode: false,
  windowId: 1,
  listener: undefined as undefined | ((event: any) => void),
  layout: { spaces: [{ id: "space", workspaceId: "workspace" }] },
}));
vi.mock("../bridge", () => ({
  bridge: {
    get privateMode() {
      return fixture.privateMode;
    },
    get windowId() {
      return fixture.windowId;
    },
    onEvent(listener: (event: any) => void) {
      fixture.listener = listener;
      return () => {
        fixture.listener = undefined;
      };
    },
  },
}));
vi.mock("../store", () => ({
  call: fixture.call,
  useStore: { getState: () => ({ layout: fixture.layout }) },
  errToast: vi.fn(),
}));
vi.mock("../commands", async () => ({
  executeCommand: (command: string, context: any) => invokeScopedControl(command, context),
}));
vi.mock("../ui/dialog", () => ({ useConfirm: () => ({ confirm: async () => true, confirmation: null }) }));
const memory = { workspaceId: "workspace", content: "Owner", revision: 1, enabled: true };
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
let operation: any;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  fixture.privateMode = false;
  fixture.windowId = 1;
  fixture.layout = { spaces: [{ id: "space", workspaceId: "workspace" }] };
  operation = {
    operationId: "operation",
    trigger: "manual",
    status: "completed",
    startedAt: 1000,
    durationMs: 25,
    modelId: "Synthetic model",
    inputTokens: 100,
    outputTokens: 20,
    cachedInputTokens: 0,
    costUsd: 0.001,
    costEstimated: false,
    changes: [
      {
        changeId: "change",
        path: "MEMORY.md",
        ownerPath: "MEMORY.md",
        before: "Owner before",
        after: "Proposed after",
        state: "pending",
        sourceRefs: [{ claimId: "claim" }],
      },
    ],
  };
  fixture.call.mockReset().mockImplementation(async (method: string) => {
    if (method === "memory.pipeline.documentList") return { generation: "generation", documents: [] };
    if (method === "memory.pipeline.dreamStatus")
      return { active: null, lastRunAt: 1000, eligibleSessions: 5, due: true };
    if (method === "memory.pipeline.dreamActivity")
      return { generation: "generation", entries: [operation], nextCursor: null };
    if (method === "routines.list") return [];
    if (["memory.pipeline.dream", "memory.pipeline.dreamReview"].includes(method)) return operation;
    throw new Error(`Unexpected ${method}`);
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const button = (text: string) =>
  [...host.querySelectorAll("button")].find((button) => button.textContent === text)!;
it("shows measured zero cache usage and actual before/after proposals, and binds acceptance to displayed revisions", async () => {
  await act(async () => root.render(<MemoryWorkbench memory={memory} active />));
  expect(host.textContent).toContain("Synthetic model");
  const summary = host.querySelector("details")!;
  summary.open = true;
  const cacheLabel = [...host.querySelectorAll("dt")].find((label) => label.textContent === "Cached input")!;
  expect(cacheLabel.nextElementSibling?.textContent).toBe("0");
  expect(host.textContent).toContain("Owner before");
  expect(host.textContent).toContain("Proposed after");
  await act(async () => button("Accept proposal").click());
  expect(fixture.call).toHaveBeenCalledWith("memory.pipeline.dreamReview", {
    workspaceId: "workspace",
    operationId: "operation",
    changeId: "change",
    decision: "accept",
    expectedGeneration: "generation",
    expectedOwnerRevision: 1,
  });
});
it("never follows a retired Space or native window when an old scoped control is invoked", async () => {
  await act(async () => root.render(<MemoryWorkbench memory={memory} active />));
  const original = button("Dream now");
  original.focus();
  fixture.windowId = 2;
  expect(() => invokeScopedControl("run-memory-dream")).toThrow("original Space");
  expect(fixture.call.mock.calls.some(([method]) => method === "memory.pipeline.dream")).toBe(false);
  fixture.windowId = 1;
  fixture.layout = { spaces: [] };
  expect(() => invokeScopedControl("run-memory-dream")).toThrow("original Space");
});
it("starts a real Dream request and retires controls when their view is hidden", async () => {
  await act(async () => root.render(<MemoryWorkbench memory={memory} active />));
  await act(async () => button("Dream now").click());
  expect(fixture.call).toHaveBeenCalledWith("memory.pipeline.dream", { workspaceId: "workspace" });
  await act(async () => root.render(<MemoryWorkbench memory={memory} active={false} />));
  expect(host.textContent).toBe("");
  expect(() => invokeScopedControl("run-memory-dream")).toThrow();
});
