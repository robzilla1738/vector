import { z } from "zod";

export const PictureInPictureOperationSchema = z.enum(["toggle", "enter", "exit"]);
export const PictureInPictureRequestSchema = z.object({ pageId: z.string().min(1).max(200),
  operation: PictureInPictureOperationSchema }).strict();
export const PictureInPictureResultSchema = z.object({ active: z.boolean(), reason: z.string().max(500).optional() }).strict();
export type PictureInPictureResult = z.infer<typeof PictureInPictureResultSchema>;
