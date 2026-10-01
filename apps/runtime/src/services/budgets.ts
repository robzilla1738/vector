import type { DatabaseSync } from "node:sqlite";
import { AuxError } from "@aux/contracts";

/**
 * S5 deliverable 9 — user budgets per run, day and routine (D11). Spend
 * actuals live in the existing `model_calls` ledger — every engine records
 * billed attempts there — so this service is pure queries over that table
 * plus the routine_runs link, and never invents parallel accounting.
 * Limits come from settings (`budgets.runUsd|dayUsd|routineUsd`); an unset
 * scope means unlimited. Enforcement is pre-call: the coordinator and the
 * v2 loop host call `assertWithin` before each model step, so a spent
 * budget stops the run honestly instead of landing one call too late.
 */

export interface BudgetLimits {
  runUsd?: number;
  dayUsd?: number;
  routineUsd?: number;
}

export interface BudgetStatus {
  scope: "run" | "day" | "routine" | "nightShift";
  /** Routine scope id when scope is "routine"; run id when "run". */
  scopeId?: string;
  limitUsd?: number;
  spentUsd: number;
  remainingUsd?: number;
  exceeded: boolean;
}

function positive(raw: unknown): number | undefined {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** Local-calendar-day start (ms epoch) — "per day" means the user's day. */
export function dayStartMs(now = Date.now()): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export class BudgetsService {
  private nightShift?: (runId: string) => BudgetStatus[];
  configureNightShift(status: (runId: string) => BudgetStatus[]) {
    if (this.nightShift) throw new AuxError("conflict", "Night shift budgets are already installed.");
    this.nightShift = status;
    return () => { if (this.nightShift === status) this.nightShift = undefined; };
  }
  constructor(
    private readonly db: DatabaseSync,
    private readonly limits: () => BudgetLimits,
  ) {}

  private sum(sql: string, ...params: (string | number)[]): number {
    const row = this.db.prepare(sql).get(...params) as { s: number | null } | undefined;
    return row?.s ?? 0;
  }

  /** All billed model-call cost attributed to this run. */
  spentRunUsd(runId: string): number {
    return this.sum("SELECT COALESCE(SUM(cost_usd),0) s FROM model_calls WHERE run_id=?", runId);
  }

  /** All model-call cost across every run since local midnight. */
  spentDayUsd(now = Date.now()): number {
    return this.sum("SELECT COALESCE(SUM(cost_usd),0) s FROM model_calls WHERE created_at>=?", dayStartMs(now));
  }

  /** Model-call cost across every run this routine ever launched. */
  spentRoutineUsd(routineId: string): number {
    return this.sum(
      "SELECT COALESCE(SUM(m.cost_usd),0) s FROM model_calls m WHERE m.run_id IN (SELECT run_id FROM routine_runs WHERE routine_id=? AND run_id IS NOT NULL)",
      routineId,
    );
  }

  /** The routine that launched this run, when it is a routine occurrence. */
  routineForRun(runId: string): string | undefined {
    const row = this.db
      .prepare("SELECT routine_id FROM routine_runs WHERE run_id=? LIMIT 1")
      .get(runId) as { routine_id: string } | undefined;
    return row?.routine_id;
  }

  status(scope: { runId?: string; routineId?: string }, now = Date.now()): BudgetStatus[] {
    const limits = this.limits();
    const out: BudgetStatus[] = [];
    const push = (s: Omit<BudgetStatus, "remainingUsd" | "exceeded">) => {
      const remaining = s.limitUsd === undefined ? undefined : Math.max(0, s.limitUsd - s.spentUsd);
      out.push({ ...s, remainingUsd: remaining, exceeded: s.limitUsd !== undefined && s.spentUsd >= s.limitUsd });
    };
    if (scope.runId) push({ scope: "run", scopeId: scope.runId, limitUsd: positive(limits.runUsd), spentUsd: this.spentRunUsd(scope.runId) });
    push({ scope: "day", limitUsd: positive(limits.dayUsd), spentUsd: this.spentDayUsd(now) });
    if (scope.routineId) push({ scope: "routine", scopeId: scope.routineId, limitUsd: positive(limits.routineUsd), spentUsd: this.spentRoutineUsd(scope.routineId) });
    if (scope.runId && this.nightShift) out.push(...this.nightShift(scope.runId));
    return out;
  }

  /**
   * Pre-call gate: throws permission_denied naming the exhausted scope. The
   * check is advisory-point exact — the caller checks again before the next
   * step, so concurrent runs can overshoot by at most one in-flight call.
   */
  assertWithin(scope: { runId: string; routineId?: string }, now = Date.now()): void {
    const over = this.status({ runId: scope.runId, routineId: scope.routineId ?? this.routineForRun(scope.runId) }, now).find(
      (s) => s.exceeded,
    );
    if (!over) return;
    const label =
      over.scope === "run" ? "this run" : over.scope === "day" ? "today" : over.scope === "nightShift" ? `overnight scope ${over.scopeId}` : `routine ${over.scopeId}`;
    throw new AuxError(
      "permission_denied",
      `The user-set ${over.scope} budget of $${over.limitUsd!.toFixed(2)} is spent for ${label} ($${over.spentUsd.toFixed(2)}). Raise the budget in Settings or start a new scope.`,
      { scope: over.scope, limitUsd: over.limitUsd, spentUsd: over.spentUsd },
    );
  }
}
