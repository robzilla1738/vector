import { effectiveShortcuts, type ShortcutOverrides } from "@aux/contracts/shortcut-defs";
import type { AuxBridge } from "./bridge";
import { requireAuxMethod, type AuxFeatureOverrides, type MethodName, type MethodResult, type RpcArgs } from "@aux/contracts";
import { createHostClient } from "./host/client.generated";
import { chromiumFeatureStages } from "./feature-stage-reconciliation";

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
  readonly testClockScale?: number;
  readonly featureStages?: AuxFeatureOverrides;
  request(method: string, args: unknown[]): Promise<unknown>;
  subscribe(event: string, callback: (payload: unknown) => void): () => void;
}

type ChromiumWindow = Window & {
  aux?: AuxBridge;
  auxChromiumHost?: ChromiumHostPort;
  auxHostProof?: { host: "chromium-fork" };
  __auxMock?: boolean;
};

/** Install before App is imported so the existing AuxBridge is the real host. */
export function installChromiumBridge(target: ChromiumWindow = window as ChromiumWindow): boolean {
  if (target.location.protocol !== "chrome:" || target.location.hostname !== "aux" || target.__auxMock) return false;
  if (target.aux) return false;
  const port = target.auxChromiumHost;
  if (!port || port.host !== "chromium-fork" || !port.windowId || !port.profileId ||
      typeof port.request !== "function" || typeof port.subscribe !== "function") return false;

  const client = createHostClient(port);
  target.aux = {
    ...client,
    windowId: port.windowId,
    platform: port.platform,
    privateMode: port.privateMode,
    quickAskMode: !!port.quickAskMode,
    // SurfaceEmbed participates in the shell's DOM stacking and visibility.
    // Chromium applies the overlay transition when the renderer mounts it.
    overlay: async (open: boolean) => {
      if (typeof open !== "boolean") throw new TypeError("Overlay state must be boolean");
      return open;
    },
    setShortcutOverrides: async (overrides: ShortcutOverrides) => {
      const rows = (saved?: ShortcutOverrides) => effectiveShortcuts(saved)
        .filter(command => command.intercept)
        .flatMap(command => command.bindings
          .filter(binding => !binding.platforms || binding.platforms.includes(port.platform))
          .map(binding => ({
            commandId: command.id, key: binding.key,
            meta: !!binding.command && port.platform === "darwin",
            ctrl: !!binding.ctrl || (!!binding.command && port.platform !== "darwin"),
            shift: !!binding.shift, alt: !!binding.alt,
            focusShell: !!command.focusShell,
          })));
      // Reserve defaults even when disabled or rebound, so AppKit's original
      // browser menu cannot reinterpret them as a different command. The
      // native accelerator map keeps the last row for a chord, while the
      // shared registry matches the first command, so reverse active rows.
      return client.setShortcuts(
        [...rows().map(row => ({ ...row, commandId: "" })), ...rows(overrides).reverse()],
      );
    },
    windows: async () => {
      // The native catalog is already scoped to this Profile. Build the
      // move-tab menu from it instead of introducing a second window list.
      const catalog = await client.tabsSnapshot();
      return catalog.windows.filter(window => window.windowId !== port.windowId).map(window => {
        const tabs = catalog.tabs.filter(tab => tab.windowId === window.windowId && !tab.popup && !tab.runtimeOwned);
        const active = tabs.find(tab => tab.pageId === window.activePageId) ?? tabs[0];
        return { id: window.windowId, title: active?.title || "Aux", tabCount: tabs.length };
      });
    },
    invoke: async <M extends MethodName>(method: M, ...params: RpcArgs<M>): Promise<MethodResult<M>> => {
      requireAuxMethod(method, "chromium-fork", chromiumFeatureStages(target));
      // The browser forwards this name to the runtime as the signed-in desktop user.
      return port.request("invoke", [method, params[0] ?? {}]) as Promise<MethodResult<M>>;
    },
  };
  target.auxHostProof = { host: "chromium-fork" };
  return true;
}
