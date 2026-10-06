import { z } from "zod";
import { ModelCapabilitySchema } from "./model-registry.js";
import { ModelProviderSchema } from "./model-providers.js";

export const MODEL_PROVIDER_NAMES = {
  gateway: "Vercel AI Gateway",
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  openrouter: "OpenRouter",
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
/** Image generation defaults to the verified current Gateway model. */
export const IMAGE_MODELS = [{ id: "openai/gpt-image-2", label: "GPT Image 2" }] as const;
export const ImageModelSchema = z.enum([IMAGE_MODELS[0].id]);
export type ImageModel = z.infer<typeof ImageModelSchema>;

export const LocalModelServerSchema = z
  .object({
    kind: z.enum(["ollama", "lm-studio", "compatible"]),
    endpoint: z.string().url(),
    models: z.array(ModelCapabilitySchema).max(500),
  })
  .strict();
export type LocalModelServer = z.infer<typeof LocalModelServerSchema>;
