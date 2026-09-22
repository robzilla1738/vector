import { useEffect, useState } from "react";
import { bridge } from "./bridge";

const HIDE_MS = 180;

/** The address bar stays out of the layout until the pointer reaches the top of a loaded page, or the field is focused. */
export function useToolbarReveal(enabled: boolean): { revealed: boolean; inset: boolean } {
  const [edge, setEdge] = useState(false);
  const [held, setHeld] = useState(false);
  const [inset, setInset] = useState(false);
  useEffect(() => bridge.onToolbarEdge(near => setEdge(near)), []);
  useEffect(() => {
    if (!enabled) return;
    const bar = document.querySelector<HTMLElement>(".main-col > .toolbar");
    if (!bar) return;
    const hold = () => setHeld(true);
    const release = (event: PointerEvent | FocusEvent) => {
      const next = event.relatedTarget;
      if (next instanceof Node && bar.contains(next)) return;
      setHeld(false);
    };
    bar.addEventListener("pointerenter", hold);
    bar.addEventListener("pointerleave", release);
    bar.addEventListener("focusin", hold);
    bar.addEventListener("focusout", release);
    return () => {
      bar.removeEventListener("pointerenter", hold);
      bar.removeEventListener("pointerleave", release);
      bar.removeEventListener("focusin", hold);
      bar.removeEventListener("focusout", release);
    };
  }, [enabled]);
  const revealed = enabled && (edge || held);
  useEffect(() => {
    if (!enabled) {
      setInset(false);
      return;
    }
    if (revealed) {
      setInset(true);
      return;
    }
    const timer = window.setTimeout(() => setInset(false), HIDE_MS);
    return () => window.clearTimeout(timer);
  }, [enabled, revealed]);
  return { revealed, inset };
}
