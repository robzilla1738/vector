/** daemon/agent.md notification tool: private native enqueue + scoped activation. */
import { createHash } from 'node:crypto';
import {
  type AgentEngine,
  approveOperation,
  fail,
  type Session,
} from '@aux/agent';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';

const operationIdSchema = z.string().regex(/^aux-[a-f0-9]{64}$/);
const statusSchema = z.object({
  available: z.boolean(),
  authorization: z.enum([
    'authorized',
    'provisional',
    'denied',
    'not-determined',
    'unknown',
    'unavailable',
  ]),
});
const ackSchema = z.object({
  enqueued: z.literal(true),
  operationId: operationIdSchema,
  deliveryConfirmed: z.literal(false),
  replayed: z.boolean(),
});
export const notificationInputSchema = z
  .object({
    title: z
      .string()
      .min(1)
      .max(200)
      .refine((value) => !value.includes('\0')),
    body: z
      .string()
      .min(1)
      .max(4000)
      .refine((value) => !value.includes('\0')),
    // A link is an exact Aux session ID, never a renderer/OS-supplied arbitrary URL.
    sessionLink: z
      .string()
      .regex(/^[\w-]{1,128}$/)
      .optional(),
  })
  .strict();
type Input = z.infer<typeof notificationInputSchema>;
export interface NotificationClient {
  call(
    method:
      | 'notifications.status'
      | 'notifications.enqueue'
      | 'notifications.takeActivations',
    params?: Record<string, unknown>,
    options?: { signal?: AbortSignal; timeoutMs?: number },
  ): Promise<unknown>;
}
interface Intent {
  accountId: number;
  sessionId: string;
  profileId: string;
  expiresAt: number;
}
export function createNotificationService(
  { store, bridge }: Pick<DaemonServices, 'store' | 'bridge'>,
  engine: AgentEngine,
  client: NotificationClient,
  security: { isUnlocked(accountId: number): boolean },
) {
  const pending = new Map<string, Intent>();
  const acknowledgements = new Map<
    string,
    { expiresAt: number; fingerprint: string; value: z.infer<typeof ackSchema> }
  >();
  const attempted = new Set<string>();
  const lifetime = new AbortController();
  let timer: NodeJS.Timeout | undefined;
  let polling: Promise<void> | undefined;
  let closed = false;
  const ttl = 24 * 60 * 60 * 1000;
  function check(
    accountId: number,
    sessionId: string,
    expectedProfile?: string,
  ) {
    lifetime.signal.throwIfAborted();
    store.requireAccount(accountId);
    if (store.current() !== accountId || !security.isUnlocked(accountId))
      fail('FORBIDDEN', 'Notifications require the current unlocked account');
    const session = engine.get(accountId, sessionId);
    if (
      session.incognito ||
      session.browserBinding?.browserMode === 'incognito'
    )
      fail('FORBIDDEN', 'Private sessions cannot issue notifications');
    if (session.permissionMode === 'read-only')
      fail('FORBIDDEN', 'Read-only sessions cannot issue notifications');
    if (
      expectedProfile &&
      (session.browserBinding?.profileId !== expectedProfile ||
        session.browserBinding.browserMode !== 'default')
    )
      fail('FORBIDDEN', 'Notification profile binding changed');
    return session;
  }
  function prune() {
    const now = Date.now();
    for (const [id, value] of pending)
      if (value.expiresAt <= now) pending.delete(id);
    for (const [id, value] of acknowledgements)
      if (value.expiresAt <= now) acknowledgements.delete(id);
    if (!pending.size && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  }
  async function drain() {
    prune();
    if (closed || !pending.size) return;
    const { operationIds } = z
      .object({ operationIds: z.array(operationIdSchema).max(32) })
      .parse(
        await client.call(
          'notifications.takeActivations',
          {},
          { signal: lifetime.signal, timeoutMs: 4000 },
        ),
      );
    for (const id of operationIds) {
      const intent = pending.get(id);
      pending.delete(id); // Consume before any async work; never replay a click.
      if (!intent || intent.expiresAt <= Date.now() || closed) continue;
      try {
        check(intent.accountId, intent.sessionId, intent.profileId);
        await bridge.command(
          {
            accountId: intent.accountId,
            profileId: intent.profileId,
            browserMode: 'default',
          },
          {
            method: 'chat.activate',
            params: {
              accountId: intent.accountId,
              profileId: intent.profileId,
              browserMode: 'default',
              sessionId: intent.sessionId,
            },
          },
          { signal: lifetime.signal, timeoutMs: 6000 },
        );
      } catch {
        // A stale/locked/account-switched click is discarded, never queued for later.
      }
    }
    prune();
  }
  function poll() {
    if (closed || polling || !pending.size) return polling ?? Promise.resolve();
    polling = drain()
      .catch(() => {
        /* Helper unavailable: retain only bounded, expiring intents. */
      })
      .finally(() => {
        polling = undefined;
      });
    return polling;
  }
  function start() {
    if (!closed && pending.size && !timer) {
      timer = setInterval(() => void poll(), 1000);
      timer.unref();
    }
  }
  return {
    async enqueue(
      session: Session,
      raw: Input,
      toolCallId: string,
      signal: AbortSignal,
    ) {
      const input = notificationInputSchema.parse(raw);
      signal.throwIfAborted();
      const current = check(session.accountId, session.id);
      if (input.sessionLink && input.sessionLink !== session.id)
        fail(
          'FORBIDDEN',
          'Notification links must refer to the issuing session',
        );
      const profileId = input.sessionLink
        ? current.browserBinding?.profileId
        : undefined;
      if (
        input.sessionLink &&
        (!profileId || current.browserBinding?.browserMode !== 'default')
      )
        fail(
          'PRECONDITION_FAILED',
          'Session activation requires a bound ordinary browser profile',
        );
      const status = statusSchema.parse(
        await client.call(
          'notifications.status',
          {},
          { signal, timeoutMs: 4000 },
        ),
      );
      check(session.accountId, session.id, profileId);
      if (
        !status.available ||
        !['authorized', 'provisional'].includes(status.authorization)
      )
        fail(
          'PRECONDITION_FAILED',
          'Notifications are unavailable or require explicit permission in Aux settings',
        );
      await approveOperation(
        engine,
        session.accountId,
        session.id,
        toolCallId,
        'notification',
        'Show notification',
        input,
        signal,
        { mutation: true, defaultAsk: true },
      );
      check(session.accountId, session.id, profileId);
      signal.throwIfAborted();
      prune();
      const id = `aux-${createHash('sha256')
        .update(JSON.stringify([session.accountId, session.id, toolCallId]))
        .digest('hex')}`;
      const fingerprint = createHash('sha256')
        .update(JSON.stringify(input))
        .digest('hex');
      const cached = acknowledgements.get(id);
      // Never auto-retry a native operation whose acknowledgement was lost.
      if (cached) {
        if (cached.fingerprint !== fingerprint)
          fail('CONFLICT', 'Notification operation content changed');
        return cached.value;
      }
      if (attempted.has(id))
        fail(
          'CONFLICT',
          'Notification enqueue outcome is unknown; do not retry automatically',
        );
      if (attempted.size >= 128)
        fail(
          'PRECONDITION_FAILED',
          'Notification operation limit reached for this daemon lifetime',
        );
      attempted.add(id);
      if (profileId)
        pending.set(id, {
          accountId: session.accountId,
          sessionId: session.id,
          profileId,
          expiresAt: Date.now() + ttl,
        });
      try {
        const acknowledgement = ackSchema.parse(
          await client.call(
            'notifications.enqueue',
            {
              operationId: id,
              title: input.title,
              body: input.body,
              activatesSession: !!profileId,
            },
            {
              signal: AbortSignal.any([signal, lifetime.signal]),
              timeoutMs: 10000,
            },
          ),
        );
        if (acknowledgement.operationId !== id)
          fail('CONFLICT', 'Notification acknowledgement identity changed');
        acknowledgements.set(id, {
          value: acknowledgement,
          fingerprint,
          expiresAt: Date.now() + ttl,
        });
        start();
        return acknowledgement;
      } catch (error) {
        pending.delete(id);
        prune();
        throw error;
      }
    },
    /** Private bounded drain; also callable by synthetic fixtures without timers. */
    poll,
    invalidate(accountId: number) {
      for (const [id, intent] of pending)
        if (intent.accountId === accountId) pending.delete(id);
      prune();
    },
    close() {
      closed = true;
      lifetime.abort(new Error('Notification service closed'));
      if (timer) clearInterval(timer);
      timer = undefined;
      pending.clear();
      acknowledgements.clear();
      attempted.clear();
    },
  };
}
export type NotificationService = ReturnType<typeof createNotificationService>;
