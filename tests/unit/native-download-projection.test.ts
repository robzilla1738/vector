import { expect, it, vi } from "vitest";
import { EventBus, makeInvoker, openDb, PageClaimStore, Repo, TaskService,
  type Services } from "@aux/runtime";
import type { PageTarget } from "@aux/contracts";

it("projects only an unambiguous current native tab into an active run", async () => {
  const db = openDb(":memory:");
  try {
    const repo = new Repo(db), events = new EventBus(repo), tasks = new TaskService(repo, events);
    const space = tasks.createWorkspace("Fixture");
    const task = tasks.create({ workspaceId: space.workspaceId, title: "Download",
      objective: "Download", criteria: [{ criterionId: "saved", description: "Saved", verification: "manual" }] });
    const now = Date.now();
    repo.saveRun({ runId: "r1", goal: task.objective, status: "running", pageIds: ["p1"],
      config: { taskId: task.taskId, taskRevision: 1 }, createdAt: now - 10, startedAt: now - 10 });
    new PageClaimStore(db).claim({ runId: "r1", pageId: "p1", kind: "borrowed", now });
    const page = { pageId: "p1", backend: "aux", controller: "agent", viewStatus: "visible",
      url: "https://fixture.test/page" } as PageTarget;
    let pages = [page];
    const started = vi.fn(), finished = vi.fn(async () => {});
    const invoke = makeInvoker({ repo, events, featureHost: "chromium-fork",
      pages: { list: () => pages, onNativeDownloadStarted: started,
        onNativeDownload: finished } } as unknown as Services);
    const input = { id: "d1", filename: "report.pdf", path: "/tmp/report.pdf", size: 0,
      state: "started", startedAt: now + 1, tabUrl: page.url,
      downloadRoot: "/tmp" };
    await expect(invoke("downloads.projectNative", input)).rejects.toMatchObject({ code: "permission_denied" });
    await invoke("downloads.projectNative", input, { external: false });
    expect(started).toHaveBeenCalledWith("p1", expect.objectContaining({ id: "d1", downloadRoot: "/tmp" }));
    pages = [page, { ...page, pageId: "human", controller: "human" }];
    await invoke("downloads.projectNative", { ...input, id: "d2" }, { external: false });
    expect(started).toHaveBeenLastCalledWith(undefined, expect.objectContaining({ id: "d2" }));
    pages = [page];
    await invoke("downloads.projectNative", { ...input, id: "old", startedAt: now - 1 }, { external: false });
    expect(started).toHaveBeenLastCalledWith(undefined, expect.objectContaining({ id: "old" }));
  } finally { db.close(); }
});
