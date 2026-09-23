import { runAnswerEntry } from "./run-answer-drafts";
import { PaneBoundary } from "./components/PaneBoundary";
import { closeSelectedTabs } from "./use-tab-selection";
import { conversationEntryChange, applyConversationStorageChange } from "./conversation-drafts";
import { BrowsingMemoryWatch } from "./use-browsing-memory";
import { useMemoryDrafts } from "./memory-drafts";
import type { WorkspaceMemory, ShortcutOverrides } from "@aux/contracts";
import { effectiveShortcuts, matchShortcut } from "@aux/contracts/shortcut-defs";
import { deferSurface, preloadWhenIdle } from "./components/DeferredSurface";
import { Conversation, AnswerPreview } from "./components/surfaces";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import type { PageTarget } from "@aux/contracts";
import { LIVE_RUN, useStore, call, toast, errToast, tabCommand, patchPageFields, type SidebarMode } from "./store";
import { bridge, inElectron, inMock } from "./bridge";
import { savePagePdf, printCurrentPage } from "./page-export";
import { nativePageId } from "./chrome";
import { useToolbarReveal } from "./toolbar-reveal";
import { usePagePointerForward } from "./page-pointer";
import { onStageReport, stageAvoiding } from "./stage-obstruction";
import { isTab, tabsInSpace } from "./workspace";
import { bookmarkWebUrl } from "./bookmark-files";
import { Sidebar } from "./components/Sidebar";
import { Toolbar } from "./components/Toolbar";
import { Stage } from "./components/Stage";
import { AgentRail } from "./components/AgentRail";
import { FindBar } from "./components/FindBar";
import { I } from "./components/icons";
import { Toasts } from "./components/Toasts";
import { applyUiFontSize } from "./ui-font-size";
import { openLocalFile } from "./open-local-file";

const ReaderView = deferSurface(async () => { const module = await import("./components/ReaderView"); return {default:module.ReaderView}; }, "Reader");
const Settings = deferSurface(async () => { const module = await import("./components/Settings"); return {default:module.Settings}; }, "Settings");
const Library = deferSurface(async () => { const module = await import("./components/Library"); return {default:module.Library}; }, "Library");
const Inspector = deferSurface(async () => { const module = await import("./components/Inspector"); return {default:module.Inspector}; }, "Page inspection");
const Tasks = deferSurface(async () => { const module = await import("./components/Tasks"); return {default:module.Tasks}; }, "Tasks");
const Palette = deferSurface(async () => { const module = await import("./components/Palette"); return {default:module.Palette}; }, "Command palette");
const Downloads = deferSurface(async () => { const module = await import("./components/Downloads"); return {default:module.Downloads}; }, "Downloads");
const SiteControls = deferSurface(async () => { const module = await import("./components/SiteControls"); return {default:module.SiteControls}; }, "Site controls");
const QuickAsk = deferSurface(async () => { const module = await import("./components/QuickAsk"); return {default:module.QuickAsk}; }, "Quick Ask", true, true);
const HorizontalTabs = deferSurface(async () => { const module = await import("./components/HorizontalTabs"); return {default:module.HorizontalTabs}; }, "Tabs", true, true);
const HttpAuthPrompt = deferSurface(async () => { const module = await import("./components/HttpAuthPrompt"); return {default:module.HttpAuthPrompt}; }, "Sign-in prompt", true, true);
const VaultOfferBanner = deferSurface(async () => { const module = await import("./components/VaultOfferBanner"); return {default:module.VaultOfferBanner}; }, "Password offer", true, true);

/** Only the fields that decide native-view placement — title/favicon churn must not re-render the shell. */
const placementFields = (page?: PageTarget) => page && { pageId: page.pageId, url: page.url, backend: page.backend, viewStatus: page.viewStatus, navigationError: page.navigationError, showBlankDocument: page.showBlankDocument };

type Shortcut = { key: string; meta: boolean; shift: boolean; alt: boolean; ctrl?: boolean; commandId?: string };
type StoreState = ReturnType<typeof useStore.getState>;

export function App() {
  useEffect(() => preloadWhenIdle([Conversation, AnswerPreview, Palette, Downloads, SiteControls]), []);
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
    if (action.action === "image") {
      const state = useStore.getState();
      const alt = action.image?.altText ? `\nAlt text: "${action.image.altText}"` : "";
      const src = action.image?.srcURL ? `\nImage: ${action.image.srcURL}` : "";
      state.setConversationDraft(id, `Help me understand this image.\n\nSource: ${action.title || action.url}\n${action.url}${src}${alt}`);
      state.setConversationContext(id, action.pageId);
      const open = () => {
        state.openConversationDraft(id);
        requestAnimationFrame(() => document.querySelector<HTMLTextAreaElement>(".conversation-input textarea")?.focus());
      };
      if (action.image?.dataUrl) {
        const image = action.image;
        void call("conversations.images.add", { chatId: id, filename: "page-image.png", dataUrl: image.dataUrl, sourceUrl: image.srcURL })
          .then(open)
          .catch(error => { open(); errToast(error instanceof Error ? error : new Error(String(error))); });
      } else {
        if (action.image?.captureError) toast(`Aux couldn't attach that image (${action.image.captureError}). The conversation opened with its source instead.`);
        open();
      }
      return;
    }
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
  const activePage = useStore(useShallow((s) => placementFields(s.activePageId ? s.pages.find((p) => p.pageId === s.activePageId) : undefined)));
  const pageChrome = inElectron && !quickAsk && !!activePage && activePage.backend !== "chrome"
    && activePage.viewStatus !== "crashed" && !activePage.navigationError
    && (!!activePage.showBlankDocument || (!!activePage.url && activePage.url !== "about:blank"));
  const toolbarReveal = useToolbarReveal(pageChrome);
  const [toolbarHole, setToolbarHole] = useState(false);
  const [toolbarReady, setToolbarReady] = useState(false);
  const [toolbarStacked, setToolbarStacked] = useState(false);
  const nativeShowing = !!nativePageId({ mode, overlay, activePageId, url: activePage?.url, backend: activePage?.backend, viewStatus: activePage?.viewStatus, navigationError: activePage?.navigationError, showBlankDocument: activePage?.showBlankDocument });
  usePagePointerForward(toolbarStacked && nativeShowing);
  const splitPageId = useStore((s) => s.splitPageId);
  const splitCompanion = useStore(useShallow((s) => placementFields(s.splitPageId ? s.pages.find((p) => p.pageId === s.splitPageId) : undefined)));
  const splitRatio = useStore(s => s.layout.splitRatio ?? .5);
  const settings = useStore(useShallow((s) => ({ tabLayout: s.settings.tabLayout, theme: s.settings.theme, sidebarAppearance: s.settings.sidebarAppearance, sidebarMaterial: s.settings.sidebarMaterial, sidebarTint: s.settings.sidebarTint, contentOpacity: s.settings.contentOpacity })));
  const connected = useStore((s) => s.connected);
  const spaceColor = useStore((s) => (s.layout.spaces.find((space) => space.id === s.layout.activeSpaceId) ?? s.layout.spaces[0]!).color);
  const vaultOffer = useStore((s) => !!s.vaultOffer);
  const setOverlay = useStore((s) => s.setOverlay);
  const setMode = useStore((s) => s.setMode);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => { applyUiFontSize(); }, []);

  // Raise the shell over the native page before the bar animates, and lower it only after the bar has left.
  const toolbarTicket = useRef(0);
  useEffect(() => {
    if (!inElectron) return;
    const ticket = ++toolbarTicket.current;
    const current = () => toolbarTicket.current === ticket;
    if (toolbarReveal.covering) {
      void bridge.toolbarOverlay(true, ticket).then(() => {
        if (!current()) return;
        setToolbarStacked(true);
        setToolbarReady(true);
      }).catch(() => {});
      return;
    }
    setToolbarReady(false);
    void bridge.toolbarOverlay(false, ticket).finally(() => {
      if (!current()) return;
      setToolbarStacked(false);
      setToolbarHole(false);
    });
  }, [toolbarReveal.covering]);

  // The page stays flush. While the address bar is away, the window buttons would sit on that page, so they leave with the bar.
  const hideTrafficLights = inElectron && sidebar !== "expanded" && !sidebarPeek && nativeShowing && !toolbarReveal.covering;
  useEffect(() => {
    if (!inElectron) return;
    void bridge.trafficLights(!hideTrafficLights).catch(() => {});
  }, [hideTrafficLights]);

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
    document.documentElement.dataset.space = spaceColor;
  }, [spaceColor]);
  // The window background clears with the shell layers, so <html> carries the same state before paint.
  useLayoutEffect(() => {
    const root = document.documentElement.classList;
    root.toggle("toolbar-stacked", toolbarHole);
    root.toggle("sidebar-peek", sidebarPeek);
  }, [toolbarHole, sidebarPeek]);

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
    const offTabs = bridge.onTabsPatch(patch => useStore.getState().applyTabsPatch(patch));
    const offPlacement = bridge.onTabsPlacement(payload => useStore.getState().applyTabsPlacement(payload));
    const offRuntime = bridge.onRuntimeStatus(status => {
      useStore.setState({ connected: status.connected });
      if (status.connected) void useStore.getState().refresh();
    });
    const offLoading = bridge.onLoading(({ pageId, loading }) => patchPageFields(pageId, { loading }));
    let audioLive=true;
    const changedAudio=new Set<string>();
    const offAudio=bridge.onAudio(({pageId,removed,...state})=>{changedAudio.add(pageId);useStore.setState(current=>{const tabAudio={...current.tabAudio};if(removed)delete tabAudio[pageId];else tabAudio[pageId]=state;return {tabAudio};});});
    void bridge.tabAudio().then(snapshot=>{if(audioLive)useStore.setState(current=>({tabAudio:{...Object.fromEntries(Object.entries(snapshot).filter(([id])=>!changedAudio.has(id))),...Object.fromEntries(Object.entries(current.tabAudio).filter(([id])=>changedAudio.has(id)))}}));}).catch(()=>{});
    const offDownload = bridge.onDownload((d) => useStore.getState().applyDownload(d as never));
    const offShortcut = bridge.onShortcut((s) => dispatchShortcut(s));
    const offVault = bridge.onVaultOffer(offer => useStore.getState().setVaultOffer(offer));
    const offTranslation = bridge.onTranslationChanged(payload => {
      const s = useStore.getState();
      if (payload.pending) { s.setTranslationPending(payload.pageId); return; }
      if (s.translationPending === payload.pageId) s.setTranslationPending(null);
      if (payload.error) { s.toast(payload.error, "error"); return; }
      s.setTranslation(payload.lang ? { pageId: payload.pageId, lang: payload.lang, count: payload.count ?? 0, truncated: !!payload.truncated } : null);
    });
    return () => {
      offEvent();
      offTabs();
      offPlacement();
      offRuntime();
      offLoading();
      offDownload();audioLive=false;offAudio();
      offShortcut();
      offVault();
      offTranslation();
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
        const shell = el.closest(".main-col");
        const stageRadius = shell ? Math.round(parseFloat(getComputedStyle(shell).borderTopLeftRadius) || 0) : 0;
        const showPage = nativePageId({ mode, overlay, activePageId, url: activePage?.url, backend: activePage?.backend, viewStatus: activePage?.viewStatus, navigationError: activePage?.navigationError, showBlankDocument: activePage?.showBlankDocument });
        const companion = splitCompanion;
        const split = showPage && companion && companion.pageId !== showPage && nativePageId({mode,overlay,activePageId:companion.pageId,...companion}) ? splitPageId : null;
        const menus = [...document.querySelectorAll<HTMLElement>(".ctx-menu")].map(menu => {
          const box = menu.getBoundingClientRect();
          return { x: box.x, y: box.y, width: box.width, height: box.height };
        });
        const fitted = stageAvoiding(
          { x: Math.round(r.x), y: Math.round(r.y), width: Math.max(1, Math.round(r.width)), height: Math.max(1, Math.round(r.height)) },
          menus,
        );
        void bridge.setStage(showPage, fitted, split, stageRadius, splitRatio);
      });
    };
    const ro = new ResizeObserver(report);
    ro.observe(el);
    report();
    const stopStageReport = onStageReport(report);
    // the sidebar animates its width; report once more when it settles
    const settled = (event: TransitionEvent) => {
      if (event.propertyName === "width" && event.target instanceof Element && event.target.classList.contains("sidebar")) report();
    };
    document.addEventListener("transitionend", settled);
    return () => {
      ro.disconnect();
      stopStageReport();
      cancelAnimationFrame(raf);
      document.removeEventListener("transitionend", settled);
    };
  }, [activePageId, activePage?.url, activePage?.backend, activePage?.viewStatus, activePage?.navigationError, activePage?.showBlankDocument, splitCompanion?.url, splitCompanion?.backend, splitCompanion?.viewStatus, splitCompanion?.navigationError, splitCompanion?.showBlankDocument, splitPageId, splitRatio, mode, overlay, railOpen, settings.tabLayout]);

  const findG = (st: StoreState, forward: boolean) => {
    if (st.overlay === "reader") {
      useStore.setState({readerFindOpen:true});
      if (st.findText) void st.find(st.findText,true,forward).catch(errToast);
      return;
    }
    if (!st.findText) return setOverlay("find");
    if (st.overlay !== "find") setOverlay("find");
    return void st.find(st.findText, true, forward).catch(errToast);
  };

  /** commandId → action. The registry owns chords; this owns behavior. */
  const SHORTCUT_ACTIONS: Record<string, (st: StoreState) => unknown> = {
    "new-tab": st => st.newTab(),
    "open-file": () => openLocalFile().catch(errToast),
    "reopen-closed-tab": st => st.reopenClosedTab(),
    "close-window": () => bridge.closeWindow(),
    "print": st => printCurrentPage(st.activePageId).catch(errToast),
    "save-pdf": st => savePagePdf(st.activePageId).catch(errToast),
    "find": st => {
      if (st.overlay === "reader") useStore.setState({readerFindOpen:true}); else setOverlay("find");
      void bridge.focusShell().then(() => { const input = document.querySelector<HTMLInputElement>(".findbar input"); input?.focus(); input?.select(); }).catch(errToast);
    },
    "find-next": st => findG(st, true),
    "find-previous": st => findG(st, false),
    "reload": st => st.activePageId && tabCommand({ kind: "reload", pageId: st.activePageId }).catch(errToast),
    "hard-reload": st => st.activePageId && bridge.hardReload(st.activePageId).catch(errToast),
    "actual-size": st => st.activePageId && st.zoomPage(st.activePageId, { reset: true }).catch(errToast),
    "zoom-in": st => st.activePageId && st.zoomPage(st.activePageId, { direction: "in" }).catch(errToast),
    "zoom-out": st => st.activePageId && st.zoomPage(st.activePageId, { direction: "out" }).catch(errToast),
    "reader": st => setOverlay(st.overlay === "reader" ? null : "reader"),
    "sidebar": st => st.toggleSidebar(),
    "overview": st => setMode(st.mode === "overview" ? "focus" : "overview"),
    "devtools": st => st.activePageId && bridge.devTools(st.activePageId),
    "inspect-element": st => st.activePageId && bridge.devTools(st.activePageId),
    "view-source": st => {
      const p = st.pages.find((x) => x.pageId === st.activePageId);
      if (p?.url.startsWith("http")) void st.navigatePage(p.pageId, `view-source:${p.url}`).catch(errToast);
    },
    "back": st => st.activePageId && tabCommand({ kind: "back", pageId: st.activePageId }).catch(errToast),
    "forward": st => st.activePageId && tabCommand({ kind: "forward", pageId: st.activePageId }).catch(errToast),
    "open-address": st => st.focusCommandBar(),
    "palette": st => bridge.privateMode ? undefined : setOverlay(st.overlay === "palette" ? null : "palette"),
    "settings": () => bridge.privateMode ? undefined : setOverlay("settings"),
    "history": () => setOverlay("history"),
    "downloads": () => setOverlay("downloads"),
    "bookmark": st => {
      const p = st.pages.find((x) => x.pageId === st.activePageId);
      if (!p || !isTab(p) || !bookmarkWebUrl(p.url)) return;
      void st.toggleBookmark(p.url, p.title).catch(errToast);
    },
    "bookmark-all": () => bookmarkAll(),
    "agent-rail": st => bridge.privateMode ? undefined : st.toggleRail(),
    "clear-history": () => setOverlay("clear-history"),
    "tab-next": () => cycleTab(1),
    "tab-previous": () => cycleTab(-1),
    "close-tab": st => {
      if (st.overlay) return setOverlay(null);
      if (!st.activePageId) return void bridge.closeWindow();
      if (st.mode === "focus") return void closeSelectedTabs().then(handled => { if (!handled && st.activePageId) return st.closeTab(st.activePageId); }).catch(errToast);
      return void st.closeTab(st.activePageId);
    },
    ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`tab-${i + 1}`, (st: StoreState) => {
      const tabs = tabsInSpace(st.layout, st.pages, st.layout.activeSpaceId);
      const p = i === 8 ? tabs[tabs.length - 1] : tabs[i];
      if (p) void st.activate(p.pageId).catch(errToast);
    }])),
  };

  const dispatchShortcut = (s: Shortcut) => {
    const st = useStore.getState();
    // Menus and page interception resolve the command before sending; only
    // raw chords (shell keydown) need matching here.
    const id = s.commandId ?? matchShortcut(effectiveShortcuts(st.settings?.shortcutOverrides as ShortcutOverrides | undefined), {
      key: s.key, meta: s.meta, ctrl: s.ctrl ?? false, shift: s.shift, alt: s.alt,
    }, { platform: bridge.platform })?.id;
    if (id) void SHORTCUT_ACTIONS[id]?.(st);
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
        const st = useStore.getState();
        const def = matchShortcut(effectiveShortcuts(st.settings?.shortcutOverrides as ShortcutOverrides | undefined), {
          key: e.key, meta: e.metaKey, ctrl: e.ctrlKey, shift: e.shiftKey, alt: e.altKey,
        }, { platform: bridge.platform });
        if (def) {
          e.preventDefault();
          dispatchShortcut({ key: e.key, meta: e.metaKey, shift: e.shiftKey, alt: e.altKey, ctrl: e.ctrlKey, commandId: def.id });
        }
        return;
      }
      if (e.key === "Escape" && !e.defaultPrevented && useStore.getState().overlay) setOverlay(null);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (inElectron && toolbarReveal.covering && !toolbarHole) setToolbarHole(true);
  if (quickAsk) return <QuickAsk onExpand={expandQuickAsk}/>;
  return (
    <div
      className={`app tabs-${settings.tabLayout ?? "vertical"} ${inElectron ? "electron" : ""} layout-${sidebar as SidebarMode} ${sidebarPeek ? "sidebar-peek" : ""} ${toolbarHole ? "toolbar-stacked" : ""} ${railOpen ? "rail-open" : ""}`}
      data-overlay={overlay ?? undefined}
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
        <div className={`main-col${nativeShowing ? " has-page" : ""}${mode === "conversation" ? " conversation-open" : ""}${toolbarReveal.revealed && toolbarReady ? " toolbar-revealed" : ""}`}>
          {settings.tabLayout === "horizontal" && <HorizontalTabs />}
          <Toolbar />
          <div className="main">
            <div className="stage-wrap">
              {overlay === "find" && <FindBar />}
              <Stage ref={stageRef} />
              {overlay === "reader" && <ReaderView />}
              {overlay === "settings" && <Settings />}
              {overlay === "tasks" && <Tasks />}
              {overlay === "downloads" && <Downloads />}
            </div>
          </div>
        </div>
        {!bridge.privateMode && <PaneBoundary label="The assistant"><AgentRail /></PaneBoundary>}
      </div>
      {overlay === "palette" && !bridge.privateMode && <Palette />}
      {(overlay === "history" || overlay === "bookmarks" || overlay === "clear-history") && <Library key={overlay} initialView={overlay === "bookmarks" ? "bookmarks" : "history"} confirmClear={overlay === "clear-history"} />}
      {overlay === "observe" && <Inspector />}
      {overlay === "site" && <SiteControls />}
      <HttpAuthPrompt />
      {vaultOffer && <VaultOfferBanner />}
      <Toasts top={sidebar === "hidden" || sidebar === "rail"} />
      <BrowsingMemoryWatch />
    </div>
  );
}
