import { z } from "zod";

const Id = z.string().min(1).max(200);
const Time = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
export const NightShiftSettingsSchema = z
  .object({
    enabled: z.boolean(),
    start: Time,
    end: Time,
    nightlyUsd: z.number().finite().positive().max(1000),
    perTaskUsd: z.number().finite().positive().max(1000),
    requireAC: z.boolean(),
  })
  .strict()
  .refine((value) => value.perTaskUsd <= value.nightlyUsd, "Per-task budget exceeds the nightly budget.")
  .refine((value) => value.start !== value.end, "Night shift requires a bounded time window.");
export { DEFAULT_NIGHT_SHIFT } from "./night-shift-defaults.js";
export const NightShiftPayloadSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("goal"),
      goalId: Id,
      taskId: Id.optional(),
      taskRevision: z.number().int().positive().optional(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("routine"),
      routineId: Id,
      revision: z.number().int().positive(),
      parameters: z
        .record(z.string().min(1).max(100), z.string().max(10_000))
        .refine((value) => Object.keys(value).length <= 20, "Too many Skill variables")
        .optional(),
    })
    .strict(),
  z.object({ kind: z.literal("memory.consolidate"), workspaceId: Id }).strict(),
  z.object({ kind: z.literal("memory.reindex"), workspaceId: Id }).strict(),
]);
export const NightShiftQueueSchema = z
  .object({ payload: NightShiftPayloadSchema, budgetUsd: z.number().finite().positive().max(1000) })
  .strict();
export const NightShiftItemSchema = NightShiftQueueSchema.extend({
  id: Id,
  status: z.enum(["proposed", "queued", "running", "parked", "done", "failed", "needs_review", "discarded"]),
  createdBy: z.enum(["person", "agent"]),
  createdAt: z.number().int().nonnegative(),
  runId: Id.optional(),
  windowDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});
export const PowerActivitySchema = z
  .object({ reason: z.string().min(1).max(200), durationSec: z.number().int().min(1).max(3600) })
  .strict();
export type NightShiftItem = z.infer<typeof NightShiftItemSchema>;
