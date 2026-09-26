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
 * entries pass through unfiltered so new models cannot be blacklisted by an
 * out-of-date snapshot.
 */
export const ModelCapabilitySchema = z
  .object({
    id: z.string().min(1).max(500),
    name: z.string().optional(),
    provider: z.string().optional(),
    contextTokens: z.number().int().positive().optional(),
    maxOutputTokens: z.number().int().positive().optional(),
    modalities: z.array(z.enum(["text", "image", "audio"])).optional(),
    structuredOutput: z.boolean().optional(),
    streaming: z.boolean().optional(),
    reasoning: z.enum(["none", "supported", "required"]).optional(),
    promptCaching: z.boolean().optional(),
    inputUsdPerMTok: z.number().nonnegative().optional(),
    outputUsdPerMTok: z.number().nonnegative().optional(),
    source: z.enum(["snapshot", "catalog", "configured"]),
    status: z.enum(["verified", "unverified"]).optional(),
  })
  .strict();
export type ModelCapability = z.infer<typeof ModelCapabilitySchema>;

export const DEFAULT_PLANNER_MODEL_ID = "meta/muse-spark-1.3-contributor";

export const AgentModelCategorySchema = z.enum(["fast", "standard", "deep", "visual"]);
export type AgentModelCategory = z.infer<typeof AgentModelCategorySchema>;
export const AgentModelRouteSchema = z.object({
  modelId: z.string().min(1),
  reasoning: z.enum(["low", "medium", "xhigh"]),
}).strict();
export type AgentModelRoute = z.infer<typeof AgentModelRouteSchema>;
/**
 * Settings value per category: one route or an ordered candidate chain.
 * Each candidate carries its own reasoning effort; runtime failover walks
 * the chain on 429/5xx (S5 deliverable 9).
 */
export const AgentModelRouteChainSchema = z.union([AgentModelRouteSchema, z.array(AgentModelRouteSchema).min(1).max(8)]);
export type AgentModelRouteChain = z.infer<typeof AgentModelRouteChainSchema>;
export const AgentModelRoutesSettingSchema = z.record(AgentModelCategorySchema, AgentModelRouteChainSchema);
export function normalizeRouteChain(value: unknown): AgentModelRoute[] {
  const parsed = AgentModelRouteChainSchema.safeParse(value);
  if (!parsed.success) return [];
  return Array.isArray(parsed.data) ? parsed.data : [parsed.data];
}

/** One Contributor model for every role; only effort changes by default. */
export const DEFAULT_AGENT_MODEL_ROUTES: Readonly<Record<AgentModelCategory, AgentModelRoute>> = {
  fast: { modelId: DEFAULT_PLANNER_MODEL_ID, reasoning: "low" },
  standard: { modelId: DEFAULT_PLANNER_MODEL_ID, reasoning: "medium" },
  deep: { modelId: DEFAULT_PLANNER_MODEL_ID, reasoning: "xhigh" },
  visual: { modelId: DEFAULT_PLANNER_MODEL_ID, reasoning: "medium" },
};

export function agentModelRoute(category: AgentModelCategory, overrides?: Partial<Record<AgentModelCategory, AgentModelRoute>>): AgentModelRoute {
  return AgentModelRouteSchema.parse(overrides?.[category] ?? DEFAULT_AGENT_MODEL_ROUTES[category]);
}

/**
 * Known-good offline snapshot. Only entries verified against the live Gateway
 * catalog (2026-09-22 review) carry status "verified"; both were present in
 * the live catalog and must not be blacklisted as invalid identifiers.
 */
export const MODEL_REGISTRY: readonly ModelCapability[] = [
  {
    id: DEFAULT_PLANNER_MODEL_ID,
    name: "Meta Muse Spark 1.3 Contributor",
    provider: "meta",
    contextTokens: 1_048_576,
    modalities: ["text", "image"],
    reasoning: "supported",
    inputUsdPerMTok: 0.10,
    outputUsdPerMTok: 0.20,
    source: "snapshot",
    status: "verified",
  },
  {
    id: "alibaba/qwen3.8-27b",
    name: "Qwen 3.8 27B",
    provider: "alibaba",
    modalities: ["text"],
    structuredOutput: true,
    streaming: true,
    reasoning: "supported",
    source: "snapshot",
    status: "verified",
  },
  {
    id: "openai/gpt-5.6-luna-fast",
    name: "GPT 5.6 Luna Fast",
    provider: "openai",
    modalities: ["text", "image"],
    structuredOutput: true,
    streaming: true,
    reasoning: "none",
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
export function clampOutputTokens(modelId: string, requested: number, models?: readonly ModelCapability[]): number {
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
  return ((usage.inputTokens ?? 0) * m.inputUsdPerMTok + (usage.outputTokens ?? 0) * m.outputUsdPerMTok) / 1_000_000;
}

/**
 * Merge capability lists left-to-right: later lists win per-ID metadata and
 * re-tag the entry with their own `source`. IDs never drop out — a catalog or
 * configured model the snapshot does not know stays selectable.
 */
export function mergeModelCapabilities(
  ...lists: readonly (readonly ModelCapability[])[]
): ModelCapability[] {
  const merged = new Map<string, ModelCapability>();
  for (const list of lists) {
    for (const entry of list) {
      const previous = merged.get(entry.id);
      merged.set(entry.id, previous ? { ...previous, ...entry } : { ...entry });
    }
  }
  return [...merged.values()];
}

/** Lightweight `{id, name}` projection for pickers and legacy callers. */
export function modelPickerEntries(
  models: readonly ModelCapability[],
): { id: string; name?: string }[] {
  return models.map((m) => (m.name === undefined ? { id: m.id } : { id: m.id, name: m.name }));
}
