import type React from "react";

/** edge drag-handle — resizes the panel it sits in via pointer capture.
 *  `side` = which side of the window the panel lives on: a left panel grows
 *  with positive x-delta, a right panel with negative. Pointer capture keeps
 *  the drag alive over the native page view; the buttons check self-heals if
 *  a pointerup is ever missed. */
export function ResizeHandle({ side, value, min, max, reset, onResize }: {
  side: "left" | "right";
  value: number;
  min: number;
  max: number;
  /** width a double-click restores */
  reset: number;
  onResize: (w: number) => void;
}) {
  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = value;
    document.body.classList.add("resizing");
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch { /* synthetic events have no active pointer */ }
    const done = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", done);
      window.removeEventListener("pointercancel", done);
      document.body.classList.remove("resizing");
    };
    const move = (ev: PointerEvent) => {
      if (!(ev.buttons & 1)) return done(); // released outside the window
      const d = side === "left" ? ev.clientX - startX : startX - ev.clientX;
      onResize(Math.min(max, Math.max(min, startW + d)));
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", done);
    window.addEventListener("pointercancel", done);
  };
  return <div className={`resize-handle ${side}`} onPointerDown={onDown} onDoubleClick={() => onResize(reset)} />;
}
