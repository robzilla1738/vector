import { useEffect, useMemo, useSyncExternalStore } from "react";
import { bridge } from "../bridge";
import { call, useStore } from "../store";
import { mergeHistory } from "../run-history";
import { ConversationCollection, type ConversationQuery } from "./collection";

const watchers = new Set<(connected?: boolean) => void>();
let unsubscribe: (() => void) | undefined;
function watchChats(refresh: (connected?: boolean) => void) {
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
    const offRuntime = bridge.onRuntimeStatus((status) => {
      for (const watch of watchers) watch(status.connected);
    });
    window.addEventListener("focus", notify);
    unsubscribe = () => {
      off();
      offRuntime();
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
  const connected = useStore((state) => state.connected);
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
    collection.connectionChanged(connected);
    collection.start();
    let timer = window.setTimeout(() => void collection.load(), query.policy === "preview" ? 0 : 100);
    const off = watchChats((connected) => {
      window.clearTimeout(timer);
      if (connected !== undefined) collection.connectionChanged(connected);
      if (connected === false) return;
      timer = window.setTimeout(() => void collection.load("refresh"), 100);
    });
    return () => {
      off();
      window.clearTimeout(timer);
      collection.stop();
    };
  }, [collection, active, privateMode, connected]);
  const items = useMemo(() => state.ids.map((id) => state.byId[id]!), [state.ids, state.byId]);
  useEffect(() => {
    if (collection.current()) mergeHistory(items.map((item) => item.latestRun));
  }, [collection, items]);
  return { collection, state, items };
}
