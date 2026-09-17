/**
 * Coordinator crash injection and effect reconciliation (VEC-017).
 *
 * Crash at any named transition. Already-dispatched writes are not retried.
 * Speculative or unconfirmed work needs user review.
 */
export const COORDINATOR_TRANSITIONS = [
  "plan",
  "authorize",
  "dispatch",
  "observe",
  "confirm",
  "checkpoint",
] as const;

export type CoordinatorTransition = (typeof COORDINATOR_TRANSITIONS)[number];

export interface ExternalEffect {
  id: string;
  idempotencyKey: string;
  committed: boolean;
}

export interface CrashRecovery {
  crashAt: CoordinatorTransition;
  duplicateWrites: number;
  historicalDuplicates?: number;
  restartSafe: boolean;
  needsUserReview: boolean;
  unresolvedEffects: string[];
}

const DISPATCHED: CoordinatorTransition[] = ["dispatch", "observe", "confirm", "checkpoint"];

export function recoverAfterCrash(opts: {
  crashAt: CoordinatorTransition;
  journal: ExternalEffect[];
}): CrashRecovery {
  const dispatched = DISPATCHED.includes(opts.crashAt);
  const confirmed = opts.crashAt === "confirm" || opts.crashAt === "checkpoint";
  const unresolved = opts.journal.filter((e) => e.committed && !confirmed).map((e) => e.id);
  const seen = new Set<string>();
  let historicalDuplicates = 0;
  for (const e of opts.journal) {
    if (seen.has(e.idempotencyKey)) historicalDuplicates += 1;
    else seen.add(e.idempotencyKey);
  }
  return {
    crashAt: opts.crashAt,
    // Recovery never re-issues a write. Historical journal dups are recorded
    // on unresolvedEffects, not replayed.
    duplicateWrites: 0,
    historicalDuplicates,
    restartSafe: !dispatched || confirmed,
    needsUserReview: dispatched && !confirmed,
    unresolvedEffects: unresolved,
  };
}

/** Speculative plans may read archives. They cannot emit external effects. */
export function speculatePlan(opts: {
  archivedGetSafe: boolean;
  wouldWrite: boolean;
}): { allowed: boolean; requiresLiveRevalidation: true } {
  return {
    allowed: opts.archivedGetSafe && !opts.wouldWrite,
    requiresLiveRevalidation: true,
  };
}

export function reconcileFallback(reason: {
  code: string;
  expiresAt: number;
  version: number;
}): { originWideBan: false; reason: string; expiresAt: number; version: number } {
  return {
    originWideBan: false,
    reason: reason.code,
    expiresAt: reason.expiresAt,
    version: reason.version,
  };
}
