import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import { AuxError, toErrorPayload, type AgentConnectionScope, type AuxEvent } from "@aux/contracts";
import { MethodSchemas } from "@aux/contracts";
import type { EventBus } from "../events.js";

export type ClientContext = { external: boolean; connectionId?: string; scope?: AgentConnectionScope };
export type InvokeFn = (method: string, params: unknown, client: ClientContext) => Promise<unknown>;

/** Largest accepted /rpc or WS request body. Programs top out well under this. */
export const MAX_BODY_BYTES = 2 * 1024 * 1024;

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
  private sockets = new Map<WebSocket, ClientContext>();
  port = 0;

  constructor(
    private opts: {
      token: string;
      invoke: InvokeFn;
      events: EventBus;
      authorizeScopedToken?: (token: string) => ClientContext | null;
      filterEvent?: (client: ClientContext, event: AuxEvent) => boolean;
    },
  ) {
    this.server = createServer((req, res) => void this.handle(req, res));
    this.wss = new WebSocketServer({ noServer: true, maxPayload: MAX_BODY_BYTES });
    this.server.on("upgrade", (req, socket, head) => {
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
      this.wss.handleUpgrade(req, socket, head, (ws) => this.onSocket(ws, client!));
    });
    this.opts.events.subscribe((e) => this.broadcast(e));
  }

  listen(port = 0): Promise<number> {
    return new Promise((resolve) => {
      this.server.listen(port, "127.0.0.1", () => {
        this.port = (this.server.address() as { port: number }).port;
        resolve(this.port);
      });
    });
  }

  private masterBearer(req: IncomingMessage): boolean {
    return req.headers.authorization === `Bearer ${this.opts.token}`;
  }

  private client(req: IncomingMessage): ClientContext | null {
    if (this.masterBearer(req)) return { external: true };
    const match = /^Bearer ([^\s]+)$/.exec(req.headers.authorization ?? "");
    return match ? this.opts.authorizeScopedToken?.(match[1]!) ?? null : null;
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

  private onSocket(ws: WebSocket, client: ClientContext) {
    this.sockets.set(ws, client);
    ws.on("close", () => this.sockets.delete(ws));
    ws.on("message", async (data) => {
      let msg: unknown;
      try {
        msg = JSON.parse(String(data));
      } catch {
        ws.send(JSON.stringify({ error: { code: "invalid_params", message: "bad JSON" } }));
        return;
      }
      const out = await this.dispatch(msg, client);
      if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(out));
    });
  }

  private broadcast(e: AuxEvent) {
    let frame: string | undefined;
    for (const [ws, client] of this.sockets) {
      if (ws.readyState !== ws.OPEN) continue;
      // Scoped sockets get a filtered stream; with no filter configured they
      // get nothing rather than the global firehose.
      if (client.scope && (!this.opts.filterEvent || !this.opts.filterEvent(client, e))) continue;
      frame ??= JSON.stringify({ event: e });
      ws.send(frame);
    }
  }

  private async handle(req: IncomingMessage, res: ServerResponse) {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    const send = (status: number, body: unknown) => {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify(body));
    };

    if (url.pathname === "/health") return send(200, { ok: true, service: "aux-runtime" });
    const client = this.client(req);
    if (!client) return send(401, { error: { code: "unauthorized", message: "missing, revoked, or invalid bearer token" } });

    if (url.pathname === "/rpc" && req.method === "POST") {
      const declared = Number(req.headers["content-length"] ?? 0);
      if (declared > MAX_BODY_BYTES) {
        return send(413, { error: { code: "invalid_params", message: `body exceeds ${MAX_BODY_BYTES} bytes` } });
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
      const method = payload && typeof payload === "object" && "method" in payload ? (payload as { method: unknown }).method : undefined;
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
    for (const ws of this.sockets.keys()) ws.close();
    await new Promise((r) => this.server.close(() => r(undefined)));
  }
}
