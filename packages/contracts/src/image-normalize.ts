import { z } from "zod";

export const NORMALIZE_IMAGE_MAX_BYTES = 3 * 1024 * 1024;
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const encoded = z
  .string()
  .min(4)
  .max(4 * Math.ceil(NORMALIZE_IMAGE_MAX_BYTES / 3));
export const NativeImageNormalizeParams = z
  .object({
    bytesBase64: encoded,
    mediaType: z.enum(["image/png", "image/jpeg", "image/webp"]),
    sha256: hash,
  })
  .strict();
export const NativeImageNormalizeResult = z
  .object({
    pngBase64: encoded,
    sourceSha256: hash,
    sha256: hash,
    width: z.number().int().positive().max(16384),
    height: z.number().int().positive().max(16384),
  })
  .strict();
export type NativeImageNormalizeInput = z.infer<typeof NativeImageNormalizeParams>;
export type NativeImageNormalizeOutput = z.infer<typeof NativeImageNormalizeResult>;
