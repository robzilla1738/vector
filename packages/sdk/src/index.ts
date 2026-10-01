import { existsSync, readFileSync } from "node:fs";
import {
  MethodSchemas,
  ResultSchemas,
  supportedAgentApi,
  createAgentApi,
  type AgentApiPath,
  type AgentApiParams,
  type AgentApiResult,
  type AgentApiSupportOverrides,
  type MethodName,
  type MethodParams,
  type MethodResult,
  type AuxEvent,
} from "@aux/contracts";
import { resolveRuntimeDescriptor } from "@aux/contracts/installation";

export interface AuxConnection {
  port: number;
  token: string;
  pid?: number;
}
/**
 * `validateResults` parses every result with its zod schema (fills schema
 * defaults, rejects drift). By default the hot page loop — observe, execute,
 * extract, waitFor, console, events.since — skips it and returns the wire
 * value as sent: fields the runtime omits on the wire (e.g. an observation's
 * `links`, element `selector`/`frame`) are then absent rather than defaulted.
 * Requests are always validated.
 */
export interface AuxClientOptions {
  timeoutMs?: number;
  fetch?: typeof fetch;
  validateResults?: boolean;
}

const HOT_METHODS = new Set<string>([
  "pages.observe",
  "pages.execute",
  "pages.extract",
  "pages.waitFor",
  "pages.console",
  "events.since",
]);

export class AuxRpcError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number,
    public readonly detail?: unknown,
  ) {
    super(message);
    this.name = "AuxRpcError";
  }
}

export function readRuntimeDescriptor(path = resolveRuntimeDescriptor()): AuxConnection {
  if (!existsSync(path)) throw new Error(`No running Aux runtime found at ${path}. Start Aux first.`);
  let value: unknown;
  try {
    value = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    throw new Error(`The Aux runtime descriptor at ${path} is unreadable.`);
  }
  if (!value || typeof value !== "object")
    throw new Error(`The Aux runtime descriptor at ${path} is invalid.`);
  const record = value as Record<string, unknown>;
  if (
    !Number.isInteger(record.port) ||
    Number(record.port) < 1 ||
    Number(record.port) > 65535 ||
    typeof record.token !== "string" ||
    !record.token
  )
    throw new Error(`The Aux runtime descriptor at ${path} is invalid.`);
  return {
    port: Number(record.port),
    token: record.token,
    ...(Number.isInteger(record.pid) ? { pid: Number(record.pid) } : {}),
  };
}

/** A leftover descriptor does not prove that its native runtime is still alive. */
export async function requireLiveRuntime(connection: AuxConnection, fetchImpl = fetch): Promise<void> {
  if (!Number.isInteger(connection.pid) || connection.pid! <= 0) throw new Error("Aux runtime descriptor has no live process identity.");
  try { process.kill(connection.pid!, 0); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== "EPERM") throw new Error("Aux runtime process is no longer running."); }
  const response = await fetchImpl(`http://127.0.0.1:${connection.port}/health`, { signal: AbortSignal.timeout(1500), redirect: "error" });
  if (!response.ok) throw new Error("Aux runtime is not ready.");
  const health = await response.json() as { service?: string; ready?: boolean };
  if (health.service !== "aux-runtime" || health.ready !== true) throw new Error("Aux runtime health is invalid.");
}

export class AuxClient {
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;
  private readonly validateResults?: boolean;
  constructor(
    private readonly connection: AuxConnection,
    options: AuxClientOptions = {},
  ) {
    this.timeoutMs = options.timeoutMs ?? 120_000;
    this.fetchImpl = options.fetch ?? fetch;
    this.validateResults = options.validateResults;
  }
  static running(options: AuxClientOptions & { descriptorPath?: string; token?: string } = {}) {
    const connection = readRuntimeDescriptor(options.descriptorPath);
    return new AuxClient({ ...connection, ...(options.token ? { token: options.token } : {}) }, options);
  }
  /** Manifest-generated, capability-filtered nested agent surface. */
  agentApi(
    options: { capabilities?: ReadonlySet<string>; apiSupportOverrides?: AgentApiSupportOverrides } = {},
  ) {
    return createAgentApi((method, params) => this.call(method, params), { surface: "sdk", ...options });
  }
  async agentCall<P extends AgentApiPath>(path: P, params: AgentApiParams<P>): Promise<AgentApiResult<P>> {
    const entry = supportedAgentApi({ surface: "sdk" }).find((item) => item.path === path);
    if (!entry) throw new AuxRpcError(`Unsupported Aux API member: ${path}`, "not_found");
    return this.call(entry.method, params as never) as Promise<AgentApiResult<P>>;
  }
  async call<M extends MethodName>(method: M, params: MethodParams<M>): Promise<MethodResult<M>> {
    const request = MethodSchemas[method].parse(params);
    let response: Response;
    try {
      response = await this.fetchImpl(`http://127.0.0.1:${this.connection.port}/rpc`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${this.connection.token}` },
        body: JSON.stringify({ method, params: request }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      throw new AuxRpcError(error instanceof Error ? error.message : String(error), "transport_error");
    }
    let body: { result?: unknown; error?: { code?: string; message?: string; detail?: unknown } };
    try {
      body = (await response.json()) as typeof body;
    } catch {
      throw new AuxRpcError(
        `Aux returned a non-JSON response (HTTP ${response.status}).`,
        "invalid_response",
        response.status,
      );
    }
    if (body.error)
      throw new AuxRpcError(
        body.error.message ?? `Aux request failed with HTTP ${response.status}.`,
        body.error.code ?? "request_failed",
        response.status,
        body.error.detail,
      );
    if (!response.ok)
      throw new AuxRpcError(
        `Aux request failed with HTTP ${response.status}.`,
        "http_error",
        response.status,
      );
    return (this.validateResults ?? !HOT_METHODS.has(method))
      ? (ResultSchemas[method].parse(body.result) as MethodResult<M>)
      : (body.result as MethodResult<M>);
  }
  /**
   * Durable event stream (D9) over `/ws` — no polling. Each connection
   * resumes with `afterSeq` + the pinned `streamId` so a recreated store
   * cannot silently replay a stale cursor. On a gap the runtime answers a
   * `resync` frame — the client is told via `onResync` (refetch a snapshot
   * there), then the generator continues from the stream head. A dropped
   * socket reconnects after `reconnectMs` with the last delivered seq.
   */
  async *events(
    lastSeq = 0,
    options: {
      signal?: AbortSignal;
      reconnectMs?: number;
      onResync?: (resync: { streamId: string; lastSeq: number }) => void;
      webSocket?: typeof WebSocket;
    } = {},
  ): AsyncGenerator<AuxEvent> {
    let seq = lastSeq;
    let streamId: string | undefined;
    const reconnectMs = options.reconnectMs ?? 1_000;
    const WSImpl = options.webSocket ?? WebSocket;
    while (!options.signal?.aborted) {
      const url =
        `ws://127.0.0.1:${this.connection.port}/ws?token=${encodeURIComponent(this.connection.token)}&afterSeq=${seq}` +
        (streamId ? `&streamId=${encodeURIComponent(streamId)}` : "");
      const queue: AuxEvent[] = [];
      let closed = false;
      let waiter: (() => void) | undefined;
      const ws = new WSImpl(url);
      const wake = () => {
        const w = waiter;
        waiter = undefined;
        w?.();
      };
      ws.onmessage = (m: unknown) => {
        try {
          const frame = JSON.parse(String((m as MessageEvent).data)) as {
            kind?: string;
            streamId?: string;
            lastSeq?: number;
            event?: AuxEvent;
          };
          if (frame.kind === "hello") {
            streamId ??= frame.streamId;
          } else if (frame.kind === "resync" && frame.streamId && frame.lastSeq !== undefined) {
            streamId = frame.streamId;
            seq = frame.lastSeq;
            options.onResync?.({ streamId: frame.streamId, lastSeq: frame.lastSeq });
          } else if (frame.event) queue.push(frame.event);
          wake();
        } catch {
          /* drop malformed frames */
        }
      };
      const onAbort = () => ws.close();
      ws.onclose = () => {
        closed = true;
        wake();
      };
      ws.onerror = () => ws.close();
      options.signal?.addEventListener("abort", onAbort, { once: true });
      for (;;) {
        if (!queue.length) {
          if (closed) break;
          await new Promise<void>((r) => (waiter = r));
          continue;
        }
        const e = queue.shift()!;
        if (e.seq > seq) seq = e.seq;
        yield e;
      }
      options.signal?.removeEventListener("abort", onAbort);
      if (options.signal?.aborted) return;
      await new Promise<void>((resolve) => {
        const t = setTimeout(resolve, reconnectMs);
        options.signal?.addEventListener(
          "abort",
          () => {
            clearTimeout(t);
            resolve();
          },
          { once: true },
        );
      });
    }
  }
}
