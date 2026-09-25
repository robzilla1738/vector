#!/usr/bin/env node
/** B0 fixture-only Gateway smoke. Prints capabilities and USD, never the key. */
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createGateway } from "@ai-sdk/gateway";
import { generateText, stepCountIs, tool, wrapLanguageModel } from "ai";
import { z } from "zod";
import { GatewayModelClient, SpendLedger, estimatedPromptTokens, loadDotEnv, modelCallCost, projectedModelCostUsd } from "@aux/runtime";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const env = loadDotEnv(process.env, [process.env.AUX_SMOKE_DOTENV || join(root, ".env")]);
process.env.AUX_PROGRAM_SPEND_CAP_USD ??= "50";
const key = env.AI_GATEWAY_API_KEY;
if (!key) throw new Error("AI_GATEWAY_API_KEY unavailable; live smoke skipped");
const modelId = "meta/muse-spark-1.3-contributor";
const ledger = new SpendLedger();
const start = ledger.summary();
const gateway = createGateway({ apiKey: key });
const catalog = await gateway.getAvailableModels();
if (!catalog.models.some(model => model.id === modelId)) throw new Error("Muse Spark 1.3 Contributor absent from live Gateway catalog");
const client = new GatewayModelClient(key, { spendLedger: ledger });
const results = { modelId, catalog: "verified", checks: {}, spentUsd: 0 };
const smokeBudget = 1;
function account(name, attempt) {
  const cost = modelCallCost(modelId, attempt);
  results.checks[name] = { ok: true, costUsd: cost.costUsd ?? null, costEstimated: cost.costEstimated ?? true,
    inputTokens: attempt.inputTokens ?? null, outputTokens: attempt.outputTokens ?? null };
  results.spentUsd = ledger.summary().committedUsd - start.committedUsd;
  if (results.spentUsd > smokeBudget) throw new Error("B0 smoke exceeded its $1 allocation");
}

try {
  const deltas = [];
  const streamed = await client.streamStructured({ modelId, system: "Return concise JSON only.", prompt: "Set ok to true and mode to stream.",
    schema: z.object({ ok: z.boolean(), mode: z.string() }), maxOutputTokens: 512, reasoning: "low", onText: delta => deltas.push(delta) });
  if (!streamed.object.ok || deltas.length === 0) throw new Error("structured streaming failed");
  account("streaming_json", streamed);

  const structured = await client.generateStructured({ modelId, system: "Return valid JSON.", prompt: "Set ok to true.",
    schema: z.object({ ok: z.boolean() }), maxOutputTokens: 512, reasoning: "medium" });
  if (!structured.object.ok) throw new Error("structured output failed");
  account("structured_output", structured);

  // A single red pixel is fixture data. No page, user, or credential content is sent.
  const redPixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  const image = await client.generateText({ modelId, prompt: "Does this image contain one pixel? Reply yes or no.", imageDataUrl: redPixel, maxOutputTokens: 2048 });
  if (!image.text.trim()) throw new Error("image input returned no text");
  account("image_input", image);

  const toolResult = await generateText({
    model: wrapLanguageModel({ model: gateway(modelId), middleware: {
      wrapGenerate: async ({ doGenerate, params }) => {
        const reservation = ledger.reserve("muse-smoke-tools", modelId, projectedModelCostUsd(modelId, estimatedPromptTokens(params.prompt), params.maxOutputTokens ?? 512));
        try {
          const result = await doGenerate();
          const usage = result.usage ?? {};
          ledger.settle(reservation, modelCallCost(modelId, {
            inputTokens: usage.inputTokens, outputTokens: usage.outputTokens, providerMetadata: result.providerMetadata,
          }).costUsd);
          return result;
        } catch (error) { ledger.settle(reservation); throw error; }
      },
    } }),
    prompt: "Call the add tool with 2 and 3, then give only the result.",
    tools: { add: tool({ inputSchema: z.object({ a: z.number(), b: z.number() }), execute: async ({ a, b }) => a + b }) },
    stopWhen: stepCountIs(2), maxOutputTokens: 512, maxRetries: 0, reasoning: "low",
  });
  if (!toolResult.steps?.some(step => step.toolCalls?.some(call => call.toolName === "add"))) throw new Error("tool call missing");
  results.checks.tool_calling = { ok: true, toolCalls: toolResult.steps.reduce((n, step) => n + (step.toolCalls?.length ?? 0), 0) };
  results.spentUsd = ledger.summary().committedUsd - start.committedUsd;
  if (results.spentUsd > smokeBudget) throw new Error("B0 smoke exceeded its $1 allocation");
  results.reasoning = "AI SDK top-level reasoning: low (stream/tools), medium (structured/default)";
  console.log(JSON.stringify(results));
} finally { ledger.close(); }
