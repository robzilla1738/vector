import { z } from "zod";

export const SpaceColorSchema = z.enum(["blue", "violet", "pink", "orange", "green", "teal", "slate"]);
export const SpaceInputSchema = z.object({
  id: z.string().min(1).max(200),
  name: z.string().trim().min(1).max(100),
  color: SpaceColorSchema,
});
export const BrowserSpaceSchema = SpaceInputSchema.extend({
  workspaceId: z.string().min(1),
  archived: z.boolean().default(false),
});
export type BrowserSpace = z.infer<typeof BrowserSpaceSchema>;
export type SpaceInput = z.infer<typeof SpaceInputSchema>;
