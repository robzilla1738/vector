import type { PageContextRef, PageTarget } from "@aux/contracts";
import { draftKey } from "./conversation-drafts";

export const BROWSER_SOURCES_PREFIX = "aux.conversation-browser-sources.v1:";
const MAX_EXTRA_PAGES = 8;
type EntryStorage = Pick<Storage, "getItem" | "setItem" | "removeItem"> & Partial<Pick<Storage, "length" | "key">>;

const validKey = (key: string) => key === "new" || (key.startsWith("chat:") && key.length <= 210);
export const browserSourcesKey = (chatId: string | null) => chatId ? draftKey(chatId) : "new";

function validSource(value: unknown): value is PageContextRef {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const source = value as Record<string, unknown>;
  return Object.keys(source).every(key => ["pageId", "url", "documentEpoch", "sessionId"].includes(key))
    && typeof source.pageId === "string" && source.pageId.length > 0 && source.pageId.length <= 200
    && typeof source.url === "string" && source.url.length > 0 && source.url.length <= 8192
    && typeof source.documentEpoch === "number" && Number.isSafeInteger(source.documentEpoch) && source.documentEpoch >= 0
    && (source.sessionId === undefined || typeof source.sessionId === "string" && source.sessionId.length <= 200);
}

function parseSources(value: string | null): PageContextRef[] | null {
  if (!value || value.length > 80_000) return null;
  try {
    const entry: unknown = JSON.parse(value);
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
    const record = entry as Record<string, unknown>;
    if (record.version !== 1 || !Array.isArray(record.sources) || record.sources.length > MAX_EXTRA_PAGES) return null;
    if (!record.sources.every(validSource)) return null;
    const sources: PageContextRef[] = record.sources;
    if (new Set(sources.map(source => source.pageId)).size !== sources.length) return null;
    return sources;
  } catch { return null; }
}

/** Per-chat entries keep independent windows from overwriting each other's selections. */
export function readBrowserSources(storage: EntryStorage | null): Record<string, PageContextRef[]> {
  const selected: Record<string, PageContextRef[]> = {};
  if (!storage?.key || typeof storage.length !== "number") return selected;
  try {
    for (let index = 0; index < storage.length; index++) {
      const name: string | null = storage.key(index);
      if (!name?.startsWith(BROWSER_SOURCES_PREFIX)) continue;
      const key = name.slice(BROWSER_SOURCES_PREFIX.length);
      if (!validKey(key)) continue;
      const sources = parseSources(storage.getItem(name));
      if (sources?.length) selected[key] = sources;
    }
  } catch { /* An unavailable store cannot replace the in-memory selection. */ }
  return selected;
}

export function writeBrowserSources(storage: EntryStorage | null, key: string, sources: PageContextRef[]): void {
  if (!validKey(key)) throw new Error("Invalid conversation context key.");
  if (sources.length > MAX_EXTRA_PAGES || !sources.every(validSource)) throw new Error("Selected browser context is invalid.");
  if (new Set(sources.map(source => source.pageId)).size !== sources.length) throw new Error("A browser tab can be selected only once.");
  if (!storage) return;
  const name = `${BROWSER_SOURCES_PREFIX}${key}`;
  if (sources.length) storage.setItem(name, JSON.stringify({ version: 1, sources }));
  else storage.removeItem(name);
}

export function browserSourcesEntryChange(name: string | null, value: string | null): { key: string; sources: PageContextRef[] } | null {
  if (!name?.startsWith(BROWSER_SOURCES_PREFIX)) return null;
  const key = name.slice(BROWSER_SOURCES_PREFIX.length);
  if (!validKey(key)) return null;
  const sources = value === null ? [] : parseSources(value);
  return sources ? { key, sources } : null;
}

export function sourceRef(page: PageTarget): PageContextRef {
  const ref = { pageId: page.pageId, url: page.url, documentEpoch: page.documentEpoch, sessionId: page.sessionId };
  if (!validSource(ref)) throw new Error("This browser tab cannot be added to context.");
  return ref;
}

export function sourceStatus(source: PageContextRef, pages: PageTarget[]): "current" | "changed" | "missing" {
  const page = pages.find(item => item.pageId === source.pageId);
  if (!page || page.ownedByRuntime || ["crashed", "detached"].includes(page.viewStatus ?? "")) return "missing";
  return page.url === source.url && page.documentEpoch === source.documentEpoch && page.sessionId === source.sessionId ? "current" : "changed";
}
