import { SavedResults } from "../services/saved-results.js";
import { BrowsingMemory } from "../services/browsing-memory.js";
import { EventTypes, MethodSchemas, newProgramId, originOfAddress, RoutineShareEnvelopeSchema, RoutineShareSchema, taskMatchesQuery, AuxError, type CloudEnvironment, type CloudTaskResult, type Condition, type MethodName, type Task } from "@aux/contracts";
import {readFile,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import type { PageService } from "../services/pages.js";
import type { SetService } from "../services/sets.js";
import type { RunService } from "../services/runs.js";
import type { ArtifactStore } from "../services/artifacts.js";
import type { SettingsService } from "../services/settings.js";
import type { ResponseStore } from "../services/responses.js";
import type { OperationService } from "../services/operations.js";
import type { StateService } from "../services/state.js";
import type { Tracer } from "../services/tracing.js";
import type { EventBus } from "../events.js";
import type { Repo } from "../store/repo.js";

import { wireObservation } from "../services/observation-wire.js";
import { chromeBookmarkFiles, readChromeBookmarksFile } from "../services/chrome-bookmarks.js";
import { BrowserImporter } from "../services/browser-import.js";
import type { DriverSet } from "../services/pages.js";

import { TaskService } from "../services/tasks.js";
import { DurableWriteLedger } from "../agent/durable.js";
import { SpaceService } from "../services/spaces.js";
import { TaskEvidenceService } from "../services/task-evidence.js";
import { summarizeModelUsage } from "../services/model-usage.js";
import type { AgentConnectionService } from "../services/agent-connections.js";
import type { AgentConnectionScope } from "@aux/contracts";
import type {NativeBridge} from '../native.js';
import {CloudEnvironmentService} from '../services/cloud-environments.js';
import {cancelRuntimeRestore,createRuntimeBackup,listRuntimeBackups,backupRetention,setBackupRetention,stageRuntimeRestore} from '../services/runtime-backup.js';
import { VaultService } from "../services/vault.js";
import { RoutineService } from "../services/routines.js";
import { PluginService } from "../services/plugins.js";
import { TranslateService } from "../services/translate.js";

function cloudArtifactMediaType(filename:string){const value=filename.toLowerCase();if(value.endsWith('.json'))return'application/json';if(value.endsWith('.md'))return'text/markdown';if(value.endsWith('.txt')||value.endsWith('.csv')||value.endsWith('.log'))return'text/plain';if(value.endsWith('.png'))return'image/png';if(value.endsWith('.jpg')||value.endsWith('.jpeg'))return'image/jpeg';if(value.endsWith('.pdf'))return'application/pdf';return'application/octet-stream';}

export interface Services {
  pages: PageService;
  sets: SetService;
  runs: RunService;
  artifacts: ArtifactStore;
  settings: SettingsService;
  events: EventBus;
  repo: Repo;
  agentConnections?: AgentConnectionService;
  native?:NativeBridge;
  vault?: VaultService;
  routines?: RoutineService;
  responses?: ResponseStore;
  operations?: OperationService;
  state?: StateService;
  tracer?: Tracer;
  drivers: () => DriverSet;
  chromeAttach: (port: number) => Promise<unknown>;
  chromeDetach: () => Promise<unknown>;
  chromeTabs: () => Promise<unknown>;
  importCookies: (opts: { source?: "auto" | "attached" | "profile" }) => Promise<unknown>;
  browserImport?: BrowserImporter;
  benchRun: (task?: string, repeats?: number) => Promise<unknown>;
}

/** Lazily build the shared importer — it needs live driver/page handles, not config. */
function browserImporter(s: Services): BrowserImporter {
  if (s.browserImport) return s.browserImport;
  s.browserImport = new BrowserImporter({
    repo: s.repo,
    emit: (type, payload) => s.events.emit(type, payload),
    chromeTabs: async () => (await s.chromeTabs()) as { url: string; title: string; type: string }[],
    openTab: async url => { await s.pages.open({ url, background: true, ownedByRuntime: false }); },
  });
  return s.browserImport;
}

/** Validates params against MethodSchemas and dispatches to services. */
export function makeInvoker(s: Services) {
  const tasks = new TaskService(s.repo, s.events);
  const browsingMemory = new BrowsingMemory(s.repo);
  browsingMemory.prune();
  const spaces = new SpaceService(s.repo, s.events);
  const taskEvidence = new TaskEvidenceService(s.repo, s.events, s.pages);
  const cloudEnvironments=new CloudEnvironmentService(s.repo,s.settings);
  const vault = s.vault ?? new VaultService(s.repo, s.native);
  const translate = new TranslateService(s.settings);
  const substituteRoutine = (objective: string, parameters: Record<string, string>) =>
    objective.replace(/\{\{([A-Za-z][A-Za-z0-9_]{0,40})\}\}/g, (_, name: string) => parameters[name] ?? "");
  const routines = s.routines ?? new RoutineService(s.repo, s.events, async (routine, parameters) => {
    if (!routine.sourceTaskId) throw new AuxError("conflict", "This routine has no saved task. Run it from a conversation in Aux.");
    const details = tasks.details(routine.sourceTaskId);
    const pageIds = details.task.resources.filter(resource => resource.kind === "page").map(resource => resource.locator).filter(pageId => {
      try { return s.pages.isAttached(pageId); } catch { return false; }
    });
    if (!pageIds.length) throw new AuxError("conflict", "Attach an open browser tab to the source task before this routine can run.");
    const prepared = tasks.prepareRun(routine.sourceTaskId, details.task.revision);
    const run = await s.runs.start({ ...prepared, goal: substituteRoutine(routine.objective, parameters), pageIds, accountLabels: routine.accountLabels.length ? routine.accountLabels : undefined });
    return { chatId: run.config?.chatId ?? details.task.conversationId, runId: run.runId };
  });
  const plugins = new PluginService(s.repo, routines);
  const validateCloudResult=(task:Task,result:CloudTaskResult)=>{
    const criteria=new Set(task.criteria.map(item=>item.criterionId));
    if(result.criteria.some(item=>!criteria.has(item.criterionId)))throw new AuxError('conflict','The cloud task result references a criterion outside this task revision.');
    const resourceId=result.localRequest?.resourceId;
    if(resourceId&&!task.resources.some(item=>item.resourceId===resourceId))throw new AuxError('conflict','The cloud task result requests a resource outside this task revision.');
    return result;
  };
  const developmentNative=()=>{
    const native=s.native;
    if(!native?.developmentProjects||!native.inspectProject||!native.githubProject||!native.recordGithubStatus||!native.writeIncidentReport||!native.listProjectFiles||!native.readProjectFile||!native.writeProjectFile||!native.createProjectFile||!native.renameProjectFile||!native.deleteProjectFile||!native.projectCommands||!native.runProjectCommand||!native.approveProjectPreview||!native.stopProjectCommand||!native.prepareProjectReview||!native.commitProject)throw new AuxError('backend_unavailable','Local development tools require the Aux desktop app');
    return native as Required<Pick<NativeBridge,'developmentProjects'|'inspectProject'|'githubProject'|'recordGithubStatus'|'writeIncidentReport'|'listProjectFiles'|'readProjectFile'|'writeProjectFile'|'createProjectFile'|'renameProjectFile'|'deleteProjectFile'|'projectCommands'|'runProjectCommand'|'approveProjectPreview'|'stopProjectCommand'|'prepareProjectReview'|'commitProject'>>&Pick<NativeBridge,'projectSnapshotTree'>;
  };
  const preserveCloudResult=async(record:CloudEnvironment,task:Task,result:CloudTaskResult)=>{
    validateCloudResult(task,result);
    const existing=taskEvidence.cloudResultPreserved(task.taskId,task.revision,record.environmentId,result.updatedAt);if(existing)return{result:existing,preserved:false};
    const staged=await cloudEnvironments.stageResultArtifacts(record,result);try{const manifest=Buffer.from(JSON.stringify(result,null,2)+'\n');const saved=await s.artifacts.saveManyStrict([{label:'cloud-result.json',buffer:manifest,mediaType:'application/json',subdir:`cloud-${task.taskId}`},...await Promise.all(staged.map(async item=>({label:item.filename,buffer:await readFile(item.path),mediaType:cloudArtifactMediaType(item.filename),subdir:`cloud-${task.taskId}`})))]);const artifacts=[{artifactId:saved[0]!.artifactId,label:'Worker result manifest',sha256:createHash('sha256').update(manifest).digest('hex'),bytes:manifest.length},...staged.map((item,index)=>({artifactId:saved[index+1]!.artifactId,label:item.label,sha256:item.sha256,bytes:item.bytes}))];return taskEvidence.preserveCloudResult(task.taskId,task.revision,record.environmentId,result,artifacts);}finally{await Promise.all(staged.map(item=>rm(item.path,{force:true})));}
  };
  cloudEnvironments.setRetentionPreserver(async record=>{
    const task=tasks.get(record.taskId);
    if(task.revision!==record.taskRevision)throw new AuxError('conflict','The cloud environment belongs to an older task revision; preserve or reconcile it before automatic deletion.');
    const result=await cloudEnvironments.taskResult(record);
    if(!result)return'none';
    await preserveCloudResult(record,task,result);
    return'preserved';
  });
  const previewPageGrants=new Map<string,Set<string>>();
  const scopedTasks = (scope: AgentConnectionScope) => scope.kind === "task"
    ? tasks.descendants(scope.taskId)
    : tasks.list({ workspaceId: scope.workspaceId, includeArchived: true, limit: 500 });
  const requireScopedTask = (scope: AgentConnectionScope, taskId: string) => {
    const task = tasks.get(taskId);
    const allowed = scope.kind === "task"
      ? scopedTasks(scope).some(candidate => candidate.taskId === task.taskId)
      : task.workspaceId === scope.workspaceId;
    if (!allowed) throw new AuxError("permission_denied", "This connection is not authorized for that task");
    return task;
  };
  // Pages a scope's tasks authorize. Building the set reads every task's
  // details, so it is cached per scope: dropped on any task or run event and
  // rebuilt at most once a second otherwise. Preview grants are read live.
  const taskPages = new Map<string, { at: number; pages: Set<string> }>();
  s.events.subscribe(event => { if (event.type.startsWith("task.") || event.type.startsWith("run.")) taskPages.clear(); });
  const scopedPageIds = (scope: AgentConnectionScope,connectionId?:string): Set<string> => {
    const key = JSON.stringify(scope);
    let cached = taskPages.get(key);
    if (!cached || Date.now() - cached.at > 1_000) {
      cached = { at: Date.now(), pages: new Set(scopedTasks(scope).flatMap(task => {
        const resources = task.resources.filter(resource => resource.kind === "page").map(resource => resource.locator);
        const runs = tasks.details(task.taskId).runs.filter(item => item.currentRevision).flatMap(item => item.run.pageIds);
        return [...resources, ...runs];
      })) };
      taskPages.set(key, cached);
    }
    const preview = connectionId ? previewPageGrants.get(connectionId) : undefined;
    return preview?.size ? new Set([...cached.pages, ...preview]) : cached.pages;
  };
  const requireScopedPage = (scope: AgentConnectionScope, pageId: string,connectionId?:string) => {
    if (!scopedPageIds(scope,connectionId).has(pageId)) throw new AuxError("permission_denied", "Attach this page to the authorized task before using it");
  };
  return async function invoke(method: string, rawParams: unknown, client: { external: boolean; connectionId?: string; scope?: AgentConnectionScope } = { external: true }): Promise<unknown> {
    const schema = MethodSchemas[method as MethodName];
    if (!schema) throw new AuxError("not_found", `unknown method ${method}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = schema.parse(rawParams ?? {});

    const scope = client.external ? client.scope : undefined;
    if (client.external && method.startsWith("conversations.images.")) throw new AuxError("permission_denied", "Image context is managed in Aux.");
    if (client.external && method.startsWith("spaces.")) {
      throw new AuxError("permission_denied", "Browser spaces are managed in Aux.");
    }
    if (scope) {
      if (method === "workspaces.create" || method === "pages.open" || method === "runs.start") {
        throw new AuxError("permission_denied", "This scoped connection cannot expand its own authority");
      }
      if (method === "tasks.create") {
        if (scope.kind === "workspace") {
          if (params.workspaceId !== scope.workspaceId) throw new AuxError("permission_denied", "This connection cannot create tasks outside its workspace");
          if (params.parentTaskId) requireScopedTask(scope, params.parentTaskId);
        } else {
          if (typeof params.parentTaskId !== "string") throw new AuxError("permission_denied", "A task-scoped connection can only create a child task");
          const parent = requireScopedTask(scope, params.parentTaskId);
          if (params.workspaceId !== parent.workspaceId) throw new AuxError("permission_denied", "A child task must remain in its parent workspace");
        }
        if(params.resources?.length)throw new AuxError('permission_denied','Attach browser pages and local projects in Aux before using them through this connection');
      } else if (method.startsWith("tasks.") && typeof params.taskId === "string") {
        requireScopedTask(scope, params.taskId);
        if(method==='tasks.update'&&params.resources!==undefined)throw new AuxError('permission_denied','Scoped connections cannot change task resource authority; attach or remove resources in Aux');
      } else if(method.startsWith('development.')&&typeof params.taskId==='string'){
        requireScopedTask(scope,params.taskId);
      } else if(method.startsWith('cloud.')&&typeof params.taskId==='string'){
        requireScopedTask(scope,params.taskId);
      } else if (method.startsWith("pages.") && method !== "pages.list") {
        const pageId = typeof params.pageId === "string" ? params.pageId : params.program?.pageId;
        if (typeof pageId !== "string") throw new AuxError("permission_denied", "A scoped page is required");
        requireScopedPage(scope, pageId,client.connectionId);
      } else if (method.startsWith("runs.") && method !== "runs.list") {
        const run = typeof params.runId === "string" ? s.repo.getRun(params.runId) : undefined;
        if (!run?.config?.taskId) throw new AuxError("permission_denied", "This connection can only access runs belonging to its task scope");
        requireScopedTask(scope, run.config.taskId);
      } else if (!["workspaces.list", "tasks.list", "pages.list", "workspace.get", "runs.list", "runtime.describe"].includes(method)) {
        throw new AuxError("permission_denied", "This method is outside the connection's task scope");
      }
      if (method === "tasks.start" && Array.isArray(params.pageIds)) for (const pageId of params.pageIds) requireScopedPage(scope, pageId,client.connectionId);
    }

    switch (method as MethodName) {
      case "agentConnections.list":
        if (client.external) throw new AuxError("permission_denied", "Connections can only be managed in Aux Settings");
        if (!s.agentConnections) throw new AuxError("backend_unavailable", "Agent connection management is unavailable");
        return s.agentConnections.list();
      case "agentConnections.create":
        if (client.external) throw new AuxError("permission_denied", "Connections can only be created in Aux Settings");
        if (!s.agentConnections) throw new AuxError("backend_unavailable", "Agent connection management is unavailable");
        return s.agentConnections.create(params);
      case "agentConnections.revoke":
        if (client.external) throw new AuxError("permission_denied", "Connections can only be revoked in Aux Settings");
        if (!s.agentConnections) throw new AuxError("backend_unavailable", "Agent connection management is unavailable");
        return s.agentConnections.revoke(params.connectionId);
      case "plugins.inspect":
        if (client.external) throw new AuxError("permission_denied", "Plugins are managed in Aux.");
        return plugins.inspect(params.path);
      case "plugins.install":
        if (client.external) throw new AuxError("permission_denied", "Plugins are managed in Aux.");
        return plugins.install(params.path, params.workspaceId);
      case "plugins.list":
        if (client.external) throw new AuxError("permission_denied", "Plugins are managed in Aux.");
        return plugins.list(params);
      case "plugins.uninstall":
        if (client.external) throw new AuxError("permission_denied", "Plugins are managed in Aux.");
        return plugins.uninstall(params.pluginId);
      case "tasks.receipt": return taskEvidence.receipt(params.taskId, params.revision);
      case "tasks.verifyCriterion": return taskEvidence.verifyCriterion(params);
      case "tasks.replaceAgent": {
        const details = tasks.details(params.taskId);
        for (const { run } of details.runs) {
          if (["queued", "planning", "running", "paused", "needs_input"].includes(run.status)) s.runs.cancel(run.runId);
        }
        const pageIds = params.pageIds ?? (params.pageId ? [params.pageId] : []);
        if (scope && Array.isArray(pageIds)) for (const pageId of pageIds) requireScopedPage(scope, pageId, client.connectionId);
        return s.runs.start({ ...tasks.prepareRun(params.taskId, params.expectedRevision, params.context), pageIds, modelId: params.modelId });
      }
      case "tasks.recordEvidence": return taskEvidence.recordNote(params, client.external ? "external_client" : "desktop_user");
      case "tasks.prepareLocalCommand":
        if(client.external)throw new AuxError('permission_denied','Local command preparation requires the Aux desktop interface');
        return tasks.prepareLocalCommand(params.taskId,params.expectedRevision,params.projectId);
      case "tasks.importCommandEvidence":
        if (client.external) throw new AuxError("permission_denied", "Command evidence requires the Aux desktop interface");
        return taskEvidence.importCommand(params);
      case "tasks.importDocumentEvidence":
        if (client.external) throw new AuxError("permission_denied", "Document import requires the Aux desktop interface");
        return taskEvidence.importDocument(params);
      case "tasks.captureEvidence": return taskEvidence.capture(params);
      case "tasks.reviewCriterion":
      case "tasks.reconcileAction":
      case "tasks.reconcileOperation": {
        if (client.external) throw new AuxError("permission_denied", "Human review and reconciliation require the Aux desktop interface");
        return method === "tasks.reviewCriterion" ? taskEvidence.review(params) : method==='tasks.reconcileAction'?taskEvidence.reconcile(params):taskEvidence.reconcileOperation(params);
      }
      case "workspaces.create": return tasks.createWorkspace(params.name);
      case "spaces.list": return spaces.list();
      case "spaces.import": return spaces.import(params.spaces);
      case "spaces.create": return spaces.create(params.name, params.color);
      case "spaces.update": {
        const { id, ...patch } = params;
        return spaces.update(id, patch);
      }
      case "workspaces.list": return scope ? tasks.workspaces().filter(workspace => workspace.workspaceId === scope.workspaceId) : tasks.workspaces();
      case "workspaces.memory.search":
        if(client.external)throw new AuxError("permission_denied","Search Space memory in Aux.");
        return tasks.searchWorkspaceMemory(params.query);
      case "workspaces.browsingMemory.get":
      case "workspaces.browsingMemory.set":
      case "workspaces.browsingMemory.record":
      case "workspaces.browsingMemory.forget": {
        if (client.external) throw new AuxError("permission_denied", "Browsing memory is managed in Aux.");
        if (method === "workspaces.browsingMemory.get") return browsingMemory.get(params.workspaceId);
        if (method === "workspaces.browsingMemory.set") { const result = browsingMemory.setPolicy(params.workspaceId, params.policy); s.events.emit("workspace.browsingMemory.updated", { workspaceId: params.workspaceId }); return result; }
        if (method === "workspaces.browsingMemory.record") return browsingMemory.record(params.workspaceId, s.pages.get(params.pageId), params.expectedDocumentEpoch);
        const result = browsingMemory.forget(params.workspaceId, params.memoryId); s.events.emit("workspace.browsingMemory.updated", { workspaceId: params.workspaceId }); return result;
      }
      case "workspaces.memory.get":
        if (client.external) throw new AuxError("permission_denied", "Workspace memory is managed in Aux.");
        return tasks.workspaceMemory(params.workspaceId);
      case "workspaces.memory.set":
        if (client.external) throw new AuxError("permission_denied", "Workspace memory is managed in Aux.");
        return tasks.setWorkspaceMemory(params.workspaceId, params.expectedRevision, params.content,params.enabled,params.items,params.excludedOrigins);
      case "tasks.create":
        if (client.external && Array.isArray(params.resources) && params.resources.some((resource: { access?: string }) => resource.access === "write")) {
          throw new AuxError("permission_denied", "Write access on task resources can only be set in Aux.");
        }
        return tasks.create(params);
      case "tasks.promote": {
        if (client.external) throw new AuxError("permission_denied", "Save a conversation as a task in Aux.");
        return tasks.promote(params);
      }
      case "tasks.get":{const details=tasks.details(params.taskId);return{...details,children:details.children.map(child=>({...child,receiptStatus:taskEvidence.receipt(child.task.taskId).status}))};}
      case "tasks.list": return scope ? scopedTasks(scope).filter(task => (params.includeArchived || task.state === "open") && taskMatchesQuery(task, params.query)).slice(0, params.limit) : tasks.list(params);
      case "tasks.update":
        if (client.external && Array.isArray(params.resources) && params.resources.some((resource: { access?: string }) => resource.access === "write")) {
          throw new AuxError("permission_denied", "Write access on task resources can only be set in Aux.");
        }
        return tasks.update(params);
      case "tasks.archive": return tasks.archive(params.taskId, params.expectedRevision, params.archived);
      case "tasks.start": {
        const { taskId, expectedRevision, ...options } = params;
        return s.runs.start({ ...options, ...tasks.prepareRun(taskId, expectedRevision, options.context) });
      }
      case 'development.projects':{
        const task=tasks.prepareProjectList(params.taskId,params.expectedRevision);
        const ids=task.resources.filter(resource=>resource.kind==='repository'&&resource.projectId).map(resource=>resource.projectId!);
        return ids.length?developmentNative().developmentProjects(ids):[];
      }
      case 'development.inspect':tasks.prepareProjectAccess(params.taskId,params.expectedRevision,params.projectId);return developmentNative().inspectProject(params.projectId);
      case 'development.githubStatus':{
        tasks.prepareProjectAccess(params.taskId,params.expectedRevision,params.projectId);const status=await s.settings.githubRepository(await developmentNative().githubProject(params.projectId));
        tasks.prepareProjectAccess(params.taskId,params.expectedRevision,params.projectId);return developmentNative().recordGithubStatus(params.projectId,status);
      }
      case 'development.operationsStatus':{
        tasks.prepareProjectAccess(params.taskId,params.expectedRevision,params.projectId);const status=await s.settings.operationsStatus();
        tasks.prepareProjectAccess(params.taskId,params.expectedRevision,params.projectId);return status;
      }
      case 'development.incidentReport':
      case 'development.prepareIncidentFix': {
        const task=tasks.prepareProjectAccess(params.taskId,params.expectedRevision,params.projectId);if(scope)requireScopedPage(scope,params.pageId,client.connectionId);
        const page=s.pages.get(params.pageId);const project=await developmentNative().inspectProject(params.projectId);
        const taskPage=task.resources.some(resource=>resource.kind==='page'&&resource.locator===params.pageId)||s.runs.coordinator.list(500).some(run=>run.config?.taskId===task.taskId&&run.config.taskRevision===task.revision&&run.pageIds.includes(params.pageId));
        if(!taskPage&&project.project.preview?.url!==page.url)throw new AuxError('permission_denied','Attach this page to the task or open the project preview before preparing incident evidence');
        const [consoleResult,networkResult]=await Promise.all([s.pages.console(params.pageId,{limit:100}),s.pages.network(params.pageId,{limit:100})]);
        const network=(Array.isArray(networkResult)?networkResult:[]).flatMap(value=>{if(!value||typeof value!=='object')return[];const item=value as Record<string,unknown>;return typeof item.method==='string'&&typeof item.url==='string'?[{method:item.method,url:item.url,...(typeof item.status==='number'?{status:item.status}:{}),...(typeof item.durationMs==='number'?{durationMs:item.durationMs}:{}),...(typeof item.startedAt==='number'?{startedAt:item.startedAt}:{})}]:[];});
        const operations=await s.settings.operationsStatus().then(status=>{const lines=[`Checked: ${new Date(status.checkedAt).toISOString()}`];if(status.vercel){const latest=status.vercel.deployments[0];lines.push(`Vercel: ${status.vercel.project.name}${latest?` · ${latest.state}${latest.target?` · ${latest.target}`:''} · ${latest.url}`:' · no recent deployment found'}`);}if(status.sentry){lines.push(`Sentry: ${status.sentry.organization}/${status.sentry.project.slug} · ${status.sentry.issues.length} recent unresolved issues`);for(const issue of status.sentry.issues.slice(0,10))lines.push(`- ${issue.shortId} · ${issue.level} · ${issue.title} · ${issue.count} events · last seen ${issue.lastSeen||'unknown'}`);}for(const message of status.unavailable)lines.push(`Unavailable: ${message}`);return lines.join('\n');}).catch(error=>`Operations status unavailable: ${error instanceof Error?error.message:String(error)}`);
        tasks.prepareProjectAccess(params.taskId,params.expectedRevision,params.projectId);return developmentNative().writeIncidentReport({projectId:params.projectId,task:{taskId:task.taskId,taskRevision:task.revision,title:task.title,workspaceId:task.workspaceId},page:{pageId:page.pageId,url:page.url,title:page.title},console:consoleResult.lines,network,operations});
      }
      case 'development.files':tasks.prepareProjectAccess(params.taskId,params.expectedRevision,params.projectId);return developmentNative().listProjectFiles(params.projectId);
      case 'development.readFile':tasks.prepareProjectAccess(params.taskId,params.expectedRevision,params.projectId);return developmentNative().readProjectFile(params.projectId,params.name);
      case 'development.writeFile':{
        const task=tasks.prepareProjectAccess(params.taskId,params.expectedRevision,params.projectId,true);
        return developmentNative().writeProjectFile({projectId:params.projectId,name:params.name,expectedHash:params.expectedHash,content:params.content,task:{taskId:task.taskId,taskRevision:task.revision,title:task.title,workspaceId:task.workspaceId}});
      }
      case 'development.createFile':{
        const task=tasks.prepareProjectAccess(params.taskId,params.expectedRevision,params.projectId,true);
        return developmentNative().createProjectFile({projectId:params.projectId,name:params.name,content:params.content,task:{taskId:task.taskId,taskRevision:task.revision,title:task.title,workspaceId:task.workspaceId}});
      }
      case 'development.renameFile':{
        const task=tasks.prepareProjectAccess(params.taskId,params.expectedRevision,params.projectId,true);
        return developmentNative().renameProjectFile({projectId:params.projectId,name:params.name,nextName:params.nextName,expectedHash:params.expectedHash,task:{taskId:task.taskId,taskRevision:task.revision,title:task.title,workspaceId:task.workspaceId}});
      }
      case 'development.deleteFile':{
        const task=tasks.prepareProjectAccess(params.taskId,params.expectedRevision,params.projectId,true);
        return developmentNative().deleteProjectFile({projectId:params.projectId,name:params.name,expectedHash:params.expectedHash,task:{taskId:task.taskId,taskRevision:task.revision,title:task.title,workspaceId:task.workspaceId}});
      }
      case 'development.commands':tasks.prepareProjectAccess(params.taskId,params.expectedRevision,params.projectId);return developmentNative().projectCommands(params.projectId);
      case 'development.runCommand':{
        const task=tasks.prepareLocalCommand(params.taskId,params.expectedRevision,params.projectId);
        return developmentNative().runProjectCommand({projectId:params.projectId,command:params.command,mode:params.mode,task:{taskId:task.taskId,taskRevision:task.revision,title:task.title,workspaceId:task.workspaceId}});
      }
      case 'development.openPreview':{
        const task=tasks.prepareProjectAccess(params.taskId,params.expectedRevision,params.projectId);
        const check=await developmentNative().approveProjectPreview({projectId:params.projectId,url:params.url,task:{taskId:task.taskId,taskRevision:task.revision,title:task.title,workspaceId:task.workspaceId}});
        if(!check)return null;if(check.state!=='responding')return {check};
        const page=await s.pages.open({url:check.url,background:false,ownedByRuntime:false,activate:true});
        if(scope&&client.connectionId){const granted=previewPageGrants.get(client.connectionId)??new Set<string>();granted.add(page.pageId);previewPageGrants.set(client.connectionId,granted);}
        return {check,page};
      }
      case 'development.stopCommand':tasks.prepareProjectAccess(params.taskId,params.expectedRevision,params.projectId);return developmentNative().stopProjectCommand(params.projectId,params.commandId);
      case 'development.review':{const task=tasks.prepareProjectAccess(params.taskId,params.expectedRevision,params.projectId);return developmentNative().prepareProjectReview(params.projectId,{taskId:task.taskId,taskRevision:task.revision,title:task.title,objective:task.objective,workspaceId:task.workspaceId});}
      case 'development.commit':{
        const task=tasks.prepareProjectAccess(params.taskId,params.expectedRevision,params.projectId,true);
        return developmentNative().commitProject(params.projectId,{expectedPatchHash:params.expectedPatchHash,expectedTree:params.expectedTree,message:params.message,authorName:params.authorName,authorEmail:params.authorEmail},{taskId:task.taskId,taskRevision:task.revision,title:task.title,objective:task.objective,workspaceId:task.workspaceId});
      }
      case 'cloud.environments':{
        tasks.prepareProjectList(params.taskId,params.expectedRevision);return cloudEnvironments.list(params.taskId);
      }
      case 'cloud.create':{
        if(client.external)throw new AuxError('permission_denied','Cloud environment creation requires an explicit action in Aux.');const task=tasks.prepareProjectAccess(params.taskId,params.expectedRevision,params.projectId,true);return cloudEnvironments.create({taskId:task.taskId,taskRevision:task.revision,projectId:params.projectId,runtime:params.runtime,region:params.region,port:params.port,timeoutMinutes:params.timeoutMinutes,cleanupHours:params.cleanupHours});
      }
      case 'cloud.runCommand':{
        let record=cloudEnvironments.get(params.taskId,params.environmentId);const task=tasks.prepareCloudMutation(params.taskId,params.expectedRevision,record.projectId,record.environmentId);
        if(client.external){if(!s.native?.approveCloudCommand)throw new AuxError('backend_unavailable','Open Aux on the local Mac to review this cloud command.');const approved=await s.native.approveCloudCommand({task:{taskId:task.taskId,taskRevision:task.revision,title:task.title,workspaceId:task.workspaceId},environment:{remoteName:record.remoteName,runtime:record.runtime,region:record.region},executable:params.executable,args:params.args,mode:'command'});if(!approved)throw new AuxError('permission_denied','The cloud command was not approved in Aux.');tasks.prepareCloudMutation(params.taskId,params.expectedRevision,record.projectId,record.environmentId);const current=cloudEnvironments.get(params.taskId,params.environmentId);if(current.remoteName!==record.remoteName||current.projectId!==record.projectId)throw new AuxError('conflict','The cloud environment changed while the command was reviewed.');record=current;}
        return cloudEnvironments.run(record,params.executable,params.args);
      }
      case 'cloud.startService':{let record=cloudEnvironments.get(params.taskId,params.environmentId);const task=tasks.prepareCloudMutation(params.taskId,params.expectedRevision,record.projectId,record.environmentId);if(client.external){if(!s.native?.approveCloudCommand)throw new AuxError('backend_unavailable','Open Aux on the local Mac to review this cloud service.');const approved=await s.native.approveCloudCommand({task:{taskId:task.taskId,taskRevision:task.revision,title:task.title,workspaceId:task.workspaceId},environment:{remoteName:record.remoteName,runtime:record.runtime,region:record.region},executable:params.executable,args:params.args,mode:'service',timeoutMinutes:params.timeoutMinutes});if(!approved)throw new AuxError('permission_denied','The cloud service was not approved in Aux.');tasks.prepareCloudMutation(params.taskId,params.expectedRevision,record.projectId,record.environmentId);const current=cloudEnvironments.get(params.taskId,params.environmentId);if(current.remoteName!==record.remoteName||current.projectId!==record.projectId)throw new AuxError('conflict','The cloud environment changed while the service was reviewed.');record=current;}return cloudEnvironments.startService(record,params.executable,params.args,params.timeoutMinutes);}
      case 'cloud.commands':{const record=cloudEnvironments.get(params.taskId,params.environmentId);tasks.prepareProjectAccess(params.taskId,params.expectedRevision,record.projectId);return cloudEnvironments.commands(record);}
      case 'cloud.refreshCommand':{const record=cloudEnvironments.get(params.taskId,params.environmentId);tasks.prepareProjectAccess(params.taskId,params.expectedRevision,record.projectId);return cloudEnvironments.refreshCommand(record,cloudEnvironments.getCommand(params.taskId,params.environmentId,params.commandId));}
      case 'cloud.stopCommand':{const record=cloudEnvironments.get(params.taskId,params.environmentId);tasks.prepareCloudMutation(params.taskId,params.expectedRevision,record.projectId,record.environmentId);return cloudEnvironments.stopCommand(record,cloudEnvironments.getCommand(params.taskId,params.environmentId,params.commandId));}
      case 'cloud.refresh':{if(client.external)throw new AuxError('permission_denied','Cloud environment refresh requires an explicit action in Aux.');const record=cloudEnvironments.get(params.taskId,params.environmentId);tasks.prepareProjectAccess(params.taskId,params.expectedRevision,record.projectId);return cloudEnvironments.refresh(record);}
      case 'cloud.resume':{if(client.external)throw new AuxError('permission_denied','Cloud environment resume requires an explicit action in Aux.');const record=cloudEnvironments.get(params.taskId,params.environmentId);tasks.prepareProjectAccess(params.taskId,params.expectedRevision,record.projectId,true);return cloudEnvironments.resume(record);}
      case 'cloud.files':{const record=cloudEnvironments.get(params.taskId,params.environmentId);tasks.prepareProjectAccess(params.taskId,params.expectedRevision,record.projectId);return cloudEnvironments.files(record,params.path);}
      case 'cloud.readFile':{const record=cloudEnvironments.get(params.taskId,params.environmentId);tasks.prepareProjectAccess(params.taskId,params.expectedRevision,record.projectId);return cloudEnvironments.readFile(record,params.path);}
      case 'cloud.taskResult':{const record=cloudEnvironments.get(params.taskId,params.environmentId);const task=tasks.prepareProjectAccess(params.taskId,params.expectedRevision,record.projectId);const result=await cloudEnvironments.taskResult(record);return result?validateCloudResult(task,result):null;}
      case 'cloud.handoff':{if(client.external)throw new AuxError('permission_denied','Cloud task handoff requires an explicit action in Aux.');const record=cloudEnvironments.get(params.taskId,params.environmentId);const task=tasks.prepareProjectAccess(params.taskId,params.expectedRevision,record.projectId,true);return cloudEnvironments.handoff(record,{taskId:task.taskId,revision:task.revision,title:task.title,objective:task.objective,criteria:task.criteria});}
      case 'cloud.handoffAndStart':{if(client.external)throw new AuxError('permission_denied','Starting unattended cloud work requires an explicit action in Aux.');const record=cloudEnvironments.get(params.taskId,params.environmentId);const task=tasks.prepareProjectAccess(params.taskId,params.expectedRevision,record.projectId,true);return cloudEnvironments.handoffAndStart(record,{taskId:task.taskId,revision:task.revision,title:task.title,objective:task.objective,criteria:task.criteria},params.executable,params.args,params.timeoutMinutes);}
      case 'cloud.preserveTaskResult':{if(client.external)throw new AuxError('permission_denied','Preserving cloud results requires an explicit action in Aux.');const record=cloudEnvironments.get(params.taskId,params.environmentId);const task=tasks.prepareProjectAccess(params.taskId,params.expectedRevision,record.projectId);const result=await cloudEnvironments.taskResult(record);if(!result)throw new AuxError('conflict','The cloud worker has not written .aux/result.json yet.');return preserveCloudResult(record,task,result);}
      case 'cloud.importTaskResult':{if(client.external)throw new AuxError('permission_denied','Importing cloud claims into the task receipt requires an explicit action in Aux.');const record=cloudEnvironments.get(params.taskId,params.environmentId);const task=tasks.prepareProjectAccess(params.taskId,params.expectedRevision,record.projectId);const result=await cloudEnvironments.taskResult(record);if(!result)throw new AuxError('conflict','The cloud worker has not written .aux/result.json yet.');validateCloudResult(task,result);taskEvidence.prepareCloudResult(task.taskId,task.revision,result);const preserved=await preserveCloudResult(record,task,result);return taskEvidence.importCloudResult(task.taskId,task.revision,record.environmentId,result,preserved.result.artifacts);}
      case 'cloud.downloadResultArtifact':{if(client.external)throw new AuxError('permission_denied','Saving cloud result artifacts requires an explicit action in Aux.');const record=cloudEnvironments.get(params.taskId,params.environmentId);tasks.prepareProjectAccess(params.taskId,params.expectedRevision,record.projectId);const result=await cloudEnvironments.taskResult(record);if(!result||result.updatedAt!==params.expectedResultUpdatedAt)throw new AuxError('conflict','The cloud worker result changed. Review it again before downloading an artifact.');const artifact=result.artifacts.find(item=>item.path===params.artifactPath);if(!artifact)throw new AuxError('permission_denied','This file is not declared by the validated cloud worker result.');return cloudEnvironments.downloadResultArtifact(record,artifact.path,result.updatedAt);}
      case 'cloud.openTerminal':{if(client.external)throw new AuxError('permission_denied','Interactive cloud terminal access requires an explicit action in Aux.');const record=cloudEnvironments.get(params.taskId,params.environmentId);tasks.prepareCloudMutation(params.taskId,params.expectedRevision,record.projectId,record.environmentId);return cloudEnvironments.openTerminal(record);}
      case 'cloud.openPreview':{if(client.external)throw new AuxError('permission_denied','Protected cloud preview access requires an explicit action in Aux.');const record=cloudEnvironments.get(params.taskId,params.environmentId);tasks.prepareCloudMutation(params.taskId,params.expectedRevision,record.projectId,record.environmentId);return cloudEnvironments.openPreview(record);}
      case 'cloud.exportWorkspace':{if(client.external)throw new AuxError('permission_denied','Cloud workspace export requires an explicit action in Aux.');const record=cloudEnvironments.get(params.taskId,params.environmentId);tasks.prepareCloudMutation(params.taskId,params.expectedRevision,record.projectId,record.environmentId);return cloudEnvironments.exportWorkspace(record);}
      case 'cloud.inventory':{if(client.external)throw new AuxError('permission_denied','Cloud account inventory requires an explicit action in Aux.');tasks.prepareProjectList(params.taskId,params.expectedRevision);return cloudEnvironments.inventory();}
      case 'cloud.cleanupOrphan':{if(client.external)throw new AuxError('permission_denied','Cloud orphan cleanup requires an explicit action in Aux.');tasks.prepareProjectList(params.taskId,params.expectedRevision);return cloudEnvironments.cleanupOrphan(params.remoteName,params.expectedUpdatedAt);}
      case 'cloud.forgetMissing':{if(client.external)throw new AuxError('permission_denied','Cloud record reconciliation requires an explicit action in Aux.');const record=cloudEnvironments.get(params.taskId,params.environmentId);tasks.prepareCloudLifecycle(params.taskId,params.expectedRevision,record.projectId,record.environmentId);return cloudEnvironments.forgetMissing(record,params.expectedUpdatedAt);}
      case 'cloud.syncProject':{
        if(client.external)throw new AuxError('permission_denied','Cloud source transfer requires an explicit action in Aux.');const record=cloudEnvironments.get(params.taskId,params.environmentId);const task=tasks.prepareProjectAccess(params.taskId,params.expectedRevision,record.projectId,true);const native=developmentNative();if(!native.projectSnapshotTree)throw new AuxError('backend_unavailable','Exact project snapshot transfer requires the Aux desktop app.');const sourceTree=await native.projectSnapshotTree(record.projectId);const names=await native.listProjectFiles(record.projectId);const files:{name:string;content:string}[]=[];const skippedFiles:string[]=[];let bytes=0;
        for(const name of names){if(files.length>=500){skippedFiles.push(...names.slice(names.indexOf(name)));break;}try{const file=await developmentNative().readProjectFile(record.projectId,name);const size=Buffer.byteLength(file.content);if(bytes+size>8*1024*1024){skippedFiles.push(name);continue;}files.push({name:file.name,content:file.content});bytes+=size;}catch{skippedFiles.push(name);}}
        const completedTree=await native.projectSnapshotTree(record.projectId);if(completedTree!==sourceTree)throw new AuxError('conflict','The local checkout changed while Aux prepared the upload. Review the edits and upload again.');tasks.prepareProjectAccess(params.taskId,params.expectedRevision,record.projectId,true);return cloudEnvironments.sync(record,files,skippedFiles,sourceTree,{taskId:task.taskId,revision:task.revision,title:task.title,objective:task.objective,criteria:task.criteria});
      }
      case 'cloud.stop':{
        if(client.external)throw new AuxError('permission_denied','Cloud environment changes require an explicit action in Aux.');const record=cloudEnvironments.get(params.taskId,params.environmentId);tasks.prepareCloudLifecycle(params.taskId,params.expectedRevision,record.projectId,record.environmentId);return cloudEnvironments.stop(record);
      }
      case 'cloud.delete':{
        if(client.external)throw new AuxError('permission_denied','Cloud environment deletion requires an explicit action in Aux.');const record=cloudEnvironments.get(params.taskId,params.environmentId);tasks.prepareCloudLifecycle(params.taskId,params.expectedRevision,record.projectId,record.environmentId);return cloudEnvironments.delete(record);
      }
      case 'cloud.reconnectStatus':{
        tasks.prepareProjectList(params.taskId,params.expectedRevision);return cloudEnvironments.reconnectStatus(params.taskId);
      }
      case 'installation.createBackup':if(client.external)throw new AuxError('permission_denied','Runtime backups require an explicit action in Aux.');return createRuntimeBackup(s.repo,s.settings.all().dataDir);
      case 'installation.listBackups':if(client.external&&client.scope)throw new AuxError('permission_denied','Runtime backups require an explicit action in Aux.');return listRuntimeBackups(s.settings.all().dataDir);
      case 'installation.backupRetention':if(client.external&&client.scope)throw new AuxError('permission_denied','Runtime backups require an explicit action in Aux.');return backupRetention(s.repo);
      case 'installation.setBackupRetention':if(client.external)throw new AuxError('permission_denied','Backup retention is managed in Aux.');return setBackupRetention(s.repo,params.keep);
      case 'installation.stageRestore':if(client.external)throw new AuxError('permission_denied','Runtime restore requires an explicit action in Aux.');return stageRuntimeRestore(s.settings.all().dataDir,params.path);
      case 'installation.cancelRestore':if(client.external)throw new AuxError('permission_denied','Runtime restore requires an explicit action in Aux.');return cancelRuntimeRestore(s.settings.all().dataDir);
      case "vault.status":
      case "vault.list":
      case "vault.save":
      case "vault.lock":
      case "vault.unlock":
      case "vault.grant":
      case "vault.renewGrant":
      case "vault.expiredGrants":
      case "vault.revoke":
      case "vault.history":
      case "vault.grants":
      case "vault.generate":
      case "vault.itemsForOrigin":
      case "vault.fill":
      case "vault.export":
      case "vault.import":
      case "vault.update":
      case "vault.secretMatches": {
        const vaultRead = method === "vault.status" || method === "vault.list" || method === "vault.history" || method === "vault.grants" || method === "vault.expiredGrants" || method === "vault.generate" || method === "vault.itemsForOrigin";
        if (client.external && (client.scope || !vaultRead)) throw new AuxError("permission_denied", "The agent vault can only be managed in Aux.");
        if (method === "vault.status") return vault.status();
        if (method === "vault.list") return vault.list(params.includeRevoked);
        if (method === "vault.save") return vault.save(params);
        if (method === "vault.lock") return vault.lock(params.passphrase);
        if (method === "vault.unlock") return vault.unlock(params.passphrase, params.ttlMs);
        if (method === "vault.grant") return vault.grant(params);
        if (method === "vault.renewGrant") return vault.renewGrant(params);
        if (method === "vault.expiredGrants") return vault.expiredGrants();
        if (method === "vault.revoke") return vault.revoke(params);
        if (method === "vault.history") return vault.history(params.itemId, params.limit);
        if (method === "vault.generate") return { password: vault.generate(params.length) };
        if (method === "vault.itemsForOrigin") return vault.itemsForOrigin(params.origin);
        if (method === "vault.fill") return vault.revealForHumanFill(params.itemId, params);
        if (method === "vault.export") return vault.exportItems();
        if (method === "vault.import") return vault.importItems(params);
        if (method === "vault.update") return vault.updateSecret(params.itemId, params.secret);
        if (method === "vault.secretMatches") return { matches: await vault.secretMatches(params.itemId, params.secret) };
        const origin = params.origin ? originOfAddress(params.origin) : undefined;
        if (params.origin && !origin) throw new AuxError("invalid_params", "Grants must name an http(s) origin without credentials.");
        return vault.grants({ taskId: params.taskId, origin });
      }
      case "routines.list":
      case "routines.get":
      case "routines.create":
      case "routines.fromResult":
      case "routines.update":
      case "routines.pause":
      case "routines.archive":
      case "routines.run":
      case "routines.runs":
      case "routines.reconcile":
      case "routines.due":
      case "routines.alerts":
      case "routines.export":
      case "routines.import":
      case "routines.compare": {
        const routineRead = method === "routines.list" || method === "routines.get" || method === "routines.runs" || method === "routines.alerts" || method === "routines.compare" || method === "routines.export";
        if (client.external && (client.scope || !routineRead)) throw new AuxError("permission_denied", "Routines are managed in Aux.");
        if (method === "routines.list") return routines.list(params);
        if (method === "routines.get") return routines.get(params.routineId);
        if (method === "routines.create") return routines.create(params);
        if (method === "routines.fromResult") return routines.fromResult(params);
        if (method === "routines.update") return routines.update(params);
        if (method === "routines.pause") return routines.pause(params.routineId, params.expectedRevision, params.paused);
        if (method === "routines.archive") return routines.archive(params.routineId, params.expectedRevision, params.archived);
        if (method === "routines.run") return routines.run(params);
        if (method === "routines.runs") return routines.runs(params.routineId, params.limit);
        if (method === "routines.reconcile") return routines.reconcile(params.routineRunId, params.outcome, params.note);
        if (method === "routines.alerts") return routines.alerts(params.limit);
        if (method === "routines.compare") return routines.compare(params.leftRunId, params.rightRunId);
        if (method === "routines.export") return routines.exportRoutines(params.routineIds);
        if (method === "routines.import") {
          let shares = params.routines;
          if (!shares) {
            let raw: unknown;
            try {
              raw = JSON.parse(await readFile(params.path!, "utf8"));
            } catch (error) {
              throw new AuxError("invalid_params", `Couldn't read the routine file. ${error instanceof Error ? error.message : String(error)}`);
            }
            const envelope = RoutineShareEnvelopeSchema.safeParse(raw);
            shares = envelope.success
              ? envelope.data.routines
              : (Array.isArray(raw) ? raw.map((item) => RoutineShareSchema.parse(item)) : []);
            if (!shares.length) throw new AuxError("invalid_params", "That file doesn't contain routines. Export routines from Aux first.");
          }
          return routines.importRoutines(shares, params.workspaceId);
        }
        return routines.due(params.now);
      }
      // pages
      case "pages.list": return scope ? s.pages.list(params as never).filter(page => scopedPageIds(scope,client.connectionId).has(page.pageId)) : s.pages.list(params as never);
      case "pages.open": return s.pages.open(params as never);
      case "pages.close": return s.pages.close(params.pageId);
      case "pages.moveToWindow": {
        if (client.external) throw new AuxError("permission_denied", "Move tabs through the Aux browser interface.");
        const space = spaces.list().find(space => space.id === params.spaceId && !space.archived);
        if (!space) throw new AuxError("conflict", "Restore the tab’s space before moving it.");
        if (params.folder && params.folder.spaceId !== params.spaceId) throw new AuxError("invalid_params", "The tab folder belongs to another space.");
        return s.pages.moveToWindow(params, space);
      }
      case "pages.reconcileWrite": {
        if (scope) throw new AuxError("permission_denied", "Only the Aux owner can reconcile an uncertain action");
        const ledger = new DurableWriteLedger(s.repo.db);
        const pending = ledger.unresolved(`direct:${params.pageId}`).filter(intent => !params.intentId || intent.id === params.intentId);
        if (!pending.length) throw new AuxError("conflict", "No unresolved direct action on this page");
        const note = JSON.stringify({ actor: client.external ? "owner_token" : "desktop_user", evidence: params.evidence, recordedAt: Date.now() });
        for (const intent of pending) ledger.reconcile(intent.id, params.outcome, note);
        return { reconciled: pending.map(intent => intent.id) };
      }
      case "pages.activate": return s.pages.activate(params.pageId);
      case "pages.navigate": return s.pages.navigate(params.pageId, params["url" as never]);
      case "pages.back": return s.pages.back(params.pageId);
      case "pages.forward": return s.pages.forward(params.pageId);
      case "pages.reload": return s.pages.reload(params.pageId);
      case "pages.stop": return s.pages.stop(params.pageId);
      case "pages.observe": {
        const { format, ...req } = params as { format?: "full" | "compact" } & Record<string, unknown>;
        return wireObservation(await s.pages.observe(params.pageId, req as never), format);
      }
      case "pages.execute": {
        // `call` nodes dispatch through PageService's operation-registry
        // hook ("host/name" explicitly, or bare name → page's host).
        // The owner bearer token (CLI, desktop) authors programs directly and may
        // run page script. A scoped agent connection is limited to its task and
        // never gets evaluate/eval: page access is not code-execution authority.
        const p = params as { program: { pageId: string }; returnObservation?: { format?: "full" | "compact" } & Record<string, unknown> };
        // act-and-observe (speed P0-2): the caller sees the resulting state in
        // the same round trip via a same-lane follow-up observe
        // (PageService.execute).
        const { format, ...req } = p.returnObservation ?? {};
        const { observation, ...result } = await s.pages.execute(p.program as never, { allowEval: !scope }, {
          returnObservation: p.returnObservation ? (req as never) : undefined,
        });
        if (!p.returnObservation) return result;
        const wire = observation ? wireObservation(observation, format as "full" | "compact" | undefined) : undefined;
        return { ...result, observation: wire && "observation" in wire ? wire.observation : wire };
      }
      case "pages.extract": {
        const p = params as { pageId: string; fields?: Array<string | { name: string; selector?: string; attribute?: string; all?: boolean }> };
        return s.pages.extract(p.pageId, p.fields);
      }
      case "pages.waitFor": {
        const p = params as { pageId: string; condition: Condition };
        return s.pages.waitFor(p.pageId, p.condition);
      }
      case "pages.console": {
        const p = params as { pageId: string; since?: number; limit?: number };
        return s.pages.console(p.pageId, p);
      }
      case "pages.dialog": {
        const p = params as { pageId: string; action?: "list" | "accept" | "dismiss"; promptText?: string };
        return s.pages.dialog(p.pageId, p.action ?? "list", p.promptText);
      }
      case "pages.network": {
        const p = params as { pageId: string; since?: number; urlIncludes?: string; limit?: number };
        if (s.pages.network) return s.pages.network(p.pageId, p);
        if (!s.responses) throw new AuxError("backend_unavailable", "response capture not wired");
        await s.responses.flush();
        return s.responses.list(p.pageId, p);
      }
      case "pages.capture": return s.pages.capture(params.pageId, params as never);
      case "pages.find": {
        const p = params as { pageId: string; text: string; forward: boolean; findNext: boolean };
        return s.pages.find(p.pageId, p.text, p.forward, p.findNext);
      }
      case "pages.stopFind": {
        const p = params as { pageId: string; action: "clear" | "keep" };
        return s.pages.stopFind(p.pageId, p.action);
      }
      case "pages.zoom": {
        const p = params as { pageId: string; level?: number; delta?: number; reset?: boolean; direction?: "in" | "out" };
        return s.pages.zoom(p.pageId, p.level, p.delta, p.reset, p.direction);
      }
      case "pages.takeover": return s.pages.takeover(params.pageId);
      case "pages.pickElement": {
        if (client.external) throw new AuxError("permission_denied", "Element picks are interactive and run in Aux.");
        return s.pages.pickElement(params.pageId, { timeoutMs: params.timeoutMs });
      }
      case "pages.resume": return s.pages.resume(params.pageId);
      case "pages.openLive": {
        const page = s.pages.get(params.pageId);
        const chrome = s.drivers().chrome;
        if (page.backend === "chrome" && chrome?.activateTarget) {
          await chrome.activateTarget(page.targetId);
          return { ok: true };
        }
        if (page.backend === "aux") {
          await s.pages.activate(page.pageId);
          return { ok: true };
        }
        throw new AuxError("capability_unsupported", `cannot focus a ${page.backend} page's native surface`);
      }

      // sets
      case "sets.create": return s.sets.create(params as never);
      case "sets.get": return s.sets.get(params.setId);
      case "sets.list": return s.sets.list();
      case "sets.map": return s.runs.mapSet(params as never);
      case "sets.results": {
        const p = params as { setId: string; status?: "ok" | "partial" | "error" };
        return s.sets.results(p.setId, p.status);
      }

      // runs
      case "runs.start": {
        if (client.external && params.defaultWorkspaceId) throw new AuxError("permission_denied", "Conversation Space defaults are set through the Aux browser.");
        return s.runs.start(params as never);
      }
      case "runs.retry": return s.runs.retry(params.runId, params.pageId);
      case "runs.get": {
        const run = s.runs.coordinator.get(params.runId);
        const calls = s.repo.listModelCalls(run.runId);
        return {
          run,
          steps: s.repo.listSteps(run.runId),
          modelCalls: calls.length,
          usage: summarizeModelUsage(calls),
        };
      }
      case "runs.list": {
        const p = MethodSchemas["runs.list"].parse(params);
        const listed = s.runs.coordinator.list(p.limit, p);
        if (!scope) return listed;
        const taskIds = new Set(scopedTasks(scope).map(task => task.taskId));
        return listed.filter(run => !!run.config?.taskId && taskIds.has(run.config.taskId));
      }
      case "runs.context.get": return s.runs.context(params.chatId);
      case "runs.context.set": return s.runs.setContext(params);
      case "conversations.list": return s.runs.conversations(params);
      case "conversations.prepared":
        if (client.external) throw new AuxError("permission_denied", "Unsent conversations are available in Aux.");
        return s.repo.preparedConversations();
      case "conversations.images.get": return s.runs.images.list(params.chatId);
      case "conversations.images.add": return s.runs.images.add(params);
      case "conversations.images.read": return s.runs.images.read(params.chatId,params.imageId);
      case "conversations.images.toggle": return s.runs.images.toggle(params.chatId,params.imageId,params.included);
      case "conversations.images.remove": return s.runs.images.remove(params.chatId,params.imageId);
      case "conversations.get": return s.runs.conversation(params.chatId);
      case "conversations.rename": return s.runs.renameConversation(params.chatId, params.title);
      case "conversations.archive": return s.runs.archiveConversation(params.chatId, params.archived);
      case "conversations.delete": return s.runs.deleteConversation(params.chatId);
      case "conversations.attachments.read":
        if (client.external) throw new AuxError("permission_denied", "Inspect document snapshots in Aux.");
        return s.runs.readAttachment(params);
      case "conversations.attachments.get": return s.runs.attachments(params.chatId);
      case "conversations.attachments.page":
        if (client.external) throw new AuxError("permission_denied", "Attach page snapshots in Aux.");
        return s.runs.attachPage(params);
      case "conversations.attachments.add": return s.runs.addAttachment(params);
      case "conversations.attachments.toggle": return s.runs.toggleAttachment(params);
      case "conversations.attachments.remove": return s.runs.removeAttachment(params);
      case "results.search":
        if (client.external) throw new AuxError("permission_denied", "Search saved results in Aux.");
        return new SavedResults(s.repo, s.artifacts).search(params.query, params.limit);
      case "results.read":
        if (client.external) throw new AuxError("permission_denied", "Preview saved results in Aux.");
        return new SavedResults(s.repo, s.artifacts).read(params.artifactId);
      case "conversations.artifacts.get": return s.runs.conversationArtifacts(params.chatId);
      case "conversations.artifacts.toggle": return s.runs.toggleConversationArtifact(params);
      case "conversations.sources.get": return s.runs.conversationSources(params.chatId);
      case "conversations.workspace.get": return s.runs.conversationWorkspace(params.chatId);
      case "conversations.workspace.set": return s.runs.setConversationWorkspace(params);
      case "runs.pause": return s.runs.pause(params.runId);
      case "runs.resume": return s.runs.resume(params.runId);
      case "runs.cancel": return s.runs.cancel(params.runId);
      case "runs.answer": {
        const p = params as { runId: string; answer: string };
        return s.runs.coordinator.answer(p.runId, p.answer);
      }
      case "runs.queue":
        if (client.external) throw new AuxError("permission_denied", "Queue conversation messages in Aux.");
        return s.runs.messages.queue(params);
      case "runs.steer":
        if (client.external) throw new AuxError("permission_denied", "Steer conversation runs in Aux.");
        return s.runs.messages.steer(params);
      case "runs.messages.list":
        if (client.external) throw new AuxError("permission_denied", "Conversation messages are available in Aux.");
        return s.runs.messages.list(params.chatId);
      case "runs.message.cancel":
        if (client.external) throw new AuxError("permission_denied", "Cancel queued messages in Aux.");
        return s.runs.messages.cancel(params.messageId);
      case "runs.events":
      case "events.since": {
        const p = params as { runId?: string; sinceSeq: number; limit: number };
        return s.events.since(p.sinceSeq, p.limit, p.runId);
      }

      // artifacts
      case "artifacts.list": {
        const artifacts=s.artifacts.list(params as never);
        if(!client.external)return artifacts;
        const images=s.runs.images.privateArtifactIds();return artifacts.filter(artifact=>!images.has(artifact.artifactId));
      }
      case "artifacts.read":
        if(client.external&&s.runs.images.privateArtifactIds().has(params.artifactId))throw new AuxError("permission_denied","Conversation image snapshots are inspected in Aux.");
        return s.artifacts.read(params.artifactId);

      // programs
      case "programs.list": return s.repo.listPrograms();
      case "programs.run": return s.runs.runProgram(params as never);
      case "programs.save": {
        const p = params as { name: string; description?: string; siteKey: string; steps?: unknown[]; nodes?: unknown[]; parameters: string[] };
        if (!p.steps?.length && !p.nodes?.length)
          throw new AuxError("invalid_params", "programs.save needs steps or nodes");
        const program = {
          programId: newProgramId(),
          name: p.name,
          description: p.description,
          version: 1,
          siteKey: p.siteKey,
          parameters: p.parameters,
          // stepsJson holds {steps,nodes} — legacy rows hold a bare steps array
          stepsJson: JSON.stringify(p.nodes?.length ? { steps: p.steps ?? [], nodes: p.nodes } : (p.steps ?? [])),
          useCount: 0,
          createdAt: Date.now(),
        };
        s.repo.saveProgram(program);
        return program;
      }
      case "programs.delete": {
        s.repo.deleteProgram(params.programId);
        return { ok: true };
      }

      // sessions / chrome
      case "sessions.list": return s.repo.listSessions();
      case "chrome.attach": return s.chromeAttach((params as { port: number }).port);
      case "chrome.detach": return s.chromeDetach();
      case "chrome.tabs": return s.chromeTabs();
      case "chrome.importCookies": return s.importCookies(params);
      case "import.preview": return browserImporter(s).preview();
      case "import.run": return browserImporter(s).start(MethodSchemas["import.run"].parse(params));
      case "import.status": return browserImporter(s).status(MethodSchemas["import.status"].parse(params).jobId);
      case "import.cancel": return browserImporter(s).cancel(MethodSchemas["import.cancel"].parse(params).jobId);
      case "chrome.importBookmarks": {
        const p = MethodSchemas["chrome.importBookmarks"].parse(params);
        const files = chromeBookmarkFiles(p.profile);
        if (!files.length) {
          throw new AuxError("not_found", p.profile
            ? `Chromium profile "${p.profile}" has no bookmarks store`
            : "no Chrome, Chromium, or Edge profile with bookmarks found on this machine");
        }
        const seen = new Set<string>();
        const bookmarks = files.flatMap((f) => readChromeBookmarksFile(f.path))
          .filter((b) => !seen.has(b.url) && !!seen.add(b.url))
          .slice(0, 10000);
        const result = s.repo.importBookmarks(bookmarks);
        s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
        return {
          ok: true,
          imported: result.added,
          skipped: result.skipped,
          profiles: files.map((f) => f.profile),
          detail: `read ${files.length} Chromium profile${files.length === 1 ? "" : "s"} (${files.map((f) => f.profile).join(", ")})`,
        };
      }
      case "chrome.openLive": {
        const page = s.pages.get(params.pageId);
        const chrome = s.drivers().chrome;
        if (page.backend !== "chrome") throw new AuxError("invalid_params", "not a chrome page");
        await chrome?.activateTarget?.(page.targetId);
        return { ok: true };
      }

      // models / settings
      case "translate.page": return translate.page(params.texts, params.target, params.context);
      case "translate.text": return translate.text(params.text, params.target, params.context);
      case "models.list": return s.settings.listModels();
      case "models.probe": return s.settings.probe((params as { modelId?: string }).modelId);
      case "github.probe": return s.settings.probeGithub();
      case "vercel.probe": return s.settings.probeVercel();
      case "vercel.projects": return s.settings.vercelProjects(params.teamId);
      case "sentry.probe": return s.settings.probeSentry();
      case "sentry.projects": return s.settings.sentryProjects(params.organization);
      case "settings.get": return s.settings.all();
      case "settings.set": {
        const r = await s.settings.set(params as never);
        // worker limits apply live — no restart needed
        s.runs.refreshPool();
        s.events.emit(EventTypes.SettingsChanged, { settings: s.settings.all() });
        return r;
      }

      case "browser.recovery.list":
      case "browser.recovery.retry": {
        if(client.external)throw new AuxError("permission_denied","Restore browsing sessions in Aux.");
        return method==="browser.recovery.list"?s.pages.recoveryTabs():s.pages.retryRestore(params.pageId);
      }
      // history / bookmarks
      case "history.list": {
        return s.repo.listHistory(params.query, params.limit, params);
      }
      case "history.clear": {
        if (client.external) throw new AuxError("permission_denied", "Manage browsing history in Aux Library.");
        const removed = s.repo.clearHistory(params);
        s.events.emit("history.changed", {});
        return { ok: true, removed };
      }
      case "history.remove": {
        if (client.external) throw new AuxError("permission_denied", "Manage browsing history in Aux Library.");
        const removed = s.repo.removeHistory(params.url, params.visitedAt);
        s.events.emit("history.changed", {});
        return { removed };
      }
      case "bookmarks.list": return s.repo.listBookmarks();
      case "bookmarks.folders.list": return s.repo.bookmarkFolders();
      case "bookmarks.folders.create":
      case "bookmarks.folders.rename":
      case "bookmarks.folders.remove": {
        if (client.external) throw new AuxError("permission_denied", "Organize bookmarks in Aux Library.");
        const folders = method === "bookmarks.folders.create" ? s.repo.createBookmarkFolder(params.path)
          : method === "bookmarks.folders.rename" ? s.repo.renameBookmarkFolder(params.path, params.name)
          : s.repo.removeBookmarkFolder(params.path);
        s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
        return folders;
      }
      case "bookmarks.add": {
        const p = MethodSchemas["bookmarks.add"].parse(params);
        s.repo.addBookmark(p.url, p.title, p.folderPath, p.readingList);
        s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
        return { ok: true };
      }
      case "bookmarks.readingList": {
        const p = MethodSchemas["bookmarks.readingList"].parse(params);
        s.repo.setReadingList(p.url, p.readingList, p.title);
        s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
        return { ok: true };
      }
      case "bookmarks.markRead": {
        const p = MethodSchemas["bookmarks.markRead"].parse(params);
        s.repo.markBookmarkRead(p.url, p.read);
        s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
        return { ok: true };
      }
      case "bookmarks.offline.set": {
        const p = MethodSchemas["bookmarks.offline.set"].parse(params);
        if (!s.repo.listBookmarks().some(item => item.url === p.url && item.readingList))
          throw new AuxError("permission_denied", "Save the page to the reading list before keeping an offline copy.");
        s.repo.saveBookmarkArticle(p.url, p.article);
        s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
        return { ok: true };
      }
      case "bookmarks.offline.get": {
        const p = MethodSchemas["bookmarks.offline.get"].parse(params);
        return s.repo.getBookmarkArticle(p.url) ?? { article: null, savedAt: null };
      }
      case "bookmarks.update": {
        if (client.external) throw new AuxError("permission_denied", "Edit bookmarks in Aux Library.");
        s.repo.updateBookmark(MethodSchemas["bookmarks.update"].parse(params));
        s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
        return { ok: true };
      }
      case "bookmarks.move": {
        if (client.external) throw new AuxError("permission_denied", "Organize bookmarks in Aux Library.");
        const result = s.repo.moveBookmarks(MethodSchemas["bookmarks.move"].parse(params));
        s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
        return result;
      }
      case "bookmarks.saveFolder": {
        if(client.external)throw new AuxError("permission_denied","Organize bookmarks in Aux Library.");
        const p=MethodSchemas["bookmarks.saveFolder"].parse(params);
        const result=s.repo.saveBookmarkFolder(p.name,p.bookmarks);
        s.events.emit("bookmarks.changed",{bookmarks:s.repo.listBookmarks()});
        return result;
      }
      case "bookmarks.import": {
        const p = MethodSchemas["bookmarks.import"].parse(params);
        const result = s.repo.importBookmarks(p.bookmarks, p.folders);
        s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
        return result;
      }
      case "bookmarks.remove": {
        s.repo.removeBookmark((params as { url: string }).url);
        s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
        return { ok: true };
      }
      case "downloads.list": return s.repo.listDownloads();
      case "downloads.remove": {
        if(client.external)throw new AuxError("permission_denied","Manage downloads in Aux.");
        const removed=s.repo.removeFinishedDownloads(params.ids);
        if(removed.length)s.events.emit(EventTypes.DownloadsRemoved,{ids:removed});
        return {removed};
      }

      case "workspace.get": {
        const pages = scope ? s.pages.list().filter(page => scopedPageIds(scope,client.connectionId).has(page.pageId)) : s.pages.list();
        const taskIds = scope ? new Set(scopedTasks(scope).map(task => task.taskId)) : null;
        const runs = s.runs.coordinator.list(50).filter(run => !taskIds || (!!run.config?.taskId && taskIds.has(run.config.taskId)));
        return {
          restoringTabs: s.pages.isRestoringTabs,
          pendingRestoreTabs:scope?[]:s.pages.recoveryTabs().map(tab=>({pageId:tab.pageId,windowId:tab.windowId})),
          tabPlacements: scope ? {} : Object.fromEntries(pages.flatMap(page => {
            const placement = s.repo.getSetting(`tab-placement:${page.pageId}`);
            return placement ? [[page.pageId, placement]] : [];
          })),
          pages,
          sets: scope ? [] : s.sets.list(),
          members: scope ? [] : s.sets.list().flatMap((set) => s.repo.listMembers(set.setId)),
          runs,
          sessions: scope ? [] : s.repo.listSessions(),
          activePageId: pages.some(page => page.pageId === s.pages.activePageId) ? s.pages.activePageId : null,
          lastSeq: s.repo.lastSeq(),
        };
      }

      case "bench.run": {
        const p = params as { task?: string; repeats?: number };
        return s.benchRun(p.task, p.repeats);
      }

      // ---- runtime-vnext: response capture / state / datasets / operations / traces ----
      case "responses.list": {
        if (!s.responses) throw new AuxError("backend_unavailable", "response capture not wired");
        await s.responses.flush(); // capture persists asynchronously — readers see everything landed so far
        return s.responses.list(params.pageId, params as never);
      }
      case "responses.body": {
        if (!s.responses) throw new AuxError("backend_unavailable", "response capture not wired");
        await s.responses.flush();
        const b = s.responses.body(params.requestId);
        if (!b) throw new AuxError("not_found", `no captured body for ${params.requestId}`);
        return { mediaType: b.mediaType, dataBase64: b.buffer.toString("base64") };
      }
      case "state.query": {
        if (!s.state) throw new AuxError("backend_unavailable", "state index not wired");
        if (params.entity === "responses") await s.responses?.flush();
        return s.state.query(params);
      }
      case "state.datasets": {
        if (!s.state) throw new AuxError("backend_unavailable", "state index not wired");
        return s.state.listDatasets(params as never);
      }
      case "datasets.rows": {
        if (!s.state) throw new AuxError("backend_unavailable", "state index not wired");
        const p = params as { datasetId: string; limit?: number };
        return s.state.rows(p.datasetId).slice(0, p.limit ?? 5000);
      }
      case "datasets.transform": {
        if (!s.state) throw new AuxError("backend_unavailable", "state index not wired");
        const p = params as { datasetId: string; op: string; args?: Record<string, unknown> };
        return s.state.transform(p.datasetId, p.op, p.args);
      }
      case "datasets.save": {
        if (!s.state) throw new AuxError("backend_unavailable", "state index not wired");
        return s.state.saveDataset(params as never);
      }
      case "operations.list": {
        if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
        return s.operations.list((params as { siteKey?: string }).siteKey);
      }
      case "operations.get": {
        if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
        const p = params as { siteKey: string; name: string };
        return s.operations.get(p.siteKey, p.name);
      }
      case "operations.saveProgram": {
        if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
        return s.operations.saveFromProgram(params as never);
      }
      case "operations.saveRequest": {
        if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
        return s.operations.saveRequestImpl(params as never);
      }
      case "operations.invoke": {
        if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
        return s.operations.invoke(params as never);
      }
      case "operations.explain": {
        if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
        const p = params as { siteKey: string; name: string; pageId?: string };
        return s.operations.explain(p.siteKey, p.name, { pageId: p.pageId });
      }
      case "operations.setImplState": {
        if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
        const p = params as { implId: string; state: "candidate" | "validated" | "shadow" | "quarantined" };
        return s.operations.setImplState(p.implId, p.state);
      }
      case "operations.disable": {
        // quarantine is the disable — the impl stays on record but never routes
        if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
        return s.operations.setImplState((params as { implId: string }).implId, "quarantined");
      }
      case "operations.forget": {
        if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
        const p = params as { siteKey: string; name: string };
        const op = s.operations.get(p.siteKey, p.name);
        s.repo.deleteOperation(op.operationId);
        return { ok: true };
      }
      case "operations.compile": {
        if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
        return s.operations.compileFromRun(params as { runId: string; siteKey?: string; name?: string });
      }
      case "programs.validate": {
        // schema already parsed — add structural checks the schema can't express
        const p = (params as { program: unknown }).program;
        const errors: string[] = [];
        const prog = p as { steps?: { id: string; op: string }[]; nodes?: unknown[] };
        if (!prog.steps?.length && !prog.nodes?.length) errors.push("program has neither steps nor nodes");
        const ids = new Set<string>();
        for (const st of prog.steps ?? []) {
          if (ids.has(st.id)) errors.push(`duplicate step id ${st.id}`);
          ids.add(st.id);
        }
        (prog.steps ?? []).forEach((st, i, arr) => {
          if (st.op === "expectDownload" && i === arr.length - 1)
            errors.push("expectDownload must precede the trigger step");
        });
        return { ok: errors.length === 0, errors };
      }
      case "traces.list": {
        if (!s.tracer) throw new AuxError("backend_unavailable", "tracing not wired");
        const p = params as { since?: number; runId?: string; limit?: number };
        return s.tracer.spansSince(p.since ?? 0, p.limit ?? 500, p.runId);
      }
      case "traces.summary": {
        if (!s.tracer) throw new AuxError("backend_unavailable", "tracing not wired");
        return s.tracer.summary((params as { runId: string }).runId);
      }
      case "traces.counters": {
        if (!s.tracer) throw new AuxError("backend_unavailable", "tracing not wired");
        return s.tracer.counters(); // flushes the in-memory increments first
      }
      case "runtime.describe": {
        // capability surface for external clients — what this runtime can do (§16.2)
        const backends = [...new Set(s.repo.listPages({ includeDetached: true }).map((p) => p.backend))];
        return {
          version: 1,
          methods: Object.keys(MethodSchemas).sort(),
          entities: ["pages", "sets", "runs", "programs", "operations", "datasets", "responses", "artifacts", "observations", "spans"],
          programForms: { steps: true, nodes: true },
          nodeKinds: ["step", "let", "if", "forEach", "until", "observe", "assert", "emit", "checkpoint", "return", "call"],
          implKinds: ["browser-program", "session-request"],
          effectClasses: ["read", "write", "destructive"],
          implStates: ["candidate", "validated", "shadow", "quarantined"],
          stateEntities: ["controls", "records", "responses", "artifacts", "operations", "datasets"],
          // §16.2 — clients must not assume capabilities the backend lacks
          backends,
          limits: {
            maxStepsPerProgram: 200,
            maxNodesPerProgram: 400,
            maxForEachConcurrency: 8,
            defaultNodeBudget: 2000,
            defaultIterationBudget: 500,
            observeMaxElements: 120,
            observeMaxTextChars: 6000,
          },
          features: {
            responseCapture: !!s.responses,
            operationRegistry: !!s.operations,
            stateIndex: !!s.state,
            tracing: !!s.tracer,
            chromeAttach: true,
            takeover: true,
            // Runs are crash-safe (the ledger marks them interrupted) but NOT
            // resumable after a restart; program checkpoints (`resumeFrom`)
            // are the only resume primitive. Advertise exactly that.
            checkpointResume: false,
            programCheckpoints: true,
            invocationIdempotency: true,
            webmcpTools: false,
            bidi: true,
            crashReview: true,
          },
        };
      }
    }
  };
}
