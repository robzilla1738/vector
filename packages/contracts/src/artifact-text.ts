import { z } from "zod";

export const ARTIFACT_TEXT_PAGE_BYTES = 8 * 1024;
const digest = z.string().regex(/^[a-f0-9]{64}$/);
export const ArtifactTextCursorSchema = z
  .object({
    offset: z
      .number()
      .int()
      .positive()
      .max(256 * 1024),
    sha256: digest,
    artifactVersion: digest,
  })
  .strict();

/** IDs select an already admitted artifact; no path, run or grant comes from the model. */
export const ArtifactTextInputSchema = z
  .object({
    artifactId: z.string().min(1).max(200),
    cursor: ArtifactTextCursorSchema.optional(),
    maxBytes: z.number().int().min(4).max(ARTIFACT_TEXT_PAGE_BYTES).optional(),
  })
  .strict();
export type ArtifactTextInput = z.infer<typeof ArtifactTextInputSchema>;

export const AgentArtifactMetadataSchema = z
  .object({
    artifactId: z.string().min(1).max(200),
    filename: z.string().min(1).max(255),
    mediaType: z.string().min(1),
    size: z.number().int().nonnegative(),
    status: z.literal("complete"),
  })
  .strict();
export type AgentArtifactMetadata = z.infer<typeof AgentArtifactMetadataSchema>;

export const ArtifactTextResultSchema = z
  .object({
    source: z.literal("untrusted_artifact"),
    artifact: AgentArtifactMetadataSchema,
    sha256: digest,
    offset: z.number().int().nonnegative(),
    content: z.string(),
    nextCursor: ArtifactTextCursorSchema.optional(),
    eof: z.boolean(),
  })
  .strict();
export type ArtifactTextResult = z.infer<typeof ArtifactTextResultSchema>;
