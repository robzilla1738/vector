import type { AuxBridge } from "./bridge";
import { auxFeatureForBridgeMethod, requireAuxFeature, requireAuxMethod, type AuxFeatureOverrides, type TabCatalogSnapshot } from "@aux/contracts";

/**
 * Browser-process endpoint installed only in Aux's trusted chrome://aux/ WebUI.
 * The Chromium handler must check the committed frame origin, owning Profile,
 * method allowlist and arguments before forwarding a request. This renderer
 * adapter is not a security boundary.
 */
export interface ChromiumHostPort {
  readonly host: "chromium-fork";
  readonly windowId: string;
  readonly profileId: string;
  readonly platform: string;
  readonly privateMode: boolean;
  readonly quickAskMode?: boolean;
  readonly featureStages?: AuxFeatureOverrides;
  request(method: string, args: unknown[]): Promise<unknown>;
  subscribe(event: string, callback: (...args: unknown[]) => void): () => void;
}

type ChromiumWindow = Window & {
  aux?: AuxBridge;
  auxChromiumHost?: ChromiumHostPort;
  auxHostProof?: { host: "chromium-fork" };
  __auxMock?: boolean;
};

const eventMethods = new Set([
  "onAudio", "onDownload", "onEvent", "onHttpAuthChanged", "onLoading",
  "onPageAction", "onPageCursor", "onPreviewFrame", "onQuickAskState",
  "onRuntimeStatus", "onShortcut", "onSidebarEdge", "onSiteZoomChanged",
  "onTabsPatch", "onTabsPlacement", "onToolbarEdge", "onTranslationChanged", "onOrganizationChanged",
  "onVaultOffer", "onDictation",
]);

const fireAndForgetMethods = new Set(["forwardPagePointer", "windowDrag"]);

/** Install before App is imported so the existing AuxBridge is the real host. */
export function installChromiumBridge(target: ChromiumWindow = window as ChromiumWindow): boolean {
  if (target.location.protocol !== "chrome:" || target.location.hostname !== "aux" || target.__auxMock) return false;
  if (target.aux) return false;
  const port = target.auxChromiumHost;
  if (!port || port.host !== "chromium-fork" || !port.windowId || !port.profileId ||
      typeof port.request !== "function" || typeof port.subscribe !== "function") return false;

  const identity = {
    windowId: port.windowId,
    platform: port.platform,
    privateMode: port.privateMode,
    quickAskMode: !!port.quickAskMode,
  };
  target.aux = new Proxy(identity, {
    get(base, key) {
      if (Reflect.has(base, key)) return Reflect.get(base, key);
      if (typeof key !== "string" || key === "then" || key === "constructor" ||
          key === "toJSON" || key.startsWith("__")) return undefined;
      if (eventMethods.has(key)) {
        return (callback: (...args: unknown[]) => void) => port.subscribe(key, callback);
      }
      // SurfaceEmbed participates in the shell's DOM stacking and visibility.
      // Electron needs an imperative WebContentsView overlay transition;
      // Chromium applies it when the renderer mounts the overlay.
      if (key === "overlay") return async (open: boolean) => {
        if (typeof open !== "boolean") throw new TypeError("Overlay state must be boolean");
        return open;
      };
      if (key === "windows") return async () => {
        // The native catalog is already scoped to this Profile. Build the
        // move-tab menu from it instead of introducing a second window list.
        const catalog = await port.request("tabsSnapshot", []) as TabCatalogSnapshot;
        return catalog.windows.filter(window => window.windowId !== port.windowId).map(window => {
          const tabs = catalog.tabs.filter(tab => tab.windowId === window.windowId && !tab.popup && !tab.runtimeOwned);
          const active = tabs.find(tab => tab.pageId === window.activePageId) ?? tabs[0];
          return { id: window.windowId, title: active?.title || "Aux", tabCount: tabs.length };
        });
      };
      const bridgeFeature = auxFeatureForBridgeMethod(key);
      if (fireAndForgetMethods.has(key)) {
        return (...args: unknown[]) => {
          if (bridgeFeature) requireAuxFeature(bridgeFeature, "chromium-fork", port.featureStages);
          void port.request(key, args).catch(error => console.error(`Aux host ${key} failed`, error));
        };
      }
      return async (...args: unknown[]) => {
        if (bridgeFeature) requireAuxFeature(bridgeFeature, "chromium-fork", port.featureStages);
        if (key === "invoke" && typeof args[0] === "string") requireAuxMethod(args[0], "chromium-fork", port.featureStages);
        return port.request(key, args);
      };
    },
  }) as AuxBridge;
  target.auxHostProof = { host: "chromium-fork" };
  return true;
}
