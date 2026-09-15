import { PlanStepSchema, type PlanStep, type ProgramResult } from "@vector/contracts";

/**
 * Executes plan steps while the planner is still streaming them (plan A5).
 *
 * Steps are offered one at a time as the stream parser completes them. The
 * dispatcher validates each against the planner vocabulary and runs
 * everything queued so far as one program the moment the previous batch
 * finishes — so when the model is faster than the browser the batches grow
 * (engine act-and-observe stays batched), and when the browser is faster
 * each step runs the instant it is written.
 *
 * Ordering is preserved: a step that fails validation stops early
 * dispatch at that index; `finish()` reconciles against the fully parsed
 * plan and runs whatever was not dispatched. A failed batch stops
 * everything after it, matching single-program semantics.
 */
export class EarlyDispatcher {
  private queue: PlanStep[] = [];
  private running: Promise<void> | null = null;
  private accepted = 0;
  private halted = false;
  private first = true;
  private readonly outcomes: ProgramResult["steps"] = [];
  private extracted: Record<string, unknown> | undefined;
  private fallback: ProgramResult["fallback"] | undefined;
  private status: ProgramResult["status"] = "completed";
  private error: string | undefined;
  /** Wall-clock when the first step started executing (undefined if none did). */
  firstDispatchAt: number | undefined;

  constructor(
    private readonly execute: (steps: PlanStep[], first: boolean) => Promise<ProgramResult>,
    private readonly maxSteps = 24,
  ) {}

  /** Steps handed to the executor before the plan finished streaming. */
  get dispatchedCount(): number {
    return this.accepted - this.queue.length;
  }

  /** Offer a step object straight from the stream. Invalid input halts early dispatch (the full parse decides). */
  offer(raw: unknown): void {
    if (this.halted || this.accepted >= this.maxSteps) return;
    const withId =
      raw && typeof raw === "object" && !Array.isArray(raw) && ((raw as { id?: unknown }).id == null || (raw as { id?: unknown }).id === "")
        ? { ...(raw as Record<string, unknown>), id: `s${this.accepted + 1}` }
        : raw;
    const parsed = PlanStepSchema.safeParse(withId);
    if (!parsed.success) {
      this.halted = true;
      return;
    }
    this.accepted++;
    this.queue.push(parsed.data);
    this.kick();
  }

  /** Stop taking new work (the plan turned out not to be a `continue`, or the run aborted). */
  halt(): void {
    this.halted = true;
  }

  /**
   * The plan is complete: run any step the stream did not deliver (index ≥
   * accepted), wait for everything, and return one combined ProgramResult.
   */
  async finish(steps: PlanStep[]): Promise<ProgramResult> {
    if (this.status === "completed") {
      for (const step of steps.slice(this.accepted)) {
        this.accepted++;
        this.queue.push(step);
      }
      this.kick();
    }
    while (this.running) await this.running;
    return {
      status: this.status,
      steps: this.outcomes,
      ...(this.extracted ? { extracted: this.extracted } : {}),
      ...(this.error ? { error: this.error } : {}),
      ...(this.fallback ? { fallback: this.fallback } : {}),
    };
  }

  private kick(): void {
    if (this.running || this.status !== "completed" || !this.queue.length) return;
    const batch = this.queue.splice(0);
    const first = this.first;
    this.first = false;
    this.firstDispatchAt ??= Date.now();
    this.running = this.execute(batch, first)
      .then((r) => {
        this.outcomes.push(...r.steps);
        if (r.extracted) this.extracted = { ...(this.extracted ?? {}), ...r.extracted };
        if (r.fallback) this.fallback = r.fallback;
        if (r.status !== "completed") {
          this.status = r.status;
          this.error = r.error;
          this.queue.length = 0;
        }
      })
      .catch((e: unknown) => {
        this.status = "failed";
        this.error = e instanceof Error ? e.message : String(e);
        this.queue.length = 0;
      })
      .finally(() => {
        this.running = null;
        this.kick();
      });
  }
}
