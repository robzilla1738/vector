import { EventTypes, type AuxEvent, type Run } from "@aux/contracts";
import { presentRun } from "./services/run-presentation.js";
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
  /** Stream identity (D9) — the repo mints it once per store; stable for the bus's life. */
  readonly streamId: string;
  constructor(private repo: Repo) {
    this.nextSeq = repo.lastSeq() + 1;
    this.streamId = repo.streamId();
  }

  emit(type: string, payload: Record<string, unknown>, runId?: string): AuxEvent {
    const ev: AuxEvent = {
      seq: this.nextSeq++,
      streamId: this.streamId,
      runId,
      type,
      payload:
        type === EventTypes.RunUpdated && payload.run
          ? { ...payload, run: presentRun(payload.run as Run) }
          : payload,
      ts: Date.now(),
    };
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

  /** Stream head — the seq of the newest event. */
  lastSeq(): number {
    return this.repo.lastSeq();
  }

  since(seq: number, limit = 500, runId?: string, streamId?: string) {
    return this.repo.eventsSince(seq, limit, runId, streamId);
  }
}
