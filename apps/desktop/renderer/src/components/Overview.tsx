import { duplicateTabs } from "../duplicate-tabs";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import type { PageTarget } from "@aux/contracts";
import { useStore, call, errToast, tabCommand, toast, pagePreview } from "../store";
import { bridge, inElectron } from "../bridge";
import { bookmarkWebUrl } from "../bookmark-files";
import { hostOf, isPinned } from "../workspace";
import { FavIcon } from "./SiteTile";
import { I } from "./icons";

/** A searchable, keyboard-accessible place to organize several tabs together. */
export function Overview() {
  const pages = useStore(useShallow(state => state.pages.filter(page => page.viewStatus !== "detached" && !page.ownedByRuntime)));
  const layout = useStore(state => state.layout);
  const activePageId = useStore(state => state.activePageId);
  useStore(state => state.previewVersion);
  const audio = useStore(state => state.tabAudio);
  const [windows,setWindows]=useState<Awaited<ReturnType<typeof bridge.windows>>>([]);
  const [query, setQuery] = useState("");
  const [spaceId, setSpaceId] = useState(layout.activeSpaceId);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [shots, setShots] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [savingFolder, setSavingFolder] = useState<false | "bookmarks" | "tabs">(false);
  const [folderName, setFolderName] = useState("");
  const [progress, setProgress] = useState("");
  const [closing, setClosing] = useState(false);
  const pending = useRef(false);
  const stopClosing = useRef(false);
  const anchor = useRef<string | null>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState<string | null>(activePageId);
  const captured = useRef(new Set<string>());
  const search = query.trim().toLocaleLowerCase();
  const spaces = [...layout.spaces, ...(layout.archivedSpaces ?? [])];
  const folderSpace = layout.spaces.find(space => space.id === (spaceId || layout.activeSpaceId));
  const order = new Map(layout.order.map((id, index) => [id, index]));
  const visible = pages.filter(page => {
    const ownerId = layout.tabSpace[page.pageId] ?? layout.activeSpaceId;
    const owner = spaces.find(space => space.id === ownerId);
    const folder = layout.folders.find(folder => folder.id === layout.tabFolder[page.pageId]);
    return (!spaceId || ownerId === spaceId) && `${page.title} ${page.url} ${owner?.name ?? ""} ${folder?.name ?? ""}`.toLocaleLowerCase().includes(search);
  }).sort((a, b) => (order.get(a.pageId) ?? Infinity) - (order.get(b.pageId) ?? Infinity));
  const duplicates = duplicateTabs(visible, layout, activePageId);
  const visibleKey = JSON.stringify(visible.map(page => page.pageId));
  const focusedId = visible.some(page => page.pageId === focused) ? focused : visible[0]?.pageId;
  const selection = pages.filter(page => selected.has(page.pageId));
  const canMoveWindow = inElectron && !bridge.privateMode;
  const audioSelection = selection.filter(page => audio[page.pageId] && page.controller !== "agent" && page.controller !== "external");
  const muteSelection = audioSelection.some(page => !audio[page.pageId]!.muted);
  const hasSelection = selection.length > 0;

  useEffect(() => {
    if (!canMoveWindow || !hasSelection) return;
    let live = true;
    void bridge.windows().then(value => { if(live)setWindows(value); }).catch(reason => {
      if(live)setError(`Couldn’t list windows. ${reason instanceof Error ? reason.message : String(reason)}`);
    });
    return () => { live = false; };
  }, [canMoveWindow,hasSelection]);
  const previewIds = visible.slice(0, 24).map(page => page.pageId).join(",");

  useEffect(() => {
    let live = true;
    void bridge.focusShell().then(() => { if (live) searchInput.current?.focus(); }).catch(() => {});
    return () => { live = false; };
  }, []);

  useEffect(() => {
    const ids = new Set<string>(JSON.parse(visibleKey));
    setSelected(previous => [...previous].every(id => ids.has(id)) ? previous : new Set([...previous].filter(id => ids.has(id))));
    if (anchor.current && !ids.has(anchor.current)) anchor.current = null;
  }, [visibleKey]);

  useEffect(() => () => { stopClosing.current=true; }, []);

  function focusTab(pageId?: string) {
    if (!pageId) return;
    setFocused(pageId);
    const button = [...(grid.current?.querySelectorAll<HTMLButtonElement>(".ov-open") ?? [])].find(button => button.dataset.pageId === pageId);
    button?.focus(); button?.scrollIntoView({ block: "nearest" });
  }

  function navigateGrid(event: React.KeyboardEvent, pageId: string) {
    if (event.target !== event.currentTarget || busy || event.nativeEvent.isComposing || event.altKey || event.metaKey || event.ctrlKey) return;
    const index = visible.findIndex(page => page.pageId === pageId);
    const buttons = [...(grid.current?.querySelectorAll<HTMLButtonElement>(".ov-open") ?? [])];
    const firstTop = buttons[0]?.getBoundingClientRect().top;
    const columns = Math.max(1, buttons.filter(button => Math.abs(button.getBoundingClientRect().top - (firstTop ?? 0)) < 2).length);
    const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns };
    if (event.key === " ") { event.preventDefault(); select(pageId, event.shiftKey); return; }
    if (event.key === "Enter") { event.preventDefault(); void useStore.getState().activate(pageId).catch(errToast); return; }
    if (!(event.key in offsets) && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? visible.length - 1 : Math.max(0, Math.min(visible.length - 1, index + offsets[event.key]!));
    const destination = visible[next]?.pageId;
    if (event.shiftKey && destination) { anchor.current ??= pageId; select(destination, true); }
    focusTab(destination);
  }

  useEffect(() => {
    if (!inElectron) return;
    let cancelled = false;
    void (async () => {
      for (const pageId of previewIds.split(",").filter(Boolean)) {
        if (cancelled) break;
        if (pagePreview(pageId) || captured.current.has(pageId)) continue;
        const page = useStore.getState().pages.find(page => page.pageId === pageId);
        if (!page || page.viewStatus !== "visible") continue;
        captured.current.add(pageId);
        try {
          const image = page.backend === "aux" ? await bridge.preview(pageId)
            : (await call("pages.capture", { pageId })).dataUrl;
          if (!cancelled && image) setShots(previous => ({ ...previous, [pageId]: image }));
        } catch {
          // A page that closes during capture keeps its favicon.
        }
      }
    })();
    return () => { cancelled = true; };
  }, [previewIds]);

  function select(pageId: string, extend: boolean) {
    setSelected(previous => {
      const next = new Set(previous);
      const start = visible.findIndex(page => page.pageId === anchor.current);
      const end = visible.findIndex(page => page.pageId === pageId);
      if (extend && start >= 0 && end >= 0) {
        for (const page of visible.slice(Math.min(start, end), Math.max(start, end) + 1)) next.add(page.pageId);
      } else if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      return next;
    });
    if (!extend || !anchor.current) anchor.current = pageId;
  }

  async function act(work: () => Promise<void> | void) {
    if (pending.current) return;
    pending.current=true; setBusy(true); setError(""); setProgress("");
    try { await work(); }
    catch (error) { setError(error instanceof Error ? error.message : String(error)); }
    finally {
      pending.current=false; setBusy(false);
      requestAnimationFrame(() => { if (document.activeElement === document.body) searchInput.current?.focus(); });
    }
  }

  function open(page: PageTarget, event: React.MouseEvent) {
    if (busy) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || selection.length) select(page.pageId, event.shiftKey);
    else void useStore.getState().activate(page.pageId).catch(errToast);
  }

  return <div className="overview" onKeyDown={event => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Escape") {
      if (busy) { event.preventDefault(); event.stopPropagation(); stopClosing.current=true; return; }
      if (savingFolder) { event.preventDefault(); event.stopPropagation(); setSavingFolder(false); return; }
      event.preventDefault(); event.stopPropagation();
      if (selection.length) setSelected(new Set());
      else if (query) { setQuery(""); searchInput.current?.focus(); }
      else useStore.getState().setMode("focus");
    }
    if ((event.metaKey || event.ctrlKey) && event.key === "a" && !busy && !(event.target instanceof HTMLInputElement)) {
      event.preventDefault(); setSelected(new Set(visible.map(page => page.pageId)));
    }
  }}>
    <div className="ov-head">
      <div><h2>Your tabs</h2><p className="hint">{visible.length} {visible.length === 1 ? "tab" : "tabs"}{selection.length ? ` · ${selection.length} selected` : " · Everything in its place"}</p></div>
      <span className="sp" />
      <button className="btn sm" disabled={busy} onClick={() => void useStore.getState().newTab()}>{I.plusSm} New tab</button>
      <button className="btn sm ghost" disabled={busy} onClick={() => useStore.getState().setMode("focus")}>Done</button>
    </div>
    <div className="ov-tools">
      <label className="ov-search">{I.search}<input ref={searchInput} disabled={busy} autoFocus aria-label="Search tabs" placeholder="Search tabs, folders, or Spaces…" onKeyDown={event => { if (event.nativeEvent.isComposing) return; if (event.key === "ArrowDown") { event.preventDefault(); focusTab(visible[0]?.pageId); } if (event.key === "Enter" && visible[0] && !busy) { event.preventDefault(); void useStore.getState().activate(visible[0].pageId).catch(errToast); } }} value={query} onChange={event => setQuery(event.target.value)} /></label>
      <select disabled={busy} aria-label="Filter tabs by space" value={spaceId} onChange={event => setSpaceId(event.target.value)}>
        <option value="">All spaces</option>{[...layout.spaces, ...(layout.archivedSpaces ?? [])].map(space => <option key={space.id} value={space.id}>{space.name}{layout.archivedSpaces?.some(item => item.id === space.id) ? " · Archived" : ""}</option>)}
      </select>
      <button className="btn sm" disabled={busy || !visible.length} onClick={() => setSelected(new Set(visible.map(page => page.pageId)))}>Select all</button>
      {duplicates.length > 0 && <button className="btn sm ghost" disabled={busy} title="Select extra copies of the exact same address in each Space. Keep the active or most recently used copy. Agent-controlled tabs are excluded." onClick={() => {
        setSelected(new Set(duplicates)); anchor.current = duplicates[0] ?? null;
        setSavingFolder(false); setError("");
        setProgress(`Selected ${duplicates.length} duplicate ${duplicates.length === 1 ? "tab" : "tabs"} in this view. The active or most recently used copy stays unselected in each Space.`);
        focusTab(duplicates[0]);
      }}>Select duplicates · {duplicates.length}</button>}
    </div>
    {selection.length > 0 && <div className="ov-selection" role="region" aria-label="Selected tab actions" aria-busy={busy}>
      <strong>{selection.length} selected</strong>
      <select aria-label="Move selected tabs" value="" disabled={busy} onChange={event => {
        const value=event.target.value;
        if (value === "new-window" || value.startsWith("window:")) {
          void act(async () => {
            await useStore.getState().moveTabsToWindow(selection.map(page => page.pageId),value === "new-window" ? undefined : value.slice(7));
            setSelected(new Set()); setSavingFolder(false); setProgress("Selected tabs moved to their destination window.");
          });
          return;
        }
        if (value === "new-folder") { setSavingFolder("tabs"); setFolderName(""); return; }
        const separator=value.indexOf(":");
        const kind=value.slice(0,separator), id=value.slice(separator+1);
        if (separator < 0 || !id) return;
        void act(() => {
          const folder = kind === "folder" ? layout.folders.find(item => item.id === id) : undefined;
          useStore.getState().moveTabs(selection.map(page => page.pageId), folder?.spaceId ?? id, folder?.id);
          setSelected(new Set()); toast(folder ? `Tabs moved to ${folder.name}` : "Tabs moved");
        });
      }}><option value="">Move to…</option><option value="new-folder" disabled={!folderSpace}>New tab folder…</option>
        <optgroup label="Spaces">{layout.spaces.map(space => <option key={space.id} value={`space:${space.id}`}>{space.name}</option>)}</optgroup>
        {layout.folders.length > 0 && <optgroup label="Folders">{layout.folders.filter(folder => layout.spaces.some(space => space.id === folder.spaceId)).map(folder => <option key={folder.id} value={`folder:${folder.id}`}>{layout.spaces.find(space => space.id === folder.spaceId)?.name} / {folder.name}</option>)}</optgroup>}
        {canMoveWindow && <optgroup label="Windows"><option value="new-window">New window…</option>{windows.map(window=><option key={window.id} value={`window:${window.id}`}>{window.title} · {window.tabCount} tabs</option>)}</optgroup>}
      </select>
      {!!audioSelection.length && <button className="btn sm" disabled={busy} title={`${muteSelection ? "Mute" : "Unmute"} ${audioSelection.length} selected browser tabs. Agent-controlled tabs are excluded.`} onClick={()=>void act(async()=>{
        let changed=0;
        for(const page of audioSelection) {
          const state=useStore.getState();
          const current=state.pages.find(item=>item.pageId===page.pageId);
          if(!current || current.controller === "agent" || current.controller === "external")throw new Error(`Audio changed for ${changed} tabs. A remaining tab closed or changed control.`);
          if(state.tabAudio[page.pageId]?.muted === muteSelection)continue;
          try { await tabCommand({ kind: "setMuted", pageId: page.pageId, muted: muteSelection }); changed++; }
          catch(reason) { throw new Error(`Audio changed for ${changed} tabs. ${reason instanceof Error ? reason.message : String(reason)}`); }
        }
        setProgress(`${changed} ${changed === 1 ? "tab" : "tabs"} ${muteSelection ? "muted" : "unmuted"}.`);
      })}>{muteSelection ? "Mute tabs" : "Unmute tabs"}</button>}
      <button className="btn sm" disabled={busy || !selection.some(page => bookmarkWebUrl(page.url))} onClick={() => { setSavingFolder(value => value === "bookmarks" ? false : "bookmarks"); setFolderName(""); }}>Save bookmarks…</button>
      <button className="btn sm" disabled={busy} onClick={() => void act(async () => {
        stopClosing.current=false;setClosing(true);
        let closed=0;
        try {
          const completed = await useStore.getState().closeTabs(selection.map(page => page.pageId), {
            shouldStop: () => stopClosing.current,
            onClosed: (pageId, count) => {
              closed = count; setProgress(`Closing ${count} of ${selection.length}…`);
              setSelected(previous => { const next = new Set(previous); next.delete(pageId); return next; });
            },
          });
          setProgress(`${closed} ${closed === 1 ? "tab" : "tabs"} closed.${completed ? " Reopen with ⌘⇧T." : " Closing stopped."}`);
        } finally { setClosing(false); }
      })}>Close tabs</button>
      {closing && <button className="btn sm ghost" onClick={() => { stopClosing.current=true; setProgress("Stopping after the current tab…"); }}>Stop</button>}
      <span className="sp" /><button className="icon-btn" disabled={busy} aria-label="Clear tab selection" onClick={() => {setSelected(new Set());setSavingFolder(false);}}>{I.close}</button>
    </div>}
    {savingFolder && selection.length > 0 && <form className="ov-save-folder" onSubmit={event => {
      event.preventDefault(); void act(async () => {
        const name=folderName.trim(); if(!name)return;
        if (savingFolder === "tabs") {
          if (!folderSpace) throw new Error("Choose an available Space before creating a folder.");
          useStore.getState().moveTabs(selection.map(page => page.pageId), folderSpace.id, {name});
          setProgress(`Grouped tabs in ${folderSpace.name} / ${name}.`);
          setSelected(new Set()); setSavingFolder(false);
          return;
        }
        const bookmarks=selection.filter(page=>bookmarkWebUrl(page.url)).map(page=>({url:page.url,title:(page.title||hostOf(page.url)).slice(0,1000),folderPath:[name]}));
        const result=await call("bookmarks.saveFolder",{bookmarks,name});
        setProgress(`Saved ${result.added} pages in ${name}.${result.skipped ? ` ${result.skipped} already saved; their existing folders were kept.` : ""}`);
        setSavingFolder(false);
      });
    }}>
      <label>{savingFolder === "tabs" ? "Tab folder" : "Bookmark folder"}<input className="field-input" autoFocus disabled={busy} value={folderName} maxLength={200} placeholder="Reading, trip ideas, project research…" onChange={event=>setFolderName(event.target.value)} /></label>
      <p className="hint">{savingFolder === "tabs" ? `Move the selected open tabs into a new folder in ${folderSpace?.name ?? "the selected Space"}. Their pages stay open.` : "Save web pages for later. Existing bookmarks keep their current folders. Open the folder’s pages together from Library."}</p>
      <div className="row"><button className="btn sm" disabled={busy||!folderName.trim()||(savingFolder === "tabs" && !folderSpace)}>{savingFolder === "tabs" ? "Create folder" : "Save folder"}</button><button type="button" className="btn sm ghost" disabled={busy} onClick={()=>setSavingFolder(false)}>Cancel</button></div>
    </form>}
    {progress && <p className="hint ov-progress" role="status">{progress}</p>}
    {error && <p role="alert" className="field-error">{error}</p>}
    {!visible.length && <div className="empty-state ov-empty"><span className="empty-ico">{query ? I.search : I.grid}</span><h2>{query ? "No matching tabs" : "Room for something new"}</h2><p>{query ? "Try another title or address, or look in all spaces." : "Open a page to start browsing in this space."}</p></div>}
    <div ref={grid} className="ov-grid" aria-label="Open tabs" aria-description="Arrow keys move between tabs. Space selects a tab. Enter opens it.">
      {visible.map(page => {
        const shot = shots[page.pageId] || pagePreview(page.pageId);
        const title = page.title || "New Tab";
        const owner = [...layout.spaces, ...(layout.archivedSpaces ?? [])].find(space => space.id === layout.tabSpace[page.pageId]);
        return <article key={page.pageId} className={`ov-card ${page.pageId === activePageId ? "active" : ""} ${selected.has(page.pageId) ? "selected" : ""}`}>
          <button className="ov-open" data-page-id={page.pageId} tabIndex={focusedId === page.pageId ? 0 : -1} onFocus={() => setFocused(page.pageId)} onKeyDown={event => navigateGrid(event, page.pageId)} aria-label={`Open ${title}`} title={`${title}\n${page.url}`} onClick={event => open(page, event)}>
            <div className="ov-shot">{shot ? <img src={shot} alt="" loading="lazy" /> : <span className="ov-fallback"><FavIcon url={page.url} src={page.favicon} className="ov-bigfav" /></span>}</div>
            <div className="ov-meta"><FavIcon url={page.url} src={page.favicon} className="ov-fav" size="sm" /><span className="t">{title}</span>{owner && isPinned(layout, owner.id, page.url) && I.pin}</div>
            <div className="ov-url">{hostOf(page.url)}{!spaceId && owner ? ` · ${owner.name}` : ""}</div>
          </button>
          <input className="ov-check" type="checkbox" disabled={busy} tabIndex={focusedId === page.pageId ? 0 : -1} checked={selected.has(page.pageId)} aria-label={`Select ${title}`} onChange={() => select(page.pageId, false)} />
          <button className="ov-close icon-btn sm" disabled={busy} tabIndex={focusedId === page.pageId ? 0 : -1} aria-label={`Close ${title}`} onClick={() => void useStore.getState().closeTab(page.pageId)}>{I.close}</button>
        </article>;
      })}
    </div>
  </div>;
}
