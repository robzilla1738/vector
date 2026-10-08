// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Run } from "@aux/contracts";
const native = vi.hoisted(() => ({ invoke: vi.fn(), privateMode: false, windowId: "original-window" }));
vi.mock("./bridge", () => ({ bridge: native }));
let delivery: typeof import("./run-start-attempts");
const request = {
  goal: "Original question",
  chatId: "original-chat",
  pageIds: [],
  contextPageRefs: [],
  privateTask: false,
  executionTarget: "local" as const,
};
const run: Run = {
  runId: "accepted-run",
  goal: request.goal,
  status: "completed",
  pageIds: [],
  createdAt: 1,
  config: { chatId: request.chatId },
};
beforeEach(async () => {
  vi.resetModules();
  localStorage.clear();
  native.invoke.mockReset();
  native.privateMode = false;
  native.windowId = "original-window";
  delivery = await import("./run-start-attempts");
});
afterEach(() => vi.restoreAllMocks());

it("saves the original request before dispatch and recovers a dropped acknowledgement without replaying", async () => {
  native.invoke.mockImplementation(async (method, params) => {
    const saved = JSON.parse(localStorage.getItem("aux.pending-run-start.v1:original-chat")!);
    expect(saved.request).toEqual(params);
    if (method === "runs.start") throw new Error("Response lost");
    return { status: "accepted", run };
  });
  expect(await delivery.deliverRunStart(request.chatId, request)).toEqual({
    run,
    recovered: true,
    changed: false,
  });
  expect(native.invoke.mock.calls.map(([method]) => method)).toEqual(["runs.start", "runs.reconcileStart"]);
  expect(native.invoke.mock.calls[0]![1]).toEqual(native.invoke.mock.calls[1]![1]);
  expect(localStorage.length).toBe(0);
});

it("restores the exact request across a changed native window and preserves an edited unsent intent", async () => {
  native.invoke.mockRejectedValue(new Error("Runtime unavailable"));
  await expect(delivery.deliverRunStart(request.chatId, request)).rejects.toThrow("Runtime unavailable");
  const original = native.invoke.mock.calls[0]![1];
  vi.resetModules();
  native.windowId = "restored-window";
  delivery = await import("./run-start-attempts");
  native.invoke.mockReset().mockResolvedValue({ status: "accepted", run });
  expect(
    await delivery.deliverRunStart(request.chatId, { ...request, goal: "Edited while offline" }),
  ).toEqual({ run, recovered: true, changed: true });
  expect(native.invoke).toHaveBeenCalledExactlyOnceWith("runs.reconcileStart", original);
  expect(localStorage.length).toBe(0);
});

it("automatic restart recovery never sends, and a fresh explicit send follows an abandoned original", async () => {
  native.invoke.mockRejectedValue(new Error("Disconnected"));
  await expect(delivery.deliverRunStart(request.chatId, request)).rejects.toThrow();
  const originalId = native.invoke.mock.calls[0]![1].requestId;
  native.invoke.mockReset().mockResolvedValue({ status: "not_started", run: null });
  expect(await delivery.reconcileStartAttempt(request.chatId)).toMatchObject({
    result: { status: "not_started" },
    attempt: { request: { requestId: originalId } },
  });
  expect(native.invoke.mock.calls.map(([method]) => method)).toEqual(["runs.reconcileStart"]);
  native.invoke.mockReset().mockResolvedValue(run);
  await delivery.deliverRunStart(request.chatId, request);
  expect(native.invoke).toHaveBeenCalledOnce();
  expect(native.invoke.mock.calls[0]![1].requestId).not.toBe(originalId);
});

it("joins concurrent sends and leaves removed originals fenced instead of making a new run", async () => {
  let finish!: (value: Run) => void;
  native.invoke.mockImplementation(
    () =>
      new Promise<Run>((resolve) => {
        finish = resolve;
      }),
  );
  const first = delivery.deliverRunStart(request.chatId, request);
  const second = delivery.deliverRunStart(request.chatId, { ...request, goal: "Second unsent draft" });
  await Promise.resolve();
  finish(run);
  expect((await first).changed).toBe(false);
  expect((await second).changed).toBe(true);
  expect(native.invoke).toHaveBeenCalledOnce();
  native.invoke.mockReset().mockRejectedValue(new Error("Disconnected"));
  await expect(delivery.deliverRunStart(request.chatId, request)).rejects.toThrow();
  native.invoke.mockReset().mockResolvedValue({ status: "removed", run: null });
  await expect(delivery.deliverRunStart(request.chatId, request)).rejects.toThrow(/removed/);
  await expect(delivery.deliverRunStart(request.chatId, request)).rejects.toThrow(/removed/);
  expect(native.invoke.mock.calls.every(([method]) => method === "runs.reconcileStart")).toBe(true);
  expect(delivery.readStartAttempt(request.chatId)).toBeNull();
  expect(localStorage.getItem("aux.pending-run-start.v1:original-chat")).toBe('{"removed":true}');
});

it.each(["temporary", "private-window"])("keeps %s request contents in memory only", async (mode) => {
  native.privateMode = mode === "private-window";
  native.invoke.mockRejectedValue(new Error("Disconnected"));
  await expect(
    delivery.deliverRunStart(request.chatId, { ...request, privateTask: mode === "temporary" }),
  ).rejects.toThrow();
  expect(localStorage.length).toBe(0);
  expect(delivery.readStartAttempt(request.chatId)?.request.goal).toBe(request.goal);
  vi.resetModules();
  delivery = await import("./run-start-attempts");
  expect(delivery.readStartAttempt(request.chatId)).toBeNull();
});

it("does not dispatch a normal send if its restart identity cannot be stored", async () => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("Storage full");
  });
  await expect(delivery.deliverRunStart(request.chatId, request)).rejects.toThrow("Storage full");
  expect(native.invoke).not.toHaveBeenCalled();
});

it("an acknowledgement cannot erase a newer pending send from another Aux window", async () => {
  let finish!: (value: Run) => void;
  native.invoke.mockImplementation(
    () =>
      new Promise<Run>((resolve) => {
        finish = resolve;
      }),
  );
  const pending = delivery.deliverRunStart(request.chatId, request);
  await Promise.resolve();
  const newer = {
    request: { ...request, requestId: crypto.randomUUID(), goal: "Newer request" },
    intent: "newer",
  };
  localStorage.setItem("aux.pending-run-start.v1:original-chat", JSON.stringify(newer));
  finish(run);
  await pending;
  expect(JSON.parse(localStorage.getItem("aux.pending-run-start.v1:original-chat")!)).toEqual(newer);
});

it("ignores a late automatic reconciliation after an explicit send has advanced the draft", async () => {
  native.invoke.mockRejectedValue(new Error("Disconnected"));
  await expect(delivery.deliverRunStart(request.chatId, request)).rejects.toThrow();
  let finish!: (value: { status: "not_started"; run: null }) => void;
  native.invoke.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const automatic = delivery.reconcileStartAttempt(request.chatId);
  native.invoke.mockImplementation(async (method) =>
    method === "runs.reconcileStart" ? { status: "not_started", run: null } : run,
  );
  await delivery.deliverRunStart(request.chatId, { ...request, goal: "Explicit new draft" });
  finish({ status: "not_started", run: null });
  expect(await automatic).toBeNull();
  expect(delivery.readStartAttempt(request.chatId)).toBeNull();
});

it.each([request.chatId, "new"])(
  "scrubs a deleted chat's pending payload and fences a late success (%s)",
  async (key) => {
    let finish!: (value: Run) => void;
    native.invoke.mockImplementation(
      () =>
        new Promise<Run>((resolve) => {
          finish = resolve;
        }),
    );
    const pending = delivery.deliverRunStart(key, request);
    await Promise.resolve();
    expect(delivery.removeRunStart(request.chatId)).toBe(true);
    expect(localStorage.getItem("aux.pending-run-start.v1:original-chat")).toBe('{"removed":true}');
    finish(run);
    await expect(pending).rejects.toThrow(/removed/);
    vi.resetModules();
    delivery = await import("./run-start-attempts");
    await expect(delivery.deliverRunStart(request.chatId, request)).rejects.toThrow(/removed/);
    expect(delivery.isRunStartRemoved("new")).toBe(false);
    expect(localStorage.getItem("aux.pending-run-start.v1:new")).toBeNull();
    expect(native.invoke).toHaveBeenCalledOnce();
  },
);
