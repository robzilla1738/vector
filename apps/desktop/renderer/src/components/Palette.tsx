import { useEffect, useMemo, useRef, useState } from "react";
import { useStore, call, toast, errToast } from "../store";
import { bridge } from "../bridge";
import { detectIntent } from "../intent";
import { hostOf } from "../workspace";
import { I } from "./icons";

interface Cmd {
  id: string;
  section: "go" | "tabs" | "agent" | "window" | "chrome" | "sets" | "bookmarks" | "spaces";
  k?: string;
  t: string;
  d?: string;
  icon?: React.ReactNode;
  /** keep the palette open (two-level pickers manage their own close) */
  keep?: boolean;
  run: () => unknown | Promise<unknown>;
}

interface ChromeTab { targetId?: string; id?: string; url: string; title?: string }

const SECTION: Record<Cmd["section"], string> = {
  go: "",
  tabs: "Tabs",
  agent: "Agent",
  window: "Window",
  chrome: "Chrome",
  sets: "Sets",
  bookmarks: "Bookmarks",
  spaces: "Spaces",
};

/** ⌘K — commands, tabs, sets, bookmarks, and the same intent routing as the command bar. */
export function Palette() {
  const setOverlay = useStore((s) => s.setOverlay);
  const setMode = useStore((s) => s.setMode);
  const pages = useStore((s) => s.pages);
  const sets = useStore((s) => s.sets);
  const bookmarks = useStore((s) => s.bookmarks);
  const sessions = useStore((s) => s.sessions);
  const closedTabs = useStore((s) => s.closedTabs);
  const activePageId = useStore((s) => s.activePageId);
  const splitPageId = useStore((s) => s.splitPageId);
  const railOpen = useStore((s) => s.railOpen);
  const layout = useStore((s) => s.layout);
  const settings = useStore((s) => s.settings);
  const refreshResults = useStore((s) => s.refreshResults);
  const startRun = useStore((s) => s.startRun);
  const newTab = useStore((s) => s.newTab);
  const activate = useStore((s) => s.activate);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [chromeTabs, setChromeTabs] = useState<ChromeTab[] | null>(null);
  const [splitPick, setSplitPick] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<Element | null>(document.activeElement);
  const close = () => {
    setOverlay(null);
    (restoreFocus.current as HTMLElement | null)?.focus?.();
  };
  const chromeConnected = sessions.some((s) => s.backend === "chrome" && s.status === "connected");
  const activePage = pages.find((p) => p.pageId === activePageId);
  const lastClosed = closedTabs[closedTabs.length - 1];
  const hasPage = !!activePage && activePage.url !== "about:blank";

  const exec = (c: Cmd) => {
    if (!c.keep) close();
    void Promise.resolve(c.run()).catch(errToast);
  };

  const cmds = useMemo<Cmd[]>(() => {
    const out: Cmd[] = [];
    const v = q.trim();
    const match = (s: string) => !v || s.toLowerCase().includes(v.toLowerCase());

    if (chromeTabs) {
      for (const t of chromeTabs) {
        if (!match(`${t.title ?? ""} ${t.url}`)) continue;
        const id = t.targetId ?? t.id;
        if (!id) continue;
        out.push({ id: `ct-${id}`, section: "chrome", t: t.title || t.url, d: hostOf(t.url), icon: I.chromeSm, run: () => call("pages.open", { backend: "chrome", targetId: id, activate: true }) });
      }
      if (out.length === 0) out.push({ id: "none", section: "chrome", t: "No attachable Chrome tabs", run: () => setChromeTabs(null) });
      return out;
    }
    if (splitPick) {
      for (const p of pages) {
        if (p.pageId === activePageId || !match(`${p.title} ${p.url}`)) continue;
        out.push({ id: `sp-${p.pageId}`, section: "tabs", icon: p.favicon ? <img src={p.favicon} alt="" /> : I.globe, t: p.title || p.url, d: hostOf(p.url), run: () => useStore.setState({ splitPageId: p.pageId }) });
      }
      if (out.length === 0) out.push({ id: "none", section: "tabs", t: "No other open pages", run: () => setSplitPick(false) });
      return out;
    }

    if (v) {
      const intent = detectIntent(v, { hasPage, searchEngine: settings.searchEngine as string | undefined });
      if (intent.kind === "navigate" || intent.kind === "search") {
        out.push({
          id: "go",
          section: "go",
          icon: intent.kind === "navigate" ? I.open : I.search,
          t: intent.kind === "navigate" ? `Open ${intent.display}` : `Search for “${intent.query}”`,
          k: "↵",
          run: async () => {
            if (activePage) await call("pages.navigate", { pageId: activePage.pageId, url: intent.url });
            else await newTab(intent.url);
          },
        });
      }
      if (intent.kind !== "command") {
        out.push({ id: "ask", section: "go", icon: I.sparklesSm, t: `Ask the agent: “${v}”`, d: hasPage ? `on ${hostOf(activePage!.url)}` : "in a new tab", k: intent.kind === "run" ? "↵" : undefined, run: () => startRun(v) });
      }
      // switch to an open tab
      for (const p of pages.filter((p) => !p.ownedByRuntime && p.pageId !== activePageId && match(`${p.title} ${p.url}`)).slice(0, 5)) {
        out.push({ id: `tab-${p.pageId}`, section: "tabs", icon: p.favicon ? <img src={p.favicon} alt="" /> : I.globe, t: p.title || hostOf(p.url), d: hostOf(p.url), run: () => activate(p.pageId) });
      }
    }

    const w: Cmd[] = [
      { id: "new", section: "window", t: "New tab", k: "⌘T", icon: I.plusSm, run: () => newTab() },
      ...(lastClosed ? [{ id: "reopen", section: "window" as const, t: `Reopen closed tab — ${lastClosed.title || lastClosed.url}`, k: "⌘⇧T", icon: I.reopen, run: async () => { useStore.setState((s) => ({ closedTabs: s.closedTabs.slice(0, -1) })); await newTab(lastClosed.url); } }] : []),
      { id: "ov", section: "window", t: "Tab overview", k: "⌘⇧O", icon: I.grid, run: async () => setMode("overview") },
      { id: "rail", section: "agent", t: railOpen ? "Hide agent rail" : "Show agent rail", k: "⌘⇧A", icon: I.sparklesSm, run: () => useStore.getState().toggleRail() },
      { id: "obs", section: "agent", t: "Inspect what the agent sees", d: "observe the active page", icon: I.obs, run: async () => { useStore.setState({ inspectorObs: null }); setOverlay("observe"); } },
      { id: "collect", section: "agent", t: "Collect open tabs into a set", d: "map a task over every tab", icon: I.layersSm, run: async () => {
        const ids = pages.filter((p) => !p.ownedByRuntime).map((p) => p.pageId);
        if (!ids.length) return toast("No open tabs to collect", "error");
        await call("sets.create", { name: `Tabs ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`, source: "tabs", pageIds: ids });
        toast(`Set created from ${ids.length} tabs`);
      } },
      { id: "reload", section: "window", t: "Reload page", k: "⌘R", icon: I.reloadSm, run: async () => { if (activePageId) await call("pages.reload", { pageId: activePageId }); } },
      { id: "hard", section: "window", t: "Hard reload", k: "⇧⌘R", icon: I.reloadSm, run: async () => { if (activePageId) await bridge.hardReload(activePageId); } },
      { id: "find", section: "window", t: "Find in page", k: "⌘F", icon: I.findSm, run: async () => setOverlay("find") },
      { id: "sb", section: "window", t: "Toggle sidebar", k: "⌘S", icon: I.sidebarSm, run: async () => useStore.getState().toggleSidebar() },
      { id: "hide-sb", section: "window", t: useStore.getState().sidebar === "hidden" ? "Show sidebar" : "Hide sidebar completely", icon: I.sidebarCloseSm, run: async () => useStore.getState().setSidebar(useStore.getState().sidebar === "hidden" ? "expanded" : "hidden") },
      { id: "bm", section: "window", t: activePage && bookmarks.some((b) => b.url === activePage.url) ? "Remove bookmark" : "Bookmark this page", k: "⌘D", icon: I.bookmarkSm, run: async () => {
        if (!activePage || !activePage.url.startsWith("http")) return;
        const marked = bookmarks.some((b) => b.url === activePage.url);
        await call(marked ? "bookmarks.remove" : "bookmarks.add", { url: activePage.url, title: activePage.title });
        const s = useStore.getState();
        useStore.setState({ bookmarks: marked ? s.bookmarks.filter((b) => b.url !== activePage.url) : [...s.bookmarks, { url: activePage.url, title: activePage.title }] });
      } },
      { id: "pin", section: "window", t: "Pin this site to the space", icon: I.pin, run: async () => { if (activePage && activePage.url.startsWith("http")) useStore.getState().togglePin({ url: activePage.url, title: activePage.title || hostOf(activePage.url) }); } },
      { id: "split", section: "window", t: "Split view with page…", d: "two pages side by side", icon: I.split, keep: true, run: async () => { setSplitPick(true); setQ(""); } },
      ...(splitPageId ? [{ id: "unsplit", section: "window" as const, t: "Close split view", icon: I.split, run: () => useStore.setState({ splitPageId: null }) }] : []),
      { id: "open", section: "window", t: "Open file…", k: "⌘O", icon: I.folder, run: async () => {
        const path = await bridge.openFile();
        if (!path) return;
        const url = `file://${encodeURI(path)}`;
        if (activePageId) await call("pages.navigate", { pageId: activePageId, url });
        else await newTab(url);
      } },
      { id: "print", section: "window", t: "Print…", k: "⌘P", icon: I.print, run: async () => { if (activePageId) await bridge.printPage(activePageId); } },
      { id: "dev", section: "window", t: "Developer tools", k: "⌥⌘I", icon: I.code, run: async () => { if (activePageId) await bridge.devTools(activePageId); } },
      { id: "settings", section: "window", t: "Settings", k: "⌘,", icon: I.gear, run: async () => setOverlay("settings") },
      { id: "history", section: "window", t: "History", k: "⌘Y", icon: I.clockSm, run: async () => setOverlay("history") },
      { id: "downloads", section: "window", t: "Downloads", k: "⌘⇧J", icon: I.downloadSm, run: async () => setOverlay("downloads") },
      { id: "attach", section: "chrome", t: "Attach Chrome", d: "your signed-in Chrome, port 9222", icon: I.chromeSm, run: async () => { await call("chrome.attach", { port: 9222 }); toast("Chrome attached"); } },
      ...(chromeConnected ? [{ id: "borrow", section: "chrome" as const, t: "Add a Chrome tab…", d: "borrow a tab from your Chrome", icon: I.chromeSm, keep: true, run: async () => { setChromeTabs((await call("chrome.tabs")) as ChromeTab[]); setQ(""); } }] : []),
      { id: "detach", section: "chrome", t: "Detach Chrome", icon: I.unplug, run: async () => { await call("chrome.detach"); toast("Chrome detached"); } },
      { id: "cookies", section: "chrome", t: "Import cookies from Chrome", d: chromeConnected ? "via attached Chrome" : "from your Chrome profile", icon: I.cookie, run: async () => {
        const r = await call<{ imported: number; domains: number }>("chrome.importCookies", { source: "auto" });
        toast(`${r.imported} cookies imported from ${r.domains} domains`);
      } },
      ...(activePage?.backend === "chrome" ? [{ id: "live", section: "chrome" as const, t: "Open live in Chrome", icon: I.external, run: async () => { await call("pages.openLive", { pageId: activePage.pageId }); } }] : []),
    ];
    for (const s of layout.spaces) {
      if (s.id !== layout.activeSpaceId) w.push({ id: `space-${s.id}`, section: "spaces", t: `Switch to ${s.name}`, icon: <span className="space-dot" data-space={s.color} />, run: () => useStore.getState().switchSpace(s.id) });
    }
    w.push({ id: "space-new", section: "spaces", t: "New space", icon: I.plusSm, run: () => useStore.getState().addSpace(`Space ${layout.spaces.length + 1}`) });
    for (const s of sets) w.push({ id: `set-${s.setId}`, section: "sets", t: s.name, d: `${s.memberIds.length} members`, icon: I.layersSm, run: async () => { await refreshResults(s.setId); setMode("table"); } });
    for (const b of bookmarks.slice(0, 30)) w.push({ id: `bm-${b.url}`, section: "bookmarks", t: b.title || b.url, d: hostOf(b.url), icon: I.bookmark, run: () => newTab(b.url) });

    const ORDER: Cmd["section"][] = ["go", "tabs", "agent", "window", "spaces", "sets", "chrome", "bookmarks"];
    const rest = (v ? w.filter((c) => match(`${c.t} ${c.d ?? ""}`)) : w).sort((a, b) => ORDER.indexOf(a.section) - ORDER.indexOf(b.section));
    return [...out, ...rest];
  }, [q, pages, sets, bookmarks, activePageId, splitPageId, railOpen, chromeConnected, chromeTabs, splitPick, activePage, lastClosed, layout, hasPage, settings.searchEngine, setMode, setOverlay, refreshResults, startRun, newTab, activate]);

  useEffect(() => setSel(0), [q, chromeTabs, splitPick]);
  useEffect(() => {
    listRef.current?.querySelectorAll<HTMLElement>("[role=option]")[sel]?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  const back = () => {
    if (chromeTabs) return setChromeTabs(null);
    if (splitPick) return setSplitPick(false);
    close();
  };
  const shown = cmds.slice(0, 40);

  return (
    <div className="overlay-scrim fade-in" onMouseDown={close}>
      <div className="palette pop-in" role="dialog" aria-label="Command palette" onMouseDown={(e) => e.stopPropagation()}>
        <div className="palette-field">
          {chromeTabs || splitPick ? <button className="icon-btn sm" aria-label="Back" onClick={back}>{I.left}</button> : <span className="palette-ico">{I.searchLg}</span>}
          <input
            autoFocus
            value={q}
            role="combobox"
            aria-expanded
            aria-controls="palette-list"
            aria-activedescendant={shown[sel] ? `pal-${shown[sel]!.id}` : undefined}
            aria-label="Command palette"
            placeholder={chromeTabs ? "Pick a Chrome tab to borrow…" : splitPick ? "Pick a page for split view…" : "Type a command, address, or a task for the agent…"}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); back(); }
              if (e.key === "ArrowDown") { e.preventDefault(); setSel(Math.min(sel + 1, shown.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setSel(Math.max(sel - 1, 0)); }
              if (e.key === "Enter" && shown[sel]) exec(shown[sel]!);
            }}
          />
          <kbd>esc</kbd>
        </div>
        <div className="palette-list" ref={listRef} role="listbox" id="palette-list">
          {shown.map((c, i) => {
            const first = i === 0 || shown[i - 1]!.section !== c.section;
            return (
              <div key={c.id}>
                {first && SECTION[c.section] && <div className="pal-section">{SECTION[c.section]}</div>}
                <div id={`pal-${c.id}`} role="option" aria-selected={i === sel} className={`pal-item ${i === sel ? "sel" : ""}`} onMouseMove={() => sel !== i && setSel(i)} onClick={() => exec(c)}>
                  <span className="pal-ico">{c.icon ?? I.command}</span>
                  <span className="t">{c.t}</span>
                  {c.d && <span className="d">{c.d}</span>}
                  {c.k && <kbd>{c.k}</kbd>}
                </div>
              </div>
            );
          })}
          {shown.length === 0 && <div className="pal-empty">No matches</div>}
        </div>
      </div>
    </div>
  );
}
