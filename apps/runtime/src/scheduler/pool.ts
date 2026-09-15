import { VectorError } from "@vector/contracts";

/**
 * Bounded worker pool with per-origin limits. Workers are runtime-owned
 * pages; queued set members stay lightweight URLs until a slot frees.
 */
export interface PoolOptions {
  maxWorkers: number;
  perOrigin: number;
}

interface Waiter {
  resolve: () => void;
  origin: string;
}

export class WorkerPool {
  private active = 0;
  private perOriginCount = new Map<string, number>();
  private waiters: Waiter[] = [];

  constructor(private opts: PoolOptions) {}

  static originOf(url: string): string {
    try {
      return new URL(url).origin;
    } catch {
      return "unknown";
    }
  }

  /** Acquire a slot for work against `origin`. Resolves when capacity frees. */
  async acquire(url: string, signal?: AbortSignal): Promise<() => void> {
    const origin = WorkerPool.originOf(url);
    // Re-check after every wakeup: a resolved waiter races with other
    // continuations, so the capacity check and the increment must agree.
    while (!this.canRun(origin)) {
      await this.waitForSlot(origin, signal);
    }
    this.active++;
    this.perOriginCount.set(origin, (this.perOriginCount.get(origin) ?? 0) + 1);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.active--;
      this.perOriginCount.set(origin, (this.perOriginCount.get(origin) ?? 1) - 1);
      this.pump();
    };
  }

  /** Change limits at runtime (settings.set maxWorkers/perOrigin); wakes waiters if capacity grew. */
  resize(opts: Partial<PoolOptions>) {
    if (opts.maxWorkers !== undefined) this.opts.maxWorkers = Math.max(1, opts.maxWorkers);
    if (opts.perOrigin !== undefined) this.opts.perOrigin = Math.max(1, opts.perOrigin);
    this.pump();
  }

  limits(): PoolOptions {
    return { ...this.opts };
  }

  private waitForSlot(origin: string, signal?: AbortSignal): Promise<void> {
    if (signal?.aborted) return Promise.reject(new VectorError("cancelled", "pool acquire aborted"));
    return new Promise((resolve, reject) => {
      const onAbort = () => {
        this.waiters = this.waiters.filter((x) => x !== w);
        reject(new VectorError("cancelled", "pool acquire aborted"));
      };
      // the listener is removed on resolve — a long-lived run signal must not
      // accumulate one closure per queued member
      const w: Waiter = {
        origin,
        resolve: () => {
          signal?.removeEventListener("abort", onAbort);
          resolve();
        },
      };
      this.waiters.push(w);
      signal?.addEventListener("abort", onAbort, { once: true });
    });
  }

  private canRun(origin: string): boolean {
    return (
      this.active < this.opts.maxWorkers &&
      (this.perOriginCount.get(origin) ?? 0) < this.opts.perOrigin
    );
  }

  private pump() {
    // resolve every runnable waiter — acquire() re-checks capacity before
    // taking a slot, so over-resolving is safe and guarantees progress
    let i = 0;
    while (i < this.waiters.length) {
      const w = this.waiters[i]!;
      if (this.canRun(w.origin)) {
        this.waiters.splice(i, 1);
        w.resolve();
      } else {
        i++;
      }
    }
  }

  stats() {
    return { active: this.active, queued: this.waiters.length, perOrigin: Object.fromEntries(this.perOriginCount) };
  }
}
