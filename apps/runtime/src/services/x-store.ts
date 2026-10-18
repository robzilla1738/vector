import { randomUUID } from "node:crypto";
import { z } from "zod";
import { AuxError } from "@aux/contracts";
import { XScopeSchema } from "@aux/contracts/x";
import type { Repo } from "../store/repo.js";
export const XAccountRecordSchema = z
  .object({
    connectionId: z.string().uuid(),
    userId: z.string().regex(/^[0-9]{1,19}$/),
    username: z.string().regex(/^[A-Za-z0-9_]{1,15}$/),
    label: z.string().min(1).max(200),
    epoch: z.string().uuid(),
    secretName: z.string().min(1).max(200),
    clientId: z.string().min(1).max(500),
    scopes: z.array(XScopeSchema),
    state: z.enum(["active", "needs_reauth"]),
    createdAt: z.number().int().nonnegative(),
    updatedAt: z.number().int().nonnegative(),
  })
  .strict();
export type XAccountRecord = z.infer<typeof XAccountRecordSchema>;
export const XCredentialJobSchema = z
  .object({
    jobId: z.string().uuid(),
    connectionId: z.string().uuid(),
    secretName: z.string().min(1).max(200),
    createdAt: z.number().int().nonnegative(),
  })
  .strict();
type Row = { connection_id: string; user_id_lookup: string; body: string; revoked_at: number | null };
/** Account metadata is a protected row document; credentials stay in native storage. */
export class XAccountRecords {
  constructor(private repo: Repo) {}
  private decode(row: Row): XAccountRecord {
    const record = XAccountRecordSchema.parse(
      JSON.parse(this.repo.revealRecordField("x_accounts", [row.connection_id], "body", row.body)),
    );
    if (
      record.connectionId !== row.connection_id ||
      row.user_id_lookup !== this.repo.exactRecordLookup("x_accounts", "user_id", record.userId)
    )
      throw new AuxError("permission_denied", "The protected X account identity changed.");
    return record;
  }
  all(includeRevoked = false): XAccountRecord[] {
    const rows = this.repo.db
      .prepare(
        `SELECT * FROM x_accounts${includeRevoked ? "" : " WHERE revoked_at IS NULL"} ORDER BY connection_id`,
      )
      .all() as Row[];
    return rows.map((row) => this.decode(row));
  }
  get(connectionId: string): XAccountRecord {
    const row = this.repo.db
      .prepare("SELECT * FROM x_accounts WHERE connection_id=? AND revoked_at IS NULL")
      .get(connectionId) as Row | undefined;
    if (!row) throw new AuxError("not_found", "The X account is unavailable or revoked.");
    return this.decode(row);
  }
  save(value: XAccountRecord): void {
    const record = XAccountRecordSchema.parse(value);
    this.repo.transaction(() => {
      const previous = this.all(true).find((item) => item.connectionId === record.connectionId);
      if (
        previous &&
        (previous.epoch !== record.epoch ||
          previous.state !== record.state ||
          previous.clientId !== record.clientId ||
          JSON.stringify(previous.scopes) !== JSON.stringify(record.scopes))
      )
        this.repo.db
          .prepare("UPDATE x_task_grants SET revoked_at=? WHERE connection_id=? AND revoked_at IS NULL")
          .run(Date.now(), record.connectionId);
      this.repo.db
        .prepare(
          `INSERT INTO x_accounts(connection_id,user_id_lookup,body,revoked_at) VALUES(?,?,?,NULL)
      ON CONFLICT(connection_id) DO UPDATE SET user_id_lookup=excluded.user_id_lookup,body=excluded.body,revoked_at=NULL`,
        )
        .run(
          record.connectionId,
          this.repo.exactRecordLookup("x_accounts", "user_id", record.userId),
          this.repo.protectRecordField("x_accounts", [record.connectionId], "body", JSON.stringify(record)),
        );
    });
  }
  hasCleanupDebt(): boolean {
    return !!this.repo.db
      .prepare(
        "SELECT 1 FROM x_credential_jobs UNION ALL SELECT 1 FROM x_accounts WHERE revoked_at IS NOT NULL LIMIT 1",
      )
      .get();
  }
  credentialJobs() {
    const rows = this.repo.db
      .prepare(
        "SELECT job_id,connection_id,body,created_at FROM x_credential_jobs ORDER BY created_at,job_id LIMIT 1001",
      )
      .all() as { job_id: string; connection_id: string; body: string; created_at: number }[];
    if (rows.length > 1000)
      throw new AuxError(
        "backend_unavailable",
        "X native credential retirement inventory exceeds its bounded limit.",
      );
    return rows.map((row) => {
      const job = XCredentialJobSchema.parse(
        JSON.parse(this.repo.revealRecordField("x_credential_jobs", [row.job_id], "body", row.body)),
      );
      if (
        job.jobId !== row.job_id ||
        job.connectionId !== row.connection_id ||
        job.createdAt !== row.created_at
      )
        throw new AuxError("permission_denied", "The protected X credential retirement identity changed.");
      return job;
    });
  }
  stageCredential(connectionId: string, secretName: string): string {
    if (this.credentialJobs().length >= 1000)
      throw new AuxError(
        "backend_unavailable",
        "Retire pending X native credentials before creating another account credential.",
      );
    const job = XCredentialJobSchema.parse({
      jobId: randomUUID(),
      connectionId,
      secretName,
      createdAt: Date.now(),
    });
    this.repo.db
      .prepare("INSERT INTO x_credential_jobs(job_id,connection_id,body,created_at) VALUES(?,?,?,?)")
      .run(
        job.jobId,
        job.connectionId,
        this.repo.protectRecordField("x_credential_jobs", [job.jobId], "body", JSON.stringify(job)),
        job.createdAt,
      );
    return job.jobId;
  }
  finishCredential(jobId: string): void {
    this.repo.db.prepare("DELETE FROM x_credential_jobs WHERE job_id=?").run(jobId);
  }
  retire(connectionId: string): void {
    this.repo.transaction(() => {
      const changed = this.repo.db
        .prepare("UPDATE x_accounts SET revoked_at=? WHERE connection_id=? AND revoked_at IS NULL")
        .run(Date.now(), connectionId);
      if (!changed.changes) throw new AuxError("not_found", "The X account is unavailable.");
      this.repo.db
        .prepare("UPDATE x_task_grants SET revoked_at=? WHERE connection_id=? AND revoked_at IS NULL")
        .run(Date.now(), connectionId);
    });
  }
}
