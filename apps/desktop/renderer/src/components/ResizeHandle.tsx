import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { acquireFloatingSidebarLock } from "../floating-sidebar";

export function snapResizeWidth(width: number, min: number, max: number, reset: number): number {
  const clamped = Math.round(Math.min(max, Math.max(min, width)));
  return Math.abs(clamped - reset) <= 8 ? reset : clamped;
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
}: {
  side: "left" | "right";
  value: number;
  min: number;
  max: number;
  /** width a double-click restores */
  reset: number;
  onResize: (w: number) => void;
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
    const startX = e.clientX;
    const startW = value;
    const releaseLock = side === "left" ? acquireFloatingSidebarLock("keep-current") : null;
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
      panel?.style.setProperty(cssVar, `${commit ? width : value}px`);
      handle.setAttribute("aria-valuenow", String(commit ? width : value));
      if (commit && width !== value) onResize(width);
      releaseLock?.();
      cleanup.current = null;
    };
    const release = () => done();
    const cancel = () => done(false);
    const move = (ev: PointerEvent) => {
      if (!(ev.buttons & 1)) return done(); // released outside the window
      const d = side === "left" ? ev.clientX - startX : startX - ev.clientX;
      width = snapResizeWidth(startW + d, min, max, reset);
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        panel?.style.setProperty(cssVar, `${width}px`);
        handle.setAttribute("aria-valuenow", String(width));
      });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", cancel);
    cleanup.current = cancel;
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
          onResize(snapResizeWidth(value + direction * 16, min, max, reset));
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
