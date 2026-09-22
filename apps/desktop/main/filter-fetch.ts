import { net } from "electron";

/** Filter-list fetch over Chromium's network stack (proxy/TLS aware). */
export async function fetchFilterText(url: string, etag?: string) {
  const response = await net.fetch(url, { headers: etag ? { "If-None-Match": etag } : {} });
  return { status: response.status, etag: response.headers.get("etag") ?? undefined, text: () => response.text() };
}
