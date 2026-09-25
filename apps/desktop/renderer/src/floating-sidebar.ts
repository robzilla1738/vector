import { useEffect, type RefObject } from "react";
import { bridge } from "./bridge";
import { useStore } from "./store";
import type { SidebarMode } from "./sidebar-mode";

export type SidebarLock = "force-collapse" | "keep-current" | "keep-expanded";
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
  if (!state.frameActive && !state.focused) return false;
  if (state.locks["keep-expanded"] || state.edge || state.inside || state.focused) return true;
  return !!state.locks["keep-current"] && state.visible;
}

const activeLocks = new Map<SidebarLock, number>();
const listeners = new Set<() => void>();

/** Menus, dialogs and drags retain the sidebar without coupling to its DOM. */
export function acquireFloatingSidebarLock(lock: SidebarLock): () => void {
  activeLocks.set(lock, (activeLocks.get(lock) ?? 0) + 1);
  listeners.forEach((listener) => listener());
  let released = false;
  return () => {
    if (released) return;
    released = true;
    const count = (activeLocks.get(lock) ?? 1) - 1;
    if (count) activeLocks.set(lock, count);
    else activeLocks.delete(lock);
    listeners.forEach((listener) => listener());
  };
}

const lockCounts = (): FloatingSidebarState["locks"] => ({
  "force-collapse": activeLocks.get("force-collapse") ?? 0,
  "keep-current": activeLocks.get("keep-current") ?? 0,
  "keep-expanded": activeLocks.get("keep-expanded") ?? 0,
});

/** Owns reveal and retention for the vertical layout. The saved width changes
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
      focused: node.contains(document.activeElement),
      locks: lockCounts(),
    };
    let showTimer = 0;
    let hideTimer = 0;
    let lastPointer: { x: number; time: number } | null = null;
    const clearShow = () => {
      window.clearTimeout(showTimer);
      showTimer = 0;
    };
    const clearHide = () => {
      window.clearTimeout(hideTimer);
      hideTimer = 0;
    };
    const show = () => {
      clearShow();
      clearHide();
      if (!floatingSidebarVisible({ ...state, edge: true })) return;
      if (!state.visible) {
        state.visible = true;
        useStore.getState().setSidebarPeek(true);
      }
    };
    const hide = (immediate = false) => {
      clearShow();
      clearHide();
      const finish = () => {
        if (floatingSidebarVisible(state)) return;
        state.visible = false;
        useStore.getState().setSidebarPeek(false);
      };
      if (immediate) finish();
      else hideTimer = window.setTimeout(finish, 150);
    };
    const reconcile = (fast = false) => {
      state.visible = useStore.getState().sidebarPeek;
      state.locks = lockCounts();
      if (state.locks["force-collapse"] || (!state.frameActive && !state.focused)) {
        hide(true);
        return;
      }
      if (floatingSidebarVisible(state)) {
        clearHide();
        if (fast || state.inside || state.focused || state.locks["keep-expanded"]) show();
        else if (!state.visible && !showTimer) showTimer = window.setTimeout(show, 80);
      } else hide();
    };
    const move = (event: PointerEvent) => {
      const near = event.clientX <= 8 && event.clientY >= 48;
      const speed =
        lastPointer && event.timeStamp > lastPointer.time
          ? Math.abs(event.clientX - lastPointer.x) / (event.timeStamp - lastPointer.time)
          : 0;
      lastPointer = { x: event.clientX, time: event.timeStamp };
      if (state.edge === near) return;
      state.edge = near;
      reconcile(near && (event.clientX <= 2 || speed > 1.5));
    };
    const enter = () => {
      state.inside = true;
      reconcile(true);
    };
    const leave = () => {
      state.inside = false;
      reconcile();
    };
    const focus = () => {
      state.focused = true;
      reconcile(true);
    };
    const blur = () =>
      queueMicrotask(() => {
        state.focused = node.contains(document.activeElement);
        reconcile();
      });
    const activate = () => {
      state.frameActive = true;
      reconcile();
    };
    const deactivate = () => {
      state.frameActive = false;
      reconcile();
    };
    const outside = (event: PointerEvent) => {
      if (
        !(event.target instanceof Element) ||
        event.target.closest(".sidebar, .toolbar, .menu, .cb-pop, .sheet, .palette, dialog[open]")
      )
        return;
      state.edge = false;
      state.inside = false;
      hide(true);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented && !useStore.getState().overlay) {
        state.edge = false;
        state.inside = false;
        hide(true);
      }
    };
    const nativeEdge = bridge.onSidebarEdge((near) => {
      state.edge = near;
      reconcile(near);
    });
    const lockChanged = () => reconcile();
    const scroll = () => {
      state.edge = false;
      state.inside = false;
      hide(true);
    };
    listeners.add(lockChanged);
    window.addEventListener("pointermove", move);
    window.addEventListener("focus", activate);
    window.addEventListener("blur", deactivate);
    window.addEventListener("aux-page-scroll", scroll);
    node.addEventListener("pointerenter", enter);
    node.addEventListener("pointerleave", leave);
    node.addEventListener("focusin", focus);
    node.addEventListener("focusout", blur);
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("keydown", escape);
    return () => {
      clearShow();
      clearHide();
      nativeEdge();
      listeners.delete(lockChanged);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("focus", activate);
      window.removeEventListener("blur", deactivate);
      window.removeEventListener("aux-page-scroll", scroll);
      node.removeEventListener("pointerenter", enter);
      node.removeEventListener("pointerleave", leave);
      node.removeEventListener("focusin", focus);
      node.removeEventListener("focusout", blur);
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("keydown", escape);
    };
  }, [mode, panel]);
}
