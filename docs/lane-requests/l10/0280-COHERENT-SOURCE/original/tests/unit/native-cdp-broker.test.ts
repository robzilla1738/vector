import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { RpcChannel, memoryTransportPair } from "@aux/contracts";
import { describe, expect, it } from "vitest";
import { NativeCdpBroker } from "../../apps/runtime/src/native-cdp-broker";
import { ManagedChromiumDriver } from "../../packages/chromium-driver/src/managed-chromium";

const requireRuntime = createRequire(new URL("../../apps/runtime/package.json", import.meta.url));
const WebSocket = requireRuntime("ws") as new (url: string) => {
  on(event: string, callback: (...args: unknown[]) => void): void;
  send(data: string): void;
  terminate(): void;
};

describe("Chromium native CDP facade", () => {
  it("waits for native attachment reset before accepting protocol commands", async () => {
    const dir = mkdtempSync(join(tmpdir(), "aux-cdp-reset-"));
    const [runtimeTransport, hostTransport] = memoryTransportPair();
    const runtime = new RpcChannel(runtimeTransport, "runtime");
    const host = new RpcChannel(hostTransport, "host");
    let release!: () => void;
    let started!: () => void;
    const resetting = new Promise<void>(resolve => { started = resolve; });
    let resets = 0;
    host.onMethod("native.cdpReset", () => {
      if (++resets > 1) return {};
      started();
      return new Promise<void>(resolve => { release = resolve; });
    });
    let versions = 0;
    host.onMethod("native.cdpVersion", () => { versions++; return { version: "154.0.8037.58" }; });
    const broker = await NativeCdpBroker.start(runtime, dir);
    const client = new WebSocket(broker.endpoint());
    try {
      await new Promise<void>(resolve => client.on("open", () => resolve()));
      await resetting;
      const reply = new Promise<Record<string, unknown>>(resolve => client.on("message", raw => resolve(JSON.parse(String(raw)))));
      client.send(JSON.stringify({ id: 1, method: "Browser.getVersion", params: {} }));
      await new Promise(resolve => setTimeout(resolve, 20));
      expect(versions).toBe(0);
      release();
      expect((await reply).id).toBe(1);
      expect(versions).toBe(1);
    } finally {
      release?.();
      client.terminate();
      await broker.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });


  it("does not carry a disconnected client's target reply into a new connection", async () => {
    const dir = mkdtempSync(join(tmpdir(), "aux-cdp-reconnect-"));
    const [runtimeTransport, hostTransport] = memoryTransportPair();
    const runtime = new RpcChannel(runtimeTransport, "runtime");
    const host = new RpcChannel(hostTransport, "host");
    host.onMethod("native.cdpReset", () => ({}));
    let releaseFirst!: (value: { pages: unknown[] }) => void;
    let markFirstStarted!: () => void;
    const firstSnapshot = new Promise<{ pages: unknown[] }>((resolve) => {
      releaseFirst = resolve;
    });
    const firstStarted = new Promise<void>((resolve) => {
      markFirstStarted = resolve;
    });
    let calls = 0;
    host.onMethod("native.listPages", () => {
      if (++calls === 1) {
        markFirstStarted();
        return firstSnapshot;
      }
      return {
        pages: [
          { pageId: "new", cdpTargetId: "new-target", url: "https://new.test/", title: "New", active: true },
        ],
      };
    });
    const broker = await NativeCdpBroker.start(runtime, dir);
    const oldClient = new WebSocket(broker.endpoint());
    let newClient: InstanceType<typeof WebSocket> | undefined;
    try {
      await new Promise<void>((resolve) => oldClient.on("open", () => resolve()));
      oldClient.send(JSON.stringify({ id: 1, method: "Target.getTargets", params: {} }));
      await firstStarted;
      const closed = new Promise<void>((resolve) => oldClient.on("close", () => resolve()));
      oldClient.terminate();
      await closed;
      newClient = new WebSocket(broker.endpoint());
      const frames: Record<string, unknown>[] = [];
      newClient.on("message", (raw) => frames.push(JSON.parse(String(raw)) as Record<string, unknown>));
      await new Promise<void>((resolve) => newClient!.on("open", () => resolve()));
      newClient.send(
        JSON.stringify({
          id: 2,
          method: "Target.setAutoAttach",
          params: { autoAttach: true, flatten: true },
        }),
      );
      releaseFirst({
        pages: [
          { pageId: "old", cdpTargetId: "old-target", url: "https://old.test/", title: "Old", active: true },
        ],
      });
      for (let attempt = 0; attempt < 200 && !frames.some((frame) => frame.id === 2); attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
      expect(frames.some((frame) => frame.id === 1)).toBe(false);
      expect(
        frames.some(
          (frame) =>
            frame.method === "Target.attachedToTarget" &&
            (frame.params as { targetInfo?: { targetId?: string } }).targetInfo?.targetId === "old-target",
        ),
      ).toBe(false);
      expect(
        frames.some(
          (frame) =>
            frame.method === "Target.attachedToTarget" &&
            (frame.params as { targetInfo?: { targetId?: string } }).targetInfo?.targetId === "new-target",
        ),
      ).toBe(true);
      expect(frames.find((frame) => frame.id === 2)?.result).toEqual({});
    } finally {
      releaseFirst({ pages: [] });
      oldClient.terminate();
      newClient?.terminate();
      await broker.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("connects Playwright over the private Unix socket", async () => {
    const dir = mkdtempSync(join(tmpdir(), "aux-cdp-playwright-"));
    const [runtimeTransport, hostTransport] = memoryTransportPair();
    const runtime = new RpcChannel(runtimeTransport, "runtime");
    const host = new RpcChannel(hostTransport, "host");
    host.onMethod("native.cdpReset", () => ({}));
    host.onMethod("native.listPages", () => ({ pages: [] }));
    host.onMethod("native.cdpVersion", () => ({ version: "154.0.8037.58" }));
    const broker = await NativeCdpBroker.start(runtime, dir);
    const driver = new ManagedChromiumDriver(broker.endpoint(), { trustedPages: async () => [] });
    try {
      await driver.connect();
      expect(driver.isConnected()).toBe(true);
      expect(await driver.listTargets()).toEqual([]);
    } finally {
      await driver.disconnect();
      await broker.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("exposes only Profile catalog targets and routes page messages through the native broker", async () => {
    const dir = mkdtempSync(join(tmpdir(), "aux-cdp-"));
    const [runtimeTransport, hostTransport] = memoryTransportPair();
    const runtime = new RpcChannel(runtimeTransport, "runtime");
    const host = new RpcChannel(hostTransport, "host");
    host.onMethod("native.cdpReset", () => ({}));
    const dispatched: { pageId: string; message: { id: number; method: string; sessionId?: string } }[] = [];
    let listCalls = 0;
    let pages = [
      {
        pageId: "own",
        cdpTargetId: "own-target",
        url: "https://example.test/",
        title: "Own tab",
        active: true,
      },
    ];
    host.onMethod("native.listPages", () => {
      listCalls++;
      return { pages };
    });
    host.onMethod("native.cdpVersion", () => ({ version: "154.0.8037.58" }));
    host.onMethod("native.cdpDispatch", (params) => {
      const request = params as { pageId: string; message: string };
      const message = JSON.parse(request.message) as { id: number; method: string; sessionId?: string };
      dispatched.push({ pageId: request.pageId, message });
      if (message.method === "Target.setAutoAttach")
        queueMicrotask(() =>
          host.notify("native.cdpMessage", {
            pageId: request.pageId,
            message: JSON.stringify({
              method: "Target.attachedToTarget",
              params: {
                sessionId: "child-owned",
                targetInfo: { targetId: "iframe-target", type: "iframe" },
                waitingForDebugger: false,
              },
            }),
          }),
        );
      queueMicrotask(() =>
        host.notify("native.cdpMessage", {
          pageId: request.pageId,
          message: JSON.stringify({ id: message.id, result: { reached: true } }),
        }),
      );
      return { accepted: true };
    });
    const broker = await NativeCdpBroker.start(runtime, dir);
    const socket = new WebSocket(broker.endpoint());
    const frames: Record<string, unknown>[] = [];
    socket.on("message", (raw) => frames.push(JSON.parse(String(raw)) as Record<string, unknown>));
    await new Promise<void>((resolve, reject) => {
      socket.on("open", () => resolve());
      socket.on("error", (error) => reject(error));
    });
    let id = 0;
    async function call(method: string, params: Record<string, unknown> = {}, sessionId?: string) {
      const requestId = ++id;
      socket.send(JSON.stringify({ id: requestId, method, params, sessionId }));
      for (let attempt = 0; attempt < 200; attempt++) {
        const response = frames.find((frame) => frame.id === requestId);
        if (response) return response;
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
      throw new Error(`No response for ${method}`);
    }
    try {
      expect((await call("Browser.getVersion")).result).toMatchObject({ product: "Chrome/154.0.8037.58" });
      expect((await call("Target.getTargets")).result).toMatchObject({
        targetInfos: [{ targetId: "own-target" }],
      });
      expect((await call("Target.attachToTarget", { targetId: "foreign-target" })).error).toBeTruthy();
      expect((await call("Target.getTargetInfo", { targetId: "foreign-target" })).error).toBeTruthy();
      expect((await call("Target.setAutoAttach", { autoAttach: true, flatten: true })).result).toEqual({});
      const attached = frames.find((frame) => frame.method === "Target.attachedToTarget");
      const sessionId = (attached?.params as { sessionId?: string })?.sessionId;
      expect(sessionId).toMatch(/^aux-page-/);
      const pageReply = await call("Page.enable", {}, sessionId);
      expect(pageReply).toMatchObject({ result: { reached: true }, sessionId });
      expect(dispatched).toHaveLength(1);
      expect(dispatched[0]).toMatchObject({ pageId: "own", message: { method: "Page.enable" } });
      expect((await call("Network.getCookies", {}, sessionId)).error).toBeTruthy();
      expect(
        (await call("Target.setAutoAttach", { autoAttach: true, flatten: true }, sessionId)).result,
      ).toEqual({ reached: true });
      const childEvent = frames.find(
        (frame) => frame.method === "Target.attachedToTarget" && frame.sessionId === sessionId,
      );
      expect((childEvent?.params as { sessionId?: string })?.sessionId).toBe("child-owned");
      expect((await call("Runtime.evaluate", { expression: "1 + 1" }, "child-owned")).result).toEqual({
        reached: true,
      });
      expect(dispatched.at(-1)?.message).toMatchObject({
        method: "Runtime.evaluate",
        sessionId: "child-owned",
      });
      expect((await call("Runtime.evaluate", { expression: "1" }, "child-foreign")).error).toBeTruthy();
      expect((await call("Target.attachToBrowserTarget")).result).toMatchObject({
        sessionId: expect.stringMatching(/^aux-browser-/),
      });
      expect((await call("Target.setDiscoverTargets", { discover: true })).result).toEqual({});
      pages = [
        ...pages,
        {
          pageId: "new",
          cdpTargetId: "new-target",
          url: "https://new.test/",
          title: "New tab",
          active: false,
        },
      ];
      host.notify("native.tabsChanged", {});
      for (
        let attempt = 0;
        attempt < 100 &&
        !frames.some(
          (frame) =>
            frame.method === "Target.targetCreated" &&
            (frame.params as { targetInfo?: { targetId?: string } }).targetInfo?.targetId === "new-target",
        );
        attempt++
      ) {
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
      expect(frames).toContainEqual(
        expect.objectContaining({
          method: "Target.targetCreated",
          params: expect.objectContaining({
            targetInfo: expect.objectContaining({ targetId: "new-target" }),
          }),
        }),
      );
      const callsAfterNotification = listCalls;
      await new Promise((resolve) => setTimeout(resolve, 400));
      expect(listCalls).toBe(callsAfterNotification);
    } finally {
      socket.terminate();
      await broker.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
