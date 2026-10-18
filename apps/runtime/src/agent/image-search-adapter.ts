import type { MethodResult } from "@aux/contracts";

/** Reads source-linked results already exposed by the authorized search page.
 * It neither fetches image bytes nor invents original dimensions from thumbnails.
 * Keep this function self-contained: it executes in that exact browser document.
 */
export function readImageResultsInPage(input: { expectedUrl: string }):
  | {
      ok: true;
      text: string;
      mediaType: "text/plain";
      imageSearch: NonNullable<MethodResult<"sites.read">["imageSearch"]>;
    }
  | { ok: false; reason: string } {
  if (location.href !== input.expectedUrl) return { ok: false, reason: "document_changed" };
  const page = new URL(input.expectedUrl);
  const engine = page.hostname === "www.bing.com" || page.hostname === "bing.com" ? "bing" : "google";
  const query = page.searchParams.get("q");
  if (!query || query.length > 500) return { ok: false, reason: "image_search_query" };
  const parameters: Record<string, string> = {};
  for (const key of engine === "bing" ? ["qft", "adlt", "setlang"] : ["tbs", "safe", "hl", "udm", "tbm"]) {
    const value = page.searchParams.get(key);
    if (value !== null && value.length <= 2048) parameters[key] = value;
  }
  const safeUrl = (value: unknown): string | undefined => {
    if (typeof value !== "string" || !value || value.length > 8192) return;
    try {
      const url = new URL(value, page);
      if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return;
      return url.href;
    } catch {
      return;
    }
  };
  const dimension = (value: unknown): number | undefined =>
    typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value <= 100_000
      ? value
      : undefined;
  const images: NonNullable<MethodResult<"sites.read">["imageSearch"]>["images"] = [];
  const seen = new Set<string>();
  const anchors = document.querySelectorAll<HTMLAnchorElement>(
    engine === "bing" ? "a[m]" : 'a[href*="/imgres?"]',
  );
  let truncated = anchors.length > 500;
  for (const anchor of Array.from(anchors).slice(0, 500)) {
    let imageUrl: string | undefined,
      sourceUrl: string | undefined,
      width: number | undefined,
      height: number | undefined;
    if (engine === "bing") {
      const raw = anchor.getAttribute("m");
      if (!raw || raw.length > 20_000) continue;
      try {
        const meta: unknown = JSON.parse(raw);
        if (!meta || typeof meta !== "object" || Array.isArray(meta)) continue;
        const value = meta as Record<string, unknown>;
        imageUrl = safeUrl(value.murl);
        sourceUrl = safeUrl(value.purl);
        width = dimension(value.ow ?? value.w);
        height = dimension(value.oh ?? value.h);
      } catch {
        continue;
      }
    } else {
      const href = safeUrl(anchor.href);
      if (!href) continue;
      const target = new URL(href);
      if (target.origin !== page.origin || target.pathname !== "/imgres") continue;
      imageUrl = safeUrl(target.searchParams.get("imgurl"));
      sourceUrl = safeUrl(target.searchParams.get("imgrefurl"));
    }
    if (!imageUrl || !sourceUrl) continue;
    const key = imageUrl + "\n" + sourceUrl;
    if (seen.has(key)) continue;
    seen.add(key);
    if (images.length === 50) {
      truncated = true;
      break;
    }
    const image = anchor.querySelector("img");
    const thumbnailUrl = safeUrl(image?.currentSrc || image?.src);
    const title = (image?.alt || anchor.getAttribute("aria-label") || anchor.textContent || "")
      .replace(/\s+/gu, " ")
      .trim()
      .slice(0, 300);
    images.push({
      imageUrl,
      sourceUrl,
      title,
      ...(thumbnailUrl ? { thumbnailUrl } : {}),
      ...(width ? { width } : {}),
      ...(height ? { height } : {}),
      dimensions: width && height ? "page-metadata" : "unknown",
    });
  }
  if (location.href !== input.expectedUrl) return { ok: false, reason: "document_changed" };
  return {
    ok: true,
    mediaType: "text/plain",
    text: images.length
      ? images
          .map(
            (value, index) =>
              `${index + 1}. ${value.title}\nImage: ${value.imageUrl}\nSource: ${value.sourceUrl}`,
          )
          .join("\n\n")
      : "No source-linked image results were exposed by this page.",
    imageSearch: { engine, query, parameters, images, truncated },
  };
}
