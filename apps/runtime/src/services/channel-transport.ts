import { CHANNEL_MAX_ATTACHMENT_BYTES } from "@aux/contracts/channels";
import type { RawData } from "ws";
import type {
  ChannelCredentials,
  ChannelCursor,
  ChannelFailureCode,
  ChannelIdentity,
  ChannelInbound,
  ChannelReply,
  ChannelAttachment,
} from "@aux/contracts/channels";

export class ChannelTransportError extends Error {
  constructor(
    readonly code: ChannelFailureCode,
    readonly retryAfterMs?: number,
  ) {
    super(`Messenger transport: ${code}`);
    this.name = "ChannelTransportError";
  }
}
export type ChannelDelivery = {
  deliveryId: string;
  conversationId: string;
  threadId?: string;
  replyToMessageId?: string;
  text: string;
  reply?: ChannelReply;
};
export type ChannelReceiver = {
  signal: AbortSignal;
  cursor?: ChannelCursor;
  ready(): void;
  /** Resolve only after the message and checkpoint are durable. No agent work happens inside acknowledgement. */
  receive(message: ChannelInbound | null, cursor?: ChannelCursor | null): Promise<void>;
};
export type ChannelTransport = {
  identity: ChannelIdentity;
  messageLength: number;
  downloadAttachment?(
    message: ChannelInbound,
    attachment: ChannelAttachment,
    signal: AbortSignal,
  ): Promise<{ bytes: Uint8Array; mediaType: string }>;
  run(input: ChannelReceiver): Promise<void>;
  send(input: ChannelDelivery, signal: AbortSignal): Promise<{ messageId: string }>;
};
export type ChannelNetwork = {
  fetch?: typeof fetch;
  socket?(url: string): Promise<ChannelSocketStream>;
};
export type ChannelSocketStream = {
  readonly OPEN: number;
  readonly readyState: number;
  send(text: string, callback: (error?: Error) => void): void;
  terminate(): void;
  on(event: "message", listener: (raw: RawData) => void): unknown;
  on(event: "error", listener: (error: Error) => void): unknown;
  on(event: "close", listener: (code: number) => void): unknown;
};

/** Credential-bearing source errors never escape the original transport. */
export async function channelBinary(
  network: ChannelNetwork,
  url: URL,
  init: RequestInit,
  signal: AbortSignal,
) {
  let response: Response;
  try {
    response = await (network.fetch ?? fetch)(url, {
      ...init,
      redirect: "error",
      signal: AbortSignal.any([signal, AbortSignal.timeout(35_000)]),
    });
  } catch {
    signal.throwIfAborted();
    throw new ChannelTransportError("network");
  }
  const reader = response.body?.getReader();
  if (!reader) throw new ChannelTransportError("invalid_response");
  try {
    if (!response.ok)
      throw new ChannelTransportError(
        response.status === 401 ? "authentication" : response.status === 403 ? "scope" : "network",
      );
    const declared = Number(response.headers.get("content-length"));
    if (declared > CHANNEL_MAX_ATTACHMENT_BYTES) throw new ChannelTransportError("invalid_response");
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      signal.throwIfAborted();
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > CHANNEL_MAX_ATTACHMENT_BYTES) throw new ChannelTransportError("invalid_response");
      chunks.push(part.value);
    }
    if (!size) throw new ChannelTransportError("invalid_response");
    return {
      bytes: Uint8Array.from(Buffer.concat(chunks)),
      mediaType: (response.headers.get("content-type") ?? "application/octet-stream")
        .split(";")[0]!
        .trim()
        .toLowerCase(),
    };
  } catch (error) {
    signal.throwIfAborted();
    throw error instanceof ChannelTransportError ? error : new ChannelTransportError("network");
  } finally {
    await reader.cancel().catch(() => {});
  }
}

export async function channelJson(
  network: ChannelNetwork,
  url: string,
  init: RequestInit,
  signal: AbortSignal,
  operation: "read" | "send" = "read",
): Promise<Record<string, unknown>> {
  const sending = operation === "send";
  let response: Response;
  try {
    response = await (network.fetch ?? fetch)(url, {
      ...init,
      redirect: "error",
      signal: AbortSignal.any([signal, AbortSignal.timeout(35000)]),
    });
  } catch {
    signal.throwIfAborted();
    throw new ChannelTransportError(sending ? "delivery_unknown" : "network");
  }
  if (response.status === 429) {
    const header = response.headers.get("retry-after");
    let wait = header === null ? Number.NaN : Number(header);
    if (!Number.isFinite(wait)) {
      try {
        const body = await channelResponseJson(response, signal, "read");
        const parameters = body.parameters;
        const value =
          parameters && typeof parameters === "object" && "retry_after" in parameters
            ? parameters.retry_after
            : body.retry_after;
        if (typeof value === "number") wait = value;
      } catch {
        signal.throwIfAborted();
      }
    } else await response.body?.cancel().catch(() => {});
    throw new ChannelTransportError(
      "rate_limited",
      Number.isFinite(wait) && wait >= 0 ? Math.min(86400000, Math.max(1000, wait * 1000)) : 30000,
    );
  }
  if (!response.ok) {
    await response.body?.cancel().catch(() => {});
    if (response.status === 401) throw new ChannelTransportError("authentication");
    if (response.status === 403) throw new ChannelTransportError("scope");
    if (response.status >= 500) throw new ChannelTransportError(sending ? "delivery_unknown" : "network");
    throw new ChannelTransportError("invalid_response");
  }
  return channelResponseJson(response, signal, operation);
}

async function channelResponseJson(response: Response, signal: AbortSignal, operation: "read" | "send") {
  const sending = operation === "send";
  const reader = response.body?.getReader();
  if (!reader) throw new ChannelTransportError(sending ? "delivery_unknown" : "invalid_response");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 1_000_000)
        throw new ChannelTransportError(sending ? "delivery_unknown" : "invalid_response");
      chunks.push(value);
    }
    const body: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid object");
    return body as Record<string, unknown>;
  } catch (error) {
    signal.throwIfAborted();
    throw error instanceof ChannelTransportError
      ? error
      : new ChannelTransportError(sending ? "delivery_unknown" : "invalid_response");
  } finally {
    await reader.cancel().catch(() => {});
  }
}

export function channelSocketUrl(value: unknown, domain: "slack.com" | "discord.gg"): string {
  if (typeof value !== "string") throw new ChannelTransportError("invalid_response");
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ChannelTransportError("invalid_response");
  }
  if (
    url.protocol !== "wss:" ||
    url.username ||
    url.password ||
    url.port ||
    !(url.hostname === domain || url.hostname.endsWith(`.${domain}`))
  )
    throw new ChannelTransportError("identity");
  return url.href;
}

export type ChannelSocket = {
  send(value: unknown): void;
  ready(): void;
  end(error?: ChannelTransportError): void;
  interval(work: () => void, ms: number): void;
  timeout(work: () => void, ms: number): void;
};

/** Shared socket retirement joins admitted frames and clears every heartbeat/handshake timer. */
export async function channelSocket(
  network: ChannelNetwork,
  url: string,
  input: ChannelReceiver,
  frame: (value: Record<string, unknown>, socket: ChannelSocket) => Promise<void>,
  closeCode?: (code: number) => ChannelTransportError,
): Promise<void> {
  input.signal.throwIfAborted();
  let ws: ChannelSocketStream;
  try {
    ws = network.socket
      ? await network.socket(url)
      : new (await import("ws")).WebSocket(url, {
          handshakeTimeout: 15000,
          maxPayload: 1_000_000,
          followRedirects: false,
        });
  } catch {
    input.signal.throwIfAborted();
    throw new ChannelTransportError("network");
  }
  let chain = Promise.resolve(),
    pending = 0,
    ready = false;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  let abort: (() => void) | undefined;
  try {
    await new Promise<void>((resolve, reject) => {
      let ending = false,
        failure: ChannelTransportError | undefined;
      const handshake = setTimeout(() => controls.end(new ChannelTransportError("network")), 15000);
      timers.add(handshake);
      const controls: ChannelSocket = {
        send: (value) => {
          input.signal.throwIfAborted();
          if (ws.readyState !== ws.OPEN) throw new ChannelTransportError("network");
          ws.send(JSON.stringify(value), (error) => {
            if (error) controls.end(new ChannelTransportError("network"));
          });
        },
        ready: () => {
          input.signal.throwIfAborted();
          clearTimeout(handshake);
          timers.delete(handshake);
          if (!ready) {
            ready = true;
            input.ready();
          }
        },
        end: (error) => {
          if (ending) return;
          ending = true;
          failure = error;
          ws.terminate();
        },
        interval: (work, ms) => {
          timers.add(
            setInterval(() => {
              try {
                work();
              } catch {
                controls.end(new ChannelTransportError("network"));
              }
            }, ms),
          );
        },
        timeout: (work, ms) => {
          timers.add(
            setTimeout(() => {
              try {
                work();
              } catch {
                controls.end(new ChannelTransportError("network"));
              }
            }, ms),
          );
        },
      };
      abort = () => controls.end();
      input.signal.addEventListener("abort", abort, { once: true });
      ws.on("message", (raw) => {
        if (ending || input.signal.aborted) return;
        if (++pending > 64) {
          controls.end(new ChannelTransportError("network"));
          return;
        }
        chain = chain
          .then(async () => {
            if (input.signal.aborted) return;
            const bytes = Array.isArray(raw)
              ? Buffer.concat(raw)
              : Buffer.from(raw instanceof ArrayBuffer ? new Uint8Array(raw) : raw);
            if (bytes.byteLength > 1_000_000) throw new ChannelTransportError("invalid_response");
            let value: unknown;
            try {
              value = JSON.parse(bytes.toString("utf8"));
            } catch {
              throw new ChannelTransportError("invalid_response");
            }
            if (!value || typeof value !== "object" || Array.isArray(value))
              throw new ChannelTransportError("invalid_response");
            await frame(value as Record<string, unknown>, controls);
          })
          .finally(() => {
            pending--;
          });
        void chain.catch((error) =>
          controls.end(error instanceof ChannelTransportError ? error : new ChannelTransportError("network")),
        );
      });
      ws.on("error", () => controls.end(new ChannelTransportError("network")));
      ws.on("close", (code) => {
        if (input.signal.aborted) {
          reject(input.signal.reason);
          return;
        }
        if (!ending) failure = closeCode?.(code) ?? new ChannelTransportError("network");
        if (failure) reject(failure);
        else resolve();
      });
      if (input.signal.aborted) controls.end();
    });
  } finally {
    if (abort) input.signal.removeEventListener("abort", abort);
    for (const timer of timers) clearTimeout(timer);
    ws.terminate();
    await chain.catch(() => {});
  }
}

export async function createChannelTransport(
  credentials: ChannelCredentials,
  signal: AbortSignal,
  network: ChannelNetwork = {},
): Promise<ChannelTransport> {
  if (credentials.provider === "slack")
    return (await import("./channel-slack.js")).slackTransport(credentials, signal, network);
  if (credentials.provider === "telegram")
    return (await import("./channel-telegram.js")).telegramTransport(credentials, signal, network);
  return (await import("./channel-discord.js")).discordTransport(credentials, signal, network);
}
