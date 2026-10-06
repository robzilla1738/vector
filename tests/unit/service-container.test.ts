import { expect, it, vi, afterEach } from "vitest";
import { createServiceContainer } from "../../apps/runtime/dist/services/container.js";
import { deferRuntimeWork, isRuntimeIdle } from "../../apps/runtime/dist/services/idle.js";
import { openDb, Repo, startRuntime } from "@aux/runtime";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

afterEach(() => vi.useRealTimers());

it("constructs only requested dependencies once and distinguishes initialized undefined", () => {
  const unused = vi.fn(() => 99);
  const dependency = vi.fn(() => 4);
  const container = createServiceContainer<{
    dependency: number;
    result: number;
    absent: undefined;
    unused: number;
  }>({
    dependency,
    result: (services) => services.dependency + 1,
    absent: () => undefined,
    unused,
  });
  expect(container.peek("result")).toBeUndefined();
  expect(container.has("absent")).toBe(false);
  expect(container.services.result).toBe(5);
  expect(container.get("result")).toBe(5);
  expect(dependency).toHaveBeenCalledOnce();
  expect(container.services.absent).toBeUndefined();
  expect(container.has("absent")).toBe(true);
  expect(unused).not.toHaveBeenCalled();
});

it("reports dependency cycles and allows a failed factory to be retried", () => {
  const circular = createServiceContainer<{ a: number; b: number }>({ a: (s) => s.b, b: (s) => s.a });
  expect(() => circular.get("a")).toThrow("a -> b -> a");
  expect(circular.has("a")).toBe(false);
  const factory = vi
    .fn()
    .mockImplementationOnce(() => {
      throw new Error("temporary");
    })
    .mockReturnValue(8);
  const retry = createServiceContainer<{ value: number }>({ value: factory });
  expect(() => retry.get("value")).toThrow("temporary");
  expect(retry.get("value")).toBe(8);
});

it("waits for idle and cancels queued work before shutdown", async () => {
  vi.useFakeTimers();
  let idle = false;
  const work = vi.fn();
  const stop = deferRuntimeWork(() => idle, work);
  await vi.advanceTimersByTimeAsync(5_000);
  expect(work).not.toHaveBeenCalled();
  idle = true;
  await vi.advanceTimersByTimeAsync(5_000);
  expect(work).toHaveBeenCalledOnce();
  stop();
  const cancelled = vi.fn();
  const cancel = deferRuntimeWork(() => true, cancelled);
  vi.advanceTimersByTime(5_000);
  cancel();
  await Promise.resolve();
  expect(cancelled).not.toHaveBeenCalled();
});

it("waiting for person input counts as idle, while an executing run does not", () => {
  const repo = new Repo(openDb(":memory:"));
  try {
    repo.saveRun({ runId: "waiting", goal: "wait", status: "needs_input", pageIds: [], createdAt: 1 });
    expect(isRuntimeIdle(repo)).toBe(true);
    repo.saveRun({ runId: "working", goal: "work", status: "running", pageIds: [], createdAt: 2 });
    expect(isRuntimeIdle(repo)).toBe(false);
  } finally {
    repo.close();
  }
});

it("starts and closes an unused runtime without constructing tracing or agent services", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-lazy-runtime-"));
  const runtime = await startRuntime({ AUX_DATA_DIR: directory, AUX_API_PORT: "0", AUX_LOAD_DOTENV: "0" });
  try {
    await runtime.invoke("runtime.describe", {});
    expect(existsSync(join(directory, "traces"))).toBe(false);
  } finally {
    await runtime.close();
    expect(existsSync(join(directory, "traces"))).toBe(false);
    rmSync(directory, { recursive: true, force: true });
  }
});

it("resolves the agent service graph on first use and disposes its created collaborators", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-lazy-agent-"));
  let runtime: Awaited<ReturnType<typeof startRuntime>> | undefined;
  try {
    runtime = await startRuntime({ AUX_DATA_DIR: directory, AUX_API_PORT: "0", AUX_LOAD_DOTENV: "0" });
    expect(existsSync(join(directory, "traces"))).toBe(false);
    expect(await runtime.invoke("runs.list", {})).toEqual([]);
    expect(existsSync(join(directory, "traces"))).toBe(true);
  } finally {
    await runtime?.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
