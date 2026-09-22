import { Worker } from "node:worker_threads";
import type { TabCatalogSnapshot, TabPatch } from "@aux/contracts";

interface Pending {
  seq: number;
  version?: number;
  resolve(result: unknown): void;
  reject(error: Error): void;
}

const MAX_PENDING = 256;

/**
 * Main-side handle to the browser persistence worker. Writes are queued and
 * serialized; each patch is acknowledged only after the worker commits it.
 * Persistence is deliberately off the human actuation path — a busy or dead
 * worker degrades durability reporting, never visible navigation.
 */
export class BrowserStore {
  private worker: Worker | null = null;
  private pending = new Map<number, Pending>();
  private seq = 0;
  private queue: Promise<unknown> = Promise.resolve();
  private ackedVersion = 0;
  private durabilityWaiters = new Map<number, { resolve(): void; reject(error: Error): void }[]>();
  private failed: Error | null = null;

  constructor(
    private opts: { dir: string; workerUrl: URL; onError?(error: Error): void },
  ) {}

  /** Durable catalog version — the newest patch the worker confirmed. */
  get durableVersion() {
    return this.ackedVersion;
  }

  /** Boot the worker and read the persisted catalog. Errors leave the browser usable. */
  async load(): Promise<TabCatalogSnapshot | null> {
    try {
      return (await this.request({ type: "load" })) as TabCatalogSnapshot;
    } catch (error) {
      this.degrade(error);
      return null;
    }
  }

  /** Persist a catalog patch. Resolves when the worker has durably committed it. */
  persist(patch: TabPatch): Promise<void> {
    return this.enqueue(async () => {
      if (this.failed) return;
      await this.request({ type: "apply", patch });
      this.ackedVersion = Math.max(this.ackedVersion, patch.version);
      for (const [version, waiters] of this.durabilityWaiters) {
        if (version > this.ackedVersion) continue;
        waiters.forEach(waiter => waiter.resolve());
        this.durabilityWaiters.delete(version);
      }
    });
  }

  /** Resolve once `version` (or a later one) is durably written. Test + shutdown flush. */
  whenDurable(version: number): Promise<void> {
    if (this.ackedVersion >= version) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const waiters = this.durabilityWaiters.get(version) ?? [];
      waiters.push({ resolve, reject });
      this.durabilityWaiters.set(version, waiters);
      void this.queue.then(() => {
        if (this.ackedVersion >= version) resolve();
        else if (this.failed) reject(this.failed);
      });
    });
  }

  private enqueue<T>(work: () => Promise<T>): Promise<T> {
    if (this.pending.size >= MAX_PENDING) {
      const error = new Error("Browser persistence is overloaded — the change stays in memory until it catches up.");
      return Promise.reject(error);
    }
    const run = this.queue.then(work);
    this.queue = run.catch(() => {});
    return run;
  }

  private request(message: { type: string; patch?: TabPatch }): Promise<unknown> {
    if (this.failed) return Promise.reject(this.failed);
    if (this.pending.size >= MAX_PENDING) return Promise.reject(new Error("Browser persistence queue is full."));
    const seq = ++this.seq;
    return new Promise((resolve, reject) => {
      this.pending.set(seq, { seq, resolve, reject });
      this.ensureWorker().postMessage({ ...message, seq });
    });
  }

  private ensureWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(this.opts.workerUrl, { workerData: { dir: this.opts.dir } });
      this.worker.on("message", (reply: { type: string; seq: number; version?: number; snapshot?: unknown; message?: string }) => {
        const entry = this.pending.get(reply.seq);
        if (!entry) return;
        this.pending.delete(reply.seq);
        if (reply.type === "error") entry.reject(new Error(reply.message ?? "Browser persistence failed."));
        else entry.resolve(reply.type === "snapshot" ? reply.snapshot : reply);
      });
      this.worker.on("error", error => this.degrade(error));
      this.worker.on("exit", code => {
        if (code !== 0) this.degrade(new Error(`Browser persistence worker exited with code ${code}.`));
        this.worker = null;
      });
    }
    return this.worker;
  }

  private degrade(error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (this.failed) return;
    this.failed = err;
    this.opts.onError?.(err);
    for (const entry of this.pending.values()) entry.reject(err);
    this.pending.clear();
    for (const waiters of this.durabilityWaiters.values()) waiters.forEach(waiter => waiter.reject(err));
    this.durabilityWaiters.clear();
  }

  async dispose() {
    try {
      await this.queue;
      if (this.worker) await this.request({ type: "close" });
    } catch { /* closing flush is best effort */ }
    await this.worker?.terminate().catch(() => {});
    this.worker = null;
  }
}
