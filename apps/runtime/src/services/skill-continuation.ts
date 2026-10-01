import { checkNightShiftDispatch } from "../features/overnight-review/service.js";
import { AuxError, EventTypes, type PlanStep, type Routine, type Run } from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { PageService } from "./pages.js";
import type { EventBus } from "../events.js";
import { skillPageOrigin, skillReplayProofDigest } from "./skill-replay.js";

type Context = { repo: Repo; pages: PageService; events: EventBus };
type Continuation = {
  routineId: string; revision: number; digest: string; pageId: string; sessionId: string;
  documentEpoch: number; controllerEpoch: number; origins: string[]; steps: PlanStep[];
  next: number; inFlight: boolean; receipts: string[];
};
const active = new WeakMap<Repo, Set<string>>();
function initialize(repo: Repo): void {
  if (!repo.columnCipher) throw new AuxError("permission_denied", "Skill replay requires protected local storage.");
  repo.db.exec("CREATE TABLE IF NOT EXISTS skill_continuations(run_id TEXT PRIMARY KEY,payload TEXT NOT NULL)");
}
function save(repo: Repo, runId: string, state: Continuation): void {
  repo.db.prepare("INSERT INTO skill_continuations(run_id,payload) VALUES(?,?) ON CONFLICT(run_id) DO UPDATE SET payload=excluded.payload")
    .run(runId, repo.protectRecordField("skill_continuations", [runId], "payload", JSON.stringify(state)));
}
function load(repo: Repo, runId: string): Continuation {
  initialize(repo);
  const row = repo.db.prepare("SELECT payload FROM skill_continuations WHERE run_id=?").get(runId) as { payload: string } | undefined;
  if (!row) throw new AuxError("conflict", "This Skill has no resumable reviewed execution.");
  return JSON.parse(repo.revealRecordField("skill_continuations", [runId], "payload", row.payload)!) as Continuation;
}
function update(context: Context, runId: string, status: Run["status"], message: string, error?: string, result?: Run["result"]): void {
  const run = context.repo.getRun(runId);
  if (!run || !["running", "needs_input", "paused"].includes(run.status)) return;
  const next: Run = { ...run, status, statusMessage: message, error, ...(status === "completed" ? { result } : {}),
    ...(["completed", "failed", "cancelled"].includes(status) ? { endedAt: Date.now() } : {}) };
  context.repo.saveRun(next);
  context.events.emit(EventTypes.RunUpdated, { run: next }, runId);
}
function validate(context: Context, state: Continuation): void {
  const row = context.repo.db.prepare("SELECT revision,json,archived_at FROM routines WHERE routine_id=?")
    .get(state.routineId) as { revision: number; json: string; archived_at: number | null } | undefined;
  const replay = row && (JSON.parse(row.json) as Routine).replay;
  if (!row || row.archived_at !== null || row.revision !== state.revision || !replay || replay.digest !== state.digest || skillReplayProofDigest(replay) !== state.digest)
    throw new AuxError("conflict", "The reviewed Skill changed. Test its current revision again.");
  const page = context.pages.get(state.pageId);
  if (page.sessionId !== state.sessionId || page.documentEpoch !== state.documentEpoch || page.controllerEpoch !== state.controllerEpoch
    || !state.origins.includes(skillPageOrigin(context.pages, state.pageId)))
    throw new AuxError("conflict", "The Skill attachment or document changed. Review a fresh execution.");
}

/** Only successful durable receipts advance the cursor; an interrupted dispatch is never retried. */
async function execute(context: Context, runId: string, approvalId?: string): Promise<void> {
  let owned = active.get(context.repo);
  if (!owned) { owned = new Set(); active.set(context.repo, owned); }
  if (owned.has(runId)) throw new AuxError("conflict", "This Skill is already executing.");
  owned.add(runId);
  try {
    const state = load(context.repo, runId);
    if (state.inFlight) throw new AuxError("conflict", "A previous dispatch was interrupted. Review its result before a fresh test.");
    validate(context, state);
    let extracted: Run["result"];
    while (state.next < state.steps.length) {
      const run = context.repo.getRun(runId);
      if (!run || run.status !== "running") return;
      await checkNightShiftDispatch(context.repo, runId);
      if (context.repo.getRun(runId)?.status !== "running") return;
      validate(context, state);
      const step = state.steps[state.next]!;
      const before = new Set(context.repo.listSteps(runId).map(record => record.stepId));
      state.inFlight = true; save(context.repo, runId, state);
      let result;
      try {
        result = await context.pages.execute({ pageId: state.pageId, steps: [step] }, {
          runId, taskId: run.config?.taskId, taskRevision: run.config?.taskRevision, allowEval: false,
          ...(approvalId ? { safety: { steps: { [step.id]: { approvalId } } } } : {}),
          checkValid: () => { if (!["running", "paused"].includes(context.repo.getRun(runId)?.status ?? "")) throw new AuxError("cancelled", "Skill execution stopped."); },
        });
      } catch (error) {
        // The real executor preflight throws before journaling or dispatch.
        // A later failure with a ledger row cannot be safely retried.
        const dispatched = context.repo.listSteps(runId).some(record => !before.has(record.stepId));
        if (error instanceof AuxError && error.code === "needs_input" && !dispatched) {
          state.inFlight = false; save(context.repo, runId, state);
          update(context, runId, "needs_input", "Skill replay needs your approval"); return;
        }
        throw error;
      }
      const records = context.repo.listSteps(runId).filter(record => !before.has(record.stepId));
      const { id: _id, op: _op, timeoutMs: _timeout, optional: _optional, expect: _expect, ...inputs } = step;
      const receipt = records[0];
      if (result.status !== "completed" || records.length !== 1 || !receipt || receipt.pageId !== state.pageId || receipt.op !== step.op
        || JSON.stringify(receipt.inputs) !== JSON.stringify(inputs) || receipt.outcome?.status !== "ok"
        || receipt.outcome.effect === "uncertain" || receipt.outcome.receipt?.uncertain || receipt.outcome.receipt?.unconfirmed)
        throw new AuxError("conflict", "This dispatch lacks a verified receipt. Review its result; it will not be repeated.");
      extracted = result.extracted;
      state.receipts.push(receipt.stepId); state.next++; state.inFlight = false;
      const page = context.pages.get(state.pageId);
      if (page.sessionId !== state.sessionId || page.controllerEpoch !== state.controllerEpoch || !state.origins.includes(skillPageOrigin(context.pages, state.pageId)))
        throw new AuxError("conflict", "The Skill attachment or reviewed site changed during dispatch.");
      state.documentEpoch = page.documentEpoch;
      save(context.repo, runId, state);
      approvalId = undefined;
    }
    const ledger = context.repo.listSteps(runId);
    if (state.steps.at(-1)?.op !== "waitFor" || ledger.length !== state.receipts.length || ledger.some(record => !state.receipts.includes(record.stepId)))
      throw new AuxError("conflict", "The Skill lacks its complete verified final oracle.");
    validate(context, state);
    update(context, runId, "completed", "Skill replay finished", undefined, extracted);
  } catch (error) {
    update(context, runId, "failed", "Skill replay needs review", error instanceof Error ? error.message : String(error));
  } finally { owned.delete(runId); }
}

export function launchSkillContinuation(input: Context & { run: Run; routine: Routine; pageId: string; steps: PlanStep[] }): void {
  initialize(input.repo);
  const page = input.pages.get(input.pageId);
  if (!page.sessionId) throw new AuxError("conflict", "The Skill page has no live attachment.");
  save(input.repo, input.run.runId, { routineId: input.routine.routineId, revision: input.routine.revision,
    digest: input.routine.replay!.digest, pageId: input.pageId, sessionId: page.sessionId,
    documentEpoch: page.documentEpoch, controllerEpoch: page.controllerEpoch, origins: [...input.routine.replay!.siteOrigins],
    steps: input.steps, next: 0, inFlight: false, receipts: [] });
  void execute(input, input.run.runId);
}

/** Called exclusively after the real owner approval handler resolves this exact suspension. */
export function resumeSkillApproval(context: Context, runId: string, approvalId: string, approved: boolean): boolean {
  const run = context.repo.getRun(runId);
  if (run?.config?.implementation !== "skill-replay") return false;
  if (run.config.nightShiftItemId) throw new AuxError("permission_denied", "Apply this overnight result before deciding its foreground approval.");
  if (run.status !== "needs_input") throw new AuxError("conflict", "This Skill is no longer awaiting that approval.");
  const answered = context.repo.db.prepare("SELECT state FROM safety_suspensions WHERE run_id=? AND approval_id=? ORDER BY created_at DESC LIMIT 1")
    .get(runId, approvalId) as { state: string } | undefined;
  if (answered?.state !== (approved ? "answered" : "cancelled")) throw new AuxError("permission_denied", "The Skill approval has not been resolved by its owner.");
  const decision = context.repo.db.prepare("SELECT state,decision,turn_id,expires_at FROM safety_approval_requests WHERE approval_id=?")
    .get(approvalId) as { state: string; decision: string; turn_id: string; expires_at: number } | undefined;
  if (!decision || decision.turn_id !== runId || decision.expires_at <= Date.now()
    || (approved ? !["accepted", "consumed"].includes(decision.state) || !["accept", "acceptForSession", "acceptForOrigin"].includes(decision.decision)
      : !["declined", "cancelled"].includes(decision.state)))
    throw new AuxError("permission_denied", "This Skill lacks a current owner decision for its exact turn.");
  if (!approved) { update(context, runId, "cancelled", "Skill replay declined"); return true; }
  const state = load(context.repo, runId);
  if (state.inFlight) throw new AuxError("conflict", "An interrupted dispatch requires review, not a retry.");
  try { validate(context, state); }
  catch (error) { update(context, runId, "failed", "Skill replay needs review", error instanceof Error ? error.message : String(error)); throw error; }
  update(context, runId, "running", "Continuing reviewed Skill steps");
  void execute(context, runId, approvalId);
  return true;
}

/** A paused replay may resume only between verified dispatches, never while awaiting consent. */
export function resumePausedSkill(context: Context, runId: string): Run | undefined {
  const run = context.repo.getRun(runId);
  if (run?.config?.implementation !== "skill-replay") return undefined;
  if (run.status !== "paused") throw new AuxError("conflict", "Resolve the current Skill review before resuming.");
  const state = load(context.repo, runId);
  if (state.inFlight || active.get(context.repo)?.has(runId)) throw new AuxError("conflict", "The current dispatch is still settling. Resume after its receipt arrives.");
  try { validate(context, state); }
  catch (error) { update(context, runId, "failed", "Skill replay needs review", error instanceof Error ? error.message : String(error)); throw error; }
  update(context, runId, "running", "Continuing reviewed Skill steps");
  void execute(context, runId);
  return context.repo.getRun(runId)!;
}
