/**
 * Quiescence readiness signal (speed P1-8). The page is settled after two
 * animation frames, no in-flight fetch/XHR, and a short mutation-free window.
 * This is a readiness *signal*, not a fixed sleep: it resolves the moment the
 * page is quiet and gives up at the deadline so a live ticker cannot stall a
 * step.
 *
 * Nothing is installed in the page's own world: mutations are tracked by a
 * MutationObserver in the driver's isolated world (aux-world.ts) and requests
 * are counted from Node through Playwright's network events, so a page can
 * neither detect nor defeat the tracker (no wrapped fetch/XHR).
 */

/** Default bound for an explicit `waitFor { kind: "settled" }`. */
export const SETTLED_CONDITION_MS = 2_000;
/** DOM and network must be quiet for this long. */
export const SETTLED_QUIET_MS = 100;

/**
 * 01's readiness heuristic as named policies (S4): every wait in the driver
 * and the executor's retry loop picks one by name rather than carrying
 * ad-hoc timeout/quiet values.
 */
export interface ReadinessPolicy {
  /** overall deadline for the wait */
  timeoutMs: number;
  /** DOM and (when enabled) network must stay quiet this long */
  quietMs: number;
  /** require in-flight fetch/XHR to drain; false = DOM quiet only */
  networkIdle: boolean;
}

export const READINESS_POLICIES = {
  /** Document parsed and loaded — no quiet requirement (fastest). */
  load: { timeoutMs: 10_000, quietMs: 0, networkIdle: false },
  /** Rendered frames and a DOM-quiet window; requests may still be in flight. */
  interactive: { timeoutMs: SETTLED_CONDITION_MS, quietMs: SETTLED_QUIET_MS, networkIdle: false },
  /** Frames + DOM quiet + no in-flight fetch/XHR for quietMs. */
  networkIdle: { timeoutMs: SETTLED_CONDITION_MS, quietMs: SETTLED_QUIET_MS, networkIdle: true },
} as const satisfies Record<string, ReadinessPolicy>;

export type ReadinessPolicyName = keyof typeof READINESS_POLICIES;

interface TrackedRequest {
  resourceType(): string;
  frame(): unknown;
}

/** In-flight fetch/XHR of one page's main frame, fed by Playwright request events. */
export class RequestTracker {
  private inflight = new Set<unknown>();
  private lastEnd = 0;

  constructor(private mainFrame: () => unknown) {}

  started(request: TrackedRequest) {
    const type = request.resourceType();
    if (type !== "fetch" && type !== "xhr") return;
    try {
      if (request.frame() !== this.mainFrame()) return;
    } catch {
      return; // service-worker requests have no frame
    }
    this.inflight.add(request);
  }

  ended(request: unknown) {
    if (this.inflight.delete(request)) this.lastEnd = Date.now();
  }

  /** A new document: requests of the old one no longer hold it busy. */
  reset() {
    this.inflight.clear();
  }

  quiet(quietMs: number, now = Date.now()): boolean {
    return this.inflight.size === 0 && now - this.lastEnd >= quietMs;
  }

  get size() {
    return this.inflight.size;
  }
}

export interface SettledProbeArgs {
  timeoutMs: number;
  quietMs: number;
}

/**
 * Main-world fallback when the isolated world is unavailable: frames only.
 * rAF is raced against a one-frame timer so a throttled or non-rendering
 * (headless, hidden) renderer cannot hang the probe; when no frame arrives at
 * all the second frame wait is skipped.
 */
export function settledProbe(_args: SettledProbeArgs): Promise<boolean> {
  const frame = () =>
    new Promise<boolean>((r) => {
      let done = false;
      const fin = (real: boolean) => {
        if (!done) {
          done = true;
          r(real);
        }
      };
      try {
        requestAnimationFrame(() => fin(true));
      } catch {
        /* no rAF — timer below */
      }
      setTimeout(() => fin(false), 20);
    });
  return (async () => {
    if (await frame()) await frame();
    return true;
  })();
}
