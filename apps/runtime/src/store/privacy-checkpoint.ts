import { Worker } from "node:worker_threads";

/** Coalesces deletion checkpoints and retries lock contention without blocking browsing. */
export class PrivacyCheckpoint {
  private timer: NodeJS.Timeout | undefined;
  private worker: Worker | undefined;
  private pending = false;
  private closed = false;
  private retry = 0;

  constructor(private readonly path: string, private readonly onError: (error: Error) => void = () => {}) {}

  request(): void {
    if (this.closed || this.path === ":memory:") return;
    this.pending = true;
    this.schedule(250);
  }

  private schedule(delay: number): void {
    if (this.timer || this.worker || this.closed) return;
    this.timer = setTimeout(() => {
      this.timer = undefined;
      if (!this.pending || this.closed) return;
      this.pending = false;
      let worker: Worker;
      try {
        worker = new Worker(new URL("./privacy-checkpoint-worker.js", import.meta.url), { workerData: { path: this.path } });
      } catch (error) {
        this.onError(error instanceof Error ? error : new Error(String(error)));
        this.pending = true;
        this.retry = Math.min(this.retry + 1, 6);
        this.schedule(Math.min(30_000, 500 * 2 ** this.retry));
        return;
      }
      this.worker = worker;
      let complete = false;
      let failed = false;
      worker.on("message", (result: { complete: boolean }) => { complete = result.complete; });
      worker.on("error", error => { failed = true; this.onError(error); });
      worker.on("exit", code => {
        if (this.worker === worker) this.worker = undefined;
        if (this.closed) return;
        if (code !== 0 && !failed) this.onError(new Error(`Privacy checkpoint worker exited with code ${code}`));
        if (complete) this.retry = 0;
        else {
          this.pending = true;
          this.retry = Math.min(this.retry + 1, 6);
        }
        if (this.pending) this.schedule(complete ? 250 : Math.min(30_000, 500 * 2 ** this.retry));
      });
    }, delay);
    this.timer.unref();
  }

  async close(): Promise<void> {
    this.closed = true;
    if (this.timer) clearTimeout(this.timer);
    if (this.worker) await this.worker.terminate();
  }
}
