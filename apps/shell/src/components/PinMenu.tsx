import { useEffect, useLayoutEffect, useRef } from "react";
import { requestStageReport } from "../stage-obstruction";
import { moveMenuFocus } from "../keyboard-list";
import { useMenuDismiss } from "../use-menu-dismiss";
import { positionContextMenu } from "../position-context-menu";
import { errToast, toast, useStore } from "../store";
import type { Pin } from "../workspace";
import { useDismissable } from "../use-dismissable";

export function PinMenu({ pin, spaceId, x, y, onClose: finishClose }: {
  pin: Pin; spaceId: string; x: number; y: number; onClose: () => void;
}) {
  const pins = useStore(state => state.layout.pins[spaceId]);
  const index = pins?.findIndex(item => item.url === pin.url) ?? -1;
  const ref = useRef<HTMLDivElement>(null);
  const onClose = useMenuDismiss(ref, finishClose);
  const trigger = useRef(document.activeElement as HTMLElement | null);
  const close = useRef(onClose); close.current = onClose;
  useLayoutEffect(() => {
    const menu = ref.current;
    if (!menu) return;
    positionContextMenu(menu, x, y);
    requestStageReport();
  }, [x, y]);
  useEffect(() => {
    const outside = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) close.current(); };
    document.addEventListener("mousedown", outside);
    ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => {
      document.removeEventListener("mousedown", outside);
      requestStageReport();
      if (trigger.current?.isConnected) trigger.current.focus();
    };
  }, []);
  useDismissable(true, () => close.current());
  function action(work: () => unknown | Promise<unknown>) {
    onClose();
    void Promise.resolve().then(work).catch(errToast);
  }
  return <div ref={ref} className="menu ctx-menu" role="menu" aria-label="Pinned site" style={{ left: x, top: y }} onKeyDown={event => {
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
