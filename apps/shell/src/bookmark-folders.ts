import {
  BookmarkEntryRemoveResultSchema,
  BookmarkEntryEditResultSchema,
  BookmarkOpenResultSchema,
  type BookmarkEntryEdit,
  BookmarkFolderSnapshotSchema,
  BookmarkPlacementResultSchema,
  type BookmarkPlacement,
  BookmarkFolderChangeResultSchema,
  type BookmarkFolder,
  type BookmarkFolderChange,
  type BookmarkFolderSnapshot,
} from "@aux/contracts/bookmark-folder-methods";
import type { Bookmark } from "@aux/contracts";
import { bridge } from "./bridge";

export async function readBookmarkFolders() {
  const response = await bridge.bookmarksInvoke({ method: "bookmarks.folders.snapshot", params: {} });
  if (response.method !== "bookmarks.folders.snapshot")
    throw new Error("Unexpected bookmark folder response.");
  return BookmarkFolderSnapshotSchema.parse(response.result);
}

export async function changeBookmarkFolder(params: BookmarkFolderChange) {
  const response = await bridge.bookmarksInvoke({ method: "bookmarks.folders.change", params });
  if (response.method !== "bookmarks.folders.change") throw new Error("Unexpected bookmark folder response.");
  return BookmarkFolderChangeResultSchema.parse(response.result);
}

export function folderSource(folder: BookmarkFolder) {
  if (folder.permanent || !folder.parentId)
    throw new Error("This bookmark folder cannot be moved or changed.");
  return { nodeId: folder.nodeId, parentId: folder.parentId, index: folder.index, title: folder.title };
}

export function folderDestination(folder: BookmarkFolder, index = folder.childIds.length) {
  return { parentId: folder.nodeId, index, expectedChildren: [...folder.childIds] };
}

export type FolderDropPosition = "before" | "inside" | "after";

export function folderDrop(
  source: BookmarkFolder,
  target: BookmarkFolder,
  position: FolderDropPosition,
  snapshot: BookmarkFolderSnapshot,
): BookmarkFolderChange | null {
  if (!snapshot.editable || source.permanent || source.nodeId === target.nodeId) return null;
  const folders = new Map(snapshot.folders.map((folder) => [folder.nodeId, folder]));
  const destination = position === "inside" ? target : folders.get(target.parentId ?? "");
  if (!destination) return null;
  for (
    let parent: BookmarkFolder | undefined = destination;
    parent;
    parent = folders.get(parent.parentId ?? "")
  ) {
    if (parent.nodeId === source.nodeId) return null;
  }
  const index =
    position === "inside" ? destination.childIds.length : target.index + (position === "after" ? 1 : 0);
  return { kind: "move", source: folderSource(source), destination: folderDestination(destination, index) };
}

export async function placeBookmark(params: BookmarkPlacement) {
  const response = await bridge.bookmarksInvoke({ method: "bookmarks.folders.placeBookmark", params });
  if (response.method !== "bookmarks.folders.placeBookmark")
    throw new Error("Unexpected bookmark placement response.");
  return BookmarkPlacementResultSchema.parse(response.result);
}

export function bookmarkSource(
  item: Pick<Bookmark, "nodeId" | "title" | "url">,
  snapshot: BookmarkFolderSnapshot,
): BookmarkPlacement["source"] {
  const parent = snapshot.folders.find((folder) => folder.childIds.includes(item.nodeId ?? ""));
  if (!item.nodeId || !parent) throw new Error("The bookmark changed. Open its menu and try again.");
  return {
    nodeId: item.nodeId,
    parentId: parent.nodeId,
    index: parent.childIds.indexOf(item.nodeId),
    title: item.title,
    url: item.url,
  };
}

export async function removeBookmark(source: BookmarkPlacement["source"]) {
  const response = await bridge.bookmarksInvoke({ method: "bookmarks.entries.remove", params: { source } });
  if (response.method !== "bookmarks.entries.remove") throw new Error("Unexpected bookmark response.");
  return BookmarkEntryRemoveResultSchema.parse(response.result);
}

export async function restoreBookmark(undoToken: string) {
  const response = await bridge.bookmarksInvoke({
    method: "bookmarks.entries.restore",
    params: { undoToken },
  });
  if (response.method !== "bookmarks.entries.restore") throw new Error("Unexpected bookmark response.");
  return BookmarkFolderSnapshotSchema.parse(response.result);
}

export async function editBookmark(params: BookmarkEntryEdit) {
  const response = await bridge.bookmarksInvoke({ method: "bookmarks.entries.edit", params });
  if (response.method !== "bookmarks.entries.edit") throw new Error("Unexpected bookmark response.");
  return BookmarkEntryEditResultSchema.parse(response.result);
}

/** Saved browser addresses stay in Chromium's navigation pipeline, outside the WebUI document. */
export async function openBookmark(
  item: Pick<Bookmark, "nodeId" | "url">,
  disposition: "foreground" | "background" | "window" | "private",
  pageId?: string,
  spaceId?: string,
) {
  if (!item.nodeId) throw new Error("This bookmark is no longer available.");
  const script = item.url.toLowerCase().startsWith("javascript:");
  if (script && disposition !== "foreground")
    throw new Error("Bookmarklets run in the current tab. Open this bookmark normally.");
  const response = await bridge.bookmarksInvoke({
    method: "bookmarks.open",
    params: {
      nodeId: item.nodeId,
      url: item.url,
      disposition: script ? "current" : disposition,
      ...(script && pageId ? { pageId } : {}),
      ...(spaceId && disposition !== "window" && disposition !== "private" ? { spaceId } : {}),
    },
  });
  if (response.method !== "bookmarks.open") throw new Error("Unexpected bookmark response.");
  return BookmarkOpenResultSchema.parse(response.result);
}

export function descendantBookmarkIds(folder: BookmarkFolder, snapshot: BookmarkFolderSnapshot): Set<string> {
  const byId = new Map(snapshot.folders.map((item) => [item.nodeId, item]));
  const ids = new Set<string>();
  const visit = (parent: BookmarkFolder) => {
    for (const id of parent.childIds) {
      ids.add(id);
      const child = byId.get(id);
      if (child) visit(child);
    }
  };
  visit(folder);
  return ids;
}

export async function createBookmark(
  params: Pick<BookmarkEntryEdit, "title" | "url"> & { destination: BookmarkPlacement["destination"] },
) {
  const response = await bridge.bookmarksInvoke({ method: "bookmarks.entries.create", params });
  if (response.method !== "bookmarks.entries.create") throw new Error("Unexpected bookmark response.");
  return BookmarkFolderSnapshotSchema.parse(response.result);
}

export function bookmarkFolderLabel(folder: BookmarkFolder, snapshot: BookmarkFolderSnapshot) {
  const name = folder.path.join(" / ") || "Bookmarks";
  const matches = snapshot.folders.filter(
    (item) => JSON.stringify(item.path) === JSON.stringify(folder.path),
  );
  return matches.length > 1
    ? `${name} (${matches.findIndex((item) => item.nodeId === folder.nodeId) + 1})`
    : name;
}
