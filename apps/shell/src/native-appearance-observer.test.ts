import { afterEach, expect, it, vi } from "vitest";
import { startNativeAppearanceObserver, startNativePipAppearanceObserver } from "./native-appearance-observer";

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

it("keeps looking for an actual child after ordinary absent-child refusals", async () => {
  vi.useFakeTimers();
  const read = vi.fn().mockRejectedValue(new Error("unavailable: PiP appearance owner changed or is absent"));
  const stop = startNativePipAppearanceObserver(read);
  await vi.advanceTimersByTimeAsync(15000);
  expect(read).toHaveBeenCalledTimes(31);
  read.mockResolvedValueOnce({}); await vi.advanceTimersByTimeAsync(500);
  expect(read).toHaveBeenCalledTimes(32);
  stop(); await vi.advanceTimersByTimeAsync(1000); expect(read).toHaveBeenCalledTimes(32);
});
it("stops private child observation on authorization refusal", async () => {
  vi.useFakeTimers();
  const read = vi.fn().mockRejectedValue(new Error("forbidden: PiP appearance requires the authorized test shell"));
  const stop = startNativePipAppearanceObserver(read);
  await vi.advanceTimersByTimeAsync(1500); expect(read).toHaveBeenCalledTimes(1); stop();
});
