import { afterEach, describe, expect, it } from "vitest";
import type { BrowserDriver, DriverPage, DriverPageEvents } from "@aux/chromium-driver";
import type { PageTarget } from "@aux/contracts";
import { EventBus, openDb, Repo } from "@aux/runtime";
import type { NativeBridge } from "../../apps/runtime/src/native.js";
import { PageNavigation } from "../../apps/runtime/src/services/pages/navigation.js";
import { PageLanes } from "../../apps/runtime/src/services/pages/lanes.js";
import { ActivationPolicy } from "../../apps/runtime/src/services/pages/activation.js";
import { PageRegistry } from "../../apps/runtime/src/services/pages/registry.js";

const repos: Repo[] = [];
afterEach(() => { for (const repo of repos.splice(0)) repo.close(); });
function target(sessionId = "persisted-session"): PageTarget {
  return { pageId: "session-tab", windowId: "main", backend: "aux", targetId: "target-tab",
    url: "https://session.test/start", title: "Initial", documentEpoch: 1, lastRevision: 0,
    viewStatus: "visible", lifecycle: "live", controller: "human", controllerEpoch: 0,
    ownedByRuntime: false, createdAt: 1, lastActiveAt: 1, sessionId };
}
function page(initialTitle: string | Promise<string> = "Current") {
  let handlers: DriverPageEvents = {};
  let url = "https://session.test/start";
  let title: string | Promise<string> = initialTitle;
  const driver = { setEvents: (value: DriverPageEvents) => { handlers = value; },
    isAttached: () => true, title: async () => title, url: () => url,
    dispose: async () => {}, identity: { pageId: "session-tab", targetId: "target-tab", backend: "aux" },
  } as unknown as DriverPage;
  return { driver, events: () => handlers, setUrl: (value: string) => { url = value; },
    setTitle: (value: string | Promise<string>) => { title = value; } };
}
function registry(next: () => DriverPage, recoverPage = async () => ({ ok: true })) {
  const repo = new Repo(openDb(":memory:")); repos.push(repo);
  const driver = { attach: async () => next() } as unknown as BrowserDriver;
  return new PageRegistry({ repo, events: new EventBus(repo),
    native: { available: () => true, recoverPage } as unknown as NativeBridge,
    drivers: () => ({ aux: driver, chrome: null }) });
}

describe("real PageRegistry attachment identity", () => {
  it("mints a real attachment identity and removes persisted identity from restored placeholders", async () => {
    const attached = page();
    const pages = registry(() => attached.driver);
    const dormant = pages.addLive(target(), null);
    expect(dormant.target.sessionId).toBeUndefined();
    expect(dormant.driver).toBeNull();
    await pages.attachVisible(dormant.target.pageId);
    expect(dormant.target.sessionId).toMatch(/^[0-9a-f-]{36}$/);
    expect(dormant.target.sessionId).not.toBe("persisted-session");
    const direct = pages.addLive(target("saved-again"), attached.driver);
    expect(direct.target.sessionId).toMatch(/^[0-9a-f-]{36}$/);
    expect(direct.target.sessionId).not.toBe(dormant.target.sessionId);
  });

  it("retains identity through navigation and title refresh, then clears it on destruction and remints on reattach", async () => {
    const first = page(), second = page("Reattached");
    const pages = registry(() => second.driver);
    const live = pages.addLive(target(), first.driver);
    const session = live.target.sessionId;
    first.setUrl("https://session.test/next");
    first.setTitle("Next");
    first.events().onNavigated?.("https://session.test/next", 2);
    await pages.refreshMeta(live);
    expect(live.target).toMatchObject({ sessionId: session, documentEpoch: 2, title: "Next", url: "https://session.test/next" });
    await pages.attachVisible(live.target.pageId);
    expect(live.target.sessionId).toBe(session);
    first.events().onDestroyed?.("closed");
    expect(live.target.sessionId).toBeUndefined();
    expect(live.driver).toBeNull();
    await pages.attachVisible(live.target.pageId);
    expect(live.driver).toBe(second.driver);
    expect(live.target.sessionId).toMatch(/^[0-9a-f-]{36}$/);
    expect(live.target.sessionId).not.toBe(session);
  });

  it("ignores stale navigation, destruction and awaited metadata from a replaced driver attachment", async () => {
    let release!: (title: string) => void;
    const pendingTitle = new Promise<string>(resolve => { release = resolve; });
    const first = page(pendingTitle), second = page("Replacement");
    const pages = registry(() => second.driver);
    const live = pages.addLive(target(), first.driver);
    const stale = first.events();
    const metadata = pages.refreshMeta(live);
    stale.onDestroyed?.("closed");
    await pages.attachVisible(live.target.pageId);
    await pages.refreshMeta(live);
    const current = { ...live.target };
    first.setUrl("https://stale.test/secret");
    stale.onNavigated?.("https://stale.test/secret", 99);
    stale.onDestroyed?.("crashed");
    release("Stale title");
    await metadata;
    expect(live.target).toEqual(current);
    expect(live.driver).toBe(second.driver);
  });

  it("ignores callbacks and metadata from a removed LivePage even when its page id is reused", async () => {
    let release!: (title: string) => void;
    const first = page(new Promise<string>(resolve => { release = resolve; }));
    const second = page("New live page");
    const pages = registry(() => second.driver);
    const old = pages.addLive(target(), first.driver);
    const metadata = pages.refreshMeta(old);
    const replacement = pages.addLive(target(), second.driver);
    await pages.refreshMeta(replacement);
    const current = { ...replacement.target };
    first.events().onNavigated?.("https://removed.test/", 123);
    first.events().onDestroyed?.("closed");
    release("Removed title");
    await metadata;
    expect(pages.get(replacement.target.pageId)).toEqual(current);
    expect(replacement.driver).toBe(second.driver);
  });
  it("uses the central attachment producer on the actual crash-reload path", async () => {
    const first = page(), second = page("Recovered");
    const pages = registry(() => second.driver);
    const live = pages.addLive(target(), first.driver);
    const oldSession = live.target.sessionId;
    live.target.viewStatus = "crashed";
    const navigation = new PageNavigation(pages, new PageLanes(pages), new ActivationPolicy(pages));
    await navigation.reload(live.target.pageId);
    expect(live.driver).toBe(second.driver);
    expect(live.target.sessionId).toMatch(/^[0-9a-f-]{36}$/);
    expect(live.target.sessionId).not.toBe(oldSession);
    const recoveredSession = live.target.sessionId;
    pages.installDriver(live, second.driver);
    expect(live.target.sessionId).toBe(recoveredSession);
    first.events().onDestroyed?.("closed");
    expect(live.driver).toBe(second.driver);
    expect(live.target.sessionId).toBe(recoveredSession);
  });

  it("does not replace a newer attachment while native crash recovery awaits", async () => {
    let release!: () => void;
    let entered!: () => void;
    const recovering = new Promise<void>(resolve => { entered = resolve; });
    const paused = new Promise<void>(resolve => { release = resolve; });
    const first = page(), replacement = page("Newer attachment");
    const pages = registry(() => replacement.driver, async () => { entered(); await paused; return { ok: true }; });
    const old = pages.addLive(target(), first.driver);
    old.target.viewStatus = "crashed";
    const navigation = new PageNavigation(pages, new PageLanes(pages), new ActivationPolicy(pages));
    const reload = navigation.reload(old.target.pageId);
    await recovering;
    const current = pages.addLive(target(), replacement.driver);
    const session = current.target.sessionId;
    release();
    await expect(reload).rejects.toMatchObject({ code: "target_detached" });
    expect(pages.live.get(current.target.pageId)).toBe(current);
    expect(current.driver).toBe(replacement.driver);
    expect(current.target.sessionId).toBe(session);
  });

});
