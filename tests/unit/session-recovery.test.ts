import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { expect, it } from "vitest";
import { EventBus, PageService, Repo, openDb } from "@aux/runtime";
import type { BrowserDriver, DriverPage } from "@aux/chromium-driver";
import { ResultSchemas, type PageTarget } from "@aux/contracts";

it("restores only the foreground tab when the native catalog starts empty", async () => {
  const repo = new Repo(openDb(":memory:"));
  const saved = (pageId: string, active: boolean): PageTarget & { ordinal: number; active: boolean } => ({
    pageId,
    windowId: "main",
    backend: "aux",
    targetId: `old-${pageId}`,
    url: `https://example.test/${pageId}`,
    title: pageId,
    documentEpoch: 1,
    lastRevision: 0,
    viewStatus: "hidden",
    controller: "none",
    controllerEpoch: 0,
    ownedByRuntime: false,
    createdAt: 1,
    lastActiveAt: 2,
    ordinal: active ? 1 : 0,
    active,
  });
  const red = saved("red", false),
    blue = saved("blue", true);
  repo.upsertPage(red);
  repo.upsertPage(blue);
  repo.saveTabs([red, blue]);
  const recovered: string[] = [];
  const makePage = (pageId: string) =>
    ({
      identity: { pageId, targetId: `new-${pageId}`, backend: "aux" },
      isAttached: () => true,
      url: () => `https://example.test/${pageId}`,
      title: async () => pageId,
      navigate: async () => {},
      setEvents: () => {},
      dispose: async () => {},
    }) as unknown as DriverPage;
  const driver = {
    isConnected: () => true,
    recoverPage: async (_targetId: string, pageId: string) => {
      recovered.push(pageId);
      return makePage(pageId);
    },
  } as unknown as BrowserDriver;
  const native = {
    available: () => true,
    listPages: async () => ({ pages: [] }),
    tabCommand: async () => ({ commandId: "", status: "applied" as const, catalogVersion: 0 }),
    focusPage: async () => ({ ok: true }),
  } as unknown as ConstructorParameters<typeof PageService>[0]["native"];
  const pages = new PageService({
    turnMentions: fixtureTurnMentions((pageId: string): import("@aux/contracts").PageTarget | undefined =>
      pages.get(pageId),
    ),
    repo,
    native,
    drivers: () => ({ aux: driver, chrome: null }),
    events: new EventBus(repo),
  });
  try {
    await pages.restoreTabs();
    expect(recovered).toEqual(["blue"]);
    expect(pages.recoveryTabs().map((tab) => tab.pageId)).toEqual(["red"]);
  } finally {
    pages.shuttingDown();
    repo.close();
  }
});

it("registers restored background placeholders without attaching until activation", async () => {
  const db = openDb(":memory:"),
    repo = new Repo(db);
  const attached: string[] = [];
  const driver = {
    isConnected: () => true,
    attach: async (_marker: string, pageId: string) => {
      attached.push(pageId);
      return {
        identity: { targetId: `atab-${pageId}`, pageId, backend: "aux" },
        isAttached: () => true,
        url: () => `https://example.test/${pageId}`,
        title: async () => pageId,
        setEvents: () => {},
        dispose: async () => {},
      } as unknown as DriverPage;
    },
  } as unknown as BrowserDriver;
  const native = {
    available: () => true,
    listPages: async () => ({
      pages: [
        {
          pageId: "red",
          windowId: "main",
          marker: "atab-red",
          url: "https://example.test/red",
          title: "Red",
          active: false,
          lifecycle: "placeholder",
        },
        {
          pageId: "blue",
          windowId: "main",
          marker: "atab-blue",
          url: "https://example.test/blue",
          title: "Blue",
          active: true,
          lifecycle: "live",
        },
      ],
    }),
    focusPage: async () => ({ ok: true }),
  } as unknown as ConstructorParameters<typeof PageService>[0]["native"];
  const pages = new PageService({
    turnMentions: fixtureTurnMentions((pageId: string): import("@aux/contracts").PageTarget | undefined =>
      pages.get(pageId),
    ),
    repo,
    native,
    drivers: () => ({ aux: driver, chrome: null }),
    events: new EventBus(repo),
  });
  try {
    await pages.restoreTabs();
    expect(attached).toEqual(["blue"]);
    expect(pages.list().find((page) => page.pageId === "red")?.lifecycle).toBe("placeholder");
    await pages.activate("red");
    expect(attached).toEqual(["blue", "red"]);
  } finally {
    repo.close();
  }
});

it("waits for a late native placeholder instead of reopening its saved URL", async () => {
  const repo = new Repo(openDb(":memory:"));
  const saved: PageTarget = {
    pageId: "red",
    windowId: "main",
    backend: "aux",
    targetId: "old-red",
    url: "https://example.test/red",
    title: "Red",
    documentEpoch: 1,
    lastRevision: 0,
    viewStatus: "hidden",
    controller: "none",
    controllerEpoch: 0,
    ownedByRuntime: false,
    createdAt: 1,
    lastActiveAt: 2,
  };
  repo.upsertPage(saved);
  repo.saveTabs([{ ...saved, ordinal: 0, active: false }]);
  const attached: string[] = [];
  const driver = {
    isConnected: () => true,
    attach: async (_marker: string, pageId: string) => {
      attached.push(pageId);
      return {
        identity: { targetId: `atab-${pageId}`, pageId, backend: "aux" },
        isAttached: () => true,
        url: () => `https://example.test/${pageId}`,
        title: async () => pageId,
        setEvents: () => {},
        dispose: async () => {},
      } as unknown as DriverPage;
    },
    recoverPage: async () => {
      throw new Error("unexpected eager restore");
    },
  } as unknown as BrowserDriver;
  const native = {
    available: () => true,
    listPages: async () => ({
      pages: [
        {
          pageId: "blue",
          windowId: "main",
          marker: "atab-blue",
          url: "https://example.test/blue",
          title: "Blue",
          active: true,
          lifecycle: "live",
        },
      ],
    }),
    focusPage: async () => ({ ok: true }),
  } as unknown as ConstructorParameters<typeof PageService>[0]["native"];
  const pages = new PageService({
    turnMentions: fixtureTurnMentions((pageId: string): import("@aux/contracts").PageTarget | undefined =>
      pages.get(pageId),
    ),
    repo,
    native,
    drivers: () => ({ aux: driver, chrome: null }),
    events: new EventBus(repo),
  });
  try {
    await pages.restoreTabs();
    expect(attached).toEqual(["blue"]);
    expect(pages.recoveryTabs().map((tab) => tab.pageId)).toEqual(["red"]);
    await pages.syncCatalog({
      version: 1,
      baseVersion: 0,
      ts: Date.now(),
      ops: [
        {
          op: "upsert",
          tab: {
            pageId: "red",
            windowId: "main",
            url: saved.url,
            title: "Red",
            loading: false,
            muted: false,
            audible: false,
            canGoBack: false,
            canGoForward: false,
            popup: false,
            crashed: false,
            runtimeOwned: false,
            generation: 0,
            lifecycle: "placeholder",
            createdAt: 1,
            lastActiveAt: 2,
          },
        },
      ],
    });
    expect(attached).toEqual(["blue"]);
    expect(pages.recoveryTabs()).toEqual([]);
    expect(pages.list().find((page) => page.pageId === "red")?.lifecycle).toBe("placeholder");
  } finally {
    repo.close();
  }
});

it("keeps failed session tabs through later browsing and retries the same durable identity", async () => {
  const db = openDb(":memory:"),
    repo = new Repo(db);
  const original: PageTarget = {
    pageId: "saved-tab",
    windowId: "main",
    backend: "aux",
    targetId: "old-target",
    url: "https://saved.test/",
    title: "Saved work",
    documentEpoch: 4,
    lastRevision: 0,
    viewStatus: "visible",
    controller: "none",
    controllerEpoch: 2,
    ownedByRuntime: false,
    createdAt: 1,
    lastActiveAt: 2,
  };
  repo.upsertPage(original);
  repo.saveTabs([{ ...original, ordinal: 0, active: true }]);
  let failing = true;
  let nativeFocusCalls = 0;
  const page = (targetId: string, pageId: string): DriverPage => {
    let url = "about:blank";
    return {
      identity: { targetId, pageId, backend: "aux" },
      isAttached: () => true,
      url: () => url,
      title: async () => "Page",
      navigate: async (value: string) => {
        url = value;
      },
      setEvents: () => {},
      dispose: async () => {},
    } as unknown as DriverPage;
  };
  const driver = {
    isConnected: () => true,
    attach: async (targetId: string, pageId: string) => page(targetId, pageId),
    recoverPage: async (targetId: string, pageId: string) => {
      if (failing) throw new Error("Browser temporarily unavailable");
      return page(targetId, pageId);
    },
  } as unknown as BrowserDriver;
  const native = {
    available: () => true,
    listPages: async () => ({ pages: [] }),
    tabCommand: async (env: { command: { kind: string; pageId?: string } }) => ({
      commandId: "",
      status: "applied" as const,
      catalogVersion: 0,
      pageId: env.command.pageId,
    }),
    createPage: async () => ({ ok: true }),
    closePage: async () => ({ ok: true }),
    focusPage: async () => {
      nativeFocusCalls++;
      return { ok: true };
    },
  } as unknown as ConstructorParameters<typeof PageService>[0]["native"];
  const pages = new PageService({
    turnMentions: fixtureTurnMentions((pageId: string): import("@aux/contracts").PageTarget | undefined =>
      pages.get(pageId),
    ),
    repo,
    native,
    drivers: () => ({ aux: driver, chrome: null }),
    events: new EventBus(repo),
  });
  try {
    await pages.restoreTabs();
    expect(pages.recoveryTabs()).toEqual([
      expect.objectContaining({ pageId: original.pageId, error: "Browser temporarily unavailable" }),
    ]);
    const fresh = await pages.open({ url: "https://fresh.test/", background: false, ownedByRuntime: false });
    expect(repo.loadTabs().map((tab) => tab.page_id)).toEqual(
      expect.arrayContaining([original.pageId, fresh.pageId]),
    );
    failing = false;
    const restored = await pages.retryRestore(original.pageId);
    expect(restored).toEqual({
      ok: true,
      pageId: original.pageId,
      page: pages.get(original.pageId),
      restored: true,
    });
    expect(restored.page).toMatchObject({
      pageId: original.pageId,
      windowId: original.windowId,
      url: original.url,
      documentEpoch: 5,
    });
    expect(restored.page.sessionId).toBe(pages.get(original.pageId).sessionId);
    expect(restored.page).not.toBe(pages.get(original.pageId));
    expect(ResultSchemas["browser.recovery.retry"].safeParse(restored).success).toBe(true);
    expect(
      ResultSchemas["browser.recovery.retry"].safeParse({ ok: true, pageId: original.pageId }).success,
    ).toBe(false);
    expect(
      ResultSchemas["browser.recovery.retry"].safeParse({ ...restored, restored: undefined }).success,
    ).toBe(false);
    await Promise.resolve();
    expect(pages.recoveryTabs()).toEqual([]);
    expect(repo.getPage(original.pageId)?.documentEpoch).toBe(5);
    expect(repo.loadTabs().filter((tab) => tab.page_id === original.pageId)).toHaveLength(1);
    expect(repo.loadTabs().some((tab) => tab.page_id === fresh.pageId)).toBe(true);
    const focusCallsBeforeNotification = nativeFocusCalls;
    pages.onNativeWindowFocused(fresh.pageId, "main");
    expect(pages.activePageIdFor("main")).toBe(fresh.pageId);
    expect(nativeFocusCalls).toBe(focusCallsBeforeNotification);
    pages.onNativeWindowFocused(original.pageId, "different-window");
    expect(pages.activePageId).toBe(fresh.pageId);
    expect(nativeFocusCalls).toBe(focusCallsBeforeNotification);
  } finally {
    pages.shuttingDown();
    await Promise.resolve();
    db.close();
  }
});

it("reloads a tab that still had a renderer and leaves a discarded tab asleep", async () => {
  const repo = new Repo(openDb(":memory:"));
  const row = (
    pageId: string,
    viewStatus: PageTarget["viewStatus"],
    lifecycle: PageTarget["lifecycle"],
  ): PageTarget => ({
    pageId,
    windowId: "main",
    backend: "aux",
    targetId: `old-${pageId}`,
    url: `https://example.test/${pageId}`,
    title: pageId,
    documentEpoch: 1,
    lastRevision: 0,
    viewStatus,
    lifecycle,
    controller: "none",
    controllerEpoch: 0,
    ownedByRuntime: false,
    createdAt: 1,
    lastActiveAt: 2,
  });
  const dirty = row("dirty", "background", "live");
  const red = row("red", "detached", "discarded");
  repo.upsertPage(dirty);
  repo.upsertPage(red);
  repo.saveTabs([
    {
      pageId: dirty.pageId,
      windowId: "main",
      ordinal: 0,
      url: dirty.url,
      title: dirty.title,
      backend: "aux",
      active: false,
    },
    {
      pageId: red.pageId,
      windowId: "main",
      ordinal: 1,
      url: red.url,
      title: red.title,
      backend: "aux",
      active: false,
    },
  ]);
  const reloaded: string[] = [];
  const attached: string[] = [];
  const driver = {
    isConnected: () => true,
    attach: async (_marker: string, pageId: string) => {
      attached.push(pageId);
      return {
        identity: { targetId: `atab-${pageId}`, pageId, backend: "aux" },
        isAttached: () => true,
        url: () => `https://example.test/${pageId}`,
        title: async () => pageId,
        setEvents: () => {},
        dispose: async () => {},
      } as unknown as DriverPage;
    },
  } as unknown as BrowserDriver;
  const native = {
    available: () => true,
    listPages: async () => ({
      pages: [
        {
          pageId: "dirty",
          windowId: "main",
          marker: "atab-dirty",
          url: dirty.url,
          title: "dirty",
          active: false,
          lifecycle: "placeholder" as const,
        },
        {
          pageId: "red",
          windowId: "main",
          marker: "atab-red",
          url: red.url,
          title: "red",
          active: false,
          lifecycle: "placeholder" as const,
        },
      ],
    }),
    recoverPage: async (pageId: string) => {
      reloaded.push(pageId);
      return { ok: true };
    },
    focusPage: async () => {
      throw new Error("awake restore must not steal activation");
    },
  } as unknown as ConstructorParameters<typeof PageService>[0]["native"];
  const pages = new PageService({
    turnMentions: fixtureTurnMentions((pageId: string): import("@aux/contracts").PageTarget | undefined =>
      pages.get(pageId),
    ),
    repo,
    native,
    drivers: () => ({ aux: driver, chrome: null }),
    events: new EventBus(repo),
  });
  try {
    await pages.restoreTabs();
    expect(reloaded).toEqual(["dirty"]);
    expect(attached).toEqual([]);
    expect(pages.get("red").lifecycle).toBe("placeholder");
    expect(pages.restoredTabShown("dirty", pages.get("dirty").lifecycle)).toBe(false);
    expect(pages.restoredTabShown("red", pages.get("red").lifecycle)).toBe(true);
    await pages.syncCatalog({
      version: 1,
      baseVersion: 0,
      ts: Date.now(),
      ops: [
        {
          op: "upsert",
          tab: {
            pageId: "dirty",
            windowId: "main",
            url: dirty.url,
            title: "dirty",
            loading: false,
            muted: false,
            audible: false,
            canGoBack: false,
            canGoForward: false,
            popup: false,
            crashed: false,
            runtimeOwned: false,
            generation: 0,
            lifecycle: "live",
            createdAt: 1,
            lastActiveAt: 2,
          },
        },
      ],
    });
    expect(pages.get("dirty").lifecycle).toBe("live");
    expect(pages.restoredTabShown("dirty", pages.get("dirty").lifecycle)).toBe(true);
    expect(reloaded).toEqual(["dirty"]);
  } finally {
    pages.shuttingDown();
    repo.close();
  }
});

it("keeps document epochs monotonic when a native catalog event wins the restore race", async () => {
  const db = openDb(":memory:"),
    repo = new Repo(db);
  const previous: PageTarget = {
    pageId: "saved-tab",
    windowId: "main",
    backend: "aux",
    targetId: "old-target",
    url: "https://saved.test/",
    title: "Saved",
    documentEpoch: 7,
    lastRevision: 0,
    viewStatus: "visible",
    controller: "none",
    controllerEpoch: 2,
    ownedByRuntime: false,
    createdAt: 1,
    lastActiveAt: 2,
  };
  repo.upsertPage(previous);
  let initialEpoch: number | undefined;
  const driver = {
    isConnected: () => true,
    attach: async (_targetId: string, pageId: string, hint?: { initialDocumentEpoch?: number }) => {
      initialEpoch = hint?.initialDocumentEpoch;
      return {
        identity: { pageId, targetId: "new-target", backend: "aux" },
        url: () => previous.url,
        title: async () => previous.title,
        isAttached: () => true,
        setEvents: () => {},
        dispose: async () => {},
      } as unknown as DriverPage;
    },
  } as unknown as BrowserDriver;
  const native = { available: () => true } as unknown as ConstructorParameters<
    typeof PageService
  >[0]["native"];
  const pages = new PageService({
    turnMentions: fixtureTurnMentions((pageId: string): import("@aux/contracts").PageTarget | undefined =>
      pages.get(pageId),
    ),
    repo,
    native,
    drivers: () => ({ aux: driver, chrome: null }),
    events: new EventBus(repo),
  });
  try {
    const restored = await pages.registerExternal({
      pageId: previous.pageId,
      marker: "new-target",
      url: previous.url,
      backend: "aux",
    });
    expect(restored.documentEpoch).toBe(8);
    expect(initialEpoch).toBe(8);
    expect(repo.getPage(previous.pageId)?.documentEpoch).toBe(8);
  } finally {
    pages.shuttingDown();
    db.close();
  }
});

it("reports existing-live recovery honestly after an independent native registration", async () => {
  const db = openDb(":memory:"),
    repo = new Repo(db);
  const original: PageTarget = {
    pageId: "existing",
    windowId: "main",
    backend: "aux",
    targetId: "old",
    url: "https://saved.test/",
    title: "Saved",
    documentEpoch: 4,
    lastRevision: 0,
    viewStatus: "visible",
    controller: "none",
    controllerEpoch: 2,
    ownedByRuntime: false,
    createdAt: 1,
    lastActiveAt: 2,
  };
  repo.upsertPage(original);
  repo.saveTabs([{ ...original, ordinal: 0, active: true }]);
  let recoveryCalls = 0;
  const driver = {
    isConnected: () => true,
    recoverPage: async () => {
      recoveryCalls++;
      throw new Error("not ready");
    },
    attach: async (targetId: string, pageId: string) => ({
      identity: { targetId, pageId, backend: "aux" },
      isAttached: () => true,
      url: () => "https://external.test/",
      title: async () => "External",
      setEvents: () => {},
      dispose: async () => {},
    }),
  } as unknown as BrowserDriver;
  const native = {
    available: () => true,
    listPages: async () => ({ pages: [] }),
    tabCommand: async () => ({ commandId: "", status: "applied", catalogVersion: 0 }),
    focusPage: async () => ({ ok: true }),
  } as unknown as ConstructorParameters<typeof PageService>[0]["native"];
  const pages: PageService = new PageService({
    turnMentions: fixtureTurnMentions((pageId: string) => pages.get(pageId)),
    repo,
    native,
    drivers: () => ({ aux: driver, chrome: null }),
    events: new EventBus(repo),
  });
  try {
    await pages.restoreTabs();
    expect(pages.recoveryTabs()).toHaveLength(1);
    await pages.registerExternal({
      pageId: original.pageId,
      marker: "native-external",
      backend: "aux",
      windowId: "main",
      url: "https://external.test/",
      title: "External",
      restored: original,
    });
    const callsBefore = recoveryCalls;
    const result = await pages.retryRestore(original.pageId);
    expect(result).toEqual({
      ok: true,
      pageId: original.pageId,
      page: pages.get(original.pageId),
      restored: false,
    });
    expect(result.page.url).toBe("https://external.test/");
    expect(recoveryCalls).toBe(callsBefore);
    expect(pages.recoveryTabs()).toEqual([]);
  } finally {
    pages.shuttingDown();
    await Promise.resolve();
    db.close();
  }
});
