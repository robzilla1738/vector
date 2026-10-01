import type { PageTarget } from "@aux/contracts";
import type { ArchivedTab, Layout } from "./workspace";

const MAX_ARCHIVED_TABS = 300;

/** The native unsaved-work check is performed immediately before this snapshot. */
export function stageTabArchive(layout: Layout, page: PageTarget, now = Date.now(), options: { reason?: "manual" | "auto"; batchId?: string } = {}): { layout: Layout; entry: ArchivedTab } {
  if (!/^https?:\/\//.test(page.url) || page.url.length > 8192 ||
    page.ownedByRuntime || page.viewStatus === "detached" ||
    page.controller === "agent" || page.controller === "external")
    throw new Error("This tab cannot be archived. Take control of a regular web tab first.");
  const entries = layout.archivedTabs ?? [];
  const finished = entries.filter(entry => entry.state === "archived");
  const pending = entries.filter(entry => entry.state === "pending");
  if (pending.length >= 20)
    throw new Error("Another archive batch is in progress. Wait for it to finish.");
  const requiredPrunes = Math.max(0, entries.length + 1 - MAX_ARCHIVED_TABS);
  const prunable = finished.filter(entry => entry.reason === "auto").length;
  if ((options.reason !== "auto" && entries.length >= MAX_ARCHIVED_TABS) || requiredPrunes > prunable)
    throw new Error("The Profile archive is full. Restore or remove an archived tab first.");
  if ((layout.archivedTabs ?? []).some(item => item.pageId === page.pageId))
    throw new Error("This tab is already being archived.");
  const spaceId = layout.tabSpace[page.pageId] ?? layout.activeSpaceId;
  const folderId = layout.tabFolder[page.pageId];
  const entry: ArchivedTab = {
    archiveId: crypto.randomUUID(), pageId: page.pageId, url: page.url,
    title: page.title.slice(0, 500), spaceId,
    ...(folderId ? { folderId } : {}),
    index: Math.max(0, layout.order.indexOf(page.pageId)),
    archivedAt: now, state: "pending", reason: options.reason ?? "manual", batchId: options.batchId ?? crypto.randomUUID(),
  };
  return { entry, layout: { ...layout, archivedTabs: [...(layout.archivedTabs ?? []), entry] } };
}

export function finishTabArchive(layout: Layout, archiveId: string): Layout {
  const target = layout.archivedTabs?.find(entry => entry.archiveId === archiveId);
  let entries = (layout.archivedTabs ?? []).map(entry => entry.archiveId === archiveId ? { ...entry, state: "archived" as const } : entry);
  const excess = entries.filter(entry => entry.state === "archived").length - MAX_ARCHIVED_TABS;
  if (excess > 0 && target?.reason === "auto") {
    const prune = new Set(entries.filter(entry => entry.state === "archived" && entry.reason === "auto" && entry.archiveId !== archiveId)
      .sort((a, b) => a.archivedAt - b.archivedAt).slice(0, excess).map(entry => entry.archiveId));
    entries = entries.filter(entry => !prune.has(entry.archiveId));
  }
  return { ...layout, archivedTabs: entries };
}

export function removeTabArchive(layout: Layout, archiveId: string): Layout {
  return { ...layout, archivedTabs: (layout.archivedTabs ?? []).filter(entry => entry.archiveId !== archiveId) };
}

/** A crash between the Profile write and native close resolves from the catalog. */
export function reconcilePendingArchives(layout: Layout, livePageIds: ReadonlySet<string>): Layout {
  if (!(layout.archivedTabs ?? []).some(entry => entry.state === "pending")) return layout;
  let reconciled = layout;
  for (const entry of layout.archivedTabs ?? []) {
    if (entry.state !== "pending") continue;
    reconciled = livePageIds.has(entry.pageId) ? removeTabArchive(reconciled, entry.archiveId) : finishTabArchive(reconciled, entry.archiveId);
  }
  return reconciled;
}

/** A lost acknowledgement is resolved from Chromium's catalog before rollback. */
export async function confirmArchiveClose(
  pageId: string,
  close: () => Promise<{ status: string }>,
  catalog: () => Promise<{ tabs: { pageId: string }[] }>,
): Promise<boolean> {
  try { return (await close()).status !== "rejected"; }
  catch {
    try { return !(await catalog()).tabs.some(tab => tab.pageId === pageId); }
    catch { throw new Error("Native close outcome is uncertain. The pending archive will be reconciled on restart."); }
  }
}

