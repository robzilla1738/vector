import { createServer, type Socket } from "node:net";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { RpcChannel } from "@aux/contracts";
import { describe, expect, it } from "vitest";
import { AUX_HOST_PROTOCOL, connectHostSocket } from "../../apps/runtime/src/host-socket";

const token = "a".repeat(64);

async function withHost(reply: (message: Record<string, unknown>) => Record<string, unknown>,
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
        socket.write(`${JSON.stringify(reply(message))}\n`);
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
    await withHost(message => {
      if (message.kind === "hello") {
        expect(message.token).toBe(token);
        return { kind: "hello-ack", protocol: AUX_HOST_PROTOCOL, nonce: message.nonce };
      }
      return { kind: "res", id: message.id, result: message.params };
    }, async path => {
      const transport = await connectHostSocket(path, token);
      const channel = new RpcChannel(transport, "test-host");
      expect(await channel.call("echo", { pageId: "page-1" })).toEqual({ pageId: "page-1" });
      transport.close();
    });
  });

  it("rejects a host that does not acknowledge the matching handshake", async () => {
    await withHost(() => ({ kind: "hello-ack", protocol: AUX_HOST_PROTOCOL, nonce: "wrong" }), async path => {
      await expect(connectHostSocket(path, token)).rejects.toThrow("authentication failed");
    });
  });

  it("refuses a weak token or nonabsolute socket path", async () => {
    await expect(connectHostSocket("host.sock", token)).rejects.toThrow("absolute");
    await expect(connectHostSocket("/tmp/host.sock", "short")).rejects.toThrow("256-bit");
  });
});
