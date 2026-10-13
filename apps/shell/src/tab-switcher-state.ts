import { useSyncExternalStore } from "react";
import { bridge } from "./bridge";
import { errToast, useStore } from "./store";
import { orderedPages } from "./store/pages";
import { tabsInSpace } from "./workspace";
import { topModal } from "./ui/modal-stack";

type Switcher = {
  ids: string[];
  selectedId: string;
  originalId: string | null;
  spaceId: string;
  windowId: string;
  privateMode: boolean;
  sourceMode: string;
  sourceOverlay: string | null;
  modalScope: {
    original: ReturnType<typeof topModal>;
    preview: HTMLDialogElement | null;
  };
};

let current: Switcher | null = null;
const listeners = new Set<() => void>();
const publish = (next: Switcher | null) => {
  current = next;
  for (const listener of listeners) listener();
};

function currentTabs() {
  const state = useStore.getState();
  return tabsInSpace(state.layout, orderedPages(state.pages), state.layout.activeSpaceId);
}

/** A held chord previews a stable order without changing the active tab's MRU time. */
export function cycleTabPreview(direction: 1 | -1) {
  reconcileTabPreview();
  if (current) {
    const index = current.ids.indexOf(current.selectedId);
    publish({
      ...current,
      selectedId: current.ids[(index + direction + current.ids.length) % current.ids.length]!,
    });
    return;
  }
  const state = useStore.getState();
  const tabs = currentTabs();
  if (tabs.length < 2) return;
  const ids = (
    state.settings.tabSwitcherOrder === "recently-used"
      ? [...tabs].sort((a, b) => b.lastActiveAt - a.lastActiveAt)
      : tabs
  ).map((tab) => tab.pageId);
  const index = ids.indexOf(state.activePageId ?? "");
  publish({
    ids,
    selectedId: ids[(index + direction + ids.length) % ids.length]!,
    originalId: state.activePageId,
    spaceId: state.layout.activeSpaceId,
    windowId: bridge.windowId,
    privateMode: bridge.privateMode,
    sourceMode: state.mode,
    sourceOverlay: state.overlay,
    modalScope: { original: topModal(), preview: null },
  });
}

/** Bind the mounted preview to the same chord without delaying a quick tap's commit. */
export function ownTabPreviewModal(scope: Switcher["modalScope"], modal: HTMLDialogElement) {
  if (current?.modalScope !== scope) return;
  scope.preview = modal;
  return () => {
    if (current?.modalScope === scope) publish(null);
    if (scope.preview === modal) scope.preview = null;
  };
}

export function selectTabPreview(pageId: string) {
  if (current?.ids.includes(pageId)) publish({ ...current, selectedId: pageId });
}

export function reconcileTabPreview() {
  if (!current) return;
  const state = useStore.getState();
  if (
    current.windowId !== bridge.windowId ||
    current.privateMode !== bridge.privateMode ||
    current.spaceId !== state.layout.activeSpaceId ||
    current.sourceMode !== state.mode ||
    current.sourceOverlay !== state.overlay ||
    current.originalId !== state.activePageId
  ) {
    publish(null);
    return;
  }
  const live = new Set(currentTabs().map((tab) => tab.pageId));
  const ids = current.ids.filter((id) => live.has(id));
  if (ids.length < 2) publish(null);
  else if (ids.length !== current.ids.length)
    publish({
      ...current,
      ids,
      selectedId: ids.includes(current.selectedId)
        ? current.selectedId
        : ids[Math.min(current.ids.indexOf(current.selectedId), ids.length - 1)]!,
    });
}

export function finishTabPreview(activate: boolean) {
  reconcileTabPreview();
  const selection = current;
  if (!selection) return;
  const modal = topModal();
  const ownsModal =
    modal !== null && modal === (selection.modalScope.preview ?? selection.modalScope.original);
  publish(null);
  if (activate && ownsModal) void useStore.getState().activate(selection.selectedId).catch(errToast);
}

export function useTabPreviewSelection() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => current,
    () => null,
  );
}
