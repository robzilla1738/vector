import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { afterEach, describe, expect, it, vi } from "vitest";
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
  return new PageRegistry({ turnMentions: fixtureTurnMentions(pageId => repo.getPage(pageId)), repo, events: new EventBus(repo),
    native: { available: () => true, recoverPage } as unknown as NativeBridge,
    drivers: () => ({ aux: driver, chrome: null }) });
}

describe("real PageRegistry attachment identity", () => {
  it("keeps catalog identity while retiring a controlled driver and admits only the fresh attachment", async () => {
    const first = page(), next = page("Fresh");
    next.setUrl("https://session.test/next");
    let attaches = 0;
    const pages = registry(() => { attaches++; return next.driver; });
    const live = pages.addLive({ ...target(), controller: "agent" }, first.driver);
    const oldSession = live.target.sessionId;
    const transition = pages.beginControlledTransition(live.target.pageId);
    first.events().onNavigated?.("https://foreign.test/", 90);
    expect(live.target.url).toBe("https://session.test/start");
    first.events().onDestroyed?.("closed");
    expect(live.driver).toBeNull();
    expect(live.target.sessionId).toBeUndefined();
    expect(live.target.controller).toBe("agent");
    await pages.attachVisible(live.target.pageId);
    expect(attaches).toBe(0);
    const admitted = await transition.attach({ url: "https://session.test/next", documentEpoch: 2 }, () => {});
    expect(admitted).toBe(next.driver);
    expect(attaches).toBe(1);
    expect(live.target.sessionId).not.toBe(oldSession);
    expect(live.target).toMatchObject({ pageId: "session-tab", controller: "agent", documentEpoch: 2, url: "https://session.test/next" });
    first.events().onDestroyed?.("crashed");
    expect(live.driver).toBe(next.driver);
  });

  it("refuses same-URL document replacement while the original command is pending", async () => {
    const first = page(), next = page();
    let attaches = 0;
    const pages = registry(() => { attaches++; return next.driver; });
    const live = pages.addLive({ ...target(), controller: "agent" }, first.driver);
    const transition = pages.beginControlledTransition(live.target.pageId);
    first.events().onDestroyed?.("closed");
    live.target.documentEpoch++;
    expect(transition.current()).toBe(false);
    await expect(transition.attach({ url: live.target.url, documentEpoch: 3 }, () => {}))
      .rejects.toMatchObject({ code: "ref_stale" });
    expect(attaches).toBe(0);
    await transition.cancel();
    expect(live.driver).toBeNull();
    expect(live.target.sessionId).toBeUndefined();
  });

  it("refuses a fresh attachment when takeover happens during its actual attach wait", async () => {
    const first = page(), next = page();
    let release!: () => void;
    let entered!: () => void;
    const waiting = new Promise<void>(resolve => { entered = resolve; });
    const held = new Promise<void>(resolve => { release = resolve; });
    const pages = registry(() => next.driver);
    pages.deps.drivers = () => ({ aux: { attach: async () => { entered(); await held; return next.driver; } } as unknown as BrowserDriver, chrome: null });
    const live = pages.addLive({ ...target(), controller: "agent" }, first.driver);
    const transition = pages.beginControlledTransition(live.target.pageId);
    first.events().onDestroyed?.("closed");
    const attaching = transition.attach({ url: "https://session.test/next", documentEpoch: 2 }, () => {});
    await waiting;
    live.target.controller = "human";
    live.target.controllerEpoch++;
    release();
    await expect(attaching).rejects.toMatchObject({ code: "ref_stale" });
    await transition.cancel();
    expect(live.driver).toBeNull();
    expect(live.target.sessionId).toBeUndefined();
    expect(live.target.documentEpoch).toBe(1);
    expect(live.target.controller).toBe("human");
  });

  it("refuses a fresh driver that still reports the prior document URL", async () => {
    const first = page(), next = page();
    const pages = registry(() => next.driver);
    const live = pages.addLive({ ...target(), controller: "agent" }, first.driver);
    const transition = pages.beginControlledTransition(live.target.pageId);
    first.events().onDestroyed?.("closed");
    await expect(transition.attach({ url: "https://session.test/next", documentEpoch: 2 }, () => {}))
      .rejects.toMatchObject({ code: "ref_stale" });
    await transition.cancel();
    expect(live.driver).toBeNull();
    expect(live.target.sessionId).toBeUndefined();
    expect(live.target.documentEpoch).toBe(1);
  });

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


it("retires a partially published fresh driver when its event binding throws", async () => {
  const first = page(), next = page("Fresh");
  next.setUrl("https://session.test/next");
  const failure = new Error("fresh event binding refused");
  const dispose = vi.fn(async () => {});
  Object.assign(next.driver, { setEvents: () => { throw failure; }, dispose });
  const pages = registry(() => next.driver);
  const live = pages.addLive({ ...target(), controller: "agent" }, first.driver);
  const transition = pages.beginControlledTransition(live.target.pageId);
  first.events().onDestroyed?.("closed");
  await expect(transition.attach({ url: "https://session.test/next", documentEpoch: 2 }, () => {})).rejects.toBe(failure);
  expect(dispose).toHaveBeenCalledTimes(1);
  expect(live.driver).toBeNull();
  expect(live.target.sessionId).toBeUndefined();
  await transition.cancel();
  expect(live.target.controller).toBe("none");
});


it("retains the original binding error and driver disposal error together", async () => {
  const first = page(), next = page("Fresh");
  next.setUrl("https://session.test/next");
  const binding = new Error("fresh binding refused"), disposal = new Error("fresh disposal refused");
  Object.assign(next.driver, { setEvents: () => { throw binding; }, dispose: async () => { throw disposal; } });
  const pages = registry(() => next.driver);
  const live = pages.addLive({ ...target(), controller: "agent" }, first.driver);
  const transition = pages.beginControlledTransition(live.target.pageId);
  first.events().onDestroyed?.("closed");
  const error = await transition.attach({ url: "https://session.test/next", documentEpoch: 2 }, () => {}).then(() => null, failure => failure);
  expect(error).toBeInstanceOf(AggregateError);
  expect(error.errors).toEqual([binding, disposal]);
  expect(live.driver).toBeNull();
  expect(live.target.sessionId).toBeUndefined();
});

it("preserves a foreign replacement row when the original fresh binding reenters and throws", async () => {
  const first = page(), next = page("Fresh"), foreign = page("Person replacement");
  next.setUrl("https://session.test/next");
  const failure = new Error("original binding refused");
  const pages = registry(() => next.driver);
  const live = pages.addLive({ ...target(), controller: "agent" }, first.driver);
  const transition = pages.beginControlledTransition(live.target.pageId);
  first.events().onDestroyed?.("closed");
  let replacement: ReturnType<PageRegistry["addLive"]> | undefined;
  Object.assign(next.driver, { setEvents: () => { replacement = pages.addLive(target(), foreign.driver); throw failure; } });
  await expect(transition.attach({ url: "https://session.test/next", documentEpoch: 2 }, () => {})).rejects.toBe(failure);
  expect(pages.live.get(live.target.pageId)).toBe(replacement);
  expect(replacement?.driver).toBe(foreign.driver);
  expect(replacement?.target.controller).toBe("human");
  expect(replacement?.target.sessionId).toMatch(/^[0-9a-f-]{36}$/);
});

it("preserves person control when a fresh binding takes over the original row and fails", async () => {
  const first = page(), next = page("Fresh");
  next.setUrl("https://session.test/next");
  const failure = new Error("binding lost person control");
  const pages = registry(() => next.driver);
  const live = pages.addLive({ ...target(), controller: "agent" }, first.driver);
  const transition = pages.beginControlledTransition(live.target.pageId);
  first.events().onDestroyed?.("closed");
  Object.assign(next.driver, { setEvents: () => { live.target.controller = "human"; live.target.controllerEpoch++; throw failure; } });
  await expect(transition.attach({ url: "https://session.test/next", documentEpoch: 2 }, () => {})).rejects.toBe(failure);
  await transition.cancel();
  expect(live.target.controller).toBe("human");
  expect(live.target.controllerEpoch).toBe(1);
  expect(live.driver).toBeNull();
  expect(live.target.sessionId).toBeUndefined();
});
