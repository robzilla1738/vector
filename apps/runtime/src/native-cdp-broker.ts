import { randomBytes, randomUUID } from "node:crypto";
import { chmodSync, mkdtempSync, rmSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { WebSocket, WebSocketServer } from "ws";
import {
  NativeCdpCatalogSchema,
  NativeCdpAttachedSchema,
  NativeCdpStartNavigationSchema,
  NativeCdpNavigationStartedSchema,
  NativeCdpNavigationStateSchema,
  NativeCdpNavigationReceiptSchema,
  type NativeCdpNavigationReceipt,
  type EgressLease,
  type RpcChannel,
} from "@aux/contracts";
import type { BrowserEgress } from "./safety/browser-egress.js";
type CdpAuthority = ReturnType<BrowserEgress["captureCdpAuthority"]>;
type AuthorityFactory = (pageId: string, lease: EgressLease) => CdpAuthority;

type Target = {
  targetId: string;
  type: "page";
  title: string;
  url: string;
  attached: boolean;
  browserContextId: string;
};
type Request = { id: number; method: string; params: Record<string, unknown>; sessionId?: string };
type Pending = {
  id: number;
  sessionId: string;
  pageId: string;
  attachmentId: string;
  autoAttach?: { targetId: string; enabled: boolean; events: unknown[] };
};
type Navigation = {
  pageId: string;
  attachmentId: string;
  leaseId: string;
  commandId: number;
  expiresAt: number;
  deadlineAt: number;
  started: boolean;
  ready: boolean;
  taking: boolean;
  signal: AbortSignal;
  timer: ReturnType<typeof setTimeout>;
  abort: () => void;
  resolve: (receipt: NativeCdpNavigationReceipt) => void;
  reject: (error: Error) => void;
};
type Attachment = { id: string; authority: CdpAuthority };

const CONTEXT_ID = "aux-profile";
const MAX_MESSAGE_BYTES = 1024 * 1024;
const MAX_NATIVE_EVENT_BYTES = 16 * 1024 * 1024;
const PAGE_DOMAINS = new Set([
  "Page",
  "Runtime",
  "DOM",
  "DOMSnapshot",
  "Accessibility",
  "Input",
  "Emulation",
  "Log",
  "CSS",
  "Performance",
  "Overlay",
  "IO",
  "Network",
  "Fetch",
]);

function pageMethodAllowed(method: string): boolean {
  const [domain, command] = method.split(".");
  if (!domain || !command || !PAGE_DOMAINS.has(domain)) return false;
  if (
    domain === "Network" &&
    /^(get(All)?Cookies|setCookies?|deleteCookies?|clearBrowserCookies)$/.test(command)
  )
    return false;
  return true;
}

/**
 * Playwright's local CDP facade. The Unix socket is inside Chromium's private
 * Profile directory, with a separate unguessable WebSocket path. Every target
 * comes from native.cdpCatalog; native.cdpDispatch repeats original lease checks.
 */
export class NativeCdpBroker {
  private readonly socketDirectory: string;
  private readonly ownsSocketDirectory: boolean;
  private readonly socketPath: string;
  private readonly path = `/aux-cdp/${randomBytes(32).toString("hex")}`;
  private readonly server: Server = createServer();
  private readonly ws = new WebSocketServer({
    server: this.server,
    path: this.path,
    maxPayload: MAX_MESSAGE_BYTES,
  });
  private readonly targets = new Map<string, { pageId: string; lease: EgressLease; info: Target }>();
  private readonly sessions = new Map<string, string>();
  private readonly attachments = new Map<string, Attachment>();
  private readonly childOwners = new Map<string, string>();
  private readonly autoAttachSessions = new Map<string, string>();
  private readonly browserSessions = new Set<string>();
  private readonly pending = new Map<number, Pending>();
  private readonly navigationDeadlines = new WeakMap<NativeCdpNavigationReceipt, number>();
  private readonly navigations = new Map<number, Navigation>();
  private nextNativeId = 1;
  private client: WebSocket | null = null;
  private nativeReset: Promise<void> = Promise.resolve();
  private refreshQueue: Promise<void> = Promise.resolve();
  private attachmentQueue: Promise<void> = Promise.resolve();
  private autoAttach = false;
  private discover = false;
  private closed = false;

  private constructor(
    private readonly channel: RpcChannel,
    private readonly authorityFactory: AuthorityFactory,
    socketDirectory?: string,
  ) {
    this.ownsSocketDirectory = !socketDirectory;
    this.socketDirectory =
      socketDirectory ?? mkdtempSync(join(process.platform === "win32" ? tmpdir() : "/tmp", "aux-cdp-"));
    chmodSync(this.socketDirectory, 0o700);
    this.socketPath = join(this.socketDirectory, `c-${randomBytes(4).toString("hex")}.s`);
    channel.onNotify((type, payload) => {
      if (type === "native.cdpNavigationState") this.navigationState(payload);
      if (type === "native.cdpMessage") this.forwardNative(payload);
      if (type === "native.tabsChanged" || type === "native.cdpAuthorityChanged") {
        void this.refresh().catch((error: unknown) => {
          console.error("Aux CDP target catalog refresh failed:", error);
        });
      }
    });
  }

  static async start(
    channel: RpcChannel,
    authorityFactory: AuthorityFactory,
    socketDirectory?: string,
  ): Promise<NativeCdpBroker> {
    const broker = new NativeCdpBroker(channel, authorityFactory, socketDirectory);
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
    // Native protocol domains retain enabled state until the attachment is
    // detached. A fresh Playwright client needs their initial state events.
    const ready = this.resetNativeSessions();
    void ready.catch(() => socket.close(1011, "Native CDP reset failed"));
    socket.on("message", (raw) => {
      void ready
        .then(() => {
          if (socket === this.client) return this.handle(socket, String(raw));
        })
        .catch(() => socket.close(1011, "Native CDP reset failed"));
    });
    socket.once("close", () => {
      if (this.client !== socket) return;
      this.client = null;
      this.refuseNavigations("Original CDP connection closed");
      if (!this.closed)
        void this.resetNativeSessions().catch(() => {
          // A later connection retries the reset before accepting any command.
        });
      this.sessions.clear();
      this.attachments.clear();
      this.childOwners.clear();
      this.autoAttachSessions.clear();
      this.browserSessions.clear();
      this.pending.clear();
      this.targets.clear();
      this.autoAttach = false;
      this.discover = false;
    });
  };

  /** Fixed native navigation; a returned receipt does not authorize the replacement driver. */
  async navigateControlled(
    pageId: string,
    url: string,
    signal: AbortSignal,
  ): Promise<NativeCdpNavigationReceipt> {
    if (this.closed || signal.aborted || !this.client)
      throw new Error("Original navigation caller is unavailable");
    if (
      this.navigations.size >= 128 ||
      [...this.navigations.values()].some((value) => value.pageId === pageId)
    )
      throw new Error("Original page navigation is already pending");
    const session = [...this.sessions].find(
      ([id, target]) =>
        !this.childOwners.has(id) &&
        this.targets.get(target)?.pageId === pageId &&
        this.attachments.get(id)?.authority.current(),
    );
    const attachment = session ? this.attachments.get(session[0]) : undefined;
    if (!attachment || !attachment.authority.current())
      throw new Error("Original acknowledged page attachment is unavailable");
    const commandId = this.nextNativeId++;
    const expiresAt = attachment.authority.acknowledgedExpiresAt();
    const request = NativeCdpStartNavigationSchema.parse({
      pageId,
      url,
      commandId,
      attachmentId: attachment.id,
      acknowledgedExpiresAt: expiresAt,
    });
    if (expiresAt <= Date.now()) throw new Error("Original navigation acknowledgement expired");
    const deadlineAt = Math.min(Date.now() + 8000, expiresAt);
    return new Promise<NativeCdpNavigationReceipt>((resolve, reject) => {
      const abort = () => this.finishNavigation(commandId, new Error("Original navigation caller aborted"));
      const timer = setTimeout(
        () => this.finishNavigation(commandId, new Error("Original navigation receipt deadline expired")),
        Math.max(0, deadlineAt - Date.now()),
      );
      const pending: Navigation = {
        pageId,
        attachmentId: attachment.id,
        leaseId: attachment.authority.lease.leaseId,
        commandId,
        expiresAt,
        deadlineAt,
        signal,
        timer,
        abort,
        started: false,
        ready: false,
        taking: false,
        resolve,
        reject,
      };
      this.navigations.set(commandId, pending);
      signal.addEventListener("abort", abort, { once: true });
      if (signal.aborted) {
        abort();
        return;
      }
      // START returns only dispatch ACK. Waiting here leaves the native Worker free
      // to process the real egress/approval RPC that permits the navigation.
      void this.channel
        .call("native.cdpStartNavigation", request, 8000)
        .then((result) => {
          NativeCdpNavigationStartedSchema.parse(result);
          if (this.navigations.get(commandId) !== pending) return;
          pending.started = true;
          this.takeNavigation(pending);
        })
        .catch((error: unknown) =>
          this.finishNavigation(
            commandId,
            error instanceof Error ? error : new Error("Original native navigation start failed"),
          ),
        );
    });
  }

  private navigationState(payload: unknown): void {
    const parsed = NativeCdpNavigationStateSchema.safeParse(payload);
    if (!parsed.success) return;
    const state = parsed.data,
      pending = this.navigations.get(state.commandId);
    if (
      !pending ||
      pending.pageId !== state.pageId ||
      pending.attachmentId !== state.attachmentId ||
      pending.leaseId !== state.leaseId
    )
      return;
    if (state.state === "refused") {
      this.finishNavigation(state.commandId, new Error("Original native navigation authority retired"));
      return;
    }
    pending.ready = true;
    this.takeNavigation(pending);
  }

  private takeNavigation(pending: Navigation): void {
    if (
      !pending.started ||
      !pending.ready ||
      pending.taking ||
      this.navigations.get(pending.commandId) !== pending
    )
      return;
    pending.taking = true;
    void this.channel
      .call(
        "native.cdpTakeNavigationReceipt",
        {
          pageId: pending.pageId,
          attachmentId: pending.attachmentId,
          commandId: pending.commandId,
        },
        8000,
      )
      .then((result) => {
        const receipt = NativeCdpNavigationReceiptSchema.parse(result);
        if (
          receipt.originalAttachmentId !== pending.attachmentId ||
          receipt.originalLeaseId !== pending.leaseId ||
          receipt.commandId !== pending.commandId ||
          receipt.context.tabId !== pending.pageId
        )
          throw new Error("Native navigation receipt does not match the original command");
        this.finishNavigation(pending.commandId, undefined, receipt);
      })
      .catch((error: unknown) =>
        this.finishNavigation(
          pending.commandId,
          error instanceof Error ? error : new Error("Original native navigation receipt failed"),
        ),
      );
  }

  private finishNavigation(commandId: number, error?: Error, receipt?: NativeCdpNavigationReceipt): void {
    const pending = this.navigations.get(commandId);
    if (!pending) return;
    this.navigations.delete(commandId);
    clearTimeout(pending.timer);
    pending.signal.removeEventListener("abort", pending.abort);
    if (
      error ||
      !receipt ||
      this.closed ||
      pending.signal.aborted ||
      Math.min(pending.expiresAt, pending.deadlineAt) <= Date.now()
    )
      pending.reject(error ?? new Error("Original navigation receipt expired or retired"));
    else {
      this.navigationDeadlines.set(receipt, pending.deadlineAt);
      pending.resolve(receipt);
    }
  }

  navigationDeadline(receipt: NativeCdpNavigationReceipt): number {
    const deadline = this.navigationDeadlines.get(receipt);
    this.navigationDeadlines.delete(receipt);
    if (deadline === undefined || deadline <= Date.now())
      throw new Error("Original navigation receipt deadline is unavailable or expired");
    return deadline;
  }

  private refuseNavigations(reason: string): void {
    for (const id of this.navigations.keys()) this.finishNavigation(id, new Error(reason));
  }

  private resetNativeSessions(): Promise<void> {
    this.nativeReset = this.nativeReset
      .catch(() => {})
      .then(async () => {
        await this.channel.call("native.cdpReset", {});
      });
    return this.nativeReset;
  }

  private send(payload: unknown): void {
    if (this.client?.readyState === WebSocket.OPEN) this.client.send(JSON.stringify(payload));
  }

  private reply(request: Request, result: unknown): void {
    this.send({ id: request.id, result, ...(request.sessionId ? { sessionId: request.sessionId } : {}) });
  }

  private fail(request: Request, error: unknown): void {
    this.send({
      id: request.id,
      error: { code: -32000, message: error instanceof Error ? error.message : String(error) },
      ...(request.sessionId ? { sessionId: request.sessionId } : {}),
    });
  }

  private notify(method: string, params: Record<string, unknown>): void {
    this.send({ method, params });
  }

  private async refresh(): Promise<void> {
    const work = this.refreshQueue.then(async () => {
      const client = this.client;
      if (!client || this.closed) return;
      const previous = new Set(this.targets.keys());
      const snapshot = NativeCdpCatalogSchema.parse(await this.channel.call("native.cdpCatalog", {}, 10_000));
      if (this.client !== client || this.closed) return;
      const next = new Map<string, { pageId: string; lease: EgressLease; info: Target }>();
      for (const page of snapshot.pages) {
        if (!page.cdpTargetId || !/^(https?:|about:blank$)/.test(page.url)) continue;
        next.set(page.cdpTargetId, {
          pageId: page.pageId,
          lease: page.lease,
          info: {
            targetId: page.cdpTargetId,
            type: "page",
            title: page.title,
            url: page.url,
            attached: [...this.sessions.values()].includes(page.cdpTargetId),
            browserContextId: CONTEXT_ID,
          },
        });
      }
      for (const [id, old] of this.targets)
        if (
          !next.has(id) ||
          old.lease.leaseId !== next.get(id)?.lease.leaseId ||
          [...this.sessions].some(
            ([session, target]) => target === id && !this.attachments.get(session)?.authority.current(),
          )
        ) {
          for (const [sessionId, targetId] of this.sessions)
            if (targetId === id) {
              this.sessions.delete(sessionId);
              this.attachments.delete(sessionId);
              if (!this.childOwners.delete(sessionId))
                this.notify("Target.detachedFromTarget", { sessionId, targetId: id });
            }
          previous.delete(id);
          const replacement = next.get(id);
          if (replacement) replacement.info.attached = false;
          this.autoAttachSessions.delete(id);
          if (this.discover) this.notify("Target.targetDestroyed", { targetId: id });
          for (const [nativeId, pending] of this.pending)
            if (pending.pageId === old.pageId) this.pending.delete(nativeId);
        }
      this.targets.clear();
      for (const [id, value] of next) this.targets.set(id, value);
      for (const [id, value] of next)
        if (!previous.has(id)) {
          if (this.discover) this.notify("Target.targetCreated", { targetInfo: value.info });
          if (this.autoAttach) await this.attach(id, true);
        }
    });
    this.refreshQueue = work.catch(() => {});
    return work;
  }

  private sessionsHasTarget(targetId: string): boolean {
    return [...this.sessions.values()].includes(targetId);
  }

  private attach(targetId: string, automatic: boolean): Promise<string> {
    const work = this.attachmentQueue.then(() => this.attachAcknowledged(targetId, automatic));
    this.attachmentQueue = work.then(
      () => {},
      () => {},
    );
    return work;
  }

  private async attachAcknowledged(targetId: string, automatic: boolean): Promise<string> {
    const target = this.targets.get(targetId);
    if (!target) throw new Error("Target is not an Aux tab in this Profile");
    const authority = this.authorityFactory(target.pageId, target.lease);
    const client = this.client;
    const existing = [...this.sessions].find(
      ([session, id]) =>
        id === targetId &&
        !this.childOwners.has(session) &&
        this.attachments.get(session)?.authority.current(),
    );
    const original = existing ? this.attachments.get(existing[0]) : undefined;
    const { attachmentId } = original
      ? { attachmentId: original.id }
      : NativeCdpAttachedSchema.parse(
          await this.channel.call(
            "native.cdpAttach",
            {
              pageId: target.pageId,
              leaseId: authority.lease.leaseId,
              acknowledgedExpiresAt: authority.acknowledgedExpiresAt(),
            },
            10_000,
          ),
        );
    if (
      this.closed ||
      !client ||
      client !== this.client ||
      this.targets.get(targetId) !== target ||
      !authority.current()
    )
      throw new Error("Original CDP attachment authority changed during native acknowledgement");
    const sessionId = `aux-page-${randomUUID()}`;
    this.attachments.set(sessionId, { id: attachmentId, authority: original?.authority ?? authority });
    this.sessions.set(sessionId, targetId);
    target.info.attached = true;
    if (automatic)
      this.notify("Target.attachedToTarget", {
        sessionId,
        targetInfo: target.info,
        waitingForDebugger: false,
      });
    return sessionId;
  }

  private forwardNative(payload: unknown): void {
    if (!payload || typeof payload !== "object") return;
    const event = payload as { pageId?: unknown; message?: unknown };
    if (
      typeof event.pageId !== "string" ||
      typeof event.message !== "string" ||
      event.message.length > MAX_NATIVE_EVENT_BYTES
    )
      return;
    let message: Record<string, unknown>;
    try {
      message = JSON.parse(event.message) as Record<string, unknown>;
    } catch {
      return;
    }
    const attachmentId = message.auxAttachmentId;
    if (typeof attachmentId !== "string") return;
    delete message.auxAttachmentId;
    delete message.auxNavigationCommandId;
    if (typeof message.id === "number") {
      const pending = this.pending.get(message.id);
      if (
        !pending ||
        pending.pageId !== event.pageId ||
        pending.attachmentId !== attachmentId ||
        !this.attachments.get(pending.sessionId)?.authority.current()
      )
        return;
      this.pending.delete(message.id);
      if (pending.autoAttach && !message.error) {
        if (pending.autoAttach.enabled)
          this.autoAttachSessions.set(pending.autoAttach.targetId, pending.sessionId);
        else this.autoAttachSessions.delete(pending.autoAttach.targetId);
        for (const event of pending.autoAttach.events) this.forwardNative(event);
      }
      this.send({ ...message, id: pending.id, sessionId: pending.sessionId });
      return;
    }
    const nativeSession = typeof message.sessionId === "string" ? message.sessionId : undefined;
    if (message.method === "Target.attachedToTarget") {
      const params = message.params as { sessionId?: unknown } | undefined;
      const child = params?.sessionId;
      const targetId = [...this.targets].find(([, value]) => value.pageId === event.pageId)?.[0];
      const parent = nativeSession ?? (targetId ? this.autoAttachSessions.get(targetId) : undefined);
      if (typeof child !== "string" || !targetId) return;
      const admitting = [...this.pending.values()].find(
        (pending) =>
          pending.attachmentId === attachmentId &&
          pending.pageId === event.pageId &&
          pending.autoAttach?.targetId === targetId &&
          pending.autoAttach.enabled,
      );
      if (admitting?.autoAttach) {
        if (admitting.autoAttach.events.length >= 128) return;
        admitting.autoAttach.events.push(payload);
        return;
      }
      if (!parent || !this.sessions.has(parent)) return;
      const attachment = this.attachments.get(parent);
      if (!attachment || attachment.id !== attachmentId || !attachment.authority.current()) return;
      this.sessions.set(child, targetId);
      this.attachments.set(child, attachment);
      this.childOwners.set(child, parent);
      this.send({ ...message, sessionId: parent });
      return;
    }
    if (message.method === "Target.detachedFromTarget") {
      const params = message.params as { sessionId?: unknown } | undefined;
      const child = params?.sessionId;
      if (typeof child !== "string") return;
      const parent = nativeSession ?? this.childOwners.get(child);
      if (this.attachments.get(child)?.id !== attachmentId) return;
      this.sessions.delete(child);
      this.attachments.delete(child);
      this.childOwners.delete(child);
      if (parent && this.sessions.has(parent)) this.send({ ...message, sessionId: parent });
      return;
    }
    if (nativeSession) {
      const attachment = this.attachments.get(nativeSession);
      if (
        this.childOwners.has(nativeSession) &&
        attachment?.id === attachmentId &&
        attachment.authority.current()
      )
        this.send(message);
      return;
    }
    for (const [sessionId, targetId] of this.sessions) {
      if (
        !this.childOwners.has(sessionId) &&
        this.targets.get(targetId)?.pageId === event.pageId &&
        this.attachments.get(sessionId)?.id === attachmentId &&
        this.attachments.get(sessionId)?.authority.current()
      )
        this.send({ ...message, sessionId });
    }
  }

  private async handle(socket: WebSocket, raw: string): Promise<void> {
    if (socket !== this.client) return;
    let request: Request;
    try {
      const parsed = JSON.parse(raw) as Partial<Request>;
      if (
        !Number.isSafeInteger(parsed.id) ||
        typeof parsed.method !== "string" ||
        (parsed.sessionId !== undefined && typeof parsed.sessionId !== "string") ||
        (parsed.params !== undefined &&
          (!parsed.params || typeof parsed.params !== "object" || Array.isArray(parsed.params)))
      )
        throw new Error();
      request = {
        id: parsed.id!,
        method: parsed.method,
        params: parsed.params ?? {},
        sessionId: parsed.sessionId,
      };
    } catch {
      socket.close(1003, "Invalid CDP request");
      return;
    }
    try {
      const result = await this.execute(request, socket);
      if (socket !== this.client) return;
      if (result !== null) this.reply(request, result);
    } catch (error) {
      if (socket === this.client) this.fail(request, error);
    }
  }

  private async execute(request: Request, socket: WebSocket): Promise<unknown | null> {
    const { method, params, sessionId } = request;
    const refreshCurrent = async () => {
      await this.refresh();
      if (socket !== this.client) throw new Error("CDP connection closed");
    };
    if (sessionId && this.sessions.has(sessionId)) {
      const targetId = this.sessions.get(sessionId)!;
      let target = this.targets.get(targetId);
      if (!target) {
        await refreshCurrent();
        target = this.targets.get(targetId);
      }
      if (!target) throw new Error("Target is not an Aux tab in this Profile");
      if (method === "Target.getTargetInfo") {
        if (params.targetId && params.targetId !== targetId) throw new Error("Target is not an Aux tab");
        return { targetInfo: target.info };
      }
      const attachment = this.attachments.get(sessionId);
      if (!attachment?.authority.current()) throw new Error("Original CDP attachment authority retired");
      if (method === "Target.setAutoAttach") {
        if (
          [...this.pending.values()].some(
            (pending) => pending.attachmentId === attachment.id && pending.autoAttach,
          )
        )
          throw new Error("Original CDP auto-attachment acknowledgement is pending");
      } else if (method === "Target.detachFromTarget") {
        if (typeof params.sessionId !== "string" || this.childOwners.get(params.sessionId) !== sessionId)
          throw new Error("Iframe session is not owned by this page");
      } else if (!pageMethodAllowed(method)) throw new Error("CDP method is not page scoped");
      const nativeId = this.nextNativeId++;
      this.pending.set(nativeId, {
        id: request.id,
        sessionId,
        pageId: target.pageId,
        attachmentId: attachment.id,
        ...(method === "Target.setAutoAttach"
          ? { autoAttach: { targetId, enabled: params.autoAttach === true, events: [] } }
          : {}),
      });
      try {
        await this.channel.call(
          "native.cdpDispatch",
          {
            pageId: target.pageId,
            attachmentId: attachment.id,
            acknowledgedExpiresAt: attachment.authority.acknowledgedExpiresAt(),
            message: JSON.stringify({
              id: nativeId,
              method,
              params,
              ...(this.childOwners.has(sessionId) ? { sessionId } : {}),
            }),
          },
          10_000,
        );
      } catch (error) {
        this.pending.delete(nativeId);
        throw error;
      }
      return null; // Native protocol response arrives as native.cdpMessage.
    }
    if (sessionId && !this.browserSessions.has(sessionId)) throw new Error("Unknown CDP session");
    if (method === "Browser.getVersion") {
      const { version } = await this.channel.call<{ version: string }>("native.cdpVersion", {});
      return {
        protocolVersion: "1.3",
        product: `Chrome/${version}`,
        revision: "Aux",
        userAgent: `Mozilla/5.0 (${process.platform === "darwin" ? "Macintosh" : "X11; Linux x86_64"}) AppleWebKit/537.36 Chrome/${version} Safari/537.36`,
        jsVersion: "",
      };
    }
    if (method === "Browser.setDownloadBehavior") {
      if (params.browserContextId && params.browserContextId !== CONTEXT_ID)
        throw new Error("Other browser contexts are not available");
      return {}; // Chromium's Profile download controller remains authoritative.
    }
    if (method === "Target.getTargetInfo") {
      if (!params.targetId)
        return { targetInfo: { targetId: "aux-internal-root", type: "browser", title: "Aux", url: "" } };
      await refreshCurrent();
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
      await refreshCurrent();
      return { targetInfos: [...this.targets.values()].map((value) => value.info) };
    }
    if (method === "Target.setDiscoverTargets") {
      await refreshCurrent();
      this.discover = params.discover === true;
      if (this.discover)
        for (const { info } of this.targets.values())
          this.notify("Target.targetCreated", { targetInfo: info });
      return {};
    }
    if (method === "Target.setAutoAttach") {
      this.autoAttach = params.autoAttach === true;
      await refreshCurrent();
      if (this.autoAttach)
        for (const id of this.targets.keys()) if (!this.sessionsHasTarget(id)) await this.attach(id, true);
      return {};
    }
    if (method === "Target.attachToTarget") {
      await refreshCurrent();
      if (typeof params.targetId !== "string") throw new Error("Target ID required");
      return { sessionId: await this.attach(params.targetId, false) };
    }
    if (method === "Target.detachFromTarget") {
      if (typeof params.sessionId !== "string") throw new Error("Target session required");
      if (this.browserSessions.delete(params.sessionId)) return {};
      const targetId = this.sessions.get(params.sessionId);
      if (!targetId) throw new Error("Unknown target session");
      this.sessions.delete(params.sessionId);
      this.attachments.delete(params.sessionId);
      this.childOwners.delete(params.sessionId);
      if (this.autoAttachSessions.get(targetId) === params.sessionId)
        this.autoAttachSessions.delete(targetId);
      // A browser-level CDP session owns this explicit attachment. Reporting
      // its detach on the root session makes Playwright discard the tab's
      // independent auto-attached page session during navigation.
      this.send({
        method: "Target.detachedFromTarget",
        params: { sessionId: params.sessionId, targetId },
        ...(sessionId ? { sessionId } : {}),
      });
      return {};
    }
    if (method === "Target.activateTarget") {
      await refreshCurrent();
      const target = this.targets.get(String(params.targetId));
      if (!target) throw new Error("Target is not an Aux tab in this Profile");
      return this.channel.call("native.focusPage", { pageId: target.pageId });
    }
    throw new Error("CDP method is not available through Aux");
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    this.refuseNavigations("Original CDP broker closed");
    this.client?.terminate();
    this.ws.close();
    if (this.server.listening) await new Promise<void>((resolve) => this.server.close(() => resolve()));
    rmSync(this.socketPath, { force: true });
    if (this.ownsSocketDirectory) rmSync(this.socketDirectory, { recursive: true, force: true });
  }
}
