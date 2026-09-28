import { expect, it } from "vitest";
import { EventBus, openDb, Repo, TaskService, TaskEvidenceService } from "@aux/runtime";
import { recordRunTabChange } from "../../apps/runtime/src/services/browser-change-ledger.js";
import type { PageTarget } from "@aux/contracts";

it("records model-opened and model-closed tabs under the owning task run", () => {
  const db = openDb(":memory:");
  try {
    const repo = new Repo(db), events = new EventBus(repo), tasks = new TaskService(repo, events);
    const workspace = tasks.createWorkspace("Fixture");
    const task = tasks.create({ workspaceId: workspace.workspaceId, title: "Open tab",
      objective: "Read a source", criteria: [{ criterionId: "read", description: "Source read", verification: "manual" }] });
    repo.saveRun({ runId: "run-one", goal: task.objective, status: "completed", pageIds: [],
      config: { taskId: task.taskId, taskRevision: 1 }, createdAt: 1 });
    const page = { pageId: "p1", url: "https://fixture.test/source", documentEpoch: 2,
      ownedByRuntime: true } as PageTarget;
    const openId = recordRunTabChange(repo, "run-one", page, "tab.open");
    const closeId = recordRunTabChange(repo, "run-one", page, "tab.close");
    const changes = new TaskEvidenceService(repo, events).receipt(task.taskId).tabChanges;
    expect(changes).toHaveLength(2);
    expect(changes.find(change => change.stepId === openId)).toMatchObject({
      op: "tab.open", pageId: "p1", url: "https://fixture.test/source" });
    expect(changes.find(change => change.stepId === closeId)).toMatchObject({
      op: "tab.close", pageId: "p1", url: "https://fixture.test/source" });
  } finally { db.close(); }
});
