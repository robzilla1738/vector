import { memoryClaimText, type MemoryClaim } from "@aux/contracts";
export type ConsolidatedClaim = MemoryClaim & { contradictionIds?: string[]; mergedClaimIds?: string[] };
/** Deterministic consolidation never synthesizes a fact or discards unique provenance. */
export function consolidateMemoryClaims(
  claims: readonly MemoryClaim[],
  now: number,
  eligible: (claim: MemoryClaim) => boolean,
  staleAfterMs: number,
): ConsolidatedClaim[] {
  const merged = new Map<string, ConsolidatedClaim>();
  for (const claim of claims) {
    if (!eligible(claim) || now - (claim.ownerEdit?.updatedAt ?? claim.capturedAt) >= staleAfterMs) continue;
    const text = memoryClaimText(claim).normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();
    const key = JSON.stringify(claim.ownerEdit ? ["owner-edit", claim.claimId] : [text, claim.sourceRunId]);
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, { ...claim, contradictionIds: undefined });
      continue;
    }
    const newest = existing.capturedAt >= claim.capturedAt ? existing : claim;
    merged.set(key, {
      ...newest,
      mergedClaimIds: [
        ...new Set([
          ...(existing.mergedClaimIds ?? []),
          existing.claimId,
          claim.claimId,
          ...((claim as ConsolidatedClaim).mergedClaimIds ?? []),
        ]),
      ]
        .filter((id) => id !== newest.claimId)
        .slice(-200),
    });
  }
  return markMemoryContradictions([...merged.values()]);
}

/** Recompute conflicts after an owner edit without expiring or merging other notes. */
export function markMemoryContradictions(claims: readonly MemoryClaim[]): ConsolidatedClaim[] {
  const result = claims.map((claim) => ({ ...claim, contradictionIds: undefined as string[] | undefined }));
  const assertion = (text: string) => {
    const match = /^(.+?)\s+(is|are|has|have|can)\s+(not\s+)?(.+?)[.!]?$/.exec(
      text.toLocaleLowerCase().trim(),
    );
    return match ? { key: `${match[1]}:${match[2]}:${match[4]}`, negative: !!match[3] } : undefined;
  };
  for (const a of result) {
    const left = assertion(memoryClaimText(a));
    if (!left) continue;
    const conflicts = result.filter((b) => {
      const right = assertion(memoryClaimText(b));
      return b.claimId !== a.claimId && right?.key === left.key && right.negative !== left.negative;
    });
    if (conflicts.length) a.contradictionIds = conflicts.map((claim) => claim.claimId).slice(0, 200);
  }
  return result;
}
