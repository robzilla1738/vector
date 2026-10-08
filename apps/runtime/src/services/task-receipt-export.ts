import { AuxError } from "@aux/contracts";
import { documentLocatorKey } from "@aux/contracts/document-intake";
import { receiptText, taskReceiptMarkdown } from "@aux/contracts/task-receipt-markdown";
import {
  TaskReceiptExportParamsSchema,
  type TaskReceiptExportParams,
  type TaskReceiptExportResult,
} from "@aux/contracts/task-receipt-export";
import type { Repo } from "../store/repo.js";
import type { ArtifactStore } from "./artifacts.js";
import type { DocumentSnapshots } from "./document-snapshots.js";
import type { TaskEvidenceService } from "./task-evidence.js";

/** Read the exact saved revision; document bodies only exist one protected segment at a time. */
export async function exportTaskReceipt(
  services: {
    repo: Repo;
    evidence: TaskEvidenceService;
    documents: DocumentSnapshots;
    artifacts: ArtifactStore;
  },
  input: TaskReceiptExportParams,
  context: { token: string; signal: AbortSignal },
): Promise<TaskReceiptExportResult> {
  const p = TaskReceiptExportParamsSchema.parse(input);
  const { repo, evidence, documents, artifacts } = services;
  if (p.action === "retire") {
    await artifacts.exports.retire(p.exportId, context.token);
    return { status: "retired", exportId: p.exportId };
  }
  const receipt = evidence.receipt(p.taskId, p.expectedRevision);
  const taskQuery = repo.db.prepare("SELECT json FROM tasks WHERE task_id=?");
  const revisionQuery = repo.db.prepare("SELECT json FROM task_revisions WHERE task_id=? AND revision=?");
  const evidenceQuery = repo.db.prepare(
    "SELECT seq,json FROM task_evidence WHERE task_id=? AND task_revision=? AND evidence_id=?",
  );
  const taskStamp = (taskQuery.get(p.taskId) as { json: string } | undefined)?.json;
  const revisionStamp = (revisionQuery.get(p.taskId, p.expectedRevision) as { json: string } | undefined)
    ?.json;
  if (!taskStamp || !revisionStamp)
    throw new AuxError("ref_stale", "The original task revision was removed.");
  const records = receipt.criteria.flatMap((criterion) =>
    criterion.evidence.map(({ record }) => {
      const row = evidenceQuery.get(p.taskId, p.expectedRevision, record.evidenceId) as
        { seq: number; json: string } | undefined;
      if (!row) throw new AuxError("ref_stale", "The original task evidence was removed.");
      return { record, stamp: row };
    }),
  );
  const checkTask = () => {
    if (
      (taskQuery.get(p.taskId) as { json: string } | undefined)?.json !== taskStamp ||
      (revisionQuery.get(p.taskId, p.expectedRevision) as { json: string } | undefined)?.json !==
        revisionStamp
    )
      throw new AuxError("ref_stale", "The task changed during export. Review its receipt and export again.");
  };
  const checkEvidence = ({ record, stamp }: (typeof records)[number]) => {
    checkTask();
    const row = evidenceQuery.get(p.taskId, p.expectedRevision, record.evidenceId) as
      { seq: number; json: string } | undefined;
    if (row?.seq !== stamp.seq || row.json !== stamp.json)
      throw new AuxError(
        "ref_stale",
        "The saved evidence changed during export. Review its receipt and export again.",
      );
  };
  const checkAll = () => {
    checkTask();
    for (const item of records) {
      checkEvidence(item);
      if (item.record.document)
        documents.metadata(
          { kind: "task", ownerId: p.taskId, documentId: item.record.evidenceId },
          item.record.document.sha256,
        );
    }
  };
  return artifacts.exports.prepare({
    exportId: p.exportId,
    token: context.token,
    filename: `aux-task-${p.taskId.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 80)}-r${p.expectedRevision}.md`,
    signal: context.signal,
    checkCurrent: checkTask,
    checkComplete: checkAll,
    chunks: async function* (signal) {
      yield taskReceiptMarkdown(receipt, p.includeCapturedText);
      if (!p.includeCapturedText) return;
      const captured = records.filter((item) => item.record.document);
      if (!captured.length) return;
      yield "\n## Document snapshots\n\nThe following located text is the complete saved extraction, not the original binary file.\n";
      for (const item of captured) {
        const { record } = item;
        const snapshot = record.document!;
        checkEvidence(item);
        yield `\n### Evidence ${receiptText(record.evidenceId)} — ${receiptText(snapshot.document.filename)}\n\nSnapshot SHA-256: ${snapshot.sha256}\n`;
        for await (const segment of documents.segments(
          { kind: "task", ownerId: p.taskId, documentId: record.evidenceId },
          snapshot.sha256,
          signal,
          () => checkEvidence(item),
        )) {
          yield `\nLocation: ${documentLocatorKey(segment.locator)}\n\n${receiptText(segment.text)}\n`;
        }
      }
    },
  });
}
