import type { Bookmark } from "@aux/contracts/entities";
import type { ChromiumHostPort } from "./chromium-bridge";

const validation = () =>
  Promise.all([import("@aux/contracts/entities"), import("@aux/contracts/bookmark-methods")]);
let generation = 0;
let authorityGeneration: number | undefined;

export function hasNativeBookmarkAuthority() {
  return authorityGeneration === generation;
}

/** The native port binds every read and event to this window's Profile. */
export function startNativeBookmarkObserver(
  port: ChromiumHostPort,
  apply: (bookmarks: Bookmark[]) => void,
  onError: (error: unknown) => void,
) {
  if (port.privateMode) return () => {};
  const { windowId, profileId } = port;
  const schemas = validation();
  const owner = ++generation;
  authorityGeneration = undefined;
  let live = true;
  let revision = 0;
  const current = () =>
    live && owner === generation && port.windowId === windowId && port.profileId === profileId;
  const commit = (items: Bookmark[]) => {
    authorityGeneration = owner;
    apply(items);
  };
  const stop = port.subscribe("onBookmarksChanged", (payload) => {
    if (!current()) return;
    ++revision;
    void schemas
      .then(([{ BookmarkSchema }]) => {
        if (!current()) return;
        const parsed = BookmarkSchema.array().safeParse(payload);
        if (parsed.success) commit(parsed.data);
        else onError(parsed.error);
      })
      .catch((error) => {
        if (current()) onError(error);
      });
  });
  const requested = revision;
  void port
    .request("bookmarksInvoke", [{ method: "bookmarks.list", params: {} }])
    .then(async (payload) => {
      const [, { NativeBookmarkResultSchema, BookmarkResultSchemas }] = await schemas;
      if (current() && requested === revision) {
        const response = NativeBookmarkResultSchema.parse(payload);
        if (response.method !== "bookmarks.list")
          throw new Error("Native bookmark snapshot does not match its request.");
        commit(BookmarkResultSchemas["bookmarks.list"].parse(response.result));
      }
    })
    .catch((error) => {
      if (current() && requested === revision) onError(error);
    });
  return () => {
    live = false;
    ++revision;
    if (owner === generation) authorityGeneration = undefined;
    stop();
  };
}
