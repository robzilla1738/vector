import { z } from "zod";
export const SkillLibrarySourceSchema = z.enum(["aux", "claude"]);
export const SkillLibraryPreviewParams = z
  .object({ source: SkillLibrarySourceSchema })
  .strict();
export const SkillLibraryImportParams = z
  .object({
    reviewId: z.uuid(),
    skillIds: z.array(z.string().min(1).max(80)).min(1).max(128),
    workspaceId: z.string().min(1),
  })
  .strict();
export const SkillLibraryPreviewSchema = z
  .object({
    reviewId: z.uuid(),
    source: SkillLibrarySourceSchema,
    location: z.string(),
    skills: z
      .array(
        z
          .object({
            skillId: z.string(),
            title: z.string(),
            description: z.string(),
            objective: z.string().optional(),
            error: z.string().optional(),
          })
          .strict(),
      )
      .max(128),
  })
  .strict();
export type SkillLibrarySource = z.infer<typeof SkillLibrarySourceSchema>;
export type SkillLibraryPreview = z.infer<typeof SkillLibraryPreviewSchema>;
