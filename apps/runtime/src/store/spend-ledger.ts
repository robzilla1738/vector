import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { resolveDataDirectory } from "@aux/contracts/installation";
import { modelCapabilities } from "@aux/contracts/model-registry";

const NANODOLLARS_PER_USD = 1_000_000_000;

function spendCap(env: NodeJS.ProcessEnv = process.env): number {
  const raw = env.AUX_PROGRAM_SPEND_CAP_USD;
  if (raw === undefined || raw === "") return Number.POSITIVE_INFINITY;
  const cap = Number(raw);
  if (!Number.isFinite(cap) || cap <= 0) throw new Error("AUX_PROGRAM_SPEND_CAP_USD must be a positive USD amount");
  return cap;
}

/** A single file shared across profiles and temporary fixture runtimes. */
export function spendLedgerPath(env: NodeJS.ProcessEnv = process.env): string {
  const override = env.AUX_SPEND_LEDGER_PATH;
  if (override) {
    if (!isAbsolute(override)) throw new Error("AUX_SPEND_LEDGER_PATH must be absolute");
    return override;
  }
  return join(resolveDataDirectory({}), "ai-spend.sqlite");
}

function nanos(usd: number): number {
  if (!Number.isFinite(usd) || usd < 0) throw new Error("AI spend must be a nonnegative finite USD amount");
  return Math.ceil(usd * NANODOLLARS_PER_USD);
}

/** Fail closed when a Gateway model has no bounded context or list prices. */
export function estimatedPromptTokens(...parts: unknown[]): number {
  return Math.max(1, Math.ceil(Buffer.byteLength(parts.map(part => typeof part === "string" ? part : JSON.stringify(part) ?? "").join("\n"), "utf8") / 3));
}

export function projectedModelCostUsd(modelId: string, promptTokens: number, maxOutputTokens: number): number {
  const model = modelCapabilities(modelId);
  if (!model?.contextTokens || model.inputUsdPerMTok === undefined || model.outputUsdPerMTok === undefined) {
    throw new Error(`AI spend projection unavailable for ${modelId}; configure a priced model before calling Gateway`);
  }
  if (!Number.isSafeInteger(promptTokens) || promptTokens <= 0) throw new Error("A positive promptTokens estimate is required");
  if (!Number.isSafeInteger(maxOutputTokens) || maxOutputTokens <= 0) throw new Error("A positive maxOutputTokens is required for a bounded Gateway call");
  return 2 * (promptTokens * model.inputUsdPerMTok + maxOutputTokens * model.outputUsdPerMTok) / 1_000_000;
}

export interface SpendSummary {
  limitUsd: number;
  committedUsd: number;
  reservedUsd: number;
  remainingUsd: number;
}

/** Transactional reservations prevent concurrent app and harness calls from oversubscribing the cap. */
export class SpendLedger {
  readonly db: DatabaseSync;
  private readonly capUsd: number;

  constructor(path = spendLedgerPath(), env: NodeJS.ProcessEnv = process.env) {
    this.capUsd = spendCap(env);
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    this.db = new DatabaseSync(path);
    this.db.exec(`PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS ai_spend(
        reservation_id TEXT PRIMARY KEY,
        source TEXT NOT NULL,
        model_id TEXT NOT NULL,
        reserved_nanos INTEGER NOT NULL CHECK(reserved_nanos >= 0),
        actual_nanos INTEGER CHECK(actual_nanos >= 0),
        cost_estimated INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        settled_at INTEGER
      );`);
  }

  summary(): SpendSummary {
    const row = this.db.prepare(`SELECT
      COALESCE(SUM(CASE WHEN settled_at IS NOT NULL THEN actual_nanos ELSE 0 END),0) AS committed,
      COALESCE(SUM(CASE WHEN settled_at IS NULL THEN reserved_nanos ELSE 0 END),0) AS reserved
      FROM ai_spend`).get() as { committed: number; reserved: number };
    return {
      limitUsd: this.capUsd,
      committedUsd: row.committed / NANODOLLARS_PER_USD,
      reservedUsd: row.reserved / NANODOLLARS_PER_USD,
      remainingUsd: Math.max(0, this.capUsd - (row.committed + row.reserved) / NANODOLLARS_PER_USD),
    };
  }

  reserve(source: string, modelId: string, projectedUsd: number): string {
    const amount = nanos(projectedUsd);
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const { remainingUsd } = this.summary();
      if (Number.isFinite(remainingUsd) && amount > nanos(remainingUsd)) {
        throw new Error(`AI Gateway $${this.capUsd} program cap reached; ${remainingUsd.toFixed(4)} USD remains, ${projectedUsd.toFixed(4)} USD projected`);
      }
      const id = randomUUID();
      this.db.prepare("INSERT INTO ai_spend(reservation_id,source,model_id,reserved_nanos,created_at) VALUES(?,?,?,?,?)")
        .run(id, source, modelId, amount, Date.now());
      this.db.exec("COMMIT");
      return id;
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  /** Unknown usage retains the full reservation, including after a failed request. */
  settle(id: string, actualUsd?: number): void {
    const amount = actualUsd === undefined ? null : nanos(actualUsd);
    this.db.prepare(`UPDATE ai_spend SET actual_nanos=COALESCE(?,reserved_nanos),
      cost_estimated=?, settled_at=? WHERE reservation_id=? AND settled_at IS NULL`)
      .run(amount, amount === null ? 1 : 0, Date.now(), id);
  }

  close(): void { this.db.close(); }
}
