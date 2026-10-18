import { z } from "zod";
import { AuxError } from "@aux/contracts";
import { PdfOperationSchema, PdfSourceSchema } from "@aux/contracts/document-jobs";
import type { LoopToolManifest } from "./types.js";

export function pdfToolManifest(): LoopToolManifest {
  const manifest: LoopToolManifest = {};
  const inventorySchema = z
    .object({
      offset: z.number().int().min(0).max(10_000).optional(),
      limit: z.number().int().min(1).max(50).optional(),
    })
    .strict();
  manifest.pdf_sources = {
    available: (deps) => !!deps.pdfSources,
    description:
      "List a bounded page of original PDF sources already admitted to this run. Returns exact artifact, selected attachment or task-evidence IDs and availability, including scanned PDFs without selectable text.",
    byline: "Aux selected PDFs",
    inputSchema: inventorySchema,
    execute: async (raw, ctx) => {
      if (!ctx.deps.pdfSources)
        throw new AuxError("capability_unsupported", "PDF source inventory is unavailable.");
      const input = inventorySchema.parse(raw);
      return ctx.deps.pdfSources(input);
    },
  };
  const descriptions = {
    render: "Render selected PDF pages as saved PNG artifacts.",
    text: "Extract selectable PDF text with page mappings and a saved text artifact.",
    fields: "Inspect AcroForm fields. Returns supported types and a complete saved field inventory.",
    fill: "Fill supported text and checkbox fields in a new PDF; verify saved values and rendered appearances.",
    merge: "Merge inert PDF pages in the specified order into a new PDF.",
    split: "Split inert PDF pages into new PDFs with exact page mappings.",
    rotate: "Rotate selected PDF pages in a new PDF and verify reopened rotations.",
  };
  for (const options of PdfOperationSchema.options) {
    const { operation: operationSchema, ...shape } = options.shape;
    const operation = operationSchema.value;
    const schema = z
      .object({
        ...shape,
        sources: z
          .array(PdfSourceSchema)
          .min(1)
          .max(operation === "merge" ? 8 : 1),
      })
      .strict();
    manifest[`pdf_${operation}`] = {
      available: (deps) => !!deps.processPdf,
      description: `${descriptions[operation]} Use only admitted PDF artifact IDs, selected attachment IDs or selected task-document evidence IDs. Originals are preserved. Encrypted, XFA, signed and action-dependent PDFs are refused.`,
      byline: "Aux isolated PDFium",
      inputSchema: schema,
      execute: async (raw, ctx) => {
        if (!ctx.deps.processPdf)
          throw new AuxError("capability_unsupported", "PDF processing is unavailable.");
        const { sources, ...values } = schema.parse(raw);
        return ctx.deps.processPdf({
          sources,
          options: PdfOperationSchema.parse({ ...values, operation }),
        });
      },
    };
  }
  return manifest;
}
