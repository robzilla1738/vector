import { AuxError } from "@aux/contracts";
import type { DocumentImportParams } from "@aux/contracts/document-intake";
import type { DocumentSource } from "../../services/document-snapshots.js";
import type { MethodCtx } from "./context.js";

/** The native host resolves this opaque token to the original Profile, window and WebUI document. */
export async function nativeDocumentSource(
  ctx: MethodCtx,
  input: DocumentImportParams,
): Promise<{
  source: DocumentSource;
  context: { signal: AbortSignal };
}> {
  const token = ctx.client.nativeTurnContext;
  if (ctx.client.external || ctx.client.codeMode || !token)
    throw new AuxError("permission_denied", "Import documents from their original Aux window.");
  const native = ctx.s.native;
  if (!native?.evidenceDocumentRead || !native.evidenceDocumentsRelease)
    throw new AuxError("backend_unavailable", "Native document intake is unavailable.");
  const read = native.evidenceDocumentRead.bind(native);
  const { selectionId, index } = input;
  const methods = (await native.capabilities?.())?.methods ?? [];
  return {
    source: {
      read: (cursor, signal) => read({ token, selectionId, index, ...(cursor ? { cursor } : {}) }, signal),
      ...(native.evidenceDocumentBytes && methods.includes("native.evidenceDocumentBytes")
        ? {
            original: {
              kind: "capture" as const,
              read: (offset: number, signal: AbortSignal) =>
                native.evidenceDocumentBytes!(
                  {
                    token,
                    selectionId,
                    index,
                    snapshotId: input.snapshotId,
                    sourceSha256: input.sourceSha256,
                    offset,
                  },
                  signal,
                ),
            },
          }
        : {}),
    },
    // Native extraction ends at60s, its read settles by65s and the caller waits80s.
    // The shared snapshot store also joins shutdown/deletion cancellation before publication.
    context: { signal: AbortSignal.timeout(75_000) },
  };
}
