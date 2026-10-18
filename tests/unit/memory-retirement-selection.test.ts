import { expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { digest } from "@aux/contracts/util/digest";
import { MemoryClaimSchema, type MemoryClaim } from "@aux/contracts";
import { selectMemoryRetirement } from "../../apps/runtime/dist/services/memory-retirement.js";

it("selects an entire schema-valid historical chain once while preserving unrelated claims", () => {
  const claims: MemoryClaim[] = Array.from({ length: 799 }, (_, index) => {
    const text = `Exact source quote from completed research number ${index}.`;
    return MemoryClaimSchema.parse({
      claimId: randomUUID(),
      sourceRunId: `research-${index}`,
      text,
      capturedAt: index,
      source: { kind: "run-report", quote: text, quoteSha256: digest(text) },
    });
  });
  const unrelated = MemoryClaimSchema.parse({
    claimId: randomUUID(),
    sourceRunId: "unrelated",
    text: "A separate unrelated owner source remains exact.",
    capturedAt: 1,
  });
  const state = {
    claims: [...claims.slice(0, 199), unrelated],
    inbox: [],
    history: Array.from({ length: 3 }, (_, index) => ({
      revisionId: randomUUID(),
      capturedAt: index,
      claims: claims.slice(199 + index * 200, 399 + index * 200),
    })),
  };
  const configs = new Map(
    claims.map((claim, index) => [
      claim.sourceRunId,
      index === 0
        ? {}
        : index % 2
          ? { contextRunIds: [claims[index - 1]!.sourceRunId] }
          : {
              context: `Original exact evidence [run:${claims[index - 1]!.sourceRunId}#${claims[index - 1]!.source!.quoteSha256.slice(0, 12)}]`,
            },
    ]),
  );
  const selected = selectMemoryRetirement(
    state,
    { sourceRunId: claims[0]!.sourceRunId, mode: "source" },
    configs,
  );
  expect(selected).toEqual(new Set(claims.map((claim) => claim.claimId)));
  expect(selected.has(unrelated.claimId)).toBe(false);
});
