import { useEffect, useRef, type PointerEvent } from "react";
import { bridge, inElectron } from "./bridge";

const controls = 'button, summary, label, input, textarea, select, a, [role="button"], [role="tab"], [draggable="true"], [contenteditable="true"], .resize-handle';
function finishDrag() {
  bridge.windowDrag("end");
  window.dispatchEvent(new CustomEvent("aux-window-drag", { detail: false }));
}

/** Pointer capture keeps blank chrome draggable across native page layers. */
export function useWindowDrag(holdToolbar = false) {
  const active = useRef(false);
  const end = () => { if (!active.current) return; active.current = false; finishDrag(); };
  useEffect(() => {
    const move = (event: globalThis.PointerEvent) => {
      if (active.current) bridge.windowDrag("move", { x: event.screenX, y: event.screenY });
    };
    window.addEventListener("pointermove", move, true);
    window.addEventListener("pointerup", end, true);
    return () => { end(); window.removeEventListener("pointermove", move, true); window.removeEventListener("pointerup", end, true); };
  }, []);
  return {
    onPointerDown(event: PointerEvent<HTMLElement>) {
      if (!inElectron || event.button !== 0 || (event.target as Element).closest(controls)) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      active.current = true;
      bridge.windowDrag("start", { x: event.screenX, y: event.screenY });
      if (holdToolbar) window.dispatchEvent(new CustomEvent("aux-window-drag", { detail: true }));
    },
    onPointerCancel: end,
    onLostPointerCapture: end,
  };
}
