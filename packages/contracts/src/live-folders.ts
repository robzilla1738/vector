import { z } from "zod";

const Id = z.string().min(1).max(200);
const HttpUrl = z.string().url().max(8192).refine(url => /^https?:\/\//.test(url));
const Sources = [
  z.object({ kind: z.literal("github"), config: z.object({ connectionId: Id,
    source: z.enum(["awaiting-review", "open-prs", "assigned-issues", "query"]), query: z.string().min(1).max(1000).optional() }).strict() }).strict(),
  z.object({ kind: z.literal("calendar"), config: z.object({ connectionId: Id }).strict() }).strict(),
  z.object({ kind: z.literal("rss"), config: z.object({ url: HttpUrl }).strict() }).strict(),
  z.object({ kind: z.literal("routine"), config: z.object({ routineId: Id }).strict() }).strict(),
] as const;
const hasQuery = (source: z.infer<(typeof Sources)[number]>) => source.kind !== "github" || source.config.source !== "query" || !!source.config.query;
export const LiveFolderSourceSchema = z.discriminatedUnion("kind", Sources).refine(hasQuery, "A custom GitHub source requires a query.");
export const LiveFolderSchema = z.discriminatedUnion("kind", [
  Sources[0].extend({ refreshMinutes: z.number().int().min(1).max(1440) }),
  Sources[1].extend({ refreshMinutes: z.number().int().min(1).max(1440) }),
  Sources[2].extend({ refreshMinutes: z.number().int().min(1).max(1440) }),
  Sources[3].extend({ refreshMinutes: z.number().int().min(1).max(1440) }),
]).refine(hasQuery, "A custom GitHub source requires a query.");
export type LiveFolder = z.infer<typeof LiveFolderSchema>;
export const LiveFolderItemSchema = z.object({ id: Id, url: HttpUrl, title: z.string().min(1).max(500),
  subtitle: z.string().max(500).optional(), unread: z.boolean(), updatedAt: z.number().int().nonnegative() }).strict();
export const LiveFolderItemsSchema = z.object({ folderId: Id, items: z.array(LiveFolderItemSchema).max(25),
  refreshedAt: z.number().int().nonnegative().optional(), error: z.string().max(1000).optional() }).strict();
export type LiveFolderItem = z.infer<typeof LiveFolderItemSchema>;
