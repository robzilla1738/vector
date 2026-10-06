import { describe, expect, it } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { APICallError } from "ai";
import { z } from "zod";
import { openDb, Repo, SettingsService } from "@aux/runtime";
import { MockLanguageModelV4 } from "../../apps/runtime/node_modules/ai/dist/test/index.js";
import { GatewayModelClient, isFailoverStatus } from "../../apps/runtime/src/agent/gateway-client.js";
import { normalizeRouteChain } from "@aux/contracts/model-registry";

const MUSE = "meta/muse-spark-1.3-contributor";
const LUNA = "openai/gpt-5.6-luna-fast";

const apiError = (statusCode: number) =>
  new APICallError({
    message: `HTTP ${statusCode}`,
    url: "https://gw.test",
    requestBodyValues: {},
    statusCode,
  });

const textResult = (text: string) => ({
  content: [{ type: "text" as const, text }],
  finishReason: { unified: "stop" as const, raw: "stop" },
  usage: {
    inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
    outputTokens: { total: 2, text: 2, reasoning: 0 },
  },
  warnings: [],
});

describe("route chains", () => {
  it("settings passes the benchmark model pin into its gateway client", async () => {
    const repo = new Repo(openDb(":memory:"));
    const settings = new SettingsService(
      repo,
      join(mkdtempSync(join(tmpdir(), "aux-pin-")), "settings.json"),
      {
        AI_GATEWAY_API_KEY: "fixture-key",
        AUX_PLANNER_MODEL: MUSE,
        AUX_BENCH_MODEL_PIN: MUSE,
      },
    );
    const client = settings.model();
    expect(client).toBeTruthy();
    await expect(client!.generateText({ modelId: LUNA, prompt: "must not dispatch" })).rejects.toMatchObject({
      code: "permission_denied",
    });
  });

  it("normalizes a single route, a chain, and garbage", () => {
    expect(normalizeRouteChain({ modelId: "a/m", reasoning: "low" })).toEqual([
      { modelId: "a/m", reasoning: "low" },
    ]);
    expect(
      normalizeRouteChain([
        { modelId: "a/m", reasoning: "low" },
        { modelId: "b/m", reasoning: "xhigh" },
      ]),
    ).toHaveLength(2);
    expect(normalizeRouteChain("nope")).toEqual([]);
    expect(normalizeRouteChain([{ modelId: "a/m" }])).toEqual([]);
  });

  it("settings: stored chain wins, then built-in fallbacks dedupe by model", async () => {
    const repo = new Repo(openDb(":memory:"));
    const settings = new SettingsService(
      repo,
      join(mkdtempSync(join(tmpdir(), "aux-set-")), "settings.json"),
      {},
    );
    const chain = settings.agentRouteChain("standard");
    expect(chain[0]).toMatchObject({ modelId: MUSE, reasoning: "medium" });
    expect(chain.map((c) => c.modelId)).toContain(LUNA);
    await settings.set({
      agentModelRoutes: {
        standard: [
          { modelId: "custom/a", reasoning: "low" },
          { modelId: "custom/b", reasoning: "xhigh" },
        ],
      },
    });
    const routed = settings.agentRouteChain("standard");
    expect(routed.slice(0, 2)).toEqual([
      { modelId: "custom/a", reasoning: "low" },
      { modelId: "custom/b", reasoning: "xhigh" },
    ]);
    expect(routed.length).toBeLessThanOrEqual(4);
    expect(settings.agentRoute("standard")).toEqual({ modelId: "custom/a", reasoning: "low" });
    expect(settings.candidatesForModel("custom/a").map((c) => c.modelId)).toEqual(
      routed.map((c) => c.modelId),
    );
    expect(settings.candidatesForModel("unknown/model")).toEqual([]);
  });
});

describe("runtime failover", () => {
  it("a funded Goal tool call stops after its reserved primary model attempt", async () => {
    const resolved: string[] = [];
    const client = new GatewayModelClient("fixture", {
      model: (id) => {
        resolved.push(id);
        return new MockLanguageModelV4({
          doGenerate: async () => {
            throw apiError(429);
          },
        });
      },
      candidatesFor: () => [
        { modelId: MUSE, reasoning: "medium" },
        { modelId: LUNA, reasoning: "low" },
      ],
    });
    await expect(
      client.toolCallStep({
        modelId: MUSE,
        system: "",
        messages: [{ role: "user", content: "hi" }],
        tools: {},
        maxOutputTokens: 32,
        maxAttempts: 1,
      }),
    ).rejects.toThrow(/429/);
    expect(resolved).toEqual([MUSE]);
  });

  it("a benchmark model pin refuses a 429 fallback to another model", async () => {
    const resolved: string[] = [];
    const client = new GatewayModelClient("fixture", {
      model: (id) => {
        resolved.push(id);
        return new MockLanguageModelV4({
          doGenerate: async () => {
            throw apiError(429);
          },
        });
      },
      candidatesFor: () => [
        { modelId: MUSE, reasoning: "medium" },
        { modelId: LUNA, reasoning: "low" },
      ],
      allowedModelId: MUSE,
    });
    await expect(client.generateText({ modelId: MUSE, prompt: "hi", maxOutputTokens: 32 })).rejects.toThrow(
      /429/,
    );
    expect(resolved).toEqual([MUSE]);
  });

  it("a benchmark model pin rejects another requested model before dispatch", async () => {
    const resolved: string[] = [];
    const client = new GatewayModelClient("fixture", {
      model: (id) => {
        resolved.push(id);
        return new MockLanguageModelV4({ doGenerate: textResult("unreached") });
      },
      allowedModelId: MUSE,
    });
    await expect(
      client.generateText({ modelId: LUNA, prompt: "hi", maxOutputTokens: 32 }),
    ).rejects.toMatchObject({ code: "permission_denied" });
    expect(resolved).toEqual([]);
  });

  it("isFailoverStatus sees 429/5xx through wrapper chains, not 4xx", () => {
    expect(isFailoverStatus(apiError(429))).toBe(true);
    expect(isFailoverStatus(apiError(503))).toBe(true);
    expect(isFailoverStatus(new Error("wrapped", { cause: apiError(500) }))).toBe(true);
    expect(isFailoverStatus(Object.assign(new Error("x"), { lastError: apiError(502) }))).toBe(true);
    expect(isFailoverStatus(apiError(400))).toBe(false);
    expect(isFailoverStatus(apiError(401))).toBe(false);
    expect(isFailoverStatus(new Error("plain"))).toBe(false);
  });

  it("429 on the primary candidate serves from the next candidate with its model id", async () => {
    const resolved: string[] = [];
    const primary = new MockLanguageModelV4({
      doGenerate: async () => {
        throw apiError(429);
      },
    });
    const secondary = new MockLanguageModelV4({ doGenerate: textResult("from backup") });
    const client = new GatewayModelClient("fixture", {
      model: (id) => {
        resolved.push(id);
        return id === MUSE ? primary : secondary;
      },
      candidatesFor: (id) =>
        id === MUSE
          ? [
              { modelId: MUSE, reasoning: "medium" },
              { modelId: LUNA, reasoning: "low" },
            ]
          : [],
    });
    const res = await client.generateText({ modelId: MUSE, prompt: "hi", maxOutputTokens: 32 });
    expect(res.text).toBe("from backup");
    expect(res.resolvedModelId).toBe(LUNA);
    expect(res.retries?.map((a) => a.modelId)).toEqual([MUSE]);
    expect(res.retries?.[0]?.error).toMatch(/failover|HTTP 429/);
    expect(resolved).toEqual([MUSE, LUNA]);
  });

  it("a non-retriable status does not advance the chain", async () => {
    const resolved: string[] = [];
    const primary = new MockLanguageModelV4({
      doGenerate: async () => {
        throw apiError(400);
      },
    });
    const secondary = new MockLanguageModelV4({ doGenerate: textResult("unreached") });
    const client = new GatewayModelClient("fixture", {
      model: (id) => {
        resolved.push(id);
        return id === MUSE ? primary : secondary;
      },
      candidatesFor: () => [
        { modelId: MUSE, reasoning: "medium" },
        { modelId: LUNA, reasoning: "low" },
      ],
    });
    await expect(client.generateText({ modelId: MUSE, prompt: "hi", maxOutputTokens: 32 })).rejects.toThrow(
      /400/,
    );
    expect(resolved).toEqual([MUSE]);
  });

  it("the last candidate's retriable failure rethrows with every attempt attached", async () => {
    const resolved: string[] = [];
    const mk = () =>
      new MockLanguageModelV4({
        doGenerate: async () => {
          throw apiError(503);
        },
      });
    const models = { [MUSE]: mk(), [LUNA]: mk() } as Record<string, MockLanguageModelV4>;
    const client = new GatewayModelClient("fixture", {
      model: (id) => {
        resolved.push(id);
        return models[id]!;
      },
      candidatesFor: () => [
        { modelId: MUSE, reasoning: "medium" },
        { modelId: LUNA, reasoning: "low" },
      ],
    });
    await expect(client.generateText({ modelId: MUSE, prompt: "hi", maxOutputTokens: 32 })).rejects.toThrow(
      /503/,
    );
    expect(resolved).toEqual([MUSE, LUNA]);
  });

  it("structured calls fail over with prior attempts merged into retries", async () => {
    const resolved: string[] = [];
    const primary = new MockLanguageModelV4({
      doGenerate: async () => {
        throw apiError(429);
      },
    });
    const secondary = new MockLanguageModelV4({ doGenerate: textResult('{"ok":true}') });
    const client = new GatewayModelClient("fixture", {
      model: (id) => {
        resolved.push(id);
        return id === MUSE ? primary : secondary;
      },
      candidatesFor: () => [
        { modelId: MUSE, reasoning: "medium" },
        { modelId: LUNA, reasoning: "low" },
      ],
    });
    const res = await client.generateStructured({
      modelId: MUSE,
      system: "",
      prompt: "hi",
      schema: z.object({ ok: z.boolean() }),
      maxAttempts: 1,
    });
    expect(res.object.ok).toBe(true);
    expect(res.resolvedModelId).toBe(LUNA);
    expect(res.retries?.some((a) => a.modelId === MUSE)).toBe(true);
    expect(resolved).toEqual([MUSE, LUNA]);
  });

  it("no chain configured → the requested model is the only candidate", async () => {
    const resolved: string[] = [];
    const model = new MockLanguageModelV4({ doGenerate: textResult("solo") });
    const client = new GatewayModelClient("fixture", {
      model: (id) => {
        resolved.push(id);
        return model;
      },
    });
    const res = await client.generateText({ modelId: "custom/solo", prompt: "hi", maxOutputTokens: 32 });
    expect(res.text).toBe("solo");
    expect(res.resolvedModelId).toBe("custom/solo");
    expect(res.retries).toBeUndefined();
    expect(resolved).toEqual(["custom/solo"]);
  });
});
