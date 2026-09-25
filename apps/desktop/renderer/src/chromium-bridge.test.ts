import { describe, expect, it, vi } from "vitest";
import { installChromiumBridge, type ChromiumHostPort } from "./chromium-bridge";

function fakeWindow(url: string, port?: ChromiumHostPort) {
  return { location: new URL(url), auxChromiumHost: port } as unknown as Parameters<
    typeof installChromiumBridge
  >[0] & {
    aux?: {
      windowId: string;
      tabCommand: (...args: unknown[]) => Promise<unknown>;
      resolveSearch?: (query: string) => Promise<string>;
      onTabsPatch: (cb: (value: unknown) => void) => () => void;
    };
    auxHostProof?: { host: string };
  };
}

describe("Chromium Aux shell bridge", () => {
  it("refuses ordinary pages and other WebUI origins", () => {
    const port: ChromiumHostPort = {
      host: "chromium-fork",
      windowId: "win-1",
      profileId: "profile-1",
      platform: "darwin",
      privateMode: false,
      featureStages: { extensions: "on" },
      request: vi.fn(async () => null),
      subscribe: vi.fn(() => () => {}),
    };
    for (const url of ["https://aux.test/", "chrome://settings/"]) {
      const target = fakeWindow(url, port);
      expect(installChromiumBridge(target)).toBe(false);
      expect(target.aux).toBeUndefined();
    }
  });

  it("routes native commands and event subscriptions through the host port", async () => {
    const request = vi.fn(async () => ({ status: "applied", pageId: "page-1" }));
    const unsubscribe = vi.fn();
    const subscribe = vi.fn((_event: string, _callback: (...args: unknown[]) => void) => unsubscribe);
    const target = fakeWindow("chrome://aux/", {
      host: "chromium-fork",
      windowId: "win-1",
      profileId: "profile-1",
      platform: "darwin",
      privateMode: false,
      featureStages: { extensions: "on" },
      request,
      subscribe,
    });
    expect(installChromiumBridge(target)).toBe(true);
    expect(target.aux?.windowId).toBe("win-1");
    expect(target.auxHostProof?.host).toBe("chromium-fork");
    const command = { kind: "open", url: "https://example.test/" };
    expect(await target.aux?.tabCommand(command)).toEqual({ status: "applied", pageId: "page-1" });
    expect(request).toHaveBeenCalledWith("tabCommand", [command]);
    const callback = vi.fn();
    target.aux?.onTabsPatch(callback)();
    expect(subscribe).toHaveBeenCalledWith("onTabsPatch", callback);
    expect(unsubscribe).toHaveBeenCalledOnce();
    await target.aux?.resolveSearch?.("aux browser");
    expect(request).toHaveBeenCalledWith("resolveSearch", ["aux browser"]);
  });

  it("fails closed without the browser-process port", () => {
    const target = fakeWindow("chrome://aux/");
    expect(installChromiumBridge(target)).toBe(false);
    expect(target.aux).toBeUndefined();
  });

  it("routes Store lifecycle and action calls through the authenticated host port", async () => {
    const request = vi.fn(async (method: string) =>
      method === "showExtensionAction" || method === "removeExtension"
        ? true
        : { key: "abcdefghijklmnopabcdefghijklmnop" },
    );
    const target = fakeWindow("chrome://aux/", {
      host: "chromium-fork",
      windowId: "win-1",
      profileId: "profile-1",
      platform: "darwin",
      privateMode: false,
      featureStages: { extensions: "on" },
      request,
      subscribe: vi.fn(() => () => {}),
    });
    expect(installChromiumBridge(target)).toBe(true);
    const aux = target.aux as unknown as {
      installStoreExtension(id: string): Promise<unknown>;
      checkStoreExtensionUpdate(id: string): Promise<unknown>;
      reloadExtension(id: string): Promise<unknown>;
      showExtensionAction(id: string): Promise<boolean>;
      removeExtension(id: string): Promise<boolean>;
    };
    const id = "abcdefghijklmnopabcdefghijklmnop";
    await aux.installStoreExtension(id);
    await aux.checkStoreExtensionUpdate(id);
    await aux.reloadExtension(id);
    expect(await aux.showExtensionAction(id)).toBe(true);
    expect(await aux.removeExtension(id)).toBe(true);
    expect(request.mock.calls).toEqual([
      ["installStoreExtension", [id]],
      ["checkStoreExtensionUpdate", [id]],
      ["reloadExtension", [id]],
      ["showExtensionAction", [id]],
      ["removeExtension", [id]],
    ]);
  });
});

it("builds the move-tab destinations from the Profile catalog without hidden agent tabs", async () => {
  const request = vi.fn(async () => ({
    version: 1,
    windows: [
      { windowId: "current", activePageId: "a", order: ["a"] },
      { windowId: "other", activePageId: "b", order: ["b", "agent", "popup"] },
      { windowId: "empty", activePageId: null, order: [] },
    ],
    tabs: [
      { pageId: "a", windowId: "current", title: "Current" },
      { pageId: "b", windowId: "other", title: "Other window" },
      { pageId: "agent", windowId: "other", title: "Agent", runtimeOwned: true },
      { pageId: "popup", windowId: "other", title: "Popup", popup: true },
    ],
  }));
  const target = fakeWindow("chrome://aux/", {
    host: "chromium-fork", windowId: "current", profileId: "profile-1",
    platform: "darwin", privateMode: false, request, subscribe: vi.fn(() => () => {}),
  });
  installChromiumBridge(target);
  expect(await target.aux!.windows()).toEqual([
    { id: "other", title: "Other window", tabCount: 1 },
    { id: "empty", title: "Aux", tabCount: 0 },
  ]);
  expect(request).toHaveBeenCalledWith("tabsSnapshot", []);
});

it("registers the shared native shortcut bindings and reserves disabled defaults", async () => {
  const request = vi.fn(async () => true);
  const target = fakeWindow("chrome://aux/", {
    host: "chromium-fork", windowId: "current", profileId: "profile-1",
    platform: "darwin", privateMode: false, request, subscribe: vi.fn(() => () => {}),
  });
  installChromiumBridge(target);
  await target.aux!.setShortcutOverrides({
    palette: [{ key: "k", command: true, shift: true }],
    sidebar: null,
  });
  const [method, args] = request.mock.calls[0] as unknown as [string, [Array<Record<string, unknown>>]];
  expect(method).toBe("setShortcuts");
  const bindings = args[0];
  const chord = (key: string, shift = false) => bindings.filter(row => row.key === key && row.meta && row.shift === shift);
  expect(chord("k").at(-1)?.commandId).toBe("");
  expect(chord("k", true).at(-1)?.commandId).toBe("palette");
  expect(chord("s").at(-1)?.commandId).toBe("");
  expect(bindings.some(row => row.key === "left" && row.alt && !row.meta)).toBe(false);
  expect(chord("p").at(-1)?.commandId).toBe("print");
});
