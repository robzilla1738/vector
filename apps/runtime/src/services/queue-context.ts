import { createHash } from "node:crypto";
import type { Run, QueuedContext } from "@aux/contracts";

/** These fields bind the exact original source, separate from changing usage/progress. */
export function queuedSourceHash(run: Run): string {
  const c = run.config ?? {};
  const source: unknown[] = [
    run.runId,
    run.goal,
    c.chatId,
    c.messageRevision ?? 0,
    c.nativeTurnContext,
    c.taskId,
    c.taskRevision,
    c.modelId,
    c.reasoning,
    c.privateTask,
    c.executionTarget,
    c.context,
    c.instructions,
    c.contextRunIds,
    c.contextAttachmentRefs,
    c.contextImageArtifactIds,
    c.contextArtifactIds,
    c.contextSourceArtifactIds,
    c.contextArtifactEvidence,
    c.contextDocumentEvidence,
    c.contextMemoryRefs,
    c.contextMemoryRevoked,
    c.contextWorkspaceId,
    c.contextWorkspaceRevision,
    c.contextBrowsingMemory,
    c.branchSourceRunIds,
  ];
  if (c.contextTaskDocumentRefs?.length) source.push(c.contextTaskDocumentRefs);
  return createHash("sha256").update(JSON.stringify(source)).digest("hex");
}

export function captureQueuedContext(run: Run): QueuedContext {
  const c = run.config ?? {};
  return {
    chatId: c.chatId!,
    targetRunId: run.runId,
    targetMessageRevision: c.messageRevision ?? 0,
    sourceHash: queuedSourceHash(run),
    attachmentRefs: structuredClone(c.contextAttachmentRefs ?? []),
    imageArtifactIds: [...(c.contextImageArtifactIds ?? [])],
    memoryRefs: structuredClone(c.contextMemoryRefs ?? []),
    workspaceId: c.contextWorkspaceId,
    workspaceRevision: c.contextWorkspaceRevision,
  };
}
