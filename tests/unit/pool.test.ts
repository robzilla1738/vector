import { describe, it, expect } from "vitest";
import { WorkerPool } from "@vector/runtime";

describe("WorkerPool", () => {
  it("bounds total and per-origin concurrency", async () => {
    const pool = new WorkerPool({ maxWorkers: 3, perOrigin: 2 });
    let active = 0;
    let peak = 0;
    const work = (url: string) =>
      pool.acquire(url).then(async (release) => {
        active++;
        peak = Math.max(peak, active);
        await new Promise((r) => setTimeout(r, 10));
        active--;
        release();
      });
    const urls = Array.from({ length: 10 }, (_, i) => `http://o${i % 2}.test/p${i}`);
    await Promise.all(urls.map(work));
    expect(peak).toBeLessThanOrEqual(3);
    expect(pool.stats().active).toBe(0);
  });

  it("per-origin cap defers extra same-origin work", async () => {
    const pool = new WorkerPool({ maxWorkers: 8, perOrigin: 1 });
    const r1 = await pool.acquire("http://a.test/1");
    let secondRan = false;
    const p2 = pool.acquire("http://a.test/2").then((r2) => {
      secondRan = true;
      return r2;
    });
    await new Promise((r) => setTimeout(r, 20));
    expect(secondRan).toBe(false);
    r1();
    const release2 = await p2;
    release2();
  });

  it("aborts waiters", async () => {
    const pool = new WorkerPool({ maxWorkers: 1, perOrigin: 8 });
    await pool.acquire("http://a.test");
    const ctl = new AbortController();
    const p = pool.acquire("http://b.test", ctl.signal);
    ctl.abort();
    await expect(p).rejects.toMatchObject({ code: "cancelled" });
  });
});
