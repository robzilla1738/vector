import { AuxError, routineOccurrenceIdentity, type Routine, type RoutineRun } from "@aux/contracts";
import { previousRecurrenceTime } from "./recurrence.js";
import type { Repo } from "../../store/repo.js";
import type { EventBus } from "../../events.js";
interface SchedulerDeps {
  repo: Repo;
  events: EventBus;
  list(): Routine[];
  sync(): void;
  pauseNeglected(now: number): void;
  hasOccurrence(identity: string): boolean;
  startOccurrence(routine: Routine, identity: string, at: number): Promise<RoutineRun>;
  recordMissed(routine: Routine, identity: string, reason: string): RoutineRun;
  recentMissed(id: string): number;
  updateRun(run: RoutineRun): void;
  pauseInvalid(routine: Routine): void;
}
/** Serial recurrence projection and durable catch-up, independent of agent execution. */
export class RoutineScheduler {
  constructor(private deps: SchedulerDeps) {}
  private duePending?: Promise<RoutineRun[]>;
  due(now = Date.now()): Promise<RoutineRun[]> {
    if (this.duePending) return this.duePending;
    const work = this.scheduleDue(now).finally(() => {
      if (this.duePending === work) this.duePending = undefined;
    });
    this.duePending = work;
    return work;
  }
  private async scheduleDue(now: number): Promise<RoutineRun[]> {
    this.deps.sync();
    this.deps.pauseNeglected(now);
    const created: RoutineRun[] = [];
    for (const routine of this.deps.list()) {
      if (routine.paused || routine.trigger.kind === "manual") continue;
      try {
        if (routine.trigger.kind === "schedule" || routine.trigger.kind === "rrule") {
          const last = this.deps.repo.db
            .prepare(
              "SELECT max(created_at) AS at FROM routine_runs WHERE routine_id=? AND occurrence_identity IS NOT NULL",
            )
            .get(routine.routineId) as { at: number | null };
          const lowerBound = Math.max(
            routine.createdAt,
            routine.activatedAt ?? 0,
            last.at ?? 0,
            now - 14 * 24 * 60 * 60_000,
          );
          const pending: number[] = [];
          let cursor = now;
          for (let count = 0; count < 100; count++) {
            const scheduledFor = previousRecurrenceTime(routine.trigger, cursor);
            if (scheduledFor === null || scheduledFor < lowerBound) break;
            pending.push(scheduledFor);
            cursor = scheduledFor - 1;
          }
          const pendingInOrder = pending.reverse();
          const overdue = pendingInOrder.filter((scheduledFor) => now - scheduledFor > 90_000);
          const catchUp =
            routine.missedRunPolicy === "run_once_on_wake" &&
            !pendingInOrder.some((scheduledFor) => Math.abs(now - scheduledFor) <= 90_000)
              ? overdue.at(-1)
              : undefined;
          for (const scheduledFor of pendingInOrder) {
            const identity = routineOccurrenceIdentity(
              routine.routineId,
              routine.trigger.timezone,
              scheduledFor,
            );
            if (this.deps.hasOccurrence(identity)) continue;
            if (Math.abs(now - scheduledFor) <= 90_000 || scheduledFor === catchUp) {
              const record = await this.deps.startOccurrence(routine, identity, scheduledFor);
              if (scheduledFor === catchUp && ["needs_review", "running"].includes(record.status)) {
                record.reason = (
                  `Caught up once after ${overdue.length} missed scheduled occurrence${overdue.length === 1 ? "" : "s"}. ` +
                  (record.status === "needs_review" ? "Review before writes." : "")
                ).trim();
                this.deps.updateRun(record);
                this.deps.events.emit("routine.updated", { routine, run: record });
              }
              created.push(record);
            } else {
              created.push(
                this.deps.recordMissed(
                  routine,
                  identity,
                  "Missed scheduled run. Consequential work was not started automatically.",
                ),
              );
            }
          }
        } else if (routine.trigger.kind === "monitor" || routine.trigger.kind === "heartbeat") {
          if (
            routine.trigger.kind === "heartbeat" &&
            this.deps.repo.db
              .prepare(
                "SELECT 1 FROM routine_runs WHERE routine_id=? AND status IN ('queued','running','waiting_input') LIMIT 1",
              )
              .get(routine.routineId)
          )
            continue;
          const identity = routineOccurrenceIdentity(
            routine.routineId,
            routine.trigger.timezone,
            Math.floor(now / (routine.trigger.intervalMinutes * 60_000)) *
              routine.trigger.intervalMinutes *
              60_000,
          );
          if (this.deps.hasOccurrence(identity)) continue;
          const missed = this.deps.recentMissed(routine.routineId);
          const record = await this.deps.startOccurrence(routine, identity, now);
          if (missed > 0 && record.status !== "missed") {
            record.reason = `Coalesced ${missed + 1} missed read-only checks into one run.`;
            this.deps.updateRun(record);
            this.deps.events.emit("routine.updated", { routine, run: record });
          }
          created.push(record);
        }
      } catch (error) {
        if (!(error instanceof AuxError) || error.code !== "invalid_params") throw error;
        this.deps.pauseInvalid(routine);
        const identity = routineOccurrenceIdentity(routine.routineId, "UTC", now);
        if (!this.deps.hasOccurrence(identity))
          created.push(this.deps.recordMissed(routine, identity, `Schedule paused: ${error.message}`));
      }
    }
    return created;
  }
}
