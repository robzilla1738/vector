import type { MentionRef } from "@aux/contracts";
import { editMentionDraft, mentionRefs, type MentionDraft } from "./tokens";
const drafts = new Map<string, MentionDraft>();
export function readMentionDraft(id: string, text: string): MentionDraft {
  const current = drafts.get(id) ?? { text, tokens: [] };
  const next = editMentionDraft(current, text);
  drafts.set(id, next);
  return next;
}
export function writeMentionDraft(id: string, draft: MentionDraft) {
  drafts.set(id, draft);
}
export async function submittedMentions(id: string, text: string): Promise<MentionRef[]> {
  const refs = mentionRefs(readMentionDraft(id, text));
  const { MentionRefsSchema } = await import("@aux/contracts");
  return MentionRefsSchema.parse(refs);
}
export function clearMentionDraft(id: string) {
  drafts.delete(id);
}
export const mentionComposerId = (chatId?: string | null, answerRunId?: string) =>
  answerRunId ? `answer:${answerRunId}` : chatId ? `chat:${chatId}` : "new-chat";
