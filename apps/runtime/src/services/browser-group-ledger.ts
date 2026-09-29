import { createHash } from "node:crypto";
import { AuxError } from "@aux/contracts";
import { BrowserGroupNativeEffectSchema } from "@aux/contracts/browser-group-receipt";
import { PageClaimStore } from "../agent/durable.js";
import type { Repo } from "../store/repo.js";

/** Accept only native group effects whose every member belongs to one live task run. */
export class BrowserGroupLedger {
  constructor(private repo: Repo) {}

  recordNativeEffect(raw: unknown): { recorded: boolean; stepId: string } {
    const effect = BrowserGroupNativeEffectSchema.parse(raw);
    const digest = createHash("sha256").update(JSON.stringify(effect)).digest("hex");
    const existing = this.repo.db.prepare("SELECT run_id,op FROM steps WHERE step_id=?")
      .get(effect.mutationId) as { run_id: string; op: string } | undefined;
    if (existing) {
      const step = this.repo.listSteps(existing.run_id).find(item => item.stepId === effect.mutationId);
      if (existing.op !== "group.change" || step?.inputs?.eventDigest !== digest)
        throw new AuxError("conflict", "The native group mutation identity was reused with different content.");
      return { recorded: false, stepId: effect.mutationId };
    }
    if (effect.observedAt > Date.now() + 5_000)
      throw new AuxError("conflict", "The native group event time is invalid.");
    const claims = new PageClaimStore(this.repo.db);
    let runId: string | undefined;
    for (const pageId of effect.pageIds) {
      const active = this.repo.db.prepare("SELECT COUNT(*) AS count FROM page_claims WHERE page_id=? AND status='active'")
        .get(pageId) as { count: number };
      const claim = claims.activeForPage(pageId);
      if (active.count !== 1 || !claim || claim.createdAt > effect.observedAt ||
        (runId && claim.runId !== runId))
        throw new AuxError("permission_denied", "Group change lacks one exact agent run claim for every tab.");
      runId = claim.runId;
    }
    const run = runId && this.repo.getRun(runId);
    if (!run || run.status !== "running" || !run.config?.taskId || !run.config.taskRevision ||
      (run.startedAt ?? run.createdAt) > effect.observedAt ||
      effect.pageIds.some(pageId => !run.pageIds.includes(pageId)))
      throw new AuxError("permission_denied", "Group change is not attributable to a running task.");
    this.repo.saveStep({ stepId: effect.mutationId, runId: run.runId, pageId: effect.pageIds[0],
      op: "group.change", startedAt: effect.observedAt,
      inputs: { mutationId: effect.mutationId, eventDigest: digest, groupId: effect.groupId },
      outcome: { stepId: effect.mutationId, op: "group.change", status: "ok",
        startedAt: effect.observedAt, durationMs: 0, effect: "observed",
        before: effect.before, after: effect.after } });
    return { recorded: true, stepId: effect.mutationId };
  }
}
