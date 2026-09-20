/** Convert a native absolute path into a file URL without treating filename
 * characters such as # or ? as URL syntax. Aux is macOS-first, while normalizing
 * Windows separators keeps this safe for the portable renderer contract. */
export function localFileUrl(path: string): string {
  const normalized = path.replace(/\\/g, "/");
  const absolute = normalized.startsWith("/") ? normalized : `/${normalized}`;
  return `file://${encodeURI(absolute).replaceAll("#", "%23").replaceAll("?", "%3F")}`;
}
