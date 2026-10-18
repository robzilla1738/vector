import { createHash } from "node:crypto";
import { AuxError, type Run } from "@aux/contracts";
import type { ConnectorFileSource, ConnectorFileTransferRecord } from "@aux/contracts/connector-file-upload";
import type { PdfSourceDependencies } from "./pdf-sources.js";
import { selectedDocument } from "./selected-document-source.js";
export const CONNECTOR_UPLOAD_MAX_BYTES = 20 * 1024 * 1024;
export type ConnectorUploadSource = ConnectorFileTransferRecord["source"];
/** Only captured selected originals can supply bytes; generic/ancestry-unknown artifact IDs cannot. */
export async function withConnectorUploadSource<T>(
  deps: PdfSourceDependencies,
  input: { reference: ConnectorFileSource; expected?: ConnectorUploadSource },
  owner: { run: Run; signal: AbortSignal; checkCurrent(): void },
  use: (
    source: ConnectorUploadSource,
    bytes: Buffer,
    signal: AbortSignal,
    checkCurrent: () => void,
  ) => Promise<T>,
): Promise<T> {
  const check = () => {
    owner.signal.throwIfAborted();
    owner.checkCurrent();
    const run = deps.repo.getRun(owner.run.runId);
    if (!run || run.config?.contextMemoryRevoked || run.config?.desktopContextRetired)
      throw new AuxError("permission_denied", "The original upload source was removed or forgotten.");
  };
  const { reference, documentOwner, assertSource } = selectedDocument(deps, input.reference, owner, check);
  assertSource();
  const snapshot = deps.documents.metadata(documentOwner, reference.sha256);
  const format = snapshot.document.format;
  if (format !== "pdf" && format !== "docx")
    throw new AuxError("capability_unsupported", "Attach an original PDF or DOCX to upload local bytes.");
  if (!snapshot.document.sourceBytes || snapshot.document.sourceBytes > CONNECTOR_UPLOAD_MAX_BYTES)
    throw new AuxError("invalid_params", "Connector uploads require an original of at most 20 MiB.");
  const source: ConnectorUploadSource = {
    reference: input.reference,
    sha256: snapshot.document.sourceSha256,
    size: snapshot.document.sourceBytes,
    mediaType:
      format === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    filename: snapshot.document.filename.replace(/[\p{Cc}\p{Cf}]/gu, "").slice(0, 180),
    sourceIdentity: JSON.stringify([reference, documentOwner, snapshot]),
  };
  if (input.expected && JSON.stringify(input.expected) !== JSON.stringify(source))
    throw new AuxError("ref_stale", "The sealed upload source or selected revision changed.");
  return deps.documents.useOriginal(
    documentOwner,
    reference.sha256,
    owner.signal,
    assertSource,
    async (bytes, signal, current) => {
      current();
      if (
        bytes.length !== source.size ||
        createHash("sha256").update(bytes).digest("hex") !== source.sha256 ||
        (format === "pdf"
          ? !bytes.subarray(0, 1024).includes(Buffer.from("%PDF-"))
          : !bytes.subarray(0, 4).equals(Buffer.from([80, 75, 3, 4])))
      )
        throw new AuxError(
          "ref_stale",
          "The original document bytes or MIME no longer match the admitted snapshot.",
        );
      return use(source, bytes, signal, current);
    },
  );
}
