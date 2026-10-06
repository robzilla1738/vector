// @vitest-environment jsdom
import { expect, it } from "vitest";
import { parseBookmarkFile, exportBookmarkFile } from "./bookmark-files";
it("parses browser HTML as inert data, preserving titles and rejecting unsafe or duplicate links", async () => {
  const result = await parseBookmarkFile(
    '<DL><p><DT><H3>Folder</H3><DL><DT><A HREF="https://example.test/?q=1&amp;b=2">Café &amp; Research</A><DT><A HREF="javascript:alert(1)">Bad</A><DT><A HREF="https://example.test/?q=1&amp;b=2">Duplicate</A><DT><A HREF="https://user:password@example.test/">Secret</A></DL><script>throw new Error("never run")</script>',
  );
  expect(result).toEqual({
    bookmarks: [{ url: "https://example.test/?q=1&b=2", title: "Café & Research", folderPath: ["Folder"] }],
    folders: [["Folder"]],
    skipped: 3,
  });
  expect(await parseBookmarkFile(exportBookmarkFile(result.bookmarks))).toEqual({
    bookmarks: result.bookmarks,
    folders: result.folders,
    skipped: 0,
  });
});
it("escapes exported markup and reports unsupported/oversized files", async () => {
  const entry = { url: "https://example.test/", title: '<img src=x onerror="alert(1)"> & notes' };
  const html = exportBookmarkFile([entry]);
  expect(html).not.toContain("<img");
  expect((await parseBookmarkFile(html)).bookmarks).toEqual([entry]);
  await expect(parseBookmarkFile('<a href="file:///tmp/private">File</a>')).rejects.toThrow("No supported");
  await expect(parseBookmarkFile("x".repeat(5_000_001))).rejects.toThrow("5 MB");
});

it("round-trips sibling, nested and empty folders without moving links between them", async () => {
  const bookmarks = [
    { url: "https://one.test/", title: "One", folderPath: ["Work", "Reading"] },
    { url: "https://two.test/", title: "Two", folderPath: ["Personal"] },
    { url: "https://root.test/", title: "Root" },
  ];
  const folders = [["Work"], ["Work", "Reading"], ["Work", "Empty"], ["Personal"]];
  const parsed = await parseBookmarkFile(exportBookmarkFile(bookmarks, folders));
  expect(parsed.bookmarks).toEqual(expect.arrayContaining(bookmarks));
  expect(parsed.bookmarks).toHaveLength(3);
  expect(parsed.folders).toEqual(expect.arrayContaining(folders));
  expect(parsed.folders).toHaveLength(4);
});
