import { z } from "zod";

const identity = z
  .object({
    pageId: z.string().uuid(),
    documentId: z.string().uuid(),
    sessionId: z.string().uuid(),
    windowId: z.string().min(1).max(256),
    targetId: z.string().min(1).max(256),
    url: z.string().url().max(8192),
  })
  .strict();
export const NativePersonCaptureParamsSchema = identity;
export type NativePersonCaptureParams = z.infer<typeof identity>;
export const NativePersonCaptureReceiptSchema = identity
  .extend({
    captureId: z.string().uuid(),
    masking: z.literal("editable-all-frames"),
    pngBase64: z.string().min(1).max(8_388_608),
    width: z.number().int().positive().max(16384),
    height: z.number().int().positive().max(16384),
    pixelWidth: z.number().int().positive().max(16384),
    pixelHeight: z.number().int().positive().max(16384),
    scale: z.number().positive().max(8),
  })
  .strict();
export type NativePersonCaptureReceipt = z.infer<typeof NativePersonCaptureReceiptSchema>;
