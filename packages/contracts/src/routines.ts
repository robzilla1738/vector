import { z } from "zod";
import { AcceptanceCriterionSchema, TaskReceiptSchema } from "./tasks.js";

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
  sourceTaskRevision: z.number().int().positive().optional(),
  sourceRunId: text.optional(),
  parameters: z.array(RoutineParameterSchema).max(20).default([]),
  siteOrigins: z.array(z.string().url()).max(20).default([]),
  accountLabels: z.array(z.string().min(1).max(120)).max(20).default([]),
  /** Exact task Calendar grants saved with this Skill. Imports must bind them locally. */
  calendarGrantIds: z.array(z.string().uuid()).max(20).default([]),
  outputHint: z.string().max(400).optional(),
  description: z.string().trim().max(2000).optional(),
  icon: z.string().trim().max(200).optional(),
  /** Context matches only suggest this Skill; they never start it or grant effects. */
  autoInject: z.object({
    keywords: z.array(text.max(80)).max(20).default([]),
    urls: z.array(z.string().url().max(2048)).max(20).default([]),
  }).strict().default({ keywords: [], urls: [] }),
  successCriteria: z.array(AcceptanceCriterionSchema).max(20).refine(items => new Set(items.map(item => item.criterionId)).size === items.length, "Criterion IDs must be unique").default([]),
  reviewRequired: z.boolean().default(true),
  cloudCapable: z.boolean().default(false),
  consecutive: z.boolean().default(false),
  trigger: RoutineTriggerSchema.default({ kind: "manual" }),
  paused: z.boolean().default(false),
});
/** Portable definition only: source tasks, grants, and schedules need local review. */
export const RoutineShareSchema = RoutineDefinitionSchema.omit({ workspaceId: true, sourceTaskId: true, sourceTaskRevision: true, sourceRunId: true, calendarGrantIds: true }).extend({
  workspaceName: text.optional(),
});
export const RoutineShareEnvelopeSchema = z.object({
  format: z.literal("aux-routine@1"),
  routines: z.array(RoutineShareSchema).min(1).max(500),
});
export const RoutineSuggestionSchema = z.object({
  routineId: text,
  title: text.max(200),
  reasons: z.array(z.enum(["keyword", "url"])).min(1).max(2),
});
/** Thin plugin: a named bundle of existing capabilities (portable routines). */
export const AuxPluginManifestSchema = z.object({
  format: z.literal("aux-plugin@1"),
  name: text.max(200),
  version: z.string().min(1).max(60).optional(),
  description: z.string().max(2000).optional(),
  routines: z.array(RoutineShareSchema).min(1).max(500),
});
export const PluginSchema = z.object({
  pluginId: text,
  name: text.max(200),
  version: z.string().max(60).optional(),
  description: z.string().max(2000).optional(),
  workspaceId: text,
  routineIds: z.array(text).max(500),
  installedAt: z.number(),
  uninstalledAt: z.number().optional(),
});
/** Imported component inventory is inert until a separate, scoped grant exists. */
export const PluginAssetSchema = z.object({
  assetId: z.string().uuid(),
  pluginId: text,
  kind: z.enum(["skill", "mcp_server", "hook"]),
  name: text.max(200),
  description: z.string().max(2000).optional(),
  content: z.string().max(64_000).optional(),
  digest: z.string().regex(/^[a-f0-9]{64}$/),
  authority: z.literal("none"),
  importedAt: z.number(),
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
  status: z.enum(["queued", "running", "waiting_input", "completed", "failed", "cancelled", "missed", "needs_review", "uncertain"]),
  reason: z.string().max(1000).optional(),
  chatId: z.string().optional(),
  runId: z.string().optional(),
  parameters: z.record(z.string(), z.string()).default({}),
  startedAt: z.number().optional(),
  endedAt: z.number().optional(),
  createdAt: z.number(),
});
export const RoutineRunOutcomeSchema = z.object({
  run: RoutineRunSchema,
  sourceTaskId: text.optional(),
  sourceTaskRevision: z.number().int().positive().optional(),
  linkedRunFound: z.boolean(),
  criteria: TaskReceiptSchema.shape.criteria,
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

export type AuxPluginManifest = z.infer<typeof AuxPluginManifestSchema>;
export type Plugin = z.infer<typeof PluginSchema>;
export type PluginAsset = z.infer<typeof PluginAssetSchema>;
export type RoutineShare = z.infer<typeof RoutineShareSchema>;
export type RoutineShareEnvelope = z.infer<typeof RoutineShareEnvelopeSchema>;
export type RoutineSuggestion = z.infer<typeof RoutineSuggestionSchema>;
export type RoutineParameter = z.infer<typeof RoutineParameterSchema>;
export type RoutineTrigger = z.infer<typeof RoutineTriggerSchema>;
export type Routine = z.infer<typeof RoutineSchema>;
export type RoutineRun = z.infer<typeof RoutineRunSchema>;
export type RoutineRunOutcome = z.infer<typeof RoutineRunOutcomeSchema>;
export type RoutineOccurrence = z.infer<typeof RoutineOccurrenceSchema>;

/** Stable identity for one scheduled fire in a timezone. */
export function routineOccurrenceIdentity(routineId: string, timezone: string, scheduledFor: number): string {
  // A repeated wall-clock minute at the fall DST boundary is one scheduled
  // occurrence. The spring gap has no matching minute and is never invented.
  const fields = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(scheduledFor)).map(part => [part.type, part.value]));
  return `${routineId}:${timezone}:${fields.year}-${fields.month}-${fields.day}T${fields.hour}:${fields.minute}`;
}
