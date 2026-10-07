import { z } from "zod";

/** Internal on-device route identity; it is not a remote provider model ID. */
export const FOUNDATION_MODEL_ID = "aux.apple.foundation-models";
const identity = { token: z.string().uuid(), requestId: z.string().uuid() };
const taskId = z.string().min(1).max(160);
const handle = { ...identity, taskId };
const text = (maximum: number) =>
  z
    .string()
    .refine(
      (value) => new TextEncoder().encode(value).length <= maximum,
      "Text exceeds the native byte bound.",
    );
export const NativeFoundationStatusParams = z.object({ token: identity.token }).strict();
export const NativeFoundationStatusSchema = z
  .object({
    availability: z.enum([
      "available",
      "os_unsupported",
      "device_not_eligible",
      "intelligence_disabled",
      "model_not_ready",
      "unavailable",
    ]),
  })
  .strict();
export const NativeFoundationStartParams = z.union([
  z.object({ ...identity, prepare: z.literal(true) }).strict(),
  z
    .object({
      ...handle,
      instructions: text(16_384),
      prompt: text(32_768).refine((value) => value.length > 0),
      maxResponseTokens: z.number().int().min(1).max(1_024),
    })
    .strict(),
]);
export const NativeFoundationReadParams = z.object(handle).strict();
export const NativeFoundationCancelParams = z.union([
  z.object({ ...identity, prepare: z.literal(true) }).strict(),
  z.object({ ...handle, reconcile: z.literal(true).optional() }).strict(),
]);
export const NativeFoundationReceiptSchema = z
  .object({
    requestId: identity.requestId,
    taskId,
    state: z.enum(["prepared", "started", "cancelled"]),
    joined: z.boolean(),
  })
  .strict();
export const NativeFoundationReadSchema = z
  .object({
    requestId: identity.requestId,
    taskId,
    state: z.enum(["pending", "completed", "cancelled"]),
    joined: z.boolean(),
    text: text(65_536).optional(),
    error: z.enum(["cancelled", "backend_unavailable", "result_too_large"]).optional(),
  })
  .strict();
export type NativeFoundationStart = z.infer<typeof NativeFoundationStartParams>;
export type NativeFoundationCancel = z.infer<typeof NativeFoundationCancelParams>;
