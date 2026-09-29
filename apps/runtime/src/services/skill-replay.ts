import { createHash } from "node:crypto";
import { AuxError, EventTypes, PlanStepSchema, newRunId, type PlanStep, type Routine, type Run, type StepRecord } from "@aux/contracts";
import { substituteParameters } from "./runs.js";
import type { Repo } from "../store/repo.js";
import type { PageService } from "./pages.js";
import type { EventBus } from "../events.js";

const TARGET = /^css:(?:[#.][A-Za-z][\w-]*|[a-z][\w-]*(?:[#.][A-Za-z][\w-]*)?)$/;
const SELECTOR = /^(?:[#.][A-Za-z][\w-]*|[a-z][\w-]*(?:[#.][A-Za-z][\w-]*)?)$/;
const OPS = new Set(["click", "fill", "type", "select", "check", "uncheck", "press", "waitFor"]);
const SECRET_FIELD = /pass(?:word)?|token|secret|otp|cvv|credit.?card|ssn|social.?security/i;

/** Compile only a complete same-page ledger ending in an observed condition. */
export function compileSkillTrace(records: StepRecord[], samples: Record<string, string>): PlanStep[] {
  if (records.length < 2 || records.length > 50 || records.some(record => record.outcome?.status !== "ok"
    || record.outcome?.effect === "uncertain" || record.outcome?.receipt?.unconfirmed || record.outcome?.receipt?.uncertain
    || !OPS.has(record.op)))
    throw new AuxError("invalid_params", "Choose a completed browser trace of 2–50 supported, verified steps.");
  const pageIds = new Set(records.map(record => record.pageId));
  if (pageIds.size !== 1 || pageIds.has(undefined))
    throw new AuxError("invalid_params", "A Skill replay must come from one browser page.");
  const names = Object.keys(samples);
  if (!names.length || names.length > 20 || names.some(name => !/^[A-Za-z][A-Za-z0-9_]{0,40}$/.test(name)
    || SECRET_FIELD.test(name) || !samples[name]))
    throw new AuxError("invalid_params", "Review one to twenty named source values before compiling a Skill.");
  const sampleNames = new Map<string, string>();
  for (const [name, value] of Object.entries(samples)) {
    if (sampleNames.has(value)) throw new AuxError("invalid_params", "Each source value must identify one parameter.");
    sampleNames.set(value, name);
  }
  const parameterize = (value: string): string => {
    const name = sampleNames.get(value);
    if (!name) throw new AuxError("invalid_params", "A recorded input or text oracle needs an explicit reviewed parameter.");
    return `{{${name}}}`;
  };
  const steps = records.map((record, index) => {
    const parsed = PlanStepSchema.safeParse({ id: `skill-${index + 1}`, op: record.op, ...record.inputs });
    if (!parsed.success) throw new AuxError("invalid_params", "The recorded step cannot be replayed declaratively.");
    const step = parsed.data;
    if ("target" in step && step.target && !TARGET.test(step.target))
      throw new AuxError("invalid_params", "A recorded target needs a stable simple CSS selector, not a transient element ref.");
    if ("target" in step && step.target && SECRET_FIELD.test(step.target))
      throw new AuxError("invalid_params", "Credential and sensitive fields cannot be saved in a Skill replay.");
    if (step.op === "fill" || step.op === "type") return { ...step, value: parameterize(step.value) };
    if (step.op === "select") {
      if (typeof step.value !== "string") throw new AuxError("invalid_params", "Select one explicit parameter value.");
      return { ...step, value: parameterize(step.value) };
    }
    if (step.op === "press" && (!step.target || !TARGET.test(step.target)))
      throw new AuxError("invalid_params", "Keyboard replay needs a stable target.");
    if (step.op === "waitFor") {
      const condition = step.condition;
      if (condition.kind === "textVisible") return { ...step, condition: { ...condition, text: parameterize(condition.text) } };
      if (condition.kind !== "selector" || condition.state !== "visible" || !SELECTOR.test(condition.selector))
        throw new AuxError("invalid_params", "The replay oracle needs visible text or a simple visible selector.");
    }
    return step;
  });
  if (steps.at(-1)?.op !== "waitFor")
    throw new AuxError("invalid_params", "End the recorded trace with a verified wait condition as its replay oracle.");
  if (Buffer.byteLength(JSON.stringify(steps)) > 32_000)
    throw new AuxError("invalid_params", "The replay trace exceeds 32 KB.");
  return steps;
}

export function replayDigest(sourceRunId: string, siteOrigin: string, steps: PlanStep[]): string {
  return createHash("sha256").update(JSON.stringify(["aux-skill-replay@1", sourceRunId, siteOrigin, steps])).digest("hex");
}

export function bindSkillParameters(steps: PlanStep[], parameters: Record<string, string>, declared: readonly string[]): PlanStep[] {
  if (Object.keys(parameters).length !== declared.length || declared.some(name => !parameters[name] || parameters[name]!.length > 4000)
    || Object.keys(parameters).some(name => !declared.includes(name)))
    throw new AuxError("invalid_params", "Provide one reviewed value for each Skill parameter.");
  const bound = JSON.parse(substituteParameters(JSON.stringify(steps), parameters)) as unknown;
  if (!Array.isArray(bound)) throw new AuxError("invalid_params", "The Skill replay is invalid.");
  return bound.map(step => PlanStepSchema.parse(step));
}

export function skillPageOrigin(pages: PageService, pageId: string): string {
  const page = pages.get(pageId);
  if (page.ownedByRuntime || !pages.isAttached(pageId))
    throw new AuxError("conflict", "Choose an attached owner tab for Skill replay.");
  try {
    const url = new URL(page.url ?? "");
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("unsafe page");
    return url.origin;
  } catch {
    throw new AuxError("conflict", "Choose a current http(s) page for Skill replay.");
  }
}

/** Choose only an attached task resource on the exact tested origin. */
export function selectSkillReplayPage(pages: PageService, pageIds: readonly string[], siteOrigin: string): string {
  for (const pageId of pageIds) {
    try { if (skillPageOrigin(pages, pageId) === siteOrigin) return pageId; }
    catch { /* A detached or owner-ineligible task resource cannot be used. */ }
  }
  throw new AuxError("conflict", "Attach an owner tab on this Skill's tested site before it runs.");
}

/** Recheck a host-observed page-change target at the last dispatch boundary. */
export function requireRoutineTriggerPage(pages: PageService, pageId: string, url: string, documentEpoch: number): string {
  const page = pages.get(pageId);
  if (!pages.isAttached(pageId) || page.ownedByRuntime || page.url !== url || page.documentEpoch !== documentEpoch)
    throw new AuxError("conflict", "The watched tab or document changed. Review a new page-change occurrence.");
  return pageId;
}

/** A replay is a normal governed browser run with page JS disabled. */
export function startSkillReplay(input: { repo: Repo; pages: PageService; events: EventBus;
  routine: Routine; pageId: string; parameters: Record<string, string>; expectedDocumentEpoch?: number }): { runId: string } {
  const { repo, pages, events, routine, pageId, parameters } = input;
  const replay = routine.replay;
  if (!replay || replayDigest(replay.sourceRunId, replay.siteOrigin, replay.steps) !== replay.digest)
    throw new AuxError("conflict", "This Skill replay changed. Review and test it again.");
  if (skillPageOrigin(pages, pageId) !== replay.siteOrigin)
    throw new AuxError("conflict", "This page is outside the Skill's tested site.");
  if (input.expectedDocumentEpoch !== undefined && pages.get(pageId).documentEpoch !== input.expectedDocumentEpoch)
    throw new AuxError("conflict", "The watched document changed before Skill replay.");
  const steps = bindSkillParameters(replay.steps, parameters, routine.parameters.map(item => item.name));
  const now = Date.now();
  const run: Run = {
    runId: newRunId(), goal: `Replay ${routine.title}`, pageIds: [pageId], status: "running",
    config: { implementation: "skill-replay", routeReason: `skill-replay:${routine.routineId}:${replay.digest}`,
      taskId: routine.sourceTaskId, taskRevision: routine.sourceTaskRevision, contextWorkspaceId: routine.workspaceId },
    createdAt: now, startedAt: now, statusMessage: "Testing saved Skill steps",
  };
  repo.saveRun(run);
  events.emit(EventTypes.RunUpdated, { run }, run.runId);
  void pages.execute({ pageId, steps }, { runId: run.runId, taskId: routine.sourceTaskId,
    taskRevision: routine.sourceTaskRevision, allowEval: false })
    .then(result => {
      const latest = repo.getRun(run.runId);
      if (!latest || latest.status !== "running") return;
      let siteStillMatches = false;
      try { siteStillMatches = skillPageOrigin(pages, pageId) === replay.siteOrigin; } catch { /* Detached or changed site fails closed. */ }
      // A completed executor response alone is not proof: require the exact
      // durable step ledger and final tested oracle before recording success.
      const records = repo.listSteps(run.runId);
      const verified = records.length === steps.length && records.every((record, index) => {
        const step = steps[index]!;
        const { id: _id, op: _op, timeoutMs: _timeoutMs, optional: _optional,
          expect: _expect, ...inputs } = step;
        return record.pageId === pageId && record.op === step.op &&
          JSON.stringify(record.inputs) === JSON.stringify(inputs) && record.outcome?.status === "ok" &&
          !record.outcome?.receipt?.uncertain && !record.outcome?.receipt?.unconfirmed &&
          record.outcome?.effect !== "uncertain";
      });
      const completed = result.status === "completed" && siteStillMatches && verified;
      const settled: Run = { ...latest, status: completed ? "completed" : result.status === "cancelled" ? "cancelled" : "failed",
        result: completed ? result.extracted : undefined,
        error: !siteStillMatches ? "The Skill page changed or detached before verification."
          : !verified ? "The tested Skill steps lack complete verified receipts." : result.error,
        endedAt: Date.now(),
        statusMessage: completed ? "Skill replay finished" : "Skill replay needs review" };
      repo.saveRun(settled);
      events.emit(EventTypes.RunUpdated, { run: settled }, settled.runId);
    })
    .catch(error => {
      const latest = repo.getRun(run.runId);
      if (!latest || latest.status !== "running") return;
      const settled: Run = { ...latest, status: "failed", error: error instanceof Error ? error.message : String(error),
        endedAt: Date.now(), statusMessage: "Skill replay needs review" };
      repo.saveRun(settled);
      events.emit(EventTypes.RunUpdated, { run: settled }, settled.runId);
    });
  return { runId: run.runId };
}
