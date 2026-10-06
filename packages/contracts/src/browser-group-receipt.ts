import { z } from "zod";

const id = z.string().min(1).max(200);
const members = z
  .array(id)
  .max(50)
  .refine((value) => new Set(value).size === value.length, "Group members must be unique.");
const affectedMembers = z
  .array(id)
  .min(1)
  .max(50)
  .refine((value) => new Set(value).size === value.length, "Affected pages must be unique.");
const snapshot = z
  .object({
    revision: z.number().int().nonnegative(),
    memberPageIds: members,
    title: z.string().max(200).optional(),
  })
  .strict();

/** Native-only observation after a real browser group mutation. */
export const BrowserGroupNativeEffectSchema = z
  .object({
    mutationId: z.string().uuid(),
    groupId: id,
    observedAt: z.number().int().nonnegative(),
    pageIds: affectedMembers,
    before: snapshot,
    after: snapshot,
  })
  .strict()
  .superRefine((value, ctx) => {
    const affected = new Set([...value.before.memberPageIds, ...value.after.memberPageIds]);
    if (value.pageIds.length !== affected.size || value.pageIds.some((pageId) => !affected.has(pageId)))
      ctx.addIssue({ code: "custom", message: "Affected pages must match the group snapshots." });
    if (
      value.after.revision <= value.before.revision ||
      (value.before.title === value.after.title &&
        JSON.stringify([...value.before.memberPageIds].sort()) ===
          JSON.stringify([...value.after.memberPageIds].sort()))
    )
      ctx.addIssue({ code: "custom", message: "Group effect needs a newer, changed native state." });
  });
export type BrowserGroupNativeEffect = z.infer<typeof BrowserGroupNativeEffectSchema>;

export const BrowserGroupReceiptSchema = z
  .object({
    stepId: z.string().uuid(),
    runId: id,
    groupId: id,
    taskRevision: z.number().int().positive(),
    observedAt: z.number().int().nonnegative(),
    before: snapshot,
    after: snapshot,
    undoAvailable: z.literal(false),
  })
  .strict();
export type BrowserGroupReceipt = z.infer<typeof BrowserGroupReceiptSchema>;
