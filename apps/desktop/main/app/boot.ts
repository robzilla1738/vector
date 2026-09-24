import { powerMonitor } from "electron";
import { wireDownloads } from "../downloads/controller.js";
import { configureQuickAskShortcut, quickAskShortcutEnabled } from "../features/quick-ask.js";
import { wireRendererIpc } from "../ipc/index.js";
import { gatePageLoads, profileSession } from "../native-views.js";
import { IDLE_MATERIALIZE_MAX, IDLE_MATERIALIZE_MS } from "../page-lifecycle.js";
import { configureCloudPreviewHeaders, configurePagePermissions } from "../privacy/session.js";
import { maintainFilterLists } from "../privacy/state.js";
import { channel, runtimeInvoke, runtimeProcess, runtimeReady, scheduleRuntimeRestart, startRuntimeWhenReady } from "../runtime/supervisor.js";
import { ensureTabView } from "../tabs/materialize.js";
import { shellTabWindow } from "../tabs/publish.js";
import { savedCatalogLoad, tabCatalog } from "../tabs/store.js";
import { createRegularWindow } from "../windows/create.js";
import { PRIMARY_WINDOW_ID, desktopEnv, log } from "./bootstrap.js";
import { markShellReady } from "./external-urls.js";
import { installMenu } from "./menu.js";
import { browserHealth, extensionManager, registry } from "./services.js";

export async function loadProfileExtensions() {
  const configured = (desktopEnv.AUX_EXTENSION_PATHS ?? "")
    .split(process.platform === "win32" ? ";" : ":")
    .map((path) => path.trim())
    .filter(Boolean);
  await extensionManager.loadAll(profileSession(), configured);
  for (const extension of extensionManager.list(profileSession())) {
    if (extension.loaded) log("loaded extension", extension.name, extension.id);
    else if (extension.error) log("extension failed", extension.name, extension.error);
  }
}

export async function boot() {
  // IPC first: React effects can invoke before the shell finishes loading.
  wireRendererIpc();
  wireDownloads();
  configurePagePermissions();
  configureCloudPreviewHeaders();
  installMenu();
  // Extensions load beside window creation; only page loads wait for them.
  gatePageLoads(loadProfileExtensions().catch(error => log("extensions failed to load", String(error))));
  // The runtime forks once the primary native-page host exists; the optional
  // development legacy transport also waits for Chromium's DevTools port.
  let primaryCreated!: () => void;
  startRuntimeWhenReady(new Promise<void>(resolve => { primaryCreated = resolve; }));

  // The worker-owned catalog is the durable browser truth — restore it before
  // the first shell paints so the strip reflects the saved session even while
  // the runtime is still starting or unavailable.
  const savedCatalog = await savedCatalogLoad;
  if (savedCatalog) {
    tabCatalog.restore({
      ...savedCatalog,
      // Restored records carry no view yet — they materialize on stage demand
      // or under bounded idle scheduling below.
      tabs: savedCatalog.tabs.map(tab => ({ ...tab, lifecycle: "placeholder" as const })),
    });
    for (const tab of savedCatalog.tabs) shellTabWindow.set(tab.pageId, tab.windowId);
  }
  await createRegularWindow(PRIMARY_WINDOW_ID, false, primaryCreated);
  // Durable secondary windows reopen with the catalog records they own.
  if (savedCatalog) for (const savedWindow of savedCatalog.windows) {
    if (savedWindow.windowId !== PRIMARY_WINDOW_ID && savedCatalog.tabs.some(tab => tab.windowId === savedWindow.windowId)) await createRegularWindow(savedWindow.windowId);
  }
  if(quickAskShortcutEnabled)try{configureQuickAskShortcut(true,false);}catch(error){log(String(error));}
  browserHealth.start();
  // Restored tabs beyond the active one materialize under a bounded idle
  // cadence — warm tabs without a startup stampede. Agent-owned records wait
  // for the runtime to re-attach its own drivers.
  const materializeQueue = tabCatalog.snapshot().tabs.filter(tab => tab.lifecycle === "placeholder" && !tab.runtimeOwned).map(tab => tab.pageId);
  let materialized = 0;
  const materializeNext = () => {
    const pageId = materializeQueue.shift();
    if (!pageId || materialized >= IDLE_MATERIALIZE_MAX) return;
    if (!registry.get(pageId) && tabCatalog.tab(pageId)) { ensureTabView(pageId); materialized++; }
    if (materializeQueue.length && materialized < IDLE_MATERIALIZE_MAX) {
      const again = setTimeout(materializeNext, IDLE_MATERIALIZE_MS); again.unref();
    }
  };
  if (materializeQueue.length) { const kickoff = setTimeout(materializeNext, IDLE_MATERIALIZE_MS); kickoff.unref(); }
  maintainFilterLists();
  powerMonitor.on("resume", () => {
    if (!runtimeReady || !channel) return scheduleRuntimeRestart(0);
    void runtimeInvoke("workspace.get", {}, 10_000).catch(() => {
      runtimeProcess?.kill("SIGTERM");
    });
  });
  markShellReady();

}
