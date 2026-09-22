import { randomUUID } from "node:crypto";
import {
  routineOccurrenceIdentity,
  AuxError,
  type Routine,
  type RoutineAlert,
  type RoutineCompare,
  RoutineShareSchema,
  type RoutineRun,
  type RoutineShare,
  type RoutineTrigger,
} from "@aux/contracts";
import type { EventBus } from "../events.js";
import type { Repo } from "../store/repo.js";

function parseRoutine(row: { json: string; revision: number; paused: number; archived_at: number | null; updated_at: number; routine_id: string; workspace_id: string }): Routine {
  const body = JSON.parse(row.json) as Omit<Routine, "routineId" | "revision" | "updatedAt" | "paused" | "archivedAt">;
  return {
    ...body,
    routineId: row.routine_id,
    workspaceId: row.workspace_id,
    revision: row.revision,
    paused: row.paused === 1,
    archivedAt: row.archived_at ?? undefined,
    updatedAt: row.updated_at,
  };
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
    parameters: row.parameters ? JSON.parse(String(row.parameters)) as Record<string, string> : {},
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
  const parts = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: timezone }).formatToParts(new Date(at));
  return { hour: Number(parts.find(part => part.type === "hour")?.value ?? 0), minute: Number(parts.find(part => part.type === "minute")?.value ?? 0) };
}

export function nextScheduledTime(trigger: Extract<RoutineTrigger, { kind: "schedule" }>, from: number): number {
  for (let offset = 0; offset < 14 * 24 * 60; offset++) {
    const candidate = from + offset * 60_000;
    const day = weekdayInZone(candidate, trigger.timezone);
    const { hour, minute } = hourMinuteInZone(candidate, trigger.timezone);
    if (trigger.days.includes(day) && hour === trigger.hour && minute === trigger.minute) return candidate - (candidate % 60_000);
  }
  throw new AuxError("invalid_params", "Could not compute the next scheduled occurrence.");
}

export function previousScheduledTime(trigger: Extract<RoutineTrigger, { kind: "schedule" }>, from: number): number {
  for (let offset = 0; offset < 14 * 24 * 60; offset++) {
    const candidate = from - offset * 60_000;
    const day = weekdayInZone(candidate, trigger.timezone);
    const { hour, minute } = hourMinuteInZone(candidate, trigger.timezone);
    if (trigger.days.includes(day) && hour === trigger.hour && minute === trigger.minute) return candidate - (candidate % 60_000);
  }
  throw new AuxError("invalid_params", "Could not compute the previous scheduled occurrence.");
}

export class RoutineService {
  constructor(
    private repo: Repo,
    private events: EventBus,
    private startWork?: (routine: Routine, parameters: Record<string, string>) => Promise<{ chatId?: string; runId?: string } | { chatId?: string; runId?: string }> | { chatId?: string; runId?: string },
  ) {}

  list(opts: { workspaceId?: string; includeArchived?: boolean; limit?: number } = {}): Routine[] {
    const limit = opts.limit ?? 50;
    const rows = (opts.workspaceId
      ? this.repo.db.prepare("SELECT * FROM routines WHERE workspace_id=? AND (?=1 OR archived_at IS NULL) ORDER BY updated_at DESC LIMIT ?").all(opts.workspaceId, opts.includeArchived ? 1 : 0, limit)
      : this.repo.db.prepare("SELECT * FROM routines WHERE (?=1 OR archived_at IS NULL) ORDER BY updated_at DESC LIMIT ?").all(opts.includeArchived ? 1 : 0, limit)) as Parameters<typeof parseRoutine>[0][];
    return rows.map(parseRoutine);
  }

  get(routineId: string): { routine: Routine; runs: RoutineRun[] } {
    return { routine: this.routine(routineId), runs: this.runs(routineId) };
  }

  create(input: RoutineDefinition & { sourceTaskId?: string; sourceRunId?: string }): Routine {
    this.requireWorkspace(input.workspaceId);
    const now = Date.now();
    const routine: Routine = {
      ...input,
      parameters: input.parameters ?? [],
      siteOrigins: input.siteOrigins ?? [],
      accountLabels: input.accountLabels ?? [],
      reviewRequired: input.reviewRequired ?? input.trigger?.kind !== "monitor",
      cloudCapable: input.cloudCapable ?? false,
      consecutive: input.consecutive ?? false,
      trigger: input.trigger ?? { kind: "manual" },
      paused: input.paused ?? false,
      routineId: randomUUID(),
      revision: 1,
      createdAt: now,
      updatedAt: now,
    };
    this.insert(routine);
    this.events.emit("routine.updated", { routine });
    return routine;
  }

  fromResult(input: { taskId: string; runId?: string; title?: string; parameters?: Routine["parameters"]; trigger?: RoutineTrigger; reviewRequired?: boolean; cloudCapable?: boolean }): Routine {
    const taskRow = this.repo.db.prepare("SELECT json,workspace_id FROM tasks WHERE task_id=?").get(input.taskId) as { json: string; workspace_id: string } | undefined;
    if (!taskRow) throw new AuxError("not_found", "Save a task before turning it into a routine.");
    const task = JSON.parse(taskRow.json) as { title: string; objective: string; resources?: { kind: string; locator: string }[] };
    const run = input.runId
      ? this.repo.getRun(input.runId)
      : (() => {
          const row = this.repo.db.prepare("SELECT run_id FROM runs WHERE json_extract(config,'$.taskId')=? ORDER BY created_at DESC LIMIT 1").get(input.taskId) as { run_id: string } | undefined;
          return row ? this.repo.getRun(row.run_id) : undefined;
        })();
    const origins = [...new Set((task.resources ?? []).flatMap(resource => {
      try { return resource.kind === "url" ? [new URL(resource.locator).origin] : []; } catch { return []; }
    }))];
    return this.create({
      title: (input.title ?? task.title).slice(0, 200),
      objective: task.objective,
      workspaceId: taskRow.workspace_id,
      sourceTaskId: input.taskId,
      sourceRunId: run?.runId,
      parameters: input.parameters ?? [],
      siteOrigins: origins.slice(0, 20),
      accountLabels: [],
      consecutive: false,
      paused: false,
      trigger: input.trigger ?? { kind: "manual" },
      reviewRequired: input.reviewRequired ?? input.trigger?.kind !== "monitor",
      cloudCapable: input.cloudCapable ?? false,
    });
  }

  update(input: Partial<RoutineDefinition> & { routineId: string; expectedRevision: number }): Routine {
    const current = this.routine(input.routineId);
    if (current.revision !== input.expectedRevision) throw new AuxError("conflict", "This routine changed. Refresh and try again.");
    const next: Routine = {
      ...current,
      ...input,
      parameters: input.parameters ?? current.parameters,
      siteOrigins: input.siteOrigins ?? current.siteOrigins,
      accountLabels: input.accountLabels ?? current.accountLabels,
      trigger: input.trigger ?? current.trigger,
      revision: current.revision + 1,
      updatedAt: Date.now(),
    };
    this.persist(next);
    this.events.emit("routine.updated", { routine: next });
    return next;
  }

  pause(routineId: string, expectedRevision: number, paused: boolean): Routine {
    return this.update({ routineId, expectedRevision, paused });
  }

  archive(routineId: string, expectedRevision: number, archived: boolean): Routine {
    const current = this.routine(routineId);
    if (current.revision !== expectedRevision) throw new AuxError("conflict", "This routine changed. Refresh and try again.");
    const next: Routine = { ...current, revision: current.revision + 1, updatedAt: Date.now(), archivedAt: archived ? Date.now() : undefined };
    this.persist(next);
    this.events.emit("routine.updated", { routine: next });
    return next;
  }

  /** Portable definitions for sharing or backup; ids, revisions and timestamps are dropped. */
  exportRoutines(routineIds?: string[]): { format: "aux-routine@1"; routines: RoutineShare[] } {
    const picked = routineIds?.length ? routineIds.map((id) => this.routine(id)) : this.list({ includeArchived: false, limit: 500 });
    const workspaceNames = new Map<string, string>();
    const nameOf = (workspaceId: string) => {
      let name = workspaceNames.get(workspaceId);
      if (name === undefined) {
        const row = this.repo.db.prepare("SELECT name FROM workspaces WHERE workspace_id=?").get(workspaceId) as { name: string } | undefined;
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

  /**
   * Recreates shared routines in one Space. A routine is skipped when the
   * target already holds one with the same title and objective — imports are
   * safe to repeat.
   */
  importRoutines(routines: RoutineShare[], workspaceId?: string): { ok: true; imported: number; skipped: number; routineIds: string[] } {
    const target = workspaceId ?? this.resolveWorkspace(routines[0]?.workspaceName);
    this.requireWorkspace(target);
    const existing = new Set(this.list({ workspaceId: target, includeArchived: true, limit: 500 }).map((r) => `${r.title}\n${r.objective}`));
    const routineIds: string[] = [];
    let skipped = 0;
    for (const share of routines) {
      const key = `${share.title}\n${share.objective}`;
      if (existing.has(key)) { skipped += 1; continue; }
      const { workspaceName: _ignored, ...definition } = share;
      const created = this.create({ ...definition, workspaceId: target });
      routineIds.push(created.routineId);
      existing.add(key);
    }
    return { ok: true, imported: routineIds.length, skipped, routineIds };
  }

  async run(input: { routineId: string; expectedRevision: number; parameters?: Record<string, string> }, occurrence?: { occurrenceId: string; identity: string; scheduledFor: number }): Promise<RoutineRun> {
    const routine = this.routine(input.routineId);
    if (routine.revision !== input.expectedRevision) throw new AuxError("conflict", "This routine changed. Refresh and try again.");
    if (routine.paused) throw new AuxError("conflict", "Resume this routine before running it.");
    if (routine.archivedAt) throw new AuxError("conflict", "Restore this routine before running it.");
    const uncertain = this.repo.db.prepare("SELECT 1 FROM routine_runs WHERE routine_id=? AND status='uncertain' LIMIT 1").get(routine.routineId);
    if (uncertain) throw new AuxError("conflict", "Reconcile the previous uncertain write before running this routine again.");
    const active = this.repo.db.prepare("SELECT 1 FROM routine_runs WHERE routine_id=? AND status IN ('queued','running','needs_review') LIMIT 1").get(routine.routineId);
    if (active && !routine.consecutive) throw new AuxError("conflict", "This routine is already in progress. Wait or review the open run.");
    const parameters = { ...Object.fromEntries(routine.parameters.map(item => [item.name, item.value ?? ""])), ...input.parameters };
    for (const item of routine.parameters) if (parameters[item.name] === undefined || parameters[item.name] === "") throw new AuxError("invalid_params", `Set the ${item.label} parameter.`);
    const now = Date.now();
    const record: RoutineRun = {
      routineRunId: randomUUID(),
      routineId: routine.routineId,
      revision: routine.revision,
      occurrenceId: occurrence?.occurrenceId,
      occurrenceIdentity: occurrence?.identity,
      status: routine.reviewRequired && occurrence ? "needs_review" : "queued",
      reason: routine.reviewRequired && occurrence ? "Scheduled work needs review before it writes." : undefined,
      parameters,
      createdAt: now,
    };
    this.insertRun(record);
    this.events.emit("routine.updated", { routine, run: record });
    if (record.status === "needs_review") return record;
    return this.dispatch(record, routine);
  }

  async reconcile(routineRunId: string, outcome: "applied" | "not_applied", note: string): Promise<RoutineRun> {
    const record = this.runById(routineRunId);
    if (record.status !== "uncertain" && record.status !== "needs_review") throw new AuxError("conflict", "Only uncertain or waiting runs can be reconciled.");
    const routine = this.routine(record.routineId);
    if (outcome === "not_applied") {
      const next = { ...record, status: "cancelled" as const, reason: note, endedAt: Date.now() };
      this.updateRun(next);
      this.events.emit("routine.updated", { routine, run: next });
      return next;
    }
    if (record.status === "needs_review") return this.dispatch({ ...record, reason: note }, routine);
    const next = { ...record, status: "completed" as const, reason: note, endedAt: Date.now() };
    this.updateRun(next);
    this.events.emit("routine.updated", { routine, run: next });
    return next;
  }

  runs(routineId: string, limit = 30): RoutineRun[] {
    return (this.repo.db.prepare("SELECT * FROM routine_runs WHERE routine_id=? ORDER BY created_at DESC LIMIT ?").all(routineId, limit) as Record<string, unknown>[]).map(parseRun);
  }

  async due(now = Date.now()): Promise<RoutineRun[]> {
    const created: RoutineRun[] = [];
    for (const routine of this.list({ includeArchived: false, limit: 200 })) {
      if (routine.paused || routine.trigger.kind === "manual") continue;
      if (routine.trigger.kind === "schedule") {
        const scheduledFor = previousScheduledTime(routine.trigger, now);
        const identity = routineOccurrenceIdentity(routine.routineId, routine.trigger.timezone, scheduledFor);
        if (this.hasOccurrence(identity)) continue;
        if (Math.abs(now - scheduledFor) <= 90_000) {
          created.push(await this.run({ routineId: routine.routineId, expectedRevision: routine.revision, parameters: {} }, { occurrenceId: randomUUID(), identity, scheduledFor }));
        } else if (scheduledFor < now - 90_000) {
          created.push(this.recordMissed(routine, identity, "Missed scheduled run. Consequential work was not started automatically."));
        }
      } else {
        const identity = routineOccurrenceIdentity(routine.routineId, routine.trigger.timezone, Math.floor(now / (routine.trigger.intervalMinutes * 60_000)) * routine.trigger.intervalMinutes * 60_000);
        if (this.hasOccurrence(identity)) continue;
        const missed = this.recentMissedMonitors(routine.routineId);
        const record = await this.run({ routineId: routine.routineId, expectedRevision: routine.revision, parameters: {} }, { occurrenceId: randomUUID(), identity, scheduledFor: now });
        if (missed > 0) {
          record.reason = `Coalesced ${missed + 1} missed read-only checks into one run.`;
          this.updateRun(record);
          this.events.emit("routine.updated", { routine, run: record });
        }
        created.push(record);
      }
    }
    return created;
  }

  alerts(limit = 30): RoutineAlert[] {
    const rows = this.repo.db.prepare(`SELECT r.routine_run_id, r.routine_id, r.status, r.reason, r.created_at, t.json
      FROM routine_runs r JOIN routines t ON t.routine_id=r.routine_id
      WHERE (r.status IN ('missed','needs_review','uncertain','failed') OR r.reason LIKE 'Coalesced %')
      ORDER BY r.created_at DESC LIMIT ?`).all(limit) as { routine_run_id: string; routine_id: string; status: string; reason: string | null; created_at: number; json: string }[];
    return rows.map(row => {
      const routine = JSON.parse(row.json) as { title: string; trigger?: { kind?: string } };
      return {
        routineRunId: row.routine_run_id,
        routineId: row.routine_id,
        title: routine.title,
        status: row.status as RoutineAlert["status"],
        reason: row.reason ?? undefined,
        triggerKind: routine.trigger?.kind === "schedule" || routine.trigger?.kind === "monitor" ? routine.trigger.kind : "manual",
        createdAt: row.created_at,
      };
    });
  }

  compare(leftRunId: string, rightRunId: string): RoutineCompare {
    const left = this.runById(leftRunId);
    const right = this.runById(rightRunId);
    if (left.routineId !== right.routineId) throw new AuxError("conflict", "Compare two runs of the same routine.");
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
    return { routineId: routine.routineId, title: routine.title, left, right, sameOccurrence, sameParameters, statusChanged, summary };
  }

  private async dispatch(record: RoutineRun, routine: Routine): Promise<RoutineRun> {
    if (routine.cloudCapable && !this.startWork) {
      const next = { ...record, status: "missed" as const, reason: "Cloud-capable routines need a configured cloud environment while the desktop is closed. Local Aux was not running.", endedAt: Date.now() };
      this.updateRun(next);
      this.events.emit("routine.updated", { routine, run: next });
      return next;
    }
    try {
      const started = (await this.startWork?.(routine, record.parameters)) ?? {};
      const next: RoutineRun = { ...record, status: "running", chatId: started.chatId, runId: started.runId, startedAt: Date.now() };
      this.updateRun(next);
      this.events.emit("routine.updated", { routine, run: next });
      return next;
    } catch (error) {
      const next = { ...record, status: "failed" as const, reason: error instanceof Error ? error.message : String(error), endedAt: Date.now() };
      this.updateRun(next);
      this.events.emit("routine.updated", { routine, run: next });
      return next;
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
    return (this.repo.db.prepare("SELECT count(*) AS n FROM routine_runs WHERE routine_id=? AND status='missed' AND created_at>?").get(routineId, Date.now() - 24 * 60 * 60_000) as { n: number }).n;
  }

  private routine(routineId: string): Routine {
    const row = this.repo.db.prepare("SELECT * FROM routines WHERE routine_id=?").get(routineId) as Parameters<typeof parseRoutine>[0] | undefined;
    if (!row) throw new AuxError("not_found", "That routine was not found.");
    return parseRoutine(row);
  }

  private runById(id: string): RoutineRun {
    const row = this.repo.db.prepare("SELECT * FROM routine_runs WHERE routine_run_id=?").get(id) as Record<string, unknown> | undefined;
    if (!row) throw new AuxError("not_found", "That routine run was not found.");
    return parseRun(row);
  }

  private resolveWorkspace(workspaceName?: string): string {
    if (!workspaceName) {
      const first = this.repo.db.prepare("SELECT workspace_id FROM workspaces ORDER BY created_at,workspace_id LIMIT 1").get() as { workspace_id: string } | undefined;
      if (first) return first.workspace_id;
      throw new AuxError("not_found", "Create a Space before importing routines.");
    }
    const row = this.repo.db.prepare("SELECT workspace_id FROM workspaces WHERE name=?").get(workspaceName) as { workspace_id: string } | undefined;
    if (row) return row.workspace_id;
    throw new AuxError("not_found", `No Space named "${workspaceName}" — pass workspaceId to choose where the routines land.`);
  }

  private requireWorkspace(workspaceId: string) {
    if (!this.repo.db.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(workspaceId)) throw new AuxError("not_found", "Choose a Space for this routine.");
  }

  private insert(routine: Routine) {
    const json = JSON.stringify(routine);
    this.repo.db.prepare("INSERT INTO routines(routine_id,workspace_id,revision,paused,archived_at,updated_at,json) VALUES(?,?,?,?,?,?,?)")
      .run(routine.routineId, routine.workspaceId, routine.revision, routine.paused ? 1 : 0, routine.archivedAt ?? null, routine.updatedAt, json);
    this.repo.db.prepare("INSERT INTO routine_revisions(routine_id,revision,json) VALUES(?,?,?)").run(routine.routineId, routine.revision, json);
  }

  private persist(routine: Routine) {
    const json = JSON.stringify(routine);
    this.repo.db.prepare("UPDATE routines SET workspace_id=?,revision=?,paused=?,archived_at=?,updated_at=?,json=? WHERE routine_id=?")
      .run(routine.workspaceId, routine.revision, routine.paused ? 1 : 0, routine.archivedAt ?? null, routine.updatedAt, json, routine.routineId);
    this.repo.db.prepare("INSERT INTO routine_revisions(routine_id,revision,json) VALUES(?,?,?)").run(routine.routineId, routine.revision, json);
  }

  private insertRun(run: RoutineRun) {
    this.repo.db.prepare("INSERT INTO routine_runs(routine_run_id,routine_id,revision,occurrence_id,occurrence_identity,status,reason,chat_id,run_id,parameters,started_at,ended_at,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)")
      .run(run.routineRunId, run.routineId, run.revision, run.occurrenceId ?? null, run.occurrenceIdentity ?? null, run.status, run.reason ?? null, run.chatId ?? null, run.runId ?? null, JSON.stringify(run.parameters), run.startedAt ?? null, run.endedAt ?? null, run.createdAt);
  }

  private updateRun(run: RoutineRun) {
    this.repo.db.prepare("UPDATE routine_runs SET status=?,reason=?,chat_id=?,run_id=?,parameters=?,started_at=?,ended_at=? WHERE routine_run_id=?")
      .run(run.status, run.reason ?? null, run.chatId ?? null, run.runId ?? null, JSON.stringify(run.parameters), run.startedAt ?? null, run.endedAt ?? null, run.routineRunId);
  }
}

type RoutineDefinition = Omit<Routine, "routineId" | "revision" | "createdAt" | "updatedAt" | "archivedAt">;
