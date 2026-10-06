import { AuxError, LiveFolderItemsSchema, type LiveFolder, type LiveFolderItem } from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { CalendarConnectionService } from "./calendar-connections.js";
import type { GithubConnectionService } from "./github-connection.js";
import { liveFolderFetch } from "./live-folder-fetch.js";

type Source = { id: string; live: LiveFolder };
type Cached = {
  folderId: string;
  items: LiveFolderItem[];
  refreshedAt?: number;
  error?: string;
  source: string;
};

function xmlText(raw: string) {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/&(?:amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);/gi, (entity) => {
      const named: Record<string, string> = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&apos;": "'",
      };
      if (named[entity]) return named[entity]!;
      const code = entity.startsWith("&#x")
        ? Number.parseInt(entity.slice(3, -1), 16)
        : Number(entity.slice(2, -1));
      return Number.isInteger(code) && code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)
        ? String.fromCodePoint(code)
        : "";
    })
    .trim();
}

/** Bounded, non-executing feed extraction. External entities are refused, never fetched. */
export function feedItems(xml: string, baseUrl: string, _now = Date.now()): LiveFolderItem[] {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml) || !/<(?:rss|feed)(?:\s|>)/i.test(xml))
    throw new AuxError("backend_unavailable", "This source is not a safe RSS or Atom feed.");
  const items: LiveFolderItem[] = [];
  const ids = new Set<string>();
  for (const match of xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1\s*>/gi)) {
    const body = match[2]!;
    const field = (name: string) =>
      xmlText(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}\\s*>`, "i").exec(body)?.[1] ?? "");
    const links = [...body.matchAll(/<link\b([^>]*)(?:\/>|>([\s\S]*?)<\/link\s*>)/gi)];
    const link = links.find((link) => !/\brel\s*=\s*["'](?:self|enclosure)["']/i.test(link[1]!));
    const raw = link ? (/\bhref\s*=\s*["']([^"']+)["']/i.exec(link[1]!)?.[1] ?? xmlText(link[2] ?? "")) : "";
    let url: URL;
    try {
      url = new URL(xmlText(raw), baseUrl);
    } catch {
      continue;
    }
    if (!raw || !/^https?:$/.test(url.protocol) || url.username || url.password || url.href.length > 8192)
      continue;
    const id = (field("guid") || field("id") || url.href).slice(0, 200);
    if (ids.has(id)) continue;
    ids.add(id);
    const date = field("updated") || field("pubDate") || field("published");
    items.push({
      id,
      url: url.href,
      title: (field("title") || url.hostname).slice(0, 500),
      subtitle: url.hostname.slice(0, 500),
      unread: true,
      updatedAt: Number.isFinite(Date.parse(date)) ? Date.parse(date) : 0,
    });
    if (items.length === 25) break;
  }
  return items;
}

export class LiveFolderService {
  private readonly lifetime = new AbortController();
  close() {
    this.lifetime.abort();
  }
  private readonly inFlight = new Map<string, Promise<Awaited<ReturnType<LiveFolderService["items"]>>>>();
  constructor(
    private readonly deps: {
      repo: Repo;
      sources: () => Promise<Source[]>;
      github: GithubConnectionService;
      calendar?: CalendarConnectionService;
      routineItems: (routineId: string, signal: AbortSignal) => Promise<LiveFolderItem[]>;
      fetch?: typeof fetch;
      now?: () => number;
    },
  ) {}
  private get now() {
    return this.deps.now ?? Date.now;
  }
  private key(id: string) {
    return `liveFolders:cache:${id}`;
  }
  private async sourceIdentity(folderId: string) {
    const source = (await this.deps.sources()).find((source) => source.id === folderId);
    if (!source) throw new AuxError("not_found", "This live folder is no longer available.");
    return JSON.stringify(source.live);
  }
  async items(folderId: string) {
    const identity = await this.sourceIdentity(folderId);
    const saved = this.deps.repo.getSetting<Cached>(this.key(folderId));
    const cache = saved?.source === identity ? saved : undefined;
    return LiveFolderItemsSchema.parse({
      folderId,
      items: cache?.items ?? [],
      ...(cache?.refreshedAt !== undefined ? { refreshedAt: cache.refreshedAt } : {}),
      ...(cache?.error ? { error: cache.error } : {}),
    });
  }
  async markRead(folderId: string, itemId: string) {
    const identity = await this.sourceIdentity(folderId);
    const cache = this.deps.repo.getSetting<Cached>(this.key(folderId));
    if (cache?.source !== identity || !cache.items.some((item) => item.id === itemId))
      throw new AuxError("not_found", "This live item is no longer available.");
    this.deps.repo.setSetting(this.key(folderId), {
      ...cache,
      items: cache.items.map((item) => (item.id === itemId ? { ...item, unread: false } : item)),
    });
    return { ok: true as const };
  }
  refresh(folderId: string) {
    if (this.lifetime.signal.aborted)
      return Promise.reject(new AuxError("cancelled", "Live folders stopped."));
    const existing = this.inFlight.get(folderId);
    if (existing) return existing;
    const pending = this.refreshSource(folderId).finally(() => this.inFlight.delete(folderId));
    this.inFlight.set(folderId, pending);
    return pending;
  }
  private async refreshSource(folderId: string) {
    const source = (await this.deps.sources()).find((source) => source.id === folderId);
    if (!source) throw new AuxError("not_found", "This live folder is no longer available.");
    const identity = JSON.stringify(source.live);
    try {
      const live = source.live;
      let rows: LiveFolderItem[];
      if (live.kind === "github") rows = await this.deps.github.items(live, this.lifetime.signal);
      else if (live.kind === "rss") {
        const url = new URL(live.config.url);
        rows = feedItems(
          await liveFolderFetch(url.href, [url.host], {
            fetch: this.deps.fetch,
            signal: this.lifetime.signal,
          }),
          url.href,
          this.now(),
        );
      } else if (live.kind === "calendar") {
        if (!this.deps.calendar)
          throw new AuxError("backend_unavailable", "Reconnect Calendar to refresh this folder.");
        const start = new Date(this.now());
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        const { events } = await this.deps.calendar.events(
          {
            connectionId: live.config.connectionId,
            timeMin: start.toISOString(),
            timeMax: end.toISOString(),
            limit: 100,
          },
          undefined,
          this.lifetime.signal,
        );
        rows = events
          .filter((event) => !!event.url)
          .slice(0, 25)
          .map((event) => ({
            id: event.eventId.slice(0, 200),
            url: event.url!,
            title: event.title.slice(0, 500) || "Untitled event",
            subtitle: event.start,
            unread: true,
            updatedAt: Date.parse(event.start),
          }));
      } else rows = await this.deps.routineItems(live.config.routineId, this.lifetime.signal);
      this.lifetime.signal.throwIfAborted();
      const current = (await this.deps.sources()).find((source) => source.id === folderId);
      if (!current || JSON.stringify(current.live) !== identity)
        throw new AuxError("cancelled", "This live folder changed during refresh.");
      // Re-read after the network await so a concurrent markRead cannot resurrect its dot.
      const latest = this.deps.repo.getSetting<Cached>(this.key(folderId));
      const read = new Map(latest?.source === identity ? latest.items.map((item) => [item.id, item]) : []);
      const items = rows.slice(0, 25).map((item) => {
        const previous = read.get(item.id);
        const unchanged =
          previous &&
          previous.updatedAt === item.updatedAt &&
          previous.url === item.url &&
          previous.title === item.title &&
          previous.subtitle === item.subtitle;
        return { ...item, unread: unchanged ? previous.unread : true };
      });
      const validated = LiveFolderItemsSchema.parse({ folderId, items, refreshedAt: this.now() });
      this.deps.repo.setSetting(this.key(folderId), { ...validated, source: identity });
      return validated;
    } catch (error) {
      if (this.lifetime.signal.aborted) throw new AuxError("cancelled", "Live folders stopped.");
      if (error instanceof AuxError && error.code === "cancelled") throw error;
      if ((await this.sourceIdentity(folderId)) !== identity)
        throw new AuxError("cancelled", "This live folder changed during refresh.");
      const latest = this.deps.repo.getSetting<Cached>(this.key(folderId));
      const message =
        source.live.kind === "github"
          ? "Couldn't refresh — Reconnect GitHub"
          : "Couldn't refresh — Check this source and try again";
      const result = LiveFolderItemsSchema.parse({
        folderId,
        items: latest?.source === identity ? latest.items : [],
        ...(latest?.refreshedAt ? { refreshedAt: latest.refreshedAt } : {}),
        error: message,
      });
      this.deps.repo.setSetting(this.key(folderId), { ...result, source: identity });
      return result;
    }
  }
  async refreshDue() {
    for (const source of await this.deps.sources()) {
      this.lifetime.signal.throwIfAborted();
      const cache = this.deps.repo.getSetting<Cached>(this.key(source.id));
      if (this.now() - (cache?.refreshedAt ?? 0) < source.live.refreshMinutes * 60_000) continue;
      await this.refresh(source.id);
    }
  }
}
