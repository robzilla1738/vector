import { backgroundLink } from "../browser-links";
import { moveListFocus } from "../keyboard-list";
import { SessionRecovery } from "./SessionRecovery";
import { Fragment, useEffect, useRef, useState } from "react";
import type { HistoryEntry } from "@aux/contracts";
import { call, useStore } from "../store";
import { hostOf } from "../workspace";
import { I } from "./icons";
import { bridge, inNativeHost } from "../bridge";
import { RecentlyClosed } from "./RecentlyClosed";
import { ClearHistory } from "./ClearHistory";
import { OpenBookmarkFolder } from "./OpenBookmarkFolder";
import { parseBookmarkFile, exportBookmarkFile, bookmarkWebUrl, MAX_BOOKMARK_FILE_SIZE } from "../bookmark-files";
import { useShortcutLabels } from "../use-shortcut-label";
import { SkeletonRows } from "./Skeleton";

type SavedPage = { url: string; title: string; folderPath?: string[]; readingList?: boolean; readAt?: number; offline?: boolean };
type View = "bookmarks" | "reading" | "history" | "closed";
const VIEWS: View[] = ["bookmarks", "reading", "history", "closed"];
const VIEW_NAMES: Record<View, string> = { bookmarks: "Bookmarks", reading: "Reading list", history: "History", closed: "Recently closed" };
const HISTORY_PAGE_SIZE = 100;
function historySince(range: string): number | undefined {
  if (range === "all") return undefined;
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (range === "week" ? 6 : range === "month" ? 29 : 0));
  return date.getTime();
}
const dayOf = (item: SavedPage | HistoryEntry) => "visitedAt" in item ? new Date(item.visitedAt).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "";

/** Browser library: saved pages and recent visits share search and navigation. */
export function Library({ initialView = "bookmarks", confirmClear = false }: { initialView?: View; confirmClear?: boolean }) {
  const key = useShortcutLabels();
  const close = useStore(s => s.setOverlay);
  const bookmarks = useStore(s => s.bookmarks);
  const active = useStore(s => s.pages.find(page => page.pageId === s.activePageId));
  const [view, setView] = useState<View>(initialView);
  const [query, setQuery] = useState("");
  const [folders, setFolders] = useState<string[][]>([]);
  const [folder, setFolder] = useState<string[]>([]);
  const [selecting, setSelecting] = useState(false);
  const [selection, setSelection] = useState<SavedPage[]>([]);
  const [moveFolder, setMoveFolder] = useState("[]");
  const [newMoveFolder,setNewMoveFolder]=useState("");
  const toggleSelection = (item: SavedPage) => setSelection(current => current.some(selected => selected.url === item.url)
    ? current.filter(selected => selected.url !== item.url) : [...current, {...item, folderPath:[...(item.folderPath ?? [])]}]);
  const [folderEditor, setFolderEditor] = useState<{ mode: "create" | "rename"; name: string } | null>(null);
  const [importSource, setImportSource] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyRange, setHistoryRange] = useState("all");
  const [moreHistory, setMoreHistory] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const historyRequest = useRef(0);
  const loadedFilter = useRef("");
  const actionPending = useRef(false);
  const morePending = useRef(false);
  const [failedLoad, setFailedLoad] = useState<"initial" | "more" | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [removed, setRemoved] = useState<SavedPage | null>(null);
  const [editing, setEditing] = useState<(SavedPage & { original: SavedPage }) | null>(null);
  const [importPreview, setImportPreview] = useState<Awaited<ReturnType<typeof parseBookmarkFile>> | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (selecting) dialog.current?.querySelector<HTMLButtonElement>(".library-selection button:not(:disabled)")?.focus();
  }, [selecting]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    search.current?.focus();
    return () => previous?.focus();
  }, []);

  useEffect(() => {
    let live = true;
    const version = ++historyRequest.current;
    const filter = JSON.stringify([view, query.trim(), historyRange]);
    if (loadedFilter.current !== filter) { setHistory([]); setMoreHistory(false); }
    loadedFilter.current = filter;
    setLoading(true); setError(""); setFailedLoad(null); setLoadingMore(false); morePending.current=false;
    if (view === "closed") { setLoading(false); return; }
    const timer = window.setTimeout(() => {
      const request = view === "history"
        ? call("history.list", { query: query.trim() || undefined, limit: HISTORY_PAGE_SIZE, since: historySince(historyRange) }).then(items => { if (live && version === historyRequest.current) { setHistory(items); setMoreHistory(items.length === HISTORY_PAGE_SIZE); } })
        : Promise.all([call("bookmarks.list", {}), call("bookmarks.folders.list", {})]).then(([items, paths]) => {
          if (live) { useStore.setState({ bookmarks: items }); setFolders(paths); }
        });
      void request.catch(reason => { if (live) { setError(String(reason)); setFailedLoad("initial"); } }).finally(() => { if (live) setLoading(false); });
    }, view === "history" && query ? 120 : 0);
    return () => { live = false; ++historyRequest.current; window.clearTimeout(timer); };
  }, [view, view === "history" ? query : "", historyRange, refresh]);

  useEffect(() => bridge.onEvent(event => {
    if (event.type === "history.changed" && view === "history") setRefresh(value => value + 1);
  }), [view]);

  async function loadMoreHistory() {
    const last = history.at(-1);
    if (!last || morePending.current || loading) return;
    morePending.current=true;
    const version = historyRequest.current;
    setLoadingMore(true); setError(""); setFailedLoad(null);
    try {
      const found = await call("history.list", { query: query.trim() || undefined, limit: HISTORY_PAGE_SIZE,
        since: historySince(historyRange), before: { visitedAt: last.visitedAt, url: last.url } });
      if (version !== historyRequest.current) return;
      setHistory(current => [...current, ...found]);
      setMoreHistory(found.length === HISTORY_PAGE_SIZE);
    } catch (reason) { if (version === historyRequest.current) { setError(String(reason)); setFailedLoad("more"); } }
    finally { if (version === historyRequest.current) { setLoadingMore(false); morePending.current=false; } }
  }

  useEffect(() => {
    if (view !== "bookmarks") return;
    let live = true;
    let revision = 0;
    const unsubscribe = bridge.onEvent(event => {
      if (event.type !== "bookmarks.changed") return;
      const current = ++revision;
      void call("bookmarks.folders.list").then(paths => {
        if (!live || current !== revision) return;
        setFolders(paths);
        setFolder(previous => paths.some(path => JSON.stringify(path) === JSON.stringify(previous)) ? previous : []);
      }).catch(reason => { if (live && current === revision) setError(String(reason)); });
    });
    return () => { live = false; unsubscribe(); };
  }, [view]);

  const q = query.trim().toLocaleLowerCase();
  const folderKey = JSON.stringify(folder);
  const childFolders = folders.filter(path => q
    ? path.join(" / ").toLocaleLowerCase().includes(q)
    : path.length === folder.length + 1 && folder.every((part, index) => path[index] === part));
  function openFolder(path: string[]) {
    setFolder(path); setQuery(""); setEditing(null); setFolderEditor(null);
    search.current?.focus();
    dialog.current?.querySelector("#library-results")?.scrollTo({top:0});
  }
  const items = view === "bookmarks" ? bookmarks.filter(item => q
    ? `${item.title} ${item.url} ${item.folderPath?.join(" ") ?? ""}`.toLocaleLowerCase().includes(q)
    : JSON.stringify(item.folderPath ?? []) === folderKey)
    : view === "reading" ? bookmarks.filter(item => item.readingList && (!q || `${item.title} ${item.url}`.toLocaleLowerCase().includes(q)))
    : view === "history" ? history : [];
  const unread = view === "reading" ? items.filter(item => !(item as SavedPage).readAt) : [];
  const read = view === "reading" ? items.filter(item => (item as SavedPage).readAt) : [];
  const displayItems = view === "reading" ? [...unread, ...read] : items;
  const openPageFor = (url: string) => useStore.getState().pages.find(page => page.url === url && page.backend === "aux" && !page.ownedByRuntime);
  const isSaved = (url: string) => bookmarks.some(item => item.url === url);
  const importDuplicates = importPreview?.bookmarks.filter(item => isSaved(item.url)).length ?? 0;
  async function action(work: () => Promise<void>) {
    if (actionPending.current) return;
    actionPending.current=true; setBusy(true); setError(""); setFailedLoad(null);
    const focused=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const restore=!!focused&&!!dialog.current?.contains(focused);
    try { await work(); } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally {
      actionPending.current=false; setBusy(false);
      if(restore)requestAnimationFrame(()=>{
        if(!dialog.current || document.activeElement!==document.body)return;
        if(focused?.isConnected)focused.focus(); else search.current?.focus();
      });
    }
  }
  async function save(item: SavedPage) {
    await call("bookmarks.add", item);
    const items = await call("bookmarks.list", {});
    useStore.setState({ bookmarks: items });
    setFolders(await call("bookmarks.folders.list"));
  }
  function open(item: SavedPage, background = false, trigger?: HTMLElement) {
    void action(async () => {
      const url = bookmarkWebUrl(item.url);
      if (!url) throw new Error("This saved address is not a web page.");
      const state = useStore.getState();
      if (background) {
        const overlay = state.overlay;
        await state.openBackgroundTab(url, state.layout.activeSpaceId, false);
        setNotice(`Opened ${item.title || hostOf(url)} in a background tab.`);
        const returnFocus = () => trigger?.isConnected && useStore.getState().overlay === overlay
          && (document.activeElement === document.body || document.activeElement === trigger);
        // Wait for the action to re-enable its controls before restoring focus.
        requestAnimationFrame(() => {
          if (returnFocus()) void bridge.focusShell().then(() => { if (returnFocus()) trigger?.focus(); }).catch(() => {});
        });
        return;
      }
      const existing = state.pages.find(page => page.url === item.url && !page.ownedByRuntime && !["crashed", "detached"].includes(page.viewStatus ?? ""));
      if (existing) {
        const spaceId = state.layout.tabSpace[existing.pageId];
        if (spaceId && spaceId !== state.layout.activeSpaceId) state.switchSpace(spaceId);
        await state.activate(existing.pageId);
      }
      else if (!await state.newTab(item.url)) throw new Error("The page could not be opened. Try again.");
      // A foreground open is the act of reading — background opens stay unread.
      if (item.readingList && !item.readAt) await call("bookmarks.markRead", { url: item.url, read: true });
      if (["bookmarks", "history", "clear-history"].includes(useStore.getState().overlay ?? "")) close(null);
    });
  }
  function choose(next: View) { setFolderEditor(null); setSelecting(false); setSelection([]); setView(next); setEditing(null); setNotice(""); setQuery(""); }

  function cancelEditor() {
    setEditing(null); setFolderEditor(null);
    search.current?.focus();
  }
  function cancelSelection() {
    setSelecting(false); setSelection([]); search.current?.focus();
  }
  function cancelImport() {
    setImportPreview(null); search.current?.focus();
  }
  // Private windows never carry reading-list state, so the view stays hidden there.
  const views = bridge.privateMode ? VIEWS.filter(tab => tab !== "reading") : VIEWS;

  return <div className="overlay-scrim fade-in" onMouseDown={() => close(null)}>
    <div ref={dialog} className="palette library pop-in" role="dialog" aria-modal="true" aria-label="Library" onMouseDown={event => event.stopPropagation()} onKeyDown={event => {
      if (event.nativeEvent.isComposing) return;
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); if (editing || folderEditor) cancelEditor(); else if (importPreview) cancelImport(); else if (selecting) cancelSelection(); else close(null); }
      if (event.key !== "Tab") return;
      const controls = [...event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled):not([tabindex='-1']),input:not(:disabled):not([type='file']),select:not(:disabled)")];
      const visible = controls.filter(control => control.getClientRects().length > 0);
      const first = visible[0], last = visible.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}>
      <div className="library-head"><h3>Library</h3><span className="sp" /><button className="icon-btn" aria-label="Close library" onClick={() => close(null)}>{I.close}</button></div>
      <div className="library-tabs seg" role="tablist" aria-label="Library views">{views.map(tab => <button key={tab} id={`library-${tab}`} role="tab" aria-selected={view === tab} aria-controls="library-results" tabIndex={view === tab ? 0 : -1} className={view === tab ? "on" : ""}
        onClick={() => choose(tab)} onKeyDown={event => { if (["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); const next = views[(views.indexOf(tab) + (event.key === "ArrowRight" ? 1 : views.length - 1)) % views.length]!; choose(next); dialog.current?.querySelector<HTMLElement>(`#library-${next}`)?.focus(); } }}>{VIEW_NAMES[tab]}</button>)}</div>
      <div className="palette-field"><span className="palette-ico">{I.search}</span><input ref={search} value={query} aria-label={`Search ${VIEW_NAMES[view].toLowerCase()}`} placeholder={`Search ${VIEW_NAMES[view].toLowerCase()} by title or address…`} onChange={event => setQuery(event.target.value)} onKeyDown={event => {
        if (event.nativeEvent.isComposing) return;
        if (event.key === "Enter" && !selecting && !loading) {
          if (view === "closed") { event.preventDefault(); dialog.current?.querySelector<HTMLButtonElement>(".library-open:not(:disabled)")?.click(); }
          else if (view === "bookmarks" && childFolders[0]) { event.preventDefault(); openFolder(childFolders[0]); }
          else if (items[0]) { event.preventDefault(); open(items[0]); }
        }
        if (event.key === "ArrowDown") { event.preventDefault(); dialog.current?.querySelector<HTMLElement>(".library-folder, .library-open")?.focus(); }
      }} /></div>
      {bridge.privateMode && <p className="library-message hint">Bookmarks and history stay in this private window until it closes. Exported files remain on your Mac.</p>}
      <SessionRecovery />
      {view === "closed" ? <RecentlyClosed query={query} /> : <>
      <div className="library-tools" hidden={selecting && view === "bookmarks"}><button className="btn sm" disabled={busy || !active || !/^https?:\/\//i.test(active.url) || isSaved(active.url)} onClick={() => active && void action(async () => { await save({ url: active.url, title: active.title || hostOf(active.url), folderPath: folder }); setNotice("Current page bookmarked."); })}>{active && isSaved(active.url) ? "Current page bookmarked" : "Bookmark current page"}</button>
        {view === "reading" && <button className="btn sm" disabled={busy || !active || !/^https?:\/\//i.test(active.url) || bookmarks.some(b => b.url === active.url && b.readingList)} onClick={() => active && void action(async () => { await call("bookmarks.readingList", { url: active.url, readingList: true, title: active.title || hostOf(active.url) }); setNotice("Added to reading list."); })}>{active && bookmarks.some(b => b.url === active.url && b.readingList) ? "Page in reading list" : "Read later"}</button>}
        {view === "bookmarks" && <><button className="btn sm" disabled={busy || !bookmarks.length} aria-pressed={selecting} onClick={() => { setSelecting(value => !value); setSelection([]); setEditing(null); setMoveFolder(JSON.stringify(folder)); setNewMoveFolder(""); }}>Select</button><button className="btn sm" disabled={busy} onClick={() => setFolderEditor({ mode: "create", name: "" })}>{I.folderClosed} New folder</button><button className="btn sm" disabled={busy} onClick={() => fileInput.current?.click()}>Import HTML</button><button className="btn sm" disabled={busy || (!bookmarks.length && !folders.length) || !inNativeHost} onClick={() => void action(async () => {
          const file = await bridge.saveFile("aux-bookmarks.html", exportBookmarkFile(bookmarks, folders));
          if (file) { const skipped = bookmarks.filter(item => !bookmarkWebUrl(item.url)).length; setNotice(skipped ? `Web bookmarks exported. ${skipped} unsupported addresses omitted.` : "Bookmarks exported."); }
        })}>Export HTML</button><input ref={fileInput} type="file" accept=".html,.htm,text/html" hidden aria-label="Import bookmark file" onChange={event => {
          const file = event.target.files?.[0]; event.target.value = "";
          if (!file) return;
          setImportPreview(null); setNotice(""); setImportSource(file.name);
          void action(async () => {
            if (file.size > MAX_BOOKMARK_FILE_SIZE) throw new Error("Choose a bookmark HTML file smaller than 5 MB.");
            setImportPreview(await parseBookmarkFile(await file.text()));
          });
        }}/></>}
        {view === "history" && <><div className="library-ranges" role="group" aria-label="History date range">{[["all","All time"],["today","Today"],["week","7 days"],["month","30 days"]].map(([value,label]) => <button key={value} className="btn sm ghost" aria-pressed={historyRange === value} onClick={() => setHistoryRange(value!)}>{label}</button>)}</div><ClearHistory initiallyOpen={confirmClear} /></>}
      </div>
      {view === "bookmarks" && selecting && <div className="library-selection" role="region" aria-label="Move selected bookmarks">
        <div className="row"><strong>{selection.length} selected</strong><span className="sp" />
          <button className="btn sm ghost" disabled={busy || !items.length} onClick={() => setSelection(current => [...current, ...items.filter(item => !current.some(selected => selected.url === item.url)).map(item => ({...item, folderPath:[...("folderPath" in item ? item.folderPath ?? [] : [])]}))])}>Select this view</button>
          <button className="btn sm ghost" disabled={busy} onClick={cancelSelection}>Cancel</button>
        </div>
        <div className="row"><label htmlFor="bookmark-move-destination">Move to</label>
          <select id="bookmark-move-destination" className="grow field-input" value={moveFolder} disabled={busy} onChange={event => setMoveFolder(event.target.value)}>
            <option value="[]">Bookmarks</option>{folders.map(path => <option key={JSON.stringify(path)} value={JSON.stringify(path)}>{path.join(" / ")}</option>)}
            <option value="new">New folder in {folder.length ? folder.join(" / ") : "Bookmarks"}…</option>
          </select>
          {moveFolder === "new" && <input className="field-input grow" aria-label="New destination folder name" placeholder="Folder name" maxLength={200} value={newMoveFolder} disabled={busy} onChange={event=>setNewMoveFolder(event.target.value)} />}
          <button className="btn sm" disabled={busy || !selection.length || (moveFolder === "new" && !newMoveFolder.trim())} onClick={() => void action(async () => {
            const result = await call("bookmarks.move", {bookmarks:selection.map(item => ({url:item.url, folderPath:item.folderPath ?? []})), folderPath:moveFolder === "new" ? [...folder,newMoveFolder.trim()] : JSON.parse(moveFolder), createFolder:moveFolder === "new"});
            useStore.setState({bookmarks:await call("bookmarks.list")});
            setFolders(await call("bookmarks.folders.list"));
            setSelection([]); setSelecting(false); search.current?.focus(); setNotice(`${result.moved} ${result.moved === 1 ? "bookmark" : "bookmarks"} moved.`);
          })}>{busy ? "Moving…" : "Move"}</button>
        </div>
      </div>}
      {view === "bookmarks" && importPreview && <div className="library-import" role="region" aria-label="Bookmark import preview">
        <strong>{importPreview.bookmarks.length} web bookmarks ready</strong>
        <p className="hint">From {importSource} into Bookmarks · {importDuplicates} already saved · {importPreview.folders.length} folders preserved. Existing bookmarks keep their titles and folders. {importPreview.skipped > 0 ? `${importPreview.skipped} duplicate or unsupported links skipped.` : ""}</p>
        <ul>{importPreview.bookmarks.slice(0, 4).map(item => <li key={item.url}>{item.title} <span className="hint">{hostOf(item.url)}</span></li>)}</ul>
        <div className="library-tools"><button className="btn sm" disabled={busy} onClick={() => void action(async () => {
          const result = await call("bookmarks.import", { bookmarks: importPreview.bookmarks, folders: importPreview.folders });
          useStore.setState({ bookmarks: await call("bookmarks.list", {}) });
          setFolders(await call("bookmarks.folders.list")); setFolder([]);
          setImportPreview(null); setQuery(""); setNotice(`Imported ${result.added} bookmarks. ${result.skipped} already saved.`);
        })}>Import bookmarks</button><button className="btn sm" disabled={busy} onClick={cancelImport}>Cancel import</button></div>
      </div>}
      {view === "bookmarks" && <nav className="library-breadcrumbs" aria-label="Bookmark folders">
        <button className="btn ghost sm" onClick={() => openFolder([])}>Bookmarks</button>
        {folder.map((part, index) => <span key={index}>{I.right}<button className="btn ghost sm" onClick={() => openFolder(folder.slice(0, index + 1))}>{part}</button></span>)}
        <span className="sp" />
        {folder.length > 0 && <><button className="icon-btn" title="Rename folder" aria-label="Rename folder" onClick={() => setFolderEditor({ mode: "rename", name: folder.at(-1)! })}>{I.pencil}</button>
          <button className="icon-btn" title="Remove empty folder" aria-label="Remove empty folder" disabled={busy} onClick={() => void action(async () => {
            setFolders(await call("bookmarks.folders.remove", { path: folder })); setFolder(folder.slice(0, -1));
          })}>{I.trash}</button></>}
      </nav>}
      {view === "bookmarks" && folder.length > 0 && !q && !loading && <div className="library-tools"><OpenBookmarkFolder key={folderKey} bookmarks={bookmarks} folder={folder} /></div>}
      {view === "bookmarks" && folderEditor && <form className="library-folder-editor" onSubmit={event => {
        event.preventDefault();
        void action(async () => {
          const name = folderEditor.name.trim();
          if (!name) return;
          if (folderEditor.mode === "create") setFolders(await call("bookmarks.folders.create", { path: [...folder, name] }));
          else {
            setFolders(await call("bookmarks.folders.rename", { path: folder, name }));
            useStore.setState({ bookmarks: await call("bookmarks.list") });
            setFolder([...folder.slice(0, -1), name]);
          }
          setFolderEditor(null);
          search.current?.focus();
        });
      }}>
        <input autoFocus aria-label="Folder name" placeholder="Folder name" value={folderEditor.name} maxLength={200} onChange={event => setFolderEditor({ ...folderEditor, name: event.target.value })} />
        <button className="btn sm" disabled={busy || !folderEditor.name.trim()}>{folderEditor.mode === "create" ? "Create folder" : "Rename"}</button>
        <button className="btn sm" type="button" onClick={cancelEditor}>Cancel</button>
      </form>}
      {error && <p className="library-message" role="alert">{error} {failedLoad && <button className="btn sm" disabled={loading || loadingMore} onClick={() => failedLoad === "more" ? void loadMoreHistory() : setRefresh(value => value + 1)}>Retry</button>}</p>}
      {notice && <p className="library-message" role="status">{notice}</p>}
      {removed && <div className="library-tools"><span className="hint">Removed {removed.title || hostOf(removed.url)}</span><button className="btn sm" disabled={busy} onClick={() => void action(async () => { await save(removed); setRemoved(null); setNotice("Bookmark restored."); })}>Undo remove</button></div>}
      <div className="palette-list" id="library-results" role="tabpanel" aria-labelledby={`library-${view}`} aria-busy={loading} onKeyDown={event => moveListFocus(event, ".library-folder, .library-open")}>
        {view === "bookmarks" && childFolders.map(path => <button key={JSON.stringify(path)} className="library-folder" onClick={() => openFolder(path)}>
          <span className="library-folder-icon">{I.folderClosed}</span><span className="t">{q ? path.join(" / ") : path.at(-1)}</span><span className="hint">{bookmarks.filter(item => path.every((part, index) => item.folderPath?.[index] === part)).length}</span>{I.right}
        </button>)}
        {loading && (items.length ? <p className="library-message hint" role="status">Updating…</p> : <SkeletonRows label="Loading…" />)}
        {!loading && !error && !displayItems.length && (view !== "bookmarks" || !childFolders.length) ? <p className="pal-empty">{query ? view === "bookmarks" ? "No matching bookmarks or folders." : "No matching pages." : view === "bookmarks" ? `Save a page with Bookmark current page${key("bookmark") ? ` or ${key("bookmark")}` : ""}.` : view === "reading" ? "Save pages to read later — Add to reading list on any tab." : "Pages you visit will appear here."}</p> : displayItems.map((item, index) => <Fragment key={"visitedAt" in item ? `${item.url}:${item.visitedAt}` : item.url}>
          {view === "history" && (index === 0 || dayOf(displayItems[index - 1]!) !== dayOf(item)) && <h4 className="library-day">{dayOf(item)}</h4>}
          {view === "reading" && index === 0 && unread.length > 0 && <h4 className="library-day">Unread</h4>}
          {view === "reading" && index === unread.length && read.length > 0 && <h4 className="library-day">Read</h4>}
          <div className={`library-item${selecting && selection.some(selected => selected.url === item.url) ? " selected" : ""}${view === "reading" && "readAt" in item && item.readAt ? " read" : ""}`}>
          {selecting && view === "bookmarks" && <input className="library-select" type="checkbox" aria-label={`Select ${item.title || hostOf(item.url)}`} checked={selection.some(selected => selected.url === item.url)} disabled={busy} onChange={() => toggleSelection(item)} />}
          <button className="library-open" disabled={busy} onClick={event => selecting && view === "bookmarks" ? toggleSelection(item) : open(item, backgroundLink(event), event.currentTarget)}
            onAuxClick={event => { if (event.button === 1) { event.preventDefault(); if (!selecting) open(item, true, event.currentTarget); } }} title={`${item.title || hostOf(item.url)} — ${item.url}`}>
            <span className="library-row-heading"><span className="library-title">{item.title || hostOf(item.url)}</span>{"visitedAt" in item && <time className="library-time" dateTime={new Date(Number(item.visitedAt)).toISOString()}>{new Date(Number(item.visitedAt)).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</time>}</span><span className="library-url">{item.url}</span>{q && "folderPath" in item && item.folderPath?.length ? <span className="hint">{item.folderPath.join(" / ")}</span> : null}
          </button>
          <div className="library-actions" hidden={selecting}>
            {view === "bookmarks" ? <><button className="icon-btn sm" title="Edit bookmark" disabled={busy} aria-label={`Edit ${item.title || hostOf(item.url)}`} onClick={() => setEditing({ ...item, original: item })}>{I.pencil}</button><button className="icon-btn sm" title="Remove bookmark" disabled={busy} aria-label={`Remove ${item.title || hostOf(item.url)}`} onClick={() => void action(async () => {
              await call("bookmarks.remove", { url: item.url });
              useStore.setState({ bookmarks: await call("bookmarks.list", {}) });
              setRemoved(item); setNotice(""); if (editing?.original.url === item.url) setEditing(null);
            })}>{I.trash}</button></> : view === "reading" && "readingList" in item ? <>
              {item.offline && <span className="hint library-offline" title="Offline copy saved">offline</span>}
              {openPageFor(item.url) && <button className="icon-btn sm" title={item.offline ? "Refresh offline copy" : "Save offline copy"} disabled={busy} aria-label={`${item.offline ? "Refresh" : "Save"} offline copy of ${item.title || hostOf(item.url)}`} onClick={() => void action(async () => {
                const target = openPageFor(item.url);
                if (!target) return;
                const article = await bridge.readArticle(target.pageId);
                await call("bookmarks.offline.set", { url: item.url, article: JSON.stringify(article) });
                useStore.setState({ bookmarks: await call("bookmarks.list", {}) });
                setNotice("Offline copy saved.");
              })}>{I.downloadSm}</button>}
              <button className="icon-btn sm" title={"readAt" in item && item.readAt ? "Mark unread" : "Mark read"} disabled={busy} aria-label={`Mark ${item.title || hostOf(item.url)} ${"readAt" in item && item.readAt ? "unread" : "read"}`} onClick={() => void action(async () => {
                await call("bookmarks.markRead", { url: item.url, read: !("readAt" in item && item.readAt) });
                useStore.setState({ bookmarks: await call("bookmarks.list", {}) });
              })}>{"readAt" in item && item.readAt ? I.circle : I.check}</button>
              <button className="icon-btn sm" title="Remove from reading list" disabled={busy} aria-label={`Remove ${item.title || hostOf(item.url)} from reading list`} onClick={() => void action(async () => {
                await call("bookmarks.readingList", { url: item.url, readingList: false });
                useStore.setState({ bookmarks: await call("bookmarks.list", {}) });
              })}>{I.trash}</button>
            </> : <><button className="icon-btn sm" title={isSaved(item.url) ? "Already bookmarked" : "Bookmark page"} disabled={busy || isSaved(item.url)} aria-label={`Bookmark ${item.title || hostOf(item.url)}`} onClick={() => void action(async () => { await save(item); setNotice("Page bookmarked."); })}>{isSaved(item.url) ? I.bookmarkFill : I.bookmark}</button>
              {"visitedAt" in item && <button className="icon-btn sm" title="Remove this visit" disabled={busy} aria-label={`Remove visit to ${item.title || hostOf(item.url)}`} onClick={() => void action(async () => {
                await call("history.remove", { url: item.url, visitedAt: item.visitedAt });
                setHistory(current => current.filter(entry => entry.url !== item.url || entry.visitedAt !== item.visitedAt));
                setNotice("Visit removed from browsing history. Bookmarks and saved work are unchanged.");
              })}>{I.trash}</button>}</>}
          </div>
          {editing?.original.url === item.url && <form className="library-edit" onSubmit={event => { event.preventDefault(); void action(async () => { const url = bookmarkWebUrl(editing.url.trim());
              if (!url) throw new Error("Enter a complete http or https address without a username or password.");
              await call("bookmarks.update", { originalUrl: editing.original.url, url, title: editing.title.trim(), folderPath: editing.folderPath, expected: { title: editing.original.title, folderPath: editing.original.folderPath } });
              // The update event supplies the authoritative list. A follow-up read
              // must not turn a successful edit into an apparent failed save.
              setEditing(null); setNotice("Bookmark updated."); }); }}>
            <label className="library-edit-field">Name<input className="field-input" aria-label="Bookmark title" autoFocus disabled={busy} value={editing.title} maxLength={1000} onChange={event => setEditing({ ...editing, title: event.target.value })} /></label>
            <label className="library-edit-field">Address<input className="field-input" aria-label="Bookmark address" placeholder="https://example.com" value={editing.url} maxLength={8192} disabled={busy} spellCheck={false} autoCapitalize="none" onChange={event => setEditing({ ...editing, url: event.target.value })} /></label>
            <label className="library-edit-field library-edit-folder">Folder<select className="field-input" aria-label="Bookmark folder" disabled={busy} value={JSON.stringify(editing.folderPath ?? [])} onChange={event => setEditing({ ...editing, folderPath: JSON.parse(event.target.value) as string[] })}>
              <option value="[]">Bookmarks</option>{folders.map(path => <option key={JSON.stringify(path)} value={JSON.stringify(path)}>{path.join(" / ")}</option>)}
            </select></label>
            <div className="library-edit-buttons"><button className="btn sm ghost" type="button" disabled={busy} onClick={cancelEditor}>Cancel</button><button className="btn sm" disabled={busy || !editing.title.trim() || !editing.url.trim()} type="submit">{busy ? "Saving…" : "Save"}</button></div>
          </form>}
        </div></Fragment>)}
        {view === "history" && moreHistory && !loading && <div className="library-more"><button className="btn sm" disabled={loadingMore || busy} onClick={() => void loadMoreHistory()}>{loadingMore ? "Loading older visits…" : "Load older visits"}</button><span className="hint">{history.length} visits shown</span></div>}
      </div>
      </>}
    </div>
  </div>;
}
