import { useEffect } from "react";
import { pointerHitsPage } from "../../main/page-pointer";
import { bridge, inElectron } from "./bridge";

function buttonOf(event: { button: number; buttons: number }): "left" | "middle" | "right" {
  if (event.button === 1 || (event.buttons & 4) !== 0) return "middle";
  if (event.button === 2 || (event.buttons & 2) !== 0) return "right";
  return "left";
}

/** While the address bar floats above a native page, the shell receives the pointer. Hand the page region back to that page. */
export function usePagePointerForward(active: boolean) {
  useEffect(() => {
    if (!active || !inElectron) return;
    const stage = () => document.querySelector<HTMLElement>(".stage-card.has-page");
    const hits = (event: { target: EventTarget | null; clientX: number; clientY: number }) => {
      const card = stage();
      if (!card) return false;
      const box = card.getBoundingClientRect();
      const inside = event.clientX >= box.left && event.clientY >= box.top && event.clientX < box.right && event.clientY < box.bottom;
      const target = event.target instanceof Element ? event.target : null;
      return pointerHitsPage(target, inside);
    };
    const send = (kind: "down" | "up" | "move" | "wheel", event: MouseEvent | PointerEvent | WheelEvent, button = buttonOf(event)) => {
      const wheel = "deltaX" in event ? event : null;
      const modifiers = [
        event.shiftKey ? "shift" as const : null,
        event.ctrlKey ? "control" as const : null,
        event.altKey ? "alt" as const : null,
        event.metaKey ? "meta" as const : null,
        (event.buttons & 1) ? "leftbuttondown" as const : null,
        (event.buttons & 4) ? "middlebuttondown" as const : null,
        (event.buttons & 2) ? "rightbuttondown" as const : null,
      ].filter(item => item !== null);
      bridge.forwardPagePointer({
        kind,
        x: event.clientX,
        y: event.clientY,
        button,
        clickCount: event.detail || (kind === "move" ? 0 : 1),
        deltaX: wheel?.deltaX ?? 0,
        deltaY: wheel?.deltaY ?? 0,
        modifiers,
      });
    };
    let frame = 0;
    let last: PointerEvent | null = null;
    const flush = () => {
      frame = 0;
      const event = last;
      last = null;
      if (!event || !hits(event)) return;
      send("move", event);
    };
    const onDown = (event: PointerEvent) => {
      if (!hits(event)) return;
      const field = document.activeElement;
      if (field instanceof HTMLElement && field.closest(".toolbar")) field.blur();
      event.preventDefault();
      event.stopPropagation();
      send("down", event);
    };
    const onUp = (event: PointerEvent) => {
      if (!hits(event)) return;
      event.preventDefault();
      event.stopPropagation();
      send("up", event);
    };
    const onMove = (event: PointerEvent) => {
      if (!hits(event)) return;
      last = event;
      if (!frame) frame = requestAnimationFrame(flush);
    };
    const onWheel = (event: WheelEvent) => {
      if (!hits(event)) return;
      event.preventDefault();
      const field = document.activeElement;
      if (field instanceof HTMLElement && field.closest(".toolbar")) field.blur();
      send("wheel", event);
      // Scrolling resumes direct native input, even if URL editing held chrome open.
      window.dispatchEvent(new Event("aux-page-scroll"));
    };
    const onMenu = (event: MouseEvent) => {
      if (!hits(event)) return;
      event.preventDefault();
      event.stopPropagation();
      send("down", event, "right");
      send("up", event, "right");
    };
    const onCursor = (cursor: string) => {
      const card = stage();
      if (card) card.style.cursor = cursor;
    };
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("pointerup", onUp, true);
    window.addEventListener("pointermove", onMove, true);
    window.addEventListener("wheel", onWheel, { capture: true, passive: false });
    window.addEventListener("contextmenu", onMenu, true);
    const stopCursor = bridge.onPageCursor(onCursor);
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("pointerup", onUp, true);
      window.removeEventListener("pointermove", onMove, true);
      window.removeEventListener("wheel", onWheel, true);
      window.removeEventListener("contextmenu", onMenu, true);
      stopCursor();
      cancelAnimationFrame(frame);
      const card = stage();
      if (card) card.style.cursor = "";
    };
  }, [active]);
}
