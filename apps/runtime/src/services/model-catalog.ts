import { AuxError, ModelCapabilitySchema, type ModelCapability, type ModelProvider } from "@aux/contracts";
import type { Repo } from "../store/repo.js";

const TTL_MS = 24 * 60 * 60_000;
const MAX_BYTES = 2_000_000;
const MAX_MODELS = 500;
type CatalogRequest = { provider: ModelProvider; endpoint: string; generation: string; key?: string };
type CachedCatalog = { generation: string; endpoint: string; fetchedAt: number; models: ModelCapability[] };

function record(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}
function positive(value: unknown): number | undefined {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : undefined;
}
function price(value: unknown): number | undefined {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  if (typeof value === "string" && !value.trim()) return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n * 1_000_000 : undefined;
}

/** Provider metadata remains nonsecret; IDs pass through without an offline allowlist. */
export function parseModelCatalog(value: unknown, provider: ModelProvider): ModelCapability[] {
  const root = record(value);
  const entries = provider === "google" ? root?.models : root?.data;
  if (!Array.isArray(entries))
    throw new AuxError("backend_unavailable", "The provider returned an invalid model catalog.");
  const models = new Map<string, ModelCapability>();
  for (const item of entries) {
    const m = record(item);
    if (!m) continue;
    const rawId = provider === "google" ? m.name : m.id;
    if (typeof rawId !== "string") continue;
    const id = provider === "google" ? rawId.replace(/^models\//, "") : rawId;
    if (!id || id.length > 500 || id !== id.trim()) continue;
    const tags = Array.isArray(m.tags) ? m.tags.filter((tag): tag is string => typeof tag === "string") : [];
    const modalities = record(m.modalities)?.input ?? record(m.architecture)?.input_modalities;
    const pricing = record(m.pricing);
    const candidate: ModelCapability = {
      id,
      provider: provider === "gateway" && typeof m.owned_by === "string" ? m.owned_by : provider,
      source: "catalog",
      status: "verified",
      ...(typeof (m.name ?? m.display_name ?? m.displayName) === "string" && provider !== "google"
        ? { name: String(m.name ?? m.display_name ?? m.displayName).slice(0, 500) }
        : typeof m.displayName === "string"
          ? { name: m.displayName.slice(0, 500) }
          : {}),
      ...(positive(m.context_window ?? m.context_length ?? m.inputTokenLimit)
        ? { contextTokens: positive(m.context_window ?? m.context_length ?? m.inputTokenLimit) }
        : {}),
      ...(positive(m.max_tokens ?? record(m.top_provider)?.max_completion_tokens ?? m.outputTokenLimit)
        ? {
            maxOutputTokens: positive(
              m.max_tokens ?? record(m.top_provider)?.max_completion_tokens ?? m.outputTokenLimit,
            ),
          }
        : {}),
      ...(Array.isArray(modalities)
        ? {
            modalities: modalities.filter((kind): kind is "text" | "image" | "audio" =>
              ["text", "image", "audio"].includes(kind),
            ),
          }
        : {}),
      ...(provider === "openrouter" && Array.isArray(m.supported_parameters)
        ? {
            structuredOutput: m.supported_parameters.includes("response_format"),
            reasoning: m.supported_parameters.includes("reasoning")
              ? ("supported" as const)
              : ("none" as const),
          }
        : {}),
      ...(provider === "gateway"
        ? {
            structuredOutput: tags.includes("structured-output"),
            streaming: m.type === "language",
            reasoning: tags.includes("reasoning") ? ("supported" as const) : ("none" as const),
            promptCaching: tags.some((tag) => tag === "implicit-caching" || tag === "explicit-caching"),
          }
        : {}),
      ...(price(pricing?.input ?? pricing?.prompt) !== undefined
        ? { inputUsdPerMTok: price(pricing?.input ?? pricing?.prompt) }
        : {}),
      ...(price(pricing?.output ?? pricing?.completion) !== undefined
        ? { outputUsdPerMTok: price(pricing?.output ?? pricing?.completion) }
        : {}),
    };
    const parsed = ModelCapabilitySchema.safeParse(candidate);
    if (parsed.success) models.set(id, parsed.data);
    if (models.size > MAX_MODELS)
      throw new AuxError("backend_unavailable", "The model catalog exceeds its supported size.");
  }
  return [...models.values()];
}

async function boundedJson(response: Response): Promise<unknown> {
  if (!response.ok)
    throw new AuxError("backend_unavailable", `Model discovery failed with HTTP ${response.status}.`);
  const declared = Number(response.headers.get("content-length"));
  if (declared > MAX_BYTES) throw new AuxError("backend_unavailable", "The model catalog is too large.");
  const reader = response.body?.getReader();
  if (!reader) throw new AuxError("backend_unavailable", "The model catalog response is empty.");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    for (;;) {
      const part = await reader.read();
      if (part.done) break;
      bytes += part.value.byteLength;
      if (bytes > MAX_BYTES) throw new AuxError("backend_unavailable", "The model catalog is too large.");
      chunks.push(part.value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } finally {
    await reader.cancel().catch(() => {});
  }
}

export class ModelCatalogService {
  private closed = false;
  private inFlight = new Set<Promise<ModelCapability[]>>();
  private pending = new Map<string, { promise: Promise<ModelCapability[]>; controller: AbortController }>();
  constructor(
    private repo: Repo,
    private currentGeneration: () => string,
    private request: typeof fetch = fetch,
    private now = Date.now,
  ) {}

  invalidate(): void {
    for (const entry of this.pending.values()) entry.controller.abort();
    this.pending.clear();
  }

  async close(): Promise<void> {
    this.closed = true;
    this.invalidate();
    await Promise.allSettled(this.inFlight);
  }

  cached(input: CatalogRequest): ModelCapability[] | undefined {
    if (this.closed) return undefined;
    const value = this.repo.getSetting<CachedCatalog>(`modelCatalog:${input.provider}`);
    if (
      !value ||
      value.generation !== input.generation ||
      value.endpoint !== input.endpoint ||
      !Number.isFinite(value.fetchedAt) ||
      this.now() - value.fetchedAt < 0 ||
      this.now() - value.fetchedAt >= TTL_MS
    )
      return undefined;
    const parsed = ModelCapabilitySchema.array().max(MAX_MODELS).safeParse(value.models);
    return parsed.success ? parsed.data : undefined;
  }

  async list(input: CatalogRequest): Promise<ModelCapability[]> {
    if (this.closed) throw new AuxError("cancelled", "Model discovery is closed.");
    if (this.currentGeneration() !== input.generation)
      throw new AuxError("cancelled", "The model account changed.");
    const cached = this.cached(input);
    if (cached) return cached;
    const identity = JSON.stringify([input.provider, input.endpoint, input.generation]);
    const existing = this.pending.get(identity);
    if (existing) return existing.promise;
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(new AuxError("backend_unavailable", "Model discovery timed out.")),
      10_000,
    );
    const promise = this.load(input, controller.signal)
      .then((models) => {
        if (this.closed) throw new AuxError("cancelled", "Model discovery is closed.");
        if (this.currentGeneration() !== input.generation)
          throw new AuxError("cancelled", "The model account changed during discovery.");
        if (controller.signal.aborted) throw controller.signal.reason;
        this.repo.setSetting(`modelCatalog:${input.provider}`, {
          generation: input.generation,
          endpoint: input.endpoint,
          fetchedAt: this.now(),
          models,
        });
        return models;
      })
      .catch((error: unknown) => {
        if (this.closed) throw new AuxError("cancelled", "Model discovery is closed.");
        if (this.currentGeneration() !== input.generation)
          throw new AuxError("cancelled", "The model account changed during discovery.");
        if (controller.signal.aborted)
          throw controller.signal.reason instanceof AuxError
            ? controller.signal.reason
            : new AuxError("cancelled", "Model discovery was cancelled.");
        throw error;
      })
      .finally(() => {
        clearTimeout(timeout);
        this.inFlight.delete(promise);
        if (this.pending.get(identity)?.controller === controller) this.pending.delete(identity);
      });
    this.pending.set(identity, { promise, controller });
    this.inFlight.add(promise);
    return promise;
  }

  private async load(input: CatalogRequest, signal: AbortSignal): Promise<ModelCapability[]> {
    const expected = {
      gateway: "https://ai-gateway.vercel.sh/v1",
      openai: "https://api.openai.com/v1",
      anthropic: "https://api.anthropic.com/v1",
      google: "https://generativelanguage.googleapis.com/v1beta",
      openrouter: "https://openrouter.ai/api/v1",
    };
    if (input.provider !== "openai-compatible" && input.endpoint !== expected[input.provider])
      throw new AuxError("invalid_params", "The provider catalog destination is invalid.");
    const destination = new URL(input.endpoint);
    if (
      destination.username ||
      destination.password ||
      destination.search ||
      destination.hash ||
      (destination.protocol !== "https:" &&
        !(
          destination.protocol === "http:" &&
          ["localhost", "127.0.0.1", "[::1]"].includes(destination.hostname)
        ))
    )
      throw new AuxError("invalid_params", "The provider catalog destination is invalid.");
    const headers: Record<string, string> = { Accept: "application/json" };
    if (input.key) {
      if (input.provider === "anthropic") {
        headers["x-api-key"] = input.key;
        headers["anthropic-version"] = "2023-06-01";
      } else if (input.provider === "google") headers["x-goog-api-key"] = input.key;
      else headers.Authorization = `Bearer ${input.key}`;
    }
    const models = new Map<string, ModelCapability>();
    const cursors = new Set<string>();
    let cursor: string | undefined;
    do {
      if (cursors.size >= 32)
        throw new AuxError("backend_unavailable", "The model catalog has too many pages.");
      const url = new URL(`${input.endpoint}/models`);
      if (cursor) url.searchParams.set(input.provider === "google" ? "pageToken" : "after_id", cursor);
      const body = await boundedJson(await this.request(url, { headers, signal, redirect: "error" }));
      for (const model of parseModelCatalog(body, input.provider)) models.set(model.id, model);
      if (models.size > MAX_MODELS)
        throw new AuxError("backend_unavailable", "The model catalog exceeds its supported size.");
      const meta = record(body);
      if (input.provider === "anthropic" && meta?.has_more === true && typeof meta.last_id !== "string")
        throw new AuxError("backend_unavailable", "The model catalog pagination is invalid.");
      if (
        input.provider === "google" &&
        meta?.nextPageToken !== undefined &&
        typeof meta.nextPageToken !== "string"
      )
        throw new AuxError("backend_unavailable", "The model catalog pagination is invalid.");
      cursor =
        input.provider === "google" && typeof meta?.nextPageToken === "string"
          ? meta.nextPageToken
          : input.provider === "anthropic" && meta?.has_more === true && typeof meta.last_id === "string"
            ? meta.last_id
            : undefined;
      if (cursor && (!cursor.trim() || cursor.length > 2000 || cursors.has(cursor)))
        throw new AuxError("backend_unavailable", "The model catalog pagination is invalid.");
      if (cursor) cursors.add(cursor);
    } while (cursor);
    return [...models.values()];
  }
}

export type { LocalModelServer } from "@aux/contracts";
import type { LocalModelServer } from "@aux/contracts";
/** Fixed loopback probes never send credentials or follow redirects. */
export async function discoverLocalModels(
  request: typeof fetch = fetch,
  signal?: AbortSignal,
): Promise<LocalModelServer[]> {
  const endpoints = [
    {
      kind: "ollama" as const,
      endpoint: "http://127.0.0.1:11434/v1",
      url: "http://127.0.0.1:11434/api/tags",
    },
    {
      kind: "lm-studio" as const,
      endpoint: "http://127.0.0.1:1234/v1",
      url: "http://127.0.0.1:1234/v1/models",
    },
    ...[8080, 8000].map((port) => ({
      kind: "compatible" as const,
      endpoint: `http://127.0.0.1:${port}/v1`,
      url: `http://127.0.0.1:${port}/v1/models`,
    })),
  ];
  const results = await Promise.all(
    endpoints.map(async (input): Promise<LocalModelServer | undefined> => {
      try {
        const body = await boundedJson(
          await request(input.url, {
            signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(1000)]) : AbortSignal.timeout(1000),
            redirect: "error",
            headers: { Accept: "application/json" },
          }),
        );
        const raw =
          input.kind === "ollama"
            ? {
                data: (record(body)?.models as unknown[] | undefined)?.flatMap((item) => {
                  const model = record(item);
                  return typeof model?.name === "string" ? [{ id: model.name }] : [];
                }),
              }
            : body;
        const models = parseModelCatalog(raw, "openai-compatible");
        return models.length ? { kind: input.kind, endpoint: input.endpoint, models } : undefined;
      } catch {
        return undefined;
      }
    }),
  );
  return results.filter((value): value is LocalModelServer => !!value);
}
