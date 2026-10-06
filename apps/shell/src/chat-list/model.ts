import type { ConversationSummary, Run } from "@aux/contracts";

/** Local runs retain their own shape and never pretend to be saved chat summaries. */
export type LocalChatEntry = { kind: "local-run"; run: Run };
export type SavedChatEntry = { kind: "saved-chat"; item: ConversationSummary };
export type ChatEntry = LocalChatEntry | SavedChatEntry;
export const chatId = (entry: ChatEntry) =>
  entry.kind === "saved-chat" ? entry.item.chatId : (entry.run.config?.chatId ?? entry.run.runId);
export const latestRun = (entry: ChatEntry) =>
  entry.kind === "saved-chat" ? entry.item.latestRun : entry.run;
export const chatTitle = (entry: ChatEntry) =>
  entry.kind === "saved-chat" ? entry.item.title || "New chat" : entry.run.goal;
