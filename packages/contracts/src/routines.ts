import { z } from "zod";

const text = z.string().trim().min(1);
export const RoutineParameterSchema = z.object({
  name: z.string().regex(/^[A-Za-z][A-Za-z0-9_]{0,40}$/),
  label: text.max(80),
  value: z.string().max(4000).optional(),
});
export const RoutineTriggerSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("manual") }).strict(),
  z.object({
    kind: z.literal("schedule"),
    timezone: z.string().min(1).max(80),
    hour: z.number().int().min(0).max(23),
    minute: z.number().int().min(0).max(59),
    days: z.array(z.number().int().min(0).max(6)).min(1).max(7),
  }).strict(),
  z.object({
    kind: z.literal("monitor"),
    timezone: z.string().min(1).max(80),
    intervalMinutes: z.number().int().min(5).max(24 * 60),
  }).strict(),
]);
export const RoutineDefinitionSchema = z.object({
  title: text.max(200),
  objective: text.max(10000),
  workspaceId: text,
  sourceTaskId: text.optional(),
  sourceRunId: text.optional(),
  parameters: z.array(RoutineParameterSchema).max(20).default([]),
  siteOrigins: z.array(z.string().url()).max(20).default([]),
  accountLabels: z.array(z.string().min(1).max(120)).max(20).default([]),
  outputHint: z.string().max(400).optional(),
  reviewRequired: z.boolean().default(true),
  cloudCapable: z.boolean().default(false),
  consecutive: z.boolean().default(false),
  trigger: RoutineTriggerSchema.default({ kind: "manual" }),
  paused: z.boolean().default(false),
});
export const RoutineSchema = RoutineDefinitionSchema.extend({
  routineId: text,
  revision: z.number().int().positive(),
  createdAt: z.number(),
  updatedAt: z.number(),
  archivedAt: z.number().optional(),
});
export const RoutineOccurrenceSchema = z.object({
  occurrenceId: text,
  routineId: text,
  revision: z.number().int().positive(),
  timezone: z.string(),
  scheduledFor: z.number(),
  identity: text,
});
export const RoutineRunSchema = z.object({
  routineRunId: text,
  routineId: text,
  revision: z.number().int().positive(),
  occurrenceId: text.optional(),
  occurrenceIdentity: text.optional(),
  status: z.enum(["queued", "running", "completed", "failed", "cancelled", "missed", "needs_review", "uncertain"]),
  reason: z.string().max(1000).optional(),
  chatId: z.string().optional(),
  runId: z.string().optional(),
  parameters: z.record(z.string(), z.string()).default({}),
  startedAt: z.number().optional(),
  endedAt: z.number().optional(),
  createdAt: z.number(),
});
export const RoutineCreateParams = RoutineDefinitionSchema;
export const RoutineUpdateParams = RoutineDefinitionSchema.partial().extend({
  routineId: text,
  expectedRevision: z.number().int().positive(),
});
export const RoutineFromResultParams = z.object({
  taskId: text,
  runId: text.optional(),
  title: text.max(200).optional(),
  parameters: z.array(RoutineParameterSchema).max(20).optional(),
  trigger: RoutineTriggerSchema.optional(),
  reviewRequired: z.boolean().optional(),
  cloudCapable: z.boolean().optional(),
}).strict();
export const RoutineRunParams = z.object({
  routineId: text,
  expectedRevision: z.number().int().positive(),
  parameters: z.record(z.string(), z.string().max(4000)).default({}),
}).strict();
export const RoutineAlertSchema = z.object({
  routineRunId: text,
  routineId: text,
  title: text.max(200),
  status: RoutineRunSchema.shape.status,
  reason: z.string().max(1000).optional(),
  triggerKind: z.enum(["manual", "schedule", "monitor"]),
  createdAt: z.number(),
});
export const RoutineCompareSchema = z.object({
  routineId: text,
  title: text.max(200),
  left: RoutineRunSchema,
  right: RoutineRunSchema,
  sameOccurrence: z.boolean(),
  sameParameters: z.boolean(),
  statusChanged: z.boolean(),
  summary: text.max(2000),
});
export type RoutineAlert = z.infer<typeof RoutineAlertSchema>;
export type RoutineCompare = z.infer<typeof RoutineCompareSchema>;

export type RoutineParameter = z.infer<typeof RoutineParameterSchema>;
export type RoutineTrigger = z.infer<typeof RoutineTriggerSchema>;
export type Routine = z.infer<typeof RoutineSchema>;
export type RoutineRun = z.infer<typeof RoutineRunSchema>;
export type RoutineOccurrence = z.infer<typeof RoutineOccurrenceSchema>;

/** Stable identity for one scheduled fire in a timezone. */
export function routineOccurrenceIdentity(routineId: string, timezone: string, scheduledFor: number): string {
  const stamp = new Date(scheduledFor).toISOString().slice(0, 16);
  return `${routineId}:${timezone}:${stamp}`;
}
