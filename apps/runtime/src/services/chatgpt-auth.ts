import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { createServer, type Server } from "node:http";
import { AuxError } from "@aux/contracts";
import { z } from "zod";
import type { ProviderAuthDeps, ProviderAuthStatus } from "./provider-auth.js";
import {
  authJson,
  chatgptAccountId,
  chatgptTokens,
  CHATGPT_ISSUER,
  CHATGPT_RESOURCE,
  CHATGPT_TOKEN_ENDPOINT,
  type ChatgptAccount,
  type ChatgptAccounts,
} from "./chatgpt-account.js";

type Attempt = ProviderAuthStatus & {
  owner: string;
  generation: string;
  state: string;
  nonce: string;
  verifier: string;
  redirectUri: string;
  account?: ChatgptAccount;
  server: Server;
  listening?: Promise<void>;
  listenerClose?: Promise<void>;
  listenerJoined?: boolean;
  listenerFailure?: unknown;
  forceClose?: boolean;
  controller: AbortController;
  timer?: ReturnType<typeof setTimeout>;
  work?: Promise<void>;
  cleanupFailure?: AggregateError;
  settled?: boolean;
};
export interface ChatgptAuthDeps extends Pick<ProviderAuthDeps, "generation" | "checkOwner" | "fetch"> {
  accounts: ChatgptAccounts;
  hostId: string;
  activate(
    account: ChatgptAccount,
    check: () => Promise<void>,
    signal: AbortSignal,
  ): Promise<{
    generation: string;
    rollback(): Promise<void>;
  }>;
}

/** Public local-client registration: the callback's issued ID is never replaced by a borrowed client. */
export class ChatgptAuthService {
  private attempts = new Map<string, Attempt>();
  private closed = false;
  private starts = new Set<Promise<ProviderAuthStatus & { authorizationUrl: string }>>();
  private closing?: Promise<void>;
  constructor(private deps: ChatgptAuthDeps) {}
  has(id: string): boolean {
    return this.attempts.has(id);
  }
  start(owner: string, accountId?: string): Promise<ProviderAuthStatus & { authorizationUrl: string }> {
    if (this.closed) return Promise.reject(new AuxError("cancelled", "Sign-in is closed."));
    const work = Promise.resolve().then(() => this.begin(owner, accountId));
    this.starts.add(work);
    void work.then(
      () => this.starts.delete(work),
      () => this.starts.delete(work),
    );
    return work;
  }
  private async begin(
    owner: string,
    accountId?: string,
  ): Promise<ProviderAuthStatus & { authorizationUrl: string }> {
    if (this.closed) throw new AuxError("cancelled", "Sign-in is closed.");
    await this.deps.checkOwner(owner);
    if (this.closed) throw new AuxError("cancelled", "Sign-in is closed.");
    this.invalidate();
    while (this.attempts.size >= 16) {
      const retired = [...this.attempts.values()].find(
        (attempt) =>
          !attempt.cleanupFailure &&
          !attempt.listenerFailure &&
          attempt.listenerJoined &&
          (!attempt.work || attempt.settled),
      );
      if (!retired) throw new AuxError("conflict", "ChatGPT sign-in cleanup requires reconciliation.");
      this.attempts.delete(retired.attemptId);
    }
    const account = accountId ? this.deps.accounts.account(accountId) : undefined;
    const a: Attempt = {
      attemptId: randomBytes(32).toString("base64url"),
      provider: "chatgpt",
      phase: "pending",
      expiresAt: Date.now() + 300_000,
      owner,
      generation: this.deps.generation(),
      state: randomBytes(32).toString("base64url"),
      nonce: randomBytes(32).toString("base64url"),
      verifier: randomBytes(32).toString("base64url"),
      redirectUri: "",
      account,
      server: createServer(),
      controller: new AbortController(),
    };
    this.attempts.set(a.attemptId, a);
    a.server.requestTimeout = 5000;
    a.server.headersTimeout = 5000;
    a.server.maxHeadersCount = 16;
    a.server.on("request", (req, res) => {
      const address = a.server.address(),
        host = typeof address === "object" && address ? `127.0.0.1:${address.port}` : "";
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
      const url = new URL(req.url ?? "/", `http://${host}`),
        state = url.searchParams.get("state") ?? "";
      if (
        url.pathname !== "/auth/callback" ||
        url.searchParams.getAll("state").length !== 1 ||
        !/^[A-Za-z0-9_-]{43}$/.test(state) ||
        state.length !== a.state.length ||
        !timingSafeEqual(Buffer.from(state), Buffer.from(a.state)) ||
        a.phase !== "pending"
      ) {
        reply(400, "Invalid or expired sign-in callback.");
        return;
      }
      if (url.searchParams.has("error")) {
        reply(400, "ChatGPT sign-in was not authorized.");
        this.retire(a, "failed");
        return;
      }
      const code = url.searchParams.get("code") ?? "",
        id = url.searchParams.get("client_id") ?? account?.clientId;
      if (
        !code ||
        code.length > 4096 ||
        url.searchParams.getAll("code").length !== 1 ||
        url.searchParams.getAll("client_id").length > 1 ||
        !id ||
        !/^oaiapp_[A-Za-z0-9_-]{1,492}$/.test(id) ||
        (account && id !== account.clientId)
      ) {
        reply(400, "The issued ChatGPT registration is invalid.");
        return;
      }
      a.phase = "authenticating";
      reply(200, "Return to Aux to finish signing in.");
      void this.closeListener(a).catch(() => {});
      a.work = this.exchange(a, code, id).finally(() => {
        a.settled = true;
      });
    });
    try {
      a.listening = new Promise<void>((resolve, reject) => {
        a.server.once("error", reject);
        a.server.listen(0, "127.0.0.1", () => {
          a.server.off("error", reject);
          resolve();
        });
      });
      await a.listening;
      await this.check(a);
      const address = a.server.address();
      if (!address || typeof address === "string") throw new Error("Callback unavailable.");
      a.redirectUri = `http://127.0.0.1:${address.port}/auth/callback`;
      a.server.unref();
      a.timer = setTimeout(() => this.retire(a, "expired"), Math.max(1, a.expiresAt - Date.now()));
      a.timer.unref();
      const url = new URL(`${CHATGPT_ISSUER}/api/accounts/authorize`);
      url.search = new URLSearchParams({
        client_id: account?.clientId ?? "dynamic_agent_client",
        ext_agent_host_id: `urn:uuid:${this.deps.hostId}`,
        response_type: "code",
        redirect_uri: a.redirectUri,
        scope: "openid profile email offline_access resource.invoke chatgpt.tokens.use.direct",
        resource: CHATGPT_RESOURCE,
        state: a.state,
        nonce: a.nonce,
        code_challenge_method: "S256",
        code_challenge: createHash("sha256").update(a.verifier).digest("base64url"),
        ...(!account ? { agent_name_hint: "Aux" } : {}),
        ...(account?.email ? { login_hint: account.email } : {}),
      }).toString();
      return { ...this.summary(a), authorizationUrl: url.href };
    } catch (error) {
      this.retire(a, "failed");
      try {
        await this.closeListener(a, true);
      } catch (cleanup) {
        throw new AggregateError([error, cleanup], "ChatGPT callback cleanup failed.");
      }
      throw error;
    }
  }
  async status(id: string, requester: string) {
    const a = this.get(id);
    await this.deps.checkOwner(a.owner, requester);
    if (a.phase === "pending" || a.phase === "authenticating") {
      try {
        await this.check(a);
      } catch {
        this.retire(a, "cancelled");
      }
    }
    return this.summary(a);
  }
  async cancel(id: string, requester: string) {
    const a = this.get(id);
    await this.deps.checkOwner(a.owner, requester);
    this.retire(a, "cancelled");
    const joined = await Promise.allSettled([a.work, this.closeListener(a, true)]);
    const failures = joined.flatMap((result) => (result.status === "rejected" ? [result.reason] : []));
    if (failures.length) throw new AggregateError(failures, "ChatGPT sign-in cleanup failed.");
    return this.summary(a);
  }
  private get(id: string) {
    const a = this.attempts.get(id);
    if (!a) throw new AuxError("invalid_params", "Unknown sign-in attempt.");
    return a;
  }
  private summary(a: Attempt): ProviderAuthStatus {
    if (a.cleanupFailure) throw a.cleanupFailure;
    if (a.listenerFailure) throw a.listenerFailure;
    return {
      attemptId: a.attemptId,
      provider: "chatgpt",
      phase: a.phase,
      expiresAt: a.expiresAt,
    };
  }
  private async check(a: Attempt) {
    await this.deps.checkOwner(a.owner);
    if (
      this.closed ||
      a.controller.signal.aborted ||
      Date.now() >= a.expiresAt ||
      this.deps.generation() !== a.generation
    )
      throw new AuxError("cancelled", "The original sign-in account changed.");
  }
  private closeListener(a: Attempt, force = false): Promise<void> {
    if (force) a.forceClose = true;
    if (!a.listenerClose) {
      const work = (async () => {
        // Listen may already have been queued. Join it before requesting close so it cannot reopen later.
        await a.listening?.catch(() => {});
        await new Promise<void>((resolve, reject) => {
          a.server.close((error) => {
            if (error && (error as NodeJS.ErrnoException).code !== "ERR_SERVER_NOT_RUNNING") reject(error);
            else resolve();
          });
          if (a.forceClose) a.server.closeAllConnections();
        });
        a.listenerJoined = true;
        a.listenerFailure = undefined;
      })();
      a.listenerClose = work;
      void work.catch((error: unknown) => {
        a.listenerFailure = error;
        if (a.listenerClose === work) a.listenerClose = undefined;
      });
    }
    if (force) a.server.closeAllConnections();
    return a.listenerClose;
  }
  private retire(a: Attempt, phase: "cancelled" | "expired" | "failed") {
    if (!["connected", "cancelled", "expired", "failed"].includes(a.phase)) {
      a.phase = phase;
      a.controller.abort();
      a.verifier = "";
      a.nonce = "";
      a.state = "";
      clearTimeout(a.timer);
    }
    void this.closeListener(a, true).catch(() => {});
  }
  invalidate() {
    for (const a of this.attempts.values()) this.retire(a, "cancelled");
  }
  close(): Promise<void> {
    this.closed = true;
    this.invalidate();
    if (this.closing) return this.closing;
    const work = (async () => {
      // New admission is already closed; every pending owner lookup remains an original joined start.
      await Promise.allSettled(this.starts);
      const attempts = [...this.attempts.values()];
      const settled = await Promise.allSettled(
        attempts.flatMap((attempt) => [attempt.work, this.closeListener(attempt, true)]),
      );
      const failures: unknown[] = settled.flatMap((result) =>
        result.status === "rejected" ? [result.reason] : [],
      );
      for (const attempt of attempts) {
        if (attempt.cleanupFailure) failures.push(attempt.cleanupFailure);
        if (attempt.listenerFailure) failures.push(attempt.listenerFailure);
      }
      if (failures.length) throw new AggregateError(failures, "ChatGPT sign-in requires reconciliation.");
    })();
    this.closing = work;
    void work.catch(() => {
      if (this.closing === work) this.closing = undefined;
    });
    return work;
  }
  private async exchange(a: Attempt, code: string, clientId: string) {
    try {
      await this.check(a);
      const network = this.deps.fetch ?? fetch,
        signal = AbortSignal.any([a.controller.signal, AbortSignal.timeout(15_000)]);
      const value = chatgptTokens(
        await authJson(
          await network(CHATGPT_TOKEN_ENDPOINT, {
            method: "POST",
            redirect: "error",
            signal,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              client_id: clientId,
              code,
              code_verifier: a.verifier,
              redirect_uri: a.redirectUri,
              resource: CHATGPT_RESOURCE,
            }),
          }),
        ),
      );
      if (!value.idToken)
        throw new AuxError("permission_denied", "ChatGPT did not provide a verified identity.");
      const discovery = z.object({ issuer: z.literal(CHATGPT_ISSUER), jwks_uri: z.string().url() }).parse(
        await authJson(
          await network(`${CHATGPT_ISSUER}/.well-known/openid-configuration`, {
            redirect: "error",
            signal,
          }),
        ),
      );
      const jwksUrl = new URL(discovery.jwks_uri);
      if (jwksUrl.origin !== CHATGPT_ISSUER)
        throw new AuxError("permission_denied", "Unexpected ChatGPT identity issuer.");
      const jose = await import("jose"),
        jwks = z
          .object({ keys: z.array(z.record(z.string(), z.unknown())).min(1).max(32) })
          .parse(await authJson(await network(jwksUrl, { redirect: "error", signal })));
      const { payload } = await jose.jwtVerify(value.idToken, jose.createLocalJWKSet(jwks), {
        issuer: CHATGPT_ISSUER,
        audience: clientId,
        requiredClaims: ["sub", "exp", "iat", "nonce"],
        clockTolerance: 5,
        algorithms: ["RS256", "ES256"],
      });
      if (payload.nonce !== a.nonce || !payload.sub || (a.account && payload.sub !== a.account.subject))
        throw new AuxError("permission_denied", "ChatGPT returned a different account identity.");
      const account: ChatgptAccount = {
        ...value,
        accountId: chatgptAccountId(clientId, payload.sub),
        clientId,
        subject: payload.sub,
        ...(typeof payload.email === "string" ? { email: payload.email } : {}),
      };
      await this.check(a);
      await this.deps.accounts.install(
        account,
        () => this.check(a),
        async () => {
          const acceptance = await this.deps.activate(account, () => this.check(a), a.controller.signal);
          a.generation = acceptance.generation;
          try {
            await this.check(a);
          } catch (error) {
            try {
              await acceptance.rollback();
            } catch (cleanup) {
              throw new AggregateError(
                [error, cleanup],
                "ChatGPT account acceptance requires reconciliation.",
              );
            }
            throw error;
          }
        },
      );
      a.phase = "connected";
      clearTimeout(a.timer);
    } catch (error) {
      if (error instanceof AggregateError) a.cleanupFailure = error;
      this.retire(a, a.controller.signal.aborted ? "cancelled" : "failed");
    } finally {
      a.verifier = "";
      a.nonce = "";
      a.state = "";
    }
  }
}
