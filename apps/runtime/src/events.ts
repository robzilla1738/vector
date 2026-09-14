import type { VectorEvent } from "@vector/contracts";
import type { Repo } from "./store/repo.js";

type Listener = (e: VectorEvent) => void;

/** Persists every event with a sequence number and fans out to subscribers. */
export class EventBus {
  private listeners = new Set<Listener>();
  constructor(private repo: Repo) {}

  emit(type: string, payload: Record<string, unknown>, runId?: string): VectorEvent {
    const seq = this.repo.appendEvent({ runId, type, payload, ts: Date.now() });
    const ev: VectorEvent = { seq, runId, type, payload, ts: Date.now() };
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
