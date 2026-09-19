import { describe, it, expect, vi, afterEach } from "vitest";
import { EventEmitter } from "node:events";
import { CdpAttachedDriver, StandaloneDriver } from "@vector/engine-client";

// playwright-core is not a dependency of the tests workspace; the drivers
// accept injected connectors, so structural stand-ins are all we need.
type Page = { id?: string; on(ev: string, cb: (...a: unknown[]) => void): unknown; url(): string };
type Browser = { isConnected(): boolean; close(): Promise<void>; on(ev: string, cb: () => void): unknown };
type Connector = (endpoint: string, opts: { timeout: number }) => Promise<Browser>;
const inject = (connectOverCDP: Connector) => ({ connectOverCDP }) as unknown as ConstructorParameters<typeof CdpAttachedDriver>[1];
const launcher = (launch: () => Promise<Browser>) => ({ launch }) as unknown as ConstructorParameters<typeof StandaloneDriver>[0];

/** Minimal Playwright stand-ins: only what the drivers touch. */
function fakePage(url = "about:blank") {
  const em = new EventEmitter();
  const page = Object.assign(em, {
    url: () => url,
    title: async () => "t",
    isClosed: () => false,
    mainFrame: () => ({ url: () => url }),
    goto: vi.fn(async () => ({})),
    close: vi.fn(async () => { em.emit("close"); }),
    evaluate: vi.fn(async () => null),
  });
  return page as unknown as Page & { goto: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn> };
}
function fakeBrowser(pages: Page[] = []) {
  const em = new EventEmitter();
  let connected = true;
  const ctx = { pages: () => pages, on: () => ctx, newCDPSession: async () => ({ send: async () => ({}), detach: async () => {} }), newPage: vi.fn(async () => fakePage()) };
  const browser = Object.assign(em, {
    contexts: () => [ctx],
    newContext: async () => ctx,
    isConnected: () => connected,
    close: vi.fn(async () => { connected = false; em.emit("disconnected"); }),
    /** simulate the socket dropping out from under us */
    drop: () => { connected = false; em.emit("disconnected"); },
  });
  return { browser: browser as unknown as Browser & { drop(): void; close: ReturnType<typeof vi.fn> }, ctx };
}

class TestDriver extends CdpAttachedDriver {
  readonly backend = "chrome" as const;
  protected async identityOfPage(page: object): Promise<string | null> {
    return (page as { id?: string }).id ?? null;
  }
}

afterEach(() => vi.unstubAllGlobals());

describe("CDP driver lifecycle (P1-6)", () => {
  it("attachDirect connections are tracked and closed on dispose", async () => {
    const main = fakeBrowser([]);
    const directPage = fakePage("http://x.test/");
    const direct = fakeBrowser([directPage]);
    const connect = vi.fn(async (endpoint: string) => (endpoint.startsWith("ws://") ? direct.browser : main.browser));
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => [{ id: "T1", type: "page", url: "http://x.test/", title: "x", webSocketDebuggerUrl: "ws://127.0.0.1:1/devtools/page/T1" }] })));
    const d = new TestDriver("http://127.0.0.1:1", inject(connect));
    await d.connect();
    const dp = await d.attach("T1", "p1");
    expect(dp.identity.targetId).toBe("T1");
    expect(connect).toHaveBeenCalledTimes(2);
    expect(d.directConnectionCount()).toBe(1);
    await d.disconnect();
    expect(direct.browser.close).toHaveBeenCalledTimes(1);
    expect(main.browser.close).toHaveBeenCalledTimes(1);
    expect(d.directConnectionCount()).toBe(0);
    expect(d.isConnected()).toBe(false);
  });

  it("closing a directly-attached page releases its connection", async () => {
    const main = fakeBrowser([]);
    const directPage = fakePage();
    const direct = fakeBrowser([directPage]);
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => [{ id: "T1", type: "page", url: "", title: "", webSocketDebuggerUrl: "ws://h/T1" }] })));
    const d = new TestDriver("http://h", inject(async (e) => (e.startsWith("ws://") ? direct.browser : main.browser)));
    await d.connect();
    await d.attach("T1", "p1");
    expect(d.directConnectionCount()).toBe(1);
    await directPage.close();
    expect(direct.browser.close).toHaveBeenCalled();
    expect(d.directConnectionCount()).toBe(0);
  });

  it("a dropped socket marks the driver disconnected and reconnect() restores it lazily", async () => {
    const first = fakeBrowser([]);
    const second = fakeBrowser([]);
    const handles = [first.browser, second.browser];
    const connect = vi.fn(async () => handles.shift()!);
    const d = new TestDriver("http://h", inject(connect));
    const disconnected = vi.fn();
    const reconnected = vi.fn();
    d.onDisconnected = disconnected;
    d.onReconnected = reconnected;
    await d.connect();
    expect(d.isConnected()).toBe(true);

    first.browser.drop();
    expect(d.isConnected()).toBe(false);
    expect(disconnected).toHaveBeenCalledTimes(1);
    expect(reconnected).not.toHaveBeenCalled();

    // concurrent callers share one attempt
    await Promise.all([d.reconnect(), d.reconnect(), d.reconnect()]);
    expect(connect).toHaveBeenCalledTimes(2);
    expect(d.isConnected()).toBe(true);
    expect(reconnected).toHaveBeenCalledTimes(1);
    // already connected → no-op
    await d.reconnect();
    expect(connect).toHaveBeenCalledTimes(2);
  });

  it("an intentional disconnect() does not report a drop", async () => {
    const b = fakeBrowser([]);
    const d = new TestDriver("http://h", inject(async () => b.browser));
    const disconnected = vi.fn();
    d.onDisconnected = disconnected;
    await d.connect();
    await d.disconnect();
    expect(disconnected).not.toHaveBeenCalled();
    expect(d.isConnected()).toBe(false);
  });
});

describe("standalone driver", () => {
  it("createTarget surfaces a failed first navigation instead of returning a healthy id", async () => {
    const page = fakePage();
    page.goto.mockRejectedValueOnce(new Error("net::ERR_NAME_NOT_RESOLVED"));
    const b = fakeBrowser([]);
    b.ctx.newPage.mockResolvedValue(page);
    const d = new StandaloneDriver(launcher(async () => b.browser));
    await d.connect();
    await expect(d.createTarget("http://nope.invalid/")).rejects.toMatchObject({ code: "step_failed" });
    expect(page.close).toHaveBeenCalled();
    expect(await d.listTargets()).toEqual([]);
    // a good navigation still yields a target
    const ok = await d.createTarget("http://x.test/");
    expect(ok).toMatch(/^pw-/);
  });

  it("drop → degraded → reconnect relaunches", async () => {
    const first = fakeBrowser([]);
    const second = fakeBrowser([]);
    const handles = [first.browser, second.browser];
    const launch = vi.fn(async () => handles.shift()!);
    const d = new StandaloneDriver(launcher(launch));
    const disconnected = vi.fn();
    const reconnected = vi.fn();
    d.onDisconnected = disconnected;
    d.onReconnected = reconnected;
    await d.connect();
    first.browser.drop();
    expect(d.isConnected()).toBe(false);
    expect(disconnected).toHaveBeenCalledTimes(1);
    await d.reconnect();
    expect(d.isConnected()).toBe(true);
    expect(reconnected).toHaveBeenCalledTimes(1);
    expect(launch).toHaveBeenCalledTimes(2);
  });
});
