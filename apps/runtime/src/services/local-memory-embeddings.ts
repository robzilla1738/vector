import { AuxError } from "@aux/contracts";

export type LocalEmbeddingModel = { modelId: string; digest: string };
const BASE = "http://127.0.0.1:11434";
const MAX_BYTES = 2 * 1024 * 1024;
const record = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
async function json(response: Response, retain: (join: () => Promise<void>) => () => void): Promise<unknown> {
  const reader = response.body?.getReader();
  if (!reader) throw new AuxError("backend_unavailable", "The local embedding response is empty.");
  const terminal = reader.closed.then(
    () => true,
    () => true,
  );
  const join = async () => {
    try {
      await reader.cancel();
    } catch {
      // This exclusive reader remains held: an errored original stream is terminal too.
      await terminal;
    }
    await terminal;
  };
  const release = retain(join);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    if (!response.ok)
      throw new AuxError(
        "backend_unavailable",
        "The local embedding server could not complete this request.",
      );
    for (;;) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > MAX_BYTES)
        throw new AuxError("backend_unavailable", "The local embedding response is too large.");
      chunks.push(part.value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } finally {
    await join();
    release();
  }
}
export function embeddingVector(value: unknown): number[] {
  if (
    !Array.isArray(value) ||
    value.length < 1 ||
    value.length > 8192 ||
    !value.every((x) => typeof x === "number" && Number.isFinite(x)) ||
    !value.some((x) => x !== 0)
  )
    throw new AuxError("backend_unavailable", "The local model returned an invalid embedding.");
  return value;
}
export function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  if (a.length !== b.length)
    throw new AuxError("backend_unavailable", "The selected local model changed its embedding dimensions.");
  let scaleA = 0,
    scaleB = 0;
  for (let i = 0; i < a.length; i++) {
    scaleA = Math.max(scaleA, Math.abs(a[i]!));
    scaleB = Math.max(scaleB, Math.abs(b[i]!));
  }
  if (!scaleA || !scaleB || !Number.isFinite(scaleA) || !Number.isFinite(scaleB))
    throw new AuxError("backend_unavailable", "The local model returned an invalid embedding.");
  let dot = 0,
    aa = 0,
    bb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i]! / scaleA,
      y = b[i]! / scaleB;
    dot += x * y;
    aa += x * x;
    bb += y * y;
  }
  return dot / Math.sqrt(aa * bb);
}
/** Installed models only: never downloads a model or contacts a remote provider. */
export class LocalMemoryEmbeddings {
  private capabilities = new Map<string, boolean>();
  private closed = false;
  private closing?: Promise<void>;
  private shutdown = new AbortController();
  private pending = new Set<Promise<unknown>>();
  private cleanup = new Set<() => Promise<void>>();

  private retain(join: () => Promise<void>): () => void {
    this.cleanup.add(join);
    return () => this.cleanup.delete(join);
  }
  private own<T>(work: () => Promise<T>): Promise<T> {
    if (this.closed) return Promise.reject(new AuxError("cancelled", "Local embedding requests are closed."));
    const pending = work();
    this.pending.add(pending);
    void pending.then(
      () => this.pending.delete(pending),
      () => this.pending.delete(pending),
    );
    return pending;
  }
  close(): Promise<void> {
    this.closed = true;
    this.shutdown.abort();
    if (this.closing) return this.closing;
    const closing = (async () => {
      await Promise.allSettled(this.pending);
      const results = await Promise.allSettled(
        [...this.cleanup].map(async (join) => {
          await join();
          this.cleanup.delete(join);
        }),
      );
      const failures = results.flatMap((result) => (result.status === "rejected" ? [result.reason] : []));
      if (failures.length)
        throw new AggregateError(failures, "Original local embedding streams await cleanup.");
      this.capabilities.clear();
    })();
    this.closing = closing;
    void closing.catch(() => {
      if (this.closing === closing) this.closing = undefined;
    });
    return closing;
  }
  constructor(private request: typeof fetch = fetch) {}
  private fetch(path: string, signal: AbortSignal, body?: unknown) {
    return this.own(() =>
      this.request(`${BASE}${path}`, {
        method: body === undefined ? "GET" : "POST",
        redirect: "error",
        signal: AbortSignal.any([signal, this.shutdown.signal, AbortSignal.timeout(15_000)]),
        headers: {
          Accept: "application/json",
          ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      }).then((response) => json(response, (join) => this.retain(join))),
    );
  }
  discover(signal: AbortSignal): Promise<LocalEmbeddingModel[]> {
    return this.own(() => this.discoverOwned(signal));
  }
  private async discoverOwned(signal: AbortSignal): Promise<LocalEmbeddingModel[]> {
    const raw = record(await this.fetch("/api/tags", signal));
    if (!Array.isArray(raw?.models) || raw.models.length > 500)
      throw new AuxError("backend_unavailable", "The local model catalog is unavailable.");
    const installed = raw.models.flatMap((item) => {
      const model = record(item);
      return typeof model?.name === "string" &&
        model.name.length > 0 &&
        model.name.length <= 200 &&
        typeof model.digest === "string" &&
        /^(?:sha256:)?[a-f0-9]{64}$/.test(model.digest)
        ? [{ modelId: model.name, digest: model.digest }]
        : [];
    });
    const results: LocalEmbeddingModel[] = [];
    let cursor = 0;
    await Promise.all(
      Array.from({ length: Math.min(4, installed.length) }, async () => {
        while (cursor < installed.length) {
          signal.throwIfAborted();
          const model = installed[cursor++]!;
          const key = `${model.modelId}:${model.digest}`;
          let capable = this.capabilities.get(key);
          if (capable === undefined) {
            const body = record(await this.fetch("/api/show", signal, { model: model.modelId }));
            capable = Array.isArray(body?.capabilities) && body.capabilities.includes("embedding");
            if (this.capabilities.size >= 500) this.capabilities.clear();
            this.capabilities.set(key, capable);
          }
          if (capable) results.push(model);
        }
      }),
    );
    return results.sort((a, b) => a.modelId.localeCompare(b.modelId));
  }
  private async assertInstalled(model: LocalEmbeddingModel, signal: AbortSignal) {
    const raw = record(await this.fetch("/api/tags", signal));
    if (
      !Array.isArray(raw?.models) ||
      raw.models.length > 500 ||
      !raw.models.some((item) => {
        const current = record(item);
        return current?.name === model.modelId && current.digest === model.digest;
      })
    )
      throw new AuxError("cancelled", "The installed local embedding model changed.");
  }
  embed(model: LocalEmbeddingModel, text: string, signal: AbortSignal): Promise<number[]> {
    return this.own(() => this.embedOwned(model, text, signal));
  }
  private async embedOwned(model: LocalEmbeddingModel, text: string, signal: AbortSignal): Promise<number[]> {
    signal.throwIfAborted();
    await this.assertInstalled(model, signal);
    const body = record(
      await this.fetch("/api/embed", signal, { model: model.modelId, input: text, truncate: true }),
    );
    if (!Array.isArray(body?.embeddings) || body.embeddings.length !== 1)
      throw new AuxError("backend_unavailable", "The local model returned an invalid embedding response.");
    const vector = embeddingVector(body.embeddings[0]);
    await this.assertInstalled(model, signal);
    return vector;
  }
}
