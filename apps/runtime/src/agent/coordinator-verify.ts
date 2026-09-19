import {
  PlanChunkSchema,
  VectorError,
  type Observation,
  type PlanChunk,
  type Run,
  type StepOutcome,
} from "@vector/contracts";
import type { ModelClient } from "./model-client.js";
import { normalizePlannerObject } from "./gateway-client.js";
import { buildVisionPrompt, extractJson, VISION_SYSTEM } from "./planner.js";
import { DurableWriteLedger } from "./durable.js";
import type { CompiledSkill } from "./skills.js";
import type { CoordinatorDeps } from "./coordinator.js";

export const TERMINAL_STATUSES: ReadonlySet<Run["status"]> = new Set([
  "completed",
  "partially_completed",
  "failed",
  "cancelled",
  "interrupted",
]);
export const DEFAULT_MAX_STEPS = 60;
export const DEFAULT_MAX_MODEL_CALLS = 40;
export const NO_PROGRESS_LIMIT = 3;
export const PLAN_REPEAT_LIMIT = 3;
export const MODEL_ERROR_LIMIT = 3;

/** Merge extracted data for a partial-completion result. Latest value per key wins. */
export function harvestResults(outcomes: StepOutcome[]): Record<string, unknown> | undefined {
  const merged: Record<string, unknown> = {};
  for (const o of outcomes) {
    if (o.status !== "ok" || !o.extracted) continue;
    for (const [k, v] of Object.entries(o.extracted)) {
      const s = typeof v === "string" ? v : JSON.stringify(v);
      if (s.length > 800) continue;
      merged[k] = v;
    }
  }
  return Object.keys(merged).length ? merged : undefined;
}

/** Ops whose effect the observer can't see — JS state, downloads, screenshots. */
export const OBSERVATION_BLIND_OPS = new Set([
  "evaluate",
  "extract",
  "collectScroll",
  "expectDownload",
  "screenshot",
]);

const WRITE_LIKE_OPS = new Set([
  "click", "dblclick", "fill", "type", "press", "select", "check", "uncheck",
  "navigate", "submit", "hover", "scroll", "dragTo", "clickPoint", "reload",
]);

function observationGroundText(obs: Observation): string {
  const c = obs.content;
  return [c.text, c.title, c.url, ...(c.headings ?? []).map((h) => (typeof h === "string" ? h : String((h as { text?: string }).text ?? "")))]
    .join(" ")
    .toLowerCase();
}

function collectStringClaims(result: unknown): string[] {
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === "string") {
      const t = v.trim();
      if (t) out.push(t);
      return;
    }
    if (typeof v === "number" && Number.isFinite(v)) out.push(String(v));
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v as Record<string, unknown>).forEach(walk);
  };
  walk(result);
  return out;
}

/** Re-observe challenge: long textual claims must appear on the page; writes need observed or remoteConfirmed. */
export function verifyDoneAgainstObservation(
  result: unknown,
  obs: Observation,
  outcomes: StepOutcome[],
): { ok: boolean; reason: string } {
  const writeOutcomes = outcomes.filter((o) => o.status === "ok" && WRITE_LIKE_OPS.has(o.op));
  const writesConfirmed = writeOutcomes.some(
    (o) => Boolean(o.receipt?.observed) || o.receipt?.remoteConfirmed === true || o.effect === "observed",
  );
  const text = observationGroundText(obs);
  const claims = collectStringClaims(result);
  const longClaims = claims.filter((c) => c.length >= 8);
  const ungrounded = longClaims.filter((c) => !text.includes(c.toLowerCase()));
  if (ungrounded.length > 0) return { ok: false, reason: `ungrounded claims: ${ungrounded.slice(0, 3).join(", ")}` };
  if (longClaims.length > 0) return { ok: true, reason: "grounded" };
  const shortGrounded = claims.some((c) => text.includes(c.toLowerCase()));
  if (writeOutcomes.length > 0 && !writesConfirmed && claims.length > 0 && !shortGrounded) {
    return { ok: false, reason: "write not observed or remoteConfirmed" };
  }
  if (writeOutcomes.length > 0 && writesConfirmed) return { ok: true, reason: "writes-confirmed" };
  return { ok: true, reason: "grounded" };
}

export async function tryVisionPlan(self: CoordinatorLoopHost, args: {
  runId: string;
  pageId: string;
  goal: string;
  url: string;
  lastError?: string;
  outcomes: StepOutcome[];
  model: ModelClient;
  modelId: string;
  signal: AbortSignal;
  onModelCall?: () => void;
}): Promise<PlanChunk | null> {
  const started = Date.now();
  try {
    const shot = await self.deps.pages.capture(args.pageId, { format: "dataUrl" });
    if (!shot.dataUrl) return null;
    const res = await args.model.generateText({
      modelId: args.modelId,
      system: VISION_SYSTEM,
      prompt: buildVisionPrompt({ goal: args.goal, url: args.url, lastError: args.lastError, recentOutcomes: args.outcomes }),
      imageDataUrl: shot.dataUrl,
      signal: args.signal,
      maxOutputTokens: 8192,
    });
    args.onModelCall?.();
    self.deps.recordModelCall({
      runId: args.runId,
      role: "vision",
      modelId: args.modelId,
      durationMs: res.durationMs,
      inputTokens: res.inputTokens,
      outputTokens: res.outputTokens,
    });
    const parsed = PlanChunkSchema.safeParse(normalizePlannerObject(extractJson(res.text)));
    return parsed.success ? parsed.data : null;
  } catch (e) {
    if (args.signal.aborted) throw e;
    const msg = e instanceof Error ? e.message : String(e);
    const skip = (e instanceof VectorError && e.code === "capability_unsupported") || /screenshots are not available|vision is not available/i.test(msg);
    if (!skip) {
      args.onModelCall?.();
      self.deps.recordModelCall({
        runId: args.runId,
        role: "vision",
        modelId: args.modelId,
        durationMs: Date.now() - started,
        error: msg,
      });
    }
    return null;
  }
}

export interface CoordinatorLoopHost {
  deps: CoordinatorDeps;
  durable: DurableWriteLedger;
  skills: CompiledSkill[];
  unresolvedByRun: Map<string, string[]>;
  controls: Map<string, { abort: AbortController; paused: boolean; deadlineHit?: boolean; answerWaiter?: { resolve: (answer: string) => void }; span?: { spanId: string; end(outcome?: "ok" | "failed" | "cancelled", attrs?: Record<string, unknown>): void } }>;
  get(runId: string): Run;
  setStatus(runId: string, status: Run["status"], message?: string): void;
  persistCheckpoint(run: Run): void;
  finish(runId: string, status: Run["status"], result?: Record<string, unknown>, error?: string, message?: string): void;
  waitIfPaused(c: { abort: AbortController; paused: boolean }, runId: string): Promise<void>;
  waitForAnswer(c: { answerWaiter?: { resolve: (answer: string) => void } }, runId: string): Promise<string>;
  tryVisionPlan(args: Parameters<typeof tryVisionPlan>[1]): ReturnType<typeof tryVisionPlan>;
  assertTargetAlive(obs: Observation): void;
}
