/** Host-neutral policy and validation for user-selected hosts-format filter lists. */
export const MAX_FILTER_BYTES = 16 * 1024 * 1024;
export const MAX_FILTER_HOSTS = 400_000;
export const MAX_FILTER_SOURCES = 20;
export const MAX_COOKIE_SELECTORS = 10_000;
export type FilterSourceKind = "hosts" | "cookie_banner";

export interface FilterSourceDefinition {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  kind: FilterSourceKind;
}

export interface CookieBannerRule {
  domains: string[];
  selector: string;
}

/** The wire digest uses one canonical line per rule so Chromium can verify chunks. */
export function canonicalCookieRules(rules: readonly CookieBannerRule[]): CookieBannerRule[] {
  const sorted = [...rules]
    .map((rule) => ({ domains: [...new Set(rule.domains)].sort(), selector: rule.selector }))
    .sort((a, b) => {
      const left = `${a.domains.join(",")}##${a.selector}`;
      const right = `${b.domains.join(",")}##${b.selector}`;
      return left < right ? -1 : left > right ? 1 : 0;
    });
  return sorted.filter(
    (rule, index) =>
      index === 0 ||
      `${rule.domains.join(",")}##${rule.selector}` !==
        `${sorted[index - 1]!.domains.join(",")}##${sorted[index - 1]!.selector}`,
  );
}
export function cookieRuleDigestInput(rules: readonly CookieBannerRule[]): string {
  return canonicalCookieRules(rules)
    .map((rule) => `${rule.domains.join(",")}##${rule.selector}`)
    .join("\n");
}

/** A deliberately small cosmetic subset. Scriptlets, procedural rules and arbitrary CSS are ignored. */
export function parseCookieBannerList(text: string, maxRules = 10_000): CookieBannerRule[] {
  // Self-contained because the desktop parses downloaded lists in a worker.
  const HOST =
    /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?)+$/;
  const SAFE =
    /^(?:[.#][a-zA-Z][\w-]*|\[data-[a-zA-Z][\w-]*(?:[~|^$*]?=["']?[a-zA-Z0-9_ -]{1,80}["']?)?\])(?:\s*(?:>|\s)\s*(?:[.#][a-zA-Z][\w-]*|\[data-[a-zA-Z][\w-]*(?:[~|^$*]?=["']?[a-zA-Z0-9_ -]{1,80}["']?)?\])){0,3}$/;
  const rules: CookieBannerRule[] = [];
  const seen = new Set<string>();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("!") || line.startsWith("# ") || line.length > 512) continue;
    const marker = line.indexOf("##");
    if (marker < 0 || line.includes("#@#") || line.includes("#$#") || line.includes("#?#")) continue;
    const scope = line.slice(0, marker).trim().toLowerCase();
    const selector = line.slice(marker + 2).trim();
    if (
      !selector ||
      selector.length > 300 ||
      !SAFE.test(selector) ||
      /[{};\\]|url\s*\(|:has\s*\(/i.test(selector)
    )
      continue;
    const domains = scope ? scope.split(",") : [];
    if (domains.some((domain) => !HOST.test(domain))) continue;
    const key = `${scope}##${selector}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rules.push({ domains, selector });
    if (rules.length >= maxRules) break;
  }
  return rules;
}

export function cookieSelectorsForSite(rules: readonly CookieBannerRule[], siteHost: string): string[] {
  const host = siteHost.toLowerCase();
  return rules
    .filter(
      (rule) =>
        rule.domains.length === 0 ||
        rule.domains.some((domain) => host === domain || host.endsWith(`.${domain}`)),
    )
    .map((rule) => rule.selector);
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
    throw new Error("Choose a public HTTPS filter list URL without credentials or a fragment.");
  return url.href;
}

/** Only bare host lines and sink-address plus host lines are accepted. */
export function parseHostsList(text: string, maxHosts = 400_000): Set<string> {
  // Keep this function self-contained: the desktop host runs it off-thread.
  const HOST_RE =
    /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?)+$/;
  const SINK_RE = /^(?:0\.0\.0\.0|127\.0\.0\.1|255\.255\.255\.255|::1)$/;
  const hosts = new Set<string>();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.split("#", 1)[0]!.trim().toLowerCase();
    if (!line) continue;
    const parts = line.split(/\s+/);
    const host =
      parts.length === 1 ? parts[0] : parts.length === 2 && SINK_RE.test(parts[0]!) ? parts[1] : undefined;
    if (
      !host ||
      /^\d+(?:\.\d+){3}$/.test(host) ||
      host === "localhost" ||
      host.endsWith(".localhost") ||
      host === "local" ||
      host === "broadcasthost"
    )
      continue;
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
/** Future native cosmetic application is scoped to a profile and navigation generation. */
export interface ChromiumCookieBannerSnapshot {
  profileId: string;
  private: boolean;
  generation: number;
  rulesDigest: string;
  rules: readonly CookieBannerRule[];
  allowedSiteHosts: readonly string[];
  enabled: boolean;
}
export interface ChromiumCookieBannerReceipt {
  backend: "isolated_world_stylesheet";
  profileId: string;
  private: boolean;
  generation: number;
  rulesDigest: string;
  installedRules: number;
  phase: "document_start";
  futureDocuments: true;
}
export interface ChromiumCookieBannerPort {
  apply(snapshot: ChromiumCookieBannerSnapshot): Promise<ChromiumCookieBannerReceipt>;
}
export function assertCookieBannerReceipt(
  snapshot: ChromiumCookieBannerSnapshot,
  receipt: ChromiumCookieBannerReceipt,
): void {
  if (
    !snapshot.profileId ||
    !Number.isSafeInteger(snapshot.generation) ||
    snapshot.generation < 1 ||
    !/^[a-f0-9]{64}$/.test(snapshot.rulesDigest) ||
    snapshot.rules.length > MAX_COOKIE_SELECTORS ||
    receipt.backend !== "isolated_world_stylesheet" ||
    receipt.profileId !== snapshot.profileId ||
    receipt.private !== snapshot.private ||
    receipt.generation !== snapshot.generation ||
    receipt.rulesDigest !== snapshot.rulesDigest ||
    receipt.phase !== "document_start" ||
    receipt.futureDocuments !== true ||
    !Number.isSafeInteger(receipt.installedRules) ||
    receipt.installedRules !== snapshot.rules.length
  )
    throw new Error("Chromium did not attest the reviewed cookie-banner snapshot.");
}
export function assertContentBlockReceipt(
  snapshot: ContentBlockSnapshot,
  receipt: ChromiumContentBlockReceipt,
): void {
  if (
    !Number.isSafeInteger(snapshot.generation) ||
    snapshot.generation < 1 ||
    !/^[a-f0-9]{64}$/.test(snapshot.hostsDigest) ||
    snapshot.hosts.length > MAX_FILTER_HOSTS ||
    !["subresource_filter", "declarative_net_request"].includes(receipt.backend) ||
    receipt.generation !== snapshot.generation ||
    receipt.hostsDigest !== snapshot.hostsDigest ||
    !Number.isSafeInteger(receipt.installedRules) ||
    receipt.installedRules < 0 ||
    (snapshot.enabled && snapshot.hosts.length > 0 && receipt.installedRules === 0)
  )
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
  get total(): number {
    return this.totalCount;
  }
  forSite(siteHost: string): number {
    return this.bySite.get(siteHost.toLowerCase()) ?? 0;
  }
}
