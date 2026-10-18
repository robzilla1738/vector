import { createServer, type Server } from "node:http";
import { randomBytes } from "node:crypto";
import { isIP } from "node:net";
import {
  auth,
  discoverOAuthServerInfo,
  validateAuthorizationResponseIssuer,
  type OAuthClientProvider,
  type OAuthDiscoveryState,
  type StoredOAuthClientInformation,
  type StoredOAuthTokens,
} from "@modelcontextprotocol/client";
import {
  AuxError,
  McpOAuthClientSetupSchema,
  McpOAuthAccountSchema,
  McpOAuthStatusSchema,
  type McpOAuthClientSetup,
  type OutboundMcpServer,
} from "@aux/contracts";
import { officialMcpProvider } from "./official-mcp.js";
import type { NativeBridge } from "../native.js";

type RemoteServer = OutboundMcpServer & { source: { kind: "remote"; url: string; auth: "oauth" } };
type Saved = {
  serverId: string;
  sourceDigest: string;
  issuer?: string;
  tokenEndpoint?: string;
  requestedScopes?: string[];
  grantedScopes?: string[];
  account?: { provider: "notion" | "slack"; userId?: string; workspaceId?: string; workspaceName?: string };
  clients: Record<string, StoredOAuthClientInformation>;
  tokens?: StoredOAuthTokens;
  expiresAt?: number;
  redirectUrl?: string;
  issParameterSupported?: boolean;
  ownClient?: { issuer: string; information: StoredOAuthClientInformation; redirectUrl: string };
};
type Pending = { server: Server; timer: NodeJS.Timeout; state: string; consumed: boolean };
const lifetimeMs = 5 * 60_000;

function publicHttps(value: string | URL): URL {
  const url = new URL(value);
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    isIP(host) !== 0 ||
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  )
    throw new AuxError("permission_denied", "MCP OAuth requires a public HTTPS endpoint.");
  return url;
}

export class McpOAuthService {
  private pending = new Map<string, Pending>();
  private closed = false;
  private generations = new Map<string, number>();
  private writes = new Map<string, Promise<void>>();
  private clearing = new Map<string, number>();
  constructor(
    private native: Pick<NativeBridge, "readSecret" | "storeSecret">,
    private networkFetch: typeof fetch = fetch,
    private runAuth: typeof auth = auth,
    private discover: typeof discoverOAuthServerInfo = discoverOAuthServerInfo,
  ) {}

  private key(server: RemoteServer) {
    return `mcp-oauth-${server.serverId}`;
  }
  private async read(server: RemoteServer): Promise<Saved> {
    const value = (await this.native.readSecret(this.key(server))).value;
    if (value)
      try {
        const saved = JSON.parse(value) as Saved;
        if (
          saved.serverId === server.serverId &&
          saved.sourceDigest === server.sourceDigest &&
          saved.clients &&
          typeof saved.clients === "object"
        )
          return saved;
      } catch {
        /* corrupt or obsolete credential */
      }
    return { serverId: server.serverId, sourceDigest: server.sourceDigest, clients: {} };
  }
  private async save(server: RemoteServer, value: Saved, generation: number) {
    await this.write(server, generation, JSON.stringify(value));
  }
  private async write(server: RemoteServer, generation: number, value: string) {
    const key = this.key(server);
    const previous = this.writes.get(key) ?? Promise.resolve();
    const current = previous
      .catch(() => undefined)
      .then(async () => {
        if (this.closed || (this.generations.get(key) ?? 0) !== generation)
          throw new AuxError("cancelled", "MCP authorization was cancelled.");
        await this.native.storeSecret(key, value);
      });
    this.writes.set(key, current);
    try {
      await current;
    } finally {
      if (this.writes.get(key) === current) this.writes.delete(key);
    }
  }
  private readonly oauthFetch: typeof fetch = async (input, init) => {
    const url = publicHttps(input instanceof Request ? input.url : String(input));
    const signals = [init?.signal, input instanceof Request ? input.signal : undefined].filter(
      (value): value is AbortSignal => !!value,
    );
    const response = await this.networkFetch(url, {
      ...init,
      redirect: "error",
      signal: AbortSignal.any([...signals, AbortSignal.timeout(15_000)]),
    });
    // Discovery and token responses are small JSON documents, never unbounded server streams.
    const reader = response.body?.getReader();
    if (!reader) return response;
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      for (;;) {
        const next = await reader.read();
        if (next.done) break;
        size += next.value.byteLength;
        if (size > 1_048_576) throw new AuxError("permission_denied", "MCP OAuth response is too large.");
        chunks.push(next.value);
      }
    } finally {
      await reader.cancel().catch(() => undefined);
    }
    return new Response(Buffer.concat(chunks), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  };

  private provider(
    server: RemoteServer,
    saved: Saved,
    redirectUrl?: string,
    onRedirect?: (url: string) => void,
    expectedState?: string,
    active: () => boolean = () => true,
    generation = this.generations.get(this.key(server)) ?? 0,
  ): OAuthClientProvider {
    let verifier = "";
    let discovery: OAuthDiscoveryState | undefined;
    return {
      redirectUrl,
      clientMetadata: {
        client_name: "Aux",
        redirect_uris: redirectUrl ? [redirectUrl] : [],
        application_type: "native",
        ...(officialMcpProvider(server.source) === "notion" ? { token_endpoint_auth_method: "none" } : {}),
      },
      state: () => expectedState ?? randomBytes(32).toString("base64url"),
      clientInformation: (context) => {
        if (!context) return undefined;
        if (saved.ownClient) {
          if (publicHttps(context.issuer).href.replace(/\/$/, "") !== saved.ownClient.issuer)
            throw new AuxError("permission_denied", "The registered MCP client's issuer changed.");
          return saved.ownClient.information;
        }
        return saved.clients[context.issuer];
      },
      saveClientInformation: async (information, context) => {
        if (!active()) throw new AuxError("cancelled", "MCP authorization was cancelled.");
        if (!context) throw new AuxError("permission_denied", "MCP OAuth client has no issuer binding.");
        const issuer = publicHttps(context.issuer).href.replace(/\/$/, "");
        if (saved.issuer && saved.issuer !== issuer)
          throw new AuxError(
            "permission_denied",
            "MCP OAuth issuer changed. Disconnect and review the connection.",
          );
        saved.issuer = issuer;
        saved.clients[context.issuer] = information;
        await this.save(server, saved, generation);
      },
      tokens: () => saved.tokens,
      saveTokens: async (tokens) => {
        if (!active() || !saved.issuer)
          throw new AuxError("cancelled", "MCP authorization was cancelled or has no issuer binding.");
        saved.tokens = tokens;
        saved.expiresAt =
          typeof tokens.expires_in === "number" && Number.isFinite(tokens.expires_in)
            ? Date.now() + Math.max(0, tokens.expires_in) * 1000
            : undefined;
        await this.save(server, saved, generation);
      },
      redirectToAuthorization: (url) => {
        const reviewed = publicHttps(url);
        if (!onRedirect) throw new AuxError("needs_input", "Reconnect this MCP server in Aux Settings.");
        onRedirect(reviewed.href);
      },
      saveCodeVerifier: (value) => {
        verifier = value;
      },
      codeVerifier: () => {
        if (!verifier) throw new AuxError("permission_denied", "MCP OAuth verifier is unavailable.");
        return verifier;
      },
      saveDiscoveryState: (value) => {
        discovery = value;
        const issuer = publicHttps(
          value.authorizationServerMetadata?.issuer ?? value.authorizationServerUrl,
        ).href.replace(/\/$/, "");
        if (saved.issuer && saved.issuer !== issuer)
          throw new AuxError(
            "permission_denied",
            "MCP OAuth issuer changed. Disconnect and review the connection.",
          );
        saved.issuer = issuer;
        saved.tokenEndpoint = value.authorizationServerMetadata?.token_endpoint
          ? publicHttps(value.authorizationServerMetadata.token_endpoint).href
          : undefined;
        saved.issParameterSupported =
          value.authorizationServerMetadata?.authorization_response_iss_parameter_supported === true;
      },
      discoveryState: () => discovery,
    };
  }

  async requirements(server: RemoteServer) {
    const generation = this.authorizationGeneration(server);
    const [info, saved] = await Promise.all([
      this.discover(publicHttps(server.source.url), { fetchFn: this.oauthFetch }),
      this.read(server),
    ]);
    if ((this.generations.get(this.key(server)) ?? 0) !== generation)
      throw new AuxError("cancelled", "MCP connection changed during discovery.");
    const metadata = info.authorizationServerMetadata;
    if (!metadata || !metadata.code_challenge_methods_supported?.includes("S256"))
      throw new AuxError("permission_denied", "This server has no verified S256 authorization metadata.");
    const issuer = publicHttps(metadata.issuer).href.replace(/\/$/, "");
    if (!metadata.token_endpoint || !metadata.authorization_endpoint)
      throw new AuxError("permission_denied", "This issuer has no verified OAuth endpoints.");
    publicHttps(metadata.token_endpoint);
    const authorizationUrl = publicHttps(metadata.authorization_endpoint).href;
    if (saved.issuer && issuer !== saved.issuer)
      throw new AuxError("permission_denied", "MCP authorization issuer changed. Disconnect and review it.");
    const clientSecretRequired = Boolean(
      metadata.token_endpoint_auth_methods_supported?.length &&
      !metadata.token_endpoint_auth_methods_supported.includes("none"),
    );
    const officialProvider = officialMcpProvider(server.source);
    return {
      issuer,
      authorizationUrl,
      automaticRegistration: Boolean(
        metadata.registration_endpoint && publicHttps(metadata.registration_endpoint),
      ),
      configured:
        saved.ownClient?.issuer === issuer &&
        (!clientSecretRequired || Boolean(saved.ownClient.information.client_secret)) &&
        (officialProvider !== "slack" || Boolean(saved.requestedScopes?.length)),
      ...(metadata.scopes_supported ? { supportedScopes: metadata.scopes_supported } : {}),
      ...(saved.requestedScopes ? { requestedScopes: saved.requestedScopes } : {}),
      tokenAuthMethods: metadata.token_endpoint_auth_methods_supported ?? [],
      clientSecretRequired,
      ...(officialProvider ? { officialProvider } : {}),
      ...(saved.ownClient ? { redirectUrl: saved.ownClient.redirectUrl } : {}),
    };
  }

  async configure(server: RemoteServer, input: McpOAuthClientSetup) {
    const setup = McpOAuthClientSetupSchema.parse(input);
    if (setup.serverId !== server.serverId)
      throw new AuxError("permission_denied", "MCP client registration belongs to a different server.");
    this.finishPending(server.serverId);
    const key = this.key(server);
    const generation = (this.generations.get(key) ?? 0) + 1;
    this.generations.set(key, generation);
    const requirements = await this.requirements(server);
    if (setup.issuer !== requirements.issuer || (this.generations.get(key) ?? 0) !== generation)
      throw new AuxError("permission_denied", "MCP client registration no longer matches this issuer.");
    if (requirements.clientSecretRequired && !setup.clientSecret)
      throw new AuxError("needs_input", "This provider requires the registered client's secret.");
    if (requirements.officialProvider === "slack" && !setup.requestedScopes?.length)
      throw new AuxError("needs_input", "Select the user scopes approved for your eligible Slack app.");
    if (
      requirements.supportedScopes &&
      setup.requestedScopes?.some((scope) => !requirements.supportedScopes!.includes(scope))
    )
      throw new AuxError(
        "invalid_params",
        "A requested scope is not supported by this authorization provider.",
      );
    await this.save(
      server,
      {
        serverId: server.serverId,
        sourceDigest: server.sourceDigest,
        issuer: requirements.issuer,
        requestedScopes: setup.requestedScopes,
        clients: {},
        redirectUrl: setup.redirectUrl,
        ownClient: {
          issuer: requirements.issuer,
          redirectUrl: setup.redirectUrl,
          information: {
            client_id: setup.clientId,
            issuer: requirements.issuer,
            ...(setup.clientSecret ? { client_secret: setup.clientSecret } : {}),
          },
        },
      },
      generation,
    );
    return { configured: true as const };
  }

  async status(server: RemoteServer) {
    const generation = this.authorizationGeneration(server);
    const saved = await this.read(server);
    if (this.authorizationGeneration(server) !== generation || this.clearing.has(this.key(server)))
      throw new AuxError("cancelled", "MCP authorization changed while reading status.");
    return McpOAuthStatusSchema.parse({
      connected: Boolean(
        saved.issuer &&
        saved.tokens?.access_token &&
        (saved.expiresAt === undefined || saved.expiresAt > Date.now()),
      ),
      expiresAt: saved.expiresAt,
      ...((saved.grantedScopes ?? saved.tokens?.scope?.split(/[\s,]+/).filter(Boolean)) !== undefined
        ? { grantedScopes: saved.grantedScopes ?? saved.tokens?.scope?.split(/[\s,]+/).filter(Boolean) }
        : {}),
      ...(saved.account ? { account: saved.account } : {}),
    });
  }

  authorizationGeneration(server: RemoteServer): number {
    if (this.closed) throw new AuxError("cancelled", "MCP authorization service stopped.");
    return this.generations.get(this.key(server)) ?? 0;
  }

  private tokenFetch(server: RemoteServer, saved: Saved, generation: number): typeof fetch {
    return async (input, init) => {
      if (this.authorizationGeneration(server) !== generation)
        throw new AuxError("cancelled", "MCP authorization changed.");
      const response = await this.oauthFetch(input, init);
      if (this.authorizationGeneration(server) !== generation)
        throw new AuxError("cancelled", "MCP authorization changed.");
      const url = input instanceof Request ? input.url : String(input);
      if (response.ok && url === saved.tokenEndpoint && init?.method === "POST") {
        // The SDK strips provider fields. Read only the documented identity projection from the
        // exact discovered token endpoint; never persist a second copy of raw token responses.
        const provider = officialMcpProvider(server.source);
        if (provider) {
          const json = (await response.clone().json()) as Record<string, unknown>;
          if (provider === "slack" && json.ok === false)
            throw new AuxError("needs_input", "Slack did not grant authorization.");
          const user = json.authed_user as Record<string, unknown> | undefined;
          const team = json.team as Record<string, unknown> | undefined;
          const identity = McpOAuthAccountSchema.safeParse({
            provider,
            userId: provider === "notion" ? json.user_id : user?.id,
            workspaceId: provider === "notion" ? json.workspace_id : team?.id,
            workspaceName: provider === "notion" ? json.workspace_name : undefined,
          });
          const grant = init.body instanceof URLSearchParams ? init.body.get("grant_type") : undefined;
          if (grant !== "refresh_token") {
            saved.account = undefined;
            saved.grantedScopes = undefined;
          }
          const scope = json.scope ?? (provider === "slack" ? user?.scope : undefined);
          if (typeof scope === "string") {
            const scopes = McpOAuthStatusSchema.shape.grantedScopes.safeParse(
              scope.split(/[\s,]+/).filter(Boolean),
            );
            if (scopes.success) saved.grantedScopes = scopes.data;
          }
          if (identity.success && (identity.data.userId || identity.data.workspaceId)) {
            if (
              grant === "refresh_token" &&
              saved.account &&
              ((identity.data.userId && identity.data.userId !== saved.account.userId) ||
                (identity.data.workspaceId && identity.data.workspaceId !== saved.account.workspaceId))
            )
              throw new AuxError(
                "permission_denied",
                "MCP account changed during refresh. Disconnect and review it.",
              );
            saved.account = {
              provider,
              userId: identity.data.userId ?? saved.account?.userId,
              workspaceId: identity.data.workspaceId ?? saved.account?.workspaceId,
              workspaceName: identity.data.workspaceName ?? saved.account?.workspaceName,
            };
          }
        }
      }
      return response;
    };
  }

  async start(
    server: RemoteServer,
  ): Promise<{ state: "connected" } | { state: "authorization"; url: string; expiresAt: number }> {
    publicHttps(server.source.url);
    if (this.clearing.has(this.key(server)))
      throw new AuxError("cancelled", "MCP disconnect is in progress.");
    if (this.pending.has(server.serverId))
      throw new AuxError("conflict", "An MCP sign-in is already in progress.");
    const official = officialMcpProvider(server.source);
    if (official === "slack") {
      const requirements = await this.requirements(server);
      if (!requirements.configured)
        throw new AuxError("needs_input", "Slack requires an eligible registered app before sign-in.");
    }
    const state = randomBytes(32).toString("base64url");
    const generation = this.authorizationGeneration(server) + 1;
    this.generations.set(this.key(server), generation);
    const saved = await this.read(server);
    if ((this.generations.get(this.key(server)) ?? 0) !== generation)
      throw new AuxError("cancelled", "MCP authorization was cancelled.");
    let authorizationUrl = "";
    let redirectUrl = "";
    let provider!: OAuthClientProvider;
    const callback = createServer((request, response) => {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      const pending = this.pending.get(server.serverId);
      if (
        request.method !== "GET" ||
        url.pathname !== "/oauth/mcp" ||
        url.searchParams.get("state") !== state ||
        pending?.state !== state ||
        pending.consumed
      ) {
        response.writeHead(404).end("This MCP authorization request is unavailable.");
        return;
      }
      pending.consumed = true;
      const code = url.searchParams.get("code");
      const issuer = url.searchParams.get("iss");
      let validIssuer = true;
      try {
        validateAuthorizationResponseIssuer({
          iss: issuer ?? undefined,
          expectedIssuer: saved.issuer,
          issParameterSupported: saved.issParameterSupported ?? true,
        });
      } catch {
        validIssuer = false;
      }
      if (!code || url.searchParams.has("error") || !saved.issuer || !validIssuer) {
        this.finishPending(server.serverId, state);
        response.writeHead(400).end("MCP authorization was not granted. Return to Aux.");
        return;
      }
      void this.runAuth(provider, {
        serverUrl: server.source.url,
        authorizationCode: code,
        iss: issuer ?? undefined,
        fetchFn: this.tokenFetch(server, saved, generation),
        scope: saved.requestedScopes?.join(" ") ?? (official === "notion" ? "default" : undefined),
      })
        .then((result) => {
          const authorized =
            result === "AUTHORIZED" && (this.generations.get(this.key(server)) ?? 0) === generation;
          this.finishPending(server.serverId, state);
          response.writeHead(authorized ? 200 : 400, {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "no-store",
          });
          response.end(
            authorized
              ? "<!doctype html><title>MCP connected</title><p>MCP connected. Return to Aux.</p>"
              : "<!doctype html><title>MCP connection failed</title><p>Return to Aux and try again.</p>",
          );
        })
        .catch(() => {
          this.finishPending(server.serverId, state);
          response.writeHead(400, {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "no-store",
          });
          response.end(
            "<!doctype html><title>MCP connection failed</title><p>Return to Aux and try again.</p>",
          );
        });
    });
    await new Promise<void>((resolve, reject) => {
      callback.once("error", reject);
      const configured = saved.ownClient?.redirectUrl;
      if (configured) McpOAuthClientSetupSchema.shape.redirectUrl.parse(configured);
      callback.listen(configured ? Number(new URL(configured).port) : 0, "127.0.0.1", () => {
        callback.off("error", reject);
        resolve();
      });
    });
    const address = callback.address();
    if (!address || typeof address === "string") {
      callback.close();
      throw new AuxError("backend_unavailable", "Cannot start the MCP sign-in callback.");
    }
    redirectUrl = `http://127.0.0.1:${address.port}/oauth/mcp`;
    provider = this.provider(
      server,
      saved,
      redirectUrl,
      (url) => {
        authorizationUrl = url;
      },
      state,
      () =>
        this.pending.get(server.serverId)?.state === state &&
        (this.generations.get(this.key(server)) ?? 0) === generation,
      generation,
    );
    const expiresAt = Date.now() + lifetimeMs;
    const timer = setTimeout(() => this.finishPending(server.serverId, state), lifetimeMs);
    timer.unref();
    this.pending.set(server.serverId, { server: callback, timer, state, consumed: false });
    try {
      if (saved.redirectUrl !== redirectUrl) {
        saved.clients = {};
        saved.tokens = undefined;
        saved.account = undefined;
        saved.grantedScopes = undefined;
        saved.expiresAt = undefined;
        saved.redirectUrl = redirectUrl;
        await this.save(server, saved, generation);
      }
      const result = await this.runAuth(provider, {
        serverUrl: server.source.url,
        fetchFn: this.tokenFetch(server, saved, generation),
        scope: saved.requestedScopes?.join(" ") ?? (official === "notion" ? "default" : undefined),
      });
      if ((this.generations.get(this.key(server)) ?? 0) !== generation)
        throw new AuxError("cancelled", "MCP authorization was cancelled.");
      if (result === "AUTHORIZED") {
        this.finishPending(server.serverId, state);
        return { state: "connected" };
      }
      if (!authorizationUrl)
        throw new AuxError("backend_unavailable", "MCP authorization URL is unavailable.");
      return { state: "authorization", url: authorizationUrl, expiresAt };
    } catch (error) {
      this.finishPending(server.serverId, state);
      throw error;
    }
  }

  async token(
    server: RemoteServer,
    expectedGeneration = this.authorizationGeneration(server),
  ): Promise<string> {
    if (this.authorizationGeneration(server) !== expectedGeneration)
      throw new AuxError("cancelled", "MCP authorization changed.");
    if (this.clearing.has(this.key(server)))
      throw new AuxError("needs_input", "Reconnect this MCP server in Aux Settings.");
    const generation = this.generations.get(this.key(server)) ?? 0;
    const saved = await this.read(server);
    if (this.clearing.has(this.key(server)) || (this.generations.get(this.key(server)) ?? 0) !== generation)
      throw new AuxError("needs_input", "Reconnect this MCP server in Aux Settings.");
    if (!saved.issuer) throw new AuxError("needs_input", "Reconnect this MCP server in Aux Settings.");
    const provider = this.provider(
      server,
      saved,
      saved.redirectUrl,
      undefined,
      undefined,
      () => (this.generations.get(this.key(server)) ?? 0) === generation,
      generation,
    );
    if (
      saved.tokens?.access_token &&
      (saved.expiresAt === undefined || saved.expiresAt > Date.now() + 30_000)
    )
      return saved.tokens.access_token;
    if (!saved.tokens?.refresh_token)
      throw new AuxError("needs_input", "Connect this MCP server in Aux Settings.");
    try {
      const result = await this.runAuth(provider, {
        serverUrl: server.source.url,
        fetchFn: this.tokenFetch(server, saved, generation),
        scope: saved.requestedScopes?.join(" "),
      });
      if (
        result !== "AUTHORIZED" ||
        !saved.tokens?.access_token ||
        (this.generations.get(this.key(server)) ?? 0) !== generation
      )
        throw new AuxError("needs_input", "Reconnect this MCP server in Aux Settings.");
      return saved.tokens.access_token;
    } catch {
      throw new AuxError("needs_input", "Reconnect this MCP server in Aux Settings.");
    }
  }

  async clear(server: RemoteServer) {
    this.finishPending(server.serverId);
    const key = this.key(server);
    const generation = (this.generations.get(key) ?? 0) + 1;
    this.generations.set(key, generation);
    this.clearing.set(key, generation);
    try {
      await this.write(server, generation, "");
      return { connected: false };
    } finally {
      if (this.clearing.get(key) === generation) this.clearing.delete(key);
    }
  }

  private finishPending(serverId: string, state?: string) {
    const pending = this.pending.get(serverId);
    if (!pending || (state !== undefined && pending.state !== state)) return;
    this.pending.delete(serverId);
    clearTimeout(pending.timer);
    pending.server.close();
  }
  close() {
    this.closed = true;
    for (const serverId of this.pending.keys()) this.finishPending(serverId);
  }
}
