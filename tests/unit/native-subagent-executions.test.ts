import { describe, expect, it } from "vitest";
import { ReplPool, type ReplHostDeps } from "@aux/runtime";
import {
  currentPerformanceExecutions,
  registerPerformanceReplPool,
} from "../../apps/runtime/dist/agent/loop/performance-executions.js";

function deps(runId: string, step: ReplHostDeps["step"], signal?: AbortSignal): ReplHostDeps {
  return {
    runId,
    step,
    signal,
    tabs: async () => [],
    openTab: async () => ({ output: {} }),
    closeTab: async () => {},
    useTab: async () => ({
      pageId: "p",
      url: "https://fixture.test",
      title: "Fixture",
      active: false,
      owned: true,
    }),
    observe: async () => ({ text: "" }),
    capture: async () => ({ width: 1, height: 1, elements: [] }),
    fetch: async () => ({ output: {} }),
    fsRead: async () => "",
    fsWrite: async () => {},
  };
}

describe("native performance actual REPL evidence", () => {
  it("counts five actual guest executions and refuses settled-but-unconsumed, aborted, terminated and unregistered cells", async () => {
    const pools = Array.from({ length: 5 }, () => new ReplPool());
    const unregister = pools.map((pool) => registerPerformanceReplPool(pool));
    const abort = new AbortController();
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    try {
      expect(currentPerformanceExecutions()).toBeUndefined();
      const outputs = await Promise.all(
        pools.map((pool, index) =>
          pool.eval(
            deps(
              `child-${index}`,
              async () => {
                await held;
                return { output: {} };
              },
              index === 0 ? abort.signal : undefined,
            ),
            'page.waitFor({kind:"selector", selector:"#ready", state:"visible", timeoutMs:1000}); 42',
            { pageId: "p", yieldTimeMs: 0 },
          ),
        ),
      );
      await expect.poll(() => currentPerformanceExecutions()?.length).toBe(5);
      const cells = currentPerformanceExecutions()!;
      expect(cells.every((cell) => cell.memoryLimitBytes === 128 * 1024 * 1024)).toBe(true);
      expect(new Set(cells.map((cell) => cell.cellId)).size).toBe(5);
      expect(pools[0]!.performanceExecutions(Number.MAX_SAFE_INTEGER)).toEqual([]);
      abort.abort();
      expect(currentPerformanceExecutions()).toBeUndefined();
      const result = outputs[1]!;
      expect(result).toHaveProperty("output");
      const cellId = (result as { output: { cellId: string } }).output.cellId;
      await pools[1]!.wait("child-1", cellId, 0, true);
      expect(pools[1]!.performanceExecutions()).toEqual([]);
      release();
      await expect.poll(() => pools[2]!.performanceExecutions().length).toBe(0);
      expect(pools[2]!.hasOpen("child-2")).toBe(true);
      expect(currentPerformanceExecutions()).toBeUndefined();
      unregister[3]!();
      expect(currentPerformanceExecutions()).toBeUndefined();
    } finally {
      release();
      for (const off of unregister) off();
      for (const pool of pools) pool.disposeAll();
    }
  });

  it("observes real Sleep VM execution only during the current eval", async () => {
    const pool = new ReplPool();
    try {
      const result = await pool.eval(
        deps("sleep-child", async () => ({ output: {} })),
        "sleep(100); 7",
        { yieldTimeMs: 0 },
      );
      await expect.poll(() => pool.performanceExecutions().length).toBe(1);
      const cellId = (result as { output: { cellId: string } }).output.cellId;
      await pool.wait("sleep-child", cellId, 1000);
      expect(pool.performanceExecutions()).toEqual([]);
    } finally {
      pool.disposeAll();
    }
  });
});
