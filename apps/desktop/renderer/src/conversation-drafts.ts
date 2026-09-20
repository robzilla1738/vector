/** Drafts belong to durable chat IDs, including the run ID of legacy chats. */
export const DRAFTS_KEY = "aux.conversation-drafts.v1";
export const CONTEXTS_KEY = "aux.conversation-contexts.v1";
export const NEW_DRAFT_KEY = "new";
export const PENDING_CHAT_KEY = "aux.pending-conversation.v1";
export const draftKey = (id: string) => `chat:${id}`;
export function readPendingConversation(storage: Pick<Storage, "getItem"> | null): string | null {
  const value = storage?.getItem(PENDING_CHAT_KEY) ?? "";
  return value.length > 0 && value.length <= 200 && !/[\s/\\]/.test(value) ? value : null;
}
export function readConversationDrafts(storage: Pick<Storage, "getItem"> | null): Record<string, string> {
  try {
    const value: unknown = JSON.parse(storage?.getItem(DRAFTS_KEY) ?? "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([key, draft]) => (key === NEW_DRAFT_KEY || key.startsWith("chat:")) && typeof draft === "string"));
  } catch { return {}; }
}
export function readConversationContexts(storage: Pick<Storage, "getItem"> | null): Record<string, string> {
  try {
    const value: unknown = JSON.parse(storage?.getItem(CONTEXTS_KEY) ?? "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([key, pageId]) => (key === "new" || key.startsWith("chat:")) && typeof pageId === "string" && pageId.length <= 200));
  } catch { return {}; }
}
