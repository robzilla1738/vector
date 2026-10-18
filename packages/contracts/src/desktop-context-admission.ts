import { z } from "zod";
import { DesktopAppSchema } from "./desktop-context.js";
const hash = z.string().regex(/^[a-f0-9]{64}$/);
/** Runtime-generated immutable quote recipe. No captured text or window title is retained here. */
export const DesktopContextQuoteSchema = z
  .object({
    workspaceId: z.string().min(1).max(200),
    captureId: z.string().uuid(),
    sha256: hash,
    version: hash,
    appBundleId: DesktopAppSchema.shape.bundleId,
    expiresAt: z.number().int().nonnegative(),
    consentRevision: z.number().int().nonnegative(),
    startLine: z.number().int().min(1),
    endLine: z.number().int().min(1),
    startOffset: z.number().int().min(0).max(32768),
    endOffset: z.number().int().min(0).max(32768),
    includeSelection: z.boolean(),
    quoteSha256: hash,
  })
  .strict()
  .refine(
    (ref) => ref.endLine >= ref.startLine && ref.endOffset >= ref.startOffset,
    "An exact desktop quote requires ordered bounds.",
  );
export type DesktopContextQuote = z.infer<typeof DesktopContextQuoteSchema>;
export const DesktopContextQuotesSchema = z.array(DesktopContextQuoteSchema).max(200);
