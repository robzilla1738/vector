import { afterEach, expect, it } from "vitest";
import { EventBus, makeInvoker, openDb, Repo, TaskService, type PageService, type Services } from "@aux/runtime";

const cleanup: (() => void)[] = [];
afterEach(() => cleanup.splice(0).forEach(fn => fn()));

function fixture() {
  const db = openDb(":memory:"); cleanup.push(() => db.close());
  const repo = new Repo(db), events = new EventBus(repo), tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Scoped");
  const task = tasks.create({ workspaceId: workspace.workspaceId, title: "Read", objective: "Read the page",
    criteria: [{ criterionId: "c", description: "Read", verification: "manual" }],
    resources: [{ resourceId: "page", kind: "page", locator: "p1", label: "Tab" }] });
  const seen: { allowEval?: boolean }[] = [];
  const pages = { execute: async (_program: unknown, opts: { allowEval?: boolean }) => { seen.push(opts); return { steps: [] }; } } as unknown as PageService;
  const invoke = makeInvoker({ repo, events, pages } as Services);
  return { invoke, seen, scope: { kind: "task" as const, workspaceId: workspace.workspaceId, taskId: task.taskId } };
}

const program = { program: { pageId: "p1", steps: [{ id: "s", op: "click", target: "r1" }] } };

it("never lets a task-scoped connection run page script through pages.execute", async () => {
  const f = fixture();
  await f.invoke("pages.execute", program, { external: true, connectionId: "c1", scope: f.scope });
  expect(f.seen.at(-1)?.allowEval).toBe(false);
});

it("keeps evaluate available to the owner bearer token", async () => {
  const f = fixture();
  await f.invoke("pages.execute", program, { external: true });
  expect(f.seen.at(-1)?.allowEval).toBe(true);
});

it("authorizes pages.execute against the program's page, not a top-level pageId", async () => {
  const f = fixture();
  await expect(f.invoke("pages.execute", { program: { pageId: "other", steps: [{ id: "s", op: "click", target: "r1" }] } },
    { external: true, connectionId: "c1", scope: f.scope })).rejects.toMatchObject({ code: "permission_denied" });
});
