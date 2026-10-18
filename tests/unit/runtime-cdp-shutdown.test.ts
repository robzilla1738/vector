import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { RpcChannel, memoryTransportPair, NativeCdpDispatchSchema, type EgressLease } from "@aux/contracts";
import { expect, it, vi } from "vitest";
import { BrowserEgress } from "../../apps/runtime/src/safety/browser-egress";
import { NullNativeBridge } from "../../apps/runtime/src/native";
import { NativeCdpBroker } from "../../apps/runtime/src/native-cdp-broker";
import { runtimeShutdown } from "../../apps/runtime/src/services/runtime-shutdown";
import { PageOwnership } from "../../apps/runtime/src/scheduler/page-ownership";
import { ConnectionRecovery } from "../../apps/runtime/src/connection-recovery";

const WebSocket = createRequire(new URL("../../apps/runtime/package.json", import.meta.url))("ws") as new (
  url: string,
) => {
  on(event: string, callback: (...args: unknown[]) => void): void;
  send(data: string): void;
  terminate(): void;
};
const PAGE = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

it.each(["connected", "closed"] as const)(
  "joins a held original CDP command promptly during shutdown with %s host, without early page release",
  async (hostState) => {
    const directory = mkdtempSync(join(tmpdir(), "aux-cdp-shutdown-"));
    const [a, b] = memoryTransportPair();
    let disconnectHost!: () => void;
    const runtime = new RpcChannel(
      {
        ...a,
        onClose: (callback) => {
          disconnectHost = callback;
        },
      },
      "runtime",
    );
    const host = new RpcChannel(b, "host");
    let lease: EgressLease | undefined;
    const native = Object.assign(new NullNativeBridge(), {
      egressContext: async () => ({
        profileId: "profile",
        tabId: PAGE,
        frameId: "frame",
        documentToken: "document",
        sourceOrigin: "https://example.test",
        controlGeneration: "original",
        personControlled: false,
        isolation: {
          isolationId: "isolation",
          runId: "original",
          taskRevision: 0,
          mode: "session" as const,
          inMemory: false as const,
          cookies: "profile" as const,
        },
      }),
      egressInstall: async (request: { lease: EgressLease }) => {
        lease = request.lease;
        return { accepted: true as const };
      },
      egressRevoke: async () => ({ accepted: true as const }),
    });
    const egress = new BrowserEgress({
      profileId: "profile",
      native,
      runAncestry: (id) => [id],
      run: () => ({ taskRevision: 0, threadId: "thread" }),
      page: () => ({ url: "https://example.test/", documentEpoch: 0 }),
      ownsPage: () => true,
      audit: () => {},
      approve: async () => false,
    });
    await egress.acquire("original", PAGE);
    const capture = egress.captureCdpAuthority.bind(egress);
    host.onMethod("native.cdpReset", () => ({}));
    host.onMethod("native.cdpVersion", () => ({ version: "155.0.8059.85" }));
    host.onMethod("native.cdpCatalog", () => ({
      pages: [
        { pageId: PAGE, cdpTargetId: "target", url: "https://example.test/", title: "Original", lease },
      ],
    }));
    host.onMethod("native.cdpAttach", () => ({ attachmentId: "A".repeat(32) }));
    let originalDispatch: ReturnType<typeof NativeCdpDispatchSchema.parse> | undefined;
    host.onMethod("native.cdpDispatch", (request) => {
      originalDispatch = NativeCdpDispatchSchema.parse(request);
      return {};
    });
    const broker = await NativeCdpBroker.start(runtime, capture, directory);
    const socket = new WebSocket(broker.endpoint());
    const frames: { id?: number; result?: { sessionId?: string }; error?: unknown }[] = [];
    const command = Promise.withResolvers<string>();
    let settlements = 0;
    const settle = (kind: string) => {
      settlements++;
      command.resolve(kind);
    };
    socket.on("message", (raw) => {
      const frame = JSON.parse(String(raw));
      frames.push(frame);
      if (frame.id === 2) settle(frame.error ? "protocol_error" : "unexpected_success");
    });
    socket.on("close", () => {
      if (!settlements) settle("transport_closed");
    });
    const wait = async (condition: () => boolean) => {
      for (let attempt = 0; attempt < 200; attempt++) {
        if (condition()) return;
        await delay(5);
      }
      throw new Error("Original shutdown fixture did not settle");
    };
    const ownership = new PageOwnership();
    const releaseOriginal = ownership.tryAcquire({ pageId: PAGE, actor: "coordinator", runId: "original" });
    const finishUnwind = Promise.withResolvers<void>();
    const stages: string[] = [];
    const originalWork = command.promise.then(async (kind) => {
      stages.push("command_settled");
      await finishUnwind.promise;
      stages.push("work_joined");
      releaseOriginal();
      return kind;
    });
    let nextEntered = false;
    const nextOwner = ownership
      .acquire({ pageId: PAGE, actor: "coordinator", runId: "next" })
      .then((release) => {
        nextEntered = true;
        return release;
      });
    const reconnect = vi.fn(async () => {});
    const recovery = new ConnectionRecovery({ reconnect, isConnected: () => false });
    const failures = vi.fn();
    const shutdown = runtimeShutdown({
      quiesce: () => {
        stages.push("quiesce");
      },
      retireAuthority: async () => {
        const results = await Promise.allSettled([
          recovery.stop(),
          broker.close(),
          (async () => {
            stages.push("run_join_started");
            await originalWork;
            stages.push("run_join_finished");
          })(),
        ]);
        const rejected = results.filter(
          (result): result is PromiseRejectedResult => result.status === "rejected",
        );
        if (rejected.length)
          throw new AggregateError(
            rejected.map((result) => result.reason),
            "Original retirement did not join",
          );
      },
      closeEgress: () => {
        stages.push("egress_close");
        egress.close();
      },
      disconnectAuthority: () => {
        stages.push("host_disconnect");
      },
      stopMessages: async () => {},
      markInterrupted: async () => {
        stages.push("interrupted");
      },
      stopFeatures: async () => {},
      cleanup: [
        { stage: "native-cdp", run: () => broker.close() },
        { stage: "recovery", run: () => recovery.stop() },
      ],
      reportFailure: failures,
    });
    try {
      await new Promise<void>((resolve, reject) => {
        socket.on("open", () => resolve());
        socket.on("error", reject);
      });
      socket.send(
        JSON.stringify({
          id: 1,
          method: "Target.attachToTarget",
          params: { targetId: "target", flatten: true },
        }),
      );
      await wait(() => frames.some((frame) => frame.id === 1));
      const sessionId = frames.find((frame) => frame.id === 1)?.result?.sessionId;
      expect(sessionId).toMatch(/^aux-page-/);
      socket.send(
        JSON.stringify({
          id: 2,
          method: "Input.dispatchKeyEvent",
          params: { type: "keyDown", key: "Enter" },
          sessionId,
        }),
      );
      await wait(() => !!originalDispatch);
      // Join the ACK only; intentionally never publish the native CDP response or
      // a native retirement event, including after structural host disconnection.
      await delay(5);
      if (hostState === "closed") disconnectHost();
      expect(runtime.isClosed()).toBe(hostState === "closed");
      recovery.retry();
      const stopping = shutdown(hostState === "closed" ? "native-owner-disconnected" : "local");
      await wait(() => stages.includes("command_settled"));
      expect(nextEntered).toBe(false);
      expect(ownership.snapshot()[PAGE]?.runId).toBe("original");
      expect(stages).not.toContain("run_join_finished");
      finishUnwind.resolve();
      await stopping;
      expect(await originalWork).toMatch(/^(protocol_error|transport_closed)$/);
      expect(nextEntered).toBe(true);
      expect(stages.indexOf("work_joined")).toBeLessThan(stages.indexOf("run_join_finished"));
      expect(stages.indexOf("run_join_finished")).toBeLessThan(stages.indexOf("interrupted"));
      expect(failures).not.toHaveBeenCalled();
      expect(reconnect).not.toHaveBeenCalled();
      const original = originalDispatch!;
      host.notify("native.cdpMessage", {
        pageId: PAGE,
        message: JSON.stringify({
          auxAttachmentId: original.attachmentId,
          id: (JSON.parse(original.message) as { id: number }).id,
          result: { late: true },
        }),
      });
      await delay(5);
      expect(settlements).toBe(1);
      const releaseNext = await nextOwner;
      releaseNext();
      expect(ownership.snapshot()).toEqual({});
      expect(shutdown()).toBe(stopping);
      await broker.close();
    } finally {
      finishUnwind.resolve();
      releaseOriginal();
      const releaseNext = await nextOwner;
      releaseNext();
      socket.terminate();
      await recovery.stop();
      await broker.close();
      egress.close();
      rmSync(directory, { recursive: true, force: true });
    }
  },
);
