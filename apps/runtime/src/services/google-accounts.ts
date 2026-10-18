import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createServer, type Server } from "node:http";
import { AuxError } from "@aux/contracts";
import {
  GoogleAccountSchema,
  GoogleScopeSchema,
  GOOGLE_OPERATIONS,
  googleOperationAvailable,
  type GoogleOperation,
  type GoogleAccount,
  type GoogleScope,
} from "@aux/contracts/google";
import type { Repo } from "../store/repo.js";
import type { NativeBridge } from "../native.js";

export const GOOGLE_CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly" as const;
const SCOPE = GOOGLE_CALENDAR_SCOPE;
const AUTH_LIFETIME_MS = 5 * 60_000;
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RESPONSE_BYTES = 1_000_000;

export type GoogleAccountRow = {
  connection_id: string;
  account_key: string;
  account_key_lookup: string;
  label: string;
  secret_name: string;
  scopes: string;
  state: "active" | "needs_reauth";
  created_at: number;
  updated_at: number;
};
type Secret = { accessToken: string; refreshToken: string; expiresAt: number; clientId?: string };
type Pending = {
  server: Server;
  timer: NodeJS.Timeout;
  verifier: string;
  redirectUri: string;
  scopes: GoogleScope[];
  clientId: string;
  checkOwner(): Promise<void>;
};
export type GoogleEndpoints = {
  auth: string;
  token: string;
  revoke: string;
  calendar: string;
  identity?: string;
};
const google: GoogleEndpoints = {
  auth: "https://accounts.google.com/o/oauth2/v2/auth",
  token: "https://oauth2.googleapis.com/token",
  revoke: "https://oauth2.googleapis.com/revoke",
  calendar: "https://www.googleapis.com/calendar/v3",
  identity: "https://openidconnect.googleapis.com/v1/userinfo",
};

export async function googleJsonResponse(response: Response): Promise<Record<string, unknown>> {
  const reader = response.body?.getReader();
  if (!reader) throw new AuxError("backend_unavailable", "Google returned an empty response.");
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_RESPONSE_BYTES)
        throw new AuxError("backend_unavailable", "Google returned too much data for one page.");
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  try {
    const value: unknown = JSON.parse(new TextDecoder().decode(Buffer.concat(chunks)));
    if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  } catch {
    /* malformed provider response */
  }
  throw new AuxError("backend_unavailable", "Google returned invalid data.");
}

function tokenExpiry(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 1 || value > 86400)
    throw new AuxError("backend_unavailable", "Google returned an invalid token expiry.");
  return Date.now() + value * 1000;
}
async function waitForToken(pending: Promise<Secret>, signal?: AbortSignal): Promise<Secret> {
  if (!signal) return pending;
  if (signal.aborted) throw new AuxError("cancelled", "Google read was cancelled.");
  let onAbort!: () => void;
  const cancelled = new Promise<never>((_resolve, reject) => {
    onAbort = () => reject(new AuxError("cancelled", "Google read was cancelled."));
    signal.addEventListener("abort", onAbort, { once: true });
  });
  try {
    return await Promise.race([pending, cancelled]);
  } finally {
    signal.removeEventListener("abort", onAbort);
  }
}

/** Outbound Google Calendar authority. No browser cookies or inbound MCP tokens enter this service. */
export class GoogleAccountService {
  private pending = new Map<string, Pending>();
  private setupGeneration = 0;
  private activeReads = new Map<string, Set<AbortController>>();
  private accountTasks = new Map<string, Set<Promise<unknown>>>();
  private operations = new Set<Promise<unknown>>();
  private refreshControllers = new Map<string, AbortController>();
  private refreshing = new Map<string, Promise<Secret>>();
  private closed = false;

  constructor(
    private deps: {
      repo: Repo;
      native: NativeBridge;
      clientId?: string;
      generalClientId?: string;
      profileId?: string;
      fetch?: typeof fetch;
      endpoints?: GoogleEndpoints;
      onChange?: () => void;
    },
  ) {
    void this.cleanupRevokedSecrets().catch(() => undefined);
  }

  /** A crash or Keychain error after local revocation cannot reactivate the account. */
  async cleanupRevokedSecrets(): Promise<void> {
    const rows = this.deps.repo.db
      .prepare("SELECT connection_id,secret_name FROM calendar_connections WHERE revoked_at IS NOT NULL")
      .all() as { connection_id: string; secret_name: string }[];
    for (const row of rows) {
      const name = this.deps.repo.revealRecordField(
        "calendar_connections",
        [row.connection_id],
        "secret_name",
        row.secret_name,
      );
      await this.deps.native.storeSecret(name, "").catch(() => undefined);
    }
  }

  private get http() {
    return this.deps.fetch ?? fetch;
  }
  private get urls() {
    return this.deps.endpoints ?? google;
  }
  private requireConfigured(general = false) {
    const clientId = general ? this.deps.generalClientId : this.deps.clientId;
    if (!clientId || !this.deps.native.available())
      throw new AuxError(
        "backend_unavailable",
        "Google requires Aux desktop and a configured Google OAuth desktop client.",
      );
    return clientId;
  }
  list(): { available: boolean; reason?: string; connections: GoogleAccount[] } {
    const available = !this.closed && !!this.deps.generalClientId && this.deps.native.available();
    const rows = this.deps.repo.db
      .prepare(
        "SELECT * FROM calendar_connections WHERE revoked_at IS NULL ORDER BY created_at,connection_id",
      )
      .all() as GoogleAccountRow[];
    return {
      available,
      ...(!available
        ? {
            reason: "Google needs a configured OAuth desktop client and secure Aux desktop storage.",
          }
        : {}),
      connections: rows.map((row) => this.public(row)),
    };
  }
  private accountKey(
    row: Pick<GoogleAccountRow, "connection_id" | "account_key" | "account_key_lookup">,
  ): string {
    const accountKey = this.deps.repo.revealRecordField(
      "calendar_connections",
      [row.connection_id],
      "account_key",
      row.account_key,
    );
    if (
      row.account_key_lookup !==
      this.deps.repo.exactRecordLookup("calendar_connections", "account_key", accountKey)
    )
      throw new Error("Protected Google account lookup does not match its account.");
    return accountKey;
  }
  private decode(row: GoogleAccountRow): GoogleAccountRow {
    const id = [row.connection_id];
    const repo = this.deps.repo;
    const account_key = this.accountKey(row);
    return {
      ...row,
      account_key,
      label: repo.revealRecordField("calendar_connections", id, "label", row.label),
      secret_name: repo.revealRecordField("calendar_connections", id, "secret_name", row.secret_name),
      scopes: repo.revealRecordField("calendar_connections", id, "scopes", row.scopes),
    };
  }
  private public(row: GoogleAccountRow): GoogleAccount {
    const value = this.decode(row);
    const scopes = GoogleScopeSchema.array().parse(JSON.parse(value.scopes));
    return GoogleAccountSchema.parse({
      connectionId: value.connection_id,
      revision: this.revision(row),
      operations:
        value.state === "active" &&
        !this.closed &&
        !!this.deps.generalClientId &&
        this.deps.native.available()
          ? Object.entries(GOOGLE_OPERATIONS)
              .filter(([name]) => googleOperationAvailable(scopes, name as GoogleOperation))
              .map(([name]) => name)
          : [],
      accountKey: value.account_key,
      label: value.label,
      scopes,
      state: value.state,
      createdAt: value.created_at,
      updatedAt: value.updated_at,
    });
  }
  row(connectionId: string): GoogleAccountRow {
    const row = this.deps.repo.db
      .prepare("SELECT * FROM calendar_connections WHERE connection_id=? AND revoked_at IS NULL")
      .get(connectionId) as GoogleAccountRow | undefined;
    if (!row) throw new AuxError("not_found", "Google connection is unavailable or revoked.");
    return this.decode(row);
  }
  async start(
    input: { scopes: GoogleScope[]; checkOwner?: () => Promise<void> } = { scopes: [SCOPE] },
  ): Promise<{ url: string; expiresAt: number }> {
    const scopes = [...new Set(GoogleScopeSchema.array().min(1).max(10).parse(input.scopes))];
    const general = scopes.some((scope) => scope !== SCOPE);
    this.requireConfigured(general);
    if (general && !input.checkOwner)
      throw new AuxError("permission_denied", "Google setup requires its original native window owner.");
    const generation = this.setupGeneration;
    const checkOwner = async () => {
      await input.checkOwner?.();
      if (generation !== this.setupGeneration || this.closed)
        throw new AuxError("cancelled", "Google setup retired.");
    };
    await checkOwner();
    if (this.closed) throw new AuxError("cancelled", "Google sign-in is unavailable while Aux closes.");
    const clientId = this.requireConfigured(general);
    if (this.pending.size >= 3)
      throw new AuxError("conflict", "Finish or cancel an existing Google sign-in first.");
    const callbackPath = general ? "/oauth/google" : "/oauth/google-calendar";
    const state = randomBytes(32).toString("base64url");
    const verifier = randomBytes(48).toString("base64url");
    const challenge = createHash("sha256").update(verifier).digest("base64url");
    const server = createServer((request, response) => {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      if (
        request.method !== "GET" ||
        url.pathname !== callbackPath ||
        url.searchParams.get("state") !== state ||
        !this.pending.has(state)
      ) {
        response.writeHead(404).end("This authorization request is unavailable.");
        return;
      }
      const pending = this.pending.get(state)!;
      this.pending.delete(state);
      clearTimeout(pending.timer);
      server.close();
      const code = url.searchParams.get("code");
      if (!code || url.searchParams.has("error")) {
        response.writeHead(400).end("Google access was not granted. Return to Aux and try again.");
        return;
      }
      void this.finish(code, pending)
        .then(() => {
          response.writeHead(200, {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "no-store",
          });
          response.end(
            "<!doctype html><title>Google connected</title><p>Google connected. Return to Aux.</p>",
          );
        })
        .catch(() => {
          response.writeHead(400, {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "no-store",
          });
          response.end(
            "<!doctype html><title>Google connection failed</title><p>Google could not be connected. Return to Aux and try again.</p>",
          );
        });
    });
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", () => {
        server.off("error", reject);
        resolve();
      });
    });
    try {
      await checkOwner();
      if (this.closed) throw new AuxError("cancelled", "Google sign-in retired.");
    } catch (error) {
      server.close();
      throw error;
    }
    const address = server.address();
    if (!address || typeof address === "string") {
      server.close();
      throw new AuxError("backend_unavailable", "Cannot start the Google sign-in callback.");
    }
    const redirectUri = `http://127.0.0.1:${address.port}${callbackPath}`;
    const expiresAt = Date.now() + AUTH_LIFETIME_MS;
    const timer = setTimeout(() => {
      this.pending.delete(state);
      server.close();
    }, AUTH_LIFETIME_MS);
    timer.unref();
    this.pending.set(state, { server, timer, verifier, redirectUri, scopes, clientId, checkOwner });
    const url = new URL(this.urls.auth);
    for (const [key, value] of Object.entries({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: [...scopes, ...(general ? ["openid", "email"] : [])].join(" "),
      access_type: "offline",
      prompt: "consent",
      state,
      code_challenge: challenge,
      code_challenge_method: "S256",
    }))
      url.searchParams.set(key, value);
    return { url: url.href, expiresAt };
  }
  private async finish(code: string, pending: Pending) {
    const operation = this.finishOwned(code, pending);
    this.operations.add(operation);
    try {
      await operation;
    } finally {
      this.operations.delete(operation);
    }
  }
  private async finishOwned(code: string, pending: Pending) {
    if (this.closed) throw new AuxError("cancelled", "Google sign-in was cancelled.");
    const clientId = pending.clientId;
    await pending.checkOwner();
    const response = await this.http(this.urls.token, {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        redirect_uri: pending.redirectUri,
        code_verifier: pending.verifier,
        grant_type: "authorization_code",
      }),
    });
    if (!response.ok) throw new AuxError("needs_input", "Google authorization failed. Try connecting again.");
    const data = await googleJsonResponse(response);
    const accessToken = typeof data.access_token === "string" ? data.access_token : "";
    const refreshToken = typeof data.refresh_token === "string" ? data.refresh_token : "";
    const scopes = typeof data.scope === "string" ? data.scope.split(/\s+/) : [];
    if (
      !accessToken ||
      !refreshToken ||
      accessToken.length > 16384 ||
      refreshToken.length > 16384 ||
      /[\r\n]/.test(accessToken) ||
      pending.scopes.some((scope) => !scopes.includes(scope))
    )
      throw new AuxError(
        "needs_input",
        "Google did not grant all selected permissions with durable account access. Reconnect and review the requested scopes.",
      );
    const calendarOnly = pending.scopes.every((scope) => scope === SCOPE);
    const identity = calendarOnly
      ? await this.calendarGet("/users/me/calendarList/primary", accessToken)
      : await this.identity(accessToken);
    await pending.checkOwner();
    if (this.closed) throw new AuxError("cancelled", "Google sign-in was cancelled.");
    const accountKey = calendarOnly ? identity.id : identity.email;
    if (
      typeof accountKey !== "string" ||
      !accountKey ||
      accountKey.length > 320 ||
      (calendarOnly
        ? identity.primary !== true
        : identity.email_verified !== true || typeof identity.sub !== "string" || !identity.sub)
    )
      throw new AuxError("backend_unavailable", "Google did not verify the selected account identity.");
    const label =
      typeof identity.summary === "string" && identity.summary.trim()
        ? identity.summary.trim().slice(0, 320)
        : accountKey;
    const lookup = this.deps.repo.exactRecordLookup("calendar_connections", "account_key", accountKey);
    // Google account counts are small. Authenticate every active projection before
    // an indexed lookup so a changed lookup cannot create a second active account.
    for (const candidate of this.deps.repo.db
      .prepare("SELECT * FROM calendar_connections WHERE provider='google' AND revoked_at IS NULL")
      .all() as GoogleAccountRow[])
      this.decode(candidate);
    const priorRow = this.deps.repo.db
      .prepare(
        "SELECT * FROM calendar_connections WHERE provider='google' AND account_key_lookup=? AND revoked_at IS NULL",
      )
      .get(lookup) as GoogleAccountRow | undefined;
    const previous = priorRow ? this.decode(priorRow) : undefined;
    if (previous && previous.account_key !== accountKey)
      throw new Error("Google account lookup collision or corruption.");
    const connectionId = previous?.connection_id ?? randomUUID();
    const secretName = `calendar-${randomUUID().replaceAll("-", "")}`;
    const expiresAt = tokenExpiry(data.expires_in);
    await this.deps.native.storeSecret(
      secretName,
      JSON.stringify({ accessToken, refreshToken, expiresAt, clientId } satisfies Secret),
    );
    try {
      await pending.checkOwner();
      if (this.closed) throw new AuxError("cancelled", "Google sign-in was cancelled.");
      const now = Date.now();
      if (previous) {
        const updated = this.deps.repo.db
          .prepare(
            "UPDATE calendar_connections SET label=?,secret_name=?,scopes=?,state='active',updated_at=? WHERE connection_id=? AND secret_name=? AND revoked_at IS NULL",
          )
          .run(
            this.deps.repo.protectRecordField("calendar_connections", [connectionId], "label", label),
            this.deps.repo.protectRecordField(
              "calendar_connections",
              [connectionId],
              "secret_name",
              secretName,
            ),
            this.deps.repo.protectRecordField(
              "calendar_connections",
              [connectionId],
              "scopes",
              JSON.stringify(pending.scopes),
            ),
            now,
            connectionId,
            priorRow!.secret_name,
          );
        if (!updated.changes) throw new AuxError("cancelled", "Google connection changed during sign-in.");
        this.activeReads.get(connectionId)?.forEach((controller) => controller.abort());
        this.refreshControllers.get(connectionId)?.abort();
      } else
        this.deps.repo.db
          .prepare(
            "INSERT INTO calendar_connections(connection_id,provider,account_key,account_key_lookup,label,secret_name,scopes,state,created_at,updated_at) VALUES(?,'google',?,?,?,?,?, 'active',?,?)",
          )
          .run(
            connectionId,
            this.deps.repo.protectRecordField(
              "calendar_connections",
              [connectionId],
              "account_key",
              accountKey,
            ),
            lookup,
            this.deps.repo.protectRecordField("calendar_connections", [connectionId], "label", label),
            this.deps.repo.protectRecordField(
              "calendar_connections",
              [connectionId],
              "secret_name",
              secretName,
            ),
            this.deps.repo.protectRecordField(
              "calendar_connections",
              [connectionId],
              "scopes",
              JSON.stringify(pending.scopes),
            ),
            now,
            now,
          );
    } catch (error) {
      await this.deps.native.storeSecret(secretName, "").catch(() => undefined);
      throw error;
    }
    if (previous) await this.deps.native.storeSecret(previous.secret_name, "").catch(() => undefined);
    this.deps.onChange?.();
  }
  private async identity(token: string): Promise<Record<string, unknown>> {
    const response = await this.http(this.urls.identity ?? google.identity!, {
      headers: { Authorization: `Bearer ${token}` },
      redirect: "error",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) throw new AuxError("needs_input", "Google account identity is unavailable.");
    return googleJsonResponse(response);
  }
  private async calendarGet(
    path: string,
    token: string,
    signal?: AbortSignal,
  ): Promise<Record<string, unknown>> {
    let response: Response;
    try {
      response = await this.http(`${this.urls.calendar}${path}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        redirect: "error",
        signal: signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch {
      throw new AuxError("backend_unavailable", "Google is offline or unavailable. Try again later.");
    }
    if (response.status === 401)
      throw new AuxError("needs_input", "Google authorization expired. Reconnect this account.");
    if (response.status === 403)
      throw new AuxError("permission_denied", "Google access was denied by the account or organization.");
    if (response.status === 429)
      throw new AuxError("backend_unavailable", "Google is rate limited. Try again later.");
    if (!response.ok)
      throw new AuxError("backend_unavailable", `Calendar request failed (${response.status}).`);
    return googleJsonResponse(response);
  }
  private async token(row: GoogleAccountRow): Promise<Secret> {
    const operation = this.tokenOwned(row);
    this.operations.add(operation);
    try {
      return await operation;
    } finally {
      this.operations.delete(operation);
    }
  }
  private async tokenOwned(row: GoogleAccountRow): Promise<Secret> {
    const raw = (await this.deps.native.readSecret(row.secret_name)).value;
    let secret: Secret;
    try {
      secret = JSON.parse(raw ?? "") as Secret;
    } catch {
      throw new AuxError("needs_input", "Google credentials are unavailable. Reconnect this account.");
    }
    if (!secret.accessToken || !secret.refreshToken || !Number.isFinite(secret.expiresAt))
      throw new AuxError("needs_input", "Google credentials are incomplete. Reconnect this account.");
    if (secret.expiresAt > Date.now() + 60_000) return secret;
    const existing = this.refreshing.get(row.connection_id);
    if (existing) return existing;
    const task = this.refresh(row, secret);
    this.refreshing.set(row.connection_id, task);
    try {
      return await task;
    } finally {
      this.refreshing.delete(row.connection_id);
    }
  }
  private async refresh(row: GoogleAccountRow, prior: Secret): Promise<Secret> {
    const controller = new AbortController();
    this.refreshControllers.set(row.connection_id, controller);
    try {
      if (prior.clientId && ![this.deps.clientId, this.deps.generalClientId].includes(prior.clientId))
        throw new AuxError(
          "needs_input",
          "The original Google OAuth registration changed. Reconnect this account.",
        );
      const response = await this.http(this.urls.token, {
        method: "POST",
        redirect: "error",
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]),
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: prior.clientId ?? this.requireConfigured(),
          refresh_token: prior.refreshToken,
          grant_type: "refresh_token",
        }),
      });
      if (!response.ok) {
        if (response.status === 400 || response.status === 401) {
          this.deps.repo.db
            .prepare(
              "UPDATE calendar_connections SET state='needs_reauth',updated_at=? WHERE connection_id=? AND revoked_at IS NULL",
            )
            .run(Date.now(), row.connection_id);
          this.deps.onChange?.();
          throw new AuxError("needs_input", "Google authorization expired. Reconnect this account.");
        }
        throw new AuxError("backend_unavailable", `Google token refresh failed (${response.status}).`);
      }
      const data = await googleJsonResponse(response);
      if (typeof data.access_token !== "string" || !data.access_token)
        throw new AuxError("backend_unavailable", "Google token refresh returned no access token.");
      if (
        typeof data.scope === "string" &&
        JSON.parse(row.scopes).some((scope: string) => !(data.scope as string).split(/\s+/).includes(scope))
      ) {
        this.deps.repo.db
          .prepare(
            "UPDATE calendar_connections SET state='needs_reauth',updated_at=? WHERE connection_id=? AND revoked_at IS NULL",
          )
          .run(Date.now(), row.connection_id);
        this.deps.onChange?.();
        throw new AuxError("needs_input", "Google read access was removed. Reconnect this account.");
      }
      const secret: Secret = {
        accessToken: data.access_token,
        clientId: prior.clientId,
        refreshToken: typeof data.refresh_token === "string" ? data.refresh_token : prior.refreshToken,
        expiresAt: tokenExpiry(data.expires_in),
      };
      if (this.row(row.connection_id).secret_name !== row.secret_name)
        throw new AuxError("cancelled", "Google connection changed during refresh.");
      await this.deps.native.storeSecret(row.secret_name, JSON.stringify(secret));
      const current = this.deps.repo.db
        .prepare("SELECT secret_name FROM calendar_connections WHERE connection_id=? AND revoked_at IS NULL")
        .get(row.connection_id) as { secret_name: string } | undefined;
      const currentName = current
        ? this.deps.repo.revealRecordField(
            "calendar_connections",
            [row.connection_id],
            "secret_name",
            current.secret_name,
          )
        : undefined;
      if (currentName !== row.secret_name) {
        await this.deps.native.storeSecret(row.secret_name, "").catch(() => undefined);
        throw new AuxError("cancelled", "Google connection changed during refresh.");
      }
      return secret;
    } finally {
      this.refreshControllers.delete(row.connection_id);
    }
  }
  private revision(row: GoogleAccountRow): string {
    const value = this.decode(row);
    return createHash("sha256")
      .update(
        JSON.stringify([
          value.connection_id,
          value.account_key,
          value.secret_name,
          value.scopes,
          value.state,
        ]),
      )
      .digest("hex");
  }
  account(connectionId: string): GoogleAccount {
    const row = this.deps.repo.db
      .prepare("SELECT * FROM calendar_connections WHERE connection_id=? AND revoked_at IS NULL")
      .get(connectionId) as GoogleAccountRow | undefined;
    if (!row) throw new AuxError("not_found", "Google connection is unavailable or revoked.");
    return this.public(row);
  }
  async withAccess<T>(
    connectionId: string,
    expectedRevision: string,
    requiredScopes: readonly string[],
    signal: AbortSignal,
    operation: (access: {
      token: string;
      signal: AbortSignal;
      checkCurrent(): void;
      source: GoogleAccount;
    }) => Promise<T>,
  ): Promise<T> {
    const task = this.withAccessOwned(connectionId, expectedRevision, requiredScopes, signal, operation);
    this.operations.add(task);
    const tasks = this.accountTasks.get(connectionId) ?? new Set<Promise<unknown>>();
    tasks.add(task);
    this.accountTasks.set(connectionId, tasks);
    try {
      return await task;
    } finally {
      this.operations.delete(task);
      tasks.delete(task);
      if (!tasks.size) this.accountTasks.delete(connectionId);
    }
  }
  private async withAccessOwned<T>(
    connectionId: string,
    expectedRevision: string,
    requiredScopes: readonly string[],
    signal: AbortSignal,
    operation: (access: {
      token: string;
      signal: AbortSignal;
      checkCurrent(): void;
      source: GoogleAccount;
    }) => Promise<T>,
  ): Promise<T> {
    const row = this.row(connectionId),
      controller = new AbortController();
    const joined = AbortSignal.any([signal, controller.signal]);
    const active = this.activeReads.get(connectionId) ?? new Set<AbortController>();
    active.add(controller);
    this.activeReads.set(connectionId, active);
    const checkCurrent = () => {
      joined.throwIfAborted();
      const current = this.account(connectionId);
      if (
        this.closed ||
        current.state !== "active" ||
        current.revision !== expectedRevision ||
        !requiredScopes.some((scope) => current.scopes.includes(scope as GoogleScope))
      )
        throw new AuxError("permission_denied", "The original Google account, scopes or grant changed.");
    };
    try {
      checkCurrent();
      const secret = await waitForToken(this.token(row), joined);
      checkCurrent();
      const result = await operation({
        token: secret.accessToken,
        signal: joined,
        checkCurrent,
        source: this.account(connectionId),
      });
      checkCurrent();
      return result;
    } catch (error) {
      if (joined.aborted) throw new AuxError("cancelled", "The original Google request was cancelled.");
      throw error;
    } finally {
      active.delete(controller);
      if (!active.size) this.activeReads.delete(connectionId);
    }
  }
  async revoke(connectionId: string): Promise<{ ok: true; providerRevocation: "confirmed" | "pending" }> {
    const row = this.row(connectionId);
    this.setupGeneration++;
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer);
      pending.server.close();
    }
    this.pending.clear();
    this.activeReads.get(connectionId)?.forEach((controller) => controller.abort());
    this.refreshControllers.get(connectionId)?.abort();
    this.deps.repo.db
      .prepare(
        "UPDATE calendar_connections SET revoked_at=?,updated_at=? WHERE connection_id=? AND revoked_at IS NULL",
      )
      .run(Date.now(), Date.now(), connectionId);
    this.deps.repo.db
      .prepare("UPDATE calendar_task_grants SET revoked_at=? WHERE connection_id=? AND revoked_at IS NULL")
      .run(Date.now(), connectionId);
    this.deps.repo.db
      .prepare("UPDATE google_task_grants SET revoked_at=? WHERE connection_id=? AND revoked_at IS NULL")
      .run(Date.now(), connectionId);
    this.deps.onChange?.();
    await Promise.allSettled(this.accountTasks.get(connectionId) ?? []);
    const raw = await this.deps.native
      .readSecret(row.secret_name)
      .then((result) => result.value)
      .catch(() => undefined);
    const localSecretRemoved = await this.deps.native
      .storeSecret(row.secret_name, "")
      .then(() => true)
      .catch(() => false);
    let refreshToken = "";
    try {
      refreshToken = (JSON.parse(raw ?? "") as Secret).refreshToken;
    } catch {
      /* already gone */
    }
    if (!refreshToken) return { ok: true, providerRevocation: "pending" };
    try {
      const response = await this.http(this.urls.revoke, {
        method: "POST",
        redirect: "error",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token: refreshToken }),
      });
      return { ok: true, providerRevocation: response.ok && localSecretRemoved ? "confirmed" : "pending" };
    } catch {
      return { ok: true, providerRevocation: "pending" };
    }
  }
  async close() {
    this.closed = true;
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer);
      pending.server.close();
    }
    this.pending.clear();
    for (const reads of this.activeReads.values()) for (const controller of reads) controller.abort();
    for (const controller of this.refreshControllers.values()) controller.abort();
    await Promise.allSettled([...this.operations, ...this.refreshing.values()]);
  }
}
