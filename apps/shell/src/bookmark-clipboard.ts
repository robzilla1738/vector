import { bridge } from "./bridge";
import {
  BookmarkClipboardResultSchema,
  type BookmarkPlacement,
} from "@aux/contracts/bookmark-folder-methods";

export async function bookmarkClipboardAvailable() {
  const response = await bridge.bookmarksInvoke({ method: "bookmarks.clipboard.available", params: {} });
  if (response.method !== "bookmarks.clipboard.available") throw new Error("Unexpected clipboard response.");
  return response.result.available;
}
export async function copyBookmark(source: BookmarkPlacement["source"], cut: boolean) {
  const response = await bridge.bookmarksInvoke({
    method: "bookmarks.clipboard.copy",
    params: { source, cut },
  });
  if (response.method !== "bookmarks.clipboard.copy") throw new Error("Unexpected clipboard response.");
  return BookmarkClipboardResultSchema.parse(response.result);
}
export async function pasteBookmarks(destination: BookmarkPlacement["destination"]) {
  const response = await bridge.bookmarksInvoke({
    method: "bookmarks.clipboard.paste",
    params: { destination },
  });
  if (response.method !== "bookmarks.clipboard.paste") throw new Error("Unexpected clipboard response.");
  return BookmarkClipboardResultSchema.parse(response.result);
}
