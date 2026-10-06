import { z } from "zod";
export const ModelProviderSchema = z.enum(["gateway", "openai", "anthropic", "google", "openai-compatible"]);
export type ModelProvider = z.infer<typeof ModelProviderSchema>;
export const ModelCredentialSchema = z
  .object({ provider: ModelProviderSchema, key: z.string().max(16384) })
  .strict();
