import { RpcChannel, type Transport } from "@aux/contracts";
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
        if ((frame as { kind?: unknown })?.kind === "res" || released) {
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
  channel.onMethod("downloads.completedNative", params =>
    invokerReady.then(invoke => invoke("downloads.completedNative", params, { external: false })),
  );
}
