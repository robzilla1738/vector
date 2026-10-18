import { setImmediate } from "node:timers/promises";
import { documentOriginalFence } from "./document-originals.js";
import { createHash } from "node:crypto";
import { open } from "node:fs/promises";
import {
  AuxError,
  TaskEvidenceSchema,
  type Run,
  type AttachmentReference,
  type TaskDocumentReference,
} from "@aux/contracts";
import { DOCUMENT_JOB_SOURCE_LIMIT, type PdfSource } from "@aux/contracts/document-jobs";
import type { Repo } from "../store/repo.js";
import type { DocumentSnapshots, DocumentOwner } from "./document-snapshots.js";
import type { ConversationDocuments } from "./conversation-documents.js";

export type AdmittedPdfSource = {
  source: PdfSource;
  bytes: Buffer;
  sha256: string;
  mediaType: "application/pdf";
  snapshotSha256?: string;
};
export type PdfSourceDependencies = {
  repo: Repo;
  documents: DocumentSnapshots;
  attachments: ConversationDocuments;
};

function selectedDocument(
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
      throw new AuxError("permission_denied", "Choose a PDF attachment admitted to this original turn.");
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
        throw new AuxError("ref_stale", "The original PDF attachment selection retired.");
      const record = deps.attachments.referenceMetadata(selected);
      if (record.removed || !record.included)
        throw new AuxError("ref_stale", "The original PDF attachment was removed or deselected.");
    };
  } else {
    const matches = (owner.run.config?.contextTaskDocumentRefs ?? []).filter(
      (item) => item.evidenceId === input.evidenceId,
    );
    if (matches.length !== 1)
      throw new AuxError(
        "permission_denied",
        "Choose current PDF evidence admitted with this task revision.",
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
        throw new AuxError("ref_stale", "The admitted task PDF evidence was removed or changed.");
    };
  }
  return { reference, documentOwner, assertSource };
}

/** Only a selected immutable reference or a run-owned artifact grants PDF bytes. */
export async function withPdfSources<T>(
  deps: PdfSourceDependencies,
  requested: readonly PdfSource[],
  owner: { run: Run; signal: AbortSignal; checkCurrent(): void },
  use: (sources: AdmittedPdfSource[], signal: AbortSignal, checkCurrent: () => void) => Promise<T>,
): Promise<T> {
  const sources: AdmittedPdfSource[] = [];
  let total = 0;
  const reserve = (size: number) => {
    if (!size || total + size > DOCUMENT_JOB_SOURCE_LIMIT)
      throw new AuxError("invalid_params", "Combined PDF originals must be at most 64 MB.");
    total += size;
  };
  const read = async (index: number, signal: AbortSignal, checkCurrent: () => void): Promise<T> => {
    signal.throwIfAborted();
    checkCurrent();
    const input = requested[index];
    if (!input) return use(sources, signal, checkCurrent);
    if (input.kind === "artifact") {
      const artifact = deps.repo.getArtifact(input.artifactId);
      const identity = JSON.stringify(artifact);
      if (
        !artifact ||
        artifact.status !== "complete" ||
        artifact.mediaType !== "application/pdf" ||
        (artifact.runId !== owner.run.runId &&
          !owner.run.config?.contextArtifactIds?.includes(input.artifactId))
      )
        throw new AuxError("permission_denied", "Choose a PDF already admitted to this original run.");
      const check = () => {
        signal.throwIfAborted();
        checkCurrent();
        const run = deps.repo.getRun(owner.run.runId);
        if (
          !artifact ||
          artifact.status !== "complete" ||
          artifact.mediaType !== "application/pdf" ||
          JSON.stringify(deps.repo.getArtifact(input.artifactId)) !== identity ||
          (artifact.runId !== owner.run.runId && !run?.config?.contextArtifactIds?.includes(input.artifactId))
        )
          throw new AuxError("ref_stale", "The selected original PDF artifact is no longer admitted.");
      };
      check();
      reserve(artifact!.size);
      const file = await open(artifact!.path, "r");
      const bytes = Buffer.alloc(artifact!.size);
      try {
        const before = await file.stat();
        if (!before.isFile() || before.size !== bytes.length)
          throw new AuxError("ref_stale", "The original PDF file size changed.");
        let offset = 0;
        while (offset < bytes.length) {
          check();
          const result = await file.read(bytes, offset, Math.min(256 * 1024, bytes.length - offset), offset);
          if (!result.bytesRead) throw new AuxError("ref_stale", "Original PDF bytes are incomplete.");
          offset += result.bytesRead;
        }
        const after = await file.stat();
        if (
          after.size !== before.size ||
          after.mtimeMs !== before.mtimeMs ||
          after.ctimeMs !== before.ctimeMs
        )
          throw new AuxError("ref_stale", "The original PDF changed during admission.");
        check();
        if (!bytes.subarray(0, 1024).includes(Buffer.from("%PDF-")))
          throw new AuxError("invalid_params", "The admitted PDF has invalid MIME bytes.");
        sources.push({
          source: input,
          bytes,
          sha256: createHash("sha256").update(bytes).digest("hex"),
          mediaType: "application/pdf",
        });
        return await read(index + 1, signal, check);
      } finally {
        await file.close();
        bytes.fill(0);
      }
    }
    const { reference, documentOwner, assertSource } = selectedDocument(deps, input, owner, checkCurrent);
    assertSource();
    const snapshot = deps.documents.metadata(documentOwner, reference.sha256);
    if (snapshot.document.format !== "pdf")
      throw new AuxError("invalid_params", "PDF operations require original PDF bytes.");
    reserve(snapshot.document.sourceBytes);
    return deps.documents.useOriginal(
      documentOwner,
      reference.sha256,
      signal,
      assertSource,
      async (bytes, sourceSignal, checkSource) => {
        if (!bytes.subarray(0, 1024).includes(Buffer.from("%PDF-")))
          throw new AuxError("invalid_params", "The selected document has invalid PDF MIME bytes.");
        sources.push({
          source: input,
          bytes,
          sha256: snapshot.document.sourceSha256,
          snapshotSha256: snapshot.sha256,
          mediaType: "application/pdf",
        });
        return read(index + 1, sourceSignal, checkSource);
      },
    );
  };
  return read(0, owner.signal, owner.checkCurrent);
}

export async function listPdfSources(
  deps: PdfSourceDependencies,
  input: { offset?: number; limit?: number },
  owner: { run: Run; signal: AbortSignal; checkCurrent(): void },
) {
  const offset = input.offset ?? 0,
    limit = input.limit ?? 20;
  if (
    !Number.isSafeInteger(offset) ||
    offset < 0 ||
    offset > 10_000 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 50
  )
    throw new AuxError("invalid_params", "Use a bounded PDF source inventory page.");
  const check = () => {
    owner.signal.throwIfAborted();
    owner.checkCurrent();
  };
  check();
  const artifactIds = new Set([
    ...deps.repo
      .listArtifacts({ runId: owner.run.runId })
      .filter((item) => item.mediaType === "application/pdf")
      .map((item) => item.artifactId),
    ...(owner.run.config?.contextArtifactIds ?? []).filter(
      (id) => deps.repo.getArtifact(id)?.mediaType === "application/pdf",
    ),
  ]);
  const candidates: PdfSource[] = [
    ...[...artifactIds].map((artifactId) => ({ kind: "artifact" as const, artifactId })),
    ...(owner.run.config?.contextAttachmentRefs ?? []).map((item) => ({
      kind: "attachment" as const,
      attachmentId: item.attachmentId,
    })),
    ...(owner.run.config?.contextTaskDocumentRefs ?? []).map((item) => ({
      kind: "task_document" as const,
      evidenceId: item.evidenceId,
    })),
  ];
  const entries: {
    source: PdfSource;
    status: "available" | "unavailable";
    filename?: string;
    size?: number;
    sha256?: string;
    reason?: string;
  }[] = [];
  const fences: (() => void)[] = [];
  for (const source of candidates.slice(offset, offset + limit)) {
    check();
    try {
      if (source.kind === "artifact") {
        const artifact = deps.repo.getArtifact(source.artifactId);
        if (!artifact || artifact.status !== "complete")
          throw new AuxError("ref_stale", "Original PDF artifact is unavailable.");
        const identity = JSON.stringify(artifact);
        const assertArtifact = () => {
          check();
          const current = deps.repo.getRun(owner.run.runId);
          if (
            JSON.stringify(deps.repo.getArtifact(source.artifactId)) !== identity ||
            (artifact.runId !== owner.run.runId &&
              !current?.config?.contextArtifactIds?.includes(source.artifactId))
          )
            throw new AuxError("ref_stale", "The original PDF artifact selection retired.");
        };
        assertArtifact();
        fences.push(assertArtifact);
        entries.push({
          source,
          status: "available",
          filename: artifact.path.split(/[\\/]/).at(-1),
          size: artifact.size,
        });
      } else {
        const { reference, documentOwner, assertSource } = selectedDocument(deps, source, owner, check);
        assertSource();
        const snapshot = deps.documents.metadata(documentOwner, reference.sha256);
        if (snapshot.document.format !== "pdf") continue;
        if (!snapshot.original)
          throw new AuxError(
            "capability_unsupported",
            "Attach the original PDF again; this import retained text only.",
          );
        const fence = documentOriginalFence(deps.repo, snapshot);
        fence();
        fences.push(() => {
          assertSource();
          deps.documents.metadata(documentOwner, reference.sha256);
          fence();
        });
        entries.push({
          source,
          status: "available",
          filename: snapshot.document.filename,
          size: snapshot.document.sourceBytes,
          sha256: snapshot.document.sourceSha256,
        });
      }
    } catch (error) {
      if (!(
        error instanceof AuxError &&
        ["ref_stale", "not_found", "permission_denied", "capability_unsupported"].includes(error.code)
      ))
        throw error;
      entries.push({ source, status: "unavailable", reason: error.message });
    }
    if (entries.length % 8 === 0) await setImmediate();
  }
  check();
  for (const fence of fences) fence();
  return {
    sources: entries,
    total: candidates.length,
    ...(offset + limit < candidates.length ? { nextOffset: offset + limit } : {}),
  };
}
