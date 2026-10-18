import type { MemoryView } from "../settings/routes";
import { CloudExecution } from "../settings/sections/CloudExecution";
import { lazySection } from "../settings/LazySettingsSection";
import { staticIconButtonProps } from "../ui/class-props";
import { staticHintProps } from "../ui/class-props";
import { FeatureSettings, featureSettingsAvailable } from "../features/registry";
import "./Settings.css";
import "../settings/shell.css";
import "../settings/controls.css";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useStore, call, errToast } from "../store";

import { shellIconBack, shellIconCheck, shellIconClose } from "../ui/icons";

import { searchSettings, type SettingsDestination } from "../settings-search";
import { collectSettingsFields } from "../settings/search";
import { focusSettingsDestination } from "../settings/search-focus";

import { bridge, inNativeHost } from "../bridge";
import { SettingsNav } from "../settings/SettingsNav";
import { SettingsShell } from "../settings/SettingsShell";
import {
  pushSettingsPath,
  settingsPath,
  settingsRouteFromPath,
  type ConnectionTab,
  type SettingsRoute,
} from "../settings/routes";
import { availableForFocus, ownsFocus } from "../ui/focus";
import { moveListFocus } from "../keyboard-list";
import { useFeature } from "../use-feature";
import { featureAvailable } from "../feature-availability";
import { staticSpacerProps as auxClassSpacerProps } from "../ui/class-props";

const LabsSettings = lazySection(async () => (await import("../settings/sections/Labs")).LabsSettings);
const MemorySettings = lazySection(async () => (await import("./MemorySettings")).MemorySettings);
const ExternalAgents = lazySection(async () => (await import("./ExternalAgents")).ExternalAgents);
const PluginsPanel = lazySection(async () => (await import("./PluginsPanel")).PluginsPanel);
const Extensions = lazySection(async () => (await import("./Extensions")).Extensions);
const VaultSettings = lazySection(async () => (await import("./VaultSettings")).VaultSettings);
const CalendarConnections = lazySection(
  async () => (await import("./CalendarConnections")).CalendarConnections,
);
const ReviewedConnectors = lazySection(async () => (await import("./ReviewedConnectors")).ReviewedConnectors);
const AppearanceSettings = lazySection(
  async () => (await import("../settings/sections/Appearance")).AppearanceSettings,
);
const PermissionsSettings = lazySection(
  async () => (await import("../settings/sections/Permissions")).PermissionsSettings,
);
const PrivacySecuritySettings = lazySection(
  async () => (await import("../settings/sections/PrivacySecurity")).PrivacySecuritySettings,
);
const PasswordsAutofillSettings = lazySection(
  async () => (await import("../settings/sections/PasswordsAutofill")).PasswordsAutofillSettings,
);
const ModelsOverview = lazySection(
  async () => (await import("../settings/sections/ModelsOverview")).ModelsOverview,
);
const UsageBudgetsSettings = lazySection(
  async () => (await import("../settings/sections/UsageBudgets")).UsageBudgetsSettings,
);
const RoutinesSettings = lazySection(
  async () => (await import("../settings/sections/Routines")).RoutinesSettings,
);
const ChannelsSettings = lazySection(async () => (await import("../settings/sections/Channels")).ChannelsSettings);
const WorkspacesSettings = lazySection(
  async () => (await import("../settings/sections/Workspaces")).WorkspacesSettings,
);
const QuickAskSettings = lazySection(
  async () => (await import("../settings/sections/QuickAsk")).QuickAskSettings,
);
const SelectionCaptureSettings = lazySection(
  async () => (await import("../settings/sections/SelectionCapture")).SelectionCaptureSettings,
);
const ArchivedChatsSettings = lazySection(
  async () => (await import("../settings/sections/ArchivedChats")).ArchivedChatsSettings,
);
const GeneralSettings = lazySection(
  async () => (await import("../settings/sections/General")).GeneralSettings,
);
const ProfilesSettings = lazySection(
  async () => (await import("../settings/sections/Profiles")).ProfilesSettings,
);

const connectionCategories = ["Models", "Connections", "External agents", "Vault"];
export function Settings() {
  const [refreshVersion, setRefreshVersion] = useState(0);
  useEffect(() => {
    const refresh = () => setRefreshVersion((value) => value + 1);
    window.addEventListener("aux-settings-refresh", refresh);
    return () => window.removeEventListener("aux-settings-refresh", refresh);
  }, []);
  const settings = useStore((s) => s.settings);
  const memoryAvailable = useFeature("memory");
  const downloadNamingAvailable = useFeature("smartDownloadNames") && inNativeHost && !bridge.privateMode;
  const profilesAvailable = useFeature("profiles") && inNativeHost && !bridge.privateMode;
  const linkRoutingAvailable = useFeature("linkRouting") && inNativeHost && !bridge.privateMode;
  const appleScriptAvailable = useFeature("appleScript") && inNativeHost && !bridge.privateMode;
  const skillsAvailable = useFeature("skills");
  const automationsFeatureAvailable = useFeature("automations");
  const automationsAvailable =
    automationsFeatureAvailable ||
    featureSettingsAvailable(
      "Routines",
      settings.featureOverrides as import("@aux/contracts").FeatureOverride | undefined,
    );
  const outboundMcpAvailable = useFeature("outboundMcp");
  const connectorsAvailable = useFeature("connectors");
  const pluginsAvailable = skillsAvailable || outboundMcpAvailable;
  const servicesAvailable =
    connectorsAvailable ||
    featureSettingsAvailable(
      "Connections",
      settings.featureOverrides as import("@aux/contracts").FeatureOverride | undefined,
    );
  const permissionsAvailable = useFeature("sitePermissions");
  const vaultAvailable = useFeature("vault");
  const extensionsAvailable = useFeature("extensions");
  const routeEnabled = (route: SettingsRoute) =>
    (route.category !== "Memory" || memoryAvailable) &&
    (route.category !== "Downloads" || downloadNamingAvailable) &&
    (route.category !== "Profiles" || profilesAvailable) &&
    (route.category !== "Link Routing" || linkRoutingAvailable) &&
    (route.category !== "Advanced" || appleScriptAvailable) &&
    (route.category !== "Site permissions" || permissionsAvailable) &&
    (route.category !== "Extensions" || extensionsAvailable) &&
    (route.category !== "Routines" || automationsAvailable) &&
    (route.connectionTab !== "Vault" || vaultAvailable) &&
    (route.connectionTab !== "Plugins" || pluginsAvailable) &&
    (route.connectionTab !== "Services" || servicesAvailable);
  const [requestedRoute] = useState(() => settingsRouteFromPath(window.location.pathname));
  const initialRoute = requestedRoute && routeEnabled(requestedRoute) ? requestedRoute : null;
  const [initialCategory] = useState(() =>
    requestedRoute ? (initialRoute?.category ?? "General") : useStore.getState().settingsCategory,
  );
  const [category, setCategory] = useState(() =>
    (initialCategory === "Memory" && !memoryAvailable) ||
    (initialCategory === "Downloads" && !downloadNamingAvailable) ||
    (initialCategory === "Profiles" && !profilesAvailable) ||
    (initialCategory === "Link Routing" && !linkRoutingAvailable) ||
    (initialCategory === "Advanced" && !appleScriptAvailable) ||
    (initialCategory === "Site permissions" && !permissionsAvailable) ||
    (initialCategory === "Extensions" && !extensionsAvailable) ||
    (initialCategory === "Routines" && !automationsAvailable) ||
    (initialCategory === "Vault" && !vaultAvailable)
      ? "General"
      : connectionCategories.includes(initialCategory)
        ? "Connections"
        : initialCategory,
  );
  const [connectionTab, setConnectionTab] = useState<ConnectionTab>(
    initialRoute?.connectionTab ??
      (initialCategory === "External agents"
        ? "Agents"
        : initialCategory === "Connections"
          ? servicesAvailable
            ? "Services"
            : "Models"
          : initialCategory === "Vault" && vaultAvailable
            ? "Vault"
            : "Models"),
  );
  const [memoryView, setMemoryView] = useState<MemoryView>(initialRoute?.memoryView ?? "overview");
  const [subview, setSubview] = useState<string | null>(null);
  const subviewOrigin = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!initialRoute) {
      if (requestedRoute) window.history.replaceState(null, "", settingsPath(category, connectionTab));
      else pushSettingsPath(category, connectionTab);
    }
    const onRouteChange = () => {
      const route = settingsRouteFromPath(window.location.pathname);
      if (!route) return;
      if (!routeEnabled(route)) {
        window.history.replaceState(null, "", settingsPath("General"));
        setCategory("General");
        setConnectionTab("Services");
        setSubview(null);
        setQuery("");
        return;
      }
      setCategory(route.category);
      setMemoryView(route.memoryView ?? "overview");
      setConnectionTab(route.connectionTab ?? "Services");
      setSubview(null);
      setQuery("");
    };
    window.addEventListener("popstate", onRouteChange);
    return () => {
      window.removeEventListener("popstate", onRouteChange);
      if (settingsRouteFromPath(window.location.pathname)) window.history.replaceState(null, "", "/");
    };
    // The opening route is captured once; subsequent changes come from popstate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function openCategory(name: string, tabOverride?: ConnectionTab) {
    setMemoryView("overview");
    setSubview(null);
    setCategory(connectionCategories.includes(name) ? "Connections" : name);
    const nextTab =
      tabOverride ??
      (name === "Models"
        ? "Models"
        : name === "External agents"
          ? "Agents"
          : name === "Vault"
            ? "Vault"
            : servicesAvailable
              ? "Services"
              : "Models");
    if (connectionCategories.includes(name)) setConnectionTab(nextTab);
    pushSettingsPath(name, nextTab);
  }
  const [query, setQuery] = useState("");
  const sectionTitle =
    category === "Connections"
      ? (
          {
            Models: "Models",
            Services: "Connected services",
            Agents: "Developers",
            Vault: "Vault",
            Plugins: "Skills & MCP",
          } as const
        )[connectionTab]
      : category === "Memory"
        ? {
            overview: "Memory",
            history: "Memory history",
            context: "Context awareness",
            configure: "Configure memories",
          }[memoryView]
        : category === "Site permissions"
          ? "Privacy & Security"
          : category === "Permissions"
            ? "Agents"
            : category;
  const [indexedFields, setIndexedFields] = useState<SettingsDestination[]>([]);
  const searching = !!query.trim();
  useEffect(() => {
    useStore.setState({ settingsPageTitle: searching ? "Search settings" : (subview ?? sectionTitle) });
  }, [sectionTitle, subview, searching]);
  const results = searchSettings(query, indexedFields).filter(
    (result) =>
      (!result.feature || featureAvailable(result.feature as import("@aux/contracts").AuxFeature)) &&
      (memoryAvailable || result.category !== "Memory") &&
      (downloadNamingAvailable || result.category !== "Downloads") &&
      (profilesAvailable || result.category !== "Profiles") &&
      (linkRoutingAvailable || result.category !== "Link Routing") &&
      (appleScriptAvailable || result.category !== "Advanced") &&
      (permissionsAvailable || result.category !== "Site permissions") &&
      (vaultAvailable || result.category !== "Vault") &&
      (pluginsAvailable || result.target !== "Plugins") &&
      (automationsAvailable || result.category !== "Routines") &&
      (connectorsAvailable || result.target !== "Google Calendar") &&
      (outboundMcpAvailable || result.target !== "MCP servers") &&
      (extensionsAvailable || result.category !== "Extensions"),
  );
  const visible = (name: string) =>
    !searching &&
    (connectionCategories.includes(name)
      ? category === "Connections" &&
        connectionTab ===
          (name === "Models"
            ? "Models"
            : name === "External agents"
              ? "Agents"
              : name === "Vault"
                ? "Vault"
                : "Services")
      : category === name && !subview);
  const [destination, setDestination] = useState<SettingsDestination | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstCategory = useRef<HTMLButtonElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const firstSearchResult = useRef<HTMLButtonElement>(null);
  const editorViews = useRef(new Map<string, HTMLElement>());
  const connectorSections = useRef(new Map<"calendar" | "mcp", HTMLDivElement>());
  const manageConnector = (kind: "calendar" | "mcp") => {
    if (kind === "mcp") {
      openCategory("Connections", "Plugins");
      return;
    }
    const target = connectorSections.current.get(kind);
    target?.scrollIntoView?.({ block: "start", behavior: "smooth" });
    target?.focus({ preventScroll: true });
  };
  const setOverlay = useStore((s) => s.setOverlay);
  const openEditor = (name: string, origin: HTMLButtonElement) => {
    subviewOrigin.current = origin;
    setSubview(name);
    requestAnimationFrame(() => editorViews.current.get(name)?.focus({ preventScroll: true }));
  };
  const [saved, setSaved] = useState(false);
  const savedPublication = useRef<object>(null);
  const [generalIndexVersion, setGeneralIndexVersion] = useState(0);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const shell = dialogRef.current;
    const selected = shell?.querySelector<HTMLButtonElement>('.settings-nav [aria-current="page"]');
    (selected ?? firstCategory.current)?.focus();
    return () => {
      if (ownsFocus(shell) && previous && availableForFocus(previous))
        previous.focus({ preventScroll: true });
    };
  }, []);

  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [category, query, connectionTab, memoryView, subview]);

  useLayoutEffect(() => {
    if (refreshVersion) {
      const selected = dialogRef.current?.querySelector<HTMLButtonElement>(
        '.settings-nav [aria-current="page"]',
      );
      (selected ?? firstCategory.current)?.focus();
    }
  }, [refreshVersion]);

  useLayoutEffect(() => {
    if (!destination || searching || destination.category === "Models") return;
    const controller = new AbortController();
    void focusSettingsDestination(scrollRef.current, destination, controller.signal).then(() => {
      if (!controller.signal.aborted) setDestination(null);
    });
    return () => controller.abort();
  }, [destination, searching]);

  const set = async (patch: Record<string, unknown>, present?: () => boolean) => {
    try {
      await call("settings.set", patch);
      if (!present || present()) {
        const publication = {};
        savedPublication.current = publication;
        setSaved(true);
        setTimeout(() => {
          if (!present || savedPublication.current === publication) setSaved(false);
        }, 1200);
      }
      return true;
    } catch (e) {
      if (!present || present()) errToast(e);
      return false;
    }
  };

  const indexFields = useCallback(() => {
    const next = collectSettingsFields(dialogRef.current);
    setIndexedFields((current) => (JSON.stringify(current) === JSON.stringify(next) ? current : next));
  }, []);
  useLayoutEffect(indexFields, [
    indexFields,
    category,
    connectionTab,
    subview,
    settings,
    generalIndexVersion,
    memoryAvailable,
    permissionsAvailable,
    vaultAvailable,
    extensionsAvailable,
    automationsAvailable,
    refreshVersion,
  ]);
  useEffect(() => {
    if (!dialogRef.current) return;
    const observer = new MutationObserver(indexFields);
    observer.observe(dialogRef.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [indexFields, refreshVersion]);

  return (
    <SettingsShell
      key={refreshVersion}
      shellRef={dialogRef}
      nav={
        <SettingsNav
          query={query}
          onQueryChange={setQuery}
          category={category}
          connectionTab={connectionTab}
          memoryView={memoryView}
          onOpenMemoryView={(view) => {
            setMemoryView(view);
            setQuery("");
            pushSettingsPath("Memory", undefined, view);
          }}
          searching={searching}
          memoryAvailable={memoryAvailable}
          downloadNamingAvailable={downloadNamingAvailable}
          profilesAvailable={profilesAvailable}
          linkRoutingAvailable={linkRoutingAvailable}
          appleScriptAvailable={appleScriptAvailable}
          pluginsAvailable={pluginsAvailable}
          automationsAvailable={automationsAvailable}
          servicesAvailable={servicesAvailable}
          vaultAvailable={vaultAvailable}
          permissionsAvailable={permissionsAvailable}
          extensionsAvailable={extensionsAvailable}
          firstCategory={firstCategory}
          firstSearchResult={firstSearchResult}
          searchInput={searchInput}
          onOpenCategory={(name, tab) => {
            openCategory(name, tab);
            setQuery("");
            if (scrollRef.current) scrollRef.current.scrollTop = 0;
          }}
        />
      }
    >
      <div className="drawer-head">
        {subview && !searching && (
          <button
            {...staticIconButtonProps}
            aria-label="Back to General settings"
            onClick={() => {
              setSubview(null);
              requestAnimationFrame(() => subviewOrigin.current?.focus());
            }}
          >
            {shellIconBack}
          </button>
        )}
        <div className="settings-heading">
          <h1>{searching ? "Search settings" : (subview ?? sectionTitle)}</h1>
          {(searching || subview) && (
            <p>{searching ? "Find a preference across all categories." : "General settings"}</p>
          )}
        </div>
        <span {...auxClassSpacerProps} />
        {saved && <output className="saved">{shellIconCheck} Saved</output>}
        <button
          {...staticIconButtonProps}
          title="Close (Esc)"
          aria-label="Close settings"
          onClick={() => setOverlay(null)}
        >
          {shellIconClose}
        </button>
      </div>

      <div
        role="group"
        className="settings-scroll"
        ref={scrollRef}
        tabIndex={0}
        aria-label={searching ? "Settings search results" : `${sectionTitle} settings`}
      >
        {searching && (
          <div className="settings-search-results">
            <output {...staticHintProps} data-block>
              {results.length
                ? `${results.length} matching ${results.length === 1 ? "setting" : "settings"}`
                : `No settings found for “${query.trim()}”. Try theme, privacy, models or backup.`}
            </output>
            <div onKeyDown={(event) => moveListFocus(event, "button")}>
              {results.map((result) => (
                <button
                  key={`${result.category}:${result.label}`}
                  ref={result === results[0] ? firstSearchResult : undefined}
                  className="settings-search-result"
                  onClick={() => {
                    openCategory(
                      result.category,
                      result.category === "Connections" &&
                        ["Plugins", "MCP servers"].includes(result.target ?? "")
                        ? "Plugins"
                        : undefined,
                    );
                    setQuery("");
                    setSubview(
                      result.subview ??
                        (result.category === "General" &&
                        ["Keyword engines", "Task data backup"].includes(result.target ?? "")
                          ? result.target!
                          : null),
                    );
                    setDestination(result);
                  }}
                >
                  <span className="settings-search-category">
                    {connectionCategories.includes(result.category)
                      ? `Connections · ${result.category === "Connections" ? (servicesAvailable ? "Services" : "Models") : result.category === "External agents" ? "Agents" : result.category === "Vault" ? "Vault" : "Models"}`
                      : result.category === "Permissions"
                        ? "Agents"
                        : result.category}
                  </span>
                  <strong>{result.label}</strong>
                  <span>{result.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {memoryAvailable && (
          <section tabIndex={-1} hidden={!visible("Memory")}>
            <MemorySettings active={visible("Memory")} view={memoryView} />
          </section>
        )}
        {permissionsAvailable && <PrivacySecuritySettings active={visible("Site permissions")} />}
        <ModelsOverview
          active={visible("Models")}
          settings={settings}
          onSave={set}
          destination={destination?.category === "Models" ? destination : null}
          onDestinationHandled={() => setDestination(null)}
        />
        <UsageBudgetsSettings active={visible("Usage & Budgets")} settings={settings} onSave={set} />
        {automationsFeatureAvailable && <RoutinesSettings active={visible("Routines")} />}
        <ChannelsSettings active={visible("Channels")} />
        <GeneralSettings
          active={category === "General"}
          searching={searching}
          subview={subview}
          settings={settings}
          onSave={set}
          onOpenEditor={openEditor}
          editorViews={editorViews}
          refreshVersion={refreshVersion}
          onIndexChange={setGeneralIndexVersion}
        />
        <FeatureSettings
          category={
            !searching && !subview && (category !== "Connections" || connectionTab === "Services")
              ? category
              : null
          }
        />
        <WorkspacesSettings active={visible("Projects")} />
        <QuickAskSettings active={visible("Quick Ask")} settings={settings} onSave={set} />
        <SelectionCaptureSettings active={visible("Selection & Capture")} settings={settings} onSave={set} />
        <ArchivedChatsSettings active={visible("Archived chats")} />
        {servicesAvailable && (
          <section
            id="connection-panel-Services"
            aria-label="Connected services"
            hidden={!visible("Connections")}
          >
            {connectorsAvailable && (
              <>
                <ReviewedConnectors active={visible("Connections")} onManage={manageConnector} />
                <div
                  id="connection-calendar"
                  data-setting="Google Calendar"
                  ref={(node) => {
                    if (node) connectorSections.current.set("calendar", node);
                    else connectorSections.current.delete("calendar");
                  }}
                  tabIndex={-1}
                >
                  <CalendarConnections active={visible("Connections")} />
                </div>
              </>
            )}
          </section>
        )}
        {vaultAvailable && (
          <section tabIndex={-1} id="connection-panel-Vault" aria-label="Vault" hidden={!visible("Vault")}>
            <VaultSettings active={visible("Vault")} />
          </section>
        )}
        <section
          tabIndex={-1}
          id="connection-panel-Agents"
          aria-label="Developers and external agents"
          hidden={!visible("External agents")}
        >
          <ExternalAgents active={visible("External agents")} />
          {visible("External agents") && <CloudExecution />}
        </section>
        {pluginsAvailable && (
          <section
            tabIndex={-1}
            id="connection-panel-Plugins"
            aria-label="Skills and MCP"
            hidden={searching || category !== "Connections" || connectionTab !== "Plugins"}
          >
            <div data-setting="Plugins" tabIndex={-1}>
              <PluginsPanel
                destination={destination?.category === "Connections" ? destination.target : undefined}
                active={!searching && category === "Connections" && connectionTab === "Plugins"}
              />
            </div>
          </section>
        )}
        {extensionsAvailable && (
          <section tabIndex={-1} hidden={!visible("Extensions")}>
            <Extensions active={visible("Extensions")} />
          </section>
        )}

        <LabsSettings active={visible("Labs")} settings={settings} onSave={set} />
        <AppearanceSettings active={visible("Appearance")} settings={settings} onSave={set} />
        {profilesAvailable && (
          <section hidden={!visible("Profiles")}>
            <ProfilesSettings active={visible("Profiles")} />
          </section>
        )}
        <PermissionsSettings active={visible("Permissions")} settings={settings} onSave={set} />
        <PasswordsAutofillSettings
          active={visible("Passwords & Autofill")}
          settings={settings}
          onSave={set}
        />
      </div>
    </SettingsShell>
  );
}
