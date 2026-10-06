import { afterEach, expect, it } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readChromeBookmarksFile } from "../../apps/runtime/src/services/chrome-bookmarks.js";

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});

function fixture(tree: unknown) {
  const dir = mkdtempSync(join(tmpdir(), "aux-chrome-bookmarks-"));
  dirs.push(dir);
  const path = join(dir, "Bookmarks");
  writeFileSync(path, JSON.stringify(tree));
  return path;
}

const CHROME_TREE = {
  roots: {
    bookmark_bar: {
      type: "folder",
      name: "Bookmarks bar",
      children: [
        { type: "url", name: "Example", url: "https://example.com/" },
        {
          type: "folder",
          name: "Work",
          children: [
            { type: "url", name: "Docs", url: "https://docs.example.com/" },
            { type: "url", name: "Duplicate", url: "https://example.com/" },
          ],
        },
      ],
    },
    other: {
      type: "folder",
      name: "Other bookmarks",
      children: [
        { type: "url", name: "FTP link", url: "ftp://files.example.com/a" },
        { type: "url", name: "Mobile", url: "https://m.example.com/" },
      ],
    },
    synced: { type: "folder", name: "Mobile bookmarks", children: [] },
  },
};

it("walks Chromium roots into titled bookmarks with folder paths and dedupes by URL", () => {
  const bookmarks = readChromeBookmarksFile(fixture(CHROME_TREE));
  expect(bookmarks).toEqual([
    { url: "https://example.com/", title: "Example", folderPath: ["Bookmarks bar"] },
    { url: "https://docs.example.com/", title: "Docs", folderPath: ["Bookmarks bar", "Work"] },
    { url: "https://m.example.com/", title: "Mobile", folderPath: ["Other bookmarks"] },
  ]);
});

it("skips non-HTTP schemes, oversized URLs, malformed entries and empty roots", () => {
  const bookmarks = readChromeBookmarksFile(
    fixture({
      roots: {
        bookmark_bar: {
          type: "folder",
          children: [
            { type: "url", name: "JS", url: "javascript:alert(1)" },
            { type: "url", name: "File", url: "file:///etc/passwd" },
            { type: "url", name: "No URL" },
            { type: "url", name: "Long", url: `https://x.test/${"a".repeat(9000)}` },
            { type: "something", name: "Separator" },
            { name: "Missing type" },
          ],
        },
      },
    }),
  );
  expect(bookmarks).toEqual([]);
});

it("survives a malformed file with a thrown parse error, not silent data", () => {
  const dir = mkdtempSync(join(tmpdir(), "aux-chrome-bookmarks-"));
  dirs.push(dir);
  const path = join(dir, "Bookmarks");
  writeFileSync(path, "{not json");
  expect(() => readChromeBookmarksFile(path)).toThrow();
});

it("labels unnamed folders rather than dropping their children", () => {
  const bookmarks = readChromeBookmarksFile(
    fixture({
      roots: {
        other: {
          type: "folder",
          children: [
            {
              type: "folder",
              name: "",
              children: [{ type: "url", name: "Deep", url: "https://deep.test/" }],
            },
          ],
        },
      },
    }),
  );
  expect(bookmarks).toEqual([
    { url: "https://deep.test/", title: "Deep", folderPath: ["Other bookmarks", "Folder"] },
  ]);
});
