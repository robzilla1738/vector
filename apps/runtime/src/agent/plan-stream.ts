/**
 * Incremental reader for a streamed PlanChunk (speed P0-1 / plan A5).
 *
 * The planner answers with one JSON object whose `steps` array holds 1–8
 * ops. Waiting for the whole object before acting wastes the time the
 * model spends emitting steps 2..n; this parser hands each step object to
 * the caller the moment its closing brace arrives, so the executor can run
 * step k while the model is still writing step k+1.
 *
 * It is deliberately not a general JSON parser: it tracks string/escape
 * state and brace depth from the opening `[` of `"steps"` and slices out
 * each top-level `{…}` element. Everything before a `</think>` (or the
 * whole buffer while a `<think>` is open) is ignored, matching the
 * non-streaming `extractJson` behaviour.
 */
export type PlanStatus = "continue" | "done" | "needs_input";

export class PlanStreamParser {
  private buf = "";
  /** Index just past the `[` of `"steps": [`, or -1 until seen. */
  private stepsStart = -1;
  /** Scan cursor inside the steps array. */
  private cursor = -1;
  private inStr = false;
  private esc = false;
  private depth = 0;
  private elementStart = -1;
  /** Set once the `]` closing the steps array is seen. */
  private stepsClosed = false;
  /** `status` as soon as it is visible in the stream. */
  status: PlanStatus | undefined;
  /** `pageId` as soon as it is visible (multi-page runs retarget with it). */
  pageId: string | undefined;
  /** Completed step objects so far, in order. */
  readonly steps: unknown[] = [];

  /** Feed a text delta; returns the step objects that completed with it. */
  push(delta: string): unknown[] {
    this.buf += delta;
    const before = this.steps.length;
    const body = this.jsonBody();
    if (body === null) return [];
    if (!this.status) {
      const m = /"status"\s*:\s*"(continue|done|needs_input)"/.exec(body);
      if (m) this.status = m[1] as PlanStatus;
    }
    if (this.pageId === undefined) {
      const m = /"pageId"\s*:\s*"([^"\\]*)"/.exec(body);
      if (m) this.pageId = m[1];
    }
    if (this.stepsStart < 0) {
      const m = /"steps"\s*:\s*\[/.exec(body);
      if (!m) return [];
      this.stepsStart = m.index + m[0].length;
      this.cursor = this.stepsStart;
    }
    if (!this.stepsClosed) this.scan(body);
    return this.steps.slice(before);
  }

  /** True once the steps array has been closed by the model. */
  get complete(): boolean {
    return this.stepsClosed;
  }

  private jsonBody(): string | null {
    const open = this.buf.indexOf("<think");
    if (open < 0) return this.buf;
    const close = this.buf.indexOf("</think>", open);
    if (close < 0) return null;
    // the parser state is positional; offsets below are relative to `body`,
    // so once thinking is stripped it stays stripped (the prefix is fixed)
    return this.buf.slice(close + "</think>".length);
  }

  private scan(body: string): void {
    for (; this.cursor < body.length; this.cursor++) {
      const c = body[this.cursor]!;
      if (this.inStr) {
        if (this.esc) this.esc = false;
        else if (c === "\\") this.esc = true;
        else if (c === '"') this.inStr = false;
        continue;
      }
      if (c === '"') {
        this.inStr = true;
        continue;
      }
      if (c === "{") {
        if (this.depth === 0) this.elementStart = this.cursor;
        this.depth++;
      } else if (c === "}") {
        this.depth--;
        if (this.depth === 0 && this.elementStart >= 0) {
          const raw = body.slice(this.elementStart, this.cursor + 1);
          this.elementStart = -1;
          try {
            this.steps.push(JSON.parse(raw));
          } catch {
            // an element that does not parse is left for the final full parse
          }
        }
      } else if (c === "]" && this.depth === 0) {
        this.stepsClosed = true;
        this.cursor++;
        return;
      }
    }
  }
}
