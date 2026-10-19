// Provides the chrome.aside* private extension APIs for builds whose browser does not yet
// implement them natively. Each namespace is only defined when the browser lacks it, so a
// native implementation always wins.
(() => {
  if (typeof chrome === "undefined") return;
  const BRIDGE = "http://127.0.0.1:21522";

  async function bridge(path, body) {
    const response = await fetch(`${BRIDGE}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-aux-bridge": "1" },
      body: JSON.stringify(body ?? {}),
    });
    if (!response.ok) throw new Error(`Aux bridge ${path} failed: ${response.status}`);
    return response.json();
  }

  const stored = (key, fallback) => async () => {
    const entry = await chrome.storage.local.get(`aux.pref.${key}`);
    return entry[`aux.pref.${key}`] ?? fallback;
  };
  const store = (key) => async (value) => {
    await chrome.storage.local.set({ [`aux.pref.${key}`]: value });
  };
  const state = (value) => async () => value;
  const nothing = async () => {};

  const account = {
    signDaemonAuthChallenge: (challenge) => bridge("/account/sign", { challenge }),
    getProfileContext: async () => ({ profileId: "Default", chromiumProfileId: "Default", localOnly: true }),
    getProfiles: async () => [{ profileIndex: 0, name: "Default", isCurrent: true, isLocked: false }],
    openProfileRoute: async () => false,
  };

  const preferences = {
    getWindowBackgroundVibrancyEnabled: stored("vibrancy", true),
    setWindowBackgroundVibrancyEnabled: store("vibrancy"),
    getBrowserColorScheme: stored("colorScheme", "system"),
    setBrowserColorScheme: store("colorScheme"),
    getTabStyle: stored("tabStyle", "vertical"),
    setTabStyle: store("tabStyle"),
    getVerticalTabInsertionPosition: stored("verticalTabInsertion", "bottom"),
    setVerticalTabInsertionPosition: store("verticalTabInsertion"),
    getHorizontalTabShrinkEnabled: stored("horizontalTabShrink", true),
    setHorizontalTabShrinkEnabled: store("horizontalTabShrink"),
    getTabSwitcherSortByRecentlyUsed: stored("tabSwitcherRecent", true),
    setTabSwitcherSortByRecentlyUsed: store("tabSwitcherRecent"),
    getDefaultZoom: stored("defaultZoom", 0),
    setDefaultZoom: store("defaultZoom"),
    getDefaultBrowserState: state({ isDefault: false, canSet: false }),
    setAsDefaultBrowser: state({ isDefault: false, canSet: false }),
    getDockState: state({ isInDock: false, canAdd: false }),
    addToDock: state({ isInDock: false, canAdd: false }),
    getKeepTasksRunningState: stored("keepTasksRunning", { enabled: true }),
    setKeepTasksRunningEnabled: async (enabled) => store("keepTasksRunning")({ enabled }),
    getAutoPipEnabled: stored("autoPip", false),
    setAutoPipEnabled: store("autoPip"),
    getVerticalTabsBookmarksSectionEnabled: stored("verticalTabsBookmarks", true),
    setVerticalTabsBookmarksSectionEnabled: store("verticalTabsBookmarks"),
    getBrowserVersion: async () => chrome.runtime.getManifest().version,
    getSyncStatus: state({ signedIn: false }),
    checkForUpdates: state({ status: "up-to-date" }),
    getLanguageSettings: state({ preferredLanguages: ["en-US"], spellCheckEnabled: true }),
    getSupportedLanguages: state({ languages: [] }),
    setPreferredLanguages: nothing,
    setSpellCheckEnabled: nothing,
    getSearchEngines: state({ engines: [], defaultEngineId: null }),
    setDefaultSearchEngine: nothing,
  };

  const notification = {
    requestPermission: async () => true,
    revokePermission: async () => true,
  };

  const miniPopup = {
    hide: nothing,
    getEnabled: stored("miniPopupEnabled", true),
    setEnabled: store("miniPopupEnabled"),
    getShortcut: stored("miniPopupShortcut", "Alt+Space"),
    setShortcut: store("miniPopupShortcut"),
    setState: nothing,
    setSize: nothing,
    setOptionWindowSize: nothing,
    pickDirectory: async () => undefined,
    switchProfile: nothing,
  };

  const importer = {
    getImportSources: async () => [],
    startImport: async () => ({ error: "Import is not available in this build." }),
    getImportProgress: async () => ({}),
    cancelImport: nothing,
    onImportProgress: { addListener() {}, removeListener() {}, hasListener: () => false },
  };

  for (const [name, api] of Object.entries({
    asideAccount: account,
    asideBrowserPreferences: preferences,
    asideNotification: notification,
    asideMiniPopup: miniPopup,
    asideBrowserImport: importer,
  })) {
    if (!chrome[name]) chrome[name] = api;
  }
})();
