import { z } from "zod";

/** browser-data import */
export const ImportCategorySchema = z.enum(["bookmarks", "history", "tabs", "passwords", "extensions"]);
export type ImportCategory = z.infer<typeof ImportCategorySchema>;
export const ChromeWebStoreIdSchema = z.string().regex(/^[a-p]{32}$/);
export const ImportExtensionChoiceSchema = z.union([
  z.object({ candidateId: z.uuid(), skip: z.literal(true) }).strict(),
  z.object({ candidateId: z.uuid(), chromeWebStoreId: ChromeWebStoreIdSchema }).strict(),
]);
export const ImportExtensionSelectionSchema = z
  .object({
    reviewId: z.uuid(),
    choices: z
      .array(ImportExtensionChoiceSchema)
      .max(512)
      .refine(
        (choices) => new Set(choices.map((choice) => choice.candidateId)).size === choices.length,
        "Review each extension once",
      ),
  })
  .strict();
export const ImportExtensionReviewSchema = z
  .object({
    reviewId: z.uuid(),
    candidates: z
      .array(
        z
          .object({
            candidateId: z.uuid(),
            name: z.string().min(1).max(200),
            sourceIdentity: z.string().min(1).max(512),
            kind: z.enum(["cws", "edge", "firefox", "safari", "unsupported"]),
            publisher: z.string().min(1).max(200).optional(),
            enabled: z.boolean().optional(),
            chromeWebStoreId: ChromeWebStoreIdSchema.optional(),
            detail: z.string().max(1000),
          })
          .strict(),
      )
      .max(512),
  })
  .strict();
export type ImportExtensionReview = z.infer<typeof ImportExtensionReviewSchema>;
export type ImportExtensionSelection = z.infer<typeof ImportExtensionSelectionSchema>;
export const ImportExtensionReviewParamsSchema = z
  .object({
    sourceId: z.string().min(1).max(32),
    profileId: z.string().min(1).max(64),
  })
  .strict();

export const ImportSelectionSchema = z
  .object({
    sourceId: z.string().min(1).max(32),
    profileId: z.string().min(1).max(64).optional(),
    extensionReview: ImportExtensionSelectionSchema.optional(),
    categories: z
      .array(ImportCategorySchema)
      .min(1)
      .max(5)
      .refine((values) => new Set(values).size === values.length, "Choose each category once"),
  })
  .strict()
  .refine(
    (selection) => selection.categories.includes("extensions") === !!selection.extensionReview,
    "Review extensions before importing that category",
  );
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
        kind: z.enum(["export-file", "shared-export"]).optional(),
        label: z.string().min(1).max(200).optional(),
        categories: z.array(ImportCategoryPreviewSchema),
      })
      .strict()
      .refine((group) => !!group.kind === !!group.label, "Export groups require a separate display label"),
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
  results: z.array(ImportCategoryResultSchema).max(60),
});
export type ImportCategoryPreview = z.infer<typeof ImportCategoryPreviewSchema>;
export type ImportSourcePreview = z.infer<typeof ImportSourcePreviewSchema>;
export type ImportCategoryResult = z.infer<typeof ImportCategoryResultSchema>;
export type ImportReport = z.infer<typeof ImportReportSchema>;

export const ImportOperationSchema = z
  .object({
    operationId: z.string().min(16).max(128),
    sourceId: z.string().min(1).max(32),
    profileId: z.string().min(1).max(64),
    categories: z.array(ImportCategorySchema).min(1).max(5),
    state: z.enum(["prepared", "dispatched", "joined", "unknown"]),
  })
  .strict();
export type ImportOperation = z.infer<typeof ImportOperationSchema>;
export const NativeBrowserImportDiscoverySchema = z
  .object({
    sources: z.array(ImportSourcePreviewSchema).max(128),
    snapshots: z
      .array(
        z
          .object({
            sourceId: z.string().min(1).max(32),
            profileId: z.string().min(1).max(64),
            sourceHandle: z.string().min(1).max(128),
          })
          .strict(),
      )
      .max(128),
  })
  .strict();
export const NativeBrowserImportReceiptSchema = z
  .object({
    operationId: z.string().min(16).max(128),
    unknown: z.boolean(),
    done: z.boolean().optional(),
    cancelled: z.boolean().optional(),
    progress: z.array(ImportCategoryResultSchema).max(5).optional(),
    error: z.string().max(1000).optional(),
  })
  .strict();
export type NativeBrowserImportReceipt = z.infer<typeof NativeBrowserImportReceiptSchema>;
export type NativeBrowserImportDiscovery = z.infer<typeof NativeBrowserImportDiscoverySchema>;

/** Receipts describe confirmed destination writes, never imported data or authority. */
export const ImportJobStatusSchema = z.object({
  jobId: z.string().min(1).max(64),
  done: z.boolean(),
  cancelled: z.boolean(),
  progress: z.array(ImportCategoryResultSchema).max(60),
  report: ImportReportSchema.optional(),
  error: z.string().max(1000).optional(),
  interrupted: z.boolean().optional(),
  acknowledged: z.boolean().optional(),
  nativeFailure: z.object({
    phase: z.literal("begin"),
    operationId: z.string().min(16).max(128),
    code: z.string().min(1).max(64),
    message: z.string().max(200).optional(),
  }).strict().optional(),
  nativeOperations: z.array(ImportOperationSchema).max(12).optional(),
  selections: z.array(ImportSelectionSchema).max(12).optional(),
  startedAt: z.number().int().nonnegative().optional(),
  updatedAt: z.number().int().nonnegative().optional(),
  revision: z.number().int().nonnegative().optional(),
});
export type ImportJobStatus = z.infer<typeof ImportJobStatusSchema>;

export const BrowserExportSourceSchema = z.enum([
  "chrome",
  "arc",
  "safari",
  "firefox",
  "edge",
  "brave",
  "dia",
  "comet",
  "atlas",
]);
export const BrowserExportFormatSchema = z.enum([
  "safari-archive",
  "bookmarks-html",
  "passwords-csv",
  "tabs-html",
]);
export type BrowserExportSource = z.infer<typeof BrowserExportSourceSchema>;
export type BrowserExportFormat = z.infer<typeof BrowserExportFormatSchema>;
export const NativeBrowserImportSelectionSchema = z
  .object({
    selectionId: z.string().min(16).max(128),
    unknown: z.boolean(),
    done: z.boolean().optional(),
    discovery: NativeBrowserImportDiscoverySchema.optional(),
    error: z
      .object({ code: z.string().min(1).max(64), message: z.string().max(1000) })
      .strict()
      .optional(),
  })
  .strict();
export type NativeBrowserImportSelection = z.infer<typeof NativeBrowserImportSelectionSchema>;
export const BrowserImportSelectionStatusSchema = z
  .object({
    selectionId: z.string().min(16).max(128),
    unknown: z.boolean(),
    done: z.boolean().optional(),
    sources: z.array(ImportSourcePreviewSchema).max(128).optional(),
    error: z.string().max(1000).optional(),
  })
  .strict();
