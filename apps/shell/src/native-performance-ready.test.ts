// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";

beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllGlobals());

it("requires both live address and shortcut controls, and acknowledges once", async () => {
  const ready = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal("auxChromiumHost", { performanceWindowReady: ready });
  vi.stubGlobal("reportError", vi.fn());
  const { nativePerformanceControl } = await import("./native-performance-ready");
  const retire = nativePerformanceControl("address");
  expect(ready).not.toHaveBeenCalled();
  retire?.();
  nativePerformanceControl("shortcuts");
  expect(ready).not.toHaveBeenCalled();
  nativePerformanceControl("address");
  nativePerformanceControl("address");
  expect(ready).toHaveBeenCalledTimes(1);
});

it("does no work without the explicit native benchmark capability", async () => {
  const request = vi.fn();
  vi.stubGlobal("auxChromiumHost", { request });
  const { nativePerformanceControl } = await import("./native-performance-ready");
  expect(nativePerformanceControl("address")).toBeUndefined();
  expect(nativePerformanceControl("shortcuts")).toBeUndefined();
  expect(request).not.toHaveBeenCalled();
});
