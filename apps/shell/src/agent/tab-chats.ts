import { useEffect } from "react";
import { bridge } from "../bridge";
import { useStore } from "../store";
import type { RailView } from "../store/types";

type State = ReturnType<typeof useStore.getState>;
const identity = (state: State) =>
  state.activePageId ? `${state.layout.activeSpaceId}:${state.activePageId}` : null;

/** Browser-window session ownership. Switching tabs never stops a run or deletes its draft. */
export function installTabChats(): () => void {
  const chats = new Map<string, RailView>();
  const offEvent = bridge.onEvent((event) => {
    if (event.type !== "conversation.deleted") return;
    const state = useStore.getState();
    for (const [key, view] of chats) {
      if (
        (view.kind === "draft" && view.chatId === event.payload.chatId) ||
        (view.kind === "run" &&
          !state.runs.some(
            (run) => run.runId === view.runId && (run.config?.chatId ?? run.runId) !== event.payload.chatId,
          ))
      )
        chats.delete(key);
    }
  });
  const offStore = useStore.subscribe((state, previous) => {
    if (bridge.privateMode || bridge.windowKind !== "normal") return;
    const before = identity(previous),
      after = identity(state);
    if (state.settings.askTabSwitch !== previous.settings.askTabSwitch) chats.clear();
    if (state.settings.askTabSwitch === "keep-current") return;
    if (before === after) {
      if (after && state.railView.kind !== "set") chats.set(after, state.railView);
      return;
    }
    if (before && previous.railView.kind !== "set") chats.set(before, previous.railView);
    for (const key of chats.keys()) {
      const pageId = key.slice(key.indexOf(":") + 1);
      if (!state.pages.byId[pageId]) chats.delete(key);
    }
    if (!after || state.railView.kind === "set") return;
    if (state.railView !== previous.railView) {
      chats.set(after, state.railView);
      return;
    }
    const saved = chats.get(after);
    const available = saved?.kind !== "run" || state.runs.some((run) => run.runId === saved.runId);
    const next = (available ? saved : undefined) ?? { kind: "draft", chatId: crypto.randomUUID() };
    chats.set(after, next);
    useStore.setState({ railView: next });
  });
  return () => {
    offStore();
    offEvent();
    chats.clear();
  };
}

export function useTabChats() {
  useEffect(installTabChats, []);
}
