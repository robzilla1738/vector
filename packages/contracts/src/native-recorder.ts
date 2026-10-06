import { z } from "zod";
import { DemonstrationStepSchema } from "./demonstration.js";
const documentGeneration = z
  .string()
  .regex(/^[1-9][0-9]{0,19}$/)
  .refine(
    (value) => /^[1-9][0-9]{0,19}$/.test(value) && BigInt(value) <= 18446744073709551615n,
    "Invalid native document generation",
  );
export const NativeRecorderStartSchema = z.object({ pageId: z.string().uuid() }).strict();
export const NativeRecorderReceiptSchema = z
  .object({ pageId: z.string().uuid(), recorderId: z.string().uuid() })
  .strict();
export const NativeRecorderStartedSchema = z
  .object({
    recorderId: z.string().uuid(),
    documentGeneration,
    producerSha256: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();
export const NativeRecorderDrainSchema = z.union([
  z
    .object({
      recorderId: z.string().uuid(),
      documentGeneration,
      events: z.array(DemonstrationStepSchema).max(50),
    })
    .strict(),
  z.object({ recorderId: z.string().uuid(), documentGeneration, pending: z.literal(true) }).strict(),
]);
export const NativeRecorderStoppedSchema = z.object({ stopped: z.literal(true) }).strict();
