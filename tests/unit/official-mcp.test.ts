import { expect, it } from "vitest";
import { OFFICIAL_MCP_CONNECTORS, McpOAuthStatusSchema } from "@aux/contracts";
import { officialMcpEffect, officialMcpProvider } from "../../apps/runtime/src/services/official-mcp.js";
import { McpOAuthService } from "../../apps/runtime/src/services/mcp-oauth.js";

const notion = { kind: "remote" as const, url: "https://mcp.notion.com/mcp", auth: "oauth" as const };
const slack = { ...notion, url: "https://mcp.slack.com/mcp" };
const server = {
  serverId: "11111111-1111-4111-8111-111111111111",
  workspaceId: "space",
  name: "Notion",
  source: notion,
  state: "active" as const,
  toolsRevision: 0,
  disabledTools: [],
  toolNames: [],
  sourceDigest: "a".repeat(64),
  createdAt: 1,
  updatedAt: 1,
};

it("publishes exact official endpoints and never trusts a generic read hint or conflicting provider hint", () => {
  expect(OFFICIAL_MCP_CONNECTORS.find((item) => item.id === "notion")?.url).toBe(notion.url);
  expect(OFFICIAL_MCP_CONNECTORS.find((item) => item.id === "slack")?.url).toBe(slack.url);
  expect(officialMcpEffect(notion, "notion-fetch")).toBe("read");
  expect(officialMcpEffect(notion, "notion-fetch", { destructiveHint: true })).toBe("unknown");
  expect(officialMcpEffect(notion, "notion-update-page", { readOnlyHint: true })).toBe("write");
  expect(officialMcpEffect(slack, "slack_get_file_upload_url", { readOnlyHint: true })).toBe("write");
  expect(officialMcpEffect(slack, "slack_search", { readOnlyHint: true })).toBe("unknown");
  expect(
    officialMcpEffect({ ...notion, url: "https://elsewhere.test/mcp" }, "notion-fetch", {
      readOnlyHint: true,
    }),
  ).toBe("unknown");
  for (const url of [notion.url + "?source=unreviewed", notion.url + "/", "https://mcp.notion.com/other"])
    expect(officialMcpProvider({ ...notion, url })).toBeUndefined();
});

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

// Observed 2026-10-18 at https://mcp.slack.com/.well-known/oauth-authorization-server.
// The MCP metadata, unlike Slack's generic public PKCE docs, advertises only client_secret_post.
it("requires eligible Slack registration, secret and explicit supported scopes before authorization", async () => {
  const { native, values } = storage();
  const info = {
    authorizationServerUrl: "https://mcp.slack.com",
    authorizationServerMetadata: {
      issuer: "https://mcp.slack.com",
      authorization_endpoint: "https://slack.com/oauth/v2_user/authorize",
      token_endpoint: "https://slack.com/api/oauth.v2.user.access",
      response_types_supported: ["code"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: ["client_secret_post"],
      scopes_supported: ["search:read.public", "chat:write"],
    },
  };
  const service = new McpOAuthService(native, fetch, undefined, async () => info);
  const remote = { ...server, source: slack };
  try {
    expect(await service.requirements(remote)).toMatchObject({
      automaticRegistration: false,
      configured: false,
      officialProvider: "slack",
      clientSecretRequired: true,
      supportedScopes: ["search:read.public", "chat:write"],
    });
    await expect(service.start(remote)).rejects.toMatchObject({ code: "needs_input" });
    const input = {
      serverId: remote.serverId,
      issuer: info.authorizationServerUrl,
      clientId: "actual-app",
      redirectUrl: "http://127.0.0.1:42817/oauth/mcp",
    };
    await expect(service.configure(remote, input)).rejects.toThrow(/secret/);
    await expect(service.configure(remote, { ...input, clientSecret: "test-secret" })).rejects.toThrow(
      /scopes/,
    );
    await expect(
      service.configure(remote, {
        ...input,
        clientSecret: "test-secret",
        requestedScopes: ["admin:invented"],
      }),
    ).rejects.toThrow(/scope/);
    await service.configure(remote, {
      ...input,
      clientSecret: "test-secret",
      requestedScopes: ["search:read.public"],
    });
    expect(await service.requirements(remote)).toMatchObject({
      configured: true,
      requestedScopes: ["search:read.public"],
    });
    expect(JSON.stringify(await service.requirements(remote))).not.toContain("test-secret");
    expect([...values.values()].join()).toContain("test-secret");
    expect(await service.status(remote)).toMatchObject({ connected: false });
  } finally {
    service.close();
  }
});

it.each(["notion", "slack"] as const)(
  "uses the real SDK token exchange and exposes only %s account/scopes from its bound endpoint",
  async (provider) => {
    const { native, values } = storage();
    const source = provider === "notion" ? notion : slack;
    const remote = { ...server, source };
    const issuer = `https://mcp.${provider}.com`;
    const tokenUrl = provider === "notion" ? issuer + "/token" : "https://slack.com/api/oauth.v2.user.access";
    const scope = provider === "notion" ? "default" : "search:read.public";
    let authorization = "";
    const tokenRedirects: (RequestRedirect | undefined)[] = [];
    const network: typeof fetch = async (input, init) => {
      const url = String(input);
      if (url === tokenUrl) {
        tokenRedirects.push(init?.redirect);
        if (init?.body instanceof URLSearchParams && init.body.get("grant_type") === "refresh_token")
          return Response.json({
            access_token: "private-refreshed-token",
            token_type: "Bearer",
            expires_in: 3600,
          });
        return Response.json({
          access_token: "private-access-token",
          refresh_token: "private-refresh-token",
          token_type: "Bearer",
          expires_in: 3600,
          ...(provider === "notion"
            ? {
                scope,
                user_id: "actual-user",
                workspace_id: "actual-space",
                workspace_name: "Owner workspace",
              }
            : { ok: true, authed_user: { id: "actual-user", scope }, team: { id: "actual-space" } }),
          arbitrary_secret: "never-projected",
        });
      }
      if (url.includes("oauth-protected-resource"))
        return Response.json({ resource: issuer, authorization_servers: [issuer] });
      if (url === issuer + "/register")
        return Response.json({ ...JSON.parse(String(init?.body)), client_id: "registered-dcr" });
      if (url.includes("oauth-authorization-server"))
        return Response.json({
          issuer,
          authorization_endpoint: issuer + "/authorize",
          token_endpoint: tokenUrl,
          response_types_supported: ["code"],
          code_challenge_methods_supported: ["S256"],
          authorization_response_iss_parameter_supported: true,
          token_endpoint_auth_methods_supported: provider === "notion" ? ["none"] : ["client_secret_post"],
          ...(provider === "notion" ? { registration_endpoint: issuer + "/register" } : {}),
          scopes_supported: [scope],
        });
      return new Response(null, {
        status: 401,
        headers: {
          "www-authenticate": `Bearer resource_metadata="${issuer}/.well-known/oauth-protected-resource"`,
        },
      });
    };
    const service = new McpOAuthService(native, network);
    try {
      if (provider === "slack")
        await service.configure(remote, {
          serverId: remote.serverId,
          issuer,
          clientId: "actual-app",
          clientSecret: "test-secret",
          redirectUrl: "http://127.0.0.1:42817/oauth/mcp",
          requestedScopes: [scope],
        });
      const started = await service.start(remote);
      expect(started.state).toBe("authorization");
      if (started.state !== "authorization") throw new Error("Expected authorization");
      authorization = started.url;
      const url = new URL(authorization);
      expect(url.searchParams.get("scope")).toBe(scope);
      const callback = new URL(url.searchParams.get("redirect_uri")!);
      callback.searchParams.set("code", "granted-code");
      callback.searchParams.set("state", url.searchParams.get("state")!);
      callback.searchParams.set("iss", issuer);
      expect((await fetch(callback)).status).toBe(200);
      const status = McpOAuthStatusSchema.parse(await service.status(remote));
      expect(status).toMatchObject({
        connected: true,
        grantedScopes: [scope],
        account: { provider, userId: "actual-user", workspaceId: "actual-space" },
      });
      expect(JSON.stringify(status)).not.toMatch(/private-|never-projected|test-secret/);
      expect([...values.values()].join()).not.toContain("never-projected");
      for (const [key, value] of values) {
        const saved = JSON.parse(value);
        saved.expiresAt = 1;
        values.set(key, JSON.stringify(saved));
      }
      expect(await service.token(remote)).toBe("private-refreshed-token");
      expect(tokenRedirects).toEqual(["error", "error"]);
      expect(await service.status(remote)).toMatchObject({
        grantedScopes: [scope],
        account: { provider, userId: "actual-user", workspaceId: "actual-space" },
      });
      const originalGeneration = service.authorizationGeneration(remote);
      await service.clear(remote);
      await expect(service.token(remote, originalGeneration)).rejects.toMatchObject({ code: "cancelled" });
      expect(await service.status(remote)).not.toHaveProperty("account");
    } finally {
      service.close();
    }
  },
);

it("does not let a retired OAuth callback close a newer authorization attempt", async () => {
  const { native } = storage();
  let release!: () => void;
  let reached!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const entered = new Promise<void>((resolve) => {
    reached = resolve;
  });
  const service = new McpOAuthService(native, fetch, async (provider, options) => {
    if (!options.authorizationCode) {
      await provider.saveClientInformation?.({ client_id: "registered" }, { issuer: "https://issuer.test" });
      await provider.redirectToAuthorization(
        new URL(`https://issuer.test/authorize?state=${await provider.state?.()}`),
      );
      return "REDIRECT";
    }
    if (options.authorizationCode === "retired") {
      reached();
      await held;
    }
    await provider.saveTokens({ access_token: "private-token", token_type: "Bearer" });
    return "AUTHORIZED";
  });
  const remote = { ...server, source: { ...notion, url: "https://generic.test/mcp" } };
  try {
    const first = await service.start(remote);
    if (first.state !== "authorization") throw new Error("Expected authorization");
    // The exact live callback is recorded in the private credential entry after startup.
    const callback = (await native.readSecret(`mcp-oauth-${server.serverId}`)).value!;
    const firstUrl = new URL(JSON.parse(callback).redirectUrl);
    firstUrl.searchParams.set("code", "retired");
    firstUrl.searchParams.set("state", new URL(first.url).searchParams.get("state")!);
    firstUrl.searchParams.set("iss", "https://issuer.test");
    const oldResponse = fetch(firstUrl);
    await entered;
    await service.clear(remote);
    const second = await service.start(remote);
    if (second.state !== "authorization") throw new Error("Expected authorization");
    release();
    expect((await oldResponse).status).toBe(400);
    const next = JSON.parse((await native.readSecret(`mcp-oauth-${server.serverId}`)).value!);
    const secondUrl = new URL(next.redirectUrl);
    secondUrl.searchParams.set("code", "current");
    secondUrl.searchParams.set("state", new URL(second.url).searchParams.get("state")!);
    secondUrl.searchParams.set("iss", "https://issuer.test");
    expect((await fetch(secondUrl)).status).toBe(200);
    expect(await service.status(remote)).toMatchObject({ connected: true });
  } finally {
    release();
    service.close();
  }
});
