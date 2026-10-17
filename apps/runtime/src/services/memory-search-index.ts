import { z } from "zod";
import type { MemoryClaim } from "@aux/contracts";
import { digest } from "@aux/contracts/util/digest";

const ChunkSchema = z.object({ claimId: z.string().uuid(), text: z.string().max(1024) }).strict();
export const MemorySearchIndexSchema = z
  .object({
    version: z.literal(1),
    updatedAt: z.number().int().nonnegative(),
    sourceDigest: z.string().regex(/^[a-f0-9]{64}$/),
    chunks: z.array(ChunkSchema).max(1000),
  })
  .strict();
export type MemorySearchIndex = z.infer<typeof MemorySearchIndexSchema>;

/** Bounded overlapping chunks, derived only from the authoritative approved notes. */
export function buildMemorySearchIndex(claims: MemoryClaim[], updatedAt = Date.now()): MemorySearchIndex {
  const sources = claims.map(({ claimId, text }) => ({ claimId, text }));
  return {
    version: 1,
    updatedAt,
    sourceDigest: digest(JSON.stringify(sources)),
    chunks: sources.flatMap(({ claimId, text }) => {
      const characters = Array.from(text);
      const chunks: MemorySearchIndex["chunks"] = [];
      for (let start = 0; start < characters.length; start += 448) {
        chunks.push({ claimId, text: characters.slice(start, start + 512).join("") });
        if (start + 512 >= characters.length) break;
      }
      return chunks;
    }),
  };
}

export function validMemorySearchIndex(value: unknown, claims: MemoryClaim[]): MemorySearchIndex | null {
  const parsed = MemorySearchIndexSchema.safeParse(value);
  if (!parsed.success) return null;
  const expected = buildMemorySearchIndex(claims, parsed.data.updatedAt);
  return JSON.stringify(parsed.data) === JSON.stringify(expected) ? parsed.data : null;
}

/** Intersect claim postings so terms may occur in separate chunks of the same note. */
export function searchMemoryIndex(index: MemorySearchIndex, terms: string[]): Set<string> {
  const postings = new Map<string, Set<string>>();
  const documents = new Map<string, string>();
  for (const chunk of index.chunks) {
    const prior = documents.get(chunk.claimId);
    documents.set(
      chunk.claimId,
      prior === undefined ? chunk.text : prior + Array.from(chunk.text).slice(64).join(""),
    );
  }
  for (const [claimId, text] of documents) {
    for (const token of text.toLocaleLowerCase().split(/[^\p{L}\p{N}]+/u)) {
      if (!token) continue;
      let claims = postings.get(token);
      if (!claims) postings.set(token, (claims = new Set()));
      claims.add(claimId);
    }
  }
  const matches = terms.map((term) => {
    const ids = new Set<string>();
    for (const [token, claims] of postings) if (token.includes(term)) for (const id of claims) ids.add(id);
    return ids;
  });
  return new Set([...(matches[0] ?? [])].filter((id) => matches.every((set) => set.has(id))));
}
