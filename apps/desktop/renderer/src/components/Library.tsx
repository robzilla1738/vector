import { useEffect, useRef, useState } from "react";
import type { HistoryEntry } from "@vector/contracts";
import { call, useStore } from "../store";
import { hostOf } from "../workspace";
import { I } from "./icons";
import { bridge, inElectron } from "../bridge";
import { parseBookmarkFile, exportBookmarkFile, bookmarkWebUrl, MAX_BOOKMARK_FILE_SIZE } from "../bookmark-files";

type SavedPage = { url: string; title: string };
type View = "bookmarks" | "history";

/** Browser library: saved pages and recent visits share search and navigation. */
export function Library({ initialView = "bookmarks" }: { initialView?: View }) {
  const close = useStore(s => s.setOverlay);
  const bookmarks = useStore(s => s.bookmarks);
  const active = useStore(s => s.pages.find(page => page.pageId === s.activePageId));
  const [view, setView] = useState<View>(initialView);
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [removed, setRemoved] = useState<SavedPage | null>(null);
  const [editing, setEditing] = useState<SavedPage | null>(null);
  const [importPreview, setImportPreview] = useState<Awaited<ReturnType<typeof parseBookmarkFile>> | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    search.current?.focus();
    return () => previous?.focus();
  }, []);

  useEffect(() => {
    let live = true;
    setLoading(true); setError(""); setHistory([]);
    const timer = window.setTimeout(() => {
      const request = view === "history"
        ? call<HistoryEntry[]>("history.list", { query: query.trim() || undefined, limit: 500 }).then(items => { if (live) setHistory(items); })
        : call<SavedPage[]>("bookmarks.list", {}).then(items => { if (live) useStore.setState({ bookmarks: items }); });
      void request.catch(reason => { if (live) setError(String(reason)); }).finally(() => { if (live) setLoading(false); });
    }, view === "history" && query ? 120 : 0);
    return () => { live = false; window.clearTimeout(timer); };
  }, [view, view === "history" ? query : ""]);

  const q = query.trim().toLocaleLowerCase();
  const items = view === "bookmarks" ? bookmarks.filter(item => `${item.title} ${item.url}`.toLocaleLowerCase().includes(q)) : history;
  const isSaved = (url: string) => bookmarks.some(item => item.url === url);
  async function action(work: () => Promise<void>) {
    setBusy(true); setError("");
    try { await work(); } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { setBusy(false); }
  }
  async function save(item: SavedPage) {
    await call("bookmarks.add", item);
    const items = await call<SavedPage[]>("bookmarks.list", {});
    useStore.setState({ bookmarks: items });
  }
  function open(item: SavedPage) {
    void action(async () => {
      if (!/^https?:\/\//i.test(item.url)) throw new Error("This saved address is not a web page.");
      const state = useStore.getState();
      const existing = state.pages.find(page => page.url === item.url && !page.ownedByRuntime && !["crashed", "detached"].includes(page.viewStatus ?? ""));
      if (existing) {
        const spaceId = state.layout.tabSpace[existing.pageId];
        if (spaceId && spaceId !== state.layout.activeSpaceId) state.switchSpace(spaceId);
        await state.activate(existing.pageId);
      }
      else if (!await state.newTab(item.url)) throw new Error("The page could not be opened. Try again.");
      close(null);
    });
  }
  function choose(next: View) { setView(next); setEditing(null); setNotice(""); setQuery(""); }

  return <div className="overlay-scrim fade-in" onMouseDown={() => close(null)}>
    <div ref={dialog} className="palette library pop-in" role="dialog" aria-modal="true" aria-label="Library" onMouseDown={event => event.stopPropagation()} onKeyDown={event => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); if (editing) setEditing(null); else close(null); }
      if (event.key !== "Tab") return;
      const controls = [...event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled):not([tabindex='-1']),input:not(:disabled):not([type='file'])")];
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}>
      <div className="library-head"><h3>Library</h3><span className="sp" /><button className="icon-btn" aria-label="Close library" onClick={() => close(null)}>{I.close}</button></div>
      <div className="library-tabs seg" role="tablist" aria-label="Library views">{(["bookmarks", "history"] as const).map(tab => <button key={tab} id={`library-${tab}`} role="tab" aria-selected={view === tab} aria-controls="library-results" tabIndex={view === tab ? 0 : -1} className={view === tab ? "on" : ""}
        onClick={() => choose(tab)} onKeyDown={event => { if (["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); const next = tab === "bookmarks" ? "history" : "bookmarks"; choose(next); dialog.current?.querySelector<HTMLElement>(`#library-${next}`)?.focus(); } }}>{tab === "bookmarks" ? "Bookmarks" : "History"}</button>)}</div>
      <div className="palette-field"><span className="palette-ico">{I.search}</span><input ref={search} value={query} aria-label={`Search ${view}`} placeholder={`Search ${view} by title or address…`} onChange={event => setQuery(event.target.value)} onKeyDown={event => {
        if (event.key === "Enter" && !loading && items[0]) { event.preventDefault(); open(items[0]); }
        if (event.key === "ArrowDown") { event.preventDefault(); dialog.current?.querySelector<HTMLElement>(".library-open")?.focus(); }
      }} /></div>
      <div className="library-tools"><button className="btn sm" disabled={busy || !active || !/^https?:\/\//i.test(active.url) || isSaved(active.url)} onClick={() => active && void action(async () => { await save({ url: active.url, title: active.title || hostOf(active.url) }); setNotice("Current page bookmarked."); })}>{active && isSaved(active.url) ? "Current page bookmarked" : "Bookmark current page"}</button>
        {view === "bookmarks" && <><button className="btn sm" disabled={busy} onClick={() => fileInput.current?.click()}>Import HTML</button><button className="btn sm" disabled={busy || !bookmarks.length || !inElectron} onClick={() => void action(async () => {
          const file = await bridge.saveFile("aux-bookmarks.html", exportBookmarkFile(bookmarks));
          if (file) { const skipped = bookmarks.filter(item => !bookmarkWebUrl(item.url)).length; setNotice(skipped ? `Web bookmarks exported. ${skipped} unsupported addresses omitted.` : "Bookmarks exported."); }
        })}>Export HTML</button><input ref={fileInput} type="file" accept=".html,.htm,text/html" hidden aria-label="Import bookmark file" onChange={event => {
          const file = event.target.files?.[0]; event.target.value = "";
          if (!file) return;
          setImportPreview(null); setNotice("");
          void action(async () => {
            if (file.size > MAX_BOOKMARK_FILE_SIZE) throw new Error("Choose a bookmark HTML file smaller than 5 MB.");
            setImportPreview(await parseBookmarkFile(await file.text()));
          });
        }}/></>}
        {view === "history" && <span className="hint">Up to 500 most recent matching visits</span>}
      </div>
      {view === "bookmarks" && importPreview && <div className="library-import" role="region" aria-label="Bookmark import preview">
        <strong>{importPreview.bookmarks.length} web bookmarks ready</strong>
        <p className="hint">Existing bookmarks keep their titles. Folder contents are imported into the flat bookmark list. {importPreview.skipped > 0 ? `${importPreview.skipped} duplicate or unsupported links skipped.` : ""}</p>
        <ul>{importPreview.bookmarks.slice(0, 4).map(item => <li key={item.url}>{item.title} <span className="hint">{hostOf(item.url)}</span></li>)}</ul>
        <div className="library-tools"><button className="btn sm" disabled={busy} onClick={() => void action(async () => {
          const result = await call<{ added: number; skipped: number }>("bookmarks.import", { bookmarks: importPreview.bookmarks });
          useStore.setState({ bookmarks: await call<SavedPage[]>("bookmarks.list", {}) });
          setImportPreview(null); setQuery(""); setNotice(`Imported ${result.added} bookmarks. ${result.skipped} already saved.`);
        })}>Import bookmarks</button><button className="btn sm" disabled={busy} onClick={() => setImportPreview(null)}>Cancel import</button></div>
      </div>}
      {error && <p className="library-message" role="alert">{error}</p>}
      {notice && <p className="library-message" role="status">{notice}</p>}
      {removed && <div className="library-tools"><span className="hint">Removed {removed.title || hostOf(removed.url)}</span><button className="btn sm" disabled={busy} onClick={() => void action(async () => { await save(removed); setRemoved(null); setNotice("Bookmark restored."); })}>Undo remove</button></div>}
      <div className="palette-list" id="library-results" role="tabpanel" aria-labelledby={`library-${view}`} aria-busy={loading}>
        {loading ? <p className="pal-empty" role="status">Loading…</p> : !error && !items.length ? <p className="pal-empty">{query ? "No matching pages." : view === "bookmarks" ? "Save a page with Bookmark current page or ⌘D." : "Pages you visit will appear here."}</p> : items.map((item, index) => <div className="library-item" key={`${item.url}:${index}`}>
          <button className="library-open" disabled={busy} onClick={() => open(item)} title={item.url}>
            <span className="library-title">{item.title || hostOf(item.url)}</span><span className="library-url">{item.url}</span>
            {"visitedAt" in item && <span className="hint">{new Date(Number(item.visitedAt)).toLocaleString()}</span>}
          </button>
          <div className="library-actions">
            {view === "bookmarks" ? <><button className="btn sm" disabled={busy} aria-label={`Rename ${item.title || hostOf(item.url)}`} onClick={() => setEditing(item)}>Rename</button><button className="btn sm" disabled={busy} aria-label={`Remove ${item.title || hostOf(item.url)}`} onClick={() => void action(async () => {
              await call("bookmarks.remove", { url: item.url });
              useStore.setState({ bookmarks: await call<SavedPage[]>("bookmarks.list", {}) });
              setRemoved(item); setNotice(""); if (editing?.url === item.url) setEditing(null);
            })}>Remove</button></> : <button className="btn sm" disabled={busy || isSaved(item.url)} aria-label={`Bookmark ${item.title || hostOf(item.url)}`} onClick={() => void action(async () => { await save(item); setNotice("Page bookmarked."); })}>{isSaved(item.url) ? "Saved" : "Bookmark"}</button>}
          </div>
          {editing?.url === item.url && <form className="library-edit" onSubmit={event => { event.preventDefault(); void action(async () => { await save(editing); setEditing(null); setNotice("Bookmark renamed."); }); }}>
            <input aria-label="Bookmark title" autoFocus value={editing.title} maxLength={1000} onChange={event => setEditing({ ...editing, title: event.target.value })} />
            <button className="btn sm" disabled={busy || !editing.title.trim()} type="submit">Save title</button><button className="btn sm" type="button" onClick={() => setEditing(null)}>Cancel</button>
          </form>}
        </div>)}
      </div>
    </div>
  </div>;
}
