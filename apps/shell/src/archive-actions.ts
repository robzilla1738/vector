import type { PageTarget } from "@aux/contracts";
import type { ArchivedTab, Layout } from "./workspace";
import { confirmArchiveClose, finishTabArchive, removeTabArchive, stageTabArchive } from "./tab-archive";

let archiveTransactionActive = false;
export async function withArchiveTransaction<T>(work: () => Promise<T>): Promise<T> {
  if (archiveTransactionActive) throw new Error("Another archive batch is in progress. Wait for it to finish.");
  archiveTransactionActive = true;
  try { return await work(); }
  finally { archiveTransactionActive = false; }
}

/** One durable path for Overview, Today and the elected automatic archiver. */
export function archivePages(ids: readonly string[], options: { reason: "manual" | "auto"; batchId?: string }) {
  return withArchiveTransaction(() => archivePagesTransaction(ids, options));
}
async function archivePagesTransaction(ids: readonly string[], options: { reason: "manual" | "auto"; batchId?: string }) {
  const { bridge } = await import("./bridge");
  const { useStore, flushLayout } = await import("./store");
  const { persistLayout } = await import("./store/persistence");
  if (options.reason === "auto" && ids.length > 20) throw new Error("An automatic archive cycle is limited to twenty tabs.");
  const initial = useStore.getState();
  if (initial.layout.archivedTabs?.some(entry => entry.state === "pending")) throw new Error("Another archive batch is pending. Wait for its native close to be reconciled.");
  const chosen = ids.map(id => initial.pages.find(page => page.pageId === id));
  if (chosen.some(page => !page)) throw new Error("A selected tab is no longer available.");
  const pages = chosen as PageTarget[];
  const checks = await bridge.tabsUnsavedWork(pages.map(page => ({ pageId: page.pageId, url: page.url })));
  if (pages.some(page => checks[page.pageId] !== "clean")) throw new Error("A selected tab has unsaved work or could not be checked. Review it before archiving.");
  const batchId = options.batchId ?? crypto.randomUUID();
  const receipts: ArchivedTab[] = [];
  const save = async (layout: Layout) => { useStore.setState({ layout }); persistLayout(layout); await flushLayout(); };
  for (const selected of pages) {
    const state = useStore.getState();
    const page = state.pages.find(item => item.pageId === selected.pageId);
    if (!page || page.url !== selected.url) throw new Error("A selected tab changed. Review the remaining tabs.");
    const staged = stageTabArchive(state.layout, page, Date.now(), { ...options, batchId });
    try { await save(staged.layout); }
    catch (error) { await save(removeTabArchive(useStore.getState().layout, staged.entry.archiveId)); throw error; }
    const authority = await bridge.organizationSnapshot();
    const authoritativeEntries = authority.layout?.shared.archivedTabs ?? [];
    if (!authoritativeEntries.some(entry => entry.archiveId === staged.entry.archiveId && entry.batchId === batchId && entry.state === "pending") ||
        authoritativeEntries.some(entry => entry.state === "pending" && entry.batchId !== batchId)) {
      await save(removeTabArchive(useStore.getState().layout, staged.entry.archiveId));
      throw new Error("The Profile archive changed. Review it before starting another batch.");
    }
    const accepted = await confirmArchiveClose(page.pageId,
      async () => {
        if (options.reason === "auto") {
          const result = await bridge.archiveTab(page.pageId, page.url, batchId, page.lastActiveAt);
          return { status: result.archived ? "applied" : "rejected" };
        }
        return bridge.tabCommand({ kind: "close", pageId: page.pageId }, useStore.getState().catalogVersion);
      },
      () => bridge.tabsSnapshot());
    if (!accepted) {
      await save(removeTabArchive(useStore.getState().layout, staged.entry.archiveId));
      throw new Error("Native tab close was refused. Review the remaining tabs.");
    }
    await save(finishTabArchive(useStore.getState().layout, staged.entry.archiveId));
    receipts.push(staged.entry);
    // Yield between native/CAS transactions; no batch monopolizes a renderer turn.
    await new Promise<void>(resolve => setTimeout(resolve, 0));
  }
  return { batchId, entries: receipts };
}

export function restoreArchivedTab(entry: ArchivedTab) {
  return withArchiveTransaction(() => restoreArchivedTabTransaction(entry));
}
async function restoreArchivedTabTransaction(entry: ArchivedTab) {
  const { useStore, call, flushLayout } = await import("./store");
  const { persistLayout } = await import("./store/persistence");
  const { assignSpace, assignFolder } = await import("./workspace");
  const state = useStore.getState();
  if (!state.layout.archivedTabs?.some(item => item.archiveId === entry.archiveId && item.state === "archived"))
    throw new Error("This archived tab has changed. Refresh the archive.");
  const existing = state.pages.find(page => page.pageId === entry.pageId);
  if (existing && existing.url !== entry.url) throw new Error("The original tab ID now has a different page. Review it before restoring.");
  if (state.layout.archivedSpaces?.some(space => space.id === entry.spaceId))
    state.syncBrowserSpaces(await call("spaces.update", { id: entry.spaceId, archived: false }));
  if (!useStore.getState().layout.spaces.some(space => space.id === entry.spaceId)) throw new Error("Restore this Space before reopening its archived tabs.");
  if (!existing) {
    await state.openBackgroundTab(entry.url, entry.spaceId, false, entry.pageId, entry.index);
    if (!useStore.getState().pages.some(page => page.pageId === entry.pageId)) {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => { unsubscribe(); reject(new Error("The native tab has not appeared. The archive remains available.")); }, 3000);
        const unsubscribe = useStore.subscribe(current => {
          if (!current.pages.some(page => page.pageId === entry.pageId)) return;
          clearTimeout(timeout); unsubscribe(); resolve();
        });
      });
    }
  }
  const next = useStore.getState();
  let layout = assignSpace(next.layout, entry.pageId, entry.spaceId);
  if (entry.folderId && layout.folders.some(folder => folder.id === entry.folderId && folder.spaceId === entry.spaceId)) layout = assignFolder(layout, entry.pageId, entry.folderId);
  const order = layout.order.filter(id => id !== entry.pageId);
  order.splice(Math.min(entry.index, order.length), 0, entry.pageId);
  layout = removeTabArchive({ ...layout, order }, entry.archiveId);
  useStore.setState({ layout }); persistLayout(layout); await flushLayout();
}

export function undoArchiveBatch(batchId: string) {
  return withArchiveTransaction(() => undoArchiveBatchTransaction(batchId));
}
async function undoArchiveBatchTransaction(batchId: string) {
  const { useStore } = await import("./store");
  const entries = useStore.getState().layout.archivedTabs?.filter(entry => entry.batchId === batchId) ?? [];
  if (!entries.length || entries.some(entry => Date.now() - entry.archivedAt > 10_000)) throw new Error("This archive Undo has expired. Restore the tabs from Archive.");
  for (const entry of entries) await restoreArchivedTabTransaction(entry);
}


export function restoreAllArchivedTabs() {
  return withArchiveTransaction(async () => {
    const { useStore } = await import("./store");
    const entries = (useStore.getState().layout.archivedTabs ?? []).filter(entry => entry.state === "archived");
    for (const entry of entries) await restoreArchivedTabTransaction(entry);
  });
}

export function deleteArchivedTab(archiveId: string) {
  return withArchiveTransaction(async () => {
    const { useStore, flushLayout } = await import("./store");
    const { persistLayout } = await import("./store/persistence");
    const state = useStore.getState();
    if (!state.layout.archivedTabs?.some(entry => entry.archiveId === archiveId && entry.state === "archived"))
      throw new Error("This archived tab has changed. Refresh the archive.");
    const layout = removeTabArchive(state.layout, archiveId);
    useStore.setState({ layout }); persistLayout(layout); await flushLayout();
  });
}
