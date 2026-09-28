import { useRef } from "react";
import { Menu } from "../ui";
import { errToast, toast, useStore } from "../store";
import type { Pin } from "../workspace";

export function PinMenu({ pin, spaceId, x, y, onClose: finishClose }: {
  pin: Pin; spaceId: string; x: number; y: number; onClose: () => void;
}) {
  const pins = useStore(state => state.layout.pins[spaceId]);
  const index = pins?.findIndex(item => item.url === pin.url) ?? -1;
  const trigger = useRef(document.activeElement as HTMLElement | null);
  function action(work: () => unknown | Promise<unknown>) {
    finishClose();
    void Promise.resolve().then(work).catch(errToast);
  }
  return <Menu label="Pinned site" point={{ x, y }} onClose={finishClose} returnFocus={trigger} className="menu ctx-menu">
    <button className="menu-item" role="menuitem" onClick={() => action(() => useStore.getState().newTab(pin.url))}>Open in new tab</button>
    <button className="menu-item" role="menuitem" onClick={() => action(() => useStore.getState().openBackgroundTab(pin.url, spaceId, false))}>Open in background tab</button>
    <button className="menu-item" role="menuitem" onClick={() => action(async () => { await navigator.clipboard.writeText(pin.url); toast("URL copied"); })}>Copy URL</button>
    <div className="menu-sep" role="separator" />
    {index > 0 && <button className="menu-item" role="menuitem" onClick={() => action(() => useStore.getState().reorderPin(spaceId, pin.url, pins![0]!.url))}>Move to front</button>}
    {index > 0 && <button className="menu-item" role="menuitem" onClick={() => action(() => useStore.getState().reorderPin(spaceId, pin.url, pins![index - 1]!.url))}>Move earlier</button>}
    {index >= 0 && index < (pins?.length ?? 0) - 1 && <button className="menu-item" role="menuitem" onClick={() => action(() => useStore.getState().reorderPin(spaceId, pin.url, pins?.[index + 2]?.url ?? null))}>Move later</button>}

    <button className="menu-item" role="menuitem" onClick={() => action(() => {
      const state = useStore.getState();
      if (state.layout.pins[spaceId]?.some(item => item.url === pin.url)) { state.togglePin(pin, spaceId); toast("Unpinned"); }
    })}>Unpin from this Space</button>
  </Menu>;
}
