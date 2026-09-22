/**
 * HTTPS-first navigation: main-frame http requests are upgraded to https unless
 * the host is a local/development address or the user has explicitly continued
 * to http this session. When an upgraded navigation then fails to connect, the
 * recovery surface can offer the original http address — session-scoped and
 * host-scoped, never a global TLS bypass. Certificate validation is untouched:
 * cert errors still flow through the certificate-error path.
 */

const LOCAL_SUFFIXES = [".localhost", ".local", ".internal", ".test", ".invalid", ".example", ".home.arpa", ".lan", ".corp", ".intranet"];
const LOCAL_EXACT = new Set(["localhost", "broadcasthost", "ip6-localhost", "ip6-loopback"]);

/** IPv4 literals inside loopback/private/link-local ranges. */
function localIpv4(host: string): boolean {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!m) return false;
  const a = Number(m[1]), b = Number(m[2]);
  if ([a, b, Number(m[3]), Number(m[4])].some(octet => octet > 255)) return false;
  return a === 10 || a === 127 || a === 0
    || (a === 169 && b === 254)            // link-local
    || (a === 172 && b >= 16 && b <= 31)   // RFC1918
    || (a === 192 && b === 168)
    || (a === 100 && b >= 64 && b <= 127)  // CGNAT
    || a >= 224;                           // multicast/reserved/broadcast
}

function localIpv6(host: string): boolean {
  const normalized = host.replace(/^\[|\]$/g, "").toLowerCase();
  return normalized === "::1" || normalized === "::" || normalized.startsWith("fe80:") || normalized.startsWith("fc") || normalized.startsWith("fd");
}

/** Hosts where an unencrypted connection is expected — local dev and intranet. */
export function isLocalDevHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (LOCAL_EXACT.has(host) || localIpv4(host) || localIpv6(host)) return true;
  if (LOCAL_SUFFIXES.some(suffix => host.endsWith(suffix))) return true;
  // Single-label names are intranet/mDNS style, e.g. `http://devbox`.
  if (!host.includes(".") && !host.includes(":")) return true;
  return false;
}

/**
 * Failures that mean "this origin cannot serve HTTPS" — eligible for the http
 * offer. Includes the ERR_CERT_* range: a site we upgraded whose certificate is
 * broken is better served by plain http than by an insecure-https bypass.
 * These only apply to hosts this session actually upgraded, so typed https://
 * navigations never get a downgrade offer.
 */
const HTTP_FALLBACK_CODES = new Set([-100, -101, -102, -103, -107, -109, -113, -118, -200, -201, -202, -203, -204, -205, -206, -207]);

const MAX_TRACKED = 500;

export class HttpsFirst {
  private readonly httpAllowed = new Set<string>();
  private readonly upgradedFrom = new Map<string, string>();
  enabled = true;

  /** Returns the https URL a main-frame http navigation should be redirected to. */
  upgrade(rawUrl: string): string | undefined {
    if (!this.enabled) return undefined;
    let url: URL;
    try { url = new URL(rawUrl); }
    catch { return undefined; }
    if (url.protocol !== "http:") return undefined;
    const host = url.hostname.toLowerCase();
    if (!host || isLocalDevHost(host) || this.httpAllowed.has(host)) return undefined;
    url.protocol = "https:";
    if (!this.upgradedFrom.has(host)) {
      if (this.upgradedFrom.size >= MAX_TRACKED) this.upgradedFrom.delete(this.upgradedFrom.keys().next().value!);
      this.upgradedFrom.set(host, rawUrl);
    }
    return url.href;
  }

  /**
   * On a failed https navigation, returns the original http address when this
   * navigation was one we upgraded and the failure means "no TLS here".
   */
  httpFallback(failedUrl: string, code: number): string | undefined {
    if (!HTTP_FALLBACK_CODES.has(code)) return undefined;
    try {
      const url = new URL(failedUrl);
      if (url.protocol !== "https:") return undefined;
      return this.upgradedFrom.get(url.hostname.toLowerCase());
    } catch {
      return undefined;
    }
  }

  /** User chose to continue to http — scoped to this host, this session. */
  allowHttp(hostname: string) {
    this.httpAllowed.add(hostname.toLowerCase());
  }

  allowed(hostname: string): boolean {
    return this.httpAllowed.has(hostname.toLowerCase());
  }
}
