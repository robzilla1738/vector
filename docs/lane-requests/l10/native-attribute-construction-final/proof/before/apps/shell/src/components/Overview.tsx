import { staticIconButtonProps, staticFieldInputProps, staticFieldErrorProps } from "../ui/class-props";
import { staticHintProps, staticRowProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { runCommand } from "../commands";
import "./Overview.css";
import { TabCardCaption } from "./TabCardCaption";
import { duplicateTabs, protectedDuplicateIds } from "../duplicate-tabs";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import type { PageTarget, TidyProposal } from "@aux/contracts";
import { useStore, call, errToast, tabCommand, toast, pagePreview } from "../store";
import { bridge, inNativeHost } from "../bridge";
import { bookmarkWebUrl } from "../bookmark-files";
import { hostOf, isPinned, tabLabel, type ArchivedTab } from "../workspace";
import { flushLayout, persistLayout, reloadOrganizationLayout, undoPersistedTidy } from "../store/persistence";
import { applyTidyProposal, tidyUndoRecord } from "../tidy-layout";
import { commitTidyLayout } from "../tidy-commit";
import { archivePages, restoreArchivedTab } from "../archive-actions";
import { FavIcon } from "./SiteTile";
import { shellIconClose, shellIconGrid, shellIconPlusSm, shellIconSearch } from "./icons";
import { useShortcutLabels } from "../use-shortcut-label";
import { useFeature } from "../use-feature";
import "./Overview.css";

/** A searchable, keyboard-accessible place to organize several tabs together. */
export function Overview() {
  const key = useShortcutLabels();
  const archiveEnabled = useFeature("archive");
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
  const [tidy, setTidy] = useState<{ proposal: TidyProposal; spaceId: string } | null>(null);
  const tidyUndo = useStore(state => state.layout.tidyUndo);
  const [closing, setClosing] = useState(false);
  const pending = useRef(false);
  const stopClosing = useRef(false);
  const anchor = useRef<string | null>(null);
  const duplicateSelection = useRef(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const tabButtons = useRef(new Map<string, HTMLButtonElement>());
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
    return (!spaceId || ownerId === spaceId) && `${tabLabel(layout,page)} ${page.title} ${page.url} ${owner?.name ?? ""} ${folder?.name ?? ""}`.toLocaleLowerCase().includes(search);
  }).sort((a, b) => (order.get(a.pageId) ?? Infinity) - (order.get(b.pageId) ?? Infinity));
  const protectedDuplicates = protectedDuplicateIds(visible, layout, audio);
  const duplicates = duplicateTabs(visible, layout, activePageId, protectedDuplicates);
  const visibleKey = JSON.stringify(visible.map(page => page.pageId));
  const focusedId = visible.some(page => page.pageId === focused) ? focused : visible[0]?.pageId;
  const selection = pages.filter(page => selected.has(page.pageId));
  const tidySource = selection.length ? selection : visible;
  const tidyCandidates = tidySource.filter(page => page.controller !== "agent" && page.controller !== "external" && /^https?:\/\//.test(page.url));
  const tidySpaceIds = new Set(tidyCandidates.map(page => layout.tabSpace[page.pageId] ?? layout.activeSpaceId));
  const tidySpaceId = tidySpaceIds.size === 1 ? [...tidySpaceIds][0] : undefined;
  const canMoveWindow = inNativeHost && !bridge.privateMode;
  const audioSelection = selection.filter(page => audio[page.pageId] && page.controller !== "agent" && page.controller !== "external");
  const muteSelection = audioSelection.some(page => !audio[page.pageId]!.muted);
  const hasSelection = selection.length > 0;

  useEffect(() => {
    if (!canMoveWindow || !hasSelection) return;
    let live = true;
    void bridge.windows().then(value => { if(live)setWindows(value); }).catch(reason => {
      if(live)setError(`Couldn’t list windows. ${errorMessage(reason)}`);
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
    const button = tabButtons.current.get(pageId);
    button?.focus(); button?.scrollIntoView({ block: "nearest" });
  }

  function navigateGrid(event: React.KeyboardEvent, pageId: string) {
    if (event.target !== event.currentTarget || busy || event.nativeEvent.isComposing || event.altKey || event.metaKey || event.ctrlKey) return;
    const index = visible.findIndex(page => page.pageId === pageId);
    const buttons = visible.flatMap(page => { const button = tabButtons.current.get(page.pageId); return button ? [button] : []; });
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
    if (!inNativeHost) return;
    let cancelled = false;
    void (async () => {
      for (const pageId of previewIds.split(",").filter(Boolean)) {
        if (cancelled) break;
        if (pagePreview(pageId) || captured.current.has(pageId)) continue;
        const page = useStore.getState().pages.find(page => page.pageId === pageId);
        if (!page || (page.backend !== "aux" && page.viewStatus !== "visible")) continue;
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
    duplicateSelection.current=false;
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
    catch (error) { setError(errorMessage(error)); }
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

  async function archiveSelection() {
    const chosen = selection.map(page => page.pageId);
    const { entries } = await archivePages(chosen, { reason: "manual" });
    setSelected(previous => new Set([...previous].filter(id => !entries.some(entry => entry.pageId === id))));
    setProgress(`${entries.length} ${entries.length === 1 ? "tab" : "tabs"} archived. Restore them below when you need them.`);
  }

  async function restoreArchive(entry: ArchivedTab) {
    await restoreArchivedTab(entry);
    setProgress(`Restored ${entry.title || hostOf(entry.url)}.`);
  }

  return <div className="overview" onKeyDown={event => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Escape") {
      if (busy) { event.preventDefault(); event.stopPropagation(); stopClosing.current=true; return; }
      if (savingFolder) { event.preventDefault(); event.stopPropagation(); setSavingFolder(false); return; }
      event.preventDefault(); event.stopPropagation();
      if (selection.length) {duplicateSelection.current=false;setSelected(new Set());}
      else if (query) { setQuery(""); searchInput.current?.focus(); }
      else useStore.getState().setMode("focus");
    }
    if ((event.metaKey || event.ctrlKey) && event.key === "a" && !busy && !(event.target instanceof HTMLInputElement)) {
      event.preventDefault(); duplicateSelection.current=false;setSelected(new Set(visible.map(page => page.pageId)));
    }
  }}>
    <div className="ov-head">
      <div><h2>Your tabs</h2><p {...staticHintProps}>{visible.length} {visible.length === 1 ? "tab" : "tabs"}{selection.length ? ` · ${selection.length} selected` : " · Everything in its place"}</p></div>
      <span className="sp" />
      <button {...smallButtonProps} disabled={busy} data-command-id="new-tab" onClick={() => runCommand("new-tab")}>{shellIconPlusSm} New tab</button>
      <button {...smallGhostButtonProps} disabled={busy} onClick={() => useStore.getState().setMode("focus")}>Done</button>
    </div>
    <div className="ov-tools">
      <label className="ov-search">{shellIconSearch}<input ref={searchInput} disabled={busy} autoFocus aria-label="Search tabs" placeholder="Search tabs, folders, or Spaces…" onKeyDown={event => { if (event.nativeEvent.isComposing) return; if (event.key === "ArrowDown") { event.preventDefault(); focusTab(visible[0]?.pageId); } if (event.key === "Enter" && visible[0] && !busy) { event.preventDefault(); void useStore.getState().activate(visible[0].pageId).catch(errToast); } }} value={query} onChange={event => setQuery(event.target.value)} /></label>
      <select disabled={busy} aria-label="Filter tabs by space" value={spaceId} onChange={event => setSpaceId(event.target.value)}>
        <option value="">All spaces</option>{[...layout.spaces, ...(layout.archivedSpaces ?? [])].map(space => <option key={space.id} value={space.id}>{space.name}{layout.archivedSpaces?.some(item => item.id === space.id) ? " · Archived" : ""}</option>)}
      </select>
      <button {...smallButtonProps} disabled={busy || !visible.length} onClick={() => {duplicateSelection.current=false;setSelected(new Set(visible.map(page => page.pageId)));}}>Select all</button>
      <button {...smallGhostButtonProps} disabled={busy || !tidySpaceId || !layout.spaces.some(space => space.id === tidySpaceId) || tidyCandidates.length !== tidySource.length || tidyCandidates.length < 3 || tidyCandidates.length > 30}
        title="Suggest folders for 3–30 tabs in one Space. Their titles and site domains are sent to your configured AI model."
        onClick={() => void act(async () => {
          const proposal = await call("agent.tidy.propose", { pageIds: tidyCandidates.map(page => page.pageId) });
          setTidy({ proposal, spaceId: tidySpaceId! });
        })}>{selection.length ? "Tidy selected with AI" : "Tidy with AI"}</button>
      <span className="hint ov-tidy-disclosure">Sends tab titles and site domains to your AI model.</span>
      {duplicates.length > 0 && <button {...smallGhostButtonProps} disabled={busy} title="Check extra copies of the exact same address in each Space for unsaved edits before selecting them." onClick={() => void act(async () => {
        const checked=await bridge.tabsUnsavedWork(duplicates.map(pageId=>{
          const page=visible.find(item=>item.pageId===pageId)!;
          return {pageId,url:page.url};
        }));
        const current=useStore.getState();
        const eligible=visible.filter(page=>current.pages.some(item=>item.pageId===page.pageId&&item.url===page.url));
        const protectedNow=protectedDuplicateIds(eligible,current.layout,current.tabAudio);
        for(const page of eligible)if(!duplicates.includes(page.pageId)||checked[page.pageId]!=="clean")protectedNow.add(page.pageId);
        const safe=duplicateTabs(eligible,current.layout,current.activePageId,protectedNow);
        duplicateSelection.current=!!safe.length;setSelected(new Set(safe));anchor.current=safe[0]??null;setSavingFolder(false);
        const held=duplicates.length-safe.length;
        setProgress(safe.length ? `Review ${safe.length} duplicate ${safe.length===1?"tab":"tabs"} before closing.${held?` ${held} kept because of unsaved work, a changed tab, or an unavailable check.`:""}` : `No safe duplicates to select. ${held} ${held===1?"tab was":"tabs were"} kept because of unsaved work, a changed tab, or an unavailable check.`);
        focusTab(safe[0]);
      })}>Select duplicates · {duplicates.length}</button>}
    </div>
    {tidy && <section className="ov-tidy" aria-label="AI Tidy preview">
      <div className="ov-tidy-head"><strong>Suggested folders</strong><span className="sp" /><span {...staticHintProps}>Review before applying</span></div>
      <p {...staticHintProps}>Only tab titles and site domains were sent to your configured AI model. Tabs stay open; ungrouped tabs stay where they are.</p>
      <div className="ov-tidy-groups">{tidy.proposal.groups.map((group, index) => <div className="ov-tidy-group" key={`${group.name}-${index}`}>
        <strong>{group.name}</strong><ul>{group.pageIds.map(pageId => <li key={pageId}>{tidy.proposal.pages.find(page => page.pageId === pageId)?.title || "Untitled tab"}</li>)}</ul>
      </div>)}</div>
      <div {...staticRowProps}><button {...smallButtonProps} disabled={busy} onClick={() => void act(async () => {
        const state = useStore.getState();
        const applied = applyTidyProposal(state.layout, state.pages, tidy.spaceId, tidy.proposal);
        const receipt = tidyUndoRecord(state.layout, applied);
        const after = { ...applied, tidyUndo: receipt };
        await commitTidyLayout({ before: state.layout, after,
          current: () => useStore.getState().layout, persist: persistLayout, flush: flushLayout,
          publish: layout => useStore.setState({ layout, tidyUndo: receipt }) });
        setTidy(null);
        setProgress(`Created ${tidy.proposal.groups.length} ${tidy.proposal.groups.length === 1 ? "folder" : "folders"}. You can undo this change.`);
      })}>Apply folders</button><button {...smallGhostButtonProps} disabled={busy} onClick={() => setTidy(null)}>Dismiss</button></div>
    </section>}
    {tidyUndo && tidyUndo.moved.every(item => pages.some(page => page.pageId === item.pageId)) && <div className="ov-tidy-undo"><span {...staticHintProps}>AI Tidy created folders in this Space.</span><button {...smallGhostButtonProps} disabled={busy} onClick={() => void act(async () => {
      const before = useStore.getState().layout;
      if (!before.tidyUndo) throw new Error("This Tidy change is no longer available to undo.");
      let restored;
      try { restored = await undoPersistedTidy(before.tidyUndo, before); }
      catch (error) {
        const latest = await reloadOrganizationLayout().catch(() => null);
        if (latest) useStore.setState({ layout: latest, tidyUndo: latest.tidyUndo ?? null });
        throw error;
      }
      useStore.setState({ layout: restored, tidyUndo: null });
      setProgress("Tidy undone. Your earlier folders and tab positions are restored.");
    })}>Undo Tidy</button></div>}
    {selection.length > 0 && <section className="ov-selection" aria-label="Selected tab actions" aria-busy={busy}>
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
      {!!audioSelection.length && <button {...smallButtonProps} disabled={busy} title={`${muteSelection ? "Mute" : "Unmute"} ${audioSelection.length} selected browser tabs. Agent-controlled tabs are excluded.`} onClick={()=>void act(async()=>{
        let changed=0;
        for(const page of audioSelection) {
          const state=useStore.getState();
          const current=state.pages.find(item=>item.pageId===page.pageId);
          if(!current || current.controller === "agent" || current.controller === "external")throw new Error(`Audio changed for ${changed} tabs. A remaining tab closed or changed control.`);
          if(state.tabAudio[page.pageId]?.muted === muteSelection)continue;
          try { await tabCommand({ kind: "setMuted", pageId: page.pageId, muted: muteSelection }); changed++; }
          catch(reason) { throw new Error(`Audio changed for ${changed} tabs. ${errorMessage(reason)}`); }
        }
        // Tab commands acknowledge before the audio event reaches this window.
        // Refresh once for the selection so the next action reflects native state.
        const snapshot = await bridge.tabAudio();
        useStore.setState({ tabAudio: snapshot });
        setProgress(`${changed} ${changed === 1 ? "tab" : "tabs"} ${muteSelection ? "muted" : "unmuted"}.`);
      })}>{muteSelection ? "Mute tabs" : "Unmute tabs"}</button>}
      <button {...smallButtonProps} disabled={busy || !selection.some(page => bookmarkWebUrl(page.url))} onClick={() => { setSavingFolder(value => value === "bookmarks" ? false : "bookmarks"); setFolderName(""); }}>Save bookmarks…</button>
      {archiveEnabled && <button {...smallButtonProps} disabled={busy || !selection.every(page => /^https?:\/\//.test(page.url))} onClick={() => void act(archiveSelection)}>Archive tabs</button>}
      <button {...smallButtonProps} disabled={busy} onClick={() => void act(async () => {
        if(duplicateSelection.current){
          const candidates=selection.map(page=>({pageId:page.pageId,url:page.url}));
          const checked=await bridge.tabsUnsavedWork(candidates);
          if(candidates.some(candidate=>checked[candidate.pageId]!=="clean"||!useStore.getState().pages.some(page=>page.pageId===candidate.pageId&&page.url===candidate.url)))
            throw new Error("A selected duplicate has unsaved work or changed. Review the selection again before closing.");
        }
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
          duplicateSelection.current=false;
          setProgress(`${closed} ${closed === 1 ? "tab" : "tabs"} closed.${completed ? (key("reopen-closed-tab") ? ` Reopen with ${key("reopen-closed-tab")}.` : "") : " Closing stopped."}`);
        } finally { setClosing(false); }
      })}>Close tabs</button>
      {closing && <button {...smallGhostButtonProps} onClick={() => { stopClosing.current=true; setProgress("Stopping after the current tab…"); }}>Stop</button>}
      <span className="sp" /><button {...staticIconButtonProps} disabled={busy} aria-label="Clear tab selection" onClick={() => {duplicateSelection.current=false;setSelected(new Set());setSavingFolder(false);}}>{shellIconClose}</button>
    </section>}
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
      <label>{savingFolder === "tabs" ? "Tab folder" : "Bookmark folder"}<input {...staticFieldInputProps} autoFocus disabled={busy} value={folderName} maxLength={200} placeholder="Reading, trip ideas, project research…" onChange={event=>setFolderName(event.target.value)} /></label>
      <p {...staticHintProps}>{savingFolder === "tabs" ? `Move the selected open tabs into a new folder in ${folderSpace?.name ?? "the selected Space"}. Their pages stay open.` : "Save web pages for later. Existing bookmarks keep their current folders. Open the folder’s pages together from Library."}</p>
      <div {...staticRowProps}><button {...smallButtonProps} disabled={busy||!folderName.trim()||(savingFolder === "tabs" && !folderSpace)}>{savingFolder === "tabs" ? "Create folder" : "Save folder"}</button><button type="button" {...smallGhostButtonProps} disabled={busy} onClick={()=>setSavingFolder(false)}>Cancel</button></div>
    </form>}
    {progress && <output className="hint ov-progress" data-block>{progress}</output>}
    {error && <p role="alert" {...staticFieldErrorProps}>{error}</p>}
    {!visible.length && <div className="empty-state ov-empty"><span className="empty-ico">{query ? shellIconSearch : shellIconGrid}</span><h2>{query ? "No matching tabs" : "Room for something new"}</h2><p>{query ? "Try another title or address, or look in all spaces." : "Open a page to start browsing in this space."}</p></div>}
    <div role="group" className="ov-grid" aria-label="Open tabs" aria-description="Arrow keys move between tabs. Space selects a tab. Enter opens it.">
      {visible.map(page => {
        const shot = shots[page.pageId] || pagePreview(page.pageId);
        const title = tabLabel(layout,page);
        const owner = [...layout.spaces, ...(layout.archivedSpaces ?? [])].find(space => space.id === layout.tabSpace[page.pageId]);
        return <article key={page.pageId} className={`ov-card ${page.pageId === activePageId ? "active" : ""} ${selected.has(page.pageId) ? "selected" : ""}`}>
          <button ref={node => { if (node) tabButtons.current.set(page.pageId, node); else tabButtons.current.delete(page.pageId); }} className="ov-open" data-page-id={page.pageId} tabIndex={focusedId === page.pageId ? 0 : -1} onFocus={() => setFocused(page.pageId)} onKeyDown={event => navigateGrid(event, page.pageId)} aria-label={`Open ${title}`} title={`${title}\n${page.url}`} onClick={event => open(page, event)}>
            <div className="ov-shot">{shot ? <img src={shot} alt="" loading="lazy" /> : <span className="ov-fallback"><FavIcon url={page.url} src={page.favicon} className="ov-bigfav" /></span>}</div>
            <TabCardCaption page={page} space={!spaceId ? owner?.name : undefined} pinned={!!owner && isPinned(layout, owner.id, page.url)} />
          </button>
          <input className="ov-check" type="checkbox" disabled={busy} tabIndex={focusedId === page.pageId ? 0 : -1} checked={selected.has(page.pageId)} aria-label={`Select ${title}`} onChange={() => select(page.pageId, false)} />
          <button className="ov-close icon-btn sm" disabled={busy} tabIndex={focusedId === page.pageId ? 0 : -1} aria-label={`Close ${title}`} onClick={() => void useStore.getState().closeTab(page.pageId)}>{shellIconClose}</button>
        </article>;
      })}
    </div>
    {archiveEnabled && !!layout.archivedTabs?.some(entry => entry.state === "archived" && !pages.some(page => page.pageId === entry.pageId)) &&
      <section aria-label="Archived tabs" className="ov-archive"><h2>Archived tabs</h2><p {...staticHintProps}>Saved in this Profile. Restore a tab to reopen it.</p>
        {layout.archivedTabs.filter(entry => entry.state === "archived" && !pages.some(page => page.pageId === entry.pageId)).map(entry =>
          <div className="row" key={entry.archiveId}><span>{entry.title || hostOf(entry.url)}</span><span className="sp" />
            <button {...smallGhostButtonProps} disabled={busy} onClick={() => void act(() => restoreArchive(entry))}>Restore</button></div>)}</section>}
  </div>;
}
