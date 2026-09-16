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
  return {
    crashAt: opts.crashAt,
    duplicateWrites: 0,
    restartSafe: !dispatched || confirmed,
    needsUserReview: dispatched && !confirmed,
    unresolvedEffects: unresolved,
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
