import { afterEach, expect, it, vi } from "vitest";
import { ConnectionRecovery } from "../../apps/runtime/src/connection-recovery";

afterEach(() => vi.useRealTimers());

it("recovers failed setup with backoff and reports readiness once", async () => {
  vi.useFakeTimers();
  let connected = false;
  const reconnect = vi
    .fn()
    .mockRejectedValueOnce(new Error("startup timeout"))
    .mockImplementationOnce(async () => {
      connected = true;
    });
  const onReady = vi.fn();
  const recovery = new ConnectionRecovery({ reconnect, isConnected: () => connected, onReady });
  recovery.retry();
  recovery.retry();
  await vi.advanceTimersByTimeAsync(1000);
  expect(reconnect).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(1999);
  expect(reconnect).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(1);
  expect(reconnect).toHaveBeenCalledTimes(2);
  expect(onReady).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(60_000);
  expect(reconnect).toHaveBeenCalledTimes(2);
  await recovery.stop();
});

it("shutdown drains an in-flight handshake and suppresses late readiness", async () => {
  vi.useFakeTimers();
  let complete!: () => void;
  let connected = false;
  const onReady = vi.fn();
  const reconnect = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        complete = () => {
          connected = true;
          resolve();
        };
      }),
  );
  const recovery = new ConnectionRecovery({ reconnect, isConnected: () => connected, onReady });
  recovery.retry();
  await vi.advanceTimersByTimeAsync(1000);
  let stopped = false;
  const stopping = recovery.stop().then(() => {
    stopped = true;
  });
  await Promise.resolve();
  expect(stopped).toBe(false);
  complete();
  await stopping;
  expect(onReady).not.toHaveBeenCalled();
  recovery.retry();
  await vi.advanceTimersByTimeAsync(60_000);
  expect(reconnect).toHaveBeenCalledTimes(1);
});

it("cancels queued recovery when the host shuts down", async () => {
  vi.useFakeTimers();
  const reconnect = vi.fn();
  const recovery = new ConnectionRecovery({ reconnect, isConnected: () => false, onReady: vi.fn() });
  recovery.retry();
  await recovery.stop();
  await vi.advanceTimersByTimeAsync(60_000);
  expect(reconnect).not.toHaveBeenCalled();
});
