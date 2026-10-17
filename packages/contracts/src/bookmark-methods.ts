import { z } from "zod";
import {
  BookmarkClipboardCopySchema,
  BookmarkClipboardPasteSchema,
  BookmarkClipboardResultSchema,
  BookmarkEntryRemoveSchema,
  BookmarkEntryRemoveResultSchema,
  BookmarkEntryRestoreSchema,
  BookmarkEntryEditSchema,
  BookmarkEntryEditResultSchema,
  BookmarkEntryCreateSchema,
  BookmarkOpenSchema,
  BookmarkOpenResultSchema,
  BookmarkFolderChangeSchema,
  BookmarkFolderChangeResultSchema,
  BookmarkFolderSnapshotSchema,
  BookmarkPlacementSchema,
  BookmarkPlacementResultSchema,
} from "./bookmark-folder-methods.js";
import { BookmarkFolderPathSchema, BookmarkSchema } from "./entities.js";

const WebBookmarkSchema = z.object({
  url: z
    .string()
    .url()
    .max(8192)
    .refine((value) => {
      try {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
      } catch {
        return false;
      }
    }, "Use a web address without credentials."),
  title: z.string().max(1000),
  folderPath: BookmarkFolderPathSchema.optional(),
});
const BookmarkNodeIdSchema = z.string().regex(/^[1-9]\d{0,18}$/);
export const BookmarkAddParams = z.object({
  url: z.string().url(),
  title: z.string(),
  folderPath: BookmarkFolderPathSchema.optional(),
  readingList: z.boolean().optional(),
  forceNew: z.boolean().optional(),
});
/** Toggle the reading-list flag on a bookmark; creates the bookmark when absent (title then required). */
export const BookmarkReadingListParams = z.object({
  url: z.string().url().max(8192),
  nodeId: BookmarkNodeIdSchema.optional(),
  readingList: z.boolean(),
  title: z.string().max(1000).optional(),
});
export const BookmarkMarkReadParams = z.object({
  url: z.string().url().max(8192),
  nodeId: BookmarkNodeIdSchema.optional(),
  read: z.boolean(),
});
/** Serialized reader-extract article; stored opaque and capped so list copies stay small. */
export const BookmarkOfflineSetParams = z.object({
  url: z.string().url().max(8192),
  article: z
    .string()
    .min(2)
    .max(512 * 1024),
});
export const BookmarkOfflineGetParams = z.object({ url: z.string().url().max(8192) });
export const BookmarkUpdateParams = BookmarkAddParams.extend({
  nodeId: BookmarkNodeIdSchema.optional(),
  originalUrl: z.string().url(),
  url: z
    .string()
    .max(8192)
    .url()
    .refine((value) => {
      try {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
      } catch {
        return false;
      }
    }, "Use a web address without credentials."),
  title: z.string().trim().min(1).max(1000),
  expected: z.object({ title: z.string(), folderPath: BookmarkFolderPathSchema.optional() }),
});
export const BookmarkRemoveParams = z.object({
  url: z.string().url(),
  nodeId: BookmarkNodeIdSchema.optional(),
  expected: z
    .object({
      title: z.string(),
      createdAt: z.number(),
      folderPath: BookmarkFolderPathSchema.optional(),
      readingList: z.boolean().optional(),
    })
    .optional(),
});

export const BookmarkMethodSchemas = {
  "bookmarks.list": z.object({}),
  "bookmarks.folders.list": z.object({}),
  "bookmarks.folders.create": z.object({ path: BookmarkFolderPathSchema.min(1) }),
  "bookmarks.folders.rename": z.object({
    path: BookmarkFolderPathSchema.min(1),
    name: z.string().trim().min(1).max(200),
  }),
  "bookmarks.folders.remove": z.object({ path: BookmarkFolderPathSchema.min(1) }),
  "bookmarks.add": BookmarkAddParams,
  "bookmarks.readingList": BookmarkReadingListParams,
  "bookmarks.markRead": BookmarkMarkReadParams,
  "bookmarks.offline.set": BookmarkOfflineSetParams,
  "bookmarks.offline.get": BookmarkOfflineGetParams,
  "bookmarks.update": BookmarkUpdateParams,
  "bookmarks.move": z.object({
    bookmarks: z
      .array(
        z.object({
          url: z.string().min(1).max(8192),
          nodeId: BookmarkNodeIdSchema.optional(),
          folderPath: BookmarkFolderPathSchema,
        }),
      )
      .min(1)
      .max(10000),
    folderPath: BookmarkFolderPathSchema,
    createFolder: z.boolean().optional(),
  }),
  "bookmarks.import": z.object({
    bookmarks: z.array(WebBookmarkSchema).max(10000),
    folders: z.array(BookmarkFolderPathSchema.min(1)).max(10000).optional(),
  }),
  "bookmarks.saveFolder": z.object({
    name: z.string().trim().min(1).max(200),
    bookmarks: z
      .array(WebBookmarkSchema.omit({ folderPath: true }))
      .min(1)
      .max(10000),
  }),
  "bookmarks.remove": BookmarkRemoveParams,
} as const;

export const BookmarkResultSchemas = {
  "bookmarks.list": z.array(BookmarkSchema),
  "bookmarks.folders.list": z.array(z.array(z.string())),
  "bookmarks.folders.create": z.array(z.array(z.string())),
  "bookmarks.folders.rename": z.array(z.array(z.string())),
  "bookmarks.folders.remove": z.array(z.array(z.string())),
  "bookmarks.add": z.object({ ok: z.boolean() }),
  "bookmarks.update": z.object({ ok: z.boolean() }),
  "bookmarks.move": z.object({ moved: z.number().int().nonnegative() }),
  "bookmarks.import": z.object({ added: z.number().int(), skipped: z.number().int() }),
  "bookmarks.saveFolder": z.object({ added: z.number().int(), skipped: z.number().int() }),
  "bookmarks.remove": z.object({ ok: z.boolean() }),
  "bookmarks.readingList": z.object({ ok: z.boolean() }),
  "bookmarks.markRead": z.object({ ok: z.boolean() }),
  "bookmarks.offline.set": z.object({ ok: z.boolean() }),
  "bookmarks.offline.get": z.object({ article: z.string().nullable(), savedAt: z.number().nullable() }),
} as const;

export type NativeBookmarkMethod = Exclude<
  keyof typeof BookmarkMethodSchemas,
  "bookmarks.offline.set" | "bookmarks.offline.get"
>;

export function isNativeBookmarkMethod(method: string): method is NativeBookmarkMethod {
  return (
    Object.hasOwn(BookmarkMethodSchemas, method) &&
    method !== "bookmarks.offline.set" &&
    method !== "bookmarks.offline.get"
  );
}

const NativeFolderResultSchemas = {
  "bookmarks.clipboard.available": z.object({ available: z.boolean() }).strict(),
  "bookmarks.clipboard.copy": BookmarkClipboardResultSchema,
  "bookmarks.clipboard.paste": BookmarkClipboardResultSchema,
  "bookmarks.entries.remove": BookmarkEntryRemoveResultSchema,
  "bookmarks.entries.restore": BookmarkFolderSnapshotSchema,
  "bookmarks.entries.edit": BookmarkEntryEditResultSchema,
  "bookmarks.entries.create": BookmarkFolderSnapshotSchema,
  "bookmarks.open": BookmarkOpenResultSchema,
  "bookmarks.folders.snapshot": BookmarkFolderSnapshotSchema,
  "bookmarks.folders.change": BookmarkFolderChangeResultSchema,
  "bookmarks.folders.placeBookmark": BookmarkPlacementResultSchema,
};
const NativeResultSchemas = { ...BookmarkResultSchemas, ...NativeFolderResultSchemas };

export const NativeBookmarkRequestSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal("bookmarks.clipboard.available"), params: z.object({}).strict() }).strict(),
  z.object({ method: z.literal("bookmarks.clipboard.copy"), params: BookmarkClipboardCopySchema }).strict(),
  z.object({ method: z.literal("bookmarks.clipboard.paste"), params: BookmarkClipboardPasteSchema }).strict(),
  z.object({ method: z.literal("bookmarks.entries.create"), params: BookmarkEntryCreateSchema }).strict(),
  z.object({ method: z.literal("bookmarks.entries.remove"), params: BookmarkEntryRemoveSchema }).strict(),
  z.object({ method: z.literal("bookmarks.entries.restore"), params: BookmarkEntryRestoreSchema }).strict(),
  z.object({ method: z.literal("bookmarks.entries.edit"), params: BookmarkEntryEditSchema }).strict(),
  z.object({ method: z.literal("bookmarks.open"), params: BookmarkOpenSchema }).strict(),
  z
    .object({ method: z.literal("bookmarks.folders.placeBookmark"), params: BookmarkPlacementSchema })
    .strict(),
  z.object({ method: z.literal("bookmarks.folders.snapshot"), params: z.object({}).strict() }).strict(),
  z.object({ method: z.literal("bookmarks.folders.change"), params: BookmarkFolderChangeSchema }).strict(),
  z
    .object({
      method: z.literal("bookmarks.list"),
      params: BookmarkMethodSchemas["bookmarks.list"].strict(),
    })
    .strict(),
  z
    .object({
      method: z.literal("bookmarks.folders.list"),
      params: BookmarkMethodSchemas["bookmarks.folders.list"].strict(),
    })
    .strict(),
  z
    .object({
      method: z.literal("bookmarks.folders.create"),
      params: BookmarkMethodSchemas["bookmarks.folders.create"].strict(),
    })
    .strict(),
  z
    .object({
      method: z.literal("bookmarks.folders.rename"),
      params: BookmarkMethodSchemas["bookmarks.folders.rename"].strict(),
    })
    .strict(),
  z
    .object({
      method: z.literal("bookmarks.folders.remove"),
      params: BookmarkMethodSchemas["bookmarks.folders.remove"].strict(),
    })
    .strict(),
  z
    .object({
      method: z.literal("bookmarks.add"),
      params: BookmarkMethodSchemas["bookmarks.add"].strict(),
    })
    .strict(),
  z
    .object({
      method: z.literal("bookmarks.readingList"),
      params: BookmarkMethodSchemas["bookmarks.readingList"].strict(),
    })
    .strict(),
  z
    .object({
      method: z.literal("bookmarks.markRead"),
      params: BookmarkMethodSchemas["bookmarks.markRead"].strict(),
    })
    .strict(),
  z
    .object({
      method: z.literal("bookmarks.update"),
      params: BookmarkMethodSchemas["bookmarks.update"].strict(),
    })
    .strict(),
  z
    .object({
      method: z.literal("bookmarks.move"),
      params: BookmarkMethodSchemas["bookmarks.move"].strict(),
    })
    .strict(),
  z
    .object({
      method: z.literal("bookmarks.import"),
      params: BookmarkMethodSchemas["bookmarks.import"].strict(),
    })
    .strict(),
  z
    .object({
      method: z.literal("bookmarks.saveFolder"),
      params: BookmarkMethodSchemas["bookmarks.saveFolder"].strict(),
    })
    .strict(),
  z
    .object({
      method: z.literal("bookmarks.remove"),
      params: BookmarkMethodSchemas["bookmarks.remove"].strict(),
    })
    .strict(),
]);

/** A method tag makes transport validation and output normalization unambiguous. */
function bookmarkResponse<M extends keyof typeof NativeResultSchemas>(method: M) {
  return z.object({ method: z.literal(method), result: NativeResultSchemas[method] }).strict();
}
export const NativeBookmarkResultSchema = z.discriminatedUnion("method", [
  bookmarkResponse("bookmarks.clipboard.available"),
  bookmarkResponse("bookmarks.clipboard.copy"),
  bookmarkResponse("bookmarks.clipboard.paste"),
  bookmarkResponse("bookmarks.entries.remove"),
  bookmarkResponse("bookmarks.entries.restore"),
  bookmarkResponse("bookmarks.entries.edit"),
  bookmarkResponse("bookmarks.entries.create"),
  bookmarkResponse("bookmarks.open"),
  bookmarkResponse("bookmarks.folders.snapshot"),
  bookmarkResponse("bookmarks.folders.change"),
  bookmarkResponse("bookmarks.folders.placeBookmark"),
  bookmarkResponse("bookmarks.list"),
  bookmarkResponse("bookmarks.folders.list"),
  bookmarkResponse("bookmarks.folders.create"),
  bookmarkResponse("bookmarks.folders.rename"),
  bookmarkResponse("bookmarks.folders.remove"),
  bookmarkResponse("bookmarks.add"),
  bookmarkResponse("bookmarks.readingList"),
  bookmarkResponse("bookmarks.markRead"),
  bookmarkResponse("bookmarks.update"),
  bookmarkResponse("bookmarks.move"),
  bookmarkResponse("bookmarks.import"),
  bookmarkResponse("bookmarks.saveFolder"),
  bookmarkResponse("bookmarks.remove"),
]);
