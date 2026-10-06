import type { DatabaseSync } from "node:sqlite";
import { AuxError } from "@aux/contracts";

/** User budgets combine model invoices and final contractual cloud-resource receipts. */

export interface BudgetLimits {
  runUsd?: number;
  dayUsd?: number;
  monthUsd?: number;
  routineUsd?: number;
}

export interface BudgetStatus {
  scope: "run" | "day" | "month" | "routine" | "nightShift";
  /** Routine scope id when scope is "routine"; run id when "run". */
  scopeId?: string;
  limitUsd?: number;
  spentUsd: number;
  remainingUsd?: number;
  exceeded: boolean;
  /** Unknown resource usage remains unresolved under a finite spend limit. */
  resourceCostComplete?: boolean;
  /** Known USD subtotals exclude these calls; they cannot be treated as free spend. */
  unpricedModelCalls?: number;
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

/** Local calendar month, including the user’s daylight-saving offset. */
export function monthStartMs(now = Date.now()): number {
  const d = new Date(now);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export class BudgetsService {
  private nightShift?: (runId: string) => BudgetStatus[];
  configureNightShift(status: (runId: string) => BudgetStatus[]) {
    if (this.nightShift) throw new AuxError("conflict", "Night shift budgets are already installed.");
    this.nightShift = status;
    return () => {
      if (this.nightShift === status) this.nightShift = undefined;
    };
  }
  constructor(
    private readonly db: DatabaseSync,
    private readonly limits: () => BudgetLimits,
    private readonly lineage: {
      root(runId: string): string;
      descendants(runId: string): string[];
      runLimitUsd(rootRunId: string): number | undefined;
    },
  ) {}

  /** Trusted funded continuation may replace the inherited cap; Settings caps still apply. */
  private runLimit(runId: string, settingsLimit: unknown, excludeRunLimit = false): number | undefined {
    const limits = [
      positive(settingsLimit),
      excludeRunLimit ? undefined : positive(this.lineage.runLimitUsd(this.lineage.root(runId))),
    ].filter((limit): limit is number => limit !== undefined);
    return limits.length ? Math.min(...limits) : undefined;
  }

  private sum(sql: string, ...params: (string | number)[]): number {
    const row = this.db.prepare(sql).get(...params) as { s: number | null } | undefined;
    return row?.s ?? 0;
  }

  private runFamily(runId: string): string[] {
    const root = this.lineage.root(runId);
    const family = [...new Set(this.lineage.descendants(root))];
    if (!family.includes(root) || !family.includes(runId))
      throw new AuxError("permission_denied", "Budget run lineage is unavailable.");
    return family;
  }

  private sumFamily(family: string[]): number {
    let total = 0;
    for (let start = 0; start < family.length; start += 500) {
      const batch = family.slice(start, start + 500);
      total += this.sum(
        `SELECT COALESCE(SUM(cost_usd),0) s FROM model_calls WHERE run_id IN (${batch.map(() => "?").join(",")})`,
        ...batch,
      );
      total += this.sum(
        `SELECT COALESCE(SUM(cost_usd),0) s FROM execution_resources
         WHERE run_id IN (${batch.map(() => "?").join(",")}) AND state='settled' AND cost_estimated=0`,
        ...batch,
      );
    }
    return total;
  }

  private resourceFamilyComplete(family: string[]): boolean {
    for (let start = 0; start < family.length; start += 500) {
      const batch = family.slice(start, start + 500);
      if (
        this.db
          .prepare(
            `SELECT 1 FROM execution_resources
        WHERE run_id IN (${batch.map(() => "?").join(",")}) AND state!='cancelled'
        AND (state!='settled' OR cost_estimated=1 OR cost_usd IS NULL) LIMIT 1`,
          )
          .get(...batch)
      )
        return false;
    }
    return true;
  }

  private resourceWindowComplete(after: number): boolean {
    return !this.db
      .prepare(
        `SELECT 1 FROM execution_resources WHERE created_at>=? AND state!='cancelled'
      AND (state!='settled' OR cost_estimated=1 OR cost_usd IS NULL) LIMIT 1`,
      )
      .get(after);
  }
  private unpricedFamily(family: string[]): number {
    let total = 0;
    for (let start = 0; start < family.length; start += 500) {
      const batch = family.slice(start, start + 500);
      const row = this.db
        .prepare(
          `SELECT COUNT(*) n FROM model_calls WHERE run_id IN (${batch.map(() => "?").join(",")}) AND cost_usd IS NULL`,
        )
        .get(...batch) as { n: number };
      total += row.n;
    }
    return total;
  }
  private unpricedWindow(after: number): number {
    const row = this.db
      .prepare("SELECT COUNT(*) n FROM model_calls WHERE created_at>=? AND cost_usd IS NULL")
      .get(after) as { n: number };
    return row.n;
  }

  /** Original parent and all historical descendants are one charged scope. */
  spentRunUsd(runId: string): number {
    const family = this.runFamily(runId);
    return this.sumFamily(family);
  }

  /** Missing reported/priceable usage is unresolved, never a zero-cost bill. */
  runCostComplete(runId: string): boolean {
    const family = this.runFamily(runId);
    for (let start = 0; start < family.length; start += 500) {
      const batch = family.slice(start, start + 500);
      if (
        this.db
          .prepare(
            `SELECT 1 FROM model_calls WHERE run_id IN (${batch.map(() => "?").join(",")}) AND cost_usd IS NULL LIMIT 1`,
          )
          .get(...batch)
      )
        return false;
    }
    return this.resourceFamilyComplete(family);
  }

  /** All model-call cost across every run since local midnight. */
  spentDayUsd(now = Date.now()): number {
    return (
      this.sum("SELECT COALESCE(SUM(cost_usd),0) s FROM model_calls WHERE created_at>=?", dayStartMs(now)) +
      this.sum(
        "SELECT COALESCE(SUM(cost_usd),0) s FROM execution_resources WHERE created_at>=? AND state='settled' AND cost_estimated=0",
        dayStartMs(now),
      )
    );
  }

  /** All recorded model-call cost since the start of the local month. */
  spentMonthUsd(now = Date.now()): number {
    return (
      this.sum("SELECT COALESCE(SUM(cost_usd),0) s FROM model_calls WHERE created_at>=?", monthStartMs(now)) +
      this.sum(
        "SELECT COALESCE(SUM(cost_usd),0) s FROM execution_resources WHERE created_at>=? AND state='settled' AND cost_estimated=0",
        monthStartMs(now),
      )
    );
  }

  /** Model-call cost across every run this routine ever launched. */
  spentRoutineUsd(routineId: string): number {
    const family = this.routineFamily(routineId);
    if (!family.length) return 0;
    return this.sumFamily(family);
  }

  private routineFamily(routineId: string): string[] {
    const occurrences = this.db
      .prepare("SELECT DISTINCT run_id FROM routine_runs WHERE routine_id=? AND run_id IS NOT NULL")
      .all(routineId) as { run_id: string }[];
    return [...new Set(occurrences.flatMap(({ run_id }) => this.runFamily(run_id)))];
  }

  /** The routine that launched this run, when it is a routine occurrence. */
  routineForRun(runId: string): string | undefined {
    const row = this.db
      .prepare("SELECT routine_id FROM routine_runs WHERE run_id=? LIMIT 1")
      .get(this.lineage.root(runId)) as { routine_id: string } | undefined;
    return row?.routine_id;
  }

  status(
    scope: { runId?: string; routineId?: string; excludeRunLimit?: boolean },
    now = Date.now(),
  ): BudgetStatus[] {
    const limits = this.limits();
    const out: BudgetStatus[] = [];
    const push = (s: Omit<BudgetStatus, "remainingUsd" | "exceeded">) => {
      const remaining = s.limitUsd === undefined ? undefined : Math.max(0, s.limitUsd - s.spentUsd);
      out.push({
        ...s,
        remainingUsd: remaining,
        exceeded: s.limitUsd !== undefined && s.spentUsd >= s.limitUsd,
      });
    };
    if (scope.runId)
      push({
        scope: "run",
        scopeId: this.lineage.root(scope.runId),
        limitUsd: this.runLimit(scope.runId, limits.runUsd, scope.excludeRunLimit),
        spentUsd: this.spentRunUsd(scope.runId),
        resourceCostComplete: this.resourceFamilyComplete(this.runFamily(scope.runId)),
        unpricedModelCalls: this.unpricedFamily(this.runFamily(scope.runId)),
      });
    push({
      scope: "day",
      limitUsd: positive(limits.dayUsd),
      spentUsd: this.spentDayUsd(now),
      resourceCostComplete: this.resourceWindowComplete(dayStartMs(now)),
      unpricedModelCalls: this.unpricedWindow(dayStartMs(now)),
    });
    push({
      scope: "month",
      limitUsd: positive(limits.monthUsd),
      spentUsd: this.spentMonthUsd(now),
      resourceCostComplete: this.resourceWindowComplete(monthStartMs(now)),
      unpricedModelCalls: this.unpricedWindow(monthStartMs(now)),
    });
    if (scope.routineId)
      push({
        scope: "routine",
        scopeId: scope.routineId,
        limitUsd: positive(limits.routineUsd),
        spentUsd: this.spentRoutineUsd(scope.routineId),
        resourceCostComplete: this.resourceFamilyComplete(this.routineFamily(scope.routineId)),
        unpricedModelCalls: this.unpricedFamily(this.routineFamily(scope.routineId)),
      });
    if (scope.runId && this.nightShift) out.push(...this.nightShift(this.lineage.root(scope.runId)));
    return out;
  }

  /** Current authoritative cap identities; invoice progress does not change consent identity. */
  resourceFundingScopes(
    runId: string,
  ): { scope: BudgetStatus["scope"]; scopeId?: string; limitUsd: number }[] {
    return this.status({ runId, routineId: this.routineForRun(runId) })
      .filter((status): status is BudgetStatus & { limitUsd: number } => status.limitUsd !== undefined)
      .map(({ scope, scopeId, limitUsd }) => ({ scope, ...(scopeId ? { scopeId } : {}), limitUsd }));
  }

  /**
   * Pre-call gate: throws permission_denied naming the exhausted scope. The
   * check is advisory-point exact — the caller checks again before the next
   * step, so concurrent runs can overshoot by at most one in-flight call.
   */
  assertWithin(
    scope: { runId: string; routineId?: string; requiredUsd?: number; excludeRunLimit?: boolean },
    now = Date.now(),
  ): void {
    const requiredUsd = scope.requiredUsd ?? 0;
    if (!Number.isFinite(requiredUsd) || requiredUsd < 0)
      throw new AuxError("invalid_params", "The requested spend estimate must be nonnegative.");
    const statuses = this.status(
      {
        runId: scope.runId,
        routineId: scope.routineId ?? this.routineForRun(scope.runId),
        excludeRunLimit: scope.excludeRunLimit,
      },
      now,
    );
    const unresolved = statuses.find((s) => s.limitUsd !== undefined && s.resourceCostComplete === false);
    if (unresolved)
      throw new AuxError(
        "needs_input",
        "The original cloud resource has unresolved usage. Review its final receipt before spending within this limit.",
        { scope: unresolved.scope, scopeId: unresolved.scopeId },
      );
    const unpriced = statuses.find(
      (status) =>
        status.limitUsd !== undefined &&
        ((status.unpricedModelCalls ?? 0) > 0 ||
          (status.scope === "nightShift" && !this.runCostComplete(scope.runId))),
    );
    if (unpriced)
      throw new AuxError(
        "needs_input",
        "Original model usage has unresolved cost. Review its billing receipt before spending within this limit.",
        { scope: unpriced.scope, scopeId: unpriced.scopeId },
      );
    const over = statuses.find(
      (s) => s.exceeded || (s.limitUsd !== undefined && s.spentUsd + requiredUsd > s.limitUsd),
    );
    if (!over) return;
    const label =
      over.scope === "run"
        ? "this run"
        : over.scope === "day"
          ? "today"
          : over.scope === "month"
            ? "this month"
            : over.scope === "nightShift"
              ? `overnight scope ${over.scopeId}`
              : `routine ${over.scopeId}`;
    throw new AuxError(
      "permission_denied",
      `The user-set ${over.scope} budget of $${over.limitUsd!.toFixed(2)} cannot admit this request for ${label} ($${over.spentUsd.toFixed(2)}). Raise the budget in Settings or start a new scope.`,
      {
        scope: over.scope,
        limitUsd: over.limitUsd,
        spentUsd: over.spentUsd,
        ...(requiredUsd ? { requiredUsd } : {}),
      },
    );
  }
}
