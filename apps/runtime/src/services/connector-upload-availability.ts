import type { ConnectorFileSource } from "@aux/contracts/connector-file-upload";
import type { ConnectorUploadOwner } from "./connector-file-transfers.js";
import type { OutboundMcpService } from "./outbound-mcp.js";
import type { PdfSourceDependencies } from "./pdf-sources.js";
import { documentOriginalFence } from "./document-originals.js";
import { fileUploadCapability } from "./connector-file-capability.js";
import { CONNECTOR_UPLOAD_MAX_BYTES } from "./connector-upload-sources.js";
import { selectedDocument } from "./selected-document-source.js";

/** Publish from validated cached catalog metadata without transport or credential reads. */
export async function connectorUploadAvailable(
  deps: PdfSourceDependencies & {
    mcp: OutboundMcpService;
    owner(runId: string): ConnectorUploadOwner;
    checkConnector(runId: string, serverId: string, toolName: string): void;
  },
  input: { runId: string; signal: AbortSignal; checkOwner(): void },
): Promise<boolean> {
  input.checkOwner();
  const owner = deps.owner(input.runId);
  const checkOwner = () => {
    input.signal.throwIfAborted();
    owner.checkCurrent();
    input.checkOwner();
  };
  let assertOriginal: (() => void) | undefined;
  const check = () => {
    checkOwner();
    assertOriginal?.();
  };
  check();
  const refs: ConnectorFileSource[] = [
    ...(owner.run.config?.contextAttachmentRefs ?? []).map((ref) => ({
      kind: "attachment" as const,
      attachmentId: ref.attachmentId,
    })),
    ...(owner.run.config?.contextTaskDocumentRefs ?? []).map((ref) => ({
      kind: "task_document" as const,
      evidenceId: ref.evidenceId,
    })),
  ];
  let hasOriginal = false;
  for (const ref of refs) {
    try {
      const source = selectedDocument(deps, ref, owner, checkOwner);
      source.assertSource();
      const snapshot = deps.documents.metadata(source.documentOwner, source.reference.sha256);
      const metadata = snapshot.document;
      if (
        snapshot.original &&
        (metadata.format === "pdf" || metadata.format === "docx") &&
        metadata.sourceBytes &&
        metadata.sourceBytes <= CONNECTOR_UPLOAD_MAX_BYTES &&
        metadata.sourceSha256
      ) {
        const originalFence = documentOriginalFence(deps.repo, snapshot);
        originalFence();
        hasOriginal = true;
        assertOriginal = () => {
          source.assertSource();
          deps.documents.metadata(source.documentOwner, source.reference.sha256);
          originalFence();
        };
        break;
      }
    } catch {
      check();
    }
  }
  if (!hasOriginal) return false;
  for (const mention of owner.run.config?.mentions ?? []) {
    if (mention.kind !== "connector" || !mention.connectorId.startsWith("mcp:")) continue;
    const serverId = mention.connectorId.slice(4);
    try {
      check();
      const server = deps.mcp.get(serverId);
      const capability = fileUploadCapability(server);
      if (!capability) continue;
      deps.checkConnector(input.runId, serverId, capability.allocationTool);
      if (capability.completionTool) deps.checkConnector(input.runId, serverId, capability.completionTool);
      check();
      return true;
    } catch {
      check();
    }
  }
  return false;
}
