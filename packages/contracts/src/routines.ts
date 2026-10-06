import { z } from "zod";
import { AcceptanceCriterionSchema, TaskReceiptSchema } from "./tasks.js";
import { PlanStepSchema } from "./program.js";

const text = z.string().trim().min(1);
const timezone = z
  .string()
  .min(1)
  .max(80)
  .refine((value) => {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: value });
      return true;
    } catch {
      return false;
    }
  }, "Choose a valid IANA time zone");
const siteOrigin = z
  .string()
  .url()
  .max(8192)
  .refine((value) => {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && url.origin === value;
  }, "Choose an exact http(s) origin");
const siteUrl = z
  .string()
  .url()
  .max(8192)
  .refine((value) => {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && !url.username && !url.password;
  }, "Choose an http(s) page without embedded credentials");
export const RoutineParameterSchema = z.object({
  name: z.string().regex(/^[A-Za-z][A-Za-z0-9_]{0,40}$/),
  label: text.max(80),
  value: z.string().max(4000).optional(),
});
export const RoutineTriggerSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("manual") }).strict(),
  z
    .object({
      kind: z.literal("schedule"),
      timezone,
      hour: z.number().int().min(0).max(23),
      minute: z.number().int().min(0).max(59),
      days: z.array(z.number().int().min(0).max(6)).min(1).max(7),
    })
    .strict(),
  z
    .object({
      kind: z.literal("monitor"),
      timezone,
      intervalMinutes: z
        .number()
        .int()
        .min(5)
        .max(24 * 60),
    })
    .strict(),
  z.object({ kind: z.literal("site_notification"), origin: siteOrigin }).strict(),
  z
    .object({
      kind: z.literal("page_change"),
      url: siteUrl,
      minimumIntervalMinutes: z
        .number()
        .int()
        .min(5)
        .max(24 * 60)
        .default(5),
    })
    .strict(),
  z
    .object({
      kind: z.literal("calendar_event"),
      grantId: z.string().uuid(),
      calendarId: text.max(1024).optional(),
      beforeMinutes: z
        .number()
        .int()
        .min(0)
        .max(24 * 60)
        .default(0),
    })
    .strict(),
]);
/** Accepted only on the trusted host channel; page content and notification body never enter this payload. */
export const RoutineSourceEventSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("site_notification"),
      origin: siteOrigin,
      eventId: text.max(1024),
      permissionGranted: z.literal(true),
      observedAt: z.number().int().nonnegative(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("page_change"),
      eventId: text.max(1024),
      pageId: text.max(200),
      url: siteUrl,
      documentEpoch: z.number().int().nonnegative(),
      contentSha256: z.string().regex(/^[a-f0-9]{64}$/),
      observedAt: z.number().int().nonnegative(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("calendar_event"),
      grantId: z.string().uuid(),
      connectionId: z.string().uuid(),
      calendarId: text.max(1024),
      eventId: text.max(1024),
      startAt: z.number().int().nonnegative(),
      observedAt: z.number().int().nonnegative(),
    })
    .strict(),
]);
/** Host-only preflight before Chromium reads a watched document. */
export const RoutinePageChangeTargetParamsSchema = z.object({ pageId: text.max(200), url: siteUrl }).strict();
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
  autoInject: z
    .object({
      keywords: z.array(text.max(80)).max(20).default([]),
      urls: z.array(z.string().url().max(2048)).max(20).default([]),
    })
    .strict()
    .default({ keywords: [], urls: [] }),
  successCriteria: z
    .array(AcceptanceCriterionSchema)
    .max(20)
    .refine(
      (items) => new Set(items.map((item) => item.criterionId)).size === items.length,
      "Criterion IDs must be unique",
    )
    .default([]),
  reviewRequired: z.boolean().default(true),
  consecutive: z.boolean().default(false),
  spendCapUsd: z.number().positive().max(50).optional(),
  /** A person may exempt this Skill from the unread-results presence guard. */
  presenceGuardExempt: z.boolean().default(false),
  missedRunPolicy: z.enum(["record_only", "run_once_on_wake"]).default("record_only"),
  trigger: RoutineTriggerSchema.default({ kind: "manual" }),
  paused: z.boolean().default(false),
});
/** Portable definition only: source tasks, grants, and schedules need local review. */
export const RoutineShareSchema = RoutineDefinitionSchema.omit({
  workspaceId: true,
  sourceTaskId: true,
  sourceTaskRevision: true,
  sourceRunId: true,
  calendarGrantIds: true,
  presenceGuardExempt: true,
}).extend({
  workspaceName: text.optional(),
});
export const RoutineShareEnvelopeSchema = z.object({
  format: z.literal("aux-routine@1"),
  routines: z.array(RoutineShareSchema).min(1).max(500),
});
export const RoutineSuggestionSchema = z.object({
  routineId: text,
  title: text.max(200),
  reasons: z
    .array(z.enum(["keyword", "url"]))
    .min(1)
    .max(2),
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
export const PluginSkillGrantScopeSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("workspace"), workspaceId: text }).strict(),
  z.object({ kind: z.literal("task"), taskId: text, revision: z.number().int().positive() }).strict(),
]);
export const PluginSkillGrantSchema = z.object({
  grantId: z.string().uuid(),
  assetId: z.string().uuid(),
  assetDigest: z.string().regex(/^[a-f0-9]{64}$/),
  scope: PluginSkillGrantScopeSchema,
  createdAt: z.number().int().nonnegative(),
  revokedAt: z.number().int().nonnegative().optional(),
});
export const PluginSkillGrantParams = PluginSkillGrantSchema.pick({ assetId: true, scope: true })
  .extend({
    expectedDigest: PluginSkillGrantSchema.shape.assetDigest,
  })
  .strict();
export const PluginSkillReadParams = z
  .object({
    grantId: z.string().uuid(),
    taskId: text,
    expectedRevision: z.number().int().positive(),
  })
  .strict();
export const PluginSkillReadSchema = z
  .object({
    grant: PluginSkillGrantSchema,
    name: text.max(200),
    content: z.string().max(64_000),
    digest: PluginSkillGrantSchema.shape.assetDigest,
  })
  .strict();
export const RoutineSchema = RoutineDefinitionSchema.extend({
  routineId: text,
  revision: z.number().int().positive(),
  createdAt: z.number(),
  /** Earliest schedule time eligible after creation, resuming, trigger edits, or restore. */
  activatedAt: z.number().int().nonnegative().optional(),
  updatedAt: z.number(),
  archivedAt: z.number().optional(),
  pauseCause: z.enum(["unread_results"]).optional(),
  /** Server-assigned origin requiring a separate, revision-bound activation review. */
  activationReview: z.enum(["run_result", "imported", "untrusted_task"]).optional(),
  /** Declarative, same-site trace. Imported documents cannot carry this local proof. */
  replay: z
    .object({
      format: z.literal("aux-skill-replay@2"),
      sourceRunId: text.optional(),
      sourceRecordingId: text.optional(),
      siteOrigin: siteOrigin,
      siteOrigins: z.array(siteOrigin).min(1).max(20),
      steps: z.array(PlanStepSchema).min(2).max(50),
      digest: z.string().regex(/^[a-f0-9]{64}$/),
      state: z.enum(["untested", "testing", "tested", "needs_repair"]),
      testRunId: text.optional(),
      testRevision: z.number().int().positive().optional(),
      testedRevision: z.number().int().positive().optional(),
      testedAt: z.number().int().nonnegative().optional(),
    })
    .strict()
    .refine(
      (replay) => Number(!!replay.sourceRunId) + Number(!!replay.sourceRecordingId) === 1,
      "Choose one exact replay source.",
    )
    .optional(),
});
export const RoutineReplayCompileParams = z
  .object({
    routineId: text,
    expectedRevision: z.number().int().positive(),
    sourceRunId: text,
    pageId: text,
    /** Source values are reviewed by the owner and replaced by placeholders before persistence. */
    samples: z.record(z.string().regex(/^[A-Za-z][A-Za-z0-9_]{0,40}$/), z.string().min(1).max(4000)),
  })
  .strict();
export const RoutineReplayTestParams = z
  .object({
    routineId: text,
    expectedRevision: z.number().int().positive(),
    pageId: text,
    parameters: z.record(z.string(), z.string().min(1).max(4000)),
  })
  .strict();
export const RoutineReplayResultParams = z
  .object({
    routineId: text,
    expectedRevision: z.number().int().positive(),
    runId: text,
  })
  .strict();
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
  triggerPageId: text.max(200).optional(),
  triggerDocumentEpoch: z.number().int().nonnegative().optional(),
  status: z.enum([
    "queued",
    "running",
    "waiting_input",
    "completed",
    "failed",
    "cancelled",
    "missed",
    "needs_review",
    "uncertain",
  ]),
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
  // A partial edit must not apply create-time defaults to omitted fields. In
  // particular, changing a trigger must never resume a paused Skill or clear
  // its reviewed task criteria and account grants.
  parameters: RoutineDefinitionSchema.shape.parameters.unwrap().optional(),
  siteOrigins: RoutineDefinitionSchema.shape.siteOrigins.unwrap().optional(),
  accountLabels: RoutineDefinitionSchema.shape.accountLabels.unwrap().optional(),
  calendarGrantIds: RoutineDefinitionSchema.shape.calendarGrantIds.unwrap().optional(),
  autoInject: RoutineDefinitionSchema.shape.autoInject.unwrap().optional(),
  successCriteria: RoutineDefinitionSchema.shape.successCriteria.unwrap().optional(),
  reviewRequired: RoutineDefinitionSchema.shape.reviewRequired.unwrap().optional(),
  consecutive: RoutineDefinitionSchema.shape.consecutive.unwrap().optional(),
  missedRunPolicy: RoutineDefinitionSchema.shape.missedRunPolicy.unwrap().optional(),
  presenceGuardExempt: RoutineDefinitionSchema.shape.presenceGuardExempt.unwrap().optional(),
  trigger: RoutineDefinitionSchema.shape.trigger.unwrap().optional(),
  paused: RoutineDefinitionSchema.shape.paused.unwrap().optional(),
  activationReviewed: z.boolean().optional(),
  routineId: text,
  expectedRevision: z.number().int().positive(),
});
export const RoutineFromResultParams = z
  .object({
    taskId: text,
    runId: text.optional(),
    title: text.max(200).optional(),
    parameters: z.array(RoutineParameterSchema).max(20).optional(),
    trigger: RoutineTriggerSchema.optional(),
    reviewRequired: z.boolean().optional(),
  })
  .strict();
export const RoutineRunParams = z
  .object({
    routineId: text,
    expectedRevision: z.number().int().positive(),
    parameters: z.record(z.string(), z.string().max(4000)).default({}),
  })
  .strict();
export const RoutineAlertSchema = z.object({
  routineRunId: text,
  routineId: text,
  title: text.max(200),
  status: RoutineRunSchema.shape.status,
  reason: z.string().max(1000).optional(),
  triggerKind: z.enum([
    "manual",
    "schedule",
    "monitor",
    "site_notification",
    "page_change",
    "calendar_event",
  ]),
  createdAt: z.number(),
});
export const RoutineInboxItemSchema = z.object({
  run: RoutineRunSchema,
  title: text.max(200),
  workspaceId: text,
  triggerKind: z.enum([
    "manual",
    "schedule",
    "monitor",
    "site_notification",
    "page_change",
    "calendar_event",
  ]),
  readAt: z.number().int().nonnegative().optional(),
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
export type PluginSkillGrant = z.infer<typeof PluginSkillGrantSchema>;
export type RoutineShare = z.infer<typeof RoutineShareSchema>;
export type RoutineShareEnvelope = z.infer<typeof RoutineShareEnvelopeSchema>;
export type RoutineSuggestion = z.infer<typeof RoutineSuggestionSchema>;
export type RoutineParameter = z.infer<typeof RoutineParameterSchema>;
export type RoutineTrigger = z.infer<typeof RoutineTriggerSchema>;
export type RoutineSourceEvent = z.infer<typeof RoutineSourceEventSchema>;
export type RoutineInboxItem = z.infer<typeof RoutineInboxItemSchema>;
export type Routine = z.infer<typeof RoutineSchema>;
export type RoutineRun = z.infer<typeof RoutineRunSchema>;
export type RoutineRunOutcome = z.infer<typeof RoutineRunOutcomeSchema>;
export type RoutineOccurrence = z.infer<typeof RoutineOccurrenceSchema>;

/** Stable identity for one scheduled fire in a timezone. */
export function routineOccurrenceIdentity(routineId: string, timezone: string, scheduledFor: number): string {
  // A repeated wall-clock minute at the fall DST boundary is one scheduled
  // occurrence. The spring gap has no matching minute and is never invented.
  const fields = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(scheduledFor))
      .map((part) => [part.type, part.value]),
  );
  return `${routineId}:${timezone}:${fields.year}-${fields.month}-${fields.day}T${fields.hour}:${fields.minute}`;
}

/** A wall-clock minute has one identity on fall-back day; a nonexistent spring-forward minute is skipped. */
export const scheduleOccurrenceIdentity = routineOccurrenceIdentity;
