import type { Run } from "@aux/contracts";
import { contextAuthorityHash } from "./compaction.js";

/** Shared by a running turn, an idle summary and later inheritance of that summary. */
export function conversationContextAuthority(
  config: Run["config"],
  selectedModel: string,
  connectionAuthority: unknown,
  conversationSpace: unknown,
  limits: unknown,
): string {
  return contextAuthorityHash({
    ...config,
    contextCompaction: undefined,
    documentAdmissions: undefined,
    waitingPhrase: undefined,
    queuedMessageContexts: undefined,
    selectedModel,
    connectionAuthority,
    conversationSpace,
    limits,
  });
}
