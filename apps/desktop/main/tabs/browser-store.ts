import { Worker } from "node:worker_threads";
import type { TabCatalogSnapshot, TabPatch, TabPatchOp, TabRecord } from "@aux/contracts";

interface Pending {
  seq: number;
  version?: number;
  resolve(result: unknown): void;
  reject(error: Error): void;
}

const MAX_PENDING = 256;
const FLUSH_MS = 300;

/** The columns a restore reads back — loading/audible/crashed/lifecycle are reset on load. */
export const durableTabKey = (tab: TabRecord) => JSON.stringify([tab.windowId, tab.url, tab.title, tab.favicon ?? null, tab.muted, tab.canGoBack, tab.canGoForward,
  tab.popup, tab.runtimeOwned, tab.navigationError ?? null, tab.generation, tab.createdAt, tab.lastActiveAt]);

/**
 * Merge buffered patches into one write, dropping upserts that change only
 * fields a restore discards. `durable` tracks what storage already holds and
 * is updated for the ops that survive.
 */
export function coalescePatches(patches: TabPatch[], durable: Map<string, string>): TabPatch | null {
  const ops: TabPatchOp[] = [];
  for (const patch of patches) for (const op of patch.ops) {
    if (op.op === "upsert") {
      const key = durableTabKey(op.tab);
      if (durable.get(op.tab.pageId) === key) continue;
      durable.set(op.tab.pageId, key);
    } else if (op.op === "remove") durable.delete(op.pageId);
    ops.push(op);
  }
  const last = patches.at(-1);
  return last && ops.length ? { version: last.version, baseVersion: patches[0]!.baseVersion, ops, ts: last.ts } : null;
}

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
  private buffer: { patch: TabPatch; resolve(): void; reject(error: Error): void }[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private durable = new Map<string, string>();
  private resyncing = false;

  /** `snapshot` supplies the full catalog when an incremental write fails and storage must be rewritten. */
  constructor(
    private opts: { dir: string; workerUrl: URL; onError?(error: Error): void; snapshot?(): TabCatalogSnapshot; flushMs?: number },
  ) {}

  /** Durable catalog version — the newest patch the worker confirmed. */
  get durableVersion() {
    return this.ackedVersion;
  }

  /** Boot the worker and read the persisted catalog. Errors leave the browser usable. */
  async load(): Promise<TabCatalogSnapshot | null> {
    try {
      const snapshot = (await this.request({ type: "load" })) as TabCatalogSnapshot;
      for (const tab of snapshot.tabs) this.durable.set(tab.pageId, durableTabKey(tab));
      return snapshot;
    } catch (error) {
      this.degrade(error);
      return null;
    }
  }

  /**
   * Persist a catalog patch. Patches coalesce for a short window into one
   * transaction; resolves when the write carrying it has committed. A failed
   * incremental write rewrites storage from the live catalog.
   */
  persist(patch: TabPatch): Promise<void> {
    if (this.failed) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      this.buffer.push({ patch, resolve, reject });
      this.flushTimer ??= setTimeout(() => void this.flush(), this.opts.flushMs ?? FLUSH_MS);
    });
  }

  /** Write everything buffered now — shutdown, and callers that need durability. */
  flush(): Promise<void> {
    if (this.flushTimer) { clearTimeout(this.flushTimer); this.flushTimer = null; }
    const batch = this.buffer.splice(0);
    if (!batch.length) return this.queue.then(() => {});
    const done = this.enqueue(async () => {
      if (this.failed) return;
      const merged = coalescePatches(batch.map(entry => entry.patch), this.durable);
      if (merged) await this.request({ type: "apply", patch: merged });
      this.acknowledge(batch.at(-1)!.patch.version);
    });
    return done.then(
      () => batch.forEach(entry => entry.resolve()),
      error => {
        this.durable.clear();
        this.resync();
        batch.forEach(entry => entry.reject(error instanceof Error ? error : new Error(String(error))));
      },
    );
  }

  private acknowledge(version: number) {
    this.ackedVersion = Math.max(this.ackedVersion, version);
    for (const [waiting, waiters] of this.durabilityWaiters) {
      if (waiting > this.ackedVersion) continue;
      waiters.forEach(waiter => waiter.resolve());
      this.durabilityWaiters.delete(waiting);
    }
  }

  /** Replace stored state with the live catalog after an incremental write was lost. */
  private resync() {
    if (this.resyncing || this.failed || !this.opts.snapshot) return;
    this.resyncing = true;
    void this.enqueue(async () => {
      const snapshot = this.opts.snapshot!();
      await this.request({ type: "replace", snapshot });
      this.durable = new Map(snapshot.tabs.map(tab => [tab.pageId, durableTabKey(tab)]));
      this.acknowledge(snapshot.version);
    }).catch(error => this.opts.onError?.(error instanceof Error ? error : new Error(String(error))))
      .finally(() => { this.resyncing = false; });
  }

  /** Resolve once `version` (or a later one) is durably written. Test + shutdown flush. */
  whenDurable(version: number): Promise<void> {
    if (this.ackedVersion >= version) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const waiters = this.durabilityWaiters.get(version) ?? [];
      waiters.push({ resolve, reject });
      this.durabilityWaiters.set(version, waiters);
      void this.flush().catch(() => {}).then(() => this.queue).then(() => {
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

  private request(message: { type: string; patch?: TabPatch; snapshot?: TabCatalogSnapshot }): Promise<unknown> {
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
    if (this.flushTimer) { clearTimeout(this.flushTimer); this.flushTimer = null; }
    for (const entry of this.buffer.splice(0)) entry.resolve();
    for (const entry of this.pending.values()) entry.reject(err);
    this.pending.clear();
    for (const waiters of this.durabilityWaiters.values()) waiters.forEach(waiter => waiter.reject(err));
    this.durabilityWaiters.clear();
  }

  async dispose() {
    try {
      await this.flush().catch(() => {});
      await this.queue;
      if (this.worker) await this.request({ type: "close" });
    } catch { /* closing flush is best effort */ }
    await this.worker?.terminate().catch(() => {});
    this.worker = null;
  }
}
