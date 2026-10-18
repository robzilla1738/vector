import { createHash } from "node:crypto";
import { afterEach, expect, it } from "vitest";
import { AuxError, RoutineCreateParams, RoutineShareSchema, type Run } from "@aux/contracts";
import { EventBus } from "../../apps/runtime/src/events.js";
import { openDb } from "../../apps/runtime/src/store/db.js";
import { Repo } from "../../apps/runtime/src/store/repo.js";
import { TaskService } from "../../apps/runtime/src/services/tasks.js";
import { RoutineService } from "../../apps/runtime/src/services/routines.js";
import type { MemoryDiscoverySnapshot } from "../../apps/runtime/src/services/memory-pipeline.js";
const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of cleanup.splice(0)) await close();
});
function fixture() {
  const repo = new Repo(openDb(":memory:")),
    events = new EventBus(repo),
    tasks = new TaskService(repo, events),
    workspace = tasks.createWorkspace("Discovery");
  let enabled = true;
  const digest = (run: Run) => createHash("sha256").update(JSON.stringify(run)).digest("hex");
  const snapshot = async (workspaceId: string, runIds: string[]): Promise<MemoryDiscoverySnapshot> => {
    if (!enabled) throw new AuxError("permission_denied", "Memory disabled.");
    return {
      workspaceId,
      ownerRevision: 1,
      generation: "fixture",
      policyDigest: "fixture",
      sources: runIds.map((runId) => {
        const run = repo.getRun(runId);
        if (!run || run.status !== "completed") throw new AuxError("permission_denied", "Source retired.");
        return { runId, sourceDigest: digest(run) };
      }),
    };
  };
  const memory = {
    discoverySnapshot: snapshot,
    assertDiscoverySnapshot: async (value: MemoryDiscoverySnapshot) => {
      if (
        JSON.stringify(
          await snapshot(
            value.workspaceId,
            value.sources.map((source) => source.runId),
          ),
        ) !== JSON.stringify(value)
      )
        throw new AuxError("conflict", "Discovery source changed.");
    },
  };
  const routines = new RoutineService(repo, events, undefined, undefined, {
    memory,
    request: async () => {
      throw new TypeError("local server offline");
    },
  });
  for (let index = 0; index < 3; index++) {
    const task = tasks.create({
      workspaceId: workspace.workspaceId,
      title: `Vendor review ${index}`,
      objective: "Review weekly vendor report and summarize open supplier issues",
      criteria: [{ criterionId: "review", description: "Review report", verification: "manual" }],
    });
    repo.saveRun({
      runId: `related-run-${index}`,
      goal: `Review weekly vendor report and summarize open supplier issues ${index}`,
      status: "completed",
      pageIds: [],
      createdAt: index + 1,
      endedAt: index + 10,
      config: { taskId: task.taskId, taskRevision: task.revision, contextWorkspaceId: workspace.workspaceId },
    });
  }
  cleanup.push(async () => {
    await routines.close();
    repo.close();
  });
  return {
    repo,
    routines,
    workspace,
    disable: () => {
      enabled = false;
    },
  };
}
it("discovers related work across distinct tasks, labels lexical fallback and creates only a paused evidence-bound draft", async () => {
  const f = fixture(),
    [candidate] = await f.routines.scan({ workspaceId: f.workspace.workspaceId });
  expect(candidate).toMatchObject({ completedRuns: 3, discoveryMethod: "lexical" });
  expect(new Set(candidate!.supportingRuns.map((run) => run.taskId)).size).toBe(3);
  const draft = await f.routines.draftFromCandidate({
    workspaceId: f.workspace.workspaceId,
    candidateId: candidate!.candidateId,
  });
  expect(draft).toMatchObject({
    paused: true,
    activationReview: "run_result",
    trigger: { kind: "manual" },
    supportingRuns: candidate!.supportingRuns,
  });
  expect(
    RoutineCreateParams.parse({ ...draft, supportingRuns: candidate!.supportingRuns }),
  ).not.toHaveProperty("supportingRuns");
  expect(RoutineShareSchema.parse(draft)).not.toHaveProperty("supportingRuns");
  expect(f.repo.listRuns(100)).toHaveLength(3);
  expect(f.repo.db.prepare("SELECT count(*) n FROM model_calls").get()).toMatchObject({ n: 0 });
  await expect(
    f.routines.draftFromCandidate({
      workspaceId: f.workspace.workspaceId,
      candidateId: candidate!.candidateId,
    }),
  ).rejects.toThrow(/expired/);
});
it("rejects changed and disabled Memory source snapshots before saving a draft", async () => {
  const f = fixture(),
    [candidate] = await f.routines.scan({ workspaceId: f.workspace.workspaceId });
  const run = f.repo.getRun(candidate!.supportingRuns[0]!.runId)!;
  f.repo.saveRun({ ...run, result: { report: "Owner changed this saved result" } });
  await expect(
    f.routines.draftFromCandidate({
      workspaceId: f.workspace.workspaceId,
      candidateId: candidate!.candidateId,
    }),
  ).rejects.toThrow(/changed/);
  expect(f.routines.list()).toHaveLength(0);
  f.disable();
  await expect(f.routines.scan({ workspaceId: f.workspace.workspaceId })).rejects.toThrow(/disabled/);
});
