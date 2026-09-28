import { z } from "zod";

export const SpaceColorSchema = z.enum(["blue", "violet", "pink", "orange", "green", "teal", "slate"]);
export const SpaceGrainSchema = z.number().int().min(0).max(100);
export const SpaceThemeSchema = z.object({
  hue: z.number().int().min(0).max(359),
  lightness: z.number().int().min(20).max(80),
  intensity: z.number().int().min(0).max(100),
  inverted: z.boolean(),
}).strict();
export type SpaceTheme = z.infer<typeof SpaceThemeSchema>;
export const SpaceInputSchema = z.object({
  id: z.string().min(1).max(200),
  name: z.string().trim().min(1).max(100),
  color: SpaceColorSchema,
  grain: SpaceGrainSchema.default(0),
  theme: SpaceThemeSchema.optional(),
});
export const BrowserSpaceSchema = SpaceInputSchema.extend({
  workspaceId: z.string().min(1),
  archived: z.boolean().default(false),
});
export type BrowserSpace = z.infer<typeof BrowserSpaceSchema>;
export type SpaceInput = z.infer<typeof SpaceInputSchema>;
