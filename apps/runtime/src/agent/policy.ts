/**
 * Privileged agent policy (VEC-019).
 *
 * Model output cannot expand grants. Sensitive values become handles before
 * export. Denied egress stays denied.
 */
const TOKEN_PREFIX = /^(?:sk-[A-Za-z0-9_-]{16,}|ghp_[A-Za-z0-9]{20,}|gh[ousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16})$/;
const JWT = /^eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]*$/;
const BEARER = /^(?:bearer|basic|token)\s+\S{8,}$/i;
const SECRET_KEY_NAMES = new Set([
  "password", "passwd", "passphrase", "secret", "clientsecret", "token", "accesstoken", "refreshtoken", "idtoken",
  "authtoken", "sessiontoken", "apikey", "xapikey", "privatekey", "authorization", "proxyauthorization", "cookie", "setcookie",
]);

const normKey = (k: string) => k.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Shannon entropy in bits per character. */
function entropy(s: string): number {
  const counts = new Map<string, number>();
  for (const ch of s) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  let h = 0;
  for (const n of counts.values()) h -= (n / s.length) * Math.log2(n / s.length);
  return h;
}

/** Credential-shaped values only: prose that mentions "password" or hex digests/UUIDs stay readable. */
export function looksLikeSecret(value: string): boolean {
  const v = value.trim();
  if (TOKEN_PREFIX.test(v) || JWT.test(v) || BEARER.test(v)) return true;
  if (v.length < 32 || !/^[A-Za-z0-9+/=_.-]+$/.test(v)) return false;
  const classes = [/[a-z]/, /[A-Z]/, /\d/].filter((re) => re.test(v)).length;
  return classes === 3 && entropy(v) >= 4;
}

export function redactForModel(value: unknown): unknown {
  if (typeof value === "string") return looksLikeSecret(value) ? `{handle:${hash(value)}}` : value;
  if (Array.isArray(value)) return value.map(redactForModel);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SECRET_KEY_NAMES.has(normKey(k)) && v != null && v !== "" ? `{handle:${hash(String(v))}}` : redactForModel(v);
    }
    return out;
  }
  return value;
}

function hash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(16).slice(0, 8);
}

export function agentMayEgress(url: string, allowlist: string[]): boolean {
  try {
    const u = new URL(url);
    const hostPort = `${u.hostname}:${u.port || (u.protocol === "https:" ? "443" : "80")}`;
    return allowlist.some((p) => p === u.host || p === u.hostname || p === hostPort || (p.startsWith("*.") && u.hostname.endsWith(p.slice(1))));
  } catch {
    return false;
  }
}

export function promptCannotGrant(pageText: string, granted: readonly string[]): string[] {
  const claimed = [
    ...pageText.matchAll(/allowlist[:\s]+([^\n]+)/gi),
    ...pageText.matchAll(/\bgrant[:\s]+([^\n]+)/gi),
    ...pageText.matchAll(/permission[:\s]+(https?:\/\/\S+)/gi),
  ].map((m) => m[1]!.trim());
  return [...new Set(claimed.filter((c) => c.length > 0 && !granted.includes(c)))];
}
