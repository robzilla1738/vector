import { afterEach, describe, expect, it } from "vitest";
import { performance } from "node:perf_hooks";
import { beginOrganizationWork, measureOrganizationWork } from "./organization-performance";
const name = "aux:autoArchive:cycle";
afterEach(() => {
  performance.clearMarks();
  performance.clearMeasures();
});
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((yes) => {
    resolve = yes;
  });
  return { promise, resolve };
}
describe("whole organization work timing", () => {
  it("keeps native close/CAS awaits in the actual successful whole cycle", async () => {
    const held = deferred<{ archived: number }>();
    const running = measureOrganizationWork(name, () => held.promise);
    expect(performance.getEntriesByName(name, "measure")).toHaveLength(0);
    held.resolve({ archived: 1 });
    await running;
    const entries = performance.getEntriesByName(name, "measure");
    expect(entries).toHaveLength(1);
    expect(JSON.parse((entries[0] as PerformanceMeasure).detail)).toMatchObject({
      units: 1,
      committed: true,
    });
    expect(performance.getEntriesByType("mark")).toHaveLength(0);
  });
  it("empty early returns cannot become successful measured cycles", async () => {
    await measureOrganizationWork(name, async () => ({ archived: 0 }));
    expect(performance.getEntriesByName(name, "measure")).toHaveLength(0);
    expect(performance.getEntriesByType("mark")).toHaveLength(0);
  });
  it("rejected real work clears marks without emitting completion", async () => {
    await expect(
      measureOrganizationWork(name, async () => {
        throw new Error("native ACK refused");
      }),
    ).rejects.toThrow("native ACK refused");
    expect(performance.getEntriesByName(name, "measure")).toHaveLength(0);
    expect(performance.getEntriesByType("mark")).toHaveLength(0);
  });
  it("committed samples are bounded and one-use", () => {
    const sample = beginOrganizationWork(name);
    sample.complete(20);
    sample.complete(1);
    sample.cancel();
    expect(performance.getEntriesByName(name, "measure")).toHaveLength(1);
    const invalid = beginOrganizationWork(name);
    invalid.complete(21);
    expect(performance.getEntriesByName(name, "measure")).toHaveLength(1);
  });
});
