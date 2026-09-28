import { z } from "zod";

export const WorkspaceFolderAccessSchema = z.enum(["read", "readWrite"]);
export const WorkspaceFolderReviewSchema = z.object({
  workspaceId: z.string().min(1),
  path: z.string().min(1).max(4096),
  access: WorkspaceFolderAccessSchema,
  agentsPreview: z.string().max(16_000),
  agentsDigest: z.string().regex(/^[a-f0-9]{64}$/),
  reviewDigest: z.string().regex(/^[a-f0-9]{64}$/),
});
export const WorkspaceFolderSchema = WorkspaceFolderReviewSchema.omit({ agentsPreview: true }).extend({
  folderId: z.string().uuid(),
  createdAt: z.number().int().nonnegative(),
  archivedAt: z.number().int().nonnegative().optional(),
  agentsChanged: z.boolean().optional(),
});
export type WorkspaceFolderAccess = z.infer<typeof WorkspaceFolderAccessSchema>;
export type WorkspaceFolderReview = z.infer<typeof WorkspaceFolderReviewSchema>;
export type WorkspaceFolder = z.infer<typeof WorkspaceFolderSchema>;
