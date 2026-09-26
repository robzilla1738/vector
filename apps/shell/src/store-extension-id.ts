/** Store IDs use Chrome's 32-character a–p alphabet. URLs are accepted only
 * from the two official Chrome Web Store origins. */
export function storeExtensionId(input: string): string | null {
  const text = input.trim();
  if (/^[a-p]{32}$/.test(text)) return text;
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  if (
    url.protocol !== "https:" ||
    !["chromewebstore.google.com", "chrome.google.com"].includes(url.hostname) ||
    url.username ||
    url.password ||
    url.port
  )
    return null;
  const parts = url.pathname.split("/").filter(Boolean);
  if (url.hostname === "chrome.google.com" && (parts[0] !== "webstore" || parts[1] !== "detail")) return null;
  if (url.hostname === "chromewebstore.google.com" && parts[0] !== "detail") return null;
  const id = parts.at(-1);
  return id && /^[a-p]{32}$/.test(id) ? id : null;
}
