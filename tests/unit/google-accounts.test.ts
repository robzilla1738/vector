import { afterEach, expect, it, vi } from "vitest";
import { Repo, openDb } from "@aux/runtime";
import type { NativeBridge } from "../../apps/runtime/src/native.js";
import { GoogleAccountService } from "../../apps/runtime/src/services/google-accounts.js";
import { CalendarConnectionService } from "../../apps/runtime/src/services/calendar-connections.js";
import type { GoogleScope } from "@aux/contracts/google";
const calendarScope = "https://www.googleapis.com/auth/calendar.readonly" as const;
const mailScope = "https://www.googleapis.com/auth/gmail.readonly" as const;
const closes: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of closes.splice(0)) await close();
});
function fixture(general = true) {
  const repo = new Repo(openDb(":memory:")),
    secrets = new Map<string, string>();
  let scopes: GoogleScope[] = [calendarScope];
  const native = {
    available: () => true,
    readSecret: async (name: string) => ({ value: secrets.get(name) }),
    storeSecret: async (name: string, value: string) => {
      if (value) secrets.set(name, value);
      else secrets.delete(name);
      return { ok: true as const };
    },
  } as NativeBridge;
  const http = vi.fn<typeof fetch>().mockImplementation(async (url, init) => {
    const path = new URL(String(url)).pathname;
    if (path === "/token") {
      const body = new URLSearchParams(init?.body as URLSearchParams);
      return Response.json({
        access_token: `access-${body.get("code") ?? "refreshed"}`,
        refresh_token: "refresh",
        expires_in: 3600,
        scope: scopes.join(" "),
      });
    }
    if (path === "/identity")
      return Response.json({ sub: "google-subject", email: "person@example.test", email_verified: true });
    if (path === "/calendar/users/me/calendarList/primary")
      return Response.json({ id: "person@example.test", summary: "Calendar person", primary: true });
    if (path === "/revoke") return Response.json({});
    throw new Error("Unexpected fixture route");
  });
  const endpoints = {
    auth: "https://provider.test/auth",
    token: "https://provider.test/token",
    revoke: "https://provider.test/revoke",
    calendar: "https://provider.test/calendar",
    identity: "https://provider.test/identity",
  };
  const accounts = new GoogleAccountService({
    repo,
    native,
    clientId: "legacy-calendar",
    ...(general ? { generalClientId: "general-google" } : {}),
    fetch: http,
    endpoints,
  });
  const calendar = new CalendarConnectionService({
    repo,
    native,
    clientId: "legacy-calendar",
    accounts,
    fetch: http,
    endpoints,
  });
  closes.push(async () => {
    await calendar.close();
    await accounts.close();
    repo.close();
  });
  const connect = async (selected: GoogleScope[]) => {
    scopes = selected;
    const auth = await accounts.start({ scopes: selected, checkOwner: async () => {} });
    const url = new URL(auth.url),
      callback = new URL(url.searchParams.get("redirect_uri")!);
    callback.searchParams.set("state", url.searchParams.get("state")!);
    callback.searchParams.set("code", "person");
    expect((await fetch(callback)).status).toBe(200);
    return { url, account: accounts.list().connections[0]! };
  };
  return { repo, accounts, calendar, secrets, http, connect };
}
it("does not broaden the legacy Calendar OAuth registration or grants", async () => {
  const f = fixture(false);
  await expect(f.accounts.start({ scopes: [mailScope] })).rejects.toMatchObject({
    code: "backend_unavailable",
  });
  const { url, account } = await f.connect([calendarScope]);
  expect(url.searchParams.get("client_id")).toBe("legacy-calendar");
  expect(url.searchParams.get("scope")).toBe(calendarScope);
  expect(account.operations).toEqual([]);
  expect(f.calendar.list().connections[0]).toMatchObject({
    connectionId: account.connectionId,
    scopes: [calendarScope],
  });
});
it("shares protected account identity while keeping new service scopes explicit and Calendar projection exact", async () => {
  const f = fixture(),
    first = await f.connect([calendarScope]);
  const next = await f.connect([mailScope]);
  expect(next.account.connectionId).toBe(first.account.connectionId);
  expect(next.account.revision).not.toBe(first.account.revision);
  expect(next.url.searchParams.get("client_id")).toBe("general-google");
  expect(next.url.searchParams.get("scope")).toBe(`${mailScope} openid email`);
  expect(next.url.searchParams.has("include_granted_scopes")).toBe(false);
  expect(next.account.operations).toContain("gmail.search");
  expect(next.account.operations).not.toContain("gmail.send");
  expect(f.calendar.list().connections).toEqual([]);
  await expect(
    f.calendar.events({
      connectionId: next.account.connectionId,
      timeMin: "2026-10-01T00:00:00Z",
      timeMax: "2026-10-02T00:00:00Z",
      limit: 1,
    }),
  ).rejects.toMatchObject({ code: "permission_denied" });
  await expect(
    f.accounts.withAccess(
      first.account.connectionId,
      first.account.revision,
      [calendarScope],
      new AbortController().signal,
      async () => "stale",
    ),
  ).rejects.toThrow(/changed/);
});
it("revokes a captured account and aborts/joins the original request without publishing its result", async () => {
  const f = fixture(),
    { account } = await f.connect([mailScope]);
  let observed: AbortSignal | undefined;
  const pending = f.accounts.withAccess(
    account.connectionId,
    account.revision,
    [mailScope],
    new AbortController().signal,
    async (access) => {
      observed = access.signal;
      return new Promise((_resolve, reject) =>
        access.signal.addEventListener("abort", () => reject(new Error("cancelled original")), {
          once: true,
        }),
      );
    },
  );
  const outcome = pending.catch((error: unknown) => error);
  await vi.waitFor(() => expect(observed).toBeDefined());
  await f.accounts.revoke(account.connectionId);
  expect(observed!.aborted).toBe(true);
  expect(await outcome).toMatchObject({ code: "cancelled" });
  expect(f.secrets.size).toBe(0);
});
it("requires native window ownership for general setup and does not resurrect an account from an in-flight setup after revoke", async () => {
  const f = fixture();
  await expect(f.accounts.start({ scopes: [mailScope] })).rejects.toMatchObject({
    code: "permission_denied",
  });
  const { account } = await f.connect([mailScope]);
  let identityStarted!: () => void, completeIdentity!: (r: Response) => void;
  const started = new Promise<void>((resolve) => (identityStarted = resolve));
  const fallback = f.http.getMockImplementation()!;
  f.http.mockImplementation(async (url, init) => {
    if (new URL(String(url)).pathname === "/identity") {
      identityStarted();
      return new Promise<Response>((resolve) => (completeIdentity = resolve));
    }
    return fallback(url, init);
  });
  const setup = await f.accounts.start({ scopes: [mailScope], checkOwner: async () => {} }),
    url = new URL(setup.url),
    callback = new URL(url.searchParams.get("redirect_uri")!);
  callback.searchParams.set("state", url.searchParams.get("state")!);
  callback.searchParams.set("code", "person");
  const pending = fetch(callback);
  await started;
  await f.accounts.revoke(account.connectionId);
  completeIdentity(
    Response.json({ sub: "google-subject", email: "person@example.test", email_verified: true }),
  );
  expect((await pending).status).toBe(400);
  expect(f.accounts.list().connections).toEqual([]);
  expect(f.secrets.size).toBe(0);
});
it("keeps a shared Google account service alive when its Calendar projection closes, but retires Calendar operations", async () => {
  const f = fixture();
  await f.connect([calendarScope]);
  await f.calendar.close();
  expect(() => f.calendar.start()).toThrow(/closed/);
  expect(f.accounts.list().connections).toHaveLength(1);
});
