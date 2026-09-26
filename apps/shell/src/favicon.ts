/**
 * Candidate URLs for a site icon, tried in order until one loads. Icons come
 * from the page session itself — never a third-party favicon service, which
 * would leak the user's hosts off-device.
 */
export function faviconCandidates(_url: string, provided?: string): string[] {
  const src = provided?.trim();
  return src && !src.startsWith("atom:") ? [src] : [];
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
