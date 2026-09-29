import { randomUUID } from "node:crypto";
import { AuxError, type PageTarget, type StepRecord } from "@aux/contracts";
import { PageClaimStore } from "../agent/durable.js";
import type { NativeBridge } from "../native.js";
import type { Repo } from "../store/repo.js";

type Visit = { url: string; title: string; visitedAt: number };

/** Records only new native visits from a uniquely claimed agent page. */
export class BrowserHistoryLedger {
  private claims: PageClaimStore;
  constructor(private repo: Repo, private native?: NativeBridge) {
    this.claims = new PageClaimStore(repo.db);
  }

  record(visits: Visit[], pages: PageTarget[]): void {
    for (const visit of visits) {
      if (visit.visitedAt > Date.now() + 5_000) continue;
      // Native history deltas do not identify the originating tab. A human tab
      // on the same URL makes URL-only attribution ambiguous.
      const matches = pages.filter(page => page.backend === "aux" &&
        page.viewStatus !== "detached" && page.url === visit.url);
      if (matches.length !== 1) continue;
      const page = matches[0]!;
      if (page.controller !== "agent") continue;
      const active = this.repo.db.prepare("SELECT COUNT(*) AS count FROM page_claims WHERE page_id=? AND status='active'")
        .get(page.pageId) as { count: number };
      if (active.count !== 1) continue;
      const claim = this.claims.activeForPage(page.pageId);
      const run = claim && this.repo.getRun(claim.runId);
      if (!run || run.status !== "running" || !run.config?.taskId || !run.config.taskRevision ||
        claim.createdAt > visit.visitedAt || (run.startedAt ?? run.createdAt) > visit.visitedAt) continue;
      const stepId = randomUUID();
      this.repo.saveStep({ stepId, runId: run.runId, pageId: page.pageId, op: "history.visit",
        startedAt: visit.visitedAt, inputs: { url: visit.url },
        outcome: { stepId, op: "history.visit", status: "ok", startedAt: visit.visitedAt,
          durationMs: 0, effect: "observed", before: { existed: false },
          after: { url: visit.url, title: visit.title, visitedAt: visit.visitedAt } } });
    }
  }

  async undo(step: StepRecord): Promise<void> {
    const after = step.outcome?.after;
    if (step.op !== "history.visit" || step.outcome?.status !== "ok" || step.outcome.undoneAt ||
      step.outcome.before?.existed !== false || typeof after?.url !== "string" ||
      typeof after?.title !== "string" || typeof after?.visitedAt !== "number")
      throw new AuxError("conflict", "This visit has no safe removal record");
    const current = this.repo.db.prepare("SELECT title FROM history WHERE url=? AND visited_at=?")
      .get(after.url, after.visitedAt) as { title: string } | undefined;
    if (!current || current.title !== after.title)
      throw new AuxError("conflict", "The history visit changed; review it before removal");
    if (!this.native?.historyRemove)
      throw new AuxError("backend_unavailable", "Chromium HistoryService is unavailable");
    const removed = await this.native.historyRemove(after.url, after.visitedAt, after.title);
    if (!removed.removed) throw new AuxError("conflict", "The history visit changed before removal");
  }
}
