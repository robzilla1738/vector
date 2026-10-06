import { z } from "zod";
import { CredentialHandoffRequestSchema, SavedCredentialTargetSchema } from "./safety.js";

/** Native metadata only: this operation does not read or authorize a saved credential. */
export const NativeCredentialContextParamsSchema = CredentialHandoffRequestSchema.pick({
  pageId: true,
  expectedUrl: true,
});
export const NativeCredentialContextSchema = NativeCredentialContextParamsSchema.merge(
  SavedCredentialTargetSchema.shape.nativeContext,
);
export type NativeCredentialContext = z.infer<typeof NativeCredentialContextSchema>;
export const NativeCredentialAdmissionParamsSchema = z
  .object({
    target: SavedCredentialTargetSchema,
    runId: z.string().min(1).max(160),
    policyRevision: z.number().int().nonnegative(),
  })
  .strict();
export type NativeCredentialAdmissionParams = z.infer<typeof NativeCredentialAdmissionParamsSchema>;
export const NativeCredentialAdmissionSchema = z.object({ receiptId: z.string().uuid() }).strict();
/** Private native transport envelope; public credential handoff input remains selector-only. */
export const NativeCredentialFillParamsSchema = CredentialHandoffRequestSchema.extend({
  receiptId: z.string().uuid().optional(),
});
