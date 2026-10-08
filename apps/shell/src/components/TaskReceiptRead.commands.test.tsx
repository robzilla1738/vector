// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { TaskReceiptSchema, COMMANDS } from "@aux/contracts";
import type { TaskReceiptExportParams } from "@aux/contracts/task-receipt-export";
const hostState = vi.hoisted(() => ({
  windowId: "one",
  privateMode: false,
  kind: "normal",
  read: vi.fn(),
  saveFile: vi.fn(),
  saveArtifact: vi.fn(),
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
import { reportCommandCompletionFailure } from "../command-completion";
import { usePreferenceCommand } from "../settings/sections/preference-command";
const initial = useStore.getState();
const sample = (revision = 1) =>
  TaskReceiptSchema.parse({
    taskId: "original-task",
    taskRevision: revision,
    currentTaskRevision: 3,
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
const prepared = (exportId: string) => ({
  status: "prepared" as const,
  exportId,
  artifactId: `receipt-${exportId}`,
  filename: "aux-receipt-original-task-r1.md",
  byteLength: 200,
  sha256: "c".repeat(64),
  expiresAt: Date.now() + 60_000,
});
function exportRequest() {
  return hostState.read.mock.calls.find(
    ([method, params]) => method === "tasks.exportReceipt" && params.action === "prepare",
  )![1] as Extract<TaskReceiptExportParams, { action: "prepare" }>;
}
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
  hostState.read.mockReset().mockImplementation(async (method, params: TaskReceiptExportParams) => {
    if (method !== "tasks.exportReceipt") return receipt;
    return params.action === "prepare"
      ? prepared(params.exportId)
      : { status: "retired", exportId: params.exportId };
  });
  hostState.saveFile.mockReset().mockResolvedValue("/synthetic/receipt.md");
  hostState.saveArtifact
    .mockReset()
    .mockImplementation(async (id: string) =>
      id.startsWith("receipt-") ? "/synthetic/receipt.md" : "/synthetic/artifact.bin",
    );
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
  await act(async () => root.render(<TaskReceiptView receipt={value} pageId={null} readOnly />));
};
const control = (id: string) => host.querySelector<HTMLElement>(`[data-command-id="${id}"]`)!;
it("registers original read-only actions while preserving evidence provenance", async () => {
  await render();
  for (const id of [
    "export-task-receipt",
    "toggle-task-receipt-captured-text",
    "save-task-receipt-artifact",
    "toggle-task-receipt-fingerprint",
    "toggle-task-receipt-snapshot",
  ])
    expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
      palette: false,
      bindings: [],
      handler: "shell",
    });
  expect(host.textContent).toContain(
    "SHA-256 identifies these saved bytes; it does not verify the document’s claims.",
  );
  expect(host.querySelector("textarea")).toBeNull();
  expect(host.textContent).not.toContain("Accept criterion");
  await act(async () => control("toggle-task-receipt-fingerprint").click());
  expect(host.querySelector("details")!.open).toBe(true);
  await act(async () => control("toggle-task-receipt-snapshot").click());
  expect(control("toggle-task-receipt-snapshot").closest("details")!.open).toBe(true);
});
it("real captured-text checkbox and focused remap share command without synthetic click", async () => {
  await render();
  const input = control("toggle-task-receipt-captured-text") as HTMLInputElement;
  await act(async () => input.click());
  expect(input.checked).toBe(true);
  const clicks = vi.fn();
  input.addEventListener("click", clicks);
  input.focus();
  useStore.setState({
    settings: {
      ...useStore.getState().settings,
      shortcutOverrides: { "toggle-task-receipt-captured-text": [{ key: "i", meta: true }] },
    },
  });
  await act(async () => {
    expect(
      dispatchShortcut({
        commandId: "toggle-task-receipt-captured-text",
        key: "i",
        meta: true,
        alt: false,
        shift: false,
      }),
    ).toBe(true);
  });
  expect(input.checked).toBe(false);
  expect(clicks).not.toHaveBeenCalled();
});
it("explicit snapshot inclusion exports original fresh saved revision and exact chooser ACK", async () => {
  await render();
  await act(async () => control("toggle-task-receipt-captured-text").click());
  control("export-task-receipt").focus();
  await act(async () => {
    expect(await executeCommand("export-task-receipt")).toBe("/synthetic/receipt.md");
  });
  expect(exportRequest()).toEqual({
    action: "prepare",
    exportId: expect.any(String),
    taskId: "original-task",
    expectedRevision: 1,
    includeCapturedText: true,
  });
  expect(hostState.saveArtifact).toHaveBeenCalledWith(
    `receipt-${exportRequest().exportId}`,
    "aux-receipt-original-task-r1.md",
  );
  expect(hostState.read).toHaveBeenLastCalledWith("tasks.exportReceipt", {
    action: "retire",
    exportId: exportRequest().exportId,
  });
  expect(hostState.saveFile).not.toHaveBeenCalled();
  expect(host.textContent).toContain("Receipt exported.");
});
it.each(["saved", "canceled", "failed"] as const)(
  "settles native %s outcome before runtime cleanup and preserves it after cleanup failure",
  async (outcome) => {
    await render();
    const cleanup = held<{ status: "retired"; exportId: string }>();
    hostState.read.mockImplementation(async (_method, params: TaskReceiptExportParams) =>
      params.action === "prepare" ? prepared(params.exportId) : cleanup.promise,
    );
    const reason = new Error("Native chooser unavailable");
    const destination = outcome === "saved" ? "/synthetic/receipt.md" : null;
    if (outcome === "failed") hostState.saveArtifact.mockRejectedValueOnce(reason);
    else hostState.saveArtifact.mockResolvedValueOnce(destination);
    control("export-task-receipt").focus();
    let settled: unknown = "pending";
    await act(async () => {
      void executeCommand("export-task-receipt").then(
        (value) => (settled = value),
        (error) => (settled = error),
      );
    });
    expect(settled).toBe(outcome === "failed" ? reason : destination);
    expect(control("export-task-receipt").matches(":disabled")).toBe(false);
    const message =
      outcome === "failed" ? reason.message : outcome === "saved" ? "Receipt exported." : "Export canceled.";
    expect(host.textContent).toContain(message);
    expect(hostState.read).toHaveBeenLastCalledWith("tasks.exportReceipt", {
      action: "retire",
      exportId: exportRequest().exportId,
    });
    await act(async () => cleanup.reject(new Error("Runtime unavailable")));
    expect(host.textContent).toContain(message);
    expect(host.textContent).toContain("Temporary export cleanup is pending.");
  },
);
it.each(["receipt ABA", "new attempt"])("late cleanup warning cannot enter %s", async (replacement) => {
  await render();
  const cleanup = held<{ status: "retired"; exportId: string }>();
  hostState.read
    .mockImplementationOnce(async (_method, params: TaskReceiptExportParams) => prepared(params.exportId))
    .mockReturnValueOnce(cleanup.promise);
  control("export-task-receipt").focus();
  let settled: unknown = "pending";
  await act(async () => {
    void executeCommand("export-task-receipt").then((value) => (settled = value));
  });
  expect(settled).toBe("/synthetic/receipt.md");
  if (replacement === "receipt ABA") {
    await render(sample(2));
    await render();
  }
  const save = held<string | null>();
  hostState.saveArtifact.mockReturnValueOnce(save.promise);
  control("export-task-receipt").focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = executeCommand("export-task-receipt");
  });
  await act(async () => cleanup.reject(new Error("Old cleanup failed")));
  expect(host.textContent).not.toContain("Temporary export cleanup is pending.");
  expect(control("export-task-receipt").matches(":disabled")).toBe(true);
  await act(async () => {
    save.resolve("/synthetic/fresh.md");
    expect(await completion).toBe("/synthetic/fresh.md");
  });
  expect(host.textContent).toContain("Receipt exported.");
  expect(host.textContent).not.toContain("Temporary export cleanup is pending.");
});
it("default export omits captured text", async () => {
  await render();
  await act(async () => control("export-task-receipt").click());
  expect(exportRequest().includeCapturedText).toBe(false);
});
it("foreign export identity refuses before chooser", async () => {
  await render();
  hostState.read.mockResolvedValueOnce(prepared(crypto.randomUUID()));
  control("export-task-receipt").focus();
  await act(async () => {
    await expect(executeCommand("export-task-receipt")).rejects.toThrow("This receipt export changed");
  });
  expect(hostState.saveArtifact).not.toHaveBeenCalled();
});
it.each(["receipt", "window", "Private"])(
  "held original export error retires across %s ABA and preserves exact reason",
  async (mode) => {
    await render();
    const hold = held<string | null>();
    hostState.saveArtifact.mockReturnValueOnce(hold.promise);
    control("export-task-receipt").focus();
    let completion!: Promise<unknown>;
    await act(async () => {
      completion = executeCommand("export-task-receipt");
    });
    const observed = completion.catch((reason) => reason);
    if (mode === "receipt") await render(sample(2));
    else {
      if (mode === "window") hostState.windowId = "two";
      else hostState.privateMode = true;
      await render();
    }
    hostState.windowId = "one";
    hostState.privateMode = false;
    await render();
    const reason = new Error("original export rejection");
    await act(async () => {
      hold.reject(reason);
      expect(await observed).toBe(reason);
    });
    expect(host.textContent).not.toContain(reason.message);
    const report = vi.fn();
    reportCommandCompletionFailure(completion, reason, report);
    expect(report).not.toHaveBeenCalled();
  },
);
it("old fulfilled chooser ACK remains exact without clearing a new original export’s pending UI", async () => {
  await render();
  const a = held<string | null>(),
    b = held<string | null>();
  hostState.saveArtifact.mockReturnValueOnce(a.promise);
  control("export-task-receipt").focus();
  let old!: Promise<unknown>, fresh!: Promise<unknown>;
  await act(async () => {
    old = executeCommand("export-task-receipt");
  });
  await render(sample(2));
  expect(hostState.read.mock.calls.some(([, params]) => params?.action === "retire")).toBe(false);
  hostState.saveArtifact.mockReturnValueOnce(b.promise);
  control("export-task-receipt").focus();
  await act(async () => {
    fresh = executeCommand("export-task-receipt");
  });
  await act(async () => {
    a.resolve("/synthetic/old.md");
    expect(await old).toBe("/synthetic/old.md");
  });
  expect(control("export-task-receipt").matches(":disabled")).toBe(true);
  expect(host.textContent).not.toContain("Receipt exported.");
  await act(async () => {
    b.resolve("/synthetic/new.md");
    expect(await fresh).toBe("/synthetic/new.md");
  });
  expect(control("export-task-receipt").matches(":disabled")).toBe(false);
});
it("receipt retired during preparation retires its export and never starts a file chooser", async () => {
  await render();
  const a = held<ReturnType<typeof prepared>>();
  hostState.read.mockReturnValueOnce(a.promise);
  control("export-task-receipt").focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = executeCommand("export-task-receipt");
  });
  const observed = completion.catch((reason) => reason);
  await render(sample(2));
  await act(async () => {
    a.resolve(prepared(exportRequest().exportId));
    expect(await observed).toBeInstanceOf(Error);
  });
  expect(hostState.saveArtifact).not.toHaveBeenCalled();
  expect(hostState.read).toHaveBeenCalledWith("tasks.exportReceipt", {
    action: "retire",
    exportId: exportRequest().exportId,
  });
});
it("Cancel during preparation retires the exact pending export and a late result cannot open Save", async () => {
  await render();
  const preparation = held<ReturnType<typeof prepared>>();
  const cleanup = held<{ status: "retired"; exportId: string }>();
  hostState.read.mockReturnValueOnce(preparation.promise).mockReturnValueOnce(cleanup.promise);
  control("export-task-receipt").focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = executeCommand("export-task-receipt");
  });
  control("cancel-task-receipt-export").focus();
  let canceled = false,
    exported = false;
  await act(async () => {
    void executeCommand("cancel-task-receipt-export").then(() => (canceled = true));
    void completion.then(() => (exported = true));
    preparation.resolve(prepared(exportRequest().exportId));
  });
  expect(canceled).toBe(false);
  expect(exported).toBe(false);
  expect(host.textContent).toContain("Canceling…");
  expect(hostState.read).toHaveBeenCalledWith("tasks.exportReceipt", {
    action: "retire",
    exportId: exportRequest().exportId,
  });
  await act(async () => {
    cleanup.resolve({ status: "retired", exportId: exportRequest().exportId });
    expect(await completion).toBeNull();
  });
  expect(hostState.saveArtifact).not.toHaveBeenCalled();
  expect(host.textContent).toContain("Export canceled.");
});
it("artifact Save preserves exact original native arguments and ACK", async () => {
  await render();
  control("save-task-receipt-artifact").focus();
  await act(async () => {
    expect(await executeCommand("save-task-receipt-artifact")).toBe("/synthetic/artifact.bin");
  });
  expect(hostState.saveArtifact).toHaveBeenCalledWith("original-artifact", "Original export");
});
it("held artifact error after source retirement retains rejection without old visible diagnostic", async () => {
  await render();
  const a = held<string | null>();
  hostState.saveArtifact.mockReturnValueOnce(a.promise);
  control("save-task-receipt-artifact").focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = executeCommand("save-task-receipt-artifact");
  });
  const observed = completion.catch((reason) => reason);
  await render(sample(2));
  const reason = { message: "retired artifact" };
  await act(async () => {
    a.reject(reason);
    expect(await observed).toBe(reason);
  });
  expect(host.textContent).not.toContain("[object Object]");
});
it("in-place changed original artifact hash refuses before native save", async () => {
  await render();
  receipt.criteria[0]!.evidence[0]!.record.source.cloudArtifacts![0]!.sha256 = "c".repeat(64);
  control("save-task-receipt-artifact").focus();
  await expect(executeCommand("save-task-receipt-artifact")).rejects.toThrow("original artifact");
  expect(hostState.saveArtifact).not.toHaveBeenCalled();
});
it("focused artifact shortcut calls exactly original producer; foreign/hidden owner refuses", async () => {
  await render();
  control("save-task-receipt-artifact").focus();
  useStore.setState({
    settings: {
      ...useStore.getState().settings,
      shortcutOverrides: { "save-task-receipt-artifact": [{ key: "s", meta: true }] },
    },
  });
  await act(async () => {
    expect(
      dispatchShortcut({
        commandId: "save-task-receipt-artifact",
        key: "s",
        meta: true,
        alt: false,
        shift: false,
      }),
    ).toBe(true);
  });
  expect(hostState.saveArtifact).toHaveBeenCalledOnce();
  host.hidden = true;
  await expect(executeCommand("save-task-receipt-artifact")).rejects.toThrow();
  expect(hostState.saveArtifact).toHaveBeenCalledOnce();
});
it("real original Save rejection cannot publish into a replacement receipt", async () => {
  await render();
  const a = held<string | null>();
  hostState.saveArtifact.mockReturnValueOnce(a.promise);
  const save = [...host.querySelectorAll("button")].find(
    (button) => button.textContent === "Save Original export…",
  )!;
  await act(async () => save.click());
  await render(sample(2));
  await act(async () => a.reject(new Error("retired original artifact diagnostic")));
  expect(host.textContent).not.toContain("retired original artifact diagnostic");
});

it("current artifact rejection remains identical and its diagnostic belongs only to original receipt", async () => {
  await render();
  const reason = new Error("actual original artifact error");
  hostState.saveArtifact.mockRejectedValueOnce(reason);
  control("save-task-receipt-artifact").focus();
  await act(async () => {
    expect(await executeCommand("save-task-receipt-artifact").catch((error) => error)).toBe(reason);
  });
  expect(host.textContent).toContain(reason.message);
  await render(sample(2));
  expect(host.textContent).not.toContain(reason.message);
});
function PreferenceEventProbe({
  capture,
}: {
  capture: (element: HTMLInputElement, event?: Event) => unknown;
}) {
  const [ref, run] = usePreferenceCommand<HTMLInputElement>(
    "toggle-task-receipt-captured-text",
    "event-probe",
    capture,
  );
  return <input ref={ref} type="checkbox" aria-label="Original checkbox probe" onChange={run} />;
}
it("shared preference seam forwards exact original Event and leaves focused shortcut event absent", async () => {
  const capture = vi.fn();
  await act(async () => root.render(<PreferenceEventProbe capture={capture} />));
  const input = host.querySelector("input")!;
  let original!: Event;
  input.addEventListener("click", (event) => {
    original = event;
  });
  await act(async () => input.click());
  expect(capture).toHaveBeenLastCalledWith(input, original);
  input.focus();
  await act(async () => {
    await executeCommand("toggle-task-receipt-captured-text");
  });
  expect(capture).toHaveBeenLastCalledWith(input, undefined);
});
