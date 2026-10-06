import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { expect, it } from "vitest";
import { EventBus, NullNativeBridge, PageService, Repo, openDb } from "@aux/runtime";
import type { BrowserDriver, DriverPage } from "@aux/chromium-driver";

it("restores only a form control whose page identity and resulting value still match", async () => {
  const db = openDb(":memory:");
  const repo = new Repo(db);
  let value = "4";
  let url = "https://fixture.test/form";
  const page = {
    identity: { pageId: "p1", targetId: "t1", backend: "aux" },
    isAttached: () => true,
    url: () => url,
    title: async () => "Form",
    setEvents: () => {},
    fieldState: async () => ({ value }),
    fill: async (_target: string, next: string) => {
      value = next;
    },
    dispose: async () => {},
  } as unknown as DriverPage;
  const driver = { attach: async () => page } as unknown as BrowserDriver;
  const pages = new PageService({
    turnMentions: fixtureTurnMentions((pageId: string): import("@aux/contracts").PageTarget | undefined =>
      pages.get(pageId),
    ),
    repo,
    events: new EventBus(repo),
    native: new NullNativeBridge(),
    drivers: () => ({ aux: driver, chrome: null }),
  });
  try {
    await pages.registerExternal({ pageId: "p1", marker: "t1", url, backend: "aux" });
    const input = {
      pageId: "p1",
      target: "#quantity",
      url,
      documentEpoch: 0,
      before: { value: "3" },
      after: { value: "4" },
    };
    value = "someone else's change";
    await expect(pages.undoFormChange(input)).rejects.toThrow("form changed");
    expect(value).toBe("someone else's change");
    value = "4";
    await expect(pages.undoFormChange({ ...input, documentEpoch: 1 })).rejects.toThrow("page changed");
    url = "https://fixture.test/other";
    await expect(pages.undoFormChange(input)).rejects.toThrow("page changed");
    url = input.url;
    await expect(pages.undoFormChange(input)).resolves.toBeUndefined();
    expect(value).toBe("3");
  } finally {
    pages.shuttingDown();
    db.close();
  }
});

it("closes only an unused background tab owned by the runtime", async () => {
  const db = openDb(":memory:");
  const repo = new Repo(db);
  const page = {
    identity: { pageId: "unused", targetId: "target", backend: "aux" },
    isAttached: () => true,
    url: () => "https://fixture.test/",
    title: async () => "Fixture",
    setEvents: () => {},
    navigate: async () => {},
    dispose: async () => {},
  } as unknown as DriverPage;
  const driver = {
    isConnected: () => true,
    createTarget: async () => "target",
    attach: async () => page,
  } as unknown as BrowserDriver;
  const pages = new PageService({
    turnMentions: fixtureTurnMentions((pageId: string): import("@aux/contracts").PageTarget | undefined =>
      pages.get(pageId),
    ),
    repo,
    events: new EventBus(repo),
    native: new NullNativeBridge(),
    drivers: () => ({ aux: driver, chrome: null }),
  });
  try {
    const owned = await pages.open({ url: "https://fixture.test/", background: true, ownedByRuntime: true });
    await pages.undoOpenedTab(owned.pageId, { url: owned.url, documentEpoch: owned.documentEpoch });
    expect(pages.list().some((item) => item.pageId === owned.pageId)).toBe(false);
    const human = await pages.open({ url: "https://fixture.test/", background: true, ownedByRuntime: false });
    await expect(
      pages.undoOpenedTab(human.pageId, { url: human.url, documentEpoch: human.documentEpoch }),
    ).rejects.toThrow("no longer run-owned");
    const active = await pages.open({ url: "https://fixture.test/", background: true, ownedByRuntime: true });
    await pages.activate(active.pageId);
    await expect(
      pages.undoOpenedTab(active.pageId, { url: active.url, documentEpoch: active.documentEpoch }),
    ).rejects.toThrow("taken over or activated");
  } finally {
    pages.shuttingDown();
    db.close();
  }
});
