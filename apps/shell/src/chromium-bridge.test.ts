import { describe, expect, it, vi } from "vitest";
import { installChromiumBridge, type ChromiumHostPort } from "./chromium-bridge";
import type { Download } from "@aux/contracts";
import { chromiumFeatureStages } from "./feature-stage-reconciliation";

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
  it.each(["normal", "private", "little", "quick-ask"] as const)(
    "preserves the native %s window identity",
    (windowKind) => {
      const target = fakeWindow("chrome://aux/", {
        host: "chromium-fork",
        windowId: "win-1",
        profileId: "profile-1",
        platform: "darwin",
        privateMode: windowKind === "private",
        windowKind,
        request: vi.fn(async () => true),
        subscribe: vi.fn(() => () => {}),
      });
      expect(installChromiumBridge(target)).toBe(true);
      expect((target.aux as unknown as { windowKind: string }).windowKind).toBe(windowKind);
      expect(target.aux).not.toHaveProperty("quickAskMode");
    },
  );

  it("sends rebound native window chords while reserving their original menu chords", async () => {
    const request = vi.fn(async () => true);
    const target = fakeWindow("chrome://aux/", {
      host: "chromium-fork",
      windowId: "win-1",
      profileId: "profile-1",
      platform: "darwin",
      privateMode: false,
      windowKind: "normal",
      request,
      subscribe: vi.fn(() => () => {}),
    });
    installChromiumBridge(target);
    const aux = target.aux as unknown as {
      setShortcutOverrides(value: Record<string, unknown>): Promise<boolean>;
    };
    await aux.setShortcutOverrides({ "new-window": [{ key: "F12", ctrl: true, alt: true }] });
    const [method, args] = request.mock.calls[0]! as unknown as [
      string,
      Array<Array<Record<string, unknown>>>,
    ];
    expect(method).toBe("setShortcuts");
    const rows = args[0]!;
    expect(rows).toContainEqual(
      expect.objectContaining({ commandId: "new-window", key: "F12", ctrl: true, alt: true }),
    );
    expect(rows).toContainEqual(
      expect.objectContaining({ commandId: "", key: "n", meta: true, shift: false }),
    );
    expect(rows).not.toContainEqual(
      expect.objectContaining({ commandId: "new-window", key: "n", meta: true }),
    );
    expect(rows.length).toBeLessThanOrEqual(512);
  });
  it("preserves missing native capabilities even when runtime reports on", async () => {
    const request = vi.fn(async () => ({ version: 1, featureStages: { spaces: "on", memory: "on" } }));
    const target = fakeWindow("chrome://aux/", {
      host: "chromium-fork",
      windowId: "win-1",
      profileId: "ordinary",
      platform: "darwin",
      privateMode: false,
      windowKind: "normal",
      featureStages: { spaces: "off", memory: "off" },
      request,
      subscribe: vi.fn(() => () => {}),
    });
    installChromiumBridge(target);
    expect(chromiumFeatureStages(target)).toEqual({ spaces: "off", memory: "off" });
    expect(request).not.toHaveBeenCalled();
  });
  it("refuses ordinary pages and other WebUI origins", () => {
    const port: ChromiumHostPort = {
      host: "chromium-fork",
      windowId: "win-1",
      profileId: "profile-1",
      platform: "darwin",
      privateMode: false,
      windowKind: "normal",
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
    const request = vi.fn(async (method: string) =>
      method === "resolveSearch"
        ? "https://search.test/?q=aux"
        : { commandId: "cmd-1", status: "applied", catalogVersion: 1, pageId: "page-1" },
    );
    const unsubscribe = vi.fn();
    const subscribe = vi.fn((_event: string, _callback: (...args: unknown[]) => void) => unsubscribe);
    const target = fakeWindow("chrome://aux/", {
      host: "chromium-fork",
      windowId: "win-1",
      profileId: "profile-1",
      platform: "darwin",
      privateMode: false,
      windowKind: "normal",
      featureStages: { extensions: "on", searchEngines: "on" },
      request,
      subscribe,
    });
    expect(installChromiumBridge(target)).toBe(true);
    expect(target.aux?.windowId).toBe("win-1");
    expect(target.auxHostProof?.host).toBe("chromium-fork");
    const command = { kind: "open", url: "https://example.test/" };
    expect(await target.aux?.tabCommand(command)).toEqual({
      commandId: "cmd-1",
      status: "applied",
      catalogVersion: 1,
      pageId: "page-1",
    });
    expect(request).toHaveBeenCalledWith("tabCommand", [command]);
    const callback = vi.fn();
    target.aux?.onTabsPatch(callback)();
    expect(subscribe).toHaveBeenCalledWith("onTabsPatch", expect.any(Function));
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
        : {
            key: "abcdefghijklmnopabcdefghijklmnop",
            id: "abcdefghijklmnopabcdefghijklmnop",
            name: "Fixture",
            version: "1.0.0",
            permissions: [],
            enabled: true,
            loaded: true,
            managed: false,
            source: "store",
          },
    );
    const target = fakeWindow("chrome://aux/", {
      host: "chromium-fork",
      windowId: "win-1",
      profileId: "profile-1",
      platform: "darwin",
      privateMode: false,
      windowKind: "normal",
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

  it("sends a runtime approval decision through the desktop invoke channel", async () => {
    const request = vi.fn(async () => ({ ok: true }));
    const target = fakeWindow("chrome://aux/", {
      host: "chromium-fork",
      windowId: "win-1",
      profileId: "profile-1",
      platform: "darwin",
      privateMode: false,
      windowKind: "normal",
      request,
      subscribe: vi.fn(() => () => {}),
    });
    expect(installChromiumBridge(target)).toBe(true);
    const decision = {
      decision: { decision: "accept", approvalId: "ap-1" },
      expectedTurnId: "turn-1",
    };
    const aux = target.aux as unknown as {
      invoke(method: string, params: unknown): Promise<unknown>;
    };
    expect(await aux.invoke("safety.approvals.decide", decision)).toEqual({ ok: true });
    expect(request).toHaveBeenCalledWith("invoke", ["safety.approvals.decide", decision]);
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
      {
        pageId: "a",
        windowId: "current",
        url: "https://a.test/",
        title: "Current",
        loading: false,
        muted: false,
        audible: false,
        canGoBack: false,
        canGoForward: false,
        popup: false,
        crashed: false,
        runtimeOwned: false,
        generation: 1,
        createdAt: 0,
        lastActiveAt: 0,
      },
      {
        pageId: "b",
        windowId: "other",
        url: "https://b.test/",
        title: "Other window",
        loading: false,
        muted: false,
        audible: false,
        canGoBack: false,
        canGoForward: false,
        popup: false,
        crashed: false,
        runtimeOwned: false,
        generation: 1,
        createdAt: 0,
        lastActiveAt: 0,
      },
      {
        pageId: "agent",
        windowId: "other",
        url: "https://c.test/",
        title: "Agent",
        runtimeOwned: true,
        loading: false,
        muted: false,
        audible: false,
        canGoBack: false,
        canGoForward: false,
        popup: false,
        crashed: false,
        generation: 1,
        createdAt: 0,
        lastActiveAt: 0,
      },
      {
        pageId: "popup",
        windowId: "other",
        url: "https://d.test/",
        title: "Popup",
        popup: true,
        loading: false,
        muted: false,
        audible: false,
        canGoBack: false,
        canGoForward: false,
        crashed: false,
        runtimeOwned: false,
        generation: 1,
        createdAt: 0,
        lastActiveAt: 0,
      },
    ],
  }));
  const target = fakeWindow("chrome://aux/", {
    host: "chromium-fork",
    windowId: "current",
    profileId: "profile-1",
    platform: "darwin",
    privateMode: false,
    windowKind: "normal",
    request,
    subscribe: vi.fn(() => () => {}),
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
    host: "chromium-fork",
    windowId: "current",
    profileId: "profile-1",
    platform: "darwin",
    privateMode: false,
    windowKind: "normal",
    request,
    subscribe: vi.fn(() => () => {}),
  });
  installChromiumBridge(target);
  await target.aux!.setShortcutOverrides({
    palette: [{ key: "k", command: true, shift: true }],
    sidebar: null,
  });
  const [method, args] = request.mock.calls[0] as unknown as [string, [Array<Record<string, unknown>>]];
  expect(method).toBe("setShortcuts");
  const bindings = args[0];
  const chord = (key: string, shift = false, ctrl = false) =>
    bindings.filter(
      (row) => row.key === key && row.meta && row.shift === shift && row.ctrl === ctrl && !row.alt,
    );
  expect(chord("k").at(-1)?.commandId).toBe("");
  expect(chord("k", true).at(-1)?.commandId).toBe("palette");
  expect(chord("s").at(-1)?.commandId).toBe("");
  expect(bindings.some((row) => row.key === "left" && row.alt && !row.meta)).toBe(false);
  expect(chord("p").at(-1)?.commandId).toBe("print");
  expect(chord("p", false, true).at(-1)?.commandId).toBe("picture-in-picture");
  expect(chord("k", true).at(-1)?.focusShell).toBe(true);
});

it("keeps the registry's first command when custom chords conflict", async () => {
  const request = vi.fn(async () => true);
  const target = fakeWindow("chrome://aux/", {
    host: "chromium-fork",
    windowId: "current",
    profileId: "profile-1",
    platform: "darwin",
    privateMode: false,
    windowKind: "normal",
    request,
    subscribe: vi.fn(() => () => {}),
  });
  installChromiumBridge(target);
  await target.aux!.setShortcutOverrides({ sidebar: [{ key: "k", command: true }] });
  const bindings = (request.mock.calls[0] as unknown as [string, [Array<Record<string, unknown>>]])[1][0];
  expect(bindings.filter((row) => row.key === "k" && row.meta && !row.shift).at(-1)?.commandId).toBe(
    "sidebar",
  );
});

it("keeps bookmark CRUD native, validates each result, and leaves offline article storage on the runtime", async () => {
  const request = vi.fn(async (method: string) =>
    method === "bookmarksInvoke"
      ? { method: "bookmarks.remove", result: { ok: true } }
      : { article: null, savedAt: null },
  );
  const target = fakeWindow("chrome://aux/", {
    host: "chromium-fork",
    windowId: "current",
    profileId: "profile-1",
    platform: "darwin",
    privateMode: false,
    windowKind: "normal",
    request,
    subscribe: vi.fn(() => () => {}),
  });
  installChromiumBridge(target);
  await target.aux!.invoke("bookmarks.remove", { url: "https://saved.test/", nodeId: "17" });
  expect(request).toHaveBeenLastCalledWith("bookmarksInvoke", [
    {
      method: "bookmarks.remove",
      params: { url: "https://saved.test/", nodeId: "17" },
    },
  ]);
  await target.aux!.invoke("bookmarks.offline.get", { url: "https://saved.test/" });
  expect(request).toHaveBeenLastCalledWith("invoke", [
    "bookmarks.offline.get",
    { url: "https://saved.test/" },
  ]);
  request.mockResolvedValueOnce({ moved: 1 } as never);
  await expect(target.aux!.invoke("bookmarks.remove", { url: "https://saved.test/" })).rejects.toThrow();
  const calls = request.mock.calls.length;
  await expect(target.aux!.invoke("bookmarks.move", { bookmarks: [], folderPath: [] })).rejects.toThrow();
  expect(request).toHaveBeenCalledTimes(calls);
});

it("preserves the contiguous runtime stream while native bookmark projection is handled separately", () => {
  let receive: ((payload: unknown) => void) | undefined;
  const stop = vi.fn();
  const target = fakeWindow("chrome://aux/", {
    host: "chromium-fork",
    windowId: "current",
    profileId: "profile-1",
    platform: "darwin",
    privateMode: false,
    windowKind: "normal",
    request: vi.fn(),
    subscribe: (_event, callback) => {
      receive = callback;
      return stop;
    },
  });
  installChromiumBridge(target);
  const callback = vi.fn();
  const unsubscribe = target.aux!.onEvent(callback);
  receive!({ seq: 1, streamId: "old", type: "bookmarks.changed", payload: {}, ts: 0 });
  expect(callback).toHaveBeenCalledOnce();
  receive!({ seq: 2, streamId: "old", type: "settings.changed", payload: {}, ts: 0 });
  expect(callback).toHaveBeenCalledTimes(2);
  unsubscribe();
  expect(stop).toHaveBeenCalledOnce();
});

it("keeps native download dismissal authoritative across held snapshots and late updates without the runtime", async () => {
  const item: Download = {
    id: "dismissed-guid",
    size: 100,
    filename: "report.pdf",
    path: "/tmp/report.pdf",
    state: "completed",
    startedAt: 1,
  };
  const resumable: Download = { ...item, id: "resumable-guid", state: "interrupted", canResume: true };
  let finishSnapshot!: (items: Download[]) => void;
  const listeners = new Map<string, Array<(value: unknown) => void>>();
  const request = vi.fn(async (method: string) => {
    if (method === "downloadsSnapshot")
      return new Promise<Download[]>((resolve) => {
        finishSnapshot = resolve;
      });
    if (method === "dismissDownloads") return { removed: [item.id] };
    throw new Error("Runtime unavailable");
  });
  const target = fakeWindow("chrome://aux/", {
    host: "chromium-fork",
    windowId: "download-window",
    profileId: "download-profile",
    platform: "darwin",
    privateMode: false,
    windowKind: "normal",
    request,
    subscribe: (event, callback) => {
      listeners.set(event, [...(listeners.get(event) ?? []), callback]);
      return () => {};
    },
  });
  installChromiumBridge(target);
  const aux = target.aux!;
  const update = vi.fn();
  aux.onDownload(update);
  const held = aux.invoke("downloads.list");
  expect(await aux.invoke("downloads.remove", { ids: [item.id, resumable.id] })).toEqual({
    removed: [item.id],
  });
  finishSnapshot([item, resumable]);
  expect(await held).toEqual([resumable]);
  for (const callback of listeners.get("onDownload") ?? []) callback(item);
  expect(update).not.toHaveBeenCalled();
  const next = aux.downloadsSnapshot();
  for (const callback of listeners.get("onDownloadsRemoved") ?? []) callback({ ids: [resumable.id] });
  finishSnapshot([resumable]);
  expect(await next).toEqual([]);
  expect(request.mock.calls.map(([method]) => method)).toEqual([
    "downloadsSnapshot",
    "dismissDownloads",
    "downloadsSnapshot",
  ]);
});
