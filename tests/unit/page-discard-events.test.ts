import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { afterEach, describe, expect, it } from "vitest";
import type { DriverPage, DriverPageEvents } from "@aux/chromium-driver";
import { EventTypes, type PageTarget } from "@aux/contracts";
import { EventBus, openDb, Repo } from "@aux/runtime";
import type { NativeBridge } from "../../apps/runtime/src/native.js";
import { PageRegistry } from "../../apps/runtime/src/services/pages/registry.js";

const repos: Repo[] = [];
afterEach(() => {
  for (const repo of repos.splice(0)) repo.close();
});

function target(backend: PageTarget["backend"]): PageTarget {
  return {
    pageId: "red",
    windowId: "main",
    backend,
    targetId: "target-red",
    url: "https://example.test/red",
    title: "Red",
    documentEpoch: 1,
    lastRevision: 0,
    viewStatus: "visible",
    lifecycle: "live",
    controller: "human",
    controllerEpoch: 0,
    ownedByRuntime: false,
    createdAt: 1,
    lastActiveAt: 1,
  };
}

/** addLive installs the real onDestroyed handler; the test then fires it. */
function closeTarget(
  native: boolean,
  backend: PageTarget["backend"],
  reason: "closed" | "crashed" = "closed",
) {
  const repo = new Repo(openDb(":memory:"));
  repos.push(repo);
  const events = new EventBus(repo);
  const seen: { type: string; payload: Record<string, unknown> }[] = [];
  events.subscribe((event) => {
    seen.push({ type: event.type, payload: event.payload });
  });
  const registry = new PageRegistry({
    turnMentions: fixtureTurnMentions((pageId) => repo.getPage(pageId)),
    repo,
    events,
    native: { available: () => native } as NativeBridge,
    drivers: () => ({ aux: null, chrome: null }),
  });
  let onDestroyed: DriverPageEvents["onDestroyed"];
  const driver = {
    setEvents(handlers: DriverPageEvents) {
      onDestroyed = handlers.onDestroyed;
    },
  } as unknown as DriverPage;
  registry.addLive(target(backend), driver);
  if (!onDestroyed) throw new Error("wireDriverEvents did not install onDestroyed");
  const before = seen.length;
  onDestroyed(reason);
  return { registry, seen: seen.slice(before) };
}

describe("PageRegistry.wireDriverEvents onDestroyed", () => {
  it("keeps a native aux discard as a detached page update", () => {
    const { registry, seen } = closeTarget(true, "aux", "closed");
    expect(seen.map((event) => event.type)).toEqual([EventTypes.PageUpdated]);
    expect(seen[0]?.payload).toEqual({ pageId: "red", viewStatus: "detached" });
    expect(seen.some((event) => event.type === EventTypes.PageRemoved)).toBe(false);
    expect(registry.live.has("red")).toBe(true);
    expect(registry.get("red").viewStatus).toBe("detached");
  });

  it("still removes the page when the native host is unavailable", () => {
    const { seen } = closeTarget(false, "aux", "closed");
    expect(seen.map((event) => event.type)).toEqual([EventTypes.PageRemoved]);
    expect(seen[0]?.payload).toMatchObject({ pageId: "red", reason: "closed" });
    expect(seen.some((event) => event.type === EventTypes.PageUpdated)).toBe(false);
  });

  it("still removes a non-aux page and still reports a crash", () => {
    const chrome = closeTarget(true, "chrome", "closed");
    expect(chrome.seen.map((event) => event.type)).toEqual([EventTypes.PageRemoved]);
    const crashed = closeTarget(true, "aux", "crashed");
    expect(crashed.seen.map((event) => event.type)).toEqual([EventTypes.PageCrashed]);
    expect(crashed.registry.get("red").viewStatus).toBe("crashed");
  });
});
