import {
  PlanChunkSchema,
  CompletedGeneratedFileSchema,
  ResultCitationSchema,
  type GeneratedResultSpec,
  type ResultCitation,
  AuxError,
  type Observation,
  type PlanChunk,
  type Run,
  type StepOutcome,
} from "@aux/contracts";
import { z } from "zod";
import { renderObservation } from "../services/observation-render.js";
import type { ModelClient } from "./model-client.js";
import { normalizePlannerObject } from "./gateway-client.js";
import { extractJson } from "./json-text.js";
import { attemptsOf, DEFAULT_MAX_MODEL_CALLS } from "./model-client.js";
import { isConsequential } from "./permissions.js";
import { buildVisionPrompt, VISION_SYSTEM, redactObservation } from "./planner.js";
import { DurableWriteLedger } from "./durable.js";
import type { CompiledSkill } from "./skills.js";
import type { CoordinatorDeps } from "./coordinator.js";
import { agentModelRoute } from "@aux/contracts/model-registry";

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

/** Verification v2 — navigation family ops are never counted as writes. */
export const NAV_OPS: ReadonlySet<string> = new Set(["navigate", "back", "forward", "reload"]);

/**
 * Verification v2 — navigation family ops are never counted as writes. A
 * completed write with no observed post-state is marked `unconfirmed` on its
 * receipt (the user sees it) — it does not fail the run. Returns the marked
 * step ids.
 */
export function markUnconfirmedWrites(outcomes: StepOutcome[]): string[] {
  const unconfirmed: string[] = [];
  for (const o of outcomes) {
    if (o.status !== "ok" || !isConsequential(o.op) || NAV_OPS.has(o.op)) continue;
    if (o.receipt?.observed || o.receipt?.remoteConfirmed === true || o.effect === "observed") continue;
    unconfirmed.push(o.stepId);
    o.receipt = {
      remoteConfirmed: false,
      uncertain: false,
      dispatchedBeforeTakeover: false,
      ...o.receipt,
      unconfirmed: true,
    };
  }
  return unconfirmed;
}

/** Normalize for quote matching — rendered text reflows; whitespace is not load-bearing. */
const normalizeQuote = (text: string) => text.replace(/\s+/g, " ").trim().toLowerCase();

/** Look up the rendered text for a citation's snapshot — observationId first, then pageId@revision, then latest pageId. */
function citationKeys(citation: ResultCitation): string[] {
  const keys: string[] = [];
  if (citation.observationId) keys.push(citation.observationId);
  if (citation.pageId && citation.revision !== undefined) keys.push(`${citation.pageId}@${citation.revision}`);
  if (citation.pageId) keys.push(citation.pageId);
  return keys;
}

/**
 * Verification v2 — every cited quote must appear verbatim (modulo
 * whitespace/case) in the rendered text of the cited snapshot. Paraphrase
 * around the quotes is allowed; only quoted spans are binding. Returns the
 * indexes of citations whose quote could not be verified.
 */
export function verifyResultCitations(
  citations: ResultCitation[],
  snapshotTexts: ReadonlyMap<string, string>,
): { unverified: number[]; missing: number[] } {
  const unverified: number[] = [];
  const missing: number[] = [];
  citations.forEach((citation, index) => {
    const key = citationKeys(citation).find((k) => snapshotTexts.has(k));
    if (key === undefined) { missing.push(index); return; }
    if (!normalizeQuote(snapshotTexts.get(key)!).includes(normalizeQuote(citation.quote))) unverified.push(index);
  });
  return { unverified, missing };
}

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

type Claim = { text: string; numeric: boolean; strict?: boolean; invalid?: boolean };

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

/** Keep report formatting out of evidence matching while checking every factual line. */
function reportClaims(report: string, allowedSourceText: string, citedSources: {url:string;text:string}[]): Claim[] {
  const claims: Claim[] = [];
  for (const line of report.split(/\r?\n/)) {
    const citations = [...line.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map(match => match[1]!.trim().toLowerCase());
    const content = line
      .replace(/\[([^\]]+)\]\([^)]+\)/g, (_link, label: string) => /^(?:source|citation|link|\d+)$/i.test(label.trim()) ? "" : label)
      .replace(/^\s*(?:#{1,6}\s*|[-*+]\s*|\d+\.\s*)/, "")
      .replace(/[*_`~]/g, "").trim().replace(/[.!?]+$/, "");
    for (const url of citations) {
      const matching = citedSources.filter(source => source.url === url);
      if (!/^https?:\/\//.test(url) || !allowedSourceText.includes(url) || !matching.length || (content && !matching.some(source => source.text.includes(content.toLowerCase()))))
        claims.push({text:url,numeric:false,strict:true,invalid:true});
    }
    if (!content || /^(?:report|summary|sources|references)$/i.test(content)) continue;
    claims.push({text:content,numeric:NUMERIC_CLAIM.test(content),strict:true});
  }
  return claims;
}

/** File metadata is presentation; verify every substantive cell, paragraph, bullet and chart value. */
function generatedFileClaims(spec: GeneratedResultSpec): (string | number | boolean | null)[] {
  switch(spec.kind){
    case "csv": return spec.table.rows.slice(1).flat();
    case "xlsx": return spec.sheets.flatMap(sheet=>sheet.rows.slice(1).flat());
    case "docx": return [...spec.paragraphs,...spec.tables.flatMap(table=>table.rows.slice(1).flat())];
    case "pptx": return spec.slides.flatMap(slide=>slide.bullets);
    case "chart": return spec.data.flatMap(point=>Object.values(point));
  }
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
 * (or be the length of an extracted list).
 *
 * Verification v2 write semantics: navigation-family ops are never writes;
 * a write confirmed when a later observation/receipt shows the post-state;
 * writes without one are marked `unconfirmed` (visible, run still completes);
 * only an uncertain dispatch blocks completion.
 */
export function verifyDoneAgainstObservation(
  result: unknown,
  obs: Observation | readonly Observation[],
  outcomes: StepOutcome[],
  documentEvidence?: string,
  artifactEvidence?: string,
  memoryEvidence: readonly { url: string; title: string; text: string }[] = [],
  snapshotTexts?: ReadonlyMap<string, string>,
): { ok: boolean; reason: string; unconfirmedWrites?: string[]; unverifiedQuotes?: number[] } {
  const writeOutcomes = outcomes.filter((o) => o.status === "ok" && isConsequential(o.op) && !NAV_OPS.has(o.op));
  const uncertainWrites = writeOutcomes.filter((o) => o.effect === "uncertain" || o.receipt?.uncertain === true);
  const unconfirmedWrites = markUnconfirmedWrites(outcomes);
  const observations = Array.isArray(obs) ? obs : [obs];
  const text = `${observations.map(observationGroundText).join(" ")} ${outcomeGroundText(outcomes)} ${documentEvidence?.toLowerCase() ?? ""} ${artifactEvidence?.toLowerCase() ?? ""} ${memoryEvidence.map(source => `${source.title} ${source.url} ${source.text}`.toLowerCase()).join(" ")}`;
  const citedSources = observations.map(observation => ({url:observation.content.url.toLowerCase(),text:observationGroundText(observation)}));
  for (const source of memoryEvidence) citedSources.push({ url: source.url.toLowerCase(), text: `${source.title} ${source.text}`.toLowerCase() });
  for (const outcome of outcomes) {
    if (outcome.op !== "calendar.events.list" || outcome.status !== "ok") continue;
    const events = outcome.extracted?.events;
    if (!Array.isArray(events)) continue;
    for (const item of events) {
      if (!item || typeof item !== "object") continue;
      const event = item as { url?: unknown; title?: unknown; start?: unknown; end?: unknown; source?: { accountKey?: unknown } };
      if (typeof event.url !== "string" || typeof event.title !== "string") continue;
      citedSources.push({ url: event.url.toLowerCase(), text: [event.title, event.start, event.end, event.source?.accountKey]
        .filter(value => typeof value === "string").join(" ").toLowerCase() });
    }
  }
  for (const sourceText of [documentEvidence,artifactEvidence]) if (sourceText) {
    const lower = sourceText.toLowerCase();
    for (const match of lower.matchAll(/https?:\/\/[^\s)\]>]+/g)) citedSources.push({url:match[0],text:lower});
  }
  const report = result && typeof result === "object" && !Array.isArray(result) && typeof (result as Record<string, unknown>).report === "string"
    ? (result as Record<string, string>).report : undefined;
  const html = result && typeof result === "object" && !Array.isArray(result) && typeof (result as Record<string, unknown>).html === "string"
    ? (result as Record<string, string>).html : undefined;
  if (html && !report && !(result as Record<string, unknown>).answer)
    return { ok: false, reason: "an HTML preview needs a grounded answer or report" };
  const source=result && typeof result==="object" && !Array.isArray(result) ? result as Record<string,unknown> : {};
  const file=source.file===undefined?undefined:CompletedGeneratedFileSchema.safeParse(source.file);
  if(file && !file.success)return {ok:false,reason:"the generated file source is invalid or too large"};
  if(file && !report && typeof source.answer!=="string")return {ok:false,reason:"a generated file needs a grounded answer or report"};
  // Presentation metadata is not evidence. Substantive file content is checked
  // against the same observed sources as the answer and report.
  const claimsResult={...source};
  delete claimsResult.html;
  delete claimsResult.file;
  // Citations verify as exact quotes against their cited snapshot — they are
  // not generic claims (an observationId would never ground as free text).
  const citationsParsed = source.citations === undefined ? undefined : z.array(ResultCitationSchema).safeParse(source.citations);
  if (citationsParsed && !citationsParsed.success) return { ok: false, reason: "result citations are malformed" };
  delete claimsResult.citations;
  if(file?.success)claimsResult.fileContent=generatedFileClaims(file.data.spec);
  const claims = report
    ? [...collectClaims(Object.fromEntries(Object.entries(claimsResult as Record<string, unknown>).filter(([key]) => key !== "report"))), ...reportClaims(report, text, citedSources)]
    : collectClaims(claimsResult);
  const numbers = claims.some((c) => c.numeric) ? groundNumbers(text, outcomes) : new Set<number>();
  const ungrounded = claims.filter((c) =>
    c.invalid || (c.numeric ? !numbers.has(toNumber(c.text)) && !text.includes(c.text.toLowerCase()) : (c.strict || c.text.length >= 8) && !text.includes(c.text.toLowerCase())),
  );
  if (ungrounded.length > 0) return { ok: false, reason: `ungrounded claims: ${ungrounded.slice(0, 3).map((c) => c.text).join(", ")}` };
  let unverifiedQuotes: number[] | undefined;
  if (citationsParsed?.success && citationsParsed.data.length) {
    // Default snapshot texts match what the model saw — the redacted render.
    const texts = snapshotTexts ?? new Map(observations.flatMap((observation) => {
      const rendered = renderObservation(redactObservation(observation));
      return [[observation.pageId, rendered], [`${observation.pageId}@${observation.revision}`, rendered]] as [string, string][];
    }));
    const checkedCitations = verifyResultCitations(citationsParsed.data, texts);
    unverifiedQuotes = [...checkedCitations.unverified, ...checkedCitations.missing];
    if (unverifiedQuotes.length) return { ok: false, reason: `${unverifiedQuotes.length} cited quote(s) were not found in the cited snapshot`, unconfirmedWrites, unverifiedQuotes };
  }
  // An uncertain dispatch is the only write state that blocks completion.
  if (uncertainWrites.length) return { ok: false, reason: "an uncertain dispatch is recorded in the write ledger", unconfirmedWrites, unverifiedQuotes };
  const checked = claims.filter((c) => c.numeric || c.text.length >= 8);
  const base = { unconfirmedWrites: unconfirmedWrites.length ? unconfirmedWrites : undefined, unverifiedQuotes };
  if (unconfirmedWrites.length) return { ok: true, reason: "writes-unconfirmed", ...base };
  if (checked.length > 0) return { ok: true, reason: "grounded", ...base };
  if (writeOutcomes.length > 0) return { ok: true, reason: "writes-confirmed", ...base };
  return { ok: true, reason: "grounded", ...base };
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
  let modelReturned = false;
  let modelStarted = false;
  try {
    const shot = await self.usePage(args.runId, args.pageId, "read", () => self.deps.pages.capture(args.pageId, { format: "dataUrl" }));
    if (!shot.dataUrl) return null;
    const run = self.get(args.runId);
    if (run.config?.contextImageArtifactIds?.length && !self.deps.imageReferences) throw new AuxError("capability_unsupported", "Image context is unavailable for this run.");
    const references = run.config?.contextImageArtifactIds?.length ? self.deps.imageReferences!(run) : [];
    await self.deps.checkBudget?.({ runId: args.runId });
    modelStarted = true;
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
      reasoning: self.deps.routeModel?.("visual").reasoning ?? agentModelRoute("visual").reasoning,
    });
    modelReturned = true;
    for (const retry of res.retries ?? []) {
      args.onModelCall?.();
      await self.deps.recordModelCall({ ...retry, runId: args.runId, role: "vision", modelId: retry.modelId ?? args.modelId });
    }
    args.onModelCall?.();
    await self.deps.recordModelCall({
      runId: args.runId,
      role: "vision",
      modelId: res.resolvedModelId ?? args.modelId,
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
    if (modelReturned || (!modelStarted && e instanceof AuxError && e.code === "permission_denied")) throw e;
    const msg = e instanceof Error ? e.message : String(e);
    const skip = (e instanceof AuxError && e.code === "capability_unsupported") || /screenshots are not available|vision is not available/i.test(msg);
    const attempts = attemptsOf(e);
    if (modelStarted && (attempts.length || (!skip && !args.signal.aborted))) {
      for (const attempt of attempts.length ? attempts : [{ durationMs: Date.now() - started }]) {
        args.onModelCall?.();
        await self.deps.recordModelCall({ ...attempt, runId: args.runId, role: "vision",
          modelId: attempt.modelId ?? args.modelId, error: attempt.error ?? msg });
      }
    }
    if (args.signal.aborted) throw e;
    return null;
  }
}

export interface CoordinatorLoopHost {
  deps: CoordinatorDeps;
  durable: DurableWriteLedger;
  suspensions: import("../safety/suspensions.js").SuspensionStore;
  skills: CompiledSkill[];
  unresolvedByRun: Map<string, string[]>;
  controls: Map<string, { abort: AbortController; paused: boolean; dispatchAbort?: AbortController; takeoverInterrupted?: boolean; interruptPlanning?: () => void; deadlineHit?: boolean; answerWaiter?: { resolve: (answer: string) => void }; span?: { spanId: string; end(outcome?: "ok" | "failed" | "cancelled", attrs?: Record<string, unknown>): void } }>;
  get(runId: string): Run;
  setStatus(runId: string, status: Run["status"], message?: string): Promise<void>;
  persistCheckpoint(run: Run): void;
  finish(runId: string, status: Run["status"], result?: Record<string, unknown>, error?: string, message?: string, failure?: Run["failure"]): Promise<void>;
  /** Claim one extra page for a live run (agent-loop REPL openTab) — caller keeps the release. */
  claimPage(runId: string, pageId: string, initialDestination?: string): Promise<() => void>;
  waitIfPaused(c: { abort: AbortController; paused: boolean }, runId: string): Promise<void>;
  waitForAnswer(c: { answerWaiter?: { resolve: (answer: string) => void } }, runId: string): Promise<string>;
  ownsPages(runId: string): boolean;
  usePage<T>(runId: string, pageId: string, access: "read" | "act", dispatch: () => Promise<T>): Promise<T>;
  assertPage(runId: string, pageId: string, access: "read" | "act"): Promise<void>;
  refreshPageSelection(runId: string): Promise<string[]>;
  pageSourceCheck(runId: string, pageId: string): () => void;
  ownPage(runId: string, pageId: string): void;
  ownedPages(runId: string): string[];
  tryVisionPlan(args: Parameters<typeof tryVisionPlan>[1]): ReturnType<typeof tryVisionPlan>;
  assertTargetAlive(obs: Observation): void;
}
