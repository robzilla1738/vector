import { createHash } from "node:crypto";
import {
  AuxError,
  EventTypes,
  PlanStepSchema,
  CredentialSelectorSchema,
  newRunId,
  type PlanStep,
  type Routine,
  type Run,
  type StepRecord,
} from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { PageService } from "./pages.js";
import type { EventBus } from "../events.js";
import { launchSkillContinuation } from "./skill-continuation.js";

const TARGET = /^css:(?:[#.][A-Za-z][\w-]*|[a-z][\w-]*(?:[#.][A-Za-z][\w-]*)?)$/;
const SELECTOR = /^(?:[#.][A-Za-z][\w-]*|[a-z][\w-]*(?:[#.][A-Za-z][\w-]*)?)$/;
const OPS = new Set(["click", "fill", "type", "select", "check", "uncheck", "press", "waitFor"]);
const SECRET_FIELD = /pass(?:word)?|token|secret|otp|cvv|credit.?card|ssn|social.?security/i;

/** Compile only a complete same-page ledger ending in an observed condition. */
export function compileSkillTrace(records: StepRecord[], samples: Record<string, string>): PlanStep[] {
  if (
    records.length < 2 ||
    records.length > 50 ||
    records.some((record, index) => {
      const oracle = index === records.length - 1;
      // A click or press often has no field or URL change. That local uncertainty
      // is not drift; the final wait condition is the tested oracle.
      return (
        record.outcome?.status !== "ok" ||
        !OPS.has(record.op) ||
        !!record.outcome?.receipt?.unconfirmed ||
        (oracle && (record.outcome?.effect === "uncertain" || !!record.outcome?.receipt?.uncertain))
      );
    })
  )
    throw new AuxError(
      "invalid_params",
      "Choose a completed browser trace of 2–50 supported, verified steps.",
    );
  const pageIds = new Set(records.map((record) => record.pageId));
  if (pageIds.size !== 1 || pageIds.has(undefined))
    throw new AuxError("invalid_params", "A Skill replay must come from one browser page.");
  const names = Object.keys(samples);
  if (
    !names.length ||
    names.length > 20 ||
    names.some(
      (name) => !/^[A-Za-z][A-Za-z0-9_]{0,40}$/.test(name) || SECRET_FIELD.test(name) || !samples[name],
    )
  )
    throw new AuxError(
      "invalid_params",
      "Review one to twenty named source values before compiling a Skill.",
    );
  const sampleNames = new Map<string, string>();
  for (const [name, value] of Object.entries(samples)) {
    if (sampleNames.has(value))
      throw new AuxError("invalid_params", "Each source value must identify one parameter.");
    sampleNames.set(value, name);
  }
  const parameterize = (value: string): string => {
    const name = sampleNames.get(value);
    if (!name)
      throw new AuxError(
        "invalid_params",
        "A recorded input or text oracle needs an explicit reviewed parameter.",
      );
    return `{{${name}}}`;
  };
  const steps = records.map((record, index) => {
    const parsed = PlanStepSchema.safeParse({ id: `skill-${index + 1}`, op: record.op, ...record.inputs });
    if (!parsed.success)
      throw new AuxError("invalid_params", "The recorded step cannot be replayed declaratively.");
    const step = parsed.data;
    if ("target" in step && step.target && !TARGET.test(step.target))
      throw new AuxError(
        "invalid_params",
        "A recorded target needs a stable simple CSS selector, not a transient element ref.",
      );
    if ("target" in step && step.target && SECRET_FIELD.test(step.target))
      throw new AuxError(
        "invalid_params",
        "Credential and sensitive fields cannot be saved in a Skill replay.",
      );
    if (step.op === "fill" || step.op === "type") return { ...step, value: parameterize(step.value) };
    if (step.op === "select") {
      if (typeof step.value !== "string")
        throw new AuxError("invalid_params", "Select one explicit parameter value.");
      return { ...step, value: parameterize(step.value) };
    }
    if (step.op === "press" && (!step.target || !TARGET.test(step.target)))
      throw new AuxError("invalid_params", "Keyboard replay needs a stable target.");
    if (step.op === "waitFor") {
      const condition = step.condition;
      if (condition.kind === "textVisible")
        return { ...step, condition: { ...condition, text: parameterize(condition.text) } };
      if (
        condition.kind !== "selector" ||
        condition.state !== "visible" ||
        !SELECTOR.test(condition.selector)
      )
        throw new AuxError(
          "invalid_params",
          "The replay oracle needs visible text or a simple visible selector.",
        );
    }
    return step;
  });
  const replay = steps.map((step) => PlanStepSchema.parse(step));
  const oracle = replay.at(-1);
  if (oracle?.op !== "waitFor")
    throw new AuxError(
      "invalid_params",
      "End the recorded trace with a verified wait condition as its replay oracle.",
    );
  const action = replay.at(-2);
  // The step ledger does not keep expect, so a click that was only proven by
  // the following wait would replay as an uncertain write. Attach that oracle.
  if (action && action.op !== "waitFor" && !action.expect?.length)
    replay[replay.length - 2] = PlanStepSchema.parse({ ...action, expect: [oracle.condition] });
  if (Buffer.byteLength(JSON.stringify(replay)) > 32_000)
    throw new AuxError("invalid_params", "The replay trace exceeds 32 KB.");
  return replay;
}

export function replayDigest(sourceRunId: string, siteOrigin: string, steps: PlanStep[]): string {
  return createHash("sha256")
    .update(JSON.stringify(["aux-skill-replay@2", { kind: "run", sourceRunId }, [siteOrigin], steps]))
    .digest("hex");
}

export function skillReplayProofDigest(replay: {
  sourceRunId?: string;
  sourceRecordingId?: string;
  siteOrigin: string;
  siteOrigins: readonly string[];
  steps: PlanStep[];
}): string {
  if (replay.sourceRecordingId)
    return demonstrationReplayDigest(replay.sourceRecordingId, replay.siteOrigins, replay.steps);
  if (!replay.sourceRunId) throw new AuxError("conflict", "The Skill has no exact source identity.");
  return replayDigest(replay.sourceRunId, replay.siteOrigin, replay.steps);
}

export function bindSkillParameters(
  steps: PlanStep[],
  parameters: Record<string, string>,
  declared: readonly string[],
): PlanStep[] {
  if (
    Object.keys(parameters).length !== declared.length ||
    declared.some((name) => !parameters[name] || parameters[name]!.length > 4000) ||
    Object.keys(parameters).some((name) => !declared.includes(name))
  )
    throw new AuxError("invalid_params", "Provide one reviewed value for each Skill parameter.");
  const substitute = (value: unknown): unknown => {
    if (typeof value === "string")
      return value.replace(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g, (_match, name: string) => {
        if (!Object.hasOwn(parameters, name))
          throw new AuxError("invalid_params", `Missing reviewed Skill parameter: ${name}`);
        return parameters[name]!;
      });
    if (Array.isArray(value)) return value.map(substitute);
    if (value && typeof value === "object")
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, substitute(item)]));
    return value;
  };
  const bound = substitute(steps);
  if (!Array.isArray(bound)) throw new AuxError("invalid_params", "The Skill replay is invalid.");
  return bound.map((step) => PlanStepSchema.parse(step));
}

export function skillPageOrigin(pages: PageService, pageId: string): string {
  const page = pages.get(pageId);
  if (page.ownedByRuntime || !pages.isAttached(pageId))
    throw new AuxError("conflict", "Choose an attached owner tab for Skill replay.");
  try {
    const url = new URL(page.url ?? "");
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password)
      throw new Error("unsafe page");
    return url.origin;
  } catch {
    throw new AuxError("conflict", "Choose a current http(s) page for Skill replay.");
  }
}

/** Choose only an attached task resource on the exact tested origin. */
export function selectSkillReplayPage(
  pages: PageService,
  pageIds: readonly string[],
  siteOrigin: string,
): string {
  for (const pageId of pageIds) {
    try {
      if (skillPageOrigin(pages, pageId) === siteOrigin) return pageId;
    } catch {
      /* A detached or owner-ineligible task resource cannot be used. */
    }
  }
  throw new AuxError("conflict", "Attach an owner tab on this Skill's tested site before it runs.");
}

/** Recheck a host-observed page-change target at the last dispatch boundary. */
export function requireRoutineTriggerPage(
  pages: PageService,
  pageId: string,
  url: string,
  documentEpoch: number,
): string {
  const page = pages.get(pageId);
  if (
    !pages.isAttached(pageId) ||
    page.ownedByRuntime ||
    page.url !== url ||
    page.documentEpoch !== documentEpoch
  )
    throw new AuxError(
      "conflict",
      "The watched tab or document changed. Review a new page-change occurrence.",
    );
  return pageId;
}

/** A replay is a normal governed browser run with page JS disabled. */
export function startSkillReplay(input: {
  repo: Repo;
  pages: PageService;
  events: EventBus;
  routine: Routine;
  pageId: string;
  parameters: Record<string, string>;
  expectedDocumentEpoch?: number;
  deliveryRunId?: string;
  nightShiftItemId?: string;
}): { runId: string } {
  const { repo, pages, events, routine, pageId, parameters } = input;
  if (!pages.get(pageId).sessionId) throw new AuxError("conflict", "The Skill page has no live attachment.");
  const replay = routine.replay;
  if (!replay || skillReplayProofDigest(replay) !== replay.digest)
    throw new AuxError("conflict", "This Skill replay changed. Review and test it again.");
  if (skillPageOrigin(pages, pageId) !== replay.siteOrigin)
    throw new AuxError("conflict", "This page is outside the Skill's tested site.");
  if (
    input.expectedDocumentEpoch !== undefined &&
    pages.get(pageId).documentEpoch !== input.expectedDocumentEpoch
  )
    throw new AuxError("conflict", "The watched document changed before Skill replay.");
  const steps = bindSkillParameters(
    replay.steps,
    parameters,
    routine.parameters.map((item) => item.name),
  );
  const origins = new Set(replay.siteOrigins);
  for (const step of steps)
    if (step.op === "navigate") {
      const url = new URL(step.url);
      if (url.username || url.password || !origins.has(url.origin))
        throw new AuxError("permission_denied", "A parameter changed a reviewed Skill origin.");
    }
  const now = Date.now();
  const run: Run = {
    runId: input.deliveryRunId ?? newRunId(),
    goal: `Replay ${routine.title}`,
    pageIds: [pageId],
    status: "running",
    config: {
      implementation: "skill-replay",
      routineId: routine.routineId,
      routeReason: `skill-replay:${routine.routineId}:${replay.digest}`,
      taskId: routine.sourceTaskId,
      taskRevision: routine.sourceTaskRevision,
      contextWorkspaceId: routine.workspaceId,
      ...(input.nightShiftItemId ? { nightShiftItemId: input.nightShiftItemId } : {}),
    },
    createdAt: now,
    startedAt: now,
    statusMessage: "Testing saved Skill steps",
  };
  repo.saveRun(run);
  events.emit(EventTypes.RunUpdated, { run }, run.runId);
  launchSkillContinuation({ repo, pages, events, run, routine, pageId, steps });
  return { runId: run.runId };
}

export interface DemonstrationReview {
  /** Every input is reviewed independently, including reused values. */
  inputs: { step: number; parameter: string; confirmed: boolean }[];
  targets: { step: number; selector: string; confirmed: boolean }[];
  navigationTemplates: { step: number; url: string }[];
  finalWait: Extract<PlanStep, { op: "waitFor" }>;
}
const SEMANTIC_TARGET =
  /^(?:(?:testid|name|text):[^\r\n|]{1,200}|label:[^\r\n|]{1,200}|role:[a-z][a-z-]*\|[^\r\n|]{1,200})$/;

/** Compile trusted human capture after independent variable/ambiguity review. */
export function compileDemonstration(
  demo: import("@aux/contracts").Demonstration,
  review: DemonstrationReview,
  siteOrigins: readonly string[],
): PlanStep[] {
  if (demo.state !== "stopped" || demo.steps.length < 1 || demo.steps.length > 49)
    throw new AuxError("invalid_params", "Stop a demonstration with room for its final wait condition.");
  const origins = new Set(
    siteOrigins.map((origin) => {
      const url = new URL(origin);
      if (!/^https?:$/.test(url.protocol) || url.origin !== origin)
        throw new AuxError("invalid_params", "Review exact http(s) site origins.");
      return origin;
    }),
  );
  if (!origins.size) throw new AuxError("invalid_params", "Review the Skill's sites before compiling.");
  const steps: PlanStep[] = demo.steps.map((step, index) => {
    const id = `demo-${index + 1}`;
    if (step.kind === "navigate") {
      const template = review.navigationTemplates.find((item) => item.step === index)?.url ?? step.url;
      const url = new URL(template.replace(/\{\{[A-Za-z][A-Za-z0-9_]{0,40}\}\}/g, "sample"));
      if (url.username || url.password || !origins.has(url.origin) || /\{\{/.test(new URL(template).origin))
        throw new AuxError("invalid_params", "Navigation must keep an explicitly reviewed site origin.");
      return PlanStepSchema.parse({ id, op: "navigate", url: template });
    }
    const selected = review.targets.find((item) => item.step === index);
    if (
      !selected?.confirmed ||
      !step.target.candidates.some(
        (candidate) => candidate.selector === selected.selector && candidate.matches === 1,
      ) ||
      !(TARGET.test(selected.selector) || SEMANTIC_TARGET.test(selected.selector)) ||
      (step.kind !== "credentialFill" && SECRET_FIELD.test(selected.selector))
    )
      throw new AuxError(
        "invalid_params",
        "Review a supported target for every recorded action, including ambiguous matches.",
      );
    const target = selected.selector;
    if (step.kind === "credentialFill") {
      if (
        step.secretType !== "password" ||
        !target.startsWith("css:") ||
        !CredentialSelectorSchema.safeParse(target.slice(4)).success
      )
        throw new AuxError(
          "permission_denied",
          "Payment, OTP and other protected entries need the person at the browser. Review a stable password field for secure handoff.",
        );
      return PlanStepSchema.parse({ id, op: "fillCredential", passwordSelector: target.slice(4) });
    }
    if (step.kind === "input") {
      const input = review.inputs.find((item) => item.step === index);
      if (
        !input?.confirmed ||
        !/^[A-Za-z][A-Za-z0-9_]{0,40}$/.test(input.parameter) ||
        SECRET_FIELD.test(input.parameter)
      )
        throw new AuxError("invalid_params", "Confirm a named variable for every typed value.");
      return PlanStepSchema.parse({
        id,
        op: step.control === "select" ? "select" : "fill",
        target,
        value: `{{${input.parameter}}}`,
      });
    }
    if (step.kind === "key") return PlanStepSchema.parse({ id, op: "press", target, key: step.key });
    if (step.kind === "submit") return PlanStepSchema.parse({ id, op: "press", target, key: "Enter" });
    return PlanStepSchema.parse({ id, op: "click", target });
  });
  const oracle = PlanStepSchema.parse(review.finalWait);
  if (oracle.op !== "waitFor")
    throw new AuxError("invalid_params", "Review a final observable wait condition.");
  const last = steps.at(-1)!;
  if (last.op !== "waitFor")
    steps[steps.length - 1] = PlanStepSchema.parse({ ...last, expect: [oracle.condition] });
  steps.push(oracle);
  if (Buffer.byteLength(JSON.stringify(steps)) > 32_000)
    throw new AuxError("invalid_params", "The reviewed Skill exceeds 32 KB.");
  return steps;
}

export function demonstrationReplayDigest(
  recordingId: string,
  siteOrigins: readonly string[],
  steps: PlanStep[],
) {
  return createHash("sha256")
    .update(JSON.stringify(["aux-skill-replay@2", recordingId, siteOrigins, steps]))
    .digest("hex");
}
