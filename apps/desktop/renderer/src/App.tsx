import { useEffect, useRef } from "react";
import { useStore, call, toast, errToast } from "./store";
import { bridge, inElectron } from "./bridge";
import { nativePageId } from "./chrome";
import { Sidebar } from "./components/Sidebar";
import { Toolbar } from "./components/Toolbar";
import { Rail } from "./components/Rail";
import { Palette } from "./components/Palette";
import { Overview } from "./components/Overview";
import { ResultsTable } from "./components/ResultsTable";
import { FindBar } from "./components/FindBar";
import { Downloads } from "./components/Downloads";
import { Settings } from "./components/Settings";
import { History } from "./components/History";
import { Inspector } from "./components/Inspector";
import { SiteTile } from "./components/SiteTile";
import { ActivityShelf } from "./components/ActivityShelf";

function NewTabHome({ bookmarks }: { bookmarks: { url: string; title: string }[] }) {
  useEffect(() => {
    document.querySelector<HTMLInputElement>(".omnibox input")?.focus();
  }, []);

  const openSite = (url: string) =>
    void call("pages.open", { url, backend: "vector", activate: true }).catch(errToast);

  return (
    <div className="stage-empty">
      <div className="empty-state">
        <h2>New Tab</h2>
        <p>Type an address or search above.</p>
        <button className="btn primary" onClick={() => document.querySelector<HTMLInputElement>(".omnibox input")?.focus()}>
          Focus address field
        </button>
      </div>
      {bookmarks.length > 0 && (
        <div className="ask-row">
          <span className="apps-label">Favorites</span>
          {bookmarks.slice(0, 8).map((b) => (
            <SiteTile key={b.url} url={b.url} title={b.title} onClick={() => openSite(b.url)} />
          ))}
        </div>
      )}
    </div>
  );
}

export function App() {
  const mode = useStore((s) => s.mode);
  const overlay = useStore((s) => s.overlay);
  const railOpen = useStore((s) => s.railOpen);
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const activePageId = useStore((s) => s.activePageId);
  const pages = useStore((s) => s.pages);
  const activePage = pages.find((p) => p.pageId === activePageId);
  const splitPageId = useStore((s) => s.splitPageId);
  const sidebarWidth = useStore((s) => s.sidebarWidth);
  const railWidth = useStore((s) => s.railWidth);
  const settings = useStore((s) => s.settings);
  const bookmarks = useStore((s) => s.bookmarks);
  const toasts = useStore((s) => s.toasts);
  const setOverlay = useStore((s) => s.setOverlay);
  const setMode = useStore((s) => s.setMode);
  const stageRef = useRef<HTMLDivElement>(null);

  // theme
  useEffect(() => {
    document.documentElement.dataset.theme = (settings.theme as string) ?? "dark";
  }, [settings.theme]);

  // initial sync + event stream
  useEffect(() => {
    void useStore.getState().refresh();
    const offEvent = bridge.onEvent((e) => useStore.getState().applyEvent(e));
    const offLoading = bridge.onLoading(({ pageId, loading }) => {
      useStore.setState((s) => ({ pages: s.pages.map((p) => (p.pageId === pageId ? { ...p, loading } : p)) }));
    });
    const offDownload = bridge.onDownload((d) => useStore.getState().applyDownload(d as never));
    const offShortcut = bridge.onShortcut((s) => dispatchShortcut(s));
    return () => {
      offEvent();
      offLoading();
      offDownload();
      offShortcut();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep the native view pinned to the stage rect
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !inElectron) return;
    const report = () => {
      const r = el.getBoundingClientRect();
      // Scrim overlays must hide the native page (it renders above the DOM and
      // would cover them); in-flow strips like the find bar and downloads
      // shelf shrink the stage instead, so the page stays live — findInPage
      // highlighting and page interaction keep working.
      const showPage = nativePageId({ mode, overlay, activePageId, url: activePage?.url });
      const split = showPage ? splitPageId : null;
      void bridge.setStage(showPage, { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) }, split);
    };
    const ro = new ResizeObserver(report);
    ro.observe(el);
    report();
    return () => ro.disconnect();
  }, [activePageId, activePage?.url, splitPageId, mode, overlay, railOpen, sidebarOpen]);

  const dispatchShortcut = (s: { key: string; meta: boolean; shift: boolean; alt: boolean; ctrl?: boolean }) => {
    const k = s.key.toLowerCase().replace(/^arrow/, "");
    const st = useStore.getState();

    // ⌃⇥ / ⌃⇧⇥ — Chrome-style tab cycling (arrives as ctrl, not meta)
    if (s.ctrl && k === "tab") return cycleTab(st, s.shift ? -1 : 1);
    // ⌘⌥← / ⌘⌥→ — tab cycling; must come before plain ⌥←/⌥→ nav
    if (s.meta && s.alt && k === "left") return cycleTab(st, -1);
    if (s.meta && s.alt && k === "right") return cycleTab(st, 1);
    if (s.meta && s.alt && k === "f") return focusOmni();
    if (s.meta && s.alt && k === "i") return st.activePageId && void bridge.devTools(st.activePageId);
    if (s.meta && s.alt && k === "u") {
      const p = st.pages.find((x) => x.pageId === st.activePageId);
      if (p?.url.startsWith("http")) void call("pages.navigate", { pageId: p.pageId, url: `view-source:${p.url}` }).catch(errToast);
      return;
    }
    if (s.meta && s.shift && k === "c") return st.activePageId && void bridge.devTools(st.activePageId);
    if (s.meta && s.shift && k === "r") return st.activePageId && void bridge.hardReload(st.activePageId);
    if (s.meta && s.shift && k === "w") return void bridge.closeWindow();
    if (s.meta && s.shift && k === "d") return bookmarkAll(st);
    if (s.meta && s.shift && k === "backspace") {
      return void call("history.clear", {}).then(() => toast("History cleared")).catch(errToast);
    }
    if (s.meta && k === "k") return setOverlay("palette");
    if (s.meta && k === "l") return focusOmni();
    if (s.meta && k === "f") return setOverlay("find");
    if (s.meta && k === "e") return focusOmni();
    if (s.meta && k === "g") {
      if (!st.findText) return setOverlay("find");
      if (st.overlay !== "find") setOverlay("find");
      return void st.find(st.findText, true, !s.shift).catch(errToast);
    }
    if (s.meta && k === "o") return void openFile();
    if (s.meta && k === "p") return st.activePageId && void bridge.printPage(st.activePageId);
    if (s.meta && s.shift && k === "t") {
      const last = st.closedTabs[st.closedTabs.length - 1];
      if (last) {
        useStore.setState({ closedTabs: st.closedTabs.slice(0, -1) });
        void call("pages.open", { url: last.url, backend: "vector", activate: true });
      }
      return;
    }
    if (s.meta && k === "t")
      return void call("pages.open", { url: "about:blank", backend: "vector", activate: true })
        .then(() => setTimeout(focusOmni, 60))
        .catch(errToast);
    if (s.meta && k === "w") {
      // Chrome parity — ⌘W on the last tab closes the window
      if (!st.activePageId) return void bridge.closeWindow();
      return void call("pages.close", { pageId: st.activePageId }).catch(errToast);
    }
    if (s.meta && k === "r") return st.activePageId && void call("pages.reload", { pageId: st.activePageId }).catch(errToast);
    if (s.meta && k === ",") return setOverlay("settings");
    if (s.meta && k === "y") return setOverlay("history");
    if (s.meta && s.shift && k === "a") return setMode(st.mode === "overview" ? "focus" : "overview");
    if (s.meta && k === "s") return st.toggleSidebar();
    if (s.meta && s.shift && k === "j") return setOverlay("downloads");
    if (s.meta && k === "d") {
      const p = st.pages.find((x) => x.pageId === st.activePageId);
      if (!p || !p.url.startsWith("http")) return;
      const marked = st.bookmarks.some((b) => b.url === p.url);
      void call(marked ? "bookmarks.remove" : "bookmarks.add", { url: p.url, title: p.title })
        .then(() => {
          useStore.setState({
            bookmarks: marked ? st.bookmarks.filter((b) => b.url !== p.url) : [...st.bookmarks, { url: p.url, title: p.title }],
          });
          toast(marked ? "Bookmark removed" : "Bookmarked");
        })
        .catch(errToast);
      return;
    }
    if (s.meta && (k === "=" || k === "+")) return st.activePageId && void call("pages.zoom", { pageId: st.activePageId, delta: 0.5 }).catch(errToast);
    if (s.meta && (k === "-" || k === "_")) return st.activePageId && void call("pages.zoom", { pageId: st.activePageId, delta: -0.5 }).catch(errToast);
    if (s.meta && k === "0") return st.activePageId && void call("pages.zoom", { pageId: st.activePageId, reset: true }).catch(errToast);
    if (s.meta && /^[1-9]$/.test(k)) {
      const p = st.pages.filter((x) => !x.ownedByRuntime && x.viewStatus !== "background")[Number(k) - 1];
      if (p) void st.activate(p.pageId);
      return;
    }
    if (s.alt && k === "left") return st.activePageId && void call("pages.back", { pageId: st.activePageId }).catch(errToast);
    if (s.alt && k === "right") return st.activePageId && void call("pages.forward", { pageId: st.activePageId }).catch(errToast);
    // ⇧⌘[ / ⇧⌘] cycle tabs — the macOS convention
    if (s.meta && s.shift && (k === "]" || k === "}")) return cycleTab(st, 1);
    if (s.meta && s.shift && (k === "[" || k === "{")) return cycleTab(st, -1);
    if (s.meta && k === "[") return st.activePageId && void call("pages.back", { pageId: st.activePageId }).catch(errToast);
    if (s.meta && k === "]") return st.activePageId && void call("pages.forward", { pageId: st.activePageId }).catch(errToast);
  };

  const cycleTab = (st: ReturnType<typeof useStore.getState>, dir: 1 | -1) => {
    const tabs = st.pages.filter((x) => !x.ownedByRuntime && x.viewStatus !== "background");
    if (tabs.length < 2) return;
    const i = tabs.findIndex((p) => p.pageId === st.activePageId);
    const next = tabs[(i + dir + tabs.length) % tabs.length];
    if (next) void st.activate(next.pageId).catch(errToast);
  };

  const bookmarkAll = (st: ReturnType<typeof useStore.getState>) => {
    const fresh = st.pages.filter((p) => p.url.startsWith("http") && !st.bookmarks.some((b) => b.url === p.url));
    if (!fresh.length) return toast("All tabs already bookmarked");
    void Promise.all(fresh.map((p) => call("bookmarks.add", { url: p.url, title: p.title })))
      .then(() => {
        useStore.setState({
          bookmarks: [...st.bookmarks, ...fresh.map((p) => ({ url: p.url, title: p.title }))],
        });
        toast(`Bookmarked ${fresh.length} tab${fresh.length === 1 ? "" : "s"}`);
      })
      .catch(errToast);
  };

  const openFile = async () => {
    const path = await bridge.openFile();
    if (!path) return;
    const url = `file://${encodeURI(path)}`;
    const st = useStore.getState();
    try {
      if (st.activePageId) await call("pages.navigate", { pageId: st.activePageId, url });
      else await call("pages.open", { url, backend: "vector", activate: true });
    } catch (e) {
      errToast(e);
    }
  };

  const focusOmni = () => {
    document.querySelector<HTMLInputElement>(".omnibox input")?.focus();
  };

  // renderer-side keys (when shell itself has focus)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        dispatchShortcut({ key: e.key, meta: e.metaKey, shift: e.shiftKey, alt: e.altKey, ctrl: e.ctrlKey });
        const k = e.key.toLowerCase().replace(/^arrow/, "");
        const swallow =
          (e.metaKey &&
            (["k", "l", "f", "g", "e", "o", "p", "t", "w", "r", "d", "y", ",", "s", "[", "]", "{", "}", "=", "+", "-", "_", "0"].includes(k) ||
              (e.shiftKey && ["a", "j", "c", "t", "r", "w", "d", "g", "backspace"].includes(k)) ||
              (e.altKey && ["f", "i", "u", "left", "right"].includes(k)))) ||
          (e.ctrlKey && k === "tab");
        if (swallow) e.preventDefault();
      }
      if (e.key === "Escape" && useStore.getState().overlay) {
        setOverlay(null);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`app ${inElectron ? "electron" : ""} ${sidebarOpen ? "" : "sb-closed"} ${railOpen ? "" : "rail-closed"}`}
      style={{ "--sb-w": `${sidebarWidth}px`, "--rail-w": `${railWidth}px` } as React.CSSProperties}
      onContextMenu={(e) => {
        if (!inElectron) return;
        e.preventDefault();
        const editable = (e.target as HTMLElement).closest("input, textarea, [contenteditable]");
        void bridge.contextMenu(editable ? null : useStore.getState().activePageId);
      }}
    >
      <Sidebar />
      <div className="main-col">
        <Toolbar />
        <div className="main">
          <div className="stage-wrap">
            {overlay === "find" && <FindBar />}
            <div className="stage-body">
              <div id="stage" ref={stageRef} />
              {mode === "focus" && activePage?.backend === "chrome" && (
                <div className="stage-empty">
                  <div className="empty-state">
                    <h2>This tab is in Chrome</h2>
                    <p>Vector drives it over CDP. Type, click, and upload in the real Chrome window.</p>
                    <div className="stage-empty-actions">
                      <button
                        className="btn primary"
                        onClick={() => void call("pages.openLive", { pageId: activePage.pageId }).catch(errToast)}
                      >
                        Open live in Chrome
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {mode === "focus" && activePage?.backend !== "chrome" && (!activePage || !activePage.url || activePage.url === "about:blank") && (
                <NewTabHome bookmarks={bookmarks} />
              )}
              {mode === "overview" && <Overview />}
              {mode === "table" && <ResultsTable />}
            </div>
            {overlay === "downloads" && <Downloads />}
            <ActivityShelf />
          </div>
          <Rail />
        </div>
      </div>
      {overlay === "palette" && <Palette />}
      {overlay === "settings" && <Settings />}
      {overlay === "history" && <History />}
      {overlay === "observe" && <Inspector />}
      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`toast rise ${t.kind}`}>{t.text}</div>
        ))}
      </div>
    </div>
  );
}
