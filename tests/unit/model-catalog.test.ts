import { afterEach, expect, it, vi } from "vitest";
import { ModelCatalogService, discoverLocalModels, openDb, parseModelCatalog, Repo } from "@aux/runtime";
const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => {
  for (const db of databases.splice(0)) db.close();
});
function fixture(request: typeof fetch, now = () => 1000) {
  const db = openDb(":memory:");
  databases.push(db);
  const repo = new Repo(db);
  let generation = "original";
  const service = new ModelCatalogService(repo, () => generation, request, now);
  return {
    repo,
    service,
    change: () => {
      generation = "replacement";
      service.invalidate();
    },
  };
}
const input = {
  provider: "gateway" as const,
  endpoint: "https://ai-gateway.vercel.sh/v1",
  generation: "original",
};
it("coalesces discovery, persists bounded metadata for 24 hours, and passes new IDs through", async () => {
  let time = 1000;
  const request = vi.fn<typeof fetch>().mockResolvedValue(
    new Response(
      JSON.stringify({
        data: [{ id: "new/future-model", name: "Future", type: "language", pricing: { input: "0.000002" } }],
      }),
    ),
  );
  const f = fixture(request, () => time);
  const [a, b] = await Promise.all([f.service.list(input), f.service.list(input)]);
  expect(a).toEqual(b);
  expect(a[0]).toMatchObject({ id: "new/future-model", inputUsdPerMTok: 2, source: "catalog" });
  expect(request).toHaveBeenCalledTimes(1);
  const restored = new ModelCatalogService(
    f.repo,
    () => "original",
    request,
    () => time,
  );
  expect(await restored.list(input)).toEqual(a);
  expect(request).toHaveBeenCalledTimes(1);
  time += 24 * 60 * 60_000;
  request.mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ id: "new/next" }] })));
  expect((await restored.list(input))[0]?.id).toBe("new/next");
  expect(request).toHaveBeenCalledTimes(2);
});
it("does not cache a late response after the original account changes", async () => {
  let respond!: (response: Response) => void;
  const request = vi.fn<typeof fetch>().mockImplementation(
    () =>
      new Promise((resolve) => {
        respond = resolve;
      }),
  );
  const f = fixture(request),
    pending = f.service.list(input);
  f.change();
  respond(new Response(JSON.stringify({ data: [{ id: "late/model" }] })));
  await expect(pending).rejects.toMatchObject({ code: "cancelled" });
  expect(f.repo.getSetting("modelCatalog:gateway")).toBeUndefined();
});
it("uses native provider authentication and rejects repeated pagination cursors", async () => {
  const request = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ data: [{ id: "claude-future" }], has_more: true, last_id: "cursor" })),
    )
    .mockResolvedValueOnce(new Response(JSON.stringify({ data: [], has_more: true, last_id: "cursor" })));
  const f = fixture(request);
  await expect(
    f.service.list({
      ...input,
      provider: "anthropic",
      endpoint: "https://api.anthropic.com/v1",
      key: "synthetic-key",
    }),
  ).rejects.toThrow(/pagination/);
  expect(request.mock.calls[0]?.[1]).toMatchObject({
    redirect: "error",
    headers: { "x-api-key": "synthetic-key", "anthropic-version": "2023-06-01" },
  });
  expect(String(request.mock.calls[1]?.[0])).toContain("after_id=cursor");
  expect(f.repo.getSetting("modelCatalog:anthropic")).toBeUndefined();
});
it("refuses oversized bodies and credential destinations outside the chosen provider", async () => {
  const request = vi
    .fn<typeof fetch>()
    .mockResolvedValue(new Response("{}", { headers: { "content-length": "2000001" } }));
  const f = fixture(request);
  await expect(f.service.list(input)).rejects.toThrow(/too large/);
  await expect(
    f.service.list({ ...input, provider: "openai", endpoint: "https://other.test/v1", key: "synthetic-key" }),
  ).rejects.toMatchObject({ code: "invalid_params" });
  expect(request).toHaveBeenCalledTimes(1);
});
it("discovers actual loopback models without credentials or redirects", async () => {
  const request = vi
    .fn<typeof fetch>()
    .mockImplementation(async (url) =>
      String(url).includes("11434")
        ? new Response(JSON.stringify({ models: [{ name: "actual-local-model" }] }))
        : new Response("", { status: 404 }),
    );
  expect(await discoverLocalModels(request)).toMatchObject([
    { kind: "ollama", endpoint: "http://127.0.0.1:11434/v1", models: [{ id: "actual-local-model" }] },
  ]);
  expect(request).toHaveBeenCalledTimes(4);
  for (const [url, options] of request.mock.calls) {
    expect(new URL(String(url)).hostname).toBe("127.0.0.1");
    expect(options).toMatchObject({ redirect: "error", headers: { Accept: "application/json" } });
    expect(new Headers(options?.headers).has("Authorization")).toBe(false);
  }
});
it("preserves native Google IDs, context limits and unknown capabilities", () => {
  expect(
    parseModelCatalog(
      {
        models: [
          { name: "models/future-native", displayName: "Future", inputTokenLimit: 123, outputTokenLimit: 45 },
        ],
      },
      "google",
    ),
  ).toEqual([
    {
      id: "future-native",
      name: "Future",
      provider: "google",
      contextTokens: 123,
      maxOutputTokens: 45,
      source: "catalog",
      status: "verified",
    },
  ]);
});

it("retains explicit provider text capabilities without guessing from IDs or unfamiliar metadata", () => {
  const gateway = parseModelCatalog(
    {
      data: [
        { id: "future/language", type: "language" },
        { id: "future/picture", type: "image" },
        { id: "future/vector", type: "embedding" },
        { id: "future/rank", type: "reranking" },
        { id: "future/movie", type: "video" },
        { id: "future/transcription", type: "transcription" },
        { id: "future/speech", type: "speech" },
        { id: "future/new-type", type: "new-type" },
        { id: "name-contains-image-and-embedding" },
      ],
    },
    "gateway",
  );
  expect(gateway.map(({ id, textGeneration }) => [id, textGeneration])).toEqual([
    ["future/language", true],
    ["future/picture", false],
    ["future/vector", false],
    ["future/rank", false],
    ["future/movie", false],
    ["future/transcription", false],
    ["future/speech", false],
    ["future/new-type", false],
    ["name-contains-image-and-embedding", undefined],
  ]);
  expect(
    parseModelCatalog(
      {
        data: [
          { id: "multimodal", architecture: { output_modalities: ["text", "image"] } },
          { id: "image-only", architecture: { output_modalities: ["image"] } },
          { id: "unknown", architecture: { output_modalities: [] } },
        ],
      },
      "openrouter",
    ).map((model) => model.textGeneration),
  ).toEqual([true, false, undefined]);
  expect(
    parseModelCatalog(
      {
        models: [
          { name: "models/chat", supportedGenerationMethods: ["generateContent", "countTokens"] },
          { name: "models/vector", supportedGenerationMethods: ["embedContent"] },
          { name: "models/unknown" },
        ],
      },
      "google",
    ).map((model) => model.textGeneration),
  ).toEqual([true, false, undefined]);
});

it("maps an actual aborted metadata request to account cancellation", async () => {
  const request = vi.fn<typeof fetch>().mockImplementation(
    (_url, options) =>
      new Promise((_resolve, reject) => {
        options?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), {
          once: true,
        });
      }),
  );
  const f = fixture(request),
    pending = f.service.list(input);
  f.change();
  await expect(pending).rejects.toMatchObject({ code: "cancelled" });
  expect(f.repo.getSetting("modelCatalog:gateway")).toBeUndefined();
});

it("drains aborted discovery before repository shutdown and refuses later requests", async () => {
  const request = vi.fn<typeof fetch>().mockImplementation(
    (_url, options) =>
      new Promise((_resolve, reject) => {
        options?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), {
          once: true,
        });
      }),
  );
  const f = fixture(request),
    pending = f.service.list(input);
  const outcome = pending.then(
    () => undefined,
    (error: unknown) => error,
  );
  await f.service.close();
  expect(await outcome).toMatchObject({ code: "cancelled" });
  expect(f.repo.getSetting("modelCatalog:gateway")).toBeUndefined();
  await expect(f.service.list(input)).rejects.toMatchObject({ code: "cancelled" });
  expect(request).toHaveBeenCalledTimes(1);
});

it("admits only documented V4 duration-priced batch audio and preserves zero", () => {
  const entries = [
    {
      id: "openai/whisper-1",
      type: "transcription",
      supported_specifications: ["v4"],
      pricing: { transcription_duration_cost_per_second: "0" },
    },
    {
      id: "microsoft/mai-transcribe-2",
      type: "transcription",
      supported_specifications: ["v4"],
      pricing: { input: "0", transcription_duration_cost_per_second: "0.00002778" },
    },
    {
      id: "openai/gpt-4o-transcribe",
      type: "transcription",
      supported_specifications: ["v4"],
      pricing: { audio_input: "0.000001" },
    },
    {
      id: "google/gemini-3.5-transcribe-live",
      type: "transcription",
      supported_specifications: ["v4"],
      tags: ["websocket-transcription"],
      pricing: { transcription_duration_cost_per_second: "0.001" },
    },
    {
      id: "fish-audio/transcribe-1",
      type: "transcription",
      supported_specifications: ["v3"],
      pricing: { transcription_duration_cost_per_second: "0.001" },
    },
  ];
  const models = parseModelCatalog({ data: entries }, "gateway");
  expect(models[0]).toMatchObject({ textGeneration: false, transcription: { batch: true, usdPerSecond: 0 } });
  expect(models[1]).toMatchObject({ inputUsdPerMTok: 0, transcription: { usdPerSecond: 0.00002778 } });
  expect(models.slice(2).every((model) => !model.transcription && model.textGeneration === false)).toBe(true);
});
