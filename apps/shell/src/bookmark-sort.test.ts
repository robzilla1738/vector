// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import type { BookmarkFolderSnapshot, BookmarkPlacement } from "@aux/contracts/bookmark-folder-methods";
import * as folders from "./bookmark-folders";
import { sortBookmarkFolder, undoBookmarkOrder, type BookmarkOrderUndo } from "./bookmark-sort";

const bookmarks = [
  { nodeId: "11", url: "https://example.com/z", title: "Zebra" },
  { nodeId: "12", url: "https://example.com/a", title: "Alpha" },
];
function snapshot(children: string[]): BookmarkFolderSnapshot {
  return {
    rootId: "1",
    editable: true,
    folders: [
      {
        nodeId: "1",
        parentId: null,
        index: 0,
        title: "Bookmarks",
        path: [],
        permanent: true,
        childIds: children,
      },
      ...["20", "21"].map((nodeId) => ({
        nodeId,
        parentId: "1",
        index: children.indexOf(nodeId),
        title: "Work",
        path: ["Work"],
        permanent: false,
        childIds: [],
      })),
    ],
  };
}
afterEach(() => vi.restoreAllMocks());

it("persists folders first, preserves equal-title order and dispatches native inverses for undo", async () => {
  const original = snapshot(["11", "20", "12", "21"]);
  const first = snapshot(["20", "11", "12", "21"]);
  const second = snapshot(["20", "21", "11", "12"]);
  const final = snapshot(["20", "21", "12", "11"]);
  const folderUndo = {
    kind: "move" as const,
    source: folders.folderSource(first.folders[1]!),
    destination: folders.folderDestination(first.folders[0]!, 2),
  };
  const change = vi
    .spyOn(folders, "changeBookmarkFolder")
    .mockResolvedValueOnce({ snapshot: first, undo: folderUndo })
    .mockResolvedValueOnce({ snapshot: second, undo: null });
  const bookmarkUndo: BookmarkPlacement = {
    source: folders.bookmarkSource(bookmarks[1]!, final),
    destination: folders.folderDestination(final.folders[0]!, 4),
  };
  const place = vi.spyOn(folders, "placeBookmark").mockResolvedValue({ snapshot: final, undo: bookmarkUndo });
  const steps = vi.fn();
  expect(await sortBookmarkFolder(original, "1", bookmarks, () => true, steps)).toBe(3);
  expect(
    change.mock.calls.map(
      ([operation]) => operation.kind === "move" && [operation.source.nodeId, operation.destination.index],
    ),
  ).toEqual([
    ["20", 0],
    ["21", 1],
  ]);
  expect(place).toHaveBeenCalledWith({
    source: { nodeId: "12", parentId: "1", index: 3, title: "Alpha", url: "https://example.com/a" },
    destination: { parentId: "1", index: 2, expectedChildren: ["20", "21", "11", "12"] },
  });
  expect(steps.mock.calls.map(([next]) => next.folders[0].childIds)).toEqual(
    [first, second, final].map((next) => next.folders[0]!.childIds),
  );
  change.mockResolvedValue({ snapshot: original, undo: null });
  const inverse = steps.mock.calls
    .map(([, undo]) => undo as BookmarkOrderUndo | null)
    .filter((undo): undo is BookmarkOrderUndo => !!undo)
    .reverse();
  for (const operation of inverse) await undoBookmarkOrder(operation);
  expect(place).toHaveBeenLastCalledWith(bookmarkUndo);
  expect(change).toHaveBeenLastCalledWith(folderUndo);
});

it("keeps successful move evidence on conflict and does not dispatch after the view retires", async () => {
  const original = snapshot(["11", "20", "12", "21"]);
  const first = snapshot(["20", "11", "12", "21"]);
  const change = vi
    .spyOn(folders, "changeBookmarkFolder")
    .mockResolvedValueOnce({ snapshot: first, undo: null })
    .mockRejectedValueOnce(new Error("Folder changed"));
  const steps = vi.fn();
  await expect(sortBookmarkFolder(original, "1", bookmarks, () => true, steps)).rejects.toThrow(
    "Folder changed",
  );
  expect(steps).toHaveBeenCalledOnce();
  expect(steps).toHaveBeenCalledWith(first, null);
  change.mockClear();
  await expect(sortBookmarkFolder(original, "1", bookmarks, () => false, steps)).rejects.toThrow(
    "original bookmark view",
  );
  expect(change).not.toHaveBeenCalled();
  expect(
    await sortBookmarkFolder(snapshot(["20", "21", "12", "11"]), "1", bookmarks, () => true, steps),
  ).toBe(0);
  expect(change).not.toHaveBeenCalled();
});
