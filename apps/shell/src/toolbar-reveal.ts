import { useEffect, useState, useSyncExternalStore } from "react";
import { bridge } from "./bridge";
import {
  floatingSidebarLockCounts,
  floatingSidebarLockVersion,
  subscribeFloatingSidebarLocks,
} from "./floating-sidebar";

const seconds = (list: string) =>
  list.split(",").map((v) => (v.trim().endsWith("ms") ? parseFloat(v) / 1000 : parseFloat(v)) || 0);

function longestTransitionMs(el: HTMLElement): number {
  const style = getComputedStyle(el);
  const durations = seconds(style.transitionDuration),
    delays = seconds(style.transitionDelay);
  return Math.max(0, ...durations.map((d, i) => (d + (delays[i % delays.length] ?? 0)) * 1000));
}

/** The address bar stays out of layout until the pointer reaches the page top
 * or the field receives focus. */
export function useToolbarReveal(
  enabled: boolean,
  heldOpen = false,
  selector = ".main-col > .toolbar",
): { revealed: boolean; covering: boolean } {
  const [dragging, setDragging] = useState(false);
  const [edge, setEdge] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [frameActive, setFrameActive] = useState(() => document.hasFocus());
  const [open, setOpen] = useState(false);
  const [covering, setCovering] = useState(false);
  useSyncExternalStore(subscribeFloatingSidebarLocks, floatingSidebarLockVersion);
  const locks = floatingSidebarLockCounts();
  const keepCurrent = locks["keep-current"] > 0;
  const keepExpanded = locks["keep-expanded"] > 0;
  useEffect(
    () =>
      bridge.onToolbarEdge((near) => {
        setEdge(near);
        if (near) setFrameActive(true);
      }),
    [],
  );
  useEffect(() => {
    const activate = () => setFrameActive(true);
    const deactivate = () => setFrameActive(false);
    window.addEventListener("focus", activate);
    window.addEventListener("blur", deactivate);
    return () => {
      window.removeEventListener("focus", activate);
      window.removeEventListener("blur", deactivate);
    };
  }, []);
  useEffect(() => {
    if (!enabled) return;
    const bar = document.querySelector<HTMLElement>(selector);
    if (!bar) return;
    const enter = () => {
      setFrameActive(true);
      setHovered(true);
    };
    const leave = () => setHovered(false);
    const focus = () => {
      setFrameActive(true);
      setFocused(true);
    };
    const blur = (event: FocusEvent) => {
      if (event.relatedTarget instanceof Node && bar.contains(event.relatedTarget)) return;
      setFocused(false);
    };
    bar.addEventListener("pointerenter", enter);
    bar.addEventListener("pointerleave", leave);
    bar.addEventListener("focusin", focus);
    bar.addEventListener("focusout", blur);
    return () => {
      bar.removeEventListener("pointerenter", enter);
      bar.removeEventListener("pointerleave", leave);
      bar.removeEventListener("focusin", focus);
      bar.removeEventListener("focusout", blur);
      setHovered(false);
      setFocused(false);
    };
  }, [enabled, selector]);
  useEffect(() => {
    const drag = (event: Event) => setDragging((event as CustomEvent<boolean>).detail);
    window.addEventListener("aux-window-drag", drag);
    const release = () => {
      setEdge(false);
      setHovered(false);
      setFocused(false);
    };
    window.addEventListener("aux-page-scroll", release);
    return () => {
      window.removeEventListener("aux-page-scroll", release);
      window.removeEventListener("aux-window-drag", drag);
    };
  }, []);
  useEffect(() => {
    if (!enabled || !frameActive) {
      let active = true;
      queueMicrotask(() => {
        if (active) setOpen(false);
      });
      return () => {
        active = false;
      };
    }
    if (keepCurrent) return;
    if (hovered || focused || heldOpen || dragging || keepExpanded) {
      let active = true;
      queueMicrotask(() => {
        if (active) setOpen(true);
      });
      return () => {
        active = false;
      };
    }
    // Edge durations belong to the CSS motion, not a second intent delay.
    let active = true;
    queueMicrotask(() => {
      if (active) setOpen(edge);
    });
    return () => {
      active = false;
    };
  }, [enabled, frameActive, edge, hovered, focused, heldOpen, dragging, keepCurrent, keepExpanded, open]);
  const revealed = enabled && frameActive && open;
  useEffect(() => {
    let active = true;
    const update = (value: boolean) =>
      queueMicrotask(() => {
        if (active) setCovering(value);
      });
    if (!enabled) {
      update(false);
      return () => {
        active = false;
      };
    }
    if (revealed) {
      update(true);
      return () => {
        active = false;
      };
    }
    // Keep the shell above the page until the bar has finished sliding away.
    const bar = document.querySelector<HTMLElement>(selector);
    const done = () => {
      if (active) setCovering(false);
    };
    const onEnd = (event: TransitionEvent) => {
      if (event.target === bar && event.propertyName === "transform") done();
    };
    bar?.addEventListener("transitionend", onEnd);
    // transitionend never fires for a zero-length or interrupted transition
    const timer = window.setTimeout(done, bar ? longestTransitionMs(bar) + 50 : 0);
    return () => {
      active = false;
      bar?.removeEventListener("transitionend", onEnd);
      window.clearTimeout(timer);
    };
  }, [enabled, revealed, selector]);
  return { revealed, covering };
}
