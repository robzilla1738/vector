import { randomUUID } from "node:crypto";
import { AuxError, GoalCreateParams, GoalSchema, newRunId, type Goal } from "@aux/contracts";
import { MODEL_REGISTRY, modelCapabilities, registryCostUsd, type ModelCapability } from "@aux/contracts/model-registry";
import { modelCallCost, type ModelAttempt } from "../agent/model-client.js";
import type { Repo } from "../store/repo.js";
import type { RunService } from "./runs.js";

type Row = { goal_id: string; workspace_id: string; status: Goal["status"]; run_id: string | null; body: string; created_at: number; updated_at: number };
type RunControl = Pick<RunService, "start" | "pause" | "resume" | "cancel">;
type Reservation = { id: string; modelId: string; tokens: number; costUsd: number;
  state: "pending" | "settled"; opaque?: boolean; recordedCalls?: number;
  inputUsdPerMTok?: number; outputUsdPerMTok?: number };
type BudgetLedger = { reservations: Reservation[] };
type BudgetRequest = { modelId: string; promptBytes: number; maxOutputTokens: number; toolsBytes: number };

export class GoalService {
  constructor(private repo: Repo, private runs: RunControl,
    private models: () => Promise<readonly ModelCapability[]> = async () => MODEL_REGISTRY) {
    // A crash between reserving a goal and linking its run is ambiguous. Never retry it automatically.
    this.repo.db.prepare("UPDATE goals SET status='needs_input',run_id=NULL,updated_at=? WHERE status='starting' AND (run_id IS NULL OR run_id NOT IN (SELECT run_id FROM runs))").run(Date.now());
  }

  private seal(goalId: string, body: object): string {
    return this.repo.protectRecordField("goals", [goalId], "body", JSON.stringify(body));
  }

  private open(goalId: string, body: string): Record<string, unknown> {
    return JSON.parse(this.repo.revealRecordField("goals", [goalId], "body", body)) as Record<string, unknown>;
  }

  private ledger(runId: string): BudgetLedger {
    return this.repo.getSetting<BudgetLedger>(`goalBudget:${runId}`) ?? { reservations: [] };
  }

  private saveLedger(runId: string, ledger: BudgetLedger): void {
    this.repo.setSetting(`goalBudget:${runId}`, ledger);
  }

  /** Persist capacity before a provider call. An unjoined attempt keeps its full hold after restart. */
  async reserveModelCall(runId: string, request: BudgetRequest): Promise<string | undefined> {
    const row = this.repo.db.prepare("SELECT goal_id FROM goals WHERE run_id=?").get(runId) as { goal_id: string } | undefined;
    if (!row) return undefined;
    const goal = this.get(row.goal_id);
    const run = this.repo.getRun(runId);
    if (!run || !["queued", "planning", "running"].includes(run.status) || goal.status !== "active")
      throw new AuxError("conflict", "This Goal is not active; no model call was sent.");
    if (goal.budget.deadlineMs !== undefined && Date.now() - run.createdAt >= goal.budget.deadlineMs)
      throw new AuxError("step_failed", "Goal time limit exhausted before model dispatch.");
    const models = await this.models();
    // UTF-8 bytes upper-bound visible text tokens; allow extra serialization overhead.
    const inputTokens = Math.ceil(request.promptBytes + request.toolsBytes + 1024);
    const outputTokens = request.maxOutputTokens;
    if (!Number.isSafeInteger(inputTokens) || !Number.isSafeInteger(outputTokens) || outputTokens < 1
      || inputTokens < 1 || inputTokens + outputTokens > 10_000_000)
      throw new AuxError("invalid_params", "The Goal model request cannot be bounded.");
    const tokens = inputTokens + outputTokens;
    const cost = registryCostUsd(request.modelId, { inputTokens, outputTokens }, models);
    if (goal.budget.maxCostUsd !== undefined && (cost === undefined || !Number.isFinite(cost)))
      throw new AuxError("permission_denied", "Goal cost limit requires a priced model before dispatch.");
    const ledger = this.ledger(runId);
    if (ledger.reservations.some(item => item.state === "pending" || item.opaque))
      throw new AuxError("conflict", "A prior Goal model call has an uncertain charge. Review it before continuing.");
    if (this.repo.listModelCalls(runId).length !== ledger.reservations.reduce((sum, item) => sum + (item.recordedCalls ?? 0), 0))
      throw new AuxError("conflict", "This Goal has model calls outside its funded ledger. Review before continuing.");
    const chargedTokens = ledger.reservations.reduce((sum, item) => sum + item.tokens, 0);
    const chargedCost = ledger.reservations.reduce((sum, item) => sum + item.costUsd, 0);
    if (goal.budget.maxTokens !== undefined && chargedTokens + tokens > goal.budget.maxTokens)
      throw new AuxError("step_failed", "Goal token limit exhausted before model dispatch.");
    if (goal.budget.maxCostUsd !== undefined && chargedCost + cost! > goal.budget.maxCostUsd)
      throw new AuxError("step_failed", "Goal cost limit exhausted before model dispatch.");
    if (ledger.reservations.length >= 256)
      throw new AuxError("step_failed", "Goal model-call limit exhausted.");
    const id = randomUUID();
    const price = modelCapabilities(request.modelId, models);
    ledger.reservations.push({ id, modelId: request.modelId, tokens, costUsd: cost ?? 0, state: "pending",
      inputUsdPerMTok: price?.inputUsdPerMTok, outputUsdPerMTok: price?.outputUsdPerMTok });
    this.saveLedger(runId, ledger);
    return id;
  }

  /** Called only after the model-call record is durable. Missing usage retains its full reservation. */
  settleModelCall(runId: string, reservationId: string | undefined, attempts: ModelAttempt[]): void {
    if (!reservationId) return;
    const ledger = this.ledger(runId);
    const entry = ledger.reservations.find(item => item.id === reservationId);
    if (!entry || entry.state !== "pending") throw new AuxError("conflict", "Goal model reservation changed.");
    const exact = attempts.length === 1 && attempts[0]?.modelId === entry.modelId
      && Number.isFinite(attempts[0].inputTokens) && Number.isFinite(attempts[0].outputTokens)
      && attempts[0].inputTokens! >= 0 && attempts[0].outputTokens! >= 0;
    const reported = exact ? modelCallCost(entry.modelId, attempts[0]!) : undefined;
    const estimated = exact && entry.inputUsdPerMTok !== undefined && entry.outputUsdPerMTok !== undefined
      ? (attempts[0]!.inputTokens! * entry.inputUsdPerMTok
        + attempts[0]!.outputTokens! * entry.outputUsdPerMTok) / 1_000_000 : undefined;
    const actualCost = reported?.costUsd !== undefined && !reported.costEstimated ? reported.costUsd : estimated;
    entry.recordedCalls = this.repo.listModelCalls(runId).length
      - ledger.reservations.reduce((sum, item) => sum + (item.recordedCalls ?? 0), 0);
    if (entry.recordedCalls < 1) return; // no durable call record: retain the pending hold
    entry.state = "settled";
    if (entry.recordedCalls < 1 || entry.recordedCalls > attempts.length + 1) entry.opaque = true;
    if (!entry.opaque && exact && actualCost !== undefined && Number.isFinite(actualCost)) {
      entry.tokens = attempts[0]!.inputTokens! + attempts[0]!.outputTokens!;
      entry.costUsd = actualCost;
    } else entry.opaque = true;
    this.saveLedger(runId, ledger);
  }

  create(raw: unknown): Goal {
    const input = GoalCreateParams.parse(raw);
    if (!this.repo.db.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(input.workspaceId))
      throw new AuxError("not_found", "Space does not exist");
    if (input.chatId) {
      const assigned = this.repo.getSetting<unknown>(`conversationWorkspace:${input.chatId}`);
      if (typeof assigned === "string" && assigned !== input.workspaceId)
        throw new AuxError("permission_denied", "This conversation belongs to another Space.");
      // The conversation ID is inside the protected body. Inspect all Goals
      // through the authenticated reader so a second Space cannot bypass the thread limit.
      const peers = this.repo.db.prepare("SELECT goal_id,body FROM goals")
        .all() as { goal_id: string; body: string }[];
      if (peers.some(peer => this.open(peer.goal_id, peer.body).chatId === input.chatId &&
          !["completed", "failed", "cancelled"].includes(this.get(peer.goal_id).status)))
        throw new AuxError("conflict", "Finish or cancel the current Goal in this conversation first.");
    }
    const now = Date.now();
    const goal = GoalSchema.parse({ ...input, goalId: randomUUID(), status: "draft", usedTokens: 0,
      knownCostUsd: 0, costComplete: true, createdAt: now, updatedAt: now });
    this.repo.db.prepare("INSERT INTO goals(goal_id,workspace_id,status,run_id,body,created_at,updated_at) VALUES(?,?,?,?,?,?,?)")
      .run(goal.goalId, goal.workspaceId, goal.status, null, this.seal(goal.goalId, goal), now, now);
    return goal;
  }

  get(goalId: string): Goal {
    const row = this.repo.db.prepare("SELECT * FROM goals WHERE goal_id=?").get(goalId) as Row | undefined;
    if (!row) throw new AuxError("not_found", "Goal does not exist");
    const goal = GoalSchema.parse({ ...this.open(row.goal_id, row.body), goalId: row.goal_id, workspaceId: row.workspace_id,
      status: row.status, runId: row.run_id ?? undefined, createdAt: row.created_at, updatedAt: row.updated_at });
    return this.refresh(goal);
  }

  list(workspaceId?: string, limit = 100): Goal[] {
    const rows = (workspaceId
      ? this.repo.db.prepare("SELECT goal_id FROM goals WHERE workspace_id=? ORDER BY updated_at DESC LIMIT ?").all(workspaceId, limit)
      : this.repo.db.prepare("SELECT goal_id FROM goals ORDER BY updated_at DESC LIMIT ?").all(limit)) as { goal_id: string }[];
    return rows.map(row => this.get(row.goal_id));
  }

  async start(goalId: string, pageIds: string[]): Promise<Goal> {
    const goal = this.get(goalId);
    if (goal.status !== "draft") throw new AuxError("conflict", "This goal has already started or needs review.");
    if (!pageIds.length || pageIds.length > 8 || new Set(pageIds).size !== pageIds.length)
      throw new AuxError("invalid_params", "Choose one to eight distinct pages for this goal.");
    const reservedRunId = newRunId();
    const reserved = this.repo.db.prepare("UPDATE goals SET status='starting',run_id=?,updated_at=? WHERE goal_id=? AND status='draft'")
      .run(reservedRunId, Date.now(), goalId);
    if (reserved.changes !== 1) throw new AuxError("conflict", "This goal changed. Refresh and try again.");
    try {
      const run = await this.runs.start({ deliveryRunId: reservedRunId, engine: "agent-loop", goal: goal.objective, pageIds, chatId: goal.chatId,
        defaultWorkspaceId: goal.workspaceId,
        maxTokens: goal.budget.maxTokens, maxCostUsd: goal.budget.maxCostUsd, deadlineMs: goal.budget.deadlineMs });
      if (run.runId !== reservedRunId) throw new AuxError("conflict", "Goal run identity changed during launch.");
      this.repo.db.prepare("UPDATE goals SET status='active',updated_at=? WHERE goal_id=? AND status='starting'")
        .run(Date.now(), goalId);
      return this.get(goalId);
    } catch (error) {
      // The run start failed before a run ID was linked. Require review if the outcome is ambiguous.
      this.repo.db.prepare("UPDATE goals SET status='needs_input',run_id=?,updated_at=? WHERE goal_id=? AND status='starting'")
        .run(this.repo.getRun(reservedRunId) ? reservedRunId : null, Date.now(), goalId);
      throw error;
    }
  }

  pause(goalId: string): Goal { return this.control(goalId, "pause"); }
  resume(goalId: string): Goal { return this.control(goalId, "resume"); }
  /** A model can pause its own Goal or report a blocker. The owner alone sets budgets. */
  report(runId: string, status: "paused" | "blocked", blocker: string | undefined, turn: number): { status: string; remaining?: number } {
    const row = this.repo.db.prepare("SELECT goal_id FROM goals WHERE run_id=?").get(runId) as { goal_id: string } | undefined;
    if (!row) throw new AuxError("capability_unsupported", "This run is not a Goal.");
    const goal = this.get(row.goal_id);
    if (goal.status !== "active") throw new AuxError("conflict", "This Goal is not active.");
    if (status === "blocked" && (!blocker?.trim() || blocker.length > 2_000))
      throw new AuxError("invalid_params", "Describe the same blocker in 1–2,000 characters.");
    const normalized = blocker?.trim();
    const streak = status === "blocked"
      ? goal.blocker === normalized && goal.lastBlockerTurn === turn - 1 ? Math.min(3, (goal.blockerStreak ?? 0) + 1) : 1
      : 0;
    if (goal.lastBlockerTurn !== undefined && turn <= goal.lastBlockerTurn)
      throw new AuxError("conflict", "Report at most once per model turn.");
    const blocked = status === "blocked" && streak >= 3;
    const next = GoalSchema.parse({ ...goal, status: blocked ? "blocked" : goal.status,
      blocker: status === "blocked" ? normalized : undefined, blockerStreak: streak,
      lastBlockerTurn: turn, updatedAt: Date.now() });
    this.repo.db.prepare("UPDATE goals SET status=?,body=?,updated_at=? WHERE goal_id=?")
      .run(next.status, this.seal(next.goalId, next), next.updatedAt, next.goalId);
    if (status === "paused" || blocked) this.runs.pause(runId);
    return blocked ? { status: "blocked" } : status === "paused" ? { status: "paused" }
      : { status: "still_active", remaining: 3 - streak };
  }
  cancel(goalId: string): Goal {
    const goal = this.get(goalId);
    const run = goal.runId ? this.repo.getRun(goal.runId) : undefined;
    if ((!goal.runId && ["draft", "needs_input"].includes(goal.status))
      || (goal.status === "needs_input" && run && ["failed", "interrupted", "cancelled"].includes(run.status))) {
      const next = GoalSchema.parse({ ...goal, status: "cancelled", updatedAt: Date.now() });
      this.repo.db.prepare("UPDATE goals SET status=?,body=?,updated_at=? WHERE goal_id=?")
        .run(next.status, this.seal(next.goalId, next), next.updatedAt, next.goalId);
      return next;
    }
    return this.control(goalId, "cancel");
  }

  private control(goalId: string, action: "pause" | "resume" | "cancel"): Goal {
    const goal = this.get(goalId);
    if (!goal.runId) throw new AuxError("conflict", "Start this goal before changing its run.");
    if (action === "pause" && goal.status !== "active" || action === "resume" && !["paused", "blocked"].includes(goal.status)
      || action === "cancel" && !["active", "paused", "blocked", "needs_input"].includes(goal.status))
      throw new AuxError("conflict", "This goal cannot make that transition.");
    this.runs[action](goal.runId);
    if (action === "resume" && goal.status === "blocked") {
      this.repo.db.prepare("UPDATE goals SET status='active',body=?,updated_at=? WHERE goal_id=?")
        .run(this.seal(goal.goalId, { ...goal, status: "active", blocker: undefined, blockerStreak: 0,
          lastBlockerTurn: undefined }), Date.now(), goal.goalId);
    }
    return this.get(goalId);
  }

  private refresh(goal: Goal): Goal {
    if (!goal.runId) return goal;
    const run = this.repo.getRun(goal.runId);
    if (!run) return goal;
    const ledger = this.ledger(goal.runId);
    const hasPending = ledger.reservations.some(item => item.state === "pending" || item.opaque);
    const verified = (this.repo.loadCheckpoint(`run:${goal.runId}`, "goal_verified") as
      { accepted?: boolean } | undefined)?.accepted === true;
    const status: Goal["status"] = goal.status === "cancelled" ? "cancelled"
      : run.status === "completed" ? verified ? "completed" : "failed"
      : hasPending && ["failed", "interrupted", "partially_completed"].includes(run.status) ? "needs_input"
      : run.status === "failed" || run.status === "interrupted" || run.status === "partially_completed" ? "failed"
      : run.status === "cancelled" ? "cancelled" : run.status === "paused" ? goal.status === "blocked" ? "blocked" : "paused"
      : run.status === "needs_input" ? "needs_input" : "active";
    const calls = this.repo.listModelCalls(goal.runId);
    const usedTokens = calls.reduce((total, call) => total + (call.inputTokens ?? 0) + (call.outputTokens ?? 0), 0);
    const knownCostUsd = calls.reduce((total, call) => total + (call.costUsd ?? 0), 0);
    const costComplete = calls.every(call => call.costUsd !== undefined);
    const held = ledger.reservations.filter(item => item.state === "pending" || item.opaque);
    const reservedTokens = held.reduce((total, item) => total + item.tokens, 0);
    const reservedCostUsd = held.reduce((total, item) => total + item.costUsd, 0);
    if (status === goal.status && usedTokens === goal.usedTokens && knownCostUsd === goal.knownCostUsd
      && costComplete === goal.costComplete && reservedTokens === (goal.reservedTokens ?? 0)
      && reservedCostUsd === (goal.reservedCostUsd ?? 0)) return goal;
    const next = GoalSchema.parse({ ...goal, status, usedTokens, knownCostUsd, costComplete,
      reservedTokens, reservedCostUsd, updatedAt: Date.now() });
    this.repo.db.prepare("UPDATE goals SET status=?,body=?,updated_at=? WHERE goal_id=?")
      .run(next.status, this.seal(next.goalId, next), next.updatedAt, next.goalId);
    return next;
  }
}
