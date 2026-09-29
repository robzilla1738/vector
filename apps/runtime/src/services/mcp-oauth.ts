import { createServer, type Server } from "node:http";
import { randomBytes } from "node:crypto";
import { isIP } from "node:net";
import { auth, type OAuthClientProvider, type OAuthDiscoveryState,
  type StoredOAuthClientInformation, type StoredOAuthTokens } from "@modelcontextprotocol/client";
import { AuxError, type OutboundMcpServer } from "@aux/contracts";
import type { NativeBridge } from "../native.js";

type RemoteServer = OutboundMcpServer & { source: { kind: "remote"; url: string; auth: "oauth" } };
type Saved = { serverId: string; sourceDigest: string; issuer?: string; clients: Record<string, StoredOAuthClientInformation>;
  tokens?: StoredOAuthTokens; expiresAt?: number; redirectUrl?: string };
type Pending = { server: Server; timer: NodeJS.Timeout; state: string; consumed: boolean };
const lifetimeMs = 5 * 60_000;

function publicHttps(value: string | URL): URL {
  const url = new URL(value);
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (url.protocol !== "https:" || url.username || url.password || isIP(host) !== 0 ||
    host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal"))
    throw new AuxError("permission_denied", "MCP OAuth requires a public HTTPS endpoint.");
  return url;
}

export class McpOAuthService {
  private pending = new Map<string, Pending>();
  private generations = new Map<string, number>();
  private writes = new Map<string, Promise<void>>();
  private clearing = new Map<string, number>();
  constructor(private native: Pick<NativeBridge, "readSecret" | "storeSecret">,
    private networkFetch: typeof fetch = fetch, private runAuth: typeof auth = auth) {}

  private key(server: RemoteServer) { return `mcp-oauth-${server.serverId}`; }
  private async read(server: RemoteServer): Promise<Saved> {
    const value = (await this.native.readSecret(this.key(server))).value;
    if (value) try {
      const saved = JSON.parse(value) as Saved;
      if (saved.serverId === server.serverId && saved.sourceDigest === server.sourceDigest &&
        saved.clients && typeof saved.clients === "object") return saved;
    } catch { /* corrupt or obsolete credential */ }
    return { serverId: server.serverId, sourceDigest: server.sourceDigest, clients: {} };
  }
  private async save(server: RemoteServer, value: Saved, generation: number) {
    await this.write(server, generation, JSON.stringify(value));
  }
  private async write(server: RemoteServer, generation: number, value: string) {
    const key = this.key(server);
    const previous = this.writes.get(key) ?? Promise.resolve();
    const current = previous.catch(() => undefined).then(async () => {
      if ((this.generations.get(key) ?? 0) !== generation)
        throw new AuxError("cancelled", "MCP authorization was cancelled.");
      await this.native.storeSecret(key, value);
    });
    this.writes.set(key, current);
    try { await current; } finally { if (this.writes.get(key) === current) this.writes.delete(key); }
  }
  private readonly oauthFetch: typeof fetch = (input, init) => {
    const url = publicHttps(input instanceof Request ? input.url : String(input));
    const signals = [init?.signal, input instanceof Request ? input.signal : undefined]
      .filter((value): value is AbortSignal => !!value);
    return this.networkFetch(url, { ...init, redirect: "error",
      signal: AbortSignal.any([...signals, AbortSignal.timeout(15_000)]) });
  };

  private provider(server: RemoteServer, saved: Saved, redirectUrl?: string, onRedirect?: (url: string) => void,
    expectedState?: string, active: () => boolean = () => true,
    generation = this.generations.get(this.key(server)) ?? 0): OAuthClientProvider {
    let verifier = "";
    let discovery: OAuthDiscoveryState | undefined;
    return {
      redirectUrl,
      clientMetadata: { client_name: "Aux", redirect_uris: redirectUrl ? [redirectUrl] : [],
        application_type: "native" },
      state: () => expectedState ?? randomBytes(32).toString("base64url"),
      clientInformation: context => context ? saved.clients[context.issuer] : undefined,
      saveClientInformation: async (information, context) => {
        if (!active()) throw new AuxError("cancelled", "MCP authorization was cancelled.");
        if (!context) throw new AuxError("permission_denied", "MCP OAuth client has no issuer binding.");
        const issuer = publicHttps(context.issuer).href.replace(/\/$/, "");
        if (saved.issuer && saved.issuer !== issuer)
          throw new AuxError("permission_denied", "MCP OAuth issuer changed. Disconnect and review the connection.");
        saved.issuer = issuer;
        saved.clients[context.issuer] = information;
        await this.save(server, saved, generation);
      },
      tokens: () => saved.tokens,
      saveTokens: async tokens => {
        if (!active() || !saved.issuer) throw new AuxError("cancelled", "MCP authorization was cancelled or has no issuer binding.");
        saved.tokens = tokens;
        saved.expiresAt = typeof tokens.expires_in === "number" && Number.isFinite(tokens.expires_in)
          ? Date.now() + Math.max(0, tokens.expires_in) * 1000 : undefined;
        await this.save(server, saved, generation);
      },
      redirectToAuthorization: url => {
        const reviewed = publicHttps(url);
        if (!onRedirect) throw new AuxError("needs_input", "Reconnect this MCP server in Aux Settings.");
        onRedirect(reviewed.href);
      },
      saveCodeVerifier: value => { verifier = value; },
      codeVerifier: () => {
        if (!verifier) throw new AuxError("permission_denied", "MCP OAuth verifier is unavailable.");
        return verifier;
      },
      saveDiscoveryState: value => { discovery = value; },
      discoveryState: () => discovery,
      validateResourceURL: async (serverUrl, resource) => {
        const expected = publicHttps(serverUrl);
        if (resource && new URL(resource).href !== expected.href)
          throw new AuxError("permission_denied", "MCP OAuth resource changed during authorization.");
        return expected;
      },
    };
  }

  async status(server: RemoteServer) {
    const saved = await this.read(server);
    return { connected: Boolean(saved.issuer && saved.tokens?.access_token &&
      (saved.expiresAt === undefined || saved.expiresAt > Date.now())),
      expiresAt: saved.expiresAt };
  }

  async start(server: RemoteServer): Promise<{ state: "connected" } | { state: "authorization"; url: string; expiresAt: number }> {
    publicHttps(server.source.url);
    if (this.clearing.has(this.key(server))) throw new AuxError("cancelled", "MCP disconnect is in progress.");
    if (this.pending.has(server.serverId)) throw new AuxError("conflict", "An MCP sign-in is already in progress.");
    const state = randomBytes(32).toString("base64url");
    const generation = this.generations.get(this.key(server)) ?? 0;
    const saved = await this.read(server);
    if ((this.generations.get(this.key(server)) ?? 0) !== generation)
      throw new AuxError("cancelled", "MCP authorization was cancelled.");
    let authorizationUrl = "";
    let redirectUrl = "";
    let provider!: OAuthClientProvider;
    const callback = createServer((request, response) => {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      const pending = this.pending.get(server.serverId);
      if (request.method !== "GET" || url.pathname !== "/oauth/mcp" ||
        url.searchParams.get("state") !== state || pending?.state !== state || pending.consumed) {
        response.writeHead(404).end("This MCP authorization request is unavailable."); return;
      }
      pending.consumed = true;
      const code = url.searchParams.get("code");
      const issuer = url.searchParams.get("iss");
      if (!code || url.searchParams.has("error") || !saved.issuer || issuer !== saved.issuer) {
        this.finishPending(server.serverId);
        response.writeHead(400).end("MCP authorization was not granted. Return to Aux."); return;
      }
      void this.runAuth(provider, { serverUrl: server.source.url, authorizationCode: code,
        iss: issuer, fetchFn: this.oauthFetch }).then(result => {
        const authorized = result === "AUTHORIZED" && (this.generations.get(this.key(server)) ?? 0) === generation;
        this.finishPending(server.serverId);
        response.writeHead(authorized ? 200 : 400, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
        response.end(authorized ? "<!doctype html><title>MCP connected</title><p>MCP connected. Return to Aux.</p>"
          : "<!doctype html><title>MCP connection failed</title><p>Return to Aux and try again.</p>");
      }).catch(() => {
        this.finishPending(server.serverId);
        response.writeHead(400, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
        response.end("<!doctype html><title>MCP connection failed</title><p>Return to Aux and try again.</p>");
      });
    });
    await new Promise<void>((resolve, reject) => {
      callback.once("error", reject);
      callback.listen(0, "127.0.0.1", () => { callback.off("error", reject); resolve(); });
    });
    const address = callback.address();
    if (!address || typeof address === "string") {
      callback.close(); throw new AuxError("backend_unavailable", "Cannot start the MCP sign-in callback.");
    }
    redirectUrl = `http://127.0.0.1:${address.port}/oauth/mcp`;
    provider = this.provider(server, saved, redirectUrl, url => { authorizationUrl = url; }, state,
      () => this.pending.get(server.serverId)?.state === state &&
        (this.generations.get(this.key(server)) ?? 0) === generation, generation);
    const expiresAt = Date.now() + lifetimeMs;
    const timer = setTimeout(() => this.finishPending(server.serverId), lifetimeMs);
    timer.unref();
    this.pending.set(server.serverId, { server: callback, timer, state, consumed: false });
    try {
      if (saved.redirectUrl !== redirectUrl) {
        saved.clients = {};
        saved.tokens = undefined;
        saved.expiresAt = undefined;
        saved.redirectUrl = redirectUrl;
        await this.save(server, saved, generation);
      }
      const result = await this.runAuth(provider, { serverUrl: server.source.url, fetchFn: this.oauthFetch });
      if ((this.generations.get(this.key(server)) ?? 0) !== generation)
        throw new AuxError("cancelled", "MCP authorization was cancelled.");
      if (result === "AUTHORIZED") { this.finishPending(server.serverId); return { state: "connected" }; }
      if (!authorizationUrl) throw new AuxError("backend_unavailable", "MCP authorization URL is unavailable.");
      return { state: "authorization", url: authorizationUrl, expiresAt };
    } catch (error) { this.finishPending(server.serverId); throw error; }
  }

  async token(server: RemoteServer): Promise<string> {
    if (this.clearing.has(this.key(server))) throw new AuxError("needs_input", "Reconnect this MCP server in Aux Settings.");
    const generation = this.generations.get(this.key(server)) ?? 0;
    const saved = await this.read(server);
    if (this.clearing.has(this.key(server)) || (this.generations.get(this.key(server)) ?? 0) !== generation)
      throw new AuxError("needs_input", "Reconnect this MCP server in Aux Settings.");
    if (!saved.issuer) throw new AuxError("needs_input", "Reconnect this MCP server in Aux Settings.");
    const provider = this.provider(server, saved, saved.redirectUrl, undefined, undefined,
      () => (this.generations.get(this.key(server)) ?? 0) === generation, generation);
    if (saved.tokens?.access_token &&
      (saved.expiresAt === undefined || saved.expiresAt > Date.now() + 30_000))
      return saved.tokens.access_token;
    if (!saved.tokens?.refresh_token) throw new AuxError("needs_input", "Connect this MCP server in Aux Settings.");
    try {
      const result = await this.runAuth(provider, { serverUrl: server.source.url, fetchFn: this.oauthFetch });
      if (result !== "AUTHORIZED" || !saved.tokens?.access_token ||
        (this.generations.get(this.key(server)) ?? 0) !== generation)
        throw new AuxError("needs_input", "Reconnect this MCP server in Aux Settings.");
      return saved.tokens.access_token;
    } catch { throw new AuxError("needs_input", "Reconnect this MCP server in Aux Settings."); }
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
    } finally { if (this.clearing.get(key) === generation) this.clearing.delete(key); }
  }

  private finishPending(serverId: string) {
    const pending = this.pending.get(serverId);
    if (!pending) return;
    this.pending.delete(serverId);
    clearTimeout(pending.timer);
    pending.server.close();
  }
  close() { for (const serverId of this.pending.keys()) this.finishPending(serverId); }
}
