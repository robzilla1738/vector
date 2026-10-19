import type { AddressInfo } from 'node:net';
import {
  AUTH_PROTOCOL,
  type Health,
  profileContextSchema,
  VERSION,
} from '@aux/contracts';
import { serve } from '@hono/node-server';
import { type AnyTRPCRouter, TRPCError } from '@trpc/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { Hono } from 'hono';
import { WebSocketServer } from 'ws';
import { Authority } from '../auth/authority.js';
import { BridgeRegistry } from '../bridge/registry.js';
import { Store } from '../storage/store.js';
import { createCoreRouter, procedure, t } from '../trpc/core.js';
export const extensionOrigins = [
  'chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm',
  'chrome-extension://nbpghnminpifekjbgjefioajhiilbfla',
];
export function validHost(host: string | undefined, port: number) {
  if (!host) return false;
  return ['localhost', '127.0.0.1', '[::1]'].some(
    (name) => host === name || host === `${name}:${port}`,
  );
}
export interface DaemonServices {
  store: Store;
  bridge: BridgeRegistry;
  t: typeof t;
  procedure: typeof procedure;
}
export interface DaemonOptions {
  home: string;
  port?: number;
  origins?: string[];
  extendRouter?: (services: DaemonServices) => Record<string, AnyTRPCRouter>;
  extendHttp?: (app: Hono, services: DaemonServices) => void;
  runningSessionCount?: () => number;
  shutdown?: () => Promise<void>;
}
export async function createDaemon(options: DaemonOptions) {
  const store = new Store(options.home),
    authority = new Authority(options.home),
    bridge = new BridgeRegistry(),
    app = new Hono();
  const startedAt = new Date().toISOString();
  let ready = false,
    closing = false,
    port = options.port ?? 21520;
  const origins = new Set([...extensionOrigins, ...(options.origins ?? [])]);
  const invalidations = new Set<import('ws').WebSocket>();
  const core = createCoreRouter(store, (event) => {
    for (const socket of invalidations)
      if (socket.readyState === 1)
        socket.send(JSON.stringify({ type: 'invalidation', data: event }));
  });
  const extra = options.extendRouter?.({ store, bridge, t, procedure }) ?? {};
  const router = t.mergeRouters(core, t.router(extra));
  const error = (code: string, message: string) => ({
    error: { code, message },
  });
  app.use('*', async (c, next) => {
    c.header('Cache-Control', 'no-store');
    if (!validHost(c.req.header('host'), port))
      return c.json(error('FORBIDDEN', 'Host is not allowed'), 403);
    const origin = c.req.header('origin');
    if (origin && !origins.has(origin))
      return c.json(error('FORBIDDEN', 'Origin is not allowed'), 403);
    if (origin) {
      c.header('Access-Control-Allow-Origin', origin);
      c.header('Vary', 'Origin');
    }
    if (c.req.method === 'OPTIONS') {
      c.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      return c.body(null, 204);
    }
    await next();
  });
  app.onError((errorValue, c) => {
    if (errorValue instanceof TRPCError) {
      const statuses = {
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        PRECONDITION_FAILED: 412,
      } as const;
      const status =
        errorValue.code in statuses
          ? statuses[errorValue.code as keyof typeof statuses]
          : 500;
      return c.json(
        error(
          errorValue.code,
          status === 500 ? 'Operation failed' : errorValue.message,
        ),
        status,
      );
    }
    if (errorValue instanceof Error && errorValue.message === 'NOT_FOUND')
      return c.json(error('NOT_FOUND', 'Account not found'), 404);
    return c.json(error('BAD_REQUEST', 'Invalid request'), 400);
  });
  app.get('/', (c) => {
    const count = options.runningSessionCount?.() ?? 0;
    const body: Health = {
      service: 'aux-daemon',
      version: VERSION,
      pid: process.pid,
      host: '127.0.0.1',
      port,
      ready,
      status: count ? 'running' : 'idle',
      startedAt,
      runningSessionCount: count,
      semaphore: { active: count, limit: 4 },
    };
    return c.json(body);
  });
  app.get('/health', (c) =>
    app.fetch(
      new Request(new URL('/', c.req.url), { headers: c.req.raw.headers }),
    ),
  );
  app.get('/auth/daemon/challenge', (c) =>
    c.json(authority.challenge(c.req.query('clientKind'))),
  );
  app.post('/auth/daemon/session', async (c) => {
    const input = await c.req.json();
    if (
      typeof input.challengeId !== 'string' ||
      typeof input.signedChallenge !== 'string'
    )
      return c.json(
        error('BAD_REQUEST', 'Challenge and signature are required'),
        400,
      );
    const session = authority.session(input.challengeId, input.signedChallenge);
    return session
      ? c.json(session)
      : c.json(error('UNAUTHORIZED', 'Challenge could not be verified'), 401);
  });
  app.use('*', async (c, next) => {
    if (!authority.authorization(c.req.header('authorization')))
      return c.json(error('UNAUTHORIZED', 'Authentication required'), 401);
    if (!ready || closing)
      return c.json(
        error('SERVICE_UNAVAILABLE', 'Daemon is initializing'),
        503,
      );
    await next();
  });
  options.extendHttp?.(app, { store, bridge, t, procedure });
  app.get('/auth/daemon/verify', (c) => c.json({ ok: true }));
  app.all('/trpc/*', (c) =>
    fetchRequestHandler({
      endpoint: '/trpc',
      req: c.req.raw,
      router,
      createContext: () => ({
        clientKind: authority.authorization(c.req.header('authorization')),
        store,
      }),
    }),
  );
  app.get('/extension-bridge', (c) => {
    const account = c.req.query('accountId'),
      profileId = c.req.query('profileId'),
      browserMode = c.req.query('browserMode');
    if (account !== undefined && !/^\d+$/.test(account))
      return c.json(error('BAD_REQUEST', 'Invalid account'), 400);
    if (browserMode && browserMode !== 'default' && browserMode !== 'incognito')
      return c.json(error('BAD_REQUEST', 'Invalid browser mode'), 400);
    return c.json(
      bridge.status({
        ...(account !== undefined ? { accountId: Number(account) } : {}),
        ...(profileId ? { profileId } : {}),
        ...(browserMode
          ? { browserMode: browserMode as 'default' | 'incognito' }
          : {}),
      }),
    );
  });
  app.post('/accounts/profile-binding', async (c) =>
    c.json(
      store.bind(profileContextSchema.extend({}).parse(await c.req.json())),
    ),
  );
  app.post('/accounts/profile-binding/delete', async (c) => {
    const input = await c.req.json();
    if (
      typeof input.profileId !== 'string' &&
      typeof input.profilePath !== 'string'
    )
      return c.json(error('BAD_REQUEST', 'Profile identity required'), 400);
    return c.json(store.removeBinding(input));
  });
  let shutdownPromise: Promise<void> | undefined;
  const close = () =>
    (shutdownPromise ??= (async () => {
      closing = true;
      ready = false;
      bridge.close();
      for (const socket of invalidations) socket.close(1001, 'Daemon shutdown');
      wss.close();
      await options.shutdown?.();
      await new Promise<void>((resolve, reject) =>
        server.close((errorValue) =>
          errorValue ? reject(errorValue) : resolve(),
        ),
      );
      store.close();
    })());
  app.post('/shutdown', (c) => {
    setTimeout(() => void close(), 30).unref();
    return c.json({ status: 'shutting_down' });
  });
  app.notFound((c) => c.json(error('NOT_FOUND', 'Route not found'), 404));
  const server = serve({ fetch: app.fetch, hostname: '127.0.0.1', port });
  await new Promise<void>((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  port = (server.address() as AddressInfo).port;
  const wss = new WebSocketServer({
    noServer: true,
    handleProtocols: (protocols) =>
      [...protocols].find((p) => p.startsWith(AUTH_PROTOCOL)) ?? false,
  });
  server.on('upgrade', (req, socket, head) => {
    const origin = req.headers.origin,
      protocols = (req.headers['sec-websocket-protocol'] ?? '')
        .split(',')
        .map((p: string) => p.trim()),
      credential = protocols
        .find((p: string) => p.startsWith(AUTH_PROTOCOL))
        ?.slice(AUTH_PROTOCOL.length),
      kind =
        authority.authorization(req.headers.authorization) ??
        (credential ? authority.verify(credential) : null);
    const path = new URL(req.url ?? '/', 'http://127.0.0.1').pathname;
    if (
      !validHost(req.headers.host, port) ||
      (origin && !origins.has(origin)) ||
      !kind ||
      !ready ||
      !['/extension-bridge/extension', '/extension', '/events'].includes(path)
    ) {
      socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      if (path === '/events') {
        invalidations.add(ws);
        ws.once('close', () => invalidations.delete(ws));
      } else bridge.attach(ws);
    });
  });
  ready = true;
  return { app, server, router, store, bridge, authority, port, close };
}
