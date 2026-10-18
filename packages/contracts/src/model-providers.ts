import { z } from "zod";
export const CustomModelProviderIdSchema = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/);
export const ModelProviderSchema = z.enum([
  "gateway",
  "openai",
  "anthropic",
  "google",
  "openrouter",
  "openai-compatible",
]);
export type ModelProvider = z.infer<typeof ModelProviderSchema>;
export const ModelCredentialSchema = z
  .object({
    provider: ModelProviderSchema,
    key: z.string().max(16384),
    connectionId: CustomModelProviderIdSchema.optional(),
  })
  .strict();
