import { AuxError } from "@aux/contracts";
import type {
  MemoryRecallSource,
  MemoryRecallQuery,
  MemoryRecallMatch,
} from "@aux/contracts/memory-documents";
import { digest } from "@aux/contracts/util/digest";
import { LocalMemoryEmbeddings, cosineSimilarity } from "./local-memory-embeddings.js";
const terms = (text: string) =>
  [
    ...new Set(
      text
        .normalize("NFKC")
        .toLocaleLowerCase()
        .match(/[\p{L}\p{N}]{2,}/gu) ?? [],
    ),
  ].slice(0, 24);
export function memoryChunks(source: MemoryRecallSource): MemoryRecallMatch[] {
  const { text, ...metadata } = source;
  const lines = text.split("\n");
  const chunks: MemoryRecallMatch[] = [];
  let heading = "",
    start = 1,
    pending: string[] = [],
    length = 0;
  const flush = (end: number) => {
    if (!pending.length) return;
    const text = pending.join("\n");
    chunks.push({
      ...metadata,
      heading,
      startLine: start,
      endLine: end,
      text,
      score: 0,
      chunkId: digest(JSON.stringify([source.sourceId, source.revision, start, end, text])),
    });
    pending = [];
    length = 0;
  };
  lines.forEach((line, index) => {
    const title = /^#{1,6}\s+(.+)$/.exec(line);
    if (title || length + line.length > 1800) flush(index);
    if (title) heading = title[1]!.slice(0, 500);
    if (!pending.length) start = index + 1;
    if (line.length > 1800) {
      for (let offset = 0; offset < line.length; offset += 1800) {
        pending = [line.slice(offset, offset + 1800)];
        start = index + 1;
        flush(index + 1);
      }
    } else {
      pending.push(line);
      length += line.length + 1;
    }
  });
  flush(lines.length);
  return chunks;
}
function lexicalScore(chunk: MemoryRecallMatch, query: string) {
  const words = terms(query);
  if (!words.length) return 0;
  const text = chunk.text.normalize("NFKC").toLocaleLowerCase();
  const path = `${chunk.path} ${chunk.title} ${chunk.heading}`.normalize("NFKC").toLocaleLowerCase();
  return (
    words.reduce(
      (score, term) => score + (text.includes(term) ? 1 : 0) + (path.includes(term) ? 1.5 : 0),
      0,
    ) /
    (words.length * 2.5)
  );
}
/** Aside daemon reference: semantic .70 + 30-day recency .15 + path-token overlap .15. */
export function memoryRecallScore(chunk: MemoryRecallMatch, queries: string[], relevance: number, now: number) {
  const words = [...new Set(queries.flatMap(terms))];
  const path = chunk.path.toLocaleLowerCase().replace(/\.md$/, "").split(/[/._-]+/).filter((term) => term.length > 1);
  const matches = path.filter((part) => words.some((word) => part.includes(word) || word.includes(part))).length;
  const pathScore = words.length ? Math.min(1, matches / words.length) : 0;
  const recency = chunk.updatedAt ? Math.max(0, 1 - Math.max(0, now - chunk.updatedAt) / (30 * 86400000)) : 0.5;
  return Math.max(0, relevance) * 0.7 + recency * 0.15 + pathScore * 0.15;
}

export class MemoryRecall {
  private embeddings = new LocalMemoryEmbeddings();
  private vectors = new Map<string, { key: string; vector: number[] }>();
  private shutdown = new AbortController();
  private pending = new Set<Promise<unknown>>();
  async close() {
    this.shutdown.abort();
    await Promise.allSettled(this.pending);
    this.vectors.clear();
    await this.embeddings.close();
  }
  invalidate() {
    this.vectors.clear();
  }
  async search(
    sources: MemoryRecallSource[],
    input: MemoryRecallQuery,
    signal: AbortSignal,
    check: () => void,
  ) {
    const work = this.searchOwned(sources, input, signal, check);
    this.pending.add(work);
    try {
      return await work;
    } finally {
      this.pending.delete(work);
    }
  }
  private async searchOwned(
    sources: MemoryRecallSource[],
    input: MemoryRecallQuery,
    signal: AbortSignal,
    check: () => void,
  ) {
    check();
    const eligible = sources.filter((source) => {
      if (input.kinds && !input.kinds.includes(source.kind)) return false;
      if (input.from !== undefined && source.updatedAt < input.from) return false;
      if (input.to !== undefined && source.updatedAt > input.to) return false;
      if (input.domains?.length) {
        if (!source.url) return false;
        const hostname = new URL(source.url).hostname.toLocaleLowerCase();
        if (
          !input.domains.some(
            (domain) =>
              hostname === domain.toLocaleLowerCase() || hostname.endsWith(`.${domain.toLocaleLowerCase()}`),
          )
        )
          return false;
      }
      return true;
    });
    const chunks = eligible.flatMap(memoryChunks);
    const scored = chunks.map((chunk) => ({
      chunk,
      lexical: Math.max(...input.queries.map((query) => lexicalScore(chunk, query))),
    }));
    let mode: "semantic" | "lexical" = "lexical",
      modelId: string | undefined,
      fallbackReason: string | undefined;
    const semantic = new Map<string, number>();
    if (input.mode !== "lexical" && chunks.length) {
      const localSignal = AbortSignal.any([signal, this.shutdown.signal, AbortSignal.timeout(30000)]);
      try {
        const model = (await this.embeddings.discover(localSignal))[0];
        check();
        if (!model) throw new AuxError("backend_unavailable", "No installed embedding model is available.");
        const key = `${model.modelId}:${model.digest}`;
        // Bound memory and work; distribute the prepared set across source identities.
        const ordered = [...scored].sort(
          (a, b) => b.lexical - a.lexical || b.chunk.updatedAt - a.chunk.updatedAt,
        );
        const selected: typeof scored = [];
        for (let pass = 0; pass < 4 && selected.length < 256; pass++) {
          const seen = new Map<string, number>();
          for (const candidate of ordered) {
            const count = seen.get(candidate.chunk.sourceId) ?? 0;
            seen.set(candidate.chunk.sourceId, count + 1);
            if (count === pass && selected.length < 256) selected.push(candidate);
          }
        }
        for (let offset = 0; offset < selected.length; offset += 8) {
          const batch = selected
            .slice(offset, offset + 8)
            .filter(({ chunk }) => this.vectors.get(chunk.chunkId)?.key !== key);
          if (!batch.length) continue;
          const vectors = await this.embeddings.embedBatch(
            model,
            batch.map(({ chunk }) => chunk.text),
            localSignal,
          );
          check();
          batch.forEach(({ chunk }, index) =>
            this.vectors.set(chunk.chunkId, { key, vector: vectors[index]! }),
          );
          while (this.vectors.size > 256) this.vectors.delete(this.vectors.keys().next().value!);
        }
        const queries = await this.embeddings.embedBatch(model, input.queries, localSignal);
        check();
        const current = await this.embeddings.discover(localSignal);
        if (!current.some((item) => item.modelId === model.modelId && item.digest === model.digest))
          throw new AuxError("backend_unavailable", "The installed model changed.");
        for (const { chunk } of selected) {
          const vector = this.vectors.get(chunk.chunkId);
          if (vector?.key === key)
            semantic.set(
              chunk.chunkId,
              Math.max(...queries.map((query) => cosineSimilarity(query, vector.vector))),
            );
        }
        mode = "semantic";
        modelId = model.modelId;
        if (selected.length < chunks.length)
          fallbackReason =
            "Local semantic ranking covers up to 256 diversified chunks; remaining eligible sources retain keyword ranking.";
      } catch (error) {
        signal.throwIfAborted();
        this.shutdown.signal.throwIfAborted();
        check();
        if (
          !(error instanceof AuxError && error.code === "backend_unavailable") &&
          !(error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name))
        )
          throw error;
        fallbackReason =
          "Installed local embeddings are unavailable or exceeded the search deadline. Showing keyword matches.";
      }
    }
    const now = Date.now();
    const ranked = scored
      .filter(({ chunk, lexical }) => lexical > 0 || (semantic.get(chunk.chunkId) ?? -1) > 0.2)
      .map(({ chunk, lexical }) => ({
        ...chunk,
        score: memoryRecallScore(chunk, input.queries, semantic.get(chunk.chunkId) ?? lexical, now),
      }))
      .sort((a, b) => b.score - a.score || a.chunkId.localeCompare(b.chunkId));
    const seenText = new Set<string>();
    const unique = ranked.filter((chunk) => {
      const key = digest(chunk.text.normalize("NFKC").replace(/\s+/g, " "));
      if (seenText.has(key)) return false;
      seenText.add(key);
      return true;
    });
    // Interleave each source's best chunks so a single long document cannot occupy the first page.
    const counts = new Map<string, number>();
    const diversified = unique
      .map((chunk) => {
        const count = counts.get(chunk.sourceId) ?? 0;
        counts.set(chunk.sourceId, count + 1);
        return { chunk, tier: Math.floor(count / 2) };
      })
      .sort((a, b) => a.tier - b.tier || b.chunk.score - a.chunk.score)
      .map(({ chunk }) => chunk);
    const fingerprint = digest(
      JSON.stringify([
        input.queries,
        input.kinds,
        input.domains,
        input.from,
        input.to,
        mode,
        modelId,
        eligible.map((source) => [source.sourceId, source.revision, source.sha256]),
        diversified.map((chunk) => chunk.chunkId),
      ]),
    );
    let offset = 0;
    if (input.cursor) {
      try {
        const cursor = JSON.parse(Buffer.from(input.cursor, "base64url").toString("utf8"));
        if (cursor.fingerprint !== fingerprint || !Number.isSafeInteger(cursor.offset) || cursor.offset < 0)
          throw new Error();
        offset = cursor.offset;
      } catch {
        throw new AuxError("conflict", "Memory search changed. Start a fresh search before loading more.");
      }
    }
    check();
    return {
      mode,
      modelId,
      fallbackReason,
      matches: diversified.slice(offset, offset + input.limit),
      total: diversified.length,
      nextCursor:
        offset + input.limit < diversified.length
          ? Buffer.from(JSON.stringify({ fingerprint, offset: offset + input.limit })).toString("base64url")
          : null,
    };
  }
}
