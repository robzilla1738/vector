import { useEffect, useRef } from "react";

/**
 * One Escape stack for menus, popovers and dialogs: the most recently opened
 * layer closes first. The listener sits on `document` in the bubble phase, so a
 * field that handles Escape itself (and stops it) still wins, and the window
 * listener that closes the current overlay only runs when no layer is open.
 */
const layers: { dismiss: () => void }[] = [];

function onKeyDown(event: KeyboardEvent) {
  if (event.key !== "Escape" || event.defaultPrevented || event.isComposing) return;
  const top = layers.at(-1);
  if (!top) return;
  event.preventDefault();
  event.stopPropagation();
  top.dismiss();
}

export function useDismissable(open: boolean, onDismiss: () => void) {
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;
  useEffect(() => {
    if (!open) return;
    const layer = { dismiss: () => dismiss.current() };
    if (!layers.length) document.addEventListener("keydown", onKeyDown);
    layers.push(layer);
    return () => {
      layers.splice(layers.indexOf(layer), 1);
      if (!layers.length) document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);
}
