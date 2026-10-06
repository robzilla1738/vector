import { useEffect } from "react";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { runAnswerEntry } from "../run-answer-drafts";
import { conversationEntryChange, applyConversationStorageChange } from "../conversation-drafts";
import { browserSourcesEntryChange } from "../browser-context-sources";

export function useDraftStorageSync() {
  useEffect(() => {
    if (bridge.privateMode) return;
    const changed = (event: StorageEvent) => {
      if (
        event.storageArea !== localStorage ||
        !event.key ||
        localStorage.getItem(event.key) !== event.newValue
      )
        return;
      const answer = runAnswerEntry(event.key, event.newValue);
      if (answer) {
        useStore.setState((state) => {
          const drafts = { ...state.runAnswerDrafts };
          if (answer.draft) drafts[answer.runId] = answer.draft;
          else delete drafts[answer.runId];
          return { runAnswerDrafts: drafts };
        });
        return;
      }
      const browserSources = browserSourcesEntryChange(event.key, event.newValue);
      if (browserSources) {
        useStore.setState((state) => {
          const selected = { ...state.conversationBrowserSources };
          if (browserSources.sources.length) selected[browserSources.key] = browserSources.sources;
          else delete selected[browserSources.key];
          return { conversationBrowserSources: selected };
        });
        return;
      }
      const change = conversationEntryChange(event.key, event.newValue);
      if (!change) return;
      useStore.setState((state) => applyConversationStorageChange(state, change));
    };
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, []);
}
