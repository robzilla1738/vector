import { expect, it } from "vitest";
import { authorizeProgram, EventBus, openDb, Repo, SubagentService, subagentGrants, TaskService } from "@aux/runtime";
import { EventTypes, type Run } from "@aux/contracts";

function fixture() {
  const db = openDb(":memory:");
  const repo = new Repo(db), events = new EventBus(repo);
  const workspace = new TaskService(repo, events).createWorkspace("Agents");
  const parent: Run = { runId: "parent", goal: "Research", status: "running", pageIds: ["parent-page"],
    config: { contextWorkspaceId: workspace.workspaceId, context: "Stable shared prompt prefix" }, createdAt: Date.now() };
  repo.saveRun(parent);
  const starts: Record<string, unknown>[] = [];
  const messages: Record<string, unknown>[] = [];
  const cancelled: string[] = [];
  const runs = {
    pageOwnership: { snapshot: () => ({ "parent-page": { pageId: "parent-page", actor: "coordinator", runId: "parent" } }) },
    async start(input: Record<string, unknown>) {
      starts.push(input);
      const run: Run = { runId: String(input.deliveryRunId ?? `child-${starts.length}`), goal: String(input.goal), status: "running",
        pageIds: input.pageIds as string[], config: { chatId: String(input.chatId), context: input.context as string,
          contextWorkspaceId: String(input.contextWorkspaceId), messageRevision: 0,
          subagentProfile: input.subagentProfile as "default" | "explorer" | "read_only" }, createdAt: Date.now() };
      repo.saveRun(run);
      return run;
    },
    cancel(runId: string) { cancelled.push(runId); const run = repo.getRun(runId)!; run.status = "cancelled"; repo.saveRun(run); events.emit(EventTypes.RunUpdated, { run }, runId); return run; },
    messages: { steer(input: Record<string, unknown>) { messages.push(input); return { messageId: input.messageId }; } },
  } as unknown as ConstructorParameters<typeof SubagentService>[2];
  const service = new SubagentService(repo, events, runs);
  return { db, repo, events, workspace, parent, starts, messages, cancelled, runs, service,
    close: () => { service.close(); db.close(); } };
}

it("shares a hard reservation budget across at most eight children and rejects page collisions", async () => {
  const f = fixture();
  try {
    const group = f.service.createGroup({ parentRunId: f.parent.runId, tokenBudget: 9000, costBudgetUsd: 1,
      timeBudgetMs: 60_000 });
    for (let i = 0; i < 8; i++) await f.service.spawn({ groupId: group.groupId, goal: `Research ${i}`,
      pageIds: [`page-${i}`], profile: "read_only", tokenAllocation: 1000, costAllocationUsd: 0.1 });
    expect(f.service.view(group.groupId).reservedTokens).toBe(8000);
    await expect(f.service.spawn({ groupId: group.groupId, goal: "Ninth", pageIds: ["page-9"],
      profile: "default", tokenAllocation: 1000, costAllocationUsd: 0.1 })).rejects.toThrow(/eight/);
    expect(f.starts[0]).toMatchObject({ context: "Stable shared prompt prefix", contextSnapshot: true,
      subagentProfile: "read_only" });
    f.service.cancel(f.service.view(group.groupId).agents[0]!.agentId);
    await expect(f.service.spawn({ groupId: group.groupId, goal: "Collision", pageIds: ["page-1"],
      profile: "default", tokenAllocation: 1000, costAllocationUsd: 0.1 })).rejects.toThrow(/leased/);
  } finally { f.close(); }
});

it("releases unused reservations after completion and forks the exact saved context", async () => {
  const f = fixture();
  try {
    const group = f.service.createGroup({ parentRunId: f.parent.runId, tokenBudget: 2500, costBudgetUsd: 0.5,
      timeBudgetMs: 60_000 });
    const first = await f.service.spawn({ groupId: group.groupId, goal: "One", pageIds: ["one"],
      profile: "explorer", tokenAllocation: 1000, costAllocationUsd: 0.2 });
    await f.service.spawn({ groupId: group.groupId, goal: "Two", pageIds: ["two"],
      profile: "default", tokenAllocation: 1000, costAllocationUsd: 0.2 });
    await expect(f.service.spawn({ groupId: group.groupId, goal: "Over budget", pageIds: ["three"],
      profile: "default", tokenAllocation: 1000, costAllocationUsd: 0.2 })).rejects.toThrow(/shared/);
    f.repo.saveModelCall({ callId: "usage", runId: first.runId, role: "planner", modelId: "fixture", durationMs: 1,
      inputTokens: 50, outputTokens: 50, costUsd: 0.01, createdAt: Date.now() });
    const done = f.repo.getRun(first.runId!)!;
    done.status = "completed"; f.repo.saveRun(done); f.events.emit(EventTypes.RunUpdated, { run: done }, done.runId);
    const fork = await f.service.forkSelf({ groupId: group.groupId, goal: "Follow one", pageIds: ["three"],
      profile: "explorer", tokenAllocation: 1000, costAllocationUsd: 0.2, sourceRunId: first.runId });
    expect(fork.sourceRunId).toBe(first.runId);
    expect(f.starts.at(-1)?.context).toBe("Stable shared prompt prefix");
    expect(f.service.view(group.groupId)).toMatchObject({ usedTokens: 100, reservedTokens: 2000 });
    const message = f.service.sendMessage(fork.agentId, fork.runId!, "Check the second source");
    expect(message).toBeDefined();
    expect(f.messages[0]).toMatchObject({ runId: fork.runId, text: "Check the second source" });
  } finally { f.close(); }
});

it("enforces read-only child profiles even when ambient page writes are allowed", () => {
  const click = [{ id: "click", op: "click" as const, target: "button" }];
  expect(authorizeProgram(click, ["effect:read", "effect:write"]).ok).toBe(true);
  expect(authorizeProgram(click, subagentGrants("read_only", ["effect:read", "effect:write"])).ok).toBe(false);
  expect(authorizeProgram(click, subagentGrants("explorer", ["effect:read", "effect:write"])).ok).toBe(false);
  expect(authorizeProgram(click, subagentGrants("default", ["effect:read", "effect:write"])).ok).toBe(true);
});

it("cancels child work when the parent settles or a child exceeds its allocation", async () => {
  const f = fixture();
  try {
    const group = f.service.createGroup({ parentRunId: f.parent.runId, tokenBudget: 3000, costBudgetUsd: 1,
      timeBudgetMs: 60_000 });
    const child = await f.service.spawn({ groupId: group.groupId, goal: "One", pageIds: ["one"],
      profile: "default", tokenAllocation: 1000, costAllocationUsd: 0.2 });
    f.repo.saveModelCall({ callId: "overspend", runId: child.runId, role: "planner", modelId: "fixture", durationMs: 1,
      inputTokens: 1200, outputTokens: 10, costUsd: 0.01, createdAt: Date.now() });
    f.events.emit(EventTypes.ModelCall, {}, child.runId);
    expect(f.cancelled).toContain(child.runId);
    const second = await f.service.spawn({ groupId: group.groupId, goal: "Two", pageIds: ["two"],
      profile: "read_only", tokenAllocation: 1000, costAllocationUsd: 0.2 });
    const parent = f.repo.getRun(f.parent.runId)!;
    parent.status = "completed"; f.repo.saveRun(parent); f.events.emit(EventTypes.RunUpdated, { run: parent }, parent.runId);
    expect(f.cancelled).toContain(second.runId);
    expect(f.service.view(group.groupId).group.state).toBe("closed");
  } finally { f.close(); }
});

it("does not orphan a child if the parent settles during launch", async () => {
  const f = fixture();
  try {
    const group = f.service.createGroup({ parentRunId: f.parent.runId, tokenBudget: 2000, costBudgetUsd: 0.5,
      timeBudgetMs: 60_000 });
    const start = f.runs.start.bind(f.runs);
    f.runs.start = async input => {
      const child = await start(input);
      const parent = f.repo.getRun(f.parent.runId)!;
      parent.status = "completed"; f.repo.saveRun(parent); f.events.emit(EventTypes.RunUpdated, { run: parent }, parent.runId);
      return child;
    };
    await expect(f.service.spawn({ groupId: group.groupId, goal: "Race", pageIds: ["one"],
      profile: "default", tokenAllocation: 1000, costAllocationUsd: 0.2 })).rejects.toThrow(/closed during launch/);
    expect(f.cancelled).toContain(f.repo.listRuns(2).find(run => run.runId !== f.parent.runId)?.runId);
    expect(f.service.view(group.groupId).agents[0]?.state).toBe("interrupted");
  } finally { f.close(); }
});

it("cancels a child whose launch fails after the run was persisted", async () => {
  const f = fixture();
  try {
    const group = f.service.createGroup({ parentRunId: f.parent.runId, tokenBudget: 2000, costBudgetUsd: 0.5,
      timeBudgetMs: 60_000 });
    const start = f.runs.start.bind(f.runs);
    f.runs.start = async input => {
      await start(input);
      throw new Error("late launch failure");
    };
    await expect(f.service.spawn({ groupId: group.groupId, goal: "Race", pageIds: ["one"],
      profile: "default", tokenAllocation: 1000, costAllocationUsd: 0.2 })).rejects.toThrow(/late launch failure/);
    expect(f.cancelled).toContain(f.repo.listRuns(2).find(run => run.runId !== f.parent.runId)?.runId);
    expect(f.service.view(group.groupId).agents[0]?.state).toBe("failed");
  } finally { f.close(); }
});
