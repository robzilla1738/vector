export function canonicalCommandUrl(value?: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.hash = "";
    const trackingKeys = Array.from(url.searchParams.keys()).filter((key) => /^utm_/i.test(key));
    for (const key of trackingKeys) url.searchParams.delete(key);
    return url.href;
  } catch {
    return null;
  }
}

