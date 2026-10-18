import { z } from "zod";

const domain = z
  .string()
  .max(253)
  .regex(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(value);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, "Use a valid YYYY-MM-DD date.");
export const WebSearchInputSchema = z
  .object({
    query: z.string().trim().min(1).max(500),
    backend: z.enum(["auto", "gateway", "html"]).default("auto"),
    provider: z.enum(["perplexity", "exa"]).default("perplexity"),
    maxResults: z.number().int().min(1).max(20).default(5),
    includeDomains: z.array(domain).min(1).max(20).optional(),
    excludeDomains: z.array(domain).min(1).max(20).optional(),
    country: z
      .string()
      .regex(/^[A-Z]{2}$/)
      .optional(),
    languages: z
      .array(z.string().regex(/^[a-z]{2}$/))
      .min(1)
      .max(10)
      .optional(),
    recency: z.enum(["day", "week", "month", "year"]).optional(),
    publishedAfter: date.optional(),
    publishedBefore: date.optional(),
    category: z
      .enum(["company", "people", "research paper", "news", "personal site", "financial report"])
      .optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.provider === "perplexity") {
      if (value.includeDomains && value.excludeDomains)
        ctx.addIssue({ code: "custom", message: "Perplexity cannot combine included and excluded domains." });
      if (value.publishedAfter || value.publishedBefore || value.category)
        ctx.addIssue({ code: "custom", message: "Use Exa for published dates and category filters." });
    } else if (value.languages || value.recency) {
      ctx.addIssue({ code: "custom", message: "Use Perplexity for language and recency filters." });
    }
    if (value.publishedAfter && value.publishedBefore && value.publishedAfter > value.publishedBefore)
      ctx.addIssue({ code: "custom", message: "Published date bounds are reversed." });
  });
export type WebSearchInput = z.infer<typeof WebSearchInputSchema>;
export const WebSearchSourceSchema = z.object({
  sourceId: z.string().regex(/^[a-f0-9]{64}$/),
  providerSourceId: z.string().max(2048).optional(),
  requestId: z.string().max(200),
  toolCallId: z.string().max(200),
  title: z.string().max(1000),
  url: z.string().url().max(4096),
  excerpt: z.string().max(8000),
  publishedAt: z.string().max(100).optional(),
  updatedAt: z.string().max(100).optional(),
});
export const StructuredWebSearchResultSchema = z.object({
  backend: z.literal("gateway"),
  provider: z.enum(["perplexity", "exa"]),
  requested: WebSearchInputSchema,
  factoryDefaults: z.record(z.string(), z.unknown()),
  executions: z
    .array(
      z.object({
        toolCallId: z.string().max(200),
        requestId: z.string().max(200).optional(),
        observedInput: z.record(z.string(), z.unknown()),
        providerReportedCostUsd: z.number().nonnegative().optional(),
        error: z.string().max(2000).optional(),
      }),
    )
    .max(8),
  sources: z.array(WebSearchSourceSchema).max(20),
  truncated: z.boolean(),
  filterProvenance: z.literal("requested-and-observed; factory-values-are-defaults"),
  modelUsage: z.object({
    modelId: z.string().optional(),
    inputTokens: z.number().nonnegative().optional(),
    outputTokens: z.number().nonnegative().optional(),
    cachedInputTokens: z.number().nonnegative().optional(),
    durationMs: z.number().nonnegative().optional(),
  }),
  pricing: z.object({
    gatewayReportedCostUsd: z.number().nonnegative().optional(),
    providerSearchCostUsd: z.number().nonnegative().optional(),
    searchCostIncludedInGatewayTotal: z.literal("not-verified"),
  }),
});
export type StructuredWebSearchResult = z.infer<typeof StructuredWebSearchResultSchema>;
