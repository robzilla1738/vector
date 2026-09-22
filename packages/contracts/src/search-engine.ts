/** Shared by the settings boundary and its editor without loading runtime schemas. */
export const DEFAULT_SEARCH_ENGINE = "https://duckduckgo.com/?q=%s";
export const SEARCH_ENGINE_TEMPLATE_ERROR = "Use an HTTP or HTTPS search URL with %s where the search terms belong.";
export function isSearchEngineTemplate(value: string): boolean {
  if (!value.includes("%s") || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password && !url.host.includes("%s");
  } catch { return false; }
}
