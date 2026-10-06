import { expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ sdkLoads: 0, gatewayLoads: 0, gatewayCreates: 0 }));
vi.mock("ai", () => {
  state.sdkLoads++;
  return {
    generateText: async () => ({ text: "answer", usage: { inputTokens: 1, outputTokens: 1 } }),
  };
});
vi.mock("@ai-sdk/gateway", () => {
  state.gatewayLoads++;
  return {
    createGateway: () => {
      state.gatewayCreates++;
      return Object.assign(() => ({ provider: "gateway" }), {
        getAvailableModels: async () => ({ models: [{ id: "test/model", name: "Test" }] }),
      });
    },
  };
});

import { GatewayModelClient } from "../../apps/runtime/src/agent/gateway-client.js";
import { AgentImageTools } from "../../apps/runtime/src/agent/image-tools.js";

it("keeps SDKs unloaded through construction and coalesces the first gateway calls", async () => {
  const ledger = {
    reserve: () => "reservation",
    settle: () => undefined,
  } as never;
  const client = new GatewayModelClient("fixture", {
    spendLedger: ledger,
    models: () => [
      { id: "test/model", contextTokens: 128_000, inputUsdPerMTok: 1, outputUsdPerMTok: 1 } as never,
    ],
  });
  AgentImageTools.withGateway("fixture", {} as never, ledger, "google/imagen-4.0-fast-generate-001");
  expect(state).toEqual({ sdkLoads: 0, gatewayLoads: 0, gatewayCreates: 0 });
  const [models, result] = await Promise.all([
    client.listModels(),
    client.generateText({ modelId: "test/model", prompt: "hello" }),
  ]);
  expect(models).toEqual([{ id: "test/model", name: "Test" }]);
  expect(result.text).toBe("answer");
  expect(state).toEqual({ sdkLoads: 1, gatewayLoads: 1, gatewayCreates: 1 });
});
