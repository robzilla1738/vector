/** Named, bounded timing policies for host-neutral reliability work. */
export const SAFETY_TIMING = {
  acceptanceLookup: { attempts: 3, delayMs: 350, deadlineMs: 4_000 },
  acknowledgement: { intervalMs: 500, deadlineMs: 15_000 },
  viewerLiveness: { intervalMs: 2_000, stallMs: 15_000 },
  offlineRetry: { attempts: 3, initialDelayMs: 500, maxDelayMs: 4_000 },
} as const;

export async function withDeadline<T>(work: (signal: AbortSignal) => Promise<T>, timeoutMs: number, parent?: AbortSignal): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error("Deadline must be positive");
  if (parent?.aborted) throw parent.reason ?? new Error("cancelled");
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let rejectDeadline: ((error: unknown) => void) | undefined;
  const deadline = new Promise<never>((_resolve, reject) => { rejectDeadline = reject; });
  const abort = (reason: unknown) => { controller.abort(reason); rejectDeadline?.(reason); };
  const onParentAbort = () => abort(parent?.reason ?? new Error("cancelled"));
  parent?.addEventListener("abort", onParentAbort, { once: true });
  timer = setTimeout(() => abort(new Error("deadline_exceeded")), timeoutMs);
  try { return await Promise.race([work(controller.signal), deadline]); }
  finally { clearTimeout(timer); parent?.removeEventListener("abort", onParentAbort); }
}

export async function retryWithHints<T>(work: (attempt: number) => Promise<T>, opts: {
  attempts: number; initialDelayMs: number; maxDelayMs: number; retryable: (error: unknown) => boolean;
  signal?: AbortSignal;
}): Promise<T> {
  if (!Number.isInteger(opts.attempts) || opts.attempts < 1) throw new Error("Attempt count must be positive");
  for (let attempt = 1; ; attempt += 1) {
    opts.signal?.throwIfAborted();
    try { return await work(attempt); }
    catch (error) {
      if (attempt >= opts.attempts || !opts.retryable(error)) throw error;
      const delay = Math.min(opts.maxDelayMs, opts.initialDelayMs * 2 ** (attempt - 1));
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => { opts.signal?.removeEventListener("abort", onAbort); resolve(); }, delay);
        const onAbort = () => { clearTimeout(timer); reject(opts.signal?.reason); };
        opts.signal?.addEventListener("abort", onAbort, { once: true });
      });
    }
  }
}

export async function pollUntil<T>(read: () => Promise<T>, done: (value: T) => boolean, opts: {
  intervalMs: number; deadlineMs: number; signal?: AbortSignal;
}): Promise<T> {
  if (opts.intervalMs <= 0 || opts.deadlineMs <= 0) throw new Error("Polling intervals must be positive");
  return withDeadline(async signal => {
    for (;;) {
      signal.throwIfAborted();
      const value = await read();
      if (done(value)) return value;
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => { signal.removeEventListener("abort", onAbort); resolve(); }, opts.intervalMs);
        const onAbort = () => { clearTimeout(timer); reject(signal.reason); };
        signal.addEventListener("abort", onAbort, { once: true });
      });
    }
  }, opts.deadlineMs, opts.signal);
}

export class ViewerLivenessWatchdog {
  private lastHeartbeat: number;
  constructor(private readonly stallMs = SAFETY_TIMING.viewerLiveness.stallMs, now = Date.now()) {
    this.lastHeartbeat = now;
  }
  heartbeat(now = Date.now()): void { this.lastHeartbeat = now; }
  stalled(now = Date.now()): boolean { return now - this.lastHeartbeat >= this.stallMs; }
}

/** A child policy can remove destinations, never add one that the parent denied. */
export function tightenEgress(parent: ReadonlySet<string>, requested: ReadonlySet<string>): Set<string> {
  return new Set([...requested].filter(destination => parent.has(destination)));
}

export function recoveryLadder(stage: "wait" | "retry" | "recover" | "reset"): { instruction: string; kept: string } {
  switch (stage) {
    case "wait": return { instruction: "Wait for the current operation to settle.", kept: "The task, tabs, and pending action remain." };
    case "retry": return { instruction: "Retry a confirmed safe request.", kept: "The task, tabs, and journal remain; uncertain effects are not resent." };
    case "recover": return { instruction: "Reconnect the runtime and reconcile pending actions.", kept: "The task, tabs, journal, and saved progress remain." };
    case "reset": return { instruction: "Start a new turn after reviewing unresolved actions.", kept: "Saved task data, journal, and receipts remain; volatile execution state is cleared." };
  }
}
