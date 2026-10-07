import { useEffect, type RefObject } from "react";
import { bridge } from "./bridge";
import { useStore } from "./store";
import type { SidebarMode } from "./sidebar-mode";

export type SidebarLock = "force-collapse" | "keep-current" | "keep-expanded";
export const SIDEBAR_EDGE_TRIGGER_PX = 6;
export const SIDEBAR_EDGE_LEEWAY_PX = 8;
export const SIDEBAR_EXIT_GRACE_MS = 120;
export interface FloatingSidebarState {
  visible: boolean;
  frameActive: boolean;
  edge: boolean;
  inside: boolean;
  focused: boolean;
  locks: Record<SidebarLock, number>;
}

export function floatingSidebarVisible(state: FloatingSidebarState): boolean {
  if (state.locks["force-collapse"]) return false;
  if (!state.frameActive) return false;
  if (state.locks["keep-current"]) return state.visible;
  return !!state.locks["keep-expanded"] || state.edge || state.inside || state.focused;
}

const activeLocks = new Map<SidebarLock, number>();
const listeners = new Set<() => void>();
let lockVersion = 0;
const notifyLocks = () => {
  lockVersion += 1;
  listeners.forEach((listener) => listener());
};
export const subscribeFloatingSidebarLocks = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export const floatingSidebarLockVersion = () => lockVersion;

/** Menus, dialogs and drags retain the sidebar without coupling to its DOM. */
export function acquireFloatingSidebarLock(lock: SidebarLock): () => void {
  activeLocks.set(lock, (activeLocks.get(lock) ?? 0) + 1);
  notifyLocks();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    const count = (activeLocks.get(lock) ?? 1) - 1;
    if (count) activeLocks.set(lock, count);
    else activeLocks.delete(lock);
    notifyLocks();
  };
}

export const floatingSidebarLockCounts = (): FloatingSidebarState["locks"] => ({
  "force-collapse": activeLocks.get("force-collapse") ?? 0,
  "keep-current": activeLocks.get("keep-current") ?? 0,
  "keep-expanded": activeLocks.get("keep-expanded") ?? 0,
});

/** Owns reveal and retention for both sidebar layouts. The saved width changes
 * only in ResizeHandle's pointer-up path, never during this animation. */
export function useFloatingSidebar(mode: SidebarMode, panel: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    if (mode === "expanded") return;
    const node = panel.current;
    if (!node) return;
    const state: FloatingSidebarState = {
      visible: useStore.getState().sidebarPeek,
      frameActive: document.hasFocus(),
      edge: false,
      inside: false,
      focused: document.hasFocus() && node.contains(document.activeElement),
      locks: floatingSidebarLockCounts(),
    };
    let exitTimer: ReturnType<typeof setTimeout> | undefined;
    const cancelExit = () => {
      clearTimeout(exitTimer);
      exitTimer = undefined;
    };
    const show = () => {
      cancelExit();
      if (!floatingSidebarVisible({ ...state, edge: true })) return;
      if (!state.visible) {
        state.visible = true;
        useStore.getState().setSidebarPeek(true);
      }
    };
    const hide = () => {
      cancelExit();
      if (floatingSidebarVisible(state)) return;
      state.visible = false;
      useStore.getState().setSidebarPeek(false);
    };
    const reconcile = () => {
      state.visible = useStore.getState().sidebarPeek;
      state.locks = floatingSidebarLockCounts();
      if (state.locks["force-collapse"] || !state.frameActive) {
        hide();
        return;
      }
      if (floatingSidebarVisible(state)) show();
      else if (exitTimer === undefined) {
        // Bridge the small inset between the native edge and the floating panel.
        exitTimer = setTimeout(hide, SIDEBAR_EXIT_GRACE_MS);
      }
    };
    const move = (event: PointerEvent) => {
      const edgeWidth = SIDEBAR_EDGE_TRIGGER_PX + (state.edge || state.visible ? SIDEBAR_EDGE_LEEWAY_PX : 0);
      const near = event.clientX >= 0 && event.clientX <= edgeWidth && event.clientY >= 48;
      if (state.edge === near) return;
      state.edge = near;
      reconcile();
    };
    const enter = () => {
      state.inside = true;
      reconcile();
    };
    const leave = () => {
      state.inside = false;
      reconcile();
    };
    const focus = () => {
      state.focused = true;
      reconcile();
    };
    const blur = () =>
      queueMicrotask(() => {
        state.focused = node.contains(document.activeElement);
        reconcile();
      });
    const activate = () => {
      state.frameActive = true;
      state.focused = node.contains(document.activeElement);
      reconcile();
    };
    const deactivate = () => {
      state.frameActive = false;
      state.focused = false;
      reconcile();
    };
    const outside = (event: PointerEvent) => {
      if (
        !(event.target instanceof Element) ||
        event.target.closest(
          ".sidebar, .chat-sidebar, .toolbar, .menu, .cb-pop, .command-surface, dialog[open]",
        )
      )
        return;
      state.edge = false;
      state.inside = false;
      hide();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented && !useStore.getState().overlay) {
        state.edge = false;
        state.inside = false;
        hide();
      }
    };
    const nativeEdge = bridge.onSidebarEdge((near) => {
      state.edge = near;
      if (near) state.frameActive = true; // native watcher only reports an active window
      reconcile();
    });
    const lockChanged = () => reconcile();
    const scroll = () => {
      state.edge = false;
      state.inside = false;
      hide();
    };
    let releaseDrag: (() => void) | null = null;
    let releaseDisclosure: (() => void) | null = null;
    const beginDrag = (event: Event) => {
      if (!(event.target instanceof Node) || !node.contains(event.target) || releaseDrag) return;
      releaseDrag = acquireFloatingSidebarLock("keep-current");
    };
    const endDrag = () => {
      releaseDrag?.();
      releaseDrag = null;
    };
    const syncDisclosures = () => {
      const open = !!node.querySelector("details[open]:not(.sb-bookmark-folder)");
      if (open && !releaseDisclosure) releaseDisclosure = acquireFloatingSidebarLock("keep-current");
      if (!open && releaseDisclosure) {
        releaseDisclosure();
        releaseDisclosure = null;
      }
    };
    const disclosures = new MutationObserver(syncDisclosures);
    disclosures.observe(node, { subtree: true, attributes: true, attributeFilter: ["open"] });
    syncDisclosures();
    listeners.add(lockChanged);
    window.addEventListener("pointermove", move);
    window.addEventListener("focus", activate);
    window.addEventListener("blur", deactivate);
    window.addEventListener("aux-page-scroll", scroll);
    window.addEventListener("aux-page-pointerdown", scroll);
    node.addEventListener("pointerenter", enter);
    node.addEventListener("pointerleave", leave);
    node.addEventListener("focusin", focus);
    node.addEventListener("focusout", blur);
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("keydown", escape);
    node.addEventListener("dragstart", beginDrag);
    window.addEventListener("dragend", endDrag);
    window.addEventListener("drop", endDrag);
    return () => {
      cancelExit();
      nativeEdge();
      disclosures.disconnect();
      listeners.delete(lockChanged);
      endDrag();
      releaseDisclosure?.();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("focus", activate);
      window.removeEventListener("blur", deactivate);
      window.removeEventListener("aux-page-scroll", scroll);
      window.removeEventListener("aux-page-pointerdown", scroll);
      node.removeEventListener("pointerenter", enter);
      node.removeEventListener("pointerleave", leave);
      node.removeEventListener("focusin", focus);
      node.removeEventListener("focusout", blur);
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("keydown", escape);
      node.removeEventListener("dragstart", beginDrag);
      window.removeEventListener("dragend", endDrag);
      window.removeEventListener("drop", endDrag);
    };
  }, [mode, panel]);
}
