/**
 * Omnibox ranking and address classification (BR-04). Pure functions so the
 * command bar, palette and tests share one ranking policy.
 */

export interface SuggestCandidate {
  /** Stable identity — selection survives result updates. */
  id: string;
  title: string;
  url?: string;
  /** Epoch ms — recency boosts history/closed-tab matches. */
  lastVisit?: number;
}

/** Match tiers: exact > prefix > word-boundary > substring. -1 = no match. */
export function matchScore(query: string, title: string, url = ""): number {
  const q = query.trim().toLowerCase();
  if (!q) return -1;
  const t = title.toLowerCase();
  const u = url.toLowerCase();
  const host = hostOf(u);
  if (t === q || host === q) return 100;
  if (host.startsWith(`${q}.`) || host.startsWith(`www.${q}.`)) return 95;
  if (t.startsWith(q) || host.startsWith(q)) return 80;
  if (u.startsWith(`https://${q}`) || u.startsWith(`http://${q}`)) return 75;
  // Word boundary in the title or a path segment start in the URL.
  if (new RegExp(`(^|[\\s\\-_—:])${escapeRegExp(q)}`, "i").test(t)) return 60;
  if (u.includes(`/${q}`) || u.includes(`.${q}`)) return 50;
  if (t.includes(q) || u.includes(q)) return 30;
  return -1;
}

const DAY = 86_400_000;

/** Recency: visited now ≈ +20, decaying to 0 over ~30 days. */
export function recencyBoost(lastVisit: number | undefined, now: number): number {
  if (!lastVisit) return 0;
  const ageDays = Math.max(0, (now - lastVisit) / DAY);
  return Math.max(0, 20 * (1 - ageDays / 30));
}

/** Rank candidates by match tier + recency; stable within equal scores. */
export function rankCandidates<T extends SuggestCandidate>(query: string, candidates: T[], now = Date.now()): T[] {
  return candidates
    .map((candidate, index) => ({ candidate, index, score: matchScore(query, candidate.title, candidate.url ?? "") + recencyBoost(candidate.lastVisit, now) }))
    .filter(entry => entry.score >= 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(entry => entry.candidate);
}

/** First match wins across providers — one URL appears once in the list. */
export function dedupeByUrl<T extends { url?: string }>(candidates: T[]): T[] {
  const seen = new Set<string>();
  return candidates.filter(candidate => {
    if (!candidate.url) return true;
    const key = candidate.url.replace(/\/$/, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Hostname without port/path — safe on non-URL text. */
export function hostOf(url: string): string {
  const match = /^[a-z]+:\/\/([^/?#]+)/i.exec(url);
  return (match?.[1] ?? url).replace(/:\d+$/, "").toLowerCase();
}

/**
 * Input that must never reach a remote suggestion service: probable local,
 * private or intranet addresses — explicit IPs, localhost, private ranges,
 * single-label hostnames, .local/.internal/.lan/.corp domains, credentials
 * in URLs, and non-http(s) schemes.
 */
export function isPrivateAddress(input: string): boolean {
  const v = input.trim();
  if (!v) return false;
  if (/\s/.test(v)) return false; // free text is a search query, not an address
  if (/^(localhost|127\.|0\.0\.0\.0|::1|\[::1\])/i.test(v)) return true;
  if (/^\d{1,3}(\.\d{1,3}){3}(:\d+)?(\/\S*)?$/i.test(v)) {
    return /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|127\.|0\.)/.test(v);
  }
  const host = hostOf(v.includes("://") ? v : `https://${v}`).toLowerCase();
  if (/^https?:\/\/[^/]+@/i.test(v)) return true; // credentials embedded in the URL
  if (!host.includes(".")) return true; // single-label intranet name
  if (/\.(local|internal|lan|corp|home|intra|test|localhost)$/i.test(host)) return true;
  return false;
}
