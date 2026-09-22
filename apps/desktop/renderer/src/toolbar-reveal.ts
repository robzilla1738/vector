import { useEffect, useState } from "react";
import { bridge } from "./bridge";

const HIDE_MS = 580;

/** The address bar stays out of the layout until the pointer reaches the top of a loaded page, or the field is focused. */
export function useToolbarReveal(enabled: boolean): { revealed: boolean; covering: boolean } {
  const [edge, setEdge] = useState(false);
  const [held, setHeld] = useState(false);
  const [covering, setCovering] = useState(false);
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
      setCovering(false);
      return;
    }
    if (revealed) {
      setCovering(true);
      return;
    }
    // Keep the shell above the page until the bar has finished sliding away.
    const hold = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : HIDE_MS;
    const timer = window.setTimeout(() => setCovering(false), hold);
    return () => window.clearTimeout(timer);
  }, [enabled, revealed]);
  return { revealed, covering };
}
