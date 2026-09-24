import type { AuxBridge } from "./bridge";

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
  "onTabsPatch", "onTabsPlacement", "onToolbarEdge", "onTranslationChanged",
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
      if (fireAndForgetMethods.has(key)) {
        return (...args: unknown[]) => {
          void port.request(key, args).catch(error => console.error(`Aux host ${key} failed`, error));
        };
      }
      return (...args: unknown[]) => port.request(key, args);
    },
  }) as AuxBridge;
  target.auxHostProof = { host: "chromium-fork" };
  return true;
}
