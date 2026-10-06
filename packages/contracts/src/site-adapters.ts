import { z } from "zod";

/** Browser reads require an exact live document identity and an authorized task revision. */
export const SiteReadParamsSchema = z
  .object({
    taskId: z.string().min(1),
    expectedRevision: z.number().int().positive(),
    pageId: z.string().min(1),
    expectedDocumentEpoch: z.number().int().nonnegative(),
    expectedUrl: z.string().url().max(8192),
    kind: z.enum(["google-docs", "google-sheets", "youtube"]),
    sheetGid: z
      .string()
      .regex(/^\d{1,20}$/)
      .optional(),
  })
  .strict();
export const SiteReadResultSchema = z
  .object({
    pageId: z.string(),
    url: z.string().url(),
    documentEpoch: z.number().int().nonnegative(),
    capturedAt: z.number().int().nonnegative(),
    kind: SiteReadParamsSchema.shape.kind,
    sourceUrl: z.string().url(),
    mediaType: z.enum(["text/plain", "text/csv"]),
    text: z.string().max(2_000_000),
  })
  .strict();

/** Reserved for the native PDFium renderer; absent from callable surfaces until implemented. */
export const PDF_TEXT_CAPABILITY = "pdfium";
export const PdfTextRequestSchema = z
  .object({
    taskId: z.string().min(1),
    expectedRevision: z.number().int().positive(),
    pageId: z.string().min(1),
    expectedDocumentEpoch: z.number().int().nonnegative(),
    expectedUrl: z.string().url().max(8192),
    maxPages: z.number().int().positive().max(500).optional(),
  })
  .strict();
export const PdfTextResultSchema = z
  .object({
    pageId: z.string(),
    url: z.string().url(),
    documentEpoch: z.number().int().nonnegative(),
    capturedAt: z.number().int().nonnegative(),
    pageCount: z.number().int().nonnegative(),
    text: z.string().max(2_000_000),
    truncated: z.boolean(),
    source: z.literal("pdfium"),
  })
  .strict();
export type PdfTextRequest = z.infer<typeof PdfTextRequestSchema>;
export type PdfTextResult = z.infer<typeof PdfTextResultSchema>;
export interface PdfTextPort {
  pdfText(request: PdfTextRequest): Promise<PdfTextResult>;
}
