import { EventTypes } from "@aux/contracts";
import type { EventBus } from "../events.js";

export const ANSWER_DELTA_INTERVAL_MS = 100;

/** Throttled `run.answer.delta` stream: at most one event per interval, the latest text always delivered on flush. */
export class AnswerDeltaEmitter {
  private seq = 0;
  private sent = "";
  private latest = "";
  private lastAt = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly events: Pick<EventBus, "emit">,
    private readonly runId: string,
    private readonly intervalMs = ANSWER_DELTA_INTERVAL_MS,
  ) {}

  push(text: string | undefined): void {
    if (text === undefined || text === this.latest) return;
    this.latest = text;
    const wait = this.lastAt + this.intervalMs - Date.now();
    if (wait <= 0) this.emit();
    else this.timer ??= setTimeout(() => this.emit(), wait);
  }

  flush(): void {
    this.emit();
  }

  private emit(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined;
    if (this.latest === this.sent) return;
    const delta = this.latest.startsWith(this.sent) ? this.latest.slice(this.sent.length) : this.latest;
    this.sent = this.latest;
    this.lastAt = Date.now();
    this.events.emit(EventTypes.RunAnswerDelta, { runId: this.runId, text: this.latest, delta, seq: ++this.seq, replace: delta === this.latest && this.seq > 1 }, this.runId);
  }
}
