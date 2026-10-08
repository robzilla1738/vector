import { z } from "zod";
import { CloudResourceQuoteSchema } from "./cloud-execution.js";
export const PrivateCloudDescriptorSchema = z
  .object({
    revision: z.string().regex(/^[a-f0-9]{64}$/),
    teamId: z.string().min(1).max(200),
    projectId: z.string().min(1).max(200),
    quote: CloudResourceQuoteSchema,
  })
  .strict();
export type PrivateCloudDescriptor = z.infer<typeof PrivateCloudDescriptorSchema>;
export const PrivateCloudRequestSchema = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("describe") }).strict(),
  z
    .object({ operation: z.literal("credential"), revision: PrivateCloudDescriptorSchema.shape.revision })
    .strict(),
]);
export type PrivateCloudRequest = z.infer<typeof PrivateCloudRequestSchema>;
export const PrivateCloudResultSchema = z.discriminatedUnion("operation", [
  z
    .object({ operation: z.literal("describe"), connection: PrivateCloudDescriptorSchema.nullable() })
    .strict(),
  z
    .object({
      operation: z.literal("credential"),
      revision: PrivateCloudDescriptorSchema.shape.revision,
      accessToken: z
        .string()
        .min(1)
        .max(32768)
        .regex(/^[^\r\n]+$/),
    })
    .strict(),
]);
export type PrivateCloudResult = z.infer<typeof PrivateCloudResultSchema>;
