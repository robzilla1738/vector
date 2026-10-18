import { createServer } from "node:http";
import { expect, it, vi } from "vitest";
import { McpOAuthService } from "../../apps/runtime/src/services/mcp-oauth.js";

const remote = {
  serverId: "11111111-1111-4111-8111-111111111111",
  workspaceId: "space",
  name: "Official",
  source: { kind: "remote" as const, url: "https://provider.test/mcp", auth: "oauth" as const },
  state: "active" as const,
  toolsRevision: 0,
  disabledTools: [],
  toolNames: [],
  sourceDigest: "a".repeat(64),
  createdAt: 1,
  updatedAt: 1,
};
const info = {
  authorizationServerUrl: "https://auth.provider.test",
  authorizationServerMetadata: {
    issuer: "https://auth.provider.test",
    authorization_endpoint: "https://auth.provider.test/authorize",
    token_endpoint: "https://auth.provider.test/token",
    response_types_supported: ["code"],
    code_challenge_methods_supported: ["S256"],
    authorization_response_iss_parameter_supported: true,
  },
};
function storage() {
  const values = new Map<string, string>();
  return {
    values,
    native: {
      readSecret: async (key: string) => ({ value: values.get(key) }),
      storeSecret: async (key: string, value: string) => {
        values.set(key, value);
        return { ok: true as const };
      },
    },
  };
}
async function availableCallback() {
  const server = createServer();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Expected loopback listener");
  await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  return `http://127.0.0.1:${address.port}/oauth/mcp`;
}
it("stores an Aux-owned registered client only in Keychain and uses its exact registered callback", async () => {
  const { native, values } = storage();
  const callback = await availableCallback();
  const authorize: NonNullable<ConstructorParameters<typeof McpOAuthService>[2]> = vi.fn(async (provider) => {
    expect(await provider.clientInformation({ issuer: info.authorizationServerUrl })).toMatchObject({
      client_id: "aux-owned",
      client_secret: "private-client-secret",
    });
    expect(String(provider.redirectUrl)).toBe(callback);
    await provider.saveCodeVerifier("original-pkce-verifier");
    await provider.redirectToAuthorization(new URL("https://auth.provider.test/authorize"));
    return "REDIRECT" as const;
  });
  const discover: NonNullable<ConstructorParameters<typeof McpOAuthService>[3]> = vi.fn(async () => info);
  const service = new McpOAuthService(native, fetch, authorize, discover);
  try {
    expect(await service.requirements(remote)).toMatchObject({
      automaticRegistration: false,
      configured: false,
    });
    await service.configure(remote, {
      serverId: remote.serverId,
      issuer: info.authorizationServerUrl,
      clientId: "aux-owned",
      clientSecret: "private-client-secret",
      redirectUrl: callback,
    });
    const requirements = await service.requirements(remote);
    expect(requirements).toMatchObject({ configured: true, redirectUrl: callback });
    expect(JSON.stringify(requirements)).not.toContain("private-client-secret");
    expect([...values.values()].join()).toContain("private-client-secret");
    expect((await service.start(remote)).state).toBe("authorization");
    await service.clear(remote);
    expect(await service.status(remote)).toEqual({ connected: false, expiresAt: undefined });
  } finally {
    await service.close();
  }
});
it("refuses issuer substitution and retires held setup after disconnect", async () => {
  const { native, values } = storage();
  let release!: () => void;
  let held = false;
  const discover: NonNullable<ConstructorParameters<typeof McpOAuthService>[3]> = async () => {
    if (held)
      await new Promise<void>((resolve) => {
        release = resolve;
      });
    return info;
  };
  const service = new McpOAuthService(native, fetch, undefined, discover);
  const setup = {
    serverId: remote.serverId,
    issuer: info.authorizationServerUrl,
    clientId: "aux-owned",
    redirectUrl: "http://127.0.0.1:42817/oauth/mcp",
  };
  try {
    await expect(
      service.configure(remote, { ...setup, issuer: "https://substituted.test" }),
    ).rejects.toMatchObject({ code: "permission_denied" });
    held = true;
    const pending = service.configure(remote, setup).catch((error: unknown) => error);
    while (!release) await Promise.resolve();
    let retired = false;
    const retirement = service.clear(remote).then(() => {
      retired = true;
    });
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(retired).toBe(false);
    await expect(service.configure(remote, setup)).rejects.toMatchObject({ code: "cancelled" });
    release();
    expect(await pending).toMatchObject({ code: "cancelled" });
    await retirement;
    expect([...values.values()].filter(Boolean)).toHaveLength(0);
  } finally {
    await service.close();
  }
});
it("accepts a discovered parent resource through SDK validation without changing the MCP endpoint", async () => {
  const { native } = storage();
  const network: typeof fetch = async (input, init) => {
    const url = String(input);
    if (url.includes("oauth-protected-resource"))
      return Response.json({
        resource: "https://provider.test",
        authorization_servers: [info.authorizationServerUrl],
      });
    if (url.endsWith("/register"))
      return Response.json({ ...JSON.parse(String(init?.body)), client_id: "dcr-aux" });
    if (url.startsWith(info.authorizationServerUrl))
      return Response.json({
        ...info.authorizationServerMetadata,
        registration_endpoint: "https://auth.provider.test/register",
      });
    return new Response(null, {
      status: 401,
      headers: {
        "www-authenticate":
          'Bearer resource_metadata="https://provider.test/.well-known/oauth-protected-resource"',
      },
    });
  };
  const service = new McpOAuthService(native, network);
  try {
    expect(await service.requirements(remote)).toMatchObject({ automaticRegistration: true });
    // auth uses the actual SDK resource ancestor/path rule; the source URL itself is unchanged.
    const started = await service.start(remote);
    expect(started.state).toBe("authorization");
    if (started.state !== "authorization") throw new Error("Expected SDK OAuth authorization");
    expect(new URL(started.url).searchParams.get("resource")).toBe("https://provider.test");
    expect(remote.source.url).toBe("https://provider.test/mcp");
  } finally {
    await service.close();
  }
});
