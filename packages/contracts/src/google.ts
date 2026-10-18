import { z } from "zod";

export const GoogleScopeSchema = z.enum([
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/documents.readonly",
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/spreadsheets.readonly",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/contacts.readonly",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/youtube.readonly",
]);
export type GoogleScope = z.infer<typeof GoogleScopeSchema>;
const scope = (suffix: string) => `https://www.googleapis.com/auth/${suffix}`;
/** Scope eligibility is separate from a task's explicit operation grant. */
export const GOOGLE_OPERATIONS = {
  "gmail.search": { effect: "read", scopes: [scope("gmail.readonly")] },
  "gmail.message": { effect: "read", scopes: [scope("gmail.readonly")] },
  "gmail.thread": { effect: "read", scopes: [scope("gmail.readonly")] },
  "gmail.attachment": { effect: "read", scopes: [scope("gmail.readonly")] },
  "gmail.draft.create": { effect: "write", scopes: [scope("gmail.compose")] },
  "gmail.draft.update": { effect: "write", scopes: [scope("gmail.compose")] },
  "gmail.draft.read": { effect: "read", scopes: [scope("gmail.compose")] },
  "gmail.draft.send": { effect: "send", scopes: [scope("gmail.compose")] },
  "gmail.reply": { effect: "send", scopes: [scope("gmail.send"), scope("gmail.compose")] },
  "gmail.replyAll": { effect: "send", scopes: [scope("gmail.send"), scope("gmail.compose")] },
  "gmail.send": { effect: "send", scopes: [scope("gmail.send"), scope("gmail.compose")] },
  "docs.read": { effect: "read", scopes: [scope("documents.readonly"), scope("documents")] },
  "docs.edit": { effect: "write", scopes: [scope("documents")] },
  "docs.comment": { effect: "write", scopes: [scope("drive.file")] },
  "sheets.discover": { effect: "read", scopes: [scope("spreadsheets.readonly"), scope("spreadsheets")] },
  "sheets.grid.read": { effect: "read", scopes: [scope("spreadsheets.readonly"), scope("spreadsheets")] },
  "sheets.read": { effect: "read", scopes: [scope("spreadsheets.readonly"), scope("spreadsheets")] },
  "sheets.write": { effect: "write", scopes: [scope("spreadsheets")] },
  "sheets.format": { effect: "write", scopes: [scope("spreadsheets")] },
  "sheets.notes": { effect: "write", scopes: [scope("spreadsheets")] },
  "people.search": { effect: "read", scopes: [scope("contacts.readonly")] },
  "people.batch": { effect: "read", scopes: [scope("contacts.readonly")] },
  "youtube.search": { effect: "read", scopes: [scope("youtube.readonly")] },
  "youtube.videos": { effect: "read", scopes: [scope("youtube.readonly")] },
  "youtube.comments": { effect: "read", scopes: [scope("youtube.readonly")] },
  "youtube.replies": { effect: "read", scopes: [scope("youtube.readonly")] },
} as const;
/** Reply preparation must read the exact original message as well as authorize sending. */
export function googleOperationAvailable(
  scopes: readonly string[],
  operation: keyof typeof GOOGLE_OPERATIONS,
): boolean {
  return (
    GOOGLE_OPERATIONS[operation].scopes.some((value) => scopes.includes(value)) &&
    (!(operation === "gmail.reply" || operation === "gmail.replyAll") ||
      scopes.includes(scope("gmail.readonly")))
  );
}
export const GoogleOperationSchema = z.enum(
  Object.keys(GOOGLE_OPERATIONS) as [keyof typeof GOOGLE_OPERATIONS, ...(keyof typeof GOOGLE_OPERATIONS)[]],
);
export type GoogleOperation = z.infer<typeof GoogleOperationSchema>;
export const GoogleAccountSchema = z
  .object({
    connectionId: z.string().uuid(),
    accountKey: z.string().min(1).max(320),
    label: z.string().max(320),
    revision: z.string().regex(/^[a-f0-9]{64}$/),
    scopes: z.array(GoogleScopeSchema),
    state: z.enum(["active", "needs_reauth"]),
    operations: z.array(GoogleOperationSchema),
    createdAt: z.number().int().nonnegative(),
    updatedAt: z.number().int().nonnegative(),
  })
  .strict();
export type GoogleAccount = z.infer<typeof GoogleAccountSchema>;
export const GoogleTaskGrantSchema = z
  .object({
    grantId: z.string().uuid(),
    taskId: z.string().uuid(),
    taskRevision: z.number().int().positive(),
    workspaceId: z.string().uuid(),
    connectionId: z.string().uuid(),
    accountRevision: z.string().regex(/^[a-f0-9]{64}$/),
    operations: z.array(GoogleOperationSchema).min(1).max(50),
    createdAt: z.number().int().nonnegative(),
  })
  .strict();
export type GoogleTaskGrant = z.infer<typeof GoogleTaskGrantSchema>;

const id = z.string().regex(/^[A-Za-z0-9_-]{1,300}$/);
const token = z.string().min(1).max(2048);
const documentLink = z
  .string()
  .min(1)
  .max(2048)
  .refine((value) => {
    if (!/^https?:\/\//i.test(value) || /[\s\\\p{Cc}]/u.test(value)) return false;
    try {
      const url = new URL(value);
      return !!url.hostname && !url.username && !url.password;
    } catch {
      return false;
    }
  }, "Use an HTTP(S) URL without credentials or whitespace.");
const email = z
  .string()
  .email()
  .max(320)
  .refine((value) => !/[\r\n]/.test(value));
const header = z
  .string()
  .max(500)
  .refine((value) => !/[\r\n]/.test(value));
export const GoogleMailMessageSchema = z
  .object({
    to: z.array(email).min(1).max(50),
    cc: z.array(email).max(50).default([]),
    bcc: z.array(email).max(50).default([]),
    subject: header,
    text: z.string().max(100_000),
  })
  .strict();
export const GoogleDraftUpdateSchema = z
  .object({
    draftId: id,
    expectedMessageSha256: z.string().regex(/^[a-f0-9]{64}$/),
    message: GoogleMailMessageSchema,
  })
  .strict();
const cell = z.union([z.string().max(10_000), z.number().finite(), z.boolean()]);
const range = z
  .string()
  .max(300)
  .regex(
    /^(?:'(?:[^'\r\n]|'')+'|[A-Za-z_][A-Za-z0-9_ ]*)!\$?[A-Z]{1,3}\$?[1-9][0-9]{0,6}(?::\$?[A-Z]{1,3}\$?[1-9][0-9]{0,6})?$/,
  );
const reply = z
  .object({
    messageId: id,
    expectedSourceSha256: z.string().regex(/^[a-f0-9]{64}$/),
    text: z.string().min(1).max(100_000),
  })
  .strict();
export const GoogleArguments = {
  "gmail.reply": reply,
  "gmail.replyAll": reply,
  "gmail.search": z
    .object({
      query: z.string().max(1000).default("in:inbox"),
      limit: z.number().int().min(1).max(100).default(25),
      pageToken: token.optional(),
    })
    .strict(),
  "gmail.message": z.object({ messageId: id }).strict(),
  "gmail.thread": z.object({ threadId: id }).strict(),
  "gmail.attachment": z.object({ messageId: id, attachmentId: id }).strict(),
  "gmail.draft.create": GoogleMailMessageSchema,
  "gmail.draft.update": GoogleDraftUpdateSchema,
  "gmail.draft.read": z.object({ draftId: id }).strict(),
  "gmail.draft.send": z
    .object({ draftId: id, expectedMessageSha256: z.string().regex(/^[a-f0-9]{64}$/) })
    .strict(),
  "gmail.send": GoogleMailMessageSchema,
  "docs.read": z
    .object({
      documentId: id,
      bodyRange: z
        .object({
          revisionId: token,
          tabId: id,
          startIndex: z.number().int().min(1).max(200_000),
          endIndex: z.number().int().min(2).max(200_000),
        })
        .strict()
        .refine((value) => value.endIndex > value.startIndex && value.endIndex - value.startIndex <= 20_000)
        .describe(
          "Explicit revision-bound API body range in UTF-16 indices and an actual document tab; this is not the current editor cursor or selection.",
        )
        .optional(),
    })
    .strict(),
  "docs.edit": z
    .object({
      documentId: id,
      requiredRevisionId: token,
      edits: z
        .array(
          z.discriminatedUnion("kind", [
            z
              .object({
                kind: z.literal("insert"),
                index: z.number().int().min(1),
                text: z.string().min(1).max(20_000),
                tabId: id.optional(),
                bold: z.boolean().optional(),
                italic: z.boolean().optional(),
                underline: z.boolean().optional(),
                link: documentLink.nullable().optional(),
              })
              .strict(),
            z
              .object({
                kind: z.literal("paragraph"),
                startIndex: z.number().int().min(1).max(200_000),
                endIndex: z.number().int().min(2).max(200_000),
                tabId: id.optional(),
                namedStyleType: z
                  .enum([
                    "NORMAL_TEXT",
                    "TITLE",
                    "SUBTITLE",
                    "HEADING_1",
                    "HEADING_2",
                    "HEADING_3",
                    "HEADING_4",
                    "HEADING_5",
                    "HEADING_6",
                  ])
                  .optional(),
                alignment: z.enum(["START", "CENTER", "END", "JUSTIFIED"]).optional(),
              })
              .strict()
              .refine(
                (item) =>
                  item.endIndex > item.startIndex &&
                  (item.namedStyleType !== undefined || item.alignment !== undefined),
              ),
            z
              .object({
                kind: z.literal("list"),
                startIndex: z.number().int().min(1).max(200_000),
                endIndex: z.number().int().min(2).max(200_000),
                tabId: id.optional(),
                preset: z.enum(["BULLET_DISC_CIRCLE_SQUARE", "NUMBERED_DECIMAL_ALPHA_ROMAN"]),
              })
              .strict()
              .refine((item) => item.endIndex > item.startIndex),
            z
              .object({
                kind: z.literal("table"),
                index: z.number().int().min(1).max(200_000),
                tabId: id,
                rows: z.number().int().min(1).max(20),
                columns: z.number().int().min(1).max(10),
              })
              .strict()
              .refine((item) => item.rows * item.columns <= 100),
            z
              .object({
                kind: z.literal("delete"),
                startIndex: z.number().int().min(1),
                endIndex: z.number().int().min(2),
                tabId: id.optional(),
              })
              .strict()
              .refine((item) => item.endIndex > item.startIndex),
          ]),
        )
        .min(1)
        .max(50),
    })
    .strict(),
  "docs.comment": z
    .object({
      documentId: id,
      content: z.string().min(1).max(20_000),
      quotedText: z.string().max(20_000).optional(),
    })
    .strict(),
  "sheets.discover": z.object({ spreadsheetId: id }).strict(),
  "sheets.grid.read": z.object({ spreadsheetId: id, range }).strict(),
  "sheets.read": z.object({ spreadsheetId: id, range, formulas: z.boolean().default(false) }).strict(),
  "sheets.write": z
    .object({
      spreadsheetId: id,
      range,
      values: z.array(z.array(cell).min(1).max(100)).min(1).max(100),
      expectedValuesSha256: z.string().regex(/^[a-f0-9]{64}$/),
      valueInputOption: z.enum(["RAW", "USER_ENTERED"]).default("RAW"),
    })
    .strict(),
  "sheets.format": z
    .object({
      spreadsheetId: id,
      sheetId: z.number().int().nonnegative(),
      startRowIndex: z.number().int().nonnegative(),
      endRowIndex: z.number().int().positive(),
      startColumnIndex: z.number().int().nonnegative(),
      endColumnIndex: z.number().int().positive(),
      bold: z.boolean().optional(),
      italic: z.boolean().optional(),
      numberFormat: z
        .object({
          type: z.enum(["TEXT", "NUMBER", "PERCENT", "CURRENCY", "DATE", "TIME", "DATE_TIME", "SCIENTIFIC"]),
          pattern: z.string().max(100),
        })
        .strict()
        .optional(),
    })
    .strict(),
  "sheets.notes": z
    .object({
      spreadsheetId: id,
      sheetId: z.number().int().nonnegative(),
      rowIndex: z.number().int().nonnegative(),
      columnIndex: z.number().int().nonnegative(),
      note: z.string().max(20_000),
    })
    .strict(),
  "people.search": z
    .object({ query: z.string().min(1).max(200), limit: z.number().int().min(1).max(30).default(20) })
    .strict(),
  "people.batch": z
    .object({
      resourceNames: z
        .array(z.string().regex(/^people\/[A-Za-z0-9_-]{1,200}$/))
        .min(1)
        .max(50),
    })
    .strict(),
  "youtube.search": z
    .object({
      query: z.string().min(1).max(500),
      limit: z.number().int().min(1).max(50).default(25),
      pageToken: token.optional(),
      channelId: z
        .string()
        .regex(/^UC[A-Za-z0-9_-]{22}$/)
        .optional(),
      publishedAfter: z.string().datetime({ offset: true }).optional(),
      publishedBefore: z.string().datetime({ offset: true }).optional(),
      relevanceLanguage: z
        .string()
        .regex(/^(?:[a-z]{2}|zh-Hans|zh-Hant)$/)
        .optional(),
      regionCode: z
        .string()
        .regex(/^[A-Z]{2}$/)
        .optional(),
      order: z.enum(["relevance", "date", "rating", "title", "viewCount"]).default("relevance"),
      safeSearch: z.enum(["moderate", "none", "strict"]).default("moderate"),
    })
    .strict()
    .refine(
      (value) =>
        !value.publishedAfter ||
        !value.publishedBefore ||
        Date.parse(value.publishedAfter) <= Date.parse(value.publishedBefore),
      { message: "Choose an ordered publication date range." },
    ),
  "youtube.videos": z
    .object({
      videoIds: z
        .array(z.string().regex(/^[A-Za-z0-9_-]{11}$/))
        .min(1)
        .max(50),
      language: z
        .string()
        .regex(/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/)
        .max(64)
        .optional(),
    })
    .strict(),
  "youtube.comments": z
    .object({
      videoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/),
      limit: z.number().int().min(1).max(100).default(25),
      pageToken: token.optional(),
      order: z.enum(["time", "relevance"]).default("time"),
    })
    .strict(),
  "youtube.replies": z
    .object({
      parentId: z.string().regex(/^[A-Za-z0-9_.-]{1,300}$/),
      limit: z.number().int().min(1).max(100).default(25),
      pageToken: token.optional(),
    })
    .strict(),
} as const;

const GoogleInvocationBase = z
  .object({
    runId: z.string().min(1),
    taskId: z.string().uuid(),
    taskRevision: z.number().int().positive(),
    workspaceId: z.string().uuid(),
    grantId: z.string().uuid(),
    connectionId: z.string().uuid(),
    accountRevision: z.string().regex(/^[a-f0-9]{64}$/),
    actionId: z.string().uuid(),
  })
  .strict();
export const GoogleInvokeParamsSchema = z.discriminatedUnion("operation", [
  GoogleInvocationBase.extend({ operation: z.literal("gmail.reply"), args: GoogleArguments["gmail.reply"] }),
  GoogleInvocationBase.extend({
    operation: z.literal("gmail.replyAll"),
    args: GoogleArguments["gmail.replyAll"],
  }),
  GoogleInvocationBase.extend({
    operation: z.literal("gmail.search"),
    args: GoogleArguments["gmail.search"],
  }),
  GoogleInvocationBase.extend({
    operation: z.literal("gmail.message"),
    args: GoogleArguments["gmail.message"],
  }),
  GoogleInvocationBase.extend({
    operation: z.literal("gmail.thread"),
    args: GoogleArguments["gmail.thread"],
  }),
  GoogleInvocationBase.extend({
    operation: z.literal("gmail.attachment"),
    args: GoogleArguments["gmail.attachment"],
  }),
  GoogleInvocationBase.extend({
    operation: z.literal("gmail.draft.create"),
    args: GoogleArguments["gmail.draft.create"],
  }),
  GoogleInvocationBase.extend({
    operation: z.literal("gmail.draft.update"),
    args: GoogleArguments["gmail.draft.update"],
  }),
  GoogleInvocationBase.extend({
    operation: z.literal("gmail.draft.read"),
    args: GoogleArguments["gmail.draft.read"],
  }),
  GoogleInvocationBase.extend({
    operation: z.literal("gmail.draft.send"),
    args: GoogleArguments["gmail.draft.send"],
  }),
  GoogleInvocationBase.extend({ operation: z.literal("gmail.send"), args: GoogleArguments["gmail.send"] }),
  GoogleInvocationBase.extend({ operation: z.literal("docs.read"), args: GoogleArguments["docs.read"] }),
  GoogleInvocationBase.extend({ operation: z.literal("docs.edit"), args: GoogleArguments["docs.edit"] }),
  GoogleInvocationBase.extend({
    operation: z.literal("docs.comment"),
    args: GoogleArguments["docs.comment"],
  }),
  GoogleInvocationBase.extend({
    operation: z.literal("sheets.discover"),
    args: GoogleArguments["sheets.discover"],
  }),
  GoogleInvocationBase.extend({
    operation: z.literal("sheets.grid.read"),
    args: GoogleArguments["sheets.grid.read"],
  }),
  GoogleInvocationBase.extend({ operation: z.literal("sheets.read"), args: GoogleArguments["sheets.read"] }),
  GoogleInvocationBase.extend({
    operation: z.literal("sheets.write"),
    args: GoogleArguments["sheets.write"],
  }),
  GoogleInvocationBase.extend({
    operation: z.literal("sheets.format"),
    args: GoogleArguments["sheets.format"],
  }),
  GoogleInvocationBase.extend({
    operation: z.literal("sheets.notes"),
    args: GoogleArguments["sheets.notes"],
  }),
  GoogleInvocationBase.extend({
    operation: z.literal("people.search"),
    args: GoogleArguments["people.search"],
  }),
  GoogleInvocationBase.extend({
    operation: z.literal("people.batch"),
    args: GoogleArguments["people.batch"],
  }),
  GoogleInvocationBase.extend({
    operation: z.literal("youtube.search"),
    args: GoogleArguments["youtube.search"],
  }),
  GoogleInvocationBase.extend({
    operation: z.literal("youtube.videos"),
    args: GoogleArguments["youtube.videos"],
  }),
  GoogleInvocationBase.extend({
    operation: z.literal("youtube.comments"),
    args: GoogleArguments["youtube.comments"],
  }),
  GoogleInvocationBase.extend({
    operation: z.literal("youtube.replies"),
    args: GoogleArguments["youtube.replies"],
  }),
]);
export const GoogleMethodSchemas = {
  "google.accounts.list": z.object({}).strict(),
  "google.auth.start": z.object({ scopes: z.array(GoogleScopeSchema).min(1).max(11) }).strict(),
  "google.accounts.revoke": z
    .object({ connectionId: z.string().uuid(), expectedRevision: z.string().regex(/^[a-f0-9]{64}$/) })
    .strict(),
  "google.grants.list": z.object({ taskId: z.string().uuid() }).strict(),
  "google.grants.create": GoogleTaskGrantSchema.omit({ grantId: true, createdAt: true }),
  "google.grants.revoke": z.object({ taskId: z.string().uuid(), grantId: z.string().uuid() }).strict(),
} as const;

export const GoogleResultSchemas = {
  "google.accounts.list": z.object({
    available: z.boolean(),
    reason: z.string().optional(),
    connections: z.array(GoogleAccountSchema),
  }),
  "google.auth.start": z.object({ url: z.string().url(), expiresAt: z.number().int().nonnegative() }),
  "google.accounts.revoke": z.object({
    ok: z.literal(true),
    providerRevocation: z.enum(["confirmed", "pending"]),
  }),
  "google.grants.list": z.array(GoogleTaskGrantSchema),
  "google.grants.create": GoogleTaskGrantSchema,
  "google.grants.revoke": z.object({ ok: z.literal(true) }),
} as const;
const googleToolOptions = GoogleInvokeParamsSchema.options.map((option) =>
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
export const GoogleToolInputSchema = z.discriminatedUnion(
  "operation",
  googleToolOptions as [(typeof googleToolOptions)[number], ...(typeof googleToolOptions)[number][]],
);
export type GoogleToolInput = z.infer<typeof GoogleToolInputSchema>;
