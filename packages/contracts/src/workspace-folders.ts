import { z } from "zod";

export const WorkspaceFolderPresentationSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  icon: z
    .enum([
      "folder",
      "code",
      "globe",
      "bookmark",
      "cloud",
      "cpu",
      "message",
      "sparkles",
      "layers",
      "puzzle",
      "shield",
      "zap",
      "sun",
      "moon",
      "clock",
      "table",
      "user",
      "eye",
      "pin",
      "archive",
      "grid",
      "search",
      "mic",
      "window",
    ])
    .optional(),
  color: z.enum(["neutral", "red", "orange", "yellow", "green", "teal", "blue", "violet", "pink"]).optional(),
});
export type WorkspaceFolderPresentation = z.infer<typeof WorkspaceFolderPresentationSchema>;

export const WorkspaceFolderAccessSchema = z.enum(["read", "readWrite"]);
export const WorkspaceFolderReviewSchema = z.object({
  workspaceId: z.string().min(1),
  path: z.string().min(1).max(4096),
  access: WorkspaceFolderAccessSchema,
  agentsPreview: z.string().max(16_000),
  /** Existing project-local Claude-compatible skills directory within this root. */
  skillsPath: z.string().min(1).max(4096).optional(),
  agentsDigest: z.string().regex(/^[a-f0-9]{64}$/),
  reviewDigest: z.string().regex(/^[a-f0-9]{64}$/),
});
export const WorkspaceFolderSchema = WorkspaceFolderReviewSchema.omit({ agentsPreview: true }).extend({
  ...WorkspaceFolderPresentationSchema.shape,
  folderId: z.string().uuid(),
  createdAt: z.number().int().nonnegative(),
  archivedAt: z.number().int().nonnegative().optional(),
  agentsChanged: z.boolean().optional(),
});
export type WorkspaceFolderAccess = z.infer<typeof WorkspaceFolderAccessSchema>;
export type WorkspaceFolderReview = z.infer<typeof WorkspaceFolderReviewSchema>;
export type WorkspaceFolder = z.infer<typeof WorkspaceFolderSchema>;
