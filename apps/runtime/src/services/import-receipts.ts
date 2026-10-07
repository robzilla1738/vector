import { ImportJobStatusSchema, ImportSelectionSchema, type ImportJobStatus } from "@aux/contracts";
import { z } from "zod";
import type { Repo } from "../store/repo.js";

const KEY = "browser-import.receipts.v1";
const LIMIT = 5;
const Receipt = ImportJobStatusSchema.extend({
  selections: z.array(ImportSelectionSchema).min(1).max(12),
  startedAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
  revision: z.number().int().nonnegative(),
});
export type ImportJob = z.infer<typeof Receipt>;

/** Profile-scoped settings KV stores only bounded choices and confirmed counts. */
export function loadImportReceipts(repo: Repo): ImportJob[] {
  const stored = repo.getSetting<unknown>(KEY);
  if (!Array.isArray(stored)) return [];
  return stored.slice(0, LIMIT).flatMap((value) => {
    const parsed = Receipt.safeParse(value);
    if (!parsed.success) return [];
    const job = parsed.data;
    if (job.done) job.report = { jobId: job.jobId, cancelled: job.cancelled, results: job.progress };
    if (job.done) return [job];
    // A restart never proves a native backend joined or reverses accepted writes.
    // Keep the saved operation identities for reduction-only native reconciliation.
    job.interrupted = true;
    for (const op of job.nativeOperations ?? [])
      if (op.state === "prepared") {
        op.state = "joined";
        job.cancelled = true;
        for (const row of job.progress)
          if (
            row.source === op.sourceId &&
            row.profileId === op.profileId &&
            op.categories.includes(row.category)
          )
            row.state = "skipped";
      }
    job.updatedAt = Date.now();
    job.revision++;
    job.error =
      "Aux stopped before native import completion was confirmed. Some accepted items may already be imported.";
    if (job.nativeOperations?.length && job.nativeOperations.every((op) => op.state === "joined")) {
      job.done = true;
      job.interrupted = false;
      job.error = undefined;
      job.report = { jobId: job.jobId, cancelled: job.cancelled, results: job.progress };
    }
    return [job];
  });
}

export function saveImportReceipts(repo: Repo, jobs: ImportJobStatus[]): void {
  repo.setSetting(
    KEY,
    jobs.slice(0, LIMIT).map((job) => ({
      jobId: job.jobId,
      done: job.done,
      cancelled: job.cancelled,
      interrupted: job.interrupted,
      acknowledged: job.acknowledged,
      nativeOperations: job.nativeOperations,
      selections: job.selections,
      startedAt: job.startedAt,
      updatedAt: job.updatedAt,
      revision: job.revision,
      // Reader/native errors can contain source paths or URLs. Persist generic
      // recovery guidance instead; never retain those raw diagnostics or data.
      error: job.error
        ? "Import completion was not confirmed. Some accepted items may already be imported; review before starting another import."
        : undefined,
      progress: job.progress.map(({ source, label, profileId, category, state, imported, skipped }) => ({
        source,
        label: label.slice(0, 200),
        profileId,
        category,
        state,
        imported,
        skipped,
        ...(state === "error"
          ? { detail: "This category did not finish. Review the source before retrying." }
          : {}),
      })),
    })),
  );
}
