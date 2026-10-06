import { useRunAttention } from "./app/use-run-attention";
import { useNativeObservers } from "./app/use-native-observers";
import { useSettingsRoute } from "./app/use-settings-route";
import { useDraftStorageSync } from "./app/use-draft-storage-sync";
import { useQuickAsk } from "./app/use-quick-ask";
import { usePageActions } from "./app/use-page-actions";
import { useShellAppearance } from "./app/use-shell-appearance";
import { useMockRailScenario } from "./app/use-mock-rail-scenario";
import { useNarrowLayout } from "./app/use-narrow-layout";
import { useWorkspaceEvents } from "./app/use-workspace-events";
import { usePageStatus } from "./app/use-page-status";
import { useTabAudio } from "./app/use-tab-audio";
import { useDownloadEvents } from "./app/use-download-events";
import { usePageOffers } from "./app/use-page-offers";
import { useShellShortcuts } from "./app/use-shell-shortcuts";

import { useOrganizationEditor } from "./features/organization-state";
import { useFeature } from "./use-feature";
import { useSurfaceCovering } from "./features/surfaces/drag-state";
import { FeatureSlots } from "./features/registry";
import { runCommand, executeCommand } from "./commands";
import { useCommandSurfaceRequest } from "./command-surface-state";

import { PaneBoundary } from "./components/PaneBoundary";

import { BrowsingMemoryWatch } from "./use-browsing-memory";

import { deferSurface, deferNamedSurface, preloadWhenIdle } from "./components/DeferredSurface";
import { Conversation, AnswerPreview } from "./components/surfaces";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import type { PageTarget } from "@aux/contracts";
import { useStore, type SidebarMode } from "./store";
import { bridge, inNativeHost } from "./bridge";

import { isHomeAddress, isScrimOverlay, nativePageId } from "./chrome";
import { useLayoutChrome, useWindowControls } from "./features/layout/layout";
import { useToolbarReveal } from "./toolbar-reveal";
import { spaceThemeStyle } from "./workspace";

import { Toolbar } from "./components/Toolbar";
import { Stage } from "./components/Stage";
import { shellIconAlert, shellIconSidebarOpen } from "./components/icons";
import { SidebarReveal } from "./components/SidebarReveal";
import { Toasts } from "./components/Toasts";

import { RunNoticeBanner } from "./agent/RunNoticeControls";
import { nativePoliteLiveProps } from "./ui/native-attribute-props";

const ReaderView = deferNamedSurface(() => import("./components/ReaderView"), "ReaderView", "Reader");
const Settings = deferNamedSurface(() => import("./components/Settings"), "Settings", "Settings");
const Library = deferNamedSurface(() => import("./components/Library"), "Library", "Library");
const Inspector = deferNamedSurface(() => import("./components/Inspector"), "Inspector", "Page inspection");
const Tasks = deferNamedSurface(() => import("./components/Tasks"), "Tasks", "Tasks");
const CommandSurface = deferNamedSurface(
  () => import("./components/CommandSurface"),
  "CommandSurface",
  "Command surface",
);
const Downloads = deferNamedSurface(() => import("./components/Downloads"), "Downloads", "Downloads");
const InlineAssist = deferNamedSurface(
  () => import("./components/InlineAssist"),
  "InlineAssist",
  "Assist writing",
);
const SiteControls = deferNamedSurface(
  () => import("./components/SiteControls"),
  "SiteControls",
  "Site controls",
);
const SiteCustomization = deferNamedSurface(
  () => import("./components/SiteCustomization"),
  "SiteCustomization",
  "Site customization",
);
const LittleWindow = deferNamedSurface(
  () => import("./components/LittleWindow"),
  "LittleWindow",
  "Little window",
  true,
  true,
);
const QuickAsk = deferNamedSurface(
  () => import("./components/QuickAsk"),
  "QuickAsk",
  "Quick Ask",
  true,
  true,
);
const HorizontalTabs = deferNamedSurface(
  () => import("./components/HorizontalTabs"),
  "HorizontalTabs",
  "Tabs",
  true,
  true,
);
const HttpAuthPrompt = deferNamedSurface(
  () => import("./components/HttpAuthPrompt"),
  "HttpAuthPrompt",
  "Sign-in prompt",
  true,
  true,
);
const ActionConfirmation = deferNamedSurface(
  () => import("./components/ActionConfirmation"),
  "ActionConfirmation",
  "Action confirmation",
  true,
  true,
);
const VaultOfferBanner = deferNamedSurface(
  () => import("./components/VaultOfferBanner"),
  "VaultOfferBanner",
  "Password offer",
  true,
  true,
);
const FindBar = deferNamedSurface(
  () => import("./components/FindBar"),
  "FindBar",
  "Find in page",
  true,
  true,
);
const Sidebar = deferNamedSurface(() => import("./components/Sidebar"), "Sidebar", "Sidebar", true, true);
const ChatSidebar = deferNamedSurface(
  () => import("./components/ChatSidebar"),
  "ChatSidebar",
  "Sidebar",
  true,
  true,
);
const AgentRail = deferNamedSurface(
  () => import("./components/AgentRail"),
  "AgentRail",
  "Assistant",
  true,
  true,
);
const LinkPeek = deferNamedSurface(
  () => import("./components/LinkPeek"),
  "LinkPeek",
  "Link preview",
  true,
  true,
);
const Onboarding = deferSurface(() => import("./onboarding/OnboardingHost"), "Setup", true, true);

/** Only the fields that decide native-view placement — title/favicon churn must not re-render the shell. */
const placementFields = (page?: PageTarget) =>
  page && {
    pageId: page.pageId,
    url: page.url,
    backend: page.backend,
    viewStatus: page.viewStatus,
    navigationError: page.navigationError,
    showBlankDocument: page.showBlankDocument,
  };

export function App() {
  const { runNotice, setRunNotice, noticePreference, foregroundRun, notificationGate } = useRunAttention();
  useNativeObservers();
  useSettingsRoute();
  useDraftStorageSync();
  useEffect(
    () =>
      preloadWhenIdle([
        Conversation,
        AnswerPreview,
        CommandSurface,
        Downloads,
        SiteControls,
        FindBar,
        Sidebar,
        ChatSidebar,
        AgentRail,
      ]),
    [],
  );
  const conversationComposer = useRef<HTMLTextAreaElement>(null);
  const conversationScroll = useRef<HTMLDivElement>(null);
  const findInput = useRef<HTMLInputElement>(null);
  const peekPageId = useStore((state) => state.peekPageId);
  const mode = useStore((s) => s.mode);
  const overlay = useStore((s) => s.overlay);
  const commandSurface = useCommandSurfaceRequest();
  const { quickAsk, expandQuickAsk } = useQuickAsk(overlay);
  usePageActions(conversationComposer);
  const organizationCovered = !!useOrganizationEditor();
  useEffect(() => {
    if (!organizationCovered) return;
    void bridge.overlay(true);
    return () => {
      const state = useStore.getState();
      void bridge.overlay(isScrimOverlay(state.overlay) || state.overlay === "zap" || !!state.confirmation);
    };
  }, [organizationCovered]);
  const railOpen = useStore((s) => s.railOpen);
  const sidebar = useStore((s) => s.sidebar);
  const sidebarPeek = useStore((s) => s.sidebarPeek);
  const tabPreviewOpen = useStore((s) => s.tabPreviewOpen);
  const settings = useStore(
    useShallow((s) => ({
      tabLayout: s.settings.tabLayout,
      theme: s.settings.theme,
      sidebarAppearance: s.settings.sidebarAppearance,
      sidebarMaterial: s.settings.sidebarMaterial,
      sidebarTint: s.settings.sidebarTint,
      contentOpacity: s.settings.contentOpacity,
    })),
  );
  const horizontal = (settings.tabLayout ?? "vertical") === "horizontal";
  const activePageId = useStore((s) => s.activePageId);
  const activePageEpoch = useStore((s) => s.pages.byId[s.activePageId ?? ""]?.documentEpoch);
  const activePage = useStore(
    useShallow((s) => placementFields(s.activePageId ? s.pages.byId[s.activePageId ?? ""] : undefined)),
  );
  const { minimal, hideToolbar, layoutMotion, sidebarWidth } = useLayoutChrome();
  const pageChrome =
    inNativeHost &&
    !quickAsk &&
    (minimal ||
      (!horizontal &&
        hideToolbar &&
        !!activePage &&
        activePage.backend !== "chrome" &&
        activePage.viewStatus !== "crashed" &&
        !activePage.navigationError &&
        (!!activePage.showBlankDocument || !isHomeAddress(activePage.url))));
  const toolbarReveal = useToolbarReveal(
    pageChrome,
    sidebarPeek,
    horizontal ? ".horizontal-chrome > .toolbar" : ".main-col > .toolbar",
  );
  useWindowControls(minimal, toolbarReveal.revealed);
  const [toolbarHole, setToolbarHole] = useState(false);
  const [toolbarReady, setToolbarReady] = useState(false);
  const confirming = useStore((s) => !!s.confirmation);
  const nativeShowing =
    !organizationCovered &&
    !!nativePageId({
      mode,
      overlay,
      confirming,
      activePageId,
      url: activePage?.url,
      backend: activePage?.backend,
      viewStatus: activePage?.viewStatus,
      navigationError: activePage?.navigationError,
      showBlankDocument: activePage?.showBlankDocument,
    });
  const toolbarHidden = (minimal || (pageChrome && nativeShowing)) && !toolbarReveal.revealed;
  const floatingSidebar = sidebarPeek && (minimal || sidebar !== "expanded");
  const [peekCovering, setPeekCovering] = useState(false);
  useEffect(() => {
    if (floatingSidebar) {
      setPeekCovering(true);
      return;
    }
    const timer = window.setTimeout(() => setPeekCovering(false), 150);
    return () => clearTimeout(timer);
  }, [floatingSidebar]);
  const sidebarCovering = (floatingSidebar || peekCovering) && nativeShowing;
  const surfaceCovered = useSurfaceCovering();
  const surfaceCovering = useFeature("splitView") && surfaceCovered && nativeShowing;
  const connected = useStore((s) => s.connected);
  const spaceColor = useStore(
    (s) =>
      (s.layout.spaces.find((space) => space.id === s.layout.activeSpaceId) ?? s.layout.spaces[0]!).color,
  );
  const spaceGrain = useStore(
    (s) =>
      (s.layout.spaces.find((space) => space.id === s.layout.activeSpaceId) ?? s.layout.spaces[0]!).grain,
  );
  const spaceTheme = useStore(
    (s) =>
      (s.layout.spaces.find((space) => space.id === s.layout.activeSpaceId) ?? s.layout.spaces[0]!).theme,
  );
  const vaultOffer = useStore((s) => !!s.vaultOffer);

  // Raise the shell over the native page before the bar animates.
  useEffect(() => {
    const covering =
      organizationCovered || toolbarReveal.covering || tabPreviewOpen || sidebarCovering || surfaceCovering;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setToolbarReady(covering);
      if (!covering) setToolbarHole(false);
    });
    return () => {
      active = false;
    };
  }, [organizationCovered, toolbarReveal.covering, tabPreviewOpen, sidebarCovering, surfaceCovering]);

  useShellAppearance(settings, spaceColor);
  // The window background clears with the shell layers, so <html> carries the same state before paint.
  useLayoutEffect(() => {
    const root = document.documentElement.classList;
    root.toggle("toolbar-stacked", toolbarHole);
    root.toggle("sidebar-peek", sidebarPeek);
  }, [toolbarHole, sidebarPeek]);

  useMockRailScenario();
  useNarrowLayout();
  useWorkspaceEvents(notificationGate);
  const linkStatus = usePageStatus();
  useTabAudio();
  useDownloadEvents();
  useShellShortcuts(findInput);
  usePageOffers();

  if (
    inNativeHost &&
    (organizationCovered || toolbarReveal.covering || tabPreviewOpen || sidebarCovering || surfaceCovering) &&
    !toolbarHole
  )
    setToolbarHole(true);
  if (bridge.windowKind === "little") return <LittleWindow />;
  if (quickAsk) return <QuickAsk onExpand={expandQuickAsk} />;
  const sidebarToggle = (
    <button
      className="chat-sidebar-toggle icon-btn"
      aria-label={sidebar === "expanded" ? "Hide sidebar" : "Show sidebar"}
      aria-expanded={sidebar === "expanded"}
      title={sidebar === "expanded" ? "Hide sidebar" : "Show sidebar"}
      data-command-id="sidebar"
      onClick={() => runCommand("sidebar")}
    >
      {shellIconSidebarOpen}
    </button>
  );
  return (
    <div
      className={`app ${layoutMotion ? "layout-motion" : ""} ${minimal ? "minimal-ui" : ""} ${!hideToolbar ? "toolbar-persistent" : ""} ${toolbarReveal.revealed ? "layout-toolbar-revealed" : ""} tabs-${horizontal ? "horizontal" : "vertical"} ${inNativeHost ? "native-host" : ""} layout-${sidebar as SidebarMode} ${sidebarPeek ? "sidebar-peek" : ""} ${toolbarHole ? "toolbar-stacked" : ""} ${railOpen ? "rail-open" : ""}`}
      style={
        {
          "--sb-w": `${sidebarWidth}px`,
          "--space-grain": spaceGrain,
          ...spaceThemeStyle({ theme: spaceTheme }),
        } as React.CSSProperties
      }
      data-overlay={overlay ?? undefined}
      onKeyDown={(e) => {
        if (
          !inNativeHost ||
          e.defaultPrevented ||
          (e.key !== "ContextMenu" && !(e.key === "F10" && e.shiftKey))
        )
          return;
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
        <output className="degraded" data-block {...nativePoliteLiveProps}>
          {shellIconAlert}
          <span>Runtime reconnecting — tabs keep working</span>
        </output>
      )}
      {horizontal && (
        <div
          className="horizontal-chrome"
          inert={minimal && !toolbarReveal.revealed}
          aria-hidden={minimal && !toolbarReveal.revealed}
        >
          {nativeShowing && sidebarToggle}
          <HorizontalTabs />
          <Toolbar />
        </div>
      )}
      <SidebarReveal
        minimal={minimal}
        horizontal={horizontal}
        hidden={sidebar === "hidden"}
        toolbarHidden={toolbarHidden}
        peek={sidebarPeek}
      />
      <div className="app-body">
        {horizontal ? <ChatSidebar minimal={minimal} /> : <Sidebar minimal={minimal} />}
        <div
          className={`main-col${nativeShowing ? " has-page" : ""}${mode === "conversation" ? " conversation-open" : ""}${toolbarReveal.revealed && toolbarReady ? " toolbar-revealed" : ""}`}
        >
          {horizontal && !nativeShowing && sidebarToggle}
          {!horizontal && <Toolbar hidden={toolbarHidden} />}
          <div className="main">
            <div className="stage-wrap">
              {overlay === "find" && <FindBar inputRef={findInput} returnFocusRef={conversationScroll} />}
              <Stage composerRef={conversationComposer} scrollRef={conversationScroll} />
              {nativeShowing && linkStatus?.pageId === activePageId && (
                <output className="link-status" aria-label="Link destination">
                  {linkStatus.text}
                </output>
              )}
              {overlay === "reader" && <ReaderView />}
              {peekPageId && <LinkPeek />}
              {overlay === "settings" && <Settings />}
              {overlay === "tasks" && <Tasks />}
              {overlay === "downloads" && <Downloads />}
              {overlay === "inline-assist" && <InlineAssist />}
            </div>
          </div>
        </div>
        {!bridge.privateMode && railOpen && (
          <PaneBoundary label="The assistant">
            <AgentRail />
          </PaneBoundary>
        )}
      </div>
      {commandSurface && (
        <CommandSurface
          key={commandSurface.sequence}
          request={commandSurface}
          executeCommand={executeCommand}
        />
      )}
      {(overlay === "history" || overlay === "bookmarks" || overlay === "clear-history") && (
        <Library
          key={overlay}
          initialView={overlay === "bookmarks" ? "bookmarks" : "history"}
          confirmClear={overlay === "clear-history"}
        />
      )}
      {overlay === "observe" && <Inspector />}
      {overlay === "site" && <SiteControls />}
      {overlay === "zap" && (
        <SiteCustomization key={`${activePageId}:${activePage?.url}:${activePageEpoch}`} />
      )}
      <HttpAuthPrompt />
      <ActionConfirmation />
      {vaultOffer && <VaultOfferBanner />}
      <FeatureSlots slot="overlays" />
      <Toasts />
      <Onboarding />
      {runNotice &&
        noticePreference === "all" &&
        !confirming &&
        !overlay &&
        (!document.hasFocus() || foregroundRun !== runNotice.runId) && (
          <RunNoticeBanner
            notice={runNotice}
            onDismiss={() => setRunNotice(null)}
            onReview={(runId) => {
              setRunNotice(null);
              useStore.getState().openConversation(runId);
            }}
          />
        )}
      <BrowsingMemoryWatch />
    </div>
  );
}
