import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { PageTarget } from "@vector/contracts";
import { bridge, inElectron } from "../bridge";
import { useStore, call, errToast, toast } from "../store";
import { MAX_PINS, SPACE_COLORS, foldersInSpace, hostOf, isPinned, tabsInFolder, tabsInSpace, unfiledTabs, type Folder, type Space, type SpaceColor } from "../workspace";

import { isScrimOverlay } from "../chrome";
import { moveListFocus } from "../keyboard-list";
import { ResizeHandle } from "./ResizeHandle";
import { FavIcon, SiteTile } from "./SiteTile";
import { CommandBar } from "./CommandBar";
import { TabAudioButton } from "./TabAudioButton";
import { I } from "./icons";

const IDLE_DRAG = { folderId: null as string | null, from: -1, to: null as number | null, pageId: "", over: null as string | null };
const kidsH = (n: number) => (n <= 0 ? 0 : n * 32 + (n - 1) * 2);

function FolderKids({ collapsed, count, children }: { collapsed: boolean; count: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const animRef = useRef<Animation | null>(null);
  const target = collapsed ? 0 : kidsH(count);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    animRef.current?.cancel();
    const fromH = el.getBoundingClientRect().height;
    const fromOp = Number.parseFloat(getComputedStyle(el).opacity);
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
    void anim.finished.finally(() => {
      if (animRef.current === anim) animRef.current = null;
    });
  }, [target]);

  return (
    <div
      ref={ref}
      className="folder-kids"
      inert={collapsed ? true : undefined}
      aria-hidden={collapsed}
    >
      <div className="folder-kids-inner">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab row                                                             */
/* ------------------------------------------------------------------ */

interface TabRowProps {
  p: PageTarget;
  active: boolean;
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

const TabRow = memo(function TabRow({ p, active, index, folderId, dragging, dropBefore, dropAfter, onActivate, onClose, onDragStart, onDragOver, onDrop, onDragEnd, onContext, onKeyMove }: TabRowProps) {
  const crashed = p.viewStatus === "crashed";
  const title = p.title || (p.url && p.url !== "about:blank" ? hostOf(p.url) : "New Tab");
  return (
    <div
      className={`tab-row ${active ? "active" : ""} ${crashed ? "crashed" : ""} ${dragging ? "dragging" : ""} ${dropBefore ? "drop-before" : ""} ${dropAfter ? "drop-after" : ""}`}
      role="tab"
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      data-index={index}
      draggable
      title={crashed ? `Crashed — ${p.url}` : p.url === "about:blank" ? "New Tab" : `${p.title}\n${p.url}`}
      onClick={() => onActivate(p.pageId)}
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
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate(p.pageId);
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
        title="Close tab (⌘W)"
        aria-label={`Close ${title}`}
        onClick={(e) => {
          e.stopPropagation();
          onClose(p.pageId);
        }}
      >
        {I.close}
      </button>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Space switcher                                                      */
/* ------------------------------------------------------------------ */

function SpaceMenu({ spaces, active, onPick, onNew, onNewFolder, onEdit, onDelete, onCollapse, onHistory, onDownloads, onSettings, onClose }: {
  spaces: Space[];
  active: string;
  onPick: (id: string) => void;
  onNew: () => void;
  onNewFolder: () => void;
  onEdit: (s: Space) => void;
  onDelete: (id: string) => void;
  onCollapse: () => void;
  onHistory: () => void;
  onDownloads: () => void;
  onSettings: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    ref.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    return () => {
      document.removeEventListener("mousedown", h);
      document.removeEventListener("keydown", k);
    };
  }, [onClose]);
  return (
    <div className="menu space-menu pop-in" role="menu" ref={ref} onKeyDown={event => moveListFocus(event, '[role="menuitem"]')}>
      {spaces.map((s) => (
        <div key={s.id} className={`menu-item ${s.id === active ? "on" : ""}`} role="menuitem" tabIndex={0} data-space={s.color}
          onClick={() => { onPick(s.id); onClose(); }}
          onKeyDown={(e) => { if (e.key === "Enter") { onPick(s.id); onClose(); } }}>
          <span className="space-dot" />
          <span className="t">{s.name}</span>
          <span className="menu-acts">
            <button className="icon-btn xs" aria-label={`Edit ${s.name}`} onClick={(e) => { e.stopPropagation(); onEdit(s); }}>{I.pencil}</button>
            {spaces.length > 1 && <button className="icon-btn xs" aria-label={`Delete ${s.name}`} onClick={(e) => { e.stopPropagation(); onDelete(s.id); onClose(); }}>{I.trash}</button>}
          </span>
        </div>
      ))}
      <div className="menu-sep" />
      <div className="menu-item" role="menuitem" tabIndex={0} onClick={() => { onNew(); onClose(); }} onKeyDown={(e) => { if (e.key === "Enter") { onNew(); onClose(); } }}>
        <span className="menu-ico">{I.plusSm}</span>
        <span className="t">New space</span>
      </div>
      <div className="menu-item" role="menuitem" tabIndex={0} onClick={() => { onNewFolder(); onClose(); }} onKeyDown={(e) => { if (e.key === "Enter") { onNewFolder(); onClose(); } }}>
        <span className="menu-ico" aria-hidden>{I.folderClosed}</span>
        <span className="t">New folder</span>
      </div>
      <div className="menu-sep" />
      <div className="menu-item" role="menuitem" tabIndex={0} onClick={() => { onHistory(); onClose(); }} onKeyDown={(e) => { if (e.key === "Enter") { onHistory(); onClose(); } }}>
        <span className="menu-ico">{I.clockSm}</span>
        <span className="t">History</span>
        <kbd>⌘Y</kbd>
      </div>
      <div className="menu-item" role="menuitem" tabIndex={0} onClick={() => { onDownloads(); onClose(); }} onKeyDown={(e) => { if (e.key === "Enter") { onDownloads(); onClose(); } }}>
        <span className="menu-ico">{I.downloadSm}</span>
        <span className="t">Downloads</span>
        <kbd>⌘⇧J</kbd>
      </div>
      {!bridge.privateMode && <div className="menu-item" role="menuitem" tabIndex={0} onClick={() => { onSettings(); onClose(); }} onKeyDown={(e) => { if (e.key === "Enter") { onSettings(); onClose(); } }}>
        <span className="menu-ico">{I.gearSm}</span>
        <span className="t">Settings</span>
        <kbd>⌘,</kbd>
      </div>}
      <div className="menu-sep" />
      <div className="menu-item" role="menuitem" tabIndex={0} onClick={() => { onCollapse(); onClose(); }} onKeyDown={(e) => { if (e.key === "Enter") { onCollapse(); onClose(); } }}>
        <span className="menu-ico">{I.sidebarCloseSm}</span>
        <span className="t">Collapse sidebar</span>
        <kbd>⌘S</kbd>
      </div>
    </div>
  );
}

function SpaceEditor({ space, onSave, onClose }: { space: Space | null; onSave: (name: string, color: SpaceColor) => void; onClose: () => void }) {
  const [name, setName] = useState(space?.name ?? "");
  const [color, setColor] = useState<SpaceColor>(space?.color ?? "violet");
  const previous = useRef(document.activeElement as HTMLElement | null);
  useEffect(() => {
    void bridge.overlay(true);
    return () => {
      void bridge.overlay(isScrimOverlay(useStore.getState().overlay));
      const target = previous.current?.isConnected ? previous.current : document.querySelector<HTMLElement>('.space-switch');
      target?.focus();
    };
  }, []);
  const onDialogKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose(); }
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
        <input autoFocus className="field-input" value={name} placeholder="Name" onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { onSave(name, color); onClose(); } }} />
        <div className="swatches" role="radiogroup" aria-label="Colour">
          {SPACE_COLORS.map((c) => (
            <button key={c} role="radio" aria-checked={color === c} aria-label={c} data-space={c} className={`swatch ${color === c ? "on" : ""}`} onClick={() => setColor(c)} />
          ))}
        </div>
        <div className="sheet-acts">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => { onSave(name, color); onClose(); }}>{space ? "Save" : "Create"}</button>
        </div>
      </div>
    </div>
  );
}

function FolderRow({ folder, open, dropOn, renaming, onToggle, onRename, onContext, onDragOver, onDrop, onDragEnd }: {
  folder: Folder;
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
  const commit = () => onRename(name);
  return (
    <div
      className={`folder-row ${open ? "open" : ""} ${dropOn ? "drop-on" : ""}`}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onClick={() => !renaming && onToggle()}
      onKeyDown={(e) => { if (!renaming && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onToggle(); } }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContext(e.clientX, e.clientY); }}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <span className="tab-fav" aria-hidden>{I.folderClosed}</span>
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
            if (e.key === "Escape") { setName(folder.name); (e.target as HTMLInputElement).blur(); }
          }}
        />
      ) : (
        <span className="tab-title">{folder.name}</span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar                                                             */
/* ------------------------------------------------------------------ */

export function Sidebar() {
  const sidebarPref = useStore((s) => s.sidebar);
  const railOpenNow = useStore((s) => s.railOpen && s.overlay !== "settings");
  const sidebar = sidebarPref;
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const toggleRail = useStore((s) => s.toggleRail);
  const layout = useStore((s) => s.layout);
  const bookmarks = useStore(s => s.bookmarks);
  const pages = useStore((s) => s.pages);
  const activePageId = useStore((s) => s.activePageId);
  const mode = useStore((s) => s.mode);
  const activate = useStore((s) => s.activate);
  const closeTab = useStore((s) => s.closeTab);
  const newTab = useStore((s) => s.newTab);
  const setOverlay = useStore((s) => s.setOverlay);
  const switchSpace = useStore((s) => s.switchSpace);
  const addSpace = useStore((s) => s.addSpace);
  const editSpace = useStore((s) => s.editSpace);
  const deleteSpace = useStore((s) => s.deleteSpace);
  const moveTabToSpace = useStore((s) => s.moveTabToSpace);
  const togglePin = useStore((s) => s.togglePin);
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
  const pins = (layout.pins[space.id] ?? []).slice(0, MAX_PINS);
  const page = pages.find((p) => p.pageId === activePageId);
  const web = !!page && page.url.startsWith("http");

  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState<Space | null | "new">(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [drag, setDrag] = useState(IDLE_DRAG);
  const [ctx, setCtx] = useState<{ p: PageTarget; x: number; y: number } | null>(null);
  const [folderCtx, setFolderCtx] = useState<{ folder: Folder; x: number; y: number } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!(event.target as Element).closest(".sb-more")) document.querySelectorAll<HTMLDetailsElement>(".sb-more[open]").forEach(menu => { menu.open = false; });
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const onActivate = useCallback((id: string) => void activate(id).catch(errToast), [activate]);
  const onClose = useCallback((id: string) => void closeTab(id), [closeTab]);
  const onDragStart = useCallback((folderId: string | null, index: number, pageId: string, e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", pageId);
    setDrag({ folderId, from: index, to: null, pageId, over: folderId });
  }, []);
  const onDragOver = useCallback((folderId: string | null, index: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const after = e.clientY > r.top + r.height / 2;
    setDrag((d) => ({ ...d, over: folderId, to: d.folderId === folderId ? index + (after ? 1 : 0) : d.to }));
  }, []);
  const onDrop = useCallback(
    (folderId: string | null, e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDrag((d) => {
        if (d.from < 0 || !d.pageId) return IDLE_DRAG;
        if (d.folderId !== folderId) moveTabToFolder(d.pageId, folderId);
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
        if (d.pageId && d.folderId !== folderId) moveTabToFolder(d.pageId, folderId);
        return IDLE_DRAG;
      });
    },
    [moveTabToFolder],
  );
  const onDragEnd = useCallback(() => setDrag(IDLE_DRAG), []);
  const onContext = useCallback((p: PageTarget, x: number, y: number) => setCtx({ p, x, y }), []);
  const onKeyMove = useCallback(
    (folderId: string | null, index: number, dir: -1 | 1) => {
      const group = folderId ? tabsInFolder(layout, pages, folderId) : loose;
      const to = dir === -1 ? index - 1 : index + 2;
      if (to < 0 || to > group.length) return;
      reorderGroup(space.id, folderId, index, to);
    },
    [layout, loose, pages, reorderGroup, space.id],
  );

  const onListKey = (e: React.KeyboardEvent<HTMLElement>) => moveListFocus(e, '[role="tab"]');

  const renderRow = (p: PageTarget, index: number, folderId: string | null, groupLen: number) => (
    <TabRow
      p={p}
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


  const chromeNav = (
    <>
      <button className="icon-btn" title="Back (⌘[)" aria-label="Back" disabled={!page?.canGoBack} onClick={() => page && void call("pages.back", { pageId: page.pageId }).catch(errToast)}>{I.back}</button>
      <button className="icon-btn" title="Forward (⌘])" aria-label="Forward" disabled={!page?.canGoForward} onClick={() => page && void call("pages.forward", { pageId: page.pageId }).catch(errToast)}>{I.fwd}</button>
      {page?.loading ? (
        <button className="icon-btn" title="Stop" aria-label="Stop loading" onClick={() => void call("pages.stop", { pageId: page.pageId }).catch(errToast)}>{I.stop}</button>
      ) : (
        <button className="icon-btn" title="Reload (⌘R)" aria-label="Reload" disabled={!web} onClick={() => page && void call("pages.reload", { pageId: page.pageId }).catch(errToast)}>{I.reload}</button>
      )}
      {page?.controller === "human" && (
        <button className="icon-btn warn" title="You're in control — hand the page back to the agent" aria-label="Return control to the agent" onClick={() => void returnControl(page.pageId)}>{I.hand}</button>
      )}
    </>
  );

  const full = (
    <>
      <div className={`sb-head ${inElectron ? "electron" : ""}`}>{chromeNav}<button className="icon-btn" aria-label="Collapse sidebar" onClick={toggleSidebar}>{I.sidebar}</button></div>

      <div className="sb-cmd">
        <CommandBar compact />
      </div>

      {pins.length > 0 && (
        <div className="sb-pins" role="list" aria-label="Pinned sites">
          {pins.map((b) => {
            const open = pages.find((p) => p.url === b.url);
            return (
              <SiteTile key={b.url} url={b.url} title={b.title} favicon={open?.favicon} active={!!open && open.pageId === activePageId} role="listitem"
                onClick={() => (open ? onActivate(open.pageId) : void newTab(b.url))}
                onContextMenu={(e) => { e.preventDefault(); togglePin(b); toast("Unpinned"); }} />
            );
          })}
        </div>
      )}

      <div className="sb-space">
        <button className="space-switch" data-space={space.color} aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)} title="Switch space">
          <span className="space-ico">{I.person}</span>
          <span className="space-name">{space.name}</span>
        </button>
        {menuOpen && (
          <SpaceMenu
            spaces={layout.spaces}
            active={space.id}
            onPick={switchSpace}
            onNew={() => setEditing("new")}
            onNewFolder={() => setRenameId(addFolder("Untitled"))}
            onEdit={(s) => setEditing(s)}
            onDelete={deleteSpace}
            onCollapse={toggleSidebar}
            onHistory={() => setOverlay("history")}
            onDownloads={() => setOverlay("downloads")}
            onSettings={() => setOverlay("settings")}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </div>

      <div className="sb-tabs" ref={listRef} onKeyDown={onListKey}>
        <div className="tab-list" role="tablist" aria-label="Tabs" aria-orientation="vertical">
          {folders.map((f) => {
            const kids = tabsInFolder(layout, pages, f.id);
            return (
              <div key={f.id} className={f.collapsed ? "folder-block" : "folder-block open"} role="group" aria-label={f.name}>
                <FolderRow
                  folder={f}
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

          <NewTabButton
            onClick={() => void newTab()}
            dropOn={!!drag.pageId && drag.folderId != null && drag.over === ""}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDrag((d) => (d.over === "" ? d : { ...d, over: "" })); }}
            onDrop={(e) => onDrop(null, e)}
            onDragEnd={onDragEnd}
          />

          {loose.map((p, i) => (
            <div key={p.pageId} className="tab-slot">{renderRow(p, i, null, loose.length)}</div>
          ))}

          {tabs.length === 0 && folders.length === 0 && (
            <div className="sb-empty">No tabs in {space.name}</div>
          )}
        </div>
      </div>

      <div className="sb-foot">
        {bridge.privateMode ? <><span className="private-sidebar-label">Private</span><span className="sp" /><button onClick={() => setMode(mode === "overview" ? "focus" : "overview")} className="icon-btn" aria-label="Tab overview">{I.grid}</button></> : <>
        <button className="sb-new-chat" onClick={() => useStore.getState().openConversation(null)}>{I.pencil}<span>New chat</span></button>
        <span className="sp" />
        {page?.controller === "human" && <button className="icon-btn" aria-label="Return control to agent" title="Return control to agent" onClick={() => void returnControl(page.pageId)}>{I.handSm}</button>}
        <button className={`icon-btn ${railOpenNow ? "on" : ""}`} title="Agent (⌘⇧A)" aria-label="Toggle agent rail" aria-pressed={railOpenNow} onClick={toggleRail}>{I.agent}</button>
        <details className="sb-more" onKeyDown={event => { if (event.key === "Escape") event.currentTarget.open = false; }}>
          <summary className="icon-btn" aria-label="More" title="More">{I.more}</summary>
          <div className="sb-more-menu" onClick={event => { const details = event.currentTarget.closest("details"); if (details) details.open = false; }}>
            <button onClick={() => { useStore.getState().openConversation(null); useStore.setState({conversationId:"history"}); }}>{I.agentSm}<span>Chats</span></button>
            <button onClick={() => setOverlay("tasks")}>{I.layersSm}<span>Tasks</span></button>
            <button aria-label="Library" onClick={() => setOverlay("bookmarks")}>{I.bookmark}<span>Library</span><kbd>⌘Y</kbd></button>
            <button onClick={() => setOverlay("downloads")}>{I.downloadSm}<span>Downloads</span></button>
            <hr />
            <button disabled={!web} onClick={() => {
              if (!page) return;
              const saved = bookmarks.some(b => b.url === page.url);
              void call(saved ? "bookmarks.remove" : "bookmarks.add", {url:page.url,title:page.title}).then(() => useStore.getState().refresh()).catch(errToast);
            }}>{I.bookmark}<span>{bookmarks.some(b => b.url === page?.url) ? "Remove bookmark" : "Bookmark this page"}</span><kbd>⌘D</kbd></button>
            <button onClick={() => setMode(mode === "overview" ? "focus" : "overview")}>{I.grid}<span>Tab overview</span></button>
            <button aria-label="Settings" onClick={() => setOverlay("settings")}>{I.gear}<span>Settings</span><kbd>⌘,</kbd></button>
          </div>
        </details>
        </>}
      </div>
    </>
  );

  return (
    <>
      <aside
        className={`sidebar ${sidebar === "expanded" ? "expanded" : "fully-hidden"}`}
        inert={sidebar !== "expanded" ? true : undefined}
        aria-hidden={sidebar !== "expanded"}
        data-space={space.color}
        style={{ "--sb-w": `${sidebarWidth}px` } as React.CSSProperties}
        aria-label="Sidebar"
      >
        <div className="sidebar-content">{full}</div>
        {sidebar === "expanded" && <ResizeHandle side="left" value={sidebarWidth} min={220} max={380} reset={280} onResize={setSidebarWidth} />}
      </aside>
      {sidebar !== "expanded" && <button className="sidebar-reveal" aria-label="Expand sidebar" title="Show sidebar (⌘S)" onClick={() => useStore.getState().setSidebar("expanded")} />}
      {editing && (
        <SpaceEditor space={editing === "new" ? null : editing} onClose={() => setEditing(null)}
          onSave={(name, color) => (editing === "new" ? addSpace(name, color) : editSpace(editing.id, name, color))} />
      )}
      {ctx && (
        <TabContextMenu
          p={ctx.p}
          x={ctx.x}
          y={ctx.y}
          spaces={layout.spaces}
          folders={folders}
          currentSpace={space.id}
          currentFolder={layout.tabFolder[ctx.p.pageId] ?? null}
          pinned={isPinned(layout, space.id, ctx.p.url)}
          onClose={() => setCtx(null)}
          onAction={(a, arg) => {
            const p = ctx.p;
            if (a === "close") onClose(p.pageId);
            if (a === "closeOthers") tabs.filter((t) => t.pageId !== p.pageId).forEach((t) => onClose(t.pageId));
            if (a === "duplicate") void newTab(p.url);
            if (a === "copy") void navigator.clipboard.writeText(p.url).then(() => toast("URL copied"));
            if (a === "pin") togglePin({ url: p.url, title: p.title || hostOf(p.url) });
            if (a === "move" && arg) moveTabToSpace(p.pageId, arg);
            if (a === "folder") moveTabToFolder(p.pageId, arg ?? null);
            if (a === "reload") void call("pages.reload", { pageId: p.pageId }).catch(errToast);
            if (a === "results") setMode("table");
          }}
        />
      )}
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
}

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

function TabContextMenu({ p, x, y, spaces, folders, currentSpace, currentFolder, pinned, onClose, onAction }: {
  p: PageTarget; x: number; y: number; spaces: Space[]; folders: Folder[]; currentSpace: string; currentFolder: string | null; pinned: boolean;
  onClose: () => void; onAction: (a: "close" | "closeOthers" | "duplicate" | "copy" | "pin" | "move" | "folder" | "reload" | "results", arg?: string | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && onClose();
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    ref.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    return () => {
      document.removeEventListener("mousedown", h);
      document.removeEventListener("keydown", k);
    };
  }, [onClose]);
  const item = (label: string, a: Parameters<typeof onAction>[0], arg?: string | null, kbd?: string) => (
    <div key={label} className="menu-item" role="menuitem" tabIndex={0} onClick={() => { onAction(a, arg); onClose(); }} onKeyDown={(e) => { if (e.key === "Enter") { onAction(a, arg); onClose(); } }}>
      <span className="t">{label}</span>
      {kbd && <kbd>{kbd}</kbd>}
    </div>
  );
  const web = /^https?:/.test(p.url);
  const top = Math.min(y, window.innerHeight - 360);
  return (
    <div ref={ref} className="menu ctx-menu pop-in" role="menu" onKeyDown={event => moveListFocus(event, '[role="menuitem"]')} style={{ left: Math.min(x, window.innerWidth - 240), top }}>
      {item("Reload", "reload", undefined, "⌘R")}
      <TabAudioButton pageId={p.pageId} title={p.title || "New Tab"} menu onDone={onClose}/>
      {web && item("Duplicate", "duplicate")}
      {web && item("Copy URL", "copy")}
      {web && item(pinned ? "Unpin" : "Pin to space", "pin")}
      {folders.length > 0 && (
        <>
          <div className="menu-sep" />
          <div className="menu-label">Move to folder</div>
          {folders.filter((f) => f.id !== currentFolder).map((f) => (
            <div key={f.id} className="menu-item" role="menuitem" tabIndex={0} onClick={() => { onAction("folder", f.id); onClose(); }} onKeyDown={(e) => { if (e.key === "Enter") { onAction("folder", f.id); onClose(); } }}>
              <span className="menu-ico" aria-hidden>{I.folderClosed}</span>
              <span className="t">{f.name}</span>
            </div>
          ))}
          {currentFolder && item("Remove from folder", "folder", null)}
        </>
      )}
      {spaces.length > 1 && (
        <>
          <div className="menu-sep" />
          <div className="menu-label">Move to</div>
          {spaces.filter((s) => s.id !== currentSpace).map((s) => (
            <div key={s.id} className="menu-item" role="menuitem" tabIndex={0} data-space={s.color} onClick={() => { onAction("move", s.id); onClose(); }} onKeyDown={(e) => { if (e.key === "Enter") { onAction("move", s.id); onClose(); } }}>
              <span className="space-dot" />
              <span className="t">{s.name}</span>
            </div>
          ))}
        </>
      )}
      <div className="menu-sep" />
      {item("Close Tab", "close", undefined, "⌘W")}
      {item("Close Other Tabs", "closeOthers")}
    </div>
  );
}

function FolderContextMenu({ folder, x, y, onClose, onRename, onDelete }: {
  folder: Folder; x: number; y: number; onClose: () => void; onRename: () => void; onDelete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && onClose();
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    ref.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    return () => {
      document.removeEventListener("mousedown", h);
      document.removeEventListener("keydown", k);
    };
  }, [onClose]);
  return (
    <div ref={ref} className="menu ctx-menu pop-in" role="menu" onKeyDown={event => moveListFocus(event, '[role="menuitem"]')} style={{ left: Math.min(x, window.innerWidth - 200), top: Math.min(y, window.innerHeight - 120) }}>
      <div className="menu-item" role="menuitem" tabIndex={0} onClick={() => { onRename(); onClose(); }} onKeyDown={(e) => { if (e.key === "Enter") { onRename(); onClose(); } }}>
        <span className="t">Rename</span>
      </div>
      <div className="menu-item" role="menuitem" tabIndex={0} onClick={() => { onDelete(); onClose(); }} onKeyDown={(e) => { if (e.key === "Enter") { onDelete(); onClose(); } }}>
        <span className="t">Delete “{folder.name}”</span>
      </div>
    </div>
  );
}
