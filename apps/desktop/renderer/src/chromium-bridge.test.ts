import { describe, expect, it, vi } from "vitest";
import { installChromiumBridge, type ChromiumHostPort } from "./chromium-bridge";

function fakeWindow(url: string, port?: ChromiumHostPort) {
  return { location: new URL(url), auxChromiumHost: port } as unknown as Parameters<typeof installChromiumBridge>[0] & {
    aux?: { windowId: string; tabCommand: (...args: unknown[]) => Promise<unknown>; onTabsPatch: (cb: (value: unknown) => void) => () => void };
    auxHostProof?: { host: string };
  };
}

describe("Chromium Aux shell bridge", () => {
  it("refuses ordinary pages and other WebUI origins", () => {
    const port: ChromiumHostPort = {
      host: "chromium-fork", windowId: "win-1", profileId: "profile-1", platform: "darwin", privateMode: false,
      request: vi.fn(async () => null), subscribe: vi.fn(() => () => {}),
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
      host: "chromium-fork", windowId: "win-1", profileId: "profile-1", platform: "darwin", privateMode: false,
      request, subscribe,
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
  });

  it("fails closed without the browser-process port", () => {
    const target = fakeWindow("chrome://aux/");
    expect(installChromiumBridge(target)).toBe(false);
    expect(target.aux).toBeUndefined();
  });
});
