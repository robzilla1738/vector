import { LabsSettings } from "../settings/sections/Labs";
import { staticIconButtonProps } from "../ui/class-props";
import { staticHintProps } from "../ui/class-props";
import { FeatureSettings, featureSettingsAvailable } from "../features/registry";
import "./Settings.css";
import { MemorySettings } from "./MemorySettings";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useStore, call, errToast } from "../store";

import { shellIconBack, shellIconCheck, shellIconClose } from "./icons";
import { ExternalAgents } from "./ExternalAgents";
import { PluginsPanel } from "./PluginsPanel";
import { Extensions } from "./Extensions";
import { VaultSettings } from "./VaultSettings";
import { CalendarConnections } from "./CalendarConnections";
import { OutboundMcpSettings } from "./OutboundMcpSettings";
import { ReviewedConnectors } from "./ReviewedConnectors";
import { searchSettings, type SettingsDestination } from "../settings-search";
import { collectSettingsFields } from "../settings/search";
import { focusSettingsDestination } from "../settings/search-focus";
import { AppearanceSettings } from "../settings/sections/Appearance";
import { AgentsSettings } from "../settings/sections/Agents";
import { PrivacySecuritySettings } from "../settings/sections/PrivacySecurity";
import { PasswordsAutofillSettings } from "../settings/sections/PasswordsAutofill";
import { ModelsSettings } from "../settings/sections/Models";
import { UsageBudgetsSettings } from "../settings/sections/UsageBudgets";
import { AutomationsSettings } from "../settings/sections/Automations";
import { WorkspacesSettings } from "../settings/sections/Workspaces";
import { QuickAskSettings } from "../settings/sections/QuickAsk";
import { SelectionCaptureSettings } from "../settings/sections/SelectionCapture";
import { ArchivedChatsSettings } from "../settings/sections/ArchivedChats";
import { GeneralSettings } from "../settings/sections/General";
import { ProfilesSettings } from "../settings/sections/Profiles";
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
import { staticSpacerProps as auxClassSpacerProps } from "../ui/class-props";

const categoryDescriptions: Record<string, string> = {
  Downloads: "File names, exclusions and smart downloads.",
  General: "Search, shortcuts, and your browsing data.",
  Profiles: "Separate browsing identities and local data.",
  "Link Routing": "Choose where links open across Profiles and Spaces.",
  Advanced: "Control local script access to browser tabs.",
  Appearance: "Make Aux feel at home, from tabs to text size.",
  "Passwords & Autofill": "Manage personal info and Chromium Profile passwords.",
  Memory: "Manage the context Aux remembers for your work.",
  Workspaces: "Folders, agent instructions and file access by Space.",
  Connections: "Models, services and connected tools.",
  "Usage & Budgets": "Model spending limits for runs, days and routines.",
  Automations: "Schedules, results and spending limits for Skills.",
  "Quick Ask": "Open a compact chat from Aux or any app.",
  "Selection & Capture": "Review selections, capture shortcuts, and writing assistance.",
  "Archived chats": "Find and restore archived conversations.",
  "Site permissions": "Choose what websites can access.",
  "Agent permissions": "Control what Aux can do on your behalf.",
  Extensions: "Manage browser extensions.",
  Labs: "Choose which features appear in Aux.",
};

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
      "Automations",
      settings.featureOverrides as import("@aux/contracts").FeatureOverride | undefined,
    );
  const outboundMcpAvailable = useFeature("outboundMcp");
  const connectorsAvailable = useFeature("connectors");
  const servicesAvailable =
    outboundMcpAvailable ||
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
    (route.category !== "Automations" || automationsAvailable) &&
    (route.connectionTab !== "Vault" || vaultAvailable) &&
    (route.connectionTab !== "Plugins" || skillsAvailable) &&
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
    (initialCategory === "Automations" && !automationsAvailable) ||
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
            Services: "MCP & Connectors",
            Agents: "Developers & External Agents",
            Vault: "Vault",
            Plugins: "Skills & Plugins",
          } as const
        )[connectionTab]
      : category === "Site permissions"
        ? "Privacy & Security"
        : category === "Agent permissions"
          ? "Agents"
          : category;
  const [indexedFields, setIndexedFields] = useState<SettingsDestination[]>([]);
  const searching = !!query.trim();
  const results = searchSettings(query, indexedFields).filter(
    (result) =>
      (memoryAvailable || result.category !== "Memory") &&
      (downloadNamingAvailable || result.category !== "Downloads") &&
      (profilesAvailable || result.category !== "Profiles") &&
      (linkRoutingAvailable || result.category !== "Link Routing") &&
      (appleScriptAvailable || result.category !== "Advanced") &&
      (permissionsAvailable || result.category !== "Site permissions") &&
      (vaultAvailable || result.category !== "Vault") &&
      (skillsAvailable || result.target !== "Plugins") &&
      (automationsAvailable || result.category !== "Automations") &&
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
    firstCategory.current?.focus();
    return () => {
      if (ownsFocus(shell) && previous && availableForFocus(previous))
        previous.focus({ preventScroll: true });
    };
  }, []);

  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [category, query, connectionTab, subview]);

  useLayoutEffect(() => {
    if (refreshVersion) firstCategory.current?.focus();
  }, [refreshVersion]);

  useLayoutEffect(() => {
    if (!destination || searching) return;
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
          searching={searching}
          memoryAvailable={memoryAvailable}
          downloadNamingAvailable={downloadNamingAvailable}
          profilesAvailable={profilesAvailable}
          linkRoutingAvailable={linkRoutingAvailable}
          appleScriptAvailable={appleScriptAvailable}
          skillsAvailable={skillsAvailable}
          automationsAvailable={automationsAvailable}
          servicesAvailable={servicesAvailable}
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
          <h3>{searching ? "Search settings" : (subview ?? sectionTitle)}</h3>
          <p>
            {searching
              ? "Find a preference across all categories."
              : subview
                ? "General settings"
                : categoryDescriptions[category]}
          </p>
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

      {!searching && category === "Connections" && (
        <div
          className="settings-connection-tabs"
          role="tablist"
          aria-label="Connection types"
          onKeyDown={(event) => moveListFocus(event, '[role="tab"]', false)}
        >
          {(
            [
              "Models",
              ...(servicesAvailable ? (["Services"] as const) : []),
              ...(vaultAvailable ? (["Vault"] as const) : []),
              "Agents",
              ...(skillsAvailable ? (["Plugins"] as const) : []),
            ] as const
          ).map((tab) => (
            <button
              key={tab}
              role="tab"
              id={`connection-tab-${tab}`}
              aria-controls={`connection-panel-${tab}`}
              aria-selected={connectionTab === tab}
              tabIndex={connectionTab === tab ? 0 : -1}
              onClick={() => {
                setConnectionTab(tab);
                pushSettingsPath("Connections", tab);
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      )}
      <div
        role="group"
        className="settings-scroll"
        ref={scrollRef}
        tabIndex={0}
        aria-label={searching ? "Settings search results" : `${category} settings`}
      >
        <FeatureSettings
          category={
            !searching && !subview && (category !== "Connections" || connectionTab === "Services")
              ? category
              : null
          }
        />
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
                      result.category === "Connections" && result.target === "Plugins"
                        ? "Plugins"
                        : undefined,
                    );
                    setQuery("");
                    setSubview(
                      result.category === "General" &&
                        ["Keyword engines", "Task data backup"].includes(result.target ?? "")
                        ? result.target!
                        : null,
                    );
                    setDestination(result);
                  }}
                >
                  <span className="settings-search-category">
                    {connectionCategories.includes(result.category)
                      ? `Connections · ${result.category === "Connections" ? (servicesAvailable ? "Services" : "Models") : result.category === "External agents" ? "Agents" : result.category === "Vault" ? "Vault" : "Models"}`
                      : result.category}
                  </span>
                  <strong>{result.label}</strong>
                  <span>{result.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {visible("Memory") && (
          <section tabIndex={-1}>
            <MemorySettings />
          </section>
        )}
        {permissionsAvailable && <PrivacySecuritySettings active={visible("Site permissions")} />}
        <ModelsSettings active={visible("Models")} settings={settings} onSave={set} />
        <UsageBudgetsSettings active={visible("Usage & Budgets")} settings={settings} onSave={set} />
        {automationsFeatureAvailable && <AutomationsSettings active={visible("Automations")} />}
        <WorkspacesSettings active={visible("Workspaces")} />
        <QuickAskSettings active={visible("Quick Ask")} />
        <SelectionCaptureSettings active={visible("Selection & Capture")} settings={settings} onSave={set} />
        <ArchivedChatsSettings active={visible("Archived chats")} />
        {servicesAvailable && (
          <section
            id="connection-panel-Services"
            role="tabpanel"
            aria-labelledby="connection-tab-Services"
            hidden={!visible("Connections")}
          >
            {connectorsAvailable && (
              <>
                <ReviewedConnectors onManage={manageConnector} />
                <div
                  id="connection-calendar"
                  data-setting="Google Calendar"
                  ref={(node) => {
                    if (node) connectorSections.current.set("calendar", node);
                    else connectorSections.current.delete("calendar");
                  }}
                  tabIndex={-1}
                >
                  <CalendarConnections />
                </div>
              </>
            )}
            {outboundMcpAvailable && (
              <div
                id="connection-mcp"
                ref={(node) => {
                  if (node) connectorSections.current.set("mcp", node);
                  else connectorSections.current.delete("mcp");
                }}
                tabIndex={-1}
              >
                <OutboundMcpSettings />
              </div>
            )}
          </section>
        )}
        {vaultAvailable && (
          <section
            tabIndex={-1}
            id="connection-panel-Vault"
            role="tabpanel"
            aria-labelledby="connection-tab-Vault"
            hidden={!visible("Vault")}
          >
            <VaultSettings />
          </section>
        )}
        <section
          tabIndex={-1}
          id="connection-panel-Agents"
          role="tabpanel"
          aria-labelledby="connection-tab-Agents"
          hidden={!visible("External agents")}
        >
          <ExternalAgents />
        </section>
        {skillsAvailable && (
          <section
            tabIndex={-1}
            id="connection-panel-Plugins"
            role="tabpanel"
            aria-labelledby="connection-tab-Plugins"
            hidden={!(category === "Connections" && connectionTab === "Plugins")}
          >
            <div data-setting="Plugins" tabIndex={-1}>
              <PluginsPanel />
            </div>
          </section>
        )}
        {extensionsAvailable && (
          <section tabIndex={-1} hidden={!visible("Extensions")}>
            <Extensions />
          </section>
        )}

        <LabsSettings active={visible("Labs")} settings={settings} onSave={set} />
        <AppearanceSettings active={visible("Appearance")} settings={settings} onSave={set} />
        {profilesAvailable && visible("Profiles") && <ProfilesSettings />}
        <AgentsSettings active={visible("Agent permissions")} settings={settings} onSave={set} />
        <PasswordsAutofillSettings
          active={visible("Passwords & Autofill")}
          settings={settings}
          onSave={set}
        />
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
      </div>
    </SettingsShell>
  );
}
