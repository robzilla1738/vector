import { createHash, randomUUID } from "node:crypto";
import { afterEach, expect, it } from "vitest";
import {
  EventBus,
  GoalService,
  RunFundingService,
  resourceFundingAccounting,
  FundingBudgetError,
  ResourceFundingUnavailable,
  ModelFundingUnavailable,
  ExecutionResourceLedger,
  Repo,
  TaskService,
  openDb,
} from "@aux/runtime";
import { SubagentGroupSchema, SubagentSchema } from "@aux/contracts";

const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const close of cleanup.splice(0)) close();
});
const request = { modelId: "fixture/model", promptBytes: 100, toolsBytes: 100, maxOutputTokens: 100 };
function fixture(budget: { maxTokens?: number; maxCostUsd?: number } = { maxTokens: 1400 }) {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db),
    workspace = new TaskService(repo, new EventBus(repo)).createWorkspace("Funding");
  const runs = {
    start: async (input: Record<string, unknown>) => {
      const run = {
        runId: String(input.deliveryRunId),
        goal: String(input.goal),
        status: "running" as const,
        pageIds: ["page"],
        createdAt: Date.now(),
        config: { maxCostUsd: input.maxCostUsd as number | undefined },
      };
      repo.saveRun(run);
      return run;
    },
  } as unknown as ConstructorParameters<typeof GoalService>[1];
  const goals = new GoalService(repo, runs);
  const funding = new RunFundingService(repo, resourceFundingAccounting(repo), async () => [
    { id: request.modelId, source: "configured", inputUsdPerMTok: 1, outputUsdPerMTok: 1 },
  ]);
  const goal = goals.create({ workspaceId: workspace.workspaceId, objective: "Original family", budget });
  return { repo, goals, funding, goal, workspace };
}
function child(
  f: ReturnType<typeof fixture>,
  parent: string,
  tokenBudget = 0,
  allocation = 0,
  groupId?: string,
) {
  const now = Date.now(),
    runId = randomUUID();
  const group = SubagentGroupSchema.parse({
    groupId: groupId ?? randomUUID(),
    parentRunId: parent,
    workspaceId: f.workspace.workspaceId,
    tokenBudget,
    costBudgetUsd: 0,
    timeBudgetMs: 0,
    deadlineAt: 0,
    createdAt: now,
    state: "active",
  });
  if (!groupId)
    f.repo.db
      .prepare(
        "INSERT INTO subagent_groups(group_id,parent_run_id,workspace_id,body,state,created_at) VALUES(?,?,?,?,?,?)",
      )
      .run(group.groupId, parent, group.workspaceId, JSON.stringify(group), group.state, now);
  const agent = SubagentSchema.parse({
    agentId: randomUUID(),
    groupId: group.groupId,
    runId,
    sourceRunId: parent,
    goal: "Read",
    profile: "default",
    pageIds: ["page"],
    tokenAllocation: allocation,
    costAllocationUsd: 0,
    maxModelCalls: 0,
    state: "running",
    createdAt: now,
  });
  f.repo.saveRun({ runId, goal: "Read", status: "running", pageIds: ["page"], createdAt: now });
  f.repo.db
    .prepare(
      "INSERT INTO subagents(agent_id,group_id,reserved_run_id,run_id,body,state,created_at) VALUES(?,?,?,?,?,?,?)",
    )
    .run(agent.agentId, group.groupId, runId, runId, JSON.stringify(agent), agent.state, now);
  return { runId, group, agent };
}
function invoice(f: ReturnType<typeof fixture>, runId: string, tokens = 100) {
  f.repo.saveModelCall({
    callId: randomUUID(),
    runId,
    modelId: request.modelId,
    role: "agent",
    durationMs: 1,
    inputTokens: tokens,
    outputTokens: 0,
    costUsd: tokens / 1_000_000,
    createdAt: Date.now(),
  });
}
it("refuses unenforceable subscription output bounds before reserving original Goal tokens", async () => {
  const f = fixture({ maxTokens: 1400 }),
    runId = (await f.goals.start(f.goal.goalId, ["page"])).runId!;
  const funding = new RunFundingService(f.repo, resourceFundingAccounting(f.repo), async () => [
    { id: request.modelId, source: "catalog", billingKind: "subscription", outputLimitSupported: false },
  ]);
  const error = await funding.reserve(runId, request).catch((value) => value);
  expect(error).toBeInstanceOf(ModelFundingUnavailable);
  expect((error as ModelFundingUnavailable).proof.reasons).toEqual(["output-bound"]);
  await funding.assertModelUnavailable(error as ModelFundingUnavailable);
  expect(f.repo.getSetting(`runFunding:goal:${f.goal.goalId}`)).toBeUndefined();
});
it("refuses ordinary finite subscription USD scopes even without a funded Goal and keeps unlimited admission usable", async () => {
  const f = fixture({}),
    runId = (await f.goals.start(f.goal.goalId, ["page"])).runId!;
  let scopes = [{ scope: "month", limitUsd: 5 }];
  const funding = new RunFundingService(
    f.repo,
    resourceFundingAccounting(f.repo),
    async () => [
      { id: request.modelId, source: "catalog", billingKind: "subscription", outputLimitSupported: false },
    ],
    () => scopes,
  );
  const error = await funding.reserve(runId, request).catch((value) => value);
  expect(error).toBeInstanceOf(ModelFundingUnavailable);
  expect((error as ModelFundingUnavailable).proof.reasons).toEqual(["monetary-bound"]);
  scopes = [];
  await expect(funding.assertModelUnavailable(error as ModelFundingUnavailable)).rejects.toThrow(
    /review changed/,
  );
  expect(await funding.reserve(runId, request)).toBeUndefined();
});
it("joins actual descendants to the original Goal and continues only its saved funding revision", async () => {
  const f = fixture(),
    root = (await f.goals.start(f.goal.goalId, ["page"])).runId!;
  const member = child(f, root),
    grandchild = child(f, member.runId);
  const reservation = await f.funding.reserve(member.runId, request);
  invoice(f, member.runId);
  // A sibling admission between invoice persistence and settlement still uses the bounded hold once.
  await expect(f.funding.reserve(grandchild.runId, request)).rejects.toMatchObject({
    budget: { reason: "tokens", used: 1324 },
  });
  f.funding.settle(member.runId, reservation, [
    { modelId: request.modelId, durationMs: 1, inputTokens: 100, outputTokens: 0 },
  ]);
  const blocked = await f.funding.reserve(grandchild.runId, request).catch((error: unknown) => error);
  expect(blocked).toBeInstanceOf(FundingBudgetError);
  const budget = (blocked as FundingBudgetError).budget;
  expect(budget).toMatchObject({
    reason: "tokens",
    used: 100,
    funding: { kind: "goal", ownerId: f.goal.goalId, runId: grandchild.runId },
  });
  f.repo.transaction(() => f.funding.continue(root, budget, { maxTokens: 1500 }));
  expect(f.goals.get(f.goal.goalId).budget.maxTokens).toBe(1500);
  expect(() => f.funding.continue(root, budget, { maxTokens: 1600 })).toThrow(/changed/);
  const next = await f.funding.reserve(grandchild.runId, request);
  f.funding.cancelUnsent(grandchild.runId, next);
  f.repo.saveRun({
    runId: "forged-parent",
    goal: "Unrelated",
    status: "running",
    pageIds: [],
    createdAt: Date.now(),
  });
  f.repo.db
    .prepare("UPDATE subagent_groups SET parent_run_id=? WHERE group_id=?")
    .run("forged-parent", grandchild.group.groupId);
  await expect(f.funding.reserve(grandchild.runId, request)).rejects.toThrow(/provenance changed/);
});
it("preserves sibling allocations when raising an exact child token budget", async () => {
  const f = fixture({}),
    root = (await f.goals.start(f.goal.goalId, ["page"])).runId!;
  const member = child(f, root, 2000, 1000);
  child(f, root, 2000, 1000, member.group.groupId);
  const error = await f.funding.reserve(member.runId, request).catch((failure: unknown) => failure);
  expect(error).toBeInstanceOf(FundingBudgetError);
  const budget = (error as FundingBudgetError).budget;
  expect(budget.funding?.kind).toBe("subagent");
  expect(() => f.repo.transaction(() => f.funding.continue(root, budget, { maxTokens: 1500 }))).toThrow(
    /containing group/,
  );
});
it("settles known image USD while retaining unknown image tokens as an opaque original hold", async () => {
  const f = fixture({ maxCostUsd: 3 }),
    runId = (await f.goals.start(f.goal.goalId, ["page"])).runId!;
  const hold = await f.funding.reserveEstimated(runId, { modelId: "image/model", estimatedCostUsd: 1 });
  f.repo.saveModelCall({
    callId: "image",
    runId,
    modelId: "image/model",
    role: "agent",
    durationMs: 1,
    costUsd: 0.5,
    createdAt: Date.now(),
  });
  f.funding.settle(runId, hold, [], { costUsd: 0.5, costEstimated: false });
  const next = await f.funding.reserveEstimated(runId, { modelId: "image/model", estimatedCostUsd: 1 });
  f.funding.cancelUnsent(runId, next);
  const token = fixture({ maxTokens: 2000 }),
    tokenRun = (await token.goals.start(token.goal.goalId, ["page"])).runId!;
  const tokenHold = await token.funding.reserveEstimated(tokenRun, {
    modelId: "image/model",
    estimatedCostUsd: 1,
  });
  token.repo.saveModelCall({
    callId: "image-opaque",
    runId: tokenRun,
    modelId: "image/model",
    role: "agent",
    durationMs: 1,
    costUsd: 0.5,
    createdAt: Date.now(),
  });
  token.funding.settle(tokenRun, tokenHold, [], { costUsd: 0.5, costEstimated: false });
  await expect(token.funding.reserve(tokenRun, request)).rejects.toThrow(/uncertain charge/);
});

function resourceFixture(f: ReturnType<typeof fixture>, verified = false) {
  const ledger = new ExecutionResourceLedger(f.repo),
    accounting = resourceFundingAccounting(f.repo);
  // A trusted test seam proves accounting invariants; production has no verified network envelope yet.
  const funding = new RunFundingService(
    f.repo,
    {
      ...accounting,
      receipt(id) {
        const receipt = accounting.receipt(id);
        return receipt && verified ? { ...receipt, financialBound: "verified" as const } : receipt;
      },
    },
    async () => [{ id: request.modelId, source: "configured", inputUsdPerMTok: 1, outputUsdPerMTok: 1 }],
  );
  const quoteJson = JSON.stringify({ fixture: "bounded resource" }),
    quoteDigest = createHash("sha256").update(quoteJson).digest("hex"),
    originalDigest = "a".repeat(64);
  const reserve = (runId: string, amount = 1) =>
    f.repo.transaction(() => {
      const resourceId = ledger.reserve({
        runId,
        originalDigest,
        quoteDigest,
        quoteJson,
        estimatedCostUsd: amount,
      });
      return {
        resourceId,
        reservationId: funding.reserveResource(runId, { resourceId, estimatedCostUsd: amount }),
      };
    });
  return { ledger, funding, reserve, quoteDigest, originalDigest };
}
it("refuses unverified finite resource funding atomically before provider creation", async () => {
  const f = fixture({ maxCostUsd: 3 }),
    runId = (await f.goals.start(f.goal.goalId, ["page"])).runId!;
  const resources = resourceFixture(f);
  expect(() => resources.reserve(runId)).toThrow(ResourceFundingUnavailable);
  expect(f.repo.db.prepare("SELECT COUNT(*) AS n FROM execution_resources").get()).toMatchObject({ n: 0 });
  expect(f.repo.listModelCalls(runId)).toEqual([]);
});
it("joins a real resource receipt once alongside a model hold and settles after owner retirement", async () => {
  const f = fixture({ maxTokens: 2000, maxCostUsd: 3 }),
    runId = (await f.goals.start(f.goal.goalId, ["page"])).runId!;
  const resources = resourceFixture(f, true),
    hold = resources.reserve(runId);
  const model = await resources.funding.reserve(runId, request);
  resources.funding.cancelUnsent(runId, model);
  resources.ledger.begin(hold.resourceId, runId, resources.originalDigest, resources.quoteDigest);
  resources.ledger.attach(hold.resourceId, runId, "sandbox", "session");
  expect(() => resources.funding.cancelResourceUnsent(runId, undefined, hold.resourceId)).toThrow(
    /may already have started/,
  );
  expect(() => resources.funding.cancelResourceUnsent(runId, hold.reservationId, hold.resourceId)).toThrow(
    /may already have started/,
  );
  expect(() => resources.funding.settleResource(runId, hold.reservationId, hold.resourceId)).toThrow(
    /acknowledgement/,
  );
  await expect(resources.funding.reserve(runId, request)).rejects.toThrow(/uncertain charge/);
  f.repo.saveRun({ ...f.repo.getRun(runId)!, status: "cancelled" });
  resources.ledger.settle({
    resourceId: hold.resourceId,
    runId,
    sandboxId: "sandbox",
    sessionId: "session",
    stoppedAt: Date.now(),
    costUsd: 0.4,
    costEstimated: false,
  });
  resources.funding.settleResource(runId, hold.reservationId, hold.resourceId);
  resources.funding.settleResource(runId, hold.reservationId, hold.resourceId);
  expect(resourceFundingAccounting(f.repo).usage([runId, runId], [])).toEqual({
    costUsd: 0.4,
    opaque: false,
  });
  expect(f.repo.listModelCalls(runId)).toEqual([]);
});
it("releases a resource hold only with its original provably unsent row", async () => {
  const f = fixture({ maxCostUsd: 2 }),
    runId = (await f.goals.start(f.goal.goalId, ["page"])).runId!;
  const resources = resourceFixture(f, true),
    hold = resources.reserve(runId);
  f.repo.transaction(() => {
    resources.funding.cancelResourceUnsent(runId, hold.reservationId, hold.resourceId);
    resources.ledger.cancelUnsent(hold.resourceId, runId);
  });
  expect(() => resources.funding.cancelResourceUnsent(runId, hold.reservationId, hold.resourceId)).toThrow(
    /may already have started/,
  );
  expect(resourceFundingAccounting(f.repo).usage([runId], [])).toEqual({ costUsd: 0, opaque: false });
  expect(resources.reserve(runId).reservationId).toBeTypeOf("string");
});
