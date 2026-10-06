import { fixtureSafetyAuthority, fixtureTurnMentions } from "../fixtures/turn-mentions.js";
/**
 * H2-C7: pages.extract / waitFor / console / dialog / network are real RPCs.
 */
import { describe, it, expect, vi } from "vitest";
import {
  EventBus,
  NullNativeBridge,
  PageService,
  Repo,
  ResponseStore,
  makeInvoker,
  openDb,
  type DriverSet,
  type Services,
} from "@aux/runtime";
import type { BrowserDriver, DriverPage } from "@aux/chromium-driver";
import {
  MethodSchemas,
  ResultSchemas,
  type Condition,
  type MethodName,
  type ObservationContent,
} from "@aux/contracts";
import type { SetService, RunService, ArtifactStore, SettingsService } from "@aux/runtime";
import { PageOwnership } from "../../apps/runtime/src/scheduler/page-ownership.js";
import { PNG } from "pngjs";

const content = (url: string, over: Partial<ObservationContent> = {}): ObservationContent => ({
  url,
  title: "Inspect",
  viewport: { width: 1280, height: 720, scale: 1 },
  scroll: { x: 0, y: 0, maxY: 0 },
  frames: [{ frame: "main", url, sameOrigin: true }],
  text: "Save the form",
  headings: ["Inspect"],
  elements: [{ ref: "r1", frame: "main", tag: "button", role: "button", name: "Save", selector: {} }],
  formFields: [{ ref: "r2", label: "Name", name: "name", type: "text", value: "Ada" }],
  tables: [],
  links: [{ ref: "r3", text: "Docs", href: "https://a.test/docs" }],
  dialogs: [{ type: "alert", message: "done" }],
  console: [{ level: "log", message: "hello from page", atMs: 10 }],
  truncated: false,
  stats: { elementsTotal: 1, elementsShown: 1, textChars: 14, approxTokens: 8 },
  ...over,
});

function fakeChromium() {
  const calls: string[] = [];
  const image = PNG.sync.write(new PNG({ width: 20, height: 20 }));
  let capture = async () => ({ buffer: image, width: 20, height: 20, scale: 1 });
  let n = 0;
  const targets = new Map<string, string>();
  const makePage = (targetId: string, pageId: string, url: string): DriverPage => {
    let current = url;
    let attached = true;
    const rec = (s: string): void => {
      calls.push(s);
    };
    return {
      identity: { pageId, targetId, backend: "aux" },
      url: () => current,
      title: async () => "Inspect",
      isAttached: () => attached,
      navigate: async (u) => {
        current = u;
        rec(`navigate:${u}`);
      },
      back: async () => rec("back"),
      forward: async () => rec("forward"),
      reload: async () => rec("reload"),
      stop: async () => rec("stop"),
      click: async (t) => rec(`click:${t}`),
      dblclick: async () => rec("dblclick"),
      hover: async () => rec("hover"),
      fill: async () => rec("fill"),
      typeText: async () => rec("type"),
      press: async () => rec("press"),
      check: async () => rec("check"),
      uncheck: async () => rec("uncheck"),
      select: async () => rec("select"),
      scroll: async () => rec("scroll"),
      dragTo: async () => rec("drag"),
      clickPoint: async () => rec("clickPoint"),
      uploadFiles: async () => rec("upload"),
      waitFor: async (c: Condition) => {
        rec(`waitFor:${c.kind}`);
        return { ok: true, timedOut: false, detail: c.kind };
      },
      waitForDownload: async () => ({ suggestedFilename: "f" }),
      handleDialog: async (action) => rec(`dialog:${action}`),
      collectScroll: async () => ({ items: [], collected: 0 }),
      screenshot: () => capture(),
      observe: async () => {
        rec("observe");
        return content(current);
      },
      expandRef: async () => [],
      extract: async (fields) => {
        rec(`extract:${fields.map((f) => f.name).join(",")}`);
        return Object.fromEntries(fields.map((f) => [f.name, `css:${f.selector ?? ""}`]));
      },
      evaluate: async () => null,
      console: async () => [{ level: "log", message: "hello from page", atMs: 10 }],
      setEvents: () => {},
      dispose: async () => {
        attached = false;
      },
    };
  };
  const driver: BrowserDriver = {
    backend: "aux",
    connect: async () => {},
    disconnect: async () => {},
    isConnected: () => true,
    listTargets: async () => [],
    createTarget: async (url) => {
      const id = `ve-t${++n}`;
      targets.set(id, url);
      return id;
    },
    attach: async (targetId, pageId) => makePage(targetId, pageId, targets.get(targetId) ?? "about:blank"),
  };
  return {
    driver,
    calls,
    image,
    setCapture: (next: typeof capture) => {
      capture = next;
    },
  };
}

function harness(grants: string[] = ["effect:read"]) {
  const repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const chromium = fakeChromium();
  const drivers: DriverSet = { aux: chromium.driver, chrome: null };
  const responses = new ResponseStore({ repo, events, flushDelayMs: 0 });
  const pagesTurnMentions = fixtureTurnMentions(
    (pageId: string): import("@aux/contracts").PageTarget | undefined => pages.get(pageId),
  );
  const native = new NullNativeBridge();
  const pages = new PageService({
    turnMentions: pagesTurnMentions,
    repo,
    events,
    native,
    drivers: () => drivers,
    responses,
    grants,
  });
  return { pages, repo, events, responses, chromium, native, turnMentions: pagesTurnMentions };
}

describe("H2-C7 pages inspect RPCs", () => {
  it("rejects outdated, navigated and empty page captures", async () => {
    const { pages, chromium } = harness();
    const page = await pages.open({ url: "https://a.test/", background: true, ownedByRuntime: true });
    await expect(
      pages.capture(page.pageId, { expectedDocumentEpoch: page.documentEpoch + 1 }),
    ).rejects.toThrow("changed before capture");
    expect((await pages.capture(page.pageId)).width).toBe(20);
    chromium.setCapture(async () => {
      await pages.navigate(page.pageId, "https://a.test/next");
      return { buffer: chromium.image, width: 20, height: 20, scale: 1 };
    });
    await expect(pages.capture(page.pageId)).rejects.toThrow("changed during capture");
    chromium.setCapture(async () => ({ buffer: Buffer.alloc(0), width: 0, height: 0, scale: 1 }));
    await expect(pages.capture(page.pageId)).rejects.toThrow("no image available");
  });

  it("extracts observation keys, refs, and CSS specs", async () => {
    const { pages } = harness();
    const page = await pages.open({ url: "https://a.test/", background: true, ownedByRuntime: true });
    const all = await pages.extract(page.pageId);
    expect(all.fields.title).toBe("Inspect");
    expect(all.fields.formFields).toEqual([expect.objectContaining({ name: "name", value: "Ada" })]);
    const named = await pages.extract(page.pageId, ["title", "r1", "Name"]);
    expect(named.fields.title).toBe("Inspect");
    expect(named.fields.r1).toEqual(expect.objectContaining({ ref: "r1", name: "Save" }));
    expect(named.fields.Name).toEqual(expect.objectContaining({ value: "Ada" }));
    const css = await pages.extract(page.pageId, [{ name: "heading", selector: "h1" }]);
    expect(css.fields.heading).toBe("css:h1");
  });

  it("waitFor and dialog dispatch real program steps", async () => {
    const { pages } = harness(["effect:read", "effect:write"]);
    const page = await pages.open({ url: "https://a.test/", background: true, ownedByRuntime: true });
    const waited = await pages.waitFor(page.pageId, { kind: "textVisible", text: "Save" });
    expect(waited).toEqual({ ok: true, timedOut: false, detail: "textVisible", status: "completed" });
    const listed = await pages.dialog(page.pageId, "list");
    expect(listed.dialogs).toEqual([{ type: "alert", message: "done" }]);
    const accepted = await pages.dialog(page.pageId, "accept");
    expect(accepted.ok).toBe(true);
    expect(accepted.action).toBe("accept");
  });

  it("can inspect dialogs with read authority but cannot accept one", async () => {
    const { pages } = harness();
    const page = await pages.open({ url: "https://a.test/", background: true, ownedByRuntime: true });
    expect((await pages.dialog(page.pageId, "list")).dialogs).toHaveLength(1);
    await expect(pages.dialog(page.pageId, "accept")).rejects.toMatchObject({ code: "permission_denied" });
  });

  it("console and network return captured lines and responses", async () => {
    const { pages, responses } = harness();
    const page = await pages.open({ url: "https://a.test/", background: true, ownedByRuntime: true });
    const console = await pages.console(page.pageId);
    expect(console.lines.some((l) => l.message === "hello from page")).toBe(true);
    responses.record(page.pageId)({
      requestId: "rq_1",
      url: "https://a.test/api",
      method: "GET",
      status: 200,
      contentType: "application/json",
      startedAt: 1,
      endedAt: 2,
    });
    const net = await pages.network(page.pageId);
    expect(net).toEqual([expect.objectContaining({ url: "https://a.test/api", status: 200 })]);
  });

  it("MethodSchemas dispatch through makeInvoker", async () => {
    const { pages, repo, events, responses, turnMentions } = harness();
    const page = await pages.open({ url: "https://a.test/", background: true, ownedByRuntime: true });
    const invoke = makeInvoker({
      safetyAuthority: fixtureSafetyAuthority(repo),
      turnMentions,
      pages,
      sets: {
        create: async () => ({}),
        get: () => ({}),
        list: () => [],
        results: () => [],
      } as unknown as SetService,
      runs: {
        pageOwnership: new PageOwnership(),
        coordinator: { get: () => ({ runId: "r" }), list: () => [] },
        mapSet: async () => ({}),
        start: async () => ({}),
        pause: async () => ({}),
        resume: async () => ({}),
        cancel: async () => ({}),
        refreshPool: () => {},
        runProgram: async () => ({}),
      } as unknown as RunService,
      artifacts: { list: () => [], read: () => ({}) } as unknown as ArtifactStore,
      settings: {
        listModels: () => ({ models: [], source: "static" }),
        probe: async () => ({ ok: true, modelId: "m" }),
        all: () => ({}),
        set: () => ({ ok: true }),
      } as unknown as SettingsService,
      events,
      repo,
      responses,
      drivers: () => ({ aux: null, chrome: null }),
      importCookies: async () => ({}),
      benchRun: async () => ({ reportPath: "" }),
    } as Services);
    for (const [method, params] of [
      ["pages.extract", { pageId: page.pageId, fields: ["title"] }],
      ["pages.waitFor", { pageId: page.pageId, condition: { kind: "settled" } }],
      ["pages.console", { pageId: page.pageId }],
      ["pages.dialog", { pageId: page.pageId }],
      ["pages.network", { pageId: page.pageId }],
    ] as [MethodName, unknown][]) {
      expect({ method, accepted: MethodSchemas[method].safeParse(params).success }).toEqual({
        method,
        accepted: true,
      });
      const result = await invoke(method, params);
      expect({ method, result, accepted: ResultSchemas[method].safeParse(result).success }).toMatchObject({
        method,
        accepted: true,
      });
    }
  });
});

describe("external page attachment lifecycle", () => {
  it("does not resurrect a native page removed while driver attachment is pending", async () => {
    const { pages, chromium } = harness();
    const attach = chromium.driver.attach.bind(chromium.driver);
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    let disposed = false;
    chromium.driver.attach = async (marker, id) => {
      await gate;
      const page = await attach(marker, id);
      const dispose = page.dispose.bind(page);
      page.dispose = async () => {
        disposed = true;
        await dispose();
      };
      return page;
    };
    const pending = pages.registerExternal({
      pageId: "popup-race",
      marker: "popup-marker",
      url: "https://a.test/",
      backend: "aux",
    });
    pages.onNativeRemoved("popup-race");
    release();
    await expect(pending).rejects.toMatchObject({ code: "not_found" });
    expect(disposed).toBe(true);
    expect(pages.list({ includeDetached: true })).toEqual([]);
  });
});

describe("native recorder PageService admission", () => {
  it("refuses an installed native backend without fixed recorder producers", async () => {
    const { pages, native, chromium, repo } = harness();
    try {
      const page = await pages.open({ url: "https://a.test/", background: true, ownedByRuntime: false });
      const callsBefore = [...chromium.calls];
      vi.spyOn(native, "available").mockReturnValue(true);
      await expect(pages.recorderObserver(page.pageId)).rejects.toMatchObject({
        code: "backend_unavailable",
      });
      expect(chromium.calls).toEqual(callsBefore);
    } finally {
      repo.close();
    }
  });

  it("retains original native attachment authority and cleans only its receipt after detach", async () => {
    const { pages, native, repo } = harness();
    const recorderId = "35120a93-910a-451a-bbbd-e1daf3368f60";
    const { createHash } = await import("node:crypto");
    const { RECORDER_SOURCE } = await import("@aux/chromium-driver");
    const start = vi.fn(async () => ({
      recorderId,
      documentGeneration: "1",
      producerSha256: createHash("sha256").update(RECORDER_SOURCE).digest("hex"),
    }));
    const drain = vi.fn(async () => ({ recorderId, documentGeneration: "1", events: [] }));
    const stop = vi.fn(async () => ({ stopped: true }));
    Object.assign(native, { recorderStart: start, recorderDrain: drain, recorderStop: stop });
    try {
      const page = await pages.open({ url: "https://a.test/", background: true, ownedByRuntime: false });
      vi.spyOn(native, "available").mockReturnValue(true);
      const observer = await pages.recorderObserver(page.pageId);
      await observer.start(
        () => {},
        () => {},
      );
      expect(start).toHaveBeenCalledWith({ pageId: page.pageId });
      pages.onNativeRemoved(page.pageId, false);
      await observer.close();
      expect(stop).toHaveBeenCalledWith({ pageId: page.pageId, recorderId });
      expect(drain).not.toHaveBeenCalled();
    } finally {
      repo.close();
    }
  });
});
