import { afterEach, describe, expect, it, vi } from "vitest";
import { performStopWork } from "../../apps/shell/src/features/native-cdp-measurement/stop";

afterEach(() => vi.unstubAllGlobals());
describe("original Stop work completion", () => {
  it("returns the same ordinary completion without a native fixture binding", () => {
    vi.stubGlobal("window", {});
    const pending = new Promise<void>(() => {});
    const ordinary = vi.fn(() => pending);
    expect(performStopWork("run", new Event("click"), ordinary)).toBe(pending);
    expect(ordinary).toHaveBeenCalledOnce();
  });
  it("retains the original ordinary Run payload as well as Promise identity", async () => {
    vi.stubGlobal("window", {});
    const originalRun = { id: "run", status: "canceled", answer: "retained" };
    const pending = Promise.resolve(originalRun);
    const ordinary = vi.fn(() => pending);
    const result = performStopWork("run", undefined, ordinary);
    expect(result).toBe(pending);
    await expect(result).resolves.toBe(originalRun);
    expect(ordinary).toHaveBeenCalledOnce();
  });
  it("does not invent physical input for remapped or programmatic commands", () => {
    const binding = vi.fn();
    vi.stubGlobal("window", { __auxNativeMeasuredStop: binding });
    const pending = new Promise<void>(() => {});
    const ordinary = vi.fn(() => pending);
    expect(performStopWork("run", undefined, ordinary)).toBe(pending);
    expect(ordinary).toHaveBeenCalledOnce();
    expect(binding).not.toHaveBeenCalled();
  });
  it("synchronously forwards only the original Event and returns the original native completion", () => {
    const event = new Event("click");
    const pending = new Promise<void>(() => {});
    const binding = vi.fn(() => pending);
    vi.stubGlobal("window", { __auxNativeMeasuredStop: binding });
    const ordinary = vi.fn();
    const result = performStopWork("original-run", event, ordinary);
    expect(binding).toHaveBeenCalledExactlyOnceWith(event, "original-run");
    expect(result).toBe(pending);
    expect(ordinary).not.toHaveBeenCalled();
    // This deliberately synthetic Event is merely forwarded: only the native
    // current-dispatch token path can classify a physical measurement.
    expect(event.isTrusted).toBe(false);
  });
  it("retains the original rejection without issuing a duplicate ordinary Stop", async () => {
    const failure = new Error("original native completion refused");
    const pending = Promise.reject(failure);
    const binding = vi.fn(() => pending);
    vi.stubGlobal("window", { __auxNativeMeasuredStop: binding });
    const ordinary = vi.fn();
    const result = performStopWork("run", new Event("click"), ordinary);
    expect(result).toBe(pending);
    await expect(result).rejects.toBe(failure);
    expect(ordinary).not.toHaveBeenCalled();
  });
});
