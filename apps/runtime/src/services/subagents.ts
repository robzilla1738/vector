import { withRunAuthorityMutation } from "./overnight-authority.js";
import { randomUUID } from "node:crypto";
import { AuxError, EventTypes, newRunId, SubagentGroupCreateParams, SubagentGroupSchema, SubagentSchema,
  SubagentSpawnParams, type Subagent, type SubagentGroup } from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { EventBus } from "../events.js";
import type { RunService } from "./runs.js";

type GroupRow = { body: string; state: SubagentGroup["state"] };
type AgentRow = { body: string; state: Subagent["state"]; run_id: string | null; ended_at: number | null };
const ACTIVE = new Set<Subagent["state"]>(["starting", "running"]);
const RUN_ACTIVE = new Set(["queued", "planning", "running", "paused", "needs_input"]);

/** Child runs share one durable budget and the existing page-ownership coordinator. */
export class SubagentService {
  private unsubscribe: () => void;

  private seal(table: "subagent_groups" | "subagents", id: string, body: object): string {
    return this.repo.protectRecordField(table, [id], "body", JSON.stringify(body));
  }

  private open(table: "subagent_groups" | "subagents", id: string, body: string): Record<string, unknown> {
    return JSON.parse(this.repo.revealRecordField(table, [id], "body", body)) as Record<string, unknown>;
  }

  constructor(private repo: Repo, private events: EventBus, private runs: RunService) {
    void this.reconcile().catch(error => console.error("[aux-runtime] subagent recovery failed", error));
    this.unsubscribe = events.subscribe(event => {
      if (event.type === EventTypes.RunUpdated) {
        const run = event.payload.run;
        if (run && typeof run === "object" && "runId" in run && typeof run.runId === "string") void this.reconcileRun(run.runId).catch(error => console.error("[aux-runtime] subagent retirement failed", error));
      }
      if (event.type === EventTypes.ModelCall && event.runId) void this.enforceBudget(event.runId).catch(error => console.error("[aux-runtime] subagent budget retirement failed", error));
    });
  }

  close() { this.unsubscribe(); }

  private group(groupId: string): SubagentGroup {
    const row = this.repo.db.prepare("SELECT body,state FROM subagent_groups WHERE group_id=?").get(groupId) as GroupRow | undefined;
    if (!row) throw new AuxError("not_found", "Subagent group does not exist.");
    return SubagentGroupSchema.parse({ ...this.open("subagent_groups", groupId, row.body), state: row.state });
  }

  private agent(agentId: string): Subagent {
    const row = this.repo.db.prepare("SELECT body,state,run_id,ended_at FROM subagents WHERE agent_id=?").get(agentId) as AgentRow | undefined;
    if (!row) throw new AuxError("not_found", "Subagent does not exist.");
    return SubagentSchema.parse({ ...this.open("subagents", agentId, row.body), state: row.state, ...(row.run_id ? { runId: row.run_id } : {}),
      endedAt: row.ended_at ?? undefined });
  }

  groupIdForAgent(agentId: string): string { return this.agent(agentId).groupId; }

  /** Read one agent — the REPL cell surface and status views use this. */
  get(agentId: string): Subagent { return this.agent(agentId); }

  /**
   * Await a cell's terminal state — the yield/resume primitive behind the
   * agent loop's `wait(cell)`. Polls the durable row (the reconcile listener
   * flips state on run updates) and returns the child run's outcome.
   */
  async waitFor(agentId: string, timeoutMs: number): Promise<{ state: Subagent["state"]; runId?: string; pending?: boolean; result?: Record<string, unknown>; error?: string }> {
    const deadline = Date.now() + Math.max(0, timeoutMs);
    while (true) {
      const agent = this.agent(agentId);
      const run = agent.runId ? this.repo.getRun(agent.runId) : undefined;
      if (!ACTIVE.has(agent.state))
        return {
          state: agent.state,
          ...(agent.runId ? { runId: agent.runId } : {}),
          ...(run?.result !== undefined ? { result: run.result as Record<string, unknown> } : {}),
          ...(run?.failure?.message ? { error: run.failure.message } : {}),
        };
      if (Date.now() >= deadline) return { state: agent.state, ...(agent.runId ? { runId: agent.runId } : {}), pending: true };
      await new Promise((resolve) => setTimeout(resolve, Math.min(200, Math.max(25, deadline - Date.now()))));
    }
  }

  private agents(groupId: string): Subagent[] {
    return (this.repo.db.prepare("SELECT agent_id FROM subagents WHERE group_id=? ORDER BY created_at,agent_id")
      .all(groupId) as { agent_id: string }[]).map(row => this.agent(row.agent_id));
  }

  private workspaceOf(runId: string): string {
    const run = this.repo.getRun(runId);
    if (!run) throw new AuxError("not_found", "Parent run does not exist.");
    const workspaceId = run.config?.contextWorkspaceId;
    if (!workspaceId || !this.repo.db.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(workspaceId))
      throw new AuxError("permission_denied", "Choose a Space for the parent run before spawning agents.");
    return workspaceId;
  }

  createGroup(raw: unknown): SubagentGroup {
    const input = SubagentGroupCreateParams.parse(raw);
    const parent = this.repo.getRun(input.parentRunId);
    if (!parent || !RUN_ACTIVE.has(parent.status)) throw new AuxError("conflict", "The parent run is no longer active.");
    if (this.repo.db.prepare("SELECT 1 FROM subagents WHERE run_id=?").get(parent.runId))
      throw new AuxError("permission_denied", "Nested subagent groups are unavailable.");
    const workspaceId = this.workspaceOf(parent.runId);
    const now = Date.now();
    const group = SubagentGroupSchema.parse({ ...input, groupId: randomUUID(), workspaceId,
      deadlineAt: now + input.timeBudgetMs, createdAt: now, state: "active" });
    try {
      this.repo.db.prepare("INSERT INTO subagent_groups(group_id,parent_run_id,workspace_id,body,state,created_at) VALUES(?,?,?,?,'active',?)")
        .run(group.groupId, group.parentRunId, group.workspaceId, this.seal("subagent_groups", group.groupId, group), now);
    } catch { throw new AuxError("conflict", "This parent already has a subagent group."); }
    return group;
  }

  private usage(agent: Subagent) {
    if (!agent.runId) return { tokens: agent.tokenAllocation, cost: agent.costAllocationUsd };
    const calls = this.repo.listModelCalls(agent.runId);
    const tokens = calls.reduce((sum, call) => sum + (call.inputTokens ?? 0) + (call.outputTokens ?? 0), 0);
    const cost = calls.reduce((sum, call) => sum + (call.costUsd ?? 0), 0);
    // Unknown usage is charged at the full reservation. Active children reserve
    // their allocation, including unused future calls.
    return { tokens: ACTIVE.has(agent.state) || calls.some(call => call.inputTokens === undefined || call.outputTokens === undefined)
      ? Math.max(tokens, agent.tokenAllocation) : tokens,
    cost: ACTIVE.has(agent.state) || calls.some(call => call.costUsd === undefined)
      ? Math.max(cost, agent.costAllocationUsd) : cost };
  }

  view(groupId: string) {
    const group = this.group(groupId);
    const agents = this.agents(groupId);
    let reservedTokens = 0, reservedCostUsd = 0, usedTokens = 0, usedCostUsd = 0;
    for (const agent of agents) {
      const amount = this.usage(agent);
      if (ACTIVE.has(agent.state)) { reservedTokens += amount.tokens; reservedCostUsd += amount.cost; }
      else { usedTokens += amount.tokens; usedCostUsd += amount.cost; }
    }
    return { group, agents, reservedTokens, reservedCostUsd, usedTokens, usedCostUsd };
  }

  private async reconcileRun(runId: string) {
    const parentGroup = this.repo.db.prepare("SELECT group_id FROM subagent_groups WHERE parent_run_id=? AND state='active'")
      .get(runId) as { group_id: string } | undefined;
    if (parentGroup && !RUN_ACTIVE.has(this.repo.getRun(runId)?.status ?? "missing")) {
      await this.closeGroup(parentGroup.group_id);
      return;
    }
    const row = this.repo.db.prepare("SELECT agent_id FROM subagents WHERE run_id=? AND state IN ('starting','running')")
      .get(runId) as { agent_id: string } | undefined;
    if (!row) return;
    const run = this.repo.getRun(runId);
    if (!run || RUN_ACTIVE.has(run.status)) return;
    const state: Subagent["state"] = run.status === "completed" ? "completed" : run.status === "cancelled" ? "cancelled" : "failed";
    this.repo.db.prepare("UPDATE subagents SET state=?,ended_at=? WHERE agent_id=? AND state IN ('starting','running')")
      .run(state, Date.now(), row.agent_id);
  }

  private async reconcile() {
    const groups = this.repo.db.prepare("SELECT parent_run_id FROM subagent_groups WHERE state='active'")
      .all() as { parent_run_id: string }[];
    for (const group of groups) await this.reconcileRun(group.parent_run_id);
    const rows = this.repo.db.prepare("SELECT agent_id,run_id FROM subagents WHERE state IN ('starting','running')")
      .all() as { agent_id: string; run_id: string | null }[];
    for (const row of rows) {
      const reservedRunId = row.run_id ?? this.agent(row.agent_id).runId;
      if (reservedRunId && this.repo.getRun(reservedRunId)) {
        this.repo.db.prepare("UPDATE subagents SET run_id=? WHERE agent_id=? AND run_id IS NULL").run(reservedRunId, row.agent_id);
        await this.reconcileRun(reservedRunId);
      } else this.repo.db.prepare("UPDATE subagents SET state='interrupted',ended_at=? WHERE agent_id=?")
        .run(Date.now(), row.agent_id);
    }
  }

  private async closeGroup(groupId: string) {
    const group = this.group(groupId);
    await withRunAuthorityMutation(this.repo, async () => {
      this.repo.db.prepare("UPDATE subagent_groups SET state='closed' WHERE group_id=? AND state='active'").run(groupId);
      for (const agent of this.agents(groupId).filter(item => ACTIVE.has(item.state))) {
        if (agent.state === "starting") this.repo.db.prepare("UPDATE subagents SET state='interrupted',ended_at=? WHERE agent_id=? AND state='starting'").run(Date.now(), agent.agentId);
        if (agent.runId && this.repo.getRun(agent.runId)) await this.runs.cancel(agent.runId);
        else this.repo.db.prepare("UPDATE subagents SET state='interrupted',ended_at=? WHERE agent_id=?").run(Date.now(), agent.agentId);
      }
    }, group.parentRunId);
  }

  private async enforceBudget(runId: string) {
    const row = this.repo.db.prepare("SELECT group_id FROM subagents WHERE run_id=?").get(runId) as { group_id: string } | undefined;
    if (!row) return;
    const view = this.view(row.group_id);
    const current = view.agents.find(agent => agent.runId === runId);
    if (current && ACTIVE.has(current.state)) {
      const calls = this.repo.listModelCalls(runId);
      const actualTokens = calls.reduce((sum, call) => sum + (call.inputTokens ?? current.tokenAllocation) + (call.outputTokens ?? 0), 0);
      const actualCost = calls.reduce((sum, call) => sum + (call.costUsd ?? current.costAllocationUsd), 0);
      if (actualTokens > current.tokenAllocation || actualCost > current.costAllocationUsd) {
        await this.runs.cancel(runId);
        return;
      }
    }
    if (view.usedTokens + view.reservedTokens <= view.group.tokenBudget &&
      view.usedCostUsd + view.reservedCostUsd <= view.group.costBudgetUsd && Date.now() < view.group.deadlineAt) return;
    await this.closeGroup(row.group_id);
  }

  async spawn(raw: unknown): Promise<Subagent> {
    const input = SubagentSpawnParams.parse(raw);
    const group = this.group(input.groupId);
    if (group.state !== "active" || Date.now() >= group.deadlineAt)
      throw new AuxError("conflict", "The subagent group has expired or closed.");
    const parent = this.repo.getRun(group.parentRunId);
    if (!parent || !RUN_ACTIVE.has(parent.status)) throw new AuxError("conflict", "The parent run is no longer active.");
    if (new Set(input.pageIds).size !== input.pageIds.length) throw new AuxError("invalid_params", "Choose distinct pages for a subagent.");
    if (input.pageIds.some(pageId => !parent.pageIds.includes(pageId)))
      throw new AuxError("permission_denied", "A subagent cannot expand its parent's page scope.");
    const sourceRunId = input.sourceRunId ?? group.parentRunId;
    if (sourceRunId !== group.parentRunId && !this.repo.db.prepare("SELECT 1 FROM subagents WHERE group_id=? AND run_id=?")
      .get(group.groupId, sourceRunId)) throw new AuxError("permission_denied", "Fork source must belong to this group.");
    const source = this.repo.getRun(sourceRunId);
    if (!source) throw new AuxError("not_found", "Fork source run does not exist.");
    const now = Date.now(), agentId = randomUUID(), childRunId = newRunId();
    this.repo.db.exec("BEGIN IMMEDIATE");
    try {
      if (this.group(group.groupId).state !== "active" || Date.now() >= group.deadlineAt ||
        !RUN_ACTIVE.has(this.repo.getRun(group.parentRunId)?.status ?? "missing"))
        throw new AuxError("conflict", "The parent or subagent group changed before reservation.");
      const activeCount = (this.repo.db.prepare("SELECT count(*) AS n FROM subagents WHERE state IN ('starting','running')")
        .get() as { n: number }).n;
      if (activeCount >= 8) throw new AuxError("conflict", "At most eight subagents can run at once.");
      const view = this.view(group.groupId);
      if (view.usedTokens + view.reservedTokens + input.tokenAllocation > group.tokenBudget ||
        view.usedCostUsd + view.reservedCostUsd + input.costAllocationUsd > group.costBudgetUsd)
        throw new AuxError("permission_denied", "This child exceeds the shared subagent budget.");
      const pageOwners = this.runs.pageOwnership.snapshot();
      if (input.pageIds.some(pageId => pageOwners[pageId] || view.agents.some(agent => ACTIVE.has(agent.state) && agent.pageIds.includes(pageId))))
        throw new AuxError("conflict", "A selected page is already leased to another run.");
      const agent = SubagentSchema.parse({ ...input, agentId, sourceRunId, state: "starting", runId: childRunId, createdAt: now });
      this.repo.db.prepare("INSERT INTO subagents(agent_id,group_id,state,body,created_at) VALUES(?,?,'starting',?,?)")
        .run(agentId, group.groupId, this.seal("subagents", agentId, agent), now);
      this.repo.db.exec("COMMIT");
    } catch (error) { this.repo.db.exec("ROLLBACK"); throw error; }
    try {
      if (this.group(group.groupId).state !== "active") throw new AuxError("conflict", "The subagent group closed before launch.");
      const run = await this.runs.start({ deliveryRunId: childRunId, goal: input.goal, pageIds: input.pageIds, chatId: agentId,
        contextWorkspaceId: group.workspaceId, context: source.config?.context, contextSnapshot: true,
        instructions: `Subagent profile: ${input.profile}. Work within your selected pages and report findings to the parent.`,
        maxModelCalls: input.maxModelCalls, deadlineMs: Math.max(1000, group.deadlineAt - Date.now()),
        maxTokens: input.tokenAllocation, maxCostUsd: input.costAllocationUsd,
        subagentProfile: input.profile });
      const bound = this.repo.db.prepare("UPDATE subagents SET run_id=?,state='running' WHERE agent_id=? AND state='starting'")
        .run(run.runId, agentId);
      if (bound.changes !== 1 || this.group(group.groupId).state !== "active") {
        await this.runs.cancel(run.runId);
        throw new AuxError("conflict", "The subagent group closed during launch.");
      }
      await this.reconcileRun(run.runId);
      return this.agent(agentId);
    } catch (error) {
      // start can create the run before a later launch step rejects. The stable
      // run ID lets us find and stop that child even when start itself throws.
      const launched = this.repo.getRun(childRunId);
      if (launched && RUN_ACTIVE.has(launched.status)) await this.runs.cancel(childRunId);
      this.repo.db.prepare("UPDATE subagents SET state='failed',ended_at=? WHERE agent_id=? AND state='starting'")
        .run(Date.now(), agentId);
      throw error;
    }
  }

  async forkSelf(raw: unknown): Promise<Subagent> {
    const input = SubagentSpawnParams.extend({ sourceRunId: SubagentSpawnParams.shape.sourceRunId.unwrap() }).parse(raw);
    return this.spawn(input);
  }

  sendMessage(agentId: string, expectedRunId: string, text: string) {
    const agent = this.agent(agentId);
    if (agent.state !== "running" || agent.runId !== expectedRunId) throw new AuxError("conflict", "This subagent turn changed.");
    const run = this.repo.getRun(expectedRunId);
    if (!run || !RUN_ACTIVE.has(run.status)) throw new AuxError("conflict", "This subagent has finished.");
    if (Date.now() >= this.group(agent.groupId).deadlineAt) throw new AuxError("conflict", "The shared deadline passed.");
    return this.runs.messages.steer({ messageId: randomUUID(), runId: expectedRunId, chatId: agent.agentId,
      text, pageIds: run.pageIds, contextPageRefs: run.config?.contextPageRefs ?? [],
      expectedRevision: run.config?.messageRevision ?? 0 });
  }

  async cancel(agentId: string) {
    const agent = this.agent(agentId);
    if (agent.runId && ACTIVE.has(agent.state)) await this.runs.cancel(agent.runId);
    this.repo.db.prepare("UPDATE subagents SET state='cancelled',ended_at=? WHERE agent_id=? AND state IN ('starting','running')")
      .run(Date.now(), agentId);
    return this.agent(agentId);
  }
}
