import { z } from "zod";

/**
 * One typed registry for model entries shared by the runtime, the desktop UI
 * and mocks: model ID, route/provider family, context and output limits,
 * modalities, structured-output/streaming/reasoning support, prompt caching
 * and current pricing metadata. Fields stay optional — an entry is useful
 * before every capability is verified; `source` records where the claim came
 * from ("snapshot" = bundled known-good data, "catalog" = live provider
 * discovery, "configured" = user-entered), and `status` distinguishes verified
 * from unverified snapshot data. Never treat a missing ID as invalid: catalog
 * entries remain in the catalog so new models cannot be blacklisted by an
 * out-of-date snapshot. Text pickers exclude only explicit incompatibility.
 */
export const ModelCapabilitySchema = z
  .object({
    id: z.string().min(1).max(500),
    name: z.string().optional(),
    provider: z.string().optional(),
    contextTokens: z.number().int().positive().optional(),
    maxOutputTokens: z.number().int().positive().optional(),
    modalities: z.array(z.enum(["text", "image", "audio"])).optional(),
    /** Explicit catalog support for the provider's text-generation route; absent means unknown. */
    textGeneration: z.boolean().optional(),
    /** Verified HTTP batch transcription and its catalog USD/second price. */
    transcription: z
      .object({ batch: z.literal(true), usdPerSecond: z.number().finite().nonnegative() })
      .strict()
      .optional(),
    structuredOutput: z.boolean().optional(),
    streaming: z.boolean().optional(),
    reasoning: z.enum(["none", "supported", "required"]).optional(),
    promptCaching: z.boolean().optional(),
    inputUsdPerMTok: z.number().nonnegative().optional(),
    outputUsdPerMTok: z.number().nonnegative().optional(),
    /** Transport capabilities, authored by the selected account adapter rather than inferred from API prices. */
    billingKind: z.enum(["api", "subscription"]).optional(),
    outputLimitSupported: z.boolean().optional(),
    source: z.enum(["snapshot", "catalog", "configured"]),
    status: z.enum(["verified", "unverified"]).optional(),
  })
  .strict();
export type ModelCapability = z.infer<typeof ModelCapabilitySchema>;

export const DEFAULT_UTILITY_MODEL_ID = "openai/gpt-6-luna-fast";
export const DEFAULT_IMAGE_MODEL_ID = "openai/gpt-image-2";

export const AgentModelCategorySchema = z.enum(["fast", "standard", "deep", "visual"]);
export type AgentModelCategory = z.infer<typeof AgentModelCategorySchema>;
export const AgentModelRouteSchema = z
  .object({
    modelId: z.string().min(1),
    reasoning: z.enum(["low", "medium", "high", "xhigh"]),
  })
  .strict();
export type AgentModelRoute = z.infer<typeof AgentModelRouteSchema>;
/**
 * Settings value per category: one route or an ordered candidate chain.
 * Each candidate carries its own reasoning effort; runtime failover walks
 * the chain on 429/5xx (S5 deliverable 9).
 */
export const AgentModelRouteChainSchema = z.union([
  AgentModelRouteSchema,
  z.array(AgentModelRouteSchema).min(1).max(8),
]);
export type AgentModelRouteChain = z.infer<typeof AgentModelRouteChainSchema>;
export const AgentModelRoutesSettingSchema = z.partialRecord(
  AgentModelCategorySchema,
  AgentModelRouteChainSchema,
);
export function normalizeRouteChain(value: unknown): AgentModelRoute[] {
  const parsed = AgentModelRouteChainSchema.safeParse(value);
  if (!parsed.success) return [];
  return Array.isArray(parsed.data) ? parsed.data : [parsed.data];
}

/** Verified Gateway frontier routes; explicit settings remain authoritative. */
export const DEFAULT_AGENT_MODEL_ROUTES: Readonly<Record<AgentModelCategory, AgentModelRoute>> = {
  fast: { modelId: "anthropic/claude-haiku-4.5", reasoning: "low" },
  standard: { modelId: "anthropic/claude-sonnet-5.5", reasoning: "medium" },
  deep: { modelId: "anthropic/claude-opus-5.5", reasoning: "high" },
  visual: { modelId: "anthropic/claude-sonnet-5.5", reasoning: "medium" },
};
export const DEFAULT_AGENT_MODEL_FALLBACKS: Readonly<Record<AgentModelCategory, AgentModelRoute>> = {
  fast: { modelId: "google/gemini-3.8-flash", reasoning: "low" },
  standard: { modelId: "openai/gpt-6.1-sol", reasoning: "medium" },
  deep: { modelId: "openai/gpt-6.1-sol", reasoning: "high" },
  visual: { modelId: "openai/gpt-6.1-sol", reasoning: "medium" },
};

export function agentModelRoute(
  category: AgentModelCategory,
  overrides?: Partial<Record<AgentModelCategory, AgentModelRoute>>,
): AgentModelRoute {
  return AgentModelRouteSchema.parse(overrides?.[category] ?? DEFAULT_AGENT_MODEL_ROUTES[category]);
}

/** Public Gateway /v1/models snapshot verified on 2026-10-06; live catalog wins. */
export const MODEL_REGISTRY: readonly ModelCapability[] = [
  {
    id: "anthropic/claude-haiku-4.5",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    contextTokens: 200000,
    maxOutputTokens: 64000,
    modalities: ["text", "image"],
    structuredOutput: true,
    streaming: true,
    reasoning: "supported",
    promptCaching: true,
    inputUsdPerMTok: 1,
    outputUsdPerMTok: 5,
    source: "snapshot",
    status: "verified",
  },
  {
    id: "google/gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    provider: "google",
    contextTokens: 1000000,
    maxOutputTokens: 65535,
    modalities: ["text", "image"],
    structuredOutput: true,
    streaming: true,
    reasoning: "supported",
    promptCaching: true,
    inputUsdPerMTok: 0.75,
    outputUsdPerMTok: 3.75,
    source: "snapshot",
    status: "verified",
  },
  {
    id: "anthropic/claude-sonnet-5.5",
    name: "Claude Sonnet 5.5",
    provider: "anthropic",
    contextTokens: 1000000,
    maxOutputTokens: 128000,
    modalities: ["text", "image"],
    structuredOutput: true,
    streaming: true,
    reasoning: "supported",
    promptCaching: true,
    inputUsdPerMTok: 2,
    outputUsdPerMTok: 10,
    source: "snapshot",
    status: "verified",
  },
  {
    id: "openai/gpt-6.1-sol",
    name: "GPT-6.1 Sol",
    provider: "openai",
    contextTokens: 1050000,
    maxOutputTokens: 128000,
    modalities: ["text", "image"],
    structuredOutput: true,
    streaming: true,
    reasoning: "supported",
    promptCaching: true,
    inputUsdPerMTok: 2,
    outputUsdPerMTok: 10,
    source: "snapshot",
    status: "verified",
  },
  {
    id: "anthropic/claude-opus-5.5",
    name: "Claude Opus 5.5",
    provider: "anthropic",
    contextTokens: 1000000,
    maxOutputTokens: 128000,
    modalities: ["text", "image"],
    structuredOutput: true,
    streaming: true,
    reasoning: "supported",
    promptCaching: true,
    inputUsdPerMTok: 4,
    outputUsdPerMTok: 20,
    source: "snapshot",
    status: "verified",
  },
  {
    id: "anthropic/claude-fable-5.1",
    name: "Claude Fable 5.1",
    provider: "anthropic",
    contextTokens: 1000000,
    maxOutputTokens: 128000,
    modalities: ["text", "image"],
    structuredOutput: true,
    streaming: true,
    reasoning: "supported",
    promptCaching: true,
    inputUsdPerMTok: 10,
    outputUsdPerMTok: 50,
    source: "snapshot",
    status: "verified",
  },
  {
    id: "openai/gpt-6-luna-fast",
    name: "GPT-6 Luna (Fast)",
    provider: "openai",
    contextTokens: 1050000,
    maxOutputTokens: 128000,
    modalities: ["text", "image"],
    structuredOutput: true,
    streaming: true,
    reasoning: "supported",
    promptCaching: true,
    inputUsdPerMTok: 0.2,
    outputUsdPerMTok: 1,
    source: "snapshot",
    status: "verified",
  },
  {
    id: "openai/gpt-image-2",
    name: "GPT Image 2",
    provider: "openai",
    textGeneration: false,
    modalities: ["text"],
    structuredOutput: false,
    streaming: false,
    reasoning: "none",
    promptCaching: true,
    inputUsdPerMTok: 5,
    outputUsdPerMTok: 30,
    source: "snapshot",
    status: "verified",
  },
  {
    id: "meta/muse-spark-1.3-contributor",
    name: "Muse Spark 1.3 Contributor",
    provider: "meta",
    contextTokens: 1048576,
    maxOutputTokens: 1048576,
    modalities: ["text", "image"],
    structuredOutput: true,
    streaming: true,
    reasoning: "supported",
    promptCaching: true,
    inputUsdPerMTok: 0.1,
    outputUsdPerMTok: 0.2,
    source: "snapshot",
    status: "verified",
  },
  {
    id: "alibaba/qwen3.8-27b",
    name: "Qwen3.8 27B",
    provider: "alibaba",
    contextTokens: 1000000,
    maxOutputTokens: 131072,
    modalities: ["text", "image"],
    structuredOutput: true,
    streaming: true,
    reasoning: "supported",
    promptCaching: true,
    inputUsdPerMTok: 0.5,
    outputUsdPerMTok: 3,
    source: "snapshot",
    status: "verified",
  },
];

/** Registry entry for a model ID; undefined means "unknown", never "unsupported". */
export function modelCapabilities(
  modelId: string,
  models: readonly ModelCapability[] = MODEL_REGISTRY,
): ModelCapability | undefined {
  return models.find((m) => m.id === modelId);
}

/** Known-false only: an unknown model or one without modality data may accept images. */
export function modelAcceptsImages(modelId: string, models?: readonly ModelCapability[]): boolean {
  const modalities = modelCapabilities(modelId, models)?.modalities;
  return !modalities || modalities.includes("image");
}

/** Clamp a requested output budget to the model's registered limit. */
export function clampOutputTokens(
  modelId: string,
  requested: number,
  models?: readonly ModelCapability[],
): number {
  const limit = modelCapabilities(modelId, models)?.maxOutputTokens;
  return limit ? Math.min(requested, limit) : requested;
}

/** USD for a call from registry pricing; undefined when either rate is unknown. */
export function registryCostUsd(
  modelId: string,
  usage: { inputTokens?: number; outputTokens?: number },
  models?: readonly ModelCapability[],
): number | undefined {
  const m = modelCapabilities(modelId, models);
  if (m?.inputUsdPerMTok === undefined || m.outputUsdPerMTok === undefined) return undefined;
  return (
    ((usage.inputTokens ?? 0) * m.inputUsdPerMTok + (usage.outputTokens ?? 0) * m.outputUsdPerMTok) /
    1_000_000
  );
}

/**
 * Merge capability lists left-to-right: later lists win per-ID metadata and
 * re-tag the entry with their own `source`. IDs never drop out — a catalog or
 * configured model the snapshot does not know remains in the catalog.
 */
export function mergeModelCapabilities(...lists: readonly (readonly ModelCapability[])[]): ModelCapability[] {
  const merged = new Map<string, ModelCapability>();
  for (const list of lists) {
    for (const entry of list) {
      const previous = merged.get(entry.id);
      merged.set(entry.id, previous ? { ...previous, ...entry } : { ...entry });
    }
  }
  return [...merged.values()];
}

/** Unknown capabilities remain eligible; model names never determine compatibility. */
export function isTextModelCandidate(model: Pick<ModelCapability, "textGeneration">): boolean {
  return model.textGeneration !== false;
}

/** Lightweight text-model choices; the full catalog retains incompatible entries. */
export function modelPickerEntries(models: readonly ModelCapability[]): { id: string; name?: string }[] {
  return models
    .filter(isTextModelCandidate)
    .map((m) => (m.name === undefined ? { id: m.id } : { id: m.id, name: m.name }));
}
