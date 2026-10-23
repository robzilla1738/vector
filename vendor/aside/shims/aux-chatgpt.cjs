// Official public-client ChatGPT plan flow. Never import from a renderer or sync this directory.
const { randomBytes, randomUUID, createHash, createPublicKey, verify, timingSafeEqual } = require('node:crypto');
const { constants, openSync, closeSync, readFileSync, writeFileSync, fsyncSync, renameSync, unlinkSync, mkdirSync, lstatSync, fstatSync } = require('node:fs');
const { join, resolve, parse } = require('node:path');
const { homedir } = require('node:os');
const ISSUER = 'https://auth.openai.com';
const RESOURCE = 'https://api.openai.com/v1';
const SCOPES = 'openid profile email offline_access resource.invoke chatgpt.tokens.use.direct';
const scopes = value => typeof value === 'string' ? [...new Set(value.split(/\s+/).filter(Boolean))] : [];
const requiredScopes = ['openid', 'resource.invoke', 'chatgpt.tokens.use.direct'];
const need = (condition, message) => { if (!condition) throw Error(`ChatGPT: ${message}`); };
const present = value => typeof value === 'string' && value.length > 0 && value.length < 65536;
const equal = (a, b) => typeof a === 'string' && typeof b === 'string' && Buffer.byteLength(a) === Buffer.byteLength(b) && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const digest = value => createHash('sha256').update(value).digest('hex');
const nofollow = constants.O_NOFOLLOW;
function privateDirectory(path) {
  const absolute = resolve(path), root = parse(absolute).root;
  let current = root;
  for (const part of absolute.slice(root.length).split('/').filter(Boolean)) {
    current = join(current, part);
    try { mkdirSync(current, { mode: 0o700 }); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const st = lstatSync(current);
    need(st.isDirectory() && !st.isSymbolicLink() && (st.uid === process.getuid() || st.uid === 0) && ((st.mode & 0o022) === 0 || (st.uid === 0 && (st.mode & 0o1000) !== 0)), 'unsafe local storage directory');
  }
  const st = lstatSync(absolute);
  need(st.uid === process.getuid() && (st.mode & 0o077) === 0, 'local storage must be private');
  return absolute;
}
function readPrivate(path) {
  let fd;
  try {
    fd = openSync(path, constants.O_RDONLY | constants.O_NONBLOCK | nofollow);
    const st = fstatSync(fd);
    need(st.isFile() && st.uid === process.getuid() && (st.mode & 0o077) === 0 && st.nlink === 1 && st.size < 1024 * 1024, 'unsafe local credential file');
    return JSON.parse(readFileSync(fd, 'utf8'));
  } catch (error) { if (error.code === 'ENOENT') return undefined; throw error; }
  finally { if (fd !== undefined) closeSync(fd); }
}
function atomicWrite(path, value) {
  const tmp = `${path}.${randomBytes(12).toString('hex')}.tmp`;
  let fd;
  try {
    fd = openSync(tmp, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | nofollow, 0o600);
    writeFileSync(fd, JSON.stringify(value)); fsyncSync(fd); closeSync(fd); fd = undefined;
    renameSync(tmp, path);
  } finally { if (fd !== undefined) closeSync(fd); try { unlinkSync(tmp); } catch (e) { if (e.code !== 'ENOENT') throw e; } }
}
class LocalChatGPTStore {
  constructor(root = join(process.env.AUX_HOME || join(homedir(), '.aux'), 'local-only', 'chatgpt')) {
    this.root = privateDirectory(root); this.operations = new Map();
  }
  async locked(key, fn) {
    const previous = this.operations.get(key) || Promise.resolve();
    const operation = previous.catch(() => {}).then(() => this.diskLocked(key, fn));
    this.operations.set(key, operation);
    try { return await operation; } finally { if (this.operations.get(key) === operation) this.operations.delete(key); }
  }
  async diskLocked(key, fn) {
    const path = join(this.root, `${digest(key)}.lock`);
    let fd;
    try { fd = openSync(path, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | nofollow, 0o600); }
    catch (e) { if (e.code === 'EEXIST') throw Error('ChatGPT: another local credential operation is in progress'); throw e; }
    try { return await fn(); } finally { closeSync(fd); unlinkSync(path); }
  }
  hostId() {
    privateDirectory(this.root);
    const path = join(this.root, 'host.json');
    let host = readPrivate(path);
    if (!host) {
      // Exclusive creation: competing initializers must reuse the winner's host ID.
      const fd = (() => { try { return openSync(path, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | nofollow, 0o600); } catch (e) { if (e.code === 'EEXIST') return undefined; throw e; } })();
      if (fd !== undefined) { try { writeFileSync(fd, JSON.stringify({ version: 1, id: `urn:uuid:${randomUUID()}` })); fsyncSync(fd); } finally { closeSync(fd); } }
      host = readPrivate(path);
    }
    need(host?.version === 1 && /^urn:uuid:[a-f0-9-]{36}$/.test(host.id), 'invalid saved host identity'); return host.id;
  }
  path(account) { privateDirectory(this.root); need(present(account), 'local account is required'); return join(this.root, `${digest(account)}.json`); }
  read(account) {
    const saved = readPrivate(this.path(account));
    if (!saved) return undefined;
    need(saved.version === 1 && saved.issuer === ISSUER && saved.hostId === this.hostId() && present(saved.clientId) && saved.clientId !== 'dynamic_agent_client' && present(saved.subject), 'invalid saved registration');
    return saved;
  }
  write(account, record) { atomicWrite(this.path(account), record); }
  registration(account) {
    const registration = readPrivate(`${this.path(account)}.registration`);
    if (!registration) return undefined;
    need(registration.version === 1 && registration.hostId === this.hostId() && present(registration.clientId) && registration.clientId !== 'dynamic_agent_client', 'invalid pending registration');
    return registration;
  }
  saveRegistration(account, clientId) { atomicWrite(`${this.path(account)}.registration`, { version: 1, hostId: this.hostId(), clientId }); }
  clearRegistration(account) { try { unlinkSync(`${this.path(account)}.registration`); } catch (e) { if (e.code !== 'ENOENT') throw e; } }
  clearTokens(account) {
    const record = this.read(account); if (!record) return;
    const { access, refresh, idToken, expires, ...registration } = record;
    this.write(account, { ...registration, scopes: [], signedOut: true });
  }
}
class ChatGPTPlanClient {
  constructor({ store, fetch: request = globalThis.fetch, now = Date.now } = {}) {
    need(store, 'local credential store required'); this.store = store; this.fetch = request; this.now = now; this.pending = new Map(); this.inflight = new Map();
  }
  async json(url, options) {
    const response = await this.fetch(url, { ...options, redirect: 'error', signal: options?.signal || AbortSignal.timeout(15000) });
    need(response.ok, `provider request failed (${response.status})`);
    const text = await response.text(); need(text.length <= 1024 * 1024, 'provider response too large');
    try { return JSON.parse(text); } catch { throw Error('ChatGPT: invalid provider response'); }
  }
  begin(flowId, redirectUri, account) {
    for (const [id, attempt] of this.pending) if (this.now() - attempt.created > 600000) this.pending.delete(id);
    const uri = new URL(redirectUri);
    need(uri.protocol === 'http:' && uri.hostname === '127.0.0.1' && uri.pathname === '/auth/callback' && uri.port && !uri.search && !uri.hash && !uri.username && !uri.password, 'exact loopback callback required');
    need(present(flowId) && !this.pending.has(flowId), 'duplicate authorization attempt');
    const saved = this.store.read(account) || this.store.registration(account), verifier = randomBytes(32).toString('base64url');
    const state = `${flowId}.${randomBytes(32).toString('base64url')}`, nonce = randomBytes(32).toString('base64url');
    const clientId = saved?.clientId || 'dynamic_agent_client';
    const params = new URLSearchParams({ client_id: clientId, ext_agent_host_id: this.store.hostId(), response_type: 'code', redirect_uri: redirectUri, scope: SCOPES, resource: RESOURCE, state, nonce, code_challenge_method: 'S256', code_challenge: createHash('sha256').update(verifier).digest('base64url') });
    if (!saved) params.set('agent_name_hint', 'Aux');
    // Retained ID tokens stay local; do not expose them in authorization URLs returned to extension UI.
    this.pending.set(flowId, { account, clientId, subject: saved?.subject, redirectUri, state, nonce, verifier, created: this.now() });
    return { redirectUri, state, url: `${ISSUER}/api/accounts/authorize?${params}` };
  }
  cancelAccount(account) { for (const [id, attempt] of [...this.pending, ...this.inflight]) if (attempt.account === account) this.cancel(id); }
  disconnectLocal(account) { this.cancelAccount(account); this.store.clearTokens(account); }
  cancel(flowId) { const pending = this.pending.get(flowId) || this.inflight.get(flowId); if (pending) pending.cancelled = true; this.pending.delete(flowId); }
  async verifyIdentity(token, clientId, nonce, expectedSubject) {
    need(present(token), 'ID token missing');
    const parts = token.split('.'); need(parts.length === 3 && parts.every(p => /^[A-Za-z0-9_-]+$/.test(p)), 'invalid ID token');
    let header, claims;
    try { header = JSON.parse(Buffer.from(parts[0], 'base64url')); claims = JSON.parse(Buffer.from(parts[1], 'base64url')); } catch { throw Error('ChatGPT: invalid ID token'); }
    need(header.alg === 'RS256' && present(header.kid) && !header.crit && !header.jku && !header.jwk && !header.x5u, 'unsupported ID token signature');
    const jwks = await this.json(`${ISSUER}/.well-known/jwks.json`);
    const keys = jwks.keys?.filter(k => k.kid === header.kid && k.kty === 'RSA' && (!k.use || k.use === 'sig') && (!k.alg || k.alg === 'RS256'));
    need(keys?.length === 1, 'ID token signing key unavailable');
    need(verify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), createPublicKey({ key: keys[0], format: 'jwk' }), Buffer.from(parts[2], 'base64url')), 'invalid ID token signature');
    const now = this.now() / 1000, audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    need(claims.iss === ISSUER && audiences.includes(clientId) && (audiences.length === 1 || claims.azp === clientId), 'ID token issuer/audience mismatch');
    need(Number.isFinite(claims.exp) && claims.exp > now - 5 && Number.isFinite(claims.iat) && claims.iat <= now + 5 && (!claims.nbf || claims.nbf <= now + 5), 'ID token expired or not active');
    need(present(claims.sub) && (!expectedSubject || equal(claims.sub, expectedSubject)), 'ChatGPT account mismatch');
    if (nonce !== undefined) need(equal(claims.nonce, nonce), 'ID token nonce mismatch');
    return claims;
  }
  async tokenRecord(body, clientId, pending, previous) {
    const granted = body.scope === undefined && previous ? previous.scopes : scopes(body.scope);
    need(requiredScopes.every(s => granted.includes(s)), 'ChatGPT plan permission not granted');
    need(present(body.access_token) && (present(body.refresh_token) || previous?.refresh) && body.token_type?.toLowerCase() === 'bearer' && Number.isFinite(body.expires_in) && body.expires_in > 0 && body.expires_in <= 86400, 'invalid token response');
    const identity = body.id_token ? await this.verifyIdentity(body.id_token, clientId, pending?.nonce, pending?.subject || previous?.subject) : undefined;
    need(identity || previous, 'verified identity required');
    return { version: 1, type: 'oauth', source: 'aux-chatgpt-plan-v1', issuer: ISSUER, clientId, hostId: this.store.hostId(), subject: identity?.sub || previous.subject, accountId: identity?.sub || previous.subject, email: identity?.email || previous?.email, idToken: body.id_token || previous?.idToken, access: body.access_token, refresh: body.refresh_token || previous?.refresh, scopes: granted, expires: this.now() + body.expires_in * 1000, savedAt: new Date(this.now()).toISOString() };
  }
  async complete(flowId, callback) {
    const pending = this.pending.get(flowId);
    need(pending && this.now() - pending.created <= 600000, 'authorization attempt expired');
    const url = new URL(callback);
    need(url.origin + url.pathname === pending.redirectUri && !url.hash, 'callback URI mismatch');
    for (const field of ['state', 'code', 'client_id', 'error']) need(url.searchParams.getAll(field).length <= 1, 'duplicate callback parameter');
    need(equal(url.searchParams.get('state'), pending.state), 'state mismatch');
    this.pending.delete(flowId); // One-time consumption before any network request.
    need(!url.searchParams.has('error'), 'authorization denied');
    const clientId = url.searchParams.get('client_id') || (pending.clientId !== 'dynamic_agent_client' ? pending.clientId : undefined);
    need(present(clientId) && clientId !== 'dynamic_agent_client' && (pending.clientId === 'dynamic_agent_client' || clientId === pending.clientId), 'issued client ID mismatch');
    const code = url.searchParams.get('code'); need(present(code), 'authorization code missing');
    this.inflight.set(flowId, pending);
    return this.store.locked(pending.account, async () => {
      const existing = this.store.read(pending.account);
      need(!existing || !pending.subject || existing.subject === pending.subject, 'selected registration changed');
      this.store.saveRegistration(pending.account, clientId);
      const body = await this.json(`${ISSUER}/api/accounts/oauth/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'authorization_code', client_id: clientId, code, code_verifier: pending.verifier, redirect_uri: pending.redirectUri, resource: RESOURCE }) });
      const record = await this.tokenRecord(body, clientId, pending);
      need(!pending.cancelled, 'authorization cancelled');
      this.store.write(pending.account, record); this.store.clearRegistration(pending.account);
      return { status: 'completed', providerId: 'openai-codex' };
    }).finally(() => this.inflight.delete(flowId));
  }
  async auth(account, rejectedAccess) {
    return this.store.locked(account, async () => {
      let record = this.store.read(account);
      if (!record?.access) return undefined;
      need(requiredScopes.every(s => record.scopes.includes(s)), 'ChatGPT plan permission not granted');
      if (record.expires <= this.now() + 300000 || rejectedAccess === record.access) {
        const body = await this.json(`${ISSUER}/api/accounts/oauth/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'refresh_token', client_id: record.clientId, refresh_token: record.refresh, resource: RESOURCE }) });
        const current = this.store.read(account); need(current?.access === record.access && current?.refresh === record.refresh, 'local session changed during refresh');
        record = await this.tokenRecord(body, record.clientId, undefined, record);
        const latest = this.store.read(account); need(latest?.access === current.access && latest?.refresh === current.refresh, 'local session changed during refresh');
        this.store.write(account, record);
      }
      return { apiKey: record.access };
    });
  }
  async modelIds(access) {
    const result = await this.json(`${RESOURCE}/models`, { headers: { Authorization: `Bearer ${access}` } });
    need(Array.isArray(result.models), 'invalid model catalog');
    const catalog = result.models.filter(m => m.visibility === 'list' && present(m.slug)).map(m => ({ slug: m.slug, displayName: present(m.display_name) ? m.display_name : m.slug }));
    const ids = new Set(catalog.map(m => m.slug)); ids.catalog = catalog; return ids;
  }
  async signOut(account) {
    this.cancelAccount(account);
    return this.store.locked(account, async () => {
      const record = this.store.read(account); let revoked = false;
      try {
        if (record?.refresh) {
          const discovery = await this.json(`${ISSUER}/.well-known/openid-configuration`);
          const endpoint = new URL(discovery.revocation_endpoint);
          need(discovery.issuer === ISSUER && endpoint.origin === ISSUER && endpoint.protocol === 'https:' && !endpoint.username && !endpoint.password && !endpoint.hash, 'invalid revocation endpoint');
          const result = await this.fetch(endpoint, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000), headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ token: record.refresh, token_type_hint: 'refresh_token', client_id: record.clientId }) });
          revoked = result.status === 200;
        }
      } finally { this.store.clearTokens(account); }
      return { revoked };
    });
  }
}
let client;
function daemonClient() { return client ||= new ChatGPTPlanClient({ store: new LocalChatGPTStore() }); }
const localAccount = value => value === undefined ? 'aux-local-default' : `account:${String(value)}`;
function completedResponsesFetch(request = globalThis.fetch) {
  return async (url, options) => {
    const target = new URL(typeof url === 'string' || url instanceof URL ? url : url.url);
    need(target.href === `${RESOURCE}/responses`, 'unexpected plan inference endpoint');
    const response = await request(url, { ...options, redirect: 'error' });
    if (!response.ok || !response.body) return response;
    let buffer = '', completed = false;
    const decoder = new TextDecoder();
    const inspect = final => {
      for (;;) {
        const boundary = /\r?\n\r?\n/.exec(buffer);
        if (!boundary) break;
        const frame = buffer.slice(0, boundary.index); buffer = buffer.slice(boundary.index + boundary[0].length);
        const payload = frame.split(/\r?\n/).filter(line => line.startsWith('data:')).map(line => line.slice(5).trim()).join('\n');
        if (!payload || payload === '[DONE]') continue;
        let event; try { event = JSON.parse(payload); } catch { throw Error('ChatGPT: invalid Responses event'); }
        need(event.type !== 'response.incomplete', 'response incomplete');
        if (event.type === 'response.completed') completed = true;
      }
      need(buffer.length < 16 * 1024 * 1024, 'Responses event too large');
      if (final) need(completed, 'stream ended without response.completed');
    };
    const body = response.body.pipeThrough(new TransformStream({
      transform(chunk, controller) { buffer += decoder.decode(chunk, { stream: true }); inspect(false); controller.enqueue(chunk); },
      flush() { buffer += decoder.decode(); if (buffer.trim()) buffer += '\n\n'; inspect(true); }
    }));
    return new Response(body, { status: response.status, statusText: response.statusText, headers: response.headers });
  };
}
function planResponsesApi(api) {
  const wrap = method => (model, context, options = {}) => api[method]({ ...model, api: 'openai-responses', baseUrl: RESOURCE }, context, { ...options, maxRetries: 0, fetch: completedResponsesFetch(options.fetch), onPayload: async payload => ({ ...(await options.onPayload?.(payload) ?? payload), store: false, stream: true }) });
  return { stream: wrap('stream'), streamSimple: wrap('streamSimple') };
}

module.exports = { ISSUER, RESOURCE, SCOPES, LocalChatGPTStore, ChatGPTPlanClient, daemonClient, localAccount, planResponsesApi, completedResponsesFetch };
