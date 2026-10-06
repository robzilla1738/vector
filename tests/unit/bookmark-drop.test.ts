import { describe, expect, it } from "vitest";
import { bookmarkTabsFromDrop } from "../../apps/shell/src/bookmark-drop";

describe("bookmark drop", () => {
  const pages = [
    { pageId: "a", url: "https://github.com/x", title: "GitHub" },
    { pageId: "b", url: "https://github.com/x", title: "Duplicate" },
    { pageId: "c", url: "about:blank", title: "New Tab" },
  ];

  it("bookmarks each dragged web tab once", () => {
    expect(bookmarkTabsFromDrop("a\nb\nc", pages)).toEqual([
      { url: "https://github.com/x", title: "GitHub" },
    ]);
  });
});
