import { z } from "zod";
import { ModelProviderSchema } from "./model-providers.js";
import { AgentModelRoutesSettingSchema, ModelCapabilitySchema } from "./model-registry.js";
const revision = z.string().min(1).max(160);
export const PrivateProviderDescriptorSchema = z
  .object({
    revision,
    provider: ModelProviderSchema,
    authentication: z.enum(["api-key", "chatgpt", "vercel", "copilot"]),
    credentialSource: z.enum(["saved", "environment", "none"]),
    endpoint: z.string().url(),
    accountId: z.string().max(160).optional(),
    teamId: z.string().max(500).optional(),
    plannerModel: z.string().max(300),
    recoveryModel: z.string().max(300).optional(),
    visionModel: z.string().max(300).optional(),
    agentModelRoutes: AgentModelRoutesSettingSchema,
    models: ModelCapabilitySchema.array().max(1000),
    localModelsOnly: z.boolean(),
    copilotRuntimeRoot: z.string().max(4096).optional(),
  })
  .strict();
export type PrivateProviderDescriptor = z.infer<typeof PrivateProviderDescriptorSchema>;
export const PrivateProviderRequestSchema = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("describe") }).strict(),
  z.object({ operation: z.literal("credential"), revision }).strict(),
]);
export type PrivateProviderRequest = z.infer<typeof PrivateProviderRequestSchema>;
export const PrivateProviderResultSchema = z.discriminatedUnion("operation", [
  z
    .object({ operation: z.literal("describe"), connection: PrivateProviderDescriptorSchema.nullable() })
    .strict(),
  z
    .object({
      operation: z.literal("credential"),
      revision,
      accessToken: z
        .string()
        .min(1)
        .max(32768)
        .regex(/^[^\r\n]+$/),
      authorizationGeneration: z.string().uuid().optional(),
      credentialRevision: z.string().uuid().optional(),
    })
    .strict(),
]);
export type PrivateProviderResult = z.infer<typeof PrivateProviderResultSchema>;
