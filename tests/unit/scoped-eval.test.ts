import { afterEach, expect, it } from "vitest";
import { EventBus, makeInvoker, openDb, Repo, TaskService, type PageService, type Services } from "@aux/runtime";
import { PageOwnership } from "../../apps/runtime/src/scheduler/page-ownership.js";

const cleanup: (() => void)[] = [];
afterEach(() => cleanup.splice(0).forEach(fn => fn()));

function fixture(onDispatch?: (ctx: {beforeJournal?:()=>void}, tasks:TaskService, taskId:string)=>void) {
  const db = openDb(":memory:"); cleanup.push(() => db.close());
  const repo = new Repo(db), events = new EventBus(repo), tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Scoped");
  const task = tasks.create({ workspaceId: workspace.workspaceId, title: "Read", objective: "Read the page",
    criteria: [{ criterionId: "c", description: "Read", verification: "manual" }],
    resources: [{ resourceId: "page", kind: "page", locator: "p1", label: "Tab" }] });
  const seen: { allowEval?: boolean; taskId?: string; taskRevision?: number }[] = [];
  const page = { controller: "none" as "none" | "human" };
  const turnPages = new Map<string, { pageId: string; url: string; ownedByRuntime: boolean; controller: "none" | "human" }>();
  const pages = {
    get: (pageId: string) => turnPages.get(pageId) ?? page,
    open: async ({ url }: { url: string }) => { const target = { pageId: "turn-p1", url, ownedByRuntime: true, controller: "none" as const }; turnPages.set(target.pageId, target); return target; },
    close: async (pageId: string) => { turnPages.delete(pageId); return { ok: true }; },
    takeover: async (pageId: string) => { page.controller = "human"; return { pageId, controller: "human" }; },
    execute: async (_program: unknown, opts: { allowEval?: boolean; taskId?: string; taskRevision?: number; beforeJournal?:()=>void }) => { seen.push(opts); onDispatch?.(opts,tasks,task.taskId); return { steps: [] }; },
  } as unknown as PageService;
  const pageOwnership = new PageOwnership();
  let operationCalls = 0;
  const operations = { invoke: async () => { operationCalls++; return { status: "completed" }; } };
  const grants = ["effect:read"];
  const settings = { effectGrants: () => grants, searchEngine: () => "https://search.example.com/?q=%s" };
  const invoke = makeInvoker({ repo, events, pages, runs: { pageOwnership }, operations, settings } as unknown as Services);
  return { invoke, seen, tasks, task, workspace, page, grants, pageOwnership, operationCalls: () => operationCalls, scope: { kind: "task" as const, workspaceId: workspace.workspaceId, taskId: task.taskId } };
}

const program = { program: { pageId: "p1", steps: [{ id: "s", op: "click", target: "r1" }] } };

it("never lets a task-scoped connection run page script through pages.execute", async () => {
  const f = fixture();
  await f.invoke("pages.execute", { ...program, taskId:f.task.taskId, expectedRevision:1 }, { external: true, connectionId: "c1", scope: f.scope });
  expect(f.seen.at(-1)?.allowEval).toBe(false);
  expect(f.seen.at(-1)).toMatchObject({taskId:f.task.taskId,taskRevision:1});
});

it("rejects an external page program while a set member owns its tab", async () => {
  const f = fixture();
  const release = f.pageOwnership.tryAcquire({ pageId: "p1", actor: "set_member", runId: "set-run", memberId: "member" });
  try {
    await expect(f.invoke("pages.execute", { ...program, taskId: f.task.taskId, expectedRevision: 1 },
      { external: true, connectionId: "c1", scope: f.scope })).rejects.toMatchObject({ code: "conflict" });
    expect(f.seen).toHaveLength(0);
  } finally { release(); }
  await f.invoke("pages.execute", { ...program, taskId: f.task.taskId, expectedRevision: 1 },
    { external: true, connectionId: "c1", scope: f.scope });
  expect(f.seen).toHaveLength(1);
});

it("keeps a human-held tab out of external page programs", async () => {
  const f = fixture();
  f.page.controller = "human";
  await expect(f.invoke("pages.execute", { ...program, taskId: f.task.taskId, expectedRevision: 1 },
    { external: true, connectionId: "c1", scope: f.scope })).rejects.toMatchObject({ code: "conflict" });
  expect(f.seen).toHaveLength(0);
  expect(f.pageOwnership.snapshot().p1).toBeUndefined();
});

it("lets a scoped agent hand its authorized tab to a person without granting resume", async () => {
  const f = fixture();
  const client = { external: true, connectionId: "c1", scope: f.scope };
  await expect(f.invoke("pages.takeover", { pageId: "other" }, client)).rejects.toMatchObject({ code: "permission_denied" });
  await expect(f.invoke("pages.takeover", { pageId: "p1" }, client)).resolves.toMatchObject({ controller: "human" });
  expect(f.page.controller).toBe("human");
  await expect(f.invoke("pages.resume", { pageId: "p1" }, client)).rejects.toMatchObject({ code: "permission_denied" });
});

it("requires a current task revision and an egress grant before network tools or turn tabs", async () => {
  const f = fixture();
  const client = { external: true, connectionId: "c1", scope: f.scope };
  await expect(f.invoke("agent.web.fetch", { url: "https://example.com/" }, client)).rejects.toMatchObject({ code: "invalid_params" });
  await expect(f.invoke("agent.web.fetch", { url: "https://example.com/", taskId: f.task.taskId, expectedRevision: 2 }, client)).rejects.toMatchObject({ code: "conflict" });
  await expect(f.invoke("agent.web.fetch", { url: "https://example.com/", taskId: f.task.taskId, expectedRevision: 1 }, client)).rejects.toMatchObject({ code: "permission_denied" });
  await expect(f.invoke("agent.turn.open", { url: "https://example.com/", taskId: f.task.taskId, expectedRevision: 1, turnId: "turn1" }, client)).rejects.toMatchObject({ code: "permission_denied" });
  await expect(f.invoke("agent.images.generate", { prompt: "A glass sphere", taskId: f.task.taskId, expectedRevision: 1 }, client)).rejects.toMatchObject({ code: "permission_denied" });
  f.tasks.update({ taskId: f.task.taskId, expectedRevision: 1, title: "Changed during the turn" });
  await expect(f.invoke("agent.turn.end", { taskId: f.task.taskId, expectedRevision: 1, turnId: "turn1" }, client)).resolves.toEqual({ closed: [] });
});

it("authorizes task programs on a temporary turn tab and revokes them at turn end", async () => {
  const f = fixture();
  f.grants.push("effect:egress");
  const client = { external: true, connectionId: "c1", scope: f.scope };
  const input = { url: "https://example.com/", taskId: f.task.taskId, expectedRevision: 1, turnId: "turn1" };
  const tab = await f.invoke("agent.turn.open", input, client) as { pageId: string };
  await f.invoke("pages.execute", { taskId: f.task.taskId, expectedRevision: 1,
    program: { pageId: tab.pageId, steps: [{ id: "s", op: "extract", fields: [{ name: "title" }] }] } }, client);
  expect(f.seen).toHaveLength(1);
  await f.invoke("agent.turn.end", { taskId: input.taskId, expectedRevision: input.expectedRevision, turnId: input.turnId }, client);
  await expect(f.invoke("pages.observe", { pageId: tab.pageId }, client)).rejects.toMatchObject({ code: "permission_denied" });
});

it("keeps direct operation calls off a tab owned by another agent or a person", async () => {
  const f = fixture();
  const call = () => f.invoke("operations.invoke", { siteKey: "example.test", name: "read", pageId: "p1" });
  const release = f.pageOwnership.tryAcquire({ pageId: "p1", actor: "coordinator", runId: "active" });
  await expect(call()).rejects.toMatchObject({ code: "conflict" });
  await expect(f.invoke("operations.invoke", { siteKey: "example.test", name: "read", pageId: "p1" }, { external: false }))
    .rejects.toMatchObject({ code: "conflict" });
  release();
  f.page.controller = "human";
  await expect(call()).rejects.toMatchObject({ code: "conflict" });
  f.page.controller = "none";
  await call();
  expect(f.operationCalls()).toBe(1);
  expect(f.pageOwnership.snapshot().p1).toBeUndefined();
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

it("binds scoped browser actions to the exact task, page, and revision", async () => {
  const f=fixture(), client={external:true,connectionId:"c1",scope:f.scope};
  await expect(f.invoke("pages.execute",program,client)).rejects.toMatchObject({code:"invalid_params"});
  await expect(f.invoke("pages.execute",{...program,taskId:f.task.taskId,expectedRevision:2},client)).rejects.toMatchObject({code:"conflict"});
  const sibling=f.tasks.create({workspaceId:f.workspace.workspaceId,title:"Other",objective:"Other",criteria:[{criterionId:"other",description:"Other",verification:"manual"}],resources:[]});
  await expect(f.invoke("pages.execute",{...program,taskId:sibling.taskId,expectedRevision:1},
    {...client,scope:{kind:"workspace" as const,workspaceId:f.workspace.workspaceId}})).rejects.toMatchObject({code:"permission_denied"});
  await expect(f.invoke("pages.navigate",{pageId:"p1",url:"https://example.com"},client)).rejects.toMatchObject({code:"permission_denied"});
  await expect(f.invoke("pages.execute",{taskId:f.task.taskId,expectedRevision:1,program:{pageId:"p1",nodes:[{kind:"call",operation:"example/write",args:{}}]}},client)).rejects.toMatchObject({code:"permission_denied"});
});

it("rejects a task revision that changes while a page program waits to dispatch",async()=>{
  const f=fixture((ctx,tasks,taskId)=>{
    tasks.update({taskId,expectedRevision:1,title:"Revised while waiting"});
    ctx.beforeJournal?.();
  });
  await expect(f.invoke("pages.execute",{...program,taskId:f.task.taskId,expectedRevision:1},
    {external:true,connectionId:"c1",scope:f.scope})).rejects.toMatchObject({code:"conflict"});
});
