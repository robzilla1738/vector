import { useOrganizationEditor } from "./features/organization-state";
import { useFeature } from "./use-feature";
import { useSurfaceCovering } from "./features/surfaces/drag-state";
import { bootShellFeatures, FeatureSlots } from "./features/registry";
import { dispatchShortcut as dispatchCommandShortcut, runCommand } from "./commands";
import { runAnswerEntry } from "./run-answer-drafts";
import { reconcileResultDrafts } from "./result-drafts";
import { PaneBoundary } from "./components/PaneBoundary";
import { conversationEntryChange, applyConversationStorageChange } from "./conversation-drafts";
import { browserSourcesEntryChange } from "./browser-context-sources";
import { BrowsingMemoryWatch } from "./use-browsing-memory";
import { useMemoryDrafts } from "./memory-drafts";
import type { ShortcutOverrides } from "@aux/contracts";
import { effectiveShortcuts, matchShortcut } from "@aux/contracts/shortcut-defs";
import { deferSurface, preloadWhenIdle } from "./components/DeferredSurface";
import { Conversation, AnswerPreview } from "./components/surfaces";
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useShallow } from "zustand/react/shallow";
import type { PageTarget, Run } from "@aux/contracts";
import { LIVE_RUN, useStore, call, toast, errToast, patchPageFields, type SidebarMode } from "./store";
import { bridge, inNativeHost, inMock } from "./bridge";
import { isHomeAddress, isScrimOverlay, nativePageId } from "./chrome";
import { useLayoutChrome, useWindowControls } from "./features/layout/layout";
import { useToolbarReveal } from "./toolbar-reveal";
import { spaceThemeStyle } from "./workspace";
import { createTabSwitcher } from "./tab-switcher";
import { Toolbar } from "./components/Toolbar";
import { Stage } from "./components/Stage";
import { I } from "./components/icons";
import { Toasts } from "./components/Toasts";
import { applyUiFontSize } from "./ui-font-size";
import { installMemorySaver } from "./memory-saver";
import { settingsRouteFromPath } from "./settings/routes";
import { recoverPeekLink } from "./peek-link";
import { deliverRunAttention, foregroundRunId, matchesRunAttentionActivation, RunNotificationGate, type OwnerNotice } from "./agent/run-notifications";
import { onInAppNoticePreferenceChange, readInAppNoticePreference, readSystemTaskNotices, readTaskFocusMode } from "./agent/run-notice-preference";
import { RunNoticeBanner } from "./agent/RunNoticeControls";

const ReaderView = deferSurface(async () => { const module = await import("./components/ReaderView"); return {default:module.ReaderView}; }, "Reader");
const Settings = deferSurface(async () => { const module = await import("./components/Settings"); return {default:module.Settings}; }, "Settings");
const Library = deferSurface(async () => { const module = await import("./components/Library"); return {default:module.Library}; }, "Library");
const Inspector = deferSurface(async () => { const module = await import("./components/Inspector"); return {default:module.Inspector}; }, "Page inspection");
const Tasks = deferSurface(async () => { const module = await import("./components/Tasks"); return {default:module.Tasks}; }, "Tasks");
const Palette = deferSurface(async () => { const module = await import("./components/Palette"); return {default:module.Palette}; }, "Command palette");
const Downloads = deferSurface(async () => { const module = await import("./components/Downloads"); return {default:module.Downloads}; }, "Downloads");
const InlineAssist = deferSurface(async () => { const module = await import("./components/InlineAssist"); return {default:module.InlineAssist}; }, "Assist writing");
const SiteControls = deferSurface(async () => { const module = await import("./components/SiteControls"); return {default:module.SiteControls}; }, "Site controls");
const SiteCustomization = deferSurface(async () => { const module = await import("./components/SiteCustomization"); return {default:module.SiteCustomization}; }, "Site customization");
const LittleWindow = deferSurface(async () => { const module = await import("./components/LittleWindow"); return {default:module.LittleWindow}; }, "Little window", true, true);
const QuickAsk = deferSurface(async () => { const module = await import("./components/QuickAsk"); return {default:module.QuickAsk}; }, "Quick Ask", true, true);
const HorizontalTabs = deferSurface(async () => { const module = await import("./components/HorizontalTabs"); return {default:module.HorizontalTabs}; }, "Tabs", true, true);
const HttpAuthPrompt = deferSurface(async () => { const module = await import("./components/HttpAuthPrompt"); return {default:module.HttpAuthPrompt}; }, "Sign-in prompt", true, true);
const ActionConfirmation = deferSurface(async () => { const module = await import("./components/ActionConfirmation"); return {default:module.ActionConfirmation}; }, "Action confirmation", true, true);
const VaultOfferBanner = deferSurface(async () => { const module = await import("./components/VaultOfferBanner"); return {default:module.VaultOfferBanner}; }, "Password offer", true, true);
const FindBar = deferSurface<{ scope?: "reader"; inputRef?: RefObject<HTMLInputElement | null>; returnFocusRef?: RefObject<HTMLDivElement | null> }>(async () => { const module = await import("./components/FindBar"); return {default:module.FindBar}; }, "Find in page", true, true);
const Sidebar = deferSurface(async () => { const module = await import("./components/Sidebar"); return {default:module.Sidebar}; }, "Sidebar", true, true);
const ChatSidebar = deferSurface(async () => { const module = await import("./components/ChatSidebar"); return {default:module.ChatSidebar}; }, "Sidebar", true, true);
const AgentRail = deferSurface(async () => { const module = await import("./components/AgentRail"); return {default:module.AgentRail}; }, "Assistant", true, true);
const LinkPeek = deferSurface(async () => { const module = await import("./components/LinkPeek"); return {default:module.LinkPeek}; }, "Link preview", true, true);
const Onboarding = deferSurface(() => import("./onboarding/OnboardingHost"), "Setup", true, true);

/** Only the fields that decide native-view placement — title/favicon churn must not re-render the shell. */
const placementFields = (page?: PageTarget) => page && { pageId: page.pageId, url: page.url, backend: page.backend, viewStatus: page.viewStatus, navigationError: page.navigationError, showBlankDocument: page.showBlankDocument };

type Shortcut = { key: string; meta: boolean; shift: boolean; alt: boolean; ctrl?: boolean; commandId?: string };

export function App() {
  const [runNotice, setRunNotice] = useState<OwnerNotice | null>(null);
  const [noticePreference, setNoticePreference] = useState(readInAppNoticePreference);
  const notificationGate = useRef<RunNotificationGate | null>(null);
  if (!notificationGate.current) notificationGate.current = new RunNotificationGate({
    getRun: (runId) => call("runs.get", { runId }),
    emit: (notice) => deliverRunAttention(notice, { showInApp: setRunNotice,
      native: inNativeHost ? (payload) => bridge.showRunAttention(payload) : undefined,
      systemEnabled: readSystemTaskNotices(), focusMode: readTaskFocusMode(),
      windowFocused: document.hasFocus(), windowId: bridge.windowId }),
  });
  const foregroundRun = useStore((state) => foregroundRunId(state));
  useEffect(() => onInAppNoticePreferenceChange(() => {
    const current = readInAppNoticePreference();
    setNoticePreference(current);
    if (current === "off" || readTaskFocusMode()) setRunNotice(null);
  }), []);
  useEffect(() => {
    const off = bridge.onRunAttentionActivated(({ runId, identity, windowId }) => {
      if (bridge.privateMode || windowId !== bridge.windowId) return;
      void call("runs.get", { runId }).then((current) => {
        if (!matchesRunAttentionActivation(current, { runId, identity, windowId })) return;
        setRunNotice(null);
        useStore.getState().openConversation(runId);
        void bridge.focusShell().catch(() => {});
      }).catch(() => {});
    });
    return off;
  }, []);
  useEffect(() => {
    if (runNotice?.runId === foregroundRun && document.hasFocus()) setRunNotice(null);
  }, [foregroundRun, runNotice]);
  useEffect(() => {
    const check = () => {
      const current = foregroundRunId(useStore.getState());
      setRunNotice((notice) => notice?.runId === current ? null : notice);
    };
    window.addEventListener("focus", check);
    return () => window.removeEventListener("focus", check);
  }, []);
  useEffect(() => bootShellFeatures(), []);
  useEffect(() => installMemorySaver(), []);
  useEffect(() => recoverPeekLink(), []);
  useEffect(() => {
    const syncSettingsRoute = () => {
      const route = settingsRouteFromPath(window.location.pathname);
      if (route && !bridge.privateMode) {
        useStore.setState({ settingsCategory: route.category });
        if (useStore.getState().overlay !== "settings") useStore.getState().setOverlay("settings");
      } else if (useStore.getState().overlay === "settings") {
        useStore.getState().setOverlay(null);
      }
    };
    syncSettingsRoute();
    window.addEventListener("popstate", syncSettingsRoute);
    return () => window.removeEventListener("popstate", syncSettingsRoute);
  }, []);
  useEffect(() => preloadWhenIdle([Conversation, AnswerPreview, Palette, Downloads, SiteControls, FindBar, Sidebar, ChatSidebar, AgentRail]), []);
  useEffect(()=>{
    if(bridge.privateMode)return;
    const changed=(event:StorageEvent)=>{
      if(event.storageArea!==localStorage||!event.key||localStorage.getItem(event.key)!==event.newValue)return;
      const answer=runAnswerEntry(event.key,event.newValue);
      if(answer) {
        useStore.setState(state=>{const drafts={...state.runAnswerDrafts};if(answer.draft)drafts[answer.runId]=answer.draft;else delete drafts[answer.runId];return {runAnswerDrafts:drafts};});
        return;
      }
      const browserSources = browserSourcesEntryChange(event.key, event.newValue);
      if (browserSources) {
        useStore.setState(state => {
          const selected = { ...state.conversationBrowserSources };
          if (browserSources.sources.length) selected[browserSources.key] = browserSources.sources;
          else delete selected[browserSources.key];
          return { conversationBrowserSources: selected };
        });
        return;
      }
      const change=conversationEntryChange(event.key,event.newValue);
      if(!change)return;
      useStore.setState(state=>applyConversationStorageChange(state,change));
    };
    window.addEventListener("storage",changed);return()=>window.removeEventListener("storage",changed);
  },[]);
  const [quickAsk,setQuickAsk]=useState((bridge.windowKind === "quick-ask"));
  const [linkStatus,setLinkStatus]=useState<{pageId:string;text:string}|null>(null);
  const quickAskReady=useRef(false);
  const conversationComposer=useRef<HTMLTextAreaElement>(null);
  const conversationScroll=useRef<HTMLDivElement>(null);
  const findInput=useRef<HTMLInputElement>(null);
  const conversationId=useStore(state=>state.conversationId);
  const peekPageId=useStore(state=>state.peekPageId);
  const expandQuickAsk=()=>{
    const chatId=useStore.getState().conversationId;
    try{if(chatId)localStorage.setItem("aux.quick-ask.expand",chatId);}catch{}
    void bridge.quickAsk("expand").catch(error=>{
      try{if(localStorage.getItem("aux.quick-ask.expand")===chatId)localStorage.removeItem("aux.quick-ask.expand");}catch{}
      errToast(error);
    });
  };
  useEffect(()=>{
    if(bridge.windowKind !== "normal"||bridge.privateMode)return;
    let chatId:string|null=null;
    try{chatId=localStorage.getItem("aux.quick-ask.expand");if(chatId)localStorage.removeItem("aux.quick-ask.expand");}catch{}
    if(chatId&&/^[\w-]{1,128}$/.test(chatId))useStore.getState().openConversationDraft(chatId);
  },[]);
  useEffect(()=>{
    if(bridge.windowKind !== "quick-ask")return;
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
    if (action.windowId && action.windowId !== bridge.windowId) return;
    if (bridge.privateMode) return;
    if (action.action === "remember") {
      const state = useStore.getState();
      const space = state.layout.spaces.find(space => space.id === state.layout.activeSpaceId);
      if (!space?.workspaceId) { errToast(new Error("Choose a Space before saving memory.")); return; }
      const workspaceId = space.workspaceId, key = `item:${workspaceId}`;
      const openMemory = () => { useStore.setState({ memoryWorkspaceId: workspaceId, settingsCategory: "Memory" }); useStore.getState().setOverlay("settings"); };
      if (useMemoryDrafts.getState().drafts[key]) { openMemory(); errToast(new Error("Finish or discard the existing memory-note draft before remembering another selection.")); return; }
      void call("workspaces.memory.get", { workspaceId }).then(memory => {
        if (useMemoryDrafts.getState().drafts[key]) throw new Error("A memory-note draft was opened while loading. Your existing draft is preserved.");
        let sourceUrl = "";
        try { const url = new URL(action.url); if (["http:", "https:"].includes(url.protocol) && !url.username && !url.password && url.href.length <= 2048) sourceUrl = url.href; } catch { /* Non-web selections remain explicit unsourced notes. */ }
        useMemoryDrafts.getState().write(key, { revision: memory.revision, content: JSON.stringify({ itemId: crypto.randomUUID(), content: action.selection, sourceUrl, expires: "", selectionTruncated: action.truncated }) });
        if (useStore.getState().layout.activeSpaceId === space.id) openMemory();
        else toast(`Memory draft saved in ${space.name}. Open Memory settings to review it.`);
      }).catch(errToast);
      return;
    }
    void import("./selection-action-draft").then(({ prepareSelectionActionDraft }) => {
      // Resolve after loading so a navigation during the import cannot create a stale draft.
      const state = useStore.getState();
      const prepared = prepareSelectionActionDraft({ action, pages: state.pages,
        preferences: state.settings.selectionCapture, windowId: bridge.windowId,
        privateMode: bridge.privateMode });
      const id = crypto.randomUUID();
      state.setConversationContext(id, prepared.source.pageId);
      state.setConversationBrowserSources(id, [prepared.source]);
      state.setConversationDraft(id, prepared.draft);
      const open = () => {
        state.openConversationDraft(id);
        requestAnimationFrame(() => conversationComposer.current?.focus());
      };
      if (prepared.needsImage) {
        const image = action.image!;
        void call("conversations.images.add", { chatId: id, filename: "page-image.png",
          dataUrl: image.dataUrl!, sourceUrl: image.srcURL })
          .then(open)
          .catch(error => { open(); errToast(error instanceof Error ? error : new Error(String(error))); });
      } else open();
    }).catch(error => errToast(error instanceof Error ? error : new Error(String(error))));
  }), []);
  const mode = useStore((s) => s.mode);
  const overlay = useStore((s) => s.overlay);
  const organizationCovered = !!useOrganizationEditor();
  useEffect(() => {
    if (!organizationCovered) return;
    void bridge.overlay(true);
    return () => {
      const state = useStore.getState();
      void bridge.overlay(isScrimOverlay(state.overlay) || state.overlay === "zap" || !!state.confirmation);
    };
  }, [organizationCovered]);
  useEffect(()=>{if(quickAsk&&overlay)expandQuickAsk();},[quickAsk,overlay]);
  const railOpen = useStore((s) => s.railOpen);
  const sidebar = useStore((s) => s.sidebar);
  const sidebarPeek = useStore(s => s.sidebarPeek);
  const tabPreviewOpen = useStore(s => s.tabPreviewOpen);
  const settings = useStore(useShallow((s) => ({ tabLayout: s.settings.tabLayout, theme: s.settings.theme, sidebarAppearance: s.settings.sidebarAppearance, sidebarMaterial: s.settings.sidebarMaterial, sidebarTint: s.settings.sidebarTint, contentOpacity: s.settings.contentOpacity })));
  const horizontal = (settings.tabLayout ?? "horizontal") === "horizontal";
  const tabSwitcher = useRef(createTabSwitcher());
  const activePageId = useStore((s) => s.activePageId);
  const activePageEpoch = useStore((s) => s.pages.find((p) => p.pageId === s.activePageId)?.documentEpoch);
  const activePage = useStore(useShallow((s) => placementFields(s.activePageId ? s.pages.find((p) => p.pageId === s.activePageId) : undefined)));
  const { minimal, hideToolbar, layoutMotion, sidebarWidth } = useLayoutChrome();
  const pageChrome = inNativeHost && !quickAsk && (minimal || (!horizontal && hideToolbar && !!activePage && activePage.backend !== "chrome"
    && activePage.viewStatus !== "crashed" && !activePage.navigationError
    && (!!activePage.showBlankDocument || (!isHomeAddress(activePage.url)))));
  const toolbarReveal = useToolbarReveal(pageChrome, sidebarPeek, horizontal ? ".horizontal-chrome > .toolbar" : ".main-col > .toolbar");
  useWindowControls(minimal, toolbarReveal.revealed);
  const [toolbarHole, setToolbarHole] = useState(false);
  const [toolbarReady, setToolbarReady] = useState(false);
  const confirming = useStore(s => !!s.confirmation);
  const nativeShowing = !organizationCovered && !!nativePageId({ mode, overlay, confirming, activePageId, url: activePage?.url, backend: activePage?.backend, viewStatus: activePage?.viewStatus, navigationError: activePage?.navigationError, showBlankDocument: activePage?.showBlankDocument });
  const floatingSidebar = sidebarPeek && (minimal || sidebar !== "expanded");
  const [peekCovering, setPeekCovering] = useState(false);
  useEffect(() => {
    if (floatingSidebar) { setPeekCovering(true); return; }
    const timer = window.setTimeout(() => setPeekCovering(false), 150);
    return () => clearTimeout(timer);
  }, [floatingSidebar]);
  const sidebarCovering = (floatingSidebar || peekCovering) && nativeShowing;
  const surfaceCovered = useSurfaceCovering();
  const surfaceCovering = useFeature("splitView") && surfaceCovered && nativeShowing;
  const connected = useStore((s) => s.connected);
  const spaceColor = useStore((s) => (s.layout.spaces.find((space) => space.id === s.layout.activeSpaceId) ?? s.layout.spaces[0]!).color);
  const spaceGrain = useStore((s) => (s.layout.spaces.find((space) => space.id === s.layout.activeSpaceId) ?? s.layout.spaces[0]!).grain);
  const spaceTheme = useStore((s) => (s.layout.spaces.find((space) => space.id === s.layout.activeSpaceId) ?? s.layout.spaces[0]!).theme);
  const vaultOffer = useStore((s) => !!s.vaultOffer);
  const setOverlay = useStore((s) => s.setOverlay);

  useEffect(() => { applyUiFontSize(); }, []);

  // Raise the shell over the native page before the bar animates.
  useEffect(() => {
    const covering = organizationCovered || toolbarReveal.covering || tabPreviewOpen || sidebarCovering || surfaceCovering;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setToolbarReady(covering);
      if (!covering) setToolbarHole(false);
    });
    return () => { active = false; };
  }, [organizationCovered, toolbarReveal.covering, tabPreviewOpen, sidebarCovering, surfaceCovering]);

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
      if (inNativeHost) void bridge.setAppearance(settings.theme === "system" ? "system" : theme, glass, true, material).catch(errToast);
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
    let active=true,checkingDrafts=false;
    const reconcileDrafts=async()=>{
      if(!active||checkingDrafts||!useStore.getState().connected)return;
      checkingDrafts=true;
      try { await reconcileResultDrafts(async drafts=>call("results.available",{drafts})); }
      catch(reason) { if(String(reason).includes("could not be removed"))errToast(reason); }
      finally { checkingDrafts=false; }
    };
    void useStore.getState().refresh().then(reconcileDrafts);
    const offEvent = bridge.onEvent((e) => {
      const candidate = (e.type === "run.status" || e.type === "run.updated") ? e.payload.run as Run | undefined : undefined;
      const previous = candidate ? useStore.getState().runs.find((run) => run.runId === candidate.runId) : undefined;
      useStore.getState().applyEvent(e);
      if (candidate && !bridge.privateMode && useStore.getState().runs.find((run) => run.runId === candidate.runId)?.status === candidate.status) {
        void notificationGate.current?.consider(previous, candidate, () => {
          const state = useStore.getState();
          return { preference: readInAppNoticePreference(), focusMode: readTaskFocusMode(),
            windowFocused: document.hasFocus(), foregroundRunId: foregroundRunId(state) };
        }).catch(() => {});
      }
      if(e.type==="workspace.contentMemory.updated")void reconcileDrafts();
    });
    const offTabs = bridge.onTabsPatch(patch => useStore.getState().applyTabsPatch(patch));
    const offPlacement = bridge.onTabsPlacement(payload => useStore.getState().applyTabsPlacement(payload));
    const offRuntime = bridge.onRuntimeStatus(status => {
      useStore.setState({ connected: status.connected });
      if (status.connected) void useStore.getState().refresh().then(reconcileDrafts);
    });
    const offLoading = bridge.onLoading(({ pageId, loading }) => {
      patchPageFields(pageId, { loading });
      if (loading) setLinkStatus(current => current?.pageId === pageId ? null : current);
    });
    const offLinkStatus = bridge.onLinkStatus(payload => setLinkStatus(payload.text ? payload : null));
    let audioLive=true;
    const changedAudio=new Set<string>();
    const offAudio=bridge.onAudio(({pageId,removed,...state})=>{changedAudio.add(pageId);useStore.setState(current=>{const tabAudio={...current.tabAudio};if(removed)delete tabAudio[pageId];else tabAudio[pageId]=state;return {tabAudio};});});
    void bridge.tabAudio().then(snapshot=>{if(audioLive)useStore.setState(current=>({tabAudio:{...Object.fromEntries(Object.entries(snapshot).filter(([id])=>!changedAudio.has(id))),...Object.fromEntries(Object.entries(current.tabAudio).filter(([id])=>changedAudio.has(id)))}}));}).catch(()=>{});
    const projectedDownloads = new Set<string>();
    const offDownload = bridge.onDownload((d) => {
      useStore.getState().applyDownload(d as never);
      if (!inNativeHost || !d.tabUrl || !d.downloadRoot || !d.path) return;
      const terminal = d.state === "completed" || d.state === "interrupted" || d.state === "cancelled";
      if (!terminal && projectedDownloads.has(d.id)) return;
      projectedDownloads.add(d.id);
      void call("downloads.projectNative", { ...d, tabUrl: d.tabUrl, downloadRoot: d.downloadRoot })
        .catch(error => console.warn("Native download receipt projection failed", error));
    });
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
      active=false;
      offEvent();
      offTabs();
      offPlacement();
      offRuntime();
      offLoading();
      offLinkStatus();
      offDownload();audioLive=false;offAudio();
      offShortcut();
      offVault();
      offTranslation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const dispatchShortcut = (shortcut: Shortcut) => dispatchCommandShortcut(shortcut, {findInput, tabSwitcher: tabSwitcher.current});

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

  if (inNativeHost && (organizationCovered || toolbarReveal.covering || tabPreviewOpen || sidebarCovering || surfaceCovering) && !toolbarHole) setToolbarHole(true);
  if (bridge.windowKind === "little") return <LittleWindow />;
  if (quickAsk) return <QuickAsk onExpand={expandQuickAsk}/>;
  return (
    <div
      className={`app ${layoutMotion ? "layout-motion" : ""} ${minimal ? "minimal-ui" : ""} ${!hideToolbar ? "toolbar-persistent" : ""} ${toolbarReveal.revealed ? "layout-toolbar-revealed" : ""} tabs-${horizontal ? "horizontal" : "vertical"} ${inNativeHost ? "native-host" : ""} layout-${sidebar as SidebarMode} ${sidebarPeek ? "sidebar-peek" : ""} ${toolbarHole ? "toolbar-stacked" : ""} ${railOpen ? "rail-open" : ""}`}
      style={{ "--sb-w": `${sidebarWidth}px`, "--space-grain": spaceGrain, ...spaceThemeStyle({ theme: spaceTheme }) } as React.CSSProperties}
      data-overlay={overlay ?? undefined}
      onKeyDown={(e) => {
        if (!inNativeHost || e.defaultPrevented || (e.key !== "ContextMenu" && !(e.key === "F10" && e.shiftKey))) return;
        const el = e.target as HTMLElement;
        if (el.closest(".sidebar, .rail, .menu, input, textarea, [contenteditable]")) return;
        e.preventDefault();
        e.stopPropagation();
        void bridge.contextMenu(useStore.getState().activePageId);
      }}
      onContextMenu={(e) => {
        if (!inNativeHost || e.defaultPrevented) return;
        const el = e.target as HTMLElement;
        if (el.closest(".sidebar, .rail, .menu")) return; // those own their menus
        if (el.closest("input, textarea, [contenteditable]")) return;
        e.preventDefault();
        void bridge.contextMenu(useStore.getState().activePageId);
      }}
    >
      {!connected && !bridge.privateMode && (
        <output className="degraded" data-block aria-live="polite">
          {I.alert}
          <span>Runtime reconnecting — tabs keep working</span>
        </output>
      )}
      {horizontal && <div className="horizontal-chrome" inert={minimal && !toolbarReveal.revealed} aria-hidden={minimal && !toolbarReveal.revealed}><button className="chat-sidebar-toggle icon-btn" aria-label={sidebar === "expanded" ? "Hide sidebar" : "Show sidebar"} aria-expanded={sidebar === "expanded"} title={sidebar === "expanded" ? "Hide sidebar" : "Show sidebar"} data-command-id="sidebar" onClick={() => runCommand("sidebar")}>{I.sidebarOpen}</button><HorizontalTabs /><Toolbar /></div>}
      <div className="app-body">
        {horizontal ? <ChatSidebar minimal={minimal} /> : <Sidebar minimal={minimal} />}
        <div className={`main-col${nativeShowing ? " has-page" : ""}${mode === "conversation" ? " conversation-open" : ""}${toolbarReveal.revealed && toolbarReady ? " toolbar-revealed" : ""}`}>
          {!horizontal && <Toolbar hidden={minimal && !toolbarReveal.revealed} />}
          <div className="main">
            <div className="stage-wrap">
              {overlay === "find" && <FindBar inputRef={findInput} returnFocusRef={conversationScroll} />}
              <Stage composerRef={conversationComposer} scrollRef={conversationScroll} />
              {nativeShowing && linkStatus?.pageId === activePageId && <output className="link-status" aria-label="Link destination">{linkStatus.text}</output>}
              {overlay === "reader" && <ReaderView />}
              {peekPageId && <LinkPeek />}
              {overlay === "settings" && <Settings />}
              {overlay === "tasks" && <Tasks />}
              {overlay === "downloads" && <Downloads />}
              {overlay === "inline-assist" && <InlineAssist />}
            </div>
          </div>
        </div>
        {!bridge.privateMode && railOpen && <PaneBoundary label="The assistant"><AgentRail /></PaneBoundary>}
      </div>
      {overlay === "palette" && !bridge.privateMode && <Palette />}
      {(overlay === "history" || overlay === "bookmarks" || overlay === "clear-history") && <Library key={overlay} initialView={overlay === "bookmarks" ? "bookmarks" : "history"} confirmClear={overlay === "clear-history"} />}
      {overlay === "observe" && <Inspector />}
      {overlay === "site" && <SiteControls />}
      {overlay === "zap" && <SiteCustomization key={`${activePageId}:${activePage?.url}:${activePageEpoch}`} />}
      <HttpAuthPrompt />
      <ActionConfirmation />
      {vaultOffer && <VaultOfferBanner />}
      <FeatureSlots slot="overlays" />
      <Toasts />
      <Onboarding />
      {runNotice && noticePreference === "all" && !confirming && !overlay
        && (!document.hasFocus() || foregroundRun !== runNotice.runId) &&
        <RunNoticeBanner notice={runNotice} onDismiss={() => setRunNotice(null)}
          onReview={(runId) => { setRunNotice(null); useStore.getState().openConversation(runId); }} />}
      <BrowsingMemoryWatch />
    </div>
  );
}
