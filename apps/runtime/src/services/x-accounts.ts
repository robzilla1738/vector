import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { createServer, type Server } from "node:http";
import { z } from "zod";
import { AuxError } from "@aux/contracts";
import {
  XAccountSchema,
  XScopeSchema,
  X_OPERATIONS,
  xOperationAvailable,
  type XAccount,
  type XScope,
  type XOperation,
} from "@aux/contracts/x";
import type { NativeBridge } from "../native.js";
import { XAccountRecords, type XAccountRecord } from "./x-store.js";
import { xJsonResponse } from "./x-rest.js";
const token = z
  .string()
  .min(1)
  .max(16384)
  .refine((value) => !/[\r\n]/.test(value));
const SecretSchema = z
  .object({
    accessToken: token,
    refreshToken: token,
    expiresAt: z.number().positive(),
    clientId: z.string().min(1),
    scopes: z.array(XScopeSchema),
  })
  .strict();
type Secret = z.infer<typeof SecretSchema>;
type Pending = {
  server: Server;
  abort: AbortController;
  verifier: string;
  state: string;
  scopes: XScope[];
  expiresAt: number;
  generation: number;
  checkOwner(): Promise<void>;
  timer: NodeJS.Timeout;
  completion?: Promise<void>;
};
const endpoints = {
  auth: "https://x.com/i/oauth2/authorize",
  token: "https://api.x.com/2/oauth2/token",
  revoke: "https://api.x.com/2/oauth2/revoke",
  identity: "https://api.x.com/2/users/me",
};
export type XEndpoints = typeof endpoints;
const scopesEqual = (a: readonly string[], b: readonly string[]) =>
  [...a].sort().join(" ") === [...b].sort().join(" ");
function revision(record: XAccountRecord): string {
  return createHash("sha256")
    .update(
      JSON.stringify([
        record.connectionId,
        record.userId,
        record.epoch,
        record.clientId,
        record.scopes,
        record.state,
      ]),
    )
    .digest("hex");
}
function redirectConfiguration(value: string | undefined): URL | undefined {
  if (!value) return;
  try {
    const url = new URL(value);
    if (
      url.protocol === "http:" &&
      url.hostname === "127.0.0.1" &&
      Number(url.port) >= 1024 &&
      Number(url.port) <= 65535 &&
      url.pathname === "/oauth/x/callback" &&
      !url.search &&
      !url.hash &&
      !url.username &&
      !url.password
    )
      return url;
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
  }
}
/** Refresh belongs to the account; one cancelled waiter cannot detach or abort other consumers. */
async function waitForRefresh(pending: Promise<Secret>, signal: AbortSignal): Promise<Secret> {
  signal.throwIfAborted();
  let onAbort!: () => void;
  const cancelled = new Promise<never>((_resolve, reject) => {
    onAbort = () => reject(signal.reason);
    signal.addEventListener("abort", onAbort, { once: true });
  });
  try {
    return await Promise.race([pending, cancelled]);
  } finally {
    signal.removeEventListener("abort", onAbort);
  }
}
/** Public-client OAuth, token refresh and retirement all belong to this original Profile. */
export class XAccountService {
  private closed = false;
  private initialized = false;
  private initialization: Promise<void>;
  private lifecycle = new Set<{ controller: AbortController; promise: Promise<unknown> }>();
  private cleanups = new Set<Promise<unknown>>();
  private generation = 0;
  private pendingAuth?: Pending;
  private requests = new Map<string, Set<{ controller: AbortController; promise: Promise<unknown> }>>();
  private refreshes = new Map<string, { controller: AbortController; promise: Promise<Secret> }>();
  constructor(
    private deps: {
      records: XAccountRecords;
      native: NativeBridge;
      clientId?: string;
      redirectUri?: string;
      profileId?: string;
      fetch?: typeof fetch;
      endpoints?: XEndpoints;
      onChange?(): void;
    },
  ) {
    if (!deps.records.hasCleanupDebt()) {
      this.initialized = true;
      this.initialization = Promise.resolve();
    } else {
      this.initialization = this.cleanupRevokedSecrets().then(() => {
        this.initialized = true;
      });
      void this.initialization.catch(() => {});
    }
  }
  async ready(): Promise<void> {
    await this.initialization;
    if (this.closed) throw new AuxError("cancelled", "X account ownership is closed.");
  }
  private get secretPrefix(): string {
    return `x_oauth_${createHash("sha256")
      .update(this.deps.profileId ?? "default")
      .digest("hex")}_`;
  }
  private ownsSecret(name: string): boolean {
    return (
      name.startsWith(this.secretPrefix) &&
      /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(
        name.slice(this.secretPrefix.length),
      )
    );
  }
  private get http() {
    return this.deps.fetch ?? fetch;
  }
  private get urls() {
    return this.deps.endpoints ?? endpoints;
  }
  private configured(): boolean {
    return (
      this.initialized &&
      !this.closed &&
      !!this.deps.clientId &&
      !!redirectConfiguration(this.deps.redirectUri) &&
      this.deps.native.available()
    );
  }
  private public(record: XAccountRecord): XAccount {
    return XAccountSchema.parse({
      connectionId: record.connectionId,
      userId: record.userId,
      username: record.username,
      label: record.label,
      revision: revision(record),
      scopes: record.scopes,
      state: record.state,
      operations:
        this.configured() &&
        this.ownsSecret(record.secretName) &&
        record.state === "active" &&
        record.clientId === this.deps.clientId
          ? Object.keys(X_OPERATIONS).filter((operation) =>
              xOperationAvailable(record.scopes, operation as XOperation),
            )
          : [],
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
  list() {
    const available = this.configured();
    return {
      available,
      ...(!available
        ? {
            reason: this.initialized
              ? "X requires a configured public OAuth client, its exact registered loopback redirect URI and secure Aux desktop storage."
              : "X native credential retirement has not completed. Refresh after cleanup or reopen this Profile to retry.",
          }
        : {}),
      connections: this.deps.records.all().map((record) => this.public(record)),
    };
  }
  account(connectionId: string): XAccount {
    return this.public(this.deps.records.get(connectionId));
  }
  cleanupRevokedSecrets(): Promise<void> {
    if (this.closed) throw new AuxError("cancelled", "X credential cleanup ownership is closed.");
    const original = this.cleanupOwnedSecrets();
    this.cleanups.add(original);
    void original.then(
      () => this.cleanups.delete(original),
      () => this.cleanups.delete(original),
    );
    return original;
  }
  private async cleanupOwnedSecrets(): Promise<void> {
    await this.pendingAuth?.completion;
    for (const job of this.deps.records.credentialJobs()) {
      const adopted = this.deps.records
        .all()
        .some((record) => record.connectionId === job.connectionId && record.secretName === job.secretName);
      if (!adopted && this.ownsSecret(job.secretName)) await this.deps.native.storeSecret(job.secretName, "");
      this.deps.records.finishCredential(job.jobId);
    }
    const live = new Set(this.deps.records.all().map((record) => record.connectionId));
    for (const record of this.deps.records.all(true))
      if (!live.has(record.connectionId) && this.ownsSecret(record.secretName)) {
        await this.retireRequests(record.connectionId);
        await this.deps.native.storeSecret(record.secretName, "");
      }
  }
  private checkPending(pending: Pending): void {
    pending.abort.signal.throwIfAborted();
    if (
      this.closed ||
      this.generation !== pending.generation ||
      this.pendingAuth !== pending ||
      Date.now() > pending.expiresAt
    )
      throw new AuxError("cancelled", "The original X sign-in retired.");
  }
  async start(input: { scopes: XScope[]; checkOwner(): Promise<void> }) {
    await this.ready();
    if (!this.configured()) throw new AuxError("backend_unavailable", this.list().reason!);
    const scopes = [...new Set(XScopeSchema.array().parse(input.scopes))];
    if (!["tweet.read", "users.read", "offline.access"].every((scope) => scopes.includes(scope as XScope)))
      throw new AuxError(
        "invalid_params",
        "X needs explicitly selected tweet.read, users.read and offline.access for identity and durable access.",
      );
    await input.checkOwner();
    await this.cancelAuth();
    const generation = ++this.generation,
      redirect = redirectConfiguration(this.deps.redirectUri)!;
    const state = randomBytes(32).toString("base64url"),
      verifier = randomBytes(32).toString("base64url"),
      expiresAt = Date.now() + 5 * 60_000;
    const server = createServer(),
      abort = new AbortController();
    const pending: Pending = {
      server,
      abort,
      state,
      verifier,
      scopes,
      expiresAt,
      generation,
      checkOwner: input.checkOwner,
      timer: setTimeout(() => {
        abort.abort(new AuxError("cancelled", "X sign-in expired."));
        server.close();
      }, 5 * 60_000),
    };
    this.pendingAuth = pending;
    server.on("request", (request, response) => {
      let url: URL;
      try {
        url = new URL(request.url ?? "/", redirect);
      } catch {
        response.writeHead(400).end("Invalid X sign-in callback.");
        return;
      }
      if (
        request.method !== "GET" ||
        request.headers.host !== redirect.host ||
        url.origin !== redirect.origin ||
        url.pathname !== redirect.pathname
      ) {
        response.writeHead(404).end();
        return;
      }
      const received = url.searchParams.get("state") ?? "",
        expected = Buffer.from(state),
        actual = Buffer.from(received);
      if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
        response.writeHead(400).end("Invalid X sign-in state.");
        return;
      }
      if (pending.completion) {
        response.writeHead(409).end("This sign-in is already completing.");
        return;
      }
      pending.completion = (async () => {
        try {
          this.checkPending(pending);
          await pending.checkOwner();
          this.checkPending(pending);
          const code = url.searchParams.get("code");
          if (url.searchParams.has("error") || !code || code.length > 4096)
            throw new AuxError("needs_input", "X sign-in was declined or did not return a valid code.");
          await this.complete(pending, code);
          response
            .writeHead(200, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" })
            .end("X account connected. Return to Aux.");
        } catch {
          response
            .writeHead(400, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" })
            .end("X sign-in could not complete. Return to Aux and try again.");
        } finally {
          clearTimeout(pending.timer);
          server.close();
          if (this.pendingAuth === pending) this.pendingAuth = undefined;
        }
      })();
    });
    try {
      await new Promise<void>((resolve, reject) => {
        server.once("error", reject);
        server.listen(Number(redirect.port), "127.0.0.1", () => {
          server.off("error", reject);
          resolve();
        });
      });
      this.checkPending(pending);
      await pending.checkOwner();
      this.checkPending(pending);
      const url = new URL(this.urls.auth);
      url.search = new URLSearchParams({
        response_type: "code",
        client_id: this.deps.clientId!,
        redirect_uri: redirect.href,
        scope: scopes.join(" "),
        state,
        code_challenge: createHash("sha256").update(verifier).digest("base64url"),
        code_challenge_method: "S256",
      }).toString();
      return { url: url.href, expiresAt };
    } catch (error) {
      abort.abort();
      clearTimeout(pending.timer);
      server.close();
      if (this.pendingAuth === pending) this.pendingAuth = undefined;
      throw error;
    }
  }
  private async exchange(body: URLSearchParams, scopes: XScope[], signal: AbortSignal): Promise<Secret> {
    const response = await this.http(this.urls.token, {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!response.ok)
      throw new AuxError(
        "needs_input",
        `X authorization failed (${response.status}). Reconnect the account.`,
      );
    const value = await xJsonResponse(response, 100_000);
    if (body.get("grant_type") === "authorization_code" && typeof value.scope !== "string")
      throw new AuxError("needs_input", "X did not confirm the selected authorization scopes.");
    const granted =
      typeof value.scope === "string" ? XScopeSchema.array().parse(value.scope.split(/\s+/)) : scopes;
    if (
      !scopesEqual(granted, scopes) ||
      typeof value.expires_in !== "number" ||
      !Number.isFinite(value.expires_in) ||
      value.expires_in < 1 ||
      value.expires_in > 86400 ||
      String(value.token_type).toLowerCase() !== "bearer"
    )
      throw new AuxError("needs_input", "X did not confirm the exact requested scopes and token lifetime.");
    return SecretSchema.parse({
      accessToken: value.access_token,
      refreshToken: value.refresh_token,
      expiresAt: Date.now() + value.expires_in * 1000,
      scopes: granted,
      clientId: this.deps.clientId,
    });
  }
  private async complete(pending: Pending, code: string): Promise<void> {
    this.checkPending(pending);
    const secret = await this.exchange(
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectConfiguration(this.deps.redirectUri)!.href,
        code_verifier: pending.verifier,
        client_id: this.deps.clientId!,
      }),
      pending.scopes,
      pending.abort.signal,
    );
    this.checkPending(pending);
    const identityResponse = await this.http(this.urls.identity, {
      redirect: "error",
      signal: AbortSignal.any([pending.abort.signal, AbortSignal.timeout(15_000)]),
      headers: { Authorization: `Bearer ${secret.accessToken}` },
    });
    if (!identityResponse.ok) throw new AuxError("needs_input", "X account identity could not be verified.");
    const identity = z
      .object({
        data: z.object({
          id: z.string().regex(/^[0-9]{1,19}$/),
          username: z.string().regex(/^[A-Za-z0-9_]{1,15}$/),
          name: z.string().min(1).max(200),
        }),
      })
      .parse(await xJsonResponse(identityResponse, 100_000)).data;
    this.checkPending(pending);
    await pending.checkOwner();
    this.checkPending(pending);
    const previous = this.deps.records.all(true).find((record) => record.userId === identity.id),
      connectionId = previous?.connectionId ?? randomUUID();
    const secretName = `${this.secretPrefix}${randomUUID()}`;
    const stagedJob = this.deps.records.stageCredential(connectionId, secretName);
    let committed = false;
    try {
      await this.deps.native.storeSecret(secretName, JSON.stringify(secret));
      this.checkPending(pending);
      await pending.checkOwner();
      this.checkPending(pending);
      await this.retireRequests(connectionId);
      this.checkPending(pending);
      await pending.checkOwner();
      this.checkPending(pending);
      const retiredJob = previous
        ? this.deps.records.stageCredential(connectionId, previous.secretName)
        : undefined;
      this.deps.records.save({
        connectionId,
        userId: identity.id,
        username: identity.username,
        label: identity.name,
        epoch: randomUUID(),
        secretName,
        clientId: this.deps.clientId!,
        scopes: secret.scopes,
        state: "active",
        createdAt: previous?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
      });
      committed = true;
      this.deps.records.finishCredential(stagedJob);
      this.deps.onChange?.();
      if (previous && retiredJob) {
        if (this.ownsSecret(previous.secretName)) await this.deps.native.storeSecret(previous.secretName, "");
        this.deps.records.finishCredential(retiredJob);
      }
    } finally {
      if (!committed) {
        await this.deps.native.storeSecret(secretName, "");
        this.deps.records.finishCredential(stagedJob);
      }
    }
  }
  private async retireRequests(connectionId: string): Promise<void> {
    const requests = [...(this.requests.get(connectionId) ?? [])],
      refresh = this.refreshes.get(connectionId);
    for (const request of requests)
      request.controller.abort(new AuxError("cancelled", "The original X account retired."));
    refresh?.controller.abort();
    await Promise.allSettled([
      ...requests.map((request) => request.promise),
      ...(refresh ? [refresh.promise] : []),
    ]);
  }
  private async credential(record: XAccountRecord): Promise<Secret> {
    if (!this.ownsSecret(record.secretName))
      throw new AuxError(
        "needs_input",
        "This X credential belongs to another Profile. Reconnect the account here.",
      );
    const raw = (await this.deps.native.readSecret(record.secretName)).value;
    const secret = SecretSchema.parse(JSON.parse(raw ?? "null"));
    if (secret.clientId !== record.clientId || !scopesEqual(secret.scopes, record.scopes))
      throw new AuxError(
        "permission_denied",
        "The native X credential no longer matches its original account grants.",
      );
    return secret;
  }
  private refresh(record: XAccountRecord): Promise<Secret> {
    const existing = this.refreshes.get(record.connectionId);
    if (existing) return existing.promise;
    const controller = new AbortController(),
      expected = revision(record);
    const check = () => {
      controller.signal.throwIfAborted();
      if (this.closed || revision(this.deps.records.get(record.connectionId)) !== expected)
        throw new AuxError("cancelled", "The original X refresh retired.");
    };
    const promise = (async () => {
      try {
        check();
        const original = await this.credential(record);
        check();
        const secret = await this.exchange(
          new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: original.refreshToken,
            client_id: record.clientId,
          }),
          record.scopes,
          controller.signal,
        );
        check();
        await this.deps.native.storeSecret(record.secretName, JSON.stringify(secret));
        check();
        return secret;
      } catch (error) {
        if (!controller.signal.aborted && !this.closed) {
          const latest = this.deps.records.get(record.connectionId);
          if (revision(latest) === expected)
            this.deps.records.save({ ...latest, state: "needs_reauth", updatedAt: Date.now() });
          for (const request of this.requests.get(record.connectionId) ?? []) request.controller.abort();
          this.deps.onChange?.();
        }
        throw error;
      } finally {
        if (this.refreshes.get(record.connectionId)?.controller === controller)
          this.refreshes.delete(record.connectionId);
      }
    })();
    this.refreshes.set(record.connectionId, { controller, promise });
    return promise;
  }
  withAccess<T>(
    connectionId: string,
    expectedRevision: string,
    scopes: readonly XScope[],
    signal: AbortSignal,
    operation: (access: {
      token: string;
      signal: AbortSignal;
      source: XAccount;
      checkCurrent(): void;
    }) => Promise<T>,
  ): Promise<T> {
    const controller = new AbortController(),
      joined = AbortSignal.any([signal, controller.signal]);
    const request = { controller, promise: undefined as unknown as Promise<T> };
    const requests = this.requests.get(connectionId) ?? new Set();
    requests.add(request);
    this.requests.set(connectionId, requests);
    const promise = (async () => {
      const check = () => {
        joined.throwIfAborted();
        const current = this.account(connectionId);
        if (
          !this.configured() ||
          this.deps.records.get(connectionId).clientId !== this.deps.clientId ||
          current.state !== "active" ||
          current.revision !== expectedRevision ||
          scopes.some((scope) => !current.scopes.includes(scope))
        )
          throw new AuxError("permission_denied", "The original X account, client or scopes retired.");
      };
      try {
        check();
        const record = this.deps.records.get(connectionId);
        let secret = await this.credential(record);
        check();
        if (secret.expiresAt <= Date.now() + 30_000) {
          secret = await waitForRefresh(this.refresh(record), joined);
          check();
        }
        const result = await operation({
          token: secret.accessToken,
          signal: joined,
          source: this.account(connectionId),
          checkCurrent: check,
        });
        check();
        return result;
      } finally {
        requests.delete(request);
        if (!requests.size) this.requests.delete(connectionId);
      }
    })();
    request.promise = promise;
    return promise;
  }
  revoke(connectionId: string): Promise<{ ok: true; providerRevocation: "confirmed" | "pending" }> {
    if (this.closed) throw new AuxError("cancelled", "X account ownership is closed.");
    const controller = new AbortController(),
      promise = this.revokeOwned(connectionId, controller.signal),
      owner = { controller, promise };
    this.lifecycle.add(owner);
    void promise.then(
      () => this.lifecycle.delete(owner),
      () => this.lifecycle.delete(owner),
    );
    return promise;
  }
  private async revokeOwned(
    connectionId: string,
    signal: AbortSignal,
  ): Promise<{ ok: true; providerRevocation: "confirmed" | "pending" }> {
    const record = this.deps.records.get(connectionId);
    this.generation++;
    this.deps.records.retire(connectionId);
    this.deps.onChange?.();
    await this.cancelAuth();
    await this.retireRequests(connectionId);
    let providerRevocation: "confirmed" | "pending" = "pending";
    try {
      const secret = await this.credential(record);
      const response = await this.http(this.urls.revoke, {
        method: "POST",
        redirect: "error",
        signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          token: secret.refreshToken,
          token_type_hint: "refresh_token",
          client_id: record.clientId,
        }),
      });
      if (response.ok) providerRevocation = "confirmed";
    } catch {
      /* Local retirement is already durable; report unresolved provider revocation. */
    }
    if (this.ownsSecret(record.secretName)) await this.deps.native.storeSecret(record.secretName, "");
    return { ok: true, providerRevocation };
  }
  async cancelAuth(): Promise<void> {
    const pending = this.pendingAuth;
    if (!pending) return;
    this.pendingAuth = undefined;
    pending.abort.abort();
    clearTimeout(pending.timer);
    pending.server.close();
    await pending.completion;
  }
  async close(): Promise<void> {
    this.closed = true;
    this.generation++;
    await this.cancelAuth();
    for (const owner of this.lifecycle) owner.controller.abort();
    await Promise.all(
      [...new Set([...this.requests.keys(), ...this.refreshes.keys()])].map((id) => this.retireRequests(id)),
    );
    await Promise.allSettled([
      this.initialization,
      ...this.cleanups,
      ...[...this.lifecycle].map((owner) => owner.promise),
    ]);
  }
}
