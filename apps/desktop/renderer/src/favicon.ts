/** Candidate URLs for a site icon, tried in order until one loads. */

export function faviconCandidates(url: string, provided?: string): string[] {
  const out: string[] = [];
  const src = provided?.trim();
  if (src && !src.startsWith("atom:")) out.push(src);
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return out;
    const host = u.hostname.replace(/^www\./, "");
    if (!host) return out;
    out.push(`https://icons.duckduckgo.com/ip3/${host}.ico`);
    out.push(`https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(host)}`);
  } catch {
    /* ignore invalid urls */
  }
  return [...new Set(out)];
}

export function hostLetter(url: string): string | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const first = host[0] ?? "";
    return /^[a-z0-9]/i.test(first) ? first.toUpperCase() : null;
  } catch {
    return null;
  }
}
