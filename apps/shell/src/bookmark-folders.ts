import {
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
