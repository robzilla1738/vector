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
  const connect = async (selected: GoogleScope[], code = "person") => {
    scopes = selected;
    const auth = await accounts.start({ scopes: selected, checkOwner: async () => {} });
    const url = new URL(auth.url),
      callback = new URL(url.searchParams.get("redirect_uri")!);
    callback.searchParams.set("state", url.searchParams.get("state")!);
    callback.searchParams.set("code", code);
    expect((await fetch(callback)).status).toBe(200);
    return { url, account: accounts.list().connections[0]! };
  };
  return { repo, accounts, calendar, secrets, http, connect, native };
}

function expireAccount(f: ReturnType<typeof fixture>, connectionId: string) {
  const name = f.accounts.row(connectionId).secret_name;
  const secret = JSON.parse(f.secrets.get(name)!);
  f.secrets.set(name, JSON.stringify({ ...secret, expiresAt: 1 }));
  return name;
}

it.each([
  ["denied", () => Response.json({ error: "invalid_grant" }, { status: 400 })],
  ["unauthorized", () => Response.json({ error: "invalid_client" }, { status: 401 })],
  [
    "scope loss",
    () => Response.json({ access_token: "retired-token", expires_in: 3600, scope: calendarScope }),
  ],
  ["success", () => Response.json({ access_token: "retired-token", expires_in: 3600, scope: mailScope })],
] as const)("a late original refresh %s cannot change a reconnected account", async (_name, response) => {
  const f = fixture(),
    original = (await f.connect([mailScope], "original")).account,
    originalSecret = expireAccount(f, original.connectionId);
  let began!: () => void, finish!: (value: Response) => void;
  const started = new Promise<void>((resolve) => (began = resolve));
  const fallback = f.http.getMockImplementation()!;
  f.http.mockImplementation(async (url, init) => {
    if (
      new URL(String(url)).pathname === "/token" &&
      new URLSearchParams(init?.body as URLSearchParams).get("grant_type") === "refresh_token"
    ) {
      began();
      // The original network task still has to join even if cancellation races its response.
      return new Promise<Response>((resolve) => (finish = resolve));
    }
    return fallback(url, init);
  });
  const dispatch = vi.fn(async () => "old result"),
    originalResult = f.accounts
      .withAccess(
        original.connectionId,
        original.revision,
        [mailScope],
        new AbortController().signal,
        dispatch,
      )
      .catch((error: unknown) => error);
  await started;
  try {
    const replacement = (await f.connect([mailScope], "replacement")).account;
    expect(replacement.connectionId).toBe(original.connectionId);
    expect(replacement.revision).not.toBe(original.revision);
    const replacementSecret = f.accounts.row(replacement.connectionId).secret_name;
    const replacementBytes = f.secrets.get(replacementSecret);
    finish(response());
    // Close joins the actual refresh, not just the cancelled withAccess waiter.
    await f.accounts.close();
    expect(await originalResult).toMatchObject({ code: "cancelled" });
    expect(dispatch).not.toHaveBeenCalled();
    expect(f.accounts.account(replacement.connectionId)).toMatchObject({
      state: "active",
      revision: replacement.revision,
      scopes: [mailScope],
    });
    expect(f.secrets.get(replacementSecret)).toBe(replacementBytes);
    expect(f.secrets.has(originalSecret)).toBe(false);
  } finally {
    finish(response());
  }
});

it("a replacement account refresh does not reuse or lose the retired account's pending task", async () => {
  const f = fixture(),
    original = (await f.connect([mailScope], "original")).account;
  expireAccount(f, original.connectionId);
  const refreshes: { finish(value: Response): void; signal: AbortSignal }[] = [];
  const fallback = f.http.getMockImplementation()!;
  f.http.mockImplementation(async (url, init) => {
    if (
      new URL(String(url)).pathname === "/token" &&
      new URLSearchParams(init?.body as URLSearchParams).get("grant_type") === "refresh_token"
    )
      return new Promise<Response>((finish) => refreshes.push({ finish, signal: init!.signal! }));
    return fallback(url, init);
  });
  const originalResult = f.accounts
    .withAccess(
      original.connectionId,
      original.revision,
      [mailScope],
      new AbortController().signal,
      async () => "old",
    )
    .catch((error: unknown) => error);
  await vi.waitFor(() => expect(refreshes).toHaveLength(1));
  let replacementResult: Promise<unknown> | undefined;
  try {
    const replacement = (await f.connect([mailScope], "replacement")).account;
    expireAccount(f, replacement.connectionId);
    replacementResult = f.accounts
      .withAccess(
        replacement.connectionId,
        replacement.revision,
        [mailScope],
        new AbortController().signal,
        async (access) => access.token,
      )
      .catch((error: unknown) => error);
    await vi.waitFor(() => expect(refreshes).toHaveLength(2));
    expect(refreshes[0]!.signal.aborted).toBe(true);
    expect(refreshes[1]!.signal.aborted).toBe(false);
    refreshes[0]!.finish(Response.json({ error: "invalid_grant" }, { status: 400 }));
    refreshes[1]!.finish(
      Response.json({ access_token: "replacement-refreshed", expires_in: 3600, scope: mailScope }),
    );
    expect(await replacementResult).toBe("replacement-refreshed");
    expect(await originalResult).toMatchObject({ code: "cancelled" });
    expect(f.accounts.account(replacement.connectionId).state).toBe("active");
    expect(refreshes).toHaveLength(2);
  } finally {
    for (const refresh of refreshes)
      refresh.finish(Response.json({ error: "invalid_grant" }, { status: 400 }));
    await Promise.allSettled([originalResult, ...(replacementResult ? [replacementResult] : [])]);
  }
});

it("revocation joins the original refresh and refuses its late token without retaining a credential", async () => {
  const f = fixture(),
    account = (await f.connect([mailScope])).account;
  const originalSecret = expireAccount(f, account.connectionId);
  let began!: () => void, finish!: (value: Response) => void, signal: AbortSignal | undefined;
  const started = new Promise<void>((resolve) => (began = resolve));
  const fallback = f.http.getMockImplementation()!;
  f.http.mockImplementation(async (url, init) => {
    if (
      new URL(String(url)).pathname === "/token" &&
      new URLSearchParams(init?.body as URLSearchParams).get("grant_type") === "refresh_token"
    ) {
      signal = init!.signal!;
      began();
      return new Promise<Response>((resolve) => (finish = resolve));
    }
    return fallback(url, init);
  });
  const dispatch = vi.fn(async () => "forbidden late result"),
    result = f.accounts
      .withAccess(account.connectionId, account.revision, [mailScope], new AbortController().signal, dispatch)
      .catch((error: unknown) => error);
  await started;
  let retired = false;
  const retirement = f.accounts.revoke(account.connectionId).then((value) => {
    retired = true;
    return value;
  });
  try {
    expect(await result).toMatchObject({ code: "cancelled" });
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(signal!.aborted).toBe(true);
    expect(retired).toBe(false);
  } finally {
    finish(Response.json({ access_token: "late-revoked-token", expires_in: 3600, scope: mailScope }));
    await retirement;
  }
  expect(dispatch).not.toHaveBeenCalled();
  expect(f.accounts.list().connections).toEqual([]);
  expect(f.secrets.has(originalSecret)).toBe(false);
});

it.each([
  ["denial", () => Response.json({ error: "invalid_grant" }, { status: 400 })],
  [
    "scope loss",
    () => Response.json({ access_token: "changed-scope", expires_in: 3600, scope: calendarScope }),
  ],
] as const)(
  "a current account refresh %s still requires reauthorization without changing granted scopes",
  async (_name, response) => {
    const f = fixture(),
      account = (await f.connect([mailScope])).account;
    expireAccount(f, account.connectionId);
    f.http.mockResolvedValueOnce(response());
    const dispatch = vi.fn(async () => "must not dispatch");
    await expect(
      f.accounts.withAccess(
        account.connectionId,
        account.revision,
        [mailScope],
        new AbortController().signal,
        dispatch,
      ),
    ).rejects.toMatchObject({ code: "needs_input" });
    expect(dispatch).not.toHaveBeenCalled();
    expect(f.accounts.account(account.connectionId)).toMatchObject({
      state: "needs_reauth",
      scopes: [mailScope],
      operations: [],
    });
  },
);

it("cancelling one original refresh waiter preserves the other waiter's shared account refresh", async () => {
  const f = fixture(),
    account = (await f.connect([mailScope])).account;
  expireAccount(f, account.connectionId);
  let finish!: (value: Response) => void, signal: AbortSignal | undefined;
  f.http.mockImplementationOnce(async (_url, init) => {
    signal = init!.signal!;
    return new Promise<Response>((resolve) => (finish = resolve));
  });
  const baselineCalls = f.http.mock.calls.length,
    cancelled = new AbortController(),
    firstDispatch = vi.fn(async () => "cancelled result"),
    first = f.accounts
      .withAccess(account.connectionId, account.revision, [mailScope], cancelled.signal, firstDispatch)
      .catch((error: unknown) => error),
    second = f.accounts.withAccess(
      account.connectionId,
      account.revision,
      [mailScope],
      new AbortController().signal,
      async (access) => access.token,
    );
  try {
    await vi.waitFor(() => expect(signal).toBeDefined());
    cancelled.abort();
    expect(await first).toMatchObject({ code: "cancelled" });
    expect(signal!.aborted).toBe(false);
    finish(Response.json({ access_token: "shared-refreshed", expires_in: 3600, scope: mailScope }));
    expect(await second).toBe("shared-refreshed");
    expect(firstDispatch).not.toHaveBeenCalled();
    expect(f.http.mock.calls.length - baselineCalls).toBe(1);
    expect(f.accounts.account(account.connectionId).state).toBe("active");
  } finally {
    finish(Response.json({ error: "fixture cleanup" }, { status: 400 }));
    await Promise.allSettled([first, second]);
  }
});
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
