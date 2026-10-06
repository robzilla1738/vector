import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  RpcChannel,
  memoryTransportPair,
  NativeCdpAttachSchema,
  NativeCdpDispatchSchema,
  NativeCdpStartNavigationSchema,
  type EgressLease,
} from "@aux/contracts";
import { describe, expect, it } from "vitest";
import { BrowserEgress } from "../../apps/runtime/src/safety/browser-egress";
import { NullNativeBridge } from "../../apps/runtime/src/native";
import { NativeCdpBroker } from "../../apps/runtime/src/native-cdp-broker";
import { ManagedChromiumDriver } from "../../packages/chromium-driver/src/managed-chromium";

const requireRuntime = createRequire(new URL("../../apps/runtime/package.json", import.meta.url));
const WebSocket = requireRuntime("ws") as new (url: string) => {
  on(event: string, callback: (...args: unknown[]) => void): void;
  send(data: string): void;
  terminate(): void;
};

const OWN = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const NEW = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const OLD = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
async function testAuthorities(now: () => number = Date.now) {
  const leases = new Map<string, EgressLease>();
  const services = new Map<string, BrowserEgress>();
  for (const [pageId, url] of [
    [OWN, "https://example.test/"],
    [NEW, "https://new.test/"],
    [OLD, "https://old.test/"],
  ]) {
    const isolation = {
      isolationId: `isolation-${pageId}`,
      runId: `run-${pageId}`,
      taskRevision: 0,
      mode: "session" as const,
      inMemory: false as const,
      cookies: "profile" as const,
    };
    const native = Object.assign(new NullNativeBridge(), {
      egressContext: async () => ({
        profileId: "profile",
        tabId: pageId!,
        frameId: "frame",
        documentToken: "original-document",
        sourceOrigin: new URL(url!).origin,
        controlGeneration: "original-control",
        personControlled: false,
        isolation,
      }),
      egressInstall: async ({ lease }: { lease: EgressLease }) => {
        leases.set(pageId!, lease);
        return { accepted: true as const };
      },
      egressRevoke: async () => ({ accepted: true as const }),
    });
    const service = new BrowserEgress({
      runAncestry: (runId) => [runId],
      profileId: "profile",
      native,
      run: () => ({ taskRevision: 0, threadId: "thread" }),
      page: () => ({ url: url!, documentEpoch: 0 }),
      ownsPage: () => true,
      audit: () => {},
      approve: async () => false,
      now,
    });
    await service.acquire(isolation.runId, pageId!);
    services.set(pageId!, service);
  }
  return {
    leases,
    capture: (pageId: string, lease: EgressLease) => {
      const service = services.get(pageId);
      if (!service) throw new Error("No original test page authority");
      return service.captureCdpAuthority(pageId, lease);
    },
    retire: (pageId: string) => services.get(pageId)?.suspendRun(`run-${pageId}`),
    replace: async (pageId: string) => {
      const service = services.get(pageId);
      if (!service) throw new Error("Missing test page");
      service.suspendRun(`run-${pageId}`);
      await service.acquire(`run-${pageId}`, pageId);
    },
    close: () => {
      for (const service of services.values()) service.close();
    },
  };
}

describe("Chromium native CDP facade", () => {
  it("does not publish an early child attachment when native autoAttach refuses", async () => {
    const dir = mkdtempSync(join(tmpdir(), "aux-cdp-autoattach-refused-"));
    const [runtimeTransport, hostTransport] = memoryTransportPair();
    const runtime = new RpcChannel(runtimeTransport, "runtime"),
      host = new RpcChannel(hostTransport, "host");
    const authority = await testAuthorities();
    host.onMethod("native.cdpReset", () => ({}));
    host.onMethod("native.cdpCatalog", () => ({
      pages: [
        {
          pageId: OWN,
          cdpTargetId: "own-target",
          url: "https://example.test/",
          title: "Own",
          lease: authority.leases.get(OWN),
        },
      ],
    }));
    host.onMethod("native.cdpAttach", (params) => {
      NativeCdpAttachSchema.parse(params);
      return { attachmentId: "A".repeat(32) };
    });
    host.onMethod("native.cdpDispatch", (params) => {
      const request = params as { pageId: string; attachmentId: string; message: string };
      const message = JSON.parse(request.message) as { id: number };
      queueMicrotask(() => {
        host.notify("native.cdpMessage", {
          pageId: OWN,
          message: JSON.stringify({
            auxAttachmentId: request.attachmentId,
            method: "Target.attachedToTarget",
            params: { sessionId: "refused-child", targetInfo: { type: "iframe" }, waitingForDebugger: false },
          }),
        });
        host.notify("native.cdpMessage", {
          pageId: OWN,
          message: JSON.stringify({
            auxAttachmentId: request.attachmentId,
            id: message.id,
            error: { code: -32000, message: "Original native autoAttach refused" },
          }),
        });
      });
      return {};
    });
    const broker = await NativeCdpBroker.start(runtime, authority.capture, dir),
      socket = new WebSocket(broker.endpoint());
    const frames: Record<string, unknown>[] = [];
    socket.on("message", (raw) => frames.push(JSON.parse(String(raw))));
    const wait = async (id: number) => {
      for (let attempt = 0; attempt < 200 && !frames.some((frame) => frame.id === id); attempt++)
        await new Promise((resolve) => setTimeout(resolve, 5));
      return frames.find((frame) => frame.id === id);
    };
    try {
      await new Promise<void>((resolve) => socket.on("open", () => resolve()));
      socket.send(
        JSON.stringify({
          id: 1,
          method: "Target.setAutoAttach",
          params: { autoAttach: true, flatten: true },
        }),
      );
      expect((await wait(1))?.result).toEqual({});
      const parent = (
        frames.find((frame) => frame.method === "Target.attachedToTarget")?.params as
          { sessionId?: string } | undefined
      )?.sessionId;
      expect(parent).toMatch(/^aux-page-/);
      socket.send(
        JSON.stringify({
          id: 2,
          sessionId: parent,
          method: "Target.setAutoAttach",
          params: { autoAttach: true, flatten: true },
        }),
      );
      expect((await wait(2))?.error).toMatchObject({ message: "Original native autoAttach refused" });
      expect(frames.filter((frame) => frame.method === "Target.attachedToTarget")).toHaveLength(1);
      socket.send(
        JSON.stringify({ id: 3, sessionId: "refused-child", method: "Runtime.enable", params: {} }),
      );
      expect((await wait(3))?.error).toBeTruthy();
    } finally {
      socket.terminate();
      await broker.close();
      authority.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it.each(["retirement", "expiry"] as const)(
    "refuses an attachment ACK after original authority %s without publishing a session",
    async (change) => {
      const dir = mkdtempSync(join(tmpdir(), "aux-cdp-attach-retired-"));
      const [runtimeTransport, hostTransport] = memoryTransportPair();
      const runtime = new RpcChannel(runtimeTransport, "runtime");
      const host = new RpcChannel(hostTransport, "host");
      let now = Date.now();
      const authority = await testAuthorities(() => now);
      host.onMethod("native.cdpReset", () => ({}));
      host.onMethod("native.cdpCatalog", () => ({
        pages: [
          {
            pageId: OWN,
            cdpTargetId: "own-target",
            url: "https://example.test/",
            title: "Own",
            lease: authority.leases.get(OWN),
          },
        ],
      }));
      let acknowledge!: () => void;
      let entered!: () => void;
      const attaching = new Promise<void>((resolve) => {
        entered = resolve;
      });
      host.onMethod("native.cdpAttach", async (params) => {
        const request = NativeCdpAttachSchema.parse(params);
        expect(request.acknowledgedExpiresAt).toBe(authority.leases.get(OWN)!.expiresAt);
        entered();
        await new Promise<void>((resolve) => {
          acknowledge = resolve;
        });
        return { attachmentId: "A".repeat(32) };
      });
      const broker = await NativeCdpBroker.start(runtime, authority.capture, dir);
      const socket = new WebSocket(broker.endpoint());
      const frames: Record<string, unknown>[] = [];
      socket.on("message", (raw) => frames.push(JSON.parse(String(raw))));
      try {
        await new Promise<void>((resolve) => socket.on("open", () => resolve()));
        socket.send(
          JSON.stringify({
            id: 1,
            method: "Target.setAutoAttach",
            params: { autoAttach: true, flatten: true },
          }),
        );
        await attaching;
        if (change === "retirement") authority.retire(OWN);
        else now = authority.leases.get(OWN)!.expiresAt;
        acknowledge();
        for (let attempt = 0; attempt < 200 && !frames.some((frame) => frame.id === 1); attempt++)
          await new Promise((resolve) => setTimeout(resolve, 5));
        expect(frames.find((frame) => frame.id === 1)?.error).toBeTruthy();
        expect(frames.some((frame) => frame.method === "Target.attachedToTarget")).toBe(false);
      } finally {
        acknowledge?.();
        socket.terminate();
        await broker.close();
        authority.close();
        rmSync(dir, { recursive: true, force: true });
      }
    },
  );

  it("waits for native attachment reset before accepting protocol commands", async () => {
    const dir = mkdtempSync(join(tmpdir(), "aux-cdp-reset-"));
    const [runtimeTransport, hostTransport] = memoryTransportPair();
    const runtime = new RpcChannel(runtimeTransport, "runtime");
    const host = new RpcChannel(hostTransport, "host");
    const authority = await testAuthorities();
    let attachmentCount = 0;
    host.onMethod("native.cdpAttach", (params) => {
      NativeCdpAttachSchema.parse(params);
      return { attachmentId: (++attachmentCount).toString(16).toUpperCase().padStart(32, "0") };
    });
    let release!: () => void;
    let started!: () => void;
    const resetting = new Promise<void>((resolve) => {
      started = resolve;
    });
    let resets = 0;
    host.onMethod("native.cdpReset", () => {
      if (++resets > 1) return {};
      started();
      return new Promise<void>((resolve) => {
        release = resolve;
      });
    });
    let versions = 0;
    host.onMethod("native.cdpVersion", () => {
      versions++;
      return { version: "154.0.8037.58" };
    });
    const broker = await NativeCdpBroker.start(runtime, authority.capture, dir);
    const client = new WebSocket(broker.endpoint());
    try {
      await new Promise<void>((resolve) => client.on("open", () => resolve()));
      await resetting;
      const reply = new Promise<Record<string, unknown>>((resolve) =>
        client.on("message", (raw) => resolve(JSON.parse(String(raw)))),
      );
      client.send(JSON.stringify({ id: 1, method: "Browser.getVersion", params: {} }));
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(versions).toBe(0);
      release();
      expect((await reply).id).toBe(1);
      expect(versions).toBe(1);
    } finally {
      release?.();
      client.terminate();
      await broker.close();
      authority.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("does not carry a disconnected client's target reply into a new connection", async () => {
    const dir = mkdtempSync(join(tmpdir(), "aux-cdp-reconnect-"));
    const [runtimeTransport, hostTransport] = memoryTransportPair();
    const runtime = new RpcChannel(runtimeTransport, "runtime");
    const host = new RpcChannel(hostTransport, "host");
    const authority = await testAuthorities();
    let attachmentCount = 0;
    host.onMethod("native.cdpAttach", (params) => {
      NativeCdpAttachSchema.parse(params);
      return { attachmentId: (++attachmentCount).toString(16).toUpperCase().padStart(32, "0") };
    });
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
    host.onMethod("native.cdpCatalog", () => {
      if (++calls === 1) {
        markFirstStarted();
        return firstSnapshot;
      }
      return {
        pages: [
          {
            pageId: NEW,
            lease: authority.leases.get(NEW),
            cdpTargetId: "new-target",
            url: "https://new.test/",
            title: "New",
          },
        ],
      };
    });
    const broker = await NativeCdpBroker.start(runtime, authority.capture, dir);
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
          {
            pageId: OLD,
            lease: authority.leases.get(OLD),
            cdpTargetId: "old-target",
            url: "https://old.test/",
            title: "Old",
          },
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
      authority.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("connects Playwright over the private Unix socket", async () => {
    const dir = mkdtempSync(join(tmpdir(), "aux-cdp-playwright-"));
    const [runtimeTransport, hostTransport] = memoryTransportPair();
    const runtime = new RpcChannel(runtimeTransport, "runtime");
    const host = new RpcChannel(hostTransport, "host");
    const authority = await testAuthorities();
    let attachmentCount = 0;
    host.onMethod("native.cdpAttach", (params) => {
      NativeCdpAttachSchema.parse(params);
      return { attachmentId: (++attachmentCount).toString(16).toUpperCase().padStart(32, "0") };
    });
    host.onMethod("native.cdpReset", () => ({}));
    host.onMethod("native.cdpCatalog", () => ({ pages: [] }));
    host.onMethod("native.cdpVersion", () => ({ version: "154.0.8037.58" }));
    const broker = await NativeCdpBroker.start(runtime, authority.capture, dir);
    const driver = new ManagedChromiumDriver(broker.endpoint(), { trustedPages: async () => [] });
    try {
      await driver.connect();
      expect(driver.isConnected()).toBe(true);
      expect(await driver.listTargets()).toEqual([]);
    } finally {
      await driver.disconnect();
      await broker.close();
      authority.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("exposes only Profile catalog targets and routes page messages through the native broker", async () => {
    const dir = mkdtempSync(join(tmpdir(), "aux-cdp-"));
    const [runtimeTransport, hostTransport] = memoryTransportPair();
    const runtime = new RpcChannel(runtimeTransport, "runtime");
    const host = new RpcChannel(hostTransport, "host");
    const authority = await testAuthorities();
    let attachmentCount = 0;
    host.onMethod("native.cdpAttach", (params) => {
      NativeCdpAttachSchema.parse(params);
      return { attachmentId: (++attachmentCount).toString(16).toUpperCase().padStart(32, "0") };
    });
    host.onMethod("native.cdpReset", () => ({}));
    const dispatched: {
      pageId: string;
      acknowledgedExpiresAt: number;
      message: { id: number; method: string; sessionId?: string };
    }[] = [];
    let listCalls = 0;
    let pages = [
      {
        pageId: OWN,
        lease: authority.leases.get(OWN),
        cdpTargetId: "own-target",
        url: "https://example.test/",
        title: "Own tab",
      },
    ];
    host.onMethod("native.cdpCatalog", () => {
      listCalls++;
      return { pages };
    });
    host.onMethod("native.cdpVersion", () => ({ version: "154.0.8037.58" }));
    host.onMethod("native.cdpDispatch", (params) => {
      const request = NativeCdpDispatchSchema.parse(params);
      const message = JSON.parse(request.message) as { id: number; method: string; sessionId?: string };
      dispatched.push({
        pageId: request.pageId,
        acknowledgedExpiresAt: request.acknowledgedExpiresAt,
        message,
      });
      if (message.method === "Target.setAutoAttach")
        queueMicrotask(() =>
          host.notify("native.cdpMessage", {
            pageId: request.pageId,
            message: JSON.stringify({
              auxAttachmentId: request.attachmentId,
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
          message: JSON.stringify({
            auxAttachmentId: request.attachmentId,
            id: message.id,
            result: { reached: true },
          }),
        }),
      );
      return { accepted: true };
    });
    const broker = await NativeCdpBroker.start(runtime, authority.capture, dir);
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
      expect(dispatched[0]).toMatchObject({
        pageId: OWN,
        acknowledgedExpiresAt: authority.leases.get(OWN)!.expiresAt,
        message: { method: "Page.enable" },
      });
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
          pageId: NEW,
          lease: authority.leases.get(NEW),
          cdpTargetId: "new-target",
          url: "https://new.test/",
          title: "New tab",
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
      const originalAttachment = "1".padStart(32, "0");
      await authority.replace(OWN);
      pages = pages.map((page) =>
        page.pageId === OWN ? { ...page, lease: authority.leases.get(OWN) } : page,
      );
      host.notify("native.cdpAuthorityChanged", {});
      for (
        let attempt = 0;
        attempt < 200 &&
        !frames.some(
          (frame) =>
            frame.method === "Target.detachedFromTarget" &&
            (frame.params as { sessionId?: string }).sessionId === sessionId,
        );
        attempt++
      )
        await new Promise((resolve) => setTimeout(resolve, 5));
      expect(
        frames.some(
          (frame) =>
            frame.method === "Target.detachedFromTarget" &&
            (frame.params as { sessionId?: string }).sessionId === sessionId,
        ),
      ).toBe(true);
      expect((await call("Runtime.evaluate", { expression: "1" }, sessionId)).error).toBeTruthy();
      const beforeLate = frames.length;
      host.notify("native.cdpMessage", {
        pageId: OWN,
        message: JSON.stringify({
          auxAttachmentId: originalAttachment,
          method: "Runtime.consoleAPICalled",
          params: { marker: "retired-attachment" },
        }),
      });
      await call("Browser.getVersion");
      expect(frames.slice(beforeLate).some((frame) => frame.method === "Runtime.consoleAPICalled")).toBe(
        false,
      );
      const callsAfterNotification = listCalls;
      await new Promise((resolve) => setTimeout(resolve, 400));
      expect(listCalls).toBe(callsAfterNotification);
    } finally {
      socket.terminate();
      await broker.close();
      authority.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("fixed native controlled navigation transport", () => {
  it.each(["ready", "refused"] as const)(
    "retains early %s against the original START acknowledgement",
    async (state) => {
      const dir = mkdtempSync(join(tmpdir(), "aux-cdp-navigation-"));
      const [a, b] = memoryTransportPair();
      const runtime = new RpcChannel(a, "runtime"),
        host = new RpcChannel(b, "host");
      const authority = await testAuthorities();
      const attachmentId = "A".repeat(32),
        lease = authority.leases.get(OWN)!;
      let releaseStart!: () => void, sawStart!: () => void;
      const held = new Promise<void>((resolve) => {
        releaseStart = resolve;
      });
      const started = new Promise<void>((resolve) => {
        sawStart = resolve;
      });
      let takes = 0;
      host.onMethod("native.cdpReset", () => ({}));
      host.onMethod("native.cdpCatalog", () => ({
        pages: [{ pageId: OWN, cdpTargetId: "target", url: "https://example.test/", title: "Own", lease }],
      }));
      host.onMethod("native.cdpAttach", (params) => {
        NativeCdpAttachSchema.parse(params);
        return { attachmentId };
      });
      host.onMethod("native.cdpStartNavigation", async (params) => {
        const request = NativeCdpStartNavigationSchema.parse(params);
        host.notify("native.cdpNavigationState", {
          pageId: OWN,
          attachmentId,
          leaseId: lease.leaseId,
          commandId: request.commandId,
          state,
        });
        sawStart();
        await held;
        return { accepted: true };
      });
      host.onMethod("native.cdpTakeNavigationReceipt", (params) => {
        takes++;
        const request = params as { commandId: number };
        return {
          originalAttachmentId: attachmentId,
          originalLeaseId: lease.leaseId,
          commandId: request.commandId,
          navigationId: "123",
          navigationTransitionId: "B".repeat(32),
          url: "https://example.test/next",
          context: {
            profileId: "profile",
            tabId: OWN,
            frameId: "replacement-frame",
            documentToken: "replacement-document",
            sourceOrigin: "https://example.test",
            controlGeneration: "replacement-control",
            personControlled: false,
          },
        };
      });
      const broker = await NativeCdpBroker.start(runtime, authority.capture, dir);
      const socket = new WebSocket(broker.endpoint());
      let attached!: () => void;
      const attachedReply = new Promise<void>((resolve) => {
        attached = resolve;
      });
      socket.on("message", (raw) => {
        const frame = JSON.parse(String(raw)) as { id?: number };
        if (frame.id === 1) attached();
      });
      try {
        await new Promise<void>((resolve) => socket.on("open", () => resolve()));
        socket.send(
          JSON.stringify({
            id: 1,
            method: "Target.setAutoAttach",
            params: { autoAttach: true, flatten: true },
          }),
        );
        await attachedReply;
        const result = broker.navigateControlled(
          OWN,
          "https://example.test/next",
          new AbortController().signal,
        );
        const observed = result.then(
          (value) => ({ status: "fulfilled" as const, value }),
          (error) => ({ status: "rejected" as const, error: error as Error }),
        );
        await started;
        await new Promise<void>((resolve) => setImmediate(resolve));
        expect(takes).toBe(0);
        releaseStart();
        const outcome = await observed;
        expect(outcome.status).toBe(state === "ready" ? "fulfilled" : "rejected");
        expect(takes).toBe(state === "ready" ? 1 : 0);
        expect("value" in outcome ? outcome.value.navigationId : outcome.error.message).toBe(
          state === "ready" ? "123" : "Original native navigation authority retired",
        );
        let retained = false,
          replayRefused = false,
          copiedRefused = false;
        if ("value" in outcome) {
          try {
            broker.navigationDeadline({ ...outcome.value });
          } catch {
            copiedRefused = true;
          }
          const deadline = broker.navigationDeadline(outcome.value);
          retained = deadline > Date.now() && deadline <= authority.leases.get(OWN)!.expiresAt;
          try {
            broker.navigationDeadline(outcome.value);
          } catch {
            replayRefused = true;
          }
        }
        expect({ retained, replayRefused, copiedRefused }).toEqual(
          state === "ready"
            ? { retained: true, replayRefused: true, copiedRefused: true }
            : { retained: false, replayRefused: false, copiedRefused: false },
        );
      } finally {
        releaseStart();
        socket.terminate();
        await broker.close();
        authority.close();
        rmSync(dir, { recursive: true, force: true });
      }
    },
  );
});
