import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import { AuxError, toErrorPayload, type AgentConnectionScope, type AuxEvent } from "@aux/contracts";
import { MethodSchemas } from "@aux/contracts";
import type { EventBus } from "../events.js";

export type ClientContext = { external: boolean; connectionId?: string; scope?: AgentConnectionScope };
export type InvokeFn = (method: string, params: unknown, client: ClientContext) => Promise<unknown>;

/** Largest accepted /rpc or WS request body. Programs top out well under this. */
export const MAX_BODY_BYTES = 2 * 1024 * 1024;

const MAX_BUFFERED_BYTES = 1_000_000;
const HEARTBEAT_MS = 30_000;
type SocketEntry = {
  client: ClientContext;
  scopedToken?: string;
  backlog?: { frames: string[]; bytes: number };
  alive: boolean;
  closeTimer?: ReturnType<typeof setTimeout>;
};

/**
 * Loopback JSON-RPC + event stream. Token-authed; the token lives in the
 * data dir next to the port so the desktop shell and CLI can find it.
 *
 * Auth rules: HTTP routes accept ONLY `Authorization: Bearer <token>`. The
 * `?token=` query form is accepted solely on the WebSocket upgrade, where
 * browsers' WebSocket API cannot set headers. Tokens in URLs otherwise land
 * in shell history, logs and Referer headers (P0-3).
 */
export class ApiServer {
  private server: Server;
  private wss: WebSocketServer;
  /** backlog buffers live frames while a resuming socket replays its cursor. */
  private sockets = new Map<WebSocket, SocketEntry>();
  private heartbeat: ReturnType<typeof setInterval>;
  private unsubscribe: () => void;
  /**
   * Readiness gate (06-T): the port binds before the service tree finishes
   * building so early callers get a real answer instead of ECONNREFUSED —
   * 503 {ready:false} on /health, 503 not_ready everywhere else — until
   * bootstrap completes and setReady() flips the gate.
   */
  private ready = false;
  port = 0;

  setReady() {
    this.ready = true;
  }

  constructor(
    private opts: {
      token: string;
      invoke: InvokeFn;
      events: EventBus;
      authorizeScopedToken?: (token: string) => ClientContext | null;
      /** Known scoped bearer whose connection has expired or been revoked. */
      closedScopedToken?: (token: string) => ClientContext | null;
      filterEvent?: (client: ClientContext, event: AuxEvent) => boolean;
      peerIdentity?: { instanceId: string; pid: number; schema: number; startedAt: number };
    },
  ) {
    this.server = createServer((req, res) => void this.handle(req, res));
    this.wss = new WebSocketServer({ noServer: true, maxPayload: MAX_BODY_BYTES });
    this.server.on("upgrade", (req, socket, head) => {
      if (!this.ready) {
        socket.destroy();
        return;
      }
      const url = new URL(req.url ?? "/", "http://127.0.0.1");
      if (url.pathname !== "/ws") {
        socket.destroy();
        return;
      }
      // The master token can arrive as a bearer header or (for browser clients
      // that cannot set headers) the ?token= query form. Scoped tokens use the
      // same two paths; their sockets receive the stream filtered to scope.
      const queryToken = url.searchParams.get("token");
      const bearer = /^Bearer ([^\s]+)$/.exec(req.headers.authorization ?? "")?.[1];
      let client: ClientContext | null = null;
      if (this.masterBearer(req) || queryToken === this.opts.token) {
        client = { external: true };
      } else {
        const candidate = bearer ?? queryToken;
        if (candidate) client = this.opts.authorizeScopedToken?.(candidate) ?? null;
      }
      if (!client) {
        socket.destroy();
        return;
      }
      // D9 resume: `afterSeq` + `streamId` replay the durable buffer before
      // the socket goes live; a stale cursor gets a `resync` frame instead.
      const afterSeqParam = url.searchParams.get("afterSeq");
      const parsedSeq = afterSeqParam === null ? undefined : Number(afterSeqParam);
      const afterSeq =
        parsedSeq !== undefined && Number.isInteger(parsedSeq) && parsedSeq >= 0 ? parsedSeq : undefined;
      const streamId = url.searchParams.get("streamId") ?? undefined;
      const resume = afterSeq === undefined ? undefined : { afterSeq, streamId };
      const scopedToken = client.scope ? (bearer ?? queryToken ?? undefined) : undefined;
      this.wss.handleUpgrade(req, socket, head, (ws) => this.onSocket(ws, client!, resume, scopedToken));
    });
    this.unsubscribe = this.opts.events.subscribe((e) => this.broadcast(e));
    this.heartbeat = setInterval(() => {
      for (const [ws, entry] of this.sockets) {
        if (!this.liveSocket(ws, entry)) continue;
        if (!entry.alive) {
          ws.terminate();
          continue;
        }
        entry.alive = false;
        ws.ping();
      }
    }, HEARTBEAT_MS);
    this.heartbeat.unref();
  }

  listen(port = 0): Promise<number> {
    return new Promise((resolve, reject) => {
      this.server.once("error", reject);
      this.server.listen(port, "127.0.0.1", () => {
        this.port = (this.server.address() as { port: number }).port;
        resolve(this.port);
      });
    });
  }

  private masterBearer(req: IncomingMessage): boolean {
    return req.headers.authorization === `Bearer ${this.opts.token}`;
  }

  private presentedToken(req: IncomingMessage): string | undefined {
    return /^Bearer ([^\s]+)$/.exec(req.headers.authorization ?? "")?.[1];
  }

  private client(req: IncomingMessage): ClientContext | null {
    if (this.masterBearer(req)) return { external: true };
    const token = this.presentedToken(req);
    return token ? (this.opts.authorizeScopedToken?.(token) ?? null) : null;
  }

  /** Admit a known dead bearer only into RPC, where the invoker records the close and denies it. */
  private closedBearer(req: IncomingMessage, url: URL): ClientContext | null {
    if (url.pathname !== "/rpc" || req.method !== "POST") return null;
    const token = this.presentedToken(req);
    return token ? (this.opts.closedScopedToken?.(token) ?? null) : null;
  }

  /**
   * One dispatch path for HTTP and WS: validates the envelope shape, checks
   * the method exists in MethodSchemas, then invokes. Returns a result or an
   * error payload — never throws.
   */
  private async dispatch(
    payload: unknown,
    client: ClientContext = { external: true },
  ): Promise<{ id?: unknown; result?: unknown; error?: ReturnType<typeof toErrorPayload> }> {
    const env = (payload ?? {}) as { id?: unknown; method?: unknown; params?: unknown };
    const id = env.id;
    if (typeof env.method !== "string" || !(env.method in MethodSchemas)) {
      return { id, error: toErrorPayload(new AuxError("not_found", "Unknown method")) };
    }
    try {
      const result = await this.opts.invoke(env.method, env.params ?? {}, client);
      return { id, result };
    } catch (e) {
      return { id, error: toErrorPayload(e) };
    }
  }

  private onSocket(
    ws: WebSocket,
    client: ClientContext,
    resume?: { afterSeq: number; streamId?: string },
    scopedToken?: string,
  ) {
    const entry: SocketEntry = {
      client,
      scopedToken,
      alive: true,
    };
    if (resume) entry.backlog = { frames: [], bytes: 0 };
    this.sockets.set(ws, entry);
    ws.on("close", () => {
      clearTimeout(entry.closeTimer);
      this.sockets.delete(ws);
    });
    ws.on("error", () => ws.terminate());
    ws.on("pong", () => {
      entry.alive = true;
    });
    ws.on("message", async (data) => {
      if (!this.liveSocket(ws, entry)) return;
      let msg: unknown;
      try {
        msg = JSON.parse(String(data));
      } catch {
        this.send(ws, entry, JSON.stringify({ error: { code: "invalid_params", message: "bad JSON" } }));
        return;
      }
      const out = await this.dispatch(msg, client);
      this.send(ws, entry, JSON.stringify(out));
    });
    // Stream hello anchors every socket: identity + head at connect.
    this.send(
      ws,
      entry,
      JSON.stringify({
        kind: "hello",
        streamId: this.opts.events.streamId,
        lastSeq: this.opts.events.lastSeq(),
      }),
    );
    if (resume) this.resume(ws, entry, resume);
  }

  /**
   * D9 resume: replay the durable buffer after `afterSeq` through the same
   * visibility filter as the live stream, then flush live frames buffered
   * during the replay. A stale cursor (stream mismatch or a gap below the
   * retained floor) answers one `resync` frame — the client refetches a
   * snapshot and keeps the socket live for subsequent events. Backlogs
   * beyond REPLAY_LIMIT resync instead of replaying a flood.
   */
  private static readonly REPLAY_LIMIT = 10_000;
  private liveSocket(ws: WebSocket, entry: { client: ClientContext; scopedToken?: string }): boolean {
    if (ws.readyState !== ws.OPEN) return false;
    if (!entry.client.scope) return true;
    const fresh = entry.scopedToken ? this.opts.authorizeScopedToken?.(entry.scopedToken) : null;
    if (
      fresh &&
      fresh.connectionId === entry.client.connectionId &&
      JSON.stringify(fresh.scope) === JSON.stringify(entry.client.scope)
    )
      return true;
    ws.close(1008, "Connection expired or revoked");
    return false;
  }

  private retireSlowSocket(ws: WebSocket, entry: SocketEntry) {
    entry.backlog = undefined;
    ws.close(1013, "Output limit exceeded; reconnect and resynchronize");
    entry.closeTimer = setTimeout(() => ws.terminate(), 5000);
    entry.closeTimer.unref();
  }

  private send(ws: WebSocket, entry: SocketEntry, frame: string): boolean {
    if (!this.liveSocket(ws, entry)) return false;
    if (ws.bufferedAmount + Buffer.byteLength(frame) > MAX_BUFFERED_BYTES) {
      this.retireSlowSocket(ws, entry);
      return false;
    }
    ws.send(frame);
    return true;
  }

  private resume(ws: WebSocket, entry: SocketEntry, resume: { afterSeq: number; streamId?: string }) {
    const visible = (e: AuxEvent) =>
      !entry.client.scope || (!!this.opts.filterEvent && this.opts.filterEvent(entry.client, e));
    let cursor = resume.afterSeq;
    let lastSeq = cursor;
    let replayed = 0;
    for (;;) {
      if (!this.liveSocket(ws, entry)) return;
      const out = this.opts.events.since(
        cursor,
        2000,
        undefined,
        cursor === resume.afterSeq ? resume.streamId : undefined,
      );
      if (ws.readyState !== ws.OPEN) return;
      if (out.resync) {
        this.send(
          ws,
          entry,
          JSON.stringify({ kind: "resync", streamId: out.streamId, lastSeq: out.lastSeq }),
        );
        lastSeq = out.lastSeq;
        break;
      }
      for (const e of out.events)
        if (visible(e) && !this.send(ws, entry, JSON.stringify({ event: e }))) return;
      lastSeq = out.lastSeq;
      replayed += out.events.length;
      if (out.events.length < 2000) break;
      if (replayed >= ApiServer.REPLAY_LIMIT) {
        this.send(
          ws,
          entry,
          JSON.stringify({
            kind: "resync",
            streamId: this.opts.events.streamId,
            lastSeq: this.opts.events.lastSeq(),
          }),
        );
        lastSeq = this.opts.events.lastSeq();
        break;
      }
      cursor = out.lastSeq;
    }
    const backlog = entry.backlog?.frames ?? [];
    entry.backlog = undefined;
    for (const frame of backlog) {
      if (!this.liveSocket(ws, entry)) return;
      const seq = (JSON.parse(frame) as { event: AuxEvent }).event.seq;
      if (seq > lastSeq && !this.send(ws, entry, frame)) return;
    }
  }

  private broadcast(e: AuxEvent) {
    let frame: string | undefined;
    for (const [ws, entry] of this.sockets) {
      if (ws.readyState !== ws.OPEN) continue;
      if (!this.liveSocket(ws, entry)) continue;
      // Scoped sockets get a filtered stream; with no filter configured they
      // get nothing rather than the global firehose.
      if (entry.client.scope && (!this.opts.filterEvent || !this.opts.filterEvent(entry.client, e))) continue;
      frame ??= JSON.stringify({ event: e });
      if (entry.backlog) {
        const bytes = Buffer.byteLength(frame);
        if (entry.backlog.bytes + bytes > MAX_BUFFERED_BYTES) {
          this.retireSlowSocket(ws, entry);
          continue;
        }
        entry.backlog.bytes += bytes;
        entry.backlog.frames.push(frame);
      } else this.send(ws, entry, frame);
    }
  }

  private async handle(req: IncomingMessage, res: ServerResponse) {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    const send = (status: number, body: unknown) => {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify(body));
    };

    // Minimal unauthenticated probe — also the readiness signal. Everything
    // else 503s until the service tree is built (06-T readiness gate).
    if (url.pathname === "/health") {
      return this.ready
        ? send(200, { ok: true, service: "aux-runtime", ready: true })
        : send(503, { ok: false, service: "aux-runtime", ready: false });
    }
    // Internal takeover proof is available during bootstrap. A caller must
    // possess the owner-only descriptor token and supply a fresh challenge.
    if (url.pathname === "/internal/peer") {
      if (!this.masterBearer(req) || !this.opts.peerIdentity || req.method !== "GET")
        return send(401, { error: { code: "unauthorized", message: "peer proof unavailable" } });
      const nonce = url.searchParams.get("nonce");
      if (!nonce || !/^[a-f0-9]{32,128}$/i.test(nonce))
        return send(400, { error: { code: "invalid_params", message: "invalid peer challenge" } });
      return send(200, { service: "aux-runtime", nonce, ...this.opts.peerIdentity, ready: this.ready });
    }
    if (!this.ready) {
      return send(503, { error: { code: "not_ready", message: "aux runtime is still starting" } });
    }
    const client = this.client(req) ?? this.closedBearer(req, url);
    if (!client)
      return send(401, {
        error: { code: "unauthorized", message: "missing or invalid bearer token" },
      });

    if (url.pathname === "/rpc" && req.method === "POST") {
      const declared = Number(req.headers["content-length"] ?? 0);
      if (declared > MAX_BODY_BYTES) {
        return send(413, {
          error: { code: "invalid_params", message: `body exceeds ${MAX_BODY_BYTES} bytes` },
        });
      }
      const chunks: Buffer[] = [];
      let size = 0;
      for await (const c of req) {
        size += (c as Buffer).length;
        if (size > MAX_BODY_BYTES) {
          send(413, { error: { code: "invalid_params", message: `body exceeds ${MAX_BODY_BYTES} bytes` } });
          req.destroy();
          return;
        }
        chunks.push(c as Buffer);
      }
      let payload: unknown;
      try {
        payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch {
        return send(400, { error: toErrorPayload(new AuxError("invalid_params", "bad JSON")) });
      }
      const method =
        payload && typeof payload === "object" && "method" in payload
          ? (payload as { method: unknown }).method
          : undefined;
      const unknownMethod = typeof method !== "string" || !(method in MethodSchemas);
      const out = await this.dispatch(payload, client);
      if (unknownMethod) {
        return send(404, { error: out.error });
      }
      return send(200, out.error ? { error: out.error } : { result: out.result });
    }
    return send(404, { error: toErrorPayload(new AuxError("not_found", "not found")) });
  }

  async close() {
    clearInterval(this.heartbeat);
    this.unsubscribe();
    for (const ws of this.sockets.keys()) ws.terminate();
    await new Promise<void>((resolve) => this.wss.close(() => resolve()));
    await new Promise((r) => this.server.close(() => r(undefined)));
  }
}
