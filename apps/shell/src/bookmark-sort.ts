import type { Bookmark } from "@aux/contracts";
import type {
  BookmarkFolderChange,
  BookmarkFolderSnapshot,
  BookmarkPlacement,
} from "@aux/contracts/bookmark-folder-methods";
import {
  bookmarkSource,
  changeBookmarkFolder,
  folderDestination,
  folderSource,
  placeBookmark,
} from "./bookmark-folders";

export type BookmarkOrderUndo =
  { kind: "folder"; change: BookmarkFolderChange } | { kind: "bookmark"; change: BookmarkPlacement };

export async function undoBookmarkOrder(operation: BookmarkOrderUndo) {
  return operation.kind === "folder"
    ? changeBookmarkFolder(operation.change)
    : placeBookmark(operation.change);
}

/** Persist folders-first title order using the model's checked moves and inverses. */
export async function sortBookmarkFolder(
  snapshot: BookmarkFolderSnapshot,
  parentId: string,
  bookmarks: Pick<Bookmark, "nodeId" | "title" | "url">[],
  current: () => boolean,
  onStep: (snapshot: BookmarkFolderSnapshot, undo: BookmarkOrderUndo | null) => void,
) {
  const parent = snapshot.folders.find((folder) => folder.nodeId === parentId);
  if (!snapshot.editable || !parent) throw new Error("This bookmark folder cannot be sorted.");
  const folders = new Map(snapshot.folders.map((folder) => [folder.nodeId, folder]));
  const entries = new Map(bookmarks.map((bookmark) => [bookmark.nodeId, bookmark]));
  const ordered = parent.childIds.map((id) => {
    const folder = folders.get(id);
    const entry = entries.get(id);
    if (!folder && !entry) throw new Error("Bookmarks changed. Reload the folder before sorting.");
    return { id, folder: !!folder, title: folder?.title ?? entry!.title };
  });
  const collator = new Intl.Collator(undefined, { sensitivity: "base" });
  ordered.sort(
    (left, right) => Number(right.folder) - Number(left.folder) || collator.compare(left.title, right.title),
  );
  let next = snapshot;
  let moved = 0;
  for (const [index, item] of ordered.entries()) {
    if (!current()) throw new Error("The original bookmark view is no longer available.");
    const destination = next.folders.find((folder) => folder.nodeId === parentId);
    if (!destination) throw new Error("The bookmark folder changed while sorting.");
    if (destination.childIds[index] === item.id) continue;
    if (item.folder) {
      const folder = next.folders.find((folder) => folder.nodeId === item.id);
      if (!folder) throw new Error("The bookmark folder changed while sorting.");
      const result = await changeBookmarkFolder({
        kind: "move",
        source: folderSource(folder),
        destination: folderDestination(destination, index),
      });
      next = result.snapshot;
      onStep(next, result.undo ? { kind: "folder", change: result.undo } : null);
    } else {
      const result = await placeBookmark({
        source: bookmarkSource(entries.get(item.id)!, next),
        destination: folderDestination(destination, index),
      });
      next = result.snapshot;
      onStep(next, result.undo ? { kind: "bookmark", change: result.undo } : null);
    }
    moved++;
  }
  return moved;
}
