/**
 * Privileged agent policy (VEC-019).
 *
 * Model output cannot expand grants. Sensitive values become handles before
 * export. Denied egress stays denied.
 */
const HANDLE = /^(sk-|ghp_|github_pat_|xox[baprs]-|eyJ[A-Za-z0-9_-]{20,}\.)/;
const SECRET_KEYS = /token|secret|password|passwd|authorization|cookie|api[_-]?key/i;

export function redactForModel(value: unknown): unknown {
  if (typeof value === "string") {
    if (HANDLE.test(value) || value.length > 8 && SECRET_KEYS.test(value)) {
      return `{handle:${hash(value)}}`;
    }
    return value;
  }
  if (Array.isArray(value)) return value.map(redactForModel);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SECRET_KEYS.test(k) ? `{handle:${hash(String(v))}}` : redactForModel(v);
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
