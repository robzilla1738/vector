import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { acquireFloatingSidebarLock } from "../floating-sidebar";

export function snapResizeWidth(width: number, min: number, max: number, reset: number): number {
  const clamped = Math.round(Math.min(max, Math.max(min, width)));
  return Math.abs(clamped - reset) <= 8 ? reset : clamped;
}

function handleAnnouncement(handle: HTMLElement, width: number) {
  const output = document.createElement("output");
  output.setAttribute("aria-live", "polite");
  output.className = "sr-only";
  output.textContent = `Sidebar width ${width} pixels`;
  handle.append(output);
  window.setTimeout(() => output.remove(), 1000);
}

/** edge drag-handle — resizes the panel it sits in via pointer capture.
 *  `side` = which side of the window the panel lives on: a left panel grows
 *  with positive x-delta, a right panel with negative. Pointer capture keeps
 *  the drag alive over the native page view; the buttons check self-heals if
 *  a pointerup is ever missed. */
export function ResizeHandle({
  side,
  value,
  min,
  max,
  reset,
  onResize,
  onCollapse,
}: {
  side: "left" | "right";
  value: number;
  min: number;
  max: number;
  /** width a double-click restores */
  reset: number;
  onResize: (w: number) => void;
  onCollapse?: () => void;
}) {
  const cleanup = useRef<(() => void) | null>(null);
  useEffect(() => () => cleanup.current?.(), []);
  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    cleanup.current?.();
    e.preventDefault();
    e.currentTarget.focus();
    const handle = e.currentTarget;
    // Mid-drag the panel's width variable is written directly, once per frame;
    // the store (and its persisted width) takes the final value on release.
    const panel = handle.parentElement;
    const cssVar = side === "left" ? "--sb-w" : "--rail-w";
    const updateWidth = (width: number) => {
      panel?.style.setProperty(cssVar, `${width}px`);
      if (onCollapse) panel?.closest<HTMLElement>(".app")?.style.setProperty(cssVar, `${width}px`);
    };
    const pointerId = e.pointerId;
    const startX = e.clientX;
    const startW = value;
    const releaseLock = side === "left" ? acquireFloatingSidebarLock("keep-current") : null;
    let collapsed = false;
    let width = value,
      frame = 0;
    document.body.classList.add("resizing");
    try {
      handle.setPointerCapture(e.pointerId);
    } catch {
      /* synthetic events have no active pointer */
    }
    const done = (commit = true) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", cancel);
      cancelAnimationFrame(frame);
      document.body.classList.remove("resizing");
      updateWidth(commit && !collapsed ? width : value);
      handle.setAttribute("aria-valuenow", String(commit ? width : value));
      if (commit && collapsed) onCollapse?.();
      else if (commit && width !== value) onResize(width);
      releaseLock?.();
      cleanup.current = null;
    };
    const position = (clientX: number) => {
      const d = side === "left" ? clientX - startX : startX - clientX;
      const raw = startW + d;
      collapsed = !!onCollapse && raw < min - 15;
      width = onCollapse && Math.abs(raw - reset) <= 15 ? reset : snapResizeWidth(raw, min, max, reset);
    };
    const release = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      // Coalesced movement may omit the last drag position. The matching
      // release is the actual final position, independent of the paint frame.
      if (Number.isFinite(ev.clientX)) position(ev.clientX);
      done();
    };
    const cancel = (ev: PointerEvent) => {
      if (ev.pointerId === pointerId) done(false);
    };
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      if (!(ev.buttons & 1)) return done(); // released outside the window
      position(ev.clientX);
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        updateWidth(width);
        handle.setAttribute("aria-valuenow", String(width));
      });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", cancel);
    cleanup.current = () => done(false);
  };
  return (
    <div
      className={`resize-handle ${side}`}
      role="separator"
      aria-orientation="vertical"
      aria-label={side === "left" ? "Sidebar width" : "Agent panel width"}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          const direction = (e.key === "ArrowRight" ? 1 : -1) * (side === "left" ? 1 : -1);
          const next = snapResizeWidth(value + direction * (onCollapse ? 50 : 16), min, max, reset);
          onResize(next);
          if (onCollapse) handleAnnouncement(e.currentTarget, next);
        }
        if (e.key === "Home") {
          e.preventDefault();
          onResize(reset);
        }
      }}
      title="Drag to resize · double-click resets"
      onPointerDown={onDown}
      onDoubleClick={() => onResize(reset)}
    />
  );
}
