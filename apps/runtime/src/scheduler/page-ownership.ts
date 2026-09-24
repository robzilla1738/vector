import { AuxError } from "@aux/contracts";

export interface PageOwner {
  pageId: string;
  actor: "set_member" | "coordinator" | "external";
  runId?: string;
  memberId?: string;
  taskId?: string;
  connectionId?: string;
}

interface Waiter {
  owner: PageOwner;
  signal?: AbortSignal;
  resolve: (release: () => void) => void;
  reject: (error: Error) => void;
  onAbort: () => void;
}

/** In-process ownership of a tab across an entire automated unit of work. */
export class PageOwnership {
  private owners = new Map<string, PageOwner>();
  private waiters = new Map<string, Waiter[]>();

  tryAcquire(owner: PageOwner): () => void {
    const current = this.owners.get(owner.pageId);
    if (current) throw new AuxError("conflict", `Page ${owner.pageId} is in use by ${current.actor}${current.runId ? ` (${current.runId})` : ""}`);
    this.owners.set(owner.pageId, owner);
    return this.releaseFor(owner);
  }

  acquire(owner: PageOwner, signal?: AbortSignal): Promise<() => void> {
    if (signal?.aborted) return Promise.reject(new AuxError("cancelled", "page ownership request aborted"));
    if (!this.owners.has(owner.pageId)) return Promise.resolve(this.tryAcquire(owner));
    return new Promise((resolve, reject) => {
      const onAbort = () => {
        const queue = this.waiters.get(owner.pageId);
        if (queue) {
          const next = queue.filter(item => item !== waiter);
          if (next.length) this.waiters.set(owner.pageId, next);
          else this.waiters.delete(owner.pageId);
        }
        reject(new AuxError("cancelled", "page ownership request aborted"));
      };
      const waiter: Waiter = { owner, signal, resolve, reject, onAbort };
      const queue = this.waiters.get(owner.pageId) ?? [];
      queue.push(waiter);
      this.waiters.set(owner.pageId, queue);
      signal?.addEventListener("abort", onAbort, { once: true });
    });
  }

  async acquireMany(pageIds: readonly string[], owner: Omit<PageOwner, "pageId">, signal?: AbortSignal): Promise<() => void> {
    const releases: Array<() => void> = [];
    try {
      for (const pageId of [...new Set(pageIds)].sort()) releases.push(await this.acquire({ ...owner, pageId }, signal));
      return () => { for (const release of releases.reverse()) release(); };
    } catch (error) {
      for (const release of releases.reverse()) release();
      throw error;
    }
  }

  snapshot(): Record<string, PageOwner> { return Object.fromEntries(this.owners); }

  private releaseFor(owner: PageOwner): () => void {
    let released = false;
    return () => {
      if (released) return;
      released = true;
      if (this.owners.get(owner.pageId) !== owner) return;
      const queue = this.waiters.get(owner.pageId);
      while (queue?.length) {
        const next = queue.shift()!;
        next.signal?.removeEventListener("abort", next.onAbort);
        if (next.signal?.aborted) {
          next.reject(new AuxError("cancelled", "page ownership request aborted"));
          continue;
        }
        if (!queue.length) this.waiters.delete(owner.pageId);
        this.owners.set(owner.pageId, next.owner);
        next.resolve(this.releaseFor(next.owner));
        return;
      }
      this.waiters.delete(owner.pageId);
      this.owners.delete(owner.pageId);
    };
  }
}
