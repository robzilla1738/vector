import { bookmarkWebUrl } from "../bookmark-files";
import { bridge } from "../bridge";
import { call } from "./shared";
import type { BookmarkKeys, Slice } from "./types";

export const createBookmarksSlice: Slice<BookmarkKeys> = (set, get) => ({
  bookmarks: [],
  bookmarkPending: {},
  toggleBookmark: async (url, title) => {
    if (bridge.privateMode || !bookmarkWebUrl(url) || get().bookmarkPending[url]) return;
    const saved = get().bookmarks.some((item) => item.url === url);
    set((state) => ({ bookmarkPending: { ...state.bookmarkPending, [url]: true } }));
    try {
      await call(saved ? "bookmarks.remove" : "bookmarks.add", { url, title });
      // The runtime event owns the list, including folder placement and changes
      // from other windows. Appending here would duplicate an already applied event.
      get().toast(saved ? "Bookmark removed" : "Bookmarked");
    } finally {
      set((state) => {
        const bookmarkPending = { ...state.bookmarkPending };
        delete bookmarkPending[url];
        return { bookmarkPending };
      });
    }
  },
  toggleReadingList: async (url, title) => {
    if (bridge.privateMode || !bookmarkWebUrl(url) || get().bookmarkPending[url]) return;
    const saved = get().bookmarks.find((item) => item.url === url);
    set((state) => ({ bookmarkPending: { ...state.bookmarkPending, [url]: true } }));
    try {
      await call("bookmarks.readingList", { url, readingList: !saved?.readingList, title });
      // Same contract as toggleBookmark — the runtime event owns list updates.
      get().toast(saved?.readingList ? "Removed from reading list" : "Added to reading list");
    } finally {
      set((state) => {
        const bookmarkPending = { ...state.bookmarkPending };
        delete bookmarkPending[url];
        return { bookmarkPending };
      });
    }
  },
  downloads: [],
  applyDownload: (d) =>
    set((s) => {
      const rest = s.downloads.filter((x) => x.id !== d.id);
      return { downloads: [d, ...rest] };
    }),
});
