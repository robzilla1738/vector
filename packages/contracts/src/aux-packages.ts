import { z } from "zod";
import { AgentProfileSchema } from "./agent-profiles.js";
const relativePath = z
  .string()
  .min(1)
  .max(4096)
  .refine(
    (value) =>
      !value.startsWith("/") &&
      !value.includes("\\") &&
      !value.split("/").some((part) => part === ".." || part === "."),
  );
export const AuxPackageManifestSchema = z
  .object({
    schemaVersion: z.literal(1),
    name: z.string().regex(/^[a-z][a-z0-9_-]{0,127}$/),
    version: z.string().regex(/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/),
    description: z.string().max(2000).optional(),
    skills: z.array(relativePath).max(128).default([]),
    profiles: z.array(AgentProfileSchema).max(32).default([]),
    templates: z.record(z.string(), z.string().max(32_000)).default({}),
    workflows: z
      .record(
        z.string(),
        z
          .array(
            z.object({ tool: z.string().min(1).max(128), input: z.record(z.string(), z.unknown()) }).strict(),
          )
          .max(128),
      )
      .default({}),
  })
  .strict();
export const AuxPackageSnapshotSchema = z
  .object({
    manifest: AuxPackageManifestSchema,
    digest: z.string().regex(/^[a-f0-9]{64}$/),
    warnings: z.array(z.string().max(512)).max(128).default([]),
    skills: z
      .array(
        z
          .object({
            path: relativePath,
            name: z.string(),
            description: z.string(),
            instructions: z.string().max(64_000),
          })
          .strict(),
      )
      .max(128),
  })
  .strict();
export type AuxPackageManifest = z.infer<typeof AuxPackageManifestSchema>;
export type AuxPackageSnapshot = z.infer<typeof AuxPackageSnapshotSchema>;

export const AuxPackageLibrarySchema = z
  .object({
    packages: z.array(
      z.object({
        name: z.string(),
        version: z.string(),
        description: z.string().optional(),
        shipped: z.boolean(),
        warnings: z.array(z.string().max(512)).max(128).default([]),
        skills: z.array(z.object({ name: z.string(), description: z.string() })),
        profiles: z.array(z.object({ name: z.string() })),
      }),
    ),
    defaults: z.array(z.string()),
  })
  .strict();
