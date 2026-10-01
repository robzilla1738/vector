import { afterEach, expect, it, vi } from "vitest";
import { startNativeAppearanceObserver } from "./native-appearance-observer";

afterEach(() => { vi.useRealTimers(); });
it("recovers from a real transient refusal and remains serial", async () => {
  vi.useFakeTimers();
  let finish!: () => void;
  const appearanceSnapshot = vi.fn().mockRejectedValueOnce(new Error("unavailable: Appearance window changed"))
    .mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }))
    .mockResolvedValue(undefined);
  const stop = startNativeAppearanceObserver({ appearanceSnapshot } as never);
  await vi.advanceTimersByTimeAsync(500);
  expect(appearanceSnapshot).toHaveBeenCalledTimes(2);
  await vi.advanceTimersByTimeAsync(2000);
  expect(appearanceSnapshot).toHaveBeenCalledTimes(2);
  finish(); await vi.advanceTimersByTimeAsync(500);
  expect(appearanceSnapshot).toHaveBeenCalledTimes(3);
  stop(); await vi.advanceTimersByTimeAsync(2000);
  expect(appearanceSnapshot).toHaveBeenCalledTimes(3);
});
it.each(["forbidden: Appearance shell changed", "unavailable: Appearance observation limit reached", "unavailable: Shell appearance observation is invalid"])("stops on %s", async message => {
  vi.useFakeTimers();
  const appearanceSnapshot = vi.fn().mockRejectedValue(new Error(message));
  startNativeAppearanceObserver({ appearanceSnapshot } as never);
  await vi.advanceTimersByTimeAsync(15000);
  expect(appearanceSnapshot).toHaveBeenCalledTimes(1);
});
it("bounds repeated native stability failures", async () => {
  vi.useFakeTimers();
  const appearanceSnapshot = vi.fn().mockRejectedValue(new Error("unavailable: Native appearance is unavailable"));
  startNativeAppearanceObserver({ appearanceSnapshot } as never);
  await vi.advanceTimersByTimeAsync(20000);
  expect(appearanceSnapshot).toHaveBeenCalledTimes(20);
});
it("does not schedule after unmount during a pending native call", async () => {
  vi.useFakeTimers();
  let finish!: () => void;
  const appearanceSnapshot = vi.fn(() => new Promise<void>(resolve => { finish = resolve; }));
  const stop = startNativeAppearanceObserver({ appearanceSnapshot } as never);
  stop(); finish(); await vi.advanceTimersByTimeAsync(2000);
  expect(appearanceSnapshot).toHaveBeenCalledTimes(1);
});
