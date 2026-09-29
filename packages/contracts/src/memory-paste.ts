import { z } from "zod";

export const MEMORY_PASTE_MAX_BYTES = 32_768;
export const MEMORY_PASTE_MAX_NOTES = 40;
export const MemoryPastePreviewParams = z
  .object({ workspaceId: z.string().min(1), text: z.string().min(1).max(MEMORY_PASTE_MAX_BYTES) })
  .strict();
export const MemoryPasteCandidateSchema = z
  .object({ candidateId: z.string().uuid(), text: z.string().min(1).max(2000), duplicate: z.boolean() })
  .strict();
export const MemoryPastePreviewSchema = z.discriminatedUnion("status", [
  z
    .object({ status: z.literal("blocked"), workspaceId: z.string().min(1), reason: z.string().max(300) })
    .strict(),
  z
    .object({
      status: z.literal("ready"),
      workspaceId: z.string().min(1),
      previewId: z.string().uuid(),
      expiresAt: z.number().int().nonnegative(),
      candidates: z.array(MemoryPasteCandidateSchema).min(1).max(MEMORY_PASTE_MAX_NOTES),
    })
    .strict(),
]);
export const MemoryPasteCommitParams = z
  .object({
    workspaceId: z.string().min(1),
    previewId: z.string().uuid(),
    selectedIds: z.array(z.string().uuid()).min(1).max(MEMORY_PASTE_MAX_NOTES),
  })
  .strict();
/** Stored with notes in the same encrypted generation; no original pasted document is retained. */
export const MemoryPasteReceiptSchema = z
  .object({
    importId: z.string().uuid(),
    createdAt: z.number().int().nonnegative(),
    selected: z.number().int().min(1).max(MEMORY_PASTE_MAX_NOTES),
    added: z.number().int().min(0).max(MEMORY_PASTE_MAX_NOTES),
    duplicates: z.number().int().min(0).max(MEMORY_PASTE_MAX_NOTES),
    selectionDigest: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();
export const MemoryPasteStatusSchema = MemoryPasteReceiptSchema.omit({ selectionDigest: true })
  .extend({
    pending: z.number().int().nonnegative(),
    accepted: z.number().int().nonnegative(),
    restorable: z.number().int().nonnegative(),
    removed: z.number().int().nonnegative(),
  })
  .strict();
export const MemoryPasteStatusParams = z.object({ workspaceId: z.string().min(1) }).strict();
export type MemoryPastePreview = z.infer<typeof MemoryPastePreviewSchema>;
export type MemoryPasteReceipt = z.infer<typeof MemoryPasteReceiptSchema>;
export type MemoryPasteStatus = z.infer<typeof MemoryPasteStatusSchema>;
