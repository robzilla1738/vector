import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createServer, type Server } from "node:http";
import { AuxError, CalendarConnectionSchema, CalendarEventsQuerySchema, type CalendarConnection, type CalendarEvent, type CalendarEventsQuery } from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { NativeBridge } from "../native.js";

const SCOPE = "https://www.googleapis.com/auth/calendar.readonly" as const;
const AUTH_LIFETIME_MS = 5 * 60_000;
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RESPONSE_BYTES = 1_000_000;

type Row = { connection_id: string; account_key: string; label: string; secret_name: string; scopes: string; state: "active" | "needs_reauth"; created_at: number; updated_at: number };
type Secret = { accessToken: string; refreshToken: string; expiresAt: number };
type Pending = { server: Server; timer: NodeJS.Timeout; verifier: string; redirectUri: string };
type Endpoints = { auth: string; token: string; revoke: string; calendar: string };
const google: Endpoints = {
  auth: "https://accounts.google.com/o/oauth2/v2/auth",
  token: "https://oauth2.googleapis.com/token",
  revoke: "https://oauth2.googleapis.com/revoke",
  calendar: "https://www.googleapis.com/calendar/v3",
};

async function jsonResponse(response: Response): Promise<Record<string, unknown>> {
  const reader = response.body?.getReader();
  if (!reader) throw new AuxError("backend_unavailable", "Calendar returned an empty response.");
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_RESPONSE_BYTES) throw new AuxError("backend_unavailable", "Calendar returned too much data for one page.");
      chunks.push(value);
    }
  } finally { await reader.cancel().catch(() => undefined); }
  try {
    const value: unknown = JSON.parse(new TextDecoder().decode(Buffer.concat(chunks)));
    if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  } catch { /* malformed provider response */ }
  throw new AuxError("backend_unavailable", "Calendar returned invalid data.");
}

/** Outbound Google Calendar authority. No browser cookies or inbound MCP tokens enter this service. */
export class CalendarConnectionService {
  private pending = new Map<string, Pending>();
  private activeReads = new Map<string, Set<AbortController>>();
  private refreshing = new Map<string, Promise<Secret>>();
  private closed = false;

  constructor(private deps: { repo: Repo; native: NativeBridge; clientId?: string; fetch?: typeof fetch; endpoints?: Endpoints; onChange?: () => void }) {}

  private get http() { return this.deps.fetch ?? fetch; }
  private get urls() { return this.deps.endpoints ?? google; }
  private requireConfigured() {
    if (!this.deps.clientId || !this.deps.native.available()) throw new AuxError("backend_unavailable", "Google Calendar requires Aux desktop and a configured Google OAuth desktop client.");
    return this.deps.clientId;
  }
  list(): { available: boolean; reason?: string; connections: CalendarConnection[] } {
    const available = !!this.deps.clientId && this.deps.native.available();
    const rows = this.deps.repo.db.prepare("SELECT * FROM calendar_connections WHERE revoked_at IS NULL ORDER BY created_at,connection_id").all() as Row[];
    return { available, ...(!available ? { reason: "Google Calendar needs a configured OAuth desktop client and secure Aux desktop storage." } : {}), connections: rows.map(row => this.public(row)) };
  }
  private public(row: Row): CalendarConnection {
    return CalendarConnectionSchema.parse({ connectionId: row.connection_id, provider: "google", accountKey: row.account_key,
      label: row.label, scopes: JSON.parse(row.scopes), state: row.state, createdAt: row.created_at, updatedAt: row.updated_at });
  }
  private row(connectionId: string): Row {
    const row = this.deps.repo.db.prepare("SELECT * FROM calendar_connections WHERE connection_id=? AND revoked_at IS NULL").get(connectionId) as Row | undefined;
    if (!row) throw new AuxError("not_found", "Calendar connection is unavailable or revoked.");
    return row;
  }
  async start(): Promise<{ url: string; expiresAt: number }> {
    if (this.closed) throw new AuxError("cancelled", "Calendar sign-in is unavailable while Aux closes.");
    const clientId = this.requireConfigured();
    if (this.pending.size >= 3) throw new AuxError("conflict", "Finish or cancel an existing Calendar sign-in first.");
    const state = randomBytes(32).toString("base64url");
    const verifier = randomBytes(48).toString("base64url");
    const challenge = createHash("sha256").update(verifier).digest("base64url");
    const server = createServer((request, response) => {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      if (request.method !== "GET" || url.pathname !== "/oauth/google-calendar" || url.searchParams.get("state") !== state || !this.pending.has(state)) {
        response.writeHead(404).end("This authorization request is unavailable."); return;
      }
      const pending = this.pending.get(state)!;
      this.pending.delete(state); clearTimeout(pending.timer); server.close();
      const code = url.searchParams.get("code");
      if (!code || url.searchParams.has("error")) { response.writeHead(400).end("Calendar access was not granted. Return to Aux and try again."); return; }
      void this.finish(code, pending).then(() => {
        response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
        response.end("<!doctype html><title>Calendar connected</title><p>Calendar connected. Return to Aux.</p>");
      }).catch(() => {
        response.writeHead(400, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
        response.end("<!doctype html><title>Calendar connection failed</title><p>Calendar could not be connected. Return to Aux and try again.</p>");
      });
    });
    await new Promise<void>((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", () => { server.off("error", reject); resolve(); }); });
    const address = server.address();
    if (!address || typeof address === "string") { server.close(); throw new AuxError("backend_unavailable", "Cannot start the Calendar sign-in callback."); }
    const redirectUri = `http://127.0.0.1:${address.port}/oauth/google-calendar`;
    const expiresAt = Date.now() + AUTH_LIFETIME_MS;
    const timer = setTimeout(() => { this.pending.delete(state); server.close(); }, AUTH_LIFETIME_MS);
    timer.unref();
    this.pending.set(state, { server, timer, verifier, redirectUri });
    const url = new URL(this.urls.auth);
    for (const [key, value] of Object.entries({ client_id: clientId, redirect_uri: redirectUri, response_type: "code", scope: SCOPE,
      access_type: "offline", prompt: "consent", state, code_challenge: challenge, code_challenge_method: "S256" })) url.searchParams.set(key, value);
    return { url: url.href, expiresAt };
  }
  private async finish(code: string, pending: Pending) {
    if (this.closed) throw new AuxError("cancelled", "Calendar sign-in was cancelled.");
    const clientId = this.requireConfigured();
    const response = await this.http(this.urls.token, { method: "POST", redirect: "error", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, client_id: clientId, redirect_uri: pending.redirectUri, code_verifier: pending.verifier, grant_type: "authorization_code" }) });
    if (!response.ok) throw new AuxError("needs_input", "Calendar authorization failed. Try connecting again.");
    const data = await jsonResponse(response);
    const accessToken = typeof data.access_token === "string" ? data.access_token : "";
    const refreshToken = typeof data.refresh_token === "string" ? data.refresh_token : "";
    const scopes = typeof data.scope === "string" ? data.scope.split(/\s+/) : [];
    if (!accessToken || !refreshToken || !scopes.includes(SCOPE)) throw new AuxError("needs_input", "Calendar did not grant durable read-only access. Reconnect and approve calendar reading.");
    const identity = await this.calendarGet("/users/me/calendarList/primary", accessToken);
    if (this.closed) throw new AuxError("cancelled", "Calendar sign-in was cancelled.");
    const accountKey = typeof identity.id === "string" ? identity.id : "";
    if (!accountKey || accountKey.length > 320 || identity.primary !== true) throw new AuxError("backend_unavailable", "Calendar did not identify the primary account.");
    const label = typeof identity.summary === "string" && identity.summary.trim() ? identity.summary.trim().slice(0, 320) : accountKey;
    const previous = this.deps.repo.db.prepare("SELECT * FROM calendar_connections WHERE provider='google' AND account_key=? AND revoked_at IS NULL").get(accountKey) as Row | undefined;
    const connectionId = previous?.connection_id ?? randomUUID();
    const secretName = `calendar-${randomUUID().replaceAll("-", "")}`;
    const expiresAt = Date.now() + Math.max(60, Number(data.expires_in) || 3600) * 1000;
    await this.deps.native.storeSecret(secretName, JSON.stringify({ accessToken, refreshToken, expiresAt } satisfies Secret));
    try {
      if (this.closed) throw new AuxError("cancelled", "Calendar sign-in was cancelled.");
      const now = Date.now();
      if (previous) {
        const updated = this.deps.repo.db.prepare("UPDATE calendar_connections SET label=?,secret_name=?,scopes=?,state='active',updated_at=? WHERE connection_id=? AND revoked_at IS NULL")
          .run(label, secretName, JSON.stringify([SCOPE]), now, connectionId);
        if (!updated.changes) throw new AuxError("cancelled", "Calendar connection changed during sign-in.");
      }
      else this.deps.repo.db.prepare("INSERT INTO calendar_connections(connection_id,provider,account_key,label,secret_name,scopes,state,created_at,updated_at) VALUES(?,'google',?,?,?,?, 'active',?,?)")
        .run(connectionId, accountKey, label, secretName, JSON.stringify([SCOPE]), now, now);
    } catch (error) { await this.deps.native.storeSecret(secretName, "").catch(() => undefined); throw error; }
    if (previous) await this.deps.native.storeSecret(previous.secret_name, "").catch(() => undefined);
    this.deps.onChange?.();
  }
  private async calendarGet(path: string, token: string, signal?: AbortSignal): Promise<Record<string, unknown>> {
    let response: Response;
    try {
      response = await this.http(`${this.urls.calendar}${path}`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        redirect: "error", signal: signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    } catch { throw new AuxError("backend_unavailable", "Calendar is offline or unavailable. Try again later."); }
    if (response.status === 401) throw new AuxError("needs_input", "Calendar authorization expired. Reconnect this account.");
    if (response.status === 403) throw new AuxError("permission_denied", "Calendar access was denied by the account or organization.");
    if (response.status === 429) throw new AuxError("backend_unavailable", "Calendar is rate limited. Try again later.");
    if (!response.ok) throw new AuxError("backend_unavailable", `Calendar request failed (${response.status}).`);
    return jsonResponse(response);
  }
  private async token(row: Row): Promise<Secret> {
    const raw = (await this.deps.native.readSecret(row.secret_name)).value;
    let secret: Secret;
    try { secret = JSON.parse(raw ?? "") as Secret; }
    catch { throw new AuxError("needs_input", "Calendar credentials are unavailable. Reconnect this account."); }
    if (!secret.accessToken || !secret.refreshToken || !Number.isFinite(secret.expiresAt)) throw new AuxError("needs_input", "Calendar credentials are incomplete. Reconnect this account.");
    if (secret.expiresAt > Date.now() + 60_000) return secret;
    const existing = this.refreshing.get(row.connection_id);
    if (existing) return existing;
    const task = this.refresh(row, secret);
    this.refreshing.set(row.connection_id, task);
    try { return await task; } finally { this.refreshing.delete(row.connection_id); }
  }
  private async refresh(row: Row, prior: Secret): Promise<Secret> {
    const response = await this.http(this.urls.token, { method: "POST", redirect: "error", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: this.requireConfigured(), refresh_token: prior.refreshToken, grant_type: "refresh_token" }) });
    if (!response.ok) {
      if (response.status === 400 || response.status === 401) {
        this.deps.repo.db.prepare("UPDATE calendar_connections SET state='needs_reauth',updated_at=? WHERE connection_id=? AND revoked_at IS NULL").run(Date.now(), row.connection_id);
        this.deps.onChange?.();
        throw new AuxError("needs_input", "Calendar authorization expired. Reconnect this account.");
      }
      throw new AuxError("backend_unavailable", `Calendar token refresh failed (${response.status}).`);
    }
    const data = await jsonResponse(response);
    if (typeof data.access_token !== "string" || !data.access_token) throw new AuxError("backend_unavailable", "Calendar token refresh returned no access token.");
    if (typeof data.scope === "string" && !data.scope.split(/\s+/).includes(SCOPE)) {
      this.deps.repo.db.prepare("UPDATE calendar_connections SET state='needs_reauth',updated_at=? WHERE connection_id=? AND revoked_at IS NULL").run(Date.now(), row.connection_id);
      this.deps.onChange?.();
      throw new AuxError("needs_input", "Calendar read access was removed. Reconnect this account.");
    }
    const secret: Secret = { accessToken: data.access_token, refreshToken: typeof data.refresh_token === "string" ? data.refresh_token : prior.refreshToken,
      expiresAt: Date.now() + Math.max(60, Number(data.expires_in) || 3600) * 1000 };
    if (this.row(row.connection_id).secret_name !== row.secret_name) throw new AuxError("cancelled", "Calendar connection changed during refresh.");
    await this.deps.native.storeSecret(row.secret_name, JSON.stringify(secret));
    const current = this.deps.repo.db.prepare("SELECT secret_name FROM calendar_connections WHERE connection_id=? AND revoked_at IS NULL").get(row.connection_id) as { secret_name: string } | undefined;
    if (current?.secret_name !== row.secret_name) {
      await this.deps.native.storeSecret(row.secret_name, "").catch(() => undefined);
      throw new AuxError("cancelled", "Calendar connection changed during refresh.");
    }
    return secret;
  }
  async events(input: CalendarEventsQuery): Promise<{ events: CalendarEvent[]; nextPageToken?: string; fetchedAt: number }> {
    const query = CalendarEventsQuerySchema.parse(input);
    const row = this.row(query.connectionId);
    if (row.state !== "active") throw new AuxError("needs_input", "Reconnect this Calendar account before reading events.");
    const secret = await this.token(row);
    if (this.row(query.connectionId).secret_name !== row.secret_name) throw new AuxError("cancelled", "Calendar connection changed before the read.");
    const controller = new AbortController();
    const active = this.activeReads.get(query.connectionId) ?? new Set<AbortController>();
    active.add(controller); this.activeReads.set(query.connectionId, active);
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const url = new URL("https://calendar.invalid/calendars/primary/events");
      for (const [key, value] of Object.entries({ timeMin: query.timeMin, timeMax: query.timeMax, maxResults: String(query.limit), singleEvents: "true", orderBy: "startTime" })) url.searchParams.set(key, value);
      if (query.pageToken) url.searchParams.set("pageToken", query.pageToken);
      const response = await this.calendarGet(`${url.pathname}${url.search}`, secret.accessToken, controller.signal);
      if (this.row(query.connectionId).secret_name !== row.secret_name) throw new AuxError("cancelled", "Calendar connection changed during the read.");
      const fetchedAt = Date.now();
      const items = Array.isArray(response.items) ? response.items.slice(0, query.limit) : [];
      const events = items.flatMap((raw): CalendarEvent[] => {
        if (!raw || typeof raw !== "object") return [];
        const item = raw as Record<string, unknown>;
        const start = item.start && typeof item.start === "object" ? item.start as Record<string, unknown> : {};
        const end = item.end && typeof item.end === "object" ? item.end as Record<string, unknown> : {};
        const eventId = typeof item.id === "string" ? item.id.slice(0, 1024) : "";
        const first = typeof start.dateTime === "string" ? start.dateTime : typeof start.date === "string" ? start.date : "";
        const last = typeof end.dateTime === "string" ? end.dateTime : typeof end.date === "string" ? end.date : "";
        if (!eventId || !first || !last) return [];
        let eventUrl: string | undefined;
        if (typeof item.htmlLink === "string") try { const parsed = new URL(item.htmlLink); if (parsed.protocol === "https:" && !parsed.username && !parsed.password) eventUrl = parsed.href.slice(0, 8192); } catch { /* no link */ }
        return [{ eventId, title: typeof item.summary === "string" ? item.summary.slice(0, 1000) : "Untitled event", start: first.slice(0, 100), end: last.slice(0, 100), url: eventUrl,
          source: { connectionId: query.connectionId, accountKey: row.account_key, calendarId: row.account_key, fetchedAt } }];
      });
      const nextPageToken = typeof response.nextPageToken === "string" ? response.nextPageToken.slice(0, 2048) : undefined;
      return { events, ...(nextPageToken ? { nextPageToken } : {}), fetchedAt };
    } catch (error) {
      if (controller.signal.aborted) throw new AuxError("cancelled", "Calendar read was cancelled or timed out.");
      if (error instanceof AuxError && error.code === "needs_input") {
        this.deps.repo.db.prepare("UPDATE calendar_connections SET state='needs_reauth',updated_at=? WHERE connection_id=? AND revoked_at IS NULL").run(Date.now(), query.connectionId);
        this.deps.onChange?.();
      }
      throw error;
    } finally { clearTimeout(timeout); active.delete(controller); if (!active.size) this.activeReads.delete(query.connectionId); }
  }
  async revoke(connectionId: string): Promise<{ ok: true; providerRevocation: "confirmed" | "pending" }> {
    const row = this.row(connectionId);
    this.activeReads.get(connectionId)?.forEach(controller => controller.abort());
    this.deps.repo.db.prepare("UPDATE calendar_connections SET revoked_at=?,updated_at=? WHERE connection_id=? AND revoked_at IS NULL")
      .run(Date.now(), Date.now(), connectionId);
    this.deps.onChange?.();
    const raw = await this.deps.native.readSecret(row.secret_name).then(result => result.value).catch(() => undefined);
    await this.deps.native.storeSecret(row.secret_name, "");
    let refreshToken = "";
    try { refreshToken = (JSON.parse(raw ?? "") as Secret).refreshToken; } catch { /* already gone */ }
    if (!refreshToken) return { ok: true, providerRevocation: "pending" };
    try {
      const response = await this.http(this.urls.revoke, { method: "POST", redirect: "error", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ token: refreshToken }) });
      return { ok: true, providerRevocation: response.ok ? "confirmed" : "pending" };
    } catch { return { ok: true, providerRevocation: "pending" }; }
  }
  async close() {
    this.closed = true;
    for (const pending of this.pending.values()) { clearTimeout(pending.timer); pending.server.close(); }
    this.pending.clear();
    for (const reads of this.activeReads.values()) for (const controller of reads) controller.abort();
  }
}
