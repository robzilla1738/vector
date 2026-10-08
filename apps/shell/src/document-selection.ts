import { bridge } from "./bridge";
import { errorMessage } from "./error-message";
import type { DocumentUnreadableReason } from "@aux/contracts/document-intake";

type DocumentSelection = NonNullable<Awaited<ReturnType<typeof bridge.pickEvidenceDocuments>>>;

/** The selection holds native file references, never a collection of file bodies. */
export class SelectedDocuments {
  private closed = false;
  constructor(readonly selection: DocumentSelection) {}
  get count() {
    return this.selection.count;
  }
  get released() {
    return this.closed;
  }
  async read(index: number, cursor?: string) {
    if (this.closed) throw new Error("cancelled: This document selection was closed.");
    const file = await (cursor === undefined
      ? bridge.readEvidenceDocument(this.selection.selectionId, index)
      : bridge.readEvidenceDocument(this.selection.selectionId, index, cursor));
    if (this.closed) throw new Error("cancelled: This document selection was closed.");
    return file;
  }
  async release() {
    if (this.closed) return;
    this.closed = true;
    // Closing the native window or replacing the selection can retire it first.
    await bridge.releaseEvidenceDocuments(this.selection.selectionId).catch(() => {});
  }
}

export function isFileLocalDocumentError(reason: unknown): boolean {
  const code = (reason as { code?: unknown } | null)?.code;
  const nativeCode = typeof code === "string" ? code : errorMessage(reason).split(":", 1)[0];
  return nativeCode === "invalid_argument" || nativeCode === "invalid_params" || nativeCode === "io_error";
}

export function documentReadFailure(reason: DocumentUnreadableReason): string {
  const messages: Record<DocumentUnreadableReason, string> = {
    unsupported_format: "Choose a UTF-8 text, PDF, or Word (.docx) document.",
    encrypted: "This document is encrypted. Save an unencrypted copy and try again.",
    no_text: "No selectable text was found. Use a text or OCR copy of this document.",
    invalid_document: "This document could not be read. Try exporting a fresh copy.",
    source_limit: "This file exceeds the 64 MiB document limit. Split it into smaller files.",
    text_limit: "Extracted text exceeds 16 MiB. Split the document into smaller files.",
    structure_limit: "This document is too complex to extract. Export a simpler text copy.",
    timeout: "Text extraction took too long. Try a smaller document or a text copy.",
    io_error: "This file could not be read. Check that it is still available and try again.",
    extractor_unavailable: "Document extraction is unavailable. Restart Aux and try again.",
  };
  return messages[reason];
}
