import { z } from "zod";

export const XScopeSchema = z.enum([
  "tweet.read",
  "tweet.write",
  "users.read",
  "follows.read",
  "follows.write",
  "bookmark.read",
  "bookmark.write",
  "dm.read",
  "dm.write",
  "offline.access",
]);
export type XScope = z.infer<typeof XScopeSchema>;
const read = ["tweet.read", "users.read"] as const;
export const X_OPERATIONS = {
  "posts.read": { effect: "read", scopes: read },
  "posts.search": { effect: "read", scopes: read },
  "posts.create": { effect: "send", scopes: [...read, "tweet.write"] },
  "posts.reply": { effect: "send", scopes: [...read, "tweet.write"] },
  "users.read": { effect: "read", scopes: read },
  "bookmarks.list": { effect: "read", scopes: [...read, "bookmark.read"] },
  "bookmarks.add": { effect: "write", scopes: [...read, "bookmark.write"] },
  "bookmarks.remove": { effect: "write", scopes: [...read, "bookmark.write"] },
  "follows.following": { effect: "read", scopes: [...read, "follows.read"] },
  "follows.followers": { effect: "read", scopes: [...read, "follows.read"] },
  "follows.add": { effect: "write", scopes: [...read, "follows.write"] },
  "follows.remove": { effect: "write", scopes: [...read, "follows.write"] },
  "messages.list": { effect: "read", scopes: [...read, "dm.read"] },
  "messages.conversation": { effect: "read", scopes: [...read, "dm.read"] },
  "messages.send": { effect: "send", scopes: [...read, "dm.write"] },
  "messages.reply": { effect: "send", scopes: [...read, "dm.write"] },
} as const satisfies Record<string, { effect: "read" | "write" | "send"; scopes: readonly XScope[] }>;
export const XOperationSchema = z.enum(
  Object.keys(X_OPERATIONS) as [keyof typeof X_OPERATIONS, ...(keyof typeof X_OPERATIONS)[]],
);
export type XOperation = z.infer<typeof XOperationSchema>;
export function xOperationAvailable(scopes: readonly XScope[], operation: XOperation): boolean {
  return X_OPERATIONS[operation].scopes.every((scope) => scopes.includes(scope));
}
export const XAccountSchema = z
  .object({
    connectionId: z.string().uuid(),
    userId: z.string().regex(/^[0-9]{1,19}$/),
    username: z.string().regex(/^[A-Za-z0-9_]{1,15}$/),
    label: z.string().min(1).max(200),
    revision: z.string().regex(/^[a-f0-9]{64}$/),
    scopes: z.array(XScopeSchema),
    state: z.enum(["active", "needs_reauth"]),
    operations: z.array(XOperationSchema),
    createdAt: z.number().int().nonnegative(),
    updatedAt: z.number().int().nonnegative(),
  })
  .strict();
export type XAccount = z.infer<typeof XAccountSchema>;
export const XTaskGrantSchema = z
  .object({
    grantId: z.string().uuid(),
    taskId: z.string().uuid(),
    taskRevision: z.number().int().positive(),
    workspaceId: z.string().min(1),
    connectionId: z.string().uuid(),
    accountRevision: z.string().regex(/^[a-f0-9]{64}$/),
    operations: z
      .array(XOperationSchema)
      .min(1)
      .max(50)
      .refine((value) => new Set(value).size === value.length),
    createdAt: z.number().int().nonnegative(),
  })
  .strict();
export type XTaskGrant = z.infer<typeof XTaskGrantSchema>;
const id = z.string().regex(/^[0-9]{1,19}$/),
  conversationId = z.string().regex(/^[0-9_-]{1,100}$/);
const paging = {
  limit: z.number().int().min(10).max(100).default(25),
  pageToken: z.string().min(1).max(2000).optional(),
};
const postText = z
  .string()
  .min(1)
  .max(25_000)
  .refine((text) => !text.includes("\0"));
const messageText = z
  .string()
  .min(1)
  .max(10_000)
  .refine((text) => !text.includes("\0"));
export const XArguments = {
  "posts.read": z.object({ postIds: z.array(id).min(1).max(100) }).strict(),
  "posts.search": z
    .object({
      query: z.string().min(1).max(512),
      ...paging,
      startTime: z.string().datetime().optional(),
      endTime: z.string().datetime().optional(),
    })
    .strict(),
  "posts.create": z.object({ text: postText }).strict(),
  "posts.reply": z
    .object({ postId: id, expectedSourceSha256: z.string().regex(/^[a-f0-9]{64}$/), text: postText })
    .strict(),
  "users.read": z.object({ userIds: z.array(id).min(1).max(100) }).strict(),
  "bookmarks.list": z.object(paging).strict(),
  "bookmarks.add": z.object({ postId: id }).strict(),
  "bookmarks.remove": z.object({ postId: id }).strict(),
  "follows.following": z.object({ userId: id, ...paging }).strict(),
  "follows.followers": z.object({ userId: id, ...paging }).strict(),
  "follows.add": z.object({ targetUserId: id }).strict(),
  "follows.remove": z.object({ targetUserId: id }).strict(),
  "messages.list": z.object(paging).strict(),
  "messages.conversation": z.object({ conversationId, ...paging }).strict(),
  "messages.send": z.object({ participantId: id, text: messageText }).strict(),
  "messages.reply": z.object({ conversationId, text: messageText }).strict(),
} as const;
const binding = {
  runId: z.string().min(1),
  taskId: z.string().uuid(),
  taskRevision: z.number().int().positive(),
  workspaceId: z.string().min(1),
  grantId: z.string().uuid(),
  connectionId: z.string().uuid(),
  accountRevision: z.string().regex(/^[a-f0-9]{64}$/),
  actionId: z.string().regex(/^[A-Za-z0-9_-]{1,100}$/),
};
const options = XOperationSchema.options.map((operation) =>
  z.object({ ...binding, operation: z.literal(operation), args: XArguments[operation] }).strict(),
);
export const XInvokeParamsSchema = z.discriminatedUnion(
  "operation",
  options as [(typeof options)[number], ...(typeof options)[number][]],
);
export type XInvoke = z.infer<typeof XInvokeParamsSchema>;
const toolOptions = options.map((option) =>
  option.omit({
    runId: true,
    taskId: true,
    taskRevision: true,
    workspaceId: true,
    connectionId: true,
    accountRevision: true,
    actionId: true,
  }),
);
export const XToolInputSchema = z.discriminatedUnion(
  "operation",
  toolOptions as [(typeof toolOptions)[number], ...(typeof toolOptions)[number][]],
);
export type XToolInput = z.infer<typeof XToolInputSchema>;
export const XMethodSchemas = {
  "x.accounts.list": z.object({}).strict(),
  "x.auth.start": z.object({ scopes: z.array(XScopeSchema).min(3).max(20) }).strict(),
  "x.accounts.revoke": z
    .object({ connectionId: z.string().uuid(), expectedRevision: z.string().regex(/^[a-f0-9]{64}$/) })
    .strict(),
  "x.grants.list": z.object({ taskId: z.string().uuid() }).strict(),
  "x.grants.create": XTaskGrantSchema.omit({ grantId: true, createdAt: true }),
  "x.grants.revoke": z.object({ taskId: z.string().uuid(), grantId: z.string().uuid() }).strict(),
} as const;
export const XResultSchemas = {
  "x.accounts.list": z.object({
    available: z.boolean(),
    reason: z.string().optional(),
    connections: z.array(XAccountSchema),
  }),
  "x.auth.start": z.object({ url: z.string().url(), expiresAt: z.number().int().nonnegative() }),
  "x.accounts.revoke": z.object({
    ok: z.literal(true),
    providerRevocation: z.enum(["confirmed", "pending"]),
  }),
  "x.grants.list": z.array(XTaskGrantSchema),
  "x.grants.create": XTaskGrantSchema,
  "x.grants.revoke": z.object({ ok: z.literal(true) }),
} as const;
