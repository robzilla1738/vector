import { expect, it, vi } from "vitest";
import { McpOAuthService } from "../../apps/runtime/src/services/mcp-oauth.js";

type Provider = {
  redirectUrl?: string | URL;
  state?: () => string | Promise<string>;
  saveCodeVerifier(value: string): void | Promise<void>;
  codeVerifier(): string | Promise<string>;
  saveClientInformation?(info: { client_id: string }, context: { issuer: string }): void | Promise<void>;
  redirectToAuthorization(url: URL): void | Promise<void>;
  saveTokens(tokens: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  }): void | Promise<void>;
};
type Options = { authorizationCode?: string; iss?: string };

it("binds MCP OAuth callback state and source identity while storing tokens only in Keychain", async () => {
  const secrets = new Map<string, string>();
  const native = {
    readSecret: async (name: string) => ({ value: secrets.get(name) }),
    storeSecret: async (name: string, value: string) => {
      if (value) secrets.set(name, value);
      else secrets.delete(name);
      return { ok: true as const };
    },
  };
  const server = {
    serverId: "11111111-1111-4111-8111-111111111111",
    workspaceId: "workspace",
    name: "Remote",
    source: { kind: "remote" as const, url: "https://mcp.example.test/mcp", auth: "oauth" as const },
    state: "approved" as const,
    sourceDigest: "a".repeat(64),
    createdAt: 1,
    updatedAt: 1,
  };
  let callback = "";
  const runAuth = vi.fn(async (provider: Provider, options: Options) => {
    if (!options.authorizationCode) {
      callback = String(provider.redirectUrl);
      const state = await provider.state?.();
      await provider.saveCodeVerifier("fixture-verifier");
      await provider.saveClientInformation?.(
        { client_id: "fixture-client" },
        { issuer: "https://auth.example.test" },
      );
      await provider.redirectToAuthorization(new URL(`https://auth.example.test/authorize?state=${state}`));
      return "REDIRECT";
    }
    expect(options.authorizationCode).toBe("approved-code");
    expect(options.iss).toBe("https://auth.example.test");
    expect(await provider.codeVerifier()).toBe("fixture-verifier");
    await provider.saveTokens({
      access_token: "fixture-access",
      refresh_token: "fixture-refresh",
      token_type: "Bearer",
      expires_in: 3600,
    });
    return "AUTHORIZED";
  });
  const service = new McpOAuthService(native, fetch, runAuth as never);
  try {
    const started = await service.start(server);
    expect(started.state).toBe("authorization");
    if (started.state !== "authorization") throw new Error("Expected authorization URL");
    const state = new URL(started.url).searchParams.get("state");
    expect(state).toMatch(/^[A-Za-z0-9_-]+$/);
    expect((await fetch(`${callback}?code=approved-code&state=wrong`)).status).toBe(404);
    expect((await fetch(`${callback}?code=approved-code&state=${state}`)).status).toBe(400);
    // A rejected callback consumes this authorization attempt; a new one is required.
    const restarted = await service.start(server);
    if (restarted.state !== "authorization") throw new Error("Expected authorization URL");
    const renewedState = new URL(restarted.url).searchParams.get("state");
    expect(
      (
        await fetch(
          `${callback}?code=approved-code&state=${renewedState}&iss=https%3A%2F%2Fevil.example.test`,
        )
      ).status,
    ).toBe(400);
    const finalAttempt = await service.start(server);
    if (finalAttempt.state !== "authorization") throw new Error("Expected authorization URL");
    const finalState = new URL(finalAttempt.url).searchParams.get("state");
    expect(
      (await fetch(`${callback}?code=approved-code&state=${finalState}&iss=https%3A%2F%2Fauth.example.test`))
        .status,
    ).toBe(200);
    expect(await service.status(server)).toMatchObject({ connected: true });
    expect(await service.token(server)).toBe("fixture-access");
    expect(await service.status({ ...server, sourceDigest: "b".repeat(64) })).toMatchObject({
      connected: false,
    });
    expect([...secrets.values()].join(" ")).toContain("fixture-access");
    await service.clear(server);
    expect(await service.status(server)).toMatchObject({ connected: false });
    expect(secrets.size).toBe(0);
  } finally {
    service.close();
  }
});

it("does not restore a credential when disconnect races an in-flight OAuth exchange", async () => {
  const secrets = new Map<string, string>();
  let releaseWrite!: () => void;
  let writeStarted!: () => void;
  const startedWrite = new Promise<void>((resolve) => {
    writeStarted = resolve;
  });
  const holdWrite = new Promise<void>((resolve) => {
    releaseWrite = resolve;
  });
  let hold = false;
  const native = {
    readSecret: async (name: string) => ({ value: secrets.get(name) }),
    storeSecret: async (name: string, value: string) => {
      if (hold && value.includes("fixture-access")) {
        writeStarted();
        await holdWrite;
      }
      if (value) secrets.set(name, value);
      else secrets.delete(name);
      return { ok: true as const };
    },
  };
  const server = {
    serverId: "33333333-3333-4333-8333-333333333333",
    workspaceId: "workspace",
    name: "Remote",
    source: { kind: "remote" as const, url: "https://mcp.example.test/mcp", auth: "oauth" as const },
    state: "approved" as const,
    sourceDigest: "d".repeat(64),
    createdAt: 1,
    updatedAt: 1,
  };
  let callback = "";
  const runAuth = vi.fn(async (provider: Provider, options: Options) => {
    if (!options.authorizationCode) {
      callback = String(provider.redirectUrl);
      await provider.saveClientInformation?.(
        { client_id: "fixture-client" },
        { issuer: "https://auth.example.test" },
      );
      await provider.redirectToAuthorization(
        new URL(`https://auth.example.test/authorize?state=${await provider.state?.()}`),
      );
      return "REDIRECT";
    }
    await provider.saveTokens({
      access_token: "fixture-access",
      refresh_token: "fixture-refresh",
      token_type: "Bearer",
      expires_in: 3600,
    });
    return "AUTHORIZED";
  });
  const service = new McpOAuthService(native, fetch, runAuth as never);
  try {
    const result = await service.start(server);
    if (result.state !== "authorization") throw new Error("Expected authorization URL");
    hold = true;
    const pending = fetch(
      `${callback}?code=approved-code&state=${new URL(result.url).searchParams.get("state")}&iss=https%3A%2F%2Fauth.example.test`,
    );
    await startedWrite;
    const clearing = service.clear(server);
    releaseWrite();
    expect((await pending).status).toBe(400);
    await clearing;
    expect(secrets.size).toBe(0);
    expect(await service.status(server)).toMatchObject({ connected: false });
  } finally {
    service.close();
  }
});

it("completes SDK discovery, registration, code exchange, and refresh", async () => {
  const secrets = new Map<string, string>();
  const native = {
    readSecret: async (name: string) => ({ value: secrets.get(name) }),
    storeSecret: async (name: string, value: string) => {
      if (value) secrets.set(name, value);
      else secrets.delete(name);
      return { ok: true as const };
    },
  };
  const server = {
    serverId: "22222222-2222-4222-8222-222222222222",
    workspaceId: "workspace",
    name: "Remote",
    source: { kind: "remote" as const, url: "https://mcp.example.test/mcp", auth: "oauth" as const },
    state: "approved" as const,
    sourceDigest: "c".repeat(64),
    createdAt: 1,
    updatedAt: 1,
  };
  let tokenCalls = 0;
  let redirectUri = "";
  let codeExchange: URLSearchParams | undefined;
  let refreshExchange: URLSearchParams | undefined;
  const networkFetch: typeof fetch = async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    if (
      url.hostname === "mcp.example.test" &&
      url.pathname.startsWith("/.well-known/oauth-protected-resource")
    )
      return Response.json({
        resource: server.source.url,
        authorization_servers: ["https://auth.example.test"],
      });
    if (url.href === "https://auth.example.test/.well-known/oauth-authorization-server")
      return Response.json({
        issuer: "https://auth.example.test",
        authorization_endpoint: "https://auth.example.test/authorize",
        token_endpoint: "https://auth.example.test/token",
        registration_endpoint: "https://auth.example.test/register",
        code_challenge_methods_supported: ["S256"],
        response_types_supported: ["code"],
        grant_types_supported: ["authorization_code", "refresh_token"],
        authorization_response_iss_parameter_supported: true,
      });
    if (url.pathname === "/register") {
      const body = JSON.parse(String(init?.body)) as { redirect_uris: string[] };
      redirectUri = body.redirect_uris[0] ?? "";
      return Response.json({ client_id: "aux-test-client", redirect_uris: body.redirect_uris });
    }
    if (url.pathname === "/token") {
      tokenCalls++;
      const body = new URLSearchParams(String(init?.body));
      if (body.get("grant_type") === "authorization_code") {
        codeExchange = body;
      } else refreshExchange = body;
      return Response.json({
        access_token: `sdk-access-${tokenCalls}`,
        token_type: "Bearer",
        refresh_token: "sdk-refresh",
        expires_in: tokenCalls === 1 ? 1 : 3600,
      });
    }
    throw new Error(`Unexpected OAuth request: ${url.href}`);
  };
  const service = new McpOAuthService(native, networkFetch);
  try {
    const started = await service.start(server);
    expect(started.state).toBe("authorization");
    if (started.state !== "authorization") throw new Error("Expected authorization URL");
    const authorize = new URL(started.url);
    expect(authorize.origin).toBe("https://auth.example.test");
    expect(authorize.searchParams.get("code_challenge_method")).toBe("S256");
    const callback = new URL(redirectUri);
    callback.searchParams.set("code", "sdk-code");
    callback.searchParams.set("state", authorize.searchParams.get("state") ?? "");
    callback.searchParams.set("iss", "https://auth.example.test");
    expect((await fetch(callback)).status).toBe(200);
    expect(await service.token(server)).toBe("sdk-access-2");
    expect(tokenCalls).toBe(2);
    expect(codeExchange?.get("code")).toBe("sdk-code");
    expect(codeExchange?.get("redirect_uri")).toBe(redirectUri);
    expect(codeExchange?.get("code_verifier")).toBeTruthy();
    expect(refreshExchange?.get("refresh_token")).toBe("sdk-refresh");
  } finally {
    service.close();
  }
});
