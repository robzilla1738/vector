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
});
it("escapes exported markup and reports unsupported/oversized files", async () => {
  const entry = { url: "https://example.test/", title: '<img src=x onerror="alert(1)"> & notes' };
  const html = exportBookmarkFile([{ ...entry, nodeId: "10" }], {
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
        childIds: ["10"],
      },
    ],
  });
  expect(html).not.toContain("<img");
  expect((await parseBookmarkFile(html)).bookmarks).toEqual([entry]);
  await expect(parseBookmarkFile('<a href="file:///tmp/private">File</a>')).rejects.toThrow("No supported");
  await expect(parseBookmarkFile("x".repeat(5_000_001))).rejects.toThrow("5 MB");
});

it("exports duplicate and empty folders, native child order and saved browser schemes without executing them", async () => {
  const bookmarks = [
    { nodeId: "10", url: "chrome://settings/", title: "Settings" },
    { nodeId: "11", url: "javascript:alert('saved')", title: "Saved script" },
    { nodeId: "12", url: "file:///tmp/readme.html", title: "Local" },
  ];
  const html = exportBookmarkFile(bookmarks, {
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
        childIds: ["20", "12", "21", "22"],
      },
      {
        nodeId: "20",
        parentId: "1",
        index: 0,
        title: "Work",
        path: ["Work"],
        permanent: false,
        childIds: ["10"],
      },
      {
        nodeId: "21",
        parentId: "1",
        index: 2,
        title: "Work",
        path: ["Work"],
        permanent: false,
        childIds: ["11"],
      },
      {
        nodeId: "22",
        parentId: "1",
        index: 3,
        title: "Empty",
        path: ["Empty"],
        permanent: false,
        childIds: [],
      },
    ],
  });
  const inert = document.createElement("template");
  inert.innerHTML = html;
  expect([...inert.content.querySelectorAll("h3")].map((node) => node.textContent)).toEqual([
    "Work",
    "Work",
    "Empty",
  ]);
  expect([...inert.content.querySelectorAll("a")].map((node) => node.getAttribute("href"))).toEqual([
    bookmarks[0]!.url,
    bookmarks[2]!.url,
    bookmarks[1]!.url,
  ]);
});
