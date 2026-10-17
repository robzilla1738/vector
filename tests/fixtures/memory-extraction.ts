import type { MemoryExtractor } from "../../apps/runtime/src/services/memory-extractor.js";

/** A deterministic model reply for the encryption, provenance and recovery fixtures. */
export const fixtureMemoryExtractor: MemoryExtractor = {
  generation: () => "synthetic-memory-connection",
  extract: async ({ report, checkCurrent }) => {
    checkCurrent();
    return {
      status: "completed",
      modelId: "synthetic-memory-model",
      quotes: report
        .split(/\n{2,}|(?<=[.!?])\s+(?=[A-Z])/u)
        .map((quote) => quote.trim())
        .filter((quote) => quote.length >= 20)
        .slice(0, 20)
        .map((quote) => quote.slice(0, 2000)),
    };
  },
};
