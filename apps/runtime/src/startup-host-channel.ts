import { AuxError, RpcChannel, type Transport } from "@aux/contracts";
import type { HostSocketTransport } from "./host-socket.js";

/**
 * Native responses must flow while storage unlocks. Native requests and notes
 * wait until their runtime handlers exist, preserving the host's startup
 * snapshot rather than answering it with an accidental Unknown method.
 */
export function startupHostChannel(socket: HostSocketTransport) {
  let deliver: ((frame: unknown) => void) | undefined;
  let released = false;
  let overflow = false;
  const buffered: unknown[] = [];
  const transport: Transport = {
    send: (frame) => socket.send(frame),
    onClose: (callback) => socket.onClose?.(callback),
    onMessage(callback) {
      deliver = callback;
      socket.onMessage((frame) => {
        if (
          (frame as { kind?: unknown })?.kind === "res" ||
          released ||
          ((frame as { kind?: unknown })?.kind === "req" &&
            (frame as { method?: unknown }).method === "runtime.liveness")
        ) {
          callback(frame);
          return;
        }
        if (buffered.length >= 1024) {
          overflow = true;
          socket.close();
          return;
        }
        buffered.push(frame);
      });
    },
  };
  const channel = new RpcChannel(transport, "runtime->chromium-host");
  // Native-only authenticated IPC control; independent of storage unlock and API readiness.
  channel.onMethod("runtime.liveness", (params) => {
    if (
      !params ||
      typeof params !== "object" ||
      Array.isArray(params) ||
      Object.keys(params).length !== 1 ||
      !("nonce" in params) ||
      typeof params.nonce !== "string" ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(params.nonce)
    )
      throw new AuxError("invalid_params", "Invalid native liveness probe.");
    return { nonce: params.nonce };
  });
  return {
    channel,
    release() {
      if (overflow) throw new Error("Native startup event queue overflowed.");
      released = true;
      for (const frame of buffered.splice(0)) deliver?.(frame);
    },
  };
}

/** The authenticated native owner publishes live download completion metadata. */
export function registerDownloadNamingChannel(
  channel: RpcChannel,
  invokerReady: Promise<(method: string, params: unknown, client: { external: boolean }) => Promise<unknown>>,
) {
  channel.onMethod("downloads.completedNative", (params) =>
    invokerReady.then((invoke) => invoke("downloads.completedNative", params, { external: false })),
  );
}
