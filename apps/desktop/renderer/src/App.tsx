import { runAnswerEntry } from "./run-answer-drafts";
import { closeSelectedTabs } from "./use-tab-selection";
import { conversationEntryChange, applyConversationStorageChange } from "./conversation-drafts";
import { QuickAsk } from "./components/QuickAsk";
import { useBrowsingMemory } from "./use-browsing-memory";
import { useMemoryDrafts } from "./memory-drafts";
import type { WorkspaceMemory } from "@vector/contracts";
import { deferSurface } from "./components/DeferredSurface";
import { useEffect, useRef, useState } from "react";
import { LIVE_RUN, useStore, call, toast, errToast, type SidebarMode } from "./store";
import { bridge, inElectron, inMock } from "./bridge";
import { savePagePdf, printCurrentPage } from "./page-export";
import { nativePageId } from "./chrome";
import { useToolbarReveal } from "./toolbar-reveal";
import { onStageReport, stageAvoiding } from "./stage-obstruction";
import { isTab, tabsInSpace } from "./workspace";
import { bookmarkWebUrl } from "./bookmark-files";
import { HttpAuthPrompt } from "./components/HttpAuthPrompt";
import { Sidebar } from "./components/Sidebar";
import { Toolbar } from "./components/Toolbar";
import { Stage } from "./components/Stage";
import { AgentRail } from "./components/AgentRail";
import { Palette } from "./components/Palette";
import { FindBar } from "./components/FindBar";
import { Downloads } from "./components/Downloads";
import { HorizontalTabs } from "./components/HorizontalTabs";
import { SiteControls } from "./components/SiteControls";
import { I } from "./components/icons";
import { applyUiFontSize } from "./ui-font-size";
import { openLocalFile } from "./open-local-file";

const ReaderView = deferSurface(async () => { const module = await import("./components/ReaderView"); return {default:module.ReaderView}; }, "Reader");
const Settings = deferSurface(async () => { const module = await import("./components/Settings"); return {default:module.Settings}; }, "Settings");
const Library = deferSurface(async () => { const module = await import("./components/Library"); return {default:module.Library}; }, "Library");
const Inspector = deferSurface(async () => { const module = await import("./components/Inspector"); return {default:module.Inspector}; }, "Page inspection");
const Tasks = deferSurface(async () => { const module = await import("./components/Tasks"); return {default:module.Tasks}; }, "Tasks");

type Shortcut = { key: string; meta: boolean; shift: boolean; alt: boolean; ctrl?: boolean };

const STAGE_RADIUS = 0;

export function App() {
  useBrowsingMemory();
  useEffect(()=>{
    if(bridge.privateMode)return;
    const changed=(event:StorageEvent)=>{
      if(event.storageArea!==localStorage||!event.key||localStorage.getItem(event.key)!==event.newValue)return;
      const answer=runAnswerEntry(event.key,event.newValue);
      if(answer) {
        useStore.setState(state=>{const drafts={...state.runAnswerDrafts};if(answer.draft)drafts[answer.runId]=answer.draft;else delete drafts[answer.runId];return {runAnswerDrafts:drafts};});
        return;
      }
      const change=conversationEntryChange(event.key,event.newValue);
      if(!change)return;
      useStore.setState(state=>applyConversationStorageChange(state,change));
    };
    window.addEventListener("storage",changed);return()=>window.removeEventListener("storage",changed);
  },[]);
  const [quickAsk,setQuickAsk]=useState(bridge.quickAskMode);
  const quickAskReady=useRef(false);
  const conversationId=useStore(state=>state.conversationId);
  const expandQuickAsk=()=>{void bridge.quickAsk("expand").then(compact=>{setQuickAsk(compact);try{localStorage.removeItem("aux.quick-ask.chat");}catch{} useStore.setState({mode:"conversation"});}).catch(errToast);};
  useEffect(()=>{
    if(!bridge.quickAskMode)return;
    void bridge.quickAsk("status").then(compact=>{
      setQuickAsk(compact);
      if(!compact)return;
      let saved:string|null=null;try{saved=localStorage.getItem("aux.quick-ask.chat");}catch{}
      quickAskReady.current=true;
      useStore.getState().openConversationDraft(saved||crypto.randomUUID());
    }).catch(errToast);
    return bridge.onQuickAskState(setQuickAsk);
  },[]);
  useEffect(()=>{if(quickAskReady.current&&quickAsk&&conversationId)try{localStorage.setItem("aux.quick-ask.chat",conversationId);}catch{}},[quickAsk,conversationId]);
  useEffect(() => bridge.onPageAction(action => {
    if (bridge.privateMode) return;
    if (action.action === "remember") {
      const state = useStore.getState();
      const space = state.layout.spaces.find(space => space.id === state.layout.activeSpaceId);
      if (!space?.workspaceId) { errToast(new Error("Choose a Space before saving memory.")); return; }
      const workspaceId = space.workspaceId, key = `item:${workspaceId}`;
      const openMemory = () => { useStore.setState({ memoryWorkspaceId: workspaceId, settingsCategory: "Memory" }); useStore.getState().setOverlay("settings"); };
      if (useMemoryDrafts.getState().drafts[key]) { openMemory(); errToast(new Error("Finish or discard the existing memory-note draft before remembering another selection.")); return; }
      void call<WorkspaceMemory>("workspaces.memory.get", { workspaceId }).then(memory => {
        if (useMemoryDrafts.getState().drafts[key]) throw new Error("A memory-note draft was opened while loading. Your existing draft is preserved.");
        let sourceUrl = "";
        try { const url = new URL(action.url); if (["http:", "https:"].includes(url.protocol) && !url.username && !url.password && url.href.length <= 2048) sourceUrl = url.href; } catch { /* Non-web selections remain explicit unsourced notes. */ }
        useMemoryDrafts.getState().write(key, { revision: memory.revision, content: JSON.stringify({ itemId: crypto.randomUUID(), content: action.selection, sourceUrl, expires: "", selectionTruncated: action.truncated }) });
        if (useStore.getState().layout.activeSpaceId === space.id) openMemory();
        else toast(`Memory draft saved in ${space.name}. Open Memory settings to review it.`);
      }).catch(errToast);
      return;
    }
    const id = crypto.randomUUID();
    const instruction = action.action === "explain" ? "Explain this selected text clearly."
      : action.action === "summarize" ? action.selection ? "Summarize this selected text." : "Summarize this page and its key points."
      : "Help me understand this selected text.";
    const quote = action.selection ? `\n\nSelected text${action.truncated ? " (first 12,000 characters)" : ""}:\n${action.selection.split("\n").map(line => `> ${line}`).join("\n")}` : "";
    const state = useStore.getState();
    state.setConversationDraft(id, `${instruction}\n\nSource: ${action.title || action.url}\n${action.url}${quote}`);
    state.setConversationContext(id, action.pageId);
    state.openConversationDraft(id);
    requestAnimationFrame(() => document.querySelector<HTMLTextAreaElement>(".conversation-input textarea")?.focus());
  }), []);
  const mode = useStore((s) => s.mode);
  const overlay = useStore((s) => s.overlay);
  useEffect(()=>{if(quickAsk&&overlay)expandQuickAsk();},[quickAsk,overlay]);
  const railOpen = useStore((s) => s.railOpen);
  const sidebar = useStore((s) => s.sidebar);
  const sidebarPeek = useStore(s => s.sidebarPeek);
  const activePageId = useStore((s) => s.activePageId);
  const pages = useStore((s) => s.pages);
  const activePage = pages.find((p) => p.pageId === activePageId);
  const pageChrome = inElectron && !quickAsk && !!activePage && activePage.backend !== "chrome"
    && activePage.viewStatus !== "crashed" && !activePage.navigationError
    && (!!activePage.showBlankDocument || (!!activePage.url && activePage.url !== "about:blank"));
  const toolbarReveal = useToolbarReveal(pageChrome);
  const splitPageId = useStore((s) => s.splitPageId);
  const splitRatio = useStore(s => s.layout.splitRatio ?? .5);
  const settings = useStore((s) => s.settings);
  const toasts = useStore((s) => s.toasts);
  const connected = useStore((s) => s.connected);
  const layout = useStore((s) => s.layout);
  const setOverlay = useStore((s) => s.setOverlay);
  const setMode = useStore((s) => s.setMode);
  const stageRef = useRef<HTMLDivElement>(null);
  const space = layout.spaces.find((s) => s.id === layout.activeSpaceId) ?? layout.spaces[0]!;

  useEffect(() => { applyUiFontSize(); }, []);

  // Native vibrancy and transparent renderer layers must change together.
  useEffect(() => {
    const dark = window.matchMedia("(prefers-color-scheme: dark)");
    const reduced = window.matchMedia("(prefers-reduced-transparency: reduce)");
    const apply = () => {
      const theme = settings.theme === "system" ? (dark.matches ? "dark" : "light") : settings.theme === "light" ? "light" : "dark";
      const glass = settings.sidebarAppearance !== "solid" && !reduced.matches;
      document.documentElement.dataset.theme = theme;
      document.documentElement.dataset.sidebarAppearance = glass ? "translucent" : "solid";
      document.documentElement.style.setProperty("--sidebar-tint", `${Number(settings.sidebarTint ?? 0)}%`);
      document.documentElement.style.setProperty("--content-opacity", `${Number(settings.contentOpacity ?? 95)}%`);
      const material = settings.sidebarMaterial === "sidebar" || settings.sidebarMaterial === "under-window" || settings.sidebarMaterial === "titlebar" ? settings.sidebarMaterial : "liquid-glass";
      void bridge.setAppearance(settings.theme === "system" ? "system" : theme, glass, true, material).catch(errToast);
    };
    apply(); dark.addEventListener("change", apply); reduced.addEventListener("change", apply);
    return () => { dark.removeEventListener("change", apply); reduced.removeEventListener("change", apply); };
  }, [settings.theme, settings.sidebarAppearance, settings.sidebarMaterial, settings.sidebarTint, settings.contentOpacity]);
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
      const previewChat = q.get("chat");
      const previewRun = previewChat ? st.runs.find(run=>(run.config?.chatId??run.runId)===previewChat) : undefined;
      if(previewRun)st.openConversation(previewRun.runId);
      else if (q.get("scenario") === "set" && st.sets[0]) st.openRail({ kind: "set", setId: st.sets[0].setId });
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
        const showPage = nativePageId({ mode, overlay, activePageId, url: activePage?.url, backend: activePage?.backend, viewStatus: activePage?.viewStatus, navigationError: activePage?.navigationError, showBlankDocument: activePage?.showBlankDocument });
        const companion = pages.find(page => page.pageId === splitPageId);
        const split = showPage && companion && companion.pageId !== showPage && nativePageId({mode,overlay,activePageId:companion.pageId,...companion}) ? splitPageId : null;
        // Reserve an invisible edge target outside the native page's input surface.
        const edge = sidebar === "expanded" ? 0 : 6;
        let cover = 0;
        const card = el.closest(".stage-card");
        if (toolbarReveal.inset && card?.classList.contains("has-page")) {
          const bar = el.closest(".main-col")?.querySelector(":scope > .toolbar");
          const pop = bar?.querySelector(".cb-pop");
          const bottom = (pop ?? bar)?.getBoundingClientRect().bottom;
          if (bottom != null) cover = Math.max(0, Math.min(Math.round(r.height) - 80, Math.round(bottom - r.top)));
        }
        const menus = [...document.querySelectorAll<HTMLElement>(".ctx-menu")].map(menu => {
          const box = menu.getBoundingClientRect();
          return { x: box.x, y: box.y, width: box.width, height: box.height };
        });
        const fitted = stageAvoiding(
          { x: Math.round(r.x) + edge, y: Math.round(r.y) + cover, width: Math.max(1, Math.round(r.width) - edge), height: Math.max(1, Math.round(r.height) - cover) },
          menus,
        );
        void bridge.setStage(showPage, fitted, split, STAGE_RADIUS, splitRatio);
      });
    };
    const ro = new ResizeObserver(report);
    ro.observe(el);
    const bar = el.closest(".main-col")?.querySelector(":scope > .toolbar");
    const popover = bar ? new MutationObserver(report) : null;
    if (bar) popover?.observe(bar, { childList: true, subtree: true });
    report();
    const stopStageReport = onStageReport(report);
    // panels animate with transforms; re-report once they settle
    const t = window.setTimeout(report, 280);
    return () => {
      ro.disconnect();
      popover?.disconnect();
      stopStageReport();
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [activePageId, activePage?.url, activePage?.backend, activePage?.viewStatus, activePage?.navigationError, activePage?.showBlankDocument, pages, splitPageId, splitRatio, mode, overlay, railOpen, sidebar, settings.tabLayout, toolbarReveal.inset]);

  const dispatchShortcut = (s: Shortcut) => {
    const k = s.key.toLowerCase().replace(/^arrow/, "");
    const st = useStore.getState();
    const meta = s.meta;

    if (s.ctrl && k === "tab") return cycleTab(s.shift ? -1 : 1);
    if (meta && s.alt && k === "left") return cycleTab(-1);
    if (meta && s.alt && k === "right") return cycleTab(1);
    if (meta && s.alt && k === "i") return st.activePageId && void bridge.devTools(st.activePageId);
    if (meta && s.alt && k === "u") {
      const p = st.pages.find((x) => x.pageId === st.activePageId);
      if (p?.url.startsWith("http")) void call("pages.navigate", { pageId: p.pageId, url: `view-source:${p.url}` }).catch(errToast);
      return;
    }
    if (meta && s.shift && k === "c") return st.activePageId && void bridge.devTools(st.activePageId);
    if (meta && s.shift && k === "r") return st.activePageId && void bridge.hardReload(st.activePageId).catch(errToast);
    if (meta && s.shift && k === "w") return void bridge.closeWindow();
    if (meta && s.shift && k === "d") return bookmarkAll();
    if (meta && s.shift && k === "backspace") return setOverlay("clear-history");
    if (meta && s.alt && k === "r") return setOverlay(st.overlay === "reader" ? null : "reader");
    if (meta && s.shift && k === "a") return bridge.privateMode ? undefined : st.toggleRail();
    if (meta && s.shift && k === "o") return setMode(st.mode === "overview" ? "focus" : "overview");
    if (meta && s.shift && k === "j") return setOverlay("downloads");
    if (meta && s.shift && k === "t") return void st.reopenClosedTab();
    if (meta && s.shift && (k === "]" || k === "}")) return cycleTab(1);
    if (meta && s.shift && (k === "[" || k === "{")) return cycleTab(-1);
    if (meta && k === "p" && s.shift) return void savePagePdf(st.activePageId).catch(errToast);
    if (meta && k === "g") {
      if (st.overlay === "reader") {
        useStore.setState({readerFindOpen:true});
        if (st.findText) void st.find(st.findText,true,!s.shift).catch(errToast);
        return;
      }
      if (!st.findText) return setOverlay("find");
      if (st.overlay !== "find") setOverlay("find");
      return void st.find(st.findText, true, !s.shift).catch(errToast);
    }
    if (meta && (k === "=" || k === "+")) return st.activePageId && void st.zoomPage(st.activePageId, { direction: "in" }).catch(errToast);
    if (meta && (k === "-" || k === "_")) return st.activePageId && void st.zoomPage(st.activePageId, { direction: "out" }).catch(errToast);
    if (meta && k === "0") return st.activePageId && void st.zoomPage(st.activePageId, { reset: true }).catch(errToast);
    if (meta && s.shift) return;

    if (meta && k === "k") return bridge.privateMode ? undefined : setOverlay(st.overlay === "palette" ? null : "palette");
    if (meta && (k === "l" || k === "e")) return st.focusCommandBar();
    if (meta && k === "f") {
      if (st.overlay === "reader") useStore.setState({readerFindOpen:true}); else setOverlay("find");
      void bridge.focusShell().then(() => { const input = document.querySelector<HTMLInputElement>(".findbar input"); input?.focus(); input?.select(); }).catch(errToast);
      return;
    }
    if (meta && k === "o") return void openLocalFile().catch(errToast);
    if (meta && k === "p") return void printCurrentPage(st.activePageId).catch(errToast);
    if (meta && k === "t") return void st.newTab();
    if (meta && k === "w") {
      if (st.overlay) return setOverlay(null);
      if (!st.activePageId) return void bridge.closeWindow();
      if (st.mode === "focus") return void closeSelectedTabs().then(handled => { if (!handled && st.activePageId) return st.closeTab(st.activePageId); }).catch(errToast);
      return void st.closeTab(st.activePageId);
    }
    if (meta && k === "r") return st.activePageId && void call("pages.reload", { pageId: st.activePageId }).catch(errToast);
    if (meta && k === ",") return bridge.privateMode ? undefined : setOverlay("settings");
    if (meta && k === "y") return setOverlay("history");
    if (meta && k === "s") return st.toggleSidebar();
    if (meta && k === "d") {
      const p = st.pages.find((x) => x.pageId === st.activePageId);
      if (!p || !isTab(p) || !bookmarkWebUrl(p.url)) return;
      void st.toggleBookmark(p.url, p.title).catch(errToast);
      return;
    }
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
    const bookmarks = [...new Map(st.pages.filter(page => isTab(page) && bookmarkWebUrl(page.url)).map(page => [page.url, { url: page.url, title: page.title.slice(0, 1000) }])).values()];
    if (!bookmarks.length) return toast("No web tabs to bookmark");
    void call<{ added: number; skipped: number }>("bookmarks.import", { bookmarks })
      .then(result => toast(result.added ? `Bookmarked ${result.added} tab${result.added === 1 ? "" : "s"}` : "All tabs already bookmarked"))
      .catch(errToast);
  };



  // renderer-side keys (when the shell itself has focus)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing) return;
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

  if (quickAsk) return <QuickAsk onExpand={expandQuickAsk}/>;
  return (
    <div
      className={`app tabs-${settings.tabLayout ?? "vertical"} ${inElectron ? "electron" : ""} layout-${sidebar as SidebarMode} ${sidebarPeek ? "sidebar-peek" : ""} ${railOpen ? "rail-open" : ""}`}
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
        <div className={`main-col${toolbarReveal.revealed ? " toolbar-revealed" : ""}`}>
          {settings.tabLayout === "horizontal" && <HorizontalTabs />}
          <Toolbar />
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
      {(overlay === "history" || overlay === "bookmarks" || overlay === "clear-history") && <Library key={overlay} initialView={overlay === "bookmarks" ? "bookmarks" : "history"} confirmClear={overlay === "clear-history"} />}
      {overlay === "observe" && <Inspector />}
      {overlay === "site" && <SiteControls />}
      <HttpAuthPrompt />
      <div className={`toasts ${sidebar === "hidden" || sidebar === "rail" ? "top" : ""}`} aria-live="polite">
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
