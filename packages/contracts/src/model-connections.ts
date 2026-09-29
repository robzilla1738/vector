import { z } from "zod";
import { ModelProviderSchema } from "./model-providers.js";

export const MODEL_PROVIDER_NAMES = {
  gateway: "Vercel AI Gateway",
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  "openai-compatible": "OpenAI-compatible",
} as const;
export const ModelConnectionChangeSchema = z
  .object({ provider: ModelProviderSchema, enabled: z.boolean() })
  .strict();
export const ModelConnectionStatusSchema = z
  .object({
    provider: ModelProviderSchema,
    selected: z.boolean(),
    enabled: z.boolean(),
    credentialSource: z.enum(["saved", "environment", "none"]),
    credentialUnavailable: z.boolean(),
    localEndpoint: z.boolean(),
  })
  .strict();
export type ModelConnectionStatus = z.infer<typeof ModelConnectionStatusSchema>;
/** Deliberately bounded; adding a model requires review of its SDK support and one-image reservation. */
export const IMAGE_MODELS = [
  { id: "google/imagen-4.0-fast-generate-001", label: "Imagen 4 Fast" },
  { id: "google/imagen-4.0-generate-001", label: "Imagen 4" },
  { id: "google/imagen-4.0-ultra-generate-001", label: "Imagen 4 Ultra" },
] as const;
export const ImageModelSchema = z.enum([IMAGE_MODELS[0].id, IMAGE_MODELS[1].id, IMAGE_MODELS[2].id]);
export type ImageModel = z.infer<typeof ImageModelSchema>;
