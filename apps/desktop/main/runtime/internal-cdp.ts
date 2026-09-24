import { randomBytes, randomUUID } from "node:crypto";
import type { Session, WebContents } from "electron";
import { WebSocket, WebSocketServer } from "ws";
import type { TargetRegistry } from "../target-registry.js";

type CdpMessage = { id?: number; method?: string; params?: Record<string, unknown>; sessionId?: string };
type TargetInfo = { targetId: string; type: string; [key: string]: unknown };
type FrameTransform = { quad: number[]; width: number; height: number };
type PointerRoute = { sessionId: string; params: Record<string, unknown>; transforms: FrameTransform[] };
const PAGE_DOMAINS = new Set(["Page", "Runtime", "DOM", "DOMSnapshot", "Accessibility", "Input", "Emulation", "Log", "CSS", "Performance", "Overlay", "IO", "Network", "Fetch"]);

function pointInQuad(quad: number[], x: number, y: number, width: number, height: number): { x: number; y: number } | null {
  if (quad.length !== 8 || width <= 0 || height <= 0) return null;
  const ax = quad[2]! - quad[0]!, ay = quad[3]! - quad[1]!;
  const bx = quad[6]! - quad[0]!, by = quad[7]! - quad[1]!;
  const determinant = ax * by - ay * bx;
  if (Math.abs(determinant) < 1e-6) return null;
  const px = x - quad[0]!, py = y - quad[1]!;
  return { x: ((px * by - py * bx) / determinant) * width, y: ((ax * py - ay * px) / determinant) * height };
}

/** Electron-main CDP transport for one runtime generation. No Chromium port is opened. */
export class InternalCdpBroker {
  private readonly path = `/aux-cdp/${randomBytes(32).toString("hex")}`;
  private readonly server = new WebSocketServer({ host: "127.0.0.1", port: 0, path: this.path, maxPayload: 8 * 1024 * 1024, clientTracking: true });
  private client: WebSocket | null = null;
  private readonly pageSessions = new Map<string, string>();
  private readonly sessionOwners = new Map<string, string>();
  private readonly sessionParents = new Map<string, string>();
  private readonly browserSessions = new Set<string>();
  private readonly allowedTargets = new Map<string, TargetInfo>();
  private readonly targetOwners = new Map<string, { contentsId: number; pageId: string }>();
  private readonly announced = new Set<string>();
  private autoAttach = false;
  private closed = false;
  private unsubscribe: (() => void) | null = null;
  private syncTimer: NodeJS.Timeout | null = null;
  private syncQueue: Promise<void> = Promise.resolve();
  private readonly inputQueues = new Map<string, Promise<void>>();
  private readonly pointerCapture = new Map<string, { sessionId: string; transforms: FrameTransform[] }>();
  private ownsRootDebugger = false;

  private constructor(private readonly root: WebContents, private readonly registry: TargetRegistry, private readonly profile: Session) {}

  static async start(root: WebContents, registry: TargetRegistry, profile: Session): Promise<InternalCdpBroker> {
    const ownsDebugger = !root.debugger.isAttached();
    if (ownsDebugger) root.debugger.attach("1.3");
    let broker: InternalCdpBroker | undefined;
    try {
      broker = new InternalCdpBroker(root, registry, profile);
      broker.ownsRootDebugger = ownsDebugger;
      root.debugger.on("message", broker.onDebuggerMessage);
      root.debugger.on("detach", broker.onDebuggerDetach);
      broker.unsubscribe = registry.subscribe(() => { broker!.revokeRemovedTargets(); broker!.scheduleSync(); });
      broker.server.on("connection", broker.onConnection);
      await new Promise<void>((resolve, reject) => {
        broker!.server.once("listening", resolve);
        broker!.server.once("error", reject);
      });
      await broker.syncTargets();
      return broker;
    } catch (error) {
      if (broker) await broker.close().catch(() => {});
      else if (ownsDebugger && root.debugger.isAttached()) root.debugger.detach();
      throw error;
    }
  }

  endpoint(): string {
    const address = this.server.address();
    if (!address || typeof address === "string") throw new Error("Internal CDP broker is not listening");
    return `ws://127.0.0.1:${address.port}${this.path}`;
  }

  port(): number {
    const address = this.server.address();
    if (!address || typeof address === "string") throw new Error("Internal CDP broker is not listening");
    return address.port;
  }

  private onConnection = (socket: WebSocket) => {
    if (this.closed || this.client) { socket.close(1008, "Runtime already connected"); return; }
    this.client = socket;
    socket.on("message", raw => { void this.handle(socket, String(raw)); });
    socket.once("close", () => {
      if (this.client !== socket) return;
      this.client = null;
      for (const sessionId of this.pageSessions.keys()) {
        void this.root.debugger.sendCommand("Target.detachFromTarget", { sessionId }).catch(() => {});
      }
      this.pageSessions.clear();
      this.sessionOwners.clear();
      this.sessionParents.clear();
      this.pointerCapture.clear();
      this.browserSessions.clear();
      this.announced.clear();
      this.autoAttach = false;
    });
  };

  private onDebuggerDetach = () => { this.client?.close(1011, "Debugger detached"); };

  private onDebuggerMessage = (_event: Electron.Event, method: string, params: Record<string, unknown> = {}, sessionId?: string) => {
    if (!this.client || this.client.readyState !== WebSocket.OPEN) return;
    if (method === "Target.attachedToTarget") {
      const info = params.targetInfo as TargetInfo | undefined;
      const child = params.sessionId;
      const owner = sessionId
        ? info?.type === "iframe" ? this.sessionOwners.get(sessionId) : undefined
        : info && this.allowedTargets.has(info.targetId) ? info.targetId : undefined;
      const rootContext = owner ? this.allowedTargets.get(owner)?.browserContextId : undefined;
      if (!info || typeof child !== "string" || !owner || !this.allowedTargets.has(owner)
        || (rootContext && info.browserContextId && info.browserContextId !== rootContext)) {
        if (typeof child === "string") void this.root.debugger.sendCommand("Target.detachFromTarget", { sessionId: child }).catch(() => {});
        return;
      }
      this.pageSessions.set(child, info.targetId);
      this.sessionOwners.set(child, owner);
      if (sessionId) this.sessionParents.set(child, sessionId);
    } else if (method === "Target.detachedFromTarget") {
      const child = params.sessionId;
      if (typeof child !== "string" || !this.pageSessions.has(child)) return;
      this.dropSession(child);
    } else if (method.startsWith("Target.target")) {
      const info = params.targetInfo as TargetInfo | undefined;
      const targetId = info?.targetId ?? params.targetId;
      if (typeof targetId !== "string" || (!this.allowedTargets.has(targetId) && ![...this.pageSessions.values()].includes(targetId))) return;
    } else if (sessionId && !this.sessionOwners.has(sessionId)) {
      return;
    } else if (!sessionId) {
      // Browser-global events can contain other profiles' activity. Only
      // explicit, registry-filtered target events cross this boundary.
      return;
    }
    this.send({ method, params, ...(sessionId ? { sessionId } : {}) });
  };

  private send(message: object) {
    if (this.client?.readyState === WebSocket.OPEN) this.client.send(JSON.stringify(message));
  }

  private reply(socket: WebSocket, message: object) {
    if (this.client === socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
  }

  private dropSession(sessionId: string) {
    for (const [source, capture] of this.pointerCapture) if (source === sessionId || capture.sessionId === sessionId) this.pointerCapture.delete(source);
    for (const [child, parent] of this.sessionParents) if (parent === sessionId) this.dropSession(child);
    this.pageSessions.delete(sessionId);
    this.sessionOwners.delete(sessionId);
    this.sessionParents.delete(sessionId);
  }

  /** Route pointer input into an authorized OOPIF; Chromium's browser-level
   *  CDP normally performs this hit test, but Electron's page debugger does not. */
  private async pointerRoute(sessionId: string, params: Record<string, unknown>): Promise<PointerRoute> {
    let current = sessionId;
    let x = Number(params.x), y = Number(params.y);
    const transforms: FrameTransform[] = [];
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error("Invalid pointer coordinates");
    for (let depth = 0; depth < 8; depth++) {
      if (![...this.sessionParents.values()].includes(current)) break;
      const hit = await this.root.debugger.sendCommand("DOM.getNodeForLocation", { x: Math.floor(x), y: Math.floor(y), includeUserAgentShadowDOM: true }, current).catch(() => null) as { backendNodeId?: number } | null;
      if (!hit?.backendNodeId) break;
      const described = await this.root.debugger.sendCommand("DOM.describeNode", { backendNodeId: hit.backendNodeId }, current).catch(() => null) as { node?: { localName?: string; frameId?: string } } | null;
      const frameId = described?.node?.localName === "iframe" ? described.node.frameId : undefined;
      if (!frameId) break;
      const child = [...this.sessionParents].find(([childSession, parent]) => parent === current && this.pageSessions.get(childSession) === frameId)?.[0];
      if (!child || this.sessionOwners.get(child) !== this.sessionOwners.get(sessionId)) break;
      const [box, layout] = await Promise.all([
        this.root.debugger.sendCommand("DOM.getBoxModel", { backendNodeId: hit.backendNodeId }, current).catch(() => null) as Promise<{ model?: { content?: number[] } } | null>,
        this.root.debugger.sendCommand("Page.getLayoutMetrics", {}, child).catch(() => null) as Promise<{ cssLayoutViewport?: { clientWidth?: number; clientHeight?: number } } | null>,
      ]);
      const width = layout?.cssLayoutViewport?.clientWidth, height = layout?.cssLayoutViewport?.clientHeight;
      if (!box?.model?.content || !width || !height) break;
      const mapped = pointInQuad(box.model.content, x, y, width, height);
      if (!mapped) break;
      transforms.push({ quad: box.model.content, width, height });
      x = mapped.x; y = mapped.y; current = child;
    }
    return { sessionId: current, params: current === sessionId ? params : { ...params, x, y }, transforms };
  }

  private capturedPointerRoute(sessionId: string, params: Record<string, unknown>): PointerRoute | null {
    const capture = this.pointerCapture.get(sessionId);
    if (!capture || !this.pageSessions.has(capture.sessionId) || this.sessionOwners.get(capture.sessionId) !== this.sessionOwners.get(sessionId)) return null;
    let x = Number(params.x), y = Number(params.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    for (const transform of capture.transforms) {
      const mapped = pointInQuad(transform.quad, x, y, transform.width, transform.height);
      if (!mapped) return null;
      x = mapped.x; y = mapped.y;
    }
    return { sessionId: capture.sessionId, params: capture.sessionId === sessionId ? params : { ...params, x, y }, transforms: capture.transforms };
  }

  private scheduleSync() {
    if (this.closed || this.syncTimer) return;
    this.syncTimer = setTimeout(() => {
      this.syncTimer = null;
      void this.syncTargets().catch(() => {});
    }, 20);
  }

  private revokeRemovedTargets() {
    for (const [targetId, owner] of this.targetOwners) {
      if (this.registry.byWebContentsId(owner.contentsId)?.pageId === owner.pageId) continue;
      this.targetOwners.delete(targetId);
      this.allowedTargets.delete(targetId);
      if (this.announced.delete(targetId)) this.send({ method: "Target.targetDestroyed", params: { targetId } });
      for (const [sessionId, ownerId] of [...this.sessionOwners]) if (ownerId === targetId) {
        if (!this.pageSessions.has(sessionId)) continue;
        this.dropSession(sessionId);
        void this.root.debugger.sendCommand("Target.detachFromTarget", { sessionId }).catch(() => {});
      }
    }
  }

  private syncTargets(): Promise<void> {
    if (this.closed) return Promise.resolve();
    const next = this.syncQueue.then(() => this.collectTargets());
    this.syncQueue = next.catch(() => {});
    return next;
  }

  private async collectTargets() {
    if (this.closed) return;
    const next = new Map<string, { info: TargetInfo; contentsId: number; pageId: string }>();
    await Promise.all(this.registry.all().map(async entry => {
      const wc = entry.view.webContents;
      if (wc.isDestroyed()) return;
      try {
        if (!wc.debugger.isAttached()) wc.debugger.attach("1.3");
        const result = await wc.debugger.sendCommand("Target.getTargetInfo") as { targetInfo?: TargetInfo };
        if (result.targetInfo?.targetId && this.registry.byWebContentsId(wc.id) === entry) next.set(result.targetInfo.targetId, { info: result.targetInfo, contentsId: wc.id, pageId: entry.pageId });
      } catch { /* view may be between creation and renderer readiness */ }
    }));
    if (this.closed) return;
    for (const id of this.allowedTargets.keys()) if (!next.has(id)) {
      this.allowedTargets.delete(id);
      this.targetOwners.delete(id);
      if (this.announced.delete(id)) this.send({ method: "Target.targetDestroyed", params: { targetId: id } });
      for (const [sessionId, ownerId] of [...this.sessionOwners]) if (ownerId === id) {
        if (!this.pageSessions.has(sessionId)) continue;
        this.dropSession(sessionId);
        void this.root.debugger.sendCommand("Target.detachFromTarget", { sessionId }).catch(() => {});
      }
    }
    for (const [id, { info, contentsId, pageId }] of next) {
      this.allowedTargets.set(id, info);
      this.targetOwners.set(id, { contentsId, pageId });
      if (this.client && !this.announced.has(id)) {
        this.announced.add(id);
        this.send({ method: "Target.targetCreated", params: { targetInfo: info } });
        if (this.autoAttach) void this.attachTarget(id).catch(() => {});
      }
    }
  }

  private async attachTarget(targetId: string): Promise<{ sessionId: string }> {
    if (!this.allowedTargets.has(targetId)) throw new Error("Target is not an Aux tab");
    const attached = await this.root.debugger.sendCommand("Target.attachToTarget", { targetId, flatten: true }) as { sessionId: string };
    this.pageSessions.set(attached.sessionId, targetId);
    this.sessionOwners.set(attached.sessionId, targetId);
    return attached;
  }

  private async handle(socket: WebSocket, raw: string) {
    if (this.client !== socket) return;
    let request: CdpMessage;
    try { request = JSON.parse(raw) as CdpMessage; } catch { socket.close(1003, "Invalid CDP request"); return; }
    const { id, method, sessionId } = request;
    if (typeof id !== "number" || typeof method !== "string") { socket.close(1003, "Invalid CDP request"); return; }
    const params = request.params ?? {};
    try {
      const execute = () => {
        if (this.client !== socket) throw new Error("CDP connection closed");
        return this.execute(method, params, sessionId);
      };
      const queueKey = sessionId ? this.sessionOwners.get(sessionId) ?? sessionId : "root";
      const operation = method.startsWith("Input.") ? (this.inputQueues.get(queueKey) ?? Promise.resolve()).then(execute) : execute();
      if (method.startsWith("Input.")) {
        const tail = operation.then(() => {}, () => {});
        this.inputQueues.set(queueKey, tail);
        void tail.then(() => { if (this.inputQueues.get(queueKey) === tail) this.inputQueues.delete(queueKey); });
      }
      const result = await operation;
      this.reply(socket, { id, result, ...(sessionId ? { sessionId } : {}) });
    } catch (error) {
      this.reply(socket, { id, error: { code: -32000, message: error instanceof Error ? error.message : String(error) }, ...(sessionId ? { sessionId } : {}) });
    }
  }

  private async execute(method: string, params: Record<string, unknown>, sessionId?: string): Promise<unknown> {
    if (this.closed) throw new Error("Runtime capability revoked");
    if (sessionId && this.pageSessions.has(sessionId) && this.allowedTargets.has(this.sessionOwners.get(sessionId) ?? "")) {
      if (method === "Target.getTargetInfo") {
        const targetId = this.pageSessions.get(sessionId)!;
        if (params.targetId && params.targetId !== targetId) throw new Error("Target is not an Aux tab");
      } else if (method === "Target.setAutoAttach") {
        // CDP scopes nested auto-attach to this target. The debugger event
        // handler admits only iframe descendants of an already allowed tab.
        if (params.autoAttach === true && params.flatten !== true) throw new Error("Flat iframe attachment is required");
        return this.root.debugger.sendCommand(method, params, sessionId);
      } else {
        const domain = method.split(".", 1)[0] ?? "";
        if (!PAGE_DOMAINS.has(domain)
          || method === "Network.getAllCookies" || method === "Network.getCookies" || method === "Network.setCookies") throw new Error("CDP method is not page scoped");
      }
      if (method === "Input.dispatchMouseEvent") {
        const captured = params.type === "mouseReleased" || (params.type === "mouseMoved" && Number(params.buttons ?? 0) !== 0)
          ? this.capturedPointerRoute(sessionId, params) : null;
        const route = captured ?? await this.pointerRoute(sessionId, params);
        if (params.type === "mousePressed") this.pointerCapture.set(sessionId, { sessionId: route.sessionId, transforms: route.transforms });
        if (params.type === "mouseReleased") this.pointerCapture.delete(sessionId);
        return this.root.debugger.sendCommand(method, route.params, route.sessionId);
      }
      return this.root.debugger.sendCommand(method, params, sessionId);
    }
    if (sessionId && !this.browserSessions.has(sessionId)) throw new Error("Unknown target session");
    if (method === "Browser.getVersion") return this.root.debugger.sendCommand(method);
    if (method === "Browser.setDownloadBehavior") return {}; // native profile download controller owns downloads
    if (method === "Target.getTargetInfo") {
      if (params.targetId) {
        if (typeof params.targetId !== "string" || !this.allowedTargets.has(params.targetId)) throw new Error("Target is not an Aux tab");
        return { targetInfo: this.allowedTargets.get(params.targetId) };
      }
      // Playwright requests the connection root during initialization. Never
      // reveal the privileged Aux shell WebContents used to carry this broker.
      return { targetInfo: { targetId: "aux-internal-root", type: "browser", title: "Aux", url: "" } };
    }
    if (method === "Target.attachToBrowserTarget") {
      const child = `aux-browser-${randomUUID()}`;
      this.browserSessions.add(child);
      return { sessionId: child };
    }
    if (method === "Target.getTargets") {
      await this.syncTargets();
      const result = await this.root.debugger.sendCommand(method) as { targetInfos: TargetInfo[] };
      return { targetInfos: result.targetInfos.filter(info => this.allowedTargets.has(info.targetId)) };
    }
    if (method === "Target.setDiscoverTargets") return {};
    if (method === "Target.setAutoAttach") {
      this.autoAttach = params.autoAttach === true;
      if (this.autoAttach) for (const id of this.allowedTargets.keys()) await this.attachTarget(id);
      return {};
    }
    if (method === "Target.attachToTarget") {
      if (typeof params.targetId !== "string") throw new Error("Target ID required");
      return this.attachTarget(params.targetId);
    }
    if (method === "Target.activateTarget") {
      if (typeof params.targetId !== "string" || !this.allowedTargets.has(params.targetId)) throw new Error("Target is not an Aux tab");
      return this.root.debugger.sendCommand(method, params);
    }
    if (method === "Target.detachFromTarget") {
      const child = params.sessionId;
      if (typeof child !== "string") throw new Error("Target session required");
      if (this.browserSessions.delete(child)) return {};
      if (!this.pageSessions.has(child)) throw new Error("Unknown target session");
      this.dropSession(child);
      return this.root.debugger.sendCommand(method, { sessionId: child });
    }
    if (method === "Storage.getCookies" && sessionId && this.browserSessions.has(sessionId)) {
      if (params.browserContextId) throw new Error("Other browser contexts are not available");
      const urls = params.urls;
      if (urls !== undefined && (!Array.isArray(urls) || !urls.every(url => typeof url === "string"))) throw new Error("Invalid cookie URLs");
      const source = Array.isArray(urls) && urls.length
        ? (await Promise.all(urls.map(url => this.profile.cookies.get({ url })))).flat()
        : await this.profile.cookies.get({});
      const unique = new Map(source.map(cookie => [`${cookie.domain}\u0000${cookie.path}\u0000${cookie.name}`, cookie]));
      return { cookies: [...unique.values()].map(cookie => ({
        name: cookie.name, value: cookie.value, domain: cookie.domain, path: cookie.path,
        secure: cookie.secure, httpOnly: cookie.httpOnly, sameSite: cookie.sameSite === "no_restriction" ? "None" : cookie.sameSite === "strict" ? "Strict" : cookie.sameSite === "lax" ? "Lax" : undefined,
        expires: cookie.expirationDate ?? -1, session: !cookie.expirationDate,
      })) };
    }
    throw new Error("CDP method is not available through Aux");
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    this.unsubscribe?.();
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.root.debugger.off("message", this.onDebuggerMessage);
    this.root.debugger.off("detach", this.onDebuggerDetach);
    for (const socket of this.server.clients) socket.terminate();
    await new Promise<void>(resolve => this.server.close(() => resolve()));
    if (this.ownsRootDebugger && !this.root.isDestroyed() && this.root.debugger.isAttached()) this.root.debugger.detach();
  }
}
