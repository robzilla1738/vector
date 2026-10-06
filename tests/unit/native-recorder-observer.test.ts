import { createHash } from "node:crypto";
import { afterEach, expect, it, vi } from "vitest";
import { RECORDER_SOURCE } from "@aux/chromium-driver";
import { NativeRecorderObserver } from "../../apps/runtime/dist/services/native-recorder-observer.js";
const id = "35120a93-910a-451a-bbbd-e1daf3368f60";
const receipt = {
  recorderId: id,
  documentGeneration: "1",
  producerSha256: createHash("sha256").update(RECORDER_SOURCE).digest("hex"),
};
function fixture() {
  const transport = {
    start: vi.fn(async () => receipt),
    drain: vi.fn(async (): Promise<unknown> => ({ recorderId: id, documentGeneration: "1", events: [] })),
    stop: vi.fn(async (): Promise<unknown> => ({ stopped: true })),
  };
  let current = true;
  const fault = vi.fn();
  const observer = new NativeRecorderObserver(transport, "person-page", () => current);
  return {
    transport,
    observer,
    fault,
    retire: () => {
      current = false;
    },
  };
}
afterEach(() => {
  vi.useRealTimers();
});
it("uses only fixed scoped native operations and closes the actual receipt", async () => {
  vi.useFakeTimers();
  const f = fixture();
  const steps = vi.fn();
  await f.observer.start(steps, f.fault);
  await vi.advanceTimersByTimeAsync(100);
  expect(f.transport.start).toHaveBeenCalledWith({ pageId: "person-page" });
  expect(f.transport.drain).toHaveBeenCalledWith({ pageId: "person-page", recorderId: id });
  await f.observer.close();
  await f.observer.close();
  expect(f.transport.stop).toHaveBeenCalledTimes(1);
  expect(f.transport.stop).toHaveBeenCalledWith({ pageId: "person-page", recorderId: id });
  expect(f.fault).not.toHaveBeenCalled();
});
it("retains and cleans an actual late startup receipt after close", async () => {
  const f = fixture();
  let release!: (value: typeof receipt) => void;
  f.transport.start.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  const starting = f.observer.start(() => {}, f.fault);
  const failed = starting.catch((error) => error);
  const closing = f.observer.close();
  const closed = closing.catch((error) => error);
  release(receipt);
  expect(await failed).toMatchObject({ code: "target_detached" });
  expect(await closed).toMatchObject({ code: "target_detached" });
  expect(f.transport.stop).toHaveBeenCalledWith({ pageId: "person-page", recorderId: id });
});
it("refuses retired scope after held capture and retains original cleanup failure", async () => {
  vi.useFakeTimers();
  const f = fixture();
  const steps = vi.fn();
  const cleanup = new Error("original native stop failed");
  let release!: (value: unknown) => void;
  f.transport.drain.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  f.transport.stop.mockRejectedValueOnce(cleanup);
  await f.observer.start(steps, f.fault);
  await vi.advanceTimersByTimeAsync(100);
  f.retire();
  release({
    recorderId: id,
    documentGeneration: "1",
    events: [{ kind: "navigate", url: "https://owned.test/" }],
  });
  await vi.advanceTimersByTimeAsync(0);
  expect(steps).not.toHaveBeenCalled();
  expect(f.fault).toHaveBeenCalledTimes(1);
  const error = await f.observer.close().catch((error) => error);
  expect(error).toBeInstanceOf(AggregateError);
  expect(error.errors[0]).toMatchObject({ code: "target_detached" });
  expect(error.errors[1]).toBe(cleanup);
});
it("accepts only native pending-document receipts and refuses backward generation", async () => {
  vi.useFakeTimers();
  const f = fixture();
  const steps = vi.fn();
  f.transport.drain.mockResolvedValueOnce({ recorderId: id, documentGeneration: "2", pending: true });
  f.transport.drain.mockResolvedValueOnce({ recorderId: id, documentGeneration: "1", events: [] });
  await f.observer.start(steps, f.fault);
  await vi.advanceTimersByTimeAsync(100);
  expect(f.fault).not.toHaveBeenCalled();
  expect(steps).not.toHaveBeenCalled();
  await vi.advanceTimersByTimeAsync(100);
  expect(f.fault).toHaveBeenCalledWith(expect.objectContaining({ code: "ref_stale" }));
  await expect(f.observer.close()).rejects.toMatchObject({ code: "ref_stale" });
});

it("refuses native capture without a terminal failure handler", async () => {
  const f = fixture();
  await expect(f.observer.start(() => {})).rejects.toMatchObject({ code: "invalid_params" });
  expect(f.transport.start).not.toHaveBeenCalled();
});
it("cleans the actual validated receipt when the native script version differs", async () => {
  const f = fixture();
  f.transport.start.mockResolvedValueOnce({ ...receipt, producerSha256: "a".repeat(64) });
  await expect(f.observer.start(() => {}, f.fault)).rejects.toMatchObject({ code: "backend_unavailable" });
  await expect(f.observer.close()).rejects.toMatchObject({ code: "backend_unavailable" });
  expect(f.transport.stop).toHaveBeenCalledWith({ pageId: "person-page", recorderId: id });
});
