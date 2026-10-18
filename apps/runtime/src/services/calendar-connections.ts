import { randomUUID } from "node:crypto";
import { GoogleAccountService } from "./google-accounts.js";
import {
  AuxError,
  CalendarConnectionSchema,
  CalendarEventsQuerySchema,
  CalendarTaskEventsQuerySchema,
  CalendarTaskGrantSchema,
  type CalendarConnection,
  type CalendarEvent,
  type CalendarEventsQuery,
  type CalendarTaskEventsQuery,
  type CalendarTaskGrant,
} from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { NativeBridge } from "../native.js";

const SCOPE = "https://www.googleapis.com/auth/calendar.readonly" as const;
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RESPONSE_BYTES = 1_000_000;

type Row = {
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
type GrantRow = {
  grant_id: string;
  task_id: string;
  task_revision: number;
  connection_id: string;
  created_at: number;
  revoked_at: number | null;
  account_key: string;
  account_key_lookup: string;
  label: string;
};
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
      if (total > MAX_RESPONSE_BYTES)
        throw new AuxError("backend_unavailable", "Calendar returned too much data for one page.");
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
  throw new AuxError("backend_unavailable", "Calendar returned invalid data.");
}

/** Outbound Google Calendar authority. No browser cookies or inbound MCP tokens enter this service. */
export class CalendarConnectionService {
  private accounts: GoogleAccountService;
  private ownsAccounts: boolean;
  private activeReads = new Map<string, Set<AbortController>>();
  private grantReads = new Map<string, Set<AbortController>>();
  private closed = false;

  constructor(
    private deps: {
      repo: Repo;
      accounts?: GoogleAccountService;
      native: NativeBridge;
      clientId?: string;
      profileId?: string;
      fetch?: typeof fetch;
      endpoints?: Endpoints;
      onChange?: () => void;
    },
  ) {
    this.ownsAccounts = !deps.accounts;
    this.accounts = deps.accounts ?? new GoogleAccountService(deps);
  }

  /** A crash or Keychain error after local revocation cannot reactivate the account. */
  cleanupRevokedSecrets(): Promise<void> {
    return this.accounts.cleanupRevokedSecrets();
  }

  private get http() {
    return this.deps.fetch ?? fetch;
  }
  private get urls() {
    return this.deps.endpoints ?? google;
  }
  private requireConfigured() {
    if (this.closed) throw new AuxError("cancelled", "Calendar connections are closed.");
    if (!this.deps.clientId || !this.deps.native.available())
      throw new AuxError(
        "backend_unavailable",
        "Google Calendar requires Aux desktop and a configured Google OAuth desktop client.",
      );
    return this.deps.clientId;
  }
  connectionRevision(connectionId: string): string {
    return this.accounts.account(connectionId).revision;
  }
  list(): { available: boolean; reason?: string; connections: CalendarConnection[] } {
    const available = !!this.deps.clientId && this.deps.native.available();
    const rows = this.deps.repo.db
      .prepare(
        "SELECT * FROM calendar_connections WHERE revoked_at IS NULL ORDER BY created_at,connection_id",
      )
      .all() as Row[];
    return {
      available,
      ...(!available
        ? {
            reason: "Google Calendar needs a configured OAuth desktop client and secure Aux desktop storage.",
          }
        : {}),
      connections: rows
        .filter((row) => JSON.parse(this.decode(row).scopes).includes(SCOPE))
        .map((row) => this.public(row)),
    };
  }
  private accountKey(row: Pick<Row, "connection_id" | "account_key" | "account_key_lookup">): string {
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
      throw new Error("Protected Calendar account lookup does not match its account.");
    return accountKey;
  }
  private decode(row: Row): Row {
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
  private public(row: Row): CalendarConnection {
    const value = this.decode(row);
    return CalendarConnectionSchema.parse({
      connectionId: value.connection_id,
      provider: "google",
      accountKey: value.account_key,
      label: value.label,
      scopes: [SCOPE],
      state: value.state,
      createdAt: value.created_at,
      updatedAt: value.updated_at,
    });
  }
  private row(connectionId: string): Row {
    const row = this.accounts.row(connectionId);
    if (!JSON.parse(row.scopes).includes(SCOPE))
      throw new AuxError("permission_denied", "This Google account has no Calendar read scope.");
    return row;
  }
  private grantRow(taskId: string, grantId: string): GrantRow {
    const grant = this.deps.repo.db
      .prepare(
        `SELECT g.*,c.account_key,c.account_key_lookup,c.label FROM calendar_task_grants g
      JOIN calendar_connections c ON c.connection_id=g.connection_id
      JOIN tasks t ON t.task_id=g.task_id
      WHERE g.grant_id=? AND g.task_id=? AND g.revoked_at IS NULL AND c.revoked_at IS NULL
        AND c.state='active' AND t.state='open' AND t.revision=g.task_revision`,
      )
      .get(grantId, taskId) as GrantRow | undefined;
    if (!grant)
      throw new AuxError(
        "permission_denied",
        "This task revision has no active grant for that Calendar account.",
      );
    return grant;
  }
  private publicGrant(row: GrantRow): CalendarTaskGrant {
    const accountKey = this.accountKey(row);
    const label = this.deps.repo.revealRecordField(
      "calendar_connections",
      [row.connection_id],
      "label",
      row.label,
    );
    return CalendarTaskGrantSchema.parse({
      grantId: row.grant_id,
      taskId: row.task_id,
      taskRevision: row.task_revision,
      connectionId: row.connection_id,
      accountKey,
      label,
      createdAt: row.created_at,
      ...(row.revoked_at == null ? {} : { revokedAt: row.revoked_at }),
    });
  }
  taskGrants(taskId: string): CalendarTaskGrant[] {
    if (!this.deps.repo.db.prepare("SELECT 1 FROM tasks WHERE task_id=?").get(taskId))
      throw new AuxError("not_found", "Task not found.");
    const rows = this.deps.repo.db
      .prepare(
        `SELECT g.*,c.account_key,c.account_key_lookup,c.label FROM calendar_task_grants g
      JOIN calendar_connections c ON c.connection_id=g.connection_id WHERE g.task_id=? AND g.revoked_at IS NULL AND c.revoked_at IS NULL
      ORDER BY g.created_at,g.grant_id`,
      )
      .all(taskId) as GrantRow[];
    return rows.map((row) => this.publicGrant(row));
  }
  grantTask(taskId: string, expectedRevision: number, connectionId: string): CalendarTaskGrant {
    const grant = this.deps.repo.transaction(() => {
      const task = this.deps.repo.db
        .prepare("SELECT revision,state FROM tasks WHERE task_id=?")
        .get(taskId) as { revision: number; state: string } | undefined;
      if (!task) throw new AuxError("not_found", "Task not found.");
      if (task.state !== "open" || task.revision !== expectedRevision)
        throw new AuxError(
          "conflict",
          "Save or restore the current task revision before granting Calendar access.",
        );
      const connection = this.row(connectionId);
      if (connection.state !== "active")
        throw new AuxError("needs_input", "Reconnect this Calendar account before granting it to a task.");
      const existing = this.deps.repo.db
        .prepare(
          `SELECT g.*,c.account_key,c.account_key_lookup,c.label FROM calendar_task_grants g JOIN calendar_connections c ON c.connection_id=g.connection_id
        WHERE g.task_id=? AND g.task_revision=? AND g.connection_id=? AND g.revoked_at IS NULL`,
        )
        .get(taskId, expectedRevision, connectionId) as GrantRow | undefined;
      if (existing) return this.publicGrant(existing);
      const grantId = randomUUID(),
        createdAt = Date.now();
      this.deps.repo.db
        .prepare(
          "INSERT INTO calendar_task_grants(grant_id,task_id,task_revision,connection_id,created_at) VALUES(?,?,?,?,?)",
        )
        .run(grantId, taskId, expectedRevision, connectionId, createdAt);
      return CalendarTaskGrantSchema.parse({
        grantId,
        taskId,
        taskRevision: expectedRevision,
        connectionId,
        accountKey: connection.account_key,
        label: connection.label,
        createdAt,
      });
    });
    this.deps.onChange?.();
    return grant;
  }
  revokeTaskGrant(taskId: string, grantId: string): { ok: true } {
    if (
      !this.deps.repo.db
        .prepare("SELECT 1 FROM calendar_task_grants WHERE grant_id=? AND task_id=? AND revoked_at IS NULL")
        .get(grantId, taskId)
    )
      throw new AuxError("not_found", "Calendar task grant not found.");
    this.deps.repo.db
      .prepare(
        "UPDATE calendar_task_grants SET revoked_at=? WHERE grant_id=? AND task_id=? AND revoked_at IS NULL",
      )
      .run(Date.now(), grantId, taskId);
    this.grantReads.get(grantId)?.forEach((controller) => controller.abort());
    this.deps.onChange?.();
    return { ok: true };
  }
  start(): Promise<{ url: string; expiresAt: number }> {
    this.requireConfigured();
    return this.accounts.start({ scopes: [SCOPE] });
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
      throw new AuxError("backend_unavailable", "Calendar is offline or unavailable. Try again later.");
    }
    if (response.status === 401)
      throw new AuxError("needs_input", "Calendar authorization expired. Reconnect this account.");
    if (response.status === 403)
      throw new AuxError("permission_denied", "Calendar access was denied by the account or organization.");
    if (response.status === 429)
      throw new AuxError("backend_unavailable", "Calendar is rate limited. Try again later.");
    if (!response.ok)
      throw new AuxError("backend_unavailable", `Calendar request failed (${response.status}).`);
    return jsonResponse(response);
  }
  async taskEvents(
    input: CalendarTaskEventsQuery,
    signal?: AbortSignal,
  ): Promise<{ events: CalendarEvent[]; nextPageToken?: string; fetchedAt: number }> {
    const query = CalendarTaskEventsQuerySchema.parse(input);
    const grant = this.grantRow(query.taskId, query.grantId);
    return this.events(
      {
        connectionId: grant.connection_id,
        timeMin: query.timeMin,
        timeMax: query.timeMax,
        limit: query.limit,
        ...(query.pageToken ? { pageToken: query.pageToken } : {}),
      },
      { taskId: query.taskId, grantId: query.grantId, connectionId: grant.connection_id },
      signal,
    );
  }
  async events(
    input: CalendarEventsQuery,
    grant?: { taskId: string; grantId: string; connectionId: string },
    signal?: AbortSignal,
  ): Promise<{ events: CalendarEvent[]; nextPageToken?: string; fetchedAt: number }> {
    this.requireConfigured();
    if (signal?.aborted) throw new AuxError("cancelled", "Calendar read was cancelled.");
    const query = CalendarEventsQuerySchema.parse(input);
    const checkGrant = () => {
      if (grant && this.grantRow(grant.taskId, grant.grantId).connection_id !== grant.connectionId)
        throw new AuxError("permission_denied", "Calendar task grant changed during the read.");
    };
    checkGrant();
    const row = this.row(query.connectionId);
    if (row.state !== "active")
      throw new AuxError("needs_input", "Reconnect this Calendar account before reading events.");
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    signal?.addEventListener("abort", onAbort, { once: true });
    if (signal?.aborted) controller.abort();
    const active = this.activeReads.get(query.connectionId) ?? new Set<AbortController>();
    active.add(controller);
    this.activeReads.set(query.connectionId, active);
    if (grant) {
      const granted = this.grantReads.get(grant.grantId) ?? new Set<AbortController>();
      granted.add(controller);
      this.grantReads.set(grant.grantId, granted);
    }
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      return await this.accounts.withAccess(
        query.connectionId,
        this.accounts.account(query.connectionId).revision,
        [SCOPE],
        controller.signal,
        async (access) => {
          const secret = { accessToken: access.token };
          if (controller.signal.aborted) throw new AuxError("cancelled", "Calendar read was cancelled.");
          if (this.row(query.connectionId).secret_name !== row.secret_name)
            throw new AuxError("cancelled", "Calendar connection changed before the read.");
          checkGrant();
          const url = new URL("https://calendar.invalid/calendars/primary/events");
          for (const [key, value] of Object.entries({
            timeMin: query.timeMin,
            timeMax: query.timeMax,
            maxResults: String(query.limit),
            singleEvents: "true",
            orderBy: "startTime",
          }))
            url.searchParams.set(key, value);
          if (query.pageToken) url.searchParams.set("pageToken", query.pageToken);
          const response = await this.calendarGet(
            `${url.pathname}${url.search}`,
            secret.accessToken,
            access.signal,
          );
          if (this.row(query.connectionId).secret_name !== row.secret_name)
            throw new AuxError("cancelled", "Calendar connection changed during the read.");
          checkGrant();
          const fetchedAt = Date.now();
          const items = Array.isArray(response.items) ? response.items.slice(0, query.limit) : [];
          const events = items.flatMap((raw): CalendarEvent[] => {
            if (!raw || typeof raw !== "object") return [];
            const item = raw as Record<string, unknown>;
            const start =
              item.start && typeof item.start === "object" ? (item.start as Record<string, unknown>) : {};
            const end = item.end && typeof item.end === "object" ? (item.end as Record<string, unknown>) : {};
            const eventId = typeof item.id === "string" ? item.id.slice(0, 1024) : "";
            const first =
              typeof start.dateTime === "string"
                ? start.dateTime
                : typeof start.date === "string"
                  ? start.date
                  : "";
            const last =
              typeof end.dateTime === "string" ? end.dateTime : typeof end.date === "string" ? end.date : "";
            if (!eventId || !first || !last) return [];
            let eventUrl: string | undefined;
            if (typeof item.htmlLink === "string")
              try {
                const parsed = new URL(item.htmlLink);
                const provider = new URL(this.urls.calendar);
                const loopback =
                  provider.protocol === "http:" &&
                  provider.hostname === "127.0.0.1" &&
                  parsed.origin === provider.origin;
                if (
                  !parsed.username &&
                  !parsed.password &&
                  (loopback ||
                    (parsed.protocol === "https:" &&
                      (parsed.hostname === "calendar.google.com" ||
                        (parsed.hostname === "www.google.com" && parsed.pathname.startsWith("/calendar/")))))
                )
                  eventUrl = parsed.href.slice(0, 8192);
              } catch {
                /* no link */
              }
            return [
              {
                eventId,
                title: typeof item.summary === "string" ? item.summary.slice(0, 1000) : "Untitled event",
                start: first.slice(0, 100),
                end: last.slice(0, 100),
                url: eventUrl,
                source: {
                  connectionId: query.connectionId,
                  ...(this.deps.profileId ? { profileId: this.deps.profileId } : {}),
                  accountKey: row.account_key,
                  calendarId: row.account_key,
                  fetchedAt,
                },
              },
            ];
          });
          const nextPageToken =
            typeof response.nextPageToken === "string" ? response.nextPageToken.slice(0, 2048) : undefined;
          return { events, ...(nextPageToken ? { nextPageToken } : {}), fetchedAt };
        },
      );
    } catch (error) {
      if (controller.signal.aborted)
        throw new AuxError("cancelled", "Calendar read was cancelled or timed out.");
      if (error instanceof AuxError && error.code === "needs_input") {
        this.deps.repo.db
          .prepare(
            "UPDATE calendar_connections SET state='needs_reauth',updated_at=? WHERE connection_id=? AND revoked_at IS NULL",
          )
          .run(Date.now(), query.connectionId);
        this.deps.onChange?.();
      }
      throw error;
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", onAbort);
      active.delete(controller);
      if (!active.size) this.activeReads.delete(query.connectionId);
      if (grant) {
        const granted = this.grantReads.get(grant.grantId);
        granted?.delete(controller);
        if (!granted?.size) this.grantReads.delete(grant.grantId);
      }
    }
  }
  async revoke(connectionId: string): Promise<{ ok: true; providerRevocation: "confirmed" | "pending" }> {
    this.row(connectionId);
    this.activeReads.get(connectionId)?.forEach((controller) => controller.abort());
    return this.accounts.revoke(connectionId);
  }
  async close() {
    this.closed = true;
    for (const reads of this.activeReads.values()) for (const controller of reads) controller.abort();
    if (this.ownsAccounts) await this.accounts.close();
  }
}
