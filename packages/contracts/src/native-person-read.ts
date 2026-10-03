import { z } from "zod";

const attribute = z.enum(["href", "title", "alt", "aria-label", "name", "id", "role"]);
const field = z.object({ name: z.string().regex(/^[A-Za-z][\w-]{0,63}$/),
  selector: z.string().min(1).max(512).optional(), attribute: attribute.optional(),
  all: z.boolean().optional() }).strict().refine(value =>
    value.selector !== undefined || (value.attribute === undefined && value.all === undefined));
export const PersonReadRequestSchema = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("observe"), maxElements: z.number().int().min(1).max(200),
    maxTextChars: z.number().int().min(1).max(16000), filter: z.enum(["interactive", "all", "viewport"]).optional(),
    subtreeRef: z.string().min(1).max(512).optional() }).strict(),
  z.object({ operation: z.literal("extract"), fields: z.array(field).min(1).max(20)
    .refine(fields => new Set(fields.map(value => value.name)).size === fields.length) }).strict(),
]);
export type PersonReadRequest = z.infer<typeof PersonReadRequestSchema>;
export const NativePersonReadParamsSchema = z.object({ pageId: z.string().uuid(),
  request: PersonReadRequestSchema }).strict();
export const NativePersonReadContextParamsSchema = z.object({ pageId: z.string().uuid() }).strict();
const NativePersonReadIdentitySchema = z.object({ documentId: z.string().uuid(),
  sessionId: z.string().uuid(), pageId: z.string().uuid(),
  producerSha256: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
export const NativePersonReadContextSchema = NativePersonReadIdentitySchema.extend({ url: z.string().url().max(8192) }).strict();
export type NativePersonReadContext = z.infer<typeof NativePersonReadContextSchema>;
export const NativePersonReadReceiptSchema = NativePersonReadIdentitySchema.extend({
  readId: z.string().uuid(), value: z.unknown().nonoptional() }).strict();
export type NativePersonReadReceipt = z.infer<typeof NativePersonReadReceiptSchema>;

