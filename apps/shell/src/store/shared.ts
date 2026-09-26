import type { MethodName, MethodResult, RpcArgs, PageTarget, TabCommand, TabRecord } from "@aux/contracts";
import { bridge } from "../bridge";
import { CLOSED_TAB_LIMIT } from "../closed-tabs";
import { isTab, splitForPage, tabsInSpace, withSyncedOrder } from "../workspace";
import { persistClosedTabs, persistLayout } from "./persistence";
import type { Workspace } from "./types";

/** Highest runtime event seq applied — refresh() ordering only, never rendered. */
let eventSeq = 0;
export const lastEventSeq = () => eventSeq;
export const noteEventSeq = (seq: number) => { if (seq > eventSeq) eventSeq = seq; };
export const pageRevisions = new Map<string, number>();
export const answerSeq = new Map<string, number>();
/** Tabs this window removed ahead of main's confirmation — late upserts must not resurrect them. */
export const closingOptimistic = new Set<string>();
/** Tabs this window opened ahead of main's confirmation — removed again if the open is refused. */
export const openingOptimistic = new Set<string>();
export const pageRevision = (pageId: string) => pageRevisions.get(pageId);
/** Page previews stay out of reactive state; `previewVersion` announces changes. */
export const previewCache = new Map<string, string>();
export const pagePreview = (pageId: string) => previewCache.get(pageId);
export const forgetPreview = (pageId: string) => {
  const url = previewCache.get(pageId);
  if (url === undefined) return false;
  if (url.startsWith("blob:")) URL.revokeObjectURL(url);
  previewCache.delete(pageId);
  pageRevisions.delete(pageId);
  return true;
};

/** IPC delivers fresh objects every time — small records compare by content. */
export const sameValue = (a: unknown, b: unknown) => a === b || (!!a && !!b && typeof a === "object" && typeof b === "object" && JSON.stringify(a) === JSON.stringify(b));

/** Shallow-merge fields into one page; the same state when nothing changes. */
export function patchPage<S extends { pages: PageTarget[] }>(st: S, pageId: string, fields: Partial<PageTarget>): S | { pages: PageTarget[] } {
  const index = st.pages.findIndex((p) => p.pageId === pageId);
  const page = index >= 0 ? st.pages[index]! : undefined;
  if (!page || Object.entries(fields).every(([key, value]) => sameValue(page[key as keyof PageTarget], value))) return st;
  return { pages: st.pages.with(index, { ...page, ...fields }) };
}

/** Typed runtime call — params and result follow the contracts' MethodSchemas/ResultSchemas. */
export async function call<M extends MethodName>(method: M, ...params: RpcArgs<M>): Promise<MethodResult<M>> {
  return (await bridge.invoke(method, ...params)) as MethodResult<M>;
}

export async function sendTabCommand(get: () => Workspace, command: TabCommand): Promise<void> {
  // Focus is existence-only: an activate aimed at a tab this renderer just
  // opened must not bounce off the stale_tab gate while its upsert patch is
  // still in flight. Mutating commands keep the version guard.
  const catalogVersion = command.kind === "activate" ? undefined : get().catalogVersion;
  const ack = await bridge.tabCommand(command, catalogVersion);
  if (ack.status === "rejected") throw new Error(ack.error?.message ?? "This tab command was rejected.");
}

/** Catalog → PageTarget for a tab the runtime has not announced yet. */
export const pageFromTab = (tab: TabRecord): PageTarget => ({
  pageId: tab.pageId,
  windowId: tab.windowId,
  backend: "aux",
  targetId: `atab-${tab.pageId}`,
  url: tab.url,
  title: tab.title,
  favicon: tab.favicon,
  documentEpoch: 0,
  lastRevision: 0,
  viewStatus: tab.crashed ? "crashed" : "hidden",
  lifecycle: tab.lifecycle,
  controller: "none",
  controllerEpoch: 0,
  ownedByRuntime: tab.runtimeOwned,
  createdAt: tab.createdAt,
  lastActiveAt: tab.lastActiveAt,
  loading: tab.loading,
  canGoBack: tab.canGoBack,
  canGoForward: tab.canGoForward,
  navigationError: tab.navigationError ?? null,
});

/**
 * Overlay catalog-owned fields on a live target. Runtime-owned fields —
 * controller, epochs, documentEpoch, driver state — are never touched here.
 */
export const mergeTabInto = (page: PageTarget, tab: TabRecord): PageTarget => {
  const merged = mergedTab(page, tab);
  for (const key in merged) if (!sameValue(merged[key as keyof PageTarget], page[key as keyof PageTarget])) return merged;
  return page;
};
export const mergedTab = (page: PageTarget, tab: TabRecord): PageTarget => ({
  ...page,
  windowId: tab.windowId,
  url: tab.url,
  // The runtime owns the error-page title ("Page couldn't load") — the catalog
  // only knows Electron's last live title, which is stale once a page errors.
  title: tab.navigationError ? page.title || tab.title : tab.title,
  favicon: tab.favicon ?? page.favicon,
  loading: tab.loading,
  canGoBack: tab.canGoBack,
  canGoForward: tab.canGoForward,
  navigationError: tab.navigationError ?? null,
  lastActiveAt: tab.lastActiveAt,
  viewStatus: tab.crashed ? "crashed" : page.viewStatus === "crashed" ? "hidden" : page.viewStatus,
  lifecycle: tab.lifecycle ?? "live",
});

/** Push the window's strip order to the catalog — the window op echo converges the rest. */
export const syncCatalogOrder = (order: string[], pages: PageTarget[], catalogVersion: number) =>
  void bridge.tabCommand({ kind: "reorder", order: order.filter(id => pages.some(page => page.pageId === id && (page.windowId ?? "main") === bridge.windowId)) }, catalogVersion).catch(() => {});

/**
 * Everything a removal touches — shared by the runtime `page.removed` event
 * and catalog `remove` ops. Returns the state pieces plus the tab the caller
 * should activate when nothing else already chose a successor.
 */
export function applyRemoval(st: Workspace, id: string, activeHint: string | null) {
  const group = closingGroups.get(id);
  closingGroups.delete(id);
  const gone = st.pages.find(p => p.pageId === id);
  const closedTabs = gone && isTab(gone) && gone.url && gone.url !== "about:blank" && !st.closedTabs.some(tab => tab.pageId === id)
    ? [...st.closedTabs, {
      pageId: gone.pageId, url: gone.url, title: gone.title,
      spaceId: st.layout.tabSpace[id] ?? st.layout.activeSpaceId,
      folderId: st.layout.tabFolder[id], index: Math.max(0, st.layout.order.indexOf(id)),
      closedAt: Date.now(), wasActive: st.activePageId === id, ...group,
    }].slice(-CLOSED_TAB_LIMIT) : st.closedTabs;
  if (closedTabs !== st.closedTabs) persistClosedTabs(closedTabs);
  const previewVersion = forgetPreview(id) ? st.previewVersion + 1 : st.previewVersion;
  const zoomLevels = { ...st.zoomLevels };
  delete zoomLevels[id];
  const pages = st.pages.filter(p => p.pageId !== id);
  // closing the active tab focuses its neighbour, like every browser
  let activePageId = st.activePageId;
  let activateNext: string | undefined;
  if (activePageId === id) {
    if (activeHint && pages.some(page => page.pageId === activeHint && st.layout.tabSpace[activeHint] === st.layout.activeSpaceId)) {
      activePageId = activeHint;
    } else {
      const visible = tabsInSpace(st.layout, st.pages, st.layout.activeSpaceId).map(page => page.pageId);
      const order = visible.filter(pageId => pageId !== id);
      const idx = visible.indexOf(id);
      activePageId = order[Math.min(Math.max(idx, 0), order.length - 1)] ?? order[order.length - 1] ?? null;
      activateNext = activePageId ?? undefined;
    }
  }
  const layout = withSyncedOrder(st.layout, pages, st.pendingRestoreIds);
  persistLayout(layout);
  return {
    next: { pages, closedTabs, previewVersion, zoomLevels, layout, splitPageId: splitForPage(layout, pages, activePageId), activePageId },
    activateNext,
  };
}

/** artifacts.read returns base64 of UTF-8 bytes — atob alone would mangle anything outside Latin-1 */
export function decodeBase64Json<T>(b64: string): T {
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

export const closingGroups = new Map<string, {groupId: string; index: number; wasActive: boolean}>();
