import { afterEach, expect, it, vi } from "vitest";
import { EventBus, NullNativeBridge, openDb, Repo } from "@aux/runtime";
import type { TabCommandEnvelope } from "@aux/contracts";
import { PageRegistry } from "../../apps/runtime/dist/services/pages/registry.js";
import { PageOpener } from "../../apps/runtime/dist/services/pages/opener.js";
import { navigateNativePage } from "../../apps/runtime/dist/services/pages/navigation.js";
import { NativeViewSync } from "../../apps/runtime/dist/services/pages/native-sync.js";
import { ActivationPolicy } from "../../apps/runtime/dist/services/pages/activation.js";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
const repos: Repo[] = [];
afterEach(() => {
  for (const repo of repos.splice(0)) repo.close();
});
function fixture() {
  const repo = new Repo(openDb(":memory:"));
  repos.push(repo);
  const tabCommand = vi.fn(async (input: TabCommandEnvelope) => ({
    commandId: input.commandId,
    status: "applied" as const,
    catalogVersion: 1,
    windowId: "main",
  }));
  const native = Object.assign(new NullNativeBridge(), {
    available: () => true,
    tabCommand,
    personReadContext: vi.fn(async () => {
      throw new Error("Blank and failed certificate documents cannot invent a person-read success");
    }),
    focusPage: vi.fn(async () => {}),
  });
  const pages = new PageRegistry({
    repo,
    events: new EventBus(repo),
    native,
    turnMentions: fixtureTurnMentions((id) => repo.getPage(id)),
    drivers: () => ({ aux: null, chrome: null }),
  });
  const activation = new ActivationPolicy(pages),
    opener = new PageOpener(pages, activation),
    sync = new NativeViewSync(pages, opener, activation);
  tabCommand.mockImplementation(async (input) => {
    if (input.command.kind === "navigate") {
      sync.onNativeNavigated(input.command.pageId, input.command.url);
      sync.onNativeNavigationError(input.command.pageId, {
        url: input.command.url,
        code: -202,
        message: "net::ERR_CERT_AUTHORITY_INVALID",
      });
    }
    return { commandId: input.commandId, status: "applied", catalogVersion: 1, windowId: "main" };
  });
  return { pages, opener, tabCommand };
}
it("actual original opener rejects certificate failure and closes the initial failed page", async () => {
  const f = fixture();
  await expect(
    f.opener.open({
      url: "https://127.0.0.1:9143/appearance-page-recovery",
      background: false,
      ownedByRuntime: false,
    }),
  ).rejects.toMatchObject({ code: "target_detached" });
  const commands = f.tabCommand.mock.calls.map(([input]) => input.command);
  expect(commands.map((command) => command.kind)).toEqual(["open", "navigate", "close"]);
  expect(f.pages.live.size).toBe(0);
});
it("actual blank opener succeeds; subsequent failed native navigation retains that original page", async () => {
  const f = fixture();
  const blank = await f.opener.open({ url: "about:blank", background: false, ownedByRuntime: false });
  expect(blank.url).toBe("about:blank");
  expect(blank.sessionId).toBeUndefined();
  expect(f.tabCommand.mock.calls.map(([input]) => input.command.kind)).toEqual(["open"]);
  await expect(
    navigateNativePage(f.pages, blank.pageId, "https://127.0.0.1:9143/appearance-page-recovery"),
  ).rejects.toMatchObject({ code: "target_detached" });
  const live = f.pages.live.get(blank.pageId)!;
  expect(live.target.pageId).toBe(blank.pageId);
  expect(live.target.windowId).toBe(blank.windowId);
  expect(live.target.targetId).toBe(blank.targetId);
  expect(live.target.navigationError).toEqual({
    url: "https://127.0.0.1:9143/appearance-page-recovery",
    code: -202,
    message: "net::ERR_CERT_AUTHORITY_INVALID",
  });
  expect(f.tabCommand.mock.calls.filter(([input]) => input.command.kind === "close")).toHaveLength(0);
});
