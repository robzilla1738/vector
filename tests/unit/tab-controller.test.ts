import { describe, expect, it, vi } from "vitest";
import type { TabCommandEnvelope, TabPatch } from "@aux/contracts";
import { TabCatalog, newTabRecord } from "../../apps/desktop/main/tabs/catalog.js";
import { TabController, type TabPorts } from "../../apps/desktop/main/tabs/controller.js";

function harness() {
  const catalog = new TabCatalog();
  const published: TabPatch[] = [];
  const calls: string[] = [];
  let mint = 0;
  let closeResult = true;
  const owners = new Map<string, string>();
  const ports: TabPorts = {
    open: input => { calls.push(`open:${input.pageId}:${input.url}`); owners.set(input.pageId, input.windowId); if (input.activate) ports.focus(input.pageId); },
    close: async pageId => { calls.push(`close:${pageId}`); return closeResult; },
    focus: pageId => { calls.push(`focus:${pageId}`); },
    navigate: (pageId, url) => { calls.push(`navigate:${pageId}:${url}`); },
    back: pageId => { calls.push(`back:${pageId}`); },
    forward: pageId => { calls.push(`forward:${pageId}`); },
    reload: async (pageId, hard) => { calls.push(`reload:${pageId}:${hard}`); },
    stop: pageId => { calls.push(`stop:${pageId}`); },
    setMuted: (pageId, muted) => { calls.push(`mute:${pageId}:${muted}`); },
    move: async (pageId, windowId, activate) => {
      calls.push(`move:${pageId}:${windowId ?? "new"}`);
      const destination = windowId ?? "w-new";
      owners.set(pageId, destination);
      return { windowId: destination, sourceActivePageId: null, activePageId: activate ? pageId : null };
    },
    // Mirrors production: only live views have an owner — a persisted record
    // without a view reports undefined so the controller can materialize it.
    windowOf: pageId => owners.get(pageId),
    mintPageId: () => `p${++mint}`,
  };
  const placements: { pageId: string; windowId: string; placement: unknown }[] = [];
  const controller = new TabController({ catalog, ports, publish: patch => published.push(patch), placement: payload => placements.push(payload) });
  const env = (command: TabCommandEnvelope["command"], over: Partial<TabCommandEnvelope> = {}): TabCommandEnvelope =>
    ({ commandId: `cmd_${Math.random().toString(36).slice(2, 12)}`, windowId: "main", command, ...over });
  return { catalog, controller, ports, calls, published, placements, env, setCloseResult: (value: boolean) => { closeResult = value; } };
}

const open = async (h: ReturnType<typeof harness>, pageId: string, url = "https://a.test/") => {
  const ack = await h.controller.execute(h.env({ kind: "open", pageId, url }), "main");
  expect(ack.status).toBe("applied");
  return ack;
};

describe("TabController validation and scoping", () => {
  it("rejects malformed envelopes without touching ports", async () => {
    const h = harness();
    for (const raw of [null, {}, { commandId: "x" }, { commandId: "cmd_12345678", windowId: "main", command: { kind: "close" } }]) {
      const ack = await h.controller.execute(raw, "main");
      expect(ack.status).toBe("rejected");
      expect(ack.error?.code).toBe("invalid_params");
    }
    expect(h.calls).toEqual([]);
  });

  it("rejects commands issued for another window", async () => {
    const h = harness();
    const ack = await h.controller.execute(h.env({ kind: "open", url: "https://a.test/" }, { windowId: "other" }), "main");
    expect([ack.status, ack.error?.code]).toEqual(["rejected", "wrong_window"]);
    expect(h.calls).toEqual([]);
  });

  it("rejects targeted commands for tabs owned by another window", async () => {
    const h = harness();
    h.calls.length = 0;
    // The catalog says the tab lives in "second" — a "main" renderer may not actuate it.
    h.catalog.apply([{ op: "upsert", tab: newTabRecord({ pageId: "x", windowId: "second", url: "https://a.test/" }) }]);
    const ack = await h.controller.execute(h.env({ kind: "activate", pageId: "x" }), "main");
    expect([ack.status, ack.error?.code]).toEqual(["rejected", "wrong_window"]);
    expect(h.calls).toEqual([]);
  });

  it("rejects commands for tabs that no longer exist", async () => {
    const h = harness();
    const ack = await h.controller.execute(h.env({ kind: "close", pageId: "ghost" }), "main");
    expect([ack.status, ack.error?.code]).toEqual(["rejected", "not_found"]);
  });
});

describe("TabController dedup and staleness", () => {
  it("replays the original ack for a repeated commandId without re-actuating", async () => {
    const h = harness();
    const envelope = h.env({ kind: "open", url: "https://a.test/" });
    const first = await h.controller.execute(envelope, "main");
    const again = await h.controller.execute(envelope, "main");
    expect(first.status).toBe("applied");
    expect(again.status).toBe("duplicate");
    expect(again.pageId).toBe(first.pageId);
    expect(h.calls.filter(call => call.startsWith("open:"))).toHaveLength(1);
    expect(h.catalog.all()).toHaveLength(1);
  });

  it("rejects a targeted command the tab outgrew, but never for content churn", async () => {
    const h = harness();
    await open(h, "one");
    const baseline = h.catalog.currentVersion;
    // Content update (title) must not make the tab "newer" for staleness.
    const current = h.catalog.tab("one")!;
    h.catalog.apply([{ op: "upsert", tab: { ...current, title: "New" } }]);
    const fresh = await h.controller.execute(h.env({ kind: "navigate", pageId: "one", url: "https://b.test/" }, { catalogVersion: baseline }), "main");
    expect(fresh.status).toBe("applied");
    // A structural change (generation bump) does make it stale.
    const moved = h.catalog.tab("one")!;
    h.catalog.apply([{ op: "upsert", tab: { ...moved, generation: 1 } }]);
    const stale = await h.controller.execute(h.env({ kind: "close", pageId: "one" }, { catalogVersion: baseline }), "main");
    expect([stale.status, stale.error?.code]).toEqual(["rejected", "stale_tab"]);
  });
});

describe("TabController command application", () => {
  it("open actuates the view, records the tab, and publishes upsert+window ops", async () => {
    const h = harness();
    const ack = await h.controller.execute(h.env({ kind: "open", url: "https://a.test/", activate: true }), "main");
    expect(ack.status).toBe("applied");
    expect(ack.pageId).toBe("p1");
    expect(h.calls).toEqual(["open:p1:https://a.test/", "focus:p1"]);
    expect(h.catalog.tab("p1")?.url).toBe("https://a.test/");
    expect(h.catalog.window("main")?.activePageId).toBe("p1");
    expect(h.published).toHaveLength(1);
    expect(h.published[0]!.ops.map(op => op.op)).toEqual(["upsert", "window"]);
  });

  it("rejects an optimistic pageId that is already taken", async () => {
    const h = harness();
    await open(h, "one");
    const ack = await h.controller.execute(h.env({ kind: "open", pageId: "one", url: "https://b.test/" }), "main");
    expect([ack.status, ack.error?.code]).toEqual(["rejected", "duplicate_page"]);
  });

  it("close honors a beforeunload veto and does not emit a remove patch", async () => {
    const h = harness();
    await open(h, "one");
    h.setCloseResult(false);
    const publishedBefore = h.published.length;
    const ack = await h.controller.execute(h.env({ kind: "close", pageId: "one" }), "main");
    expect([ack.status, ack.error?.code]).toEqual(["rejected", "close_vetoed"]);
    expect(h.catalog.tab("one")).toBeTruthy();
    expect(h.published).toHaveLength(publishedBefore);
  });

  it("closing the active tab moves activation to the neighbour", async () => {
    const h = harness();
    await open(h, "one");
    await open(h, "two");
    await h.controller.execute(h.env({ kind: "activate", pageId: "two" }), "main");
    const ack = await h.controller.execute(h.env({ kind: "close", pageId: "two" }), "main");
    expect(ack.status).toBe("applied");
    expect(h.catalog.tab("two")).toBeUndefined();
    expect(h.catalog.window("main")?.order).toEqual(["one"]);
    expect(h.catalog.window("main")?.activePageId).toBe("one");
    expect(h.calls).toContain("focus:one");
  });

  it("navigate clears a stale navigation error and marks the tab loading", async () => {
    const h = harness();
    await open(h, "one");
    const withError = { ...h.catalog.tab("one")!, navigationError: { url: "https://bad.test/", code: -105, message: "DNS" }, loading: false };
    h.catalog.apply([{ op: "upsert", tab: withError }]);
    const ack = await h.controller.execute(h.env({ kind: "navigate", pageId: "one", url: "https://good.test/" }), "main");
    expect(ack.status).toBe("applied");
    expect(h.catalog.tab("one")).toMatchObject({ url: "https://good.test/", loading: true });
    expect(h.catalog.tab("one")?.navigationError).toBeUndefined();
  });

  it("reorder requires same-window ids and preserves trailing tabs", async () => {
    const h = harness();
    await open(h, "one");
    await open(h, "two");
    await open(h, "three");
    const ack = await h.controller.execute(h.env({ kind: "reorder", order: ["three", "one"] }), "main");
    expect(ack.status).toBe("applied");
    expect(h.catalog.window("main")?.order).toEqual(["three", "one", "two"]);
    const foreign = await h.controller.execute(h.env({ kind: "reorder", order: ["one", "ghost"] }), "main");
    expect(foreign.status).toBe("rejected");
  });

  it("move republishes both window orders, reports the destination, and relays placement", async () => {
    const h = harness();
    await open(h, "one");
    await open(h, "two");
    const placement = { space: { id: "s1", name: "Work", color: "blue" } };
    const ack = await h.controller.execute(h.env({ kind: "move", pageId: "one", placement }), "main");
    expect(ack.status).toBe("applied");
    expect(ack.windowId).toBe("w-new");
    expect(h.calls).toContain("move:one:new");
    expect(h.catalog.tab("one")?.windowId).toBe("w-new");
    expect(h.catalog.window("main")?.order).toEqual(["two"]);
    expect(h.catalog.window("w-new")?.order).toEqual(["one"]);
    const patch = h.published.at(-1)!;
    expect(patch.ops.map(op => op.op)).toEqual(["upsert", "window", "window"]);
    expect(h.placements).toEqual([{ pageId: "one", windowId: "w-new", placement }]);
  });

  it("move to the same window is a no-op without a patch", async () => {
    const h = harness();
    await open(h, "one");
    const before = h.published.length;
    const ack = await h.controller.execute(h.env({ kind: "move", pageId: "one", windowId: "main" }), "main");
    expect(ack.status).toBe("applied");
    expect(ack.windowId).toBe("main");
    expect(h.published).toHaveLength(before);
  });

  it("a window cannot move another window's tab", async () => {
    const h = harness();
    h.catalog.apply([{ op: "upsert", tab: newTabRecord({ pageId: "x", windowId: "second", url: "https://a.test/" }) }]);
    const ack = await h.controller.execute(h.env({ kind: "move", pageId: "x" }), "main");
    expect([ack.status, ack.error?.code]).toEqual(["rejected", "wrong_window"]);
    expect(h.calls.filter(call => call.startsWith("move:"))).toEqual([]);
  });

  it("honors runtimeOwned only for trusted issuers", async () => {
    const h = harness();
    const human = await h.controller.execute(h.env({ kind: "open", url: "https://a.test/", runtimeOwned: true }), "main");
    expect(h.catalog.tab(human.pageId!)?.runtimeOwned).toBe(false);
    const agent = await h.controller.execute(h.env({ kind: "open", url: "https://b.test/", runtimeOwned: true }), "main", { trusted: true });
    const tab = h.catalog.tab(agent.pageId!);
    expect(tab?.runtimeOwned).toBe(true);
    expect(h.published.at(-1)!.ops[0]).toMatchObject({ op: "upsert", origin: "runtime" });
  });

  it("a trusted open on a persisted record materializes it with a bumped generation", async () => {
    const h = harness();
    h.catalog.apply([{ op: "upsert", tab: newTabRecord({ pageId: "one", windowId: "main", url: "https://a.test/" }) }]);
    const ack = await h.controller.execute(h.env({ kind: "open", pageId: "one", url: "https://a.test/" }), "main", { trusted: true });
    expect(ack.status).toBe("applied");
    expect(h.calls).toContain("open:one:https://a.test/");
    expect(h.catalog.tab("one")?.generation).toBe(1);
  });

  it("a trusted open on a live tab is idempotent — no second view, same generation", async () => {
    const h = harness();
    await open(h, "one");
    const callsBefore = h.calls.filter(call => call.startsWith("open:")).length;
    const ack = await h.controller.execute(h.env({ kind: "open", pageId: "one", url: "https://a.test/" }), "main", { trusted: true });
    expect(ack.status).toBe("applied");
    expect(h.calls.filter(call => call.startsWith("open:"))).toHaveLength(callsBefore + 1);
    expect(h.catalog.tab("one")?.generation).toBe(0);
  });

  it("a reopened pageId carries the next generation so stale commands stay rejected", async () => {
    const h = harness();
    await open(h, "one");
    await h.controller.execute(h.env({ kind: "close", pageId: "one" }), "main");
    const reopened = await h.controller.execute(h.env({ kind: "open", pageId: "one", url: "https://a.test/" }), "main");
    expect(reopened.status).toBe("applied");
    expect(h.catalog.tab("one")?.generation).toBe(1);
  });

  it("maps actuation failures to an unavailable rejection", async () => {
    const h = harness();
    await open(h, "one");
    const spy = vi.spyOn(h.ports, "navigate").mockImplementation(() => { throw new Error("view gone"); });
    const ack = await h.controller.execute(h.env({ kind: "navigate", pageId: "one", url: "https://b.test/" }), "main");
    expect([ack.status, ack.error?.code]).toEqual(["rejected", "unavailable"]);
    spy.mockRestore();
  });
});
