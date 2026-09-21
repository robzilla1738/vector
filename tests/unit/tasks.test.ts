import { afterEach, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DurableWriteLedger, EventBus, openDb, Repo, TaskService } from "@vector/runtime";

const cleanup: (() => void)[] = [];
afterEach(() => { for (const fn of cleanup.splice(0).reverse()) fn(); });
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "aux-tasks-"));
  cleanup.push(() => rmSync(dir, { recursive: true, force: true }));
  const path = join(dir, "state.sqlite");
  const db = openDb(path);
  cleanup.push(() => db.close());
  const repo = new Repo(db);
  const service = new TaskService(repo, new EventBus(repo));
  const workspace = service.createWorkspace("Project");
  const task = service.create({ workspaceId: workspace.workspaceId, title: "Verify build", objective: "Run tests and report the result",
    criteria: [{ criterionId: "tests", description: "All required tests pass", verification: "test" }],
    resources: [{ resourceId: "repo", kind: "repository", locator: "/synthetic/no-such-repo", label: "Source" }] });
  return { db, repo, path, service, workspace, task };
}

it("persists workspace, criteria, resources and immutable revisions across restart", () => {
  const f = fixture();
  const revised = f.service.update({ taskId: f.task.taskId, expectedRevision: 1, objective: "Run tests and lint" });
  expect(revised.resources).toEqual(f.task.resources);
  const reopened = openDb(f.path);
  cleanup.push(() => reopened.close());
  const repo = new Repo(reopened);
  const tasks = new TaskService(repo, new EventBus(repo));
  expect(tasks.workspaces()).toEqual([f.workspace]);
  const details = tasks.details(f.task.taskId);
  expect(details.task.revision).toBe(2);
  expect(details.revisions.map(task => task.objective)).toEqual([f.task.objective, revised.objective]);
  expect(tasks.list({ workspaceId: "another" })).toEqual([]);
});

it("persists revision-checked workspace memory and stamps its revision onto saved-task context", () => {
  const f = fixture();
  expect(f.service.workspaceMemory(f.workspace.workspaceId)).toEqual({ workspaceId: f.workspace.workspaceId, content: "", items: [], excludedOrigins: [], enabled:true, revision: 0 });
  const saved = f.service.setWorkspaceMemory(f.workspace.workspaceId, 0, "Prefer concise reports and preserve offline support.");
  expect(saved).toMatchObject({ revision: 1, content: "Prefer concise reports and preserve offline support." });
  expect(() => f.service.setWorkspaceMemory(f.workspace.workspaceId, 0, "stale overwrite")).toThrow(/changed/i);
  const prepared = f.service.prepareRun(f.task.taskId, 1);
  expect(prepared).toMatchObject({ contextWorkspaceId: f.workspace.workspaceId, contextWorkspaceRevision: 1 });
  expect(prepared.context).not.toContain("WORKSPACE MEMORY");
  expect(prepared.context).not.toContain("preserve offline support");
  const reopened = openDb(f.path);
  cleanup.push(() => reopened.close());
  const tasks = new TaskService(new Repo(reopened), new EventBus(new Repo(reopened)));
  expect(tasks.workspaceMemory(f.workspace.workspaceId)).toMatchObject({ revision: 1, content: saved.content });
});

it("rejects stale edits and invalid criteria without changing revision history", () => {
  const f = fixture();
  f.service.update({ taskId: f.task.taskId, expectedRevision: 1, title: "New title" });
  expect(() => f.service.update({ taskId: f.task.taskId, expectedRevision: 1, objective: "stale" })).toThrow("revision changed");
  expect(() => f.service.update({ taskId: f.task.taskId, expectedRevision: 2, criteria: [] })).toThrow();
  expect(() => f.service.update({ taskId: f.task.taskId, expectedRevision: 2, criteria: [f.task.criteria[0], f.task.criteria[0]] })).toThrow("unique");
  expect(f.service.details(f.task.taskId).revisions).toHaveLength(2);
  expect(() => f.service.create({ ...f.task, workspaceId: "missing" })).toThrow("Workspace");
});

it("rejects revision and competing starts while a run is active", () => {
  const f = fixture();
  const prepared = f.service.prepareRun(f.task.taskId, 1);
  expect(prepared.goal).toBe(f.task.objective);
  expect(prepared.context).toContain("All required tests pass");
  expect(prepared).not.toHaveProperty("grants");
  expect(prepared.context).toContain("contents have not been read");
  expect(prepared.context).toContain("/synthetic/no-such-repo");
  f.repo.saveRun({ runId: "r1", goal: prepared.goal, pageIds: [], status: "running", config: { taskId: prepared.taskId, taskRevision: prepared.taskRevision }, createdAt: Date.now() });
  expect(() => f.service.prepareRun(f.task.taskId, 1)).toThrow("active run");
  expect(() => f.service.update({ taskId: f.task.taskId, expectedRevision: 1, objective: "changed" })).toThrow("active run");
  expect(() => f.service.archive(f.task.taskId, 1, true)).toThrow("active run");
});

it("marks old run results as belonging to an earlier revision and never infers task completion", () => {
  const f = fixture();
  f.repo.saveRun({ runId: "r1", goal: f.task.objective, pageIds: [], status: "completed", result: { passed: true }, config: { taskId: f.task.taskId, taskRevision: 1 }, createdAt: Date.now() });
  expect(f.service.details(f.task.taskId).runs[0]?.currentRevision).toBe(true);
  f.service.update({ taskId: f.task.taskId, expectedRevision: 1, criteria: [{ criterionId: "lint", description: "Lint passes too", verification: "test" }] });
  const details = f.service.details(f.task.taskId);
  expect(details.runs[0]?.currentRevision).toBe(false);
  expect(details.runs[0]?.run.result).toEqual({ passed: true });
  expect(details.task.state).toBe("open");
  f.service.archive(f.task.taskId, 2, true);
  expect(f.service.list()).toEqual([]);
  expect(f.service.list({ includeArchived: true })).toHaveLength(1);
  expect(() => f.service.prepareRun(f.task.taskId, 3)).toThrow("Restore");
  f.service.archive(f.task.taskId, 3, false);
  expect(f.service.details(f.task.taskId).runs).toHaveLength(1);
});

it("keeps the task as the title and archive authority for its durable conversation", () => {
  const f = fixture();
  const prepared = f.service.prepareRun(f.task.taskId, 1);
  f.repo.saveRun({ runId: "task-turn", goal: prepared.goal, pageIds: [], status: "completed", config: { taskId: prepared.taskId, taskRevision: prepared.taskRevision, chatId: prepared.chatId }, createdAt: 10 });
  expect(f.repo.getConversation(prepared.chatId)).toMatchObject({ title: "Verify build", taskId: f.task.taskId, archived: false });
  const renamed = f.service.update({ taskId: f.task.taskId, expectedRevision: 1, title: "Verify release" });
  expect(f.repo.getConversation(prepared.chatId)).toMatchObject({ title: "Verify release", archived: false });
  f.service.archive(f.task.taskId, renamed.revision, true);
  expect(f.repo.getConversation(prepared.chatId)).toMatchObject({ archived: true });
  f.service.archive(f.task.taskId, renamed.revision + 1, false);
  expect(f.repo.getConversation(prepared.chatId)).toMatchObject({ archived: false });
});

it("keeps parent and child archive state coherent", () => {
  const f = fixture();
  const child = f.service.create({ workspaceId: f.workspace.workspaceId, parentTaskId: f.task.taskId, title: "Verify child", objective: "Verify one child result",
    criteria: [{ criterionId: "child", description: "Child result exists", verification: "manual" }], resources: [] });
  const grandchild = f.service.create({ workspaceId: f.workspace.workspaceId, parentTaskId: child.taskId, title: "Verify grandchild", objective: "Verify a nested result",
    criteria: [{ criterionId: "nested", description: "Nested result exists", verification: "manual" }], resources: [] });

  expect(() => f.service.archive(f.task.taskId, 1, true)).toThrow("Archive child task");
  f.service.archive(grandchild.taskId, 1, true);
  f.service.archive(child.taskId, 1, true);
  const parent = f.service.archive(f.task.taskId, 1, true);
  expect(parent.state).toBe("archived");
  expect(() => f.service.archive(grandchild.taskId, 2, false)).toThrow("Restore parent task");
  f.service.archive(f.task.taskId, parent.revision, false);
  const restoredChild = f.service.archive(child.taskId, 2, false);
  expect(f.service.archive(grandchild.taskId, 2, false).state).toBe("open");
  expect(restoredChild.state).toBe("open");
});

it("searches title, criteria and resource labels without matching locators", () => {
  const f = fixture();
  expect(f.service.list({ query: "required tests" }).map(task => task.taskId)).toEqual([f.task.taskId]);
  expect(f.service.list({ query: "Source" }).map(task => task.taskId)).toEqual([f.task.taskId]);
  expect(f.service.list({ query: "/synthetic/no-such-repo" })).toEqual([]);
  expect(f.service.list({ query: "does-not-exist" })).toEqual([]);
});

it("blocks a new task run on unresolved effects from an older run and revision", () => {
  const f = fixture();
  f.repo.saveRun({ runId: "r1", goal: f.task.objective, pageIds: ["p1"], status: "interrupted", config: { taskId: f.task.taskId, taskRevision: 1 }, createdAt: Date.now() });
  const ledger = new DurableWriteLedger(f.db);
  ledger.begin({ runId: "r1", pageId: "p1", documentEpoch: 1, signature: "submit" });
  f.service.update({ taskId: f.task.taskId, expectedRevision: 1, title: "Follow-up" });
  expect(() => f.service.prepareRun(f.task.taskId, 2)).toThrow("unresolved action");
  expect(() => f.service.archive(f.task.taskId, 2, true)).toThrow("unresolved action");
  expect(f.service.details(f.task.taskId).runs[0]?.currentRevision).toBe(false);
});

it("keeps unresolved connected operations visible instead of archiving them", () => {
  const f=fixture();
  f.repo.saveRun({runId:'connected-write',goal:f.task.objective,pageIds:[],status:'interrupted',config:{taskId:f.task.taskId,taskRevision:1},createdAt:Date.now()});
  f.repo.saveOperation({operationId:'op',siteKey:'example.test',name:'update',effectClass:'write'});
  f.repo.saveInvocation({invocationId:'inv',operationId:'op',runId:'connected-write',status:'interrupted',effectOutcome:'unknown',startedAt:Date.now()});
  expect(()=>f.service.archive(f.task.taskId,1,true)).toThrow('unresolved operation');
});

it('prepares local commands only for a current idle open task with the selected project attached',()=>{
 const f=fixture(),projectId='11111111-1111-4111-8111-111111111111';
 expect(()=>f.service.prepareLocalCommand(f.task.taskId,1,projectId)).toThrow('Attach this project');
 f.service.update({taskId:f.task.taskId,expectedRevision:1,resources:[{...f.task.resources[0],projectId}]});
 expect(f.service.prepareLocalCommand(f.task.taskId,2,projectId).revision).toBe(2);
 expect(()=>f.service.prepareLocalCommand(f.task.taskId,1,projectId)).toThrow('revision changed');
 f.repo.saveRun({runId:'local-guard',goal:'Active agent',pageIds:[],status:'running',config:{taskId:f.task.taskId,taskRevision:2},createdAt:Date.now()});
 expect(()=>f.service.prepareLocalCommand(f.task.taskId,2,projectId)).toThrow('active run');
 f.repo.saveRun({runId:'local-guard',goal:'Interrupted agent',pageIds:[],status:'interrupted',config:{taskId:f.task.taskId,taskRevision:2},createdAt:Date.now()});
 f.service.archive(f.task.taskId,2,true);expect(()=>f.service.prepareLocalCommand(f.task.taskId,3,projectId)).toThrow('Restore');
 f.service.archive(f.task.taskId,3,false);
 new DurableWriteLedger(f.db).begin({runId:'local-guard',pageId:'fixture',documentEpoch:1,signature:'submit'});
 expect(()=>f.service.prepareLocalCommand(f.task.taskId,4,projectId)).toThrow('unresolved action');
});

it('refuses project writes when the attached checkout is reference or read only',()=>{
 const f=fixture(),projectId='11111111-1111-4111-8111-111111111111';
 const referenced=f.service.update({taskId:f.task.taskId,expectedRevision:1,resources:[{...f.task.resources[0],projectId,access:'reference'}]});
 expect(()=>f.service.prepareProjectAccess(referenced.taskId,referenced.revision,projectId)).toThrow(/reference only/i);
 expect(()=>f.service.prepareLocalCommand(referenced.taskId,referenced.revision,projectId)).toThrow(/reference only/i);
 const readable=f.service.update({taskId:f.task.taskId,expectedRevision:referenced.revision,resources:[{...referenced.resources[0],access:'read'}]});
 expect(f.service.prepareProjectAccess(readable.taskId,readable.revision,projectId).revision).toBe(readable.revision);
 expect(()=>f.service.prepareLocalCommand(readable.taskId,readable.revision,projectId)).toThrow(/write access/i);
});

it('does not strand a retained cloud environment by detaching its project',()=>{
 const f=fixture(),projectId='11111111-1111-4111-8111-111111111111',environmentId='22222222-2222-4222-8222-222222222222';
 const attached=f.service.update({taskId:f.task.taskId,expectedRevision:1,resources:[{...f.task.resources[0],projectId}]});
 f.repo.setSetting('cloudEnvironments',[{taskId:f.task.taskId,taskRevision:attached.revision,projectId,environmentId,remoteName:'aux-fixture',authority:'local',status:'stopped'}]);
 expect(()=>f.service.update({taskId:f.task.taskId,expectedRevision:attached.revision,resources:[]})).toThrow('retained cloud environment');
 f.repo.setSetting('cloudEnvironments',[{taskId:f.task.taskId,taskRevision:attached.revision,projectId,environmentId,remoteName:'aux-fixture',authority:'local',status:'deleted'}]);
 expect(f.service.update({taskId:f.task.taskId,expectedRevision:attached.revision,resources:[]}).resources).toEqual([]);
});


it("pauses Space memory without deleting notes and searches their content",()=>{
  const f=fixture();
  const saved=f.service.setWorkspaceMemory(f.workspace.workspaceId,0,"Prefer accessible charts and metric units.");
  const paused=f.service.setWorkspaceMemory(f.workspace.workspaceId,saved.revision,saved.content,false);
  expect(paused).toMatchObject({enabled:false,content:saved.content,revision:2});
  expect(f.service.searchWorkspaceMemory("METRIC")).toEqual([expect.objectContaining({workspaceId:f.workspace.workspaceId,enabled:false,excerpt:expect.stringContaining("metric units")})]);
  expect(f.service.searchWorkspaceMemory("no matching phrase")).toEqual([]);
  expect(f.service.setWorkspaceMemory(f.workspace.workspaceId,2,"Edited while paused").enabled).toBe(false);
  expect(()=>f.service.setWorkspaceMemory(f.workspace.workspaceId,2,"Stale",true)).toThrow("changed");
});

it("searches task objectives before limiting and searches saved conversation answers", () => {
  const f = fixture();
  for (let index = 0; index < 14; index++) f.service.create({workspaceId:f.workspace.workspaceId,title:`Other ${index}`,objective:"Unrelated work",criteria:f.task.criteria,resources:[]});
  expect(f.service.list({query:"report the result",limit:1}).map(task=>task.taskId)).toEqual([f.task.taskId]);
  f.repo.saveRun({runId:"answer-search",goal:"Summarize the decision",pageIds:[],status:"completed",config:{chatId:"saved-answer"},result:{answer:"Use cobalt for the navigation accent."},createdAt:100});
  expect(f.repo.listConversations(10,{query:"cobalt"}).map(chat=>chat.chatId)).toEqual(["saved-answer"]);
  expect(f.repo.listConversations(10,{query:"not present"})).toEqual([]);
});


it("preserves individual memory notes across legacy edits and removes their search entries on deletion", () => {
  const f = fixture(), id = f.workspace.workspaceId;
  const note = { itemId: "note-one", content: "Use metric units", enabled: true, sourceUrl: "https://example.com/preferences", createdAt: 1, updatedAt: 1 };
  f.service.setWorkspaceMemory(id, 0, "Legacy notes", true, [note]);
  const edited = f.service.setWorkspaceMemory(id, 1, "Edited legacy notes");
  expect(edited.items).toEqual([note]);
  expect(f.service.searchWorkspaceMemory("metric")).toHaveLength(1);
  expect(() => f.service.setWorkspaceMemory(id, 1, "Conflict", true, [])).toThrow("changed");
  f.service.setWorkspaceMemory(id, edited.revision, edited.content, true, []);
  expect(f.service.searchWorkspaceMemory("metric")).toEqual([]);
  expect(f.service.workspaceMemory(id).content).toBe("Edited legacy notes");
});


it("normalizes memory site exclusions and preserves them through note edits", () => {
  const f = fixture(), id = f.workspace.workspaceId;
  const saved = f.service.setWorkspaceMemory(id, 0, "Notes", undefined, undefined, ["https://EXAMPLE.com/path", "https://example.com/else"]);
  expect(saved.excludedOrigins).toEqual(["https://example.com"]);
  expect(f.service.setWorkspaceMemory(id, 1, "Edited notes").excludedOrigins).toEqual(saved.excludedOrigins);
  expect(() => f.service.setWorkspaceMemory(id, 2, "No", undefined, undefined, ["https://user:password@example.com/"])).toThrow("without credentials");
  expect(f.service.workspaceMemory(id).revision).toBe(2);
  expect(f.service.setWorkspaceMemory(id, 2, "Edited notes", undefined, undefined, []).excludedOrigins).toEqual([]);
});
