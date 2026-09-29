import { createServer, type Socket } from "node:net";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { RpcChannel } from "@aux/contracts";
import { describe, expect, it } from "vitest";
import { AUX_HOST_PROTOCOL, connectHostSocket } from "../../apps/runtime/src/host-socket";

const token = "a".repeat(64);

async function withHost(reply: (message: Record<string, unknown>) => Record<string, unknown> | Record<string, unknown>[] | null,
  run: (path: string) => Promise<void>) {
  const dir = mkdtempSync(join(tmpdir(), "aux-host-"));
  const path = join(dir, "host.sock");
  const sockets = new Set<Socket>();
  const server = createServer(socket => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    socket.setEncoding("utf8");
    let buffer = "";
    socket.on("data", (chunk: string) => {
      buffer += chunk;
      for (let end = buffer.indexOf("\n"); end >= 0; end = buffer.indexOf("\n")) {
        const message = JSON.parse(buffer.slice(0, end)) as Record<string, unknown>;
        buffer = buffer.slice(end + 1);
        const response = reply(message);
        if (response) socket.write((Array.isArray(response) ? response : [response]).map(frame => JSON.stringify(frame)).join("\n") + "\n");
      }
    });
  });
  await new Promise<void>(resolve => server.listen(path, resolve));
  try { await run(path); }
  finally {
    for (const socket of sockets) socket.destroy();
    await new Promise<void>(resolve => server.close(() => resolve()));
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("Chromium host socket", () => {
  it("authenticates before carrying the existing bidirectional RPC frames", async () => {
    let hello: Record<string, unknown> | null = null;
    let observedNonce = "";
    await withHost(message => {
      if (message.kind === "hello") {
        hello = message;
        observedNonce = String(message.nonce);
        return { kind: "hello-ack", protocol: AUX_HOST_PROTOCOL, nonce: message.nonce };
      }
      return { kind: "res", id: message.id, result: message.params };
    }, async path => {
      const transport = await connectHostSocket(path, token);
      const channel = new RpcChannel(transport, "test-host");
      expect(await channel.call("echo", { pageId: "page-1" })).toEqual({ pageId: "page-1" });
      transport.close();
    });
    expect(hello).toMatchObject({ token });
    expect(observedNonce).toMatch(/^[a-f0-9]{64}$/);
  });

  it("registers startup methods before delivering requests buffered with the handshake", async () => {
    let receive!: (message: Record<string, unknown>) => void;
    const response = new Promise<Record<string, unknown>>(resolve => { receive = resolve; });
    await withHost(message => {
      if (message.kind === "hello") return [
        { kind: "hello-ack", protocol: AUX_HOST_PROTOCOL, nonce: message.nonce },
        { kind: "req", id: 1, method: "zap.snapshot", params: {} },
      ];
      receive(message);
      return null;
    }, async path => {
      const transport = await connectHostSocket(path, token);
      const channel = new RpcChannel(transport, "test-host");
      channel.onMethod("zap.snapshot", () => []);
      try { expect(await response).toEqual({ kind: "res", id: 1, result: [] }); }
      finally { transport.close(); }
    });
  });

  it("notifies both RPC and owner shutdown listeners when the host closes", async () => {
    await withHost(message => ({ kind: "hello-ack", protocol: AUX_HOST_PROTOCOL, nonce: message.nonce }), async path => {
      const transport = await connectHostSocket(path, token);
      const channel = new RpcChannel(transport, "test-host");
      const closed = new Promise<void>(resolve => transport.onClose?.(resolve));
      transport.close();
      await closed;
      await expect(channel.call("echo")).rejects.toThrow("channel closed");
      let late = false;
      transport.onClose?.(() => { late = true; });
      await Promise.resolve();
      expect(late).toBe(true);
    });
  });

  it("rejects a host that does not acknowledge the matching handshake", async () => {
    await withHost(() => ({ kind: "hello-ack", protocol: AUX_HOST_PROTOCOL, nonce: "wrong" }), async path => {
      await expect(connectHostSocket(path, token)).rejects.toThrow("authentication failed");
    });
  });

  it("binds a native reconnect to its exact generation", async () => {
    await withHost(message => ({ kind: "hello-ack", protocol: AUX_HOST_PROTOCOL,
      nonce: message.nonce, generation: "7" }), async path => {
      await expect(connectHostSocket(path, token, 15_000, "8")).rejects.toThrow("authentication failed");
    });
    await withHost(message => ({ kind: "hello-ack", protocol: AUX_HOST_PROTOCOL,
      nonce: message.nonce, generation: message.generation }), async path => {
      const transport = await connectHostSocket(path, token, 15_000, "8");
      transport.close();
    });
  });

  it("refuses a weak token or nonabsolute socket path", async () => {
    await expect(connectHostSocket("host.sock", token)).rejects.toThrow("absolute");
    await expect(connectHostSocket("/tmp/host.sock", "short")).rejects.toThrow("256-bit");
  });
});
