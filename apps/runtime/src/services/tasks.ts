import { readWorkspaceMemory } from "./workspace-memory.js";
import { BrowsingMemory } from "./browsing-memory.js";
import { memoryOrigin } from "@aux/contracts/memory-context";
import { randomUUID } from "node:crypto";
import { TaskCreateParams, TaskPromoteParams, TaskSchema, TaskUpdateParams, WorkspaceMemoryItemSchema, AuxError, taskConversationId, taskMatchesQuery, type ProjectEffectName, type Task, type Workspace, type WorkspaceMemory } from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { EventBus } from "../events.js";
import { PROJECT_EFFECT_ACCESS } from "./project-effects.js";

const ACTIVE_RUNS = "('queued','planning','running','paused','needs_input')";

/** Resources describe task context. They never grant access or read their locator. */
export class TaskService {
  constructor(private repo: Repo, private events: EventBus) {}

  createWorkspace(name: string): Workspace {
    const workspace = { workspaceId: randomUUID(), name: name.trim(), createdAt: Date.now() };
    if (!workspace.name || workspace.name.length > 100) throw new AuxError("invalid_params", "Workspace name must contain 1–100 characters");
    this.repo.db.prepare("INSERT INTO workspaces VALUES(?,?,?)").run(workspace.workspaceId, workspace.name, workspace.createdAt);
    this.events.emit("workspace.created", { workspace });
    return workspace;
  }

  workspaces(): Workspace[] {
    return this.repo.db.prepare("SELECT workspace_id AS workspaceId,name,created_at AS createdAt FROM workspaces ORDER BY created_at,workspace_id").all() as unknown as Workspace[];
  }

  workspaceMemory(workspaceId: string): WorkspaceMemory {
    return readWorkspaceMemory(this.repo, workspaceId);
  }

  searchWorkspaceMemory(query:string) {
    const needle=query.trim().toLocaleLowerCase();
    if(!needle)return [];
    return this.workspaces().flatMap(workspace=>{
      const memory=this.workspaceMemory(workspace.workspaceId), searchable=[memory.content,...(memory.items??[]).map(item=>`${item.content} ${item.sourceUrl??""}`)].join("\n"),index=searchable.toLocaleLowerCase().indexOf(needle);
      if(index<0&&!workspace.name.toLocaleLowerCase().includes(needle))return [];
      const start=Math.max(0,index-60),end=Math.min(searchable.length,start+240);
      return [{workspaceId:workspace.workspaceId,name:workspace.name,enabled:memory.enabled!==false,excerpt:`${start?"…":""}${searchable.slice(start,end)}${end<searchable.length?"…":""}`}];
    }).slice(0,100);
  }

  setWorkspaceMemory(workspaceId: string, expectedRevision: number, content: string, enabled?:boolean, items?: WorkspaceMemory["items"], excludedOrigins?: string[]): WorkspaceMemory {
    const prior = this.workspaceMemory(workspaceId);
    if (prior.revision !== expectedRevision) throw new AuxError("conflict", "Workspace memory changed; reload it before saving.");
    if (items && (items.length > 40 || new Set(items.map(item => item.itemId)).size !== items.length || items.some(item => !WorkspaceMemoryItemSchema.safeParse(item).success)))
      throw new AuxError("invalid_params", "Use up to 40 valid memory notes with distinct identities.");
    let origins = prior.excludedOrigins ?? [];
    if (excludedOrigins) {
      if (excludedOrigins.length > 100) throw new AuxError("invalid_params", "Use up to 100 excluded sites.");
      try { origins = [...new Set(excludedOrigins.map(memoryOrigin))]; }
      catch { throw new AuxError("invalid_params", "Use web addresses without credentials for excluded sites."); }
    }
    const next = { workspaceId, excludedOrigins: origins, items: items ?? prior.items ?? [], enabled:enabled??prior.enabled??true, content: content.slice(0, 16_000), revision: prior.revision + 1, updatedAt: Date.now() };
    this.repo.transaction(() => {
      this.repo.setSetting(`workspaceMemory:${workspaceId}`, next);
      // An excluded site must leave local browsing memory as well as future prompts.
      new BrowsingMemory(this.repo).get(workspaceId);
      for (const origin of origins) this.repo.db.prepare("DELETE FROM content_memory WHERE workspace_id=? AND origin=?").run(workspaceId, origin);
    });
    this.events.emit("workspace.memory.updated", { workspaceId, revision: next.revision });
    return next;
  }

  create(input: unknown): Task {
    const definition = TaskCreateParams.parse(input);
    if (!this.repo.db.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(definition.workspaceId)) throw new AuxError("not_found", "Workspace does not exist");
    if (definition.parentTaskId) {
      const parent = this.get(definition.parentTaskId);
      if (parent.workspaceId !== definition.workspaceId) throw new AuxError("permission_denied", "A child task must remain in its parent workspace");
      if (parent.state === "archived") throw new AuxError("conflict", "Restore the parent task before adding a child task");
      let cursor: Task | undefined = parent;
      let depth = 1;
      while (cursor.parentTaskId) {
        if (++depth > 4) throw new AuxError("conflict", "Aux limits child-task coordination to four levels");
        cursor = this.get(cursor.parentTaskId);
      }
      const children = this.list({ workspaceId: definition.workspaceId, includeArchived: true, limit: 500 }).filter(task => task.parentTaskId === parent.taskId);
      if (children.length >= 20) throw new AuxError("conflict", "This task already has 20 child tasks");
    }
    const now = Date.now();
    const task: Task = { ...definition, taskId: randomUUID(), revision: 1, state: "open", createdAt: now, updatedAt: now };
    this.repo.transaction(() => {
      this.repo.db.prepare("INSERT INTO tasks VALUES(?,?,?,?,?,?)").run(task.taskId, task.workspaceId, task.revision, task.state, now, JSON.stringify(task));
      this.saveRevision(task);
    });
    this.events.emit("task.created", { task });
    return task;
  }

  promote(input: unknown): Task {
    const { chatId, expectedRunId, ...definition } = TaskPromoteParams.parse(input);
    let created = false;
    const task = this.repo.transaction(() => {
      const existing = this.repo.taskForConversation(chatId);
      if (existing) return this.get(existing);
      const conversation = this.repo.getConversation(chatId);
      if (!conversation) throw new AuxError("not_found", "Conversation not found.");
      if (conversation.archived) throw new AuxError("conflict", "Restore the conversation before saving it as a task.");
      if (conversation.taskId) return this.get(conversation.taskId);
      if (conversation.latestRun.runId !== expectedRunId) throw new AuxError("conflict", "The conversation changed. Review its latest reply before saving the task.");
      if (this.repo.db.prepare(`SELECT 1 FROM runs WHERE (json_extract(config,'$.chatId')=? OR run_id=?) AND status IN ${ACTIVE_RUNS} LIMIT 1`).get(chatId, chatId)) throw new AuxError("conflict", "Wait for or stop the current turn before saving a task.");
      if (this.repo.db.prepare("SELECT 1 FROM action_intents a JOIN runs r ON r.run_id=a.run_id WHERE (json_extract(r.config,'$.chatId')=? OR r.run_id=?) AND a.status IN ('pending','uncertain') LIMIT 1").get(chatId, chatId)
        || this.repo.db.prepare("SELECT 1 FROM operation_invocations o JOIN runs r ON r.run_id=o.run_id WHERE (json_extract(r.config,'$.chatId')=? OR r.run_id=?) AND (o.status IN ('running','interrupted') OR o.effect_outcome='unknown') LIMIT 1").get(chatId, chatId)) throw new AuxError("conflict", "Resolve this conversation's uncertain actions before saving it as a task.");
      if (!this.repo.db.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(definition.workspaceId)) throw new AuxError("not_found", "Space does not exist.");
      const now = Date.now();
      const task: Task = { ...definition, conversationId: chatId, taskId: randomUUID(), revision: 1, state: "open", createdAt: now, updatedAt: now };
      this.repo.db.prepare("INSERT INTO tasks VALUES(?,?,?,?,?,?)").run(task.taskId, task.workspaceId, task.revision, task.state, now, JSON.stringify(task));
      this.saveRevision(task);
      this.repo.setSetting(`conversationWorkspace:${chatId}`, task.workspaceId);
      this.repo.db.prepare("UPDATE conversations SET title=? WHERE chat_id=?").run(task.title.slice(0,160), chatId);
      created = true;
      return task;
    });
    if (created) this.events.emit("task.created", { task });
    return task;
  }

  descendants(taskId: string, limit = 500): Task[] {
    const root = this.get(taskId);
    const candidates = this.list({ workspaceId: root.workspaceId, includeArchived: true, limit });
    const allowed = new Set([root.taskId]);
    let changed = true;
    while (changed && allowed.size < limit) {
      changed = false;
      for (const task of candidates) if (task.parentTaskId && allowed.has(task.parentTaskId) && !allowed.has(task.taskId)) { allowed.add(task.taskId); changed = true; }
    }
    return [root, ...candidates.filter(task => task.taskId !== root.taskId && allowed.has(task.taskId))].slice(0, limit);
  }

  get(taskId: string): Task {
    const row = this.repo.db.prepare("SELECT json FROM tasks WHERE task_id=?").get(taskId) as { json: string } | undefined;
    if (!row) throw new AuxError("not_found", "Task does not exist");
    return TaskSchema.parse(JSON.parse(row.json));
  }

  list(opts: { query?:string; workspaceId?: string; includeArchived?: boolean; limit?: number } = {}): Task[] {
    return (this.repo.db.prepare("SELECT json FROM tasks WHERE (? IS NULL OR workspace_id=?) AND (? OR state='open') ORDER BY updated_at DESC,task_id LIMIT 500")
      .all(opts.workspaceId ?? null, opts.workspaceId ?? null, opts.includeArchived ? 1 : 0) as { json: string }[])
      .map(row => TaskSchema.parse(JSON.parse(row.json)))
      .filter(task => taskMatchesQuery(task, opts.query))
      .slice(0, opts.limit ?? 100);
  }

  details(taskId: string) {
    const task = this.get(taskId);
    const revisions = (this.repo.db.prepare("SELECT json FROM task_revisions WHERE task_id=? ORDER BY revision").all(taskId) as { json: string }[])
      .map(row => TaskSchema.parse(JSON.parse(row.json)));
    const rows = this.repo.db.prepare("SELECT run_id FROM runs WHERE json_extract(config,'$.taskId')=? ORDER BY created_at DESC").all(taskId) as { run_id: string }[];
    const runs=rows.map(row => {
      const run = this.repo.getRun(row.run_id)!;
      return { run, currentRevision: run.config?.taskRevision === task.revision };
    });
    const descendants=this.descendants(taskId).slice(1).map(child=>{
      const row=this.repo.db.prepare("SELECT run_id FROM runs WHERE json_extract(config,'$.taskId')=? ORDER BY created_at DESC LIMIT 1").get(child.taskId) as {run_id:string}|undefined;
      const run=row?this.repo.getRun(row.run_id):undefined;let depth=1,cursor=child;
      while(cursor.parentTaskId&&cursor.parentTaskId!==taskId&&depth<4){cursor=this.get(cursor.parentTaskId);depth++;}
      return{task:child,depth,latestRun:run?{runId:run.runId,status:run.status,taskRevision:run.config?.taskRevision}:undefined,cloudAuthority:this.cloudAuthority(child.taskId,child.revision)};
    });
    return {task,revisions,runs,children:descendants};
  }

  update(input: unknown): Task {
    const { taskId, expectedRevision, ...patch } = TaskUpdateParams.parse(input);
    return this.change(taskId, expectedRevision, patch);
  }

  archive(taskId: string, expectedRevision: number, archived: boolean): Task {
    const task = this.get(taskId);
    this.requireRevision(task, expectedRevision);
    if (archived) {
      this.requireResolved(taskId);
      const openChild = this.descendants(taskId).slice(1).find(child => child.state === "open");
      if (openChild) throw new AuxError("conflict", `Archive child task “${openChild.title}” before archiving its parent`);
    } else if (task.parentTaskId) {
      let parent = this.get(task.parentTaskId);
      while (true) {
        if (parent.state === "archived") throw new AuxError("conflict", `Restore parent task “${parent.title}” before restoring this child`);
        if (!parent.parentTaskId) break;
        parent = this.get(parent.parentTaskId);
      }
    }
    return this.change(taskId, expectedRevision, { state: archived ? "archived" : "open" });
  }

  private change(taskId: string, expectedRevision: number, patch: Partial<Task>): Task {
    const task = this.repo.transaction(() => {
      const prior = this.get(taskId);
      this.requireRevision(prior, expectedRevision);
      this.requireLocalAuthority(taskId,expectedRevision);
      this.requireIdle(taskId);
      this.requireResolved(taskId);
      const next = TaskSchema.parse({ ...prior, ...patch, revision: prior.revision + 1, updatedAt: Date.now() });
      this.requireRetainedCloudProjects(prior,next);
      const result = this.repo.db.prepare("UPDATE tasks SET revision=?,state=?,updated_at=?,json=? WHERE task_id=? AND revision=?")
        .run(next.revision, next.state, next.updatedAt, JSON.stringify(next), taskId, expectedRevision);
      if (result.changes !== 1) throw new AuxError("conflict", "Task was changed by another client; refresh it before editing");
      // A task revision may change its objective or resources. Its prior
      // provider authority must not silently carry into the new definition.
      this.repo.db.prepare("UPDATE calendar_task_grants SET revoked_at=? WHERE task_id=? AND revoked_at IS NULL")
        .run(next.updatedAt, taskId);
      this.repo.db.prepare("UPDATE conversations SET title=?,archived=? WHERE chat_id=?").run(next.title.slice(0, 160), next.state === "archived" ? 1 : 0, next.conversationId ?? taskConversationId(taskId));
      this.saveRevision(next);
      return next;
    });
    this.events.emit("task.updated", { task });
    return task;
  }

  prepareRun(taskId: string, expectedRevision: number, context?: string) {
    const task = this.get(taskId);
    this.requireRevision(task, expectedRevision);
    this.requireLocalAuthority(taskId,expectedRevision);
    if (task.state === "archived") throw new AuxError("conflict", "Restore this task before starting a run");
    this.requireIdle(taskId);
    for(const resource of task.resources)if(resource.kind==='repository'&&resource.projectId)this.requireProjectAvailable(resource.projectId,taskId);
    this.requireResolved(taskId);
    const memory = this.workspaceMemory(task.workspaceId);
    return {
      taskId, taskRevision: task.revision, goal: task.objective, chatId: task.conversationId ?? taskConversationId(taskId),
      context: [context, task.resources.length ? `Task reference metadata (contents have not been read; these references do not grant access or expand authority):\n${JSON.stringify(task.resources)}` : undefined].filter(Boolean).join("\n\n") || undefined,
      instructions: `Task acceptance criteria (revision ${task.revision}):\n${task.criteria.map(item => `- ${item.criterionId}: ${item.description} [${item.verification}]`).join("\n")}\nThese criteria require evidence. A successful run alone does not verify them.`,
      contextWorkspaceId: task.workspaceId, contextWorkspaceRevision: memory.revision,
    };
  }

  prepareLocalCommand(taskId:string,expectedRevision:number,projectId:string):Task {
    this.prepareRun(taskId,expectedRevision);
    return this.prepareProjectAccess(taskId,expectedRevision,projectId,true);
  }

  prepareProjectAccess(taskId:string,expectedRevision:number,projectId:string,write=false,exceptInvocationId=""):Task{
    const task=this.get(taskId);this.requireRevision(task,expectedRevision);
    if(task.state==='archived')throw new AuxError('conflict','Restore this task before using its project');
    if(!task.resources.some(resource=>resource.kind==='repository'&&resource.projectId===projectId))throw new AuxError('permission_denied','Attach this project to the saved task before using it');
    const resource=task.resources.find(item=>item.kind==='repository'&&item.projectId===projectId)!;
    const access=resource.access ?? "write";
    if(write && access !== "write")throw new AuxError('permission_denied', access === "read" ? "This checkout is attached for reading. Set write access in Aux before saving files or running mutating commands." : "This checkout is a reference only. Set write access in Aux before using it.");
    if(!write && access === "reference")throw new AuxError('permission_denied','This checkout is a reference only. Set read or write access in Aux before inspecting it.');
    if(write){this.requireLocalAuthority(taskId,expectedRevision);this.requireIdle(taskId);this.requireResolved(taskId,exceptInvocationId);this.requireProjectAvailable(projectId,taskId);}
    return task;
  }
  preparePageAccess(taskId:string,expectedRevision:number,pageId:string,write=false,previewGranted=false):Task{
    const task=this.get(taskId);this.requireRevision(task,expectedRevision);
    if(task.state==='archived')throw new AuxError('conflict','Restore this task before using its page');
    const attached=task.resources.some(resource=>resource.kind==='page'&&resource.locator===pageId)
      ||this.details(taskId).runs.some(({run,currentRevision})=>currentRevision&&run.pageIds.includes(pageId));
    if(!attached&&!previewGranted)throw new AuxError('permission_denied','Attach this page to the saved task before using it');
    if(write){this.requireLocalAuthority(taskId,expectedRevision);this.requireIdle(taskId);this.requireResolved(taskId);}
    return task;
  }
  confirmPageExecution(taskId:string,expectedRevision:number,write:boolean):void{
    const task=this.get(taskId);this.requireRevision(task,expectedRevision);
    if(task.state==='archived')throw new AuxError('conflict','Restore this task before using its page');
    if(write)this.requireLocalAuthority(taskId,expectedRevision);
  }
  /** Native dispatch rechecks one exact broker invocation without blocking itself. */
  confirmProjectInvocation(taskId:string,expectedRevision:number,projectId:string,invocationId:string,name:ProjectEffectName):Task{
    const row=this.repo.db.prepare(`SELECT i.status,i.effect_outcome AS outcome,i.inputs,o.site_key AS site,o.name
      FROM operation_invocations i JOIN operations o ON o.operation_id=i.operation_id WHERE i.invocation_id=?`).get(invocationId) as
      {status:string;outcome:string;inputs:string;site:string;name:string}|undefined;
    const inputs=row?JSON.parse(row.inputs) as {taskId?:string;taskRevision?:number;projectId?:string}:undefined;
    if(!row||row.site!=='aux.project'||row.name!==name||row.status!=='running'||row.outcome!=='unknown'||inputs?.taskId!==taskId
      ||inputs.taskRevision!==expectedRevision||inputs.projectId!==projectId)
      throw new AuxError('permission_denied','This native approval does not match an active project invocation.');
    return this.prepareProjectAccess(taskId,expectedRevision,projectId,PROJECT_EFFECT_ACCESS[name]!=='read',invocationId);
  }
  prepareCloudMutation(taskId:string,expectedRevision:number,projectId:string,environmentId:string):Task{
    const task=this.prepareProjectAccess(taskId,expectedRevision,projectId);const authority=this.cloudAuthority(taskId,expectedRevision),projectAuthority=this.cloudProjectAuthority(projectId);
    if(authority&&authority.environmentId!==environmentId)throw new AuxError('conflict','Another cloud environment currently owns this task revision. Stop it before using this environment.');
    if(projectAuthority&&projectAuthority.environmentId!==environmentId)throw new AuxError('conflict',`Cloud environment ${projectAuthority.remoteName} already owns this project through another task. Stop it before starting work here.`);
    if(!authority)throw new AuxError('conflict','Hand off this task revision to the cloud environment before starting cloud work.');return task;
  }
  prepareCloudLifecycle(taskId:string,expectedRevision:number,projectId:string,environmentId:string):Task{
    const task=this.prepareProjectAccess(taskId,expectedRevision,projectId);const authority=this.cloudAuthority(taskId,expectedRevision),projectAuthority=this.cloudProjectAuthority(projectId);
    if(authority&&authority.environmentId!==environmentId)throw new AuxError('conflict','Another cloud environment currently owns this task revision. Stop it before changing this environment.');
    if(projectAuthority&&projectAuthority.environmentId!==environmentId)throw new AuxError('conflict',`Cloud environment ${projectAuthority.remoteName} owns this project through another task.`);
    if(!authority)this.requireIdle(taskId);return task;
  }
  requireLocalAuthority(taskId:string,revision:number):void{const authority=this.cloudAuthority(taskId,revision);if(authority)throw new AuxError('conflict',`This task revision is handed off to cloud environment ${authority.remoteName}. Stop and checkpoint that environment before changing or running the task locally.`);}
  currentCloudAuthority(taskId:string,revision:number):{environmentId:string;remoteName:string}|undefined{return this.cloudAuthority(taskId,revision);}
  private cloudAuthority(taskId:string,revision:number):{environmentId:string;remoteName:string}|undefined{
    const value=this.repo.getSetting<unknown>('cloudEnvironments');if(!Array.isArray(value))return undefined;
    for(const item of value){if(!item||typeof item!=='object')continue;const record=item as Record<string,unknown>;if(record.taskId===taskId&&record.taskRevision===revision&&record.authority==='cloud'&&typeof record.environmentId==='string'&&typeof record.remoteName==='string'&&record.status!=='deleted')return{environmentId:record.environmentId,remoteName:record.remoteName};}return undefined;
  }
  private cloudProjectAuthority(projectId:string):{environmentId:string;remoteName:string;taskId:string}|undefined{
    const value=this.repo.getSetting<unknown>('cloudEnvironments');if(!Array.isArray(value))return undefined;
    for(const item of value){if(!item||typeof item!=='object')continue;const record=item as Record<string,unknown>;if(record.projectId===projectId&&record.authority==='cloud'&&typeof record.environmentId==='string'&&typeof record.remoteName==='string'&&typeof record.taskId==='string'&&record.status!=='deleted')return{environmentId:record.environmentId,remoteName:record.remoteName,taskId:record.taskId};}return undefined;
  }
  private requireProjectAvailable(projectId:string,taskId:string):void{
    const cloud=this.cloudProjectAuthority(projectId);if(cloud)throw new AuxError('conflict',`Cloud environment ${cloud.remoteName} owns this project through task ${cloud.taskId}. Stop and checkpoint it before running or writing locally.`);
    const operation=this.repo.db.prepare(`SELECT i.invocation_id FROM operation_invocations i JOIN operations o ON o.operation_id=i.operation_id
      WHERE o.site_key='aux.project' AND json_extract(i.inputs,'$.projectId')=? AND json_extract(i.inputs,'$.taskId')!=?
      AND (i.status IN ('running','interrupted') OR i.effect_outcome='unknown') LIMIT 1`).get(projectId,taskId);
    if(operation)throw new AuxError('conflict','Another task has an unfinished or uncertain operation in this checkout. Resolve it before using the project.');
    const row=this.repo.db.prepare(`SELECT json_extract(r.config,'$.taskId') AS taskId FROM runs r JOIN tasks t ON t.task_id=json_extract(r.config,'$.taskId') WHERE r.status IN ${ACTIVE_RUNS} AND t.task_id!=? AND EXISTS (SELECT 1 FROM json_each(t.json,'$.resources') resource WHERE json_extract(resource.value,'$.kind')='repository' AND json_extract(resource.value,'$.projectId')=?) LIMIT 1`).get(taskId,projectId) as {taskId:string}|undefined;
    if(row)throw new AuxError('conflict',`Another task is actively using this project. Stop that task before starting a second coordinator on the same checkout.`);
  }
  prepareProjectList(taskId:string,expectedRevision:number):Task{
    const task=this.get(taskId);this.requireRevision(task,expectedRevision);
    if(task.state==='archived')throw new AuxError('conflict','Restore this task before using its projects');
    return task;
  }

  private requireRevision(task: Task, expectedRevision: number) {
    if (task.revision !== expectedRevision) throw new AuxError("conflict", "Task revision changed; refresh before continuing");
  }

  private requireIdle(taskId: string) {
    if (this.repo.db.prepare(`SELECT 1 FROM runs WHERE json_extract(config,'$.taskId')=? AND status IN ${ACTIVE_RUNS} LIMIT 1`).get(taskId)) {
      throw new AuxError("conflict", "This task has an active run. Stop it before revising the task or starting another run.");
    }
  }

  private requireResolved(taskId:string,exceptInvocationId=""){
    const unresolved=this.repo.db.prepare(`SELECT a.id FROM action_intents a LEFT JOIN runs r ON r.run_id=a.run_id
      WHERE coalesce(a.task_id,json_extract(r.config,'$.taskId'))=? AND a.status IN ('pending','uncertain') LIMIT 1`).get(taskId);
    if(unresolved)throw new AuxError('conflict','This task has an unresolved action; reconcile its outcome before continuing or archiving it');
    const operation=this.repo.db.prepare(`SELECT i.invocation_id FROM operation_invocations i JOIN operations o ON o.operation_id=i.operation_id LEFT JOIN runs r ON r.run_id=i.run_id
      WHERE coalesce(json_extract(r.config,'$.taskId'),json_extract(i.inputs,'$.taskId'))=? AND o.effect_class!='read'
      AND i.invocation_id!=? AND (i.status IN ('running','interrupted') OR i.effect_outcome='unknown') LIMIT 1`).get(taskId,exceptInvocationId);
    if(operation)throw new AuxError('conflict','This task has an unresolved operation; reconcile its outcome before continuing or archiving it');
  }

  private requireRetainedCloudProjects(prior:Task,next:Task){
    const value=this.repo.getSetting<unknown>('cloudEnvironments');if(!Array.isArray(value))return;
    const attached=new Set(next.resources.flatMap(resource=>resource.kind==='repository'&&resource.projectId?[resource.projectId]:[]));
    for(const item of value){
      if(!item||typeof item!=='object')continue;const record=item as Record<string,unknown>;
      if(record.taskId===prior.taskId&&record.status!=='deleted'&&typeof record.projectId==='string'&&!attached.has(record.projectId))throw new AuxError('conflict','Delete or reconcile the retained cloud environment before removing its project from this task');
    }
  }

  private saveRevision(task: Task) {
    this.repo.db.prepare("INSERT INTO task_revisions VALUES(?,?,?)").run(task.taskId, task.revision, JSON.stringify(task));
  }
}
