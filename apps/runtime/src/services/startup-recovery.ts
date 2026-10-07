import type { Repo } from "../store/repo.js";
import { withRunDispatchMutation } from "./overnight-authority.js";
import { SuspensionStore } from "../safety/suspensions.js";
import { ApprovalStore } from "../safety/approval.js";
import { TranscriptStore } from "../agent/loop/transcript.js";

export function activeRunIds(repo: Repo): string[] {
  return (
    repo.db
      .prepare(
        "SELECT run_id FROM runs WHERE status IN ('queued','planning','running','paused','needs_input')",
      )
      .all() as { run_id: string }[]
  ).map((row) => row.run_id);
}

export function recoverablePark(repo: Repo, runId: string) {
  const run = repo.getRun(runId),
    pending = new SuspensionStore(repo.db).pending(runId);
  if (
    run?.status !== "needs_input" ||
    run.config?.implementation !== "agent-loop" ||
    !pending ||
    pending.kind === "budget" ||
    pending.request.resourceFunding ||
    pending.request.resourceLimits ||
    pending.request.cloudSetup ||
    pending.request.modelLimits
  )
    return;
  if (new TranscriptStore(repo.db, repo.columnCipher).openPark(runId)) return pending;
}

export function retireParkedProofs(repo: Repo, runId: string): void {
  const run = repo.getRun(runId),
    pending = new SuspensionStore(repo.db).pending(runId);
  const approvals = new ApprovalStore(
    repo.db,
    undefined,
    undefined,
    undefined,
    (id) => repo.getRun(id),
    repo,
  );
  if (pending) approvals.retireTurn(pending.turnId, pending.threadId);
  else approvals.retireTurn(runId, run?.config?.chatId ?? runId);
  if (pending && ["approval", "touch-id"].includes(pending.kind)) {
    const request = {
      kind: "ask-user-question",
      instruction: "Aux restarted. Continue to refresh the action review.",
      guidance:
        "The original call is preserved. Aux will recheck current targets and permissions before asking again.",
    };
    repo.db
      .prepare(
        "UPDATE safety_suspensions SET kind='ask-user-question',approval_id=NULL,request_json=? WHERE suspension_id=? AND state='pending'",
      )
      .run(JSON.stringify(request), pending.suspensionId);
  }
}

/** Recover durable parked calls without launching effects or adopting stale browser authority. */
export async function markInterruptedRuns(repo: Repo): Promise<void> {
  const owners = repo.db.prepare("SELECT DISTINCT owner_id FROM coordinator_leases WHERE fenced=0").all() as {
    owner_id: string;
  }[];
  for (const { owner_id } of owners) {
    const pid = /^pid:(\d+):/.exec(owner_id)?.[1];
    if (!pid) continue;
    try {
      process.kill(Number(pid), 0);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ESRCH")
        repo.db.prepare("UPDATE coordinator_leases SET fenced=1 WHERE owner_id=?").run(owner_id);
    }
  }
  for (const runId of activeRunIds(repo)) {
    await withRunDispatchMutation(
      repo,
      async () => {
        const current = repo.getRun(runId);
        if (!current || !["queued", "planning", "running", "paused", "needs_input"].includes(current.status))
          return;
        if (recoverablePark(repo, runId)) {
          retireParkedProofs(repo, runId);
          return;
        }
        current.status = "interrupted";
        current.endedAt = Date.now();
        repo.saveRun(current);
      },
      runId,
    );
  }
}
