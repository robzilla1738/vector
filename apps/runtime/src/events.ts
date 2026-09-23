import type { AuxEvent } from "@aux/contracts";
import type { Repo } from "./store/repo.js";

type Listener = (e: AuxEvent) => void;

/**
 * Persists every event with a sequence number and fans out to subscribers.
 * Sequence numbers are assigned here, in emit order; the rows are written in
 * the repo's per-tick batch, and `since` flushes that batch before reading.
 */
export class EventBus {
  private listeners = new Set<Listener>();
  private nextSeq: number;
  constructor(private repo: Repo) {
    this.nextSeq = repo.lastSeq() + 1;
  }

  emit(type: string, payload: Record<string, unknown>, runId?: string): AuxEvent {
    const ev: AuxEvent = { seq: this.nextSeq++, runId, type, payload, ts: Date.now() };
    this.repo.queueEvent(ev);
    for (const l of this.listeners) {
      try {
        l(ev);
      } catch {
        /* subscriber errors must not break the bus */
      }
    }
    return ev;
  }

  subscribe(l: Listener): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  since(seq: number, limit = 500, runId?: string) {
    return this.repo.eventsSince(seq, limit, runId);
  }
}
