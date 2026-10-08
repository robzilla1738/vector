// @vitest-environment jsdom
import { expect, it } from "vitest";
import type { BookmarkFolderSnapshot } from "@aux/contracts/bookmark-folder-methods";
import { bookmarkSource, folderDrop } from "./bookmark-folders";

const snapshot: BookmarkFolderSnapshot = {
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
      childIds: ["12", "20", "21"],
    },
    {
      nodeId: "20",
      parentId: "1",
      index: 1,
      title: "Work",
      path: ["Work"],
      permanent: false,
      childIds: ["22"],
    },
    { nodeId: "21", parentId: "1", index: 2, title: "Work", path: ["Work"], permanent: false, childIds: [] },
    {
      nodeId: "22",
      parentId: "20",
      index: 0,
      title: "Nested",
      path: ["Work", "Nested"],
      permanent: false,
      childIds: [],
    },
  ],
};
const [root, first, second, nested] = snapshot.folders;
it("uses full native child indices for sibling ordering and preserves duplicate folder identity", () => {
  expect(folderDrop(second!, first!, "before", snapshot)).toEqual({
    kind: "move",
    source: { nodeId: "21", parentId: "1", index: 2, title: "Work" },
    destination: { parentId: "1", index: 1, expectedChildren: ["12", "20", "21"] },
  });
  expect(folderDrop(first!, second!, "after", snapshot)).toMatchObject({
    destination: { parentId: "1", index: 3 },
  });
  expect(folderDrop(first!, second!, "inside", snapshot)).toMatchObject({
    destination: { parentId: "21", index: 0, expectedChildren: [] },
  });
});
it("does not offer permanent, self, descendant, or administrator-disabled moves", () => {
  expect(folderDrop(root!, first!, "inside", snapshot)).toBeNull();
  expect(folderDrop(first!, first!, "inside", snapshot)).toBeNull();
  expect(folderDrop(first!, nested!, "inside", snapshot)).toBeNull();
  expect(folderDrop(first!, nested!, "before", snapshot)).toBeNull();
  expect(folderDrop(first!, second!, "inside", { ...snapshot, editable: false })).toBeNull();
});
it("captures bookmark source identity and rejects nodes missing from the native snapshot", () => {
  const saved = { nodeId: "12", url: "https://saved.test/", title: "Saved", createdAt: 1, folderPath: [] };
  expect(bookmarkSource(saved, snapshot)).toEqual({
    nodeId: "12",
    parentId: "1",
    index: 0,
    title: "Saved",
    url: saved.url,
  });
  expect(() => bookmarkSource({ ...saved, nodeId: "999" }, snapshot)).toThrow("bookmark changed");
});
