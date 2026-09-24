import { Fragment, useEffect, useRef, useState } from "react";
import type { PageTarget } from "@aux/contracts";
import { errToast, useStore } from "../store";
import { groupedTabs, tabsInSpace } from "../workspace";
import { moveListFocus } from "../keyboard-list";
import { FolderContextMenu, SpaceEditor, SpaceMenu } from "./Sidebar";
import { TabPreview } from "./TabPreview";
import { HorizontalPins } from "./HorizontalPins";
import { AuxMark } from "./AuxMark";
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
  const allTabs = tabsInSpace(layout, pages, layout.activeSpaceId);
  const folders = layout.folders.filter(folder => folder.spaceId === layout.activeSpaceId);
  const ordered = groupedTabs(layout, allTabs);
  const groupCount = folders.filter(folder => allTabs.some(page => layout.tabFolder[page.pageId] === folder.id)).length;
  const tabs = ordered.filter(page => !folders.find(folder => folder.id === layout.tabFolder[page.pageId])?.collapsed || page.pageId === activePageId);
  const [groupMenu, setGroupMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [spaceMenuOpen, setSpaceMenuOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<typeof layout.spaces[number] | "new" | null>(null);
  const [preview, setPreview] = useState<{ page: PageTarget; x: number; y: number } | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hidePreview = () => { if (previewTimer.current) clearTimeout(previewTimer.current); previewTimer.current = null; setPreview(null); };
  const showPreview = (page: PageTarget, element: HTMLElement) => {
    hidePreview();
    const rect = element.getBoundingClientRect();
    previewTimer.current = setTimeout(() => { previewTimer.current = null; setPreview({ page, x: rect.left, y: rect.bottom }); }, 450);
  };
  useEffect(() => {
    const hide = () => hidePreview();
    window.addEventListener("resize", hide);
    window.addEventListener("blur", hide);
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") hide(); };
    window.addEventListener("keydown", key);
    return () => { if (previewTimer.current) clearTimeout(previewTimer.current); window.removeEventListener("resize", hide); window.removeEventListener("blur", hide); window.removeEventListener("keydown", key); };
  }, []);
  useEffect(() => { hidePreview(); }, [activePageId, layout.activeSpaceId]);
  const pins = layout.pins[layout.activeSpaceId] ?? [];
  const space = layout.spaces.find(item => item.id === layout.activeSpaceId);
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
    <HorizontalPins pins={pins} tabs={allTabs} spaceId={layout.activeSpaceId} activePageId={activePageId} />
    <div ref={strip} className="horizontal-tabs" style={{ width: Math.max(1, tabs.length) * 200 + groupCount * 96 + 24 }} onScroll={hidePreview} role="tablist" aria-multiselectable="true" aria-label="Browser tabs" aria-orientation="horizontal" onKeyDown={event => { if (selection.keyDown(event)) return; moveListFocus(event, '[role="tab"], .horizontal-group-chip', false); }}>
      {allTabs.length === 0 && <button className="horizontal-tab empty" role="tab" aria-selected="true" onClick={() => void useStore.getState().newTab().catch(errToast)}><span className="horizontal-empty-icon"><AuxMark /></span><span>New Tab</span></button>}
      {ordered.map((page) => {
        const folder = folders.find(item => item.id === layout.tabFolder[page.pageId]);
        const first = folder && ordered.find(item => layout.tabFolder[item.pageId] === folder.id)?.pageId === page.pageId;
        const index = tabs.indexOf(page);
        return <Fragment key={page.pageId}>
        {first && <div className="horizontal-group" data-space={folder.color}>
          {renaming === folder.id ? <input autoFocus aria-label="Tab group name" defaultValue={folder.name} maxLength={200} onBlur={event => { useStore.getState().renameFolder(folder.id, event.target.value); setRenaming(null); }} onKeyDown={event => { event.stopPropagation(); if (event.key === "Enter") event.currentTarget.blur(); if (event.key === "Escape") { event.currentTarget.value = folder.name; event.currentTarget.blur(); } }} /> : <button className="horizontal-group-chip" aria-expanded={!folder.collapsed} aria-label={`${folder.name} tab group`} title={`${folder.name} · Double-click to rename`} onContextMenu={event => { event.preventDefault(); setGroupMenu({ id: folder.id, x: event.clientX, y: event.clientY }); }} onKeyDown={event => { if (event.key === "F2") { event.preventDefault(); setRenaming(folder.id); } if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) { event.preventDefault(); const rect = event.currentTarget.getBoundingClientRect(); setGroupMenu({ id: folder.id, x: rect.left, y: rect.bottom }); } }} onDoubleClick={() => setRenaming(folder.id)} onClick={() => useStore.getState().toggleFolder(folder.id)} onDragOver={event => { if (dragging.current) event.preventDefault(); }} onDrop={event => { if (!dragging.current) return; event.preventDefault(); useStore.getState().moveTabs(dragIds.current, layout.activeSpaceId, folder.id); dragging.current = null; setDropIndex(null); }}><span>{folder.name}</span><small>{allTabs.filter(item => layout.tabFolder[item.pageId] === folder.id).length}</small></button>}
        </div>}
        {index >= 0 && <div className={`horizontal-tab ${selection.ids.includes(page.pageId) ? "multi-selected" : ""} ${dropIndex === index ? "drop-before" : ""} ${dropIndex === tabs.length && index === tabs.length - 1 ? "drop-after" : ""}`}
        onMouseEnter={event => showPreview(page, event.currentTarget)} onMouseMove={event => { if (!preview && !previewTimer.current && !dragging.current) showPreview(page, event.currentTarget); }} onMouseLeave={hidePreview} onFocus={event => showPreview(page, event.currentTarget)} onBlur={hidePreview} onPointerDown={hidePreview}
        draggable onDragStart={event => { hidePreview(); dragging.current = page.pageId; dragIds.current = selection.ids.includes(page.pageId) ? [...selection.ids] : [page.pageId]; event.dataTransfer.effectAllowed = "copyMove"; event.dataTransfer.setData("text/plain", dragIds.current.join("\n")); event.dataTransfer.setData(TAB_DRAG_TYPE, dragIds.current.join("\n")); }}
        onDragOver={event => { if (!dragging.current) return; event.preventDefault(); const bounds = event.currentTarget.getBoundingClientRect(); setDropIndex(index + (event.clientX > bounds.x + bounds.width / 2 ? 1 : 0)); }}
        onDrop={event => { event.preventDefault(); if (dragging.current && dropIndex !== null) { const before = tabs.slice(dropIndex).find(tab => !dragIds.current.includes(tab.pageId)); useStore.getState().moveTabs(dragIds.current, layout.activeSpaceId, folder?.id ?? null, before?.pageId ?? null); } dragging.current = null; setDropIndex(null); }}
        onDragEnd={() => { dragging.current = null; setDropIndex(null); }}
        onAuxClick={event => { if (event.button === 1) { event.preventDefault(); void useStore.getState().closeTab(page.pageId).catch(errToast); } }}
        onContextMenu={event => { hidePreview(); event.preventDefault(); setMenu({ page, x: event.clientX, y: event.clientY }); }}>
        <button className="horizontal-tab-select" role="tab" tabIndex={focusablePage === page.pageId ? 0 : -1} data-active={activePageId === page.pageId && mode === "focus"} aria-selected={selection.ids.length ? selection.ids.includes(page.pageId) : activePageId === page.pageId && mode === "focus"}
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
            if (event.altKey && ["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); event.stopPropagation(); const peers = allTabs.filter(item => (layout.tabFolder[item.pageId] ?? null) === (folder?.id ?? null)); const from = peers.indexOf(page); const to = event.key === "ArrowLeft" ? from - 1 : from + 2; if (to >= 0 && to <= peers.length) useStore.getState().reorderGroup(layout.activeSpaceId, folder?.id ?? null, from, to); }
          }}>
          {page.viewStatus==="crashed"?I.alert:page.loading?<span className="spin" aria-label="Loading"/>:page.url === "about:blank" ? <span className="horizontal-empty-icon"><AuxMark /></span> : <FavIcon url={page.url} src={page.favicon} size="sm" />}<span className="horizontal-tab-title">{page.title || "New Tab"}</span>
        </button>
        <TabAudioButton pageId={page.pageId} title={page.title || "New Tab"} />
        <button className="horizontal-tab-close" aria-label={`Close ${page.title || "New Tab"}`} onClick={() => void useStore.getState().closeTab(page.pageId).catch(errToast)}>{I.close}</button>
      </div>}</Fragment>; })}
    </div>
      <div className="horizontal-tab-tools">
        <button className="icon-btn" aria-label="New tab" title={withShortcut("New tab", key("new-tab"))} onClick={() => void useStore.getState().newTab().catch(errToast)}>{I.plus}</button>
      </div>
      <div className="horizontal-tabs-spacer" />
      <div className="horizontal-space" data-space={space?.color}>
        <button className="horizontal-profile" aria-label={`Switch space, current: ${space?.name ?? "Personal"}`} aria-haspopup="menu" aria-expanded={spaceMenuOpen} title="Switch space" onClick={() => setSpaceMenuOpen(open => !open)}>
          {I.person}<span className="horizontal-space-name">{space?.name ?? "Personal"}</span>{I.down}
        </button>
        {spaceMenuOpen && <SpaceMenu
          spaces={layout.spaces}
          archivedSpaces={layout.archivedSpaces ?? []}
          active={layout.activeSpaceId}
          onPick={id => useStore.getState().switchSpace(id)}
          onNew={() => setEditingSpace("new")}
          onEdit={setEditingSpace}
          onDelete={id => void useStore.getState().deleteSpace(id).catch(errToast)}
          onRestore={id => void useStore.getState().restoreSpace(id).catch(errToast)}
          onHistory={() => useStore.getState().setOverlay("history")}
          onDownloads={() => useStore.getState().setOverlay("downloads")}
          onSettings={() => useStore.getState().setOverlay("settings")}
          onClose={() => setSpaceMenuOpen(false)}
        />}
      </div>
    </div>
    {editingSpace && <SpaceEditor space={editingSpace === "new" ? null : editingSpace} onClose={() => setEditingSpace(null)}
      onSave={(name, color) => editingSpace === "new" ? useStore.getState().addSpace(name, color) : useStore.getState().editSpace(editingSpace.id, name, color)} />}
    {groupMenu && folders.some(folder => folder.id === groupMenu.id) && <FolderContextMenu group folder={folders.find(folder => folder.id === groupMenu.id)!} x={groupMenu.x} y={groupMenu.y} onClose={() => setGroupMenu(null)} onRename={() => setRenaming(groupMenu.id)} onDelete={() => { useStore.getState().deleteFolder(groupMenu.id); setGroupMenu(null); }} />}
    {preview && !groupMenu && !menu && pages.some(page => page.pageId === preview.page.pageId) && <TabPreview {...preview} page={pages.find(page => page.pageId === preview.page.pageId)!} />}
    {menu && <TabMenu selectedPages={selection.pagesFor(menu.page)} onSelectionDone={selection.clear} page={menu.page} x={menu.x} y={menu.y} onClose={() => setMenu(null)} />}
  </>;
}
