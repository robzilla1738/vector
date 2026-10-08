import { expect, it } from "vitest";
import { agentMethods } from "../../apps/runtime/dist/api/methods/agent.js";

it("cancels optional classification transport at its deadline and falls back without a budget review", async () => {
  let originalSignal: AbortSignal | undefined;
  let bestEffort: boolean | undefined;
  const context = {
    client: { nativeTurnContext: "original-window-token", external: false },
    params: { text: "Find the release notes" },
    decideEgress: async () => undefined,
    s: {
      pages: { list: () => [] },
      native: { turnSourceContext: async () => ({ windowId: "window", activePageId: "page" }) },
      settings: {
        all: () => ({ commandRouting: "automatic" }),
        modelCacheGeneration: () => "original-account",
        utilityModel: async () => ({
          kind: "network",
          modelId: "fixture/utility",
          destination: "https://provider.fixture",
        }),
      },
      runs: {
        generationOperation: async (
          _input: unknown,
          work: (runId: string, signal: AbortSignal) => Promise<unknown>,
        ) => work("original-utility-run", new AbortController().signal),
        utilityClient: (input: { signal: AbortSignal; bestEffort?: boolean; authorize(): Promise<void> }) => {
          originalSignal = input.signal;
          bestEffort = input.bestEffort;
          return {
            generateStructured: async () => {
              await input.authorize();
              input.signal.throwIfAborted();
              return new Promise((_, reject) => {
                input.signal.addEventListener("abort", () => reject(input.signal.reason), { once: true });
              });
            },
          };
        },
      },
    },
  };
  await expect(agentMethods["agent.utility.intent"]!(context as never)).resolves.toEqual({
    kind: null,
    source: "unavailable",
  });
  expect(originalSignal?.aborted).toBe(true);
  expect(bestEffort).toBe(true);
});
