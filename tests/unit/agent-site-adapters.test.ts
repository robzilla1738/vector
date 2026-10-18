import { afterEach, expect, it, vi } from "vitest";
import { SiteAdapters, siteExportUrl } from "../../apps/runtime/src/agent/site-adapters.js";
import type { MethodParams } from "@aux/contracts";
import type { PageRegistry } from "../../apps/runtime/src/services/pages/registry.js";

afterEach(() => vi.unstubAllGlobals());
const docId = "document_fixture_id_123456789";

function fixture(input: MethodParams<"sites.read">, body: string, contentType: string) {
  const page = { pageId: input.pageId, url: input.expectedUrl, documentEpoch: input.expectedDocumentEpoch };
  const fetches: { url: string; init: RequestInit }[] = [];
  vi.stubGlobal("location", { href: input.expectedUrl, origin: new URL(input.expectedUrl).origin });
  vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
    fetches.push({ url, init });
    return new Response(body, { headers: { "content-type": contentType } });
  });
  const driver = {
    isAttached: () => true,
    evaluate: async (expression: string) => new Function(`return ${expression}`)(),
  };
  const registry = { get: () => page, driverPageLenient: () => driver } as unknown as Pick<
    PageRegistry,
    "get" | "driverPageLenient"
  >;
  return {
    adapter: new SiteAdapters(registry, (url) => url.origin === new URL(input.expectedUrl).origin),
    fetches,
    page,
  };
}

it("exports a current authorized Google Doc without following cross-origin redirects", async () => {
  const input = {
    kind: "google-docs" as const,
    pageId: "p1",
    taskId: "task1",
    expectedRevision: 1,
    expectedDocumentEpoch: 4,
    expectedUrl: `https://docs.google.com/document/d/${docId}/edit`,
  };
  const { adapter, fetches, page } = fixture(
    input,
    "Quarterly facts\nRevenue 42",
    "text/plain; charset=utf-8",
  );
  const result = await adapter.read(input);
  expect(result).toMatchObject({
    kind: "google-docs",
    pageId: "p1",
    documentEpoch: 4,
    mediaType: "text/plain",
    text: "Quarterly facts\nRevenue 42",
  });
  expect(fetches[0]).toMatchObject({
    url: `https://docs.google.com/document/d/${docId}/export?format=txt`,
    init: {
      method: "GET",
      credentials: "same-origin",
      redirect: "manual",
      cache: "no-store",
    },
  });
  expect(fetches[0]?.init.signal).toBeInstanceOf(AbortSignal);
  page.documentEpoch++;
  await expect(adapter.read(input)).rejects.toMatchObject({ code: "conflict" });
});

it("exports only the selected Google Sheet as bounded CSV", async () => {
  const input = {
    kind: "google-sheets" as const,
    pageId: "p2",
    taskId: "task1",
    expectedRevision: 1,
    expectedDocumentEpoch: 2,
    expectedUrl: `https://docs.google.com/spreadsheets/d/${docId}/edit#gid=123`,
  };
  const { adapter, fetches } = fixture(input, "name,total\nAda,42", "text/csv; charset=utf-8");
  expect((await adapter.read(input)).text).toBe("name,total\nAda,42");
  expect(fetches[0]?.url).toBe(`https://docs.google.com/spreadsheets/d/${docId}/export?format=csv&gid=123`);
  expect(() => siteExportUrl({ ...input, sheetGid: "not-numeric" })).toThrow();
});

it("reads a YouTube caption track only from the same-origin timedtext endpoint", async () => {
  const input = {
    kind: "youtube" as const,
    pageId: "p3",
    taskId: "task1",
    expectedRevision: 1,
    expectedDocumentEpoch: 3,
    expectedUrl: "https://www.youtube.com/watch?v=abcdefghijk",
  };
  vi.stubGlobal("ytInitialPlayerResponse", {
    videoDetails: { videoId: "abcdefghijk" },
    captions: {
      playerCaptionsTracklistRenderer: {
        captionTracks: [
          { languageCode: "en", baseUrl: "https://www.youtube.com/api/timedtext?v=abcdefghijk&lang=en" },
        ],
      },
    },
  });
  const { adapter, fetches } = fixture(
    input,
    JSON.stringify({
      events: [
        { tStartMs: 120, dDurationMs: 1000, segs: [{ utf8: "Hello" }] },
        { tStartMs: 1120, segs: [{ utf8: " world" }] },
      ],
    }),
    "application/json",
  );
  expect(await adapter.read(input)).toMatchObject({
    text: "Hello world",
    transcript: {
      videoId: "abcdefghijk",
      language: "en",
      generated: false,
      cues: [
        { startMs: 120, durationMs: 1000, text: "Hello" },
        { startMs: 1120, text: "world" },
      ],
    },
  });
  expect(fetches[0]?.url).toContain("/api/timedtext?");
  vi.stubGlobal("ytInitialPlayerResponse", {
    videoDetails: { videoId: "abcdefghijk" },
    captions: {
      playerCaptionsTracklistRenderer: {
        captionTracks: [{ languageCode: "en", baseUrl: "https://other.example/api/timedtext" }],
      },
    },
  });
  await expect(adapter.read(input)).rejects.toMatchObject({ code: "capability_unsupported" });
  expect(fetches).toHaveLength(1);
});

it("selects the exact requested caption language, prefers authored tracks and reports real timings", async () => {
  const input = {
    kind: "youtube" as const,
    pageId: "p3",
    taskId: "task1",
    expectedRevision: 1,
    expectedDocumentEpoch: 3,
    expectedUrl: "https://www.youtube.com/watch?v=abcdefghijk",
    language: "fr",
  };
  vi.stubGlobal("ytInitialPlayerResponse", {
    videoDetails: { videoId: "abcdefghijk" },
    captions: {
      playerCaptionsTracklistRenderer: {
        captionTracks: [
          { languageCode: "en", baseUrl: "https://www.youtube.com/api/timedtext?v=abcdefghijk&lang=en" },
          {
            languageCode: "fr",
            kind: "asr",
            baseUrl: "https://www.youtube.com/api/timedtext?v=abcdefghijk&lang=fr&kind=asr",
          },
          { languageCode: "fr", baseUrl: "https://www.youtube.com/api/timedtext?v=abcdefghijk&lang=fr" },
        ],
      },
    },
  });
  const { adapter, fetches } = fixture(
    input,
    JSON.stringify({ events: [{ tStartMs: 2500, dDurationMs: 1000, segs: [{ utf8: "Bonjour" }] }] }),
    "application/json",
  );
  expect(await adapter.read(input)).toMatchObject({
    transcript: {
      language: "fr",
      generated: false,
      cues: [{ startMs: 2500, durationMs: 1000, text: "Bonjour" }],
    },
  });
  expect(new URL(fetches[0]!.url).searchParams.get("lang")).toBe("fr");
  expect(new URL(fetches[0]!.url).searchParams.has("kind")).toBe(false);
  await expect(adapter.read({ ...input, language: "de" })).rejects.toMatchObject({
    code: "capability_unsupported",
  });
  expect(fetches).toHaveLength(1);
});

it("rejects stale YouTube player identity and mismatched signed caption tracks before fetching", async () => {
  const input = {
    kind: "youtube" as const,
    pageId: "p3",
    taskId: "task1",
    expectedRevision: 1,
    expectedDocumentEpoch: 3,
    expectedUrl: "https://www.youtube.com/watch?v=abcdefghijk",
  };
  const { adapter, fetches } = fixture(
    input,
    JSON.stringify({ events: [{ tStartMs: 0, segs: [{ utf8: "text" }] }] }),
    "application/json",
  );
  const captions = {
    playerCaptionsTracklistRenderer: {
      captionTracks: [{ languageCode: "en", baseUrl: "https://www.youtube.com/api/timedtext?v=other_video" }],
    },
  };
  vi.stubGlobal("ytInitialPlayerResponse", { videoDetails: { videoId: "other_video" }, captions });
  await expect(adapter.read(input)).rejects.toMatchObject({ code: "capability_unsupported" });
  vi.stubGlobal("ytInitialPlayerResponse", { videoDetails: { videoId: "abcdefghijk" }, captions });
  await expect(adapter.read(input)).rejects.toMatchObject({ code: "capability_unsupported" });
  expect(fetches).toHaveLength(0);
});

it("does not manufacture transcript timing from malformed caption events", async () => {
  const input = {
    kind: "youtube" as const,
    pageId: "p3",
    taskId: "task1",
    expectedRevision: 1,
    expectedDocumentEpoch: 3,
    expectedUrl: "https://www.youtube.com/watch?v=abcdefghijk",
  };
  vi.stubGlobal("ytInitialPlayerResponse", {
    videoDetails: { videoId: "abcdefghijk" },
    captions: {
      playerCaptionsTracklistRenderer: {
        captionTracks: [
          { languageCode: "en", baseUrl: "https://www.youtube.com/api/timedtext?v=abcdefghijk" },
        ],
      },
    },
  });
  for (const events of [
    [{ segs: [{ utf8: "untimed" }] }],
    [{ tStartMs: -1, segs: [{ utf8: "negative" }] }],
    [{ tStartMs: 0, segs: [{ utf8: 42 }] }],
  ]) {
    const { adapter } = fixture(input, JSON.stringify({ events }), "application/json");
    await expect(adapter.read(input)).rejects.toMatchObject({ code: "capability_unsupported" });
  }
});

it("refuses unrelated origins and malformed source paths before reading page content", async () => {
  const input = {
    kind: "google-docs" as const,
    pageId: "p1",
    taskId: "task1",
    expectedRevision: 1,
    expectedDocumentEpoch: 1,
    expectedUrl: `https://docs.google.com/document/d/${docId}/edit`,
  };
  const { adapter, fetches } = fixture(input, "text", "text/plain");
  const denied = new SiteAdapters(
    {
      get: () => {
        throw new Error("must not read page");
      },
      driverPageLenient: () => {
        throw new Error("must not attach");
      },
    } as unknown as PageRegistry,
    () => false,
  );
  await expect(denied.read(input)).rejects.toMatchObject({ code: "permission_denied" });
  expect(fetches).toHaveLength(0);
  await expect(
    adapter.read({ ...input, expectedUrl: "https://evil.example/document/d/12345678901234567890/edit" }),
  ).rejects.toMatchObject({ code: "capability_unsupported" });
  await expect(adapter.read({ ...input, sheetGid: "123" })).rejects.toMatchObject({ code: "invalid_params" });
});

it("refuses oversized exports and documents that navigate while exporting", async () => {
  const input = {
    kind: "google-docs" as const,
    pageId: "p1",
    taskId: "task1",
    expectedRevision: 1,
    expectedDocumentEpoch: 1,
    expectedUrl: `https://docs.google.com/document/d/${docId}/edit`,
  };
  const { adapter, page } = fixture(input, "text", "text/plain");
  vi.stubGlobal(
    "fetch",
    async () =>
      new Response("oversized", { headers: { "content-type": "text/plain", "content-length": "2000001" } }),
  );
  await expect(adapter.read(input)).rejects.toMatchObject({ code: "capability_unsupported" });
  vi.stubGlobal("fetch", async () => {
    page.documentEpoch++;
    return new Response("secret", { headers: { "content-type": "text/plain" } });
  });
  await expect(adapter.read(input)).rejects.toMatchObject({ code: "conflict" });
});
