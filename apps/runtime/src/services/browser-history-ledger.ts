import { createHash } from "node:crypto";
import { AuxError, type PageTarget, type StepRecord } from "@aux/contracts";
import { z } from "zod";
import { PageClaimStore } from "../agent/durable.js";
import type { NativeBridge } from "../native.js";
import type { Repo } from "../store/repo.js";

/** Only a new native HistoryService visit with a traced source tab may mint a receipt. */
export const NativeHistoryVisitEffectSchema = z
  .object({
    visitId: z.string().regex(/^[0-9]{1,20}$/),
    pageId: z.string().min(1).max(200),
    documentEpoch: z.number().int().nonnegative(),
    url: z
      .string()
      .url()
      .max(8192)
      .refine((value) => {
        const parsed = new URL(value);
        return ["http:", "https:"].includes(parsed.protocol) && !parsed.username && !parsed.password;
      }),
    title: z.string().max(4096),
    visitedAt: z.number().int().nonnegative(),
  })
  .strict();

/** Records only a native visit tied to one exact, current agent page claim. */
export class BrowserHistoryLedger {
  private claims: PageClaimStore;
  constructor(
    private repo: Repo,
    private native?: NativeBridge,
  ) {
    this.claims = new PageClaimStore(repo.db);
  }

  recordNativeEffect(raw: unknown, pages: PageTarget[]): { recorded: boolean; stepId: string } {
    const effect = NativeHistoryVisitEffectSchema.parse(raw);
    // HistoryService visit IDs are durable within this Profile. This identity
    // deduplicates native replay even when it crosses a runtime restart.
    const stepId = `native-history-${createHash("sha256").update(effect.visitId).digest("hex")}`;
    const digest = createHash("sha256").update(JSON.stringify(effect)).digest("hex");
    const existing = this.repo.db.prepare("SELECT run_id,op FROM steps WHERE step_id=?").get(stepId) as
      { run_id: string; op: string } | undefined;
    if (existing) {
      const step = this.repo.listSteps(existing.run_id).find((item) => item.stepId === stepId);
      if (existing.op !== "history.visit" || step?.inputs?.eventDigest !== digest)
        throw new AuxError("conflict", "Native visit identity was reused with different content.");
      return { recorded: false, stepId };
    }
    if (effect.visitedAt > Date.now() + 5_000)
      throw new AuxError("conflict", "Native visit time is invalid.");
    const matches = pages.filter((page) => page.pageId === effect.pageId);
    const page = matches.length === 1 ? matches[0] : undefined;
    if (
      !page ||
      page.backend !== "aux" ||
      page.controller !== "agent" ||
      ["detached", "crashed"].includes(page.viewStatus ?? "") ||
      page.documentEpoch !== effect.documentEpoch ||
      page.url !== effect.url
    )
      throw new AuxError("permission_denied", "Native visit lacks an exact current agent page.");
    const active = this.repo.db
      .prepare("SELECT COUNT(*) AS count FROM page_claims WHERE page_id=? AND status='active'")
      .get(effect.pageId) as { count: number };
    const claim = this.claims.activeForPage(effect.pageId);
    const run = claim && this.repo.getRun(claim.runId);
    if (
      active.count !== 1 ||
      !run ||
      run.status !== "running" ||
      !run.config?.taskId ||
      !run.config.taskRevision ||
      !run.pageIds.includes(effect.pageId) ||
      claim.createdAt > effect.visitedAt ||
      (run.startedAt ?? run.createdAt) > effect.visitedAt
    )
      throw new AuxError("permission_denied", "Native visit lacks one active task run claim.");
    this.repo.saveStep({
      stepId,
      runId: run.runId,
      pageId: effect.pageId,
      op: "history.visit",
      startedAt: effect.visitedAt,
      inputs: { visitId: effect.visitId, eventDigest: digest, url: effect.url },
      outcome: {
        stepId,
        op: "history.visit",
        status: "ok",
        startedAt: effect.visitedAt,
        durationMs: 0,
        effect: "observed",
        before: { existed: false },
        after: { url: effect.url, title: effect.title, visitedAt: effect.visitedAt },
      },
    });
    return { recorded: true, stepId };
  }

  async undo(step: StepRecord): Promise<void> {
    const after = step.outcome?.after;
    if (
      step.op !== "history.visit" ||
      step.outcome?.status !== "ok" ||
      step.outcome.undoneAt ||
      step.outcome.before?.existed !== false ||
      typeof after?.url !== "string" ||
      typeof after?.title !== "string" ||
      typeof after?.visitedAt !== "number"
    )
      throw new AuxError("conflict", "This visit has no safe removal record");
    const current = this.repo.db
      .prepare("SELECT title FROM history WHERE url=? AND visited_at=?")
      .get(after.url, after.visitedAt) as { title: string } | undefined;
    if (!current || current.title !== after.title)
      throw new AuxError("conflict", "The history visit changed; review it before removal");
    if (!this.native?.historyRemove)
      throw new AuxError("backend_unavailable", "Chromium HistoryService is unavailable");
    const removed = await this.native.historyRemove(after.url, after.visitedAt, after.title);
    if (!removed.removed) throw new AuxError("conflict", "The history visit changed before removal");
  }
}
