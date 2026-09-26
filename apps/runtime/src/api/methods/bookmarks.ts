import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError, MethodSchemas } from "@aux/contracts";

async function h_bookmarks_list(ctx: MethodCtx): Promise<unknown> {
  const { s } = ctx;
  return s.repo.listBookmarks();
}
async function h_bookmarks_folders_list(ctx: MethodCtx): Promise<unknown> {
  const { s } = ctx;
  return s.repo.bookmarkFolders();
}
async function h_bookmarks_folders_create(ctx: MethodCtx): Promise<unknown> {
  const { client, method, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Organize bookmarks in Aux Library.");
  const folders =
    method === "bookmarks.folders.create"
      ? s.repo.createBookmarkFolder(params.path)
      : method === "bookmarks.folders.rename"
        ? s.repo.renameBookmarkFolder(params.path, params.name)
        : s.repo.removeBookmarkFolder(params.path);
  s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
  return folders;
}
async function h_bookmarks_add(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  const p = MethodSchemas["bookmarks.add"].parse(params);
  s.repo.addBookmark(p.url, p.title, p.folderPath, p.readingList);
  s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
  return { ok: true };
}
async function h_bookmarks_readingList(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  const p = MethodSchemas["bookmarks.readingList"].parse(params);
  s.repo.setReadingList(p.url, p.readingList, p.title);
  s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
  return { ok: true };
}
async function h_bookmarks_markRead(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  const p = MethodSchemas["bookmarks.markRead"].parse(params);
  s.repo.markBookmarkRead(p.url, p.read);
  s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
  return { ok: true };
}
async function h_bookmarks_offline_set(ctx: MethodCtx): Promise<unknown> {
  const { host, params, s } = ctx;
  const p = MethodSchemas["bookmarks.offline.set"].parse(params);
  const saved =
    host === "chromium-fork" && s.native?.bookmarksInvoke
      ? ((await s.native.bookmarksInvoke("bookmarks.list", {})) as {
          url: string;
          readingList?: boolean;
        }[])
      : s.repo.listBookmarks();
  if (!saved.some((item) => item.url === p.url && item.readingList))
    throw new AuxError(
      "permission_denied",
      "Save the page to the reading list before keeping an offline copy.",
    );
  s.repo.saveBookmarkArticle(p.url, p.article);
  s.events.emit("bookmarks.changed", {
    bookmarks:
      host === "chromium-fork"
        ? saved.map((item) => ({
            ...item,
            offline: item.readingList && !!s.repo.getBookmarkArticle(item.url),
          }))
        : s.repo.listBookmarks(),
  });
  return { ok: true };
}
async function h_bookmarks_offline_get(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  const p = MethodSchemas["bookmarks.offline.get"].parse(params);
  return s.repo.getBookmarkArticle(p.url) ?? { article: null, savedAt: null };
}
async function h_bookmarks_update(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Edit bookmarks in Aux Library.");
  s.repo.updateBookmark(MethodSchemas["bookmarks.update"].parse(params));
  s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
  return { ok: true };
}
async function h_bookmarks_move(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Organize bookmarks in Aux Library.");
  const result = s.repo.moveBookmarks(MethodSchemas["bookmarks.move"].parse(params));
  s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
  return result;
}
async function h_bookmarks_saveFolder(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Organize bookmarks in Aux Library.");
  const p = MethodSchemas["bookmarks.saveFolder"].parse(params);
  const result = s.repo.saveBookmarkFolder(p.name, p.bookmarks);
  s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
  return result;
}
async function h_bookmarks_import(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  const p = MethodSchemas["bookmarks.import"].parse(params);
  const result = s.repo.importBookmarks(p.bookmarks, p.folders);
  s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
  return result;
}
async function h_bookmarks_remove(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  s.repo.removeBookmark((params as { url: string }).url);
  s.checkpointDeletedData?.();
  s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
  return { ok: true };
}

export const bookmarksMethods: Partial<Record<MethodName, MethodHandler>> = {
  "bookmarks.list": h_bookmarks_list,
  "bookmarks.folders.list": h_bookmarks_folders_list,
  "bookmarks.folders.create": h_bookmarks_folders_create,
  "bookmarks.folders.rename": h_bookmarks_folders_create,
  "bookmarks.folders.remove": h_bookmarks_folders_create,
  "bookmarks.add": h_bookmarks_add,
  "bookmarks.readingList": h_bookmarks_readingList,
  "bookmarks.markRead": h_bookmarks_markRead,
  "bookmarks.offline.set": h_bookmarks_offline_set,
  "bookmarks.offline.get": h_bookmarks_offline_get,
  "bookmarks.update": h_bookmarks_update,
  "bookmarks.move": h_bookmarks_move,
  "bookmarks.saveFolder": h_bookmarks_saveFolder,
  "bookmarks.import": h_bookmarks_import,
  "bookmarks.remove": h_bookmarks_remove,
};
