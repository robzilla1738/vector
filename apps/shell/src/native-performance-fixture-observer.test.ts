import { describe, expect, it } from "vitest";
import { startNativePerformanceFixtureObserver } from "./native-performance-fixture-observer";
const flush = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); };
describe("private native performance fixture observer", () => {
  for (const operation of ["prepareGuestTabSwitchPresentation", "sampleShellMemory"]) it(`uses native long poll then fixed zero-argument ${operation} in sequence`, async () => {
    const calls: string[] = [];
    const stop = startNativePerformanceFixtureObserver(async method => {
      calls.push(method);
      if (calls.length === 1) return { sequence: "1", operation };
      if (calls.length === 2) return { status: "ready" };
      return new Promise(() => {});
    });
    await flush(); expect(calls).toEqual(["performanceFixtureNextRequest", operation, "performanceFixtureNextRequest"]); stop();
  });
  for (const next of [{ sequence: "2", operation: "completeGuestPresentation" }, { sequence: "1", operation: "pages.open" }, { sequence: "1", operation: "prepareGuestTabSwitchPresentation", windowId: 7 }, "caller JSON"]) {
    it(`refuses malformed native operation ${JSON.stringify(next)}`, async () => {
      const calls: string[] = []; const stop = startNativePerformanceFixtureObserver(async method => { calls.push(method); return next; });
      await flush(); expect(calls).toEqual(["performanceFixtureNextRequest"]); stop();
    });
  }
  it("does not dispatch a late operation after unmount", async () => {
    let resolve!: (value: unknown) => void;
    const calls: string[] = [];
    const stop = startNativePerformanceFixtureObserver(method => { calls.push(method); return new Promise(done => { resolve = done; }); });
    stop(); resolve({ sequence: "1", operation: "prepareGuestTabSwitchPresentation" }); await flush();
    expect(calls).toEqual(["performanceFixtureNextRequest"]);
  });
});
