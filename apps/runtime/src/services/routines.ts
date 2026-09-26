import { createHash, randomUUID } from "node:crypto";
import type { z } from "zod";
import {
  routineOccurrenceIdentity,
  AuxError,
  type Routine,
  type RoutineSuggestion,
  type RoutineAlert,
  type RoutineCompare,
  RoutineShareSchema,
  RoutineRunOutcomeSchema,
  RoutineSourceEventSchema,
  RoutineSchema,
  type RoutineRun,
  type RoutineRunOutcome,
  type RoutineInboxItem,
  type RoutineSourceEvent,
  type RoutineShare,
  type RoutineTrigger,
  type Run,
} from "@aux/contracts";
import type { EventBus } from "../events.js";
import type { Repo } from "../store/repo.js";
import type { TaskEvidenceService } from "./task-evidence.js";
import { readSkillDocument, serializeSkillDocument } from "./skill-document.js";

function parseRoutine(row: {
  json: string;
  revision: number;
  paused: number;
  archived_at: number | null;
  updated_at: number;
  routine_id: string;
  workspace_id: string;
}): Routine {
  const body = JSON.parse(row.json) as Omit<
    Routine,
    "routineId" | "revision" | "updatedAt" | "paused" | "archivedAt"
  >;
  return RoutineSchema.parse({
    ...body,
    routineId: row.routine_id,
    workspaceId: row.workspace_id,
    revision: row.revision,
    paused: row.paused === 1,
    archivedAt: row.archived_at ?? undefined,
    updatedAt: row.updated_at,
  });
}

function parseRun(row: Record<string, unknown>): RoutineRun {
  return {
    routineRunId: String(row.routine_run_id),
    routineId: String(row.routine_id),
    revision: Number(row.revision),
    occurrenceId: row.occurrence_id ? String(row.occurrence_id) : undefined,
    occurrenceIdentity: row.occurrence_identity ? String(row.occurrence_identity) : undefined,
    status: row.status as RoutineRun["status"],
    reason: row.reason ? String(row.reason) : undefined,
    chatId: row.chat_id ? String(row.chat_id) : undefined,
    runId: row.run_id ? String(row.run_id) : undefined,
    parameters: row.parameters ? (JSON.parse(String(row.parameters)) as Record<string, string>) : {},
    startedAt: row.started_at == null ? undefined : Number(row.started_at),
    endedAt: row.ended_at == null ? undefined : Number(row.ended_at),
    createdAt: Number(row.created_at),
  };
}

function weekdayInZone(at: number, timezone: string): number {
  const day = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: timezone }).format(new Date(at));
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(day);
}

function hourMinuteInZone(at: number, timezone: string): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: timezone,
  }).formatToParts(new Date(at));
  return {
    hour: Number(parts.find((part) => part.type === "hour")?.value ?? 0),
    minute: Number(parts.find((part) => part.type === "minute")?.value ?? 0),
  };
}

export function nextScheduledTime(
  trigger: Extract<RoutineTrigger, { kind: "schedule" }>,
  from: number,
): number {
  for (let offset = 0; offset < 14 * 24 * 60; offset++) {
    const candidate = from + offset * 60_000;
    const day = weekdayInZone(candidate, trigger.timezone);
    const { hour, minute } = hourMinuteInZone(candidate, trigger.timezone);
    if (trigger.days.includes(day) && hour === trigger.hour && minute === trigger.minute) {
      const occurrence = candidate - (candidate % 60_000);
      if (occurrence >= from) return occurrence;
    }
  }
  throw new AuxError("invalid_params", "Could not compute the next scheduled occurrence.");
}

export function previousScheduledTime(
  trigger: Extract<RoutineTrigger, { kind: "schedule" }>,
  from: number,
): number {
  for (let offset = 0; offset < 14 * 24 * 60; offset++) {
    const candidate = from - offset * 60_000;
    const day = weekdayInZone(candidate, trigger.timezone);
    const { hour, minute } = hourMinuteInZone(candidate, trigger.timezone);
    if (trigger.days.includes(day) && hour === trigger.hour && minute === trigger.minute)
      return candidate - (candidate % 60_000);
  }
  throw new AuxError("invalid_params", "Could not compute the previous scheduled occurrence.");
}

export class RoutineService {
  /** Only records present when this service starts can be abandoned dispatches. */
  private readonly orphanedDispatches: Set<string>;
  constructor(
    private repo: Repo,
    private events: EventBus,
    private startWork?: (
      routine: Routine,
      parameters: Record<string, string>,
    ) =>
      | Promise<{ chatId?: string; runId?: string } | { chatId?: string; runId?: string }>
      | { chatId?: string; runId?: string },
  ) {
    this.orphanedDispatches = new Set(
      (
        this.repo.db
          .prepare(
            "SELECT routine_run_id FROM routine_runs WHERE run_id IS NULL AND status IN ('queued','running')",
          )
          .all() as { routine_run_id: string }[]
      ).map((row) => row.routine_run_id),
    );
  }

  list(
    opts: { workspaceId?: string; query?: string; includeArchived?: boolean; limit?: number } = {},
  ): Routine[] {
    const limit = opts.limit ?? 50;
    const rows = this.repo.db
      .prepare(
        `SELECT * FROM routines
      WHERE (? IS NULL OR workspace_id=?) AND (?=1 OR archived_at IS NULL)
      AND (?='' OR instr(lower(coalesce(json_extract(json,'$.title'),'') || ' ' || coalesce(json_extract(json,'$.objective'),'') || ' ' || coalesce(json_extract(json,'$.outputHint'),'')), lower(?))>0)
      ORDER BY updated_at DESC LIMIT ?`,
      )
      .all(
        opts.workspaceId ?? null,
        opts.workspaceId ?? null,
        opts.includeArchived ? 1 : 0,
        opts.query?.trim() ?? "",
        opts.query?.trim() ?? "",
        limit,
      ) as Parameters<typeof parseRoutine>[0][];
    return rows.map(parseRoutine);
  }

  /** Context is a hint to the human; no suggestion can enqueue or start a run. */
  suggest(input: {
    workspaceId?: string;
    text?: string;
    pageUrl?: string;
    limit?: number;
  }): RoutineSuggestion[] {
    const words = (value: string) =>
      ` ${value
        .normalize("NFKC")
        .toLocaleLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .trim()} `;
    const context = words(input.text ?? "");
    let page: URL | undefined;
    try {
      if (input.pageUrl) page = new URL(input.pageUrl);
    } catch {
      /* an invalid page context cannot match */
    }
    if (page && !["http:", "https:"].includes(page.protocol)) page = undefined;
    return this.list({ workspaceId: input.workspaceId, limit: 200 })
      .filter((routine) => !routine.paused && !!routine.sourceTaskId)
      .map((routine) => {
        const reasons: RoutineSuggestion["reasons"] = [];
        if (context.trim() && routine.autoInject.keywords.some((keyword) => context.includes(words(keyword))))
          reasons.push("keyword");
        if (
          page &&
          routine.autoInject.urls.some((pattern) => {
            try {
              const rule = new URL(pattern);
              if (!["http:", "https:"].includes(rule.protocol) || page!.origin !== rule.origin) return false;
              const prefix = rule.pathname.replace(/\/$/, "");
              return !prefix || page!.pathname === prefix || page!.pathname.startsWith(`${prefix}/`);
            } catch {
              return false;
            }
          })
        )
          reasons.push("url");
        return { routine, reasons };
      })
      .filter((item) => item.reasons.length)
      .sort((a, b) => b.reasons.length - a.reasons.length || b.routine.updatedAt - a.routine.updatedAt)
      .slice(0, input.limit ?? 5)
      .map(({ routine, reasons }) => ({ routineId: routine.routineId, title: routine.title, reasons }));
  }

  get(routineId: string): { routine: Routine; runs: RoutineRun[] } {
    return { routine: this.routine(routineId), runs: this.runs(routineId) };
  }

  outcome(routineRunId: string, evidence: TaskEvidenceService): RoutineRunOutcome {
    this.sync();
    const run = this.runById(routineRunId);
    const row = this.repo.db
      .prepare("SELECT json FROM routine_revisions WHERE routine_id=? AND revision=?")
      .get(run.routineId, run.revision) as { json: string } | undefined;
    if (!row) throw new AuxError("not_found", "The saved Skill revision for this run is unavailable.");
    const definition = RoutineSchema.parse(JSON.parse(row.json));
    const result =
      definition.sourceTaskId && definition.sourceTaskRevision
        ? evidence.runCriteria(
            definition.sourceTaskId,
            definition.sourceTaskRevision,
            run.runId,
            definition.successCriteria,
          )
        : {
            linkedRunFound: false,
            criteria: definition.successCriteria.map((criterion) => ({
              criterion,
              status: "unverified" as const,
              evidence: [],
            })),
          };
    return RoutineRunOutcomeSchema.parse({
      run,
      sourceTaskId: definition.sourceTaskId,
      sourceTaskRevision: definition.sourceTaskRevision,
      ...result,
    });
  }

  create(
    input: Omit<RoutineDefinition, "successCriteria" | "calendarGrantIds" | "autoInject"> & {
      successCriteria?: Routine["successCriteria"];
      calendarGrantIds?: string[];
      autoInject?: Routine["autoInject"];
    },
  ): Routine {
    this.requireWorkspace(input.workspaceId);
    const source = input.sourceTaskId
      ? this.requireSourceTask(input.sourceTaskId, input.workspaceId)
      : undefined;
    const now = Date.now();
    const routine: Routine = {
      ...input,
      sourceTaskRevision: source?.revision,
      parameters: input.parameters ?? [],
      siteOrigins: input.siteOrigins ?? [],
      accountLabels: input.accountLabels ?? [],
      calendarGrantIds: input.calendarGrantIds ?? [],
      autoInject: input.autoInject ?? { keywords: [], urls: [] },
      successCriteria: input.successCriteria ?? [],
      reviewRequired: input.reviewRequired ?? input.trigger?.kind !== "monitor",
      consecutive: input.consecutive ?? false,
      trigger: input.trigger ?? { kind: "manual" },
      paused: input.sourceTaskId ? (input.paused ?? false) : true,
      routineId: randomUUID(),
      revision: 1,
      createdAt: now,
      updatedAt: now,
    };
    this.requireCalendarGrants(routine);
    this.requireTriggerAuthority(routine);
    this.insert(routine);
    this.events.emit("routine.updated", { routine });
    return routine;
  }

  fromResult(input: {
    taskId: string;
    runId?: string;
    title?: string;
    parameters?: Routine["parameters"];
    trigger?: RoutineTrigger;
    reviewRequired?: boolean;
  }): Routine {
    const taskRow = this.repo.db
      .prepare("SELECT json,workspace_id FROM tasks WHERE task_id=?")
      .get(input.taskId) as { json: string; workspace_id: string } | undefined;
    if (!taskRow) throw new AuxError("not_found", "Save a task before turning it into a routine.");
    const task = JSON.parse(taskRow.json) as {
      title: string;
      objective: string;
      criteria: Routine["successCriteria"];
      resources?: { kind: string; locator: string }[];
    };
    const run = input.runId
      ? this.repo.getRun(input.runId)
      : (() => {
          const row = this.repo.db
            .prepare(
              "SELECT run_id FROM runs WHERE json_extract(config,'$.taskId')=? ORDER BY created_at DESC LIMIT 1",
            )
            .get(input.taskId) as { run_id: string } | undefined;
          return row ? this.repo.getRun(row.run_id) : undefined;
        })();
    if (input.runId && (!run || run.config?.taskId !== input.taskId))
      throw new AuxError("conflict", "Choose a run from this saved task before making a Skill.");
    const origins = [
      ...new Set(
        (task.resources ?? []).flatMap((resource) => {
          try {
            return resource.kind === "url" ? [new URL(resource.locator).origin] : [];
          } catch {
            return [];
          }
        }),
      ),
    ];
    return this.create({
      title: (input.title ?? task.title).slice(0, 200),
      objective: task.objective,
      description: task.objective.slice(0, 2000),
      workspaceId: taskRow.workspace_id,
      sourceTaskId: input.taskId,
      sourceRunId: run?.runId,
      parameters: input.parameters ?? [],
      siteOrigins: origins.slice(0, 20),
      accountLabels: [],
      calendarGrantIds: this.activeCalendarGrantIds(
        input.taskId,
        this.requireSourceTask(input.taskId, taskRow.workspace_id).revision,
      ),
      successCriteria: task.criteria ?? [],
      consecutive: false,
      paused: false,
      trigger: input.trigger ?? { kind: "manual" },
      reviewRequired: input.reviewRequired ?? input.trigger?.kind !== "monitor",
    });
  }

  update(input: Partial<RoutineDefinition> & { routineId: string; expectedRevision: number }): Routine {
    const current = this.routine(input.routineId);
    if (current.revision !== input.expectedRevision)
      throw new AuxError("conflict", "This routine changed. Refresh and try again.");
    const next: Routine = {
      ...current,
      ...input,
      parameters: input.parameters ?? current.parameters,
      siteOrigins: input.siteOrigins ?? current.siteOrigins,
      accountLabels: input.accountLabels ?? current.accountLabels,
      calendarGrantIds:
        input.calendarGrantIds ??
        (input.sourceTaskId !== undefined || input.sourceTaskRevision !== undefined
          ? []
          : current.calendarGrantIds),
      autoInject: input.autoInject ?? current.autoInject,
      successCriteria: input.successCriteria ?? current.successCriteria,
      sourceRunId:
        input.sourceRunId ??
        (input.sourceTaskId && input.sourceTaskId !== current.sourceTaskId ? undefined : current.sourceRunId),
      trigger: input.trigger ?? current.trigger,
      revision: current.revision + 1,
      updatedAt: Date.now(),
    };
    this.requireWorkspace(next.workspaceId);
    const source = next.sourceTaskId
      ? this.requireSourceTask(next.sourceTaskId, next.workspaceId, input.sourceTaskId !== undefined)
      : undefined;
    if (input.sourceTaskRevision !== undefined && input.sourceTaskRevision !== source?.revision)
      throw new AuxError("conflict", "The source task changed. Refresh and review its scope again.");
    if (input.sourceTaskId !== undefined || input.sourceTaskRevision !== undefined) {
      next.sourceTaskRevision = source?.revision;
      if (input.sourceTaskRevision !== undefined) this.requireCriteriaMatch(next);
    }
    if (!next.sourceTaskId && !next.paused)
      throw new AuxError("conflict", "Choose a saved task before resuming this routine.");
    this.requireCalendarGrants(next);
    this.requireTriggerAuthority(next);
    this.persist(next);
    if (input.trigger) this.repo.deleteSetting(`routinePageDigest:${next.routineId}`);
    this.events.emit("routine.updated", { routine: next });
    return next;
  }

  pause(routineId: string, expectedRevision: number, paused: boolean): Routine {
    return this.update({ routineId, expectedRevision, paused });
  }

  archive(routineId: string, expectedRevision: number, archived: boolean): Routine {
    const current = this.routine(routineId);
    if (current.revision !== expectedRevision)
      throw new AuxError("conflict", "This routine changed. Refresh and try again.");
    const next: Routine = {
      ...current,
      revision: current.revision + 1,
      updatedAt: Date.now(),
      archivedAt: archived ? Date.now() : undefined,
    };
    this.persist(next);
    this.events.emit("routine.updated", { routine: next });
    return next;
  }

  /** Portable definitions for sharing or backup; ids, revisions and timestamps are dropped. */
  exportRoutines(routineIds?: string[]): { format: "aux-routine@1"; routines: RoutineShare[] } {
    const picked = routineIds?.length
      ? routineIds.map((id) => this.routine(id))
      : this.list({ includeArchived: false, limit: 500 });
    const workspaceNames = new Map<string, string>();
    const nameOf = (workspaceId: string) => {
      let name = workspaceNames.get(workspaceId);
      if (name === undefined) {
        const row = this.repo.db
          .prepare("SELECT name FROM workspaces WHERE workspace_id=?")
          .get(workspaceId) as { name: string } | undefined;
        name = row?.name ?? "";
        workspaceNames.set(workspaceId, name);
      }
      return name;
    };
    return {
      format: "aux-routine@1",
      routines: picked.map((routine) => {
        // parse drops the machine-local fields (ids, revision, timestamps)
        const share = RoutineShareSchema.parse(routine);
        const workspaceName = nameOf(routine.workspaceId);
        return { ...share, ...(workspaceName ? { workspaceName } : {}) };
      }),
    };
  }

  exportSkillDocument(routineId: string): { filename: "SKILL.md"; content: string } {
    const share = this.exportRoutines([routineId]).routines[0]!;
    return { filename: "SKILL.md", content: serializeSkillDocument(share) };
  }

  async importSkillDocument(
    path: string,
    workspaceId: string,
  ): Promise<{ imported: number; skipped: number; routineIds: string[] }> {
    return this.importRoutines([await readSkillDocument(path)], workspaceId);
  }

  /**
   * Recreates shared routines in one Space. A routine is skipped when the
   * target already holds one with the same title and objective — imports are
   * safe to repeat.
   */
  importRoutines(
    routines: z.input<typeof RoutineShareSchema>[],
    workspaceId?: string,
  ): { ok: true; imported: number; skipped: number; routineIds: string[] } {
    const target = workspaceId ?? this.resolveWorkspace(routines[0]?.workspaceName);
    this.requireWorkspace(target);
    const existing = new Set(
      this.list({ workspaceId: target, includeArchived: true, limit: 500 }).map(
        (r) => `${r.title}\n${r.objective}`,
      ),
    );
    const routineIds: string[] = [];
    let skipped = 0;
    for (const share of routines) {
      const key = `${share.title}\n${share.objective}`;
      if (existing.has(key)) {
        skipped += 1;
        continue;
      }
      const { workspaceName: _ignored, ...definition } = RoutineShareSchema.parse(share);
      // Shared definitions are inert until a local task is chosen in Aux.
      const created = this.create({
        ...definition,
        workspaceId: target,
        trigger: { kind: "manual" },
        paused: true,
        reviewRequired: true,
        accountLabels: [],
      });
      routineIds.push(created.routineId);
      existing.add(key);
    }
    return { ok: true, imported: routineIds.length, skipped, routineIds };
  }

  async run(
    input: { routineId: string; expectedRevision: number; parameters?: Record<string, string> },
    occurrence?: { occurrenceId: string; identity: string; scheduledFor: number },
  ): Promise<RoutineRun> {
    this.sync();
    const routine = this.routine(input.routineId);
    if (routine.revision !== input.expectedRevision)
      throw new AuxError("conflict", "This routine changed. Refresh and try again.");
    if (routine.paused) throw new AuxError("conflict", "Resume this routine before running it.");
    if (routine.archivedAt) throw new AuxError("conflict", "Restore this routine before running it.");
    if (!routine.sourceTaskId)
      throw new AuxError("conflict", "Choose a saved task for this routine before running it.");
    const source = this.requireSourceTask(routine.sourceTaskId, routine.workspaceId);
    if (source.revision !== routine.sourceTaskRevision)
      throw new AuxError(
        "conflict",
        "The source task changed. Review and sync this Skill before running it.",
      );
    this.requireCriteriaMatch(routine);
    this.requireCalendarGrants(routine);
    this.requireTriggerAuthority(routine);
    const uncertain = this.repo.db
      .prepare("SELECT 1 FROM routine_runs WHERE routine_id=? AND status='uncertain' LIMIT 1")
      .get(routine.routineId);
    if (uncertain)
      throw new AuxError(
        "conflict",
        "Reconcile the previous uncertain write before running this routine again.",
      );
    const active = this.repo.db
      .prepare(
        "SELECT 1 FROM routine_runs WHERE routine_id=? AND status IN ('queued','running','needs_review') LIMIT 1",
      )
      .get(routine.routineId);
    if (active && !routine.consecutive)
      throw new AuxError("conflict", "This routine is already in progress. Wait or review the open run.");
    const declared = new Set(routine.parameters.map((item) => item.name));
    for (const name of Object.keys(input.parameters ?? {}))
      if (!declared.has(name)) throw new AuxError("invalid_params", `Unknown routine parameter: ${name}.`);
    const parameters = {
      ...Object.fromEntries(routine.parameters.map((item) => [item.name, item.value ?? ""])),
      ...input.parameters,
    };
    for (const item of routine.parameters)
      if (parameters[item.name] === undefined || parameters[item.name] === "")
        throw new AuxError("invalid_params", `Set the ${item.label} parameter.`);
    const now = Date.now();
    const record: RoutineRun = {
      routineRunId: randomUUID(),
      routineId: routine.routineId,
      revision: routine.revision,
      occurrenceId: occurrence?.occurrenceId,
      occurrenceIdentity: occurrence?.identity,
      status: routine.reviewRequired && occurrence ? "needs_review" : "queued",
      reason:
        routine.reviewRequired && occurrence ? "Scheduled work needs review before it writes." : undefined,
      parameters,
      createdAt: now,
    };
    this.insertRun(record);
    this.events.emit("routine.updated", { routine, run: record });
    if (record.status === "needs_review") return record;
    return this.dispatch(record, routine);
  }

  async reconcile(
    routineRunId: string,
    outcome: "applied" | "not_applied",
    note: string,
  ): Promise<RoutineRun> {
    const reviewNote = note.trim();
    if (!reviewNote || reviewNote.length > 1000)
      throw new AuxError("invalid_params", "Add a review note up to 1,000 characters.");
    this.sync();
    const record = this.runById(routineRunId);
    if (record.status !== "uncertain" && record.status !== "needs_review")
      throw new AuxError("conflict", "Only uncertain or waiting runs can be reconciled.");
    const routine = this.routine(record.routineId);
    if (outcome === "not_applied") {
      const next = { ...record, status: "cancelled" as const, reason: reviewNote, endedAt: Date.now() };
      this.updateRun(next);
      this.events.emit("routine.updated", { routine, run: next });
      return next;
    }
    if (record.status === "needs_review") return this.dispatch({ ...record, reason: reviewNote }, routine);
    const next = { ...record, status: "completed" as const, reason: reviewNote, endedAt: Date.now() };
    this.updateRun(next);
    this.events.emit("routine.updated", { routine, run: next });
    this.autoPauseIfNeeded(routine, next);
    return next;
  }

  runs(routineId: string, limit = 30): RoutineRun[] {
    this.sync();
    return (
      this.repo.db
        .prepare("SELECT * FROM routine_runs WHERE routine_id=? ORDER BY created_at DESC LIMIT ?")
        .all(routineId, limit) as Record<string, unknown>[]
    ).map(parseRun);
  }

  async due(now = Date.now()): Promise<RoutineRun[]> {
    this.sync();
    const created: RoutineRun[] = [];
    for (const routine of this.list({ includeArchived: false, limit: 200 })) {
      if (routine.paused || routine.trigger.kind === "manual") continue;
      if (routine.trigger.kind === "schedule") {
        const last = this.repo.db
          .prepare(
            "SELECT max(created_at) AS at FROM routine_runs WHERE routine_id=? AND occurrence_identity IS NOT NULL",
          )
          .get(routine.routineId) as { at: number | null };
        const lowerBound = Math.max(routine.createdAt, last.at ?? 0, now - 14 * 24 * 60 * 60_000);
        const pending: number[] = [];
        let cursor = now;
        for (let count = 0; count < 100; count++) {
          const scheduledFor = previousScheduledTime(routine.trigger, cursor);
          if (scheduledFor < lowerBound) break;
          pending.push(scheduledFor);
          cursor = scheduledFor - 60_000;
        }
        for (const scheduledFor of pending.reverse()) {
          const identity = routineOccurrenceIdentity(
            routine.routineId,
            routine.trigger.timezone,
            scheduledFor,
          );
          if (this.hasOccurrence(identity)) continue;
          if (Math.abs(now - scheduledFor) <= 90_000) {
            created.push(await this.startOccurrence(routine, identity, scheduledFor));
          } else {
            created.push(
              this.recordMissed(
                routine,
                identity,
                "Missed scheduled run. Consequential work was not started automatically.",
              ),
            );
          }
        }
      } else if (routine.trigger.kind === "monitor") {
        const identity = routineOccurrenceIdentity(
          routine.routineId,
          routine.trigger.timezone,
          Math.floor(now / (routine.trigger.intervalMinutes * 60_000)) *
            routine.trigger.intervalMinutes *
            60_000,
        );
        if (this.hasOccurrence(identity)) continue;
        const missed = this.recentMissedMonitors(routine.routineId);
        const record = await this.startOccurrence(routine, identity, now);
        if (missed > 0 && record.status !== "missed") {
          record.reason = `Coalesced ${missed + 1} missed read-only checks into one run.`;
          this.updateRun(record);
          this.events.emit("routine.updated", { routine, run: record });
        }
        created.push(record);
      }
    }
    return created;
  }

  /** Trusted host observations only. Event bodies and page text are never stored here. */
  async ingestEvent(raw: RoutineSourceEvent, now = Date.now()): Promise<RoutineRun[]> {
    const event = RoutineSourceEventSchema.parse(raw);
    if (event.observedAt > now + 30_000)
      throw new AuxError("invalid_params", "An automation event cannot be from the future.");
    this.sync();
    const created: RoutineRun[] = [];
    const candidates = this.repo.db
      .prepare(
        "SELECT * FROM routines WHERE archived_at IS NULL AND paused=0 AND json_extract(json,'$.trigger.kind')=?",
      )
      .all(event.kind) as Parameters<typeof parseRoutine>[0][];
    for (const row of candidates) {
      const routine = parseRoutine(row);
      if (routine.paused || routine.trigger.kind !== event.kind || !this.eventMatches(routine, event))
        continue;
      if (event.kind === "page_change" && routine.trigger.kind === "page_change") {
        const key = `routinePageDigest:${routine.routineId}`;
        const current = {
          url: event.url,
          pageId: event.pageId,
          documentEpoch: event.documentEpoch,
          contentSha256: event.contentSha256,
        };
        const previous = this.repo.getSetting<typeof current>(key);
        if (
          previous?.url !== current.url ||
          previous.pageId !== current.pageId ||
          previous.documentEpoch !== current.documentEpoch
        ) {
          this.repo.setSetting(key, current);
          continue; // First observation is a baseline, never a synthetic change.
        }
        if (previous.contentSha256 === current.contentSha256) continue;
        this.repo.setSetting(key, current);
        const last = this.repo.db
          .prepare(
            "SELECT created_at FROM routine_runs WHERE routine_id=? AND occurrence_identity IS NOT NULL ORDER BY created_at DESC LIMIT 1",
          )
          .get(routine.routineId) as { created_at: number } | undefined;
        if (last && now - last.created_at < routine.trigger.minimumIntervalMinutes * 60_000) continue;
      }
      const sourceKey =
        event.kind === "calendar_event"
          ? [event.kind, event.grantId, event.calendarId, event.eventId, event.startAt]
          : [event.kind, event.kind === "site_notification" ? event.origin : event.pageId, event.eventId];
      const identity = `${routine.routineId}:event:${createHash("sha256").update(JSON.stringify(sourceKey)).digest("hex")}`;
      if (this.hasOccurrence(identity)) continue;
      const dueAt =
        event.kind === "calendar_event" && routine.trigger.kind === "calendar_event"
          ? event.startAt - routine.trigger.beforeMinutes * 60_000
          : event.observedAt;
      if (dueAt > now + 30_000) continue;
      if (now - dueAt > 5 * 60_000) {
        created.push(
          this.recordMissed(
            routine,
            identity,
            "Event occurred while Aux was closed or the automation was unavailable; work was not replayed.",
          ),
        );
        continue;
      }
      created.push(await this.startOccurrence(routine, identity, dueAt));
    }
    return created;
  }

  /** One inbox row per automation occurrence, including completed results and missed fires. */
  inbox(opts: { workspaceId?: string; limit?: number; unreadOnly?: boolean } = {}): RoutineInboxItem[] {
    this.sync();
    const limit = Math.min(100, Math.max(1, opts.limit ?? 50));
    const rows = this.repo.db
      .prepare(
        `SELECT rr.*,r.workspace_id,coalesce(rev.json,r.json) AS routine_json,k.value AS read_at
      FROM routine_runs rr JOIN routines r ON r.routine_id=rr.routine_id
      LEFT JOIN routine_revisions rev ON rev.routine_id=rr.routine_id AND rev.revision=rr.revision
      LEFT JOIN kv k ON k.key='setting:routineInboxRead:'||rr.routine_run_id
      WHERE rr.occurrence_identity IS NOT NULL AND (? IS NULL OR r.workspace_id=?)
        AND (?=0 OR k.value IS NULL)
      ORDER BY rr.created_at DESC,rr.routine_run_id DESC LIMIT ?`,
      )
      .all(opts.workspaceId ?? null, opts.workspaceId ?? null, opts.unreadOnly ? 1 : 0, limit) as (Record<
      string,
      unknown
    > & { workspace_id: string; routine_json: string; read_at: string | null })[];
    return rows.map((row) => {
      const definition = JSON.parse(row.routine_json) as { title: string; trigger: RoutineTrigger };
      return {
        run: parseRun(row),
        title: definition.title,
        workspaceId: row.workspace_id,
        triggerKind: definition.trigger.kind,
        ...(row.read_at ? { readAt: Number(JSON.parse(row.read_at)) } : {}),
      };
    });
  }

  markInboxRead(routineRunId: string, now = Date.now()): { readAt: number } {
    const row = this.repo.db
      .prepare("SELECT 1 FROM routine_runs WHERE routine_run_id=? AND occurrence_identity IS NOT NULL")
      .get(routineRunId);
    if (!row) throw new AuxError("not_found", "That automation result was not found.");
    const key = `routineInboxRead:${routineRunId}`;
    const readAt = this.repo.getSetting<number>(key) ?? now;
    this.repo.setSetting(key, readAt);
    return { readAt };
  }

  private eventMatches(routine: Routine, event: RoutineSourceEvent): boolean {
    if (routine.trigger.kind === "site_notification" && event.kind === "site_notification")
      return routine.trigger.origin === event.origin && routine.siteOrigins.includes(event.origin);
    if (routine.trigger.kind === "page_change" && event.kind === "page_change") {
      if (routine.trigger.url !== event.url || !routine.siteOrigins.includes(new URL(event.url).origin))
        return false;
      const page = this.repo.db
        .prepare("SELECT url,epoch,detached,owned FROM pages WHERE page_id=?")
        .get(event.pageId) as { url: string; epoch: number; detached: number; owned: number } | undefined;
      if (
        !page ||
        page.url !== event.url ||
        page.epoch !== event.documentEpoch ||
        page.detached ||
        page.owned
      )
        return false;
      const task = this.repo.db
        .prepare("SELECT json FROM tasks WHERE task_id=?")
        .get(routine.sourceTaskId ?? "") as { json: string } | undefined;
      const resources =
        (task ? (JSON.parse(task.json) as { resources?: { kind: string; locator: string }[] }) : {})
          .resources ?? [];
      return resources.some(
        (resource) =>
          (resource.kind === "page" && resource.locator === event.pageId) ||
          (resource.kind === "url" && resource.locator === event.url),
      );
    }
    if (routine.trigger.kind === "calendar_event" && event.kind === "calendar_event") {
      if (
        routine.trigger.grantId !== event.grantId ||
        !routine.calendarGrantIds.includes(event.grantId) ||
        (routine.trigger.calendarId && routine.trigger.calendarId !== event.calendarId)
      )
        return false;
      return !!this.repo.db
        .prepare(
          `SELECT 1 FROM calendar_task_grants g JOIN calendar_connections c ON c.connection_id=g.connection_id
        WHERE g.grant_id=? AND g.connection_id=? AND g.task_id=? AND g.task_revision=?
          AND g.revoked_at IS NULL AND c.revoked_at IS NULL AND c.state='active'`,
        )
        .get(event.grantId, event.connectionId, routine.sourceTaskId ?? "", routine.sourceTaskRevision ?? 0);
    }
    return false;
  }

  private requireTriggerAuthority(routine: Routine): void {
    if (routine.trigger.kind === "site_notification" && !routine.siteOrigins.includes(routine.trigger.origin))
      throw new AuxError(
        "permission_denied",
        "Add the notification origin to this routine's reviewed site scope.",
      );
    if (
      routine.trigger.kind === "page_change" &&
      !routine.siteOrigins.includes(new URL(routine.trigger.url).origin)
    )
      throw new AuxError(
        "permission_denied",
        "Add the watched page origin to this routine's reviewed site scope.",
      );
    if (
      routine.trigger.kind === "calendar_event" &&
      !routine.calendarGrantIds.includes(routine.trigger.grantId)
    )
      throw new AuxError("permission_denied", "Add the Calendar event's task grant to this routine.");
  }

  private async startOccurrence(
    routine: Routine,
    identity: string,
    scheduledFor: number,
  ): Promise<RoutineRun> {
    try {
      return await this.run(
        { routineId: routine.routineId, expectedRevision: routine.revision, parameters: {} },
        { occurrenceId: randomUUID(), identity, scheduledFor },
      );
    } catch (error) {
      if (!(error instanceof AuxError) || !["conflict", "invalid_params", "needs_input"].includes(error.code))
        throw error;
      // A live or uncertain prior run, a changed task, or missing parameters
      // cannot consume the next occurrence or stall unrelated Skills.
      return this.recordMissed(routine, identity, `Skill occurrence skipped: ${error.message}`);
    }
  }

  alerts(limit = 30): RoutineAlert[] {
    this.sync();
    const rows = this.repo.db
      .prepare(
        `SELECT r.routine_run_id, r.routine_id, r.status, r.reason, r.created_at, t.json
      FROM routine_runs r JOIN routines t ON t.routine_id=r.routine_id
      WHERE (r.status IN ('missed','needs_review','uncertain','failed','waiting_input') OR r.reason LIKE 'Coalesced %' OR (r.status='completed' AND r.occurrence_id IS NOT NULL AND json_extract(t.json,'$.reviewRequired')=1))
      ORDER BY r.created_at DESC LIMIT ?`,
      )
      .all(limit) as {
      routine_run_id: string;
      routine_id: string;
      status: string;
      reason: string | null;
      created_at: number;
      json: string;
    }[];
    return rows.map((row) => {
      const routine = JSON.parse(row.json) as { title: string; trigger?: { kind?: string } };
      return {
        routineRunId: row.routine_run_id,
        routineId: row.routine_id,
        title: routine.title,
        status: row.status as RoutineAlert["status"],
        reason: row.reason ?? undefined,
        triggerKind: (
          ["schedule", "monitor", "site_notification", "page_change", "calendar_event"] as string[]
        ).includes(routine.trigger?.kind ?? "")
          ? (routine.trigger!.kind as RoutineAlert["triggerKind"])
          : "manual",
        createdAt: row.created_at,
      };
    });
  }

  compare(leftRunId: string, rightRunId: string): RoutineCompare {
    this.sync();
    const left = this.runById(leftRunId);
    const right = this.runById(rightRunId);
    if (left.routineId !== right.routineId)
      throw new AuxError("conflict", "Compare two runs of the same routine.");
    const routine = this.routine(left.routineId);
    const sameOccurrence = !!left.occurrenceIdentity && left.occurrenceIdentity === right.occurrenceIdentity;
    const sameParameters = JSON.stringify(left.parameters) === JSON.stringify(right.parameters);
    const statusChanged = left.status !== right.status;
    const summary = [
      `${routine.title}: ${left.status.replaceAll("_", " ")} vs ${right.status.replaceAll("_", " ")}.`,
      sameOccurrence ? "Same scheduled occurrence." : "Different occurrences.",
      sameParameters ? "Parameters match." : "Parameters differ.",
      "This comparison is a local status snapshot. It does not prove a business outcome.",
    ].join(" ");
    return {
      routineId: routine.routineId,
      title: routine.title,
      left,
      right,
      sameOccurrence,
      sameParameters,
      statusChanged,
      summary,
    };
  }

  private async dispatch(record: RoutineRun, routine: Routine): Promise<RoutineRun> {
    // Read-only monitor checks retry a transient dispatch once before failing.
    const attempts = routine.trigger.kind === "monitor" ? 2 : 1;
    let retried = false;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        if (record.revision !== routine.revision)
          throw new AuxError(
            "conflict",
            "This Skill changed after the run was queued. Skip this occurrence and run the current revision.",
          );
        if (!routine.sourceTaskId)
          throw new AuxError("conflict", "Choose a saved task before running this Skill.");
        const source = this.requireSourceTask(routine.sourceTaskId, routine.workspaceId);
        if (source.revision !== routine.sourceTaskRevision)
          throw new AuxError(
            "conflict",
            "The source task changed after this Skill was queued. Review and sync it before running again.",
          );
        this.requireCriteriaMatch(routine);
        this.requireCalendarGrants(routine);
        const started = (await this.startWork?.(routine, record.parameters)) ?? {};
        const next: RoutineRun = {
          ...record,
          status: "running",
          chatId: started.chatId,
          runId: started.runId,
          startedAt: Date.now(),
          ...(retried ? { reason: "Dispatched after a transient read failure." } : {}),
        };
        this.updateRun(next);
        this.events.emit("routine.updated", { routine, run: next });
        return next;
      } catch (error) {
        if (attempt < attempts && this.transient(error)) {
          retried = true;
          await new Promise((resolve) => setTimeout(resolve, 2_000));
          continue;
        }
        const reason = `${error instanceof Error ? error.message : String(error)}${retried ? " — retried once" : ""}`;
        const next = { ...record, status: "failed" as const, reason, endedAt: Date.now() };
        this.updateRun(next);
        this.events.emit("routine.updated", { routine, run: next });
        this.autoPauseIfNeeded(routine, next);
        return next;
      }
    }
    return record;
  }

  private transient(error: unknown): boolean {
    if (error instanceof AuxError)
      return (
        error.code === "backend_unavailable" ||
        error.code === "condition_timeout" ||
        error.code === "model_error" ||
        error.code === "target_detached"
      );
    return true;
  }

  /** Syncs each dispatched routine run with the underlying run's current status. */
  private sync(): void {
    for (const routineRunId of this.orphanedDispatches) {
      const row = this.repo.db
        .prepare(
          "SELECT * FROM routine_runs WHERE routine_run_id=? AND run_id IS NULL AND status IN ('queued','running')",
        )
        .get(routineRunId) as Record<string, unknown> | undefined;
      if (row) {
        const record = parseRun(row);
        const next: RoutineRun = {
          ...record,
          status: "uncertain",
          reason:
            "Aux restarted before this Skill dispatch was linked to an agent run. Check whether work occurred before reconciling; Aux will not retry it automatically.",
          endedAt: Date.now(),
        };
        this.updateRun(next);
        this.events.emit("routine.updated", { routine: this.routine(record.routineId), run: next });
      }
      this.orphanedDispatches.delete(routineRunId);
    }
    const open = this.repo.db
      .prepare(
        "SELECT * FROM routine_runs WHERE run_id IS NOT NULL AND status IN ('queued','running','waiting_input')",
      )
      .all() as Record<string, unknown>[];
    for (const row of open) {
      const record = parseRun(row);
      const run = this.repo.getRun(record.runId!);
      if (!run) continue;
      const next = this.mapRunStatus(record, run);
      if (!next) continue;
      this.updateRun(next);
      const routine = this.routine(record.routineId);
      this.events.emit("routine.updated", { routine, run: next });
      if (["completed", "failed"].includes(next.status)) this.autoPauseIfNeeded(routine, next);
    }
  }

  private autoPauseIfNeeded(routine: Routine, record: RoutineRun): void {
    if (routine.trigger.kind === "manual" || routine.paused || routine.archivedAt) return;
    const recent = this.repo.db
      .prepare(
        "SELECT status FROM routine_runs WHERE routine_id=? AND status IN ('completed','failed') ORDER BY created_at DESC,routine_run_id DESC LIMIT 3",
      )
      .all(routine.routineId) as { status: string }[];
    const repeatedFailure = recent.length === 3 && recent.every((row) => row.status === "failed");
    const spend = Number(
      (
        this.repo.db
          .prepare(
            `SELECT coalesce(sum(coalesce(m.cost_usd,0)),0) AS usd
      FROM model_calls m JOIN routine_runs rr ON rr.run_id=m.run_id WHERE rr.routine_id=?`,
          )
          .get(routine.routineId) as { usd: number }
      ).usd,
    );
    const overCap = spend >= (routine.spendCapUsd ?? 50);
    if (!repeatedFailure && !overCap) return;
    const reason = repeatedFailure
      ? "Auto-paused after three failed runs. Review the source task and results before resuming."
      : `Auto-paused after reaching its $${(routine.spendCapUsd ?? 50).toFixed(2)} model spend cap.`;
    const paused: Routine = {
      ...routine,
      paused: true,
      revision: routine.revision + 1,
      updatedAt: Date.now(),
    };
    this.persist(paused);
    const updated = {
      ...record,
      reason: `${record.reason ? `${record.reason} ` : ""}${reason}`.slice(0, 1000),
    };
    this.updateRun(updated);
    this.events.emit("routine.updated", { routine: paused, run: updated });
  }

  private mapRunStatus(record: RoutineRun, run: Run): RoutineRun | undefined {
    const endedAt = run.endedAt ?? Date.now();
    switch (run.status) {
      case "completed":
        return {
          ...record,
          status: "completed",
          reason: record.status === "waiting_input" ? undefined : record.reason,
          endedAt,
        };
      case "partially_completed":
        return {
          ...record,
          status: "completed",
          reason: "The run partially completed — review its results.",
          endedAt,
        };
      case "failed":
        return { ...record, status: "failed", reason: run.statusMessage ?? "The run failed.", endedAt };
      case "cancelled":
        return { ...record, status: "cancelled", endedAt };
      case "interrupted":
        return { ...record, status: "failed", reason: "The run was interrupted by a restart.", endedAt };
      case "needs_input":
        return record.status === "waiting_input"
          ? undefined
          : { ...record, status: "waiting_input", reason: "The run is waiting for input." };
      default:
        return record.status === "waiting_input"
          ? { ...record, status: "running", reason: undefined }
          : undefined;
    }
  }

  private recordMissed(routine: Routine, identity: string, reason: string): RoutineRun {
    const record: RoutineRun = {
      routineRunId: randomUUID(),
      routineId: routine.routineId,
      revision: routine.revision,
      occurrenceIdentity: identity,
      status: "missed",
      reason,
      parameters: {},
      createdAt: Date.now(),
      endedAt: Date.now(),
    };
    this.insertRun(record);
    this.events.emit("routine.updated", { routine, run: record });
    return record;
  }

  private hasOccurrence(identity: string): boolean {
    return !!this.repo.db.prepare("SELECT 1 FROM routine_runs WHERE occurrence_identity=?").get(identity);
  }

  private recentMissedMonitors(routineId: string): number {
    return (
      this.repo.db
        .prepare(
          "SELECT count(*) AS n FROM routine_runs WHERE routine_id=? AND status='missed' AND created_at>?",
        )
        .get(routineId, Date.now() - 24 * 60 * 60_000) as { n: number }
    ).n;
  }

  private routine(routineId: string): Routine {
    const row = this.repo.db.prepare("SELECT * FROM routines WHERE routine_id=?").get(routineId) as
      Parameters<typeof parseRoutine>[0] | undefined;
    if (!row) throw new AuxError("not_found", "That routine was not found.");
    return parseRoutine(row);
  }

  private runById(id: string): RoutineRun {
    const row = this.repo.db.prepare("SELECT * FROM routine_runs WHERE routine_run_id=?").get(id) as
      Record<string, unknown> | undefined;
    if (!row) throw new AuxError("not_found", "That routine run was not found.");
    return parseRun(row);
  }

  private resolveWorkspace(workspaceName?: string): string {
    if (!workspaceName) {
      const first = this.repo.db
        .prepare("SELECT workspace_id FROM workspaces ORDER BY created_at,workspace_id LIMIT 1")
        .get() as { workspace_id: string } | undefined;
      if (first) return first.workspace_id;
      throw new AuxError("not_found", "Create a Space before importing routines.");
    }
    const row = this.repo.db
      .prepare("SELECT workspace_id FROM workspaces WHERE name=?")
      .get(workspaceName) as { workspace_id: string } | undefined;
    if (row) return row.workspace_id;
    throw new AuxError(
      "not_found",
      `No Space named "${workspaceName}" — pass workspaceId to choose where the routines land.`,
    );
  }

  private requireWorkspace(workspaceId: string) {
    if (!this.repo.db.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(workspaceId))
      throw new AuxError("not_found", "Choose a Space for this routine.");
  }

  private requireSourceTask(taskId: string, workspaceId: string, requireOpen = true): { revision: number } {
    const row = this.repo.db
      .prepare("SELECT workspace_id,state,revision FROM tasks WHERE task_id=?")
      .get(taskId) as { workspace_id: string; state: string; revision: number } | undefined;
    if (!row || row.workspace_id !== workspaceId || (requireOpen && row.state !== "open"))
      throw new AuxError("conflict", "Choose an open saved task in this Space for the routine.");
    return { revision: row.revision };
  }

  private requireCriteriaMatch(routine: Routine) {
    if (!routine.successCriteria.length) return;
    const row = this.repo.db.prepare("SELECT json FROM tasks WHERE task_id=?").get(routine.sourceTaskId!) as {
      json: string;
    };
    const task = JSON.parse(row.json) as { criteria: Routine["successCriteria"] };
    if (
      task.criteria.length !== routine.successCriteria.length ||
      task.criteria.some((item, index) => {
        const expected = routine.successCriteria[index];
        return (
          !expected ||
          item.criterionId !== expected.criterionId ||
          item.description !== expected.description ||
          item.verification !== expected.verification
        );
      })
    )
      throw new AuxError(
        "conflict",
        "The source task's success criteria changed. Review and sync this Skill before running it.",
      );
  }

  private activeCalendarGrantIds(taskId: string, revision: number): string[] {
    return (
      this.repo.db
        .prepare(
          `SELECT g.grant_id AS grantId FROM calendar_task_grants g
      JOIN calendar_connections c ON c.connection_id=g.connection_id
      WHERE g.task_id=? AND g.task_revision=? AND g.revoked_at IS NULL AND c.revoked_at IS NULL
      ORDER BY g.created_at,g.grant_id`,
        )
        .all(taskId, revision) as { grantId: string }[]
    ).map((row) => row.grantId);
  }

  private requireCalendarGrants(routine: Routine): void {
    if (!routine.calendarGrantIds.length) return;
    if (!routine.sourceTaskId || !routine.sourceTaskRevision)
      throw new AuxError("conflict", "Bind a saved task before selecting Calendar accounts for this Skill.");
    const active = new Set(this.activeCalendarGrantIds(routine.sourceTaskId, routine.sourceTaskRevision));
    if (routine.calendarGrantIds.some((id) => !active.has(id)))
      throw new AuxError(
        "conflict",
        "A selected Calendar grant is no longer available for this task revision. Review this Skill's accounts.",
      );
    const unavailable = this.repo.db
      .prepare(
        `SELECT 1 FROM calendar_task_grants g
      JOIN calendar_connections c ON c.connection_id=g.connection_id
      WHERE g.grant_id IN (${routine.calendarGrantIds.map(() => "?").join(",")}) AND c.state<>'active' LIMIT 1`,
      )
      .get(...routine.calendarGrantIds);
    if (unavailable)
      throw new AuxError("needs_input", "Reconnect a selected Calendar account before running this Skill.");
  }

  private insert(routine: Routine) {
    const json = JSON.stringify(routine);
    this.repo.db
      .prepare(
        "INSERT INTO routines(routine_id,workspace_id,revision,paused,archived_at,updated_at,json) VALUES(?,?,?,?,?,?,?)",
      )
      .run(
        routine.routineId,
        routine.workspaceId,
        routine.revision,
        routine.paused ? 1 : 0,
        routine.archivedAt ?? null,
        routine.updatedAt,
        json,
      );
    this.repo.db
      .prepare("INSERT INTO routine_revisions(routine_id,revision,json) VALUES(?,?,?)")
      .run(routine.routineId, routine.revision, json);
  }

  private persist(routine: Routine) {
    const json = JSON.stringify(routine);
    this.repo.db
      .prepare(
        "UPDATE routines SET workspace_id=?,revision=?,paused=?,archived_at=?,updated_at=?,json=? WHERE routine_id=?",
      )
      .run(
        routine.workspaceId,
        routine.revision,
        routine.paused ? 1 : 0,
        routine.archivedAt ?? null,
        routine.updatedAt,
        json,
        routine.routineId,
      );
    this.repo.db
      .prepare("INSERT INTO routine_revisions(routine_id,revision,json) VALUES(?,?,?)")
      .run(routine.routineId, routine.revision, json);
  }

  private insertRun(run: RoutineRun) {
    this.repo.db
      .prepare(
        "INSERT INTO routine_runs(routine_run_id,routine_id,revision,occurrence_id,occurrence_identity,status,reason,chat_id,run_id,parameters,started_at,ended_at,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
      )
      .run(
        run.routineRunId,
        run.routineId,
        run.revision,
        run.occurrenceId ?? null,
        run.occurrenceIdentity ?? null,
        run.status,
        run.reason ?? null,
        run.chatId ?? null,
        run.runId ?? null,
        JSON.stringify(run.parameters),
        run.startedAt ?? null,
        run.endedAt ?? null,
        run.createdAt,
      );
  }

  private updateRun(run: RoutineRun) {
    this.repo.db
      .prepare(
        "UPDATE routine_runs SET status=?,reason=?,chat_id=?,run_id=?,parameters=?,started_at=?,ended_at=? WHERE routine_run_id=?",
      )
      .run(
        run.status,
        run.reason ?? null,
        run.chatId ?? null,
        run.runId ?? null,
        JSON.stringify(run.parameters),
        run.startedAt ?? null,
        run.endedAt ?? null,
        run.routineRunId,
      );
  }
}

type RoutineDefinition = Omit<Routine, "routineId" | "revision" | "createdAt" | "updatedAt" | "archivedAt">;
