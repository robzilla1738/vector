import { afterEach, expect, it } from "vitest";
import { EventBus, makeInvoker, openDb, Repo, TaskService, type PageService, type Services } from "@aux/runtime";

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
  const pages = { execute: async (_program: unknown, opts: { allowEval?: boolean; taskId?: string; taskRevision?: number; beforeJournal?:()=>void }) => { seen.push(opts); onDispatch?.(opts,tasks,task.taskId); return { steps: [] }; } } as unknown as PageService;
  const invoke = makeInvoker({ repo, events, pages } as Services);
  return { invoke, seen, tasks, task, workspace, scope: { kind: "task" as const, workspaceId: workspace.workspaceId, taskId: task.taskId } };
}

const program = { program: { pageId: "p1", steps: [{ id: "s", op: "click", target: "r1" }] } };

it("never lets a task-scoped connection run page script through pages.execute", async () => {
  const f = fixture();
  await f.invoke("pages.execute", { ...program, taskId:f.task.taskId, expectedRevision:1 }, { external: true, connectionId: "c1", scope: f.scope });
  expect(f.seen.at(-1)?.allowEval).toBe(false);
  expect(f.seen.at(-1)).toMatchObject({taskId:f.task.taskId,taskRevision:1});
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
