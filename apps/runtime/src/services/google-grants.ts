import { randomUUID } from "node:crypto";
import { AuxError } from "@aux/contracts";
import { GoogleTaskGrantSchema, type GoogleTaskGrant, type GoogleOperation } from "@aux/contracts/google";
import type { Repo } from "../store/repo.js";
import type { GoogleAccountService } from "./google-accounts.js";

/** A new explicit authority. Calendar grants never enter this operation model. */
export class GoogleGrantService {
  private retired = new Set<(grantId: string) => void>();
  onRetire(callback: (grantId: string) => void): () => void {
    this.retired.add(callback);
    return () => this.retired.delete(callback);
  }
  constructor(
    private repo: Repo,
    private accounts: GoogleAccountService,
  ) {}
  private decode(row: {
    grant_id: string;
    task_id: string;
    task_revision: number;
    connection_id: string;
    body: string;
  }): GoogleTaskGrant {
    const grant = GoogleTaskGrantSchema.parse(
      JSON.parse(this.repo.revealRecordField("google_task_grants", [row.grant_id], "body", row.body)),
    );
    if (
      grant.grantId !== row.grant_id ||
      grant.taskId !== row.task_id ||
      grant.taskRevision !== row.task_revision ||
      grant.connectionId !== row.connection_id
    )
      throw new AuxError("permission_denied", "The protected Google grant indexes changed.");
    return grant;
  }
  list(taskId: string): GoogleTaskGrant[] {
    const rows = this.repo.db
      .prepare(
        "SELECT * FROM google_task_grants WHERE task_id=? AND revoked_at IS NULL ORDER BY created_at,grant_id",
      )
      .all(taskId) as Parameters<GoogleGrantService["decode"]>[0][];
    return rows.map((row) => this.decode(row));
  }
  create(input: Omit<GoogleTaskGrant, "grantId" | "createdAt">): GoogleTaskGrant {
    const grant = GoogleTaskGrantSchema.parse({ ...input, grantId: randomUUID(), createdAt: Date.now() });
    return this.repo.transaction(() => {
      this.checkTask(grant);
      if (this.list(grant.taskId).length >= 100)
        throw new AuxError("invalid_params", "Revoke unused Google task grants before adding more.");
      const account = this.accounts.account(grant.connectionId);
      if (
        account.state !== "active" ||
        account.revision !== grant.accountRevision ||
        grant.operations.some((operation) => !account.operations.includes(operation))
      )
        throw new AuxError("permission_denied", "Choose operations available on the current Google account.");
      this.repo.db
        .prepare(
          "INSERT INTO google_task_grants(grant_id,task_id,task_revision,connection_id,body,created_at) VALUES(?,?,?,?,?,?)",
        )
        .run(
          grant.grantId,
          grant.taskId,
          grant.taskRevision,
          grant.connectionId,
          this.repo.protectRecordField("google_task_grants", [grant.grantId], "body", JSON.stringify(grant)),
          grant.createdAt,
        );
      return grant;
    });
  }
  require(input: {
    grantId: string;
    taskId: string;
    taskRevision: number;
    workspaceId: string;
    connectionId: string;
    accountRevision: string;
    operation: GoogleOperation;
  }): GoogleTaskGrant {
    const grant = this.list(input.taskId).find((item) => item.grantId === input.grantId);
    if (
      !grant ||
      grant.taskRevision !== input.taskRevision ||
      grant.workspaceId !== input.workspaceId ||
      grant.connectionId !== input.connectionId ||
      grant.accountRevision !== input.accountRevision ||
      !grant.operations.includes(input.operation)
    )
      throw new AuxError(
        "permission_denied",
        "This task revision has no exact Google account and operation grant.",
      );
    this.checkTask(grant);
    const account = this.accounts.account(grant.connectionId);
    if (
      account.state !== "active" ||
      account.revision !== grant.accountRevision ||
      !account.operations.includes(input.operation)
    )
      throw new AuxError("permission_denied", "The original Google account or scopes retired.");
    return grant;
  }
  private checkTask(grant: GoogleTaskGrant): void {
    const task = this.repo.db
      .prepare("SELECT workspace_id,revision,state FROM tasks WHERE task_id=?")
      .get(grant.taskId) as { workspace_id: string; revision: number; state: string } | undefined;
    const workspace = this.repo.getWorkspace(grant.workspaceId);
    if (
      !task ||
      !workspace ||
      task.workspace_id !== grant.workspaceId ||
      task.revision !== grant.taskRevision ||
      task.state !== "open"
    )
      throw new AuxError("permission_denied", "The Google grant's original task or Space retired.");
  }
  revoke(taskId: string, grantId: string): void {
    const changed = this.repo.db
      .prepare(
        "UPDATE google_task_grants SET revoked_at=? WHERE grant_id=? AND task_id=? AND revoked_at IS NULL",
      )
      .run(Date.now(), grantId, taskId);
    if (!changed.changes) throw new AuxError("not_found", "Google task grant is unavailable.");
    for (const retire of this.retired) retire(grantId);
  }
}
