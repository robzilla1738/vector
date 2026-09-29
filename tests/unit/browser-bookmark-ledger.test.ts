import { expect, it } from "vitest";
import { BrowserBookmarkLedger } from "../../apps/runtime/src/services/browser-bookmark-ledger.js";
import { EventBus, openDb, Repo, TaskEvidenceService, TaskService } from "@aux/runtime";

it("records a new bookmark and removes it through the owning task receipt", async () => {
  const db = openDb(":memory:");
  try {
    const repo = new Repo(db), events = new EventBus(repo), tasks = new TaskService(repo, events);
    const workspace = tasks.createWorkspace("Fixture");
    const task = tasks.create({ workspaceId: workspace.workspaceId, title: "Save source",
      objective: "Save source", criteria: [{ criterionId: "saved", description: "Saved", verification: "manual" }] });
    repo.saveRun({ runId: "r1", goal: task.objective, status: "completed", pageIds: ["p1"],
      config: { taskId: task.taskId, taskRevision: 1 }, createdAt: 1 });
    const ledger = new BrowserBookmarkLedger(repo);
    const saved = await ledger.save("r1", "p1", "https://fixture.test/source", "Source");
    expect(saved.saved).toBe(true);
    expect(await ledger.save("r1", "p1", "https://fixture.test/source", "Source")).toEqual({ saved: false });
    const evidence = new TaskEvidenceService(repo, events);
    expect(evidence.receipt(task.taskId).bookmarkChanges).toMatchObject([{ status: "ok", title: "Source" }]);
    const review = evidence.receipt(task.taskId).undoReviews.find(item => item.runId === "r1")!;
    const result = await evidence.undoRunBrowserChanges({ taskId: task.taskId, expectedRevision: 1, runId: "r1",
      reviewToken: review.token, expectedStepIds: review.eligibleStepIds,
      selectedStepIds: review.eligibleStepIds });
    expect(result).toEqual({ restored: 1, skipped: [] });
    expect(repo.listBookmarks()).toHaveLength(0);
    expect(evidence.receipt(task.taskId).bookmarkChanges[0]?.undoneAt).toBeTypeOf("number");
  } finally { db.close(); }
});

it("refuses to remove a bookmark whose title changed after the run", async () => {
  const db = openDb(":memory:");
  try {
    const repo = new Repo(db), events = new EventBus(repo), tasks = new TaskService(repo, events);
    const workspace = tasks.createWorkspace("Fixture");
    const task = tasks.create({ workspaceId: workspace.workspaceId, title: "Save source",
      objective: "Save source", criteria: [{ criterionId: "saved", description: "Saved", verification: "manual" }] });
    repo.saveRun({ runId: "r1", goal: task.objective, status: "completed", pageIds: ["p1"],
      config: { taskId: task.taskId, taskRevision: 1 }, createdAt: 1 });
    const saved = await new BrowserBookmarkLedger(repo).save("r1", "p1", "https://fixture.test/source", "Source");
    repo.addBookmark("https://fixture.test/source", "Human edited title");
    const evidence = new TaskEvidenceService(repo, events);
    await expect(evidence.undoBookmarkChange({ taskId: task.taskId, expectedRevision: 1,
      runId: "r1", stepId: saved.stepId })).rejects.toThrow("changed since this run");
    expect(repo.listBookmarks()[0]?.title).toBe("Human edited title");
    expect(evidence.receipt(task.taskId).bookmarkChanges[0]?.undoneAt).toBeUndefined();
  } finally { db.close(); }
});

it("preserves a bookmark promoted to the reading list after the run", async () => {
  const db = openDb(":memory:");
  try {
    const repo = new Repo(db), events = new EventBus(repo), tasks = new TaskService(repo, events);
    const workspace = tasks.createWorkspace("Fixture");
    const task = tasks.create({ workspaceId: workspace.workspaceId, title: "Save source",
      objective: "Save source", criteria: [{ criterionId: "saved", description: "Saved", verification: "manual" }] });
    repo.saveRun({ runId: "r1", goal: task.objective, status: "completed", pageIds: ["p1"],
      config: { taskId: task.taskId, taskRevision: 1 }, createdAt: 1 });
    const url = "https://fixture.test/source";
    const saved = await new BrowserBookmarkLedger(repo).save("r1", "p1", url, "Source");
    repo.setReadingList(url, true, "Source");
    const evidence = new TaskEvidenceService(repo, events);
    await expect(evidence.undoBookmarkChange({ taskId: task.taskId, expectedRevision: 1,
      runId: "r1", stepId: saved.stepId })).rejects.toThrow("changed since this run");
    expect(repo.listBookmarks()[0]?.readingList).toBe(true);
  } finally { db.close(); }
});

it("keeps local bookmark edits made after the undo precheck", () => {
  const db = openDb(":memory:");
  try {
    const repo = new Repo(db), url = "https://fixture.test/source";
    repo.addBookmark(url, "Source");
    const original = repo.listBookmarks()[0]!;
    repo.setReadingList(url, true, "Source");
    expect(repo.removeBookmarkIfUnchanged(url, original.title, original.createdAt, [], false)).toBe(false);
    expect(repo.listBookmarks()[0]?.readingList).toBe(true);
  } finally { db.close(); }
});
