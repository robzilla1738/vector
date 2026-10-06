import { expect, it } from "vitest";
import { openDb, Repo } from "@aux/runtime";

const repo = () => new Repo(openDb(":memory:"));

it("flags reading-list items on the bookmark row without a second ownership path", () => {
  const r = repo();
  r.setReadingList("https://later.example/", true, "Read me later");
  const items = r.listBookmarks();
  expect(items).toHaveLength(1);
  expect(items[0]).toMatchObject({
    url: "https://later.example/",
    title: "Read me later",
    readingList: true,
  });
  // Removing the bookmark removes the list entry — one ownership path.
  r.removeBookmark("https://later.example/");
  expect(r.listBookmarks()).toEqual([]);
});

it("marks read state and clears it when the item leaves the list", () => {
  const r = repo();
  r.setReadingList("https://a.example/", true, "A");
  r.markBookmarkRead("https://a.example/", true);
  expect(r.listBookmarks()[0]).toMatchObject({ readingList: true });
  expect(r.listBookmarks()[0]!.readAt).toBeGreaterThan(0);
  r.markBookmarkRead("https://a.example/", false);
  expect(r.listBookmarks()[0]!.readAt).toBeUndefined();
  r.markBookmarkRead("https://a.example/", true);
  r.setReadingList("https://a.example/", false);
  expect(r.listBookmarks()[0]).toMatchObject({ url: "https://a.example/" });
  expect(r.listBookmarks()[0]!.readingList).toBeUndefined();
  expect(r.listBookmarks()[0]!.readAt).toBeUndefined();
  expect(() => r.markBookmarkRead("https://a.example/", true)).toThrow(/reading list/);
});

it("keeps the reading-list flag on regular re-bookmarking and add-with-flag", () => {
  const r = repo();
  r.addBookmark("https://b.example/", "B", undefined, true);
  expect(r.listBookmarks()[0]).toMatchObject({ readingList: true });
  // A plain re-bookmark (no flag argument) must not clear the list membership.
  r.addBookmark("https://b.example/", "B renamed");
  expect(r.listBookmarks()[0]).toMatchObject({ readingList: true, title: "B renamed" });
  r.setReadingList("https://new.example/", false);
  expect(r.listBookmarks().some((item) => item.url === "https://new.example/")).toBe(false);
});

it("stores one offline copy per bookmark and cascades it on removal", () => {
  const r = repo();
  r.setReadingList("https://doc.example/", true, "Doc");
  r.saveBookmarkArticle("https://doc.example/", JSON.stringify({ title: "Doc", content: "…" }));
  const saved = r.getBookmarkArticle("https://doc.example/");
  expect(saved?.article).toContain("Doc");
  expect(saved?.savedAt).toBeGreaterThan(0);
  r.saveBookmarkArticle("https://doc.example/", JSON.stringify({ title: "Doc v2" }));
  expect(r.getBookmarkArticle("https://doc.example/")?.article).toContain("v2");
  expect(r.listBookmarks()[0]!.offline).toBe(true);
  // Leaving the list drops the copy; the bookmark itself survives.
  r.setReadingList("https://doc.example/", false);
  expect(r.getBookmarkArticle("https://doc.example/")).toBeNull();
  expect(r.listBookmarks()).toHaveLength(1);
});

it("follows the article across a bookmark URL edit", () => {
  const r = repo();
  r.setReadingList("https://old.example/", true, "Old");
  r.saveBookmarkArticle("https://old.example/", "{}");
  r.updateBookmark({
    originalUrl: "https://old.example/",
    url: "https://new.example/",
    title: "New",
    expected: { title: "Old" },
  });
  expect(r.getBookmarkArticle("https://old.example/")).toBeNull();
  expect(r.getBookmarkArticle("https://new.example/")?.article).toBe("{}");
});
