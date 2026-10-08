// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { TaskReceiptSchema, COMMANDS } from "@aux/contracts";
const hostState = vi.hoisted(() => ({
  windowId: "one",
  privateMode: false,
  kind: "normal",
  read: vi.fn(),
  saveFile: vi.fn(),
  saveArtifact: vi.fn(),
  pick: vi.fn(),
  readDocument: vi.fn(),
  releaseDocuments: vi.fn(),
  submit: vi.fn(),
  changed: vi.fn(),
}));
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
    pickEvidenceDocuments: hostState.pick,
    readEvidenceDocument: hostState.readDocument,
    releaseEvidenceDocuments: hostState.releaseDocuments,
    saveFile: hostState.saveFile,
    saveStoredArtifact: hostState.saveArtifact,
  },
}));
vi.mock("../store", async (original) => ({
  ...(await original<typeof import("../store")>()),
  call: hostState.read,
}));
import { TaskReceiptView } from "./TaskReceiptView";
import { executeCommand, dispatchShortcut } from "../commands";
import { useStore } from "../store";
const initial = useStore.getState();
const sample = (revision = 1) =>
  TaskReceiptSchema.parse({
    taskId: "original-task",
    taskRevision: revision,
    currentTaskRevision: revision,
    objective: "Original objective",
    generatedAt: 1,
    status: "accepted",
    criteria: [
      {
        criterion: { criterionId: "criterion", description: "Original criterion", verification: "manual" },
        status: "accepted",
        evidence: [
          {
            stale: false,
            record: {
              evidenceId: "original-evidence",
              taskId: "original-task",
              taskRevision: revision,
              criterionId: "criterion",
              kind: "document_snapshot",
              actor: "desktop_user",
              summary: "Original source",
              recordedAt: 1,
              observedAt: 1,
              runSequence: 0,
              source: {
                filename: "synthetic.txt",
                sha256: "a".repeat(64),
                byteLength: 17,
                cloudArtifacts: [
                  {
                    artifactId: "original-artifact",
                    label: "Original export",
                    sha256: "b".repeat(64),
                    bytes: 10,
                  },
                ],
              },
              snapshot: { title: "synthetic.txt", text: "Original captured text" },
            },
          },
        ],
      },
    ],
    unresolvedActions: [],
    runs: [],
    modelCalls: 0,
    knownCostUsd: 0,
    costComplete: true,
  });
function held<T>() {
  let resolve!: (v: T) => void, reject!: (r: unknown) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
let host: HTMLDivElement, root: ReturnType<typeof createRoot>, receipt: ReturnType<typeof sample>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  hostState.windowId = "one";
  hostState.privateMode = false;
  hostState.kind = "normal";
  receipt = sample();
  hostState.pick.mockReset().mockResolvedValue({ selectionId: "selection", count: 1 });
  hostState.readDocument.mockReset().mockResolvedValue({ filename: "owned.txt", content: "owned content" });
  hostState.releaseDocuments.mockReset().mockResolvedValue(undefined);
  hostState.submit.mockReset().mockResolvedValue(true);
  hostState.changed.mockReset().mockResolvedValue(undefined);
  hostState.read.mockReset().mockResolvedValue(receipt);
  hostState.saveFile.mockReset().mockResolvedValue("/synthetic/receipt.md");
  hostState.saveArtifact.mockReset().mockResolvedValue("/synthetic/artifact.bin");
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  useStore.setState(initial, true);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const render = async (value = receipt) => {
  await act(async () =>
    root.render(
      <TaskReceiptView
        receipt={value}
        pageId="original-page"
        submit={hostState.submit}
        onChanged={hostState.changed}
      />,
    ),
  );
};
const control = (id: string) => host.querySelector<HTMLElement>(`[data-command-id="${id}"]`)!;
async function input(selector: string, value: string) {
  const element = host.querySelector<HTMLTextAreaElement>(selector)!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(element, value);
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function run(id: string) {
  control(id).focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = executeCommand(id);
  });
  return completion;
}
it("uses registered focused note/capture/review commands with original criterion and evidence", async () => {
  await render();
  await input('textarea[aria-label="Evidence or review note"]', "Original review");
  await act(async () => control("add-task-receipt-note").click());
  expect(hostState.submit).toHaveBeenLastCalledWith("tasks.recordEvidence", {
    taskId: "original-task",
    expectedRevision: 1,
    criterionId: "criterion",
    summary: "Original review",
  });
  await act(async () => control("select-task-receipt-evidence").click());
  await run("accept-task-receipt-criterion");
  expect(hostState.submit).toHaveBeenLastCalledWith("tasks.reviewCriterion", {
    taskId: "original-task",
    expectedRevision: 1,
    criterionId: "criterion",
    evidenceIds: ["original-evidence"],
    note: "Original review",
    outcome: "accepted",
  });
  await run("capture-task-receipt-page");
  expect(hostState.submit).toHaveBeenLastCalledWith("tasks.captureEvidence", {
    taskId: "original-task",
    expectedRevision: 1,
    criterionId: "criterion",
    pageId: "original-page",
  });
});
it("preserves owned chooser ACK, local preview and explicit document confirmation", async () => {
  await render();
  expect(await run("import-task-receipt-document")).toEqual({ selectionId: "selection", count: 1 });
  expect(hostState.submit).not.toHaveBeenCalled();
  expect(host.textContent).toContain("Importing does not send the text to a model");
  expect(await run("save-task-receipt-document")).toBe(true);
  expect(hostState.submit).toHaveBeenCalledWith("tasks.importDocumentEvidence", {
    taskId: "original-task",
    expectedRevision: 1,
    criterionId: "criterion",
    filename: "owned.txt",
    content: "owned content",
  });
  expect(host.querySelector('[aria-label="Document preview"]')).toBeNull();
});
it("previews one selected document at a time and refreshes only after accepted saves finish", async () => {
  hostState.pick.mockResolvedValue({ selectionId: "batch", count: 3 });
  hostState.readDocument.mockImplementation(async (_selection, index) => {
    if (index === 1) throw new Error("invalid_argument: bad.txt: could not read UTF-8 text up to 2 MiB");
    return { filename: `${index}.txt`, content: `content ${index}` };
  });
  await render();
  await run("import-task-receipt-document");
  expect(hostState.readDocument).toHaveBeenCalledExactlyOnceWith("batch", 0);
  expect(host.textContent).toContain("Document 1 of 3");
  await run("save-task-receipt-document");
  expect(hostState.changed).not.toHaveBeenCalled();
  expect(hostState.submit).toHaveBeenCalledTimes(1);
  expect(hostState.readDocument).toHaveBeenCalledTimes(3);
  expect(host.textContent).toContain("bad.txt");
  expect(host.textContent).toContain("Document 3 of 3");
  await run("save-task-receipt-document");
  expect(hostState.submit).toHaveBeenCalledTimes(2);
  expect(hostState.changed).toHaveBeenCalledOnce();
  expect(hostState.releaseDocuments).toHaveBeenCalledExactlyOnceWith("batch");
  await render({ ...receipt, generatedAt: 2 });
  expect(host.textContent).toContain("bad.txt");
});
it("explicitly skips a preview and releases remaining files when cancelled", async () => {
  hostState.pick.mockResolvedValue({ selectionId: "batch", count: 3 });
  await render();
  await run("import-task-receipt-document");
  await run("skip-task-receipt-document");
  expect(hostState.submit).not.toHaveBeenCalled();
  expect(host.textContent).toContain("Document 2 of 3");
  await run("cancel-task-receipt-document");
  expect(hostState.readDocument).toHaveBeenCalledTimes(2);
  expect(hostState.releaseDocuments).toHaveBeenCalledExactlyOnceWith("batch");
  expect(hostState.changed).not.toHaveBeenCalled();
});
it("retires held chooser through window ABA without reviving original preview", async () => {
  const old = held<{ selectionId: string; count: number }>();
  hostState.pick.mockReturnValueOnce(old.promise);
  await render();
  control("import-task-receipt-document").focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = executeCommand("import-task-receipt-document");
  });
  hostState.windowId = "two";
  await render();
  hostState.windowId = "one";
  await render();
  await act(async () => old.resolve({ selectionId: "retired", count: 1 }));
  expect(await completion).toEqual({ selectionId: "retired", count: 1 });
  expect(hostState.releaseDocuments).toHaveBeenCalledWith("retired");
  expect(hostState.readDocument).not.toHaveBeenCalled();
  expect(host.textContent).not.toContain("retired.txt");
  expect(hostState.submit).not.toHaveBeenCalled();
});
it("does not let old import finally clear a fresh owner operation", async () => {
  const old = held<{ selectionId: string; count: number }>(),
    fresh = held<{ selectionId: string; count: number }>();
  hostState.pick.mockReturnValueOnce(old.promise).mockReturnValueOnce(fresh.promise);
  await render();
  let a!: Promise<unknown>, b!: Promise<unknown>;
  control("import-task-receipt-document").focus();
  await act(async () => {
    a = executeCommand("import-task-receipt-document");
  });
  await render(sample(2));
  control("import-task-receipt-document").focus();
  await act(async () => {
    b = executeCommand("import-task-receipt-document");
  });
  await act(async () => old.resolve({ selectionId: "old", count: 1 }));
  await a;
  expect(control("import-task-receipt-document").matches(":disabled")).toBe(true);
  await act(async () => fresh.resolve({ selectionId: "fresh", count: 1 }));
  await b;
  expect(hostState.readDocument).toHaveBeenCalledExactlyOnceWith("fresh", 0);
  expect(host.textContent).toContain("owned.txt");
});
it("preserves original rejected import object while retiring local error delivery", async () => {
  const pending = held<never>(),
    reason = new Error("old chooser failure");
  hostState.pick.mockReturnValueOnce(pending.promise);
  await render();
  control("import-task-receipt-document").focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = executeCommand("import-task-receipt-document");
  });
  const rejected = completion.catch((error) => error);
  hostState.privateMode = true;
  await render();
  hostState.privateMode = false;
  await render();
  await act(async () => pending.reject(reason));
  expect(await rejected).toBe(reason);
  expect(host.textContent).not.toContain(reason.message);
});
it("does not grant historical/active evidence review or import authority", async () => {
  receipt = { ...receipt, runs: [{ runId: "run", status: "running" } as never] };
  await render();
  expect(control("import-task-receipt-document").matches(":disabled")).toBe(true);
  expect(control("verify-task-receipt-criterion").matches(":disabled")).toBe(true);
  expect(hostState.submit).not.toHaveBeenCalled();
});
it("keeps remappable command rows closed to actual scoped owners", async () => {
  await render();
  for (const id of [
    "add-task-receipt-note",
    "import-task-receipt-document",
    "review-task-receipt-run-undo",
    "accept-task-receipt-action",
    "reject-task-receipt-operation",
  ]) {
    expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
      palette: false,
      bindings: [],
      handler: "shell",
    });
  }
  document.body.focus();
  await expect(executeCommand("capture-task-receipt-page")).rejects.toThrow();
  expect(hostState.submit).not.toHaveBeenCalled();
});
it("requires selected saved evidence and reason for original action and operation reconciliation", async () => {
  receipt = TaskReceiptSchema.parse({
    ...receipt,
    unresolvedActions: [{ intentId: "intent", runId: "run", pageId: "original-page", status: "uncertain" }],
    unresolvedOperations: [
      {
        invocationId: "operation",
        operation: "write-file",
        effectClass: "write",
        status: "uncertain",
        effectOutcome: "unknown",
        startedAt: 1,
      },
    ],
  });
  await render();
  expect(control("accept-task-receipt-action").matches(":disabled")).toBe(true);
  for (const [selectId, noteLabel, id, method, key] of [
    [
      "select-task-receipt-action-evidence",
      "Reconciliation reason",
      "reject-task-receipt-action",
      "tasks.reconcileAction",
      "intentId",
    ],
    [
      "select-task-receipt-operation-evidence",
      "Operation reconciliation reason",
      "accept-task-receipt-operation",
      "tasks.reconcileOperation",
      "invocationId",
    ],
  ] as const) {
    const select = control(selectId) as HTMLSelectElement;
    await act(async () => {
      select.value = "original-evidence";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await input(`textarea[aria-label="${noteLabel}"]`, "Independent record checked");
    await run(id);
    expect(hostState.submit).toHaveBeenLastCalledWith(method, {
      taskId: "original-task",
      expectedRevision: 1,
      [key]: key === "intentId" ? "intent" : "operation",
      evidenceId: "original-evidence",
      outcome: id.startsWith("reject") ? "not_applied" : "applied",
      note: "Independent record checked",
    });
  }
});
it("keeps genuine undo ACK if optional receipt refresh fails", async () => {
  receipt = TaskReceiptSchema.parse({
    ...receipt,
    undoReviews: [{ runId: "run", token: "a".repeat(64), eligibleStepIds: ["step"] }],
  });
  hostState.read.mockImplementation(async (method: string) =>
    method === "tasks.receipt" ? receipt : { restored: 1, skipped: [] },
  );
  hostState.changed.mockRejectedValue(new Error("readback failed"));
  await render();
  await run("review-task-receipt-run-undo");
  await act(async () => control("select-task-receipt-undo-change").click());
  const result = await run("undo-task-receipt-selected-changes");
  expect(result).toEqual({ restored: 1, skipped: [] });
  expect(host.textContent).toContain("Browser changes were undone, but the receipt could not be refreshed.");
});
it("does not revive review token on same-scope receipt replacement", async () => {
  receipt = TaskReceiptSchema.parse({
    ...receipt,
    undoReviews: [{ runId: "run", token: "a".repeat(64), eligibleStepIds: ["step"] }],
  });
  hostState.read.mockResolvedValue(receipt);
  await render();
  await run("review-task-receipt-run-undo");
  expect(control("select-task-receipt-undo-change")).not.toBeNull();
  await render({ ...receipt, generatedAt: 2 });
  expect(host.querySelector('[aria-label="Review selected browser undo"]')).toBeNull();
  expect(hostState.submit).not.toHaveBeenCalled();
});

it("remaps current evidence selection without recursive DOM click", async () => {
  await render();
  const input = control("select-task-receipt-evidence") as HTMLInputElement;
  input.focus();
  const clicks = vi.fn();
  input.addEventListener("click", clicks);
  useStore.setState({
    settings: {
      ...useStore.getState().settings,
      shortcutOverrides: { "select-task-receipt-evidence": [{ key: "e", meta: true }] },
    },
  });
  await act(async () => {
    expect(
      dispatchShortcut({
        commandId: "select-task-receipt-evidence",
        key: "e",
        meta: true,
        alt: false,
        shift: false,
      }),
    ).toBe(true);
  });
  expect(input.checked).toBe(true);
  expect(clicks).not.toHaveBeenCalled();
  expect(hostState.submit).not.toHaveBeenCalled();
});
