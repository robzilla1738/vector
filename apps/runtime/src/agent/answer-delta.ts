import { EventTypes } from "@aux/contracts";
import type { EventBus } from "../events.js";

export const ANSWER_DELTA_INTERVAL_MS = 100;
export const ANSWER_DELTA_PREVIEW_CHARS = 32_000;
const TRUNCATED = "\n\n[Live preview limited to 32,000 characters.]";

/** Throttled `run.answer.delta` stream: at most one event per interval, the latest text always delivered on flush. */
export class AnswerDeltaEmitter {
  private seq = 0;
  private sent = "";
  private latest = "";
  private lastAt = 0;
  private held = false;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly events: Pick<EventBus, "emit">,
    private readonly runId: string,
    private readonly intervalMs = ANSWER_DELTA_INTERVAL_MS,
  ) {}

  push(text: string | undefined): void {
    if (text === undefined) return;
    const preview =
      text.length > ANSWER_DELTA_PREVIEW_CHARS ? text.slice(0, ANSWER_DELTA_PREVIEW_CHARS) + TRUNCATED : text;
    if (preview === this.latest) return;
    this.latest = preview;
    if (this.held) return;
    const wait = this.lastAt + this.intervalMs - Date.now();
    if (wait <= 0) this.emit();
    else this.timer ??= setTimeout(() => this.emit(), wait);
  }

  /** Source-bearing drafts stay local until their final source proof succeeds. */
  hold(): void {
    this.held = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined;
  }
  release(): void {
    if (!this.held) return;
    this.held = false;
    this.emit();
  }
  discard(): void {
    if (!this.held) return;
    this.latest = this.sent;
    this.held = false;
  }
  flush(): void {
    if (!this.held) this.emit();
  }

  private emit(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined;
    if (this.latest === this.sent) return;
    const delta = this.latest.startsWith(this.sent) ? this.latest.slice(this.sent.length) : this.latest;
    this.sent = this.latest;
    this.lastAt = Date.now();
    this.events.emit(
      EventTypes.RunAnswerDelta,
      {
        runId: this.runId,
        text: this.latest,
        delta,
        seq: ++this.seq,
        replace: delta === this.latest && this.seq > 1,
      },
      this.runId,
    );
  }
}
