import { DocumentContent, DocumentExtractionNote } from "./DocumentContent";
import { useState } from "react";
import { bridge } from "../bridge";
import { call } from "../store";
import { taskReceiptMarkdown } from "../task-receipt-export";
import type { TaskReceipt, MethodName, RpcArgs } from "@aux/contracts";

const STATUS = { in_progress: "In progress", uncertain: "Outcome uncertain", accepted: "Accepted by you", not_met: "Criteria not met", needs_review: "Needs review" };

export function TaskReceiptView({ receipt, pageId, submit, onChanged, readOnly = false }: {
  receipt: TaskReceipt; pageId: string | null;
  readOnly?: boolean;
  submit?: <M extends MethodName>(method: M, ...params: RpcArgs<M>) => Promise<boolean>;
  onChanged?: () => Promise<void>;
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
  const [undoBusy, setUndoBusy] = useState(false);
  const [undoMessage, setUndoMessage] = useState("");
  const [undoDraft, setUndoDraft] = useState<{ runId: string; token: string;
    expectedStepIds: string[]; selectedStepIds: string[]; items: { stepId: string; label: string }[] } | null>(null);
  async function reviewRunUndo(runId: string) {
    if (undoBusy) return;
    setUndoBusy(true); setUndoMessage("");
    try {
      const fresh = await call("tasks.receipt", { taskId: receipt.taskId });
      if (fresh.taskRevision !== receipt.taskRevision) throw new Error("This task changed. Reload its receipt before undoing.");
      const review = fresh.undoReviews.find(item => item.runId === runId);
      if (!review?.eligibleStepIds.length) throw new Error("No browser changes are available to undo in this run.");
      const labels = new Map<string, string>([
        ...fresh.browserChanges.filter(item => item.runId === runId).map(item => [item.stepId, `Restore ${item.op} on ${item.target ?? "a form field"}`] as const),
        ...fresh.tabChanges.filter(item => item.runId === runId).map(item => [item.stepId, `Close run-owned tab ${item.url ?? ""}`] as const),
        ...fresh.bookmarkChanges.filter(item => item.runId === runId).map(item => [item.stepId, `Remove bookmark ${item.title ?? item.url ?? ""}`] as const),
        ...fresh.downloadChanges.filter(item => item.runId === runId).map(item => [item.stepId, `Move unchanged download ${item.filename ?? ""} to Trash`] as const),
        ...fresh.historyChanges.filter(item => item.runId === runId).map(item => [item.stepId, `Remove history visit ${item.title ?? item.url ?? ""}`] as const),
      ]);
      setUndoDraft({ runId, token: review.token, expectedStepIds: review.eligibleStepIds,
        selectedStepIds: [], items: review.eligibleStepIds.map(stepId => ({ stepId, label: labels.get(stepId) ?? `Browser change ${stepId}` })) });
    } catch (error) { setUndoMessage(error instanceof Error ? error.message : String(error)); }
    finally { setUndoBusy(false); }
  }
  async function undoRun() {
    if (undoBusy || !onChanged || !undoDraft?.selectedStepIds.length) return;
    setUndoBusy(true); setUndoMessage("");
    try {
      const result = await call("tasks.undoRunBrowserChanges", { taskId: receipt.taskId,
        expectedRevision: receipt.taskRevision, runId: undoDraft.runId, reviewToken: undoDraft.token,
        expectedStepIds: undoDraft.expectedStepIds, selectedStepIds: undoDraft.selectedStepIds });
      await onChanged();
      setUndoDraft(null);
      setUndoMessage(`${result.restored} browser ${result.restored === 1 ? "change" : "changes"} undone` +
        (result.skipped.length ? `; ${result.skipped.length} skipped: ${result.skipped.map(item =>
          `${item.stepId}: ${item.reason}`).join("; ")}` : "."));
    } catch (error) { setUndoDraft(null); setUndoMessage(error instanceof Error ? error.message : String(error)); }
    finally { setUndoBusy(false); }
  }
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
  const runUndoIds = receipt.undoReviews.filter(item => item.eligibleStepIds.length).map(item => item.runId);
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
    {!!receipt.childTasks.length&&<section className="field" aria-label="Coordinated task outcomes"><strong>Coordinated task outcomes</strong><span className="hint">The parent receipt cannot be accepted while descendant work is active, uncertain, not met or awaiting review.</span>{receipt.childTasks.map(child=><div className="document-source hint" key={child.taskId} style={{marginLeft:`${Math.min(child.depth-1,3)*12}px`}}><span><b>{child.title}</b> · revision {child.revision} · {STATUS[child.status]}{child.state==='archived'?' · archived':''} · {child.modelCalls} calls · ${child.knownCostUsd.toFixed(4)}{child.costComplete?'':' known cost'}</span></div>)}</section>}
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
    {!!receipt.browserChanges.length && <section className="field" aria-label="Browser changes">
      <h4>Browser form changes · {receipt.browserChanges.length}</h4>
      <p className="hint">These are the values Aux observed before agent input. A failed step may still have changed the page; review its outcome before retrying.</p>
      {receipt.browserChanges.map(change => <div className="row" key={change.stepId}>
        <span className="grow"><strong>{change.op}</strong> · {change.status === "ok" ? "completed" : "outcome uncertain"}
          {change.target ? <> · <code>{change.target}</code></> : null}
          {change.before && <span> · Before: {change.before.checked !== undefined ? String(change.before.checked)
            : change.before.selected !== undefined ? change.before.selected : change.before.value ?? "unavailable"}</span>}
          {!change.before && <span> · Before-state unavailable</span>}
          {change.after && <span> · After: {change.after.checked !== undefined ? String(change.after.checked)
            : change.after.selected !== undefined ? change.after.selected : change.after.value ?? "unavailable"}</span>}
          <span className="hint"> · run {change.runId} · revision {change.taskRevision}</span>
          {change.undoneAt && <span className="hint"> · Undone {new Date(change.undoneAt).toLocaleString()}</span>}
        </span>
        {editable && !historical && !active && change.status === "ok" && !change.undoneAt && change.before && change.after &&
          <button className="btn sm" disabled={pageId !== change.pageId} title={pageId !== change.pageId ? "Open the original page to undo this edit" : undefined}
            onClick={() => void submit?.("tasks.undoBrowserChange", { ...base, runId: change.runId, stepId: change.stepId })}>Undo form edit</button>}
      </div>)}
    </section>}
    {!!receipt.tabChanges.length && <section className="field" aria-label="Tab changes">
      <h4>Agent tab changes · {receipt.tabChanges.length}</h4>
      {receipt.tabChanges.map(change => <div className="row" key={change.stepId}>
        <span className="grow">{change.op === "tab.open" ? "Opened" : "Closed"} run-owned tab · {change.status === "ok" ? "completed" : "outcome uncertain"}
          {change.url && <> · <code>{change.url}</code></>}
          {change.undoneAt && <> · Undone {new Date(change.undoneAt).toLocaleString()}</>}
          <span className="hint"> · run {change.runId} · revision {change.taskRevision}</span>
        </span>
      </div>)}
    </section>}
    {!!receipt.groupChanges.length && <section className="field" aria-label="Tab group changes">
      <h4>Agent tab group changes · {receipt.groupChanges.length}</h4>
      <p className="hint">Native group state was observed before and after the change. Undo is unavailable until Aux can compare the current group revision and membership.</p>
      {receipt.groupChanges.map(change => <div className="field" key={change.stepId}>
        <span>Group {change.after.title ?? change.groupId} · revision {change.before.revision} → {change.after.revision}</span>
        <span className="hint">{change.before.memberPageIds.length} tabs before · {change.after.memberPageIds.length} tabs after · run {change.runId} · task revision {change.taskRevision}</span>
      </div>)}
    </section>}
    {!!receipt.bookmarkChanges.length && <section className="field" aria-label="Bookmark changes">
      <h4>Agent bookmark changes · {receipt.bookmarkChanges.length}</h4>
      {receipt.bookmarkChanges.map(change => <div className="row" key={change.stepId}>
        <span className="grow">Saved bookmark · {change.status === "ok" ? "completed" : "outcome uncertain"}
          {change.title && <> · {change.title}</>}{change.url && <> · <code>{change.url}</code></>}
          {change.undoneAt && <> · Undone {new Date(change.undoneAt).toLocaleString()}</>}
          <span className="hint"> · run {change.runId} · revision {change.taskRevision}</span>
        </span>
        {editable && !historical && !active && change.status === "ok" && !change.undoneAt &&
          <button className="btn sm" onClick={() => void submit?.("tasks.undoBookmarkChange",
            { ...base, runId: change.runId, stepId: change.stepId })}>Undo bookmark</button>}
      </div>)}
    </section>}
    {!!receipt.downloadChanges.length && <section className="field" aria-label="Download changes">
      <h4>Downloads during agent runs · {receipt.downloadChanges.length}</h4>
      <p className="hint">A download occurred in a run-controlled tab. Completed files can be moved to recoverable Trash only while their recorded bytes and identity still match. Started or interrupted downloads need review.</p>
      {receipt.downloadChanges.map(change => <div className="row" key={change.stepId}>
        <span className="grow">Download · {change.status}
          {change.filename && <> · {change.filename}</>}
          {change.size !== undefined && <> · {change.size.toLocaleString()} bytes</>}
          {change.path && <> · <code>{change.path}</code></>}
          {change.undoneAt && <> · Moved to Trash {new Date(change.undoneAt).toLocaleString()}</>}
          <span className="hint"> · run {change.runId} · revision {change.taskRevision}</span>
        </span>
        {editable && !historical && !active && change.cleanupAvailable && !change.undoneAt &&
          <button className="btn sm" onClick={() => void submit?.("tasks.undoDownloadChange",
            { ...base, runId: change.runId, stepId: change.stepId })}>Move download to Trash</button>}
      </div>)}
    </section>}
    {!!receipt.historyChanges.length && <section className="field" aria-label="History changes">
      <h4>History visits during agent runs · {receipt.historyChanges.length}</h4>
      <p className="hint">These exact visits were recorded by Chromium while an agent controlled the page. Removing a visit cannot be undone. A changed visit is refused.</p>
      {receipt.historyChanges.map(change => <div className="row" key={change.stepId}>
        <span className="grow">History visit
          {change.title && <> · {change.title}</>}
          {change.url && <> · <code>{change.url}</code></>}
          {change.visitedAt !== undefined && <> · {new Date(change.visitedAt).toLocaleString()}</>}
          {change.undoneAt && <> · Removed {new Date(change.undoneAt).toLocaleString()}</>}
          <span className="hint"> · run {change.runId} · revision {change.taskRevision}</span>
        </span>
        {editable && !historical && !active && !change.undoneAt &&
          <button className="btn sm" onClick={() => void submit?.("tasks.undoHistoryChange",
            { ...base, runId: change.runId, stepId: change.stepId })}>Remove history visit</button>}
      </div>)}
    </section>}
    {!!receipt.remoteActions.length && <section className="field" aria-label="Consequential page actions">
      <h4>Consequential page actions · {receipt.remoteActions.length}</h4>
      <p className="hint">Browser observations show what Aux saw after a step. They do not prove that a remote service committed a change. These actions cannot be reversed by Undo browser changes.</p>
      {receipt.remoteActions.map(action => <div className="field" key={action.stepId}>
        <span><strong>{action.op}</strong> · {action.uncertain ? "outcome uncertain" : action.status === "ok" ? "browser step completed" : "step failed"}
          {action.remoteConfirmed ? " · remote confirmation recorded" : " · no remote confirmation"}</span>
        {action.browserObserved && <span className="hint">Browser observed: {action.browserObserved}</span>}
        <span className="hint">Run {action.runId} · revision {action.taskRevision}</span>
      </div>)}
    </section>}
    {editable && onChanged && !historical && !active && !!runUndoIds.length && <section className="field" aria-label="Undo run changes">
      <h4>Undo a run’s browser changes</h4>
      <p className="hint">Restores matching form fields, removes unchanged bookmarks and history visits, moves unchanged managed downloads to recoverable Trash, and closes unused background tabs. Changed items are skipped. Removed visits, closed tabs, and remote effects cannot be reconstructed.</p>
      {runUndoIds.map(runId => <button className="btn sm" key={runId} disabled={undoBusy}
        onClick={() => void reviewRunUndo(runId)}>Review browser changes in run {runId}</button>)}
      {undoDraft && <div className="field" aria-label="Review selected browser undo">
        <strong>Select browser changes to undo in run {undoDraft.runId}</strong>
        <p className="hint">Only selected local changes will be attempted. A changed receipt cancels the request before any undo. Each selected item is checked against live state; changed items are skipped. Remote effects remain irreversible.</p>
        {undoDraft.items.map(item => <label className="row" key={item.stepId}><input type="checkbox"
          checked={undoDraft.selectedStepIds.includes(item.stepId)} onChange={event => setUndoDraft(current => current && ({ ...current,
            selectedStepIds: event.target.checked ? [...current.selectedStepIds, item.stepId] : current.selectedStepIds.filter(id => id !== item.stepId) }))} />
          <span>{item.label}</span></label>)}
        <div className="row"><button className="btn sm danger" disabled={undoBusy || !undoDraft.selectedStepIds.length} onClick={() => void undoRun()}>Undo selected browser changes</button>
          <button className="btn sm" disabled={undoBusy} onClick={() => setUndoDraft(null)}>Cancel</button></div>
      </div>}
      {undoMessage && <output data-block>{undoMessage}</output>}
    </section>}
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
