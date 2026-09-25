import { randomBytes, randomUUID } from "node:crypto";
import { chmodSync, rmSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { dirname, join } from "node:path";
import { WebSocket, WebSocketServer } from "ws";
import type { RpcChannel } from "@aux/contracts";

type Page = { pageId: string; cdpTargetId?: string; url: string; title: string; active: boolean };
type Target = { targetId: string; type: "page"; title: string; url: string; attached: boolean; browserContextId: string };
type Request = { id: number; method: string; params: Record<string, unknown>; sessionId?: string };
type Pending = { id: number; sessionId: string; pageId: string };

const CONTEXT_ID = "aux-profile";
const MAX_MESSAGE_BYTES = 1024 * 1024;
const MAX_NATIVE_EVENT_BYTES = 16 * 1024 * 1024;
const REFRESH_MS = 300;
const PAGE_DOMAINS = new Set(["Page", "Runtime", "DOM", "DOMSnapshot", "Accessibility", "Input", "Emulation", "Log", "CSS", "Performance", "Overlay", "IO", "Network", "Fetch"]);

function pageMethodAllowed(method: string): boolean {
  const [domain, command] = method.split(".");
  if (!domain || !command || !PAGE_DOMAINS.has(domain)) return false;
  if (domain === "Network" && (/^(get(All)?Cookies|setCookies?|deleteCookies?|clearBrowserCookies)$/.test(command))) return false;
  return true;
}

/**
 * Playwright's local CDP facade. The Unix socket is inside Chromium's private
 * Profile directory, with a separate unguessable WebSocket path. Every target
 * comes from native.listPages; native.cdpDispatch repeats ownership checks.
 */
export class NativeCdpBroker {
  private readonly socketPath: string;
  private readonly path = `/aux-cdp/${randomBytes(32).toString("hex")}`;
  private readonly server: Server = createServer();
  private readonly ws = new WebSocketServer({ server: this.server, path: this.path, maxPayload: MAX_MESSAGE_BYTES });
  private readonly targets = new Map<string, { pageId: string; info: Target }>();
  private readonly sessions = new Map<string, string>();
  private readonly childOwners = new Map<string, string>();
  private readonly autoAttachSessions = new Map<string, string>();
  private readonly browserSessions = new Set<string>();
  private readonly pending = new Map<number, Pending>();
  private nextNativeId = 1;
  private client: WebSocket | null = null;
  private poll: NodeJS.Timeout | null = null;
  private refreshQueue: Promise<void> = Promise.resolve();
  private autoAttach = false;
  private discover = false;
  private closed = false;

  private constructor(private readonly channel: RpcChannel, hostSocketPath: string) {
    this.socketPath = join(dirname(hostSocketPath), `c-${randomBytes(4).toString("hex")}.s`);
    channel.onNotify((type, payload) => {
      if (type === "native.cdpMessage") this.forwardNative(payload);
    });
  }

  static async start(channel: RpcChannel, hostSocketPath: string): Promise<NativeCdpBroker> {
    const broker = new NativeCdpBroker(channel, hostSocketPath);
    broker.ws.on("connection", broker.onConnection);
    try {
      await new Promise<void>((resolve, reject) => {
        broker.server.once("error", reject);
        broker.server.listen(broker.socketPath, () => {
          broker.server.off("error", reject);
          resolve();
        });
      });
      chmodSync(broker.socketPath, 0o600);
      return broker;
    } catch (error) {
      await broker.close();
      throw error;
    }
  }

  endpoint(): string {
    return `ws+unix://${this.socketPath}:${this.path}`;
  }

  private onConnection = (socket: WebSocket) => {
    if (this.closed || this.client) {
      socket.close(1008, "One Aux runtime connection is allowed");
      return;
    }
    this.client = socket;
    this.poll = setInterval(() => { void this.refresh(); }, REFRESH_MS);
    socket.on("message", raw => { void this.handle(socket, String(raw)); });
    socket.once("close", () => {
      if (this.client !== socket) return;
      this.client = null;
      if (this.poll) clearInterval(this.poll);
      this.poll = null;
      this.sessions.clear();
      this.childOwners.clear();
      this.autoAttachSessions.clear();
      this.browserSessions.clear();
      this.pending.clear();
      this.targets.clear();
      this.autoAttach = false;
      this.discover = false;
    });
  };

  private send(payload: unknown): void {
    if (this.client?.readyState === WebSocket.OPEN) this.client.send(JSON.stringify(payload));
  }

  private reply(request: Request, result: unknown): void {
    this.send({ id: request.id, result, ...(request.sessionId ? { sessionId: request.sessionId } : {}) });
  }

  private fail(request: Request, error: unknown): void {
    this.send({ id: request.id, error: { code: -32000, message: error instanceof Error ? error.message : String(error) },
      ...(request.sessionId ? { sessionId: request.sessionId } : {}) });
  }

  private notify(method: string, params: Record<string, unknown>): void {
    this.send({ method, params });
  }

  private async refresh(): Promise<void> {
    const work = this.refreshQueue.then(async () => {
      if (!this.client || this.closed) return;
      const previous = new Set(this.targets.keys());
      const snapshot = await this.channel.call<{ pages: Page[] }>("native.listPages", {}, 10_000);
      const next = new Map<string, { pageId: string; info: Target }>();
      for (const page of snapshot.pages) {
        if (!page.cdpTargetId || !/^(https?:|about:blank$)/.test(page.url)) continue;
        next.set(page.cdpTargetId, { pageId: page.pageId, info: {
          targetId: page.cdpTargetId, type: "page", title: page.title, url: page.url,
          attached: [...this.sessions.values()].includes(page.cdpTargetId), browserContextId: CONTEXT_ID,
        } });
      }
      for (const [id, old] of this.targets) if (!next.has(id)) {
        for (const [sessionId, targetId] of this.sessions) if (targetId === id) {
          this.sessions.delete(sessionId);
          if (!this.childOwners.delete(sessionId)) this.notify("Target.detachedFromTarget", { sessionId, targetId: id });
        }
        this.autoAttachSessions.delete(id);
        if (this.discover) this.notify("Target.targetDestroyed", { targetId: id });
        for (const [nativeId, pending] of this.pending) if (pending.pageId === old.pageId) this.pending.delete(nativeId);
      }
      this.targets.clear();
      for (const [id, value] of next) this.targets.set(id, value);
      for (const [id, value] of next) if (!previous.has(id)) {
        if (this.discover) this.notify("Target.targetCreated", { targetInfo: value.info });
        if (this.autoAttach) this.attach(id, true);
      }
    });
    this.refreshQueue = work.catch(() => {});
    return work;
  }

  private sessionsHasTarget(targetId: string): boolean {
    return [...this.sessions.values()].includes(targetId);
  }

  private attach(targetId: string, automatic: boolean): string {
    const target = this.targets.get(targetId);
    if (!target) throw new Error("Target is not an Aux tab in this Profile");
    const sessionId = `aux-page-${randomUUID()}`;
    this.sessions.set(sessionId, targetId);
    target.info.attached = true;
    if (automatic) this.notify("Target.attachedToTarget", {
      sessionId, targetInfo: target.info, waitingForDebugger: false,
    });
    return sessionId;
  }

  private forwardNative(payload: unknown): void {
    if (!payload || typeof payload !== "object") return;
    const event = payload as { pageId?: unknown; message?: unknown };
    if (typeof event.pageId !== "string" || typeof event.message !== "string" || event.message.length > MAX_NATIVE_EVENT_BYTES) return;
    let message: Record<string, unknown>;
    try { message = JSON.parse(event.message) as Record<string, unknown>; } catch { return; }
    if (typeof message.id === "number") {
      const pending = this.pending.get(message.id);
      if (!pending || pending.pageId !== event.pageId || !this.sessions.has(pending.sessionId)) return;
      this.pending.delete(message.id);
      this.send({ ...message, id: pending.id, sessionId: pending.sessionId });
      return;
    }
    const nativeSession = typeof message.sessionId === "string" ? message.sessionId : undefined;
    if (message.method === "Target.attachedToTarget") {
      const params = message.params as { sessionId?: unknown } | undefined;
      const child = params?.sessionId;
      const targetId = [...this.targets].find(([, value]) => value.pageId === event.pageId)?.[0];
      const parent = nativeSession ?? (targetId ? this.autoAttachSessions.get(targetId) : undefined);
      if (typeof child !== "string" || !targetId || !parent || !this.sessions.has(parent)) return;
      this.sessions.set(child, targetId);
      this.childOwners.set(child, parent);
      this.send({ ...message, sessionId: parent });
      return;
    }
    if (message.method === "Target.detachedFromTarget") {
      const params = message.params as { sessionId?: unknown } | undefined;
      const child = params?.sessionId;
      if (typeof child !== "string") return;
      const parent = nativeSession ?? this.childOwners.get(child);
      this.sessions.delete(child);
      this.childOwners.delete(child);
      if (parent && this.sessions.has(parent)) this.send({ ...message, sessionId: parent });
      return;
    }
    if (nativeSession) {
      if (this.childOwners.has(nativeSession)) this.send(message);
      return;
    }
    for (const [sessionId, targetId] of this.sessions) {
      if (!this.childOwners.has(sessionId) && this.targets.get(targetId)?.pageId === event.pageId) this.send({ ...message, sessionId });
    }
  }

  private async handle(socket: WebSocket, raw: string): Promise<void> {
    if (socket !== this.client) return;
    let request: Request;
    try {
      const parsed = JSON.parse(raw) as Partial<Request>;
      if (!Number.isSafeInteger(parsed.id) || typeof parsed.method !== "string" ||
          (parsed.sessionId !== undefined && typeof parsed.sessionId !== "string") ||
          (parsed.params !== undefined && (!parsed.params || typeof parsed.params !== "object" || Array.isArray(parsed.params)))) throw new Error();
      request = { id: parsed.id!, method: parsed.method, params: parsed.params ?? {}, sessionId: parsed.sessionId };
    } catch { socket.close(1003, "Invalid CDP request"); return; }
    try {
      const result = await this.execute(request);
      if (result !== null) this.reply(request, result);
    } catch (error) { this.fail(request, error); }
  }

  private async execute(request: Request): Promise<unknown | null> {
    const { method, params, sessionId } = request;
    if (sessionId && this.sessions.has(sessionId)) {
      const targetId = this.sessions.get(sessionId)!;
      let target = this.targets.get(targetId);
      if (!target) {
        await this.refresh();
        target = this.targets.get(targetId);
      }
      if (!target) throw new Error("Target is not an Aux tab in this Profile");
      if (method === "Target.getTargetInfo") {
        if (params.targetId && params.targetId !== targetId) throw new Error("Target is not an Aux tab");
        return { targetInfo: target.info };
      }
      const previousAutoAttach = this.autoAttachSessions.get(targetId);
      if (method === "Target.setAutoAttach") {
        if (params.autoAttach === true) this.autoAttachSessions.set(targetId, sessionId);
        else this.autoAttachSessions.delete(targetId);
      } else if (method === "Target.detachFromTarget") {
        if (typeof params.sessionId !== "string" || this.childOwners.get(params.sessionId) !== sessionId) throw new Error("Iframe session is not owned by this page");
      } else if (!pageMethodAllowed(method)) throw new Error("CDP method is not page scoped");
      const nativeId = this.nextNativeId++;
      this.pending.set(nativeId, { id: request.id, sessionId, pageId: target.pageId });
      try {
        await this.channel.call("native.cdpDispatch", { pageId: target.pageId,
          message: JSON.stringify({ id: nativeId, method, params,
            ...(this.childOwners.has(sessionId) ? { sessionId } : {}) }) }, 10_000);
      } catch (error) {
        this.pending.delete(nativeId);
        if (method === "Target.setAutoAttach") {
          if (previousAutoAttach) this.autoAttachSessions.set(targetId, previousAutoAttach);
          else this.autoAttachSessions.delete(targetId);
        }
        throw error;
      }
      return null; // Native protocol response arrives as native.cdpMessage.
    }
    if (sessionId && !this.browserSessions.has(sessionId)) throw new Error("Unknown CDP session");
    if (method === "Browser.getVersion") {
      const { version } = await this.channel.call<{ version: string }>("native.cdpVersion", {});
      return {
        protocolVersion: "1.3", product: `Chrome/${version}`, revision: "Aux",
        userAgent: `Mozilla/5.0 (${process.platform === "darwin" ? "Macintosh" : "X11; Linux x86_64"}) AppleWebKit/537.36 Chrome/${version} Safari/537.36`,
        jsVersion: "",
      };
    }
    if (method === "Browser.setDownloadBehavior") {
      if (params.browserContextId && params.browserContextId !== CONTEXT_ID) throw new Error("Other browser contexts are not available");
      return {}; // Chromium's Profile download controller remains authoritative.
    }
    if (method === "Target.getTargetInfo") {
      if (!params.targetId) return { targetInfo: { targetId: "aux-internal-root", type: "browser", title: "Aux", url: "" } };
      await this.refresh();
      const target = this.targets.get(String(params.targetId));
      if (!target) throw new Error("Target is not an Aux tab in this Profile");
      return { targetInfo: target.info };
    }
    if (method === "Target.attachToBrowserTarget") {
      const child = `aux-browser-${randomUUID()}`;
      this.browserSessions.add(child);
      return { sessionId: child };
    }
    if (method === "Target.getTargets") {
      await this.refresh();
      return { targetInfos: [...this.targets.values()].map(value => value.info) };
    }
    if (method === "Target.setDiscoverTargets") {
      await this.refresh();
      this.discover = params.discover === true;
      if (this.discover) for (const { info } of this.targets.values()) this.notify("Target.targetCreated", { targetInfo: info });
      return {};
    }
    if (method === "Target.setAutoAttach") {
      this.autoAttach = params.autoAttach === true;
      await this.refresh();
      if (this.autoAttach) for (const id of this.targets.keys()) if (!this.sessionsHasTarget(id)) this.attach(id, true);
      return {};
    }
    if (method === "Target.attachToTarget") {
      await this.refresh();
      if (typeof params.targetId !== "string") throw new Error("Target ID required");
      return { sessionId: this.attach(params.targetId, false) };
    }
    if (method === "Target.detachFromTarget") {
      if (typeof params.sessionId !== "string") throw new Error("Target session required");
      if (this.browserSessions.delete(params.sessionId)) return {};
      const targetId = this.sessions.get(params.sessionId);
      if (!targetId) throw new Error("Unknown target session");
      this.sessions.delete(params.sessionId);
      this.childOwners.delete(params.sessionId);
      if (this.autoAttachSessions.get(targetId) === params.sessionId) this.autoAttachSessions.delete(targetId);
      this.notify("Target.detachedFromTarget", { sessionId: params.sessionId, targetId });
      return {};
    }
    if (method === "Target.activateTarget") {
      await this.refresh();
      const target = this.targets.get(String(params.targetId));
      if (!target) throw new Error("Target is not an Aux tab in this Profile");
      return this.channel.call("native.focusPage", { pageId: target.pageId });
    }
    throw new Error("CDP method is not available through Aux");
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    if (this.poll) clearInterval(this.poll);
    this.client?.terminate();
    this.ws.close();
    if (this.server.listening) await new Promise<void>(resolve => this.server.close(() => resolve()));
    rmSync(this.socketPath, { force: true });
  }
}
