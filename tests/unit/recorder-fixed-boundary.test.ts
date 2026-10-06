import { expect, it, vi } from "vitest";
import { ScriptRecorderObserver } from "../../packages/chromium-driver/src/recorder-observer.js";
import { RECORDER_SOURCE } from "@aux/chromium-driver";

function fixture() {
  const listeners = new Map<string, (params: Record<string, unknown>) => void>();
  const send = vi.fn(async (method: string, _params?: object): Promise<any> => {
    if (method === "Page.addScriptToEvaluateOnNewDocument") return { identifier: "original-script" };
    if (method === "Page.getFrameTree") return { frameTree: { frame: { id: "original-main" } } };
    if (method === "Page.createIsolatedWorld") return { executionContextId: 4 };
    return {};
  });
  const detach = vi.fn(async () => {});
  const session = {
    send,
    detach,
    on: (event: string, listener: (params: Record<string, unknown>) => void) => {
      listeners.set(event, listener);
    },
    off: (event: string) => {
      listeners.delete(event);
    },
  } as unknown as ConstructorParameters<typeof ScriptRecorderObserver>[0];
  let current = true;
  return {
    send,
    detach,
    listeners,
    retire: () => {
      current = false;
    },
    observer: new ScriptRecorderObserver(session, () => current),
  };
}

it("exposes no caller method/script and installs only the original recording producer", async () => {
  const f = fixture();
  const steps: unknown[] = [];
  expect("send" in f.observer).toBe(false);
  await f.observer.start((step) => {
    steps.push(step);
  });
  expect(f.send).toHaveBeenCalledWith("Page.addScriptToEvaluateOnNewDocument", {
    source: RECORDER_SOURCE,
    worldName: "aux-recorder",
    runImmediately: true,
  });
  expect(f.send).toHaveBeenCalledWith("Runtime.evaluate", { expression: RECORDER_SOURCE, contextId: 4 });
  expect(steps).toEqual([]);
  await f.observer.close();
  await f.observer.close();
  expect(f.send).toHaveBeenCalledWith("Page.removeScriptToEvaluateOnNewDocument", {
    identifier: "original-script",
  });
  expect(f.detach).toHaveBeenCalledTimes(1);
  expect(f.listeners.size).toBe(0);
});

it("rejects foreign contexts, malformed bindings and detached callbacks", async () => {
  const f = fixture();
  const steps: unknown[] = [];
  await f.observer.start((step) => {
    steps.push(step);
  });
  const binding = f.listeners.get("Runtime.bindingCalled")!;
  const step = { kind: "key", key: "Enter" };
  binding({ name: "__auxRec", executionContextId: 99, payload: JSON.stringify(step) });
  binding({ name: "other", executionContextId: 4, payload: JSON.stringify(step) });
  binding({ name: "__auxRec", executionContextId: 4, payload: "{" });
  f.listeners.get("Runtime.executionContextCreated")!({
    context: { name: "aux-recorder", id: 99, auxData: { frameId: "foreign-child" } },
  });
  binding({ name: "__auxRec", executionContextId: 99, payload: JSON.stringify(step) });
  expect(steps).toEqual([]);
  binding({ name: "__auxRec", executionContextId: 4, payload: JSON.stringify(step) });
  expect(steps).toEqual([step]);
  f.retire();
  binding({ name: "__auxRec", executionContextId: 4, payload: JSON.stringify(step) });
  expect(steps).toEqual([step]);
  await f.observer.close();
});

it("waits for held script installation before removing its exact late receipt", async () => {
  const f = fixture();
  let release!: (value: { identifier: string }) => void;
  const held = new Promise<{ identifier: string }>((resolve) => {
    release = resolve;
  });
  const original = f.send.getMockImplementation()!;
  f.send.mockImplementation(async (method, params) =>
    method === "Page.addScriptToEvaluateOnNewDocument" ? held : original(method, params),
  );
  const start = f.observer.start(() => {});
  const result = start.then(
    () => ({ completed: true }),
    (error) => error,
  );
  await vi.waitFor(() => {
    expect(f.send).toHaveBeenCalledWith("Page.addScriptToEvaluateOnNewDocument", expect.anything());
  });
  const close = f.observer.close();
  expect(f.detach).not.toHaveBeenCalled();
  release({ identifier: "late-original-script" });
  expect(await result).toMatchObject({ code: "target_detached" });
  await close;
  expect(f.send).toHaveBeenCalledWith("Page.removeScriptToEvaluateOnNewDocument", {
    identifier: "late-original-script",
  });
  expect(f.send).not.toHaveBeenCalledWith("Runtime.evaluate", { expression: RECORDER_SOURCE, contextId: 4 });
  expect(f.detach).toHaveBeenCalledTimes(1);
});

it("retains primary and cleanup failure while clearing all local callbacks", async () => {
  const f = fixture();
  const primary = new Error("capture failed");
  const cleanup = new Error("detach failed");
  f.send.mockRejectedValue(primary);
  f.detach.mockRejectedValue(cleanup);
  const error = await f.observer.start(() => {}).catch((error) => error);
  expect(error).toBeInstanceOf(AggregateError);
  expect(error.errors).toEqual([primary, cleanup]);
  expect(f.listeners.size).toBe(0);
  expect(f.detach).toHaveBeenCalledTimes(1);
});

it("retains original script-removal and detach failures", async () => {
  const f = fixture();
  await f.observer.start(() => {});
  const removal = new Error("original-script removal failed");
  const detach = new Error("original-session detach failed");
  const original = f.send.getMockImplementation()!;
  f.send.mockImplementation(async (method, params) => {
    if (method === "Page.removeScriptToEvaluateOnNewDocument") throw removal;
    return original(method, params);
  });
  f.detach.mockRejectedValue(detach);
  const error = await f.observer.close().catch((error) => error);
  expect(error).toBeInstanceOf(AggregateError);
  expect(error.errors).toEqual([removal, detach]);
  expect(f.send).toHaveBeenCalledWith("Page.removeScriptToEvaluateOnNewDocument", {
    identifier: "original-script",
  });
  expect(f.detach).toHaveBeenCalledTimes(1);
  expect(f.listeners.size).toBe(0);
});

it("clears original contexts before a reused context ID can deliver capture", async () => {
  const f = fixture();
  const steps: unknown[] = [];
  await f.observer.start((step) => {
    steps.push(step);
  });
  const binding = f.listeners.get("Runtime.bindingCalled")!;
  const payload = {
    name: "__auxRec",
    executionContextId: 4,
    payload: JSON.stringify({ kind: "key", key: "Enter" }),
  };
  binding(payload);
  expect(steps).toHaveLength(1);
  f.listeners.get("Runtime.executionContextsCleared")!({});
  binding(payload);
  expect(steps).toHaveLength(1);
  f.listeners.get("Runtime.executionContextCreated")!({
    context: { name: "aux-recorder", id: 4, auxData: { frameId: "foreign-child" } },
  });
  binding(payload);
  expect(steps).toHaveLength(1);
  f.listeners.get("Runtime.executionContextCreated")!({
    context: { name: "aux-recorder", id: 4, auxData: { frameId: "original-main" } },
  });
  binding(payload);
  expect(steps).toHaveLength(2);
  await f.observer.close();
});
