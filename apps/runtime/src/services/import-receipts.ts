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
    job.done = true;
    job.interrupted = true;
    job.updatedAt = Date.now();
    job.revision++;
    job.error =
      "Aux stopped before this import finished. Review the sources before retrying. Confirmed items remain available.";
    job.progress = job.progress.map((entry) =>
      entry.state === "running"
        ? { ...entry, state: "error", detail: "Interrupted before this category finished." }
        : entry,
    );
    job.report = { jobId: job.jobId, cancelled: job.cancelled, results: job.progress };
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
      selections: job.selections,
      startedAt: job.startedAt,
      updatedAt: job.updatedAt,
      revision: job.revision,
      // Reader/native errors can contain source paths or URLs. Persist generic
      // recovery guidance instead; never retain those raw diagnostics or data.
      error: job.error
        ? "Import stopped before all selected categories completed. Refresh the preview and review a retry."
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
