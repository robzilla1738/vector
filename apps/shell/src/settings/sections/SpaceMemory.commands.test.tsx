// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { COMMANDS, effectiveShortcuts, matchShortcut } from "@aux/contracts";
import { SpaceMemory } from "./SpaceMemory";
import { useStore } from "../../store";
import { executeCommand, runCommand } from "../../commands";
const mocks = vi.hoisted(() => ({
  call: vi.fn(),
  toast: vi.fn(),
  privateMode: false,
  listeners: new Set<(event: unknown) => void>(),
}));
vi.mock("../../bridge", async (original) => {
  const actual = await original<typeof import("../../bridge")>();
  return {
    ...actual,
    bridge: {
      ...actual.bridge,
      windowKind: "normal",
      get privateMode() {
        return mocks.privateMode;
      },
      onEvent: (listener: (event: unknown) => void) => {
        mocks.listeners.add(listener);
        return () => mocks.listeners.delete(listener);
      },
    },
  };
});
vi.mock("../../store", async (original) => ({
  ...(await original<typeof import("../../store")>()),
  call: mocks.call,
  errToast: mocks.toast,
}));
vi.mock("../../components/MemoryPasteImport", () => ({
  MemoryPasteImport: () => <output>Paste import</output>,
}));
vi.mock("../../components/MemoryRecoveryNotice", () => ({
  MemoryRecoveryNotice: () => <output>Fresh backup needed</output>,
}));
const ids = [
  "toggle-space-memory-pipeline",
  "toggle-space-memory-import",
  "select-space-memory-source",
  "extract-space-memory-source",
  "refresh-space-memory-pipeline",
  "accept-space-memory-note",
  "discard-space-memory-note",
  "forget-space-memory-source",
  "forget-space-memory-note",
  "forget-all-space-memory",
  "toggle-space-memory-history",
  "restore-space-memory-revision",
  "confirm-forget-space-memory",
  "cancel-forget-space-memory",
] as const;
const note = {
  claimId: "11111111-1111-4111-8111-111111111111",
  sourceRunId: "completed",
  text: "Original report note",
  capturedAt: 1,
  source: { kind: "run-report", quote: "Exact quote", quoteSha256: "a".repeat(64) },
};
const approved = { ...note, claimId: "22222222-2222-4222-8222-222222222222", text: "Approved note" };
const revision = {
  revisionId: "33333333-3333-4333-8333-333333333333",
  capturedAt: 1,
  claimCount: 1,
  summary: "Original summary",
  sourceRunIds: ["completed"],
};
let host: HTMLDivElement, root: ReturnType<typeof createRoot>, enabled: boolean;
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
function control(id: string) {
  const node = document.body.querySelector<HTMLElement>(`[data-command-id="${id}"]`);
  if (!node) throw new Error(id);
  return node;
}
async function click(id: string) {
  await act(async () => control(id).click());
}
async function clickExtract() {
  const node = [...host.querySelectorAll("button")].find(
    (node) => node.textContent === "Create review notes",
  );
  if (!node) throw new Error("Create review notes");
  await act(async () => node.click());
}
async function render(workspaceId = "space") {
  await act(async () => root.render(<SpaceMemory workspaceId={workspaceId} />));
}
function response(method: string, params: { workspaceId: string; enabled?: boolean }) {
  if (method === "memory.pipeline.policy") return { workspaceId: params.workspaceId, enabled };
  if (method === "memory.pipeline.overview")
    return {
      workspaceId: params.workspaceId,
      enabled,
      summary: `${params.workspaceId} summary`,
      claimCount: 1,
      sourceCount: 1,
    };
  if (method === "memory.pipeline.sources")
    return [
      { runId: "completed", goal: "Original goal", endedAt: 1 },
      { runId: "second", goal: "Other goal", endedAt: 2 },
    ];
  if (method === "memory.pipeline.inbox") return [note];
  if (method === "memory.pipeline.claims") return [approved];
  if (method === "memory.pipeline.history") return [revision];
  if (method === "memory.pipeline.activity") return [];
  if (method === "memory.pipeline.setPolicy") {
    enabled = !!params.enabled;
    return { workspaceId: params.workspaceId, enabled };
  }
  if (method === "memory.pipeline.forget") return { forgotten: 1, remaining: 0 };
  if (["memory.pipeline.extractRun", "memory.pipeline.review", "memory.pipeline.revert"].includes(method))
    return { ok: true };
  throw new Error(`Unexpected ${method}`);
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockImplementation(
    () => [{ width: 100 }] as unknown as DOMRectList,
  );
  mocks.privateMode = false;
  mocks.listeners.clear();
  mocks.call.mockReset();
  mocks.toast.mockReset();
  enabled = true;
  mocks.call.mockImplementation(async (method, params) => response(method, params));
  useStore.setState({
    layout: {
      ...useStore.getState().layout,
      spaces: [
        { id: "native", workspaceId: "space", name: "Original", color: "blue", grain: 0 },
        { id: "other", workspaceId: "replacement", name: "Other", color: "blue", grain: 0 },
      ],
      archivedSpaces: [],
    },
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
it.each(ids)("registers %s with exact normal-window focused remapping", (id) => {
  expect(COMMANDS.filter((row) => row.id === id)).toHaveLength(1);
  expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
    palette: false,
    windows: ["normal"],
    handler: "shell",
    bindings: [],
    intercept: true,
  });
  expect(
    matchShortcut(effectiveShortcuts({ [id]: [{ key: "m", command: true, alt: true }] }), {
      key: "m",
      meta: true,
      alt: true,
      shift: false,
    })?.id,
  ).toBe(id);
});
it("does not enable Memory until the original checkbox request and selects a real completed source", async () => {
  enabled = false;
  await render();
  expect(mocks.call.mock.calls.filter(([method]) => method === "memory.pipeline.setPolicy")).toHaveLength(0);
  await click("toggle-space-memory-pipeline");
  expect(mocks.call).toHaveBeenCalledWith("memory.pipeline.setPolicy", {
    workspaceId: "space",
    enabled: true,
  });
  const selector = control("select-space-memory-source") as HTMLSelectElement;
  await act(async () => {
    selector.value = "second";
    selector.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await clickExtract();
  expect(mocks.call).toHaveBeenCalledWith("memory.pipeline.extractRun", {
    workspaceId: "space",
    runId: "second",
  });
});
it("actual review/revert/import/history controls retain original claim and revision IDs", async () => {
  await render();
  await click("accept-space-memory-note");
  expect(mocks.call).toHaveBeenCalledWith("memory.pipeline.review", {
    workspaceId: "space",
    claimId: note.claimId,
    decision: "accept",
  });
  await click("discard-space-memory-note");
  expect(mocks.call).toHaveBeenCalledWith("memory.pipeline.review", {
    workspaceId: "space",
    claimId: note.claimId,
    decision: "discard",
  });
  await click("toggle-space-memory-history");
  expect(host.querySelector("details")!.open).toBe(true);
  await act(async () =>
    [...host.querySelectorAll("button")]
      .find((button) => button.textContent === "Recovery revisions")!
      .click(),
  );
  await click("restore-space-memory-revision");
  expect(mocks.call).toHaveBeenCalledWith("memory.pipeline.revert", {
    workspaceId: "space",
    revisionId: revision.revisionId,
  });
  await click("toggle-space-memory-import");
  expect(control("toggle-space-memory-import").getAttribute("aria-expanded")).toBe("true");
  expect(host.textContent).toContain("Paste import");
  await click("toggle-space-memory-import");
  expect(host.textContent).not.toContain("Paste import");
});
it("genuine confirmation keeps notes on cancel and forgets only the original selected claim", async () => {
  await render();
  await click("forget-space-memory-note");
  expect(document.querySelector('[role="alertdialog"]')?.textContent).toContain(
    "Copied offline recovery packages and their phrases remain usable",
  );
  expect(mocks.call.mock.calls.filter(([method]) => method === "memory.pipeline.forget")).toHaveLength(0);
  await click("cancel-forget-space-memory");
  expect(document.querySelector('[role="alertdialog"]')).toBeNull();
  await click("forget-space-memory-note");
  await click("confirm-forget-space-memory");
  expect(mocks.call).toHaveBeenCalledWith("memory.pipeline.forget", {
    workspaceId: "space",
    claimId: approved.claimId,
  });
  expect(host.textContent).toContain("Fresh backup needed");
});
it("snapshot replacement while actual Forget confirmation is open refuses original mutation", async () => {
  await render();
  await click("forget-all-space-memory");
  await act(async () => {
    for (const listener of mocks.listeners)
      listener({ type: "workspace.memory.updated", payload: { workspaceId: "space" } });
  });
  await click("confirm-forget-space-memory");
  expect(mocks.call.mock.calls.filter(([method]) => method === "memory.pipeline.forget")).toHaveLength(0);
  expect(host.querySelector('[role="alert"]')?.textContent).toBeUndefined();
});
it("held action cannot refresh or toast into replacement workspace", async () => {
  const hold = deferred<unknown>();
  mocks.call.mockImplementation(async (method, params) =>
    method === "memory.pipeline.extractRun" ? hold.promise : response(method, params),
  );
  await render();
  await clickExtract();
  await render("replacement");
  const replacementReads = mocks.call.mock.calls.filter(
    ([method, params]) => method === "memory.pipeline.overview" && params.workspaceId === "replacement",
  ).length;
  await act(async () => hold.reject(new Error("Original private error")));
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(host.textContent).toContain("replacement summary");
  expect(
    mocks.call.mock.calls.filter(
      ([method, params]) => method === "memory.pipeline.overview" && params.workspaceId === "replacement",
    ),
  ).toHaveLength(replacementReads);
});
it("late old action finally cannot clear a fresh snapshot's original pending operation", async () => {
  const first = deferred<unknown>(),
    second = deferred<unknown>();
  let calls = 0;
  mocks.call.mockImplementation(async (method, params) =>
    method === "memory.pipeline.extractRun"
      ? ++calls === 1
        ? first.promise
        : second.promise
      : response(method, params),
  );
  await render();
  await clickExtract();
  await act(async () => {
    for (const listener of mocks.listeners)
      listener({ type: "workspace.memory.updated", payload: { workspaceId: "space" } });
  });
  await clickExtract();
  await act(async () => first.resolve({ ok: true }));
  expect((control("extract-space-memory-source") as HTMLButtonElement).disabled).toBe(true);
  await act(async () => second.resolve({ ok: true }));
  expect((control("extract-space-memory-source") as HTMLButtonElement).disabled).toBe(false);
});
it("Private and removed native Space retire confirmation and never authorize effects", async () => {
  await render();
  await click("forget-all-space-memory");
  mocks.privateMode = true;
  await render();
  expect(document.querySelector('[role="alertdialog"]')).toBeNull();
  mocks.privateMode = false;
  await render();
  expect(mocks.call.mock.calls.filter(([method]) => method === "memory.pipeline.forget")).toHaveLength(0);
  control("extract-space-memory-source").focus();
  await act(async () => {
    useStore.setState({ layout: { ...useStore.getState().layout, spaces: [] } });
    await expect(executeCommand("extract-space-memory-source")).rejects.toThrow("controls changed");
  });
  expect(mocks.call.mock.calls.filter(([method]) => method === "memory.pipeline.extractRun")).toHaveLength(0);
});
it("unfocused, foreign and hidden registered pipeline controls refuse", async () => {
  await render();
  await expect(executeCommand("accept-space-memory-note")).rejects.toThrow("focused");
  control("accept-space-memory-note").focus();
  await expect(
    executeCommand("accept-space-memory-note", { payload: { scopeId: "other:claim" } }),
  ).rejects.toThrow("focused");
  host.hidden = true;
  await expect(executeCommand("accept-space-memory-note")).rejects.toThrow("focused");
  expect(mocks.call.mock.calls.filter(([method]) => method === "memory.pipeline.review")).toHaveLength(0);
});
it("actual initial Private owner performs no pipeline reads", async () => {
  mocks.privateMode = true;
  await render();
  expect(mocks.call).not.toHaveBeenCalled();
  expect(host.textContent).toContain("non-private Space");
});
it("a late rejected original refresh cannot replace the latest backend snapshot with preview/error", async () => {
  const old = deferred<unknown>();
  let loads = 0;
  mocks.call.mockImplementation(async (method, params) =>
    method === "memory.pipeline.policy" && ++loads === 1 ? old.promise : response(method, params),
  );
  await render();
  await act(async () => {
    for (const listener of mocks.listeners)
      listener({ type: "workspace.memory.updated", payload: { workspaceId: "space" } });
  });
  await act(async () => old.reject(new Error("feature_unavailable old preview")));
  expect(host.textContent).toContain("Original report note");
  expect(host.textContent).not.toContain("Space memory is in preview");
  expect(host.querySelector('[role="alert"]')).toBeNull();
});
it("foreign workspace replies never expose extraction or mutation controls", async () => {
  mocks.call.mockImplementation(async (method, params) =>
    method === "memory.pipeline.overview"
      ? { ...response(method, params), workspaceId: "foreign" }
      : response(method, params),
  );
  await render();
  expect(host.querySelector('[role="alert"]')?.textContent).toContain("original workspace");
  expect(host.querySelector('[data-command-id="extract-space-memory-source"]')).toBeNull();
});
it("remapped original operation rejects truthfully but reports no retired private failure", async () => {
  const hold = deferred<unknown>();
  mocks.call.mockImplementation(async (method, params) =>
    method === "memory.pipeline.extractRun" ? hold.promise : response(method, params),
  );
  await render();
  control("extract-space-memory-source").focus();
  await act(async () => {
    expect(runCommand("extract-space-memory-source")).toBe(true);
  });
  await render("replacement");
  await act(async () => hold.reject(new Error("Original private report")));
  expect(mocks.toast).not.toHaveBeenCalled();
  expect(host.querySelector('[role="alert"]')).toBeNull();
});
it("awaited original command preserves exact rejection after retirement and exact ACK after unmount", async () => {
  const failure = deferred<unknown>();
  mocks.call.mockImplementation(async (method, params) =>
    method === "memory.pipeline.extractRun" ? failure.promise : response(method, params),
  );
  await render();
  control("extract-space-memory-source").focus();
  let pending!: Promise<unknown>;
  await act(async () => {
    pending = executeCommand("extract-space-memory-source");
  });
  const reason = new Error("Original failure");
  const rejected = pending.then(
    (value) => ({ kind: "resolved", value }),
    (reason) => ({ kind: "rejected", reason }),
  );
  await render("replacement");
  await act(async () => {
    failure.reject(reason);
    expect(await rejected).toEqual({ kind: "rejected", reason });
  });
  expect(mocks.toast).not.toHaveBeenCalled();
  const success = deferred<unknown>();
  mocks.call.mockImplementation(async (method, params) =>
    method === "memory.pipeline.extractRun" ? success.promise : response(method, params),
  );
  control("extract-space-memory-source").focus();
  await act(async () => {
    pending = executeCommand("extract-space-memory-source");
  });
  await act(async () => root.render(null));
  const ack = { ok: true, original: "ack" };
  await act(async () => {
    success.resolve(ack);
    expect(await pending).toBe(ack);
  });
});
it("live remapped rejection retains normal reporting instead of resolved success", async () => {
  const hold = deferred<unknown>();
  mocks.call.mockImplementation(async (method, params) =>
    method === "memory.pipeline.extractRun" ? hold.promise : response(method, params),
  );
  await render();
  control("extract-space-memory-source").focus();
  await act(async () => {
    expect(runCommand("extract-space-memory-source")).toBe(true);
  });
  const reason = new Error("Current backend refusal");
  await act(async () => hold.reject(reason));
  expect(mocks.toast).toHaveBeenCalledExactlyOnceWith(reason);
  expect((control("extract-space-memory-source") as HTMLButtonElement).disabled).toBe(false);
});

it("an older fulfilled mismatched reply cannot report error after a fresh GET published", async () => {
  const old = deferred<unknown>();
  let loads = 0;
  mocks.call.mockImplementation(async (method, params) =>
    method === "memory.pipeline.policy" && ++loads === 1 ? old.promise : response(method, params),
  );
  await render();
  await act(async () => {
    for (const listener of mocks.listeners)
      listener({ type: "workspace.memory.updated", payload: { workspaceId: "space" } });
  });
  expect(host.textContent).toContain("Original report note");
  await act(async () => old.resolve({ workspaceId: "foreign", enabled: true }));
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(host.textContent).toContain("Original report note");
});

it("rebuilds the current Space index and refreshes its measured status", async () => {
  let rebuilt = false;
  mocks.call.mockImplementation(async (method, params) => {
    if (method === "memory.pipeline.reindex") {
      rebuilt = true;
      return { indexed: 3 };
    }
    const value = response(method, params);
    return method === "memory.pipeline.overview" && rebuilt
      ? { ...value, index: { status: "ready", updatedAt: 1700000000000, chunkCount: 3 } }
      : value;
  });
  await act(async () => root.render(<SpaceMemory workspaceId="space" view="configure" />));
  const card = host.querySelector('[aria-label="Memory search index"]')!;
  expect(card.textContent).toContain("Index not built");
  await act(async () => card.querySelector("button")!.click());
  expect(mocks.call).toHaveBeenCalledWith("memory.pipeline.reindex", { workspaceId: "space" });
  expect(card.textContent).toContain("Running normally");
  expect(card.textContent).toContain("3 chunks");
  expect(card.querySelector("time")!.getAttribute("datetime")).toBe("2023-11-14T22:13:20.000Z");
});

it("offers a real retry after configuration cannot read Memory", async () => {
  mocks.call.mockRejectedValue(new Error("Memory temporarily unavailable"));
  await act(async () => root.render(<SpaceMemory workspaceId="space" view="configure" />));
  const card = host.querySelector('[aria-label="Memory search index"]')!;
  expect(card.textContent).toContain("Index unavailable");
  const retry = card.querySelector("button")!;
  expect(retry.disabled).toBe(false);
  expect(retry.textContent).toBe("Retry");
  mocks.call.mockImplementation(async (method, params) => response(method, params));
  await act(async () => retry.click());
  expect(card.textContent).toContain("Index not built");
  expect(host.textContent).not.toContain("Memory temporarily unavailable");
  expect(mocks.call).not.toHaveBeenCalledWith("memory.pipeline.reindex", expect.anything());
});

it("confirms shorter episodic retention and saves the original Space policy", async () => {
  let retentionDays = 0;
  mocks.call.mockImplementation(async (method, params) => {
    if (method === "memory.pipeline.setRetention") retentionDays = params.retentionDays;
    if (method === "memory.pipeline.policy" || method === "memory.pipeline.setRetention")
      return { workspaceId: params.workspaceId, enabled, retentionDays };
    return response(method, params);
  });
  await act(async () => root.render(<SpaceMemory workspaceId="space" view="configure" />));
  const select = host.querySelector<HTMLSelectElement>('[aria-label="Episodic memory retention"]')!;
  expect(select.value).toBe("0");
  await act(async () => {
    select.value = "30";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(mocks.call.mock.calls.some(([method]) => method === "memory.pipeline.setRetention")).toBe(false);
  await click("confirm-forget-space-memory");
  expect(mocks.call).toHaveBeenCalledWith("memory.pipeline.setRetention", {
    workspaceId: "space",
    retentionDays: 30,
    expectedRetentionDays: 0,
  });
  expect(select.value).toBe("30");
  await act(async () => {
    select.value = "0";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(mocks.call).toHaveBeenCalledWith("memory.pipeline.setRetention", {
    workspaceId: "space",
    retentionDays: 0,
    expectedRetentionDays: 30,
  });
});

it("does not apply a retention choice after its confirmation snapshot is replaced", async () => {
  await act(async () => root.render(<SpaceMemory workspaceId="space" view="configure" />));
  const select = host.querySelector<HTMLSelectElement>('[aria-label="Episodic memory retention"]')!;
  await act(async () => {
    select.value = "90";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await act(async () => {
    for (const listener of mocks.listeners)
      listener({ type: "workspace.memory.updated", payload: { workspaceId: "space" } });
  });
  await click("confirm-forget-space-memory");
  expect(mocks.call.mock.calls.some(([method]) => method === "memory.pipeline.setRetention")).toBe(false);
});
