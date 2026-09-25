import { nativePageId } from "./chrome";
import { splitRatio } from "@aux/contracts/split-layout";
/**
 * Pure reducers for the sidebar's local organisation: spaces, tab order,
 * pinned sites. The runtime owns pages; the shell owns how they are arranged.
 * Everything here is deterministic and unit-tested.
 */
import type { BrowserSpace, PageTarget } from "@aux/contracts";

export type SpaceColor = "blue" | "violet" | "pink" | "orange" | "green" | "teal" | "slate";
export const SPACE_COLORS: SpaceColor[] = ["blue", "violet", "pink", "orange", "green", "teal", "slate"];

export interface Space {
  id: string;
  name: string;
  color: SpaceColor;
  grain: number;
  workspaceId?: string;
}

export interface Pin {
  url: string;
  title: string;
}

export const PIN_ROW_SIZE = 5;

export interface Folder {
  id: string;
  name: string;
  spaceId: string;
  collapsed: boolean;
  color?: SpaceColor;
  /** Single grapheme shown instead of the folder glyph. */
  emoji?: string;
}

export interface Layout {
  spaces: Space[];
  archivedSpaces?: Space[];
  activeSpaceId: string;
  /** Saved companion per primary tab; restored only while both remain in this Space. */
  splits?: Record<string, string>;
  splitRatio?: number;
  activeTabs?: Record<string, string>;
  /** pageId → spaceId; pages not listed belong to the active space when first seen */
  tabSpace: Record<string, string>;
  /** explicit order of pageIds within the sidebar (across spaces) */
  order: string[];
  /** pinned sites per space */
  pins: Record<string, Pin[]>;
  /** named tab folders within a space (Arc-style) */
  folders: Folder[];
  /** pageId → folderId; missing means unfiled (shown below New Tab) */
  tabFolder: Record<string, string>;
  /** Human tab labels, bound to an exact URL so navigation restores the page title. */
  tabNames?: Record<string, { title: string; url: string }>;
}

export const DEFAULT_SPACE: Space = { id: "space-personal", name: "Personal", color: "blue", grain: 0 };

export function spaceGrain(value: unknown): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 100 ? value : 0;
}

export function tabLabel(layout: Layout, page: Pick<PageTarget, "pageId" | "url" | "title">): string {
  const saved = layout.tabNames?.[page.pageId];
  return saved?.url === page.url ? saved.title : page.title || (page.url && page.url !== "about:blank" ? hostOf(page.url) : "New Tab");
}

export function emptyLayout(): Layout {
  return { spaces: [DEFAULT_SPACE], archivedSpaces: [], splits: {}, splitRatio: .5, activeTabs: {}, activeSpaceId: DEFAULT_SPACE.id, tabSpace: {}, order: [], pins: { [DEFAULT_SPACE.id]: [] }, folders: [], tabFolder: {}, tabNames: {} };
}

let seq = 0;
export const newSpaceId = () => `space-${Date.now().toString(36)}-${(seq++).toString(36)}`;
export const newFolderId = () => `folder-${Date.now().toString(36)}-${(seq++).toString(36)}`;

/** Tabs the sidebar shows: human-facing, not worker pages. */
export function isTab(p: Pick<PageTarget, "viewStatus" | "ownedByRuntime">): boolean {
  return p.viewStatus !== "detached" && !p.ownedByRuntime;
}

/** Bring `order` in sync with the live page list: keep known order, append new pages, drop closed. Unchanged order is returned as-is. */
export function syncOrder(order: string[], pages: Pick<PageTarget, "pageId">[], preservedIds: string[] = []): string[] {
  const live = new Set(pages.map((p) => p.pageId));
  for (const id of preservedIds) live.add(id);
  const kept = order.filter((id) => live.has(id));
  const known = new Set(kept);
  for (const id of live) if (!known.has(id)) kept.push(id);
  return kept.length === order.length && kept.every((id, index) => id === order[index]) ? order : kept;
}

/** Layout with its order synced; the same object when nothing moved. */
export function withSyncedOrder(layout: Layout, pages: Pick<PageTarget, "pageId">[], preservedIds: string[] = []): Layout {
  const order = syncOrder(layout.order, pages, preservedIds);
  return order === layout.order ? layout : { ...layout, order };
}

/** Order and Space assignment synced to the live pages — identity-preserving. */
export function syncLayout(layout: Layout, pages: (Pick<PageTarget, "pageId"> & Partial<Pick<PageTarget, "url">>)[], preservedIds: string[] = []): Layout {
  const synced = syncSpaces(withSyncedOrder(layout, pages, preservedIds), pages, preservedIds);
  const names = synced.tabNames;
  if (!names || !Object.keys(names).length) return synced;
  const live = new Map(pages.map(page => [page.pageId, page]));
  const next = Object.fromEntries(Object.entries(names).filter(([pageId, name]) => {
    const page = live.get(pageId);
    return page ? page.url === undefined || page.url === name.url : preservedIds.includes(pageId);
  }));
  return Object.keys(next).length === Object.keys(names).length ? synced : { ...synced, tabNames: next };
}

/** Ensure every live page has a space; new pages land in the active space. */
export function syncSpaces(layout: Layout, pages: Pick<PageTarget, "pageId">[], preservedIds: string[] = []): Layout {
  const ids = new Set(pages.map((p) => p.pageId));
  for (const id of preservedIds) ids.add(id);
  const tabSpace: Record<string, string> = {};
  const valid = new Set([...layout.spaces, ...(layout.archivedSpaces ?? [])].map((s) => s.id));
  let changed = false;
  for (const id of ids) {
    const cur = layout.tabSpace[id];
    const next = cur && valid.has(cur) ? cur : layout.activeSpaceId;
    if (next !== cur) changed = true;
    tabSpace[id] = next;
  }
  if (!changed && Object.keys(layout.tabSpace).length === Object.keys(tabSpace).length) return layout;
  return { ...layout, tabSpace };
}

/** Horizontal groups are contiguous, positioned where their first member occurs. */
export function groupedTabs<T extends { pageId: string }>(layout: Layout, tabs: T[]): T[] {
  const seen = new Set<string>();
  return tabs.flatMap(page => {
    const folderId = layout.tabFolder[page.pageId];
    if (!folderId || !layout.folders.some(folder => folder.id === folderId)) return [page];
    if (seen.has(folderId)) return [];
    seen.add(folderId);
    return tabs.filter(item => layout.tabFolder[item.pageId] === folderId);
  });
}

/** Ordered tabs for one space. */
export function tabsInSpace<T extends Pick<PageTarget, "pageId" | "viewStatus" | "ownedByRuntime">>(
  layout: Layout,
  pages: T[],
  spaceId: string,
): T[] {
  const byId = new Map(pages.map((p) => [p.pageId, p]));
  const out: T[] = [];
  for (const id of layout.order) {
    const p = byId.get(id);
    if (p && isTab(p) && (layout.tabSpace[id] ?? layout.activeSpaceId) === spaceId) out.push(p);
  }
  // pages that have not been ordered yet (racing an event) trail the list
  const ordered = new Set(layout.order);
  for (const p of pages) {
    if (!ordered.has(p.pageId) && isTab(p) && (layout.tabSpace[p.pageId] ?? layout.activeSpaceId) === spaceId) out.push(p);
  }
  return out;
}

/** Move a tab to sit before `beforeId` (or at the end when null), keeping other spaces untouched. */
export function moveTab(layout: Layout, pageId: string, beforeId: string | null): Layout {
  if (pageId === beforeId) return layout;
  const without = layout.order.filter((id) => id !== pageId);
  if (beforeId === null) return { ...layout, order: [...without, pageId] };
  const idx = without.indexOf(beforeId);
  if (idx === -1) return { ...layout, order: [...without, pageId] };
  without.splice(idx, 0, pageId);
  return { ...layout, order: without };
}

/** Reorder by index within a space — what a drag gesture produces. */
export function reorderInSpace(layout: Layout, spaceId: string, from: number, to: number, pages: Pick<PageTarget, "pageId" | "viewStatus" | "ownedByRuntime">[]): Layout {
  const tabs = tabsInSpace(layout, pages, spaceId).map((p) => p.pageId);
  if (from < 0 || from >= tabs.length || to < 0 || to > tabs.length || from === to) return layout;
  const moving = tabs[from]!;
  const rest = tabs.filter((_, i) => i !== from);
  const insertAt = to > from ? to - 1 : to;
  rest.splice(insertAt, 0, moving);
  // rebuild the global order: replace this space's slots with the new sequence
  const slots = new Set(tabs);
  let k = 0;
  const order = layout.order.map((id) => (slots.has(id) ? rest[k++]! : id));
  for (; k < rest.length; k++) order.push(rest[k]!);
  return { ...layout, order };
}

export function assignSpace(layout: Layout, pageId: string, spaceId: string): Layout {
  if (!layout.spaces.some((s) => s.id === spaceId)) return layout;
  const tabSpace = { ...layout.tabSpace, [pageId]: spaceId };
  const fid = layout.tabFolder[pageId];
  const folder = fid ? layout.folders.find((f) => f.id === fid) : undefined;
  if (folder && folder.spaceId !== spaceId) {
    const tabFolder = { ...layout.tabFolder };
    delete tabFolder[pageId];
    return { ...layout, tabSpace, tabFolder };
  }
  return { ...layout, tabSpace };
}

export function createSpace(layout: Layout, name: string, color?: SpaceColor, grain = 0): Layout {
  const used = new Set(layout.spaces.map((s) => s.color));
  const pick = color ?? SPACE_COLORS.find((c) => !used.has(c)) ?? SPACE_COLORS[layout.spaces.length % SPACE_COLORS.length]!;
  const space: Space = { id: newSpaceId(), name: name.trim() || `Space ${layout.spaces.length + 1}`, color: pick, grain: spaceGrain(grain) };
  return { ...layout, spaces: [...layout.spaces, space], activeSpaceId: space.id, pins: { ...layout.pins, [space.id]: [] } };
}

export function renameSpace(layout: Layout, spaceId: string, name: string, color?: SpaceColor, grain?: number): Layout {
  return {
    ...layout,
    spaces: layout.spaces.map((s) => (s.id === spaceId ? { ...s, name: name.trim() || s.name, color: color ?? s.color, grain: grain === undefined ? s.grain : spaceGrain(grain) } : s)),
  };
}

/** Removing a space folds its tabs and pins into the neighbouring space. The last space cannot be removed. */
export function removeSpace(layout: Layout, spaceId: string): Layout {
  if (layout.spaces.length <= 1) return layout;
  const idx = layout.spaces.findIndex((s) => s.id === spaceId);
  if (idx === -1) return layout;
  const fallback = layout.spaces[idx === 0 ? 1 : idx - 1]!;
  const tabSpace = Object.fromEntries(Object.entries(layout.tabSpace).map(([k, v]) => [k, v === spaceId ? fallback.id : v]));
  const pins = { ...layout.pins };
  const moved = pins[spaceId] ?? [];
  delete pins[spaceId];
  pins[fallback.id] = dedupePins([...(pins[fallback.id] ?? []), ...moved]);
  const folders = layout.folders.map((f) => (f.spaceId === spaceId ? { ...f, spaceId: fallback.id } : f));
  return {
    ...layout,
    spaces: layout.spaces.filter((s) => s.id !== spaceId),
    activeSpaceId: layout.activeSpaceId === spaceId ? fallback.id : layout.activeSpaceId,
    tabSpace,
    pins,
    folders,
  };
}

export function setActiveSpace(layout: Layout, spaceId: string): Layout {
  return layout.spaces.some((s) => s.id === spaceId) ? { ...layout, activeSpaceId: spaceId } : layout;
}

export function reconcileSpaces(layout: Layout, records: BrowserSpace[]): Layout {
  const spaces = records.filter(space => !space.archived);
  if (!spaces.length) return layout;
  return {
    ...layout, spaces, archivedSpaces: records.filter(space => space.archived),
    activeSpaceId: spaces.some(space => space.id === layout.activeSpaceId) ? layout.activeSpaceId : spaces[0]!.id,
  };
}

export function togglePin(layout: Layout, spaceId: string, pin: Pin): Layout {
  const cur = layout.pins[spaceId] ?? [];
  const has = cur.some((p) => p.url === pin.url);
  const next = has ? cur.filter((p) => p.url !== pin.url) : [...cur, pin];
  return { ...layout, pins: { ...layout.pins, [spaceId]: next } };
}

/** Move by stable site identity so overflow and visible pins share one order. */
export function reorderPin(layout: Layout, spaceId: string, url: string, beforeUrl: string | null): Layout {
  const pins = layout.pins[spaceId] ?? [];
  const pin = pins.find(item => item.url === url);
  if (!pin || beforeUrl === url || (beforeUrl !== null && !pins.some(item => item.url === beforeUrl))) return layout;
  const next = pins.filter(item => item.url !== url);
  const index = beforeUrl === null ? next.length : next.findIndex(item => item.url === beforeUrl);
  next.splice(index, 0, pin);
  return { ...layout, pins: { ...layout.pins, [spaceId]: next } };
}

export function isPinned(layout: Layout, spaceId: string, url: string): boolean {
  return (layout.pins[spaceId] ?? []).some((p) => p.url === url);
}

export function foldersInSpace(layout: Layout, spaceId: string): Folder[] {
  return layout.folders.filter((f) => f.spaceId === spaceId);
}

export function tabsInFolder<T extends Pick<PageTarget, "pageId" | "viewStatus" | "ownedByRuntime">>(
  layout: Layout,
  pages: T[],
  folderId: string,
): T[] {
  return tabsInSpace(layout, pages, layout.folders.find((f) => f.id === folderId)?.spaceId ?? "").filter((p) => layout.tabFolder[p.pageId] === folderId);
}

export function unfiledTabs<T extends Pick<PageTarget, "pageId" | "viewStatus" | "ownedByRuntime">>(
  layout: Layout,
  pages: T[],
  spaceId: string,
): T[] {
  const ids = new Set(foldersInSpace(layout, spaceId).map((f) => f.id));
  return tabsInSpace(layout, pages, spaceId).filter((p) => {
    const fid = layout.tabFolder[p.pageId];
    return !fid || !ids.has(fid);
  });
}

export function createFolder(layout: Layout, spaceId: string, name: string): Layout {
  if (!layout.spaces.some((s) => s.id === spaceId)) return layout;
  const folder: Folder = { id: newFolderId(), name: name.trim() || "Untitled", spaceId, collapsed: false };
  return { ...layout, folders: [...layout.folders, folder] };
}

export function renameFolder(layout: Layout, folderId: string, name: string): Layout {
  const n = name.trim();
  if (!n) return layout;
  return { ...layout, folders: layout.folders.map((f) => (f.id === folderId ? { ...f, name: n } : f)) };
}

/** Partial folder update — name, accent colour and emoji glyph share one path. */
export function updateFolder(layout: Layout, folderId: string, patch: { name?: string; color?: SpaceColor | null; emoji?: string | null }): Layout {
  if (!layout.folders.some((f) => f.id === folderId)) return layout;
  return {
    ...layout,
    folders: layout.folders.map((f) => {
      if (f.id !== folderId) return f;
      const next = { ...f };
      if (patch.name !== undefined && patch.name.trim()) next.name = patch.name.trim();
      if (patch.color !== undefined) { if (patch.color) next.color = patch.color; else delete next.color; }
      if (patch.emoji !== undefined) { if (patch.emoji) next.emoji = patch.emoji; else delete next.emoji; }
      return next;
    }),
  };
}

export function toggleFolder(layout: Layout, folderId: string): Layout {
  return { ...layout, folders: layout.folders.map((f) => (f.id === folderId ? { ...f, collapsed: !f.collapsed } : f)) };
}

export function removeFolder(layout: Layout, folderId: string): Layout {
  const tabFolder = { ...layout.tabFolder };
  for (const [pageId, fid] of Object.entries(tabFolder)) if (fid === folderId) delete tabFolder[pageId];
  return { ...layout, folders: layout.folders.filter((f) => f.id !== folderId), tabFolder };
}

export function assignFolder(layout: Layout, pageId: string, folderId: string | null): Layout {
  const tabFolder = { ...layout.tabFolder };
  if (!folderId) {
    delete tabFolder[pageId];
    return { ...layout, tabFolder };
  }
  if (!layout.folders.some((f) => f.id === folderId)) return layout;
  tabFolder[pageId] = folderId;
  return { ...layout, tabFolder };
}

/** Reorder tabs that currently display as one group (a folder, or the unfiled list). */
export function reorderGroup(
  layout: Layout,
  spaceId: string,
  folderId: string | null,
  from: number,
  to: number,
  pages: Pick<PageTarget, "pageId" | "viewStatus" | "ownedByRuntime">[],
): Layout {
  const group = folderId ? tabsInFolder(layout, pages, folderId) : unfiledTabs(layout, pages, spaceId);
  const ids = group.map((p) => p.pageId);
  if (from < 0 || from >= ids.length || to < 0 || to > ids.length || from === to) return layout;
  const moving = ids[from]!;
  const rest = ids.filter((_, i) => i !== from);
  const insertAt = to > from ? to - 1 : to;
  rest.splice(insertAt, 0, moving);
  const slots = new Set(ids);
  let k = 0;
  const order = layout.order.map((id) => (slots.has(id) ? rest[k++]! : id));
  for (; k < rest.length; k++) order.push(rest[k]!);
  return { ...layout, order };
}

function dedupePins(pins: Pin[]): Pin[] {
  const seen = new Set<string>();
  return pins.filter((p) => (seen.has(p.url) ? false : (seen.add(p.url), true)));
}

/** Round-trip through storage — tolerant of missing/corrupt data. */
export function parseLayout(raw: string | null): Layout {
  if (!raw) return emptyLayout();
  try {
    const v = JSON.parse(raw) as Partial<Layout>;
    if (!Array.isArray(v.spaces) || v.spaces.length === 0) return emptyLayout();
    const spaces = v.spaces.filter((s): s is Space => !!s && typeof s.id === "string" && typeof s.name === "string")
      .map(space => ({ ...space, grain: spaceGrain(space.grain) }));
    if (!spaces.length) return emptyLayout();
    const active = spaces.some((s) => s.id === v.activeSpaceId) ? v.activeSpaceId! : spaces[0]!.id;
    return {
      spaces,
      archivedSpaces: Array.isArray(v.archivedSpaces) ? v.archivedSpaces.filter(space => space && typeof space.id === "string" && typeof space.name === "string").map(space => ({ ...space, grain: spaceGrain(space.grain) })) : [],
      activeSpaceId: active,
      splitRatio: splitRatio(v.splitRatio),
      activeTabs: v.activeTabs && typeof v.activeTabs === "object" ? Object.fromEntries(Object.entries(v.activeTabs).filter(([, pageId]) => typeof pageId === "string")) : {},
      splits: v.splits && typeof v.splits === "object" ? Object.fromEntries(Object.entries(v.splits).filter(([id, companion]) => typeof companion === "string" && id !== companion)) : {},
      tabSpace: v.tabSpace && typeof v.tabSpace === "object" ? v.tabSpace : {},
      order: Array.isArray(v.order) ? v.order.filter((x): x is string => typeof x === "string") : [],
      pins: v.pins && typeof v.pins === "object"
        ? Object.fromEntries(
            Object.entries(v.pins).map(([id, list]) => [id, Array.isArray(list) ? (list as Pin[]) : []]),
          )
        : {},
      folders: Array.isArray(v.folders)
        ? v.folders.flatMap((f) => {
            if (!f || typeof f.id !== "string" || typeof f.name !== "string" || typeof f.spaceId !== "string") return [];
            return [{ id: f.id, name: f.name, spaceId: f.spaceId, collapsed: !!f.collapsed }];
          })
        : [],
      tabFolder: v.tabFolder && typeof v.tabFolder === "object"
        ? Object.fromEntries(Object.entries(v.tabFolder).filter((entry): entry is [string, string] => typeof entry[1] === "string"))
        : {},
      tabNames: v.tabNames && typeof v.tabNames === "object"
        ? Object.fromEntries(Object.entries(v.tabNames).filter((entry): entry is [string, { title: string; url: string }] =>
          !!entry[1] && typeof entry[1].title === "string" && entry[1].title.trim().length >= 2
          && entry[1].title.length <= 60 && !/[\p{Cc}\p{Cf}]/u.test(entry[1].title)
          && typeof entry[1].url === "string" && entry[1].url.length <= 8192))
        : {},
    };
  } catch {
    return emptyLayout();
  }
}

/** Host without www — used for tiles, pins, and the start page. */
export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Only pages that Aux can display inside its own stage can be paired. */
export function canSplitPage(page: PageTarget | undefined): boolean {
  return !!page && isTab(page) && !!nativePageId({mode:"focus",overlay:null,activePageId:page.pageId,...page});
}

/** Pair a preview with the current tab, or with another tab in the same Space. */
export function previewSplit(layout: Layout, pages: PageTarget[], pageId: string, activePageId: string | null): { primary: string; companion: string } | null {
  const target = pages.find(page => page.pageId === pageId);
  if (!canSplitPage(target)) return null;
  const spaceId = layout.tabSpace[pageId];
  const partner = (page: PageTarget | undefined) => !!page && page.pageId !== pageId && canSplitPage(page) && layout.tabSpace[page.pageId] === spaceId;
  const active = pages.find(page => page.pageId === activePageId);
  if (active && partner(active)) return { primary: active.pageId, companion: pageId };
  const other = pages.find(page => partner(page));
  return other ? { primary: pageId, companion: other.pageId } : null;
}

/** A saved split never borrows a tab from another Space or a worker. */
export function splitForPage(layout: Layout, pages: PageTarget[], pageId: string | null): string | null {
  if (!pageId) return null;
  const companionId = layout.splits?.[pageId];
  if (!companionId || companionId === pageId || layout.tabSpace[pageId] !== layout.tabSpace[companionId]) return null;
  const companion = pages.find(page => page.pageId === companionId);
  return companion && isTab(companion) ? companionId : null;
}

/** Keep the last human selection per Space; stale closed IDs are ignored by the caller. */
export function rememberActiveTab(layout: Layout, pageId: string | null): Layout {
  if (!pageId) return layout;
  const spaceId = layout.tabSpace[pageId];
  if (!spaceId || layout.activeTabs?.[spaceId] === pageId) return layout;
  return { ...layout, activeTabs: { ...layout.activeTabs, [spaceId]: pageId } };
}
