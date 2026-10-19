/** Official SIWC public-client protocol; endpoint configuration is not accepted from RPC. */
import { createLocalJWKSet, type JSONWebKeySet, jwtVerify } from 'jose';
import { z } from 'zod';
import { fail } from '../storage.js';
export const openAIEndpoints = Object.freeze({
  issuer: 'https://auth.openai.com',
  authorize: 'https://auth.openai.com/api/accounts/authorize',
  token: 'https://auth.openai.com/api/accounts/oauth/token',
  discovery: 'https://auth.openai.com/.well-known/openid-configuration',
  resource: 'https://api.openai.com/v1',
});
export type OAuthEndpoints = {
  issuer: string;
  authorize: string;
  token: string;
  discovery: string;
  resource: string;
};
export type OAuthNetwork = { fetch: typeof fetch; endpoints: OAuthEndpoints };
export const openAINetwork: OAuthNetwork = {
  fetch: (...args) => fetch(...args),
  endpoints: openAIEndpoints,
};
export const tokenResponse = z.object({
  access_token: z.string().min(1).max(100000),
  refresh_token: z.string().min(1).max(100000),
  id_token: z.string().min(1).max(100000).optional(),
  token_type: z.literal('Bearer'),
  expires_in: z.number().positive().max(86400),
  scope: z.string().optional(),
  earliest_refresh_at: z
    .union([z.number().nonnegative(), z.string().max(200), z.null()])
    .optional(),
});
export type TokensResponse = z.infer<typeof tokenResponse>;
const discoverySchema = z.object({
  issuer: z.string(),
  authorization_endpoint: z.url(),
  token_endpoint: z.url(),
  jwks_uri: z.url(),
  revocation_endpoint: z.url(),
});
export class OAuthProtocol {
  private discoveryCache:
    | { value: z.infer<typeof discoverySchema>; expires: number }
    | undefined;
  private jwksCache: { value: JSONWebKeySet; expires: number } | undefined;
  constructor(readonly network: OAuthNetwork = openAINetwork) {}
  private endpoint(url: string) {
    const target = new URL(url),
      issuer = new URL(this.network.endpoints.issuer);
    if (
      target.origin !== issuer.origin ||
      target.username ||
      target.password ||
      target.hash
    )
      fail('FORBIDDEN', 'OAuth discovery supplied an untrusted endpoint');
    return target.href;
  }
  async json(url: string, init: RequestInit, signal: AbortSignal) {
    const response = await this.network.fetch(url, {
      ...init,
      redirect: 'error',
      signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]),
    });
    if (Number(response.headers.get('content-length') ?? 0) > 1000000) {
      await response.body?.cancel();
      throw new Error('OAuth response exceeded its size limit');
    }
    if (!response.body)
      throw new Error('OAuth endpoint returned an empty body');
    const reader = response.body.getReader(),
      chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        size += part.value.byteLength;
        if (size > 1000000) {
          await reader.cancel();
          throw new Error('OAuth response exceeded its size limit');
        }
        chunks.push(part.value);
      }
    } finally {
      reader.releaseLock();
    }
    const text = Buffer.concat(chunks).toString('utf8');
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        `OAuth endpoint returned invalid data (${response.status})`,
      );
    }
    if (!response.ok) {
      const error = z.object({ error: z.string().max(100) }).safeParse(data);
      // Never surface provider descriptions or token response bodies in logs/UI.
      const code =
        error.success &&
        [
          'invalid_grant',
          'invalid_refresh_token',
          'token_expired',
          'refresh_token_expired',
          'refresh_token_invalidated',
          'refresh_token_reused',
          'invalid_client',
          'access_denied',
          'invalid_scope',
          'temporarily_unavailable',
        ].includes(error.data.error)
          ? error.data.error
          : 'request_failed';
      throw new OAuthEndpointError(code, response.status);
    }
    return data;
  }
  async discovery(signal: AbortSignal) {
    if (this.discoveryCache && this.discoveryCache.expires > Date.now())
      return this.discoveryCache.value;
    const value = discoverySchema.parse(
      await this.json(this.network.endpoints.discovery, {}, signal),
    );
    if (
      value.issuer !== this.network.endpoints.issuer ||
      value.authorization_endpoint !== this.network.endpoints.authorize ||
      value.token_endpoint !== this.network.endpoints.token
    )
      fail('FORBIDDEN', 'OAuth discovery does not match the configured issuer');
    this.endpoint(value.jwks_uri);
    this.endpoint(value.revocation_endpoint);
    this.discoveryCache = { value, expires: Date.now() + 300000 };
    return value;
  }
  async verify(
    idToken: string,
    clientId: string,
    nonce: string | undefined,
    subject: string | undefined,
    signal: AbortSignal,
  ) {
    const discovery = await this.discovery(signal);
    const load = async () => {
      const value = z
        .object({ keys: z.array(z.record(z.string(), z.unknown())).max(100) })
        .parse(await this.json(this.endpoint(discovery.jwks_uri), {}, signal));
      this.jwksCache = {
        value: value as JSONWebKeySet,
        expires: Date.now() + 300000,
      };
    };
    if (!this.jwksCache || this.jwksCache.expires < Date.now()) await load();
    const verify = () => {
      const cache = this.jwksCache;
      if (!cache) throw new Error('OAuth issuer keys are unavailable');
      return jwtVerify(idToken, createLocalJWKSet(cache.value), {
        issuer: this.network.endpoints.issuer,
        audience: clientId,
        algorithms: ['RS256', 'ES256'],
        clockTolerance: 5,
        requiredClaims: ['sub', 'iat', 'exp'],
      });
    };
    let verified: Awaited<ReturnType<typeof verify>>;
    try {
      verified = await verify();
    } catch (error) {
      if ((error as { code?: string }).code !== 'ERR_JWKS_NO_MATCHING_KEY')
        throw new Error('OAuth ID token signature or claims are invalid');
      await load();
      try {
        verified = await verify();
      } catch {
        throw new Error('OAuth ID token signature or claims are invalid');
      }
    }
    const payload = verified.payload;
    if (
      (nonce !== undefined && payload.nonce !== nonce) ||
      (subject !== undefined && payload.sub !== subject) ||
      typeof payload.sub !== 'string' ||
      !payload.sub ||
      typeof payload.iat !== 'number' ||
      payload.iat > Date.now() / 1000 + 5 ||
      (payload.azp !== undefined && payload.azp !== clientId) ||
      (Array.isArray(payload.aud) &&
        payload.aud.length > 1 &&
        payload.azp !== clientId)
    )
      fail(
        'FORBIDDEN',
        'OAuth ID token nonce or identity does not match this attempt',
      );
    return {
      subject: payload.sub,
      ...(typeof payload.email === 'string' ? { email: payload.email } : {}),
      expiresAt: Number(payload.exp) * 1000,
    };
  }
  async tokens(form: URLSearchParams, signal: AbortSignal) {
    return tokenResponse.parse(
      await this.json(
        this.network.endpoints.token,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form,
        },
        signal,
      ),
    );
  }
}
export class OAuthEndpointError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
  ) {
    super(`OAuth ${code} (${status})`);
  }
}
