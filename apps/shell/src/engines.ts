/**
 * Keyword search engines (BR-04): `kw terms` routes to the engine template —
 * `gh aux browser` searches GitHub, `mdn array` searches MDN. User engines
 * from Settings merge over the built-ins by keyword.
 */
import { isSearchEngineTemplate } from "@aux/contracts/search-engine";

export interface KeywordEngine {
  keyword: string;
  name: string;
  template: string;
}

/** Conservative built-ins — https, real %s placement, no credentials. */
export const DEFAULT_ENGINES: readonly KeywordEngine[] = [
  { keyword: "ddg", name: "DuckDuckGo", template: "https://duckduckgo.com/?q=%s" },
  { keyword: "g", name: "Google", template: "https://www.google.com/search?q=%s" },
  { keyword: "gh", name: "GitHub", template: "https://github.com/search?q=%s" },
  { keyword: "mdn", name: "MDN", template: "https://developer.mozilla.org/search?q=%s" },
  { keyword: "npm", name: "npm", template: "https://www.npmjs.com/search?q=%s" },
  { keyword: "yt", name: "YouTube", template: "https://www.youtube.com/results?search_query=%s" },
  { keyword: "wiki", name: "Wikipedia", template: "https://en.wikipedia.org/w/index.php?search=%s" },
  { keyword: "so", name: "Stack Overflow", template: "https://stackoverflow.com/search?q=%s" },
  { keyword: "maps", name: "Google Maps", template: "https://www.google.com/maps/search/%s" },
];

const KEYWORD = /^[a-z][a-z0-9_-]{0,15}$/i;

/** User entries override built-ins on keyword; invalid rows are dropped. */
export function engineList(custom?: readonly KeywordEngine[]): KeywordEngine[] {
  const byKeyword = new Map<string, KeywordEngine>();
  for (const engine of DEFAULT_ENGINES) byKeyword.set(engine.keyword, engine);
  for (const engine of custom ?? []) {
    if (!KEYWORD.test(engine.keyword) || !isSearchEngineTemplate(engine.template)) continue;
    byKeyword.set(engine.keyword.toLowerCase(), { keyword: engine.keyword.toLowerCase(), name: engine.name.slice(0, 60), template: engine.template });
  }
  return [...byKeyword.values()];
}

/**
 * `kw` alone focuses engine selection; `kw terms` resolves to a URL.
 * Returns null when the first word is not a registered keyword.
 */
export function resolveKeyword(input: string, engines: readonly KeywordEngine[]): { engine: KeywordEngine; terms: string; url: string } | null {
  const v = input.trim();
  const space = v.indexOf(" ");
  if (space < 0) return null;
  const keyword = v.slice(0, space).toLowerCase();
  const terms = v.slice(space + 1).trim();
  if (!terms) return null;
  const engine = engines.find(candidate => candidate.keyword === keyword);
  if (!engine) return null;
  return { engine, terms, url: engine.template.replace("%s", encodeURIComponent(terms)) };
}

/** The keyword itself, for showing `gh` → GitHub while the user types `gh …`. */
export function keywordOf(input: string, engines: readonly KeywordEngine[]): KeywordEngine | null {
  const v = input.trim();
  const head = (v.includes(" ") ? v.slice(0, v.indexOf(" ")) : v).toLowerCase();
  return engines.find(engine => engine.keyword === head) ?? null;
}

/**
 * Remote suggestion endpoint for engines we actually know — anything else
 * returns null so no keystrokes ever leave for an unrecognized service.
 */
const SUGGEST_ENDPOINTS: Readonly<Record<string, string>> = {
  "duckduckgo.com": "https://duckduckgo.com/ac/?type=list&q=",
  "www.google.com": "https://suggestqueries.google.com/complete/search?client=chrome&q=",
};

export function suggestEndpoint(engineTemplate: string | undefined): string | null {
  if (!engineTemplate) return null;
  try {
    const host = new URL(engineTemplate).hostname.toLowerCase();
    return SUGGEST_ENDPOINTS[host] ?? null;
  } catch { return null; }
}

/** Provider responses are loosely shaped — take the first string array found. */
export function parseSuggestResponse(data: unknown): string[] {
  const walk = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      if (value.every(item => typeof item === "string")) return value as string[];
      for (const item of value) { const found = walk(item); if (found.length) return found; }
    }
    return [];
  };
  return walk(data).slice(0, 5);
}
