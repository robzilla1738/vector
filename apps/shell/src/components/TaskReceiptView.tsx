import { staticFieldProps } from "../ui/class-props";
import { staticHintProps, staticRowProps } from "../ui/class-props";
import { smallButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { DocumentContent, DocumentExtractionNote } from "./DocumentContent";
import {
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
} from "react";
import { PreferenceAction, usePreferenceCommand } from "../settings/sections/preference-command";
import { guardCommandCompletion } from "../command-completion";
import { bridge } from "../bridge";
import { call } from "../store";
import { taskReceiptMarkdown } from "../task-receipt-export";
import type { TaskReceipt, MethodName, RpcArgs } from "@aux/contracts";
import { staticGrowProps as auxReuseStaticGrowProps } from "../ui/class-props";
import { nativeCheckboxTypeProps as auxReuseNativeCheckboxTypeProps } from "../ui/native-attribute-props";

const STATUS = {
  in_progress: "In progress",
  uncertain: "Outcome uncertain",
  accepted: "Accepted by you",
  not_met: "Criteria not met",
  needs_review: "Needs review",
};

type ReceiptProps = {
  receipt: TaskReceipt;
  pageId: string | null;
  readOnly?: boolean;
  submit?: <M extends MethodName>(method: M, ...params: RpcArgs<M>) => Promise<boolean>;
  onChanged?: () => Promise<void>;
};
export function TaskReceiptView(props: ReceiptProps) {
  return (
    <ReceiptSession
      key={JSON.stringify([
        props.receipt.taskId,
        props.receipt.taskRevision,
        props.receipt.currentTaskRevision,
        props.pageId,
        !!props.readOnly,
        !!props.submit,
        !!props.onChanged,
        bridge.windowId,
        bridge.privateMode,
        bridge.windowKind,
      ])}
      {...props}
    />
  );
}
function ReceiptSession({ receipt, pageId, submit, onChanged, readOnly = false }: ReceiptProps) {
  const readOwner = useReceiptReadOwner(receipt, readOnly);
  const [artifactError, setArtifactError] = useState<{ owner: ReceiptReadOwner; message: string } | null>(
    null,
  );
  const editable = !readOnly && !!submit;
  const historical =
    receipt.currentTaskRevision !== undefined && receipt.currentTaskRevision !== receipt.taskRevision;
  const [document, setDocument] = useState<{
    criterionId: string;
    filename: string;
    content: string;
    owner: ReceiptReadOwner;
  } | null>(null);
  const [importSlot, setImportSlot] = useState<{ owner: ReceiptReadOwner; token: object } | null>(null);
  const importSlotRef = useRef(importSlot);
  useLayoutEffect(() => {
    importSlotRef.current = importSlot;
  }, [importSlot]);
  const importing = importSlot?.owner === readOwner;
  const visibleDocument = document?.owner === readOwner ? document : null;
  const [importStatus, setImportStatus] = useState<{ owner: ReceiptReadOwner; message: string } | null>(null);
  const importError = importStatus?.owner === readOwner ? importStatus.message : "";
  const setImportError = (message: string) => setImportStatus({ owner: readOwner, message });
  function beginImport() {
    if (!readOwner.current() || importSlotRef.current?.owner === readOwner)
      throw new Error("Choose this receipt’s current document action.");
    const slot = { owner: readOwner, token: {} };
    importSlotRef.current = slot;
    setImportSlot(slot);
    return slot;
  }
  function finishImport(slot: { owner: ReceiptReadOwner; token: object }) {
    if (importSlotRef.current !== slot) return;
    importSlotRef.current = null;
    if (readOwner.current()) setImportSlot(null);
  }
  async function pickDocument(criterionId: string, current: () => boolean) {
    const slot = beginImport();
    setImportError("");
    try {
      const picked = await bridge.pickEvidenceDocument();
      if (current() && picked) setDocument({ ...picked, criterionId, owner: readOwner });
      return picked;
    } catch (reason) {
      if (current())
        setImportError(errorMessage(reason).replace(/^Error invoking remote method [^:]+: Error: /, ""));
      throw reason;
    } finally {
      finishImport(slot);
    }
  }
  async function saveDocument(current: () => boolean) {
    const original = visibleDocument,
      producer = submit;
    if (!original || !producer || !editable || !current())
      throw new Error("Choose the original document preview.");
    const slot = beginImport();
    try {
      const result = await producer("tasks.importDocumentEvidence", {
        taskId: receipt.taskId,
        expectedRevision: receipt.taskRevision,
        criterionId: original.criterionId,
        filename: original.filename,
        content: original.content,
      });
      if (current() && result) setDocument(null);
      return result;
    } catch (reason) {
      if (current()) setImportError(errorMessage(reason));
      throw reason;
    } finally {
      finishImport(slot);
    }
  }
  const [undoSlot, setUndoSlot] = useState<{ owner: ReceiptReadOwner } | null>(null);
  const undoSlotRef = useRef(undoSlot);
  const undoBusy = undoSlot?.owner === readOwner;
  function beginUndo() {
    if (undoSlotRef.current?.owner === readOwner) throw new Error("Wait for the original undo action.");
    const slot = { owner: readOwner };
    undoSlotRef.current = slot;
    setUndoSlot(slot);
    return slot;
  }
  function finishUndo(slot: { owner: ReceiptReadOwner }) {
    if (undoSlotRef.current !== slot) return;
    undoSlotRef.current = null;
    if (readOwner.current()) setUndoSlot(null);
  }
  const [undoStatus, setUndoStatus] = useState<{ owner: ReceiptReadOwner; message: string } | null>(null);
  const undoMessage = undoStatus?.owner === readOwner ? undoStatus.message : "";
  const setUndoMessage = (message: string) => setUndoStatus({ owner: readOwner, message });
  const [undoDraft, setUndoDraft] = useState<{
    owner: ReceiptReadOwner;
    runId: string;
    token: string;
    expectedStepIds: string[];
    selectedStepIds: string[];
    items: { stepId: string; label: string }[];
  } | null>(null);
  async function reviewRunUndo(runId: string, current: () => boolean) {
    if (undoBusy || !current()) throw new Error("Choose this receipt’s current undo review.");
    const slot = beginUndo();
    setUndoMessage("");
    try {
      const fresh = await call("tasks.receipt", { taskId: receipt.taskId });
      if (!current()) return fresh;
      if (fresh.taskId !== receipt.taskId)
        throw new Error("This task changed. Reload its receipt before undoing.");
      if (fresh.taskRevision !== receipt.taskRevision)
        throw new Error("This task changed. Reload its receipt before undoing.");
      const review = fresh.undoReviews.find((item) => item.runId === runId);
      if (!review?.eligibleStepIds.length)
        throw new Error("No browser changes are available to undo in this run.");
      const labels = new Map<string, string>([
        ...fresh.browserChanges
          .filter((item) => item.runId === runId)
          .map((item) => [item.stepId, `Restore ${item.op} on ${item.target ?? "a form field"}`] as const),
        ...fresh.tabChanges
          .filter((item) => item.runId === runId)
          .map((item) => [item.stepId, `Close run-owned tab ${item.url ?? ""}`] as const),
        ...fresh.bookmarkChanges
          .filter((item) => item.runId === runId)
          .map((item) => [item.stepId, `Remove bookmark ${item.title ?? item.url ?? ""}`] as const),
        ...fresh.downloadChanges
          .filter((item) => item.runId === runId)
          .map((item) => [item.stepId, `Move unchanged download ${item.filename ?? ""} to Trash`] as const),
        ...fresh.historyChanges
          .filter((item) => item.runId === runId)
          .map((item) => [item.stepId, `Remove history visit ${item.title ?? item.url ?? ""}`] as const),
      ]);
      setUndoDraft({
        owner: readOwner,
        runId,
        token: review.token,
        expectedStepIds: review.eligibleStepIds,
        selectedStepIds: [],
        items: review.eligibleStepIds.map((stepId) => ({
          stepId,
          label: labels.get(stepId) ?? `Browser change ${stepId}`,
        })),
      });
      return fresh;
    } catch (error) {
      if (current()) setUndoMessage(errorMessage(error));
      throw error;
    } finally {
      finishUndo(slot);
    }
  }
  async function undoRun(current: () => boolean) {
    if (
      undoBusy ||
      !onChanged ||
      !undoDraft?.selectedStepIds.length ||
      undoDraft.owner !== readOwner ||
      !current()
    )
      throw new Error("Choose the original selected undo review.");
    const slot = beginUndo();
    setUndoMessage("");
    try {
      const result = await call("tasks.undoRunBrowserChanges", {
        taskId: receipt.taskId,
        expectedRevision: receipt.taskRevision,
        runId: undoDraft.runId,
        reviewToken: undoDraft.token,
        expectedStepIds: undoDraft.expectedStepIds,
        selectedStepIds: undoDraft.selectedStepIds,
      });
      if (!current()) return result;
      try {
        await onChanged();
      } catch (reason) {
        if (current()) setUndoMessage("Browser changes were undone, but the receipt could not be refreshed.");
        return result;
      }
      if (!current()) return result;
      setUndoDraft(null);
      setUndoMessage(
        `${result.restored} browser ${result.restored === 1 ? "change" : "changes"} undone` +
          (result.skipped.length
            ? `; ${result.skipped.length} skipped: ${result.skipped
                .map((item) => `${item.stepId}: ${item.reason}`)
                .join("; ")}`
            : "."),
      );
      return result;
    } catch (error) {
      if (current()) {
        setUndoDraft(null);
        setUndoMessage(errorMessage(error));
      }
      throw error;
    } finally {
      finishUndo(slot);
    }
  }
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [actionEvidence, setActionEvidence] = useState<Record<string, string>>({});
  const [actionNotes, setActionNotes] = useState<Record<string, string>>({});
  const [operationEvidence, setOperationEvidence] = useState<Record<string, string>>({});
  const [operationNotes, setOperationNotes] = useState<Record<string, string>>({});
  const stateRef = useRef({
    notes,
    selected,
    actionEvidence,
    actionNotes,
    operationEvidence,
    operationNotes,
    document,
    undoDraft,
  });
  useLayoutEffect(() => {
    stateRef.current = {
      notes,
      selected,
      actionEvidence,
      actionNotes,
      operationEvidence,
      operationNotes,
      document,
      undoDraft,
    };
  }, [notes, selected, actionEvidence, actionNotes, operationEvidence, operationNotes, document, undoDraft]);
  const originalDraft = (field: keyof typeof stateRef.current, value: unknown) => () =>
    stateRef.current[field] === value;
  function submitOwned<M extends MethodName>(method: M, ...params: RpcArgs<M>) {
    const producer = submit;
    if (!editable || !producer || !readOwner.current())
      throw new Error("Choose this receipt’s original review.");
    return producer(method, ...params);
  }
  const active = receipt.runs.some((run) =>
    ["queued", "planning", "running", "paused", "needs_input"].includes(run.status),
  );
  const base = { taskId: receipt.taskId, expectedRevision: receipt.taskRevision };
  const usableEvidence = receipt.criteria.flatMap((item) =>
    item.evidence.filter((evidence) => !evidence.stale),
  );
  const treeUsage = {
    calls: receipt.modelCalls + receipt.childTasks.reduce((total, child) => total + child.modelCalls, 0),
    cost: receipt.knownCostUsd + receipt.childTasks.reduce((total, child) => total + child.knownCostUsd, 0),
    complete: receipt.costComplete && receipt.childTasks.every((child) => child.costComplete),
  };
  const runUndoIds = receipt.undoReviews
    .filter((item) => item.eligibleStepIds.length)
    .map((item) => item.runId);
  return (
    <div {...staticFieldProps}>
      <h4>Evidence and receipt</h4>
      {historical && (
        <p {...staticHintProps}>
          Earlier revision {receipt.taskRevision} · Current task revision {receipt.currentTaskRevision}. This
          review does not establish the current task’s outcome. Freshness is assessed now, not reconstructed
          as of the revision date.
        </p>
      )}
      <ReceiptExportControls owner={readOwner} />
      <output data-block>{STATUS[receipt.status]}</output>
      <span {...staticHintProps}>
        Your acceptance records your review of the selected evidence. Captured pages, documents and command
        results are dated snapshots, not a live guarantee of the outcome.
      </span>
      <span {...staticHintProps}>
        {receipt.modelCalls} model calls · ${receipt.knownCostUsd.toFixed(4)}{" "}
        {receipt.costComplete
          ? "recorded model cost"
          : "known model cost; some costs are unknown or estimated"}
      </span>
      {!!receipt.childTasks.length && (
        <span {...staticHintProps}>
          Coordinated total: {treeUsage.calls} model calls · ${treeUsage.cost.toFixed(4)}{" "}
          {treeUsage.complete
            ? "recorded model cost"
            : "known model cost; some descendant costs are unknown or estimated"}
        </span>
      )}
      {(receipt.providers.length > 0 || receipt.modelIds.length > 0) && (
        <span {...staticHintProps}>
          {[receipt.providers.join(", "), receipt.modelIds.join(", ")].filter(Boolean).join(" · ")}
          {receipt.destinations.length
            ? ` · ${receipt.destinations.join(", ")}`
            : " · destination not recorded"}
        </span>
      )}
      {importError && <p role="alert">{importError}</p>}
      {artifactError?.owner === readOwner && <p role="alert">{artifactError.message}</p>}
      {!!receipt.childTasks.length && (
        <section {...staticFieldProps} aria-label="Coordinated task outcomes">
          <strong>Coordinated task outcomes</strong>
          <span {...staticHintProps}>
            The parent receipt cannot be accepted while descendant work is active, uncertain, not met or
            awaiting review.
          </span>
          {receipt.childTasks.map((child) => (
            <div
              className="document-source hint"
              key={child.taskId}
              style={{ marginLeft: `${Math.min(child.depth - 1, 3) * 12}px` }}
            >
              <span>
                <b>{child.title}</b> · revision {child.revision} · {STATUS[child.status]}
                {child.state === "archived" ? " · archived" : ""} · {child.modelCalls} calls · $
                {child.knownCostUsd.toFixed(4)}
                {child.costComplete ? "" : " known cost"}
              </span>
            </div>
          ))}
        </section>
      )}
      {receipt.criteria.map(({ criterion, status, evidence, review }) => {
        const note = notes[criterion.criterionId] ?? "";
        const chosen = (selected[criterion.criterionId] ?? []).filter((id) =>
          evidence.some((item) => item.record.evidenceId === id && !item.stale),
        );
        const verification = receipt.verifications.find((item) => item.criterionId === criterion.criterionId);
        return (
          <section
            key={criterion.criterionId}
            aria-label={criterion.description}
            {...staticFieldProps}
            style={{ borderTop: "1px solid var(--accent-line)", paddingTop: "var(--space-3)" }}
          >
            <strong>{criterion.description}</strong>
            <span {...staticHintProps}>
              {status === "accepted" ? "Accepted by you" : status.replaceAll("_", " ")}
            </span>
            {review && <p>{review.note}</p>}
            {verification && (
              <p {...staticHintProps}>
                Local check · {verification.method} · {verification.status.replaceAll("_", " ")} ·{" "}
                {verification.localMatch ? "matched saved evidence" : "no local match"} ·{" "}
                {verification.reason} This is not acceptance.
              </p>
            )}
            {!evidence.length && <p>No evidence recorded.</p>}
            {evidence.map(({ record, stale, reason }) => (
              <div key={record.evidenceId}>
                <label {...staticRowProps} style={{ alignItems: "flex-start" }}>
                  {editable && (
                    <ReceiptChoice
                      owner={readOwner}
                      command="select-task-receipt-evidence"
                      style={{ width: 16, height: 16, flexShrink: 0 }}
                      aria-label={`Use evidence ${record.evidenceId}`}
                      disabled={stale}
                      checked={chosen.includes(record.evidenceId)}
                      invoke={(checked) =>
                        setSelected((previous) => ({
                          ...previous,
                          [criterion.criterionId]: checked
                            ? [...chosen, record.evidenceId]
                            : chosen.filter((id) => id !== record.evidenceId),
                        }))
                      }
                    />
                  )}
                  <span>{record.summary}</span>
                </label>
                <span {...staticHintProps}>
                  {record.kind === "command_snapshot"
                    ? "Saved local command result selected by you"
                    : record.kind === "document_snapshot"
                      ? "Document selected by you"
                      : record.actor === "runtime"
                        ? "Captured by Aux"
                        : record.actor === "desktop_user"
                          ? "Your note"
                          : "Client-submitted claim"}{" "}
                  · {new Date(record.observedAt).toLocaleString()}
                  {stale ? ` · Stale: ${reason}` : ""}
                </span>
                {record.source.url && <p>{record.source.url}</p>}
                {record.kind === "document_snapshot" && (
                  <div className="document-source hint">
                    <span>
                      {record.source.filename} · {record.source.byteLength?.toLocaleString()} bytes · Saved
                      local copy; original changes are not tracked.
                    </span>
                    <ReceiptDisclosure
                      owner={readOwner}
                      record={record}
                      command="toggle-task-receipt-fingerprint"
                      title="Snapshot fingerprint"
                    >
                      <code>{record.source.sha256}</code>
                      <span>
                        SHA-256 identifies these saved bytes; it does not verify the document’s claims.
                      </span>
                    </ReceiptDisclosure>
                  </div>
                )}
                {!!record.source.cloudArtifacts?.length && (
                  <div className="document-source hint">
                    <span>
                      {record.source.cloudArtifacts.length} cloud result artifact
                      {record.source.cloudArtifacts.length === 1 ? "" : "s"} preserved in Aux task data.
                    </span>
                    <div {...staticRowProps}>
                      {record.source.cloudArtifacts.map((item) => (
                        <ReceiptArtifactSave
                          key={item.artifactId}
                          owner={readOwner}
                          record={record}
                          item={item}
                          onError={(message) => setArtifactError({ owner: readOwner, message })}
                        />
                      ))}
                    </div>
                    <ReceiptDisclosure
                      owner={readOwner}
                      record={record}
                      command="toggle-task-receipt-fingerprint"
                      title="Preserved artifact fingerprints"
                    >
                      {record.source.cloudArtifacts.map((item) => (
                        <code key={item.artifactId}>
                          {item.label} · {item.bytes.toLocaleString()} bytes · {item.sha256}
                        </code>
                      ))}
                    </ReceiptDisclosure>
                  </div>
                )}
                {record.snapshot && (
                  <ReceiptDisclosure
                    owner={readOwner}
                    record={record}
                    command="toggle-task-receipt-snapshot"
                    title={
                      record.kind === "command_snapshot"
                        ? "Saved command and output"
                        : record.kind === "document_snapshot"
                          ? "Saved document text"
                          : "Captured page text"
                    }
                  >
                    <DocumentExtractionNote filename={record.snapshot.title} />
                    <DocumentContent filename={record.snapshot.title} content={record.snapshot.text} />
                  </ReceiptDisclosure>
                )}
              </div>
            ))}
            {editable && (
              <>
                <textarea
                  aria-label="Evidence or review note"
                  rows={3}
                  placeholder="Describe the evidence you checked and what it establishes."
                  value={note}
                  onChange={(event) =>
                    setNotes((previous) => ({ ...previous, [criterion.criterionId]: event.target.value }))
                  }
                  maxLength={4000}
                />
                <div {...staticRowProps}>
                  <ReceiptEditAction
                    command="add-task-receipt-note"
                    owner={readOwner}
                    valid={originalDraft("notes", notes)}
                    {...smallButtonProps}
                    disabled={!note.trim()}
                    invoke={() =>
                      submitOwned("tasks.recordEvidence", {
                        ...base,
                        criterionId: criterion.criterionId,
                        summary: note,
                      })
                    }
                  >
                    Add note
                  </ReceiptEditAction>
                  <ReceiptEditAction
                    command="capture-task-receipt-page"
                    owner={readOwner}
                    {...smallButtonProps}
                    disabled={!pageId}
                    invoke={() =>
                      submitOwned("tasks.captureEvidence", {
                        ...base,
                        criterionId: criterion.criterionId,
                        pageId: pageId as string,
                      })
                    }
                  >
                    Capture current page
                  </ReceiptEditAction>
                  <ReceiptEditAction
                    command="import-task-receipt-document"
                    owner={readOwner}
                    {...smallButtonProps}
                    disabled={active || importing || !!visibleDocument}
                    invoke={(current) => pickDocument(criterion.criterionId, current)}
                  >
                    Import document
                  </ReceiptEditAction>
                </div>
                {visibleDocument?.criterionId === criterion.criterionId && (
                  <section className="document-preview field" aria-label="Document preview">
                    <strong>{visibleDocument.filename}</strong>
                    <span {...staticHintProps}>
                      {new TextEncoder().encode(visibleDocument.content).length.toLocaleString()} bytes of
                      saved text · Up to 512 KB
                    </span>
                    <DocumentExtractionNote filename={visibleDocument.filename} />
                    <DocumentContent filename={visibleDocument.filename} content={visibleDocument.content} />
                    <span {...staticHintProps}>
                      Save a local copy as evidence for this criterion. Importing does not send the text to a
                      model. The original file will not be monitored.
                    </span>
                    <div {...staticRowProps}>
                      <ReceiptEditAction
                        command="save-task-receipt-document"
                        owner={readOwner}
                        valid={originalDraft("document", document)}
                        {...smallButtonProps}
                        disabled={importing || active}
                        invoke={saveDocument}
                      >
                        Save document evidence
                      </ReceiptEditAction>
                      <ReceiptEditAction
                        command="cancel-task-receipt-document"
                        owner={readOwner}
                        {...smallButtonProps}
                        disabled={importing}
                        invoke={() => setDocument(null)}
                      >
                        Cancel import
                      </ReceiptEditAction>
                    </div>
                  </section>
                )}
                <div {...staticRowProps}>
                  <ReceiptEditAction
                    command="accept-task-receipt-criterion"
                    owner={readOwner}
                    valid={() => originalDraft("notes", notes)() && originalDraft("selected", selected)()}
                    {...smallButtonProps}
                    disabled={!chosen.length || !note.trim() || active}
                    invoke={() =>
                      submitOwned("tasks.reviewCriterion", {
                        ...base,
                        criterionId: criterion.criterionId,
                        evidenceIds: chosen,
                        note,
                        outcome: "accepted",
                      })
                    }
                  >
                    Accept criterion
                  </ReceiptEditAction>
                  <ReceiptEditAction
                    command="reject-task-receipt-criterion"
                    owner={readOwner}
                    valid={() => originalDraft("notes", notes)() && originalDraft("selected", selected)()}
                    {...smallButtonProps}
                    disabled={!chosen.length || !note.trim() || active}
                    invoke={() =>
                      submitOwned("tasks.reviewCriterion", {
                        ...base,
                        criterionId: criterion.criterionId,
                        evidenceIds: chosen,
                        note,
                        outcome: "rejected",
                      })
                    }
                  >
                    Mark not met
                  </ReceiptEditAction>
                  <ReceiptEditAction
                    command="verify-task-receipt-criterion"
                    owner={readOwner}
                    {...smallButtonProps}
                    disabled={active}
                    invoke={() =>
                      submitOwned("tasks.verifyCriterion", { ...base, criterionId: criterion.criterionId })
                    }
                  >
                    Run local check
                  </ReceiptEditAction>
                </div>
                <span {...staticHintProps}>
                  A local check compares saved evidence. It never records acceptance.
                </span>
              </>
            )}
          </section>
        );
      })}
      {!!receipt.browserChanges.length && (
        <section {...staticFieldProps} aria-label="Browser changes">
          <h4>Browser form changes · {receipt.browserChanges.length}</h4>
          <p {...staticHintProps}>
            These are the values Aux observed before agent input. A failed step may still have changed the
            page; review its outcome before retrying.
          </p>
          {receipt.browserChanges.map((change) => (
            <div className="row" key={change.stepId}>
              <span {...auxReuseStaticGrowProps}>
                <strong>{change.op}</strong> · {change.status === "ok" ? "completed" : "outcome uncertain"}
                {change.target ? (
                  <>
                    {" "}
                    · <code>{change.target}</code>
                  </>
                ) : null}
                {change.before && (
                  <span>
                    {" "}
                    · Before:{" "}
                    {change.before.checked !== undefined
                      ? String(change.before.checked)
                      : change.before.selected !== undefined
                        ? change.before.selected
                        : (change.before.value ?? "unavailable")}
                  </span>
                )}
                {!change.before && <span> · Before-state unavailable</span>}
                {change.after && (
                  <span>
                    {" "}
                    · After:{" "}
                    {change.after.checked !== undefined
                      ? String(change.after.checked)
                      : change.after.selected !== undefined
                        ? change.after.selected
                        : (change.after.value ?? "unavailable")}
                  </span>
                )}
                <span {...staticHintProps}>
                  {" "}
                  · run {change.runId} · revision {change.taskRevision}
                </span>
                {change.undoneAt && (
                  <span {...staticHintProps}> · Undone {new Date(change.undoneAt).toLocaleString()}</span>
                )}
              </span>
              {editable &&
                !historical &&
                !active &&
                change.status === "ok" &&
                !change.undoneAt &&
                change.before &&
                change.after && (
                  <ReceiptEditAction
                    command="undo-task-receipt-form"
                    owner={readOwner}
                    {...smallButtonProps}
                    disabled={pageId !== change.pageId}
                    title={pageId !== change.pageId ? "Open the original page to undo this edit" : undefined}
                    invoke={() =>
                      submitOwned("tasks.undoBrowserChange", {
                        ...base,
                        runId: change.runId,
                        stepId: change.stepId,
                      })
                    }
                  >
                    Undo form edit
                  </ReceiptEditAction>
                )}
            </div>
          ))}
        </section>
      )}
      {!!receipt.tabChanges.length && (
        <section {...staticFieldProps} aria-label="Tab changes">
          <h4>Agent tab changes · {receipt.tabChanges.length}</h4>
          {receipt.tabChanges.map((change) => (
            <div className="row" key={change.stepId}>
              <span {...auxReuseStaticGrowProps}>
                {change.op === "tab.open" ? "Opened" : "Closed"} run-owned tab ·{" "}
                {change.status === "ok" ? "completed" : "outcome uncertain"}
                {change.url && (
                  <>
                    {" "}
                    · <code>{change.url}</code>
                  </>
                )}
                {change.undoneAt && <> · Undone {new Date(change.undoneAt).toLocaleString()}</>}
                <span {...staticHintProps}>
                  {" "}
                  · run {change.runId} · revision {change.taskRevision}
                </span>
              </span>
            </div>
          ))}
        </section>
      )}
      {!!receipt.groupChanges.length && (
        <section {...staticFieldProps} aria-label="Tab group changes">
          <h4>Agent tab group changes · {receipt.groupChanges.length}</h4>
          <p {...staticHintProps}>
            Native group state was observed before and after the change. Undo is unavailable until Aux can
            compare the current group revision and membership.
          </p>
          {receipt.groupChanges.map((change) => (
            <div className="field" key={change.stepId}>
              <span>
                Group {change.after.title ?? change.groupId} · revision {change.before.revision} →{" "}
                {change.after.revision}
              </span>
              <span {...staticHintProps}>
                {change.before.memberPageIds.length} tabs before · {change.after.memberPageIds.length} tabs
                after · run {change.runId} · task revision {change.taskRevision}
              </span>
            </div>
          ))}
        </section>
      )}
      {!!receipt.bookmarkChanges.length && (
        <section {...staticFieldProps} aria-label="Bookmark changes">
          <h4>Agent bookmark changes · {receipt.bookmarkChanges.length}</h4>
          {receipt.bookmarkChanges.map((change) => (
            <div className="row" key={change.stepId}>
              <span {...auxReuseStaticGrowProps}>
                Saved bookmark · {change.status === "ok" ? "completed" : "outcome uncertain"}
                {change.title && <> · {change.title}</>}
                {change.url && (
                  <>
                    {" "}
                    · <code>{change.url}</code>
                  </>
                )}
                {change.undoneAt && <> · Undone {new Date(change.undoneAt).toLocaleString()}</>}
                <span {...staticHintProps}>
                  {" "}
                  · run {change.runId} · revision {change.taskRevision}
                </span>
              </span>
              {editable && !historical && !active && change.status === "ok" && !change.undoneAt && (
                <ReceiptEditAction
                  command="undo-task-receipt-bookmark"
                  owner={readOwner}
                  {...smallButtonProps}
                  invoke={() =>
                    submitOwned("tasks.undoBookmarkChange", {
                      ...base,
                      runId: change.runId,
                      stepId: change.stepId,
                    })
                  }
                >
                  Undo bookmark
                </ReceiptEditAction>
              )}
            </div>
          ))}
        </section>
      )}
      {!!receipt.downloadChanges.length && (
        <section {...staticFieldProps} aria-label="Download changes">
          <h4>Downloads during agent runs · {receipt.downloadChanges.length}</h4>
          <p {...staticHintProps}>
            A download occurred in a run-controlled tab. Completed files can be moved to recoverable Trash
            only while their recorded bytes and identity still match. Started or interrupted downloads need
            review.
          </p>
          {receipt.downloadChanges.map((change) => (
            <div className="row" key={change.stepId}>
              <span {...auxReuseStaticGrowProps}>
                Download · {change.status}
                {change.filename && <> · {change.filename}</>}
                {change.size !== undefined && <> · {change.size.toLocaleString()} bytes</>}
                {change.path && (
                  <>
                    {" "}
                    · <code>{change.path}</code>
                  </>
                )}
                {change.undoneAt && <> · Moved to Trash {new Date(change.undoneAt).toLocaleString()}</>}
                <span {...staticHintProps}>
                  {" "}
                  · run {change.runId} · revision {change.taskRevision}
                </span>
              </span>
              {editable && !historical && !active && change.cleanupAvailable && !change.undoneAt && (
                <ReceiptEditAction
                  command="undo-task-receipt-download"
                  owner={readOwner}
                  {...smallButtonProps}
                  invoke={() =>
                    submitOwned("tasks.undoDownloadChange", {
                      ...base,
                      runId: change.runId,
                      stepId: change.stepId,
                    })
                  }
                >
                  Move download to Trash
                </ReceiptEditAction>
              )}
            </div>
          ))}
        </section>
      )}
      {!!receipt.historyChanges.length && (
        <section {...staticFieldProps} aria-label="History changes">
          <h4>History visits during agent runs · {receipt.historyChanges.length}</h4>
          <p {...staticHintProps}>
            These exact visits were recorded by Chromium while an agent controlled the page. Removing a visit
            cannot be undone. A changed visit is refused.
          </p>
          {receipt.historyChanges.map((change) => (
            <div className="row" key={change.stepId}>
              <span {...auxReuseStaticGrowProps}>
                History visit
                {change.title && <> · {change.title}</>}
                {change.url && (
                  <>
                    {" "}
                    · <code>{change.url}</code>
                  </>
                )}
                {change.visitedAt !== undefined && <> · {new Date(change.visitedAt).toLocaleString()}</>}
                {change.undoneAt && <> · Removed {new Date(change.undoneAt).toLocaleString()}</>}
                <span {...staticHintProps}>
                  {" "}
                  · run {change.runId} · revision {change.taskRevision}
                </span>
              </span>
              {editable && !historical && !active && !change.undoneAt && (
                <ReceiptEditAction
                  command="undo-task-receipt-history"
                  owner={readOwner}
                  {...smallButtonProps}
                  invoke={() =>
                    submitOwned("tasks.undoHistoryChange", {
                      ...base,
                      runId: change.runId,
                      stepId: change.stepId,
                    })
                  }
                >
                  Remove history visit
                </ReceiptEditAction>
              )}
            </div>
          ))}
        </section>
      )}
      {!!receipt.remoteActions.length && (
        <section {...staticFieldProps} aria-label="Consequential page actions">
          <h4>Consequential page actions · {receipt.remoteActions.length}</h4>
          <p {...staticHintProps}>
            Browser observations show what Aux saw after a step. They do not prove that a remote service
            committed a change. These actions cannot be reversed by Undo browser changes.
          </p>
          {receipt.remoteActions.map((action) => (
            <div className="field" key={action.stepId}>
              <span>
                <strong>{action.op}</strong> ·{" "}
                {action.uncertain
                  ? "outcome uncertain"
                  : action.status === "ok"
                    ? "browser step completed"
                    : "step failed"}
                {action.remoteConfirmed ? " · remote confirmation recorded" : " · no remote confirmation"}
              </span>
              {action.browserObserved && (
                <span {...staticHintProps}>Browser observed: {action.browserObserved}</span>
              )}
              <span {...staticHintProps}>
                Run {action.runId} · revision {action.taskRevision}
              </span>
            </div>
          ))}
        </section>
      )}
      {editable && onChanged && !historical && !active && !!runUndoIds.length && (
        <section {...staticFieldProps} aria-label="Undo run changes">
          <h4>Undo a run’s browser changes</h4>
          <p {...staticHintProps}>
            Restores matching form fields, removes unchanged bookmarks and history visits, moves unchanged
            managed downloads to recoverable Trash, and closes unused background tabs. Changed items are
            skipped. Removed visits, closed tabs, and remote effects cannot be reconstructed.
          </p>
          {runUndoIds.map((runId) => (
            <ReceiptEditAction
              command="review-task-receipt-run-undo"
              owner={readOwner}
              className="btn sm"
              key={runId}
              disabled={undoBusy}
              invoke={(current) => reviewRunUndo(runId, current)}
            >
              Review browser changes in run {runId}
            </ReceiptEditAction>
          ))}
          {undoDraft?.owner === readOwner && (
            <div {...staticFieldProps} role="group" aria-label="Review selected browser undo">
              <strong>Select browser changes to undo in run {undoDraft.runId}</strong>
              <p {...staticHintProps}>
                Only selected local changes will be attempted. A changed receipt cancels the request before
                any undo. Each selected item is checked against live state; changed items are skipped. Remote
                effects remain irreversible.
              </p>
              {undoDraft.items.map((item) => (
                <label className="row" key={item.stepId}>
                  <ReceiptChoice
                    owner={readOwner}
                    command="select-task-receipt-undo-change"
                    aria-label={item.label}
                    disabled={undoBusy}
                    checked={undoDraft.selectedStepIds.includes(item.stepId)}
                    invoke={(checked) =>
                      setUndoDraft(
                        (current) =>
                          current && {
                            ...current,
                            selectedStepIds: checked
                              ? [...current.selectedStepIds, item.stepId]
                              : current.selectedStepIds.filter((id) => id !== item.stepId),
                          },
                      )
                    }
                  />
                  <span>{item.label}</span>
                </label>
              ))}
              <div {...staticRowProps}>
                <ReceiptEditAction
                  command="undo-task-receipt-selected-changes"
                  owner={readOwner}
                  valid={originalDraft("undoDraft", undoDraft)}
                  className="btn sm danger"
                  disabled={undoBusy || !undoDraft.selectedStepIds.length}
                  invoke={undoRun}
                >
                  Undo selected browser changes
                </ReceiptEditAction>
                <ReceiptEditAction
                  command="cancel-task-receipt-run-undo"
                  owner={readOwner}
                  {...smallButtonProps}
                  disabled={undoBusy}
                  invoke={() => setUndoDraft(null)}
                >
                  Cancel
                </ReceiptEditAction>
              </div>
            </div>
          )}
          {undoMessage && <output data-block>{undoMessage}</output>}
        </section>
      )}
      {receipt.unresolvedActions.length > 0 && <h4>Uncertain actions</h4>}
      {receipt.unresolvedActions.map((action) => (
        <section
          key={action.intentId}
          {...staticFieldProps}
          aria-label={`Uncertain action ${action.intentId}`}
        >
          <p>
            Action {action.intentId} · {action.status}
          </p>
          <span {...staticHintProps}>
            Check independent records before deciding whether this action happened. Recording a decision does
            not dispatch another action.
          </span>
          {editable && (
            <>
              <ReceiptSelection
                owner={readOwner}
                command="select-task-receipt-action-evidence"
                aria-label="Reconciliation evidence"
                value={actionEvidence[action.intentId] ?? ""}
                invoke={(value) =>
                  setActionEvidence((previous) => ({ ...previous, [action.intentId]: value }))
                }
              >
                <option value="">Select evidence</option>
                {usableEvidence.map((item) => (
                  <option key={item.record.evidenceId} value={item.record.evidenceId}>
                    {item.record.summary}
                  </option>
                ))}
              </ReceiptSelection>
              <textarea
                aria-label="Reconciliation reason"
                rows={3}
                value={actionNotes[action.intentId] ?? ""}
                onChange={(event) =>
                  setActionNotes((previous) => ({ ...previous, [action.intentId]: event.target.value }))
                }
              />
              <div {...staticRowProps}>
                {(["applied", "not_applied"] as const).map((outcome) => (
                  <ReceiptEditAction
                    command={
                      outcome === "applied" ? "accept-task-receipt-action" : "reject-task-receipt-action"
                    }
                    owner={readOwner}
                    valid={() =>
                      originalDraft("actionEvidence", actionEvidence)() &&
                      originalDraft("actionNotes", actionNotes)()
                    }
                    className="btn sm"
                    key={outcome}
                    disabled={
                      active || !actionEvidence[action.intentId] || !actionNotes[action.intentId]?.trim()
                    }
                    invoke={() =>
                      submitOwned("tasks.reconcileAction", {
                        ...base,
                        intentId: action.intentId,
                        evidenceId: actionEvidence[action.intentId] as string,
                        outcome,
                        note: actionNotes[action.intentId] as string,
                      })
                    }
                  >
                    {outcome === "applied" ? "Record as applied" : "Record as not applied"}
                  </ReceiptEditAction>
                ))}
              </div>
            </>
          )}
        </section>
      ))}
      {receipt.unresolvedOperations.length > 0 && <h4>Uncertain operations</h4>}
      {receipt.unresolvedOperations.map((operation) => (
        <section
          key={operation.invocationId}
          {...staticFieldProps}
          aria-label={`Uncertain operation ${operation.invocationId}`}
        >
          <p>
            <strong>{operation.operation}</strong> · {operation.effectClass} · {operation.status}
          </p>
          <span {...staticHintProps}>
            Aux cannot prove whether this operation took effect. Check the project checkout or service records
            before continuing; this decision never repeats the operation.
          </span>
          {operation.error && <p {...staticHintProps}>Last error: {operation.error}</p>}
          {editable && (
            <>
              <ReceiptSelection
                owner={readOwner}
                command="select-task-receipt-operation-evidence"
                aria-label="Operation reconciliation evidence"
                value={operationEvidence[operation.invocationId] ?? ""}
                invoke={(value) =>
                  setOperationEvidence((previous) => ({ ...previous, [operation.invocationId]: value }))
                }
              >
                <option value="">Select evidence</option>
                {usableEvidence.map((item) => (
                  <option key={item.record.evidenceId} value={item.record.evidenceId}>
                    {item.record.summary}
                  </option>
                ))}
              </ReceiptSelection>
              <textarea
                aria-label="Operation reconciliation reason"
                rows={3}
                value={operationNotes[operation.invocationId] ?? ""}
                onChange={(event) =>
                  setOperationNotes((previous) => ({
                    ...previous,
                    [operation.invocationId]: event.target.value,
                  }))
                }
              />
              <div {...staticRowProps}>
                {(["applied", "not_applied"] as const).map((outcome) => (
                  <ReceiptEditAction
                    command={
                      outcome === "applied"
                        ? "accept-task-receipt-operation"
                        : "reject-task-receipt-operation"
                    }
                    owner={readOwner}
                    valid={() =>
                      originalDraft("operationEvidence", operationEvidence)() &&
                      originalDraft("operationNotes", operationNotes)()
                    }
                    className="btn sm"
                    key={outcome}
                    disabled={
                      active ||
                      !operationEvidence[operation.invocationId] ||
                      !operationNotes[operation.invocationId]?.trim()
                    }
                    invoke={() =>
                      submitOwned("tasks.reconcileOperation", {
                        ...base,
                        invocationId: operation.invocationId,
                        evidenceId: operationEvidence[operation.invocationId] as string,
                        outcome,
                        note: operationNotes[operation.invocationId] as string,
                      })
                    }
                  >
                    {outcome === "applied" ? "Record as applied" : "Record as not applied"}
                  </ReceiptEditAction>
                ))}
              </div>
            </>
          )}
        </section>
      ))}
    </div>
  );
}

type ReceiptEvidence = TaskReceipt["criteria"][number]["evidence"][number]["record"];
type ReceiptArtifact = NonNullable<ReceiptEvidence["source"]["cloudArtifacts"]>[number];
class ReceiptReadOwner {
  #live = true;
  readonly taskId: string;
  readonly revision: number;
  readonly currentRevision: number | undefined;
  readonly generatedAt: number;
  constructor(
    readonly receipt: TaskReceipt,
    readonly readOnly: boolean,
    readonly windowId: string,
    readonly privateMode: boolean,
    readonly kind: typeof bridge.windowKind,
  ) {
    this.taskId = receipt.taskId;
    this.revision = receipt.taskRevision;
    this.currentRevision = receipt.currentTaskRevision;
    this.generatedAt = receipt.generatedAt;
  }
  activate() {
    this.#live = true;
  }
  retire() {
    this.#live = false;
  }
  current() {
    return (
      this.#live &&
      bridge.windowId === this.windowId &&
      bridge.privateMode === this.privateMode &&
      bridge.windowKind === this.kind &&
      this.receipt.taskId === this.taskId &&
      this.receipt.taskRevision === this.revision &&
      this.receipt.currentTaskRevision === this.currentRevision &&
      this.receipt.generatedAt === this.generatedAt
    );
  }
  contains(record: ReceiptEvidence) {
    return (
      this.current() &&
      this.receipt.criteria.some((criterion) => criterion.evidence.some((item) => item.record === record))
    );
  }
}
function useReceiptReadOwner(receipt: TaskReceipt, readOnly: boolean) {
  const windowId = bridge.windowId,
    privateMode = bridge.privateMode,
    kind = bridge.windowKind;
  const owner = useMemo(
    () => new ReceiptReadOwner(receipt, readOnly, windowId, privateMode, kind),
    [receipt, readOnly, windowId, privateMode, kind],
  );
  useLayoutEffect(() => {
    owner.activate();
    return () => owner.retire();
  }, [owner]);
  return owner;
}
function ReceiptExportControls({ owner }: { owner: ReceiptReadOwner }) {
  const scopeId = useId();
  const [choice, setChoice] = useState<{ owner: ReceiptReadOwner; include: boolean }>({
    owner,
    include: false,
  });
  const [state, setState] = useState<{
    owner: ReceiptReadOwner;
    busy: boolean;
    message: string;
    error: string;
  }>({ owner, busy: false, message: "", error: "" });
  const pending = useRef<{ owner: ReceiptReadOwner; completion: Promise<string | null> } | null>(null);
  const include = choice.owner === owner && choice.include;
  const visible = state.owner === owner ? state : { busy: false, message: "", error: "" };
  const select = useCallback(
    (original: HTMLInputElement, originalEvent?: Event) => {
      if (!owner.current()) throw new Error("Choose this receipt’s current control.");
      setChoice({ owner, include: originalEvent ? original.checked : !original.checked });
    },
    [owner],
  );
  const [inputRef, toggle] = usePreferenceCommand<HTMLInputElement>(
    "toggle-task-receipt-captured-text",
    scopeId,
    select,
  );
  const exportReceipt = () => {
    if (!owner.current()) throw new Error("Choose this receipt’s current export.");
    if (pending.current?.owner === owner) return pending.current.completion;
    setState({ owner, busy: true, message: "", error: "" });
    const completion = guardCommandCompletion(
      (async () => {
        const current = await call("tasks.receipt", {
          taskId: owner.taskId,
          ...(owner.readOnly ? { revision: owner.revision } : {}),
        });
        if (!owner.current()) throw new Error("This receipt’s export was retired before the file chooser.");
        if (current.taskId !== owner.taskId || current.taskRevision !== owner.revision)
          throw new Error("This task changed. Reload the saved task before exporting its receipt.");
        const destination = await bridge.saveFile(
          `aux-receipt-${owner.taskId.replace(/[^a-zA-Z0-9_-]/g, "-")}-r${current.taskRevision}.md`,
          taskReceiptMarkdown(current, include),
        );
        if (owner.current())
          setState({
            owner,
            busy: false,
            message: destination ? "Receipt exported." : "Export canceled.",
            error: "",
          });
        return destination;
      })()
        .catch((reason) => {
          if (owner.current())
            setState({
              owner,
              busy: false,
              message: "",
              error: errorMessage(reason).replace(/^Error invoking remote method [^:]+: Error: /, ""),
            });
          throw reason;
        })
        .finally(() => {
          if (pending.current?.completion === completion) pending.current = null;
        }),
      () => owner.current(),
    );
    pending.current = { owner, completion };
    return completion;
  };
  return (
    <div className="receipt-export">
      <PreferenceAction
        {...smallButtonProps}
        command="export-task-receipt"
        scopeId={scopeId}
        disabled={visible.busy}
        invoke={exportReceipt}
      >
        {visible.busy ? "Preparing receipt…" : "Export receipt as Markdown"}
      </PreferenceAction>
      <label>
        <input
          ref={inputRef}
          data-command-id="toggle-task-receipt-captured-text"
          {...auxReuseNativeCheckboxTypeProps}
          checked={include}
          onChange={toggle}
        />{" "}
        Include captured text
      </label>
      <span {...staticHintProps}>
        Exports objective, evidence summaries and sources, reviews, unresolved actions, run history and
        recorded usage. Page, document and command text is optional.
      </span>
      {visible.message && <output data-block>{visible.message}</output>}
      {visible.error && <p role="alert">{visible.error}</p>}
    </div>
  );
}
function useReceiptRecordCurrent(owner: ReceiptReadOwner, record: ReceiptEvidence) {
  return useMemo(() => {
    const evidenceId = record.evidenceId,
      source = record.source,
      snapshot = record.snapshot,
      sha256 = source.sha256;
    const cloud = source.cloudArtifacts,
      artifacts = cloud?.map((item) => ({
        item,
        id: item.artifactId,
        label: item.label,
        bytes: item.bytes,
        sha256: item.sha256,
      }));
    const snapshotTitle = snapshot?.title,
      snapshotText = snapshot?.text;
    return () =>
      owner.contains(record) &&
      record.evidenceId === evidenceId &&
      record.source === source &&
      record.snapshot === snapshot &&
      source.sha256 === sha256 &&
      snapshot?.title === snapshotTitle &&
      snapshot?.text === snapshotText &&
      source.cloudArtifacts === cloud &&
      (cloud?.length ?? 0) === (artifacts?.length ?? 0) &&
      (!artifacts ||
        artifacts.every(
          (entry, index) =>
            cloud?.[index] === entry.item &&
            entry.item.artifactId === entry.id &&
            entry.item.label === entry.label &&
            entry.item.bytes === entry.bytes &&
            entry.item.sha256 === entry.sha256,
        ));
  }, [owner, record]);
}
function ReceiptArtifactSave({
  owner,
  record,
  item,
  onError,
}: {
  owner: ReceiptReadOwner;
  record: ReceiptEvidence;
  item: ReceiptArtifact;
  onError(message: string): void;
}) {
  const scopeId = useId(),
    currentRecord = useReceiptRecordCurrent(owner, record);
  const current = useMemo(() => {
    const artifactId = item.artifactId,
      label = item.label,
      bytes = item.bytes,
      sha256 = item.sha256;
    return () =>
      currentRecord() &&
      record.source.cloudArtifacts?.includes(item) === true &&
      item.artifactId === artifactId &&
      item.label === label &&
      item.bytes === bytes &&
      item.sha256 === sha256;
  }, [currentRecord, record, item]);
  const pending = useRef<{
    owner: ReceiptReadOwner;
    item: ReceiptArtifact;
    completion: Promise<Awaited<ReturnType<typeof bridge.saveStoredArtifact>>>;
  } | null>(null);
  const [busy, setBusy] = useState<ReceiptReadOwner | null>(null);
  const save = () => {
    if (!current()) throw new Error("Choose this receipt’s original artifact.");
    if (pending.current?.owner === owner && pending.current.item === item) return pending.current.completion;
    setBusy(owner);
    const completion = guardCommandCompletion(
      (async () => bridge.saveStoredArtifact(item.artifactId, item.label))()
        .catch((reason) => {
          if (current()) onError(errorMessage(reason));
          throw reason;
        })
        .finally(() => {
          if (pending.current?.completion === completion) pending.current = null;
          if (current()) setBusy(null);
        }),
      current,
    );
    pending.current = { owner, item, completion };
    return completion;
  };
  return (
    <PreferenceAction
      {...smallButtonProps}
      command="save-task-receipt-artifact"
      scopeId={scopeId}
      disabled={busy === owner}
      invoke={save}
    >
      Save {item.label}…
    </PreferenceAction>
  );
}
function ReceiptDisclosure({
  owner,
  record,
  command,
  title,
  children,
}: {
  owner: ReceiptReadOwner;
  record: ReceiptEvidence;
  command: string;
  title: string;
  children: ReactNode;
}) {
  const scopeId = useId(),
    details = useRef<HTMLDetailsElement>(null),
    current = useReceiptRecordCurrent(owner, record);
  const [summaryRef, toggle] = usePreferenceCommand<HTMLElement>(
    command,
    scopeId,
    useCallback(() => {
      if (!current() || !details.current) throw new Error("Choose this receipt’s original evidence.");
      details.current.open = !details.current.open;
    }, [current]),
  );
  return (
    <details ref={details}>
      <summary
        ref={summaryRef}
        data-command-id={command}
        onClick={(event) => {
          event.preventDefault();
          toggle(event);
        }}
      >
        {title}
      </summary>
      {children}
    </details>
  );
}

function ReceiptEditAction({
  owner,
  valid = () => true,
  invoke,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  owner: ReceiptReadOwner;
  command: string;
  valid?: () => boolean;
  invoke(current: () => boolean): unknown;
}) {
  const scopeId = useId();
  const work = () => {
    const current = () => owner.current() && valid();
    if (!current()) throw new Error("Choose this receipt’s original action.");
    let result: Promise<unknown>;
    try {
      result = Promise.resolve(invoke(current));
    } catch (reason) {
      result = Promise.reject(reason);
    }
    return guardCommandCompletion(result, current);
  };
  return <PreferenceAction {...props} scopeId={scopeId} invoke={work} />;
}
function ReceiptChoice({
  owner,
  command,
  invoke,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "type"> & {
  owner: ReceiptReadOwner;
  command: string;
  invoke(checked: boolean): unknown;
}) {
  const scopeId = useId();
  const [ref, run] = usePreferenceCommand<HTMLInputElement>(
    command,
    scopeId,
    useCallback(
      (original, event) => {
        if (!owner.current()) throw new Error("Choose this receipt’s original choice.");
        return invoke(event ? original.checked : !original.checked);
      },
      [owner, invoke],
    ),
  );
  return (
    <input
      {...props}
      {...auxReuseNativeCheckboxTypeProps}
      ref={ref}
      data-command-id={command}
      onChange={run}
    />
  );
}
function ReceiptSelection({
  owner,
  command,
  invoke,
  ...props
}: Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> & {
  owner: ReceiptReadOwner;
  command: string;
  invoke(value: string): unknown;
}) {
  const scopeId = useId();
  const [ref, run] = usePreferenceCommand<HTMLSelectElement>(
    command,
    scopeId,
    useCallback(
      (original) => {
        if (!owner.current()) throw new Error("Choose this receipt’s original evidence.");
        if (![...original.options].some((option) => option.value === original.value && !option.disabled))
          throw new Error("Choose displayed evidence.");
        return invoke(original.value);
      },
      [owner, invoke],
    ),
  );
  return <select {...props} ref={ref} data-command-id={command} onChange={run} />;
}
