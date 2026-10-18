import { z } from "zod";

const revision = z.string().regex(/^[a-f0-9]{64}$/);
const messageIds = z
  .array(z.string().min(1))
  .max(50)
  .refine((ids) => new Set(ids).size === ids.length, "Queued messages must be distinct.");
export const QueueOrderSchema = z.object({ chatId: z.string().min(1), revision, messageIds });
export type QueueOrder = z.infer<typeof QueueOrderSchema>;
export const QueueOrderGetParams = z.object({ chatId: z.string().min(1) }).strict();
export const QueueOrderSetParams = QueueOrderGetParams.extend({
  expectedRevision: revision,
  messageIds,
}).strict();
