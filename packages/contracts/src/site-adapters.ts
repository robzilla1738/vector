import { z } from "zod";
import { LinkedInReadSchema } from "./linkedin.js";

/** Browser reads require an exact live document identity and an authorized task revision. */
export const SiteReadParamsSchema = z
  .object({
    taskId: z.string().min(1),
    expectedRevision: z.number().int().positive(),
    pageId: z.string().min(1),
    expectedDocumentEpoch: z.number().int().nonnegative(),
    expectedUrl: z.string().url().max(8192),
    kind: z.enum(["google-docs", "google-sheets", "youtube", "image-search", "linkedin"]),
    view: z
      .literal("selection")
      .optional()
      .describe(
        "Google Docs only: read a real accessible DOM selection/caret; canvas-only editors require handback.",
      ),
    sheetGid: z
      .string()
      .regex(/^\d{1,20}$/)
      .optional(),
    language: z
      .string()
      .regex(/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/)
      .max(64)
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
    docsSelection: z
      .object({
        basis: z.literal("live-dom-root-utf16"),
        sessionId: z.string().min(1),
        mode: z.enum(["range", "caret"]),
        documentId: z.string().min(20).max(200),
        framePath: z.array(z.number().int().nonnegative()).max(4),
        frameUrl: z.string().url().max(8192),
        rootPath: z.array(z.number().int().nonnegative()).max(64),
        rootTextSha256: z.string().regex(/^[a-f0-9]{64}$/),
        rootTextLength: z.number().int().min(0).max(20_000),
        start: z.number().int().nonnegative().max(20_000),
        end: z.number().int().nonnegative().max(20_000),
        direction: z.enum(["forward", "backward", "none"]),
        before: z.string().max(256),
        after: z.string().max(256),
      })
      .strict()
      .optional(),
    linkedin: LinkedInReadSchema.optional(),
    transcript: z
      .object({
        videoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/),
        language: z.string().min(1).max(64),
        generated: z.boolean(),
        cues: z
          .array(
            z
              .object({
                startMs: z.number().finite().nonnegative().max(86_400_000),
                durationMs: z.number().finite().nonnegative().max(86_400_000).optional(),
                text: z.string().min(1).max(2_000_000),
              })
              .strict(),
          )
          .max(10_000),
      })
      .strict()
      .optional(),
    imageSearch: z
      .object({
        engine: z.enum(["google", "bing"]),
        query: z.string().min(1).max(500),
        parameters: z.record(z.string(), z.string().max(2048)),
        images: z
          .array(
            z
              .object({
                imageUrl: z.string().url().max(8192),
                sourceUrl: z.string().url().max(8192),
                title: z.string().max(300),
                thumbnailUrl: z.string().url().max(8192).optional(),
                width: z.number().int().positive().max(100_000).optional(),
                height: z.number().int().positive().max(100_000).optional(),
                dimensions: z.enum(["page-metadata", "unknown"]),
              })
              .strict(),
          )
          .max(50),
        truncated: z.boolean(),
      })
      .strict()
      .optional(),
  })
  .strict();
