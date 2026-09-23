import { AsyncLocalStorage } from "node:async_hooks";
import type { PageRegistry } from "./registry.js";

export class PageLanes {
  constructor(private pages: PageRegistry) {}

  /**
   * Resource conflict keys (§10.2): programs declaring `conflicts` hold those
   * keys for their duration — a second program wanting the same key waits.
   * Keys are acquired sorted to keep lock order deterministic.
   */
  private keyMutex = new Map<string, Promise<unknown>>();
  withKeys<T>(keys: string[] | undefined, fn: () => Promise<T>): Promise<T> {
    const sorted = [...new Set(keys ?? [])].sort();
    const acquire = async (i: number): Promise<T> => {
      if (i >= sorted.length) return fn();
      const key = sorted[i]!;
      const prev = this.keyMutex.get(key) ?? Promise.resolve();
      let release!: () => void;
      const hold = new Promise<void>((r) => (release = r));
      const stored = prev.then(() => hold);
      this.keyMutex.set(key, stored);
      await prev.catch(() => {});
      try {
        return await acquire(i + 1);
      } finally {
        release();
        if (this.keyMutex.get(key) === stored) this.keyMutex.delete(key);
      }
    };
    return acquire(0);
  }

  /** Serialize all driver commands per page. */
  /**
   * Per-page serialization lane. Reentrant calls from within the lane's own
   * async context run inline — a `call` node invoking an operation that
   * executes steps on the SAME page must not wait on its own queue (deadlock).
   * AsyncLocalStorage scopes this to the reentrant context only: concurrent
   * calls from other contexts still serialize normally.
   */
  private laneCtx = new AsyncLocalStorage<{ lane: string }>();
  enqueue<T>(pageId: string, fn: () => Promise<T>): Promise<T> {
    if (this.laneCtx.getStore()?.lane === pageId) return fn();
    const lp = this.pages.live.get(pageId);
    if (!lp) return fn();
    const run = lp.queue.then(() => this.laneCtx.run({ lane: pageId }, fn));
    lp.queue = run.catch(() => {});
    return run;
  }
}
