import { createServer, Socket } from "node:net";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { RpcChannel } from "@aux/contracts";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AUX_HOST_PROTOCOL,
  connectHostSocket,
  MAX_HOST_OUTGOING_BYTES,
  HOST_OUTPUT_DEADLINE_MS,
} from "../../apps/runtime/src/host-socket";

const token = "a".repeat(64);
afterEach(() => vi.useRealTimers());

async function withHost(
  reply: (
    message: Record<string, unknown>,
    socket: Socket,
  ) => Record<string, unknown> | Record<string, unknown>[] | null,
  run: (path: string) => Promise<void>,
  allowHalfOpen = false,
) {
  const dir = mkdtempSync(join(tmpdir(), "aux-host-"));
  const path = join(dir, "host.sock");
  const sockets = new Set<Socket>();
  const server = createServer({ allowHalfOpen }, (socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    socket.setEncoding("utf8");
    let buffer = "";
    socket.on("data", (chunk: string) => {
      buffer += chunk;
      for (let end = buffer.indexOf("\n"); end >= 0; end = buffer.indexOf("\n")) {
        const message = JSON.parse(buffer.slice(0, end)) as Record<string, unknown>;
        buffer = buffer.slice(end + 1);
        const response = reply(message, socket);
        if (response)
          socket.write(
            (Array.isArray(response) ? response : [response])
              .map((frame) => JSON.stringify(frame))
              .join("\n") + "\n",
          );
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(path, resolve));
  try {
    await run(path);
  } finally {
    for (const socket of sockets) socket.destroy();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("Chromium host socket", () => {
  it("authenticates before carrying the existing bidirectional RPC frames", async () => {
    let hello: Record<string, unknown> | null = null;
    let observedNonce = "";
    await withHost(
      (message) => {
        if (message.kind === "hello") {
          hello = message;
          observedNonce = String(message.nonce);
          return { kind: "hello-ack", protocol: AUX_HOST_PROTOCOL, nonce: message.nonce };
        }
        return { kind: "res", id: message.id, result: message.params };
      },
      async (path) => {
        const transport = await connectHostSocket(path, token);
        const channel = new RpcChannel(transport, "test-host");
        expect(await channel.call("echo", { pageId: "page-1" })).toEqual({ pageId: "page-1" });
        transport.close();
      },
    );
    expect(hello).toMatchObject({ token });
    expect(observedNonce).toMatch(/^[a-f0-9]{64}$/);
  });

  it("registers startup methods before delivering requests buffered with the handshake", async () => {
    let receive!: (message: Record<string, unknown>) => void;
    const response = new Promise<Record<string, unknown>>((resolve) => {
      receive = resolve;
    });
    await withHost(
      (message) => {
        if (message.kind === "hello")
          return [
            { kind: "hello-ack", protocol: AUX_HOST_PROTOCOL, nonce: message.nonce },
            { kind: "req", id: 1, method: "zap.snapshot", params: {} },
          ];
        receive(message);
        return null;
      },
      async (path) => {
        const transport = await connectHostSocket(path, token);
        const channel = new RpcChannel(transport, "test-host");
        channel.onMethod("zap.snapshot", () => []);
        try {
          expect(await response).toEqual({ kind: "res", id: 1, result: [] });
        } finally {
          transport.close();
        }
      },
    );
  });

  it("notifies both RPC and owner shutdown listeners when the host closes", async () => {
    await withHost(
      (message) => ({ kind: "hello-ack", protocol: AUX_HOST_PROTOCOL, nonce: message.nonce }),
      async (path) => {
        const transport = await connectHostSocket(path, token);
        const channel = new RpcChannel(transport, "test-host");
        const closed = new Promise<void>((resolve) => transport.onClose?.(resolve));
        transport.close();
        await closed;
        await expect(channel.call("echo")).rejects.toThrow("channel closed");
        let late = false;
        transport.onClose?.(() => {
          late = true;
        });
        await Promise.resolve();
        expect(late).toBe(true);
      },
    );
  });

  it("rejects a host that does not acknowledge the matching handshake", async () => {
    await withHost(
      () => ({ kind: "hello-ack", protocol: AUX_HOST_PROTOCOL, nonce: "wrong" }),
      async (path) => {
        await expect(connectHostSocket(path, token)).rejects.toThrow("authentication failed");
      },
    );
  });

  it("binds a native reconnect to its exact generation", async () => {
    await withHost(
      (message) => ({
        kind: "hello-ack",
        protocol: AUX_HOST_PROTOCOL,
        nonce: message.nonce,
        generation: "7",
      }),
      async (path) => {
        await expect(connectHostSocket(path, token, 15_000, "8")).rejects.toThrow("authentication failed");
      },
    );
    await withHost(
      (message) => ({
        kind: "hello-ack",
        protocol: AUX_HOST_PROTOCOL,
        nonce: message.nonce,
        generation: message.generation,
      }),
      async (path) => {
        const transport = await connectHostSocket(path, token, 15_000, "8");
        transport.close();
      },
    );
  });

  it("refuses a weak token or nonabsolute socket path", async () => {
    await expect(connectHostSocket("host.sock", token)).rejects.toThrow("absolute");
    await expect(connectHostSocket("/tmp/host.sock", "short")).rejects.toThrow("256-bit");
  });
});

it("bounds aggregate UTF8 output to the native32MiB ceiling and rejects outstanding RPCs after real close", async () => {
  let peer!: Socket;
  await withHost(
    (message, socket) => {
      if (message.kind === "hello") {
        peer = socket;
        socket.pause();
        return { kind: "hello-ack", protocol: AUX_HOST_PROTOCOL, nonce: message.nonce };
      }
      return null;
    },
    async (path) => {
      const transport = await connectHostSocket(path, token);
      const channel = new RpcChannel(transport);
      const pending = channel.call("held.original").catch((error) => error);
      let closes = 0;
      const closed = new Promise<void>((resolve) =>
        transport.onClose?.(() => {
          closes++;
          resolve();
        }),
      );
      const payload = "🧭".repeat(2 * 1024 * 1024);
      const frame = { kind: "note", type: "bounded", payload };
      const bytes = Buffer.byteLength(JSON.stringify(frame) + "\n");
      expect(bytes).toBeGreaterThan(payload.length);
      const originalWrite = Socket.prototype.write;
      const observedQueues: number[] = [];
      const observedLengths: number[] = [];
      const write = vi.spyOn(Socket.prototype, "write").mockImplementation(function (
        this: Socket,
        ...args: unknown[]
      ) {
        const chunk = args[0];
        if (Buffer.isBuffer(chunk)) {
          observedLengths.push(chunk.byteLength);
          observedQueues.push(this.writableLength + chunk.byteLength);
        }
        return Reflect.apply(originalWrite, this, args) as boolean;
      });
      let accepted = 0;
      try {
        expect(() => {
          for (let i = 0; i < 8; i++) {
            transport.send(frame);
            accepted++;
          }
        }).toThrow("byte limit");
      } finally {
        write.mockRestore();
      }
      // Kernel-delivered bytes are not part of the pending userland queue.
      expect(accepted).toBeGreaterThan(0);
      expect(accepted).toBeLessThan(8);
      expect(observedLengths).toEqual(Array(accepted).fill(bytes));
      expect(observedQueues).toHaveLength(accepted);
      expect(Math.max(...observedQueues)).toBeLessThanOrEqual(MAX_HOST_OUTGOING_BYTES);
      expect(() => transport.send({ kind: "note", type: "after-overflow" })).toThrow("closed");
      await closed;
      expect(channel.isClosed()).toBe(true);
      expect(await pending).toMatchObject({ code: "backend_unavailable" });
      transport.close();
      expect(closes).toBe(1);
      peer.resume();
    },
  );
});

it("drains the original ordered frames once and remains usable after a slow reader resumes", async () => {
  let peer!: Socket;
  const observed: number[] = [];
  await withHost(
    (message, socket) => {
      if (message.kind === "hello") {
        peer = socket;
        socket.pause();
        return { kind: "hello-ack", protocol: AUX_HOST_PROTOCOL, nonce: message.nonce };
      }
      observed.push((message.params as { n: number }).n);
      return { kind: "res", id: message.id, result: (message.params as { n: number }).n };
    },
    async (path) => {
      const transport = await connectHostSocket(path, token);
      const channel = new RpcChannel(transport);
      const pending = Array.from({ length: 4 }, (_, n) =>
        channel.call("ordered.original", { n, text: "x".repeat(256 * 1024) }),
      );
      peer.resume();
      expect(await Promise.all(pending)).toEqual([0, 1, 2, 3]);
      expect(observed).toEqual([0, 1, 2, 3]);
      expect(await channel.call("ordered.original", { n: 4 })).toBe(4);
      expect(observed).toEqual([0, 1, 2, 3, 4]);
      transport.close();
    },
  );
});

it("retires a real blocked writer at the finite output deadline without replay", async () => {
  await withHost(
    (message, socket) => {
      if (message.kind === "hello") {
        socket.pause();
        return { kind: "hello-ack", protocol: AUX_HOST_PROTOCOL, nonce: message.nonce };
      }
      return null;
    },
    async (path) => {
      const transport = await connectHostSocket(path, token);
      const channel = new RpcChannel(transport);
      const closed = new Promise<void>((resolve) => transport.onClose?.(resolve));
      vi.useFakeTimers();
      const pending = channel.call("waiting.original").catch((error) => error);
      transport.send({ kind: "note", type: "slow.original", payload: "x".repeat(8 * 1024 * 1024) });
      await vi.advanceTimersByTimeAsync(HOST_OUTPUT_DEADLINE_MS);
      expect(() => transport.send({ kind: "note", type: "late" })).toThrow("closed");
      vi.useRealTimers();
      await closed;
      expect(await pending).toMatchObject({ code: "backend_unavailable" });
    },
  );
});

it("stops sends immediately on graceful close but reports actual close only after the bounded socket lifetime", async () => {
  await withHost(
    (message) =>
      message.kind === "hello"
        ? { kind: "hello-ack", protocol: AUX_HOST_PROTOCOL, nonce: message.nonce }
        : null,
    async (path) => {
      const transport = await connectHostSocket(path, token);
      const channel = new RpcChannel(transport);
      vi.useFakeTimers();
      const pending = channel.call("original.before-close").catch((error) => error);
      let closes = 0;
      const closed = new Promise<void>((resolve) =>
        transport.onClose?.(() => {
          closes++;
          resolve();
        }),
      );
      transport.close();
      transport.close();
      expect(() => transport.send({ kind: "req", id: 99, method: "after.close" })).toThrow("closed");
      expect(closes).toBe(0);
      expect(channel.isClosed()).toBe(false);
      await vi.advanceTimersByTimeAsync(HOST_OUTPUT_DEADLINE_MS);
      vi.useRealTimers();
      await closed;
      expect(closes).toBe(1);
      expect(channel.isClosed()).toBe(true);
      expect(await pending).toMatchObject({ code: "backend_unavailable" });
    },
    true,
  );
});

it.each(["handshake backlog", "live buffer"] as const)(
  "stops a packed %s immediately when its original first callback closes",
  async (phase) => {
    const requests = [
      { kind: "req", id: 1, method: "original.first" },
      { kind: "req", id: 2, method: "retired.second" },
    ];
    await withHost(
      (message) => {
        if (message.kind === "hello") {
          const ack = { kind: "hello-ack", protocol: AUX_HOST_PROTOCOL, nonce: message.nonce };
          return phase === "handshake backlog" ? [ack, ...requests] : ack;
        }
        return message.type === "ready" ? requests : null;
      },
      async (path) => {
        const transport = await connectHostSocket(path, token);
        const observed: string[] = [];
        const closed = new Promise<void>((resolve) => transport.onClose?.(resolve));
        transport.onMessage((frame) => {
          observed.push((frame as { method: string }).method);
          transport.close();
        });
        if (phase === "live buffer") transport.send({ kind: "note", type: "ready" });
        await closed;
        expect(observed).toEqual(["original.first"]);
      },
    );
  },
);
