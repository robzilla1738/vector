import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';
import { createServer, type Server } from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';
import { z } from 'zod';
import { type AgentStorage, fail } from '../storage.js';
import {
  OAuthEndpointError,
  type OAuthNetwork,
  OAuthProtocol,
  type TokensResponse,
} from './protocol.js';
import { OAuthStorage, type Registration } from './storage.js';

const scope =
  'openid profile email offline_access resource.invoke chatgpt.tokens.use.direct';
const issued = /^oaiapp_[A-Za-z0-9_-]+$/;
type Phase =
  | 'pending'
  | 'exchanging'
  | 'complete'
  | 'cancelled'
  | 'expired'
  | 'errored';
type Flow = {
  id: string;
  accountId: number;
  phase: Phase;
  createdAt: number;
  expiresAt: number;
  controller: AbortController;
  server: Server;
  timer: NodeJS.Timeout;
  redirectUri: string;
  state: string;
  nonce: string;
  verifier: string;
  selected?: Registration;
  registrationId?: string;
  issuedClientId?: string;
  error?: string;
};
export class OpenAIOAuth {
  readonly storage: OAuthStorage;
  readonly protocol: OAuthProtocol;
  private flows = new Map<string, Flow>();
  private startVersions = new Map<number, number>();
  private refreshes = new Map<string, Promise<string>>();
  private secrets = new Set<string>();
  private closed = false;
  private controllers = new Map<AbortController, number>();
  constructor(
    readonly store: AgentStorage,
    network?: OAuthNetwork,
  ) {
    this.storage = new OAuthStorage(store);
    this.protocol = new OAuthProtocol(network);
  }
  list(accountId: number) {
    const state = this.storage.read(accountId);
    return {
      activeId: state.activeId,
      registrations: state.registrations.map(
        ({
          id,
          clientId,
          subject,
          email,
          createdAt,
          tokens,
          reauthorizationRequired,
        }) => ({
          id,
          clientId,
          subject,
          ...(email ? { email } : {}),
          createdAt,
          connected: !!tokens,
          planUsageEnabled: !!tokens?.scopes.includes(
            'chatgpt.tokens.use.direct',
          ),
          expiresAt: tokens?.expiresAt ?? null,
          reauthorizationRequired,
        }),
      ),
    };
  }
  status(accountId: number) {
    const state = this.storage.read(accountId),
      registration = state.registrations.find((r) => r.id === state.activeId);
    return {
      exists: !!registration?.tokens,
      type: registration?.tokens ? ('oauth' as const) : null,
      registrationId: registration?.id ?? null,
      planUsageEnabled: !!registration?.tokens?.scopes.includes(
        'chatgpt.tokens.use.direct',
      ),
      reauthorizationRequired: registration?.reauthorizationRequired ?? false,
    };
  }
  private publicFlow(flow: Flow) {
    return {
      flowId: flow.id,
      phase: flow.phase,
      createdAt: flow.createdAt,
      expiresAt: flow.expiresAt,
      retryAvailable: flow.phase === 'errored' && !!flow.issuedClientId,
      ...(flow.registrationId ? { registrationId: flow.registrationId } : {}),
      ...(flow.error ? { error: flow.error } : {}),
    };
  }
  flow(accountId: number, id: string) {
    this.store.requireAccount(accountId);
    const flow = this.flows.get(id);
    if (!flow || flow.accountId !== accountId)
      fail('NOT_FOUND', 'OAuth flow does not exist for this account');
    return this.publicFlow(flow);
  }
  async start(
    accountId: number,
    registrationId?: string,
    retryFlowId?: string,
  ) {
    if (this.closed) fail('PRECONDITION_FAILED', 'OAuth service is closed');
    this.store.requireAccount(accountId);
    const startVersion = (this.startVersions.get(accountId) ?? 0) + 1;
    this.startVersions.set(accountId, startVersion);
    for (const flow of this.flows.values())
      if (
        flow.accountId === accountId &&
        ['pending', 'exchanging'].includes(flow.phase)
      )
        this.cancel(accountId, flow.id);
    for (const [id, flow] of this.flows)
      if (
        this.flows.size >= 100 &&
        !['pending', 'exchanging'].includes(flow.phase)
      )
        this.flows.delete(id);
    if (registrationId && retryFlowId)
      fail('BAD_REQUEST', 'Choose a saved registration or a failed attempt');
    const retry = retryFlowId ? this.flows.get(retryFlowId) : undefined;
    if (
      retryFlowId &&
      (!retry ||
        retry.accountId !== accountId ||
        retry.phase !== 'errored' ||
        !retry.issuedClientId)
    )
      fail(
        'NOT_FOUND',
        'No retryable issued-client attempt exists for this account',
      );
    registrationId ??= retry?.selected?.id;
    const selected = registrationId
      ? this.storage
          .read(accountId)
          .registrations.find((r) => r.id === registrationId)
      : undefined;
    if (registrationId && !selected)
      fail('NOT_FOUND', 'Selected OAuth registration does not exist');
    const authorizationClientId = selected?.clientId ?? retry?.issuedClientId;
    const hostId = this.storage.hostId(),
      state = randomBytes(32).toString('base64url'),
      nonce = randomBytes(32).toString('base64url'),
      verifier = randomBytes(48).toString('base64url'),
      controller = new AbortController();
    this.secrets.add(verifier);
    let flow: Flow | undefined;
    const server = createServer((request, response) => {
      response.setHeader('Cache-Control', 'no-store');
      response.setHeader(
        'Content-Security-Policy',
        "default-src 'none'; frame-ancestors 'none'",
      );
      response.setHeader('Referrer-Policy', 'no-referrer');
      response.setHeader('Content-Type', 'text/plain; charset=utf-8');
      const reject = (status: number) => {
        response.writeHead(status);
        response.end('Aux could not accept this sign-in callback.');
      };
      if (
        !flow ||
        request.method !== 'GET' ||
        request.socket.remoteAddress !== '127.0.0.1' ||
        request.headers.host !== new URL(flow.redirectUri).host
      )
        return reject(400);
      const url = new URL(request.url ?? '/', flow.redirectUri);
      if (
        url.pathname !== '/auth/callback' ||
        url.origin !== new URL(flow.redirectUri).origin ||
        url.hash
      )
        return reject(404);
      for (const key of ['state', 'code', 'client_id', 'error', 'scope'])
        if (url.searchParams.getAll(key).length > 1) return reject(400);
      const incoming = url.searchParams.get('state') ?? '';
      if (
        Buffer.byteLength(incoming) !== Buffer.byteLength(state) ||
        !timingSafeEqual(Buffer.from(incoming), Buffer.from(state))
      )
        return reject(403);
      if (flow.phase !== 'pending' || Date.now() > flow.expiresAt)
        return reject(409);
      flow.phase = 'exchanging';
      const pending = flow;
      // The authorization code and provider responses never reach extension JS.
      response.end(
        'Aux received the sign-in result. Return to Aux settings to see its verified status.',
      );
      server.close();
      void this.complete(pending, url.searchParams)
        .catch((error) => {
          if (['cancelled', 'expired'].includes(pending.phase)) return;
          pending.phase = 'errored';
          pending.error =
            error instanceof OAuthEndpointError
              ? error.message
              : 'Sign-in verification failed. Start a new sign-in attempt.';
        })
        .finally(() => clearTimeout(pending.timer));
    });
    server.maxHeadersCount = 30;
    server.headersTimeout = 5000;
    server.requestTimeout = 5000;
    server.maxConnections = 5;
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', () => {
        server.removeListener('error', reject);
        resolve();
      });
    });
    if (this.closed || this.startVersions.get(accountId) !== startVersion) {
      server.close();
      fail('PRECONDITION_FAILED', 'OAuth service closed before sign-in began');
    }
    try {
      this.store.requireAccount(accountId);
    } catch (error) {
      server.close();
      throw error;
    }
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new Error('OAuth loopback listener did not obtain a local port');
    const id = randomUUID(),
      createdAt = Date.now(),
      expiresAt = createdAt + 300000,
      redirectUri = `http://127.0.0.1:${address.port}/auth/callback`;
    const timer = setTimeout(() => {
      if (flow && ['pending', 'exchanging'].includes(flow.phase)) {
        flow.phase = 'expired';
        controller.abort();
        server.close();
        server.closeAllConnections();
      }
    }, 300000);
    timer.unref();
    flow = {
      id,
      accountId,
      phase: 'pending',
      createdAt,
      expiresAt,
      controller,
      server,
      timer,
      redirectUri,
      state,
      nonce,
      verifier,
      ...(selected ? { selected } : {}),
      ...(authorizationClientId
        ? { issuedClientId: authorizationClientId }
        : {}),
    };
    this.flows.set(id, flow);
    const authorization = new URL(this.protocol.network.endpoints.authorize);
    authorization.search = new URLSearchParams({
      client_id: authorizationClientId ?? 'dynamic_agent_client',
      ...(authorizationClientId ? {} : { agent_name_hint: 'Aux' }),
      ext_agent_host_id: hostId,
      ...(selected?.tokens &&
      !selected.tokens.scopes.includes('chatgpt.tokens.use.direct')
        ? { prompt: 'consent' }
        : {}),
      response_type: 'code',
      redirect_uri: redirectUri,
      scope,
      resource: this.protocol.network.endpoints.resource,
      state,
      nonce,
      code_challenge_method: 'S256',
      code_challenge: createHash('sha256').update(verifier).digest('base64url'),
    }).toString();
    return { ...this.publicFlow(flow), authorizationUrl: authorization.href };
  }
  private async complete(flow: Flow, params: URLSearchParams) {
    if (params.has('error')) {
      flow.phase = 'errored';
      flow.error =
        params.get('error') === 'access_denied'
          ? 'ChatGPT authorization was declined. No new credentials were saved.'
          : 'The sign-in provider rejected this authorization attempt.';
      return;
    }
    const code = params.get('code'),
      clientId =
        params.get('client_id') ??
        flow.selected?.clientId ??
        flow.issuedClientId;
    if (
      !code ||
      code.length > 10000 ||
      !clientId ||
      !issued.test(clientId) ||
      ((flow.selected?.clientId ?? flow.issuedClientId) &&
        (flow.selected?.clientId ?? flow.issuedClientId) !== clientId)
    )
      fail(
        'FORBIDDEN',
        'Authorization did not return the expected issued Aux client identity',
      );
    flow.issuedClientId = clientId;
    this.secrets.add(code);
    const signal = flow.controller.signal;
    signal.throwIfAborted();
    this.store.requireAccount(flow.accountId);
    const response = await this.protocol.tokens(
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        code,
        code_verifier: flow.verifier,
        redirect_uri: flow.redirectUri,
        resource: this.protocol.network.endpoints.resource,
      }),
      signal,
    );
    if (!response.id_token)
      fail('FORBIDDEN', 'OAuth did not return an identity token');
    const identity = await this.protocol.verify(
      response.id_token,
      clientId,
      flow.nonce,
      flow.selected?.subject,
      signal,
    );
    const tokens = this.saveTokens(response);
    await this.storage.exclusive(flow.accountId, async () => {
      signal.throwIfAborted();
      if (this.closed || flow.phase !== 'exchanging')
        fail('CONFLICT', 'OAuth attempt is no longer active');
      const state = this.storage.read(flow.accountId),
        previous = flow.selected
          ? state.registrations.find((r) => r.id === flow.selected?.id)
          : undefined;
      if (
        flow.selected &&
        (!previous || previous.revision !== flow.selected.revision)
      )
        fail('CONFLICT', 'OAuth registration changed during sign-in');
      if (
        state.registrations.some(
          (r) => r.clientId === clientId && r.subject !== identity.subject,
        )
      )
        fail(
          'FORBIDDEN',
          'Issued OAuth client identity belongs to a different verified account',
        );
      const existing =
        previous ??
        state.registrations.find(
          (r) => r.clientId === clientId && r.subject === identity.subject,
        );
      const registration: Registration = {
        id: existing?.id ?? randomUUID(),
        clientId,
        subject: identity.subject,
        ...(identity.email ? { email: identity.email } : {}),
        createdAt: existing?.createdAt ?? Date.now(),
        revision: (existing?.revision ?? 0) + 1,
        tokens,
        reauthorizationRequired: false,
      };
      state.registrations = state.registrations.filter(
        (r) => r.id !== registration.id,
      );
      state.registrations.push(registration);
      if (state.activeId === registration.id || !this.busy(flow.accountId))
        state.activeId = registration.id;
      this.storage.write(flow.accountId, state);
      flow.registrationId = registration.id;
      flow.phase = 'complete';
    });
  }
  private saveTokens(
    response: TokensResponse,
    previous?: NonNullable<Registration['tokens']>,
  ) {
    const idToken = response.id_token ?? previous?.idToken;
    if (!idToken) fail('FORBIDDEN', 'OAuth identity token is unavailable');
    const scopes =
      response.scope?.split(/\s+/).filter(Boolean) ?? previous?.scopes ?? [];
    for (const token of [
      response.access_token,
      response.refresh_token,
      idToken,
    ])
      this.secrets.add(token);
    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      idToken,
      scopes,
      expiresAt: Date.now() + response.expires_in * 1000,
      ...(response.earliest_refresh_at === undefined
        ? {}
        : { earliestRefreshMetadata: response.earliest_refresh_at }),
    };
  }
  cancel(accountId: number, id: string) {
    const flow = this.flows.get(id);
    if (!flow || flow.accountId !== accountId)
      fail('NOT_FOUND', 'OAuth flow does not exist for this account');
    if (['pending', 'exchanging'].includes(flow.phase)) {
      flow.phase = 'cancelled';
      flow.controller.abort();
      clearTimeout(flow.timer);
      flow.server.close();
      flow.server.closeAllConnections();
    }
    return this.publicFlow(flow);
  }
  private busy(accountId: number) {
    return Object.values(this.store.all(accountId, 'sessions')).some(
      (value) =>
        !!value &&
        typeof value === 'object' &&
        'status' in value &&
        ['running', 'suspended'].includes(String(value.status)),
    );
  }
  cancelAccount(accountId: number) {
    this.startVersions.set(
      accountId,
      (this.startVersions.get(accountId) ?? 0) + 1,
    );
    for (const flow of this.flows.values())
      if (
        flow.accountId === accountId &&
        ['pending', 'exchanging'].includes(flow.phase)
      )
        this.cancel(accountId, flow.id);
    for (const [controller, owner] of this.controllers)
      if (owner === accountId) controller.abort();
  }
  cachedCatalog(accountId: number) {
    const status = this.status(accountId);
    if (!status.planUsageEnabled || !status.registrationId) return [];
    return (
      (this.store.get(accountId, 'oauthModelCatalog', status.registrationId) as
        | { slug: string; displayName: string }[]
        | null) ?? []
    );
  }
  async catalog(accountId: number, signal: AbortSignal) {
    const selected = this.status(accountId).registrationId;
    const access = await this.accessToken(accountId, signal);
    const value = z
      .object({
        models: z
          .array(
            z.object({
              slug: z.string().min(1),
              display_name: z.string(),
              visibility: z.string(),
            }),
          )
          .max(10000),
      })
      .parse(
        await this.protocol.json(
          `${this.protocol.network.endpoints.resource}/models`,
          { headers: { Authorization: `Bearer ${access}` } },
          signal,
        ),
      );
    if (this.status(accountId).registrationId !== selected || !selected)
      fail('CONFLICT', 'OAuth selection changed while loading the catalog');
    const catalog = value.models
      .filter((model) => model.visibility === 'list')
      .map((model) => ({ slug: model.slug, displayName: model.display_name }));
    this.store.set(accountId, 'oauthModelCatalog', selected, catalog);
    return catalog;
  }
  async select(accountId: number, id: string) {
    if (this.busy(accountId))
      fail(
        'CONFLICT',
        'Finish or stop active sessions before changing the ChatGPT registration',
      );
    return this.storage.exclusive(accountId, async () => {
      const state = this.storage.read(accountId),
        registration = state.registrations.find((r) => r.id === id);
      if (!registration?.tokens)
        fail(
          'PRECONDITION_FAILED',
          'Sign in to this registration before selecting it',
        );
      for (const flow of this.flows.values())
        if (
          flow.accountId === accountId &&
          ['pending', 'exchanging'].includes(flow.phase)
        )
          this.cancel(accountId, flow.id);
      state.activeId = id;
      this.storage.write(accountId, state);
      return this.status(accountId);
    });
  }
  async accessToken(accountId: number, signal: AbortSignal) {
    signal.throwIfAborted();
    if (this.closed) fail('PRECONDITION_FAILED', 'OAuth service is closed');
    const state = this.storage.read(accountId),
      registration = state.registrations.find((r) => r.id === state.activeId);
    if (!registration?.tokens || registration.reauthorizationRequired)
      fail(
        'PRECONDITION_FAILED',
        'Sign in to the selected ChatGPT registration',
      );
    if (!registration.tokens.scopes.includes('chatgpt.tokens.use.direct'))
      fail(
        'FORBIDDEN',
        'ChatGPT plan usage was not granted. Authorize it or choose another configured provider.',
      );
    if (
      registration.tokens.expiresAt >
      Date.now() +
        (registration.tokens.earliestRefreshMetadata === undefined ? 60000 : 0)
    ) {
      this.secrets.add(registration.tokens.accessToken);
      return registration.tokens.accessToken;
    }
    const key = `${accountId}/${registration.id}`;
    let pending = this.refreshes.get(key);
    if (!pending) {
      pending = this.refresh(accountId, registration.id).finally(() =>
        this.refreshes.delete(key),
      );
      this.refreshes.set(key, pending);
    }
    // Refresh is shared by callers; one cancelled inference must not abort it for others.
    const token = await pending;
    signal.throwIfAborted();
    return token;
  }
  private async refresh(accountId: number, id: string) {
    const controller = new AbortController();
    this.controllers.set(controller, accountId);
    return this.storage
      .exclusive(accountId, async () => {
        const state = this.storage.read(accountId),
          registration = state.registrations.find((r) => r.id === id);
        if (!registration?.tokens || state.activeId !== id)
          fail('CONFLICT', 'OAuth selection changed before refresh');
        if (
          registration.tokens.expiresAt >
          Date.now() +
            (registration.tokens.earliestRefreshMetadata === undefined
              ? 60000
              : 0)
        )
          return registration.tokens.accessToken;

        try {
          const response = await this.protocol.tokens(
            new URLSearchParams({
              grant_type: 'refresh_token',
              client_id: registration.clientId,
              refresh_token: registration.tokens.refreshToken,
              resource: this.protocol.network.endpoints.resource,
            }),
            AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
          );
          if (response.id_token)
            await this.protocol.verify(
              response.id_token,
              registration.clientId,
              undefined,
              registration.subject,
              AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
            );
          controller.signal.throwIfAborted();
          this.store.requireAccount(accountId);
          if (this.closed)
            fail('CONFLICT', 'OAuth service closed during refresh');
          registration.tokens = this.saveTokens(response, registration.tokens);
          registration.revision++;
          this.storage.write(accountId, state);
          if (!registration.tokens.scopes.includes('chatgpt.tokens.use.direct'))
            fail('FORBIDDEN', 'ChatGPT plan usage is no longer granted');
          return registration.tokens.accessToken;
        } catch (error) {
          if (
            error instanceof OAuthEndpointError &&
            [
              'invalid_grant',
              'invalid_client',
              'invalid_refresh_token',
              'token_expired',
              'refresh_token_expired',
              'refresh_token_invalidated',
              'refresh_token_reused',
            ].includes(error.code)
          ) {
            delete registration.tokens;
            registration.reauthorizationRequired = true;
            registration.revision++;
            this.storage.write(accountId, state);
          }
          throw error;
        }
      })
      .finally(() => this.controllers.delete(controller));
  }
  async signOut(accountId: number, id: string) {
    for (const flow of this.flows.values())
      if (
        flow.accountId === accountId &&
        flow.selected?.id === id &&
        ['pending', 'exchanging'].includes(flow.phase)
      )
        this.cancel(accountId, flow.id);
    const controller = new AbortController();
    this.controllers.set(controller, accountId);
    return this.storage
      .exclusive(accountId, async () => {
        const state = this.storage.read(accountId),
          registration = state.registrations.find((r) => r.id === id);
        if (!registration)
          fail('NOT_FOUND', 'OAuth registration does not exist');
        let revoked = !registration.tokens;
        if (registration.tokens) {
          try {
            const endpoint = (
              await this.protocol.discovery(
                AbortSignal.any([
                  controller.signal,
                  AbortSignal.timeout(15000),
                ]),
              )
            ).revocation_endpoint;
            for (let attempt = 0; attempt < 3; attempt++) {
              try {
                const response = await this.protocol.network.fetch(endpoint, {
                  method: 'POST',
                  redirect: 'error',
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                  body: new URLSearchParams({
                    token: registration.tokens.refreshToken,
                    token_type_hint: 'refresh_token',
                    client_id: registration.clientId,
                  }),
                  signal: AbortSignal.any([
                    controller.signal,
                    AbortSignal.timeout(5000),
                  ]),
                });
                await response.body?.cancel();
                if (response.status === 200) {
                  revoked = true;
                  break;
                }
                if (response.status < 500) break;
              } catch {
                if (controller.signal.aborted) break;
              }
              if (attempt < 2)
                await delay(250 * 2 ** attempt, undefined, {
                  signal: controller.signal,
                });
            }
          } catch {
            /* Local sign-out still removes all tokens; remote outcome is returned explicitly. */
          }
        }
        controller.signal.throwIfAborted();
        this.store.requireAccount(accountId);
        delete registration.tokens;
        registration.reauthorizationRequired = false;
        registration.revision++;
        this.storage.write(accountId, state);
        return {
          signedOut: true,
          remoteRevocationConfirmed: revoked,
          message: revoked
            ? 'Signed out and renewable session revoked.'
            : 'Signed out locally; remote revocation was not confirmed. Disconnect Aux in ChatGPT Settings if needed.',
        };
      })
      .finally(() => this.controllers.delete(controller));
  }
  redact(accountId: number, value: string) {
    let result = this.storage.redact(accountId, value);
    for (const secret of this.secrets)
      result = result.replaceAll(secret, '[redacted]');
    return result;
  }
  close() {
    this.closed = true;
    for (const controller of this.controllers.keys()) controller.abort();
    for (const flow of this.flows.values())
      if (['pending', 'exchanging'].includes(flow.phase))
        this.cancel(flow.accountId, flow.id);
  }
}
