import { createHash, randomUUID } from "node:crypto";
import { createServer } from "node:net";
import { afterEach, expect, it, vi } from "vitest";
import type { XScope } from "@aux/contracts/x";
import { XAccountService } from "../../apps/runtime/src/services/x-accounts.js";
import { XGrantService } from "../../apps/runtime/src/services/x-grants.js";
import { xFixture } from "../fixtures/x.js";
const closes: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of closes.splice(0)) await close();
});
async function unusedPort() {
  const server = createServer();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw Error("Missing fixture socket");
  await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  return address.port;
}
async function fixture(configured = true) {
  const scopes: XScope[] = ["tweet.read", "users.read", "offline.access", "tweet.write"],
    f = xFixture(scopes),
    port = await unusedPort();
  let tokenScopes = scopes,
    owner = true;
  const http = vi.fn<typeof fetch>().mockImplementation(async (url, init) => {
    const path = new URL(String(url)).pathname;
    if (path === "/token") {
      const body = new URLSearchParams(init!.body as URLSearchParams);
      return Response.json({
        access_token: `fixture-access-${body.get("code") ?? "refreshed"}`,
        refresh_token: "fixture-refresh",
        token_type: "bearer",
        expires_in: 3600,
        scope: tokenScopes.join(" "),
      });
    }
    if (path === "/identity")
      return Response.json({
        data: { id: "123456789", username: "fixture_owner", name: "Fixture identity" },
      });
    if (path === "/revoke") return Response.json({});
    throw Error("Unexpected fixture provider route");
  });
  await f.accounts.close();
  const accounts = new XAccountService({
    records: f.records,
    native: f.native,
    ...(configured
      ? { clientId: "fixture-public-client", redirectUri: `http://127.0.0.1:${port}/oauth/x/callback` }
      : {}),
    fetch: http,
    endpoints: {
      auth: "https://provider.test/auth",
      token: "https://provider.test/token",
      revoke: "https://provider.test/revoke",
      identity: "https://provider.test/identity",
    },
  });
  const checkOwner = vi.fn(async () => {
    if (!owner) throw Error("Original native window retired");
  });
  closes.push(async () => {
    await accounts.close();
    f.repo.close();
  });
  const callback = (auth: { url: string }, code = "owner") => {
    const url = new URL(auth.url),
      result = new URL(url.searchParams.get("redirect_uri")!);
    result.searchParams.set("state", url.searchParams.get("state")!);
    result.searchParams.set("code", code);
    return result;
  };
  return {
    ...f,
    accounts,
    http,
    scopes,
    checkOwner,
    callback,
    ownerRetires: () => {
      owner = false;
    },
    tokenScopes: (next: XScope[]) => {
      tokenScopes = next;
    },
    connect: async () => {
      const auth = await accounts.start({ scopes, checkOwner });
      expect((await fetch(callback(auth))).status).toBe(200);
      return accounts.list().connections[0]!;
    },
  };
}
it("uses native public-client S256 PKCE, exact callback/state and explicit scopes without a client secret", async () => {
  const f = await fixture(),
    auth = await f.accounts.start({ scopes: f.scopes, checkOwner: f.checkOwner }),
    url = new URL(auth.url);
  expect(url.searchParams.get("redirect_uri")).toMatch(/^http:\/\/127\.0\.0\.1:[0-9]+\/oauth\/x\/callback$/);
  expect(url.searchParams.get("code_challenge_method")).toBe("S256");
  expect(url.searchParams.get("scope")).toBe(f.scopes.join(" "));
  const wrongState = f.callback(auth);
  wrongState.searchParams.set("state", "incorrect");
  expect((await fetch(wrongState)).status).toBe(400);
  expect(f.http).not.toHaveBeenCalled();
  expect((await fetch(f.callback(auth))).status).toBe(200);
  const body = new URLSearchParams(f.http.mock.calls[0]![1]!.body as URLSearchParams);
  expect(f.http.mock.calls[0]![1]!.headers).not.toHaveProperty("Authorization");
  expect(body.get("client_secret")).toBeNull();
  expect(body.get("client_id")).toBe("fixture-public-client");
  expect(createHash("sha256").update(body.get("code_verifier")!).digest("base64url")).toBe(
    url.searchParams.get("code_challenge"),
  );
  expect(f.accounts.list().connections[0]).toMatchObject({
    userId: "123456789",
    username: "fixture_owner",
    scopes: f.scopes,
    state: "active",
  });
});
it("keeps absent setup and insufficient explicit identity/offline scopes unavailable", async () => {
  const f = await fixture(false);
  expect(f.accounts.list()).toMatchObject({
    available: false,
    reason: expect.stringContaining("registered loopback"),
  });
  expect(f.accounts.list().connections[0]!.operations).toEqual([]);
  await expect(f.accounts.start({ scopes: f.scopes, checkOwner: f.checkOwner })).rejects.toMatchObject({
    code: "backend_unavailable",
  });
  const configured = await fixture();
  await expect(
    configured.accounts.start({ scopes: ["tweet.read", "users.read"], checkOwner: configured.checkOwner }),
  ).rejects.toMatchObject({ code: "invalid_params" });
});
it("refuses partial scope grants and a late setup after original-window retirement without replacing the old account", async () => {
  const f = await fixture(),
    original = f.accounts.list().connections[0]!;
  f.tokenScopes(["tweet.read", "users.read", "offline.access"]);
  let auth = await f.accounts.start({ scopes: f.scopes, checkOwner: f.checkOwner });
  expect((await fetch(f.callback(auth))).status).toBe(400);
  expect(f.accounts.account(original.connectionId).revision).toBe(original.revision);
  f.tokenScopes(f.scopes);
  auth = await f.accounts.start({ scopes: f.scopes, checkOwner: f.checkOwner });
  f.ownerRetires();
  expect((await fetch(f.callback(auth))).status).toBe(400);
  expect(f.accounts.account(original.connectionId).revision).toBe(original.revision);
});
it("rotates account epoch on reauthorization, retires old grants and aborts/joins original requests", async () => {
  const f = await fixture(),
    original = f.accounts.list().connections[0]!,
    grants = new XGrantService(f.repo, f.accounts);
  const grant = grants.create({
    taskId: f.task.taskId,
    taskRevision: 1,
    workspaceId: f.workspace.workspaceId,
    connectionId: original.connectionId,
    accountRevision: original.revision,
    operations: ["posts.read"],
  });
  let entered = false;
  const request = f.accounts.withAccess(
    original.connectionId,
    original.revision,
    ["tweet.read", "users.read"],
    new AbortController().signal,
    async (access) => {
      entered = true;
      await new Promise<never>((_resolve, reject) =>
        access.signal.addEventListener("abort", () => reject(access.signal.reason), { once: true }),
      );
    },
  );
  const rejected = request.then(
    () => undefined,
    (error: unknown) => error,
  );
  await vi.waitFor(() => expect(entered).toBe(true));
  const current = await f.connect();
  expect(await rejected).toBeInstanceOf(Error);
  expect(current.connectionId).toBe(original.connectionId);
  expect(current.revision).not.toBe(original.revision);
  expect(grants.list(f.task.taskId)).toEqual([]);
  expect(() => grants.require({ ...grant, operation: "posts.read" })).toThrow();
});
it("refreshes once for concurrent requests and persists the rotated native credential without changing account authority", async () => {
  const f = await fixture(),
    account = f.accounts.list().connections[0]!,
    record = f.records.get(account.connectionId),
    secret = JSON.parse(f.secrets.get(record.secretName)!);
  secret.expiresAt = 1;
  f.secrets.set(record.secretName, JSON.stringify(secret));
  let finish!: () => void;
  const release = new Promise<void>((resolve) => {
      finish = resolve;
    }),
    ordinary = f.http.getMockImplementation()!;
  f.http.mockImplementation(async (url, init) => {
    if (new URL(String(url)).pathname === "/token") await release;
    return ordinary(url, init);
  });
  const read = () =>
    f.accounts.withAccess(
      account.connectionId,
      account.revision,
      ["tweet.read"],
      new AbortController().signal,
      async (access) => access.token,
    );
  const first = read(),
    second = read();
  await vi.waitFor(() => expect(f.http).toHaveBeenCalledOnce());
  finish();
  expect(await Promise.all([first, second])).toEqual([
    "fixture-access-refreshed",
    "fixture-access-refreshed",
  ]);
  expect(f.http).toHaveBeenCalledOnce();
  expect(f.accounts.account(account.connectionId).revision).toBe(account.revision);
  expect(JSON.parse(f.secrets.get(record.secretName)!).refreshToken).toBe("fixture-refresh");
});
it("locally revokes before joining a held refresh; no late rotation can resurrect the account or secret", async () => {
  const f = await fixture(),
    account = f.accounts.list().connections[0]!,
    record = f.records.get(account.connectionId),
    secret = JSON.parse(f.secrets.get(record.secretName)!);
  secret.expiresAt = 1;
  f.secrets.set(record.secretName, JSON.stringify(secret));
  const ordinary = f.http.getMockImplementation()!;
  f.http.mockImplementation(async (url, init) => {
    if (new URL(String(url)).pathname === "/token")
      return new Promise<never>((_resolve, reject) =>
        init!.signal!.addEventListener("abort", () => reject(init!.signal!.reason), { once: true }),
      );
    return ordinary(url, init);
  });
  const read = f.accounts.withAccess(
    account.connectionId,
    account.revision,
    ["tweet.read"],
    new AbortController().signal,
    async () => "late",
  );
  const rejected = read.then(
    () => undefined,
    (error: unknown) => error,
  );
  await vi.waitFor(() => expect(f.http).toHaveBeenCalledOnce());
  const revoking = f.accounts.revoke(account.connectionId);
  expect(f.accounts.list().connections).toEqual([]);
  await revoking;
  expect(await rejected).toBeInstanceOf(Error);
  expect(f.secrets.has(record.secretName)).toBe(false);
  expect(() => f.accounts.account(account.connectionId)).toThrow();
  const body = new URLSearchParams(
    f.http.mock.calls.find(([url]) => new URL(String(url)).pathname === "/revoke")![1]!
      .body as URLSearchParams,
  );
  expect(body.get("client_id")).toBe("fixture-public-client");
});
it("rejects malformed protected account indexes and exact client/account substitutions", async () => {
  const f = await fixture(),
    account = f.accounts.list().connections[0]!;
  f.repo.db
    .prepare("UPDATE x_accounts SET user_id_lookup=? WHERE connection_id=?")
    .run("wrong", account.connectionId);
  expect(() => f.accounts.list()).toThrow(/identity changed/);
  f.repo.db
    .prepare("UPDATE x_accounts SET user_id_lookup=? WHERE connection_id=?")
    .run(f.repo.exactRecordLookup("x_accounts", "user_id", account.userId), account.connectionId);
  f.records.save({ ...f.record, epoch: randomUUID(), clientId: "another-public-client" });
  const changed = f.accounts.account(account.connectionId);
  expect(changed.operations).toEqual([]);
  await expect(
    f.accounts.withAccess(
      account.connectionId,
      changed.revision,
      ["tweet.read"],
      new AbortController().signal,
      async () => "wrong client",
    ),
  ).rejects.toMatchObject({ code: "permission_denied" });
});

it("lets Stop cancel one refresh waiter while the service still owns and joins the shared refresh", async () => {
  const f = await fixture(),
    account = f.accounts.list().connections[0]!,
    record = f.records.get(account.connectionId),
    secret = JSON.parse(f.secrets.get(record.secretName)!);
  secret.expiresAt = 1;
  f.secrets.set(record.secretName, JSON.stringify(secret));
  let finish!: () => void;
  const release = new Promise<void>((resolve) => {
      finish = resolve;
    }),
    ordinary = f.http.getMockImplementation()!;
  f.http.mockImplementation(async (url, init) => {
    if (new URL(String(url)).pathname === "/token") await release;
    return ordinary(url, init);
  });
  const controller = new AbortController();
  const first = f.accounts.withAccess(
    account.connectionId,
    account.revision,
    ["tweet.read"],
    controller.signal,
    async () => "cancelled result",
  );
  const rejected = first.then(
    () => undefined,
    (error: unknown) => error,
  );
  const second = f.accounts.withAccess(
    account.connectionId,
    account.revision,
    ["tweet.read"],
    new AbortController().signal,
    async (access) => access.token,
  );
  try {
    await vi.waitFor(() => expect(f.http).toHaveBeenCalledOnce());
    controller.abort(new Error("Original Stop"));
    expect(await rejected).toMatchObject({ message: "Original Stop" });
    expect(f.http.mock.calls[0]![1]!.signal!.aborted).toBe(false);
  } finally {
    finish();
  }
  expect(await second).toBe("fixture-access-refreshed");
  expect(f.http).toHaveBeenCalledOnce();
});
it("keeps failed staged-key cleanup as durable debt and retires it on reopen without changing the original account", async () => {
  const f = await fixture(),
    original = f.accounts.list().connections[0]!,
    ordinary = f.native.storeSecret.bind(f.native);
  let stagedName = "";
  const store = vi.spyOn(f.native, "storeSecret").mockImplementation(async (name, value) => {
    if (value && name !== f.record.secretName) {
      stagedName = name;
      const result = await ordinary(name, value);
      f.ownerRetires();
      return result;
    }
    if (!value && name === stagedName) throw Error("Fixture native cleanup denied");
    return ordinary(name, value);
  });
  const auth = await f.accounts.start({ scopes: f.scopes, checkOwner: f.checkOwner });
  expect((await fetch(f.callback(auth))).status).toBe(400);
  expect(f.accounts.account(original.connectionId).revision).toBe(original.revision);
  expect(f.secrets.has(stagedName)).toBe(true);
  const jobs = f.records.credentialJobs();
  expect(jobs).toHaveLength(1);
  expect(jobs[0]!.secretName).toBe(stagedName);
  expect(f.repo.db.prepare("SELECT body FROM x_credential_jobs").get()!.body).not.toContain("accessToken");
  await f.accounts.close();
  store.mockRestore();
  const reopened = new XAccountService({
    records: f.records,
    native: f.native,
    clientId: f.record.clientId,
    redirectUri: "http://127.0.0.1:18764/oauth/x/callback",
  });
  await reopened.ready();
  expect(f.secrets.has(stagedName)).toBe(false);
  expect(f.secrets.has(f.record.secretName)).toBe(true);
  expect(f.records.credentialJobs()).toEqual([]);
  expect(reopened.account(original.connectionId).revision).toBe(original.revision);
  await reopened.close();
});
it("retires restored foreign journal identities without touching another Profile's native keys", async () => {
  const f = await fixture(),
    name = f.record.secretName.replace(/[a-f0-9-]{36}$/, randomUUID());
  f.records.stageCredential(f.record.connectionId, name);
  f.secrets.set(name, "original-profile-fixture-value");
  await f.accounts.close();
  const store = vi.spyOn(f.native, "storeSecret");
  const restored = new XAccountService({
    records: f.records,
    native: f.native,
    clientId: f.record.clientId,
    redirectUri: "http://127.0.0.1:18764/oauth/x/callback",
    profileId: "another-profile",
  });
  await restored.ready();
  expect(store).not.toHaveBeenCalled();
  expect(f.secrets.has(name)).toBe(true);
  expect(f.records.credentialJobs()).toEqual([]);
  expect(restored.list().connections[0]!.operations).toEqual([]);
  await restored.close();
});
