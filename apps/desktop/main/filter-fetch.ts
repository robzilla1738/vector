import { net } from "electron";
import { filterSourceUrl, readBoundedFilterText } from "@aux/contracts";

/** Filter-list fetch over Chromium's network stack (proxy/TLS aware). */
export async function fetchFilterText(url: string, etag?: string) {
  const expected = filterSourceUrl(url);
  const response = await net.fetch(expected, {
    redirect: "manual",
    signal: AbortSignal.timeout(12_000),
    headers: etag ? { "If-None-Match": etag.slice(0, 512) } : {},
  });
  if (response.url && response.url !== expected)
    throw new Error("The filter list redirected. Review and add its final HTTPS URL separately.");
  return {
    status: response.status,
    etag: response.headers.get("etag")?.slice(0, 512),
    text: () => readBoundedFilterText(response),
  };
}
