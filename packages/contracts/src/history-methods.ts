import { z } from "zod";
import { HistoryEntrySchema } from "./entities.js";

export const HistoryListParams = z.object({
  query: z.string().max(1000).optional(),
  limit: z.number().int().positive().max(500).default(100),
  since: z.number().finite().nonnegative().optional(),
  before: z.object({ visitedAt: z.number().finite().nonnegative(), url: z.string().min(1) }).optional(),
});
export const HistoryRangeParams = z
  .object({
    since: z.number().finite().nonnegative().optional(),
    before: z.number().finite().nonnegative().optional(),
  })
  .strict()
  .refine(
    (value) => value.since === undefined || value.before === undefined || value.since <= value.before,
    "History range must end after it starts",
  );
export const HistoryMethodSchemas = {
  "history.list": HistoryListParams.strict(),
  "history.count": HistoryRangeParams,
  "history.clear": HistoryRangeParams,
  "history.remove": z
    .object({ url: z.string().min(1).max(8192), visitedAt: z.number().finite().nonnegative() })
    .strict(),
} as const;
export const HistoryResultSchemas = {
  "history.list": z.array(HistoryEntrySchema),
  "history.count": z.object({ count: z.number().int().nonnegative() }).strict(),
  "history.clear": z.object({ ok: z.boolean(), removed: z.number().int().nonnegative() }).strict(),
  "history.remove": z.object({ removed: z.boolean() }).strict(),
} as const;
export type NativeHistoryMethod = keyof typeof HistoryMethodSchemas;
export function isNativeHistoryMethod(method: string): method is NativeHistoryMethod {
  return Object.hasOwn(HistoryMethodSchemas, method);
}
function request<M extends NativeHistoryMethod>(method: M) {
  return z.object({ method: z.literal(method), params: HistoryMethodSchemas[method] }).strict();
}
function response<M extends NativeHistoryMethod>(method: M) {
  return z.object({ method: z.literal(method), result: HistoryResultSchemas[method] }).strict();
}
export const NativeHistoryRequestSchema = z.discriminatedUnion("method", [
  z
    .object({
      method: z.literal("history.list"),
      params: HistoryListParams.extend({ limit: z.number().int().positive().max(500) }).strict(),
    })
    .strict(),
  request("history.count"),
  request("history.clear"),
  request("history.remove"),
]);
export const NativeHistoryResultSchema = z.discriminatedUnion("method", [
  response("history.list"),
  response("history.count"),
  response("history.clear"),
  response("history.remove"),
]);
