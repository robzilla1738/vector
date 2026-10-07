import { z } from "zod";
export const CoderWorktreeSchema = z
  .object({
    root: z.string().min(1),
    parentRoot: z.string().min(1),
    baseCommit: z.string().min(1),
    snapshotDigest: z.string().regex(/^[a-f0-9]{64}$/),
    integrated: z.boolean(),
    integrationBatches: z
      .array(
        z
          .object({
            actionId: z.string().min(1),
            digest: z.string().regex(/^[a-f0-9]{64}$/),
            paths: z.array(z.string()),
          })
          .strict(),
      )
      .optional(),
    integratedDigest: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
  })
  .strict();
export type CoderWorktree = z.infer<typeof CoderWorktreeSchema>;

export const CoderWorktreeRecoverySchema = z
  .object({
    actionId: z.string().min(1),
    root: z.string().min(1),
    parentRoot: z.string().min(1),
    baseCommit: z.string().min(1),
    snapshotDigest: z.string().regex(/^[a-f0-9]{64}$/),
    state: z.enum(["incomplete", "archived"]),
    archivedRoot: z.string().optional(),
  })
  .strict();
export type CoderWorktreeRecovery = z.infer<typeof CoderWorktreeRecoverySchema>;
export const CoderRecoveryInspectionSchema = z
  .object({
    cellId: z.string(),
    root: z.string(),
    exists: z.boolean(),
    archiveOutcomeUnknown: z.boolean(),
    state: z.enum(["incomplete", "archived"]),
    digest: z.string(),
    files: z.array(
      z
        .object({
          path: z.string(),
          size: z.number(),
          mode: z.number().optional(),
          binary: z.boolean(),
          preview: z.string().optional(),
        })
        .strict(),
    ),
    blockedPaths: z.array(z.string()),
  })
  .strict();

export type CoderRecoveryInspection = z.infer<typeof CoderRecoveryInspectionSchema>;
