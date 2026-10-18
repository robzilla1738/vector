import { z } from "zod";
import { AgentModelRoutesSettingSchema, ModelCapabilitySchema } from "./model-registry.js";
import { CustomModelProviderIdSchema } from "./model-providers.js";

export const CustomModelApiSchema = z.enum([
  "openai-completions",
  "openai-responses",
  "anthropic-messages",
  "google-generative-ai",
]);
export const CustomModelProviderSchema = z
  .object({
    id: CustomModelProviderIdSchema,
    name: z.string().trim().min(1).max(200),
    api: CustomModelApiSchema,
    baseUrl: z.string().url().max(2048),
    authHeader: z.boolean().default(true),
    enabled: z.boolean().default(true),
    models: z
      .array(
        ModelCapabilitySchema.extend({
          source: z.literal("configured"),
          status: z.literal("unverified").optional(),
        }),
      )
      .min(1)
      .max(500),
    plannerModel: z.string().min(1).max(500).optional(),
    recoveryModel: z.string().min(1).max(500).optional(),
    visionModel: z.string().min(1).max(500).optional(),
    agentModelRoutes: AgentModelRoutesSettingSchema.optional(),
  })
  .strict()
  .refine((provider) => new Set(provider.models.map((model) => model.id)).size === provider.models.length, {
    message: "Each model needs a unique id within its provider.",
    path: ["models"],
  });
export type CustomModelProvider = z.infer<typeof CustomModelProviderSchema>;

const ImportedModelSchema = z
  .object({
    id: z.string().min(1).max(500),
    name: z.string().min(1).max(200).optional(),
    reasoning: z.boolean().optional(),
    contextWindow: z.number().int().positive().optional(),
    maxTokens: z.number().int().positive().optional(),
    input: z
      .array(z.enum(["text", "image", "audio"]))
      .min(1)
      .optional(),
    cost: z
      .object({
        input: z.number().nonnegative(),
        output: z.number().nonnegative(),
        cacheRead: z.number().nonnegative().optional(),
        cacheWrite: z.number().nonnegative().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();
export const CustomModelProviderImportSchema = z
  .object({
    providers: z
      .record(
        CustomModelProviderIdSchema,
        z
          .object({
            name: z.string().trim().min(1).max(200),
            api: CustomModelApiSchema,
            baseUrl: z.string().url().max(2048),
            apiKey: z.string().max(8192).optional(),
            authHeader: z.boolean().default(true),
            enabled: z.boolean().optional(),
            models: z.array(ImportedModelSchema).min(1).max(500),
          })
          .strict(),
      )
      .refine((providers) => Object.keys(providers).length === 1, "Add one named provider at a time."),
  })
  .strict();

/** Credentials leave the imported document before any configuration is saved. */
export function parseCustomModelProviderImport(value: unknown): {
  provider: CustomModelProvider;
  apiKey?: string;
} {
  const { providers } = CustomModelProviderImportSchema.parse(value);
  const [entry] = Object.entries(providers);
  if (!entry) throw new Error("Add one named provider at a time.");
  const [id, { apiKey, models, ...definition }] = entry;
  return {
    provider: CustomModelProviderSchema.parse({
      id,
      ...definition,
      models: models.map((model) => ({
        id: model.id,
        name: model.name,
        provider: id,
        contextTokens: model.contextWindow,
        maxOutputTokens: model.maxTokens,
        modalities: model.input,
        reasoning: model.reasoning === undefined ? undefined : model.reasoning ? "supported" : "none",
        inputUsdPerMTok: model.cost?.input,
        outputUsdPerMTok: model.cost?.output,
        source: "configured",
      })),
    }),
    apiKey,
  };
}
