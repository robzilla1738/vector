import { useWindowDrag } from "../use-window-drag";
import { ChatSessions } from "./ChatSessions";
import { TabPreview, useSidebarTabPreview } from "./TabPreview";
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import type { PageTarget } from "@aux/contracts";
import { bridge, inNativeHost } from "../bridge";
import { useStore, call, errToast, toast } from "../store";
import { PIN_ROW_SIZE, SPACE_COLORS, foldersInSpace, hostOf, tabsInFolder, tabsInSpace, unfiledTabs, type Folder, type Pin, type Space, type SpaceColor } from "../workspace";

import { isScrimOverlay } from "../chrome";
import { bookmarkTabsFromDrop, TAB_DRAG_TYPE } from "../bookmark-drop";
import { requestStageReport } from "../stage-obstruction";
import { detailsMenuKey, moveMenuFocus, moveListFocus } from "../keyboard-list";
import { ResizeHandle } from "./ResizeHandle";
import { SidebarSection } from "./SidebarSection";
import { FavIcon, SiteTile } from "./SiteTile";
import { useTabSelection } from "../use-tab-selection";
import { useMenuDismiss } from "../use-menu-dismiss";
import { positionContextMenu } from "../position-context-menu";
import { backgroundLink, openBrowserLink } from "../browser-links";
import { PinMenu } from "./PinMenu";
import { TabMenu } from "./TabMenu";
import { TabAudioButton } from "./TabAudioButton";
import { I } from "./icons";
import { useWindowedRows } from "../use-windowed-rows";
import { useShortcutLabels, withShortcut } from "../use-shortcut-label";
import { useDismissable } from "../use-dismissable";

const IDLE_DRAG = { folderId: null as string | null, from: -1, to: null as number | null, pageId: "", over: null as string | null };

function FolderKids({ collapsed, count, children }: { collapsed: boolean; count: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const animRef = useRef<Animation | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fromH = el.getBoundingClientRect().height;
    const fromOp = Number.parseFloat(getComputedStyle(el).opacity);
    animRef.current?.cancel();
    const target = collapsed ? 0 : contentRef.current?.scrollHeight ?? 0;
    el.style.height = `${target}px`;
    el.style.opacity = target > 0 ? "1" : "0";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const skip = first.current || reduce || document.hidden || Math.abs(fromH - target) < 0.5;
    first.current = false;
    const root = getComputedStyle(document.documentElement);
    const duration = Number.parseFloat(root.getPropertyValue("--t-slow")) || 240;
    const easing = root.getPropertyValue("--ease-in-out").trim() || "ease";
    if (skip || duration <= 0) return;
    const anim = el.animate(
      [
        { height: `${fromH}px`, opacity: Number.isFinite(fromOp) ? fromOp : 0 },
        { height: `${target}px`, opacity: target > 0 ? 1 : 0 },
      ],
      { duration, easing },
    );
    animRef.current = anim;
    void anim.finished.then(() => {
      if (animRef.current === anim) animRef.current = null;
    }, () => { /* Reversing a toggle deliberately cancels the previous animation. */ });
  }, [collapsed, count]);

  useEffect(() => () => animRef.current?.cancel(), []);

  return (
    <div
      ref={ref}
      className="folder-kids"
      inert={collapsed ? true : undefined}
      aria-hidden={collapsed}
    >
      <div ref={contentRef} className="folder-kids-inner">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab row                                                             */
/* ------------------------------------------------------------------ */

interface TabRowProps {
  p: PageTarget;
  active: boolean;
  selected: boolean;
  selecting: boolean;
  onSelectionKey: (event: React.KeyboardEvent) => boolean;
  onSelect: (id: string, event: React.MouseEvent | React.KeyboardEvent) => boolean;
  index: number;
  folderId: string | null;
  dragging: boolean;
  dropBefore: boolean;
  dropAfter: boolean;
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
  onDragStart: (folderId: string | null, index: number, pageId: string, e: React.DragEvent) => void;
  onDragOver: (folderId: string | null, index: number, e: React.DragEvent) => void;
  onDrop: (folderId: string | null, e: React.DragEvent) => void;
  onDragEnd: () => void;
  onContext: (p: PageTarget, x: number, y: number) => void;
  onKeyMove: (folderId: string | null, index: number, dir: -1 | 1) => void;
}

const TabRow = memo(function TabRow({ p, active, selected, selecting, onSelect, onSelectionKey, index, folderId, dragging, dropBefore, dropAfter, onActivate, onClose, onDragStart, onDragOver, onDrop, onDragEnd, onContext, onKeyMove }: TabRowProps) {
  const key = useShortcutLabels();
  const preview = useSidebarTabPreview();
  const row = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (active && !row.current?.closest('[inert]')) row.current?.scrollIntoView({ block: "nearest" });
  }, [active]);
  const crashed = p.viewStatus === "crashed";
  const sleeping = !crashed && (p.lifecycle === "frozen" || p.lifecycle === "discarded" || p.lifecycle === "placeholder");
  const title = p.title || (p.url && p.url !== "about:blank" ? hostOf(p.url) : "New Tab");
  return (
    <>
    <div
      ref={row}
      onMouseEnter={event => preview.show(event.currentTarget)} onMouseLeave={preview.hide}
      onFocus={event => preview.show(event.currentTarget)} onBlur={preview.hide} onPointerDown={preview.hide}
      className={`tab-row ${active ? "active" : ""} ${selected ? "multi-selected" : ""} ${crashed ? "crashed" : ""} ${sleeping ? "sleeping" : ""} ${dragging ? "dragging" : ""} ${dropBefore ? "drop-before" : ""} ${dropAfter ? "drop-after" : ""}`}
      role="tab"
      aria-selected={selecting ? selected : active}
      tabIndex={active ? 0 : -1}
      data-index={index}
      draggable
      onClick={event => { if (!onSelect(p.pageId, event)) onActivate(p.pageId); }}
      onAuxClick={(e) => {
        if (e.button === 1) {
          e.preventDefault();
          onClose(p.pageId);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContext(p, e.clientX, e.clientY);
      }}
      onKeyDown={(e) => {
        if(e.nativeEvent.isComposing || onSelectionKey(e))return;
        if(e.key==="ContextMenu"||(e.shiftKey&&e.key==="F10")){
          e.preventDefault();e.stopPropagation();const rect=e.currentTarget.getBoundingClientRect();onContext(p,rect.left,rect.bottom);return;
        }
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!onSelect(p.pageId, e)) onActivate(p.pageId);
        } else if ((e.key === "Backspace" || e.key === "Delete") && !e.metaKey) {
          e.preventDefault();
          onClose(p.pageId);
        } else if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
          e.preventDefault();
          onKeyMove(folderId, index, e.key === "ArrowUp" ? -1 : 1);
        }
      }}
      onDragStart={(e) => onDragStart(folderId, index, p.pageId, e)}
      onDragOver={(e) => onDragOver(folderId, index, e)}
      onDrop={(e) => onDrop(folderId, e)}
      onDragEnd={onDragEnd}
    >
      <span className="tab-fav">
        {crashed ? I.alert : p.loading ? <span className="spin" /> : <FavIcon url={p.url} src={p.favicon} size="sm" />}
      </span>
      <span className="tab-title">{title}</span>
      <TabAudioButton pageId={p.pageId} title={title}/>
      {p.controller === "agent" || p.controller === "external" ? (
        <span className="tab-state agent" title="The agent is driving this tab">{I.agentSm}</span>
      ) : p.controller === "human" ? (
        <span className="tab-state human" title="You're in control — the agent is waiting">{I.handSm}</span>
      ) : null}
      <button
        className="tab-close"
        tabIndex={-1}
        title={withShortcut("Close tab", key("close-tab"))}
        aria-label={`Close ${title}`}
        onClick={(e) => {
          e.stopPropagation();
          onClose(p.pageId);
        }}
      >
        {I.close}
      </button>
    </div>
    {preview.position && !dragging && <TabPreview page={p} {...preview.position} />}
    </>
  );
});

/* ------------------------------------------------------------------ */
/*  Space switcher                                                      */
/* ------------------------------------------------------------------ */

export function SpaceMenu({ spaces, active, onPick, onNew, onNewFolder, onEdit, onDelete, onCollapse, onHistory, onDownloads, onSettings, onClose: finishClose, archivedSpaces, onRestore }: {
  archivedSpaces: Space[];
  onRestore: (id: string) => void;
  spaces: Space[];
  active: string;
  onPick: (id: string) => void;
  onNew: () => void;
  onNewFolder?: () => void;
  onEdit: (s: Space) => void;
  onDelete: (id: string) => void;
  onCollapse?: () => void;
  onHistory: () => void;
  onDownloads: () => void;
  onSettings: () => void;
  onClose: () => void;
}) {
  const key = useShortcutLabels();
  const ref = useRef<HTMLDivElement>(null);
  const onClose = useMenuDismiss(ref, finishClose);
  const closeRef = useRef(onClose); closeRef.current = onClose;
  const trigger = useRef(document.activeElement as HTMLElement | null);
  const [profileName, setProfileName] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [spaceQuery, setSpaceQuery] = useState("");
  const currentSpace = spaces.find(space => space.id === active);
  const matchesSpace = (space: Space) => space.name.toLocaleLowerCase().includes(spaceQuery.trim().toLocaleLowerCase());
  const visibleSpaces = [...spaces].sort((a, b) => Number(b.id === active) - Number(a.id === active)).filter(matchesSpace);
  useEffect(() => {
    if (!inNativeHost || bridge.privateMode) return;
    let live = true;
    void bridge.browserProfiles().then(items => { if (live) setProfileName(items.find(item => item.current)?.name ?? ""); }).catch(() => {});
    return () => { live = false; };
  }, []);
  useEffect(() => {
    const outside = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) closeRef.current(); };
    document.addEventListener("mousedown", outside);
    ref.current?.querySelector<HTMLElement>('input[type="search"], [role^="menuitem"]')?.focus();
    return () => document.removeEventListener("mousedown", outside);
  }, []);
  useDismissable(true, () => { closeRef.current(); trigger.current?.focus(); });
  // Choosing an item changes the underlying view immediately. Remove the menu
  // in the same turn so a new dialog or Space never inherits its closing layer.
  const choose = (action: () => void) => { action(); finishClose(); };
  const actions = [
    { label: "New space", icon: I.plusSm, run: onNew },
    ...(onNewFolder ? [{ label: "New folder", icon: I.folderClosed, run: onNewFolder }] : []),
    { label: "History", icon: I.clockSm, run: onHistory, key: key("history"), separator: true },
    { label: "Downloads", icon: I.downloadSm, run: onDownloads, key: key("downloads") },
    ...(!bridge.privateMode ? [{ label: "Settings", icon: I.gearSm, run: onSettings, key: key("settings") }] : []),
    ...(onCollapse ? [{ label: "Collapse sidebar", icon: I.sidebarCloseSm, run: onCollapse, key: key("sidebar"), separator: true }] : []),
  ];
  return (
    <div className="menu space-menu" role="menu" aria-label="Spaces and browser controls" ref={ref}
      onKeyDown={event => { if (event.key === "Tab") { event.preventDefault(); onClose(); trigger.current?.focus(); } else moveMenuFocus(event); }}>
      {profileName && <div className="menu-caption space-profile-caption" title={`${profileName} browser profile`}>Profile · {profileName}</div>}
      {bridge.privateMode && <div className="menu-caption">Private window</div>}
      <div className="space-current" data-space={currentSpace?.color}><span className="space-dot" /><div><small>Current Space</small><strong>{currentSpace?.name ?? "Space"}</strong></div></div>
      {spaces.length + archivedSpaces.length > 6 && <label className="space-search">{I.search}<input type="search" aria-label="Search Spaces" placeholder="Find a Space…" value={spaceQuery} onChange={event => setSpaceQuery(event.target.value)} onKeyDown={event => {
        if (event.key === "ArrowDown") { event.preventDefault(); ref.current?.querySelector<HTMLElement>('[role="menuitemradio"]')?.focus(); }
      }} /></label>}
      {!visibleSpaces.length && <p className="menu-caption" role="status">No matching Spaces</p>}
      {visibleSpaces.map(space => <div className="space-menu-row" key={space.id} data-space={space.color} role="none">
        <button className={`menu-item ${space.id === active ? "on" : ""}`} role="menuitemradio" aria-checked={space.id === active}
          onClick={() => choose(() => onPick(space.id))}>
          <span className="space-dot" /><span className="t">{space.name}</span>
        </button>
        <span className="menu-acts" role="none">
          <button className="icon-btn xs" role="menuitem" aria-label={`Edit ${space.name}`} onClick={() => choose(() => onEdit(space))}>{I.pencil}</button>
          {spaces.length > 1 && <button className="icon-btn xs" role="menuitem" aria-label={`${bridge.privateMode ? "Delete" : "Archive"} ${space.name}`}
            onClick={() => choose(() => onDelete(space.id))}>{I.trash}</button>}
        </span>
      </div>)}
      {archivedSpaces.length > 0 && <>
        <button className="menu-item" role="menuitem" aria-expanded={showArchived} onClick={() => setShowArchived(value => !value)}>
          <span className="menu-ico">{I.reload}</span><span className="t">Archived spaces</span><span className="muted">{archivedSpaces.length}</span>
        </button>
        {showArchived && archivedSpaces.filter(matchesSpace).map(space => <button key={space.id} className="menu-item space-restore-item" role="menuitem"
          onClick={() => choose(() => onRestore(space.id))} title="Restore this space and its saved work">
          <span className="t">{space.name}</span><span className="muted">Restore</span>
        </button>)}
      </>}
      <div className="menu-sep" role="separator" />
      {actions.map(action => <div key={action.label} role="none">
        {action.separator && <div className="menu-sep" role="separator" />}
        <button className="menu-item" role="menuitem" onClick={() => choose(action.run)}>
          <span className="menu-ico">{action.icon}</span><span className="t">{action.label}</span>{action.key && <kbd>{action.key}</kbd>}
        </button>
      </div>)}
    </div>
  );
}

export function SpaceEditor({ space, onSave, onClose }: { space: Space | null; onSave: (name: string, color: SpaceColor) => Promise<void>; onClose: () => void }) {
  const [name, setName] = useState(space?.name ?? "");
  const [color, setColor] = useState<SpaceColor>(space?.color ?? "violet");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    if (!name.trim() || saving) return;
    setSaving(true); setError("");
    try { await onSave(name.trim(), color); onClose(); }
    catch (error) { setError(error instanceof Error ? error.message : String(error)); }
    finally { setSaving(false); }
  };
  const previous = useRef(document.activeElement as HTMLElement | null);
  useEffect(() => {
    void bridge.overlay(true);
    return () => {
      void bridge.overlay(isScrimOverlay(useStore.getState().overlay));
      const target = previous.current?.isConnected ? previous.current : document.querySelector<HTMLElement>('.space-switch, .horizontal-profile');
      target?.focus();
    };
  }, []);
  useDismissable(true, onClose);
  const onDialogKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;
    const items = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)')];
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  return (
    <div className="scrim-soft" onMouseDown={onClose}>
      <div className="sheet pop-in" role="dialog" aria-modal="true" onKeyDown={onDialogKey} aria-label={space ? "Edit space" : "New space"} onMouseDown={(e) => e.stopPropagation()}>
        <h3>{space ? "Edit space" : "New space"}</h3>
        <input autoFocus className="field-input" value={name} maxLength={100} disabled={saving} placeholder="Name" onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") void save(); }} />
        <div className="swatches" role="radiogroup" aria-label="Colour">
          {SPACE_COLORS.map((c) => (
            <button key={c} role="radio" aria-checked={color === c} aria-label={c} data-space={c} className={`swatch ${color === c ? "on" : ""}`} onClick={() => setColor(c)} />
          ))}
        </div>
        {error && <p role="alert" className="field-error">{error}</p>}
        <div className="sheet-acts">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!name.trim() || saving} onClick={() => void save()}>{saving ? "Saving…" : space ? "Save" : "Create"}</button>
        </div>
      </div>
    </div>
  );
}

function FolderRow({ folder, count, open, dropOn, renaming, onToggle, onRename, onStartRename, onContext, onDragOver, onDrop, onDragEnd }: {
  folder: Folder;
  count: number;
  onStartRename: () => void;
  open: boolean;
  dropOn: boolean;
  renaming: boolean;
  onToggle: () => void;
  onRename: (name: string) => void;
  onContext: (x: number, y: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const [name, setName] = useState(folder.name);
  useEffect(() => setName(folder.name), [folder.name, renaming]);
  const cancelled = useRef(false);
  const commit = () => { onRename(cancelled.current ? folder.name : name); cancelled.current = false; };
  return (
    <div
      className={`folder-row ${open ? "open" : ""} ${dropOn ? "drop-on" : ""}`}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-label={`${folder.name} tab group, ${count} ${count === 1 ? "tab" : "tabs"}`}
      onClick={() => !renaming && onToggle()}
      onDoubleClick={() => { if (!renaming) onStartRename(); }}
      onKeyDown={(e) => {
        if (renaming) return;
        if (e.key === "F2") { e.preventDefault(); e.stopPropagation(); onStartRename(); }
        else if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) { e.preventDefault(); e.stopPropagation(); const rect = e.currentTarget.getBoundingClientRect(); onContext(rect.left, rect.bottom); }
        else if (["Enter", " ", "ArrowLeft", "ArrowRight"].includes(e.key)) {
          e.preventDefault(); e.stopPropagation();
          if (e.key === "Enter" || e.key === " " || (e.key === "ArrowLeft" && open) || (e.key === "ArrowRight" && !open)) onToggle();
        }
      }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContext(e.clientX, e.clientY); }}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <span className="tab-fav folder-glyph" aria-hidden data-space={folder.color}>{folder.emoji ?? I.folderClosed}</span>
      {renaming ? (
        <input
          className="folder-name-input"
          value={name}
          autoFocus
          aria-label="Folder name"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setName(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") { e.preventDefault(); (e.target as HTMLInputElement).blur(); }
            if (e.key === "Escape") { cancelled.current = true; setName(folder.name); (e.target as HTMLInputElement).blur(); }
          }}
        />
      ) : (
        <span className="tab-title">{folder.name}</span>
      )}
      <span className="folder-count" aria-hidden="true">{count}</span>
      <span className="folder-chevron" aria-hidden="true">{I.down}</span>
    </div>
  );
}

/** Preset folder glyphs — "" resets to the default folder icon. */
const FOLDER_EMOJIS = ["", "📁", "⭐", "🔖", "📌", "🧭", "🧪", "🎯", "💼"];

/** Rows beyond this render only inside the scroll window. */
const VIRTUAL_TABS = 60;
/** The sidebar previews the newest bookmarks; the Library holds the rest. */
const SIDEBAR_BOOKMARKS = 4;

type OpenLink = (link: Pin, event: React.MouseEvent) => void;

const SidebarBookmarks = memo(function SidebarBookmarks({ onOpen, onDropped }: { onOpen: OpenLink; onDropped(): void }) {
  const bookmarks = useStore(s => s.bookmarks);
  // Favicons of open tabs, keyed by URL — a digest so unrelated tab churn doesn't re-render.
  const favicons = useStore(useShallow(s => { const byUrl: Record<string, string> = {}; for (const page of s.pages) if (page.favicon && !(page.url in byUrl)) byUrl[page.url] = page.favicon; return byUrl; }));
  const [hover, setHover] = useState(false);
  const shown = bookmarks.slice(0, SIDEBAR_BOOKMARKS);
  return <div className={`sb-bookmarks${hover ? " drop" : ""}`}
    onDragOver={event => { if (!event.dataTransfer.types.includes(TAB_DRAG_TYPE)) return; event.preventDefault(); event.dataTransfer.dropEffect = "copy"; setHover(true); }}
    onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setHover(false); }}
    onDrop={event => {
      if (!event.dataTransfer.types.includes(TAB_DRAG_TYPE)) return;
      event.preventDefault();
      setHover(false);
      const added = bookmarkTabsFromDrop(event.dataTransfer.getData(TAB_DRAG_TYPE), useStore.getState().pages);
      onDropped();
      if (!added.length) { toast("Only web tabs can be bookmarked"); return; }
      void Promise.all(added.map(tab => call("bookmarks.add", tab))).then(() => toast(added.length === 1 ? "Bookmarked" : `Bookmarked ${added.length} tabs`)).catch(errToast);
    }}>
    {bookmarks.length ? <div className="sb-bookmark-list">{shown.map(bookmark => <button className="sb-link" key={bookmark.url} title={bookmark.title || bookmark.url}
      onClick={event => onOpen(bookmark, event)} onAuxClick={event => onOpen(bookmark, event)}>
      <FavIcon url={bookmark.url} src={favicons[bookmark.url]} /><span>{bookmark.title || hostOf(bookmark.url)}</span>
    </button>)}
      {bookmarks.length > shown.length && <button className="sb-link sb-show-all" onClick={() => useStore.getState().setOverlay("bookmarks")}>Show all {bookmarks.length}</button>}
    </div> : <div className="sb-bookmarks-empty">Drag tabs here to add bookmarks</div>}
  </div>;
});

const SidebarChats = memo(function SidebarChats() {
  return <div className="sb-chats"><button className="sb-link" onClick={() => useStore.getState().openConversation(null)}>{I.pencil}<span>New chat</span></button><ChatSessions compact /></div>;
});

/* ------------------------------------------------------------------ */
/*  Sidebar                                                             */
/* ------------------------------------------------------------------ */

export const Sidebar = memo(function Sidebar() {
  const windowDrag = useWindowDrag();
  const key = useShortcutLabels();
  const sidebarPref = useStore((s) => s.sidebar);
  const sections = useStore(s => s.sidebarSections);
  const toggleSection = useStore(s => s.toggleSidebarSection);
  const railOpenNow = useStore((s) => s.railOpen && s.overlay !== "settings");
  const sidebar = sidebarPref;
  const peek = useStore(s => s.sidebarPeek);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const toggleRail = useStore((s) => s.toggleRail);
  const layout = useStore((s) => s.layout);
  const pages = useStore((s) => s.pages);
  /** 0 not saved · 1 bookmarked · 2 also on the reading list — for the active page. */
  const saved = useStore((s) => { const url = s.pages.find(p => p.pageId === s.activePageId)?.url; const b = url ? s.bookmarks.find(item => item.url === url) : undefined; return b ? b.readingList ? 2 : 1 : 0; });
  const activePageId = useStore((s) => s.activePageId);
  const mode = useStore((s) => s.mode);
  const sidebarVisible = sidebar === "expanded" || peek;
  useEffect(() => {
    if (sidebar === "expanded") return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const clear = () => { if (timer) clearTimeout(timer); };
    const open = () => { clear(); useStore.getState().setSidebarPeek(true); };
    const close = () => {
      clear();
      timer = setTimeout(() => {
        const panel = document.querySelector(".sidebar");
        if (panel?.matches(":hover, :focus-within") || document.querySelector(".menu, .sheet, .palette") || useStore.getState().overlay) return;
        useStore.getState().setSidebarPeek(false);
      }, 280);
    };
    const move = (event: PointerEvent) => {
      if (event.clientX <= 8 && event.clientY >= 48) open();
      else if (event.target instanceof Element && event.target.closest(".sidebar, .menu, .sheet, .palette")) clear();
      else close();
    };
    const unsubscribe = bridge.onSidebarEdge(near => near ? open() : close());
    window.addEventListener("pointermove", move);
    window.addEventListener("blur", close);
    return () => { clear(); unsubscribe(); window.removeEventListener("pointermove", move); window.removeEventListener("blur", close); };
  }, [sidebar]);
  const activate = useStore((s) => s.activate);
  const closeTab = useStore((s) => s.closeTab);
  const newTab = useStore((s) => s.newTab);
  const setOverlay = useStore((s) => s.setOverlay);
  const switchSpace = useStore((s) => s.switchSpace);
  const addSpace = useStore((s) => s.addSpace);
  const editSpace = useStore((s) => s.editSpace);
  const deleteSpace = useStore((s) => s.deleteSpace);
  const reorderGroup = useStore((s) => s.reorderGroup);
  const addFolder = useStore((s) => s.addFolder);
  const renameFolder = useStore((s) => s.renameFolder);
  const deleteFolder = useStore((s) => s.deleteFolder);
  const toggleFolder = useStore((s) => s.toggleFolder);
  const moveTabToFolder = useStore((s) => s.moveTabToFolder);
  const sidebarWidth = useStore((s) => s.sidebarWidth);
  const setSidebarWidth = useStore((s) => s.setSidebarWidth);
  const setMode = useStore((s) => s.setMode);
  const returnControl = useStore((s) => s.returnControl);

  const space = layout.spaces.find((s) => s.id === layout.activeSpaceId) ?? layout.spaces[0]!;
  const tabs = useMemo(() => tabsInSpace(layout, pages, space.id), [layout, pages, space.id]);
  const folders = useMemo(() => foldersInSpace(layout, space.id), [layout, space.id]);
  const loose = useMemo(() => unfiledTabs(layout, pages, space.id), [layout, pages, space.id]);
  const selection = useTabSelection([...folders.filter(folder => !folder.collapsed).flatMap(folder => tabsInFolder(layout, pages, folder.id)), ...loose], space.id, activePageId);
  const pins = layout.pins[space.id] ?? [];
  const visiblePins = pins.length > PIN_ROW_SIZE ? pins.slice(0, PIN_ROW_SIZE - 1) : pins;
  const overflowPins = pins.slice(visiblePins.length);
  const page = pages.find((p) => p.pageId === activePageId);
  const web = !!page && page.url.startsWith("http");

  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState<Space | null | "new">(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const pinDrag = useRef<{ url: string; spaceId: string } | null>(null);
  const [pinDrop, setPinDrop] = useState<string | null>(null);
  const dragIds = useRef<string[]>([]);
  const [drag, setDrag] = useState(IDLE_DRAG);
  const [ctx, setCtx] = useState<{ p: PageTarget; x: number; y: number } | null>(null);
  const [pinCtx, setPinCtx] = useState<{ pin: Pin; spaceId: string; x: number; y: number } | null>(null);
  const [folderCtx, setFolderCtx] = useState<{ folder: Folder; x: number; y: number } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      for (const menu of document.querySelectorAll<HTMLDetailsElement>(".sb-more[open], .pin-overflow[open]")) {
        if (!menu.contains(event.target as Node)) menu.open = false;
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  function pinDragProps(pin: Pin) {
    return {
      draggable: true,
      "data-pin-drop": pinDrop === pin.url || undefined,
      onDragStart: (event: React.DragEvent) => {
        pinDrag.current = { url: pin.url, spaceId: space.id };
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", pin.url);
      },
      onDragOver: (event: React.DragEvent) => {
        if (pinDrag.current?.spaceId !== space.id || pinDrag.current.url === pin.url) return;
        event.preventDefault(); event.stopPropagation();
        event.dataTransfer.dropEffect = "move"; setPinDrop(pin.url);
      },
      onDragLeave: () => setPinDrop(null),
      onDrop: (event: React.DragEvent) => {
        event.preventDefault(); event.stopPropagation();
        const moving = pinDrag.current;
        if (moving?.spaceId === space.id && moving.url !== pin.url) {
          const from = pins.findIndex(item => item.url === moving.url);
          const to = pins.findIndex(item => item.url === pin.url);
          useStore.getState().reorderPin(space.id, moving.url, from < to ? pins[to + 1]?.url ?? null : pin.url);
        }
        pinDrag.current = null; setPinDrop(null);
      },
      onDragEnd: () => { pinDrag.current = null; setPinDrop(null); },
    };
  }

  function pinMenu(pin: Pin, event: React.MouseEvent | React.KeyboardEvent) {
    event.preventDefault(); event.stopPropagation();
    event.currentTarget.closest("details")?.removeAttribute("open");
    const rect = event.currentTarget.getBoundingClientRect();
    setPinCtx({ pin, spaceId: space.id, x: "clientX" in event ? event.clientX : rect.left, y: "clientY" in event ? event.clientY : rect.bottom });
  }
  function pinKey(pin: Pin, event: React.KeyboardEvent) {
    if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) pinMenu(pin, event);
  }
  function openPin(pin: Pin, event: React.MouseEvent) {
    if (event.type === "auxclick" && event.button !== 1) return;
    event.preventDefault();
    if (backgroundLink(event)) void openBrowserLink(pin.url, true).catch(errToast);
    else {
      const open = tabs.find(page => page.url === pin.url);
      if (open) onActivate(open.pageId); else void newTab(pin.url).catch(errToast);
    }
    event.currentTarget.closest("details")?.removeAttribute("open");
  }

  const onActivate = useCallback((id: string) => void activate(id).catch(errToast), [activate]);
  const onClose = useCallback((id: string) => void closeTab(id), [closeTab]);
  const onDragStart = useCallback((folderId: string | null, index: number, pageId: string, e: React.DragEvent) => {
    const page = useStore.getState().pages.find(tab => tab.pageId === pageId);
    dragIds.current = page ? selection.pagesFor(page).map(tab => tab.pageId) : [pageId];
    e.dataTransfer.effectAllowed = "copyMove";
    e.dataTransfer.setData("text/plain", dragIds.current.join("\n"));
    e.dataTransfer.setData(TAB_DRAG_TYPE, dragIds.current.join("\n"));
    setDrag({ folderId, from: index, to: null, pageId, over: folderId });
  }, [selection.pagesFor]);
  const onDragOver = useCallback((folderId: string | null, index: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const after = e.clientY > r.top + r.height / 2;
    setDrag((d) => ({ ...d, over: folderId, to: index + (after ? 1 : 0) }));
  }, []);
  const onDrop = useCallback(
    (folderId: string | null, e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDrag((d) => {
        if (d.from < 0 || !d.pageId) return IDLE_DRAG;
        if (dragIds.current.length > 1) {
          const { layout, pages } = useStore.getState();
          const group = folderId ? tabsInFolder(layout, pages, folderId) : unfiledTabs(layout, pages, space.id);
          const before = group.slice(d.to ?? group.length).find(tab => !dragIds.current.includes(tab.pageId));
          useStore.getState().moveTabs(dragIds.current, space.id, folderId, before?.pageId ?? null);
        } else if (d.folderId !== folderId) moveTabToFolder(d.pageId, folderId);
        else if (d.to !== null) reorderGroup(space.id, folderId, d.from, d.to);
        return IDLE_DRAG;
      });
    },
    [moveTabToFolder, reorderGroup, space.id],
  );
  const onDropFolder = useCallback(
    (folderId: string, e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDrag((d) => {
        if (dragIds.current.length > 1) useStore.getState().moveTabs(dragIds.current, space.id, folderId);
        else if (d.pageId && d.folderId !== folderId) moveTabToFolder(d.pageId, folderId);
        return IDLE_DRAG;
      });
    },
    [moveTabToFolder, space.id],
  );
  const onDragEnd = useCallback(() => setDrag(IDLE_DRAG), []);
  const onContext = useCallback((p: PageTarget, x: number, y: number) => setCtx({ p, x, y }), []);
  const onKeyMove = useCallback(
    (folderId: string | null, index: number, dir: -1 | 1) => {
      const { layout, pages } = useStore.getState();
      const group = folderId ? tabsInFolder(layout, pages, folderId) : unfiledTabs(layout, pages, space.id);
      const to = dir === -1 ? index - 1 : index + 2;
      if (to < 0 || to > group.length) return;
      reorderGroup(space.id, folderId, index, to);
    },
    [reorderGroup, space.id],
  );

  const onListKey = (e: React.KeyboardEvent<HTMLElement>) => { if (selection.keyDown(e)) return; moveListFocus(e, '[role="tab"]'); };
  const selectedIds = new Set(selection.ids);
  const onBookmarkDrop = useCallback(() => { dragIds.current = []; setDrag(IDLE_DRAG); }, []);
  // Long unfiled lists render only the rows near the viewport; a drag in
  // flight renders everything so its source row never unmounts.
  const tabScroller = useRef<HTMLDivElement>(null);
  const looseRows = useRef<HTMLDivElement>(null);
  const virtual = loose.length > VIRTUAL_TABS && !drag.pageId;
  const rows = useWindowedRows(tabScroller, looseRows, loose.length, virtual, loose.findIndex(p => p.pageId === activePageId));

  const renderRow = (p: PageTarget, index: number, folderId: string | null, groupLen: number) => (
    <TabRow
      p={p}
      selected={selectedIds.has(p.pageId)}
      selecting={selection.ids.length > 0}
      onSelect={selection.select}
      onSelectionKey={selection.keyDown}
      index={index}
      folderId={folderId}
      active={p.pageId === activePageId && mode === "focus"}
      dragging={drag.folderId === folderId && drag.from === index}
      dropBefore={drag.folderId === folderId && drag.to === index && drag.from !== index && drag.from !== index - 1}
      dropAfter={drag.folderId === folderId && drag.to === index + 1 && index === groupLen - 1 && drag.from !== index}
      onActivate={onActivate}
      onClose={onClose}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onContext={onContext}
      onKeyMove={onKeyMove}
    />
  );


  const full = (
    <>
      <div className={`sb-head ${inNativeHost ? "native-host" : ""}`}><button className="icon-btn" aria-label={peek ? "Keep sidebar open" : "Collapse sidebar"} title={withShortcut(peek ? "Keep sidebar open" : "Collapse sidebar", key("sidebar"))} onClick={toggleSidebar}>{I.sidebarClose}</button></div>
      {pins.length > 0 && (
        <div className="sb-pins" role="group" aria-label="Pinned sites">
          {visiblePins.map((b) => {
            const open = tabs.find((p) => p.url === b.url);
            return (
              <SiteTile {...pinDragProps(b)} key={b.url} url={b.url} title={b.title} favicon={open?.favicon} active={!!open && open.pageId === activePageId} aria-haspopup="menu"
                onClick={event => openPin(b, event)} onAuxClick={event => openPin(b, event)}
                onKeyDown={event => pinKey(b, event)} onContextMenu={event => pinMenu(b, event)} />
            );
          })}
          {overflowPins.length > 0 && <details className="pin-overflow" onKeyDown={detailsMenuKey}>
            <summary aria-label={`${overflowPins.length} more pinned sites`} title="More pinned sites">+{overflowPins.length}</summary>
            <div className="menu pin-overflow-menu" role="menu" aria-label="More pinned sites">
              {overflowPins.map(pin => <button {...pinDragProps(pin)} className="menu-item" role="menuitem" key={pin.url} title={pin.url}
                onClick={event => openPin(pin, event)} onAuxClick={event => openPin(pin, event)}
                onKeyDown={event => pinKey(pin, event)} onContextMenu={event => pinMenu(pin, event)}>
                <span className="menu-ico">{I.pin}</span><span className="t">{pin.title || hostOf(pin.url)}</span>
              </button>)}
            </div>
          </details>}
        </div>
      )}

      {!bridge.privateMode && <SidebarSection title="Bookmarks" open={sections.bookmarks} onToggle={() => toggleSection("bookmarks")}>
        <SidebarBookmarks onOpen={openPin} onDropped={onBookmarkDrop} />
      </SidebarSection>}
      {!bridge.privateMode && <SidebarSection title="Chats" open={sections.chats} onToggle={() => toggleSection("chats")}>
        <SidebarChats />
      </SidebarSection>}
      <SidebarSection title="Tabs" open={sections.tabs} onToggle={() => toggleSection("tabs")} fill>
      <div className="sb-tabs" ref={listRef} onKeyDown={onListKey}>
        <div className="tab-list" role="tablist" aria-multiselectable="true" aria-label="Tabs" aria-orientation="vertical" ref={tabScroller}>
          <NewTabButton
            onClick={() => void newTab()}
            dropOn={!!drag.pageId && drag.folderId != null && drag.over === ""}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDrag((d) => (d.over === "" ? d : { ...d, over: "" })); }}
            onDrop={(e) => onDrop(null, e)}
            onDragEnd={onDragEnd}
          />
          {folders.map((f) => {
            const kids = tabsInFolder(layout, pages, f.id);
            return (
              <div key={f.id} className={f.collapsed ? "folder-block" : "folder-block open"} role="group" aria-label={f.name}>
                <FolderRow
                  folder={f}
                  count={kids.length}
                  onStartRename={() => setRenameId(f.id)}
                  open={!f.collapsed}
                  dropOn={!!drag.pageId && drag.over === f.id && drag.folderId !== f.id}
                  renaming={renameId === f.id}
                  onToggle={() => toggleFolder(f.id)}
                  onRename={(name) => { renameFolder(f.id, name); setRenameId(null); }}
                  onContext={(x, y) => setFolderCtx({ folder: f, x, y })}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDrag((d) => (d.over === f.id ? d : { ...d, over: f.id })); }}
                  onDrop={(e) => onDropFolder(f.id, e)}
                  onDragEnd={onDragEnd}
                />
                <FolderKids collapsed={f.collapsed} count={kids.length}>
                  {kids.map((p, i) => (
                    <div key={p.pageId} className="tab-slot">{renderRow(p, i, f.id, kids.length)}</div>
                  ))}
                </FolderKids>
              </div>
            );
          })}

          {(folders.length > 0 || loose.length > 0) && <div className="sb-rule" />}

          {virtual ? <div className="tab-window" ref={looseRows} style={{ paddingTop: rows.padTop, paddingBottom: rows.padBottom }}>
            {loose.slice(rows.start, rows.end).map((p, i) => (
              <div key={p.pageId} className="tab-slot">{renderRow(p, rows.start + i, null, loose.length)}</div>
            ))}
          </div> : loose.map((p, i) => (
            <div key={p.pageId} className="tab-slot">{renderRow(p, i, null, loose.length)}</div>
          ))}

          {tabs.length === 0 && folders.length === 0 && (
            <div className="sb-empty">No tabs in {space.name}</div>
          )}
        </div>
      </div>
      </SidebarSection>
      <div className="sb-foot">
      <div className="sb-space">
        <button className="space-switch" data-space={space.color} aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)} title="Switch space">
          <span className="space-ico">{I.person}</span>
          <span className="space-name">{space.name}</span>
        </button>
        {menuOpen && (
          <SpaceMenu
            spaces={layout.spaces}
            archivedSpaces={layout.archivedSpaces ?? []}
            onRestore={id => void useStore.getState().restoreSpace(id).catch(errToast)}
            active={space.id}
            onPick={switchSpace}
            onNew={() => setEditing("new")}
            onNewFolder={() => setRenameId(addFolder("Untitled"))}
            onEdit={(s) => setEditing(s)}
            onDelete={id => void deleteSpace(id).catch(errToast)}
            onCollapse={toggleSidebar}
            onHistory={() => setOverlay("history")}
            onDownloads={() => setOverlay("downloads")}
            onSettings={() => setOverlay("settings")}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </div>
        {bridge.privateMode ? <><span className="private-sidebar-label">Private</span><span className="sp" /><button onClick={() => setMode(mode === "overview" ? "focus" : "overview")} className="icon-btn" aria-label="Tab overview">{I.grid}</button></> : <>
        <span className="sp" />
        <button className="icon-btn" title={withShortcut("Search", key("palette"))} aria-label="Search browser" onClick={() => setOverlay("palette")}>{I.search}</button>
        {page?.controller === "human" && <button className="icon-btn" aria-label="Return control to agent" title="Return control to agent" onClick={() => void returnControl(page.pageId)}>{I.handSm}</button>}
        <button className={`icon-btn ${railOpenNow ? "on" : ""}`} title={withShortcut("Agent", key("agent-rail"))} aria-label="Toggle agent rail" aria-pressed={railOpenNow} onClick={toggleRail}>{I.agent}</button>
        <details className="sb-more" onKeyDown={detailsMenuKey}>
          <summary className="icon-btn" aria-haspopup="menu" aria-label="More" title="More">{I.more}</summary>
          <div className="sb-more-menu" role="menu" aria-label="Browser tools" onClick={event => { const details = event.currentTarget.closest("details"); if (details) details.open = false; }}>
            <button role="menuitem" aria-label="Chats" onClick={() => { useStore.getState().openConversation(null); useStore.setState({conversationId:"history"}); }}>{I.agentSm}<span>Chats</span></button>
            <button role="menuitem" aria-label="Tasks" onClick={() => setOverlay("tasks")}>{I.layersSm}<span>Tasks</span></button>
            <button role="menuitem" aria-label="Library" onClick={() => setOverlay("bookmarks")}>{I.bookmark}<span>Library</span></button>
            <button role="menuitem" aria-label="Downloads" onClick={() => setOverlay("downloads")}>{I.downloadSm}<span>Downloads</span></button>
            <hr />
            <button role="menuitem" aria-label={saved ? "Remove bookmark" : "Bookmark this page"} disabled={!web} onClick={() => {
              if (!page) return;
              void useStore.getState().toggleBookmark(page.url,page.title).catch(errToast);
            }}>{I.bookmark}<span>{saved ? "Remove bookmark" : "Bookmark this page"}</span>{key("bookmark") && <kbd>{key("bookmark")}</kbd>}</button>
            <button role="menuitem" aria-label={saved === 2 ? "Remove from reading list" : "Add to reading list"} disabled={!web} onClick={() => {
              if (!page) return;
              void useStore.getState().toggleReadingList(page.url, page.title).catch(errToast);
            }}>{I.clock}<span>{saved === 2 ? "Remove from reading list" : "Add to reading list"}</span></button>
            <button role="menuitem" aria-label="Tab overview" onClick={() => setMode(mode === "overview" ? "focus" : "overview")}>{I.grid}<span>Tab overview</span></button>
            <button role="menuitem" aria-label="Settings" onClick={() => setOverlay("settings")}>{I.gear}<span>Settings</span>{key("settings") && <kbd>{key("settings")}</kbd>}</button>
          </div>
        </details>
        </>}
      </div>
    </>
  );

  return (
    <>
      <aside
        {...windowDrag}
        className={`sidebar ${sidebar === "expanded" ? "expanded" : "fully-hidden"}${peek ? " peek" : ""}`}
        inert={!sidebarVisible ? true : undefined}
        aria-hidden={!sidebarVisible}
        data-space={space.color}
        style={{ "--sb-w": `${sidebarWidth}px` } as React.CSSProperties}
        aria-label="Sidebar"
      >
        <div className="sidebar-content" inert={!sidebarVisible ? true : undefined} aria-hidden={!sidebarVisible}>{full}</div>
        {sidebar === "expanded" && <ResizeHandle side="left" value={sidebarWidth} min={220} max={380} reset={280} onResize={setSidebarWidth} />}
      </aside>
      {editing && (
        <SpaceEditor space={editing === "new" ? null : editing} onClose={() => setEditing(null)}
          onSave={(name, color) => (editing === "new" ? addSpace(name, color) : editSpace(editing.id, name, color))} />
      )}
      {pinCtx && <PinMenu {...pinCtx} onClose={() => setPinCtx(null)} />}
      {ctx && <TabMenu selectedPages={selection.pagesFor(ctx.p)} onSelectionDone={selection.clear} page={ctx.p} x={ctx.x} y={ctx.y} onClose={() => setCtx(null)} />}
      {folderCtx && (
        <FolderContextMenu
          folder={folderCtx.folder}
          x={folderCtx.x}
          y={folderCtx.y}
          onClose={() => setFolderCtx(null)}
          onRename={() => setRenameId(folderCtx.folder.id)}
          onDelete={() => deleteFolder(folderCtx.folder.id)}
        />
      )}
    </>
  );
});


function NewTabButton({ onClick, dropOn, onDragOver, onDrop, onDragEnd }: {
  onClick: () => void;
  dropOn?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}) {
  return (
    <button className={`tab-new ${dropOn ? "drop-on" : ""}`} onClick={onClick} onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd}>
      <span className="tab-fav">{I.plus}</span>
      <span className="tab-title">New Tab</span>
    </button>
  );
}

export function FolderContextMenu({ folder, x, y, onClose: finishClose, onRename, onDelete, group = false }: {
  folder: Folder; x: number; y: number; onClose: () => void; onRename: () => void; onDelete: () => void; group?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onClose = useMenuDismiss(ref, finishClose);
  const closeRef = useRef(onClose); closeRef.current = onClose;
  const trigger = useRef(document.activeElement as HTMLElement | null);
  useLayoutEffect(() => {
    const menu = ref.current;
    if (!menu) return;
    positionContextMenu(menu, x, y);
    requestStageReport();
  }, [x, y, folder.name]);
  useEffect(() => {
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && closeRef.current();
    document.addEventListener("mousedown", h);
    ref.current?.querySelector<HTMLElement>('[role^="menuitem"]')?.focus();
    return () => {
      document.removeEventListener("mousedown", h);
      requestStageReport();
    };
  }, []);
  useDismissable(true, () => { closeRef.current(); trigger.current?.focus(); });
  const updateFolder = useStore((s) => s.updateFolder);
  return (
    <div ref={ref} className="menu ctx-menu" role="menu" aria-label={group ? "Tab group actions" : "Folder actions"} onKeyDown={event => { if (event.key === "Tab") { event.preventDefault(); onClose(); trigger.current?.focus(); } else moveMenuFocus(event); }} style={{ left: x, top: y }}>
      <div role="group" className="menu-swatches" aria-label="Folder colour">
        {SPACE_COLORS.map((color) => (
          <button key={color} aria-pressed={folder.color === color} aria-label={color} data-space={color}
            className={`swatch sm ${folder.color === color ? "on" : ""}`}
            onClick={() => updateFolder(folder.id, { color: folder.color === color ? null : color })} />
        ))}
      </div>
      <div role="group" className="menu-swatches" aria-label="Folder icon">
        {FOLDER_EMOJIS.map((emoji) => {
          const on = (folder.emoji ?? "") === emoji;
          return (
            <button key={emoji} aria-pressed={on} aria-label={emoji === "" ? "Default folder icon" : `Icon ${emoji}`}
              className={`swatch emoji ${on ? "on" : ""}`}
              onClick={() => updateFolder(folder.id, { emoji: emoji || null })}>{emoji || I.folderClosed}</button>
          );
        })}
      </div>
      <button className="menu-item" role="menuitem" onClick={() => { onRename(); onClose(); }}>
        <span className="t">Rename</span>
      </button>
      <button className="menu-item" role="menuitem" onClick={() => { onDelete(); onClose(); }}>
        <span className="t">{group ? "Ungroup tabs" : `Delete “${folder.name}”`}</span>
      </button>
    </div>
  );
}
