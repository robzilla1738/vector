import { AuxError, SiteReadResultSchema, type MethodParams, type MethodResult } from "@aux/contracts";
import type { PageRegistry } from "../services/pages/registry.js";
import { readImageResultsInPage } from "./image-search-adapter.js";

type SiteRead = MethodParams<"sites.read">;
type InPageResult =
  | {
      ok: true;
      text: string;
      mediaType: "text/plain" | "text/csv";
      transcript?: MethodResult<"sites.read">["transcript"];
      imageSearch?: MethodResult<"sites.read">["imageSearch"];
    }
  | { ok: false; reason: string };
const MAX_TEXT_BYTES = 2_000_000;

/** Only URLs for the currently open document can be used as export sources. */
export function siteExportUrl(input: SiteRead): URL {
  const page = new URL(input.expectedUrl);
  if (input.kind !== "google-sheets" && input.sheetGid !== undefined)
    throw new AuxError("invalid_params", "A sheet ID is accepted only for a Google Sheets export.");
  if (input.kind !== "youtube" && input.language !== undefined)
    throw new AuxError("invalid_params", "A transcript language is accepted only for YouTube.");
  if (page.protocol !== "https:" || page.username || page.password)
    throw new AuxError(
      "permission_denied",
      "Site export requires a secure page without embedded credentials.",
    );
  if (input.kind === "image-search") {
    const google =
      ["www.google.com", "google.com"].includes(page.hostname) &&
      page.pathname === "/search" &&
      (page.searchParams.get("tbm") === "isch" || page.searchParams.get("udm") === "2");
    const bing = ["www.bing.com", "bing.com"].includes(page.hostname) && page.pathname === "/images/search";
    const query = page.searchParams.get("q");
    if (!(google || bing) || !query?.trim() || query.length > 500)
      throw new AuxError(
        "capability_unsupported",
        "Open Google Images or Bing Images results before extracting images.",
      );
    return page;
  }
  if (input.kind === "youtube") {
    if (
      page.hostname !== "www.youtube.com" ||
      page.pathname !== "/watch" ||
      !/^[A-Za-z0-9_-]{11}$/.test(page.searchParams.get("v") ?? "")
    )
      throw new AuxError(
        "capability_unsupported",
        "Open the YouTube watch page before reading its transcript.",
      );
    return new URL("/api/timedtext", page.origin);
  }
  if (page.hostname !== "docs.google.com")
    throw new AuxError("capability_unsupported", "Open the Google document or sheet before exporting it.");
  const route = input.kind === "google-docs" ? "document" : "spreadsheets";
  const match = new RegExp(`^/${route}/d/([A-Za-z0-9_-]{20,200})(?:/|$)`).exec(page.pathname);
  if (!match)
    throw new AuxError(
      "capability_unsupported",
      `Open a Google ${input.kind === "google-docs" ? "Doc" : "Sheet"} before exporting it.`,
    );
  const exportUrl = new URL(`/${route}/d/${match[1]}/export`, page.origin);
  exportUrl.searchParams.set("format", input.kind === "google-docs" ? "txt" : "csv");
  if (input.kind === "google-sheets") {
    const gid =
      input.sheetGid ?? page.searchParams.get("gid") ?? new URLSearchParams(page.hash.slice(1)).get("gid");
    if (gid && /^\d{1,20}$/.test(gid)) exportUrl.searchParams.set("gid", gid);
    else if (gid) throw new AuxError("invalid_params", "The sheet ID must be a numeric gid.");
  }
  return exportUrl;
}

/** Runs only in the exact authorized page; it cannot follow redirects or contact a second origin. */
export async function readSiteTextInPage(input: {
  kind: SiteRead["kind"];
  expectedUrl: string;
  exportUrl: string;
  language?: string;
}): Promise<InPageResult> {
  const maxBytes = 2_000_000;
  if (location.href !== input.expectedUrl) return { ok: false, reason: "document_changed" };
  let target = new URL(input.exportUrl);
  let transcriptTrack: { languageCode: string; kind?: string } | undefined;
  let videoId: string | undefined;
  if (input.kind === "youtube") {
    const state = (
      globalThis as typeof globalThis & {
        ytInitialPlayerResponse?: {
          videoDetails?: { videoId?: string };
          captions?: {
            playerCaptionsTracklistRenderer?: {
              captionTracks?: { baseUrl?: string; languageCode?: string; kind?: string }[];
            };
          };
        };
      }
    ).ytInitialPlayerResponse;
    videoId = new URL(input.expectedUrl).searchParams.get("v") ?? undefined;
    if (!videoId || state?.videoDetails?.videoId !== videoId)
      return { ok: false, reason: "transcript_document_changed" };
    const tracks = state?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
    const language = input.language?.toLowerCase();
    const eligible = language
      ? tracks.filter((item) => item.languageCode?.toLowerCase() === language)
      : tracks.filter((item) => item.languageCode?.toLowerCase().startsWith("en"));
    const candidates = eligible.length || language ? eligible : tracks;
    const track = candidates.find((item) => item.kind !== "asr") ?? candidates[0];
    if (!track?.baseUrl || !track.languageCode || track.languageCode.length > 64)
      return { ok: false, reason: "transcript_unavailable" };
    transcriptTrack = { languageCode: track.languageCode, kind: track.kind };
    target = new URL(track.baseUrl);
    if (target.origin !== location.origin || target.pathname !== "/api/timedtext")
      return { ok: false, reason: "transcript_origin" };
    if (
      target.username ||
      target.password ||
      (target.searchParams.has("v") && target.searchParams.get("v") !== videoId)
    )
      return { ok: false, reason: "transcript_document_changed" };
    target.searchParams.set("fmt", "json3");
  }
  if (target.origin !== location.origin || target.protocol !== "https:")
    return { ok: false, reason: "export_origin" };
  let response: Response;
  try {
    response = await fetch(target.href, {
      method: "GET",
      credentials: "same-origin",
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return { ok: false, reason: "export_unavailable" };
  }
  if (!response.ok || response.type === "opaqueredirect") return { ok: false, reason: "export_unavailable" };
  const type = (response.headers.get("content-type") ?? "").toLowerCase();
  const expectedType =
    input.kind === "google-sheets"
      ? "text/csv"
      : input.kind === "google-docs"
        ? "text/plain"
        : "application/json";
  if (!type.startsWith(expectedType)) return { ok: false, reason: "export_content_type" };
  if (Number(response.headers.get("content-length") ?? 0) > maxBytes)
    return { ok: false, reason: "export_too_large" };
  const reader = response.body?.getReader();
  if (!reader) return { ok: false, reason: "export_unavailable" };
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    bytes += part.value.byteLength;
    if (bytes > maxBytes) {
      await reader.cancel();
      return { ok: false, reason: "export_too_large" };
    }
    chunks.push(part.value);
  }
  const data = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) {
    data.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const body = new TextDecoder().decode(data);
  if (input.kind !== "youtube")
    return { ok: true, text: body, mediaType: input.kind === "google-sheets" ? "text/csv" : "text/plain" };
  let parsed: { events?: { tStartMs?: number; dDurationMs?: number; segs?: { utf8?: string }[] }[] };
  try {
    parsed = JSON.parse(body) as typeof parsed;
  } catch {
    return { ok: false, reason: "transcript_invalid" };
  }
  if (!parsed || !Array.isArray(parsed.events) || parsed.events.length > 10_000)
    return { ok: false, reason: "transcript_invalid" };
  const cues: NonNullable<MethodResult<"sites.read">["transcript"]>["cues"] = [];
  for (const event of parsed.events) {
    if (!event || typeof event !== "object" || (event.segs !== undefined && !Array.isArray(event.segs)))
      return { ok: false, reason: "transcript_invalid" };
    if (!event.segs?.length) continue;
    if (event.segs.some((segment) => !segment || typeof segment.utf8 !== "string"))
      return { ok: false, reason: "transcript_invalid" };
    const text = event.segs
      .map((segment) => segment.utf8)
      .join("")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) continue;
    if (
      typeof event.tStartMs !== "number" ||
      !Number.isFinite(event.tStartMs) ||
      event.tStartMs < 0 ||
      event.tStartMs > 86_400_000 ||
      (event.dDurationMs !== undefined &&
        (!Number.isFinite(event.dDurationMs) || event.dDurationMs < 0 || event.dDurationMs > 86_400_000))
    )
      return { ok: false, reason: "transcript_invalid" };
    cues.push({
      startMs: event.tStartMs,
      ...(event.dDurationMs !== undefined ? { durationMs: event.dDurationMs } : {}),
      text,
    });
  }
  const text = cues.map((cue) => cue.text).join(" ");
  if (!text || new TextEncoder().encode(text).length > maxBytes)
    return { ok: false, reason: "transcript_unavailable" };
  if (!transcriptTrack || !videoId || location.href !== input.expectedUrl)
    return { ok: false, reason: "transcript_document_changed" };
  return {
    ok: true,
    text,
    mediaType: "text/plain",
    transcript: {
      videoId,
      language: transcriptTrack.languageCode,
      generated: transcriptTrack.kind === "asr",
      cues,
    },
  };
}

export class SiteAdapters {
  constructor(
    private pages: Pick<PageRegistry, "get" | "driverPageLenient">,
    private allowOrigin: (url: URL) => boolean,
  ) {}
  async read(input: SiteRead) {
    const exportUrl = siteExportUrl(input);
    if (!this.allowOrigin(exportUrl))
      throw new AuxError("permission_denied", `Web egress is not granted for ${exportUrl.origin}.`);
    const before = this.pages.get(input.pageId);
    if (before.documentEpoch !== input.expectedDocumentEpoch || before.url !== input.expectedUrl)
      throw new AuxError("conflict", "The page changed before site extraction.");
    const driver = this.pages.driverPageLenient(input.pageId);
    let result: InPageResult;
    try {
      result = (await driver.evaluate(
        `(${(input.kind === "image-search" ? readImageResultsInPage : readSiteTextInPage).toString()})(${JSON.stringify({ kind: input.kind, expectedUrl: input.expectedUrl, exportUrl: exportUrl.href, language: input.language })})`,
      )) as InPageResult;
    } catch {
      throw new AuxError("backend_unavailable", "The site export could not be read from the current page.");
    }
    const after = this.pages.get(input.pageId);
    if (
      after.documentEpoch !== input.expectedDocumentEpoch ||
      after.url !== input.expectedUrl ||
      !driver.isAttached()
    )
      throw new AuxError("conflict", "The page changed during site extraction.");
    if (!result || result.ok !== true || typeof result.text !== "string")
      throw new AuxError(
        "capability_unsupported",
        "This site did not provide a readable export in the current page.",
      );
    if (Buffer.byteLength(result.text, "utf8") > MAX_TEXT_BYTES)
      throw new AuxError("capability_unsupported", "The site export exceeds the 2 MB text limit.");
    return SiteReadResultSchema.parse({
      pageId: input.pageId,
      url: input.expectedUrl,
      documentEpoch: input.expectedDocumentEpoch,
      capturedAt: Date.now(),
      kind: input.kind,
      sourceUrl: exportUrl.href,
      mediaType: result.mediaType,
      text: result.text,
      ...(result.transcript ? { transcript: result.transcript } : {}),
      ...(result.imageSearch ? { imageSearch: result.imageSearch } : {}),
    });
  }
}
