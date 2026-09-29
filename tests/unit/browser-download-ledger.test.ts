import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { expect, it } from "vitest";
import { BrowserDownloadLedger } from "../../apps/runtime/src/services/browser-download-ledger.js";
import { EventBus, openDb, PageClaimStore, Repo, TaskEvidenceService, TaskService } from "@aux/runtime";

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "aux-download-ledger-"));
  const downloads = join(root, "downloads"), trash = join(root, "Trash");
  await mkdir(downloads);
  const db = openDb(":memory:"), repo = new Repo(db), events = new EventBus(repo);
  const tasks = new TaskService(repo, events), workspace = tasks.createWorkspace("Fixture");
  const task = tasks.create({ workspaceId: workspace.workspaceId, title: "Download report",
    objective: "Download report", criteria: [{ criterionId: "saved", description: "Report saved", verification: "manual" }] });
  repo.saveRun({ runId: "r1", goal: task.objective, status: "running", pageIds: ["p1"],
    config: { taskId: task.taskId, taskRevision: 1 }, createdAt: 1 });
  new PageClaimStore(db).claim({ runId: "r1", pageId: "p1", kind: "borrowed" });
  const ledger = new BrowserDownloadLedger(repo, downloads, trash);
  const path = join(downloads, "report.txt");
  const started = { id: "d1", filename: "report.txt", sourceUrl: "https://fixture.test/report",
    path, size: 0, startedAt: Date.now() };
  ledger.started("p1", started, "agent");
  const finish = async (state: "completed" | "interrupted" = "completed") => {
    await ledger.finished({ ...started, state, size: 6, endedAt: Date.now() });
    repo.saveRun({ runId: "r1", goal: task.objective, status: "completed", pageIds: ["p1"],
      config: { taskId: task.taskId, taskRevision: 1 }, createdAt: 1, endedAt: Date.now() });
  };
  return { root, downloads, trash, db, repo, events, task, ledger, path, finish };
}

it("records a run-controlled native download and moves unchanged bytes to recoverable Trash", async () => {
  const f = await fixture();
  try {
    await writeFile(f.path, "report");
    await f.finish();
    const evidence = new TaskEvidenceService(f.repo, f.events, undefined, undefined, f.downloads, f.trash);
    const change = evidence.receipt(f.task.taskId).downloadChanges[0]!;
    expect(change).toMatchObject({ status: "completed", filename: "report.txt", cleanupAvailable: true });
    await evidence.undoDownloadChange({ taskId: f.task.taskId, expectedRevision: 1,
      runId: "r1", stepId: change.stepId });
    const moved = (await readdir(f.trash))[0]!;
    expect(await readFile(join(f.trash, moved), "utf8")).toBe("report");
    expect(evidence.receipt(f.task.taskId).downloadChanges[0]).toMatchObject({ cleanupAvailable: false,
      undoneAt: expect.any(Number) });
  } finally { f.db.close(); await rm(f.root, { recursive: true, force: true }); }
});

it("refuses cleanup after a person edits the completed file", async () => {
  const f = await fixture();
  try {
    await writeFile(f.path, "report");
    await f.finish();
    await writeFile(f.path, "revised report");
    const evidence = new TaskEvidenceService(f.repo, f.events, undefined, undefined, f.downloads, f.trash);
    const change = evidence.receipt(f.task.taskId).downloadChanges[0]!;
    await expect(evidence.undoDownloadChange({ taskId: f.task.taskId, expectedRevision: 1,
      runId: "r1", stepId: change.stepId })).rejects.toThrow("changed");
    expect(await readFile(f.path, "utf8")).toBe("revised report");
  } finally { f.db.close(); await rm(f.root, { recursive: true, force: true }); }
});

it("keeps interrupted downloads visible without cleanup authority", async () => {
  const f = await fixture();
  try {
    await f.finish("interrupted");
    const change = new TaskEvidenceService(f.repo, f.events, undefined, undefined, f.downloads, f.trash)
      .receipt(f.task.taskId).downloadChanges[0]!;
    expect(change).toMatchObject({ status: "interrupted", cleanupAvailable: false });
  } finally { f.db.close(); await rm(f.root, { recursive: true, force: true }); }
});

it("recovers a Trash move after interruption before the receipt marker", async () => {
  const f = await fixture();
  try {
    await writeFile(f.path, "report");
    await f.finish();
    await f.ledger.undo(f.repo.downloadStep("d1")!);
    expect(f.repo.downloadStep("d1")?.outcome?.undoneAt).toBeUndefined();
    const evidence = new TaskEvidenceService(f.repo, f.events, undefined, undefined, f.downloads, f.trash);
    const change = evidence.receipt(f.task.taskId).downloadChanges[0]!;
    await evidence.undoDownloadChange({ taskId: f.task.taskId, expectedRevision: 1,
      runId: "r1", stepId: change.stepId });
    expect(evidence.receipt(f.task.taskId).downloadChanges[0]?.undoneAt).toBeTypeOf("number");
    expect(await readdir(f.trash)).toHaveLength(1);
  } finally { f.db.close(); await rm(f.root, { recursive: true, force: true }); }
});

it("does not attribute a human download to a nearby agent run", async () => {
  const f = await fixture();
  try {
    f.ledger.started("p1", { id: "human", filename: "manual.txt", path: join(f.downloads, "manual.txt"),
      size: 0, startedAt: Date.now() }, "human");
    expect(f.repo.downloadStep("human")).toBeUndefined();
  } finally { f.db.close(); await rm(f.root, { recursive: true, force: true }); }
});

it("does not claim a download started before the agent took the page", async () => {
  const f = await fixture();
  try {
    f.ledger.started("p1", { id: "early", filename: "early.txt", path: join(f.downloads, "early.txt"),
      size: 0, startedAt: 1 }, "agent");
    expect(f.repo.downloadStep("early")).toBeUndefined();
  } finally { f.db.close(); await rm(f.root, { recursive: true, force: true }); }
});

it("uses the native Profile download folder when it differs from the runtime folder", async () => {
  const f = await fixture();
  try {
    const profileFolder = join(f.root, "chosen-downloads");
    await mkdir(profileFolder);
    const path = join(profileFolder, "native.txt"), startedAt = Date.now();
    f.ledger.started("p1", { id: "native", filename: "native.txt", path,
      size: 0, startedAt }, "agent", profileFolder);
    await writeFile(path, "native");
    await f.ledger.finished({ id: "native", filename: "native.txt", path,
      state: "completed", size: 6, startedAt, endedAt: Date.now() });
    f.repo.saveRun({ runId: "r1", goal: f.task.objective, status: "completed", pageIds: ["p1"],
      config: { taskId: f.task.taskId, taskRevision: 1 }, createdAt: 1, endedAt: Date.now() });
    const evidence = new TaskEvidenceService(f.repo, f.events, undefined, undefined, f.downloads, f.trash);
    const change = evidence.receipt(f.task.taskId).downloadChanges.find(item => item.filename === "native.txt")!;
    expect(change.cleanupAvailable).toBe(true);
    await evidence.undoDownloadChange({ taskId: f.task.taskId, expectedRevision: 1,
      runId: "r1", stepId: change.stepId });
    expect(await readFile(join(f.trash, (await readdir(f.trash))[0]!), "utf8")).toBe("native");
  } finally { f.db.close(); await rm(f.root, { recursive: true, force: true }); }
});
