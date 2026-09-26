import type { PageTarget, TidyProposal } from "@aux/contracts";
import { assignFolder, createFolder, type Layout } from "./workspace";

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

/** Undo only Tidy's folders and assignments, preserving later unrelated layout edits. */
export function revertTidyProposal(before: Layout, after: Layout, current: Layout): Layout {
  const oldIds = new Set(before.folders.map(folder => folder.id));
  const created = after.folders.filter(folder => !oldIds.has(folder.id));
  const createdIds = new Set(created.map(folder => folder.id));
  const moved = Object.entries(after.tabFolder).filter(([pageId, folderId]) =>
    createdIds.has(folderId) && before.tabFolder[pageId] !== folderId);
  if (!created.length || !moved.length) throw new Error("This Tidy change is no longer available to undo.");
  for (const folder of created) {
    const live = current.folders.find(item => item.id === folder.id);
    if (!live || live.name !== folder.name || live.spaceId !== folder.spaceId)
      throw new Error("A Tidy folder changed. Review it before undoing.");
  }
  for (const [pageId, folderId] of moved) {
    if (current.tabFolder[pageId] !== folderId) throw new Error("A tidied tab moved again. Review it before undoing.");
  }
  const movedIds = new Set(moved.map(([pageId]) => pageId));
  if (Object.entries(current.tabFolder).some(([pageId, folderId]) => createdIds.has(folderId) && !movedIds.has(pageId)))
    throw new Error("A new tab was added to a Tidy folder. Review it before undoing.");
  const tabFolder = { ...current.tabFolder };
  for (const [pageId] of moved) {
    const original = before.tabFolder[pageId];
    if (original && current.folders.some(folder => folder.id === original)) tabFolder[pageId] = original;
    else delete tabFolder[pageId];
  }
  return { ...current, folders: current.folders.filter(folder => !createdIds.has(folder.id)), tabFolder };
}
