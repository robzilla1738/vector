// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryWorkspace } from "./MemoryWorkspace";
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
  executeCommand: async (command: string, context: any) => invokeScopedControl(command, context),
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
    if (method === "memory.pipeline.documents") return { generation: "generation", documents: [] };
    if (method === "memory.pipeline.activity" || method === "memory.pipeline.history") return [];
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
  await act(async () => root.render(<MemoryWorkspace memory={memory} historyOnly active />));
  expect(host.textContent).toContain("Synthetic model");
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
  await act(async () => root.render(<MemoryWorkspace memory={memory} historyOnly active />));
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
  await act(async () => root.render(<MemoryWorkspace memory={memory} historyOnly active />));
  await act(async () => button("Dream now").click());
  expect(fixture.call).toHaveBeenCalledWith("memory.pipeline.dream", { workspaceId: "workspace" });
  await act(async () => root.render(<MemoryWorkspace memory={memory} historyOnly active={false} />));
  expect(host.textContent).toBe("");
  expect(() => invokeScopedControl("run-memory-dream")).toThrow();
});

const renderOverview = () =>
  root.render(
    <MemoryWorkspace memory={memory} active>
      {(extension) => (
        <div>
          <div role="tree">{extension.navigation({ focused: "site", onFocus: () => {} })}</div>
          <section aria-label={extension.label}>
            {extension.selected ? extension.pane : "Owner document"}
          </section>
        </div>
      )}
    </MemoryWorkspace>,
  );
const click = async (label: string) => act(async () => button(label).click());
it("puts actual site documents and source search in the same pane, preserving source and generation identity", async () => {
  const sourceDocument = {
    documentId: "source-document",
    path: "sites/example.com.md",
    target: { kind: "site", origin: "https://example.com" },
    revision: 2,
    content: "Generated guidance",
    authoredBy: "generated",
    updatedAt: 1000,
    sourceRefs: [
      { claimId: "claim", sourceRunId: "source-run" },
      { claimId: "legacy-claim", sourceRunId: "legacy-run" },
    ],
  };
  const previous = fixture.call.getMockImplementation()!;
  fixture.call.mockImplementation(async (method: string, input: unknown) => {
    if (method === "memory.pipeline.documentList")
      return { generation: "generation", documents: [sourceDocument] };
    if (method === "memory.pipeline.documents")
      return {
        generation: "generation",
        documents: [
          { claim: { claimId: "claim", text: "Synthesis", source: { quote: "Original owner source" } } },
          { claim: { claimId: "legacy-claim", text: "Generated legacy synthesis" } },
        ],
      };
    if (method === "memory.pipeline.documentSet")
      return { generation: "generation", document: sourceDocument };
    return previous(method, input);
  });
  await act(async () => renderOverview());
  expect(host.querySelectorAll('[role="tree"]')).toHaveLength(1);
  expect(host.textContent).not.toContain("Dream now");
  await click("example.com.md");
  expect(host.textContent).toContain("Generated guidance");
  await click("Edit");
  expect(host.querySelector("textarea")?.value).toBe("Generated guidance");
  expect(host.textContent).toContain("Original owner source");
  expect(host.textContent).toContain("Original source is unavailable or no longer eligible.");
  expect(host.textContent).not.toContain("Generated legacy synthesis");
  expect(host.textContent).toContain("Saving makes this owner-written");
  const input = host.querySelector("textarea")!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(input, "Owner edit");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await click("Save document");
  expect(fixture.call).toHaveBeenCalledWith(
    "memory.pipeline.documentSet",
    expect.objectContaining({
      documentId: "source-document",
      expectedRevision: 2,
      expectedGeneration: "generation",
      content: "Owner edit",
    }),
  );
  await click("Search sources");
  expect(host.textContent).toContain("Queries (one per line, up to eight)");
  expect(host.textContent).not.toContain("Original owner source");
});
it("selects only one real activity detail and paginates fifty current records", async () => {
  const previous = fixture.call.getMockImplementation()!;
  const operations = Array.from({ length: 51 }, (_, index) => ({
    ...operation,
    operationId: `op-${index}`,
    startedAt: 10000 - index,
    changes: [],
    modelId: `Model ${index}`,
  }));
  fixture.call.mockImplementation(async (method: string, input: unknown) => {
    if (method === "memory.pipeline.dreamActivity")
      return { generation: "generation", entries: operations.slice(0, 50), nextCursor: "next" };
    return previous(method, input);
  });
  await act(async () => root.render(<MemoryWorkspace memory={memory} historyOnly active />));
  expect(host.querySelectorAll("button[data-activity]")).toHaveLength(50);
  expect(host.querySelectorAll('[aria-label="Selected Dream operation"]')).toHaveLength(1);
  await act(async () => host.querySelectorAll<HTMLButtonElement>("button[data-activity]")[1]!.click());
  expect(host.querySelector('[aria-label="Selected Dream operation"]')?.textContent).toContain("Model 1");
  fixture.call.mockImplementation(async (method: string, input: unknown) =>
    method === "memory.pipeline.dreamActivity"
      ? { generation: "generation", entries: [operations[50]], nextCursor: null }
      : previous(method, input),
  );
  await click("Load 50 more");
  expect(fixture.call).toHaveBeenCalledWith("memory.pipeline.dreamActivity", {
    workspaceId: "workspace",
    cursor: "next",
    limit: 50,
  });
  expect(host.querySelectorAll("button[data-activity]")).toHaveLength(51);
  expect(host.querySelector('[aria-label="Selected Dream operation"]')?.textContent).toContain("Model 1");
});
it("drops a late source search after Forget refresh, without restoring source-derived output", async () => {
  let resolve!: (value: unknown) => void;
  const pending = new Promise((resolveResult) => {
    resolve = resolveResult;
  });
  const previous = fixture.call.getMockImplementation()!;
  fixture.call.mockImplementation(async (method: string, input: unknown) =>
    method === "memory.pipeline.recall" ? pending : previous(method, input),
  );
  await act(async () => renderOverview());
  await click("Search sources");
  const input = host.querySelector("textarea")!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(
      input,
      "Original source",
    );
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () => button("Search").click());
  await act(async () =>
    fixture.listener?.({ type: "workspace.memory.updated", payload: { workspaceId: "workspace" } }),
  );
  await act(async () =>
    resolve({
      total: 1,
      mode: "lexical",
      matches: [{ chunkId: "forgotten", title: "Forgotten source", text: "Must stay retired" }],
      nextCursor: null,
    }),
  );
  expect(host.textContent).not.toContain("Forgotten source");
  expect(host.textContent).not.toContain("Must stay retired");
});

it("does not append a previously requested activity page after Forget retires its generation", async () => {
  let resolve!: (value: unknown) => void;
  const pending = new Promise((done) => {
    resolve = done;
  });
  let forgotten = false;
  const previous = fixture.call.getMockImplementation()!;
  fixture.call.mockImplementation(async (method: string, input: any) => {
    if (method === "memory.pipeline.dreamActivity") {
      if (input.cursor) return pending;
      return {
        generation: forgotten ? "retired-generation" : "generation",
        entries: forgotten
          ? []
          : Array.from({ length: 50 }, (_, index) => ({
              ...operation,
              operationId: `old-${index}`,
              changes: [],
            })),
        nextCursor: forgotten ? null : "next",
      };
    }
    if (method === "memory.pipeline.documentList" || method === "memory.pipeline.documents")
      return { generation: forgotten ? "retired-generation" : "generation", documents: [] };
    return previous(method, input);
  });
  await act(async () => root.render(<MemoryWorkspace memory={memory} historyOnly active />));
  await click("Load 50 more");
  forgotten = true;
  await act(async () =>
    fixture.listener?.({
      type: "workspace.memory.updated",
      payload: { workspaceId: "workspace" },
    }),
  );
  await act(async () =>
    resolve({
      generation: "generation",
      entries: [{ ...operation, operationId: "forgotten", modelId: "Retired model" }],
      nextCursor: null,
    }),
  );
  expect(host.querySelectorAll("button[data-activity]")).toHaveLength(0);
  expect(host.textContent).not.toContain("Retired model");
  expect(host.textContent).toContain("No Memory activity yet.");
});

it("opens a Dream file in the same selected pane and returns to its operation without duplicate headers", async () => {
  const sourceDocument = {
    documentId: "site",
    path: "sites/example.com.md",
    target: { kind: "site", origin: "https://example.com" },
    revision: 2,
    content: "Current site guidance",
    authoredBy: "generated",
    updatedAt: 1000,
    sourceRefs: [],
  };
  operation.changes = [
    { ...operation.changes[0], documentId: "site", ownerPath: undefined, state: "applied" },
  ];
  const previous = fixture.call.getMockImplementation()!;
  fixture.call.mockImplementation(async (method: string, input: unknown) =>
    method === "memory.pipeline.documentList"
      ? { generation: "generation", documents: [sourceDocument] }
      : previous(method, input),
  );
  await act(async () => root.render(<MemoryWorkspace memory={memory} historyOnly active />));
  await click("Open");
  const pane = host.querySelector(".memory-activity-pane")!;
  expect(pane.querySelectorAll("header")).toHaveLength(1);
  expect(pane.textContent).toContain("Current site guidance");
  expect(pane.textContent).not.toContain("Synthetic model");
  await click("Edit");
  expect(pane.querySelector("textarea")?.value).toBe("Current site guidance");
  await click("Back to activity");
  expect(pane.querySelectorAll("header")).toHaveLength(2);
  expect(pane.textContent).toContain("Synthetic model");
  expect(pane.querySelector("textarea")).toBeNull();
});
