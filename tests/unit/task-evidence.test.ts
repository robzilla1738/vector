import { afterEach, expect, it } from "vitest";
import { DurableWriteLedger, EventBus, makeInvoker, openDb, Repo, TaskEvidenceService, TaskService, type PageService, type Services } from "@aux/runtime";
import { TaskReceiptSchema } from "@aux/contracts";
import { isShellDocument } from "../../apps/desktop/main/shell-origin.js";

const cleanup: (() => void)[] = [];
afterEach(() => cleanup.splice(0).forEach(fn => fn()));
function fixture() {
  const db = openDb(":memory:"); cleanup.push(() => db.close());
  const repo = new Repo(db), events = new EventBus(repo), tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Fixture");
  const task = tasks.create({ workspaceId: workspace.workspaceId, title: "Check order", objective: "Check fixture order",
    criteria: [{ criterionId: "order", description: "One order exists", verification: "manual" }],
    resources: [{ resourceId: "page", kind: "page", locator: "p1", label: "Fixture tab" }] });
  const page = { url: "https://fixture.test/order", documentEpoch: 1, lastRevision: 1, viewStatus: "visible" };
  const pages = { get: () => page, observe: async () => ({ content: { url: page.url, title: "Order", text: "Order 123" }, documentEpoch: page.documentEpoch, revision: page.lastRevision, observedAt: Date.now() }) } as unknown as PageService;
  const evidence = new TaskEvidenceService(repo, events, pages);
  const invoke = makeInvoker({ repo, events, pages } as Services);
  const base = { taskId: task.taskId, expectedRevision: 1, criterionId: "order" };
  const note = () => evidence.recordNote({ ...base, summary: "Independent fixture record: order 123" }, "desktop_user");
  const review = (id: string) => evidence.review({ ...base, evidenceIds: [id], outcome: "accepted", note: "I checked the fixture record" });
  const run = (status: "interrupted" | "running" = "interrupted") => repo.saveRun({ runId: "r1", goal: task.objective, pageIds: ["p1"], status, createdAt: Date.now(), config: { taskId: task.taskId, taskRevision: 1 } });
  return { db, repo, tasks, task, evidence, page, invoke, base, note, review, run };
}

it("keeps external claims separate from desktop acceptance and rejects actor spoofing", async () => {
  const f = fixture();
  const record = await f.invoke("tasks.recordEvidence", { ...f.base, summary: "Agent says done" }) as { evidenceId: string; actor: string };
  expect(record.actor).toBe("external_client");
  const params = { ...f.base, evidenceIds: [record.evidenceId], outcome: "accepted", note: "Checked" };
  await expect(f.invoke("tasks.reviewCriterion", params)).rejects.toMatchObject({ code: "permission_denied" });
  await expect(f.invoke("tasks.reviewCriterion", { ...params, desktopUser: true })).rejects.toThrow();
  await expect(f.invoke("tasks.recordEvidence", { ...f.base, summary: "Forged", actor: "desktop_user" })).rejects.toThrow();
  expect(f.evidence.receipt(f.task.taskId).status).toBe("needs_review");
  await f.invoke("tasks.reviewCriterion", params, { external: false });
  const receipt = TaskReceiptSchema.parse(f.evidence.receipt(f.task.taskId));
  expect(receipt.status).toBe("accepted");
  expect(receipt.criteria[0]!.review?.actor).toBe("desktop_user");
});

it('imports revision-matched cloud claims once and leaves them for desktop review',()=>{
  const f=fixture();const result={format:'aux-cloud-result-v1' as const,taskId:f.task.taskId,taskRevision:1,sourceTree:'a'.repeat(40),status:'completed' as const,summary:'Worker completed the requested check',updatedAt:1_700_000_000_000,criteria:[{criterionId:'order',status:'met' as const,summary:'Found order 123'}],artifacts:[{path:'reports/order.txt',label:'Order report'}]};
  const environmentId='11111111-1111-4111-8111-111111111111';
  const preserved=[{artifactId:'artifact-cloud-result',label:'Worker result manifest',sha256:'b'.repeat(64),bytes:321}];
  const first=f.evidence.importCloudResult(f.task.taskId,1,environmentId,result,preserved);
  const second=f.evidence.importCloudResult(f.task.taskId,1,environmentId,result);
  expect(first.imported).toBe(1);expect(second.imported).toBe(0);expect(second.evidence.map(item=>item.evidenceId)).toEqual(first.evidence.map(item=>item.evidenceId));
  const receipt=f.evidence.receipt(f.task.taskId);expect(receipt.status).toBe('needs_review');expect(receipt.criteria[0]!.evidence).toHaveLength(1);
  expect(receipt.criteria[0]!.evidence[0]!.record).toMatchObject({actor:'external_client',source:{cloudEnvironmentId:environmentId,cloudSourceTree:result.sourceTree,cloudResultUpdatedAt:result.updatedAt,cloudArtifacts:preserved},snapshot:{title:'Validated cloud worker result'}});
  expect(receipt.criteria[0]!.evidence[0]!.record.snapshot?.text).toContain('reports/order.txt');
  expect(()=>f.evidence.importCloudResult(f.task.taskId,1,environmentId,{...result,criteria:[{criterionId:'other',status:'met',summary:'Wrong task'}]})).toThrow('outside this task revision');
});

it('preserves a cloud local-input result and its artifacts without requiring criterion claims',()=>{
  const f=fixture();const environmentId='44444444-4444-4444-8444-444444444444';
  const result={format:'aux-cloud-result-v1' as const,taskId:f.task.taskId,taskRevision:1,sourceTree:'d'.repeat(40),status:'needs_input' as const,summary:'Sign in locally before work can continue',localRequest:{kind:'browser' as const,prompt:'Open the attached account page and complete SSO.'},updatedAt:1_700_000_000_100,criteria:[],artifacts:[]};
  const artifacts=[{artifactId:'artifact-result-manifest',label:'Worker result manifest',sha256:'e'.repeat(64),bytes:222}];
  const first=f.evidence.preserveCloudResult(f.task.taskId,1,environmentId,result,artifacts);
  const second=f.evidence.preserveCloudResult(f.task.taskId,1,environmentId,result,artifacts);
  expect(first.preserved).toBe(true);expect(second.preserved).toBe(false);
  expect(f.evidence.receipt(f.task.taskId).cloudResults).toEqual([expect.objectContaining({status:'needs_input',localRequest:result.localRequest,artifacts})]);
  expect(()=>f.evidence.importCloudResult(f.task.taskId,1,environmentId,result,artifacts)).toThrow('no criterion claims');
});

it("invalidates reviews on new evidence, new runs and task revisions", () => {
  const f = fixture();
  f.review(f.note().evidenceId);
  f.note(); expect(f.evidence.receipt(f.task.taskId).status).toBe("needs_review");
  f.review(f.note().evidenceId);
  f.run(); expect(f.evidence.receipt(f.task.taskId).criteria[0]!.status).toBe("stale");
  f.tasks.update({ taskId: f.task.taskId, expectedRevision: 1, objective: "Check a second order" });
  expect(f.evidence.receipt(f.task.taskId).criteria[0]!.status).toBe("unverified");
  expect(() => f.note()).toThrow("revision changed");
});

it("aggregates descendant outcomes into the parent receipt", () => {
  const f=fixture();
  const parentEvidence=f.note();f.review(parentEvidence.evidenceId);
  const child=f.tasks.create({workspaceId:f.task.workspaceId,parentTaskId:f.task.taskId,title:'Verify child outcome',objective:'Check a child record',criteria:[{criterionId:'child',description:'Child record exists',verification:'manual'}],resources:[]});
  expect(f.evidence.receipt(f.task.taskId)).toMatchObject({status:'needs_review',childTasks:[{taskId:child.taskId,depth:1,status:'needs_review',modelCalls:0,knownCostUsd:0,costComplete:true}]});
  const childEvidence=f.evidence.recordNote({taskId:child.taskId,expectedRevision:1,criterionId:'child',summary:'Child record checked'},'desktop_user');
  f.evidence.review({taskId:child.taskId,expectedRevision:1,criterionId:'child',evidenceIds:[childEvidence.evidenceId],outcome:'accepted',note:'Reviewed child record'});
  expect(f.evidence.receipt(f.task.taskId).status).toBe('accepted');
  f.repo.saveRun({runId:'child-active',goal:child.objective,pageIds:[],status:'running',createdAt:Date.now(),config:{taskId:child.taskId,taskRevision:1}});
  expect(f.evidence.receipt(f.task.taskId)).toMatchObject({status:'in_progress',childTasks:[{status:'in_progress'}]});
});

it("captures only task-scoped pages and rejects known stale observations", async () => {
  const f = fixture();
  await expect(f.evidence.capture({ ...f.base, pageId: "unrelated" })).rejects.toMatchObject({ code: "permission_denied" });
  const captured = await f.evidence.capture({ ...f.base, pageId: "p1" });
  expect(captured.snapshot?.text).toBe("Order 123");
  f.review(captured.evidenceId);
  f.page.documentEpoch++;
  expect(f.evidence.receipt(f.task.taskId).criteria[0]!.status).toBe("stale");
  expect(() => f.review(captured.evidenceId)).toThrow("stale");
});

it("keeps uncertain actions blocking until desktop reconciliation with current evidence", async () => {
  const f = fixture(); f.run();
  const ledger = new DurableWriteLedger(f.db);
  const action = ledger.begin({ runId: "r1", pageId: "p1", documentEpoch: 1, signature: "submit" });
  const id = f.note().evidenceId; f.review(id);
  expect(f.evidence.receipt(f.task.taskId).status).toBe("uncertain");
  const params = { taskId: f.task.taskId, expectedRevision: 1, intentId: action.intent.id, evidenceId: id, outcome: "applied", note: "Order confirmed in fixture records" };
  await expect(f.invoke("tasks.reconcileAction", params)).rejects.toMatchObject({ code: "permission_denied" });
  await expect(f.invoke("tasks.reconcileAction", { ...params, intentId: "unrelated" }, { external: false })).rejects.toThrow("belongs to the task");
  await f.invoke("tasks.reconcileAction", params, { external: false });
  expect(f.evidence.receipt(f.task.taskId).status).toBe("accepted");
  expect(ledger.unresolved("r1")).toEqual([]);
});

it("keeps direct task-bound browser writes in the receipt and requires task evidence to reconcile", async () => {
  const f=fixture(),ledger=new DurableWriteLedger(f.db);
  const action=ledger.begin({runId:"direct:p1",pageId:"p1",documentEpoch:1,signature:"submit",taskId:f.task.taskId,taskRevision:1});
  const competing=ledger.begin({runId:"direct:p2",pageId:"p2",documentEpoch:1,signature:"another",taskId:f.task.taskId,taskRevision:1});
  expect(competing).toMatchObject({duplicate:true,intent:{id:action.intent.id}});
  expect(f.evidence.receipt(f.task.taskId).unresolvedActions).toMatchObject([{intentId:action.intent.id}]);
  expect(()=>f.tasks.preparePageAccess(f.task.taskId,1,"p1",true)).toThrow("unresolved action");
  await expect(f.invoke("pages.reconcileWrite",{pageId:"p1",outcome:"applied",evidence:"Looked at the page"})).rejects.toMatchObject({code:"conflict"});
  const evidenceId=f.note().evidenceId;
  await f.invoke("tasks.reconcileAction",{taskId:f.task.taskId,expectedRevision:1,intentId:action.intent.id,evidenceId,outcome:"applied",note:"Order confirmed"},{external:false});
  expect(f.evidence.receipt(f.task.taskId).unresolvedActions).toEqual([]);
});

it('keeps uncertain connected writes blocking until desktop reconciliation with current evidence',async()=>{
  const f=fixture();f.run();
  f.repo.saveOperation({operationId:'op-write',siteKey:'fixture.test',name:'submit-order',effectClass:'write'});
  f.repo.saveInvocation({invocationId:'inv-write',operationId:'op-write',runId:'r1',status:'interrupted',effectOutcome:'unknown',startedAt:Date.now(),error:'Connection ended before confirmation'});
  const evidenceId=f.note().evidenceId;f.review(evidenceId);
  const receipt=f.evidence.receipt(f.task.taskId);expect(receipt.status).toBe('uncertain');expect(receipt.unresolvedOperations).toMatchObject([{invocationId:'inv-write',operation:'fixture.test/submit-order',effectClass:'write'}]);
  expect(()=>f.tasks.prepareRun(f.task.taskId,1)).toThrow('unresolved operation');
  const params={taskId:f.task.taskId,expectedRevision:1,invocationId:'inv-write',evidenceId,outcome:'not_applied',note:'Independent fixture records contain no matching order'};
  await expect(f.invoke('tasks.reconcileOperation',params)).rejects.toMatchObject({code:'permission_denied'});
  await f.invoke('tasks.reconcileOperation',params,{external:false});
  expect(f.evidence.receipt(f.task.taskId).unresolvedOperations).toEqual([]);expect(f.repo.getInvocation('inv-write')).toMatchObject({status:'reconciled',effectOutcome:'not-dispatched'});
  expect(f.db.prepare("SELECT outcome,evidence_id FROM operation_reconciliations WHERE invocation_id='inv-write'").get()).toEqual({outcome:'not_applied',evidence_id:evidenceId});
  expect(()=>f.tasks.prepareRun(f.task.taskId,1)).not.toThrow();
});

it("blocks decisions during active work", () => {
  const f = fixture(); f.run("running"); const id = f.note().evidenceId;
  expect(() => f.review(id)).toThrow("Stop active task runs");
  expect(f.evidence.receipt(f.task.taskId).status).toBe("in_progress");
});

it("recognizes only the shell document as desktop UI", () => {
  expect(isShellDocument("file:///app/renderer/index.html", "/app/renderer/index.html")).toBe(true);
  expect(isShellDocument("file:///tmp/untrusted.html", "/app/renderer/index.html")).toBe(false);
  expect(isShellDocument("https://untrusted.test/", "/app/renderer/index.html")).toBe(false);
  expect(isShellDocument("http://localhost:5173/", "/app/renderer/index.html", "http://localhost:5173/")).toBe(true);
  expect(isShellDocument("http://localhost:5173/other", "/app/renderer/index.html", "http://localhost:5173/")).toBe(false);
});

it("imports exact local document snapshots only through desktop authority and requires fresh idle revisions", async () => {
  const f = fixture();
  const params = { ...f.base, filename: "order.md", content: "# Order\n123\n" };
  await expect(f.invoke("tasks.importDocumentEvidence", params)).rejects.toMatchObject({ code: "permission_denied" });
  await expect(f.invoke("tasks.importDocumentEvidence", { ...params, filename: "../order.md" }, { external: false })).rejects.toThrow();
  const record = await f.invoke("tasks.importDocumentEvidence", params, { external: false }) as import("@aux/contracts").TaskEvidence;
  expect(record).toMatchObject({ kind: "document_snapshot", actor: "desktop_user", source: { filename: "order.md", byteLength: 12 }, snapshot: { text: params.content } });
  expect(record.source.sha256).toMatch(/^[a-f0-9]{64}$/);
  f.review(record.evidenceId);
  expect(f.evidence.receipt(f.task.taskId).status).toBe("accepted");
  f.evidence.importDocument({ ...params, content: "Updated order" });
  expect(f.evidence.receipt(f.task.taskId).status).toBe("needs_review");
  expect(() => f.evidence.importDocument({ ...params, expectedRevision: 2 })).toThrow("revision changed");
  expect(() => f.evidence.importDocument({ ...params, content: "x\0y" })).toThrow();
  expect(() => f.evidence.importDocument({ ...params, content: "é".repeat(262145) })).toThrow();
  f.run("running");
  expect(() => f.evidence.importDocument(params)).toThrow("Stop active task runs");
});

it("reads earlier definitions and evidence without carrying acceptance into current revisions", async () => {
  const f = fixture();
  const original = f.evidence.importDocument({ ...f.base, filename: "order.txt", content: "Order 123" });
  f.review(original.evidenceId);
  f.repo.saveRun({ runId: "old-run", goal: "Original goal", pageIds: [], status: "completed", createdAt: Date.now(), config: { taskId: f.task.taskId, taskRevision: 1 } });
  f.tasks.update({ taskId: f.task.taskId, expectedRevision: 1, objective: "Check the revised order", criteria: [{ criterionId: "new", description: "Two items exist", verification: "manual" }] });
  f.repo.saveRun({ runId: "new-run", goal: "New goal", pageIds: [], status: "completed", createdAt: Date.now(), config: { taskId: f.task.taskId, taskRevision: 2 } });
  const historical = TaskReceiptSchema.parse(await f.invoke("tasks.receipt", {taskId:f.task.taskId,revision:1}));
  expect(historical).toMatchObject({taskRevision:1,currentTaskRevision:2,objective:f.task.objective});
  expect(historical.criteria[0]!.evidence[0]!.record).toEqual(original);
  expect(historical.criteria[0]!.review?.outcome).toBe("accepted");
  expect(historical.criteria[0]!.status).toBe("stale"); // Later runs invalidate confidence, not the recorded review.
  expect(historical.runs.map(run => run.runId)).toEqual(["old-run"]);
  expect(historical.runs[0]!.currentRevision).toBe(true);
  const current = f.evidence.receipt(f.task.taskId);
  expect(current.taskRevision).toBe(2); expect(current.status).toBe("needs_review");
  expect(current.criteria[0]!.evidence).toEqual([]);
  await expect(f.invoke("tasks.receipt", {taskId:f.task.taskId,revision:99})).rejects.toMatchObject({code:"not_found"});
  expect(() => f.evidence.recordNote({...f.base,summary:"Change old evidence"}, "desktop_user")).toThrow("revision changed");
  f.tasks.archive(f.task.taskId,2,true);
  expect(f.evidence.receipt(f.task.taskId,1).criteria[0]!.evidence[0]!.record).toEqual(original);
});

it('imports only finished command results from attached projects without automatically accepting criteria',async()=>{
 const f=fixture();const projectId='11111111-1111-4111-8111-111111111111';const commandId='22222222-2222-4222-8222-222222222222';
 const command={task:{taskId:f.task.taskId,taskRevision:1,title:f.task.title,workspaceId:f.task.workspaceId},projectId,commandId,command:'printf checked',cwd:'/isolated/checkout',startedAt:1,finishedAt:2,state:'succeeded',exitCode:0,output:'checked',truncated:false};
 const input={...f.base,projectId,commandId,command};
 await expect(f.invoke('tasks.prepareLocalCommand',{taskId:f.task.taskId,expectedRevision:1,projectId})).rejects.toMatchObject({code:'permission_denied'});
 await expect(f.invoke('tasks.importCommandEvidence',input)).rejects.toMatchObject({code:'permission_denied'});
 expect(()=>f.evidence.importCommand(input)).toThrow('Attach this project');
 f.tasks.update({taskId:f.task.taskId,expectedRevision:1,resources:[{resourceId:'repo',kind:'repository',projectId,locator:command.cwd,label:'Fixture project'}]});
 const current={...input,expectedRevision:2};
 expect(()=>f.evidence.importCommand({...current,command:{...command,state:'running'}})).toThrow('finished command');
 expect(()=>f.evidence.importCommand({...current,command:{...command,projectId:'33333333-3333-4333-8333-333333333333'}})).toThrow('finished command');
 const record=f.evidence.importCommand(current);expect(record.kind).toBe('command_snapshot');expect(record.source.executionTaskId).toBe(f.task.taskId);expect(record.source.executionTaskRevision).toBe(1);expect(record.snapshot?.text).toContain('checked');expect(record.source.sha256).toMatch(/^[a-f0-9]{64}$/);
 expect(f.evidence.receipt(f.task.taskId).status).toBe('needs_review');
 f.tasks.update({taskId:f.task.taskId,expectedRevision:2,objective:'New goal'});
 expect(f.evidence.receipt(f.task.taskId).criteria[0]?.evidence).toEqual([]);
 expect(f.evidence.receipt(f.task.taskId,2).criteria[0]?.evidence[0]?.record.evidenceId).toBe(record.evidenceId);
 expect(()=>f.evidence.importCommand(current)).toThrow('revision changed');
});

it('fences local task and project mutations while one cloud environment owns the revision',()=>{
  const f=fixture();
  const projectId='11111111-1111-4111-8111-111111111111';
  const environmentId='22222222-2222-4222-8222-222222222222';
  const otherEnvironmentId='33333333-3333-4333-8333-333333333333';
  const task=f.tasks.update({taskId:f.task.taskId,expectedRevision:1,resources:[...f.task.resources,{resourceId:'repo',kind:'repository',projectId,locator:'/isolated/checkout',label:'Fixture project'}]});
  const evidence=f.evidence.recordNote({taskId:task.taskId,expectedRevision:task.revision,criterionId:'order',summary:'Order exists'},'desktop_user');
  const sibling=f.tasks.create({workspaceId:task.workspaceId,parentTaskId:task.taskId,title:'Sibling work',objective:'Use the same fixture project',criteria:[{criterionId:'sibling',description:'Sibling completes',verification:'manual'}],resources:[{resourceId:'repo',kind:'repository',projectId,locator:'/isolated/checkout',label:'Fixture project'}]});
  expect(()=>f.tasks.prepareCloudMutation(task.taskId,task.revision,projectId,environmentId)).toThrow('Hand off this task revision');
  f.repo.setSetting('cloudEnvironments',[{taskId:task.taskId,taskRevision:task.revision,projectId,authority:'cloud',environmentId,remoteName:'aux-fixture',status:'running'}]);

  expect(f.evidence.receipt(task.taskId).status).toBe('in_progress');
  expect(()=>f.tasks.prepareRun(task.taskId,task.revision)).toThrow('handed off');
  expect(()=>f.tasks.update({taskId:task.taskId,expectedRevision:task.revision,title:'Changed locally'})).toThrow('handed off');
  expect(()=>f.tasks.prepareProjectAccess(task.taskId,task.revision,projectId,true)).toThrow('handed off');
  expect(()=>f.evidence.review({taskId:task.taskId,expectedRevision:task.revision,criterionId:'order',evidenceIds:[evidence.evidenceId],outcome:'accepted',note:'Checked'})).toThrow('handed off');
  expect(f.tasks.prepareCloudMutation(task.taskId,task.revision,projectId,environmentId).taskId).toBe(task.taskId);
  expect(()=>f.tasks.prepareCloudMutation(task.taskId,task.revision,projectId,otherEnvironmentId)).toThrow('Another cloud environment');
  expect(()=>f.tasks.prepareRun(sibling.taskId,sibling.revision)).toThrow('owns this project');

  f.repo.setSetting('cloudEnvironments',[{taskId:task.taskId,taskRevision:task.revision,projectId,authority:'local',environmentId,remoteName:'aux-fixture',status:'stopped'}]);
  expect(f.tasks.prepareRun(task.taskId,task.revision).taskId).toBe(task.taskId);
  f.repo.saveRun({runId:'project-owner',goal:task.objective,pageIds:[],status:'running',createdAt:Date.now(),config:{taskId:task.taskId,taskRevision:task.revision}});
  expect(()=>f.tasks.prepareRun(sibling.taskId,sibling.revision)).toThrow('Another task is actively using this project');
});

it("records honest criterion checks without accepting the criterion", () => {
  const f = fixture();
  const manual = f.evidence.verifyCriterion(f.base);
  expect(manual).toMatchObject({ method: "manual", status: "unverified", localMatch: false });
  expect(f.db.prepare("SELECT count(*) AS n FROM criterion_reviews").get()?.n).toBe(0);
  expect(f.evidence.receipt(f.task.taskId).status).toBe("needs_review");
  expect(f.evidence.receipt(f.task.taskId).verifications[0]?.verificationId).toBe(manual.verificationId);
  const browserTask = f.tasks.update({ taskId: f.task.taskId, expectedRevision: 1, criteria: [{ criterionId: "order", description: "One order exists", verification: "browser" }] });
  const browser = f.evidence.verifyCriterion({ taskId: browserTask.taskId, expectedRevision: 2, criterionId: "order" });
  expect(browser).toMatchObject({ method: "browser", status: "needs_review", localMatch: false });
  expect(f.db.prepare("SELECT count(*) AS n FROM criterion_reviews").get()?.n).toBe(0);
});

it("refuses CLI and MCP write access on task resources", async () => {
  const f = fixture();
  await expect(f.invoke("tasks.update", {
    taskId: f.task.taskId, expectedRevision: 1,
    resources: [{ ...f.task.resources[0], access: "write" }],
  })).rejects.toMatchObject({ code: "permission_denied" });
  const updated = await f.invoke("tasks.update", {
    taskId: f.task.taskId, expectedRevision: 1,
    resources: [{ ...f.task.resources[0], access: "read" }],
  }, { external: false }) as { resources: { access: string }[] };
  expect(updated.resources[0]?.access).toBe("read");
});
