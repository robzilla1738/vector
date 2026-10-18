import type { ConversationSummary, Run } from "@aux/contracts";

/** Admission recipes belong only to encrypted run storage, never API or event payloads. */
export function presentRun(run: Run): Run {
  if (!run.config) return { ...run };
  const {
    documentAdmissions: _admissions,
    contextCompaction: _context,
    queuedMessageContexts: _queued,
    ...config
  } = run.config;
  return { ...run, config };
}

export function presentConversation(conversation: ConversationSummary): ConversationSummary {
  return { ...conversation, latestRun: presentRun(conversation.latestRun) };
}
