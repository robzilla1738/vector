import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import type { PageSet, PageTarget, Run, SetMember } from "@vector/contracts";
import { inElectron } from "../bridge";
import { engineOf } from "../engine";
import { isLive, useStore, call, errToast, toast, type RailView } from "../store";
import { SPACE_COLORS, hostOf, isPinned, tabsInSpace, type Space, type SpaceColor } from "../workspace";
import { ResizeHandle } from "./ResizeHandle";
import { SiteTile } from "./SiteTile";
import { VirtualList } from "./VirtualList";
import { I } from "./icons";

const ROW_H = 32;
const VIRTUALIZE_AT = 28;

/* ------------------------------------------------------------------ */
/*  Tab row                                                             */
/* ------------------------------------------------------------------ */

interface TabRowProps {
  p: PageTarget;
  active: boolean;
  index: number;
  dragging: boolean;
  dropBefore: boolean;
  dropAfter: boolean;
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
  onDragStart: (index: number, e: React.DragEvent) => void;
  onDragOver: (index: number, e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onContext: (p: PageTarget, x: number, y: number) => void;
  onKeyMove: (index: number, dir: -1 | 1) => void;
}

const TabRow = memo(function TabRow({ p, active, index, dragging, dropBefore, dropAfter, onActivate, onClose, onDragStart, onDragOver, onDrop, onDragEnd, onContext, onKeyMove }: TabRowProps) {
  const crashed = p.viewStatus === "crashed";
  const eng = engineOf(p);
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
          onKeyMove(index, e.key === "ArrowUp" ? -1 : 1);
        }
      }}
      onDragStart={(e) => onDragStart(index, e)}
      onDragOver={(e) => onDragOver(index, e)}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <span className="tab-fav">
        {crashed ? I.alert : p.loading ? <span className="spin" /> : p.favicon ? <img src={p.favicon} alt="" draggable={false} onError={(e) => (e.currentTarget.style.display = "none")} /> : I.globe}
      </span>
      <span className="tab-title">{title}</span>
      {p.controller === "agent" || p.controller === "external" ? (
        <span className="tab-state agent" title="The agent is driving this tab">{I.sparklesSm}</span>
      ) : p.controller === "human" ? (
        <span className="tab-state human" title="You're in control — the agent is waiting">{I.handSm}</span>
      ) : null}
      {eng.backend !== "vector" && <span className={`tab-engine ${eng.backend}`} title={eng.label}>{eng.short}</span>}
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

function SpaceMenu({ spaces, active, onPick, onNew, onEdit, onDelete, onClose }: { spaces: Space[]; active: string; onPick: (id: string) => void; onNew: () => void; onEdit: (s: Space) => void; onDelete: (id: string) => void; onClose: () => void }) {
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
    <div className="menu space-menu pop-in" role="menu" ref={ref}>
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
    </div>
  );
}

function SpaceEditor({ space, onSave, onClose }: { space: Space | null; onSave: (name: string, color: SpaceColor) => void; onClose: () => void }) {
  const [name, setName] = useState(space?.name ?? "");
  const [color, setColor] = useState<SpaceColor>(space?.color ?? "violet");
  return (
    <div className="scrim-soft" onMouseDown={onClose}>
      <div className="sheet pop-in" role="dialog" aria-label={space ? "Edit space" : "New space"} onMouseDown={(e) => e.stopPropagation()}>
        <h3>{space ? "Edit space" : "New space"}</h3>
        <input autoFocus className="field-input" value={name} placeholder="Name" onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { onSave(name, color); onClose(); } if (e.key === "Escape") onClose(); }} />
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

/* ------------------------------------------------------------------ */
/*  Agent items (runs & sets alongside tabs)                            */
/* ------------------------------------------------------------------ */

function RunItem({ r, selected, onOpen }: { r: Run; selected: boolean; onOpen: () => void }) {
  const live = isLive(r);
  return (
    <button className={`agent-item ${selected ? "active" : ""} ${live ? "live" : ""} st-${r.status}`} onClick={onOpen} title={r.goal}>
      <span className="agent-ico">{live ? <span className="pulse-dot" /> : r.status === "completed" ? I.check : r.status === "failed" ? I.alert : I.sparklesSm}</span>
      <span className="agent-main">
        <span className="agent-title">{r.goal}</span>
        <span className="agent-sub">{live ? r.statusMessage ?? r.status.replace("_", " ") : r.status.replace("_", " ")}</span>
      </span>
    </button>
  );
}

function SetItem({ s, members, selected, onOpen }: { s: PageSet; members: SetMember[]; selected: boolean; onOpen: () => void }) {
  const total = members.length || s.memberIds.length;
  const done = members.filter((m) => m.status === "completed").length;
  const running = members.some((m) => m.status === "running");
  return (
    <button className={`agent-item ${selected ? "active" : ""} ${running ? "live" : ""}`} onClick={onOpen} title={s.name}>
      <span className="agent-ico">{I.layersSm}</span>
      <span className="agent-main">
        <span className="agent-title">{s.name}</span>
        <span className="agent-sub nums">{done}/{total} members{running ? " · running" : ""}</span>
      </span>
      <span className="set-meter" aria-hidden><span style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar                                                             */
/* ------------------------------------------------------------------ */

export function Sidebar() {
  const sidebar = useStore((s) => s.sidebar);
  const peek = useStore((s) => s.sidebarPeek);
  const setPeek = useStore((s) => s.setSidebarPeek);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const layout = useStore((s) => s.layout);
  const pages = useStore((s) => s.pages);
  const runs = useStore((s) => s.runs);
  const sets = useStore((s) => s.sets);
  const members = useStore((s) => s.members);
  const activePageId = useStore((s) => s.activePageId);
  const mode = useStore((s) => s.mode);
  const railOpen = useStore((s) => s.railOpen);
  const railView = useStore((s) => s.railView);
  const activate = useStore((s) => s.activate);
  const closeTab = useStore((s) => s.closeTab);
  const newTab = useStore((s) => s.newTab);
  const openRail = useStore((s) => s.openRail);
  const setOverlay = useStore((s) => s.setOverlay);
  const reorderTabs = useStore((s) => s.reorderTabs);
  const switchSpace = useStore((s) => s.switchSpace);
  const addSpace = useStore((s) => s.addSpace);
  const editSpace = useStore((s) => s.editSpace);
  const deleteSpace = useStore((s) => s.deleteSpace);
  const moveTabToSpace = useStore((s) => s.moveTabToSpace);
  const togglePin = useStore((s) => s.togglePin);
  const sidebarWidth = useStore((s) => s.sidebarWidth);
  const setSidebarWidth = useStore((s) => s.setSidebarWidth);
  const refreshResults = useStore((s) => s.refreshResults);
  const setMode = useStore((s) => s.setMode);
  const sessions = useStore(useShallow((s) => s.sessions));

  const space = layout.spaces.find((s) => s.id === layout.activeSpaceId) ?? layout.spaces[0]!;
  const tabs = useMemo(() => tabsInSpace(layout, pages, space.id), [layout, pages, space.id]);
  const pins = layout.pins[space.id] ?? [];
  const chrome = sessions.find((s) => s.backend === "chrome");

  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState<Space | null | "new">(null);
  const [drag, setDrag] = useState<{ from: number; to: number | null }>({ from: -1, to: null });
  const [ctx, setCtx] = useState<{ p: PageTarget; x: number; y: number } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // hover-peek while collapsed: open after a short dwell, close when the pointer leaves
  const peekTimer = useRef<number | null>(null);
  const railEnter = () => {
    if (sidebar !== "rail") return;
    peekTimer.current = window.setTimeout(() => setPeek(true), 260);
  };
  const railLeave = () => {
    if (peekTimer.current) window.clearTimeout(peekTimer.current);
    peekTimer.current = null;
  };
  useEffect(() => {
    if (sidebar !== "rail") setPeek(false);
  }, [sidebar, setPeek]);

  const onActivate = useCallback((id: string) => void activate(id).catch(errToast), [activate]);
  const onClose = useCallback((id: string) => void closeTab(id), [closeTab]);
  const onDragStart = useCallback((index: number, e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
    setDrag({ from: index, to: null });
  }, []);
  const onDragOver = useCallback((index: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const after = e.clientY > r.top + r.height / 2;
    setDrag((d) => ({ ...d, to: index + (after ? 1 : 0) }));
  }, []);
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDrag((d) => {
        if (d.from >= 0 && d.to !== null) reorderTabs(space.id, d.from, d.to);
        return { from: -1, to: null };
      });
    },
    [reorderTabs, space.id],
  );
  const onDragEnd = useCallback(() => setDrag({ from: -1, to: null }), []);
  const onContext = useCallback((p: PageTarget, x: number, y: number) => setCtx({ p, x, y }), []);
  const onKeyMove = useCallback(
    (index: number, dir: -1 | 1) => {
      const to = dir === -1 ? index - 1 : index + 2;
      if (to < 0 || to > tabs.length) return;
      reorderTabs(space.id, index, to);
      requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>(`[data-index="${index + dir}"]`)?.focus());
    },
    [reorderTabs, space.id, tabs.length],
  );

  // arrow keys move focus between tabs (roving tabindex)
  const onListKey = (e: React.KeyboardEvent) => {
    if (e.altKey || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
    const rows = Array.from(listRef.current?.querySelectorAll<HTMLElement>("[role=tab]") ?? []);
    const i = rows.indexOf(document.activeElement as HTMLElement);
    if (i === -1) return;
    e.preventDefault();
    rows[Math.max(0, Math.min(rows.length - 1, i + (e.key === "ArrowUp" ? -1 : 1)))]?.focus();
  };

  const liveRuns = runs.filter(isLive);
  const recentRuns = runs.filter((r) => !isLive(r)).slice(0, 3);
  const showAgent = liveRuns.length + recentRuns.length + sets.length > 0;
  const viewIs = (v: RailView) => railOpen && JSON.stringify(railView) === JSON.stringify(v);

  const renderRow = (p: PageTarget, index: number) => (
    <TabRow
      p={p}
      index={index}
      active={p.pageId === activePageId && mode === "focus"}
      dragging={drag.from === index}
      dropBefore={drag.to === index && drag.from !== index && drag.from !== index - 1}
      dropAfter={drag.to === index + 1 && index === tabs.length - 1 && drag.from !== index}
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

  const collapsed = sidebar === "rail" && !peek;

  const full = (
    <>
      <div className={`sb-head ${inElectron ? "electron" : ""}`}>
        <button className="space-switch" data-space={space.color} aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)} title="Switch space">
          <span className="space-dot" />
          <span className="space-name">{space.name}</span>
          {I.down}
        </button>
        <span className="sp" />
        <button className="icon-btn" title="Collapse sidebar (⌘S)" aria-label="Collapse sidebar" onClick={toggleSidebar}>{I.sidebarClose}</button>
        {menuOpen && (
          <SpaceMenu spaces={layout.spaces} active={space.id} onPick={switchSpace} onNew={() => setEditing("new")} onEdit={(s) => setEditing(s)} onDelete={deleteSpace} onClose={() => setMenuOpen(false)} />
        )}
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

      <div className="sb-tabs" ref={listRef} onKeyDown={onListKey}>
        {tabs.length >= VIRTUALIZE_AT ? (
          <VirtualList items={tabs} rowHeight={ROW_H} className="tab-list virtual" role="tablist" ariaLabel="Tabs" keyOf={(p) => p.pageId} renderRow={renderRow}
            footer={<NewTabButton onClick={() => void newTab()} />} />
        ) : (
          <div className="tab-list" role="tablist" aria-label="Tabs">
            {tabs.map((p, i) => (
              <div key={p.pageId} className="tab-slot">{renderRow(p, i)}</div>
            ))}
            <NewTabButton onClick={() => void newTab()} />
            {tabs.length === 0 && <div className="sb-empty">No tabs in {space.name}. Press ⌘T or ask for something below.</div>}
          </div>
        )}
      </div>

      {showAgent && (
        <div className="sb-agent">
          <div className="sb-label">
            <span>Agent</span>
            {liveRuns.length > 0 && <span className="live-count nums">{liveRuns.length} live</span>}
          </div>
          {liveRuns.map((r) => <RunItem key={r.runId} r={r} selected={viewIs({ kind: "run", runId: r.runId })} onOpen={() => openRail({ kind: "run", runId: r.runId })} />)}
          {sets.map((s) => (
            <SetItem key={s.setId} s={s} members={members.filter((m) => m.setId === s.setId)} selected={viewIs({ kind: "set", setId: s.setId })}
              onOpen={() => { openRail({ kind: "set", setId: s.setId }); void refreshResults(s.setId).catch(() => {}); }} />
          ))}
          {recentRuns.map((r) => <RunItem key={r.runId} r={r} selected={viewIs({ kind: "run", runId: r.runId })} onOpen={() => openRail({ kind: "run", runId: r.runId })} />)}
          {runs.length > recentRuns.length + liveRuns.length && (
            <button className="sb-more" onClick={() => openRail({ kind: "home" })}>All runs {I.right}</button>
          )}
        </div>
      )}

      <div className="sb-foot">
        <div className="space-dots" role="tablist" aria-label="Spaces">
          {layout.spaces.map((s) => (
            <button key={s.id} role="tab" aria-selected={s.id === space.id} aria-label={s.name} title={s.name} data-space={s.color} className={`space-pip ${s.id === space.id ? "on" : ""}`} onClick={() => switchSpace(s.id)} />
          ))}
          <button className="space-pip add" aria-label="New space" title="New space" onClick={() => setEditing("new")}>{I.plusSm}</button>
        </div>
        <span className="sp" />
        {chrome && (
          <button className={`icon-btn ${chrome.status === "connected" ? "ok" : ""}`} title={chrome.status === "connected" ? `Chrome attached${chrome.detail ? ` — ${chrome.detail}` : ""}` : "Attach Chrome (CDP :9222)"} aria-label="Chrome session"
            onClick={() => { if (chrome.status !== "connected") void call("chrome.attach", { port: 9222 }).then(() => toast("Chrome attached")).catch(errToast); }}>
            {I.chrome}
          </button>
        )}
        <button className="icon-btn" title="History (⌘Y)" aria-label="History" onClick={() => setOverlay("history")}>{I.clock}</button>
        <button className="icon-btn" title="Downloads (⌘⇧J)" aria-label="Downloads" onClick={() => setOverlay("downloads")}>{I.download}</button>
        <button className="icon-btn" title="Settings (⌘,)" aria-label="Settings" onClick={() => setOverlay("settings")}>{I.gear}</button>
      </div>
    </>
  );

  const rail = (
    <div className="sb-rail" onMouseEnter={railEnter} onMouseLeave={railLeave}>
      <div className={`sb-head ${inElectron ? "electron" : ""}`}>
        <button className="icon-btn" title="Expand sidebar (⌘S)" aria-label="Expand sidebar" onClick={toggleSidebar}>{I.sidebar}</button>
      </div>
      <div className="rail-tiles" role="tablist" aria-label="Tabs">
        {tabs.slice(0, 40).map((p) => (
          <SiteTile key={p.pageId} url={p.url} title={p.title || hostOf(p.url)} favicon={p.favicon} size="sm" role="tab" aria-selected={p.pageId === activePageId}
            active={p.pageId === activePageId} onClick={() => onActivate(p.pageId)} />
        ))}
        <button className="site-tile sm add" title="New tab (⌘T)" aria-label="New tab" onClick={() => void newTab()}><span className="tile-face">{I.plus}</span></button>
      </div>
      <div className="rail-foot">
        {liveRuns.length > 0 && (
          <button className="icon-btn live" title={`${liveRuns.length} live run${liveRuns.length > 1 ? "s" : ""}`} aria-label="Live runs" onClick={() => openRail({ kind: "run", runId: liveRuns[0]!.runId })}>
            <span className="pulse-dot" />
          </button>
        )}
        <button className="space-pip on" data-space={space.color} title={space.name} aria-label={space.name} onClick={() => { setPeek(true); setMenuOpen(true); }} />
        <button className="icon-btn" title="Settings (⌘,)" aria-label="Settings" onClick={() => setOverlay("settings")}>{I.gear}</button>
      </div>
    </div>
  );

  if (sidebar === "hidden") return null;

  return (
    <>
      <aside
        className={`sidebar ${sidebar === "rail" ? "collapsed" : sidebar} ${peek ? "peek" : ""}`}
        data-space={space.color}
        style={{ "--sb-w": `${sidebarWidth}px` } as React.CSSProperties}
        onMouseLeave={() => sidebar === "rail" && !menuOpen && !editing && setPeek(false)}
        aria-label="Sidebar"
      >
        {sidebar === "rail" ? (
          <>
            {rail}
            {!collapsed && <div className="sb-peek-panel" onMouseLeave={() => !menuOpen && !editing && setPeek(false)}>{full}</div>}
          </>
        ) : (
          full
        )}
        {sidebar === "expanded" && <ResizeHandle side="left" value={sidebarWidth} min={200} max={360} reset={240} onResize={setSidebarWidth} />}
      </aside>
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
          currentSpace={space.id}
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
            if (a === "reload") void call("pages.reload", { pageId: p.pageId }).catch(errToast);
            if (a === "results") setMode("table");
          }}
        />
      )}
    </>
  );
}

function NewTabButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="tab-new" onClick={onClick}>
      <span className="tab-fav">{I.plusSm}</span>
      <span className="tab-title">New Tab</span>
      <kbd>⌘T</kbd>
    </button>
  );
}

function TabContextMenu({ p, x, y, spaces, currentSpace, pinned, onClose, onAction }: {
  p: PageTarget; x: number; y: number; spaces: Space[]; currentSpace: string; pinned: boolean;
  onClose: () => void; onAction: (a: "close" | "closeOthers" | "duplicate" | "copy" | "pin" | "move" | "reload" | "results", arg?: string) => void;
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
  const item = (label: string, a: Parameters<typeof onAction>[0], arg?: string, kbd?: string) => (
    <div key={label} className="menu-item" role="menuitem" tabIndex={0} onClick={() => { onAction(a, arg); onClose(); }} onKeyDown={(e) => { if (e.key === "Enter") { onAction(a, arg); onClose(); } }}>
      <span className="t">{label}</span>
      {kbd && <kbd>{kbd}</kbd>}
    </div>
  );
  const web = /^https?:/.test(p.url);
  const top = Math.min(y, window.innerHeight - 320);
  return (
    <div ref={ref} className="menu ctx-menu pop-in" role="menu" style={{ left: Math.min(x, window.innerWidth - 240), top }}>
      {item("Reload", "reload", undefined, "⌘R")}
      {web && item("Duplicate", "duplicate")}
      {web && item("Copy URL", "copy")}
      {web && item(pinned ? "Unpin" : "Pin to space", "pin")}
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
