import { AuxError } from "@aux/contracts";
import type { Services } from "../../api/methods/context.js";
import { RoutineService } from "../../services/routines.js";
import { TaskService } from "../../services/tasks.js";
import { startSkillReplay, selectSkillReplayPage } from "../../services/skill-replay.js";
import { substituteParameters } from "../../services/runs.js";
import type { NightShiftRuntime } from "../../services/night-shift.js";
export interface NightPower {
  status(): Promise<{ onAC: boolean; backgroundEnabled: boolean }>;
  release(): Promise<void>;
  activity(reason: string, durationSec: number): Promise<{ active: boolean }>;
}
export function resolveNightGoalTask(s: Services, goalId: string) {
  if (!s.goals) throw new AuxError("feature_unavailable", "Goals are unavailable in this Profile.");
  const goal = s.goals.get(goalId);
  const taskId = goal.chatId ? s.repo.taskForConversation(goal.chatId)
    ?? s.repo.getConversation(goal.chatId)?.taskId
    ?? (goal.chatId.startsWith("task:") ? goal.chatId.slice(5) : undefined) : undefined;
  const task = taskId ? new TaskService(s.repo, s.events).get(taskId) : undefined;
  if (!task || task.workspaceId !== goal.workspaceId)
    throw new AuxError("permission_denied", "Bind this goal to a reviewed saved task before tonight.");
  return task;
}
export function overnightRuntime(s: Services, power: NightPower): NightShiftRuntime {
  const tasks = new TaskService(s.repo, s.events);
  const pending = new Map<string, { runId: string; itemId: string }>();
  let backgroundEnabled = false;
  const routineService = new RoutineService(s.repo, s.events, async (routine, parameters) => {
    const authority = pending.get(routine.routineId);
    if (!authority || !routine.sourceTaskId) throw new AuxError("permission_denied", "This Skill has no person-queued overnight authority.");
    const details = tasks.details(routine.sourceTaskId);
    if (details.task.revision !== routine.sourceTaskRevision) throw new AuxError("conflict", "The Skill task changed before overnight launch.");
    const prepared = tasks.prepareRun(details.task.taskId, details.task.revision);
    const pageIds = details.task.resources.filter(resource => resource.kind === "page")
      .map(resource => resource.locator).filter(id => s.pages.isAttached(id));
    if (!pageIds.length) throw new AuxError("conflict", "Attach this Skill's reviewed task tabs before tonight.");
    if (routine.replay) {
      const pageId = selectSkillReplayPage(s.pages, pageIds, routine.replay.siteOrigin);
      return startSkillReplay({ repo: s.repo, pages: s.pages, events: s.events, routine, pageId, parameters,
        deliveryRunId: authority.runId, nightShiftItemId: authority.itemId });
    }
    const run = await s.runs.start({ ...prepared, deliveryRunId: authority.runId, nightShiftItemId: authority.itemId,
      goal: substituteParameters(routine.objective, parameters), pageIds });
    return { runId: run.runId, chatId: run.config?.chatId };
  });
  return {
    backgroundEnabled: () => backgroundEnabled,
    onAC: async () => { const status = await power.status(); backgroundEnabled = status.backgroundEnabled; return status.onAC; },
    releaseActivity: () => power.release(),
    powerActivity: (reason, durationSec) => power.activity(reason, durationSec),
    start: async (payload, item, runId) => {
      if (payload.kind === "goal") {
        if (!s.goals) throw new AuxError("feature_unavailable", "Goals are unavailable in this Profile.");
        const goal = s.goals.get(payload.goalId);
        const task = resolveNightGoalTask(s, goal.goalId);
        if (payload.taskId !== task.taskId || payload.taskRevision !== task.revision)
          throw new AuxError("conflict", "This goal’s queued task changed. Review it again before tonight.");
        const pages = task.resources.filter(resource => resource.kind === "page").map(resource => resource.locator).filter(id => s.pages.isAttached(id));
        const started = await s.goals.start(goal.goalId, pages, { deliveryRunId: runId, nightShiftItemId: item.id, taskId: task.taskId, taskRevision: task.revision });
        if (!started.runId) throw new AuxError("conflict", "The overnight goal did not launch."); return started.runId;
      }
      if (payload.kind !== "routine") throw new AuxError("invalid_params", "Memory work must use its leased pipeline.");
      pending.set(payload.routineId, { runId, itemId: item.id });
      try {
        const record = await routineService.run({ routineId: payload.routineId, expectedRevision: payload.revision, parameters: payload.parameters });
        if (!record.runId) throw new AuxError("conflict", record.reason ?? "The overnight Skill did not launch."); return record.runId;
      } finally { pending.delete(payload.routineId); }
    },
    cancel: (runId, reason) => { s.runs.cancel(runId, reason); },
    resume: async runId => {
      const run = s.repo.getRun(runId);
      if (!run || !["paused", "needs_input"].includes(run.status) || !run.config?.nightShiftItemId)
        throw new AuxError("conflict", "This overnight action is no longer parked for review.");
      const config = { ...run.config }; delete config.nightShiftItemId;
      s.repo.saveRun({ ...run, config });
      s.events.emit("run.updated", { run: { ...run, config } }, runId);
      // The foreground sheet resolves the actual suspension; this transition grants no one-off approval.
    },
    consolidate: workspaceId => {
      if (!s.memoryPipeline) throw new AuxError("feature_unavailable", "Space memory is unavailable.");
      return s.memoryPipeline.consolidate(workspaceId);
    },
    reindex: workspaceId => {
      if (!s.memoryPipeline) throw new AuxError("feature_unavailable", "Space memory is unavailable.");
      return s.memoryPipeline.reindex(workspaceId);
    },
  };
}
