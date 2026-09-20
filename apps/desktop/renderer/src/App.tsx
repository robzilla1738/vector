import { ReaderView } from "./components/ReaderView";
import { useEffect, useRef } from "react";
import { LIVE_RUN, useStore, call, toast, errToast, type SidebarMode } from "./store";
import { bridge, inElectron, inMock } from "./bridge";
import { savePagePdf } from "./page-export";
import { nativePageId } from "./chrome";
import { moveListFocus } from "./keyboard-list";
import { tabsInSpace } from "./workspace";
import { HttpAuthPrompt } from "./components/HttpAuthPrompt";
import { Sidebar } from "./components/Sidebar";
import { Toolbar } from "./components/Toolbar";
import { Stage } from "./components/Stage";
import { AgentRail } from "./components/AgentRail";
import { Palette } from "./components/Palette";
import { FindBar } from "./components/FindBar";
import { Downloads } from "./components/Downloads";
import { Settings } from "./components/Settings";
import { Library } from "./components/Library";
import { Inspector } from "./components/Inspector";
import { Tasks } from "./components/Tasks";
import { TabAudioButton } from "./components/TabAudioButton";
import { SiteControls } from "./components/SiteControls";
import { I } from "./components/icons";
import { localFileUrl } from "./local-file-url";

type Shortcut = { key: string; meta: boolean; shift: boolean; alt: boolean; ctrl?: boolean };

const STAGE_RADIUS = 12;

export function App() {
  const mode = useStore((s) => s.mode);
  const overlay = useStore((s) => s.overlay);
  const railOpen = useStore((s) => s.railOpen);
  const sidebar = useStore((s) => s.sidebar);
  const activePageId = useStore((s) => s.activePageId);
  const pages = useStore((s) => s.pages);
  const activePage = pages.find((p) => p.pageId === activePageId);
  const splitPageId = useStore((s) => s.splitPageId);
  const settings = useStore((s) => s.settings);
  const toasts = useStore((s) => s.toasts);
  const connected = useStore((s) => s.connected);
  const layout = useStore((s) => s.layout);
  const setOverlay = useStore((s) => s.setOverlay);
  const setMode = useStore((s) => s.setMode);
  const stageRef = useRef<HTMLDivElement>(null);
  const space = layout.spaces.find((s) => s.id === layout.activeSpaceId) ?? layout.spaces[0]!;

  // theme + space tint on the root so tokens cascade everywhere, including
  // the native window (vibrancy was why light mode never showed)
  useEffect(() => {
    const dark = window.matchMedia("(prefers-color-scheme: dark)");
    const reduced = window.matchMedia("(prefers-reduced-transparency: reduce)");
    const apply = () => {
      const theme = settings.theme === "system" ? (dark.matches ? "dark" : "light") : settings.theme === "light" ? "light" : "dark";
      const glass = settings.sidebarAppearance !== "solid" && !reduced.matches;
      document.documentElement.dataset.theme = theme;
      document.documentElement.dataset.sidebarAppearance = glass ? "translucent" : "solid";
      document.documentElement.style.setProperty("--sidebar-blur", `${Number(settings.sidebarBlur ?? 24)}px`);
      void bridge.setAppearance(settings.theme === "system" ? "system" : theme, glass, sidebar === "expanded" || settings.tabLayout === "horizontal");
    };
    apply(); dark.addEventListener("change", apply); reduced.addEventListener("change", apply);
    return () => { dark.removeEventListener("change", apply); reduced.removeEventListener("change", apply); };
  }, [settings.theme, settings.sidebarAppearance, settings.sidebarBlur, settings.tabLayout, sidebar]);
  useEffect(() => {
    document.documentElement.dataset.space = space.color;
  }, [space.color]);

  // mock mode: honour ?rail=1 / set scenario once the first snapshot lands, so
  // screenshots of the agent rail are deterministic
  useEffect(() => {
    if (!inMock) return;
    const q = new URLSearchParams(location.search);
    const unsub = useStore.subscribe((s, prev) => {
      if (!s.connected || prev.connected) return;
      const st = useStore.getState();
      if (q.get("scenario") === "set" && st.sets[0]) st.openRail({ kind: "set", setId: st.sets[0].setId });
      else if (q.get("rail") === "1") {
        const live = st.runs.find((r) => LIVE_RUN.has(r.status));
        st.openRail(live ? { kind: "run", runId: live.runId } : { kind: "home" });
      }
    });
    return unsub;
  }, []);

  // narrow windows: the sidebar folds to its thin rail while the agent rail is open
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1100px)");
    const apply = () => useStore.getState().setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // initial sync + event stream
  useEffect(() => {
    void useStore.getState().refresh();
    const offEvent = bridge.onEvent((e) => useStore.getState().applyEvent(e));
    const offRuntime = bridge.onRuntimeStatus(status => {
      useStore.setState({ connected: status.connected });
      if (status.connected) void useStore.getState().refresh();
    });
    const offLoading = bridge.onLoading(({ pageId, loading }) => {
      useStore.setState((s) => ({ pages: s.pages.map((p) => (p.pageId === pageId ? { ...p, loading } : p)) }));
    });
    let audioLive=true;
    const changedAudio=new Set<string>();
    const offAudio=bridge.onAudio(({pageId,removed,...state})=>{changedAudio.add(pageId);useStore.setState(current=>{const tabAudio={...current.tabAudio};if(removed)delete tabAudio[pageId];else tabAudio[pageId]=state;return {tabAudio};});});
    void bridge.tabAudio().then(snapshot=>{if(audioLive)useStore.setState(current=>({tabAudio:{...Object.fromEntries(Object.entries(snapshot).filter(([id])=>!changedAudio.has(id))),...Object.fromEntries(Object.entries(current.tabAudio).filter(([id])=>changedAudio.has(id)))}}));}).catch(()=>{});
    const offDownload = bridge.onDownload((d) => useStore.getState().applyDownload(d as never));
    const offShortcut = bridge.onShortcut((s) => dispatchShortcut(s));
    return () => {
      offEvent();
      offRuntime();
      offLoading();
      offDownload();audioLive=false;offAudio();
      offShortcut();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep the native view pinned to the stage card — report at the end of
  // layout changes, never per animation frame
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !inElectron) return;
    let raf = 0;
    const report = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const showPage = nativePageId({ mode, overlay, activePageId, url: activePage?.url, backend: activePage?.backend, viewStatus: activePage?.viewStatus, navigationError: activePage?.navigationError });
        const companion = pages.find(page => page.pageId === splitPageId);
        const split = showPage && companion?.viewStatus !== "crashed" && !companion?.navigationError ? splitPageId : null;
        void bridge.setStage(showPage, { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) }, split, STAGE_RADIUS);
      });
    };
    const ro = new ResizeObserver(report);
    ro.observe(el);
    report();
    // panels animate with transforms; re-report once they settle
    const t = window.setTimeout(report, 280);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [activePageId, activePage?.url, activePage?.backend, activePage?.viewStatus, activePage?.navigationError, pages, splitPageId, mode, overlay, railOpen, sidebar, settings.tabLayout]);

  const dispatchShortcut = (s: Shortcut) => {
    const k = s.key.toLowerCase().replace(/^arrow/, "");
    const st = useStore.getState();
    const meta = s.meta;

    if (s.ctrl && k === "tab") return cycleTab(s.shift ? -1 : 1);
    if (meta && s.alt && k === "left") return cycleTab(-1);
    if (meta && s.alt && k === "right") return cycleTab(1);
    if (meta && s.alt && k === "i") return bridge.privateMode ? undefined : st.activePageId && void bridge.devTools(st.activePageId);
    if (meta && s.alt && k === "u") {
      if (bridge.privateMode) return;
      const p = st.pages.find((x) => x.pageId === st.activePageId);
      if (p?.url.startsWith("http")) void call("pages.navigate", { pageId: p.pageId, url: `view-source:${p.url}` }).catch(errToast);
      return;
    }
    if (meta && s.shift && k === "c") return bridge.privateMode ? undefined : st.activePageId && void bridge.devTools(st.activePageId);
    if (meta && s.shift && k === "r") return st.activePageId && void bridge.hardReload(st.activePageId);
    if (meta && s.shift && k === "w") return void bridge.closeWindow();
    if (meta && s.shift && k === "d") return bridge.privateMode ? undefined : bookmarkAll();
    if (meta && s.shift && k === "backspace") return void call("history.clear", {}).then(() => toast("History cleared")).catch(errToast);
    if (meta && s.alt && k === "r") return bridge.privateMode ? undefined : setOverlay(st.overlay === "reader" ? null : "reader");
    if (meta && s.shift && k === "a") return bridge.privateMode ? undefined : st.toggleRail();
    if (meta && s.shift && k === "o") return setMode(st.mode === "overview" ? "focus" : "overview");
    if (meta && s.shift && k === "j") return setOverlay("downloads");
    if (meta && s.shift && k === "t") return void st.reopenClosedTab();
    if (meta && s.shift && (k === "]" || k === "}")) return cycleTab(1);
    if (meta && s.shift && (k === "[" || k === "{")) return cycleTab(-1);
    if (meta && k === "p" && s.shift) return void savePagePdf(st.activePageId).catch(errToast);
    if (meta && s.shift) return;

    if (meta && k === "k") return bridge.privateMode ? undefined : setOverlay(st.overlay === "palette" ? null : "palette");
    if (meta && (k === "l" || k === "e")) return st.focusCommandBar();
    if (meta && k === "f") return setOverlay("find");
    if (meta && k === "g") {
      if (!st.findText) return setOverlay("find");
      if (st.overlay !== "find") setOverlay("find");
      return void st.find(st.findText, true, !s.shift).catch(errToast);
    }
    if (meta && k === "o") return void openFile();
    if (meta && k === "p") return st.activePageId && void bridge.printPage(st.activePageId).catch(errToast);
    if (meta && k === "t") return void st.newTab();
    if (meta && k === "w") {
      if (st.overlay) return setOverlay(null);
      if (!st.activePageId) return void bridge.closeWindow();
      return void st.closeTab(st.activePageId);
    }
    if (meta && k === "r") return st.activePageId && void call("pages.reload", { pageId: st.activePageId }).catch(errToast);
    if (meta && k === ",") return bridge.privateMode ? undefined : setOverlay("settings");
    if (meta && k === "y") return setOverlay("history");
    if (meta && k === "s") return st.toggleSidebar();
    if (meta && k === "d") {
      if (bridge.privateMode) return;
      const p = st.pages.find((x) => x.pageId === st.activePageId);
      if (!p || !p.url.startsWith("http")) return;
      const marked = st.bookmarks.some((b) => b.url === p.url);
      void call(marked ? "bookmarks.remove" : "bookmarks.add", { url: p.url, title: p.title })
        .then(() => {
          useStore.setState({ bookmarks: marked ? st.bookmarks.filter((b) => b.url !== p.url) : [...st.bookmarks, { url: p.url, title: p.title }] });
          toast(marked ? "Bookmark removed" : "Bookmarked");
        })
        .catch(errToast);
      return;
    }
    if (meta && (k === "=" || k === "+")) return st.activePageId && void call("pages.zoom", { pageId: st.activePageId, delta: 0.5 }).catch(errToast);
    if (meta && (k === "-" || k === "_")) return st.activePageId && void call("pages.zoom", { pageId: st.activePageId, delta: -0.5 }).catch(errToast);
    if (meta && k === "0") return st.activePageId && void call("pages.zoom", { pageId: st.activePageId, reset: true }).catch(errToast);
    if (meta && /^[1-9]$/.test(k)) {
      const tabs = tabsInSpace(st.layout, st.pages, st.layout.activeSpaceId);
      const p = k === "9" ? tabs[tabs.length - 1] : tabs[Number(k) - 1];
      if (p) void st.activate(p.pageId).catch(errToast);
      return;
    }
    if (s.alt && k === "left") return st.activePageId && void call("pages.back", { pageId: st.activePageId }).catch(errToast);
    if (s.alt && k === "right") return st.activePageId && void call("pages.forward", { pageId: st.activePageId }).catch(errToast);
    if (meta && k === "[") return st.activePageId && void call("pages.back", { pageId: st.activePageId }).catch(errToast);
    if (meta && k === "]") return st.activePageId && void call("pages.forward", { pageId: st.activePageId }).catch(errToast);
  };

  const cycleTab = (dir: 1 | -1) => {
    const st = useStore.getState();
    const tabs = tabsInSpace(st.layout, st.pages, st.layout.activeSpaceId);
    if (tabs.length < 2) return;
    const i = tabs.findIndex((p) => p.pageId === st.activePageId);
    const next = tabs[(i + dir + tabs.length) % tabs.length];
    if (next) void st.activate(next.pageId).catch(errToast);
  };

  const bookmarkAll = () => {
    const st = useStore.getState();
    const fresh = st.pages.filter((p) => p.url.startsWith("http") && !st.bookmarks.some((b) => b.url === p.url));
    if (!fresh.length) return toast("All tabs already bookmarked");
    void Promise.all(fresh.map((p) => call("bookmarks.add", { url: p.url, title: p.title })))
      .then(() => {
        useStore.setState({ bookmarks: [...st.bookmarks, ...fresh.map((p) => ({ url: p.url, title: p.title }))] });
        toast(`Bookmarked ${fresh.length} tab${fresh.length === 1 ? "" : "s"}`);
      })
      .catch(errToast);
  };

  const openFile = async () => {
    const path = await bridge.openFile();
    if (!path) return;
    const url = localFileUrl(path);
    const st = useStore.getState();
    try {
      if (st.activePageId) await call("pages.navigate", { pageId: st.activePageId, url });
      else await st.newTab(url);
    } catch (e) {
      errToast(e);
    }
  };

  // renderer-side keys (when the shell itself has focus)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        const k = e.key.toLowerCase().replace(/^arrow/, "");
        const swallow =
          (e.metaKey &&
            (["k", "l", "f", "g", "e", "o", "p", "t", "w", "r", "d", "y", ",", "s", "[", "]", "{", "}", "=", "+", "-", "_", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(k) ||
              (e.shiftKey && ["a", "o", "j", "c", "t", "r", "w", "d", "g", "backspace"].includes(k)) ||
              (e.altKey && ["f", "i", "u", "left", "right"].includes(k)))) ||
          (e.ctrlKey && k === "tab");
        if (swallow) e.preventDefault();
        dispatchShortcut({ key: e.key, meta: e.metaKey, shift: e.shiftKey, alt: e.altKey, ctrl: e.ctrlKey });
        return;
      }
      if (e.key === "Escape" && !e.defaultPrevented && useStore.getState().overlay) setOverlay(null);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`app tabs-${settings.tabLayout ?? "vertical"} ${inElectron ? "electron" : ""} layout-${sidebar as SidebarMode} ${railOpen ? "rail-open" : ""}`}
      onContextMenu={(e) => {
        if (!inElectron) return;
        const el = e.target as HTMLElement;
        if (el.closest(".sidebar, .rail, .menu")) return; // those own their menus
        e.preventDefault();
        const editable = el.closest("input, textarea, [contenteditable]");
        void bridge.contextMenu(editable ? null : useStore.getState().activePageId);
      }}
    >
      {!connected && (
        <div className="degraded" role="status" aria-live="polite">
          {I.alert}
          <span>Runtime reconnecting — tabs keep working</span>
        </div>
      )}
      <div className="app-body">
        <Sidebar />
        <div className="main-col">
          {settings.tabLayout === "horizontal" && <div className="horizontal-tabs" role="tablist" aria-label="Browser tabs" aria-orientation="horizontal" onKeyDown={event => moveListFocus(event, '[role="tab"]', false)}>{tabsInSpace(layout, pages, layout.activeSpaceId).map((p, index) => <div className="horizontal-tab" key={p.pageId}><button role="tab" tabIndex={activePageId === p.pageId || (!activePageId && index === 0) ? 0 : -1} aria-selected={activePageId === p.pageId && mode === "focus"} onClick={() => void useStore.getState().activate(p.pageId)}>{p.title || "New Tab"}</button><TabAudioButton pageId={p.pageId} title={p.title || "New Tab"}/><button aria-label={`Close ${p.title || "New Tab"}`} onClick={() => void useStore.getState().closeTab(p.pageId)}>{I.close}</button></div>)}<button className="icon-btn" aria-label="New tab" onClick={() => void useStore.getState().newTab()}>{I.plus}</button></div>}
          {settings.tabLayout === "horizontal" && <Toolbar />}
          <div className="main">
            <div className="stage-wrap">
              {overlay === "find" && <FindBar />}
              <Stage ref={stageRef} page={activePage} />
              {overlay === "reader" && <ReaderView />}
              {overlay === "settings" && <Settings />}
              {overlay === "tasks" && <Tasks />}
              {overlay === "downloads" && <Downloads />}
            </div>
            {!bridge.privateMode && <AgentRail />}
          </div>
        </div>
      </div>
      {overlay === "palette" && !bridge.privateMode && <Palette />}
      {(overlay === "history" || overlay === "bookmarks") && <Library key={overlay} initialView={overlay} />}
      {overlay === "observe" && <Inspector />}
      {overlay === "site" && <SiteControls />}
      <HttpAuthPrompt />
      <div className={`toasts ${sidebar === "hidden" ? "top" : ""}`} aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast rise ${t.kind}`}>
            {t.kind === "error" ? I.alert : I.check}
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}
