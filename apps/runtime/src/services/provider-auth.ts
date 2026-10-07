import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { createServer, type Server } from "node:http";
import { AuxError } from "@aux/contracts";

export type ProviderAuthStatus = {
  attemptId: string;
  provider: "openrouter" | "chatgpt" | "vercel";
  phase: "pending" | "authenticating" | "connected" | "cancelled" | "expired" | "failed";
  expiresAt: number;
};
type Attempt = ProviderAuthStatus & {
  owner: string;
  generation: string;
  state: string;
  verifier: string;
  path: string;
  controller: AbortController;
  server: Server;
  timer?: ReturnType<typeof setTimeout>;
  work?: Promise<void>;
  closing?: Promise<void>;
  listenerJoined?: boolean;
  workSettled?: boolean;
};
export interface ProviderAuthDeps {
  generation(): string;
  checkOwner(owner: string, requester?: string): Promise<void>;
  commit(key: string, check: () => Promise<void>): Promise<void>;
  fetch?: typeof fetch;
}

/** OpenRouter issues a user-controlled API key through its official S256 flow. */
export class ProviderAuthService {
  private attempts = new Map<string, Attempt>();
  private closed = false;
  private starting = new Set<Promise<ProviderAuthStatus & { authorizationUrl: string }>>();
  constructor(private deps: ProviderAuthDeps) {}

  start(owner: string): Promise<ProviderAuthStatus & { authorizationUrl: string }> {
    const work = this.startOriginal(owner);
    this.starting.add(work);
    void work.finally(() => this.starting.delete(work)).catch(() => {});
    return work;
  }
  private async startOriginal(owner: string): Promise<ProviderAuthStatus & { authorizationUrl: string }> {
    if (this.closed) throw new AuxError("cancelled", "Provider sign-in is closed.");
    await this.deps.checkOwner(owner);
    if (this.closed) throw new AuxError("cancelled", "Provider sign-in is closed.");
    for (const attempt of this.attempts.values()) this.retire(attempt, "cancelled");
    for (const [id, attempt] of this.attempts)
      if (
        attempt.listenerJoined &&
        (!attempt.work || attempt.workSettled) &&
        ["connected", "cancelled", "expired", "failed"].includes(attempt.phase)
      )
        this.attempts.delete(id);
    if (this.attempts.size >= 16)
      throw new AuxError("backend_unavailable", "Original sign-in cleanup is still pending.");
    const server = createServer();
    const attempt: Attempt = {
      attemptId: randomBytes(32).toString("base64url"),
      provider: "openrouter",
      phase: "pending",
      expiresAt: Date.now() + 5 * 60_000,
      owner,
      generation: this.deps.generation(),
      state: randomBytes(32).toString("base64url"),
      verifier: randomBytes(32).toString("base64url"),
      path: `/callback/${randomBytes(24).toString("base64url")}`,
      controller: new AbortController(),
      server,
    };
    this.attempts.set(attempt.attemptId, attempt);
    server.requestTimeout = 5000;
    server.headersTimeout = 5000;
    server.maxHeadersCount = 16;
    server.on("request", (req, res) => {
      const address = server.address();
      const host = typeof address === "object" && address ? `127.0.0.1:${address.port}` : "";
      const reply = (status: number, text: string) => {
        res.writeHead(status, {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
          "Content-Security-Policy": "default-src 'none'",
          Connection: "close",
        });
        res.end(text);
      };
      if (
        req.method !== "GET" ||
        req.headers.host !== host ||
        (req.url?.length ?? 0) > 8192 ||
        req.headers["transfer-encoding"] ||
        Number(req.headers["content-length"] ?? 0) !== 0
      ) {
        reply(400, "Invalid sign-in callback.");
        return;
      }
      const url = new URL(req.url ?? "/", `http://${host}`);
      const state = url.searchParams.get("state") ?? "";
      const code = url.searchParams.get("code") ?? "";
      if (
        url.pathname !== attempt.path ||
        url.searchParams.getAll("state").length !== 1 ||
        url.searchParams.getAll("code").length !== 1 ||
        !/^[A-Za-z0-9_-]{43}$/.test(state) ||
        state.length !== attempt.state.length ||
        !timingSafeEqual(Buffer.from(state), Buffer.from(attempt.state)) ||
        !code ||
        code.length > 4096 ||
        attempt.phase !== "pending"
      ) {
        reply(400, "Invalid or expired sign-in callback.");
        return;
      }
      attempt.phase = "authenticating";
      reply(200, "Return to Aux to finish connecting OpenRouter.");
      void this.closeListener(attempt);
      attempt.work = this.exchange(attempt, code);
    });
    try {
      await new Promise<void>((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", () => {
          server.removeListener("error", reject);
          resolve();
        });
      });
      await this.check(attempt);
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("Missing callback listener.");
      const url = new URL("https://openrouter.ai/auth");
      url.searchParams.set("callback_url", `http://127.0.0.1:${address.port}${attempt.path}`);
      url.searchParams.set(
        "code_challenge",
        createHash("sha256").update(attempt.verifier).digest("base64url"),
      );
      url.searchParams.set("code_challenge_method", "S256");
      url.searchParams.set("state", attempt.state);
      url.searchParams.set("key_label", "Aux");
      attempt.timer = setTimeout(() => this.retire(attempt, "expired"), 5 * 60_000);
      attempt.timer.unref();
      server.unref();
      return { ...this.public(attempt), authorizationUrl: url.href };
    } catch {
      this.retire(attempt, "failed");
      await this.closeListener(attempt, true);
      attempt.listenerJoined = true;
      throw new AuxError("backend_unavailable", "OpenRouter sign-in could not start.");
    }
  }

  async status(id: string, owner: string): Promise<ProviderAuthStatus> {
    const attempt = this.get(id);
    await this.deps.checkOwner(attempt.owner, owner);
    if (attempt.phase === "pending" || attempt.phase === "authenticating") {
      try {
        await this.check(attempt);
      } catch {
        this.retire(attempt, "cancelled");
      }
    }
    return this.public(attempt);
  }
  async cancel(id: string, owner: string): Promise<ProviderAuthStatus> {
    const attempt = this.get(id);
    await this.deps.checkOwner(attempt.owner, owner);
    this.retire(attempt, "cancelled");
    await attempt.work;
    await this.closeListener(attempt, true);
    return this.public(attempt);
  }
  invalidate(): void {
    for (const attempt of this.attempts.values()) this.retire(attempt, "cancelled");
  }
  async close(): Promise<void> {
    this.closed = true;
    for (const attempt of this.attempts.values()) this.retire(attempt, "cancelled");
    await Promise.allSettled(this.starting);
    await Promise.all(
      [...this.attempts.values()].map(async (attempt) => {
        await attempt.work;
        await this.closeListener(attempt, true);
      }),
    );
  }
  private get(id: string): Attempt {
    const attempt = this.attempts.get(id);
    if (!attempt) throw new AuxError("not_found", "The original sign-in attempt is unavailable.");
    return attempt;
  }
  private public(a: Attempt): ProviderAuthStatus {
    return { attemptId: a.attemptId, provider: a.provider, phase: a.phase, expiresAt: a.expiresAt };
  }
  private async check(a: Attempt): Promise<void> {
    if (
      this.closed ||
      a.controller.signal.aborted ||
      Date.now() >= a.expiresAt ||
      this.deps.generation() !== a.generation
    )
      throw new AuxError("cancelled", "The original sign-in connection changed.");
    await this.deps.checkOwner(a.owner);
    if (
      this.closed ||
      a.controller.signal.aborted ||
      Date.now() >= a.expiresAt ||
      this.deps.generation() !== a.generation
    )
      throw new AuxError("cancelled", "The original sign-in connection changed.");
  }
  private retire(a: Attempt, phase: "cancelled" | "expired" | "failed"): void {
    if (["connected", "cancelled", "expired", "failed"].includes(a.phase)) return;
    a.phase = phase;
    a.controller.abort();
    a.verifier = "";
    a.state = "";
    clearTimeout(a.timer);
    void this.closeListener(a, true);
  }
  private closeListener(a: Attempt, force = false): Promise<void> {
    if (force) a.server.closeAllConnections();
    if (a.closing) return a.closing;
    // A pending listen is joined by startOriginal; after it settles that owner
    // calls here again. Never treat a not-yet-open server as a closed listener.
    if (!a.server.listening) return Promise.resolve();
    a.closing = new Promise<void>((resolve, reject) => {
      a.server.close((error) => {
        if (error) reject(error);
        else {
          a.listenerJoined = true;
          resolve();
        }
      });
      if (force) a.server.closeAllConnections();
    });
    // Retirement initiates reduction synchronously; cancel/close owns its ACK.
    void a.closing.catch(() => {});
    return a.closing;
  }
  private async exchange(a: Attempt, code: string): Promise<void> {
    try {
      await this.check(a);
      const signal = AbortSignal.any([a.controller.signal, AbortSignal.timeout(15_000)]);
      const response = await (this.deps.fetch ?? fetch)("https://openrouter.ai/api/v1/auth/keys", {
        method: "POST",
        redirect: "error",
        signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, code_verifier: a.verifier, code_challenge_method: "S256" }),
      });
      if (!response.ok || !response.body) throw new Error("Key exchange refused.");
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let bytes = 0;
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          bytes += value.byteLength;
          if (bytes > 65536) throw new Error("Key exchange response too large.");
          chunks.push(value);
        }
      } finally {
        await reader.cancel().catch(() => {});
      }
      const value: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      const key = value && typeof value === "object" && "key" in value ? value.key : undefined;
      if (typeof key !== "string" || !key.trim() || key.length > 16384 || /[\r\n]/.test(key))
        throw new Error("Invalid account key.");
      await this.check(a);
      await this.deps.commit(key, () => this.check(a));
      a.phase = "connected";
      clearTimeout(a.timer);
    } catch {
      this.retire(a, a.controller.signal.aborted ? "cancelled" : "failed");
    } finally {
      a.workSettled = true;
      a.verifier = "";
      a.state = "";
    }
  }
}
