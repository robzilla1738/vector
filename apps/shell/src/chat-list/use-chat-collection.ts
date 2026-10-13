import { useEffect, useMemo, useSyncExternalStore } from "react";
import { bridge } from "../bridge";
import { call } from "../store";
import { mergeHistory } from "../run-history";
import { ConversationCollection, type ConversationQuery } from "./collection";

const watchers = new Set<() => void>();
let unsubscribe: (() => void) | undefined;
function watchChats(refresh: () => void) {
  watchers.add(refresh);
  if (!unsubscribe) {
    const notify = () => {
      for (const watch of watchers) watch();
    };
    const off = bridge.onEvent((event) => {
      if (
        event.type === "conversation.changed" ||
        event.type === "conversation.deleted" ||
        event.type === "conversation.context.changed" ||
        event.type === "run.updated" ||
        event.type === "run.status"
      )
        notify();
    });
    window.addEventListener("focus", notify);
    unsubscribe = () => {
      off();
      window.removeEventListener("focus", notify);
    };
  }
  return () => {
    watchers.delete(refresh);
    if (!watchers.size) {
      unsubscribe?.();
      unsubscribe = undefined;
    }
  };
}

/** All durable chat views use one producer and one host event subscription. */
export function useChatCollection(query: ConversationQuery, active = true) {
  const windowId = bridge.windowId,
    kind = bridge.windowKind,
    privateMode = bridge.privateMode;
  const collection = useMemo(
    () =>
      new ConversationCollection(
        query,
        (params) => call("conversations.list", params),
        () =>
          bridge.windowId === windowId && bridge.windowKind === kind && bridge.privateMode === privateMode,
        active,
      ),
    [
      query.archived,
      query.query,
      query.workspaceId,
      query.policy,
      query.previewLimit,
      windowId,
      kind,
      privateMode,
    ],
  );
  const state = useSyncExternalStore(collection.subscribe, collection.getSnapshot);
  useEffect(() => {
    if (!active) return;
    collection.start();
    let timer = window.setTimeout(() => void collection.load(), query.policy === "preview" ? 0 : 100);
    const off = watchChats(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => void collection.load("refresh"), 100);
    });
    return () => {
      off();
      window.clearTimeout(timer);
      collection.stop();
    };
  }, [collection, active, privateMode]);
  const items = useMemo(() => state.ids.map((id) => state.byId[id]!), [state.ids, state.byId]);
  useEffect(() => {
    if (collection.current()) mergeHistory(items.map((item) => item.latestRun));
  }, [collection, items]);
  return { collection, state, items };
}
