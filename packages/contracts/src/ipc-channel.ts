/**
 * Bidirectional JSON-RPC over the authenticated Chromium runtime socket,
 * with in-memory transports for tests. Chromium owns native surfaces;
 * the runtime owns execution authority.
 */
import { toErrorPayload, AuxError, AUX_ERROR_REGISTRY, type AuxErrorCode } from "./errors.js";

export interface Transport {
  send(msg: unknown): void;
  onMessage(cb: (msg: unknown) => void): void;
  onClose?(cb: () => void): void;
}

interface Frame {
  kind: "req" | "res" | "note";
  id?: number;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: { code: string; message: string; detail?: unknown };
  type?: string;
  payload?: unknown;
}

type Handler = (params: unknown) => Promise<unknown> | unknown;
type NoteHandler = (type: string, payload: unknown) => void;

export class RpcChannel {
  private nextId = 1;
  private pending = new Map<
    number,
    { resolve: (v: unknown) => void; reject: (e: Error) => void; timer: NodeJS.Timeout }
  >();
  private handlers = new Map<string, Handler>();
  private noteHandlers: NoteHandler[] = [];
  private closed = false;

  constructor(
    private transport: Transport,
    private label = "rpc",
  ) {
    transport.onMessage((msg) => void this.onFrame(msg as Frame));
    transport.onClose?.(() => this.onClose());
  }

  onMethod(method: string, handler: Handler) {
    this.handlers.set(method, handler);
  }

  onNotify(handler: NoteHandler) {
    this.noteHandlers.push(handler);
  }

  call<T = unknown>(method: string, params?: unknown, timeoutMs = 30_000): Promise<T> {
    if (this.closed)
      return Promise.reject(new AuxError("backend_unavailable", `${this.label}: channel closed`));
    const id = this.nextId++;
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new AuxError("condition_timeout", `${this.label}: ${method} timed out`));
      }, timeoutMs);
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject, timer });
      this.transport.send({ kind: "req", id, method, params });
    });
  }

  notify(type: string, payload?: unknown) {
    if (this.closed) return;
    this.transport.send({ kind: "note", type, payload });
  }

  private async onFrame(f: Frame) {
    if (f.kind === "req" && f.id !== undefined && f.method) {
      const handler = this.handlers.get(f.method);
      if (!handler) {
        this.transport.send({
          kind: "res",
          id: f.id,
          error: toErrorPayload(new AuxError("not_found", "Unknown method")),
        });
        return;
      }
      try {
        const result = await handler(f.params);
        this.transport.send({ kind: "res", id: f.id, result });
      } catch (e) {
        this.transport.send({ kind: "res", id: f.id, error: toErrorPayload(e) });
      }
      return;
    }
    if (f.kind === "res" && f.id !== undefined) {
      const p = this.pending.get(f.id);
      if (!p) return;
      this.pending.delete(f.id);
      clearTimeout(p.timer);
      if (f.error) {
        const known =
          typeof f.error.code === "string" &&
          Object.hasOwn(AUX_ERROR_REGISTRY, f.error.code) &&
          typeof f.error.message === "string";
        p.reject(
          known
            ? new AuxError(f.error.code as AuxErrorCode, f.error.message, f.error.detail)
            : new AuxError("internal", `${this.label}: invalid error response`),
        );
      } else {
        p.resolve(f.result);
      }
      return;
    }
    if (f.kind === "note" && f.type) {
      for (const h of this.noteHandlers) h(f.type, f.payload);
    }
  }

  private onClose() {
    this.closed = true;
    for (const [, p] of this.pending) {
      clearTimeout(p.timer);
      p.reject(new AuxError("backend_unavailable", `${this.label}: channel closed`));
    }
    this.pending.clear();
  }
}

/** In-memory pair for tests. */
export function memoryTransportPair(): [Transport, Transport] {
  let aCb: ((m: unknown) => void) | null = null;
  let bCb: ((m: unknown) => void) | null = null;
  return [
    { send: (m) => queueMicrotask(() => bCb?.(m)), onMessage: (cb) => (aCb = cb) },
    { send: (m) => queueMicrotask(() => aCb?.(m)), onMessage: (cb) => (bCb = cb) },
  ];
}
