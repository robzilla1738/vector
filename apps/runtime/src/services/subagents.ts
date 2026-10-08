import { narrowCostLimit, resolveAgentProfile } from "./agent-profiles.js";
import { selectAuxPackages } from "./aux-packages.js";
import type { CoderWorktree } from "@aux/contracts";
import { TranscriptStore } from "../agent/loop/transcript.js";
import type { ModelMessage } from "../agent/loop/types.js";
import { resourceFundingAccounting } from "./resource-accounting.js";
import { lineageRuns } from "./run-lineage.js";
import { runRoot } from "./run-lineage.js";
import { withRunAuthorityMutation } from "./overnight-authority.js";
import { randomUUID } from "node:crypto";
import {
  AuxError,
  EventTypes,
  newRunId,
  SubagentGroupCreateParams,
  SubagentGroupSchema,
  CoderWorktreeRecoverySchema,
  SubagentSchema,
  SubagentSpawnParams,
  type Subagent,
  type SubagentGroup,
} from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { EventBus } from "../events.js";
import type { RunService } from "./runs.js";

type GroupRow = { body: string; state: SubagentGroup["state"] };
type AgentRow = { body: string; state: Subagent["state"]; run_id: string | null; ended_at: number | null };
const ACTIVE = new Set<Subagent["state"]>(["starting", "running"]);
const narrowerLimit = (parent: number | undefined, child: number | undefined) => {
  const limits = [parent, child].filter((value): value is number => value !== undefined && value > 0);
  return limits.length ? Math.min(...limits) : undefined;
};
const RUN_ACTIVE = new Set(["queued", "planning", "running", "paused", "needs_input"]);

/** Child runs share one durable budget and the existing page-ownership coordinator. */
export class SubagentService {
  private unsubscribe: () => void;

  constructor(
    private repo: Repo,
    private events: EventBus,
    private runs: RunService,
    private coding?: {
      create(parentRoot: string, parentRunId: string, childRunId: string): Promise<CoderWorktree>;
      recover?(
        parentRunId: string,
        childRunId: string,
      ): import("@aux/contracts").CoderWorktreeRecovery | undefined;
    },
    private publicWebTools: readonly ("webfetch" | "websearch")[] = [],
  ) {
    void this.reconcile().catch((error) => console.error("[aux-runtime] subagent recovery failed", error));
    this.unsubscribe = events.subscribe((event) => {
      if (event.type === EventTypes.RunUpdated) {
        const run = event.payload.run;
        if (run && typeof run === "object" && "runId" in run && typeof run.runId === "string")
          void this.reconcileRun(run.runId).catch((error) =>
            console.error("[aux-runtime] subagent retirement failed", error),
          );
      }
    });
  }

  close() {
    this.unsubscribe();
  }

  private group(groupId: string): SubagentGroup {
    const row = this.repo.db
      .prepare("SELECT body,state FROM subagent_groups WHERE group_id=?")
      .get(groupId) as GroupRow | undefined;
    if (!row) throw new AuxError("not_found", "Subagent group does not exist.");
    return SubagentGroupSchema.parse({
      ...(JSON.parse(row.body) as Record<string, unknown>),
      state: row.state,
    });
  }

  private agent(agentId: string): Subagent {
    const row = this.repo.db
      .prepare("SELECT body,state,run_id,ended_at FROM subagents WHERE agent_id=?")
      .get(agentId) as AgentRow | undefined;
    if (!row) throw new AuxError("not_found", "Subagent does not exist.");
    return SubagentSchema.parse({
      ...(JSON.parse(this.repo.revealRecordField("subagents", [agentId], "body", row.body)) as Record<
        string,
        unknown
      >),
      state: row.state,
      ...(row.run_id ? { runId: row.run_id } : {}),
      endedAt: row.ended_at ?? undefined,
    });
  }

  worktreeFor(agentId: string, parentRunId: string): CoderWorktree {
    const agent = this.agent(agentId);
    if (this.group(agent.groupId).parentRunId !== parentRunId || !agent.worktree)
      throw new AuxError("permission_denied", "This coding worktree does not belong to the parent run.");
    if (ACTIVE.has(agent.state))
      throw new AuxError(
        "conflict",
        "Wait for the coder to finish before inspecting or integrating its worktree.",
      );
    return agent.worktree;
  }
  updateWorktree(agentId: string, worktree: CoderWorktree): void {
    const agent = this.agent(agentId);
    this.repo.db
      .prepare("UPDATE subagents SET body=? WHERE agent_id=?")
      .run(
        this.repo.protectRecordField("subagents", [agentId], "body", JSON.stringify({ ...agent, worktree })),
        agentId,
      );
    if (agent.runId) {
      const run = this.repo.getRun(agent.runId);
      if (run) this.repo.saveRun({ ...run, config: { ...run.config, coderWorktree: worktree } });
    }
  }

  listForParent(runId: string): Subagent[] {
    const row = this.repo.db
      .prepare("SELECT group_id FROM subagent_groups WHERE parent_run_id=?")
      .get(runId) as { group_id: string } | undefined;
    return row ? this.agents(row.group_id) : [];
  }
  recoveryFor(agentId: string, parentRunId: string) {
    const agent = this.agent(agentId);
    if (this.group(agent.groupId).parentRunId !== parentRunId || !agent.recovery)
      throw new AuxError("permission_denied", "This recovery does not belong to the parent run.");
    return agent.recovery;
  }
  updateRecovery(agentId: string, recovery: import("@aux/contracts").CoderWorktreeRecovery) {
    const agent = this.agent(agentId);
    this.repo.db
      .prepare("UPDATE subagents SET body=?,state='interrupted' WHERE agent_id=?")
      .run(
        this.repo.protectRecordField("subagents", [agentId], "body", JSON.stringify({ ...agent, recovery })),
        agentId,
      );
  }

  groupForParent(runId: string): SubagentGroup | undefined {
    const row = this.repo.db
      .prepare("SELECT group_id FROM subagent_groups WHERE parent_run_id=? AND state='active'")
      .get(runId) as { group_id: string } | undefined;
    return row ? this.group(row.group_id) : undefined;
  }

  groupIdForAgent(agentId: string): string {
    return this.agent(agentId).groupId;
  }

  /** Read one agent — the REPL cell surface and status views use this. */
  get(agentId: string): Subagent {
    return this.agent(agentId);
  }

  /**
   * Await a cell's terminal state — the yield/resume primitive behind the
   * agent loop's `wait(cell)`. Polls the durable row (the reconcile listener
   * flips state on run updates) and returns the child run's outcome.
   */
  async waitFor(
    agentId: string,
    timeoutMs: number,
  ): Promise<{
    state: Subagent["state"];
    runId?: string;
    pending?: boolean;
    result?: Record<string, unknown>;
    error?: string;
    recovery?: import("@aux/contracts").CoderWorktreeRecovery;
  }> {
    const deadline = Date.now() + Math.max(0, timeoutMs);
    while (true) {
      const agent = this.agent(agentId);
      const run = agent.runId ? this.repo.getRun(agent.runId) : undefined;
      if (agent.recovery)
        return {
          state: "interrupted",
          runId: agent.runId,
          error: "Coder worktree creation needs recovery.",
          recovery: agent.recovery,
        };
      if (!ACTIVE.has(agent.state))
        return {
          state: agent.state,
          ...(agent.runId ? { runId: agent.runId } : {}),
          ...(run?.result !== undefined ? { result: run.result as Record<string, unknown> } : {}),
          ...(run?.failure?.message ? { error: run.failure.message } : {}),
        };
      if (Date.now() >= deadline)
        return { state: agent.state, ...(agent.runId ? { runId: agent.runId } : {}), pending: true };
      await new Promise((resolve) => setTimeout(resolve, Math.min(200, Math.max(25, deadline - Date.now()))));
    }
  }

  private agents(groupId: string): Subagent[] {
    return (
      this.repo.db
        .prepare("SELECT agent_id FROM subagents WHERE group_id=? ORDER BY created_at,agent_id")
        .all(groupId) as { agent_id: string }[]
    ).map((row) => this.agent(row.agent_id));
  }

  private workspaceOf(runId: string): string {
    const run = this.repo.getRun(runId);
    if (!run) throw new AuxError("not_found", "Parent run does not exist.");
    const workspaceId = run.config?.contextWorkspaceId;
    if (
      !workspaceId ||
      !this.repo.db.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(workspaceId)
    )
      throw new AuxError("permission_denied", "Choose a Space for the parent run before spawning agents.");
    return workspaceId;
  }

  createGroup(raw: unknown): SubagentGroup {
    const input = SubagentGroupCreateParams.parse(raw);
    const parent = this.repo.getRun(input.parentRunId);
    if (!parent || !RUN_ACTIVE.has(parent.status))
      throw new AuxError("conflict", "The parent run is no longer active.");
    if (this.repo.db.prepare("SELECT 1 FROM subagents WHERE run_id=?").get(parent.runId))
      throw new AuxError("permission_denied", "Nested subagent groups are unavailable.");
    const workspaceId = this.workspaceOf(parent.runId);
    const existing = this.repo.db
      .prepare("SELECT group_id FROM subagent_groups WHERE parent_run_id=?")
      .get(parent.runId) as { group_id: string } | undefined;
    if (existing) {
      const group = this.group(existing.group_id);
      if (group.workspaceId !== workspaceId || (group.deadlineAt > 0 && group.deadlineAt <= Date.now()))
        throw new AuxError("conflict", "The original subagent group no longer matches this run.");
      if (
        group.tokenBudget !== input.tokenBudget ||
        group.costBudgetUsd !== input.costBudgetUsd ||
        group.timeBudgetMs !== input.timeBudgetMs
      )
        throw new AuxError("conflict", "Resume the original subagent group without changing its budgets.");
      if (group.state === "closed")
        this.repo.db.prepare("UPDATE subagent_groups SET state='active' WHERE group_id=?").run(group.groupId);
      return { ...group, state: "active" };
    }
    const now = Date.now();
    const group = SubagentGroupSchema.parse({
      ...input,
      groupId: randomUUID(),
      workspaceId,
      deadlineAt: input.timeBudgetMs === 0 ? 0 : now + input.timeBudgetMs,
      createdAt: now,
      state: "active",
    });
    try {
      this.repo.db
        .prepare(
          "INSERT INTO subagent_groups(group_id,parent_run_id,workspace_id,body,state,created_at) VALUES(?,?,?,?,'active',?)",
        )
        .run(group.groupId, group.parentRunId, group.workspaceId, JSON.stringify(group), now);
    } catch {
      throw new AuxError("conflict", "This parent already has a subagent group.");
    }
    return group;
  }

  private usage(agent: Subagent) {
    if (!agent.runId) return { tokens: agent.tokenAllocation, cost: agent.costAllocationUsd };
    const calls = lineageRuns(this.repo, agent.runId).flatMap((id) => this.repo.listModelCalls(id));
    const tokens = calls.reduce((sum, call) => sum + (call.inputTokens ?? 0) + (call.outputTokens ?? 0), 0);
    const resource = resourceFundingAccounting(this.repo).usage(lineageRuns(this.repo, agent.runId), []);
    const cost = calls.reduce((sum, call) => sum + (call.costUsd ?? 0), 0) + resource.costUsd;
    // Unknown usage is charged at the full reservation. Active children reserve
    // their allocation, including unused future calls.
    return {
      tokens:
        ACTIVE.has(agent.state) ||
        calls.some((call) => call.inputTokens === undefined || call.outputTokens === undefined)
          ? Math.max(tokens, agent.tokenAllocation)
          : tokens,
      cost:
        ACTIVE.has(agent.state) || resource.opaque || calls.some((call) => call.costUsd === undefined)
          ? Math.max(cost, agent.costAllocationUsd)
          : cost,
    };
  }

  view(groupId: string) {
    const group = this.group(groupId);
    const agents = this.agents(groupId);
    let reservedTokens = 0,
      reservedCostUsd = 0,
      usedTokens = 0,
      usedCostUsd = 0;
    for (const agent of agents) {
      const amount = this.usage(agent);
      if (ACTIVE.has(agent.state)) {
        reservedTokens += amount.tokens;
        reservedCostUsd += amount.cost;
      } else {
        usedTokens += amount.tokens;
        usedCostUsd += amount.cost;
      }
    }
    return { group, agents, reservedTokens, reservedCostUsd, usedTokens, usedCostUsd };
  }

  private async reconcileRun(runId: string) {
    const parentGroup = this.repo.db
      .prepare("SELECT group_id FROM subagent_groups WHERE parent_run_id=? AND state='active'")
      .get(runId) as { group_id: string } | undefined;
    if (
      parentGroup &&
      ![...RUN_ACTIVE, "interrupted"].includes(this.repo.getRun(runId)?.status ?? "missing")
    ) {
      await this.closeGroup(parentGroup.group_id);
      return;
    }
    const row = this.repo.db
      .prepare("SELECT agent_id FROM subagents WHERE run_id=? AND state IN ('starting','running')")
      .get(runId) as { agent_id: string } | undefined;
    if (!row) return;
    const run = this.repo.getRun(runId);
    if (!run || RUN_ACTIVE.has(run.status)) return;
    const state: Subagent["state"] =
      run.status === "completed" ? "completed" : run.status === "cancelled" ? "cancelled" : "failed";
    this.repo.db
      .prepare("UPDATE subagents SET state=?,ended_at=? WHERE agent_id=? AND state IN ('starting','running')")
      .run(state, Date.now(), row.agent_id);
  }

  private async reconcile() {
    const groups = this.repo.db
      .prepare("SELECT parent_run_id FROM subagent_groups WHERE state='active'")
      .all() as { parent_run_id: string }[];
    for (const group of groups) await this.reconcileRun(group.parent_run_id);
    const rows = this.repo.db
      .prepare("SELECT agent_id,run_id FROM subagents WHERE state IN ('starting','running')")
      .all() as { agent_id: string; run_id: string | null }[];
    for (const row of rows) {
      const reservedRunId = row.run_id ?? this.agent(row.agent_id).runId;
      if (reservedRunId && this.repo.getRun(reservedRunId)) {
        this.repo.db
          .prepare("UPDATE subagents SET run_id=? WHERE agent_id=? AND run_id IS NULL")
          .run(reservedRunId, row.agent_id);
        await this.reconcileRun(reservedRunId);
      } else {
        const agent = this.agent(row.agent_id);
        const group = this.group(agent.groupId);
        const recovery = reservedRunId ? this.coding?.recover?.(group.parentRunId, reservedRunId) : undefined;
        if (recovery) this.updateRecovery(row.agent_id, recovery);
        else if (
          agent.state === "starting" &&
          group.state === "active" &&
          this.runs.coordinator.suspensions.pending(group.parentRunId)
        )
          continue; // Reservation parked before worktree dispatch stays exact and reusable.
        else
          this.repo.db
            .prepare("UPDATE subagents SET state='interrupted',ended_at=? WHERE agent_id=?")
            .run(Date.now(), row.agent_id);
      }
    }
  }

  private async closeGroup(groupId: string) {
    const group = this.group(groupId);
    await withRunAuthorityMutation(
      this.repo,
      async () => {
        this.repo.db
          .prepare("UPDATE subagent_groups SET state='closed' WHERE group_id=? AND state='active'")
          .run(groupId);
        for (const agent of this.agents(groupId).filter((item) => ACTIVE.has(item.state))) {
          if (agent.state === "starting")
            this.repo.db
              .prepare(
                "UPDATE subagents SET state='interrupted',ended_at=? WHERE agent_id=? AND state='starting'",
              )
              .run(Date.now(), agent.agentId);
          if (agent.runId && this.repo.getRun(agent.runId)) await this.runs.cancel(agent.runId);
          else
            this.repo.db
              .prepare("UPDATE subagents SET state='interrupted',ended_at=? WHERE agent_id=?")
              .run(Date.now(), agent.agentId);
        }
      },
      group.parentRunId,
    );
  }

  async spawn(raw: unknown, actionId?: string): Promise<Subagent> {
    return this.spawnOwned(raw, false, actionId);
  }

  private async spawnOwned(raw: unknown, fork: boolean, actionId?: string): Promise<Subagent> {
    const input = SubagentSpawnParams.parse(raw);
    const group = this.group(input.groupId);
    if (group.state !== "active" || (group.deadlineAt > 0 && Date.now() >= group.deadlineAt))
      throw new AuxError("conflict", "The subagent group has expired or closed.");
    const parent = this.repo.getRun(group.parentRunId);
    if (!parent || !RUN_ACTIVE.has(parent.status))
      throw new AuxError("conflict", "The parent run is no longer active.");
    if (new Set(input.pageIds).size !== input.pageIds.length)
      throw new AuxError("invalid_params", "Choose distinct pages for a subagent.");
    if (input.pageIds.some((pageId) => !parent.pageIds.includes(pageId)))
      throw new AuxError("permission_denied", "A subagent cannot expand its parent's page scope.");
    const rootId = runRoot(this.repo, parent.runId, true);
    if (this.runs.coordinator.suspensions.pending(rootId)?.kind === "budget")
      throw new AuxError(
        "conflict",
        "Continue the parent's current budget request before spawning an agent.",
      );
    const sourceRunId = input.sourceRunId ?? group.parentRunId;
    if (
      sourceRunId !== group.parentRunId &&
      !this.repo.db
        .prepare("SELECT 1 FROM subagents WHERE group_id=? AND run_id=?")
        .get(group.groupId, sourceRunId)
    )
      throw new AuxError("permission_denied", "Fork source must belong to this group.");
    const source = this.repo.getRun(sourceRunId);
    if (!source) throw new AuxError("not_found", "Fork source run does not exist.");
    const selectedProfile = resolveAgentProfile(input.profile, parent.config?.auxPackages);
    // Dependencies must already belong to the parent’s pinned package selection.
    selectAuxPackages(parent.config?.auxPackages ?? [], selectedProfile.packages);
    const parentTools = parent.config?.agentProfile?.tools;
    const tools =
      !parentTools || parentTools.includes("*")
        ? selectedProfile.tools
        : selectedProfile.tools.includes("*")
          ? parentTools
          : selectedProfile.tools.filter((tool) => parentTools.includes(tool));
    if (!tools.length)
      throw new AuxError("permission_denied", "This profile has no tools within the parent's authority.");
    const inheritedLimits = parent.config?.agentProfile?.limits;
    const profile = {
      ...selectedProfile,
      tools,
      limits: {
        maxModelCalls: narrowerLimit(inheritedLimits?.maxModelCalls, selectedProfile.limits?.maxModelCalls),
        maxCostUsd: narrowCostLimit(inheritedLimits?.maxCostUsd, selectedProfile.limits?.maxCostUsd),
        deadlineMs: narrowerLimit(inheritedLimits?.deadlineMs, selectedProfile.limits?.deadlineMs),
      },
    };
    if (profile.workspace === "isolated" && (!parent.config?.projectRoot || !this.coding))
      throw new AuxError(
        "capability_unsupported",
        "An isolated profile requires an attached Git project and governed worktree support.",
      );
    if (!input.pageIds.length && !parent.config?.projectRoot) {
      const publicTools = new Set([
        ...this.publicWebTools,
        "get_time",
        "write_todos",
        "ask_user_question",
        "request_action_confirmation",
        "submit_result",
        "package_skill",
        "package_template",
        "package_workflow",
      ]);
      profile.tools = tools.includes("*") ? [...publicTools] : tools.filter((tool) => publicTools.has(tool));
      if (!this.publicWebTools.some((tool) => profile.tools.includes(tool)))
        throw new AuxError(
          "capability_unsupported",
          "This child needs an available public web tool, attached pages, or a coding project.",
        );
    }
    const reserved = actionId
      ? this.agents(group.groupId).find((agent) => agent.spawnActionId === actionId)
      : undefined;
    if (reserved && reserved.state !== "starting" && reserved.recovery?.state !== "incomplete")
      return reserved;
    const now = Date.now(),
      agentId = reserved?.agentId ?? randomUUID(),
      childRunId = reserved?.runId ?? newRunId();
    let forkTranscript: ModelMessage[] | undefined;
    if (!reserved) {
      this.repo.db.exec("BEGIN IMMEDIATE");
      try {
        if (
          this.group(group.groupId).state !== "active" ||
          (group.deadlineAt > 0 && Date.now() >= group.deadlineAt) ||
          !RUN_ACTIVE.has(this.repo.getRun(group.parentRunId)?.status ?? "missing")
        )
          throw new AuxError("conflict", "The parent or subagent group changed before reservation.");
        if (this.runs.coordinator.suspensions.pending(rootId)?.kind === "budget")
          throw new AuxError("conflict", "The parent budget paused before this agent's reservation.");
        const view = this.view(group.groupId);
        if (
          (group.tokenBudget > 0 &&
            (input.tokenAllocation === 0 ||
              view.usedTokens + view.reservedTokens + input.tokenAllocation > group.tokenBudget)) ||
          (group.costBudgetUsd > 0 &&
            (input.costAllocationUsd === 0 ||
              view.usedCostUsd + view.reservedCostUsd + input.costAllocationUsd > group.costBudgetUsd))
        )
          throw new AuxError("permission_denied", "This child exceeds the shared subagent budget.");
        const pageOwners = this.runs.pageOwnership.snapshot();
        if (
          input.pageIds.some(
            (pageId) =>
              pageOwners[pageId] ||
              view.agents.some((agent) => ACTIVE.has(agent.state) && agent.pageIds.includes(pageId)),
          )
        )
          throw new AuxError("conflict", "A selected page is already leased to another run.");
        if (fork)
          forkTranscript = new TranscriptStore(this.repo.db, this.repo.columnCipher).forkPrefix(sourceRunId);
        const agent = SubagentSchema.parse({
          ...input,
          agentId,
          sourceRunId,
          spawnActionId: actionId,
          state: "starting",
          runId: childRunId,
          createdAt: now,
        });
        this.repo.db
          .prepare(
            "INSERT INTO subagents(agent_id,group_id,reserved_run_id,state,body,created_at) VALUES(?,?,?,'starting',?,?)",
          )
          .run(
            agentId,
            group.groupId,
            childRunId,
            this.repo.protectRecordField("subagents", [agentId], "body", JSON.stringify(agent)),
            now,
          );
        this.repo.db.exec("COMMIT");
      } catch (error) {
        this.repo.db.exec("ROLLBACK");
        throw error;
      }
    }
    try {
      if (this.group(group.groupId).state !== "active")
        throw new AuxError("conflict", "The subagent group closed before launch.");
      const worktree =
        profile.workspace === "isolated"
          ? await this.coding!.create(parent.config!.projectRoot!, parent.runId, childRunId)
          : undefined;
      if (worktree) {
        const agent = this.agent(agentId);
        this.repo.db.prepare("UPDATE subagents SET state='starting' WHERE agent_id=?").run(agentId);
        this.repo.db
          .prepare("UPDATE subagents SET body=? WHERE agent_id=?")
          .run(
            this.repo.protectRecordField(
              "subagents",
              [agentId],
              "body",
              JSON.stringify({ ...agent, worktree, recovery: undefined }),
            ),
            agentId,
          );
      }
      const run = await this.runs.start({
        deliveryRunId: childRunId,
        forkTranscript,
        ...(fork ? { modelId: source.config?.modelId } : {}),
        goal: input.goal,
        agentMode: parent.config?.agentMode,
        agentProfile: profile,
        auxPackages: parent.config?.auxPackages,
        projectRoot: worktree?.root ?? parent.config?.projectRoot,
        coderWorktree: worktree,
        pageIds: input.pageIds,
        chatId: agentId,
        contextWorkspaceId: group.workspaceId,
        context: source.config?.context,
        privateTask: source.config?.privateTask,
        nativeTurnContext: source.config?.nativeTurnContext,
        executionTarget: source.config?.executionTarget ?? "local",
        reasoning: source.config?.reasoning,
        contextSnapshot: true,
        maxModelCalls: profile.limits?.maxModelCalls
          ? Math.min(input.maxModelCalls || Infinity, profile.limits.maxModelCalls)
          : input.maxModelCalls,
        deadlineMs: profile.limits?.deadlineMs
          ? Math.min(
              group.deadlineAt === 0 ? Infinity : Math.max(1, group.deadlineAt - Date.now()),
              profile.limits.deadlineMs,
            )
          : group.deadlineAt === 0
            ? 0
            : Math.max(1, group.deadlineAt - Date.now()),
        maxCostUsd: narrowCostLimit(
          input.costAllocationUsd > 0 ? input.costAllocationUsd : undefined,
          profile.limits?.maxCostUsd,
        ),
        subagentProfile: input.profile,
      });
      const bound = this.repo.db
        .prepare("UPDATE subagents SET run_id=?,state='running' WHERE agent_id=? AND state='starting'")
        .run(run.runId, agentId);
      if (bound.changes !== 1 || this.group(group.groupId).state !== "active") {
        await this.runs.cancel(run.runId);
        throw new AuxError("conflict", "The subagent group closed during launch.");
      }
      await this.reconcileRun(run.runId);
      return this.agent(agentId);
    } catch (error) {
      if (
        error instanceof AuxError &&
        error.code === "operation_uncertain" &&
        error.detail &&
        typeof error.detail === "object" &&
        "worktreeRecovery" in error.detail
      ) {
        const recovery = CoderWorktreeRecoverySchema.parse(error.detail.worktreeRecovery);
        this.updateRecovery(agentId, recovery);
        return this.agent(agentId);
      }
      if (error instanceof AuxError && (error.code === "needs_input" || error.code === "operation_uncertain"))
        throw error;
      // start can create the run before a later launch step rejects. The stable
      // run ID lets us find and stop that child even when start itself throws.
      const launched = this.repo.getRun(childRunId);
      if (launched && RUN_ACTIVE.has(launched.status)) await this.runs.cancel(childRunId);
      this.repo.db
        .prepare("UPDATE subagents SET state='failed',ended_at=? WHERE agent_id=? AND state='starting'")
        .run(Date.now(), agentId);
      throw error;
    }
  }

  async forkSelf(raw: unknown): Promise<Subagent> {
    const input = SubagentSpawnParams.extend({
      sourceRunId: SubagentSpawnParams.shape.sourceRunId.unwrap(),
    }).parse(raw);
    return this.spawnOwned(input, true);
  }

  cellControls() {
    return {
      waitCell: (cellId: string, timeoutMs: number) => this.waitFor(cellId, timeoutMs),
      sendCell: async (cellId: string, text: string) => {
        const agent = this.get(cellId);
        if (!agent.runId) throw new AuxError("conflict", "This cell has not started yet.");
        await this.sendMessage(cellId, agent.runId, text);
      },
      cancelCell: async (cellId: string) => {
        await this.cancel(cellId);
      },
    };
  }

  sendMessage(agentId: string, expectedRunId: string, text: string) {
    const agent = this.agent(agentId);
    if (agent.state !== "running" || agent.runId !== expectedRunId)
      throw new AuxError("conflict", "This subagent turn changed.");
    const run = this.repo.getRun(expectedRunId);
    if (!run || !RUN_ACTIVE.has(run.status)) throw new AuxError("conflict", "This subagent has finished.");
    const deadlineAt = this.group(agent.groupId).deadlineAt;
    if (deadlineAt > 0 && Date.now() >= deadlineAt)
      throw new AuxError("conflict", "The shared deadline passed.");
    return this.runs.messages.steer({
      messageId: randomUUID(),
      runId: expectedRunId,
      chatId: agent.agentId,
      text,
      pageIds: run.pageIds,
      contextPageRefs: run.config?.contextPageRefs ?? [],
      expectedRevision: run.config?.messageRevision ?? 0,
    });
  }

  async cancel(agentId: string) {
    const agent = this.agent(agentId);
    if (agent.runId && ACTIVE.has(agent.state)) await this.runs.cancel(agent.runId);
    this.repo.db
      .prepare(
        "UPDATE subagents SET state='cancelled',ended_at=? WHERE agent_id=? AND state IN ('starting','running')",
      )
      .run(Date.now(), agentId);
    return this.agent(agentId);
  }
}
