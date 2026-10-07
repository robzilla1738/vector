import { z } from "zod";
const project = { workspaceId: z.string().min(1), folderId: z.string().uuid() };
const path = z.string().max(4096);
export const ProjectFilesParams = z.object({ ...project, path: path.default("") }).strict();
export const ProjectFileParams = z.object({ ...project, path: path.min(1) }).strict();
export const ProjectChangesParams = z.object(project).strict();
export const ProjectFilesSchema = z
  .object({
    path,
    entries: z
      .array(
        z
          .object({
            name: z.string().min(1).max(255),
            path,
            type: z.enum(["file", "directory", "symlink", "other"]),
            size: z.number().finite().nonnegative(),
          })
          .strict(),
      )
      .max(1000),
    truncated: z.boolean(),
  })
  .strict();
export const ProjectFileSchema = z
  .object({ path, text: z.string().max(1_048_576), truncated: z.boolean() })
  .strict();
export const ProjectChangesSchema = z
  .object({
    status: z.string().max(1_048_576),
    diff: z.string().max(1_048_576),
    truncated: z.boolean(),
  })
  .strict();
const native = {
  token: z.string().uuid(),
  operationId: z.string().uuid(),
  cwd: z.string().min(1).max(4096),
  rootDevice: z
    .string()
    .regex(/^[0-9]+$/)
    .max(32),
  rootInode: z
    .string()
    .regex(/^[0-9]+$/)
    .max(32),
  deniedRoots: z.array(z.string().min(1).max(4096)).max(512),
};
export const NativeProjectFilesParams = ProjectFilesParams.extend(native).strict();
export const NativeProjectFileParams = ProjectFileParams.extend(native).strict();
export const NativeProjectChangesParams = ProjectChangesParams.extend({
  ...native,
  sandboxProfile: z.string().min(1).max(65536),
}).strict();
export const NativeProjectCancelParams = z
  .object({ token: z.string().uuid(), operationId: z.string().uuid() })
  .strict();
export const NativeProjectClosedSchema = z.object({ closed: z.literal(true) }).strict();
export type ProjectFiles = z.infer<typeof ProjectFilesSchema>;
export type ProjectFile = z.infer<typeof ProjectFileSchema>;
export type ProjectChanges = z.infer<typeof ProjectChangesSchema>;
