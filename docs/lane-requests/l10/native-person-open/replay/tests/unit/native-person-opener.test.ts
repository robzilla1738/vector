import { createHash, randomUUID } from "node:crypto";
import { afterEach, expect, it, vi } from "vitest";
import { PERSON_OBSERVER_WRAPPED_SOURCE, type BrowserDriver } from "@aux/chromium-driver";
import { EventBus, NullNativeBridge, openDb, Repo } from "@aux/runtime";
import { type TabCommandAck, type TabCommandEnvelope } from "@aux/contracts";
import { PageRegistry } from "../../apps/runtime/dist/services/pages/registry.js";
import { PageOpener } from "../../apps/runtime/dist/services/pages/opener.js";
import { NativeViewSync } from "../../apps/runtime/dist/services/pages/native-sync.js";
import { ActivationPolicy } from "../../apps/runtime/dist/services/pages/activation.js";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
const repos: Repo[] = [];
afterEach(() => {
  for (const repo of repos.splice(0)) repo.close();
});
function fixture(withDriver = true) {
  const repo = new Repo(openDb(":memory:"));
  repos.push(repo);
  const attach = vi.fn(async () => {
    throw new Error("Ordinary native pages cannot attach CDP");
  });
  const reconnect = vi.fn(async () => {
    throw new Error("Unrelated control socket must not be needed");
  });
  const driver = { isConnected: () => false, attach, reconnect } as unknown as BrowserDriver;
  const focusPage = vi.fn(async () => {});
  const tabCommand = vi.fn(async (input: TabCommandEnvelope): Promise<TabCommandAck> => ({
    commandId: input.commandId,
    status: "applied",
    catalogVersion: 1,
    pageId: "pageId" in input.command ? input.command.pageId : undefined,
  }));
  const personReadContext = vi.fn(async (pageId: string) => ({
    pageId,
    documentId: randomUUID(),
    sessionId: randomUUID(),
    producerSha256: createHash("sha256").update(PERSON_OBSERVER_WRAPPED_SOURCE).digest("hex"),
    url: "https://person.test/",
  }));
  const native = Object.assign(new NullNativeBridge(), {
    available: () => true,
    tabCommand,
    focusPage,
    personReadContext,
  });
  const pages = new PageRegistry({
    repo,
    events: new EventBus(repo),
    native,
    turnMentions: fixtureTurnMentions((id) => repo.getPage(id)),
    drivers: () => ({ aux: withDriver ? driver : null, chrome: null }),
  });
  const activation = new ActivationPolicy(pages);
  const opener = new PageOpener(pages, activation);
  const sync = new NativeViewSync(pages, opener, activation);
  tabCommand.mockImplementation(async (input) => {
    if (input.command.kind === "navigate") sync.onNativeNavigated(input.command.pageId, input.command.url);
    return {
      commandId: input.commandId,
      status: "applied",
      catalogVersion: 1,
      pageId: "pageId" in input.command ? input.command.pageId : undefined,
    };
  });
  return { repo, pages, opener, activation, attach, reconnect, tabCommand, personReadContext, native, sync };
}
it("opens and activates a genuine native person tab without a control socket or CDP commands", async () => {
  const f = fixture();
  const target = await f.opener.open({
    url: "https://person.test/",
    background: false,
    ownedByRuntime: false,
  });
  expect(f.attach).not.toHaveBeenCalled();
  expect(f.reconnect).not.toHaveBeenCalled();
  expect(f.tabCommand).toHaveBeenCalledTimes(2);
  expect(f.tabCommand.mock.calls[0][0].command).toMatchObject({
    kind: "open",
    pageId: target.pageId,
    url: "about:blank",
    runtimeOwned: false,
  });
  expect(f.tabCommand.mock.calls[1][0].command).toMatchObject({
    kind: "navigate",
    pageId: target.pageId,
    url: target.url,
  });
  expect(f.pages.live.get(target.pageId)?.driver).toBeNull();
  expect(target.ownedByRuntime).toBe(false);
  expect(target.agentIsolation).toBeUndefined();
  expect(f.personReadContext).toHaveBeenCalledWith(target.pageId);
  expect(target.sessionId).toBeDefined();
});
it("supports a driverless native host and retains the creation ACK before publishing", async () => {
  const f = fixture(false);
  let release!: (value: TabCommandAck) => void;
  f.tabCommand.mockImplementationOnce(
    async () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  const work = f.opener.open({ url: "https://person.test/", background: true, ownedByRuntime: false });
  expect(f.pages.live.size).toBe(0);
  const input = f.tabCommand.mock.calls[0][0];
  release({
    commandId: input.commandId,
    status: "applied",
    catalogVersion: 1,
    pageId: "pageId" in input.command ? input.command.pageId : undefined,
  });
  const target = await work;
  expect(f.pages.live.get(target.pageId)?.driver).toBeNull();
  expect(target.sessionId).toBeDefined();
});
it("publishes ordinary native catalog surfaces driverless without borrowing an agent attachment", async () => {
  const f = fixture();
  const pageId = randomUUID();
  const result = await f.opener.registerExternal({
    pageId,
    marker: `atab-${pageId}`,
    url: "https://person.test/",
    backend: "aux",
    active: true,
    ownedByRuntime: false,
  });
  expect(result.pageId).toBe(pageId);
  expect(f.attach).not.toHaveBeenCalled();
  expect(f.pages.live.get(pageId)?.driver).toBeNull();
});
it("preserves native refusal identity and never publishes a rejected creation", async () => {
  const f = fixture();
  const reason = new Error("original transport error");
  f.tabCommand.mockRejectedValueOnce(reason);
  await expect(
    f.opener.open({ url: "https://person.test/", background: true, ownedByRuntime: false }),
  ).rejects.toBe(reason);
  expect(f.pages.live.size).toBe(0);
  expect(f.attach).not.toHaveBeenCalled();
});
it("closes the original late ACK after cancellation and retains cleanup debt", async () => {
  const f = fixture();
  const abort = new AbortController();
  let release!: (value: TabCommandAck) => void;
  f.tabCommand.mockImplementationOnce(
    async () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  const work = f.opener.open({
    url: "https://person.test/",
    background: true,
    ownedByRuntime: false,
    signal: abort.signal,
  });
  const input = f.tabCommand.mock.calls[0][0];
  abort.abort();
  const cleanup = new Error("original cleanup transport failure");
  f.tabCommand.mockRejectedValueOnce(cleanup);
  release({
    commandId: input.commandId,
    status: "applied",
    catalogVersion: 1,
    pageId: "pageId" in input.command ? input.command.pageId : undefined,
  });
  const error = await work.catch((error) => error);
  expect(error).toBeInstanceOf(AggregateError);
  expect(error.errors[0]).toMatchObject({ code: "target_detached" });
  expect(error.errors[1]).toBe(cleanup);
  expect(f.tabCommand.mock.calls[1][0].command).toMatchObject({
    kind: "close",
    pageId: "pageId" in input.command ? input.command.pageId : undefined,
  });
  expect(f.pages.live.size).toBe(0);
});
it("does not route runtime-owned pages through person admission", async () => {
  const f = fixture(false);
  await expect(
    f.opener.open({ url: "https://person.test/", background: true, ownedByRuntime: true }),
  ).rejects.toMatchObject({ code: "backend_unavailable" });
  expect(f.tabCommand).not.toHaveBeenCalled();
  expect(f.personReadContext).not.toHaveBeenCalled();
});

it("does not complete on navigate ACK until the genuine native catalog and context agree", async () => {
  const f = fixture(false);
  let release!: (value: TabCommandAck) => void;
  f.tabCommand.mockImplementationOnce(async (input) => ({
    commandId: input.commandId,
    status: "applied",
    catalogVersion: 1,
  }));
  f.tabCommand.mockImplementationOnce(
    async () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  let finished = false;
  const work = f.opener
    .open({ url: "https://person.test/", background: true, ownedByRuntime: false })
    .then((value) => {
      finished = true;
      return value;
    });
  await vi.waitFor(() => expect(f.tabCommand).toHaveBeenCalledTimes(2));
  const input = f.tabCommand.mock.calls[1][0];
  const pageId = input.command.kind === "navigate" ? input.command.pageId : "";
  expect(f.pages.live.get(pageId)?.target.url).toBe("about:blank");
  release({ commandId: input.commandId, status: "applied", catalogVersion: 2, pageId });
  await new Promise((resolve) => setTimeout(resolve, 10));
  expect(finished).toBe(false);
  f.sync.onNativeNavigated(pageId, "https://person.test/");
  const target = await work;
  expect(target.url).toBe("https://person.test/");
  expect(target.sessionId).toBeDefined();
  expect(f.attach).not.toHaveBeenCalled();
});
it("retains original navigate rejection and cleanup refusal instead of publishing a usable page", async () => {
  const f = fixture(false);
  const reason = new Error("original navigate transport");
  const cleanup = new Error("original close transport");
  f.tabCommand.mockImplementationOnce(async (input) => ({
    commandId: input.commandId,
    status: "applied",
    catalogVersion: 1,
  }));
  f.tabCommand.mockRejectedValueOnce(reason);
  f.tabCommand.mockRejectedValueOnce(cleanup);
  const error = await f.opener
    .open({ url: "https://person.test/", background: true, ownedByRuntime: false })
    .catch((error) => error);
  expect(error).toBeInstanceOf(AggregateError);
  expect(error.errors).toEqual([reason, cleanup]);
  expect(f.pages.live.size).toBe(1);
  expect([...f.pages.live.values()][0].target.url).toBe("about:blank");
  expect(f.tabCommand.mock.calls[2][0].command.kind).toBe("close");
});

it("refuses a replacement while the original native document context is held and retains cleanup debt", async () => {
  const f = fixture(false);
  let release!: (value: unknown) => void;
  f.personReadContext.mockImplementation(
    async () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  const work = f.opener.open({ url: "https://person.test/", background: true, ownedByRuntime: false });
  await vi.waitFor(() => expect(f.personReadContext).toHaveBeenCalled());
  const original = [...f.pages.live.values()][0];
  const replacement = {
    ...original,
    target: { ...original.target, controllerEpoch: original.target.controllerEpoch + 1 },
  };
  f.pages.live.set(original.target.pageId, replacement);
  release({
    pageId: original.target.pageId,
    documentId: randomUUID(),
    sessionId: randomUUID(),
    producerSha256: createHash("sha256").update(PERSON_OBSERVER_WRAPPED_SOURCE).digest("hex"),
    url: "https://person.test/",
  });
  const error = await work.catch((error) => error);
  expect(error).toBeInstanceOf(AggregateError);
  expect(error.errors[0]).toMatchObject({ code: "target_detached" });
  expect(error.errors[1]).toMatchObject({ code: "permission_denied" });
  expect(f.pages.live.get(original.target.pageId)).toBe(replacement);
  expect(f.tabCommand.mock.calls.filter(([input]) => input.command.kind === "close")).toHaveLength(0);
});
