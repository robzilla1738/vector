import { createHash, randomUUID } from "node:crypto";
import { AuxError } from "@aux/contracts";
import type { Repo } from "../store/repo.js";

export interface ResourceAdmission {
  runId: string;
  originalDigest: string;
  quoteDigest: string;
  /** Exact reviewed public resource envelope, account rate provenance and billing units. */
  quoteJson: string;
  estimatedCostUsd?: number;
}
export interface FinalResourceReceipt {
  resourceId: string;
  runId: string;
  sandboxId: string;
  sessionId: string;
  stoppedAt: number;
  /** Final SDK scalar meters only; never executable code, URLs or credentials. */
  usageJson?: string;
  costUsd?: number;
  costEstimated: boolean;
}
function finite(value: number) {
  return Number.isFinite(value) && value >= 0;
}
function deny(message: string): never {
  throw new AuxError("permission_denied", message);
}
const digest = (value: string) => createHash("sha256").update(value).digest("hex");

/** Admission and common funding reservation must be enclosed in the caller's same DB transaction. */
export class ExecutionResourceLedger {
  constructor(
    private repo: Repo,
    private now = Date.now,
  ) {}

  reserve(input: ResourceAdmission): string {
    if (
      !this.repo.getRun(input.runId) ||
      !/^[a-f0-9]{64}$/.test(input.originalDigest) ||
      !/^[a-f0-9]{64}$/.test(input.quoteDigest) ||
      digest(input.quoteJson) !== input.quoteDigest ||
      Buffer.byteLength(input.quoteJson) > 16384 ||
      (input.estimatedCostUsd !== undefined && !finite(input.estimatedCostUsd))
    )
      deny("The original cloud resource admission is invalid.");
    const resourceId = randomUUID(),
      now = this.now();
    this.repo.db
      .prepare(
        `INSERT INTO execution_resources
      (resource_id,run_id,provider,state,original_digest,quote_digest,quote_json,reservation_usd,created_at,updated_at)
      VALUES(?,?,'vercel-sandbox','reserved',?,?,?,?,?,?)`,
      )
      .run(
        resourceId,
        input.runId,
        input.originalDigest,
        input.quoteDigest,
        input.quoteJson,
        input.estimatedCostUsd ?? null,
        now,
        now,
      );
    return resourceId;
  }

  /** Perform immediately before SDK create. Unknown network outcomes must remain running. */
  begin(resourceId: string, runId: string, originalDigest: string, quoteDigest: string) {
    const now = this.now();
    const changed = this.repo.db
      .prepare(
        `UPDATE execution_resources
      SET state='running',started_at=?,updated_at=?
      WHERE resource_id=? AND run_id=? AND original_digest=? AND quote_digest=? AND state='reserved'`,
      )
      .run(now, now, resourceId, runId, originalDigest, quoteDigest);
    if (changed.changes !== 1) deny("The original cloud admission changed before dispatch.");
  }

  /** SDK create identity is attached for accounting even if the original run retired in flight. */
  attach(resourceId: string, runId: string, sandboxId: string, sessionId: string) {
    if (!sandboxId || !sessionId || sandboxId.length > 200 || sessionId.length > 200)
      deny("The provider returned an invalid cloud resource identity.");
    const changed = this.repo.db
      .prepare(
        `UPDATE execution_resources SET sandbox_id=?,session_id=?,updated_at=?
      WHERE resource_id=? AND run_id=? AND state='running'
      AND (sandbox_id IS NULL OR sandbox_id=?) AND (session_id IS NULL OR session_id=?)`,
      )
      .run(sandboxId, sessionId, this.now(), resourceId, runId, sandboxId, sessionId);
    if (changed.changes !== 1) deny("The cloud response does not belong to the original resource.");
  }

  cancelUnsent(resourceId: string, runId: string) {
    const changed = this.repo.db
      .prepare(
        `UPDATE execution_resources SET state='cancelled',updated_at=?
      WHERE resource_id=? AND run_id=? AND state='reserved' AND started_at IS NULL AND sandbox_id IS NULL`,
      )
      .run(this.now(), resourceId, runId);
    if (changed.changes !== 1)
      deny("This cloud resource may already have started; its funding remains held.");
  }

  /** Caller must have verified exact SDK session stopped ACK and contractual rate/meter basis. */
  settle(receipt: FinalResourceReceipt) {
    if (
      !finite(receipt.stoppedAt) ||
      (receipt.costUsd !== undefined && !finite(receipt.costUsd)) ||
      (!receipt.costEstimated && receipt.costUsd === undefined) ||
      (receipt.usageJson !== undefined && Buffer.byteLength(receipt.usageJson) > 16384)
    )
      deny("The final cloud receipt cannot establish actual resource usage.");
    const changed = this.repo.db
      .prepare(
        `UPDATE execution_resources
      SET state='settled',stop_ack=1,usage_json=?,cost_usd=?,cost_estimated=?,ended_at=?,updated_at=?
      WHERE resource_id=? AND run_id=? AND state='running' AND sandbox_id=? AND session_id=?
      AND started_at IS NOT NULL`,
      )
      .run(
        receipt.usageJson ?? null,
        receipt.costUsd ?? null,
        receipt.costEstimated ? 1 : 0,
        receipt.stoppedAt,
        this.now(),
        receipt.resourceId,
        receipt.runId,
        receipt.sandboxId,
        receipt.sessionId,
      );
    if (changed.changes !== 1)
      deny("The stop receipt does not belong to the original active cloud resource.");
  }
}
