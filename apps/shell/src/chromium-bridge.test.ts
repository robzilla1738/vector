import type { AuxFeatureOverrides } from "@aux/contracts";
import { describe, expect, it, vi } from "vitest";
import { installChromiumBridge, reconcileChromiumFeatureStages, type ChromiumHostPort } from "./chromium-bridge";
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
  it("accepts only the Profile-scoped runtime AI Tidy stage for the shell and invoke gate", async () => {
    const request = vi.fn(async (method: string, args: unknown[]) =>
      method === "invoke" && args[0] === "runtime.describe"
        ? { version: 1, featureStages: { spaces: "on", aiTidy: "on", memory: "on" } }
        : { groups: [], pages: [] });
    const target = fakeWindow("chrome://aux/", {
      host: "chromium-fork", windowId: "win-1", profileId: "disposable",
      platform: "darwin", privateMode: false,
      featureStages: { spaces: "preview", aiTidy: "preview", memory: "preview" },
      request, subscribe: vi.fn(() => () => {}),
    });
    expect(installChromiumBridge(target)).toBe(true);
    const invoke = target.aux as unknown as { invoke(method: string, params: unknown): Promise<unknown> };
    await expect(invoke.invoke("agent.tidy.propose", { pageIds: [] })).rejects.toThrow(/aiTidy is preview/);
    await reconcileChromiumFeatureStages(target);
    expect(chromiumFeatureStages(target)).toMatchObject({ spaces: "on", aiTidy: "on", memory: "preview" });
    await invoke.invoke("agent.tidy.propose", { pageIds: [] });
    expect(request).toHaveBeenCalledWith("invoke", ["agent.tidy.propose", { pageIds: [] }]);
  });

  it.each([
    ["normal Profile preview", { version: 1, featureStages: { spaces: "on", aiTidy: "preview" } }],
    ["missing stages", { version: 1 }],
    ["malformed stages", { version: 1, featureStages: ["on"] }],
    ["wrong version", { version: 2, featureStages: { spaces: "on", aiTidy: "on" } }],
  ])("keeps AI Tidy in preview for %s", async (_label, description) => {
    const request = vi.fn(async () => description);
    const target = fakeWindow("chrome://aux/", {
      host: "chromium-fork", windowId: "win-1", profileId: "ordinary",
      platform: "darwin", privateMode: false,
      featureStages: { spaces: "on", aiTidy: "preview" },
      request, subscribe: vi.fn(() => () => {}),
    });
    installChromiumBridge(target);
    await reconcileChromiumFeatureStages(target);
    expect(chromiumFeatureStages(target)?.aiTidy).toBe("preview");
    const invoke = target.aux as unknown as { invoke(method: string, params: unknown): Promise<unknown> };
    await expect(invoke.invoke("agent.tidy.propose", { pageIds: [] })).rejects.toThrow(/aiTidy is preview/);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("copies disposable tab lifecycle onto the host port the sleep client checks", async () => {
    const request = vi.fn(async (method: string, args: unknown[]) => {
      if (method === "invoke" && args[0] === "runtime.describe")
        return { version: 1, featureStages: { spaces: "on", tabLifecycle: "on", aiTidy: "preview" } };
      if (method === "tabSleep") return { slept: false, reason: "Only a loaded background tab can sleep." };
      return {};
    });
    const featureStages: AuxFeatureOverrides = { spaces: "preview", aiTidy: "preview", tabLifecycle: "preview" };
    const target = fakeWindow("chrome://aux/", {
      host: "chromium-fork", windowId: "win-1", profileId: "disposable",
      platform: "darwin", privateMode: false,
      featureStages, request, subscribe: vi.fn(() => () => {}),
    });
    expect(installChromiumBridge(target)).toBe(true);
    const sleep = target.aux as unknown as { tabSleep(pageId: string, url: string): Promise<unknown> };
    await expect(sleep.tabSleep("page-1", "https://example.com/red")).rejects.toThrow(/tabLifecycle is preview/);
    await reconcileChromiumFeatureStages(target);
    expect(featureStages.tabLifecycle).toBe("on");
    expect(chromiumFeatureStages(target)?.tabLifecycle).toBe("on");
    await expect(sleep.tabSleep("page-1", "https://example.com/red")).resolves.toEqual({
      slept: false, reason: "Only a loaded background tab can sleep.",
    });
  });

  it("retries a missed runtime describe before leaving disposable tab lifecycle in preview", async () => {
    vi.useFakeTimers();
    try {
      let calls = 0;
      const request = vi.fn(async () => {
        calls += 1;
        if (calls === 1) throw new Error("backend_unavailable");
        return { version: 1, featureStages: { tabLifecycle: "on" } };
      });
      const featureStages: AuxFeatureOverrides = { spaces: "on", aiTidy: "on", tabLifecycle: "preview" };
      const target = fakeWindow("chrome://aux/", {
        host: "chromium-fork", windowId: "win-1", profileId: "disposable",
        platform: "darwin", privateMode: false,
        featureStages, request, subscribe: vi.fn(() => () => {}),
      });
      installChromiumBridge(target);
      const pending = reconcileChromiumFeatureStages(target);
      await vi.advanceTimersByTimeAsync(200);
      await pending;
      expect(featureStages.tabLifecycle).toBe("on");
      expect(request).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not query runtime or promote a private window", async () => {
    const request = vi.fn(async () => ({ version: 1, featureStages: { spaces: "on", aiTidy: "on" } }));
    const target = fakeWindow("chrome://aux/", {
      host: "chromium-fork", windowId: "win-1", profileId: "disposable",
      platform: "darwin", privateMode: true,
      featureStages: { spaces: "on", aiTidy: "preview" },
      request, subscribe: vi.fn(() => () => {}),
    });
    installChromiumBridge(target);
    await reconcileChromiumFeatureStages(target);
    expect(request).not.toHaveBeenCalled();
    expect(chromiumFeatureStages(target)?.aiTidy).toBe("preview");
  });
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
    const request = vi.fn(async (method: string) =>
      method === "resolveSearch" ? "https://search.test/?q=aux" : { commandId: "cmd-1", status: "applied", catalogVersion: 1, pageId: "page-1" });
    const unsubscribe = vi.fn();
    const subscribe = vi.fn((_event: string, _callback: (...args: unknown[]) => void) => unsubscribe);
    const target = fakeWindow("chrome://aux/", {
      host: "chromium-fork",
      windowId: "win-1",
      profileId: "profile-1",
      platform: "darwin",
      privateMode: false,
      featureStages: { extensions: "on", searchEngines: "on" },
      request,
      subscribe,
    });
    expect(installChromiumBridge(target)).toBe(true);
    expect(target.aux?.windowId).toBe("win-1");
    expect(target.auxHostProof?.host).toBe("chromium-fork");
    const command = { kind: "open", url: "https://example.test/" };
    expect(await target.aux?.tabCommand(command)).toEqual({ commandId: "cmd-1", status: "applied", catalogVersion: 1, pageId: "page-1" });
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
        : { key: "abcdefghijklmnopabcdefghijklmnop", id: "abcdefghijklmnopabcdefghijklmnop", name: "Fixture", version: "1.0.0", permissions: [], enabled: true, loaded: true, managed: false, source: "store" },
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

  it("sends a runtime approval decision through the desktop invoke channel", async () => {
    const request = vi.fn(async () => ({ ok: true }));
    const target = fakeWindow("chrome://aux/", {
      host: "chromium-fork",
      windowId: "win-1",
      profileId: "profile-1",
      platform: "darwin",
      privateMode: false,
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
      { pageId: "a", windowId: "current", url: "https://a.test/", title: "Current", loading: false, muted: false, audible: false, canGoBack: false, canGoForward: false, popup: false, crashed: false, runtimeOwned: false, generation: 1, createdAt: 0, lastActiveAt: 0 },
      { pageId: "b", windowId: "other", url: "https://b.test/", title: "Other window", loading: false, muted: false, audible: false, canGoBack: false, canGoForward: false, popup: false, crashed: false, runtimeOwned: false, generation: 1, createdAt: 0, lastActiveAt: 0 },
      { pageId: "agent", windowId: "other", url: "https://c.test/", title: "Agent", runtimeOwned: true, loading: false, muted: false, audible: false, canGoBack: false, canGoForward: false, popup: false, crashed: false, generation: 1, createdAt: 0, lastActiveAt: 0 },
      { pageId: "popup", windowId: "other", url: "https://d.test/", title: "Popup", popup: true, loading: false, muted: false, audible: false, canGoBack: false, canGoForward: false, crashed: false, runtimeOwned: false, generation: 1, createdAt: 0, lastActiveAt: 0 },
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

it("keeps the registry's first command when custom chords conflict", async () => {
  const request = vi.fn(async () => true);
  const target = fakeWindow("chrome://aux/", {
    host: "chromium-fork", windowId: "current", profileId: "profile-1",
    platform: "darwin", privateMode: false, request, subscribe: vi.fn(() => () => {}),
  });
  installChromiumBridge(target);
  await target.aux!.setShortcutOverrides({ sidebar: [{ key: "k", command: true }] });
  const bindings = (request.mock.calls[0] as unknown as [string, [Array<Record<string, unknown>>]])[1][0];
  expect(bindings.filter(row => row.key === "k" && row.meta && !row.shift).at(-1)?.commandId).toBe("sidebar");
});
