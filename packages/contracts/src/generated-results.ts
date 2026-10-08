import { z } from "zod";

const id = z.string().min(1).max(200);
const text = z
  .string()
  .max(8_000)
  .refine((value) => !value.includes("\0"), "Text cannot contain null characters.");
const cell = z.union([text, z.number().finite(), z.boolean(), z.null()]);
const row = z.array(cell).min(1).max(40);
const table = z.object({ name: text.max(80).default("Sheet 1"), rows: z.array(row).min(1).max(2_000) });
export const GeneratedResultSpecSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("csv"), table }),
  z.object({ kind: z.literal("xlsx"), sheets: z.array(table).min(1).max(12) }),
  z.object({
    kind: z.literal("docx"),
    title: text.max(200),
    paragraphs: z
      .array(text)
      .max(300)
      .describe(
        "Document body in Markdown; headings, bold, italic, lists, links, code, and tables retain their formatting in Word.",
      ),
    tables: z.array(table).max(8).default([]),
  }),
  z.object({
    kind: z.literal("pptx"),
    slides: z
      .array(
        z.object({
          title: text.max(200),
          bullets: z.array(text.max(500)).max(12),
          notes: text.max(2_000).optional(),
        }),
      )
      .min(1)
      .max(50),
  }),
  z.object({
    kind: z.literal("chart"),
    title: text.max(200),
    mark: z.enum(["bar", "line", "point"]),
    x: text.max(80),
    y: text.max(80),
    data: z
      .array(z.record(z.string().max(80), z.union([text.max(500), z.number().finite()])))
      .min(1)
      .max(2_000),
  }),
]);
export type GeneratedResultSpec = z.infer<typeof GeneratedResultSpecSchema>;
export const GenerateResultParamsSchema = z.object({
  chatId: id,
  taskId: id.optional(),
  expectedRevision: z.number().int().positive().optional(),
  sourceArtifactId: id.optional(),
  filename: z.string().trim().min(1).max(120),
  spec: GeneratedResultSpecSchema.refine(
    (value) => new TextEncoder().encode(JSON.stringify(value)).length <= 500_000,
    "A result source may use up to 500 KB.",
  ),
});
export const CompletedGeneratedFileSchema = GenerateResultParamsSchema.pick({
  filename: true,
  sourceArtifactId: true,
  spec: true,
});
export type CompletedGeneratedFile = z.infer<typeof CompletedGeneratedFileSchema>;
export const GeneratedResultSchema = z.object({
  artifactId: id,
  chatId: id,
  filename: z.string(),
  mediaType: z.string(),
  byteLength: z.number().int().nonnegative(),
  createdAt: z.number(),
  sha256: z.string().length(64),
  kind: z.enum(["csv", "xlsx", "docx", "pptx", "chart"]),
  spec: GeneratedResultSpecSchema,
  revision: z.number().int().positive(),
  rootArtifactId: id,
  parentArtifactId: id,
  sourceRunId: id,
  preview: z.object({ title: z.string(), lines: z.array(z.string()).max(24) }),
});
export type GeneratedResult = z.infer<typeof GeneratedResultSchema>;
export const GeneratedResultSummarySchema = GeneratedResultSchema.omit({ spec: true });
export type GeneratedResultSummary = z.infer<typeof GeneratedResultSummarySchema>;
