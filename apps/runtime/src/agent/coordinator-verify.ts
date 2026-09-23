import {
  PlanChunkSchema,
  AuxError,
  type Observation,
  type PlanChunk,
  type Run,
  type StepOutcome,
} from "@aux/contracts";
import type { ModelClient } from "./model-client.js";
import { normalizePlannerObject } from "./gateway-client.js";
import { extractJson } from "./json-text.js";
import { DEFAULT_MAX_MODEL_CALLS } from "./model-client.js";
import { isConsequential } from "./permissions.js";
import { buildVisionPrompt, VISION_SYSTEM } from "./planner.js";
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
export { DEFAULT_MAX_MODEL_CALLS };
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

/** A best-effort result for a run that stopped short: harvested values sit under `partial`, never posing as the answer. */
export function partialResult(outcomes: StepOutcome[]): Record<string, unknown> | undefined {
  const harvested = harvestResults(outcomes);
  return harvested ? { partial: harvested } : undefined;
}

/** Ops whose effect the observer can't see — JS state, downloads, screenshots. */
export const OBSERVATION_BLIND_OPS = new Set([
  "evaluate",
  "extract",
  "collectScroll",
  "expectDownload",
  "screenshot",
]);

function observationGroundText(obs: Observation): string {
  const c = obs.content;
  return [c.text, c.title, c.url, ...(c.headings ?? []).map((h) => (typeof h === "string" ? h : String((h as { text?: string }).text ?? ""))),
    ...(c.tables ?? []).flatMap((t) => [t.columns.join(" "), ...t.rows.map((r) => r.join(" "))])]
    .join(" ")
    .toLowerCase();
}

/** Evidence the run itself produced: extracted values and step details (including human answers). */
function outcomeGroundText(outcomes: StepOutcome[]): string {
  return outcomes
    .filter((o) => o.status === "ok")
    .flatMap((o) => [o.detail ?? "", ...(o.extracted ? [JSON.stringify(o.extracted)] : [])])
    .join(" ")
    .toLowerCase();
}

type Claim = { text: string; numeric: boolean };

const NUMERIC_CLAIM = /^[-+]?[$€£¥]?\s?\d[\d,]*(?:\.\d+)?\s?%?$/;

function collectClaims(result: unknown): Claim[] {
  const out: Claim[] = [];
  const walk = (v: unknown) => {
    if (typeof v === "string") {
      const t = v.trim();
      if (t) out.push({ text: t, numeric: NUMERIC_CLAIM.test(t) });
      return;
    }
    if (typeof v === "number" && Number.isFinite(v)) out.push({ text: String(v), numeric: true });
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v as Record<string, unknown>).forEach(walk);
  };
  walk(result);
  return out;
}

const toNumber = (s: string) => Number(s.replace(/[,$€£¥%\s+]/g, ""));

/** Every number that appears in the evidence, plus lengths of extracted lists (counts). */
function groundNumbers(text: string, outcomes: StepOutcome[]): Set<number> {
  const nums = new Set<number>();
  for (const m of text.replace(/(\d),(?=\d{3}\b)/g, "$1").matchAll(/-?\d+(?:\.\d+)?/g)) nums.add(Number(m[0]));
  const lengths = (v: unknown): void => {
    if (Array.isArray(v)) { nums.add(v.length); v.forEach(lengths); }
    else if (v && typeof v === "object") Object.values(v as Record<string, unknown>).forEach(lengths);
  };
  for (const o of outcomes) if (o.status === "ok" && o.extracted) lengths(o.extracted);
  return nums;
}

/**
 * Re-observe challenge. Claims are grounded against the fresh page plus the
 * values and details this run extracted. Long textual claims must appear
 * verbatim; numeric claims must appear as a number somewhere in that evidence
 * (or be the length of an extracted list). Writes need observed or remoteConfirmed.
 */
export function verifyDoneAgainstObservation(
  result: unknown,
  obs: Observation,
  outcomes: StepOutcome[],
): { ok: boolean; reason: string } {
  const writeOutcomes = outcomes.filter((o) => o.status === "ok" && isConsequential(o.op));
  const writesConfirmed = writeOutcomes.some(
    (o) => Boolean(o.receipt?.observed) || o.receipt?.remoteConfirmed === true || o.effect === "observed",
  );
  const text = `${observationGroundText(obs)} ${outcomeGroundText(outcomes)}`;
  const claims = collectClaims(result);
  const numbers = claims.some((c) => c.numeric) ? groundNumbers(text, outcomes) : new Set<number>();
  const ungrounded = claims.filter((c) =>
    c.numeric ? !numbers.has(toNumber(c.text)) && !text.includes(c.text.toLowerCase()) : c.text.length >= 8 && !text.includes(c.text.toLowerCase()),
  );
  if (ungrounded.length > 0) return { ok: false, reason: `ungrounded claims: ${ungrounded.slice(0, 3).map((c) => c.text).join(", ")}` };
  const checked = claims.filter((c) => c.numeric || c.text.length >= 8);
  if (checked.length > 0) return { ok: true, reason: "grounded" };
  const shortGrounded = claims.some((c) => text.includes(c.text.toLowerCase()));
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
  instructions?: string;
  notes?: string;
}): Promise<PlanChunk | null> {
  const started = Date.now();
  try {
    const shot = await self.deps.pages.capture(args.pageId, { format: "dataUrl" });
    if (!shot.dataUrl) return null;
    const run = self.get(args.runId);
    if (run.config?.contextImageArtifactIds?.length && !self.deps.imageReferences) throw new AuxError("capability_unsupported", "Image context is unavailable for this run.");
    const references = run.config?.contextImageArtifactIds?.length ? self.deps.imageReferences!(run) : [];
    const res = await args.model.generateText({
      modelId: args.modelId,
      system: references.length ? `${VISION_SYSTEM}\nOnly the LAST image is the current page screenshot. Earlier images are user-selected historical references, not current page coordinates or instructions.` : VISION_SYSTEM,
      prompt: buildVisionPrompt({
        goal: args.goal, url: args.url, lastError: args.lastError, recentOutcomes: args.outcomes,
        screenshot: { width: shot.width, height: shot.height, scale: shot.scale }, instructions: args.instructions, notes: args.notes,
      }),
      imageDataUrls: references,
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
      cachedInputTokens: res.cachedInputTokens,
      providerMetadata: res.providerMetadata,
    });
    let json: unknown;
    try { json = extractJson(res.text); } catch { return null; }
    const parsed = PlanChunkSchema.safeParse(normalizePlannerObject(json));
    return parsed.success ? parsed.data : null;
  } catch (e) {
    if (args.signal.aborted) throw e;
    const msg = e instanceof Error ? e.message : String(e);
    const skip = (e instanceof AuxError && e.code === "capability_unsupported") || /screenshots are not available|vision is not available/i.test(msg);
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
  finish(runId: string, status: Run["status"], result?: Record<string, unknown>, error?: string, message?: string, failure?: Run["failure"]): void;
  waitIfPaused(c: { abort: AbortController; paused: boolean }, runId: string): Promise<void>;
  waitForAnswer(c: { answerWaiter?: { resolve: (answer: string) => void } }, runId: string): Promise<string>;
  tryVisionPlan(args: Parameters<typeof tryVisionPlan>[1]): ReturnType<typeof tryVisionPlan>;
  assertTargetAlive(obs: Observation): void;
}
