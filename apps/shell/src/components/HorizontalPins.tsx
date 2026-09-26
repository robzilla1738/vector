import { useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { errToast, useStore } from "../store";
import { tabsInSpace, type Pin } from "../workspace";
import { detailsMenuKey } from "../keyboard-list";
import { FavIcon } from "./SiteTile";
import { PinMenu } from "./PinMenu";

export function HorizontalPins({ pins, spaceId, activePageId }: { pins: Pin[]; spaceId: string; activePageId: string | null }) {
  const tabs = useStore(useShallow(state => tabsInSpace(state.layout, state.pages, spaceId).filter(page => pins.some(pin => pin.url === page.url))));
  const dragging = useRef<string | null>(null);
  const overflow = useRef<HTMLDetailsElement>(null);
  const [menu, setMenu] = useState<{ pin: Pin; x: number; y: number } | null>(null);
  if (!pins.length) return null;
  const openPin = (pin: Pin, background = false) => {
    if (overflow.current) overflow.current.open = false;
    const state = useStore.getState();
    const open = tabs.find(page => page.url === pin.url);
    void (background ? state.openBackgroundTab(pin.url, spaceId, false) : open ? state.activate(open.pageId) : state.newTab(pin.url)).catch(errToast);
  };
  const contextMenu = (pin: Pin, x: number, y: number) => {
    if (overflow.current) overflow.current.open = false;
    setMenu({ pin, x, y });
  };
  return <>
    <div className="horizontal-pins" role="group" aria-label="Pinned sites">
      {pins.slice(0, 5).map(pin => {
        const open = tabs.find(page => page.url === pin.url);
        return <button key={pin.url} className="horizontal-pin" aria-label={pin.title} title={pin.title} aria-pressed={!!open && open.pageId === activePageId} aria-haspopup="menu"
          draggable onDragStart={event => { dragging.current = pin.url; event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", pin.url); }}
          onDragEnd={() => { dragging.current = null; }}
          onDragOver={event => { if (dragging.current) { event.preventDefault(); event.dataTransfer.dropEffect = "move"; } }}
          onDrop={event => { if (!dragging.current) return; event.preventDefault(); const rect = event.currentTarget.getBoundingClientRect(); const index = pins.indexOf(pin); useStore.getState().reorderPin(spaceId, dragging.current, event.clientX > rect.x + rect.width / 2 ? pins[index + 1]?.url ?? null : pin.url); dragging.current = null; }}
          onClick={event => openPin(pin, event.metaKey || event.ctrlKey)} onAuxClick={event => { if (event.button === 1) { event.preventDefault(); openPin(pin, true); } }}
          onContextMenu={event => { event.preventDefault(); contextMenu(pin, event.clientX, event.clientY); }}
          onKeyDown={event => { if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) { event.preventDefault(); const rect = event.currentTarget.getBoundingClientRect(); contextMenu(pin, rect.x, rect.bottom); } }}>
          <FavIcon url={pin.url} src={open?.favicon} size="sm" />
        </button>;
      })}
      {pins.length > 5 && <details ref={overflow} className="horizontal-pin-overflow" onKeyDown={detailsMenuKey} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) event.currentTarget.open = false; }}>
        <summary aria-label={`${pins.length - 5} more pinned sites`}>+{pins.length - 5}</summary>
        <div className="menu" role="menu" aria-label="More pinned sites">
          {pins.slice(5).map(pin => <button key={pin.url} className="menu-item" role="menuitem" onClick={event => openPin(pin, event.metaKey || event.ctrlKey)} onContextMenu={event => { event.preventDefault(); contextMenu(pin, event.clientX, event.clientY); }}><FavIcon url={pin.url} src={tabs.find(page => page.url === pin.url)?.favicon} size="sm" /><span className="t">{pin.title}</span></button>)}
        </div>
      </details>}
    </div>
    {menu && <PinMenu {...menu} spaceId={spaceId} onClose={() => setMenu(null)} />}
  </>;
}
