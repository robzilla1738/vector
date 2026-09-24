import { randomBytes } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { createServer, type Socket } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startRuntime } from "@aux/runtime";
import { describe, expect, it } from "vitest";
import { AUX_HOST_PROTOCOL } from "../../apps/runtime/src/host-socket";

describe("Chromium host runtime channel", () => {
  it("serves the real Aux agent API over an authenticated native-host socket", async () => {
    const dir = mkdtempSync(join(tmpdir(), "aux-host-runtime-"));
    const socketPath = join(dir, "host.sock");
    const token = randomBytes(32).toString("hex");
    let peer: Socket | null = null;
    let resolveResponse: (value: Record<string, unknown>) => void = () => {};
    const response = new Promise<Record<string, unknown>>(resolve => { resolveResponse = resolve; });
    const server = createServer(socket => {
      peer = socket;
      socket.setEncoding("utf8");
      let buffer = "";
      socket.on("data", (chunk: string) => {
        buffer += chunk;
        for (let end = buffer.indexOf("\n"); end >= 0; end = buffer.indexOf("\n")) {
          const frame = JSON.parse(buffer.slice(0, end)) as Record<string, unknown>;
          buffer = buffer.slice(end + 1);
          if (frame.kind === "hello") {
            expect(frame.protocol).toBe(AUX_HOST_PROTOCOL);
            expect(frame.token).toBe(token);
            socket.write(`${JSON.stringify({ kind: "hello-ack", protocol: AUX_HOST_PROTOCOL, nonce: frame.nonce })}\n`);
          } else if (frame.kind === "req") {
            const result = frame.method === "native.listPages" ? { pages: [] } : { ok: true };
            socket.write(`${JSON.stringify({ kind: "res", id: frame.id, result })}\n`);
          } else if (frame.kind === "res" && frame.id === 900) {
            resolveResponse(frame);
          }
        }
      });
    });
    await new Promise<void>(resolve => server.listen(socketPath, resolve));
    let runtime: Awaited<ReturnType<typeof startRuntime>> | null = null;
    try {
      runtime = await startRuntime({
        ...process.env,
        AUX_DATA_DIR: join(dir, "data"),
        AUX_HOST_SOCKET: socketPath,
        AUX_HOST_TOKEN: token,
        AUX_STANDALONE: "0",
        AUX_LOAD_DOTENV: "0",
        AUX_API_PORT: "0",
        AUX_ELECTRON_CDP: "",
      });
      expect(peer).not.toBeNull();
      peer!.write(`${JSON.stringify({
        kind: "req", id: 900, method: "api.invoke",
        params: { method: "runtime.describe", params: {}, desktopUser: true },
      })}\n`);
      const timeout = AbortSignal.timeout(5000);
      const result = await Promise.race([
        response,
        new Promise<never>((_, reject) => timeout.addEventListener("abort", () => reject(new Error("runtime reply timed out")), { once: true })),
      ]);
      expect(result.error).toBeUndefined();
      expect((result.result as { version?: number }).version).toBe(1);
    } finally {
      await runtime?.close();
      (peer as Socket | null)?.destroy();
      await new Promise<void>(resolve => server.close(() => resolve()));
      rmSync(dir, { recursive: true, force: true });
    }
  }, 30_000);
});
