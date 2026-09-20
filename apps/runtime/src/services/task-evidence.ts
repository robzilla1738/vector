import { createHash, randomUUID } from "node:crypto";
import { CriterionReviewParams, CriterionReviewSchema, EvidenceCaptureParams, EvidenceCommandParams, EvidenceDocumentParams, EvidenceNoteParams, PreservedCloudResultSchema, TaskEvidenceSchema, TaskReconcileParams, TaskReconcileOperationParams, VectorError,
  type Task, type TaskEvidence, type CriterionReview, type TaskReceipt, type CloudTaskResult, type PreservedCloudResult } from "@vector/contracts";
import type { Repo } from "../store/repo.js";
import { summarizeModelUsage } from "./model-usage.js";
import type { EventBus } from "../events.js";
import type { PageService } from "./pages.js";
import { TaskService } from "./tasks.js";
import { DurableWriteLedger } from "../agent/durable.js";

type Actor = "desktop_user" | "external_client";
type EvidenceRow = { seq: number; json: string };
const ACTIVE = new Set(["queued", "planning", "running", "paused", "needs_input"]);
const CLOUD_RESULTS_KEY='preservedCloudTaskResults';

export class TaskEvidenceService {
  private tasks: TaskService;
  constructor(private repo: Repo, private events: EventBus, private pages?: Pick<PageService, "observe" | "get">) {
    this.tasks = new TaskService(repo, events);
  }

  recordNote(input: unknown, actor: Actor): TaskEvidence {
    const p = EvidenceNoteParams.parse(input);
    this.current(p.taskId, p.expectedRevision, p.criterionId);
    const now = Date.now();
    return this.saveEvidence({ evidenceId: randomUUID(), taskId: p.taskId, taskRevision: p.expectedRevision, criterionId: p.criterionId,
      kind: "note", actor, summary: p.summary, recordedAt: now, observedAt: now, runSequence: this.runSequence(p.taskId), source: {} });
  }

  importCloudResult(taskId:string,revision:number,environmentId:string,result:CloudTaskResult,cloudArtifacts:{artifactId:string;label:string;sha256:string;bytes:number}[]=[]):{evidence:TaskEvidence[];imported:number}{
    this.prepareCloudResult(taskId,revision,result);
    this.preserveCloudResult(taskId,revision,environmentId,result,cloudArtifacts);
    const sequence=this.runSequence(taskId);
    const artifacts=result.artifacts.map(item=>`${item.label}: ${item.path}`).join('\n');
    const created:TaskEvidence[]=[];
    const inserted:TaskEvidence[]=[];
    this.repo.transaction(()=>{
      const existing=this.evidence(taskId,revision);
      for(const claim of result.criteria){
        const duplicate=existing.find(({record})=>record.criterionId===claim.criterionId&&record.source.cloudEnvironmentId===environmentId&&record.source.cloudResultUpdatedAt===result.updatedAt);
        if(duplicate){created.push(duplicate.record);continue;}
        const snapshot=[`Worker result: ${result.status}`,`Result summary: ${result.summary}`,result.localRequest&&`Local request (${result.localRequest.kind}): ${result.localRequest.prompt}${result.localRequest.resourceId?`\nResource: ${result.localRequest.resourceId}`:''}`,`Criterion claim: ${claim.status}`,`Claim summary: ${claim.summary}`,`Source tree: ${result.sourceTree}`,`Result timestamp: ${new Date(result.updatedAt).toISOString()}`,artifacts&&`Declared artifacts:\n${artifacts}`,cloudArtifacts.length&&`Preserved locally:\n${cloudArtifacts.map(item=>`${item.label}: ${item.sha256} (${item.bytes} bytes)`).join('\n')}`].filter(Boolean).join('\n\n');
        const record=TaskEvidenceSchema.parse({evidenceId:randomUUID(),taskId,taskRevision:revision,criterionId:claim.criterionId,kind:'note',actor:'external_client',summary:`Cloud worker claim: ${claim.status.replaceAll('_',' ')} — ${claim.summary}`.slice(0,4000),recordedAt:Date.now(),observedAt:result.updatedAt,runSequence:sequence,source:{cloudEnvironmentId:environmentId,cloudSourceTree:result.sourceTree,cloudResultUpdatedAt:result.updatedAt,...(cloudArtifacts.length?{cloudArtifacts}: {})},snapshot:{title:'Validated cloud worker result',text:snapshot}});
        this.repo.db.prepare('INSERT INTO task_evidence(evidence_id,task_id,task_revision,criterion_id,json) VALUES(?,?,?,?,?)').run(record.evidenceId,record.taskId,record.taskRevision,record.criterionId,JSON.stringify(record));
        created.push(record);
        inserted.push(record);
      }
    });
    for(const record of inserted)this.events.emit('task.evidence_recorded',{taskId:record.taskId,evidenceId:record.evidenceId});
    return {evidence:created,imported:inserted.length};
  }

  preserveCloudResult(taskId:string,revision:number,environmentId:string,result:CloudTaskResult,artifacts:{artifactId:string;label:string;sha256:string;bytes:number}[]):{result:PreservedCloudResult;preserved:boolean}{
    const task=this.current(taskId,revision,undefined,true);if(task.state==='archived')throw new VectorError('conflict','Restore this task before preserving a cloud result');
    if(result.taskId!==taskId||result.taskRevision!==revision)throw new VectorError('conflict','The cloud result does not match this task revision');
    const criteria=new Set(task.criteria.map(item=>item.criterionId));if(result.criteria.some(item=>!criteria.has(item.criterionId)))throw new VectorError('conflict','The cloud task result references a criterion outside this task revision');
    const records=this.cloudResults();const existing=records.find(item=>item.taskId===taskId&&item.taskRevision===revision&&item.environmentId===environmentId&&item.resultUpdatedAt===result.updatedAt);
    if(existing&&(!artifacts.length||existing.artifacts.length))return{result:existing,preserved:false};
    const record=PreservedCloudResultSchema.parse({resultId:existing?.resultId??randomUUID(),taskId,taskRevision:revision,environmentId,sourceTree:result.sourceTree,status:result.status,summary:result.summary,localRequest:result.localRequest,resultUpdatedAt:result.updatedAt,preservedAt:existing?.preservedAt??Date.now(),claims:result.criteria,artifacts:artifacts.length?artifacts:existing?.artifacts??[]});
    const next=records.filter(item=>item.resultId!==record.resultId);next.push(record);this.repo.setSetting(CLOUD_RESULTS_KEY,next.slice(-500));this.events.emit('task.cloud_result_preserved',{taskId,resultId:record.resultId});return{result:record,preserved:true};
  }

  prepareCloudResult(taskId:string,revision:number,result:CloudTaskResult):void{
    const task=this.current(taskId,revision,undefined,true);
    if(task.state==='archived')throw new VectorError('conflict','Restore this task before importing cloud evidence');
    if(result.taskId!==taskId||result.taskRevision!==revision)throw new VectorError('conflict','The cloud result does not match this task revision');
    if(!result.criteria.length)throw new VectorError('conflict','The cloud result has no criterion claims to import');
    const criteria=new Set(task.criteria.map(item=>item.criterionId));
    if(result.criteria.some(item=>!criteria.has(item.criterionId)))throw new VectorError('conflict','The cloud result references a criterion outside this task revision');
  }

  cloudResultImported(taskId:string,revision:number,environmentId:string,resultUpdatedAt:number):boolean{
    return this.evidence(taskId,revision).some(({record})=>record.source.cloudEnvironmentId===environmentId&&record.source.cloudResultUpdatedAt===resultUpdatedAt);
  }
  cloudResultPreserved(taskId:string,revision:number,environmentId:string,resultUpdatedAt:number):PreservedCloudResult|undefined{return this.cloudResults().find(item=>item.taskId===taskId&&item.taskRevision===revision&&item.environmentId===environmentId&&item.resultUpdatedAt===resultUpdatedAt&&item.artifacts.length>0);}

  importDocument(input: unknown): TaskEvidence {
    const p = EvidenceDocumentParams.parse(input);
    const task = this.current(p.taskId, p.expectedRevision, p.criterionId, true);
    if (task.state === "archived") throw new VectorError("conflict", "Restore this task before importing evidence");
    const now = Date.now();
    return this.saveEvidence({ evidenceId: randomUUID(), taskId: p.taskId, taskRevision: p.expectedRevision, criterionId: p.criterionId,
      kind: "document_snapshot", actor: "desktop_user", summary: `Document: ${p.filename}`,
      recordedAt: now, observedAt: now, runSequence: this.runSequence(p.taskId),
      source: { filename: p.filename, sha256: createHash("sha256").update(p.content, "utf8").digest("hex"), byteLength: Buffer.byteLength(p.content, "utf8") },
      snapshot: { title: p.filename, text: p.content } });
  }

  importCommand(input: unknown): TaskEvidence {
    const p=EvidenceCommandParams.parse(input);
    const task=this.current(p.taskId,p.expectedRevision,p.criterionId,true);
    if(task.state==='archived')throw new VectorError('conflict','Restore this task before importing evidence');
    if(!task.resources.some(resource=>resource.kind==='repository'&&resource.projectId===p.projectId))throw new VectorError('permission_denied','Attach this project to the current task revision first');
    const command=p.command;
    if(command.projectId!==p.projectId||command.commandId!==p.commandId||['running','stopping'].includes(command.state)||command.finishedAt===undefined)throw new VectorError('invalid_params','Select a finished command from this project');
    const content=`${command.task?`Execution task: ${command.task.title} (${command.task.taskId}) · Revision ${command.task.taskRevision}\n`:"No task binding was recorded at execution.\n"}Command: ${command.command}\nExecution mode: ${command.mode}\nWorking directory: ${command.cwd}\nStarted: ${new Date(command.startedAt).toISOString()}\nFinished: ${new Date(command.finishedAt).toISOString()}\nState: ${command.state}\nExit code: ${command.exitCode??'not recorded'}\nOutput truncated: ${command.truncated}\n\n${command.output}`;
    return this.saveEvidence({evidenceId:randomUUID(),taskId:p.taskId,taskRevision:p.expectedRevision,criterionId:p.criterionId,
      kind:'command_snapshot',actor:'desktop_user',summary:`Local command result: ${command.state}${command.exitCode!=null?` (exit ${command.exitCode})`:''}`,
      recordedAt:Date.now(),observedAt:command.finishedAt,runSequence:this.runSequence(p.taskId),
      source:{executionTaskId:command.task?.taskId,executionTaskRevision:command.task?.taskRevision,commandId:p.commandId,projectId:p.projectId,commandState:command.state,exitCode:command.exitCode,truncated:command.truncated,
        sha256:createHash('sha256').update(content,'utf8').digest('hex'),byteLength:Buffer.byteLength(content,'utf8')},
      snapshot:{title:'Saved local command result',text:content}});
  }

  async capture(input: unknown): Promise<TaskEvidence> {
    const p = EvidenceCaptureParams.parse(input);
    const task = this.current(p.taskId, p.expectedRevision, p.criterionId);
    const scoped = task.resources.some(resource => resource.kind === "page" && resource.locator === p.pageId)
      || this.tasks.details(p.taskId).runs.some(({ run, currentRevision }) => currentRevision && run.pageIds.includes(p.pageId));
    if (!scoped) throw new VectorError("permission_denied", "The page is not in this task's current resources or runs");
    if (!this.pages) throw new VectorError("backend_unavailable", "Browser evidence capture is unavailable");
    const sequence = this.runSequence(p.taskId);
    const observation = await this.pages.observe(p.pageId, { scope: "full" });
    this.current(p.taskId, p.expectedRevision, p.criterionId);
    if (sequence !== this.runSequence(p.taskId)) throw new VectorError("conflict", "A task run started during capture; capture fresh evidence");
    return this.saveEvidence({ evidenceId: randomUUID(), taskId: p.taskId, taskRevision: p.expectedRevision, criterionId: p.criterionId,
      kind: "browser_observation", actor: "runtime", summary: `Page observation: ${observation.content.title || observation.content.url}`.slice(0, 4000),
      recordedAt: Date.now(), observedAt: observation.observedAt, runSequence: sequence,
      source: { pageId: p.pageId, url: observation.content.url, documentEpoch: observation.documentEpoch, observationRevision: observation.revision },
      snapshot: { title: observation.content.title, text: observation.content.text.slice(0, 20000) } });
  }

  review(input: unknown): CriterionReview {
    const p = CriterionReviewParams.parse(input);
    const review = this.repo.transaction(() => {
      this.current(p.taskId, p.expectedRevision, p.criterionId, true);this.tasks.requireLocalAuthority(p.taskId,p.expectedRevision);
      const evidence = this.evidence(p.taskId, p.expectedRevision, p.criterionId);
      for (const id of p.evidenceIds) {
        const record = evidence.find(item => item.record.evidenceId === id)?.record;
        if (!record) throw new VectorError("invalid_params", "Review evidence must belong to this criterion and task revision");
        const reason = this.staleReason(record);
        if (reason) throw new VectorError("conflict", `Evidence is stale: ${reason}`);
      }
      const record: CriterionReview = { reviewId: randomUUID(), taskId: p.taskId, taskRevision: p.expectedRevision, criterionId: p.criterionId,
        actor: "desktop_user", outcome: p.outcome, evidenceIds: [...new Set(p.evidenceIds)], note: p.note, recordedAt: Date.now(),
        evidenceSequence: Math.max(0, ...evidence.map(item => item.seq)) };
      this.repo.db.prepare("INSERT INTO criterion_reviews(review_id,task_id,task_revision,criterion_id,json) VALUES(?,?,?,?,?)")
        .run(record.reviewId, record.taskId, record.taskRevision, record.criterionId, JSON.stringify(record));
      return record;
    });
    this.events.emit("task.reviewed", { taskId: p.taskId, reviewId: review.reviewId });
    return review;
  }

  reconcile(input: unknown): { ok: true } {
    const p = TaskReconcileParams.parse(input);
    this.current(p.taskId, p.expectedRevision, undefined, true);this.tasks.requireLocalAuthority(p.taskId,p.expectedRevision);
    const action = this.repo.db.prepare(`SELECT a.id,a.status FROM action_intents a JOIN runs r ON r.run_id=a.run_id
      WHERE a.id=? AND json_extract(r.config,'$.taskId')=?`).get(p.intentId, p.taskId) as { id: string; status: string } | undefined;
    if (!action || !["pending", "uncertain"].includes(action.status)) throw new VectorError("conflict", "No unresolved action with this ID belongs to the task");
    const evidence = this.evidence(p.taskId, p.expectedRevision).find(item => item.record.evidenceId === p.evidenceId)?.record;
    if (!evidence) throw new VectorError("invalid_params", "Reconciliation needs evidence from the current task revision");
    const reason = this.staleReason(evidence);
    if (reason) throw new VectorError("conflict", `Evidence is stale: ${reason}`);
    new DurableWriteLedger(this.repo.db).reconcile(p.intentId, p.outcome, JSON.stringify({ actor: "desktop_user", evidenceId: p.evidenceId, note: p.note, recordedAt: Date.now() }));
    this.events.emit("task.action_reconciled", { taskId: p.taskId, intentId: p.intentId, outcome: p.outcome, evidenceId: p.evidenceId });
    return { ok: true };
  }

  reconcileOperation(input:unknown):{ok:true}{
    const p=TaskReconcileOperationParams.parse(input);this.current(p.taskId,p.expectedRevision,undefined,true);this.tasks.requireLocalAuthority(p.taskId,p.expectedRevision);
    const operation=this.repo.db.prepare(`SELECT i.invocation_id AS invocationId,i.run_id AS runId,o.effect_class AS effectClass
      FROM operation_invocations i JOIN operations o ON o.operation_id=i.operation_id JOIN runs r ON r.run_id=i.run_id
      WHERE i.invocation_id=? AND json_extract(r.config,'$.taskId')=? AND o.effect_class!='read'
      AND (i.status IN ('running','interrupted') OR i.effect_outcome='unknown')`).get(p.invocationId,p.taskId) as {invocationId:string;runId:string;effectClass:string}|undefined;
    if(!operation)throw new VectorError('conflict','No unresolved operation with this ID belongs to the task');
    const evidence=this.evidence(p.taskId,p.expectedRevision).find(item=>item.record.evidenceId===p.evidenceId)?.record;
    if(!evidence)throw new VectorError('invalid_params','Reconciliation needs evidence from the current task revision');
    const reason=this.staleReason(evidence);if(reason)throw new VectorError('conflict',`Evidence is stale: ${reason}`);
    const recordedAt=Date.now();this.repo.transaction(()=>{
      const updated=this.repo.db.prepare(`UPDATE operation_invocations SET status='reconciled',effect_outcome=?,ended_at=coalesce(ended_at,?)
        WHERE invocation_id=? AND (status IN ('running','interrupted') OR effect_outcome='unknown')`).run(p.outcome==='applied'?'verified':'not-dispatched',recordedAt,p.invocationId);
      if(updated.changes!==1)throw new VectorError('conflict','The operation was reconciled by another client');
      this.repo.db.prepare(`INSERT INTO operation_reconciliations(invocation_id,task_id,task_revision,outcome,evidence_id,note,recorded_at) VALUES(?,?,?,?,?,?,?)`)
        .run(p.invocationId,p.taskId,p.expectedRevision,p.outcome,p.evidenceId,p.note,recordedAt);
    });
    this.events.emit('task.operation_reconciled',{taskId:p.taskId,invocationId:p.invocationId,outcome:p.outcome,evidenceId:p.evidenceId});return{ok:true};
  }

  receipt(taskId: string, revision?: number, includeChildren = true): TaskReceipt {
    const details = this.tasks.details(taskId);
    const task = revision === undefined ? details.task : details.revisions.find(item => item.revision === revision);
    if (!task) throw new VectorError("not_found", "This task revision does not exist");
    const runs = details.runs.filter(({ run }) => run.config!.taskRevision! <= task.revision);
    const unresolvedActions = this.repo.db.prepare(`SELECT a.id AS intentId,a.run_id AS runId,a.page_id AS pageId,a.status
      FROM action_intents a JOIN runs r ON r.run_id=a.run_id WHERE json_extract(r.config,'$.taskId')=?
      AND json_extract(r.config,'$.taskRevision')<=?
      AND a.status IN ('pending','uncertain') ORDER BY a.created_at,a.id`).all(taskId, task.revision) as unknown as TaskReceipt["unresolvedActions"];
    const unresolvedOperations=this.repo.db.prepare(`SELECT i.invocation_id AS invocationId,i.run_id AS runId,
      o.site_key||'/'||o.name AS operation,o.effect_class AS effectClass,i.status,i.effect_outcome AS effectOutcome,i.started_at AS startedAt,i.error
      FROM operation_invocations i JOIN operations o ON o.operation_id=i.operation_id JOIN runs r ON r.run_id=i.run_id
      WHERE json_extract(r.config,'$.taskId')=? AND json_extract(r.config,'$.taskRevision')<=? AND o.effect_class!='read'
      AND (i.status IN ('running','interrupted') OR i.effect_outcome='unknown') ORDER BY i.started_at,i.invocation_id`).all(taskId,task.revision) as unknown as TaskReceipt['unresolvedOperations'];
    const criteria: TaskReceipt["criteria"] = task.criteria.map(criterion => {
      const rows = this.evidence(taskId, task.revision, criterion.criterionId);
      const evidence = rows.map(({ record }) => { const reason = this.staleReason(record); return { record, stale: !!reason, reason }; });
      const reviewRow = this.repo.db.prepare("SELECT json FROM criterion_reviews WHERE task_id=? AND task_revision=? AND criterion_id=? ORDER BY seq DESC LIMIT 1")
        .get(taskId, task.revision, criterion.criterionId) as { json: string } | undefined;
      const review = reviewRow ? CriterionReviewSchema.parse(JSON.parse(reviewRow.json)) : undefined;
      let status: TaskReceipt["criteria"][number]["status"] = evidence.length ? "needs_review" : "unverified";
      if (review) {
        const stale = review.evidenceIds.some(id => !evidence.some(item => item.record.evidenceId === id && !item.stale));
        const newEvidence = rows.some(row => row.seq > review.evidenceSequence);
        status = stale ? "stale" : newEvidence ? "needs_review" : review.outcome;
      }
      return { criterion, status, evidence, review };
    });
    const calls = runs.flatMap(({ run }) => this.repo.listModelCalls(run.runId));
    const usage = summarizeModelUsage(calls);
    const active = runs.some(({ run }) => ACTIVE.has(run.status))||!!this.tasks.currentCloudAuthority(taskId,task.revision);
    const ownStatus:TaskReceipt['status']=unresolvedActions.length||unresolvedOperations.length ? "uncertain" : active ? "in_progress" : criteria.every(item => item.status === "accepted") ? "accepted"
      : criteria.some(item => item.status === "rejected") ? "not_met" : "needs_review";
    const childTasks:TaskReceipt['childTasks']=includeChildren&&task.revision===details.task.revision?details.children.map(child=>{
      const childReceipt=this.receipt(child.task.taskId,undefined,false);
      return{taskId:child.task.taskId,parentTaskId:child.task.parentTaskId!,title:child.task.title,revision:child.task.revision,state:child.task.state,depth:child.depth,status:childReceipt.status,modelCalls:childReceipt.modelCalls,knownCostUsd:childReceipt.knownCostUsd,costComplete:childReceipt.costComplete,...(child.cloudAuthority?{cloudEnvironment:child.cloudAuthority.remoteName}:{})};
    }):[];
    const descendantStatuses=new Set(childTasks.map(child=>child.status));
    const status:TaskReceipt['status']=ownStatus==='uncertain'||descendantStatuses.has('uncertain')?'uncertain'
      :ownStatus==='in_progress'||descendantStatuses.has('in_progress')?'in_progress'
      :ownStatus==='not_met'||descendantStatuses.has('not_met')?'not_met'
      :ownStatus==='accepted'&&childTasks.every(child=>child.status==='accepted')?'accepted':'needs_review';
    return { taskId, taskRevision: task.revision, currentTaskRevision: details.task.revision, objective: task.objective, generatedAt: Date.now(),
      status,
      criteria, unresolvedActions,unresolvedOperations,
      runs: runs.map(({ run }) => ({ runId: run.runId, status: run.status, taskRevision: run.config!.taskRevision!, currentRevision: run.config!.taskRevision === task.revision, error: run.error,
        durationMs: run.startedAt !== undefined && run.endedAt !== undefined ? Math.max(0, run.endedAt - run.startedAt) : undefined })),
      modelCalls: usage.calls, knownCostUsd: usage.knownCostUsd, costComplete: usage.costComplete,
      modelIds: usage.modelIds, providers: usage.providers, destinations: usage.destinations,
      cloudResults:this.cloudResults().filter(item=>item.taskId===taskId&&item.taskRevision===task.revision).sort((a,b)=>b.resultUpdatedAt-a.resultUpdatedAt),childTasks };
  }

  private current(taskId: string, revision: number, criterionId?: string, idle = false): Task {
    const task = this.tasks.get(taskId);
    if (task.revision !== revision) throw new VectorError("conflict", "Task revision changed; reload before recording evidence or a decision");
    if (criterionId && !task.criteria.some(criterion => criterion.criterionId === criterionId)) throw new VectorError("not_found", "Criterion does not belong to this task revision");
    if (idle && this.tasks.details(taskId).runs.some(({ run }) => ACTIVE.has(run.status))) throw new VectorError("conflict", "Stop active task runs before recording a decision");
    return task;
  }

  private runSequence(taskId: string): number {
    return Number(this.repo.db.prepare("SELECT coalesce(max(rowid),0) AS seq FROM runs WHERE json_extract(config,'$.taskId')=?").get(taskId)?.seq);
  }

  private staleReason(evidence: TaskEvidence): string | undefined {
    if (this.runSequence(evidence.taskId) !== evidence.runSequence) return "A new task run started after this evidence was recorded";
    if (evidence.kind === "browser_observation") {
      try {
        const page = this.pages?.get(evidence.source.pageId!);
        if (!page || page.viewStatus === "detached" || page.viewStatus === "crashed") return "The source page is unavailable";
        if (page.url !== evidence.source.url || page.documentEpoch !== evidence.source.documentEpoch || page.lastRevision !== evidence.source.observationRevision) return "The source page changed since capture";
      } catch { return "The source page is unavailable"; }
    }
    return undefined;
  }

  private evidence(taskId: string, revision: number, criterionId?: string): { seq: number; record: TaskEvidence }[] {
    return (this.repo.db.prepare("SELECT seq,json FROM task_evidence WHERE task_id=? AND task_revision=? AND (? IS NULL OR criterion_id=?) ORDER BY seq")
      .all(taskId, revision, criterionId ?? null, criterionId ?? null) as EvidenceRow[])
      .map(row => ({ seq: row.seq, record: TaskEvidenceSchema.parse(JSON.parse(row.json)) }));
  }

  private cloudResults():PreservedCloudResult[]{const value=this.repo.getSetting<unknown>(CLOUD_RESULTS_KEY);if(!Array.isArray(value))return[];return value.flatMap(item=>{const parsed=PreservedCloudResultSchema.safeParse(item);return parsed.success?[parsed.data]:[];});}

  private saveEvidence(record: TaskEvidence): TaskEvidence {
    const validated = TaskEvidenceSchema.parse(record);
    this.repo.db.prepare("INSERT INTO task_evidence(evidence_id,task_id,task_revision,criterion_id,json) VALUES(?,?,?,?,?)")
      .run(validated.evidenceId, validated.taskId, validated.taskRevision, validated.criterionId, JSON.stringify(validated));
    this.events.emit("task.evidence_recorded", { taskId: validated.taskId, evidenceId: validated.evidenceId });
    return validated;
  }
}
