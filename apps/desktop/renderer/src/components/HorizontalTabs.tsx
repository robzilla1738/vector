import { useEffect, useRef, useState } from "react";
import type { PageTarget } from "@aux/contracts";
import { errToast, useStore } from "../store";
import { tabsInSpace } from "../workspace";
import { moveListFocus } from "../keyboard-list";
import { FavIcon } from "./SiteTile";
import { TabAudioButton } from "./TabAudioButton";
import { useTabSelection } from "../use-tab-selection";
import { TabMenu } from "./TabMenu";
import { I } from "./icons";
import { TAB_DRAG_TYPE } from "../bookmark-drop";
import { useShortcutLabels, withShortcut } from "../use-shortcut-label";

export function HorizontalTabs() {
  const key = useShortcutLabels();
  const layout = useStore(state => state.layout);
  const pages = useStore(state => state.pages);
  const activePageId = useStore(state => state.activePageId);
  const mode = useStore(state => state.mode);
  const tabs = tabsInSpace(layout, pages, layout.activeSpaceId);
  const selection = useTabSelection(tabs, layout.activeSpaceId, activePageId);
  const [menu, setMenu] = useState<{ page: PageTarget; x: number; y: number } | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const dragging = useRef<string | null>(null);
  const dragIds = useRef<string[]>([]);
  const strip = useRef<HTMLDivElement>(null);
  useEffect(() => {
    strip.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activePageId, mode, layout.order]);

  const focusablePage=tabs.some(page=>page.pageId===activePageId)?activePageId:tabs[0]?.pageId;

  return <>
    <div className="horizontal-tabs-row">
    <div ref={strip} className="horizontal-tabs" role="tablist" aria-multiselectable="true" aria-label="Browser tabs" aria-orientation="horizontal" onKeyDown={event => { if (selection.keyDown(event)) return; moveListFocus(event, '[role="tab"]', false); }}>
      {tabs.map((page, index) => <div className={`horizontal-tab ${selection.ids.includes(page.pageId) ? "multi-selected" : ""} ${dropIndex === index ? "drop-before" : ""} ${dropIndex === tabs.length && index === tabs.length - 1 ? "drop-after" : ""}`} key={page.pageId}
        draggable onDragStart={event => { dragging.current = page.pageId; dragIds.current = selection.ids.includes(page.pageId) ? [...selection.ids] : [page.pageId]; event.dataTransfer.effectAllowed = "copyMove"; event.dataTransfer.setData("text/plain", dragIds.current.join("\n")); event.dataTransfer.setData(TAB_DRAG_TYPE, dragIds.current.join("\n")); }}
        onDragOver={event => { if (!dragging.current) return; event.preventDefault(); const bounds = event.currentTarget.getBoundingClientRect(); setDropIndex(index + (event.clientX > bounds.x + bounds.width / 2 ? 1 : 0)); }}
        onDrop={event => { event.preventDefault(); const from = tabs.findIndex(tab => tab.pageId === dragging.current); if (from >= 0 && dropIndex !== null) { if (dragIds.current.length > 1) { const before = tabs.slice(dropIndex).find(tab => !dragIds.current.includes(tab.pageId)); useStore.getState().moveTabs(tabs.filter(tab => dragIds.current.includes(tab.pageId)).map(tab => tab.pageId), layout.activeSpaceId, undefined, before?.pageId ?? null); } else useStore.getState().reorderTabs(layout.activeSpaceId, from, dropIndex); } dragging.current = null; setDropIndex(null); }}
        onDragEnd={() => { dragging.current = null; setDropIndex(null); }}
        onAuxClick={event => { if (event.button === 1) { event.preventDefault(); void useStore.getState().closeTab(page.pageId).catch(errToast); } }}
        onContextMenu={event => { event.preventDefault(); setMenu({ page, x: event.clientX, y: event.clientY }); }}>
        <button role="tab" tabIndex={focusablePage === page.pageId ? 0 : -1} data-active={activePageId === page.pageId && mode === "focus"} aria-selected={selection.ids.length ? selection.ids.includes(page.pageId) : activePageId === page.pageId && mode === "focus"} title={page.url}
          onClick={event => { if (!selection.select(page.pageId, event)) void useStore.getState().activate(page.pageId).catch(errToast); }} onKeyDown={event => {
            if(event.nativeEvent.isComposing || selection.keyDown(event))return;
            if ((event.key === " " || event.key === "Enter") && (event.metaKey || event.ctrlKey || event.shiftKey)) { event.preventDefault(); selection.select(page.pageId, event); return; }
            if(event.key==="ContextMenu"||(event.shiftKey&&event.key==="F10")){
              event.preventDefault();event.stopPropagation();const rect=event.currentTarget.getBoundingClientRect();setMenu({page,x:rect.left,y:rect.bottom});return;
            }
            if(["Delete","Backspace"].includes(event.key)&&!event.metaKey&&!event.ctrlKey){
              event.preventDefault();event.stopPropagation();
              void useStore.getState().closeTab(page.pageId).then(()=>requestAnimationFrame(()=>strip.current?.querySelector<HTMLElement>('[role="tab"][tabindex="0"]')?.focus())).catch(errToast);return;
            }
            if (event.altKey && ["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); event.stopPropagation(); useStore.getState().reorderTabs(layout.activeSpaceId, index, event.key === "ArrowLeft" ? index - 1 : index + 2); }
          }}>
          {page.viewStatus==="crashed"?I.alert:page.loading?<span className="spin" aria-label="Loading"/>:<FavIcon url={page.url} src={page.favicon} size="sm" />}<span className="horizontal-tab-title">{page.title || "New Tab"}</span>
        </button>
        <TabAudioButton pageId={page.pageId} title={page.title || "New Tab"} />
        <button className="horizontal-tab-close" aria-label={`Close ${page.title || "New Tab"}`} onClick={() => void useStore.getState().closeTab(page.pageId).catch(errToast)}>{I.close}</button>
      </div>)}
    </div>
      <div className="horizontal-tab-tools">
        <button className="icon-btn" aria-label="New tab" title={withShortcut("New tab", key("new-tab"))} onClick={() => void useStore.getState().newTab().catch(errToast)}>{I.plus}</button>
      </div>
    </div>
    {menu && <TabMenu selectedPages={selection.pagesFor(menu.page)} onSelectionDone={selection.clear} page={menu.page} x={menu.x} y={menu.y} onClose={() => setMenu(null)} />}
  </>;
}
