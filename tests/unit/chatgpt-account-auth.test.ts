import { afterEach, expect, it, vi } from "vitest";
import { generateKeyPairSync, randomUUID, sign } from "node:crypto";
import { ChatgptAccounts, ChatgptAuthService, chatgptAccountId } from "@aux/runtime";

const cleanups: Array<() => Promise<void>> = [];
afterEach(async () => {
  for (const close of cleanups.splice(0)) await close();
});
const clientId = "oaiapp_aux_fixture",
  subject = "fixture-account",
  accountId = chatgptAccountId(clientId, subject);
function credentials(expiresAt = Date.now() + 3600000) {
  return {
    accountId,
    clientId,
    subject,
    email: "fixture@example.test",
    accessToken: "synthetic-access",
    refreshToken: "synthetic-refresh",
    idToken: "synthetic-id",
    expiresAt,
    scopes: ["chatgpt.tokens.use.direct", "resource.invoke"],
  };
}
async function accountsFixture(expiry?: number) {
  const hostId = randomUUID();
  let value =
    expiry === undefined
      ? undefined
      : JSON.stringify({ version: 1, hostId, selected: accountId, accounts: [credentials(expiry)] });
  const native = {
    readSecret: vi.fn(async () => ({ value })),
    storeSecret: vi.fn(async (_key: string, next: string) => {
      value = next;
      return { ok: true as const };
    }),
  };
  const accounts = new ChatgptAccounts(native, hostId);
  await accounts.initialize();
  cleanups.push(() => accounts.close());
  return { accounts, native, hostId, read: () => value };
}
function jwt(
  privateKey: ReturnType<typeof generateKeyPairSync>["privateKey"],
  nonce: string,
  audience = clientId,
) {
  const now = Math.floor(Date.now() / 1000),
    parts = [
      Buffer.from(JSON.stringify({ alg: "RS256", kid: "fixture-key" })).toString("base64url"),
      Buffer.from(
        JSON.stringify({
          iss: "https://auth.openai.com",
          aud: audience,
          sub: subject,
          nonce,
          iat: now,
          exp: now + 3600,
          email: "fixture@example.test",
        }),
      ).toString("base64url"),
    ];
  return `${parts.join(".")}.${sign("RSA-SHA256", Buffer.from(parts.join(".")), privateKey).toString("base64url")}`;
}
async function poll(service: ChatgptAuthService, id: string) {
  for (let i = 0; i < 100; i++) {
    const status = await service.status(id, "original");
    if (status.phase !== "authenticating") return status;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error("Fixture sign-in did not settle.");
}

it("registers the official local client with exact PKCE, issued identity and protected account receipts", async () => {
  const f = await accountsFixture(),
    keys = generateKeyPairSync("rsa", { modulusLength: 2048 });
  let nonce = "",
    exchanged: URLSearchParams | undefined;
  const network = vi.fn<typeof fetch>(async (input, init) => {
    const url = String(input);
    if (url.endsWith("/oauth/token")) {
      exchanged = new URLSearchParams(String(init?.body));
      return Response.json({
        access_token: "synthetic-access",
        refresh_token: "synthetic-refresh",
        id_token: jwt(keys.privateKey, nonce),
        token_type: "Bearer",
        expires_in: 3600,
        scope: "openid profile email offline_access resource.invoke chatgpt.tokens.use.direct",
      });
    }
    if (url.endsWith("openid-configuration"))
      return Response.json({
        issuer: "https://auth.openai.com",
        jwks_uri: "https://auth.openai.com/.well-known/jwks.json",
      });
    return Response.json({
      keys: [{ ...keys.publicKey.export({ format: "jwk" }), kid: "fixture-key", alg: "RS256" }],
    });
  });
  const activate = vi.fn(async (_account: unknown, check: () => Promise<void>) => {
    await check();
    return { generation: "original", rollback: async () => {} };
  });
  const service = new ChatgptAuthService({
    accounts: f.accounts,
    hostId: f.hostId,
    generation: () => "original",
    checkOwner: async (owner) => {
      expect(owner).toBe("original");
    },
    activate,
    fetch: network,
  });
  cleanups.push(() => service.close());
  const attempt = await service.start("original"),
    url = new URL(attempt.authorizationUrl);
  nonce = url.searchParams.get("nonce")!;
  expect(url.origin).toBe("https://auth.openai.com");
  expect(url.searchParams.get("client_id")).toBe("dynamic_agent_client");
  expect(url.searchParams.get("agent_name_hint")).toBe("Aux");
  expect(url.searchParams.get("ext_agent_host_id")).toBe(`urn:uuid:${f.hostId}`);
  expect(url.searchParams.get("code_challenge_method")).toBe("S256");
  const callback = new URL(url.searchParams.get("redirect_uri")!);
  expect(callback.hostname).toBe("127.0.0.1");
  expect(callback.pathname).toBe("/auth/callback");
  callback.search = new URLSearchParams({
    state: url.searchParams.get("state")!,
    code: "one-use-code",
    client_id: clientId,
  }).toString();
  expect((await fetch(callback)).status).toBe(200);
  expect((await poll(service, attempt.attemptId)).phase).toBe("connected");
  expect(exchanged?.get("client_id")).toBe(clientId);
  expect(exchanged?.get("client_secret")).toBeNull();
  expect(exchanged?.get("redirect_uri")).toBe(url.searchParams.get("redirect_uri"));
  expect(activate).toHaveBeenCalledOnce();
  expect(f.accounts.summaries()).toEqual([
    { accountId, email: "fixture@example.test", selected: true, connected: true },
  ]);
  expect(f.read()).toContain('"clientId":"oaiapp_aux_fixture"');
});

it("refuses a JWT with the wrong original nonce without replacing an existing account", async () => {
  const f = await accountsFixture(Date.now() + 3600000),
    keys = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const before = f.read();
  const network: typeof fetch = async (input) =>
    String(input).endsWith("/oauth/token")
      ? Response.json({
          access_token: "replacement",
          refresh_token: "replacement-refresh",
          id_token: jwt(keys.privateKey, "wrong-nonce"),
          token_type: "Bearer",
          expires_in: 3600,
          scope: "resource.invoke chatgpt.tokens.use.direct",
        })
      : String(input).endsWith("openid-configuration")
        ? Response.json({
            issuer: "https://auth.openai.com",
            jwks_uri: "https://auth.openai.com/.well-known/jwks.json",
          })
        : Response.json({
            keys: [{ ...keys.publicKey.export({ format: "jwk" }), kid: "fixture-key", alg: "RS256" }],
          });
  const service = new ChatgptAuthService({
    accounts: f.accounts,
    hostId: f.hostId,
    generation: () => "original",
    checkOwner: async () => {},
    activate: vi.fn(),
    fetch: network,
  });
  cleanups.push(() => service.close());
  const attempt = await service.start("original", accountId),
    url = new URL(attempt.authorizationUrl),
    callback = new URL(url.searchParams.get("redirect_uri")!);
  callback.search = new URLSearchParams({ state: url.searchParams.get("state")!, code: "code" }).toString();
  await fetch(callback);
  expect((await poll(service, attempt.attemptId)).phase).toBe("failed");
  expect(f.read()).toBe(before);
});

it("coalesces rotating refreshes and preserves the issued account mapping", async () => {
  const hostId = randomUUID();
  let saved = JSON.stringify({ version: 1, hostId, selected: accountId, accounts: [credentials(1)] });
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const network = vi.fn<typeof fetch>(async (_input, init) => {
    const body = new URLSearchParams(String(init?.body));
    expect(body.get("client_id")).toBe(clientId);
    expect(body.get("refresh_token")).toBe("synthetic-refresh");
    expect(body.get("scope")).toBeNull();
    await held;
    return Response.json({
      access_token: "new-access",
      refresh_token: "new-refresh",
      token_type: "Bearer",
      expires_in: 3600,
      scope: "resource.invoke chatgpt.tokens.use.direct",
    });
  });
  const service = new ChatgptAccounts(
    {
      readSecret: async () => ({ value: saved }),
      storeSecret: async (_name, value) => {
        saved = value;
        return { ok: true as const };
      },
    },
    hostId,
    network,
  );
  await service.initialize();
  cleanups.push(() => service.close());
  const first = service.accessToken(accountId),
    second = service.accessToken(accountId);
  release();
  expect(await Promise.all([first, second])).toEqual(["new-access", "new-access"]);
  expect(network).toHaveBeenCalledOnce();
  expect(JSON.parse(saved).accounts[0]).toMatchObject({
    clientId,
    subject,
    accessToken: "new-access",
    refreshToken: "new-refresh",
    idToken: "synthetic-id",
  });
});

it("rolls back only its own protected write when the original owner retires during persistence", async () => {
  const hostId = randomUUID();
  let saved = JSON.stringify({ version: 1, hostId, accounts: [] }),
    owner = true,
    armed = false;
  const original = saved;
  const service = new ChatgptAccounts(
    {
      readSecret: async () => ({ value: saved }),
      storeSecret: async (_name, value) => {
        saved = value;
        if (armed) owner = false;
        return { ok: true as const };
      },
    },
    hostId,
  );
  await service.initialize();
  cleanups.push(() => service.close());
  armed = true;
  await expect(
    service.install(
      credentials(),
      async () => {
        if (!owner) throw new Error("Original document retired.");
      },
      async () => {},
    ),
  ).rejects.toThrow(/retired/);
  expect(saved).toBe(original);
  expect(service.summaries()).toEqual([]);
});

it("joins an original pending owner lookup on close without creating a late callback listener", async () => {
  const fixture = await accountsFixture();
  const { Server } = await import("node:http");
  const listen = vi.spyOn(Server.prototype, "listen");
  let releaseOwner!: () => void;
  const owner = new Promise<void>((resolve) => {
    releaseOwner = resolve;
  });
  const activate = vi.fn(async () => ({ generation: "original", rollback: async () => {} }));
  const service = new ChatgptAuthService({
    accounts: fixture.accounts,
    hostId: fixture.hostId,
    generation: () => "original",
    checkOwner: async () => owner,
    activate,
  });
  cleanups.push(() => service.close());
  try {
    const start = service.start("original");
    const rejected = expect(start).rejects.toMatchObject({ code: "cancelled" });
    // Let the registered start reach its original owner lookup before retirement.
    await Promise.resolve();
    let joined = false;
    const close = service.close().then(() => {
      joined = true;
    });
    await Promise.resolve();
    await Promise.resolve();
    expect(joined).toBe(false);
    expect(listen).not.toHaveBeenCalled();
    releaseOwner();
    await rejected;
    await close;
    expect(joined).toBe(true);
    expect(listen).not.toHaveBeenCalled();
    expect(activate).not.toHaveBeenCalled();
    expect(fixture.native.storeSecret).not.toHaveBeenCalled();
  } finally {
    releaseOwner();
    await service.close();
    listen.mockRestore();
  }
});

it("retains an uncertain protected write until its original rollback is actually confirmed", async () => {
  const hostId = randomUUID();
  const original = JSON.stringify({ version: 1, hostId, accounts: [] });
  let saved = original;
  let live = true;
  let refuseRollback = true;
  const native = {
    readSecret: vi.fn(async () => ({ value: saved })),
    storeSecret: vi.fn(async (_key: string, next: string) => {
      if (next === original && refuseRollback) throw new Error("Original rollback unavailable.");
      saved = next;
      if (next !== original) live = false;
      return { ok: true as const };
    }),
  };
  const service = new ChatgptAccounts(native, hostId);
  await service.initialize();
  cleanups.push(() => service.close());
  const check = async () => {
    if (!live) throw new Error("Original owner retired.");
  };
  try {
    await expect(service.install(credentials(), check, async () => {})).rejects.toBeInstanceOf(
      AggregateError,
    );
    expect(saved).not.toBe(original);
    expect(() => service.summaries()).toThrow(AggregateError);
    const calls = native.storeSecret.mock.calls.length;
    await expect(
      service.install(
        credentials(),
        async () => {},
        async () => {},
      ),
    ).rejects.toBeInstanceOf(AggregateError);
    expect(native.storeSecret.mock.calls).toHaveLength(calls);
    await expect(service.close()).rejects.toBeInstanceOf(AggregateError);
    expect(saved).not.toBe(original);
  } finally {
    refuseRollback = false;
    await service.close();
  }
  expect(saved).toBe(original);
});
