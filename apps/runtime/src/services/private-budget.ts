import { randomUUID } from "node:crypto";
import { AuxError } from "@aux/contracts";
import {
  PrivateBudgetRequestSchema,
  PrivateBudgetResultSchema,
  type PrivateBudgetRequest,
  type PrivateBudgetResult,
  type PrivateBudgetWindow,
} from "@aux/contracts/private-budget";
import type { Repo } from "../store/repo.js";
import type { BudgetsService } from "./budgets.js";

type Receipt = {
  lease_id: string;
  kind: "model" | "resource";
  reserved_usd: number | null;
  cost_usd: number | null;
  state: "pending" | "settled" | "unknown";
  cost_estimated: number;
};
/** The normal Profile retains only opaque financial receipts. Private source identifiers never enter this ledger. */
export class PrivateBudgetOwner {
  private readonly owners = new Map<string, string>();
  private readonly detach: () => void;
  constructor(
    private readonly repo: Repo,
    private readonly budgets: BudgetsService,
  ) {
    repo.db.exec(`CREATE TABLE IF NOT EXISTS private_spend (
      lease_id TEXT PRIMARY KEY, kind TEXT NOT NULL, created_at INTEGER NOT NULL,
      reserved_usd REAL, cost_usd REAL, cost_estimated INTEGER NOT NULL DEFAULT 1,
      state TEXT NOT NULL CHECK(state IN ('pending','settled','unknown'))
    ); UPDATE private_spend SET state='unknown' WHERE state='pending';`);
    this.detach = budgets.configurePrivateSpend((after) => {
      const row = repo.db
        .prepare(
          `SELECT COALESCE(SUM(COALESCE(cost_usd,reserved_usd)),0) cost,
        COALESCE(SUM(CASE WHEN state='unknown' OR (cost_usd IS NULL AND reserved_usd IS NULL) THEN 1 ELSE 0 END),0) unknown
        FROM private_spend WHERE created_at>=?`,
        )
        .get(after) as { cost: number; unknown: number };
      return { costUsd: row.cost, unknown: row.unknown };
    });
  }
  close(): void {
    this.owners.clear();
    this.detach();
  }
  private windows(): PrivateBudgetWindow[] {
    return this.budgets
      .status({})
      .filter(
        (window): window is typeof window & { scope: "day" | "month" } =>
          window.scope === "day" || window.scope === "month",
      );
  }
  request(sessionId: string, raw: PrivateBudgetRequest): PrivateBudgetResult {
    const request = PrivateBudgetRequestSchema.parse(raw);
    return this.repo.transaction(() => {
      if (request.operation === "status") return { windows: this.windows() };
      const old = this.repo.db
        .prepare("SELECT * FROM private_spend WHERE lease_id=?")
        .get(request.leaseId) as Receipt | undefined;
      if (old && this.owners.get(request.leaseId) !== sessionId)
        throw new AuxError("permission_denied", "The original private financial lease is unavailable.");
      if (request.operation === "reserve") {
        if (old) {
          if (
            old.state !== "pending" ||
            old.kind !== request.kind ||
            old.reserved_usd !== (request.amountUsd ?? null)
          )
            throw new AuxError("conflict", "The private financial reservation changed.");
          return { windows: this.windows() };
        }
        const windows = this.windows();
        for (const window of windows) {
          if (window.limitUsd === undefined) continue;
          const unknown =
            request.amountUsd === undefined ||
            window.resourceCostComplete === false ||
            (window.unpricedModelCalls ?? 0) > 0;
          if (unknown || window.spentUsd + request.amountUsd! > window.limitUsd)
            return {
              windows,
              refusal: {
                code: unknown ? "needs_input" : "permission_denied",
                scope: window.scope,
                message: unknown
                  ? "Original account usage has unresolved cost. Review its billing receipt before spending within this limit."
                  : "The original account's usage limit needs review in Settings before continuing.",
                limitUsd: window.limitUsd,
                spentUsd: window.spentUsd,
                requiredUsd: request.amountUsd,
              },
            };
        }
        this.repo.db
          .prepare(
            "INSERT INTO private_spend(lease_id,kind,created_at,reserved_usd,state) VALUES(?,?,?,?,'pending')",
          )
          .run(request.leaseId, request.kind, Date.now(), request.amountUsd ?? null);
        this.owners.set(request.leaseId, sessionId);
      } else {
        if (!old)
          throw new AuxError("permission_denied", "The original private financial receipt is unavailable.");
        if (request.operation === "cancel") {
          if (old.state !== "pending")
            throw new AuxError("conflict", "A completed financial lease cannot be released as unsent.");
          this.repo.db
            .prepare("UPDATE private_spend SET cost_usd=0,cost_estimated=0,state='settled' WHERE lease_id=?")
            .run(request.leaseId);
        } else {
          const state =
            request.costUsd === undefined || (old.kind === "resource" && request.costEstimated)
              ? "unknown"
              : "settled";
          if (
            old.state === "settled" &&
            (old.state !== state ||
              old.cost_usd !== (request.costUsd ?? null) ||
              !!old.cost_estimated !== request.costEstimated)
          )
            throw new AuxError("conflict", "The private financial receipt already settled differently.");
          this.repo.db
            .prepare("UPDATE private_spend SET cost_usd=?,cost_estimated=?,state=? WHERE lease_id=?")
            .run(request.costUsd ?? null, request.costEstimated ? 1 : 0, state, request.leaseId);
        }
      }
      return { windows: this.windows() };
    });
  }
}

/** Local IDs live only in the private runtime; the owner sees unrelated UUIDs and amounts. */
export class PrivateBudgetClient {
  private readonly leases = new Map<string, { id: string; kind: "model" | "resource" }>();
  private windows: PrivateBudgetWindow[] = [];
  private closed = false;
  private readonly pending = new Set<Promise<unknown>>();
  constructor(private readonly request: (request: PrivateBudgetRequest) => Promise<PrivateBudgetResult>) {}
  snapshot(): readonly PrivateBudgetWindow[] {
    return this.windows;
  }
  private call(request: PrivateBudgetRequest) {
    const work = this.request(request).then((raw) => {
      const result = PrivateBudgetResultSchema.parse(raw);
      this.windows = result.windows;
      if (result.refusal) {
        const { code, message, ...detail } = result.refusal;
        throw new AuxError(code, message, detail);
      }
      return result;
    });
    this.pending.add(work);
    void work.then(
      () => this.pending.delete(work),
      () => this.pending.delete(work),
    );
    return work;
  }
  async refresh(): Promise<void> {
    await this.call({ operation: "status" });
  }
  async reserve(localId: string, kind: "model" | "resource", amountUsd: number | undefined): Promise<void> {
    if (this.closed) throw new AuxError("cancelled", "Private financial admission retired.");
    if (this.leases.has(localId))
      throw new AuxError("conflict", "The private operation already has a financial reservation.");
    const leaseId = randomUUID();
    // Keep ownership even on uncertain transport failure; a retry must never silently free that debt.
    this.leases.set(localId, { id: leaseId, kind });
    try {
      await this.call({ operation: "reserve", leaseId, kind, amountUsd });
    } catch (error) {
      if (error instanceof AuxError && (error.code === "permission_denied" || error.code === "needs_input"))
        this.leases.delete(localId);
      throw error;
    }
    if (this.closed) {
      await this.cancel(localId);
      throw new AuxError("cancelled", "Private financial admission retired.");
    }
  }
  async settle(localId: string, receipt: { costUsd?: number; costEstimated: boolean }): Promise<void> {
    const lease = this.leases.get(localId);
    if (!lease) throw new AuxError("conflict", "The private financial receipt is unavailable.");
    await this.call({ operation: "settle", leaseId: lease.id, ...receipt });
    if (receipt.costUsd !== undefined && !(lease.kind === "resource" && receipt.costEstimated))
      this.leases.delete(localId);
  }
  async cancel(localId: string): Promise<void> {
    const lease = this.leases.get(localId);
    if (!lease) return;
    await this.call({ operation: "cancel", leaseId: lease.id });
    this.leases.delete(localId);
  }
  async close(): Promise<void> {
    this.closed = true;
    while (this.pending.size) await Promise.allSettled(this.pending);
    // Unjoined effects remain charged in the owner ledger, never guessed unsent on shutdown.
    this.leases.clear();
  }
}
