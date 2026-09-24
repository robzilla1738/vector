import { randomUUID } from "node:crypto";
import { createConnection, type Socket } from "node:net";
import { isAbsolute } from "node:path";
import type { Transport } from "@aux/contracts";

export const AUX_HOST_PROTOCOL = "aux-host-v1";
export const MAX_HOST_FRAME_BYTES = 16 * 1024 * 1024;

export interface HostSocketTransport extends Transport {
  close(): void;
}

/**
 * Connect to the native host's private Unix socket. Chromium owns the listener
 * and passes a fresh 256-bit token only to its Aux runtime child. The host must
 * validate the token, peer and Profile before acknowledging this connection.
 */
export function connectHostSocket(path: string, token: string, timeoutMs = 15_000): Promise<HostSocketTransport> {
  if (!isAbsolute(path)) return Promise.reject(new Error("Aux host socket path must be absolute"));
  if (!/^[a-f0-9]{64}$/i.test(token)) return Promise.reject(new Error("Aux host token must be 256-bit hex"));

  return new Promise((resolve, reject) => {
    const socket: Socket = createConnection(path);
    const nonce = randomUUID();
    let buffer = "";
    let authenticated = false;
    let closed = false;
    let messageCallback: ((message: unknown) => void) | null = null;
    let closeCallback: (() => void) | null = null;
    const pending: unknown[] = [];
    const timer = setTimeout(() => fail(new Error("Aux host socket handshake timed out")), timeoutMs);

    const fail = (error: Error) => {
      clearTimeout(timer);
      socket.destroy();
      if (!authenticated) reject(error);
    };
    const transport: HostSocketTransport = {
      send(message) {
        if (closed || !authenticated) throw new Error("Aux host socket is closed");
        const frame = `${JSON.stringify(message)}\n`;
        if (Buffer.byteLength(frame) > MAX_HOST_FRAME_BYTES) throw new Error("Aux host frame is too large");
        socket.write(frame);
      },
      onMessage(callback) {
        messageCallback = callback;
        for (const message of pending.splice(0)) callback(message);
      },
      onClose(callback) {
        closeCallback = callback;
        if (closed) queueMicrotask(callback);
      },
      close() { socket.end(); },
    };

    socket.setEncoding("utf8");
    socket.on("connect", () => {
      socket.write(`${JSON.stringify({ kind: "hello", protocol: AUX_HOST_PROTOCOL, nonce, token })}\n`);
    });
    socket.on("data", (chunk: string) => {
      buffer += chunk;
      if (Buffer.byteLength(buffer) > MAX_HOST_FRAME_BYTES) {
        fail(new Error("Aux host frame is too large"));
        return;
      }
      for (let end = buffer.indexOf("\n"); end >= 0; end = buffer.indexOf("\n")) {
        const line = buffer.slice(0, end);
        buffer = buffer.slice(end + 1);
        if (!line) continue;
        let message: unknown;
        try { message = JSON.parse(line); }
        catch { fail(new Error("Aux host sent malformed JSON")); return; }
        if (!authenticated) {
          const ack = message as { kind?: string; protocol?: string; nonce?: string };
          if (ack.kind !== "hello-ack" || ack.protocol !== AUX_HOST_PROTOCOL || ack.nonce !== nonce) {
            fail(new Error("Aux host socket authentication failed"));
            return;
          }
          authenticated = true;
          clearTimeout(timer);
          resolve(transport);
        } else if (messageCallback) {
          messageCallback(message);
        } else {
          pending.push(message);
        }
      }
    });
    socket.on("error", fail);
    socket.on("close", () => {
      clearTimeout(timer);
      closed = true;
      if (!authenticated) reject(new Error("Aux host socket closed before authentication"));
      closeCallback?.();
    });
  });
}
