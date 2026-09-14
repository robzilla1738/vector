import { createServer, type Server } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import { toErrorPayload, type MethodName, type VectorEvent } from "@vector/contracts";
import { MethodSchemas } from "@vector/contracts";
import type { EventBus } from "../events.js";

export type InvokeFn = (method: string, params: unknown, client: { external: boolean }) => Promise<unknown>;

/**
 * Loopback JSON-RPC + event stream. Token-authed; the token lives in the
 * data dir next to the port so the desktop shell and CLI can find it.
 */
export class ApiServer {
  private server: Server;
  private wss: WebSocketServer;
  private sockets = new Set<WebSocket>();
  port = 0;

  constructor(
    private opts: { token: string; invoke: InvokeFn; events: EventBus },
  ) {
    this.server = createServer((req, res) => void this.handle(req, res));
    this.wss = new WebSocketServer({ noServer: true });
    this.server.on("upgrade", (req, socket, head) => {
      const url = new URL(req.url ?? "/", "http://127.0.0.1");
      if (url.pathname !== "/ws" || url.searchParams.get("token") !== this.opts.token) {
        socket.destroy();
        return;
      }
      this.wss.handleUpgrade(req, socket, head, (ws) => this.onSocket(ws));
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

  private onSocket(ws: WebSocket) {
    this.sockets.add(ws);
    ws.on("close", () => this.sockets.delete(ws));
    ws.on("message", async (data) => {
      try {
        const msg = JSON.parse(String(data)) as { id?: number; method: string; params?: unknown };
        const result = await this.opts.invoke(msg.method, msg.params ?? {}, { external: true });
        ws.send(JSON.stringify({ id: msg.id, result }));
      } catch (e) {
        ws.send(JSON.stringify({ error: toErrorPayload(e) }));
      }
    });
  }

  private broadcast(e: VectorEvent) {
    const frame = JSON.stringify({ event: e });
    for (const ws of this.sockets) if (ws.readyState === ws.OPEN) ws.send(frame);
  }

  private async handle(req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse) {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    const send = (status: number, body: unknown) => {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify(body));
    };

    if (url.pathname === "/health") return send(200, { ok: true, service: "vector-runtime" });
    const auth = req.headers.authorization === `Bearer ${this.opts.token}` || url.searchParams.get("token") === this.opts.token;
    if (!auth) return send(401, { error: { code: "unauthorized", message: "missing or bad token" } });

    if (url.pathname === "/rpc" && req.method === "POST") {
      const chunks: Buffer[] = [];
      for await (const c of req) chunks.push(c);
      let payload: { method?: string; params?: unknown };
      try {
        payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch {
        return send(400, { error: { code: "invalid_params", message: "bad JSON" } });
      }
      if (!payload.method || !(payload.method in MethodSchemas)) {
        return send(404, { error: { code: "not_found", message: `unknown method ${payload.method}` } });
      }
      try {
        const result = await this.opts.invoke(payload.method, payload.params ?? {}, { external: true });
        return send(200, { result });
      } catch (e) {
        return send(200, { error: toErrorPayload(e) });
      }
    }
    return send(404, { error: { code: "not_found", message: "not found" } });
  }

  async close() {
    for (const ws of this.sockets) ws.close();
    await new Promise((r) => this.server.close(() => r(undefined)));
  }
}
