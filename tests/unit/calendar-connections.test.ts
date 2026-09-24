import { afterEach, describe, expect, it } from "vitest";
import { CalendarConnectionService } from "../../apps/runtime/src/services/calendar-connections.js";
import { openDb } from "../../apps/runtime/src/store/db.js";
import { Repo } from "../../apps/runtime/src/store/repo.js";
import type { NativeBridge } from "../../apps/runtime/src/native.js";

const scope = "https://www.googleapis.com/auth/calendar.readonly";
const endpoints = { auth: "https://provider.test/auth", token: "https://provider.test/token", revoke: "https://provider.test/revoke", calendar: "https://provider.test/calendar" };
const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => { for (const db of databases.splice(0)) db.close(); });

function fixture(options: { denied?: boolean; rateLimited?: boolean; partial?: boolean; offline?: boolean; onEvents?: (signal: AbortSignal | null | undefined) => Promise<Response> } = {}) {
  const db = openDb(":memory:"); databases.push(db);
  const secrets = new Map<string, string>();
  const native = { available: () => true, storeSecret: async (name: string, value: string) => { if (value) secrets.set(name, value); else secrets.delete(name); return { ok: true as const }; }, readSecret: async (name: string) => ({ value: secrets.get(name) }) } as NativeBridge;
  const calls: { url: URL; init?: RequestInit }[] = [];
  const http: typeof fetch = async (input, init) => {
    const url = new URL(String(input)); calls.push({ url, init });
    if (options.offline) throw new TypeError("offline");
    if (url.pathname === "/token") {
      const body = new URLSearchParams(init?.body as URLSearchParams);
      if (body.get("grant_type") === "refresh_token") return Response.json({ access_token: `renewed-${body.get("refresh_token")}`, expires_in: 3600 });
      const account = body.get("code")!;
      return Response.json({ access_token: `access-${account}`, refresh_token: `refresh-${account}`, scope: options.partial ? "openid" : scope, expires_in: 3600 });
    }
    if (url.pathname === "/calendar/users/me/calendarList/primary") {
      if (options.denied) return Response.json({}, { status: 403 });
      const account = String((init?.headers as Record<string, string>).Authorization).replace("Bearer access-", "");
      return Response.json({ id: `${account}@example.test`, summary: `Calendar ${account}`, primary: true });
    }
    if (url.pathname === "/calendar/calendars/primary/events") {
      if (options.rateLimited) return Response.json({}, { status: 429 });
      if (options.onEvents) return options.onEvents(init?.signal);
      const account = String((init?.headers as Record<string, string>).Authorization).replace(/^Bearer (?:access-|renewed-refresh-)/, "");
      return Response.json({ items: [{ id: `event-${account}`, summary: `Meeting ${account}`, start: { dateTime: "2026-09-25T10:00:00Z" }, end: { dateTime: "2026-09-25T11:00:00Z" } }], nextPageToken: url.searchParams.has("pageToken") ? undefined : "next" });
    }
    if (url.pathname === "/revoke") return Response.json({});
    throw new Error(`Unexpected request ${url}`);
  };
  const service = new CalendarConnectionService({ repo: new Repo(db), native, clientId: "desktop-client", fetch: http, endpoints });
  return { db, secrets, calls, service };
}

async function connect(service: CalendarConnectionService, account: string) {
  const auth = await service.start();
  const url = new URL(auth.url);
  expect(url.searchParams.get("scope")).toBe(scope);
  expect(url.searchParams.get("code_challenge_method")).toBe("S256");
  expect(url.searchParams.get("code_challenge")).toBeTruthy();
  const callback = new URL(url.searchParams.get("redirect_uri")!);
  callback.searchParams.set("state", url.searchParams.get("state")!);
  callback.searchParams.set("code", account);
  return fetch(callback);
}

describe("outbound Google Calendar connection", () => {
  it("isolates two accounts, paginates bounded reads, refreshes, and removes the revoked secret", async () => {
    const { db, secrets, calls, service } = fixture();
    try {
      expect((await connect(service, "alice")).status).toBe(200);
      expect((await connect(service, "bob")).status).toBe(200);
      const connections = service.list().connections;
      expect(connections.map(item => item.accountKey)).toEqual(["alice@example.test", "bob@example.test"]);
      expect(JSON.stringify(db.prepare("SELECT * FROM calendar_connections").all())).not.toContain("refresh-alice");
      const alice = connections[0]!;
      const query = { connectionId: alice.connectionId, timeMin: "2026-09-24T00:00:00Z", timeMax: "2026-09-30T00:00:00Z", limit: 25 };
      const first = await service.events(query);
      expect(first.events[0]?.title).toBe("Meeting alice");
      expect(first.events[0]?.source.accountKey).toBe("alice@example.test");
      expect(first.nextPageToken).toBe("next");
      expect((await service.events({ ...query, pageToken: first.nextPageToken })).nextPageToken).toBeUndefined();
      expect(calls.find(call => call.url.searchParams.get("pageToken") === "next")).toBeTruthy();
      const secretName = (db.prepare("SELECT secret_name FROM calendar_connections WHERE connection_id=?").get(alice.connectionId) as { secret_name: string }).secret_name;
      const secret = JSON.parse(secrets.get(secretName)!) as { accessToken: string; refreshToken: string; expiresAt: number };
      secrets.set(secretName, JSON.stringify({ ...secret, expiresAt: 0 }));
      expect((await service.events(query)).events[0]?.title).toBe("Meeting alice");
      expect(JSON.parse(secrets.get(secretName)!).accessToken).toBe("renewed-refresh-alice");
      expect(await service.revoke(alice.connectionId)).toEqual({ ok: true, providerRevocation: "confirmed" });
      expect(secrets.has(secretName)).toBe(false);
      await expect(service.events(query)).rejects.toThrow(/revoked/);
      expect(service.list().connections).toHaveLength(1);
    } finally { await service.close(); }
  });

  it("rejects partial grants and organization denial without persisting credentials", async () => {
    for (const options of [{ partial: true }, { denied: true }]) {
      const { service, secrets } = fixture(options);
      try {
        expect((await connect(service, "alice")).status).toBe(400);
        expect(service.list().connections).toHaveLength(0);
        expect(secrets.size).toBe(0);
      } finally { await service.close(); }
    }
  });

  it("keeps account state intact on rate limit and offline failures", async () => {
    for (const option of ["rateLimited", "offline"] as const) {
      const faults: { rateLimited?: boolean; offline?: boolean } = {};
      const setup = fixture(faults);
      try {
        expect((await connect(setup.service, "alice")).status).toBe(200);
        const account = setup.service.list().connections[0]!;
        const query = { connectionId: account.connectionId, timeMin: "2026-09-24T00:00:00Z", timeMax: "2026-09-30T00:00:00Z", limit: 25 };
        faults[option] = true;
        await expect(setup.service.events(query)).rejects.toThrow();
        expect(setup.service.list().connections[0]?.state).toBe("active");
      } finally { await setup.service.close(); }
    }
  });

  it("cancels an in-flight read when its account is revoked", async () => {
    let reading!: () => void;
    const begun = new Promise<void>(resolve => { reading = resolve; });
    const setup = fixture({ onEvents: async signal => {
      reading();
      return new Promise<Response>((_resolve, reject) => signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true }));
    } });
    try {
      expect((await connect(setup.service, "alice")).status).toBe(200);
      const account = setup.service.list().connections[0]!;
      const read = setup.service.events({ connectionId: account.connectionId, timeMin: "2026-09-24T00:00:00Z", timeMax: "2026-09-30T00:00:00Z", limit: 25 });
      await begun;
      await setup.service.revoke(account.connectionId);
      await expect(read).rejects.toThrow(/cancelled/);
    } finally { await setup.service.close(); }
  });
});
