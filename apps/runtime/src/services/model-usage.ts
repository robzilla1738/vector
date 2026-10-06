import type { ModelCall, ModelUsageSummary } from "@aux/contracts";

const strings = (values: (string | undefined)[]) => [
  ...new Set(values.filter((value): value is string => !!value)),
];

export function summarizeModelUsage(calls: ModelCall[]): ModelUsageSummary {
  const aux = calls
    .map((call) => call.providerMetadata?.aux)
    .filter(
      (value): value is Record<string, unknown> =>
        !!value && typeof value === "object" && !Array.isArray(value),
    );
  return {
    calls: calls.length,
    modelIds: strings(calls.map((call) => call.modelId)),
    providers: strings(aux.map((value) => (typeof value.provider === "string" ? value.provider : undefined))),
    destinations: strings(
      aux.map((value) => (typeof value.destination === "string" ? value.destination : undefined)),
    ),
    inputTokens: calls.reduce((sum, call) => sum + Math.max(0, call.inputTokens ?? 0), 0),
    outputTokens: calls.reduce((sum, call) => sum + Math.max(0, call.outputTokens ?? 0), 0),
    knownCostUsd: calls.reduce((sum, call) => sum + Math.max(0, call.costUsd ?? 0), 0),
    costComplete: calls.every((call) => call.costUsd !== undefined && !call.costEstimated),
  };
}
