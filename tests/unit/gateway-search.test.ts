import { expect, it, vi } from "vitest";
import { WebSearchInputSchema } from "@aux/contracts/web-search";
import { GatewayModelClient } from "../../apps/runtime/src/agent/gateway-client.js";
import { vercelModelClient } from "../../apps/runtime/src/agent/vercel-model.js";
import { attemptsOf, modelUndispatched, modelCallCost } from "../../apps/runtime/src/agent/model-client.js";
import {
  gatewaySearchDefaults,
  htmlSearchFallback,
  normalizeGatewaySearch,
} from "../../apps/runtime/src/agent/gateway-search.js";

it("validates actual provider filter capabilities and refuses filtered HTML fallback", () => {
  const request = WebSearchInputSchema.parse({
    query: "source",
    includeDomains: ["example.com"],
    recency: "week",
  });
  expect(gatewaySearchDefaults(request)).toMatchObject({
    searchDomainFilter: ["example.com"],
    searchRecencyFilter: "week",
  });
  expect(() => htmlSearchFallback(request, "No Gateway")).toThrow(/cannot apply/);
  expect(() =>
    WebSearchInputSchema.parse({
      query: "x",
      includeDomains: ["example.com"],
      excludeDomains: ["other.com"],
    }),
  ).toThrow();
  expect(() =>
    WebSearchInputSchema.parse({ query: "x", publishedAfter: "2026-02-30", provider: "exa" }),
  ).toThrow();
  expect(() => WebSearchInputSchema.parse({ query: "x", provider: "exa", recency: "week" })).toThrow();
  expect(() =>
    htmlSearchFallback(WebSearchInputSchema.parse({ query: "x", backend: "gateway" }), "No Gateway"),
  ).toThrow(/No Gateway/);
  expect(htmlSearchFallback(WebSearchInputSchema.parse({ query: "x" }), "No Gateway")).toMatchObject({
    backend: "html",
    structured: false,
    query: "x",
  });
});
it("returns actual request/source identity, observed query changes, deduplication and zero versus unknown cost", () => {
  const request = WebSearchInputSchema.parse({
    query: "requested query",
    provider: "exa",
    maxResults: 1,
    publishedAfter: "2026-10-01",
  });
  const result = normalizeGatewaySearch({
    request,
    gatewayCost: "0",
    usage: { durationMs: 1, cachedInputTokens: 0 },
    executions: [
      {
        toolCallId: "actual-call",
        input: { query: "actual query", include_domains: ["other.com"] },
        output: {
          requestId: "actual-request",
          costDollars: { total: 0 },
          results: [
            {
              id: "actual-source",
              title: "Actual",
              url: "https://example.com/source",
              text: "actual excerpt",
            },
            { id: "duplicate", title: "Duplicate", url: "https://example.com/source", text: "same" },
            { id: "next", title: "Next", url: "https://example.com/next", text: "more" },
          ],
        },
      },
    ],
  });
  expect(result).toMatchObject({
    requested: { query: "requested query" },
    executions: [{ requestId: "actual-request", observedInput: { query: "actual query" } }],
    sources: [{ providerSourceId: "actual-source", requestId: "actual-request", excerpt: "actual excerpt" }],
    truncated: true,
    modelUsage: { cachedInputTokens: 0 },
    pricing: {
      gatewayReportedCostUsd: 0,
      providerSearchCostUsd: 0,
      searchCostIncludedInGatewayTotal: "not-verified",
    },
  });
  const unknown = normalizeGatewaySearch({
    request,
    executions: [{ toolCallId: "call", input: { query: "x" }, output: { requestId: "id", results: [] } }],
  });
  expect(unknown.pricing).not.toHaveProperty("providerSearchCostUsd");
  expect(unknown.pricing).not.toHaveProperty("gatewayReportedCostUsd");
  expect(unknown.modelUsage).not.toHaveProperty("cachedInputTokens");
});

function searchStream(provider: "perplexity" | "exa", extra: Record<string, unknown>[] = []) {
  const output =
    provider === "perplexity"
      ? {
          id: "actual-search",
          results: [{ title: "Source", url: "https://example.com/", snippet: "Actual excerpt" }],
        }
      : {
          requestId: "actual-search",
          costDollars: { total: 0 },
          results: [
            { id: "actual-id", title: "Source", url: "https://example.com/", text: "Actual excerpt" },
          ],
        };
  return [
    { type: "stream-start", warnings: [] },
    {
      type: "tool-call",
      toolCallId: "search-call",
      toolName: "search",
      input: JSON.stringify({ query: "actual query" }),
      providerExecuted: true,
    },
    {
      type: "tool-result",
      toolCallId: "search-call",
      toolName: "search",
      result: output,
      providerExecuted: true,
    },
    ...extra,
    {
      type: "finish",
      finishReason: { unified: "tool-calls", raw: "tool_calls" },
      usage: {
        inputTokens: { total: 12, noCache: 12, cacheRead: 0, cacheWrite: 0 },
        outputTokens: { total: 3, text: 3, reasoning: 0 },
      },
      providerMetadata: { gateway: { cost: "0" } },
    },
  ];
}
function streamResponse(parts: unknown[]) {
  return new Response(parts.map((part) => `data: ${JSON.stringify(part)}\n\n`).join(""), {
    headers: { "content-type": "text/event-stream" },
  });
}
it.each(["perplexity", "exa"] as const)(
  "executes %s through the installed SDK with one original request and no inner model loop",
  async (provider) => {
    const bodies: unknown[] = [];
    const network = vi.fn<typeof fetch>(async (_input, init) => {
      bodies.push(JSON.parse(String(init?.body)));
      return streamResponse(searchStream(provider));
    });
    const client = new GatewayModelClient("fixture-key", { gatewayFetch: network });
    const beforeDispatch = vi.fn(async () => {});
    const result = await client.searchWeb({
      modelId: "fixture-model",
      request: WebSearchInputSchema.parse({ query: "requested query", provider }),
      beforeDispatch,
    });
    expect(network).toHaveBeenCalledTimes(1);
    expect(beforeDispatch).toHaveBeenCalledTimes(1);
    expect(bodies[0]).toMatchObject({
      toolChoice: { type: "tool", toolName: "search" },
      tools: [{ type: "provider", id: `gateway.${provider === "exa" ? "exa_search" : "perplexity_search"}` }],
    });
    expect(result).toMatchObject({
      inputTokens: 12,
      outputTokens: 3,
      cachedInputTokens: 0,
      result: {
        backend: "gateway",
        sources: [{ requestId: "actual-search", excerpt: "Actual excerpt" }],
        modelUsage: { cachedInputTokens: 0 },
      },
    });
  },
);
it("accounts actual completed usage even when a later search projection is invalid", async () => {
  const network = vi.fn<typeof fetch>(async () =>
    streamResponse(
      searchStream("perplexity").map((part) =>
        part.type === "tool-result"
          ? {
              ...part,
              result: { id: "bad", results: [{ title: "Unsafe", url: "file:///secret", snippet: "x" }] },
            }
          : part,
      ),
    ),
  );
  const client = new GatewayModelClient("fixture-key", { gatewayFetch: network });
  const failure = await client
    .searchWeb({ modelId: "fixture-model", request: WebSearchInputSchema.parse({ query: "x" }) })
    .catch((error) => error);
  expect(failure).toMatchObject({ code: "permission_denied" });
  expect(attemptsOf(failure)).toMatchObject([{ inputTokens: 12, outputTokens: 3, cachedInputTokens: 0 }]);
  expect(network).toHaveBeenCalledTimes(1);
});
it("requires the original Vercel source, account selection and governed destination before sending", async () => {
  let current = true;
  const network = vi.fn<typeof fetch>(async () => streamResponse(searchStream("perplexity")));
  const selected = () => {
    if (!current) throw new Error("Original account changed");
  };
  const client = vercelModelClient(
    async () => ({ account: () => ({ teamId: "actual-team" }), accessToken: async () => "fixture-token" }),
    "actual-account",
    () => [{ id: "fixture-model", source: "configured" }],
    selected,
    async () => {},
    network,
  );
  const request = { modelId: "fixture-model", request: WebSearchInputSchema.parse({ query: "x" }) };
  const missing = await client.searchWeb!(request).catch((error) => error);
  expect(modelUndispatched(missing)).toBe(true);
  expect(network).not.toHaveBeenCalled();
  const authorizeDestination = vi.fn(async () => {});
  const source = {
    runId: "original-run",
    nativeTurnContext: "actual-native-token",
    checkOriginal: selected,
    authorizeDestination,
  };
  expect((await client.searchWeb!({ ...request, source })).result.backend).toBe("gateway");
  expect(authorizeDestination).toHaveBeenCalledWith("https://ai-gateway.vercel.sh");
  current = false;
  await expect(client.searchWeb!({ ...request, source })).rejects.toThrow(/account changed/);
  expect(network).toHaveBeenCalledTimes(1);
});

it("does not turn unknown search charges into free usage or double count unverified component costs", () => {
  expect(
    modelCallCost("fixture", {
      providerMetadata: {
        gateway: { cost: "0" },
        aux: {
          gatewaySearch: {
            searchCostIncludedInGatewayTotal: "not-verified",
          },
        },
      },
    }),
  ).toEqual({});
  expect(
    modelCallCost("fixture", {
      providerMetadata: {
        gateway: { cost: "0.02" },
        aux: {
          gatewaySearch: {
            searchCostIncludedInGatewayTotal: "not-verified",
            providerSearchCostUsd: 0.007,
          },
        },
      },
    }),
  ).toEqual({});
  expect(
    modelCallCost("fixture", {
      providerMetadata: {
        gateway: { cost: "0" },
        aux: {
          gatewaySearch: {
            searchCostIncludedInGatewayTotal: "not-verified",
            providerSearchCostUsd: 0,
          },
        },
      },
    }),
  ).toEqual({ costUsd: 0, costEstimated: false });
});
