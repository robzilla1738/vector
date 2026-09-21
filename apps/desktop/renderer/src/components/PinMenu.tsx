import { useEffect, useLayoutEffect, useRef } from "react";
import { bridge } from "../bridge";
import { isScrimOverlay } from "../chrome";
import { moveMenuFocus } from "../keyboard-list";
import { errToast, toast, useStore } from "../store";
import type { Pin } from "../workspace";

export function PinMenu({ pin, spaceId, x, y, onClose }: {
  pin: Pin; spaceId: string; x: number; y: number; onClose: () => void;
}) {
  const pins = useStore(state => state.layout.pins[spaceId]);
  const index = pins?.findIndex(item => item.url === pin.url) ?? -1;
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef(document.activeElement as HTMLElement | null);
  const close = useRef(onClose); close.current = onClose;
  useLayoutEffect(() => {
    const menu = ref.current;
    if (!menu) return;
    const bounds = menu.getBoundingClientRect();
    menu.style.left = `${Math.max(8, Math.min(x, window.innerWidth - bounds.width - 8))}px`;
    menu.style.top = `${Math.max(8, Math.min(y, window.innerHeight - bounds.height - 8))}px`;
  }, [x, y]);
  useEffect(() => {
    void bridge.overlay(true);
    const outside = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) close.current(); };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close.current(); }
    };
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", escape);
    ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", escape);
      void bridge.overlay(isScrimOverlay(useStore.getState().overlay));
      if (trigger.current?.isConnected) trigger.current.focus();
    };
  }, []);
  function action(work: () => unknown | Promise<unknown>) {
    onClose();
    void Promise.resolve().then(work).catch(errToast);
  }
  return <div ref={ref} className="menu ctx-menu pop-in" role="menu" aria-label="Pinned site" style={{ left: x, top: y }} onKeyDown={event => {
    if (event.key === "Tab") { event.preventDefault(); onClose(); } else moveMenuFocus(event);
  }}>
    <button className="menu-item" role="menuitem" onClick={() => action(() => useStore.getState().newTab(pin.url))}>Open in new tab</button>
    <button className="menu-item" role="menuitem" onClick={() => action(() => useStore.getState().openBackgroundTab(pin.url, spaceId, false))}>Open in background tab</button>
    <button className="menu-item" role="menuitem" onClick={() => action(async () => { await navigator.clipboard.writeText(pin.url); toast("URL copied"); })}>Copy URL</button>
    <div className="menu-sep" />
    {index > 0 && <button className="menu-item" role="menuitem" onClick={() => action(() => useStore.getState().reorderPin(spaceId, pin.url, pins![0]!.url))}>Move to front</button>}
    {index > 0 && <button className="menu-item" role="menuitem" onClick={() => action(() => useStore.getState().reorderPin(spaceId, pin.url, pins![index - 1]!.url))}>Move earlier</button>}
    {index >= 0 && index < (pins?.length ?? 0) - 1 && <button className="menu-item" role="menuitem" onClick={() => action(() => useStore.getState().reorderPin(spaceId, pin.url, pins?.[index + 2]?.url ?? null))}>Move later</button>}

    <button className="menu-item" role="menuitem" onClick={() => action(() => {
      const state = useStore.getState();
      if (state.layout.pins[spaceId]?.some(item => item.url === pin.url)) { state.togglePin(pin, spaceId); toast("Unpinned"); }
    })}>Unpin from this Space</button>
  </div>;
}
