import { useEffect, useState } from "react";
import { bridge } from "./bridge";

const seconds = (list: string) => list.split(",").map(v => (v.trim().endsWith("ms") ? parseFloat(v) / 1000 : parseFloat(v)) || 0);

function longestTransitionMs(el: HTMLElement): number {
  const style = getComputedStyle(el);
  const durations = seconds(style.transitionDuration), delays = seconds(style.transitionDelay);
  return Math.max(0, ...durations.map((d, i) => (d + (delays[i % delays.length] ?? 0)) * 1000));
}

/** The address bar stays out of the layout until the pointer reaches the top of a loaded page, or the field is focused. */
export function useToolbarReveal(enabled: boolean, heldOpen = false): { revealed: boolean; covering: boolean } {
  const [dragging, setDragging] = useState(false);
  const [edge, setEdge] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [covering, setCovering] = useState(false);
  useEffect(() => bridge.onToolbarEdge(near => setEdge(near)), []);
  useEffect(() => {
    if (!enabled) return;
    const bar = document.querySelector<HTMLElement>(".main-col > .toolbar");
    if (!bar) return;
    const enter = () => setHovered(true);
    const leave = () => setHovered(false);
    const focus = () => setFocused(true);
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
  }, [enabled]);
  useEffect(() => {
    const drag = (event: Event) => setDragging((event as CustomEvent<boolean>).detail);
    window.addEventListener("aux-window-drag", drag);
    const release = () => { setEdge(false); setHovered(false); setFocused(false); setCovering(false); };
    window.addEventListener("aux-page-scroll", release);
    return () => { window.removeEventListener("aux-page-scroll", release); window.removeEventListener("aux-window-drag", drag); };
  }, []);
  const revealed = enabled && (edge || hovered || focused || heldOpen || dragging);
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
    const bar = document.querySelector<HTMLElement>(".main-col > .toolbar");
    const done = () => setCovering(false);
    const onEnd = (event: TransitionEvent) => { if (event.target === bar && event.propertyName === "transform") done(); };
    bar?.addEventListener("transitionend", onEnd);
    // transitionend never fires for a zero-length or interrupted transition
    const timer = window.setTimeout(done, bar ? longestTransitionMs(bar) + 50 : 0);
    return () => {
      bar?.removeEventListener("transitionend", onEnd);
      window.clearTimeout(timer);
    };
  }, [enabled, revealed]);
  return { revealed, covering };
}
