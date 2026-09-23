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

/**
 * Known-good offline snapshot. Only entries verified against the live Gateway
 * catalog (2026-09-22 review) carry status "verified"; both were present in
 * the live catalog and must not be blacklisted as invalid identifiers.
 */
export const MODEL_REGISTRY: readonly ModelCapability[] = [
  {
    id: "alibaba/qwen3.8-27b",
    name: "Qwen 3.8 27B",
    provider: "alibaba",
    modalities: ["text"],
    structuredOutput: true,
    streaming: true,
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
    source: "snapshot",
    status: "verified",
  },
];

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
