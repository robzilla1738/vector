import { createHash, randomBytes } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { EventBus, GoalService, HookService, openDb, Repo, SubagentService, TaskService } from "@aux/runtime";
import type { NativeBridge } from "../../apps/runtime/src/native.js";
import { compactProtectedSqlite } from "../../apps/runtime/src/store/sqlite-protection.js";
import { prepareProtectedDatabase } from "../../apps/runtime/src/store/protected-startup.js";

it("migrates adapted data before repository reads, survives restart and refuses a missing factor", async () => {
  const dir = mkdtempSync(join(tmpdir(), "aux-protected-startup-"));
  const path = join(dir, "state.sqlite");
  const profileId = "profile-one";
  const secrets = new Map<string, string>();
  const name = (kind: "aux_root_v1" | "sqlite_factor_v1") =>
    `${kind}_${createHash("sha256").update(profileId).digest("hex").slice(0, 24)}`;
  const native = {
    async readSecret(key: string) {
      return { value: secrets.get(key) };
    },
    async storeSecret(key: string, value: string) {
      secrets.set(key, value);
      return { ok: true };
    },
    async profileStorageRoot() {
      const key = name("aux_root_v1");
      if (!secrets.has(key)) secrets.set(key, randomBytes(32).toString("base64"));
      return { value: secrets.get(key)! };
    },
    async profileStorageFactor() {
      const key = name("sqlite_factor_v1");
      if (!secrets.has(key)) secrets.set(key, randomBytes(32).toString("base64"));
      return { value: secrets.get(key)! };
    },
  } as unknown as NativeBridge;
  let db = openDb(path);
  try {
    const legacy = new Repo(db);
    legacy.saveModelCall({
      callId: "old",
      runId: "run",
      role: "agent",
      modelId: "model",
      durationMs: 1,
      error: "private startup error",
      createdAt: 1,
    });
    legacy.saveRun({
      runId: "old-run",
      goal: "private startup goal",
      status: "completed",
      pageIds: [],
      config: { chatId: "chat", context: "private startup context" },
      createdAt: 1,
    });
    legacy.setSetting("startup-fixture", { text: "private startup setting" });
    const legacyTasks = new TaskService(legacy, new EventBus(legacy));
    const space = legacyTasks.createWorkspace("private startup space");
    const task = legacyTasks.create({
      workspaceId: space.workspaceId,
      title: "private startup task",
      objective: "Check protection",
      criteria: [{ criterionId: "check", description: "Protected", verification: "manual" }],
    });
    let runRepo = legacy;
    const runs = {
      pageOwnership: { snapshot: () => ({}) },
      start: async (input: { deliveryRunId: string; goal: string; pageIds: string[] }) => {
        const run = {
          runId: input.deliveryRunId,
          goal: input.goal,
          status: "running" as const,
          pageIds: input.pageIds,
          config: {},
          createdAt: Date.now(),
        };
        runRepo.saveRun(run);
        return run;
      },
      pause: () => {},
      resume: () => {},
      cancel: () => {},
    } as unknown as ConstructorParameters<typeof SubagentService>[2] &
      ConstructorParameters<typeof GoalService>[1];
    const legacyGoal = new GoalService(legacy, runs).create({
      workspaceId: space.workspaceId,
      objective: "private startup goal body",
      budget: { maxTokens: 100 },
    });
    const legacyHook = new HookService(legacy, () => {}).register({
      workspaceId: space.workspaceId,
      event: "run.end",
      handler: {
        type: "mcp_tool",
        serverId: "local",
        grantId: "11111111-1111-4111-8111-111111111111",
        toolName: "private_startup_tool",
      },
    });
    const parentRunId = "protected-parent";
    legacy.saveRun({
      runId: parentRunId,
      goal: "private parent",
      status: "running",
      pageIds: [],
      config: { contextWorkspaceId: space.workspaceId },
      createdAt: Date.now(),
    });
    const legacyAgents = new SubagentService(legacy, new EventBus(legacy), runs);
    const legacyGroup = legacyAgents.createGroup({
      parentRunId,
      tokenBudget: 1000,
      costBudgetUsd: 1,
      timeBudgetMs: 60_000,
    });
    legacyAgents.close();
    db.prepare(
      "INSERT INTO hook_invocations(invocation_id,hook_id,event_id,state,error,created_at) VALUES(?,?,'legacy','failed',?,?)",
    ).run(
      "11111111-1111-4111-8111-111111111112",
      legacyHook.hookId,
      "private startup hook error",
      Date.now(),
    );
    const cipher = await prepareProtectedDatabase(db, native, profileId);
    const protectedRepo = new Repo(db, cipher);
    runRepo = protectedRepo;
    expect(protectedRepo.listModelCalls("run")[0]?.error).toBe("private startup error");
    expect(protectedRepo.getRun("old-run")?.config?.context).toBe("private startup context");
    expect(protectedRepo.getSetting("startup-fixture")).toEqual({ text: "private startup setting" });
    expect(new TaskService(protectedRepo, new EventBus(protectedRepo)).get(task.taskId).title).toBe(
      "private startup task",
    );
    const protectedGoals = new GoalService(protectedRepo, runs);
    expect(protectedGoals.get(legacyGoal.goalId).objective).toBe("private startup goal body");
    const freshGoal = protectedGoals.create({
      workspaceId: space.workspaceId,
      objective: "private new goal body",
      budget: { maxTokens: 100 },
    });
    expect(
      (db.prepare("SELECT body FROM goals WHERE goal_id=?").get(freshGoal.goalId) as { body: string }).body,
    ).toMatch(/^auxenc:v1:/);
    protectedGoals.create({
      workspaceId: space.workspaceId,
      chatId: "private-thread",
      objective: "first thread goal",
      budget: { maxTokens: 100 },
    });
    expect(() =>
      protectedGoals.create({
        workspaceId: space.workspaceId,
        chatId: "private-thread",
        objective: "duplicate thread goal",
        budget: { maxTokens: 100 },
      }),
    ).toThrow(/current Goal/);
    const protectedHooks = new HookService(protectedRepo, () => {});
    expect(protectedHooks.get(legacyHook.hookId).handler).toMatchObject({ toolName: "private_startup_tool" });
    expect(protectedHooks.invocations(legacyHook.hookId)[0]?.error).toBe("private startup hook error");
    protectedHooks.approve(legacyHook.hookId, legacyHook.handlerDigest);
    const failed = await protectedHooks.dispatch(
      { eventId: "protected-failure", workspaceId: space.workspaceId, event: "run.end", at: Date.now() },
      async () => {
        throw new Error("private native handler error");
      },
    );
    expect(failed[0]?.state).toBe("failed");
    expect(
      (
        db.prepare("SELECT error FROM hook_invocations WHERE event_id='protected-failure'").get() as {
          error: string;
        }
      ).error,
    ).toMatch(/^auxenc:v1:/);
    const protectedAgents = new SubagentService(protectedRepo, new EventBus(protectedRepo), runs);
    expect(protectedAgents.view(legacyGroup.groupId).group.parentRunId).toBe(parentRunId);
    protectedRepo.saveRun({
      runId: "protected-second-parent",
      goal: "private second parent",
      status: "running",
      pageIds: ["fixture-page"],
      config: { contextWorkspaceId: space.workspaceId },
      createdAt: Date.now(),
    });
    const freshGroup = protectedAgents.createGroup({
      parentRunId: "protected-second-parent",
      tokenBudget: 2000,
      costBudgetUsd: 1,
      timeBudgetMs: 60_000,
    });
    expect(
      (
        db.prepare("SELECT body FROM subagent_groups WHERE group_id=?").get(freshGroup.groupId) as {
          body: string;
        }
      ).body,
    ).toMatch(/^auxenc:v1:/);
    const freshAgent = await protectedAgents.spawn({
      groupId: freshGroup.groupId,
      goal: "private child goal",
      pageIds: ["fixture-page"],
      profile: "read_only",
      tokenAllocation: 1000,
      costAllocationUsd: 0.1,
    });
    expect(protectedAgents.get(freshAgent.agentId).goal).toBe("private child goal");
    expect(
      (db.prepare("SELECT body FROM subagents WHERE agent_id=?").get(freshAgent.agentId) as { body: string })
        .body,
    ).toMatch(/^auxenc:v1:/);
    protectedAgents.close();
    expect(
      (
        db.prepare("SELECT count(*) AS n FROM aux_meta WHERE key LIKE 'protected_sqlite_v1:%'").get() as {
          n: number;
        }
      ).n,
    ).toBe(37);
    // Compaction is explicit maintenance, never part of runtime boot.
    compactProtectedSqlite(db);
    expect(readFileSync(path).includes("private startup error")).toBe(false);
    expect(readFileSync(path).includes("private startup task")).toBe(false);
    expect(readFileSync(path).includes("private startup goal body")).toBe(false);
    expect(readFileSync(path).includes("private startup hook error")).toBe(false);
    expect(readFileSync(path).includes("private new goal body")).toBe(false);
    expect(readFileSync(path).includes("private child goal")).toBe(false);
    db.close();
    db = openDb(path);
    const reopened = await prepareProtectedDatabase(db, native, profileId);
    const reopenedRepo = new Repo(db, reopened);
    expect(reopenedRepo.listModelCalls("run")[0]?.error).toBe("private startup error");
    expect(new TaskService(reopenedRepo, new EventBus(reopenedRepo)).get(task.taskId).title).toBe(
      "private startup task",
    );
    expect(new GoalService(reopenedRepo, runs).get(legacyGoal.goalId).objective).toBe(
      "private startup goal body",
    );
    expect(new HookService(reopenedRepo, () => {}).get(legacyHook.hookId).handler).toMatchObject({
      toolName: "private_startup_tool",
    });
    secrets.delete(name("sqlite_factor_v1"));
    await expect(prepareProtectedDatabase(db, native, profileId)).rejects.toThrow(/factor is missing/);
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
