import {
  AuxError,
  TaskEvidenceSchema,
  type Run,
  type AttachmentReference,
  type TaskDocumentReference,
} from "@aux/contracts";
import type { PdfSource } from "@aux/contracts/document-jobs";
import type { PdfSourceDependencies } from "./pdf-sources.js";
import type { DocumentOwner } from "./document-snapshots.js";

export function selectedDocument(
  deps: PdfSourceDependencies,
  input: Exclude<PdfSource, { kind: "artifact" }>,
  owner: { run: Run },
  checkCurrent: () => void,
) {
  let reference: AttachmentReference | TaskDocumentReference;
  let documentOwner: DocumentOwner;
  let assertSource: () => void;
  if (input.kind === "attachment") {
    const matches = (owner.run.config?.contextAttachmentRefs ?? []).filter(
      (item) => item.attachmentId === input.attachmentId,
    );
    if (matches.length !== 1)
      throw new AuxError("permission_denied", "Choose a document attachment admitted to this original turn.");
    const selected = matches[0]!;
    reference = selected;
    documentOwner = { kind: "conversation", ownerId: selected.chatId, documentId: selected.attachmentId };
    assertSource = () => {
      checkCurrent();
      if (
        !deps.repo
          .getRun(owner.run.runId)
          ?.config?.contextAttachmentRefs?.some((item) => JSON.stringify(item) === JSON.stringify(selected))
      )
        throw new AuxError("ref_stale", "The original document attachment selection retired.");
      const record = deps.attachments.referenceMetadata(selected);
      if (record.removed || !record.included)
        throw new AuxError("ref_stale", "The original document attachment was removed or deselected.");
    };
  } else {
    const matches = (owner.run.config?.contextTaskDocumentRefs ?? []).filter(
      (item) => item.evidenceId === input.evidenceId,
    );
    if (matches.length !== 1)
      throw new AuxError(
        "permission_denied",
        "Choose current document evidence admitted with this task revision.",
      );
    const selected = matches[0]!;
    reference = selected;
    documentOwner = { kind: "task", ownerId: selected.taskId, documentId: selected.evidenceId };
    assertSource = () => {
      checkCurrent();
      const current = deps.repo.getRun(owner.run.runId);
      const task = deps.repo.db
        .prepare("SELECT revision,state FROM tasks WHERE task_id=?")
        .get(selected.taskId) as { revision: number; state: string } | undefined;
      if (
        current?.config?.taskId !== selected.taskId ||
        current.config.taskRevision !== selected.taskRevision ||
        task?.state !== "open" ||
        task.revision !== selected.taskRevision ||
        !current.config.contextTaskDocumentRefs?.some(
          (item) => JSON.stringify(item) === JSON.stringify(selected),
        )
      )
        throw new AuxError("ref_stale", "The admitted task document revision or authority retired.");
      const row = deps.repo.db
        .prepare("SELECT seq,json FROM task_evidence WHERE evidence_id=? AND task_id=? AND task_revision=?")
        .get(selected.evidenceId, selected.taskId, selected.taskRevision) as
        { seq: number; json: string } | undefined;
      const evidence =
        row &&
        TaskEvidenceSchema.parse(
          JSON.parse(deps.repo.revealRecordField("task_evidence", [row.seq], "json", row.json)),
        );
      if (evidence?.kind !== "document_snapshot" || evidence.document?.sha256 !== selected.sha256)
        throw new AuxError("ref_stale", "The admitted task document evidence was removed or changed.");
    };
  }
  return { reference, documentOwner, assertSource };
}
