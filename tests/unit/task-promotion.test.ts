import { expect, it } from "vitest";
import { EventBus, openDb, Repo, TaskService } from "@vector/runtime";

function fixture() {
  const db = openDb(":memory:");
  const repo = new Repo(db);
  const tasks = new TaskService(repo, new EventBus(repo));
  const workspace = tasks.createWorkspace("Research");
  repo.saveRun({ runId: "first", goal: "Compare options", status: "completed", pageIds: [], createdAt: 1, config: { chatId: "original-chat" } });
  const input = { chatId: "original-chat", expectedRunId: "first", workspaceId: workspace.workspaceId, title: "Compare options", objective: "Complete the comparison", criteria: [{ criterionId: "outcome", description: "Report the comparison", verification: "manual" }] };
  return { db, repo, tasks, input };
}
it("promotes once, preserves original chat context and scopes future task runs to that chat", () => {
  const f = fixture();
  try {
    f.repo.setSetting("conversationAttachments:original-chat", ["synthetic-attachment"]);
    const task = f.tasks.promote(f.input);
    expect(f.tasks.promote(f.input).taskId).toBe(task.taskId);
    expect(f.tasks.list()).toHaveLength(1);
    expect(f.tasks.prepareRun(task.taskId, 1).chatId).toBe("original-chat");
    expect(f.repo.getRun("first")?.config?.taskId).toBeUndefined();
    expect(f.repo.getConversation("original-chat")?.taskId).toBe(task.taskId);
    expect(f.repo.getSetting("conversationAttachments:original-chat")).toEqual(["synthetic-attachment"]);
    f.tasks.update({ taskId: task.taskId, expectedRevision: 1, title: "Prepared comparison" });
    expect(f.repo.getConversation("original-chat")?.title).toBe("Prepared comparison");
    f.tasks.archive(task.taskId, 2, true);
    expect(f.repo.getConversation("original-chat")?.archived).toBe(true);
  } finally { f.db.close(); }
});
it("rejects stale or still-running conversations without creating a task", () => {
  const f = fixture();
  try {
    f.repo.saveRun({ runId: "second", goal: "Continue", status: "running", pageIds: [], createdAt: 2, config: { chatId: "original-chat" } });
    expect(() => f.tasks.promote(f.input)).toThrow(/changed/);
    expect(() => f.tasks.promote({ ...f.input, expectedRunId: "second" })).toThrow(/current turn/);
    expect(f.tasks.list()).toEqual([]);
  } finally { f.db.close(); }
});
