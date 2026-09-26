import { DocumentContent, DocumentExtractionNote } from "./DocumentContent";
import { useState } from "react";
import { bridge } from "../bridge";
import { call } from "../store";
import { taskReceiptMarkdown } from "../task-receipt-export";
import type { TaskReceipt, MethodName, RpcArgs } from "@aux/contracts";

const STATUS = { in_progress: "In progress", uncertain: "Outcome uncertain", accepted: "Accepted by you", not_met: "Criteria not met", needs_review: "Needs review" };

export function TaskReceiptView({ receipt, pageId, submit, readOnly = false }: {
  receipt: TaskReceipt; pageId: string | null;
  readOnly?: boolean;
  submit?: <M extends MethodName>(method: M, ...params: RpcArgs<M>) => Promise<boolean>;
}) {
  const editable = !readOnly && !!submit;
  const historical = receipt.currentTaskRevision !== undefined && receipt.currentTaskRevision !== receipt.taskRevision;
  const [document, setDocument] = useState<{ criterionId: string; filename: string; content: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  async function pickDocument(criterionId: string) {
    setImporting(true); setImportError("");
    try {
      const picked = await bridge.pickEvidenceDocument();
      if (picked) setDocument({ ...picked, criterionId });
    } catch (error) { setImportError((error instanceof Error ? error.message : String(error)).replace(/^Error invoking remote method [^:]+: Error: /, "")); }
    finally { setImporting(false); }
  }
  async function saveDocument() {
    if (!document || importing || !submit || !editable) return;
    setImporting(true);
    try {
      if (await submit("tasks.importDocumentEvidence", { taskId: receipt.taskId, expectedRevision: receipt.taskRevision,
        criterionId: document.criterionId, filename: document.filename, content: document.content })) setDocument(null);
    } finally { setImporting(false); }
  }
  const [exporting, setExporting] = useState(false);
  const [includeSnapshots, setIncludeSnapshots] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [exportError, setExportError] = useState("");
  async function exportReceipt() {
    setExporting(true); setExportMessage(""); setExportError("");
    try {
      const current = await call("tasks.receipt", {taskId: receipt.taskId, ...(readOnly ? {revision: receipt.taskRevision} : {})});
      if (current.taskRevision !== receipt.taskRevision) throw new Error("This task changed. Reload the saved task before exporting its receipt.");
      const destination = await bridge.saveFile(`aux-receipt-${receipt.taskId.replace(/[^a-zA-Z0-9_-]/g, "-")}-r${current.taskRevision}.md`, taskReceiptMarkdown(current, includeSnapshots));
      setExportMessage(destination ? "Receipt exported." : "Export canceled.");
    } catch (error) { setExportError((error instanceof Error ? error.message : String(error)).replace(/^Error invoking remote method [^:]+: Error: /, "")); }
    finally { setExporting(false); }
  }
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [actionEvidence, setActionEvidence] = useState<Record<string, string>>({});
  const [actionNotes, setActionNotes] = useState<Record<string, string>>({});
  const [operationEvidence,setOperationEvidence]=useState<Record<string,string>>({});
  const [operationNotes,setOperationNotes]=useState<Record<string,string>>({});
  const active = receipt.runs.some(run => ["queued", "planning", "running", "paused", "needs_input"].includes(run.status));
  const base = { taskId: receipt.taskId, expectedRevision: receipt.taskRevision };
  const usableEvidence = receipt.criteria.flatMap(item => item.evidence.filter(evidence => !evidence.stale));
  const treeUsage={calls:receipt.modelCalls+receipt.childTasks.reduce((total,child)=>total+child.modelCalls,0),cost:receipt.knownCostUsd+receipt.childTasks.reduce((total,child)=>total+child.knownCostUsd,0),complete:receipt.costComplete&&receipt.childTasks.every(child=>child.costComplete)};
  return <div className="field">
    <h4>Evidence and receipt</h4>
    {historical && <p className="hint">Earlier revision {receipt.taskRevision} · Current task revision {receipt.currentTaskRevision}. This review does not establish the current task’s outcome. Freshness is assessed now, not reconstructed as of the revision date.</p>}
    <div className="receipt-export">
      <button className="btn sm" disabled={exporting} onClick={() => void exportReceipt()}>{exporting ? "Preparing receipt…" : "Export receipt as Markdown"}</button>
      <label><input type="checkbox" checked={includeSnapshots} onChange={event => setIncludeSnapshots(event.target.checked)} /> Include captured text</label>
      <span className="hint">Exports objective, evidence summaries and sources, reviews, unresolved actions, run history and recorded usage. Page, document and command text is optional.</span>
      {exportMessage && <output data-block>{exportMessage}</output>}
      {exportError && <p role="alert">{exportError}</p>}
    </div>
    <output data-block>{STATUS[receipt.status]}</output>
    <span className="hint">Your acceptance records your review of the selected evidence. Captured pages, documents and command results are dated snapshots, not a live guarantee of the outcome.</span>
    <span className="hint">{receipt.modelCalls} model calls · ${receipt.knownCostUsd.toFixed(4)} {receipt.costComplete ? "recorded model cost" : "known model cost; some costs are unknown or estimated"}</span>
    {!!receipt.childTasks.length&&<span className="hint">Coordinated total: {treeUsage.calls} model calls · ${treeUsage.cost.toFixed(4)} {treeUsage.complete?'recorded model cost':'known model cost; some descendant costs are unknown or estimated'}</span>}
    {(receipt.providers.length > 0 || receipt.modelIds.length > 0) && <span className="hint">{[receipt.providers.join(", "), receipt.modelIds.join(", ")].filter(Boolean).join(" · ")}{receipt.destinations.length ? ` · ${receipt.destinations.join(", ")}` : " · destination not recorded"}</span>}
    {importError && <p role="alert">{importError}</p>}
    {!!receipt.cloudResults.length&&<section className="field" aria-label="Preserved cloud results"><strong>Preserved cloud results</strong><span className="hint">Validated worker manifests and exact stored bytes. These records are evidence for review and do not accept criteria.</span>{receipt.cloudResults.map(result=><div key={result.resultId} className="document-source hint"><span><b>{result.status.replaceAll('_',' ')}</b> · {new Date(result.resultUpdatedAt).toLocaleString()} · source {result.sourceTree.slice(0,12)}</span><p className="selectable">{result.summary}</p>{result.localRequest&&<p>Local {result.localRequest.kind} requested: {result.localRequest.prompt}</p>}<div className="row">{result.artifacts.map(item=><button className="btn sm" key={item.artifactId} onClick={()=>void bridge.saveStoredArtifact(item.artifactId,item.label).catch(error=>setImportError(error instanceof Error?error.message:String(error)))}>Save {item.label}…</button>)}</div><details><summary>Artifact fingerprints and worker claims</summary>{result.artifacts.map(item=><code key={item.artifactId}>{item.label} · {item.bytes.toLocaleString()} bytes · {item.sha256}</code>)}{result.claims.map(claim=><p key={claim.criterionId}>{claim.status.replaceAll('_',' ')} · {claim.criterionId} · {claim.summary}</p>)}</details></div>)}</section>}
    {!!receipt.childTasks.length&&<section className="field" aria-label="Coordinated task outcomes"><strong>Coordinated task outcomes</strong><span className="hint">The parent receipt cannot be accepted while descendant work is active, uncertain, not met or awaiting review.</span>{receipt.childTasks.map(child=><div className="document-source hint" key={child.taskId} style={{marginLeft:`${Math.min(child.depth-1,3)*12}px`}}><span><b>{child.title}</b> · revision {child.revision} · {STATUS[child.status]}{child.state==='archived'?' · archived':''}{child.cloudEnvironment?` · cloud ${child.cloudEnvironment}`:''} · {child.modelCalls} calls · ${child.knownCostUsd.toFixed(4)}{child.costComplete?'':' known cost'}</span></div>)}</section>}
    {receipt.criteria.map(({ criterion, status, evidence, review }) => {
      const note = notes[criterion.criterionId] ?? "";
      const chosen = (selected[criterion.criterionId] ?? []).filter(id => evidence.some(item => item.record.evidenceId === id && !item.stale));
      const verification = receipt.verifications.find(item => item.criterionId === criterion.criterionId);
      return <section key={criterion.criterionId} aria-label={criterion.description} className="field" style={{ borderTop: "1px solid var(--accent-line)", paddingTop: "var(--space-3)" }}>
        <strong>{criterion.description}</strong>
        <span className="hint">{status === "accepted" ? "Accepted by you" : status.replaceAll("_", " ")}</span>
        {review && <p>{review.note}</p>}
        {verification && <p className="hint">Local check · {verification.method} · {verification.status.replaceAll("_", " ")} · {verification.localMatch ? "matched saved evidence" : "no local match"} · {verification.reason} This is not acceptance.</p>}
        {!evidence.length && <p>No evidence recorded.</p>}
        {evidence.map(({ record, stale, reason }) => <div key={record.evidenceId}>
          <label className="row" style={{ alignItems: "flex-start" }}>{editable && <input type="checkbox" style={{ width: 16, height: 16, flexShrink: 0 }} aria-label={`Use evidence ${record.evidenceId}`} disabled={stale}
            checked={chosen.includes(record.evidenceId)} onChange={event => setSelected(previous => ({ ...previous, [criterion.criterionId]: event.target.checked ? [...chosen, record.evidenceId] : chosen.filter(id => id !== record.evidenceId) }))} />}
            <span>{record.summary}</span></label>
          <span className="hint">{record.kind === "command_snapshot" ? "Saved local command result selected by you" : record.kind === "document_snapshot" ? "Document selected by you" : record.actor === "runtime" ? "Captured by Aux" : record.actor === "desktop_user" ? "Your note" : "Client-submitted claim"} · {new Date(record.observedAt).toLocaleString()}{stale ? ` · Stale: ${reason}` : ""}</span>
          {record.kind==='command_snapshot'&&<div className="hint"><p>Command {record.source.commandId} · {record.source.commandState} · Exit {record.source.exitCode??'not recorded'}{record.source.truncated?' · Output truncated':''}</p><p>{record.source.executionTaskId?`Execution task ${record.source.executionTaskId} · Revision ${record.source.executionTaskRevision}`:"No task binding was recorded at execution."}</p><p>Historical result, not current checkout verification. A successful exit does not prove the criterion. Subsequent local edits and commands are not monitored by this snapshot.</p></div>}
          {record.source.url && <p>{record.source.url}</p>}
          {record.kind === "document_snapshot" && <div className="document-source hint">
            <span>{record.source.filename} · {record.source.byteLength?.toLocaleString()} bytes · Saved local copy; original changes are not tracked.</span>
            <details><summary>Snapshot fingerprint</summary><code>{record.source.sha256}</code><span>SHA-256 identifies these saved bytes; it does not verify the document’s claims.</span></details>
          </div>}
          {!!record.source.cloudArtifacts?.length&&<div className="document-source hint"><span>{record.source.cloudArtifacts.length} cloud result artifact{record.source.cloudArtifacts.length===1?'':'s'} preserved in Aux task data.</span><div className="row">{record.source.cloudArtifacts.map(item=><button className="btn sm" key={item.artifactId} onClick={()=>void bridge.saveStoredArtifact(item.artifactId,item.label).catch(error=>setImportError(error instanceof Error?error.message:String(error)))}>Save {item.label}…</button>)}</div><details><summary>Preserved artifact fingerprints</summary>{record.source.cloudArtifacts.map(item=><code key={item.artifactId}>{item.label} · {item.bytes.toLocaleString()} bytes · {item.sha256}</code>)}</details></div>}
          {record.snapshot && <details><summary>{record.kind === "command_snapshot" ? "Saved command and output" : record.kind === "document_snapshot" ? "Saved document text" : "Captured page text"}</summary><DocumentExtractionNote filename={record.snapshot.title} /><DocumentContent filename={record.snapshot.title} content={record.snapshot.text} /></details>}
        </div>)}
        {editable && <>
        <textarea aria-label="Evidence or review note" rows={3} placeholder="Describe the evidence you checked and what it establishes." value={note} onChange={event => setNotes(previous => ({ ...previous, [criterion.criterionId]: event.target.value }))} maxLength={4000} />
        <div className="row">
          <button className="btn sm" disabled={!note.trim()} onClick={() => void submit?.("tasks.recordEvidence", { ...base, criterionId: criterion.criterionId, summary: note })}>Add note</button>
          <button className="btn sm" disabled={!pageId} onClick={() => void submit?.("tasks.captureEvidence", { ...base, criterionId: criterion.criterionId, pageId: pageId as string })}>Capture current page</button>
          <button className="btn sm" disabled={active || importing || !!document} onClick={() => void pickDocument(criterion.criterionId)}>Import document</button>
        </div>
        {document?.criterionId === criterion.criterionId && <section className="document-preview field" aria-label="Document preview">
          <strong>{document.filename}</strong>
          <span className="hint">{new TextEncoder().encode(document.content).length.toLocaleString()} bytes of saved text · Up to 512 KB</span>
          <DocumentExtractionNote filename={document.filename} />
          <DocumentContent filename={document.filename} content={document.content} />
          <span className="hint">Save a local copy as evidence for this criterion. Importing does not send the text to a model. The original file will not be monitored.</span>
          <div className="row"><button className="btn sm" disabled={importing || active} onClick={() => void saveDocument()}>Save document evidence</button>
            <button className="btn sm" disabled={importing} onClick={() => setDocument(null)}>Cancel import</button></div>
        </section>}
        <div className="row">
          <button className="btn sm" disabled={!chosen.length || !note.trim() || active} onClick={() => void submit?.("tasks.reviewCriterion", { ...base, criterionId: criterion.criterionId, evidenceIds: chosen, note, outcome: "accepted" })}>Accept criterion</button>
          <button className="btn sm" disabled={!chosen.length || !note.trim() || active} onClick={() => void submit?.("tasks.reviewCriterion", { ...base, criterionId: criterion.criterionId, evidenceIds: chosen, note, outcome: "rejected" })}>Mark not met</button>
          <button className="btn sm" disabled={active} onClick={() => void submit?.("tasks.verifyCriterion", { ...base, criterionId: criterion.criterionId })}>Run local check</button>
        </div>
        <span className="hint">A local check compares saved evidence. It never records acceptance.</span>
        </>}
      </section>;
    })}
    {receipt.unresolvedActions.length > 0 && <h4>Uncertain actions</h4>}
    {receipt.unresolvedActions.map(action => <section key={action.intentId} className="field" aria-label={`Uncertain action ${action.intentId}`}>
      <p>Action {action.intentId} · {action.status}</p>
      <span className="hint">Check independent records before deciding whether this action happened. Recording a decision does not dispatch another action.</span>
      {editable && <>
      <select aria-label="Reconciliation evidence" value={actionEvidence[action.intentId] ?? ""} onChange={event => setActionEvidence(previous => ({ ...previous, [action.intentId]: event.target.value }))}>
        <option value="">Select evidence</option>{usableEvidence.map(item => <option key={item.record.evidenceId} value={item.record.evidenceId}>{item.record.summary}</option>)}
      </select>
      <textarea aria-label="Reconciliation reason" rows={3} value={actionNotes[action.intentId] ?? ""} onChange={event => setActionNotes(previous => ({ ...previous, [action.intentId]: event.target.value }))} />
      <div className="row">{(["applied", "not_applied"] as const).map(outcome => <button className="btn sm" key={outcome} disabled={active || !actionEvidence[action.intentId] || !actionNotes[action.intentId]?.trim()}
        onClick={() => void submit?.("tasks.reconcileAction", { ...base, intentId: action.intentId, evidenceId: actionEvidence[action.intentId] as string, outcome, note: actionNotes[action.intentId] as string })}>
        {outcome === "applied" ? "Record as applied" : "Record as not applied"}
      </button>)}</div>
      </>}
    </section>)}
    {receipt.unresolvedOperations.length>0&&<h4>Uncertain operations</h4>}
    {receipt.unresolvedOperations.map(operation=><section key={operation.invocationId} className="field" aria-label={`Uncertain operation ${operation.invocationId}`}>
      <p><strong>{operation.operation}</strong> · {operation.effectClass} · {operation.status}</p>
      <span className="hint">Aux cannot prove whether this operation took effect. Check the project checkout or service records before continuing; this decision never repeats the operation.</span>
      {operation.error&&<p className="hint">Last error: {operation.error}</p>}
      {editable&&<><select aria-label="Operation reconciliation evidence" value={operationEvidence[operation.invocationId]??''} onChange={event=>setOperationEvidence(previous=>({...previous,[operation.invocationId]:event.target.value}))}>
        <option value="">Select evidence</option>{usableEvidence.map(item=><option key={item.record.evidenceId} value={item.record.evidenceId}>{item.record.summary}</option>)}</select>
      <textarea aria-label="Operation reconciliation reason" rows={3} value={operationNotes[operation.invocationId]??''} onChange={event=>setOperationNotes(previous=>({...previous,[operation.invocationId]:event.target.value}))}/>
      <div className="row">{(['applied','not_applied'] as const).map(outcome=><button className="btn sm" key={outcome} disabled={active||!operationEvidence[operation.invocationId]||!operationNotes[operation.invocationId]?.trim()} onClick={()=>void submit?.('tasks.reconcileOperation',{...base,invocationId:operation.invocationId,evidenceId:operationEvidence[operation.invocationId] as string,outcome,note:operationNotes[operation.invocationId] as string})}>{outcome==='applied'?'Record as applied':'Record as not applied'}</button>)}</div></>}
    </section>)}
  </div>;
}
