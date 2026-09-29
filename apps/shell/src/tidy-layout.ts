import type { PageTarget, TidyProposal } from "@aux/contracts";
import { assignFolder, createFolder, type Layout, type TidyUndoRecord } from "./workspace";

/** Builds one reviewable layout change. Nothing is persisted until the caller accepts it. */
export function applyTidyProposal(layout: Layout, livePages: readonly PageTarget[], spaceId: string, proposal: TidyProposal): Layout {
  if (!layout.spaces.some(space => space.id === spaceId)) throw new Error("This Space is no longer available.");
  const byId = new Map(livePages.map(page => [page.pageId, page]));
  const proposed = new Map(proposal.pages.map(page => [page.pageId, page]));
  if (proposed.size !== proposal.pages.length) throw new Error("The Tidy proposal repeated a tab.");
  for (const page of proposal.pages) {
    const live = byId.get(page.pageId);
    if (!live || live.url !== page.url || live.ownedByRuntime || live.viewStatus === "detached" || live.controller === "agent" || live.controller === "external"
      || (layout.tabSpace[page.pageId] ?? layout.activeSpaceId) !== spaceId)
      throw new Error("A tab changed or moved since Tidy made this proposal. Review the tabs and try again.");
  }
  let next = layout;
  const grouped = new Set<string>();
  for (const group of proposal.groups) {
    if (group.pageIds.length < 2) throw new Error("A Tidy folder needs at least two tabs.");
    for (const pageId of group.pageIds) {
      if (!proposed.has(pageId) || grouped.has(pageId)) throw new Error("The Tidy proposal contains an unknown or repeated tab.");
      grouped.add(pageId);
    }
    next = createFolder(next, spaceId, group.name);
    const folderId = next.folders.at(-1)!.id;
    for (const pageId of group.pageIds) next = assignFolder(next, pageId, folderId);
  }
  return next;
}

/** Capture only the folder and assignment before-state needed for a durable undo. */
export function tidyUndoRecord(before: Layout, after: Layout): TidyUndoRecord {
  const oldIds = new Set(before.folders.map(folder => folder.id));
  const created = after.folders.filter(folder => !oldIds.has(folder.id));
  const createdIds = new Set(created.map(folder => folder.id));
  const moved = Object.entries(after.tabFolder).filter(([pageId, folderId]) =>
    createdIds.has(folderId) && before.tabFolder[pageId] !== folderId)
    .map(([pageId, toFolderId]) => ({ pageId, toFolderId,
      ...(before.tabFolder[pageId] ? { fromFolderId: before.tabFolder[pageId] } : {}) }));
  if (!created.length || !moved.length) throw new Error("This Tidy change is no longer available to undo.");
  return { created, moved };
}

type TidyFolderIdentity = {
  id: string;
  name: string;
  spaceId: string;
  collapsed: boolean;
  color?: string;
  emoji?: string;
};

/** Created-folder identity the receipt is allowed to undo or restore. */
export function tidyFoldersMatch(created: readonly TidyFolderIdentity[], folders: readonly TidyFolderIdentity[]): boolean {
  return created.every(folder => {
    const live = folders.find(item => item.id === folder.id);
    return !!live && live.name === folder.name && live.spaceId === folder.spaceId &&
      live.collapsed === folder.collapsed && live.color === folder.color && live.emoji === folder.emoji;
  });
}

/** Undo only Tidy's folders and assignments, preserving later unrelated layout edits. */
export function revertTidyRecord(record: TidyUndoRecord, current: Layout): Layout {
  const { created, moved } = record;
  const createdIds = new Set(created.map(folder => folder.id));
  if (!tidyFoldersMatch(created, current.folders)) throw new Error("A Tidy folder changed. Review it before undoing.");
  for (const { pageId, toFolderId, fromFolderId } of moved) {
    if (current.tabFolder[pageId] !== toFolderId) throw new Error("A tidied tab moved again. Review it before undoing.");
    if (fromFolderId && !current.folders.some(folder => folder.id === fromFolderId))
      throw new Error("A prior folder changed. Review it before undoing.");
  }
  const movedIds = new Set(moved.map(({ pageId }) => pageId));
  if (Object.entries(current.tabFolder).some(([pageId, folderId]) => createdIds.has(folderId) && !movedIds.has(pageId)))
    throw new Error("A new tab was added to a Tidy folder. Review it before undoing.");
  const tabFolder = { ...current.tabFolder };
  for (const { pageId, fromFolderId } of moved) {
    if (fromFolderId) tabFolder[pageId] = fromFolderId;
    else delete tabFolder[pageId];
  }
  return { ...current, folders: current.folders.filter(folder => !createdIds.has(folder.id)), tabFolder,
    tidyUndo: undefined };
}

export function revertTidyProposal(before: Layout, after: Layout, current: Layout): Layout {
  return revertTidyRecord(tidyUndoRecord(before, after), current);
}
