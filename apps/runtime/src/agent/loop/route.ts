/** Infer one same-origin record route only from links the page actually exposed. */
export function matchingRoute(
  baseUrl: string,
  hrefs: readonly string[],
  targetId: string,
): string | undefined {
  const wanted = targetId.trim();
  if (!/^[a-z][a-z0-9_-]{1,79}$/i.test(wanted)) return undefined;
  let base: URL;
  try {
    base = new URL(baseUrl);
  } catch {
    return undefined;
  }
  const links = hrefs.flatMap((href) => {
    try {
      const url = new URL(href, base);
      return url.origin === base.origin && /^https?:$/.test(url.protocol) ? [url] : [];
    } catch {
      return [];
    }
  });
  const segment = (url: URL) => url.pathname.split("/").filter(Boolean).at(-1) ?? "";
  const exact = [
    ...new Set(
      links.filter((url) => segment(url).toLowerCase() === wanted.toLowerCase()).map((url) => url.href),
    ),
  ];
  if (exact.length === 1) return exact[0];
  if (exact.length > 1) return undefined;
  const targetMatch = /^(.*?)(\d+)$/.exec(wanted);
  if (!targetMatch) return undefined;
  const [_, prefix, digits] = targetMatch;
  const templates = new Map<string, Set<string>>();
  for (const url of links) {
    const child = segment(url);
    const match = /^(.*?)(\d+)$/.exec(child);
    if (!match || match[1]?.toLowerCase() !== prefix?.toLowerCase() || match[2]?.length !== digits?.length)
      continue;
    const parent = url.pathname.slice(0, -child.length);
    const key = `${url.origin}${parent}`;
    if (!templates.has(key)) templates.set(key, new Set());
    templates.get(key)!.add(child.toLowerCase());
  }
  const corroborated = [...templates].filter(([, siblings]) => siblings.size >= 2);
  if (corroborated.length !== 1) return undefined;
  return `${corroborated[0]![0]}${wanted}`;
}
