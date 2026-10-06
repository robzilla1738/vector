import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { randomUUID } from "node:crypto";
import { afterEach, expect, it } from "vitest";
import { EventBus, openDb, Repo } from "@aux/runtime";
import { memoryTransportPair, PageTargetSchema, RpcChannel } from "@aux/contracts";
import { PageRegistry } from "../../apps/runtime/src/services/pages/registry.js";
import { CommandRankingStore } from "../../apps/runtime/src/services/command-ranking.js";
import { registerNativeCommandRanking } from "../../apps/runtime/src/services/command-ranking-native.js";
import type { NativeBridge } from "../../apps/runtime/src/native.js";
const repos: Repo[] = [];
afterEach(() => {
  for (const repo of repos.splice(0)) repo.close();
});
function fixture() {
  const repo = new Repo(openDb(":memory:"));
  repos.push(repo);
  const registry = new PageRegistry({
    turnMentions: fixtureTurnMentions((pageId) => repo.getPage(pageId)),
    repo,
    events: new EventBus(repo),
    native: { available: () => false } as NativeBridge,
    drivers: () => ({ aux: null, chrome: null }),
  });
  const page = PageTargetSchema.parse({
    pageId: "page",
    windowId: "window",
    windowKind: "normal",
    backend: "aux",
    targetId: "target",
    url: "https://example.com/link?utm_source=fixture#part",
    title: "Link",
    documentEpoch: 1,
    lastRevision: 0,
    viewStatus: "visible",
    controller: "human",
    ownedByRuntime: false,
    createdAt: 1,
    lastActiveAt: 1,
  });
  registry.addLive(page, null);
  const ranking = new CommandRankingStore(repo, "profile", () => 1000);
  const [host, runtime] = memoryTransportPair(),
    caller = new RpcChannel(host),
    channel = new RpcChannel(runtime);
  registerNativeCommandRanking(
    channel,
    { get: registry.get.bind(registry), livePageIds: registry.livePageIds.bind(registry) },
    ranking,
  );
  return {
    caller,
    registry,
    ranking,
    page,
    pick: { pageId: page.pageId, url: page.url, navigationId: randomUUID() },
  };
}
it("records a genuine native link pick through the authenticated channel once", async () => {
  const f = fixture();
  expect(await f.caller.call("command.ranking.link", f.pick)).toEqual({ recorded: true });
  expect(f.ranking.list()).toMatchObject([
    { candidateKey: "https://example.com/link", frequency: 1, source: "history" },
  ]);
  expect(await f.caller.call("command.ranking.link", f.pick)).toEqual({ recorded: false });
  expect(f.ranking.list()[0]!.frequency).toBe(1);
});
it.each(["agent", "external"] as const)("refuses %s-controlled navigation feedback", async (controller) => {
  const f = fixture();
  f.registry.get(f.page.pageId).controller = controller;
  await expect(f.caller.call("command.ranking.link", f.pick)).rejects.toMatchObject({
    code: "permission_denied",
  });
  expect(f.ranking.list()).toEqual([]);
});
it("withholds replaced URL and private/removed-page feedback", async () => {
  const f = fixture(),
    page = f.registry.get(f.page.pageId);
  page.url = "https://example.com/replaced";
  await expect(f.caller.call("command.ranking.link", f.pick)).rejects.toMatchObject({
    code: "permission_denied",
  });
  page.url = f.pick.url;
  page.windowKind = "private";
  await expect(f.caller.call("command.ranking.link", f.pick)).rejects.toMatchObject({
    code: "permission_denied",
  });
  f.registry.live.delete(page.pageId);
  await expect(f.caller.call("command.ranking.link", f.pick)).rejects.toMatchObject({ code: "not_found" });
  expect(f.ranking.list()).toEqual([]);
});
