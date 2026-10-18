import { z } from "zod";

const Id = z.string().min(1).max(200);
const Tab = z
  .object({
    pageId: Id,
    url: z.string().url().max(8192),
    title: z.string().max(500),
    documentEpoch: z.number().int().nonnegative(),
    sessionId: Id,
    access: z.enum(["read", "act"]),
  })
  .strict();
export const MentionRefSchema = z.discriminatedUnion("kind", [
  Tab.extend({ kind: z.literal("tab") }),
  z.object({ kind: z.literal("tabs") }).strict(),
  z.object({ kind: z.literal("group"), groupId: Id, members: z.array(Tab).min(1) }).strict(),
  z
    .object({
      kind: z.literal("space"),
      spaceId: Id,
      workspaceId: Id,
      revision: z.number().int().nonnegative(),
    })
    .strict(),
  z.object({ kind: z.literal("skill"), routineId: Id, revision: z.number().int().positive() }).strict(),
  z
    .object({
      kind: z.literal("connector"),
      connectorId: Id,
      // Historical refs remain readable but cannot authorize a replacement account.
      authorityDigest: z
        .string()
        .regex(/^[a-f0-9]{64}$/)
        .optional(),
    })
    .strict(),
]);
export const MentionRefsSchema = z.array(MentionRefSchema);
export type MentionRef = z.infer<typeof MentionRefSchema>;
