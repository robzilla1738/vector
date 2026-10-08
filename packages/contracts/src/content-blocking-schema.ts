import { z } from "zod";
import {
  MAX_FILTER_BYTES,
  MAX_FILTER_SNAPSHOT_BYTES,
  MAX_FILTER_SOURCES,
  MAX_FILTER_CHUNK_BYTES,
} from "./content-blocking.js";
const digest = z.string().regex(/^[a-f0-9]{64}$/);
const whole = z.number().int().nonnegative().safe();
export const FilterSourceHeaderSchema = z
  .object({
    id: z.string().regex(/^[a-f0-9]{12}$/),
    url: z.string().url().max(2048),
    kind: z.enum(["adblock", "hosts"]),
    sha256: digest,
    bytes: whole.max(MAX_FILTER_BYTES),
  })
  .strict();
export const FilterCompilationWarningSchema = z
  .object({
    sourceId: z.string().regex(/^[a-f0-9]{12}$/),
    sourceSha256: digest,
    rejectedCount: whole.positive(),
    diagnosticsSha256: digest,
    samples: z
      .array(
        z
          .object({
            line: whole.positive(),
            code: z.string().min(1).max(64),
            message: z.string().min(1).max(512),
          })
          .strict(),
      )
      .max(8),
  })
  .strict();
export const FilterCompilationWarningsSchema = z.array(FilterCompilationWarningSchema).max(64);
export const ContentBlockReceiptSchema = z
  .object({
    backend: z.literal("ublock_origin"),
    engineVersion: z.literal("9df989ecc483cd7ada4b195c47a0584ab2d97450"),
    profileId: z.string().min(1).max(128),
    private: z.literal(false),
    generation: whole.positive(),
    filterDigest: digest,
    sourceHeaders: z.array(FilterSourceHeaderSchema).max(MAX_FILTER_SOURCES),
    compilationWarnings: FilterCompilationWarningsSchema,
    cosmeticBackend: z.literal("native_user_styles"),
    phase: z.literal("document_start"),
    futureDocuments: z.literal(true),
  })
  .strict();
export const ContentBlockStateSchema = z
  .object({
    receipt: ContentBlockReceiptSchema.nullable(),
    enabled: z.boolean(),
    allowedSiteHosts: z.array(z.string().min(1).max(253)).max(4096),
  })
  .strict();
export const ContentBlockBeginSchema = z
  .object({
    profileId: z.string().min(1).max(128),
    baseGeneration: whole.positive(),
    generation: whole.positive(),
    filterDigest: digest,
    sources: z.array(FilterSourceHeaderSchema.extend({ bundled: z.boolean() })).max(MAX_FILTER_SOURCES),
    allowedSiteHosts: z.array(z.string().min(1).max(253)).max(4096),
    enabled: z.boolean(),
  })
  .strict()
  .refine(
    (value) => value.sources.reduce((total, source) => total + source.bytes, 0) <= MAX_FILTER_SNAPSHOT_BYTES,
    "Filter snapshot exceeds its byte limit",
  );
export const ContentBlockAppendSchema = z
  .object({
    profileId: z.string().min(1).max(128),
    generation: whole.positive(),
    sourceId: z.string().regex(/^[a-f0-9]{12}$/),
    offset: whole.max(MAX_FILTER_BYTES),
    text: z
      .string()
      .max(MAX_FILTER_CHUNK_BYTES)
      .refine(
        (text) => new TextEncoder().encode(text).byteLength <= MAX_FILTER_CHUNK_BYTES,
        "Filter chunk exceeds its byte limit",
      ),
  })
  .strict();
export const ContentBlockCommitSchema = z
  .object({
    profileId: z.string().min(1).max(128),
    generation: whole.positive(),
    filterDigest: digest,
  })
  .strict();
