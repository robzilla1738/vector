/** Raw subscription transport. Only the native maintained Engine parses rules. */
export const MAX_FILTER_BYTES = 16 * 1024 * 1024;
export const MAX_FILTER_SNAPSHOT_BYTES = 64 * 1024 * 1024;
export const MAX_FILTER_SOURCES = 20;
export const MAX_FILTER_CHUNK_BYTES = 128 * 1024;
export type FilterSourceKind = "adblock" | "hosts";
export interface FilterSourceDefinition {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  kind: FilterSourceKind;
}
export interface FilterSourceHeader {
  id: string;
  url: string;
  kind: FilterSourceKind;
  sha256: string;
  bytes: number;
}
/** Absent text references only an exact matching native bundled source header. */
export interface ContentBlockSource extends FilterSourceHeader {
  text?: string;
}
export interface ContentBlockSnapshot {
  profileId: string;
  generation: number;
  filterDigest: string;
  sources: readonly ContentBlockSource[];
  allowedSiteHosts: readonly string[];
  enabled: boolean;
}
export interface ChromiumContentBlockReceipt {
  backend: "ublock_origin";
  engineVersion: "9df989ecc483cd7ada4b195c47a0584ab2d97450";
  profileId: string;
  private: false;
  generation: number;
  filterDigest: string;
  sourceHeaders: FilterSourceHeader[];
  cosmeticBackend: "native_user_styles";
  phase: "document_start";
  futureDocuments: true;
}
export interface ChromiumContentBlockPort {
  apply(snapshot: ContentBlockSnapshot): Promise<ChromiumContentBlockReceipt>;
}
/** UTF-8 content digests are verified separately; this binds their ordered headers. */
export function filterSnapshotDigestInput(
  sources: readonly FilterSourceHeader[],
  enabled: boolean,
  allowedSiteHosts: readonly string[],
): string {
  return (
    sources
      .map(
        (source) =>
          `${source.id}\t${source.kind}\t${source.url}\t${source.sha256}\t${source.bytes}\n`,
      )
      .join("") + `@policy\t${enabled ? 1 : 0}\t${allowedSiteHosts.join(",")}\n`
  );
}
export function assertContentBlockReceipt(
  snapshot: ContentBlockSnapshot,
  receipt: ChromiumContentBlockReceipt,
): void {
  const count = (value: number) => Number.isSafeInteger(value) && value >= 0;
  if (
    !snapshot.profileId ||
    !Number.isSafeInteger(snapshot.generation) ||
    snapshot.generation < 1 ||
    !/^[a-f0-9]{64}$/.test(snapshot.filterDigest) ||
    snapshot.sources.length > MAX_FILTER_SOURCES ||
    snapshot.sources.some(
      (source) => !count(source.bytes) || source.bytes > MAX_FILTER_BYTES,
    ) ||
    snapshot.sources.reduce((total, source) => total + source.bytes, 0) >
      MAX_FILTER_SNAPSHOT_BYTES ||
    receipt.backend !== "ublock_origin" ||
    receipt.engineVersion !== "9df989ecc483cd7ada4b195c47a0584ab2d97450" ||
    receipt.profileId !== snapshot.profileId ||
    receipt.private !== false ||
    receipt.generation !== snapshot.generation ||
    receipt.filterDigest !== snapshot.filterDigest ||
    receipt.cosmeticBackend !== "native_user_styles" ||
    receipt.phase !== "document_start" ||
    receipt.futureDocuments !== true ||
    receipt.sourceHeaders.length !== snapshot.sources.length ||
    receipt.sourceHeaders.some((header, index) => {
      const original = snapshot.sources[index];
      return (
        !original ||
        header.id !== original.id ||
        header.url !== original.url ||
        header.kind !== original.kind ||
        header.sha256 !== original.sha256 ||
        header.bytes !== original.bytes
      );
    })
  ) {
    throw new Error(
      "Chromium did not attest the exact original filter snapshot.",
    );
  }
}

/** Exact HTTPS source URL; embedded credentials and local literal targets are rejected. */
export function filterSourceUrl(value: string): string {
  if (value.length > 2048) throw new Error("The filter list URL is too long.");
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Enter a complete HTTPS filter list URL.");
  }
  const host = url.hostname.toLowerCase();
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.hash ||
    !host.includes(".") ||
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    /^\d+(?:\.\d+){3}$/.test(host) ||
    host.startsWith("[")
  )
    throw new Error(
      "Choose a public HTTPS filter list URL without credentials or a fragment.",
    );
  return url.href;
}

/** Streams at most 16 MB. A Response.text() call may buffer far beyond that limit. */
export async function readBoundedFilterText(
  response: Response,
): Promise<string> {
  const declared = response.headers.get("content-length");
  if (declared && Number(declared) > MAX_FILTER_BYTES)
    throw new Error("The filter list is too large.");
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
      if (bytes > MAX_FILTER_BYTES)
        throw new Error("The filter list is too large.");
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return text;
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
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
  get total(): number {
    return this.totalCount;
  }
  forSite(siteHost: string): number {
    return this.bySite.get(siteHost.toLowerCase()) ?? 0;
  }
}
