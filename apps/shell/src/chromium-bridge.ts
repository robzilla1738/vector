import { effectiveShortcutBindings } from "@aux/contracts/shortcut-startup";
import type { ShortcutOverrides } from "@aux/contracts/shortcut-bindings";
import type { AuxBridge } from "./bridge";
import { requireAuxMethod } from "@aux/contracts/method-feature";
import type { AuxFeatureOverrides } from "@aux/contracts/aux-features";
import type { MethodName, MethodResult, RpcArgs } from "@aux/contracts/api";
import { installNativeDownloadCollection } from "./downloads";
import { createHostClient, type HostValidation } from "./host/client.generated";
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
  readonly windowKind: "normal" | "private" | "little" | "quick-ask";
  readonly testClockScale?: number;
  /** Present only in an explicitly enabled disposable native benchmark. */
  readonly performanceCommit?: (queryId: number) => Promise<void>;
  readonly performanceWindowReady?: () => Promise<void>;
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
export function installChromiumBridge(
  target: ChromiumWindow = window as ChromiumWindow,
  validation?: HostValidation,
): boolean {
  if (target.location.protocol !== "chrome:" || target.location.hostname !== "aux" || target.__auxMock)
    return false;
  if (target.aux) return false;
  const port = target.auxChromiumHost;
  if (
    !port ||
    port.host !== "chromium-fork" ||
    !port.windowId ||
    !port.profileId ||
    typeof port.request !== "function" ||
    typeof port.subscribe !== "function"
  )
    return false;

  const client = createHostClient(port, validation);
  const downloads = installNativeDownloadCollection();
  // Observe before consumers so snapshots, acknowledgements and live rows
  // share one native ordering, independent of the runtime receipt ledger.
  client.onDownload((download) => downloads.receive(download));
  client.onDownloadsRemoved(({ ids }) => downloads.remove(ids));
  const downloadsSnapshot = async () => {
    const requested = downloads.begin();
    return downloads.snapshot(await client.downloadsSnapshot(), requested);
  };
  const dismissDownloads: AuxBridge["dismissDownloads"] = async (ids) => {
    const requested = downloads.begin();
    const result = await client.dismissDownloads(ids);
    downloads.remove(result.removed, requested);
    return result;
  };
  target.aux = {
    ...client,
    downloadsSnapshot,
    dismissDownloads,
    onDownload: (callback) =>
      client.onDownload((download) => {
        if (downloads.has(download.id)) callback(download);
      }),
    windowId: port.windowId,
    platform: port.platform,
    privateMode: port.privateMode,
    windowKind: port.windowKind,
    // SurfaceEmbed participates in the shell's DOM stacking and visibility.
    // Chromium applies the overlay transition when the renderer mounts it.
    overlay: async (open: boolean) => {
      if (typeof open !== "boolean") throw new TypeError("Overlay state must be boolean");
      return open;
    },
    setShortcutOverrides: async (overrides: ShortcutOverrides) => {
      const rows = (saved?: ShortcutOverrides) =>
        effectiveShortcutBindings(saved).flatMap((command) =>
          command.bindings
            .filter((binding) => !binding.platforms || binding.platforms.includes(port.platform))
            .map((binding) => ({
              commandId: command.id,
              key: binding.key,
              meta: !!binding.command && port.platform === "darwin",
              ctrl: !!binding.ctrl || (!!binding.command && port.platform !== "darwin"),
              shift: !!binding.shift,
              alt: !!binding.alt,
              focusShell: !!command.focusShell,
            })),
        );
      // Reserve defaults even when disabled or rebound, so AppKit's original
      // browser menu cannot reinterpret them as a different command. The
      // native accelerator map keeps the last row for a chord, while the
      // shared registry matches the first command, so reverse active rows.
      return client.setShortcuts([
        ...rows().map((row) => ({ ...row, commandId: "" })),
        ...rows(overrides).reverse(),
      ]);
    },
    windows: async () => {
      // The native catalog is already scoped to this Profile. Build the
      // move-tab menu from it instead of introducing a second window list.
      const catalog = await client.tabsSnapshot();
      return catalog.windows
        .filter((window) => window.windowId !== port.windowId)
        .map((window) => {
          const tabs = catalog.tabs.filter(
            (tab) => tab.windowId === window.windowId && !tab.popup && !tab.runtimeOwned,
          );
          const active = tabs.find((tab) => tab.pageId === window.activePageId) ?? tabs[0];
          return {
            id: window.windowId,
            title: active?.title || "Aux",
            tabCount: tabs.length,
          };
        });
    },
    invoke: async <M extends MethodName>(method: M, ...params: RpcArgs<M>): Promise<MethodResult<M>> => {
      requireAuxMethod(method, "chromium-fork", chromiumFeatureStages(target));
      if (method.startsWith("bookmarks.")) {
        const {
          isNativeBookmarkMethod,
          BookmarkMethodSchemas,
          NativeBookmarkRequestSchema,
          NativeBookmarkResultSchema,
          BookmarkResultSchemas,
        } = await import("@aux/contracts/bookmark-methods");
        if (isNativeBookmarkMethod(method)) {
          const request = NativeBookmarkRequestSchema.parse({
            method,
            params: BookmarkMethodSchemas[method].parse(params[0] ?? {}),
          });
          const response = NativeBookmarkResultSchema.parse(await port.request("bookmarksInvoke", [request]));
          if (response.method !== method)
            throw new Error("Native bookmark response does not match its request.");
          return BookmarkResultSchemas[method].parse(response.result) as MethodResult<M>;
        }
      }
      if (method === "downloads.list") return downloadsSnapshot() as Promise<MethodResult<M>>;
      if (method === "downloads.remove") {
        const { DownloadsRemoveParams } = await import("@aux/contracts/downloads");
        const { ids } = DownloadsRemoveParams.parse(params[0]);
        return dismissDownloads(ids) as Promise<MethodResult<M>>;
      }
      if (method.startsWith("history.")) {
        const {
          isNativeHistoryMethod,
          HistoryMethodSchemas,
          HistoryResultSchemas,
          NativeHistoryRequestSchema,
          NativeHistoryResultSchema,
        } = await import("@aux/contracts/history-methods");
        if (isNativeHistoryMethod(method)) {
          const request = NativeHistoryRequestSchema.parse({
            method,
            params: HistoryMethodSchemas[method].parse(params[0] ?? {}),
          });
          const response = NativeHistoryResultSchema.parse(await port.request("historyInvoke", [request]));
          if (response.method !== method)
            throw new Error("Native history response does not match its request.");
          return HistoryResultSchemas[method].parse(response.result) as MethodResult<M>;
        }
      }
      // The browser forwards this name to the runtime as the signed-in desktop user.
      return port.request("invoke", [method, params[0] ?? {}]) as Promise<MethodResult<M>>;
    },
  };
  target.auxHostProof = { host: "chromium-fork" };
  return true;
}
