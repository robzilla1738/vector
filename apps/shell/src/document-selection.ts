import { bridge } from "./bridge";
import { errorMessage } from "./error-message";

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
  async read(index: number) {
    if (this.closed) throw new Error("cancelled: This document selection was closed.");
    const file = await bridge.readEvidenceDocument(this.selection.selectionId, index);
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
