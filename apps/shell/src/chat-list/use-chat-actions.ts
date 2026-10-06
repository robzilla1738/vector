import { useRef, useState } from "react";
import type { ConversationSummary } from "@aux/contracts";
import { call, useStore } from "../store";
import { moveChatToFolder } from "../chat-folders";
import { errorMessage } from "../error-message";
import type { ConversationCollection } from "./collection";

/** All chat surfaces share mutation admission and local cleanup after server ACK. */
export function useChatActions(collection: ConversationCollection) {
  const pending = useRef(new Set<ConversationCollection>());
  const [busyOwner, setBusyOwner] = useState<ConversationCollection | null>(null);
  const busy = busyOwner === collection;
  const [failure, setFailure] = useState<{ collection: ConversationCollection; message: string } | null>(
    null,
  );
  const error = failure?.collection === collection ? failure.message : "";
  async function perform(action: "rename" | "archive" | "delete", item: ConversationSummary, title?: string) {
    if (pending.current.has(collection) || !collection.current()) return false;
    pending.current.add(collection);
    setBusyOwner(collection);
    setFailure(null);
    collection.invalidate();
    try {
      if (action === "rename") {
        const changed = await call("conversations.rename", {
          chatId: item.chatId,
          title: title?.trim() ?? item.title,
        });
        if (!collection.current()) return false;
        collection.invalidate();
        collection.update(changed);
      } else if (action === "archive") {
        const changed = await call("conversations.archive", {
          chatId: item.chatId,
          archived: !item.archived,
        });
        if (!collection.current()) return false;
        collection.invalidate();
        useStore.setState((state) => ({
          runs: changed.archived
            ? state.runs.filter((run) => (run.config?.chatId ?? run.runId) !== item.chatId)
            : state.runs.some((run) => run.runId === changed.latestRun.runId)
              ? state.runs
              : [changed.latestRun, ...state.runs],
        }));
        collection.remove(item.chatId);
      } else {
        await call("conversations.delete", { chatId: item.chatId });
        if (!collection.current()) return false;
        collection.invalidate();
        const store = useStore.getState();
        store.setConversationDraft(item.chatId, "");
        store.setConversationContext(item.chatId, "");
        store.setConversationBrowserSources(item.chatId, []);
        try {
          localStorage.removeItem(`aux.pending-queue-message.v1:${item.chatId}`);
          moveChatToFolder(localStorage, item.chatId, "");
          window.dispatchEvent(new Event("aux-chat-folders"));
        } catch {
          /* Profile storage is optional; deletion is already acknowledged. */
        }
        useStore.setState((state) => ({
          runs: state.runs.filter((run) => (run.config?.chatId ?? run.runId) !== item.chatId),
        }));
        collection.remove(item.chatId);
      }
      return true;
    } catch (reason) {
      if (collection.current()) setFailure({ collection, message: errorMessage(reason) });
      return false;
    } finally {
      pending.current.delete(collection);
      setBusyOwner((current) => (current === collection ? null : current));
    }
  }
  return { busy, error, dismissError: () => setFailure(null), perform };
}
