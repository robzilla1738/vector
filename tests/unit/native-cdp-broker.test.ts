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
  it("connects Playwright over the private Unix socket", async () => {
    const dir = mkdtempSync(join(tmpdir(), "aux-cdp-playwright-"));
    const [runtimeTransport, hostTransport] = memoryTransportPair();
    const runtime = new RpcChannel(runtimeTransport, "runtime");
    const host = new RpcChannel(hostTransport, "host");
    host.onMethod("native.listPages", () => ({ pages: [] }));
    host.onMethod("native.cdpVersion", () => ({ version: "154.0.8037.58" }));
    const broker = await NativeCdpBroker.start(runtime, join(dir, "host.sock"));
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
    const dispatched: { pageId: string; message: { id: number; method: string } }[] = [];
    host.onMethod("native.listPages", () => ({ pages: [
      { pageId: "own", cdpTargetId: "own-target", url: "https://example.test/", title: "Own tab", active: true },
    ] }));
    host.onMethod("native.cdpVersion", () => ({ version: "154.0.8037.58" }));
    host.onMethod("native.cdpDispatch", params => {
      const request = params as { pageId: string; message: string };
      const message = JSON.parse(request.message) as { id: number; method: string };
      dispatched.push({ pageId: request.pageId, message });
      queueMicrotask(() => host.notify("native.cdpMessage", {
        pageId: request.pageId, message: JSON.stringify({ id: message.id, result: { reached: true } }),
      }));
      return { accepted: true };
    });
    const broker = await NativeCdpBroker.start(runtime, join(dir, "host.sock"));
    const socket = new WebSocket(broker.endpoint());
    const frames: Record<string, unknown>[] = [];
    socket.on("message", raw => frames.push(JSON.parse(String(raw)) as Record<string, unknown>));
    await new Promise<void>((resolve, reject) => {
      socket.on("open", () => resolve());
      socket.on("error", error => reject(error));
    });
    let id = 0;
    async function call(method: string, params: Record<string, unknown> = {}, sessionId?: string) {
      const requestId = ++id;
      socket.send(JSON.stringify({ id: requestId, method, params, sessionId }));
      for (let attempt = 0; attempt < 200; attempt++) {
        const response = frames.find(frame => frame.id === requestId);
        if (response) return response;
        await new Promise(resolve => setTimeout(resolve, 5));
      }
      throw new Error(`No response for ${method}`);
    }
    try {
      expect((await call("Browser.getVersion")).result).toMatchObject({ product: "Chrome/154.0.8037.58" });
      expect((await call("Target.getTargets")).result).toMatchObject({ targetInfos: [{ targetId: "own-target" }] });
      expect((await call("Target.attachToTarget", { targetId: "foreign-target" })).error).toBeTruthy();
      expect((await call("Target.getTargetInfo", { targetId: "foreign-target" })).error).toBeTruthy();
      expect((await call("Target.setAutoAttach", { autoAttach: true, flatten: true })).result).toEqual({});
      const attached = frames.find(frame => frame.method === "Target.attachedToTarget");
      const sessionId = (attached?.params as { sessionId?: string })?.sessionId;
      expect(sessionId).toMatch(/^aux-page-/);
      const pageReply = await call("Page.enable", {}, sessionId);
      expect(pageReply).toMatchObject({ result: { reached: true }, sessionId });
      expect(dispatched).toHaveLength(1);
      expect(dispatched[0]).toMatchObject({ pageId: "own", message: { method: "Page.enable" } });
      expect((await call("Network.getCookies", {}, sessionId)).error).toBeTruthy();
      expect((await call("Target.attachToBrowserTarget")).result).toMatchObject({ sessionId: expect.stringMatching(/^aux-browser-/) });
    } finally {
      socket.terminate();
      await broker.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
