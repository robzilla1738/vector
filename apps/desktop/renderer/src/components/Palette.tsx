import { useEffect, useMemo, useRef, useState } from "react";
import { useStore, call, toast, errToast } from "../store";
import { bridge } from "../bridge";
import { toUrl, isUrlLike } from "../chrome";

interface Cmd {
  k?: string;
  t: string;
  d?: string;
  /** keep the palette open (two-level pickers manage their own close) */
  keep?: boolean;
  run: () => void | Promise<void>;
}

interface ChromeTab { targetId?: string; id?: string; url: string; title?: string }

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
  const refreshResults = useStore((s) => s.refreshResults);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [chromeTabs, setChromeTabs] = useState<ChromeTab[] | null>(null);
  const [splitPick, setSplitPick] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const close = () => setOverlay(null);
  const chromeConnected = sessions.some((s) => s.backend === "chrome" && s.status === "connected");
  const activePage = pages.find((p) => p.pageId === activePageId);
  const lastClosed = closedTabs[closedTabs.length - 1];

  const exec = (c: Cmd) => {
    if (!c.keep) close();
    void Promise.resolve(c.run()).catch(errToast);
  };

  const cmds = useMemo<Cmd[]>(() => {
    const out: Cmd[] = [];
    const v = q.trim();

    // chrome tab picker level
    if (chromeTabs) {
      for (const t of chromeTabs) {
        if (v && !(t.title ?? "").toLowerCase().includes(v.toLowerCase()) && !t.url.includes(v)) continue;
        const id = t.targetId ?? t.id;
        if (!id) continue;
        out.push({
          t: t.title || t.url,
          d: `chrome · ${t.url.slice(0, 60)}`,
          run: () => call("pages.open", { backend: "chrome", targetId: id, activate: true }),
        });
      }
      if (out.length === 0) out.push({ t: "No attachable Chrome tabs", run: () => setChromeTabs(null) });
      return out;
    }

    // split-view page picker level
    if (splitPick) {
      for (const p of pages) {
        if (p.pageId === activePageId) continue;
        if (v && !(p.title ?? "").toLowerCase().includes(v.toLowerCase()) && !p.url.includes(v)) continue;
        out.push({
          t: p.title || p.url,
          d: `split · ${p.url.slice(0, 60)}`,
          run: () => useStore.setState({ splitPageId: p.pageId }),
        });
      }
      if (out.length === 0) out.push({ t: "No other open pages", run: () => setSplitPick(false) });
      return out;
    }

    // open/search from text
    if (v) {
      out.push({
        t: isUrlLike(v) && !v.includes(" ") ? `Open ${toUrl(v)}` : `Search for “${v}”`,
        k: "↵",
        run: async () => {
          const url = toUrl(v, useStore.getState().settings.searchEngine as string | undefined);
          const t = (await call("pages.open", { url, backend: "vector", activate: true })) as { pageId: string };
          await call("pages.activate", { pageId: t.pageId });
        },
      });
      out.push({
        t: `Ask the agent: “${v}”`,
        d: "runs.start on the active page",
        run: async () => {
          useStore.setState({ railOpen: true });
          await call("runs.start", { goal: v, pageId: activePageId ?? undefined });
          toast("Agent started");
        },
      });
    }

    out.push(
      { t: "New tab", k: "⌘T", run: () => call("pages.open", { url: "about:blank", backend: "vector", activate: true }) },
      ...(lastClosed
        ? [{
            t: `Reopen closed tab — ${lastClosed.title || lastClosed.url}`,
            k: "⌘⇧T",
            run: async () => {
              useStore.setState((s) => ({ closedTabs: s.closedTabs.slice(0, -1) }));
              await call("pages.open", { url: lastClosed.url, backend: "vector", activate: true });
            },
          }]
        : []),
      { t: "Tab overview", k: "⌘⇧A", run: async () => setMode("overview") },
      { t: "Reload page", k: "⌘R", run: async () => { if (activePageId) await call("pages.reload", { pageId: activePageId }); } },
      { t: "Hard reload", k: "⇧⌘R", run: async () => { if (activePageId) await bridge.hardReload(activePageId); } },
      { t: "Close window", k: "⇧⌘W", run: async () => { await bridge.closeWindow(); } },
      { t: "Toggle sidebar", k: "⌘S", run: async () => useStore.getState().toggleSidebar() },
      { t: "Open file…", k: "⌘O", run: async () => {
        const path = await bridge.openFile();
        if (!path) return;
        const url = `file://${encodeURI(path)}`;
        if (activePageId) await call("pages.navigate", { pageId: activePageId, url });
        else await call("pages.open", { url, backend: "vector", activate: true });
      } },
      { t: "Print…", k: "⌘P", run: async () => { if (activePageId) await bridge.printPage(activePageId); } },
      { t: "Developer tools", k: "⌥⌘I", run: async () => { if (activePageId) await bridge.devTools(activePageId); } },
      { t: "Bookmark all tabs", k: "⇧⌘D", run: async () => {
        const s = useStore.getState();
        const fresh = s.pages.filter((p) => p.url.startsWith("http") && !s.bookmarks.some((b) => b.url === p.url));
        if (!fresh.length) return toast("All tabs already bookmarked");
        await Promise.all(fresh.map((p) => call("bookmarks.add", { url: p.url, title: p.title })));
        useStore.setState({ bookmarks: [...s.bookmarks, ...fresh.map((p) => ({ url: p.url, title: p.title }))] });
        toast(`Bookmarked ${fresh.length} tabs`);
      } },
      {
        t: activePage && bookmarks.some((b) => b.url === activePage.url) ? "Remove bookmark" : "Bookmark this page",
        k: "⌘D",
        run: async () => {
          if (!activePage || !activePage.url.startsWith("http")) return;
          const marked = bookmarks.some((b) => b.url === activePage.url);
          await call(marked ? "bookmarks.remove" : "bookmarks.add", { url: activePage.url, title: activePage.title });
          const s = useStore.getState();
          useStore.setState({
            bookmarks: marked ? s.bookmarks.filter((b) => b.url !== activePage.url) : [...s.bookmarks, { url: activePage.url, title: activePage.title }],
          });
        },
      },
      { t: "Find in page", k: "⌘F", run: async () => setOverlay("find") },
      { t: railOpen ? "Hide agent inspector" : "Show agent inspector", run: () => useStore.getState().toggleRail() },
      { t: useStore.getState().shelfOpen ? "Hide activity" : "Show activity", run: () => useStore.getState().toggleShelf() },
      { t: "Collect open tabs into a set", d: "sets.create from tabs", run: async () => {
        const ids = pages.filter((p) => !p.ownedByRuntime).map((p) => p.pageId);
        if (ids.length) {
          await call("sets.create", { name: `Tabs ${new Date().toLocaleTimeString()}`, source: "tabs", pageIds: ids });
          toast(`Set created from ${ids.length} tabs`);
        } else toast("No open tabs to collect", "error");
      } },
      { t: "Attach Chrome (CDP :9222)", d: "chrome.attach", run: async () => { await call("chrome.attach", { port: 9222 }); toast("Chrome attached"); } },
      ...(chromeConnected
        ? [{
            t: "Add Chrome tab…",
            d: "borrow a tab from your signed-in Chrome",
            keep: true,
            run: async () => {
              const tabs = (await call("chrome.tabs")) as ChromeTab[];
              setChromeTabs(tabs);
              setQ("");
            },
          }]
        : []),
      { t: "Detach Chrome", run: async () => { await call("chrome.detach"); toast("Chrome detached"); } },
      { t: "Import cookies from Chrome", d: chromeConnected ? "via attached Chrome" : "from Chrome profile (keychain prompt)", run: async () => {
        const r = await call<{ imported: number; domains: number }>("chrome.importCookies", { source: "auto" });
        toast(`${r.imported} cookies imported from ${r.domains} domains`);
      } },
      ...(activePage?.backend === "chrome"
        ? [{ t: "Open live in Chrome", d: "focus the real Chrome tab", run: async () => { await call("pages.openLive", { pageId: activePage.pageId }); } }]
        : []),
      { t: "Split view with page…", d: "show two pages side by side", keep: true, run: async () => { setSplitPick(true); setQ(""); } },
      ...(splitPageId
        ? [{ t: "Close split view", d: "back to single page", run: () => useStore.setState({ splitPageId: null }) }]
        : []),
      { t: "Inspect observation", d: "pages.observe on the active page", run: async () => { useStore.setState({ inspectorObs: null }); setOverlay("observe"); } },
      { t: "List models", d: "models.list", run: async () => {
        const r = await call<{ models: { id: string }[]; source: string }>("models.list");
        toast(`${r.models.length} models (${r.source === "gateway" ? "Gateway catalog" : "static list"})`);
      } },
      { t: "Settings", k: "⌘,", run: async () => setOverlay("settings") },
      { t: "History", k: "⌘Y", run: async () => setOverlay("history") },
      { t: "Downloads", k: "⌘⇧J", run: async () => setOverlay("downloads") },
    );

    for (const s of sets) {
      out.push({
        t: `Set: ${s.name}`,
        d: `${s.memberIds.length} members → table`,
        run: async () => {
          await refreshResults(s.setId);
          setMode("table");
        },
      });
    }
    for (const b of bookmarks.slice(0, 30)) {
      if (!v || b.title.toLowerCase().includes(v.toLowerCase()) || b.url.includes(v)) {
        out.push({
          t: b.title || b.url,
          d: "bookmark",
          run: () => call("pages.open", { url: b.url, backend: "vector", activate: true }),
        });
      }
    }
    // filter by query — the open/search/agent actions stay on top
    if (!v) return out;
    const head = out.slice(0, 2);
    const rest = out.slice(2).filter((c) => (c.t + " " + (c.d ?? "")).toLowerCase().includes(v.toLowerCase()));
    return [...head, ...rest];
  }, [q, pages, sets, bookmarks, activePageId, splitPageId, railOpen, chromeConnected, chromeTabs, splitPick, activePage, lastClosed, setMode, setOverlay, refreshResults]);

  useEffect(() => setSel(0), [q, chromeTabs, splitPick]);

  // keep the selected row in view while arrowing
  useEffect(() => {
    listRef.current?.querySelectorAll(".pal-item")[sel]?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  const back = () => {
    if (chromeTabs) return setChromeTabs(null);
    if (splitPick) return setSplitPick(false);
    close();
  };

  return (
    <div className="overlay-scrim" onMouseDown={close}>
      <div className="palette" onMouseDown={(e) => e.stopPropagation()}>
        <input
          autoFocus
          value={q}
          placeholder={
            chromeTabs ? "Pick a Chrome tab to borrow…" : splitPick ? "Pick a page for split view…" : "Type a command, URL, or describe a task for the agent…"
          }
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") back();
            if (e.key === "ArrowDown") { e.preventDefault(); setSel(Math.min(sel + 1, cmds.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setSel(Math.max(sel - 1, 0)); }
            if (e.key === "Enter" && cmds[sel]) exec(cmds[sel]);
          }}
        />
        <div className="palette-list" ref={listRef}>
          {cmds.slice(0, 20).map((c, i) => (
            <div key={i} className={`pal-item ${i === sel ? "sel" : ""}`}
              onMouseEnter={() => setSel(i)}
              onClick={() => exec(c)}>
              {c.k && <span className="k">{c.k}</span>}
              <span className="t">{c.t}</span>
              {c.d && <span className="d">{c.d}</span>}
            </div>
          ))}
          {cmds.length === 0 && <div className="pal-item"><span className="t" style={{ color: "var(--ink-2)" }}>No matches</span></div>}
        </div>
      </div>
    </div>
  );
}
