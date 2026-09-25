/** Host-neutral policy and validation for user-selected hosts-format filter lists. */
export const MAX_FILTER_BYTES = 16 * 1024 * 1024;
export const MAX_FILTER_HOSTS = 400_000;
export const MAX_FILTER_SOURCES = 20;

export interface FilterSourceDefinition {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
}

/** Exact HTTPS source URL; embedded credentials and local literal targets are rejected. */
export function filterSourceUrl(value: string): string {
  if (value.length > 2048) throw new Error("The filter list URL is too long.");
  let url: URL;
  try { url = new URL(value); }
  catch { throw new Error("Enter a complete HTTPS filter list URL."); }
  const host = url.hostname.toLowerCase();
  if (url.protocol !== "https:" || url.username || url.password || url.hash ||
      !host.includes(".") || host === "localhost" || host.endsWith(".localhost") ||
      host.endsWith(".local") || /^\d+(?:\.\d+){3}$/.test(host) || host.startsWith("["))
    throw new Error("Choose a public HTTPS filter list URL without credentials or a fragment.");
  return url.href;
}

/** Only bare host lines and sink-address plus host lines are accepted. */
export function parseHostsList(text: string, maxHosts = 400_000): Set<string> {
  // Keep this function self-contained: the desktop host runs it off-thread.
  const HOST_RE = /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?)+$/;
  const SINK_RE = /^(?:0\.0\.0\.0|127\.0\.0\.1|255\.255\.255\.255|::1)$/;
  const hosts = new Set<string>();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.split("#", 1)[0]!.trim().toLowerCase();
    if (!line) continue;
    const parts = line.split(/\s+/);
    const host = parts.length === 1 ? parts[0] : parts.length === 2 && SINK_RE.test(parts[0]!)
      ? parts[1] : undefined;
    if (!host || /^\d+(?:\.\d+){3}$/.test(host) || host === "localhost" || host.endsWith(".localhost") ||
        host === "local" || host === "broadcasthost") continue;
    if (HOST_RE.test(host)) hosts.add(host);
    if (hosts.size >= maxHosts) break;
  }
  return hosts;
}

/** Streams at most 16 MB. A Response.text() call may buffer far beyond that limit. */
export async function readBoundedFilterText(response: Response): Promise<string> {
  const declared = response.headers.get("content-length");
  if (declared && Number(declared) > MAX_FILTER_BYTES) throw new Error("The filter list is too large.");
  if (!response.body) throw new Error("The filter list response has no body.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
  let text = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_FILTER_BYTES) throw new Error("The filter list is too large.");
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return text;
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

/** Content blocking must be applied by Chromium, with an exact receipt for the same snapshot. */
export interface ContentBlockSnapshot {
  generation: number;
  hostsDigest: string;
  hosts: readonly string[];
  allowedSiteHosts: readonly string[];
  enabled: boolean;
}
export interface ChromiumContentBlockReceipt {
  backend: "subresource_filter" | "declarative_net_request";
  generation: number;
  hostsDigest: string;
  installedRules: number;
}
export interface ChromiumContentBlockPort {
  apply(snapshot: ContentBlockSnapshot): Promise<ChromiumContentBlockReceipt>;
}
export function assertContentBlockReceipt(snapshot: ContentBlockSnapshot, receipt: ChromiumContentBlockReceipt): void {
  if (!Number.isSafeInteger(snapshot.generation) || snapshot.generation < 1 ||
      !/^[a-f0-9]{64}$/.test(snapshot.hostsDigest) || snapshot.hosts.length > MAX_FILTER_HOSTS ||
      !["subresource_filter", "declarative_net_request"].includes(receipt.backend) ||
      receipt.generation !== snapshot.generation || receipt.hostsDigest !== snapshot.hostsDigest ||
      !Number.isSafeInteger(receipt.installedRules) || receipt.installedRules < 0 ||
      (snapshot.enabled && snapshot.hosts.length > 0 && receipt.installedRules === 0))
    throw new Error("Chromium did not attest the reviewed content-blocking snapshot.");
}

/** In-memory counts by top-level site host. No request URL is retained. */
export class BlockedCountState {
  private totalCount = 0;
  private readonly bySite = new Map<string, number>();

  note(siteHost: string): void {
    this.totalCount++;
    const host = siteHost.toLowerCase();
    if (host && (this.bySite.has(host) || this.bySite.size < 4096))
      this.bySite.set(host, (this.bySite.get(host) ?? 0) + 1);
  }
  get total(): number { return this.totalCount; }
  forSite(siteHost: string): number { return this.bySite.get(siteHost.toLowerCase()) ?? 0; }
}
