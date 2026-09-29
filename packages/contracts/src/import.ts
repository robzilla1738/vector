import { z } from "zod";

/** browser-data import */
export const ImportCategorySchema = z.enum(["bookmarks", "history", "tabs"]);
export type ImportCategory = z.infer<typeof ImportCategorySchema>;
export const ImportSelectionSchema = z
  .object({
    sourceId: z.string().min(1).max(32),
    profileId: z.string().min(1).max(64).optional(),
    categories: z.array(ImportCategorySchema).min(1).max(3),
  })
  .strict();
export type ImportSelection = z.infer<typeof ImportSelectionSchema>;
export const ImportCategoryPreviewSchema = z.object({
  category: ImportCategorySchema,
  available: z.boolean(),
  count: z.number().int().optional(),
  bytes: z.number().optional(),
  blocker: z.string().optional(),
});
export const ImportSourcePreviewSchema = z.object({
  id: z.string(),
  label: z.string(),
  profiles: z.array(z.string()),
  categories: z.array(ImportCategoryPreviewSchema),
  profileCategories: z.array(
    z
      .object({
        profileId: z.string(),
        categories: z.array(ImportCategoryPreviewSchema),
      })
      .strict(),
  ),
});
export const ImportCategoryResultSchema = z.object({
  source: z.string().min(1).max(32),
  label: z.string().max(200),
  profileId: z.string().min(1).max(64).optional(),
  category: ImportCategorySchema,
  state: z.enum(["running", "done", "skipped", "error"]),
  imported: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
  detail: z.string().max(1000).optional(),
});
export const ImportReportSchema = z.object({
  jobId: z.string(),
  cancelled: z.boolean(),
  results: z.array(ImportCategoryResultSchema).max(36),
});
export type ImportCategoryPreview = z.infer<typeof ImportCategoryPreviewSchema>;
export type ImportSourcePreview = z.infer<typeof ImportSourcePreviewSchema>;
export type ImportCategoryResult = z.infer<typeof ImportCategoryResultSchema>;
export type ImportReport = z.infer<typeof ImportReportSchema>;

/** Receipts describe confirmed destination writes, never imported data or authority. */
export const ImportJobStatusSchema = z.object({
  jobId: z.string().min(1).max(64),
  done: z.boolean(),
  cancelled: z.boolean(),
  progress: z.array(ImportCategoryResultSchema).max(36),
  report: ImportReportSchema.optional(),
  error: z.string().max(1000).optional(),
  interrupted: z.boolean().optional(),
  selections: z.array(ImportSelectionSchema).max(12).optional(),
  startedAt: z.number().int().nonnegative().optional(),
  updatedAt: z.number().int().nonnegative().optional(),
  revision: z.number().int().nonnegative().optional(),
});
export type ImportJobStatus = z.infer<typeof ImportJobStatusSchema>;
